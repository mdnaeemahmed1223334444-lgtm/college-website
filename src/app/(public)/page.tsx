import HeroSection from "@/components/home/HeroSection";
import NoticeTicker from "@/components/home/NoticeTicker";
import QuickLinks from "@/components/home/QuickLinks";
import HomeNotices from "@/components/home/HomeNotices";
import LatestNews from "@/components/home/LatestNews";
import GalleryPreview from "@/components/home/GalleryPreview";

export default function HomePage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Scrolling notice ticker */}
      <NoticeTicker />

      {/* 2. Hero section */}
      <HeroSection />

      {/* 3. Quick access shortcuts */}
      <QuickLinks />

      {/* 4. Main content: notices (wide) + news sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notices: takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <HomeNotices />
        </div>
        {/* Latest News: sidebar */}
        <div>
          <LatestNews />
        </div>
      </div>

      {/* 5. Photo gallery mosaic */}
      <GalleryPreview />
    </div>
  );
}
