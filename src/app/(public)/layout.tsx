import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";
import ScrollController from "@/components/common/ScrollController";
import BackToTop from "@/components/common/BackToTop";
import { getBrandingSettings } from "@/features/website/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const branding = await getBrandingSettings();

  return (
    <>
      <ScrollController />
      <PublicHeader branding={branding} />
      <main className="min-h-[70vh]">{children}</main>
      <PublicFooter branding={branding} />
      <BackToTop />
    </>
  );
}
