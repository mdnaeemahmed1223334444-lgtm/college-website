import { getTeacherProfiles } from "@/features/staff/queries";
import ClassSectionAssignmentManager from "@/components/admin/staff/ClassSectionAssignmentManager";

export const metadata = {
  title: "Class & Section Assignment | Administration",
};

export default async function Page() {
  const teachers = await getTeacherProfiles();
  return <ClassSectionAssignmentManager teachers={teachers} />;
}
