"use client";

import React, { useState } from "react";
import type { PeriodSlot, BreakSlot } from "@/features/academic/routine-defaults";

export interface RoutineCellData {
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherName?: string;
  isPT?: boolean;
  isPractical?: boolean;
  studyGroup?: string;
  batchName?: string;
}

export interface UnifiedRoutineTableProps {
  title?: string;
  subtitle?: string;
  institutionName?: string;
  todayName: string;
  periods: PeriodSlot[];
  tiffinBreak: BreakSlot;
  collegeDays: string[];
  gridByDay: Record<string, RoutineCellData[]>;
  availableGroups?: Array<{ id: string; label: string }>;
  selectedGroup?: string;
  onGroupChange?: (group: string) => void;
  showTeacherName?: boolean;
  userRole?: "student" | "teacher" | "admin";
}

export default function UnifiedRoutineTable({
  title = "7-Period Academic Class Routine",
  subtitle,
  institutionName = "Haji Rahmatullah Model Degree College",
  todayName,
  periods,
  tiffinBreak,
  collegeDays,
  gridByDay,
  availableGroups,
  selectedGroup,
  onGroupChange,
  showTeacherName = true,
  userRole = "student",
}: UnifiedRoutineTableProps) {
  const [activeGroup, setActiveGroup] = useState(selectedGroup || "all");

  const handleGroupSelect = (group: string) => {
    setActiveGroup(group);
    if (onGroupChange) onGroupChange(group);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const isWeekendToday = ["Friday", "Saturday"].includes(todayName);

  // Periods before and after tiffin break
  const morningPeriods = periods.filter((p) => p.number <= tiffinBreak.afterPeriod);
  const afternoonPeriods = periods.filter((p) => p.number > tiffinBreak.afterPeriod);

  return (
    <div className="space-y-4">
      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide non-printable portal elements */
          header,
          nav,
          aside,
          footer,
          .no-print,
          button,
          .portal-sidebar,
          .site-header {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .routine-container {
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .routine-table {
            border: 1.5px solid #1e293b !important;
            width: 100% !important;
          }
          .routine-table th,
          .routine-table td {
            border: 1px solid #475569 !important;
            padding: 6px 4px !important;
          }
          .break-column {
            background-color: #fef3c7 !important;
            border-left: 2px dashed #d97706 !important;
            border-right: 2px dashed #d97706 !important;
          }
          .today-row {
            background-color: #eff6ff !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      {/* Official Print Header (Visible only when printing or saving as PDF) */}
      <div className="print-only text-center pb-3 border-b-2 border-gray-900 mb-4">
        <h1 className="text-xl font-black text-gray-900 uppercase tracking-wide">
          {institutionName}
        </h1>
        <p className="text-sm font-bold text-gray-800 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>}
        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 px-2">
          <span>Official 7-Period Timetable (Recess / Tiffin after 3rd Period)</span>
          <span>Printed on: {new Date().toLocaleDateString("en-GB")}</span>
        </div>
      </div>

      {/* Screen Controls Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {isWeekendToday ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                🎉 Weekend Off-Day
              </span>
            ) : (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 flex items-center gap-1">
                <span>📅 Today:</span> <strong>{todayName}</strong>
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {availableGroups && availableGroups.length > 0 && (
            <div className="flex items-center rounded-lg border border-gray-300 p-0.5 bg-gray-50 text-xs">
              {availableGroups.map((grp) => (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => handleGroupSelect(grp.id)}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                    activeGroup === grp.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {grp.label}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Download PDF or Print Class Routine"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span>🖨️ Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Routine Guide Notice */}
      <div className="no-print rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-3.5 text-xs text-blue-900 flex items-start gap-2.5 shadow-xs">
        <span className="text-lg shrink-0">ℹ️</span>
        <div className="leading-relaxed">
          <p className="font-bold">7-Period Academic Routine Structure:</p>
          <p className="text-blue-800 mt-0.5">
            • <strong>Morning Theory:</strong> Period 1 to 3 (09:00 AM – 11:15 AM)
            <br />
            • <strong>Tiffin Break (Recess):</strong> 11:15 AM – 11:45 AM (30 minutes break after 3 periods)
            <br />
            • <strong>Afternoon Theory & Lab:</strong> Period 4 to 7 (11:45 AM – 02:35 PM)
            <br />
            • <strong>Special Exemptions:</strong> Physical Training (PT) and Practical classes are non-mandatory dismissal activities; departing before or during them does not flag early departure.
          </p>
        </div>
      </div>

      {/* Master 7-Period Unified Routine Table */}
      <div className="routine-container rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
          <table className="routine-table w-full text-left border-collapse text-xs min-w-[760px]">
            <thead>
              <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                <th className="px-2 py-3 border-r border-slate-800 uppercase tracking-wider w-20 text-center shrink-0">
                  Day
                </th>
                {morningPeriods.map((slot) => (
                  <th
                    key={slot.number}
                    className="px-2 py-2.5 border-r border-slate-800 text-center min-w-[95px] lg:min-w-[110px]"
                  >
                    <div className="font-black text-xs text-white">Period {slot.number}</div>
                    <div className="text-[10px] text-blue-200 font-mono mt-0.5">
                      {slot.defaultStart} – {slot.defaultEnd}
                    </div>
                  </th>
                ))}

                {/* Official Tiffin Break Column after Period 3 */}
                <th className="break-column px-1.5 py-2.5 border-r border-amber-300 bg-amber-500 text-slate-900 text-center w-20 min-w-[75px] shrink-0">
                  <div className="flex items-center justify-center gap-1 font-black text-[11px] text-slate-950">
                    <span>☕</span>
                    <span>TIFFIN</span>
                  </div>
                  <div className="text-[9px] font-mono font-bold text-slate-900 mt-0.5 whitespace-nowrap">
                    {tiffinBreak.defaultStart}–{tiffinBreak.defaultEnd}
                  </div>
                  <div className="text-[8px] uppercase tracking-wider font-extrabold text-amber-950">
                    (Break)
                  </div>
                </th>

                {afternoonPeriods.map((slot) => (
                  <th
                    key={slot.number}
                    className="px-2 py-2.5 border-r border-slate-800 text-center min-w-[95px] lg:min-w-[110px] last:border-0"
                  >
                    <div className="font-black text-xs text-white">Period {slot.number}</div>
                    <div className="text-[10px] text-blue-200 font-mono mt-0.5">
                      {slot.defaultStart} – {slot.defaultEnd}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {collegeDays.map((day) => {
                const isToday = day === todayName;
                const daySlots = gridByDay[day] || [];

                return (
                  <tr
                    key={day}
                    className={`transition-colors ${
                      isToday
                        ? "today-row bg-blue-50/70 ring-2 ring-blue-500 ring-inset font-medium"
                        : "hover:bg-gray-50/50"
                    }`}
                  >
                    {/* Day Column */}
                    <td
                      className={`px-3 py-3 border-r border-gray-200 text-center ${
                        isToday ? "bg-blue-100/80 font-black text-blue-900" : "bg-gray-50 font-bold text-gray-900"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-xs uppercase tracking-wide">{day}</span>
                        {isToday && (
                          <span className="rounded bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wider animate-pulse">
                            ⭐ TODAY
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Periods 1 to 3 */}
                    {morningPeriods.map((slot) => {
                      const cell = daySlots.find((c) => c.periodNumber === slot.number);
                      const subject = cell?.subject || "—";
                      const isPT = Boolean(cell?.isPT);
                      const isPractical = Boolean(cell?.isPractical);

                      return (
                        <td
                          key={slot.number}
                          className={`px-2.5 py-2.5 border-r border-gray-200 align-top ${
                            isPT
                              ? "bg-orange-50/60"
                              : isPractical
                              ? "bg-purple-50/60"
                              : ""
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-gray-900 leading-tight block">
                                {subject}
                              </span>
                              {isPT && (
                                <span className="shrink-0 rounded bg-orange-100 text-orange-900 border border-orange-300 px-1 py-0.2 text-[9px] font-black">
                                  🏃 PT
                                </span>
                              )}
                              {isPractical && (
                                <span className="shrink-0 rounded bg-purple-100 text-purple-900 border border-purple-300 px-1 py-0.2 text-[9px] font-black">
                                  🔬 Lab
                                </span>
                              )}
                            </div>

                            {showTeacherName && cell?.teacherName && (
                              <div className="text-[10px] text-gray-600 truncate flex items-center gap-1">
                                <span>👨‍🏫</span>
                                <span className="truncate">{cell.teacherName}</span>
                              </div>
                            )}

                            {cell?.batchName && userRole === "teacher" && (
                              <div className="text-[9px] text-gray-500 font-medium truncate">
                                📚 {cell.batchName}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Tiffin Break Column Cell */}
                    <td className="break-column px-2 py-2.5 border-r border-amber-300 bg-amber-50/70 text-center align-middle">
                      <div className="flex flex-col items-center justify-center text-amber-900">
                        <span className="text-sm">🥪</span>
                        <span className="text-[9px] font-extrabold uppercase tracking-tight">
                          Recess
                        </span>
                        <span className="text-[9px] text-amber-700 font-mono">
                          30 Min
                        </span>
                      </div>
                    </td>

                    {/* Periods 4 to 7 */}
                    {afternoonPeriods.map((slot) => {
                      const cell = daySlots.find((c) => c.periodNumber === slot.number);
                      const subject = cell?.subject || "—";
                      const isPT = Boolean(cell?.isPT);
                      const isPractical = Boolean(cell?.isPractical);

                      return (
                        <td
                          key={slot.number}
                          className={`px-2.5 py-2.5 border-r border-gray-200 last:border-0 align-top ${
                            isPT
                              ? "bg-orange-50/60"
                              : isPractical
                              ? "bg-purple-50/60"
                              : ""
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-gray-900 leading-tight block">
                                {subject}
                              </span>
                              {isPT && (
                                <span className="shrink-0 rounded bg-orange-100 text-orange-900 border border-orange-300 px-1 py-0.2 text-[9px] font-black">
                                  🏃 PT
                                </span>
                              )}
                              {isPractical && (
                                <span className="shrink-0 rounded bg-purple-100 text-purple-900 border border-purple-300 px-1 py-0.2 text-[9px] font-black">
                                  🔬 Lab
                                </span>
                              )}
                            </div>

                            {showTeacherName && cell?.teacherName && (
                              <div className="text-[10px] text-gray-600 truncate flex items-center gap-1">
                                <span>👨‍🏫</span>
                                <span className="truncate">{cell.teacherName}</span>
                              </div>
                            )}

                            {cell?.batchName && userRole === "teacher" && (
                              <div className="text-[9px] text-gray-500 font-medium truncate">
                                📚 {cell.batchName}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 font-bold text-gray-700">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Blue Highlight: Today's Classes
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              🏃 PT: Physical Training
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              🔬 Lab: Practical Class
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              ☕ Recess: Tiffin Break (11:15–11:45 AM)
            </span>
          </div>

          <div className="font-medium text-gray-600">
            🎉 Friday & Saturday are official weekly college holidays.
          </div>
        </div>
      </div>
    </div>
  );
}
