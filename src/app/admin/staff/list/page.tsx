import { getStaffList } from "@/features/staff/queries";
import StaffListManager from "@/components/admin/staff/StaffListManager";

export const metadata = {
  title: "Add / Edit / Remove Staff | Administration",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; action?: string }>;
}) {
  const { edit, action } = await searchParams;
  const staff = await getStaffList();

  return (
    <StaffListManager
      initialStaff={staff}
      initialEditId={edit}
      startCreate={action === "create"}
    />
  );
}
