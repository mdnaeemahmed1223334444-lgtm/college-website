import { getTeacherProfiles } from "@/features/staff/queries";
import DepartmentAssignmentManager from "@/components/admin/staff/DepartmentAssignmentManager";

export const metadata = {
  title: "Department Assignment | Administration",
};

export default async function Page() {
  const teachers = await getTeacherProfiles();
  return <DepartmentAssignmentManager teachers={teachers} />;
}
