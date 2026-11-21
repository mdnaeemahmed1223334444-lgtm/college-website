import HeroSection from "@/components/home/HeroSection";
import NoticeTicker from "@/components/home/NoticeTicker";
import QuickLinks from "@/components/home/QuickLinks";
import HomeNotices from "@/components/home/HomeNotices";
import LatestNews from "@/components/home/LatestNews";
import GalleryPreview from "@/components/home/GalleryPreview";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <NoticeTicker />
      <HeroSection />
      <QuickLinks />
      <HomeNotices />
      <LatestNews />
      <GalleryPreview />
    </div>
  );
}
