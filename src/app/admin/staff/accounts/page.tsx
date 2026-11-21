import { getStaffList } from "@/features/staff/queries";
import StaffAccountsManager from "@/components/admin/staff/StaffAccountsManager";

export const metadata = {
  title: "Teacher Account Management | Administration",
};

export default async function Page() {
  const staff = await getStaffList();
  return <StaffAccountsManager staffList={staff} />;
}
