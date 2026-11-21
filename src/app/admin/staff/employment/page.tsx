import { getStaffList } from "@/features/staff/queries";
import EmploymentRecordsManager from "@/components/admin/staff/EmploymentRecordsManager";

export const metadata = {
  title: "Employment Records | Administration",
};

export default async function Page() {
  const staff = await getStaffList();
  return <EmploymentRecordsManager staffList={staff} />;
}
