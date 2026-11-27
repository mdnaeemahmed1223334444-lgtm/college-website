import "server-only";
import { privateAdmin } from "@/lib/supabase/private-server";
import {
  getDhakaDate,
  getDhakaYesterday,
  formatDhakaDate,
  formatDhakaTime,
  formatDhakaDayOfWeek,
} from "@/lib/utils/datetime";
import { getAttendanceTimeSettings } from "@/features/academic/attendance-settings-queries";
import type {
  StudentAttendanceRecord,
  AttendanceStats,
  GateDeviceRecord,
  AttendanceStatus,
  AttendanceFilterOptions,
  StudentAttendanceSummary,
} from "./types";

export async function getAttendanceRecords(
  filters?: AttendanceFilterOptions
): Promise<StudentAttendanceRecord[]> {
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
          section,
          study_group,
          batch_id,
          batches:batch_id (
            id,
            name
          )
        )
      `)
      .order("date", { ascending: false })
      .order("scan_timestamp", { ascending: false });

    // ── Date Filtering ──
    // Only filter to a single date if explicitly requested!
    if (filters?.date) {
      if (filters.date === "today") {
        query = query.eq("date", getDhakaDate());
      } else if (filters.date === "yesterday") {
        query = query.eq("date", getDhakaYesterday());
      } else if (filters.date !== "all") {
        query = query.eq("date", filters.date);
      }
    }

    if (filters?.startDate && filters?.endDate) {
      query = query.gte("date", filters.startDate).lte("date", filters.endDate);
    } else if (filters?.month) {
      query = query
        .gte("date", `${filters.month}-01`)
        .lte("date", `${filters.month}-31`);
    }

    // ── Student Filter ──
    if (filters?.studentId) {
      query = query.eq("student_id", filters.studentId);
    }

    // ── Status Filter ──
    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching attendance with join, falling back to raw table:", error);

      // Fallback query if join has any schema cache issues
      let fallbackQuery = supabase
        .from("student_attendance")
        .select("*")
        .order("date", { ascending: false })
        .order("scan_timestamp", { ascending: false });

      if (filters?.date && filters.date !== "all") {
        const targetDate =
          filters.date === "today"
            ? getDhakaDate()
            : filters.date === "yesterday"
            ? getDhakaYesterday()
            : filters.date;
        fallbackQuery = fallbackQuery.eq("date", targetDate);
      }
      if (filters?.studentId) {
        fallbackQuery = fallbackQuery.eq("student_id", filters.studentId);
      }
      if (filters?.status && filters.status !== "all") {
        fallbackQuery = fallbackQuery.eq("status", filters.status);
      }
      if (filters?.limit) {
        fallbackQuery = fallbackQuery.limit(filters.limit);
      }

      const { data: rawData } = await fallbackQuery;
      if (!rawData) return [];

      return rawData.map((row: any) => ({
        id: row.id,
        student_id: row.student_id,
        student_code: "STU-ID",
        student_name: row.remarks || "Student",
        batch_name: "General",
        date: row.date,
        formatted_date: formatDhakaDate(row.date),
        day_of_week: formatDhakaDayOfWeek(row.date),
        in_time: row.in_time,
        formatted_time: formatDhakaTime(row.in_time || row.scan_timestamp),
        out_time: row.out_time,
        formatted_out_time: row.out_time ? formatDhakaTime(row.out_time) : undefined,
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
        section: student?.section,
        date: row.date,
        formatted_date: formatDhakaDate(row.date),
        day_of_week: formatDhakaDayOfWeek(row.date),
        in_time: row.in_time,
        formatted_time: formatDhakaTime(row.in_time || row.scan_timestamp),
        out_time: row.out_time,
        formatted_out_time: row.out_time ? formatDhakaTime(row.out_time) : undefined,
        status: row.status as AttendanceStatus,
        rfid_card_id: row.rfid_card_id,
        device_id: row.device_id || "GATE-01",
        scan_timestamp: row.scan_timestamp,
        remarks: row.remarks,
      };
    });

    // Client-side text search (covers student name, code, RFID card, remarks)
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(
        (r) =>
          r.student_name.toLowerCase().includes(q) ||
          r.student_code.toLowerCase().includes(q) ||
          r.rfid_card_id.toLowerCase().includes(q) ||
          (r.remarks && r.remarks.toLowerCase().includes(q))
      );
    }

    if (filters?.studentCode) {
      const code = filters.studentCode.toLowerCase();
      records = records.filter((r) => r.student_code.toLowerCase() === code);
    }

    if (filters?.batchId && filters.batchId !== "all") {
      const bId = filters.batchId.toLowerCase();
      records = records.filter(
        (r) => r.batch_name && r.batch_name.toLowerCase().includes(bId)
      );
    }

    if (filters?.studyGroup && filters.studyGroup !== "all") {
      records = records.filter((r) => r.study_group === filters.studyGroup);
    }

    return records;
  } catch (err) {
    console.error("Attendance query failure:", err);
    return [];
  }
}

export async function getAttendanceStats(date?: string): Promise<AttendanceStats> {
  const targetDate = date && date !== "all" ? (date === "today" ? getDhakaDate() : date === "yesterday" ? getDhakaYesterday() : date) : getDhakaDate();
  const supabase = privateAdmin();

  let totalStudents = 0;
  let presentCount = 0;
  let lateCount = 0;
  let leaveCount = 0;
  let isOffDay = false;

  if (supabase) {
    try {
      // 1. Total Active Students
      const { count: studentCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      totalStudents = studentCount || 0;

      // Check if targetDate is a weekly off day or published holiday
      const [attSettings, holidayRes] = await Promise.all([
        getAttendanceTimeSettings(),
        supabase
          .from("holidays")
          .select("id")
          .eq("date", targetDate)
          .eq("is_active", true)
          .maybeSingle(),
      ]);

      const dayOfWeek = formatDhakaDayOfWeek(targetDate);
      if (attSettings.weekly_off_days.includes(dayOfWeek) || holidayRes.data) {
        isOffDay = true;
      }

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
  // If it's an off day or holiday, absentCount is 0 (school was closed)
  const absentCount = isOffDay ? 0 : Math.max(0, totalStudents - recordedCount);
  const attendanceRate = totalStudents > 0 
    ? (isOffDay && recordedCount === 0 ? 100 : Math.round(((presentCount + lateCount) / totalStudents) * 100))
    : 0;

  return {
    date: targetDate,
    formatted_date: formatDhakaDate(targetDate),
    totalStudents,
    presentCount,
    lateCount,
    absentCount,
    leaveCount,
    attendanceRate,
  };
}

/**
 * Returns comprehensive student-specific attendance history from the actual RFID database.
 * Deduplicates multiple scans per day to present an accurate daily ledger.
 */
export async function getStudentAttendanceSummary(
  studentIdOrCode: string,
  month?: string
): Promise<StudentAttendanceSummary | null> {
  const supabase = privateAdmin();
  if (!supabase) return null;

  try {
    // 1. Find the student record (fast index on UUID)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentIdOrCode);
    let studentQuery = supabase
      .from("students")
      .select("id, student_code, full_name");

    if (isUuid) {
      studentQuery = studentQuery.eq("id", studentIdOrCode);
    } else {
      studentQuery = studentQuery.or(`id.eq.${studentIdOrCode},student_code.ilike.${studentIdOrCode}`);
    }
    const { data: student } = await studentQuery.maybeSingle();

    if (!student) return null;

    // 2. Query attendance records for this student
    let attQuery = supabase
      .from("student_attendance")
      .select("*")
      .eq("student_id", student.id)
      .order("date", { ascending: false })
      .order("scan_timestamp", { ascending: false });

    if (month) {
      attQuery = attQuery.gte("date", `${month}-01`).lte("date", `${month}-31`);
    }

    const { data: attRecords } = await attQuery;

    // Deduplicate so each date has one official attendance entry
    const dateMap = new Map<string, any>();
    for (const r of attRecords || []) {
      if (!dateMap.has(r.date)) {
        dateMap.set(r.date, r);
      }
    }

    // 3. Load attendance settings + holidays to filter off-days
    const [attSettings, holidayData] = await Promise.all([
      getAttendanceTimeSettings(),
      supabase
        .from("holidays")
        .select("date")
        .eq("is_active", true)
        .then((res) => res.data || []),
    ]);

    const holidaySet = new Set<string>(holidayData.map((h: any) => h.date as string));
    const weeklyOffDays = new Set<string>(attSettings.weekly_off_days);

    function isCollegeDay(dateStr: string): boolean {
      const dayName = formatDhakaDayOfWeek(dateStr);
      if (weeklyOffDays.has(dayName)) return false;
      if (holidaySet.has(dateStr)) return false;
      return true;
    }

    const records: StudentAttendanceRecord[] = Array.from(dateMap.values()).map((row) => ({
      id: row.id,
      student_id: student.id,
      student_code: student.student_code,
      student_name: student.full_name,
      date: row.date,
      formatted_date: formatDhakaDate(row.date),
      day_of_week: formatDhakaDayOfWeek(row.date),
      in_time: row.in_time,
      formatted_time: formatDhakaTime(row.in_time || row.scan_timestamp),
      out_time: row.out_time,
      formatted_out_time: row.out_time ? formatDhakaTime(row.out_time) : undefined,
      status: row.status as AttendanceStatus,
      rfid_card_id: row.rfid_card_id,
      device_id: row.device_id || "GATE-01",
      scan_timestamp: row.scan_timestamp,
      remarks: row.remarks,
    }));

    // Count college days from all attendance records, excluding off-days and holidays
    let daysQuery = supabase
      .from("student_attendance")
      .select("date");

    if (month) {
      daysQuery = daysQuery.gte("date", `${month}-01`).lte("date", `${month}-31`);
    }

    const { data: allDates } = await daysQuery;
    const uniqueCollegeDates = new Set(
      (allDates || []).map((d: any) => d.date as string).filter(isCollegeDay)
    );
    const total_class_days = Math.max(
      records.filter((r) => isCollegeDay(r.date)).length,
      uniqueCollegeDates.size
    );

    let present_days = 0;
    let late_days = 0;
    let leave_days = 0;

    for (const r of records) {
      if (!isCollegeDay(r.date)) continue; // skip off-days in stats
      if (r.status === "present") present_days++;
      else if (r.status === "late") late_days++;
      else if (r.status === "leave") leave_days++;
    }

    const attended_days = present_days + late_days + leave_days;
    const absent_days = Math.max(0, total_class_days - attended_days);
    const percentage =
      total_class_days > 0 ? Math.round(((present_days + late_days) / total_class_days) * 100) : 100;

    return {
      student_id: student.id,
      student_code: student.student_code,
      student_name: student.full_name,
      total_class_days,
      present_days,
      late_days,
      absent_days,
      leave_days,
      percentage,
      records,
    };
  } catch (err) {
    console.error("getStudentAttendanceSummary error:", err);
    return null;
  }
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
