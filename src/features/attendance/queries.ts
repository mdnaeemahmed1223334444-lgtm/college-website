import "server-only";
import { privateAdmin } from "@/lib/supabase/private-server";
import type { StudentAttendanceRecord, AttendanceStats, GateDeviceRecord, AttendanceStatus } from "./types";

function getDhakaDate(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

export async function getAttendanceRecords(filters?: {
  date?: string;
  batchId?: string;
  status?: string;
  search?: string;
}): Promise<StudentAttendanceRecord[]> {
  const targetDate = filters?.date || getDhakaDate();
  const supabase = privateAdmin();

  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from("student_attendance")
      .select(`
        id,
        student_id,
        date,
        in_time,
        out_time,
        status,
        rfid_card_id,
        device_id,
        scan_timestamp,
        remarks,
        students!inner (
          id,
          student_code,
          full_name,
          roll,
          study_group,
          batch_id,
          batches:batch_id (
            id,
            name
          )
        )
      `)
      .eq("date", targetDate)
      .order("scan_timestamp", { ascending: false });

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching attendance records:", error);
      // Fallback: Query without inner join in case foreign key differs
      const { data: rawData } = await supabase
        .from("student_attendance")
        .select("*")
        .eq("date", targetDate)
        .order("scan_timestamp", { ascending: false });

      if (!rawData) return [];

      return rawData.map((row: any) => ({
        id: row.id,
        student_id: row.student_id,
        student_code: "STU-ID",
        student_name: row.remarks || "Student",
        batch_name: "General",
        date: row.date,
        in_time: row.in_time,
        out_time: row.out_time,
        status: (row.status || "present") as AttendanceStatus,
        rfid_card_id: row.rfid_card_id,
        device_id: row.device_id || "GATE-01",
        scan_timestamp: row.scan_timestamp,
        remarks: row.remarks,
      }));
    }

    let records: StudentAttendanceRecord[] = (data || []).map((row: any) => {
      const student = row.students;
      const batch = student?.batches;
      return {
        id: row.id,
        student_id: row.student_id,
        student_code: student?.student_code || "N/A",
        student_name: student?.full_name || "Unknown",
        batch_name: batch?.name || "General",
        study_group: student?.study_group,
        roll: student?.roll,
        date: row.date,
        in_time: row.in_time,
        out_time: row.out_time,
        status: row.status as AttendanceStatus,
        rfid_card_id: row.rfid_card_id,
        device_id: row.device_id || "GATE-01",
        scan_timestamp: row.scan_timestamp,
        remarks: row.remarks,
      };
    });

    if (filters?.batchId && filters.batchId !== "all") {
      // client filter or join filter
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(
        (r) =>
          r.student_name.toLowerCase().includes(q) ||
          r.student_code.toLowerCase().includes(q) ||
          r.rfid_card_id.toLowerCase().includes(q)
      );
    }

    return records;
  } catch (err) {
    console.error("Attendance query failure:", err);
    return [];
  }
}

export async function getAttendanceStats(date?: string): Promise<AttendanceStats> {
  const targetDate = date || getDhakaDate();
  const supabase = privateAdmin();

  let totalStudents = 0;
  let presentCount = 0;
  let lateCount = 0;
  let leaveCount = 0;

  if (supabase) {
    try {
      // 1. Total Active Students
      const { count: studentCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      totalStudents = studentCount || 0;

      // 2. Attendance Counts for Date
      const { data: attRecords } = await supabase
        .from("student_attendance")
        .select("student_id, status")
        .eq("date", targetDate);

      if (attRecords) {
        // Deduplicate by student_id to count unique students
        const seenStudents = new Set<string>();
        for (const r of attRecords) {
          if (!seenStudents.has(r.student_id)) {
            seenStudents.add(r.student_id);
            if (r.status === "present") presentCount++;
            else if (r.status === "late") lateCount++;
            else if (r.status === "leave") leaveCount++;
          }
        }
      }
    } catch (err) {
      console.error("Error calculating attendance stats:", err);
    }
  }

  const recordedCount = presentCount + lateCount + leaveCount;
  const absentCount = Math.max(0, totalStudents - recordedCount);
  const attendanceRate = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0;

  return {
    date: targetDate,
    totalStudents,
    presentCount,
    lateCount,
    absentCount,
    leaveCount,
    attendanceRate,
  };
}

export async function getGateDevices(): Promise<GateDeviceRecord[]> {
  const supabase = privateAdmin();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from("attendance_devices")
      .select("*")
      .order("device_id", { ascending: true });

    if (!data || data.length === 0) {
      return [
        {
          id: "dev-gate01",
          device_id: "GATE-01",
          name: "Main Campus Gate Scanner",
          location: "Main Entrance",
          is_active: true,
          status: "online",
        },
      ];
    }

    const now = Date.now();
    return data.map((d: any) => {
      const lastSeen = d.last_seen_at ? new Date(d.last_seen_at).getTime() : 0;
      // If seen within last 5 minutes, considered online
      const isOnline = now - lastSeen < 5 * 60 * 1000;
      return {
        id: d.id,
        device_id: d.device_id,
        name: d.name,
        location: d.location || "Campus Gate",
        is_active: d.is_active,
        last_seen_at: d.last_seen_at,
        status: isOnline ? "online" : "offline",
      };
    });
  } catch {
    return [];
  }
}
