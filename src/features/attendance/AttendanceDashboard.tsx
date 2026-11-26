"use client";

import React, { useState } from "react";
import type { StudentAttendanceRecord, AttendanceStats, GateDeviceRecord } from "./types";

interface Props {
  initialRecords: StudentAttendanceRecord[];
  initialStats: AttendanceStats;
  initialDevices: GateDeviceRecord[];
}

export default function AttendanceDashboard({
  initialRecords,
  initialStats,
  initialDevices,
}: Props) {
  const [records, setRecords] = useState<StudentAttendanceRecord[]>(initialRecords);
  const [stats, setStats] = useState<AttendanceStats>(initialStats);
  const [devices, setDevices] = useState<GateDeviceRecord[]>(initialDevices);

  // Filter modes: "all" (all historical dates), "today", "yesterday", "custom"
  const [dateFilterMode, setDateFilterMode] = useState<"all" | "today" | "yesterday" | "custom">("all");
  const [customDate, setCustomDate] = useState<string>(initialStats.date);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Manual / API Test Scan state
  const [testIdentifier, setTestIdentifier] = useState<string>("STU-2026-1003");
  const [testSubmitting, setTestSubmitting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: string;
    message: string;
    student_name?: string;
    time?: string;
    date?: string;
  } | null>(null);

  // Refresh attendance data based on current active filters
  async function refreshData(mode = dateFilterMode, cDate = customDate) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (mode === "today") {
        params.set("date", "today");
      } else if (mode === "yesterday") {
        params.set("date", "yesterday");
      } else if (mode === "custom" && cDate) {
        params.set("date", cDate);
      } else {
        params.set("date", "all");
      }

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const res = await fetch(`/api/attendance/records?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setRecords(json.records);
          setStats(json.stats);
          setDevices(json.devices);
        }
      }
    } catch (err) {
      console.error("Failed to refresh attendance:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Preset Mode Change
  function handleModeChange(mode: "all" | "today" | "yesterday" | "custom") {
    setDateFilterMode(mode);
    refreshData(mode, customDate);
  }

  // Handle Custom Date Picker Change
  function handleCustomDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setCustomDate(val);
    setDateFilterMode("custom");
    refreshData("custom", val);
  }

  // Export filtered records to CSV
  function handleExportCsv() {
    if (filteredRecords.length === 0) return;

    const headers = ["Date (DD-MM-YYYY)", "Day", "Student ID", "Student Name", "Class / Batch", "In Time", "Status", "Gate Device", "Remarks"];
    const rows = filteredRecords.map((r) => [
      `"${r.formatted_date || r.date}"`,
      `"${r.day_of_week || ""}"`,
      `"${r.student_code}"`,
      `"${r.student_name.replace(/"/g, '""')}"`,
      `"${(r.batch_name || "General").replace(/"/g, '""')}"`,
      `"${r.formatted_time || r.in_time}"`,
      `"${r.status.toUpperCase()}"`,
      `"${r.device_id || "GATE-01"}"`,
      `"${(r.remarks || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `college_attendance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Submit scan via API directly from browser
  async function handleApiSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!testIdentifier.trim()) return;

    setTestSubmitting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: "GATE-01",
          token: "dmc_gate01_secret_key_2026",
          card_data: testIdentifier.trim(),
          card_uid: "6B452254",
        }),
      });

      const json = await res.json();
      setTestResult({
        success: json.success,
        status: json.status || "UNKNOWN",
        message: json.message || "Processed",
        student_name: json.student_name,
        time: json.time,
        date: json.date,
      });

      if (json.success) {
        // Refresh records to show newly recorded row
        await refreshData(dateFilterMode, customDate);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        status: "NETWORK_ERROR",
        message: err.message || "Failed to reach scan API",
      });
    } finally {
      setTestSubmitting(false);
    }
  }

  // Filter records based on UI search and status
  const filteredRecords = records.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.student_name.toLowerCase().includes(q);
      const matchCode = r.student_code.toLowerCase().includes(q);
      const matchCard = r.rfid_card_id.toLowerCase().includes(q);
      const matchBatch = (r.batch_name || "").toLowerCase().includes(q);
      const matchDate = (r.formatted_date || r.date).includes(q);
      if (!matchName && !matchCode && !matchCard && !matchBatch && !matchDate) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── System Status & Gate Devices Bar ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                RFID Gate Attendance System
              </h2>
              <p className="text-xs text-gray-500">
                Real-time sync active • Bangladesh Standard Time (<code className="font-mono text-gray-700">Asia/Dhaka</code>)
              </p>
            </div>
          </div>

          {/* Connected Hardware Scanner Status */}
          <div className="flex flex-wrap items-center gap-2">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs"
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    dev.status === "online" ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                />
                <span className="font-semibold text-gray-800">{dev.device_id}</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">{dev.location}</span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                    dev.status === "online"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {dev.status}
                </span>
              </div>
            ))}

            <button
              onClick={() => refreshData()}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs disabled:opacity-50 transition-colors"
            >
              <span>{loading ? "Refreshing..." : "🔄 Refresh Data"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Daily Summary Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-800">Total Enrolled</div>
          <div className="mt-2 text-2xl font-extrabold text-blue-900">{stats.totalStudents}</div>
          <div className="mt-1 text-[11px] text-blue-700">Active College Students</div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">Present (On-Time)</div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-900">{stats.presentCount}</div>
          <div className="mt-1 text-[11px] text-emerald-700">Arrived before 09:15 AM</div>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800">Late Arrivals</div>
          <div className="mt-2 text-2xl font-extrabold text-amber-900">{stats.lateCount}</div>
          <div className="mt-1 text-[11px] text-amber-700">Arrived after 09:15 AM</div>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-800">Attendance Rate</div>
          <div className="mt-2 text-2xl font-extrabold text-purple-900">{stats.attendanceRate}%</div>
          <div className="mt-1 text-[11px] text-purple-700">Today&apos;s Gate Turnout</div>
        </div>
      </div>

      {/* ── Test Scan Console for Instant Verification ── */}
      <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 p-4 shadow-xs">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">💳</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Live Hardware Simulator / Manual Check-In
            </h3>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Simulate a gate scan or log attendance manually by typing a Student ID (e.g. <code className="bg-white px-1 py-0.5 rounded font-mono text-indigo-800">STU-2026-1003</code>) or burned RFID Card code (<code className="bg-white px-1 py-0.5 rounded font-mono text-indigo-800">HRMDC-26-8503</code>).
          </p>

          <form onSubmit={handleApiSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testIdentifier}
              onChange={(e) => setTestIdentifier(e.target.value)}
              placeholder="e.g. STU-2026-1003 or HRMDC-26-8503"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-mono font-medium text-gray-900 shadow-xs focus:border-indigo-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={testSubmitting}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{testSubmitting ? "Processing..." : "⚡ Log Gate Tap"}</span>
            </button>
          </form>

          {/* Test Result Display */}
          {testResult && (
            <div
              className={`mt-3 rounded-lg p-3 text-xs border ${
                testResult.success
                  ? testResult.status === "PRESENT"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <span>{testResult.success ? "✅" : "❌"}</span>
                  <span>STATUS: {testResult.status}</span>
                </span>
                <span className="font-mono">
                  {testResult.date && `${testResult.date}, `}
                  {testResult.time}
                </span>
              </div>
              <div className="mt-1 text-xs">
                {testResult.student_name && (
                  <p className="font-semibold">Student: {testResult.student_name}</p>
                )}
                <p>{testResult.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Attendance Log Table & Filters ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                Attendance Log Records ({filteredRecords.length})
              </h3>
              <p className="text-xs text-gray-500">
                Displaying:{" "}
                <span className="font-semibold text-gray-800">
                  {dateFilterMode === "all"
                    ? "Complete Attendance History (All Dates)"
                    : dateFilterMode === "today"
                    ? `Today (${stats.formatted_date})`
                    : dateFilterMode === "yesterday"
                    ? "Yesterday"
                    : `Selected Date (${customDate})`}
                </span>
              </p>
            </div>

            {/* Export CSV Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                disabled={filteredRecords.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <span>📥 Export CSV Report</span>
              </button>
            </div>
          </div>

          {/* Quick Date Presets and Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-200/60">
            <span className="text-xs font-semibold text-gray-500">Date Range:</span>

            <button
              onClick={() => handleModeChange("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                dateFilterMode === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Dates (Full History)
            </button>

            <button
              onClick={() => handleModeChange("today")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                dateFilterMode === "today"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Today
            </button>

            <button
              onClick={() => handleModeChange("yesterday")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                dateFilterMode === "yesterday"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Yesterday
            </button>

            {/* Custom Date Picker */}
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customDate}
                onChange={handleCustomDateChange}
                className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 shadow-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {/* Search Input */}
              <input
                type="text"
                placeholder="Search student, ID, card..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 shadow-xs focus:border-indigo-500 focus:outline-none w-48"
              />

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present Only</option>
                <option value="late">Late Only</option>
                <option value="absent">Absent Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Date (DD-MM-YYYY)</th>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Batch / Class</th>
                <th className="px-4 py-3">Check-In Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Card Key / UID</th>
                <th className="px-4 py-3">Scanner</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    <div className="text-2xl mb-2">📋</div>
                    <p className="font-semibold text-gray-700">No attendance records found.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try selecting &quot;All Dates (Full History)&quot; above or tap an RFID card at the gate scanner.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/20 transition-colors">
                    {/* Date in Bangladesh format DD-MM-YYYY */}
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {r.formatted_date || r.date}
                    </td>
                    {/* Day of the Week */}
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {r.day_of_week || "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {r.student_name}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {r.student_code}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.batch_name || "General"}
                    </td>
                    {/* Time in Bangladesh 12-hour format */}
                    <td className="px-4 py-3 font-mono font-bold text-gray-800 whitespace-nowrap">
                      {r.formatted_time || r.in_time}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                          r.status === "present"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "late"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600">{r.rfid_card_id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.device_id}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-xs">
                      {r.remarks || "Gate Tap"}
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
