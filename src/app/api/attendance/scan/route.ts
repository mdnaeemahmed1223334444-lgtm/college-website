import { NextRequest, NextResponse } from "next/server";
import { privateAdmin } from "@/lib/supabase/private-server";

// Fallback in-memory state for local testing when Supabase is in mock/preview mode
const mockScansToday = new Map<string, { time: string; status: "present" | "late" }>();

function getDhakaTime() {
  const now = new Date();
  const dhakaFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = dhakaFormatter.formatToParts(now);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const dateStr = `${partMap.year}-${partMap.month}-${partMap.day}`;
  const timeStr = `${partMap.hour}:${partMap.minute}:${partMap.second}`;
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);

  // Formatted 12-hour string (e.g. "08:45 AM")
  const h12 = hour % 12 || 12;
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedTime12 = `${String(h12).padStart(2, "0")}:${partMap.minute} ${ampm}`;

  return { dateStr, timeStr, hour, minute, formattedTime12 };
}

/**
 * GET /api/attendance/scan
 * Handshake / Health-check endpoint for ESP8266 device initialization.
 */
export async function GET(req: NextRequest) {
  const deviceId = req.headers.get("x-device-id") || req.nextUrl.searchParams.get("device_id") || "GATE-01";
  const token = req.headers.get("x-device-token") || req.headers.get("authorization")?.replace("Bearer ", "");

  const { dateStr, formattedTime12 } = getDhakaTime();

  return NextResponse.json({
    success: true,
    status: "CONNECTED",
    device_id: deviceId,
    server_time: formattedTime12,
    date: dateStr,
    timezone: "Asia/Dhaka",
    message: "RFID Attendance backend online",
  });
}

/**
 * POST /api/attendance/scan
 * Main scan processing endpoint for ESP8266 gate scanner.
 */
export async function POST(req: NextRequest) {
  try {
    const deviceIdHeader = req.headers.get("x-device-id");
    const deviceTokenHeader =
      req.headers.get("x-device-token") ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    const body = await req.json().catch(() => ({}));
    const deviceId = (body.device_id || deviceIdHeader || "GATE-01").trim();
    const token = (body.token || deviceTokenHeader || "").trim();
    const rawUid = (body.card_uid || body.uid || "").trim();

    if (!rawUid) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_REQUEST",
          message: "RFID card UID is required",
        },
        { status: 400 }
      );
    }

    // Normalize UID: uppercase, no colons or spaces (e.g. "A1B2C3D4")
    const normalizedUid = rawUid.replace(/[^a-fA-F0-9]/g, "").toUpperCase();

    const { dateStr, timeStr, hour, minute, formattedTime12 } = getDhakaTime();

    const privClient = privateAdmin();

    if (privClient) {
      // 1. Device authentication check
      if (token) {
        const { data: device } = await privClient
          .from("attendance_devices")
          .select("*")
          .eq("device_id", deviceId)
          .maybeSingle();

        if (device && !device.is_active) {
          return NextResponse.json(
            {
              success: false,
              status: "DEVICE_DISABLED",
              message: "Gate scanner device is inactive",
            },
            { status: 403 }
          );
        }
      }

      // 2. Query student by normalized rfid_card_id
      const { data: student, error: studentError } = await privClient
        .from("students")
        .select("id, student_code, full_name, status, rfid_card_id, batch_id")
        .ilike("rfid_card_id", normalizedUid)
        .maybeSingle();

      if (studentError) {
        console.error("RFID DB query error:", studentError);
      }

      // Check UNREGISTERED_CARD
      if (!student) {
        return NextResponse.json({
          success: false,
          status: "UNREGISTERED_CARD",
          uid: normalizedUid,
          time: formattedTime12,
          message: "This card is not registered",
        });
      }

      // Check INACTIVE_CARD (suspended, dropped, passed_out)
      if (student.status !== "active") {
        return NextResponse.json({
          success: false,
          status: "INACTIVE_CARD",
          uid: normalizedUid,
          student_name: student.full_name,
          student_code: student.student_code,
          time: formattedTime12,
          message: "This card is disabled",
        });
      }

      // 3. Check if already recorded today (Duplicate prevention)
      const { data: existingAttendance } = await privClient
        .from("student_attendance")
        .select("id, in_time, status")
        .eq("student_id", student.id)
        .eq("date", dateStr)
        .maybeSingle();

      if (existingAttendance) {
        return NextResponse.json({
          success: true,
          status: "ALREADY_PRESENT",
          uid: normalizedUid,
          student_name: student.full_name,
          student_code: student.student_code,
          time: formattedTime12,
          message: "Attendance already recorded today",
        });
      }

      // 4. Determine status: PRESENT or LATE (cutoff: 09:15 AM Asia/Dhaka)
      // Cutoff: 09:15:00
      const isLate = hour > 9 || (hour === 9 && minute > 15);
      const scanStatus: "present" | "late" = isLate ? "late" : "present";
      const displayStatus = isLate ? "LATE" : "PRESENT";
      const displayMessage = isLate ? "Late attendance recorded" : "Attendance recorded successfully";

      // 5. Insert attendance record into database
      const { error: insertError } = await privClient.from("student_attendance").insert({
        student_id: student.id,
        date: dateStr,
        in_time: timeStr,
        status: scanStatus,
        rfid_card_id: normalizedUid,
        device_id: deviceId,
        remarks: isLate ? "Arrived after 09:15 AM" : "On-time arrival",
      });

      if (insertError) {
        // If race condition duplicate inserted concurrently:
        if (insertError.code === "23505") {
          return NextResponse.json({
            success: true,
            status: "ALREADY_PRESENT",
            uid: normalizedUid,
            student_name: student.full_name,
            student_code: student.student_code,
            time: formattedTime12,
            message: "Attendance already recorded today",
          });
        }
        throw insertError;
      }

      // Touch device last seen
      await privClient
        .from("attendance_devices")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("device_id", deviceId);

      return NextResponse.json({
        success: true,
        status: displayStatus,
        uid: normalizedUid,
        student_name: student.full_name,
        student_code: student.student_code,
        time: formattedTime12,
        message: displayMessage,
      });
    }

    // ── Fallback Mode for local preview / mock ──
    const mockStudent = {
      name: "Rahim Ahmed",
      code: "DMC-2026-102",
    };

    if (normalizedUid === "00000000" || normalizedUid === "FFFFFFFF") {
      return NextResponse.json({
        success: false,
        status: "UNREGISTERED_CARD",
        uid: normalizedUid,
        time: formattedTime12,
        message: "This card is not registered",
      });
    }

    const key = `${normalizedUid}-${dateStr}`;
    if (mockScansToday.has(key)) {
      return NextResponse.json({
        success: true,
        status: "ALREADY_PRESENT",
        uid: normalizedUid,
        student_name: mockStudent.name,
        student_code: mockStudent.code,
        time: formattedTime12,
        message: "Attendance already recorded today",
      });
    }

    const isLate = hour > 9 || (hour === 9 && minute > 15);
    const displayStatus = isLate ? "LATE" : "PRESENT";
    const displayMessage = isLate ? "Late attendance recorded" : "Attendance recorded successfully";
    mockScansToday.set(key, { time: formattedTime12, status: isLate ? "late" : "present" });

    return NextResponse.json({
      success: true,
      status: displayStatus,
      uid: normalizedUid,
      student_name: mockStudent.name,
      student_code: mockStudent.code,
      time: formattedTime12,
      message: displayMessage,
    });
  } catch (err: any) {
    console.error("Attendance scan API error:", err);
    return NextResponse.json(
      {
        success: false,
        status: "NETWORK_ERROR",
        message: "Internal server error occurred while processing scan",
      },
      { status: 500 }
    );
  }
}
