"use client";

import { useActionState, useState } from "react";
import { saveHolidayAction, deleteHolidayAction } from "@/features/content/actions";
import type { HolidayRecord, ContentFeedback } from "@/features/content/types";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";

export default function HolidayManager({ holidays }: { holidays: HolidayRecord[] }) {
  const [editing, setEditing] = useState<HolidayRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [state, formAction] = useActionState<ContentFeedback, FormData>(saveHolidayAction, {});
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete holiday "${title}"?`)) return;
    const res = await deleteHolidayAction(id);
    if (res.error) setDeleteMsg(res.error);
    else setDeleteMsg(`Holiday "${title}" removed.`);
  }

  const showEditor = Boolean(editing || isCreating);

  return (
    <div className="space-y-6">
      {deleteMsg && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
          {deleteMsg}
        </div>
      )}

      {showEditor && (
        <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-gray-900">
              {editing ? `Edit Holiday: ${editing.title}` : "Add Academic / National Holiday"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setIsCreating(false);
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>

          <FeedbackAlert state={state} />

          <form action={formAction} className="space-y-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700">Holiday Occasion / Title *</label>
                <input
                  name="title"
                  defaultValue={editing?.title || ""}
                  required
                  placeholder="e.g. Independence and National Day"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Start Date *</label>
                <input
                  name="start_date"
                  type="date"
                  defaultValue={editing?.start_date || ""}
                  required
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">End Date *</label>
                <input
                  name="end_date"
                  type="date"
                  defaultValue={editing?.end_date || ""}
                  required
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Total Days</label>
                <input
                  name="total_days"
                  type="number"
                  min={1}
                  defaultValue={editing?.total_days || 1}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Holiday Classification</label>
                <select
                  name="type"
                  defaultValue={editing?.type || "National"}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="National">National Holiday</option>
                  <option value="Religious">Religious Festival</option>
                  <option value="Academic">Academic Vacation</option>
                  <option value="Cultural">Cultural Observance</option>
                  <option value="Special">Special Holiday</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700">Brief Note / Description</label>
                <input
                  name="description"
                  defaultValue={editing?.description || ""}
                  placeholder="e.g. Campus and academic activities will remain closed."
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setIsCreating(false);
                }}
                className="rounded border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <SubmitButton label={editing ? "Update Holiday" : "Add to Calendar"} />
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Academic Calendar Holidays ({holidays.length})</h3>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setIsCreating(true);
          }}
          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Add Holiday
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="border-b bg-gray-50 text-[11px] font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Holiday Occasion</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Days</th>
              <th className="px-4 py-3">Classification</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {holidays.map((h) => (
              <tr key={h.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">{h.title}</div>
                  {h.description && <div className="text-[11px] text-gray-400">{h.description}</div>}
                </td>
                <td className="px-4 py-3 font-mono">
                  {h.start_date === h.end_date
                    ? h.start_date
                    : `${h.start_date} → ${h.end_date}`}
                </td>
                <td className="px-4 py-3 font-semibold">{h.total_days} {h.total_days > 1 ? "days" : "day"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                      h.type === "National"
                        ? "bg-red-50 text-red-700"
                        : h.type === "Religious"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {h.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditing(h);
                    }}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(h.id, h.title)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
