import PlaceholderPage from "@/components/shared/PlaceholderPage";

// Teacher view of ONE student: every detail, READ-ONLY (no edit buttons).
export default async function TeacherStudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  return (
    <PlaceholderPage
      href={`/teacher/students/${studentId}`}
      title="Student Details (read-only)"
      backHref="/teacher/students"
      backLabel="Student Information"
      sections={[
        "Batch, year, group, roll, status",
        "Personal details, photo, contact, address",
        "Father / mother / guardian details",
        "Attendance records",
        "Marks, results, performance",
        "Fee / payment status",
        "Documents",
        "Transfer / group-change history",
      ]}
    />
  );
}
