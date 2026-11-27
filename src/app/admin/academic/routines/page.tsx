import { privateAdmin } from "@/lib/supabase/private-server";
import ClassRoutineManager from "@/components/admin/academic/ClassRoutineManager";
import type { ClassRoutineRecord } from "@/features/academic/types";
import { getTeacherProfiles } from "@/features/staff/queries";

export const metadata = {
  title: "Class Routines | Admin",
};

export default async function ClassRoutinesPage() {
  const supabase = privateAdmin();

  let routines: ClassRoutineRecord[] = [];
  let batches: { id: string; name: string }[] = [];
  const teachers = await getTeacherProfiles();

  if (supabase) {
    try {
      const [routineRes, batchRes] = await Promise.all([
        supabase
          .from("class_routines")
          .select("*")
          .order("day_of_week")
          .order("start_time"),
        supabase
          .from("batches")
          .select("id, name")
          .eq("status", "running")
          .order("name"),
      ]);
      routines = (routineRes.data || []) as ClassRoutineRecord[];
      batches = (batchRes.data || []) as { id: string; name: string }[];
    } catch {
      // Tables may not exist yet
    }
  }

  // Provide a default batch if none
  if (batches.length === 0) {
    batches = [{ id: "default", name: "Default Batch" }];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">7-Period Class Routines</h1>
        <p className="text-sm text-gray-500 mt-1">
          Master weekly 7-period timetable for Science, Business Studies, and Humanities. Timetables are automatically connected to the RFID gate attendance system.
        </p>
      </div>

      <ClassRoutineManager initialRecords={routines} batches={batches} teachers={teachers} />
    </div>
  );
}
