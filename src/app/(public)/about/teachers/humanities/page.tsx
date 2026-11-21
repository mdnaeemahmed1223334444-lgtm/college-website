import { getTeacherProfiles } from "@/features/staff/queries";
import FacultyDirectoryView from "@/components/shared/FacultyDirectoryView";

export const metadata = {
  title: "Humanities Faculty | About Us",
  description: "Meet our Bangla, English, Economics, Civics, and History faculty.",
};

export default async function Page() {
  const teachers = await getTeacherProfiles();
  return <FacultyDirectoryView teachers={teachers} initialStream="humanities" />;
}
