import { NextRequest, NextResponse } from "next/server";
import { getAttendanceRecords, getAttendanceStats, getGateDevices } from "@/features/attendance/queries";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get("date") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const month = searchParams.get("month") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const studentId = searchParams.get("studentId") || undefined;
    const studentCode = searchParams.get("studentCode") || undefined;
    const batchId = searchParams.get("batchId") || undefined;
    const studyGroup = searchParams.get("studyGroup") || undefined;

    const [records, stats, devices] = await Promise.all([
      getAttendanceRecords({
        date,
        startDate,
        endDate,
        month,
        status,
        search,
        studentId,
        studentCode,
        batchId,
        studyGroup,
      }),
      getAttendanceStats(date),
      getGateDevices(),
    ]);

    return NextResponse.json({
      success: true,
      records,
      stats,
      devices,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Failed to fetch attendance data",
      },
      { status: 500 }
    );
  }
}
