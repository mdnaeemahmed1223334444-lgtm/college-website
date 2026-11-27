"use client";

import React, { useState } from "react";
import UnifiedRoutineTable, {
  type RoutineCellData,
} from "@/components/routine/UnifiedRoutineTable";
import {
  DEFAULT_PERIODS,
  TIFFIN_BREAK,
  COLLEGE_DAYS,
  DEFAULT_ROUTINES_BY_GROUP,
} from "@/features/academic/routine-defaults";

interface TeacherRoutineViewerProps {
  todayName: string;
  dbRoutines: any[];
  batches: Array<{ id: string; name: string }>;
  currentUserFullName?: string;
}

export default function TeacherRoutineViewer({
  todayName,
  dbRoutines,
  batches,
  currentUserFullName,
}: TeacherRoutineViewerProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("science");

  const batchMap = new Map(batches.map((b) => [b.id, b.name]));

  const groups = [
    { id: "science", label: "Science Group" },
    { id: "business_studies", label: "Business Studies" },
    { id: "humanities", label: "Humanities Group" },
  ];

  // Build grid for selected group
  const defaultRoutine =
    DEFAULT_ROUTINES_BY_GROUP[selectedGroup] || DEFAULT_ROUTINES_BY_GROUP.science;

  const hasDbForGroup = dbRoutines.some(
    (r) => !r.study_group || r.study_group === selectedGroup
  );

  const gridByDay: Record<string, RoutineCellData[]> = {};

  for (const day of COLLEGE_DAYS) {
    gridByDay[day] = DEFAULT_PERIODS.map((slot) => {
      if (hasDbForGroup) {
        const match = dbRoutines.find(
          (r) =>
            r.day_of_week === day &&
            (!r.study_group || r.study_group === selectedGroup) &&
            (r.sort_order === slot.number ||
              r.start_time?.slice(0, 5) === slot.defaultStart ||
              r.start_time?.slice(0, 2) === slot.defaultStart.slice(0, 2))
        );

        if (match) {
          const subLower = (match.subject || "").toLowerCase();
          const isPT = Boolean(
            match.is_physical_training ||
              subLower.includes("physical training") ||
              subLower.includes("(pt)")
          );
          const isPractical = Boolean(
            match.is_practical || subLower.includes("practical")
          );

          return {
            periodNumber: slot.number,
            startTime: match.start_time?.slice(0, 5) || slot.defaultStart,
            endTime: match.end_time?.slice(0, 5) || slot.defaultEnd,
            subject: match.subject || "",
            teacherName: match.teacher_name || "",
            isPT,
            isPractical,
            batchName: batchMap.get(match.batch_id) || undefined,
            studyGroup: match.study_group || selectedGroup,
          };
        }
      }

      // Default slot
      const defSub = defaultRoutine[day]?.[slot.number - 1] || "";
      const subLower = defSub.toLowerCase();
      const isPT = subLower.includes("physical training") || subLower.includes("(pt)");
      const isPractical = subLower.includes("practical");

      return {
        periodNumber: slot.number,
        startTime: slot.defaultStart,
        endTime: slot.defaultEnd,
        subject: defSub,
        teacherName: "",
        isPT,
        isPractical,
        studyGroup: selectedGroup,
      };
    });
  }

  const groupLabel = groups.find((g) => g.id === selectedGroup)?.label || selectedGroup;

  return (
    <div className="space-y-4">
      <UnifiedRoutineTable
        title={`Faculty Academic Routine — ${groupLabel}`}
        subtitle={`Master 7-Period Timetable with Tiffin Break • Faculty: ${currentUserFullName || "Faculty Member"}`}
        todayName={todayName}
        periods={DEFAULT_PERIODS}
        tiffinBreak={TIFFIN_BREAK}
        collegeDays={COLLEGE_DAYS}
        gridByDay={gridByDay}
        availableGroups={groups}
        selectedGroup={selectedGroup}
        onGroupChange={(g) => setSelectedGroup(g)}
        showTeacherName={true}
        userRole="teacher"
      />
    </div>
  );
}
