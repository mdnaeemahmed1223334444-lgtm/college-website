import { getDailyStaffAttendance } from "@/features/staff/queries";
import StaffAttendanceManager from "@/components/admin/staff/StaffAttendanceManager";

export const metadata = {
  title: "Staff Attendance | Administration",
};

export default async function Page() {
  const today = new Date().toISOString().split("T")[0];
  const attendance = await getDailyStaffAttendance(today);

  return <StaffAttendanceManager attendanceList={attendance} currentDate={today} />;
}
