"use client";

import React, { useState, useEffect } from "react";
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
  const [selectedDate, setSelectedDate] = useState<string>(initialStats.date);
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
  } | null>(null);

  // Refresh attendance data
  async function refreshData(date = selectedDate) {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/records?date=${encodeURIComponent(date)}`);
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

  // Handle Date Change
  function handleDateChange(newDate: string) {
    setSelectedDate(newDate);
    refreshData(newDate);
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
      });

      if (json.success) {
        // Refresh records to show newly recorded row
        await refreshData(selectedDate);
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

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.student_name.toLowerCase().includes(q);
      const matchCode = r.student_code.toLowerCase().includes(q);
      const matchCard = r.rfid_card_id.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCard) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Attendance Management</h1>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              ● Live RFID Connected
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time gate scans, RFID student identity verification, and daily attendance logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-xs focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => refreshData()}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <span>🔄</span>
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ── 4 Stats Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Enrolled</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{stats.totalStudents}</span>
            <span className="text-xs font-bold text-gray-500">Students</span>
          </div>
          <div className="mt-3 text-xs text-gray-500">Active students in college system</div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Present Today</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">{stats.presentCount}</span>
            <span className="text-xs font-bold text-emerald-800">
              {stats.totalStudents > 0 ? Math.round((stats.presentCount / stats.totalStudents) * 100) : 0}%
            </span>
          </div>
          <div className="mt-3 text-xs text-emerald-700">Arrived before 09:15 AM cutoff</div>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Late Arrivals</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">{stats.lateCount}</span>
            <span className="text-xs font-bold text-amber-800">
              {stats.totalStudents > 0 ? Math.round((stats.lateCount / stats.totalStudents) * 100) : 0}%
            </span>
          </div>
          <div className="mt-3 text-xs text-amber-700">Scanned after 09:15 AM Asia/Dhaka</div>
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-700">Absent / Unscanned</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-700">{stats.absentCount}</span>
            <span className="text-xs font-bold text-rose-800">
              {stats.totalStudents > 0 ? Math.round((stats.absentCount / stats.totalStudents) * 100) : 0}%
            </span>
          </div>
          <div className="mt-3 text-xs text-rose-700">Not recorded at main gate</div>
        </div>
      </div>

      {/* ── Hardware Scanner & Direct API Trigger Box ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Status */}
        <div className="lg:col-span-1 rounded-xl border border-gray-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-gray-900">📡 Gate Scanner Hardware</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Device ID</span>
                <span className="font-mono font-bold text-gray-800">GATE-01</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Location</span>
                <span className="font-medium text-gray-800">Main Campus Entrance</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Hardware Reader</span>
                <span className="font-medium text-gray-800">RC522 (13.56 MHz RFID)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Microcontroller</span>
                <span className="font-medium text-gray-800">ESP8266 NodeMCU V3</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">API Endpoint</span>
                <span className="font-mono text-xs text-blue-600 truncate max-w-[170px]">/api/attendance/scan</span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600">
            💡 Tapping your RFID card at the gate automatically posts scans to this backend and updates this screen.
          </div>
        </div>

        {/* Live Attendance API Simulator / Manual Trigger */}
        <div className="lg:col-span-2 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/40 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm text-blue-950 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Submit Attendance via API (Live Test & Manual Scan)</span>
            </h3>
            <span className="text-xs text-blue-700 bg-blue-100/70 font-semibold px-2 py-0.5 rounded">
              POST /api/attendance/scan
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-4">
            Test the attendance backend instantly! Enter a Student ID (e.g. <code className="bg-white px-1 py-0.5 rounded font-mono text-blue-800">STU-2026-1003</code>) or burned RFID Card code (e.g. <code className="bg-white px-1 py-0.5 rounded font-mono text-blue-800">HRMDC-26-8503</code>) to trigger the live API.
          </p>

          <form onSubmit={handleApiSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={testIdentifier}
              onChange={(e) => setTestIdentifier(e.target.value)}
              placeholder="e.g. STU-2026-1003 or HRMDC-26-8503"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-mono font-medium text-gray-900 shadow-xs focus:border-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={testSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{testSubmitting ? "Submitting..." : "⚡ Submit Attendance via API"}</span>
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
                {testResult.time && <span>Time: {testResult.time}</span>}
              </div>
              <div className="mt-1 text-xs">
                {testResult.student_name && <p className="font-semibold">Student: {testResult.student_name}</p>}
                <p>{testResult.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Attendance Log Table ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50/50">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Attendance Records ({filteredRecords.length})</h3>
            <p className="text-xs text-gray-500">Date: {selectedDate} (Asia/Dhaka)</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search name, ID, or card..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-xs focus:border-blue-500 focus:outline-none w-48"
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="late">Late Only</option>
              <option value="absent">Absent Only</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Batch / Class</th>
                <th className="px-4 py-3">In Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Card Key / UID</th>
                <th className="px-4 py-3">Gate Scanner</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="text-2xl mb-2">📋</div>
                    <p className="font-semibold text-gray-700">No attendance records found for this date.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tap an RFID card on the gate scanner or click &quot;Submit Attendance via API&quot; above to log attendance.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{r.student_name}</td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{r.student_code}</td>
                    <td className="px-4 py-3 text-gray-600">{r.batch_name || "General"}</td>
                    <td className="px-4 py-3 font-mono text-gray-800">{r.in_time}</td>
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
                    <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{r.remarks || "Gate Tap"}</td>
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
