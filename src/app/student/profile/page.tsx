import { requireRole } from "@/lib/auth/current-user";
import { getStudentProfile } from "@/features/profile/queries";
import StudentProfileView from "@/components/student/StudentProfileView";

export const metadata = {
  title: "My Profile - Student Portal",
  description: "View academic status, identity details, and update contact information.",
};

export default async function StudentProfilePage() {
  const user = await requireRole(["student"]);
  const profile = await getStudentProfile(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Student Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your enrolled batch, academic details, and personal information.
        </p>
      </div>

      <StudentProfileView profile={profile} />
    </div>
  );
}
