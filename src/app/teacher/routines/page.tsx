import { privateAdmin } from "@/lib/supabase/private-server";
import { getDhakaDate, formatDhakaDayOfWeek } from "@/lib/utils/datetime";
import { getCurrentUser } from "@/lib/auth/current-user";
import TeacherRoutineViewer from "@/components/teacher/TeacherRoutineViewer";

export const metadata = {
  title: "Class Routines | Teacher Portal",
};

export default async function TeacherRoutinesPage() {
  const [currentUser, supabase] = await Promise.all([
    getCurrentUser(),
    Promise.resolve(privateAdmin()),
  ]);

  const todayName = formatDhakaDayOfWeek(getDhakaDate());

  let dbRoutines: any[] = [];
  let batches: any[] = [];

  if (supabase) {
    try {
      const [rRes, bRes] = await Promise.all([
        supabase
          .from("class_routines")
          .select("*")
          .eq("is_published", true)
          .order("day_of_week")
          .order("start_time"),
        supabase.from("batches").select("id, name"),
      ]);
      dbRoutines = rRes.data || [];
      batches = bRes.data || [];
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="no-print">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Academic Class Routines
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Master 7-period timetable across academic groups with official Tiffin break (11:15–11:45 AM).
        </p>
      </div>

      <TeacherRoutineViewer
        todayName={todayName}
        dbRoutines={dbRoutines}
        batches={batches}
        currentUserFullName={currentUser?.fullName}
      />
    </div>
  );
}
