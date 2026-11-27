import { getAttendanceTimeSettings } from "@/features/academic/attendance-settings-actions";
import AttendanceTimeSettingsForm from "@/components/admin/attendance/AttendanceTimeSettingsForm";

export const metadata = {
  title: "Attendance Rules & Time Settings | Admin",
};

export default async function AttendanceRulesPage() {
  const settings = await getAttendanceTimeSettings();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Attendance Rules & Time Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure RFID check-in / check-out times, late thresholds, and weekly off days.
          Only administrators can change these settings.
        </p>
      </div>
      <AttendanceTimeSettingsForm initial={settings} />
    </div>
  );
}
