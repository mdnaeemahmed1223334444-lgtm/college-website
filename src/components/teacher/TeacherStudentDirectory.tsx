"use client";

import { useState } from "react";
import Link from "next/link";
import type { StudentRecord, BatchRecord, StudyGroup, StudentStatus } from "@/features/students/types";

interface TeacherStudentDirectoryProps {
  initialStudents: StudentRecord[];
  batches: BatchRecord[];
}

export default function TeacherStudentDirectory({
  initialStudents,
  batches,
}: TeacherStudentDirectoryProps) {
  const [students] = useState<StudentRecord[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus | "all">("all");

  const filtered = students.filter((s) => {
    if (selectedBatch !== "all" && s.batch_id !== selectedBatch) return false;
    if (selectedGroup !== "all" && s.study_group !== selectedGroup) return false;
    if (selectedStatus !== "all" && s.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = s.full_name.toLowerCase().includes(q);
      const matchCode = s.student_code.toLowerCase().includes(q);
      const matchRoll = s.roll.toString().includes(q);
      const matchPhone = s.phone?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchRoll && !matchPhone) return false;
    }
    return true;
  });

  const groupBadge = (group: StudyGroup) => {
    switch (group) {
      case "science":
        return <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">Science</span>;
      case "business_studies":
        return <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">Business Studies</span>;
      case "humanities":
        return <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Humanities</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Student Directory (Teacher View)</h2>
            <p className="text-xs text-gray-500">
              Showing {filtered.length} of {students.length} students. View academic, contact, and guardian records.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-800 self-start sm:self-auto">
            👀 Read-Only Access
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
              Search Student
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll, ID..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
              HSC Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.exam_year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
              Study Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Groups</option>
              <option value="science">Science</option>
              <option value="business_studies">Business Studies</option>
              <option value="humanities">Humanities</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="passed_out">Alumni</option>
              <option value="suspended">Suspended</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List Cards & Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">Roll No</th>
                <th className="px-4 py-3.5">Batch & Stream</th>
                <th className="px-4 py-3.5">Contact Phone</th>
                <th className="px-4 py-3.5">Guardian Contact</th>
                <th className="px-4 py-3.5">Blood Group</th>
                <th className="px-4 py-3.5 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="text-2xl mb-2">🎓</div>
                    <p className="font-semibold text-gray-600">No students found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 shadow-xs">
                          {s.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.photo_url} alt={s.full_name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-blue-100 font-bold text-blue-700 text-sm">
                              {s.full_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{s.full_name}</div>
                          {s.bangla_name && (
                            <div className="text-[11px] text-gray-500">{s.bangla_name}</div>
                          )}
                          <div className="font-mono text-[10px] text-blue-600">{s.student_code}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-bold text-gray-900">
                      #{s.roll}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{s.batch_name}</div>
                      <div className="mt-0.5">{groupBadge(s.study_group)}</div>
                    </td>

                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {s.phone || "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {s.guardian_name ? (
                        <div>
                          <div className="font-semibold text-gray-900">{s.guardian_name}</div>
                          <div className="text-[11px] text-gray-500">
                            {s.guardian_relation || "Guardian"}: {s.guardian_phone || "—"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No guardian listed</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {s.blood_group ? (
                        <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5 font-bold text-red-700 text-[11px]">
                          {s.blood_group}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/teacher/students/${s.id}`}
                        className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 font-bold text-blue-700 hover:bg-blue-100 transition shadow-2xs"
                      >
                        View Profile →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
