import { requireRole } from "@/lib/auth/current-user";
import { getTeacherProfile } from "@/features/profile/queries";
import TeacherProfileView from "@/components/teacher/TeacherProfileView";

export const metadata = {
  title: "My Profile - Faculty Portal",
  description: "View teacher credentials, teaching schedule, and update profile details.",
};

export default async function TeacherProfilePage() {
  const user = await requireRole(["teacher"]);
  const profile = await getTeacherProfile(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Faculty Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your designation, teaching assignments, and contact details.
        </p>
      </div>

      <TeacherProfileView profile={profile} />
    </div>
  );
}
