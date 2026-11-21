import { getTeacherProfiles } from "@/features/staff/queries";
import TeacherWorkloadManager from "@/components/admin/staff/TeacherWorkloadManager";

export const metadata = {
  title: "Teacher Workload | Administration",
};

export default async function Page() {
  const teachers = await getTeacherProfiles();
  return <TeacherWorkloadManager teachers={teachers} />;
}
