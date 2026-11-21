import { getStaffList, getStaffStats } from "@/features/staff/queries";
import StaffOverview from "@/components/admin/staff/StaffOverview";

export const metadata = {
  title: "Teacher & Staff Management | Administration",
};

export default async function Page() {
  const [allStaff, stats] = await Promise.all([getStaffList(), getStaffStats()]);

  return <StaffOverview stats={stats} recentStaff={allStaff} />;
}
