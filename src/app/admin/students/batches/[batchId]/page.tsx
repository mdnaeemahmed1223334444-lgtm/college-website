import PlaceholderPage from "@/components/shared/PlaceholderPage";

// One batch (e.g. HSC Batch 26): its status and its students.
export default async function AdminBatchDetailPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  return (
    <PlaceholderPage
      href={`/admin/students/batches/${batchId}`}
      title="Batch Details"
      backHref="/admin/students/batches"
      backLabel="Batches"
      sections={[
        "Change status: Running / Passed",
        "If running: change year 1st Year / 2nd Year",
        "Students split by Science / Business Studies / Humanities",
        "Add student to this batch",
        "Transfer students out / in",
      ]}
    />
  );
}
