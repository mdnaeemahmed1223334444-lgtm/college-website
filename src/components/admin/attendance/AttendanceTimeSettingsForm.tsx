"use client";
import { useActionState } from "react";
import { saveAttendanceTimeSettingsAction } from "@/features/academic/attendance-settings-actions";
import type { AttendanceTimeSettings } from "@/features/academic/types";

const ALL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AttendanceTimeSettingsForm({ initial }: { initial: AttendanceTimeSettings }) {
  const [state, formAction, isPending] = useActionState(saveAttendanceTimeSettingsAction, null);

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {state?.success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 flex items-center gap-2">
          ✅ Attendance settings saved successfully.
        </div>
      )}
      {state?.error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800 flex items-center gap-2">
          ❌ {state.error}
        </div>
      )}

      {/* Entry Time */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-gray-900">🕗 Entry / Check-In Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Entry Time (Check-In)</label>
            <input
              type="time"
              name="entry_time"
              defaultValue={initial.entry_time}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">The expected arrival time (e.g., 09:00)</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Grace Period (minutes)</label>
            <input
              type="number"
              name="entry_grace_minutes"
              defaultValue={initial.entry_grace_minutes}
              min={0}
              max={60}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Student is "Late" if scanned after entry_time + grace</p>
          </div>
        </div>
      </div>

      {/* Exit Time */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-gray-900">🕑 Exit / Check-Out Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Default Exit Time</label>
            <input
              type="time"
              name="exit_time_default"
              defaultValue={initial.exit_time_default}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Expected departure time (e.g., 13:30). PT scan does NOT count as exit.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Early-Exit Threshold (minutes)</label>
            <input
              type="number"
              name="exit_early_threshold_minutes"
              defaultValue={initial.exit_early_threshold_minutes}
              min={0}
              max={120}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Student "left early" if out_time is earlier than exit_time - threshold</p>
          </div>
        </div>
      </div>

      {/* Weekly Off Days */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-gray-900">📅 Weekly Off Days</h3>
        <p className="text-xs text-gray-500">Attendance is NOT counted on these days even if a student scans the card.</p>
        <div className="flex flex-wrap gap-2">
          {ALL_DAYS.map((day) => (
            <label key={day} className="flex items-center gap-2 cursor-pointer rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                name={`off_${day}`}
                defaultChecked={initial.weekly_off_days.includes(day)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-gray-700">{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
        <strong>ℹ️ How this works:</strong> When a student scans their RFID card:
        <ul className="mt-1 ml-3 list-disc space-y-0.5">
          <li>First scan of the day = <strong>check-in</strong>. If after entry_time + grace → marked <strong>Late</strong>.</li>
          <li>Second scan = <strong>check-out</strong>. If before exit_time - threshold → noted as <strong>Left Early</strong>.</li>
          <li>Scans during <strong>PT (Physical Training)</strong> class end time are ignored as checkout.</li>
          <li>No scan on a school day = <strong>Absent</strong>. Holidays and weekly-offs are excluded.</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-blue-700 text-white px-6 py-2.5 text-sm font-bold hover:bg-blue-800 shadow disabled:opacity-50 transition"
      >
        {isPending ? "Saving…" : "💾 Save Attendance Settings"}
      </button>
    </form>
  );
}
