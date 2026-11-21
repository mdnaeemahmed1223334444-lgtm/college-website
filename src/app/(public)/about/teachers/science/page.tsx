import { getTeacherProfiles } from "@/features/staff/queries";
import FacultyDirectoryView from "@/components/shared/FacultyDirectoryView";

export const metadata = {
  title: "Science Faculty | About Us",
  description: "Meet the Physics, Chemistry, Mathematics, Biology, and ICT faculty.",
};

export default async function Page() {
  const teachers = await getTeacherProfiles();
  return <FacultyDirectoryView teachers={teachers} initialStream="science" />;
}
