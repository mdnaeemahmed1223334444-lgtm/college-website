"use client";

import { useState } from "react";
import Link from "next/link";
import type { StaffProfileRecord } from "@/features/staff/types";

export default function FacultyDirectoryView({
  teachers,
  initialStream = "all",
}: {
  teachers: StaffProfileRecord[];
  initialStream?: "all" | "science" | "business-studies" | "humanities";
}) {
  const [stream, setStream] = useState<string>(initialStream);
  const [search, setSearch] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<StaffProfileRecord | null>(null);

  const scienceDepts = ["physics", "chemistry", "mathematics", "biology", "information & communication technology"];
  const businessDepts = ["accounting", "business organization & management", "finance & banking"];
  const humanitiesDepts = ["bangla", "english", "economics", "civics & good governance", "sociology", "history & islamic history"];

  const filtered = teachers.filter((t) => {
    if (!t.show_on_website) return false;
    const deptLower = t.department.toLowerCase();

    if (stream === "science" && !scienceDepts.includes(deptLower)) return false;
    if (stream === "business-studies" && !businessDepts.includes(deptLower)) return false;
    if (stream === "humanities" && !humanitiesDepts.includes(deptLower)) return false;

    if (search) {
      const q = search.toLowerCase();
      return (
        t.full_name.toLowerCase().includes(q) ||
        (t.bangla_name && t.bangla_name.includes(q)) ||
        t.designation.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.highest_degree.toLowerCase().includes(q) ||
        t.assigned_subjects?.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-900 p-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-teal-600/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-100 mb-2">
            Academic Excellence
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Distinguished Faculty</h1>
          <p className="mt-2 text-sm sm:text-base text-teal-100 leading-relaxed">
            Meet the experienced educators, researchers, and mentors shaping young minds across Science, Business Studies, and Humanities streams.
          </p>
        </div>

        {/* Stream Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-teal-600/60">
          <button
            onClick={() => setStream("all")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              stream === "all"
                ? "bg-white text-teal-900 shadow"
                : "bg-teal-800/80 text-teal-100 hover:bg-teal-800"
            }`}
          >
            All Faculty ({teachers.length})
          </button>
          <button
            onClick={() => setStream("science")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              stream === "science"
                ? "bg-white text-teal-900 shadow"
                : "bg-teal-800/80 text-teal-100 hover:bg-teal-800"
            }`}
          >
            Science Faculty
          </button>
          <button
            onClick={() => setStream("business-studies")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              stream === "business-studies"
                ? "bg-white text-teal-900 shadow"
                : "bg-teal-800/80 text-teal-100 hover:bg-teal-800"
            }`}
          >
            Business Studies Faculty
          </button>
          <button
            onClick={() => setStream("humanities")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              stream === "humanities"
                ? "bg-white text-teal-900 shadow"
                : "bg-teal-800/80 text-teal-100 hover:bg-teal-800"
            }`}
          >
            Humanities Faculty
          </button>
        </div>
      </div>

      {/* Search & Counter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="w-full sm:w-96">
          <input
            type="text"
            placeholder="Search teacher by name, designation, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <div className="text-xs text-gray-500">
          Showing <strong className="text-gray-900">{filtered.length}</strong> faculty members
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-teal-400 hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-teal-800 text-xl shadow-xs">
                {t.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.photo_url}
                    alt={t.full_name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  t.full_name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-teal-700 transition">
                  {t.full_name}
                </h3>
                {t.bangla_name && (
                  <p className="text-xs text-gray-500 mt-0.5">{t.bangla_name}</p>
                )}
                <p className="text-xs font-semibold text-teal-800 mt-1">{t.designation}</p>
                <span className="inline-block rounded-md bg-teal-50 border border-teal-200 px-2 py-0.5 text-[11px] font-medium text-teal-800 mt-1.5">
                  {t.department}
                </span>
                {t.is_head_of_department && (
                  <span className="ml-1 inline-block rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                    👑 HOD
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3 space-y-1.5 text-xs text-gray-600 flex-1">
              <div>
                <strong className="text-gray-900">Highest Degree:</strong> {t.highest_degree}
              </div>
              {t.institution && (
                <div className="text-[11px] text-gray-500">{t.institution}</div>
              )}
              {t.specialization && (
                <div className="text-[11px] text-gray-500 line-clamp-1">
                  <strong className="text-gray-700">Specialization:</strong> {t.specialization}
                </div>
              )}
              {t.assigned_subjects && t.assigned_subjects.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] text-gray-400 block mb-1">Subjects:</span>
                  <div className="flex flex-wrap gap-1">
                    {t.assigned_subjects.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 rounded px-1.5 py-0.5 text-[10px]">
                        {s}
                      </span>
                    ))}
                    {t.assigned_subjects.length > 2 && (
                      <span className="text-[10px] text-gray-400">+{t.assigned_subjects.length - 2} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {t.experience_years ? `${t.experience_years} yrs experience` : "Senior Faculty"}
              </span>
              <button
                onClick={() => setSelectedTeacher(t)}
                className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition"
              >
                View Full Profile &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl my-8 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-800 to-emerald-900 p-6 text-white relative">
              <button
                onClick={() => setSelectedTeacher(null)}
                className="absolute top-4 right-4 rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20"
              >
                ✕
              </button>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/60 bg-teal-700 flex items-center justify-center text-2xl font-bold">
                  {selectedTeacher.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedTeacher.photo_url}
                      alt={selectedTeacher.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    selectedTeacher.full_name.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedTeacher.full_name}</h2>
                  {selectedTeacher.bangla_name && (
                    <p className="text-sm text-teal-100">{selectedTeacher.bangla_name}</p>
                  )}
                  <p className="text-xs text-teal-200 mt-1">
                    {selectedTeacher.designation} • {selectedTeacher.department}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-sm text-gray-700">
              {selectedTeacher.bio && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Academic Biography
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {selectedTeacher.bio}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg">
                <div>
                  <span className="text-gray-500">Highest Qualification:</span>
                  <p className="font-semibold text-gray-900">{selectedTeacher.highest_degree}</p>
                </div>
                <div>
                  <span className="text-gray-500">Graduating Institution:</span>
                  <p className="font-semibold text-gray-900">{selectedTeacher.institution || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Specialization:</span>
                  <p className="font-semibold text-gray-900">{selectedTeacher.specialization || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total Teaching Experience:</span>
                  <p className="font-semibold text-gray-900">{selectedTeacher.experience_years || 0} Years</p>
                </div>
              </div>

              {selectedTeacher.assigned_subjects && selectedTeacher.assigned_subjects.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Courses & Subjects Taught
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTeacher.assigned_subjects.map((sub, idx) => (
                      <span key={idx} className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-medium text-teal-900">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg">
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-semibold text-gray-900">{selectedTeacher.email || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Campus Office:</span>
                  <p className="font-semibold text-gray-900">{selectedTeacher.room_number || "Main Academic Building"}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-4 text-right">
              <button
                onClick={() => setSelectedTeacher(null)}
                className="rounded-lg bg-teal-800 px-5 py-2 text-xs font-bold text-white hover:bg-teal-900"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
