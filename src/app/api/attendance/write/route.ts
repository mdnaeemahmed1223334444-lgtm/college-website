import { NextRequest, NextResponse } from "next/server";
import { privateAdmin } from "@/lib/supabase/private-server";

// In-memory queue fallback for local development without DB
let inMemoryPendingWrite: { deviceId: string; data: string; status: string; uid?: string } | null = null;

/**
 * GET /api/attendance/write?device_id=GATE-01
 * Polled by ESP8266 when connected to Wi-Fi to check if the main website
 * wants it to burn student data onto an RFID card.
 */
export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get("device_id") || "GATE-01";
  const privClient = privateAdmin();

  if (privClient) {
    const { data: device } = await privClient
      .from("attendance_devices")
      .select("pending_write_data, write_status, last_written_uid, last_written_data")
      .eq("device_id", deviceId)
      .maybeSingle();

    if (device && device.write_status === "pending" && device.pending_write_data) {
      return NextResponse.json({
        pending: true,
        data: device.pending_write_data,
        status: "pending",
      });
    }

    return NextResponse.json({
      pending: false,
      status: device?.write_status || "idle",
      last_written_uid: device?.last_written_uid || null,
      last_written_data: device?.last_written_data || null,
    });
  }

  // Fallback
  if (inMemoryPendingWrite && inMemoryPendingWrite.deviceId === deviceId && inMemoryPendingWrite.status === "pending") {
    return NextResponse.json({
      pending: true,
      data: inMemoryPendingWrite.data,
      status: "pending",
    });
  }

  return NextResponse.json({
    pending: false,
    status: inMemoryPendingWrite?.status || "idle",
    last_written_uid: inMemoryPendingWrite?.uid || null,
  });
}

/**
 * POST /api/attendance/write
 * Used by:
 *   1. Website Admin: Queue a card write for a student:
 *      { "action": "queue", "device_id": "GATE-01", "student_code": "DMC-2026-102" }
 *   2. ESP8266 Scanner: Report write completion:
 *      { "action": "complete", "device_id": "GATE-01", "uid": "A1B2C3D4", "written_data": "DMC-2026-102" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "queue";
    const deviceId = (body.device_id || "GATE-01").trim();
    const dataToWrite = (body.data_to_write || body.student_code || "").trim();
    const uid = (body.uid || body.card_uid || "").trim();

    const privClient = privateAdmin();

    if (action === "queue") {
      if (!dataToWrite) {
        return NextResponse.json({ success: false, message: "Data to write is required" }, { status: 400 });
      }

      if (privClient) {
        await privClient
          .from("attendance_devices")
          .update({
            pending_write_data: dataToWrite,
            write_status: "pending",
          })
          .eq("device_id", deviceId);
      }

      inMemoryPendingWrite = { deviceId, data: dataToWrite, status: "pending" };

      return NextResponse.json({
        success: true,
        status: "PENDING_TAP",
        message: `Command sent to ${deviceId}. Please tap an RFID card on the reader now to write '${dataToWrite}'.`,
      });
    }

    if (action === "complete") {
      if (privClient) {
        await privClient
          .from("attendance_devices")
          .update({
            pending_write_data: null,
            write_status: "success",
            last_written_uid: uid,
            last_written_data: dataToWrite,
            last_written_at: new Date().toISOString(),
          })
          .eq("device_id", deviceId);

        // Also automatically link this card to the student in students table!
        if (dataToWrite) {
          await privClient
            .from("students")
            .update({
              rfid_card_id: uid,
              rfid_card_data: dataToWrite,
            })
            .eq("student_code", dataToWrite);
        }
      }

      inMemoryPendingWrite = {
        deviceId,
        data: dataToWrite,
        status: "success",
        uid,
      };

      return NextResponse.json({
        success: true,
        message: `Card burned and linked successfully for '${dataToWrite}' (UID: ${uid})`,
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
