import { privateAdmin } from "@/lib/supabase/private-server";
import ClassRoutineManager from "@/components/admin/academic/ClassRoutineManager";
import type { ClassRoutineRecord } from "@/features/academic/types";

export const metadata = {
  title: "Class Routines | Admin",
};

export default async function ClassRoutinesPage() {
  const supabase = privateAdmin();

  let routines: ClassRoutineRecord[] = [];
  let batches: { id: string; name: string }[] = [];

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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Class Routines</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage weekly timetables for each batch and study group. Click <strong>"Publish to Students"</strong> to make the routine visible in the student portal.
        </p>
      </div>

      {/* SQL hint for first-time setup */}
      {routines.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 space-y-1">
          <p className="font-bold">⚠️ Class routines table may need schema update</p>
          <p>If adding a period fails, run this SQL in your Supabase SQL editor:</p>
          <pre className="bg-white/60 rounded p-2 mt-1 font-mono text-[11px] overflow-x-auto">{`ALTER TABLE class_routines ADD COLUMN IF NOT EXISTS is_physical_training BOOLEAN DEFAULT false;
ALTER TABLE class_routines ADD COLUMN IF NOT EXISTS room_number TEXT;
ALTER TABLE class_routines ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE class_routines ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE class_routines ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;`}</pre>
        </div>
      )}

      <ClassRoutineManager initialRecords={routines} batches={batches} />
    </div>
  );
}
