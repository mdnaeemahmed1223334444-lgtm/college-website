import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto min-h-[60vh] max-w-7xl px-4 py-8">{children}</main>
      <PublicFooter />
    </>
  );
}
