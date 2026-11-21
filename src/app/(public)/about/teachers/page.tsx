import { getTeacherProfiles } from "@/features/staff/queries";
import FacultyDirectoryView from "@/components/shared/FacultyDirectoryView";

export const metadata = {
  title: "Faculty Members & Teaching Staff | About Us",
  description: "Explore the distinguished teaching faculty across Science, Business Studies, and Humanities.",
};

export default async function Page() {
  const teachers = await getTeacherProfiles();
  return <FacultyDirectoryView teachers={teachers} initialStream="all" />;
}
