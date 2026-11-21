import { getTeacherProfiles } from "@/features/staff/queries";
import SubjectAssignmentManager from "@/components/admin/staff/SubjectAssignmentManager";

export const metadata = {
  title: "Subject Assignment | Administration",
};

export default async function Page() {
  const teachers = await getTeacherProfiles();
  return <SubjectAssignmentManager teachers={teachers} />;
}
