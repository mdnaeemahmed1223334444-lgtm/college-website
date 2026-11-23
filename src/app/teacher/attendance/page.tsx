import { getAttendanceRecords, getAttendanceStats, getGateDevices } from "@/features/attendance/queries";
import AttendanceDashboard from "@/features/attendance/AttendanceDashboard";

export const metadata = {
  title: "Class Attendance | Teacher Portal",
  description: "View daily student attendance records and live gate scan logs.",
};

export default async function TeacherAttendancePage() {
  const [initialRecords, initialStats, initialDevices] = await Promise.all([
    getAttendanceRecords(),
    getAttendanceStats(),
    getGateDevices(),
  ]);

  return (
    <AttendanceDashboard
      initialRecords={initialRecords}
      initialStats={initialStats}
      initialDevices={initialDevices}
    />
  );
}
