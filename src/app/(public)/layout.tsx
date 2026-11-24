import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";
import ScrollController from "@/components/common/ScrollController";
import BackToTop from "@/components/common/BackToTop";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollController />
      <PublicHeader />
      <main className="min-h-[70vh]">{children}</main>
      <PublicFooter />
      <BackToTop />
    </>
  );
}
