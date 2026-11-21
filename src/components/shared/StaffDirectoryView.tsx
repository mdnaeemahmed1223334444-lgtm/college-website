"use client";

import { useState } from "react";
import type { StaffProfileRecord } from "@/features/staff/types";

export default function StaffDirectoryView({
  staffMembers,
}: {
  staffMembers: StaffProfileRecord[];
}) {
  const [search, setSearch] = useState("");

  const filtered = staffMembers.filter((s) => {
    if (!s.show_on_website) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.full_name.toLowerCase().includes(q) ||
        (s.bangla_name && s.bangla_name.includes(q)) ||
        s.designation.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 p-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-blue-600/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100 mb-2">
            Campus Administration & Services
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Administrative & Support Staff
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            The dedicated team ensuring smooth campus operations across college administration, student affairs, accounts, library services, and information technology.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Search staff by name, title, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-gray-500">
          Showing <strong className="text-gray-900">{filtered.length}</strong> staff members
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((staff) => (
          <div
            key={staff.id}
            className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-800 text-lg shadow-xs">
                {staff.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={staff.photo_url}
                    alt={staff.full_name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  staff.full_name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-700 transition">
                  {staff.full_name}
                </h3>
                {staff.bangla_name && (
                  <p className="text-xs text-gray-500 mt-0.5">{staff.bangla_name}</p>
                )}
                <p className="text-xs font-semibold text-blue-800 mt-1">{staff.designation}</p>
                <span className="inline-block rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-medium text-blue-800 mt-1.5">
                  {staff.department}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3 space-y-1.5 text-xs text-gray-600 flex-1">
              {staff.highest_degree && (
                <div>
                  <strong className="text-gray-900">Qualification:</strong> {staff.highest_degree}
                </div>
              )}
              {staff.specialization && (
                <div className="text-[11px] text-gray-500">
                  <strong className="text-gray-700">Area:</strong> {staff.specialization}
                </div>
              )}
              {staff.room_number && (
                <div className="text-[11px] text-gray-500">
                  <strong className="text-gray-700">Desk / Room:</strong> {staff.room_number}
                </div>
              )}
              {staff.bio && (
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 italic">
                  &ldquo;{staff.bio}&rdquo;
                </p>
              )}
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
              <span>{staff.phone}</span>
              <span className="font-medium text-blue-700">{staff.email}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
