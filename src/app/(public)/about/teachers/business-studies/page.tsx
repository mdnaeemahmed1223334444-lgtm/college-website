import { getTeacherProfiles } from "@/features/staff/queries";
import FacultyDirectoryView from "@/components/shared/FacultyDirectoryView";

export const metadata = {
  title: "Business Studies Faculty | About Us",
  description: "Meet our Accounting, Management, and Finance faculty members.",
};

export default async function Page() {
  const teachers = await getTeacherProfiles();
  return <FacultyDirectoryView teachers={teachers} initialStream="business-studies" />;
}
