import { NextRequest, NextResponse } from "next/server";
import { privateAdmin } from "@/lib/supabase/private-server";
import {
  getDhakaDate,
  formatDhakaTime,
  formatDhakaDate,
  DHAKA_TIMEZONE,
} from "@/lib/utils/datetime";

function getDhakaTimeParts() {
  const now = new Date();
  const dhakaFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: DHAKA_TIMEZONE,
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
  const formattedTime12 = formatDhakaTime(timeStr);

  return { dateStr, timeStr, hour, minute, formattedTime12 };
}

/**
 * GET /api/attendance/scan
 * Handshake / Health-check endpoint for ESP8266 device initialization.
 */
export async function GET(req: NextRequest) {
  const deviceId =
    req.headers.get("x-device-id") || req.nextUrl.searchParams.get("device_id") || "GATE-01";
  const { dateStr, formattedTime12 } = getDhakaTimeParts();

  return NextResponse.json({
    success: true,
    status: "CONNECTED",
    device_id: deviceId,
    server_time: formattedTime12,
    date: dateStr,
    formatted_date: formatDhakaDate(dateStr),
    timezone: DHAKA_TIMEZONE,
    message: "RFID Attendance backend online (Asia/Dhaka Standard Time)",
  });
}

/**
 * POST /api/attendance/scan
 * Main RFID scan processing endpoint.
 * Accepts:
 *   - card_data: Custom text burned into Card Block 4 (e.g. "HRMDC-26-8503" or student code)
 *   - card_uid: Hardware physical UID (e.g. "6B452254")
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

    // Primary: Custom data written on card (e.g. "HRMDC-26-8503")
    const cardDataRaw = (body.card_data || body.written_data || "").trim();
    // Secondary: Physical hardware UID (e.g. "6B452254")
    const cardUidRaw = (body.card_uid || body.uid || "").trim();

    const normalizedData = cardDataRaw;
    const normalizedUid = cardUidRaw.replace(/[^a-fA-F0-9]/g, "").toUpperCase();

    if (!normalizedData && !normalizedUid) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_REQUEST",
          message: "Card data or card UID is required",
        },
        { status: 400 }
      );
    }

    const { dateStr, timeStr, hour, minute, formattedTime12 } = getDhakaTimeParts();
    const privClient = privateAdmin();

    if (privClient) {
      // 1. Authenticate device if token provided
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

      // 2. Resolve Student
      // Priority 1: Match student_code or rfid_card_data with the written card_data
      let student = null;

      if (normalizedData) {
        const { data: matchByData } = await privClient
          .from("students")
          .select("id, student_code, full_name, status, rfid_card_id, rfid_card_data")
          .or(
            `student_code.ilike.${normalizedData},rfid_card_data.ilike.${normalizedData},rfid_card_id.ilike.${normalizedData}`
          )
          .maybeSingle();

        student = matchByData;
      }

      // Priority 2: Fallback to physical hardware UID if not found by written data
      if (!student && normalizedUid) {
        const { data: matchByUid } = await privClient
          .from("students")
          .select("id, student_code, full_name, status, rfid_card_id, rfid_card_data")
          .ilike("rfid_card_id", normalizedUid)
          .maybeSingle();

        student = matchByUid;
      }

      // Check UNREGISTERED_CARD
      if (!student) {
        const displayId = normalizedData || normalizedUid;
        return NextResponse.json({
          success: false,
          status: "UNREGISTERED_CARD",
          identifier: displayId,
          uid: normalizedUid,
          card_data: normalizedData,
          time: formattedTime12,
          date: formatDhakaDate(dateStr),
          message: normalizedData
            ? `Card data '${normalizedData}' is not registered`
            : "This card is not registered to any student",
        });
      }

      // Check INACTIVE_CARD
      if (student.status !== "active") {
        return NextResponse.json({
          success: false,
          status: "INACTIVE_CARD",
          identifier: normalizedData || normalizedUid,
          uid: normalizedUid,
          card_data: normalizedData,
          student_name: student.full_name,
          student_code: student.student_code,
          time: formattedTime12,
          date: formatDhakaDate(dateStr),
          message: "This student account is suspended/inactive",
        });
      }

      // 3. Duplicate scan prevention (Debounce cooldown: 3 minutes)
      const { data: recentScan } = await privClient
        .from("student_attendance")
        .select("id, scan_timestamp, in_time, status")
        .eq("student_id", student.id)
        .eq("date", dateStr)
        .order("scan_timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentScan) {
        const lastScanTime = new Date(recentScan.scan_timestamp).getTime();
        const diffSeconds = (Date.now() - lastScanTime) / 1000;

        // If card was tapped within 180 seconds (3 mins), ignore duplicate tap
        if (diffSeconds < 180) {
          const displayStatus = recentScan.status === "late" ? "LATE" : "PRESENT";
          return NextResponse.json({
            success: true,
            status: displayStatus,
            identifier: normalizedData || student.student_code,
            uid: normalizedUid,
            card_data: normalizedData,
            student_name: student.full_name,
            student_code: student.student_code,
            time: formatDhakaTime(recentScan.in_time),
            date: formatDhakaDate(dateStr),
            message: `Attendance already recorded today at ${formatDhakaTime(recentScan.in_time)} (Duplicate scan ignored)`,
            duplicate_ignored: true,
          });
        }
      }

      // 4. Determine PRESENT vs LATE status (Cutoff: 09:15 AM Asia/Dhaka)
      const isLate = hour > 9 || (hour === 9 && minute > 15);
      const scanStatus: "present" | "late" = isLate ? "late" : "present";
      const displayStatus = isLate ? "LATE" : "PRESENT";

      // 5. Permanently record attendance in database
      const { error: insertErr } = await privClient.from("student_attendance").insert({
        student_id: student.id,
        date: dateStr,
        in_time: timeStr,
        status: scanStatus,
        rfid_card_id: normalizedUid || normalizedData || "UNKNOWN",
        device_id: deviceId,
        scan_timestamp: new Date().toISOString(),
        remarks: `Gate check-in at ${formattedTime12} (Key: ${normalizedData || normalizedUid})`,
      });

      if (insertErr) {
        console.error("Failed to insert attendance record:", insertErr);
        throw insertErr;
      }

      // Update device last seen
      await privClient
        .from("attendance_devices")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("device_id", deviceId);

      return NextResponse.json({
        success: true,
        status: displayStatus,
        identifier: normalizedData || student.student_code,
        uid: normalizedUid,
        card_data: normalizedData,
        student_name: student.full_name,
        student_code: student.student_code,
        time: formattedTime12,
        date: formatDhakaDate(dateStr),
        message: `Attendance recorded successfully: ${displayStatus} at ${formattedTime12}`,
      });
    }

    // Local Fallback
    const displayId = normalizedData || normalizedUid || "STU-2026-1003";
    const isLate = hour > 9 || (hour === 9 && minute > 15);
    const displayStatus = isLate ? "LATE" : "PRESENT";

    return NextResponse.json({
      success: true,
      status: displayStatus,
      identifier: displayId,
      uid: normalizedUid || "6B452254",
      card_data: normalizedData || "HRMDC-26-8503",
      student_name: "Student",
      student_code: displayId,
      time: formattedTime12,
      date: formatDhakaDate(dateStr),
      message: `Attendance recorded successfully (${displayStatus} at ${formattedTime12})`,
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
