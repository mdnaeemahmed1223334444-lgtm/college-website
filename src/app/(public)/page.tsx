import HeroSection from "@/components/home/HeroSection";
import IntroStrip from "@/components/home/IntroStrip";
import AboutSection from "@/components/home/AboutSection";
import AcademicPrograms from "@/components/home/AcademicPrograms";
import StatsCounter from "@/components/home/StatsCounter";
import HomeNotices from "@/components/home/HomeNotices";
import CampusGallery from "@/components/home/CampusGallery";
import AdmissionCTA from "@/components/home/AdmissionCTA";

export default function HomePage() {
  return (
    <div>
      {/* 1. Hero Section with Zooming Background & Action Buttons */}
      <HeroSection />

      {/* 2. Intro Strip with Values */}
      <IntroStrip />

      {/* 3. About Section with Overlapping Photos & Floating Badge */}
      <AboutSection />

      {/* 4. Academic Programs in Deep Navy with Shimmer & Icon Animations */}
      <AcademicPrograms />

      {/* 5. Statistics Counter with Eased Count-Up on Scroll */}
      <StatsCounter />

      {/* 6. Notices & Announcements with Rotating Date Blocks */}
      <HomeNotices />

      {/* 7. Campus Photo Gallery with Randomized Photos & Hover Animations */}
      <CampusGallery />

      {/* 8. Call To Action for Admission */}
      <AdmissionCTA />
    </div>
  );
}
