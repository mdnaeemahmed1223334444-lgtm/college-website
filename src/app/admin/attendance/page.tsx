import { getAttendanceRecords, getAttendanceStats, getGateDevices } from "@/features/attendance/queries";
import AttendanceDashboard from "@/features/attendance/AttendanceDashboard";

export const metadata = {
  title: "Attendance Management | Dhaka Model College Admin",
  description: "Real-time RFID gate attendance logs, present/late stats, and gate device monitor.",
};

export default async function AdminAttendancePage() {
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
