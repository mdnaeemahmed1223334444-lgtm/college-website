import { redirect } from "next/navigation";

export default async function RedirectNoticeBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  if (category) {
    redirect(`/notices?category=${encodeURIComponent(category)}`);
  }
  redirect("/notices");
}
