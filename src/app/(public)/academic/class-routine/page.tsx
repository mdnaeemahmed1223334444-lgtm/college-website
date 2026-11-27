import { privateAdmin } from "@/lib/supabase/private-server";
import { getDhakaDate, formatDhakaDayOfWeek } from "@/lib/utils/datetime";
import TeacherRoutineViewer from "@/components/teacher/TeacherRoutineViewer";

export const metadata = {
  title: "Class Routine | Haji Rahmatullah Model Degree College",
  description: "Official 7-period academic class routine for Science, Business Studies, and Humanities groups.",
};

export default async function PublicClassRoutinePage() {
  const supabase = privateAdmin();
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
    <div className="mx-auto max-w-6xl space-y-6 py-6 px-4">
      <div className="no-print text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Academic Class Routine
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Official 7-period daily timetable with Recess / Tiffin break (11:15 AM – 11:45 AM).
        </p>
      </div>

      <TeacherRoutineViewer
        todayName={todayName}
        dbRoutines={dbRoutines}
        batches={batches}
        currentUserFullName="Academic Affairs"
      />
    </div>
  );
}
