import { getStaffMembers } from "@/features/staff/queries";
import StaffDirectoryView from "@/components/shared/StaffDirectoryView";

export const metadata = {
  title: "Administrative & Support Staff | About Us",
  description: "Meet our dedicated administrative, laboratory, and library support team.",
};

export default async function Page() {
  const staff = await getStaffMembers();
  return <StaffDirectoryView staffMembers={staff} />;
}
