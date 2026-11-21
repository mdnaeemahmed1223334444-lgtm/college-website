"use client";

import Link from "next/link";
import { useState } from "react";
import type { StaffProfileRecord, StaffStats } from "@/features/staff/types";

export default function StaffOverview({
  stats,
  recentStaff,
}: {
  stats: StaffStats;
  recentStaff: StaffProfileRecord[];
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStaff = recentStaff.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 p-6 text-white shadow-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teacher & Staff Management</h1>
          <p className="mt-1 text-sm text-teal-100">
            Manage faculty profiles, support staff, department assignments, workloads, and attendance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/staff/list?action=create"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-teal-800 shadow transition hover:bg-teal-50"
          >
            <span className="text-base font-bold">+</span> Add New Staff / Teacher
          </Link>
          <Link
            href="/admin/staff/profiles"
            className="inline-flex items-center gap-2 rounded-lg border border-teal-300 bg-teal-800/60 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Teacher Profiles
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Personnel</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
          <span className="mt-1 inline-block text-xs text-gray-500">Teachers + Staff</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teaching Faculty</p>
          <p className="mt-2 text-2xl font-bold text-teal-700">{stats.totalTeachers}</p>
          <span className="mt-1 inline-block text-xs text-teal-600 font-medium">Academic Staff</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Support Staff</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{stats.totalSupportStaff}</p>
          <span className="mt-1 inline-block text-xs text-blue-600 font-medium">Admin & Labs</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active on Duty</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{stats.activeCount}</p>
          <span className="mt-1 inline-block text-xs text-emerald-600 font-medium">Currently active</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">On Leave</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{stats.onLeaveCount}</p>
          <span className="mt-1 inline-block text-xs text-amber-600 font-medium">Leave of absence</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Period/Wk</p>
          <p className="mt-2 text-2xl font-bold text-indigo-700">{stats.avgWeeklyPeriods}</p>
          <span className="mt-1 inline-block text-xs text-indigo-600 font-medium">Workload/Teacher</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Management Modules</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/staff/list"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-bold">
                👥
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-teal-700">Add / Edit / Remove Staff</h3>
                <p className="text-xs text-gray-500">Manage employee registry, add new profiles, update info</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/staff/profiles"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold">
                🎓
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700">Teacher Profiles</h3>
                <p className="text-xs text-gray-500">View detailed teacher bios, credentials & subject portfolios</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/staff/departments"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-800 font-bold">
                🏢
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">Department Assignment</h3>
                <p className="text-xs text-gray-500">Organize faculty into departments & designate Department Heads</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/staff/subjects"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800 font-bold">
                📚
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700">Subject Assignment</h3>
                <p className="text-xs text-gray-500">Assign course subjects and papers to specific teachers</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/staff/class-section"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-800 font-bold">
                🏫
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">Class & Section Assignment</h3>
                <p className="text-xs text-gray-500">Appoint Class Teachers for each year, group, and section</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/staff/workload"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold">
                📊
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-amber-700">Teacher Workload</h3>
                <p className="text-xs text-gray-500">Analyze periods per week and balance teaching workload</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/staff/attendance"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-800 font-bold">
                ⏱️
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-rose-700">Staff Attendance</h3>
                <p className="text-xs text-gray-500">Daily check-in logs, biometric records, leaves & late arrivals</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/staff/employment"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-bold">
                📑
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-teal-700">Employment Records</h3>
                <p className="text-xs text-gray-500">Permanent vs contractual service records, joining & contracts</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/staff/accounts"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-800 font-bold">
                🔑
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-cyan-700">Teacher Account Management</h3>
                <p className="text-xs text-gray-500">Portal credentials, login status & password reset</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Directory Snapshot */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 p-4 sm:flex sm:items-center sm:justify-between bg-gray-50/50">
          <div>
            <h3 className="font-semibold text-gray-900">Faculty & Staff Directory Snapshot</h3>
            <p className="text-xs text-gray-500">Showing key personnel and department heads</p>
          </div>
          <div className="mt-3 sm:mt-0">
            <input
              type="text"
              placeholder="Search by name, ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-72 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Role & Designation</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Workload</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStaff.slice(0, 8).map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50/80 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-800 text-xs">
                        {staff.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={staff.photo_url}
                            alt={staff.full_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          staff.full_name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{staff.full_name}</div>
                        <div className="text-xs text-gray-500">ID: {staff.employee_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{staff.designation}</div>
                    <span
                      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        staff.role === "teacher"
                          ? "bg-teal-50 text-teal-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {staff.role === "teacher" ? "Faculty" : "Support Staff"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800">{staff.department}</span>
                    {staff.is_head_of_department && (
                      <span className="ml-1.5 inline-block text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                        HOD
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div>{staff.phone}</div>
                    <div className="text-gray-400">{staff.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {staff.role === "teacher" ? (
                      <span className="font-semibold text-gray-900">{staff.weekly_periods || 0} periods/wk</span>
                    ) : (
                      <span className="text-gray-400">Full Time</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        staff.status === "active"
                          ? "bg-green-100 text-green-800"
                          : staff.status === "on_leave"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {staff.status === "active" ? "Active" : staff.status === "on_leave" ? "On Leave" : staff.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/staff/list?edit=${staff.id}`}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-800 mr-2"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/staff/profiles?id=${staff.id}`}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                    >
                      Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 bg-gray-50/50 p-3 text-center">
          <Link
            href="/admin/staff/list"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
          >
            View all {stats.totalStaff} staff members & teachers &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
