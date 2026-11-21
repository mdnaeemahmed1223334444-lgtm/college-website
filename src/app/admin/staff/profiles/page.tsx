import { getTeacherProfiles } from "@/features/staff/queries";
import TeacherProfilesManager from "@/components/admin/staff/TeacherProfilesManager";

export const metadata = {
  title: "Teacher Profiles | Administration",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const teachers = await getTeacherProfiles();

  return <TeacherProfilesManager teachers={teachers} selectedId={id} />;
}
