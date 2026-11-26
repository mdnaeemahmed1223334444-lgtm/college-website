import "server-only";
import { mainPublic, mainAdmin } from "@/lib/supabase/main-server";
import { publicNav } from "@/config/navigation/public";
import type {
  BrandingSettings,
  AppearanceSettings,
  HomepageSettings,
  HomepageSectionsSettings,
  SeoSettings,
  FooterSettings,
  SocialLinksSettings,
  FeatureSettings,
  NavigationItemRecord,
  PageRecord,
  ScrollExpandHeroSettings,
} from "./types";

export const defaultBranding: BrandingSettings = {
  collegeName: "Dhaka Model College",
  shortName: "DMC",
  motto: "Excellence in Education, Character, and Innovation",
  establishedYear: "1998",
  eiin: "134250",
  collegeCode: "1082",
  logoUrl: "",
  faviconUrl: "",
};

export const defaultAppearance: AppearanceSettings = {
  primaryColor: "#1e40af",
  secondaryColor: "#0f766e",
  accentColor: "#f59e0b",
  fontFamily: "Inter, sans-serif",
  headerSticky: true,
  containerWidth: "max-w-7xl",
};

export const defaultHomepage: HomepageSettings = {
  heroTitle: "Empowering Future Leaders with Knowledge & Integrity",
  heroSubtitle:
    "A distinguished institution committed to academic brilliance, moral virtues, and modern technology-driven learning.",
  heroCtaText: "Online Admission",
  heroCtaLink: "/admission/apply",
  heroSecondaryText: "Explore Programs",
  heroSecondaryLink: "/academic/courses",
  bannerImageUrl: "",
  aboutMainImageUrl: "",
  aboutSecondaryImageUrl: "",
  admissionCtaImageUrl: "",
  noticeTickerSpeed: 25,
  noticeTickerText:
    "Admissions for HSC Academic Session 2026-2027 are now open! | Pre-board exam schedule published. | Annual sports meet begins next Monday.",
};

export const defaultHomepageSections: HomepageSectionsSettings = {
  noticeTicker: true,
  heroSection: true,
  quickLinks: true,
  latestNews: true,
  galleryPreview: true,
  statistics: true,
  principalMessage: true,
};

export const defaultSeo: SeoSettings = {
  metaTitle: "Dhaka Model College - Leading Higher Secondary College",
  metaDescription:
    "Official portal of Dhaka Model College. Offering Science, Business Studies, and Humanities streams with state-of-the-art facilities and experienced faculty.",
  keywords: "college, education, HSC, science, commerce, humanities, admission, Dhaka",
  ogImageUrl: "",
  googleAnalyticsId: "",
};

export const defaultFooter: FooterSettings = {
  copyrightText: "© 2026 Dhaka Model College. All rights reserved.",
  aboutText:
    "Dhaka Model College is a premier educational institution providing quality education and nurturing well-rounded graduates for over two decades.",
  address: "Mirpur-12, Dhaka-1216, Bangladesh",
  phone: "+880 2-9012345, +880 1712-345678",
  email: "info@dhakamodelcollege.edu.bd",
  emergencyHelpline: "+880 1700-000000",
};

export const defaultSocialLinks: SocialLinksSettings = {
  facebook: "https://facebook.com/dhakamodelcollege",
  youtube: "https://youtube.com/@dhakamodelcollege",
  twitter: "https://twitter.com/dhakamodelcoll",
  linkedin: "https://linkedin.com/school/dhakamodelcollege",
  instagram: "https://instagram.com/dhakamodelcollege",
  whatsapp: "+8801712345678",
};

export const defaultFeatures: FeatureSettings = {
  onlineAdmission: true,
  studentPortal: true,
  teacherPortal: true,
  resultPublishing: true,
  careerPortal: false,
  noticeBoard: true,
  gallery: true,
  onlinePayment: false,
};

export const defaultScrollExpandHero: ScrollExpandHeroSettings = {
  enabled: true,
  heroImage: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=90",
  heroTitle: "Where Minds Meet Possibilities",
  heroSubtitle: "Building knowledge, character, and a brighter future through academic excellence and modern innovation.",
  scrollHint: "Scroll to explore",
  ctaText: "Discover Admission ↗",
  ctaLink: "/admission/apply",
  secondaryCtaText: "Explore Academics",
  secondaryCtaLink: "/academic/courses",
  startWidth: 42,
  startHeight: 58,
  startRadius: 24,
  endRadius: 0,
  mediaZoom: 1.35,
  scrollDistance: 1.2,
  holdDistance: 0.35,
  smoothing: 0.1,
  overlayScrim: 0.45,
};

export const defaultPages: Record<string, PageRecord> = {
  "about/overview": {
    id: "def-about-overview",
    slug: "about/overview",
    title: "College Overview",
    content: `
      <h2>Welcome to Dhaka Model College</h2>
      <p>Established with the vision of providing high-quality, inclusive education, Dhaka Model College has grown into one of the country's leading higher secondary institutions. Our campus offers world-class classrooms, science labs, a rich digital library, and vibrant extracurricular facilities.</p>
      <h3>Our Heritage & Growth</h3>
      <p>Founded in 1998, we have graduated over 20,000 students who now serve across academia, healthcare, civil service, business, and technology across Bangladesh and abroad.</p>
      <h3>Academic Disciplines</h3>
      <p>We offer intermediate programs across three academic streams: Science, Business Studies, and Humanities, guided by an exceptional faculty body dedicated to student mentorship.</p>
    `,
    status: "published",
    publish_at: null,
    seo_title: "About Us - Dhaka Model College",
    seo_description: "Learn about Dhaka Model College history, campus, and educational philosophy.",
  },
  "about/principals-message": {
    id: "def-about-principal",
    slug: "about/principals-message",
    title: "Principal's Message",
    content: `
      <h2>A Message from the Principal</h2>
      <p>Dear Students, Parents, and Well-Wishers,</p>
      <p>It is my distinct privilege to welcome you to Dhaka Model College. In an era of rapid global transformation, education must go beyond rote textbook knowledge. Our primary mission is to cultivate critical thinking, intellectual curiosity, and high moral character in every student entrusted to our care.</p>
      <p>We foster a collaborative academic atmosphere where each learner is encouraged to pursue intellectual curiosity and personal excellence.</p>
      <p><strong>Prof. Mohammad Rahman</strong><br/>Principal, Dhaka Model College</p>
    `,
    status: "published",
    publish_at: null,
    seo_title: "Principal's Message - Dhaka Model College",
    seo_description: "Read the welcoming message and academic vision from the Principal.",
  },
  "about/mission-vision": {
    id: "def-about-mission",
    slug: "about/mission-vision",
    title: "Mission & Vision",
    content: `
      <h2>Our Vision</h2>
      <p>To be a premier center of academic excellence that fosters creative thinking, ethical leadership, and responsible citizenship.</p>
      <h2>Our Mission</h2>
      <ul class="list-disc pl-5 space-y-2">
        <li>Provide rigorous, holistic education in Science, Business Studies, and Humanities.</li>
        <li>Cultivate analytical reasoning and innovative problem-solving abilities.</li>
        <li>Instill strong ethical values, discipline, and respect for societal welfare.</li>
        <li>Equip students with modern technological competencies for university and life.</li>
      </ul>
    `,
    status: "published",
    publish_at: null,
    seo_title: "Mission & Vision - Dhaka Model College",
    seo_description: "Discover the core mission, vision, and core educational values of Dhaka Model College.",
  },
  "about/history": {
    id: "def-about-history",
    slug: "about/history",
    title: "College History",
    content: `
      <h2>Our Journey Since 1998</h2>
      <p>Dhaka Model College was established in 1998 by a consortium of visionary educationists who recognized the critical need for an institution offering disciplined, rigorous secondary and higher secondary education in Dhaka.</p>
      <p>Starting with just 150 students and 12 faculty members in a modest building, the college has steadily expanded its infrastructure to a multi-story modern campus with state-of-the-art laboratories and digital multimedia classrooms.</p>
    `,
    status: "published",
    publish_at: null,
    seo_title: "College History - Dhaka Model College",
    seo_description: "The history and milestones of Dhaka Model College from 1998 to present day.",
  },
  "about/management-committee": {
    id: "def-about-committee",
    slug: "about/management-committee",
    title: "Management Committee",
    content: `
      <h2>Governing Body</h2>
      <p>The college operates under the governance of a distinguished Management Committee comprising renowned academics, legal experts, government representatives, and guardian delegates dedicated to institutional excellence.</p>
      <ul class="list-disc pl-5 space-y-2">
        <li><strong>Chairman:</strong> Dr. Kazi Anisur Rahman (Former Professor, University of Dhaka)</li>
        <li><strong>Member Secretary:</strong> Principal Mohammad Rahman</li>
        <li><strong>Teacher Representative:</strong> Associate Prof. Nasir Uddin</li>
        <li><strong>Guardian Representatives:</strong> Engr. Tariqul Islam, Mrs. Farhana Yasmin</li>
      </ul>
    `,
    status: "published",
    publish_at: null,
    seo_title: "Management Committee - Dhaka Model College",
    seo_description: "Governing body and leadership committee members of the college.",
  },
  "academic/regulations": {
    id: "def-academic-regulations",
    slug: "academic/regulations",
    title: "Rules & Regulations",
    content: `
      <h2>Academic Code of Conduct</h2>
      <p>Students must adhere to the highest standards of personal integrity, discipline, and respect for college staff and peers.</p>
      <h3>Attendance Requirements</h3>
      <p>A minimum of 75% attendance in theory and practical sessions is strictly required to qualify for Board examinations.</p>
      <h3>Campus Discipline</h3>
      <ul class="list-disc pl-5 space-y-2">
        <li>ID cards must be worn visibly at all times within college premises.</li>
        <li>Strict adherence to the college dress code is mandatory.</li>
        <li>Use of mobile phones during classroom lectures and laboratory sessions is strictly prohibited.</li>
        <li>Zero tolerance policy for ragging, bullying, or vandalism.</li>
      </ul>
    `,
    status: "published",
    publish_at: null,
    seo_title: "Rules & Regulations - Dhaka Model College",
    seo_description: "College rules, student code of conduct, and attendance policies.",
  },
  "academic/dress-code": {
    id: "def-academic-dresscode",
    slug: "academic/dress-code",
    title: "Student Dress Code & Uniform",
    content: `
      <h2>Student Uniform Regulations</h2>
      <p>Wearing the prescribed college uniform promotes equality, pride, and discipline among students. All students must wear the designated uniform from their first day of classes.</p>
      <h3>Male Students</h3>
      <p>White full/half-sleeve formal shirt with college crest embroidered on the chest pocket, navy blue trousers, black belt, and black formal shoes with white socks.</p>
      <h3>Female Students</h3>
      <p>White salwar-kameez with navy blue dupatta, or navy blue blazer/cardigan in winter. Black flat shoes with white socks.</p>
    `,
    status: "published",
    publish_at: null,
    seo_title: "Uniform & Dress Code - Dhaka Model College",
    seo_description: "Official student dress code, uniform guidelines, and winter wear regulations.",
  },
  "academic/parent-guidelines": {
    id: "def-academic-parentguide",
    slug: "academic/parent-guidelines",
    title: "Guidelines for Parents & Guardians",
    content: `
      <h2>Parent-College Partnership</h2>
      <p>We believe that academic success is achieved through strong cooperation between guardians and the college administration.</p>
      <ul class="list-disc pl-5 space-y-2">
        <li>Monitor your ward's daily attendance and exam marks through the Student Portal.</li>
        <li>Attend all scheduled Parent-Teacher Meetings (PTMs) each term.</li>
        <li>Ensure that your child adheres to college timings and the uniform code.</li>
        <li>Contact the academic counselor or batch coordinator if your child requires academic support.</li>
      </ul>
    `,
    status: "published",
    publish_at: null,
    seo_title: "Parent Guidelines - Dhaka Model College",
    seo_description: "Guidelines and recommendations for parents and guardians.",
  },
  "academic/co-curricular": {
    id: "def-academic-cocurricular",
    slug: "academic/co-curricular",
    title: "Co-Curricular Activities",
    content: `
      <h2>Clubs & Student Societies</h2>
      <p>Extracurricular engagement builds leadership, team spirit, and creative expression. Dhaka Model College hosts a vibrant variety of student clubs:</p>
      <ul class="list-disc pl-5 space-y-2">
        <li><strong>Science & Robotics Club:</strong> Annual science fair, coding hackathons, project exhibitions.</li>
        <li><strong>Debate & Public Speaking Society:</strong> Bangla & English parliamentary debate tournaments.</li>
        <li><strong>Cultural Club:</strong> Music, drama, recitation, and national day observances.</li>
        <li><strong>Sports Club:</strong> Football, cricket, badminton, and annual athletics meet.</li>
        <li><strong>BNCC & Rover Scouts:</strong> Leadership training and community service.</li>
      </ul>
    `,
    status: "published",
    publish_at: null,
    seo_title: "Co-Curricular Activities - Dhaka Model College",
    seo_description: "Clubs, sports, debate, cultural societies, and BNCC activities.",
  },
};

/** Fetch setting from DB with fallback */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const supabase = mainPublic();
  if (!supabase) return fallback;

  try {
    const { data, error } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
    if (error || !data || !data.value) return fallback;
    return { ...fallback, ...(data.value as Partial<T>) };
  } catch {
    return fallback;
  }
}

export async function getBrandingSettings(): Promise<BrandingSettings> {
  return getSetting<BrandingSettings>("branding", defaultBranding);
}

export async function getAppearanceSettings(): Promise<AppearanceSettings> {
  return getSetting<AppearanceSettings>("appearance", defaultAppearance);
}

export async function getHomepageSettings(): Promise<HomepageSettings> {
  return getSetting<HomepageSettings>("homepage", defaultHomepage);
}

export async function getHomepageSectionsSettings(): Promise<HomepageSectionsSettings> {
  return getSetting<HomepageSectionsSettings>("homepage_sections", defaultHomepageSections);
}

export async function getSeoSettings(): Promise<SeoSettings> {
  return getSetting<SeoSettings>("seo", defaultSeo);
}

export async function getFooterSettings(): Promise<FooterSettings> {
  return getSetting<FooterSettings>("footer", defaultFooter);
}

export async function getSocialLinksSettings(): Promise<SocialLinksSettings> {
  return getSetting<SocialLinksSettings>("social_links", defaultSocialLinks);
}

export async function getFeatureSettings(): Promise<FeatureSettings> {
  return getSetting<FeatureSettings>("features", defaultFeatures);
}

export async function getScrollExpandHeroSettings(): Promise<ScrollExpandHeroSettings> {
  return getSetting<ScrollExpandHeroSettings>("scroll_expand_hero", defaultScrollExpandHero);
}

/** Fetch all navigation items (with fallback to publicNav) */
export async function getNavigationItems(location: "header" | "footer" = "header"): Promise<NavigationItemRecord[]> {
  const supabase = mainPublic();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("navigation_items")
        .select("*")
        .eq("location", location)
        .order("position", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as NavigationItemRecord[];
      }
    } catch {
      // fallback
    }
  }

  // Generate fallback items from publicNav
  return publicNav
    .filter((n) => !n.hidden)
    .map((item, index) => ({
      id: `nav-${index}`,
      parent_id: null,
      location,
      label: item.title,
      href: item.href,
      position: index,
      is_visible: true,
    }));
}

/** Fetch all pages from DB with fallback defaults */
export async function getAllPages(): Promise<PageRecord[]> {
  const supabase = mainAdmin() || mainPublic();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("slug", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as PageRecord[];
      }
    } catch {
      // fallback
    }
  }

  return Object.values(defaultPages);
}

/** Fetch a single page by slug (public view checks published status; admin gets draft too) */
export async function getPageBySlug(slug: string, allowDraft = false): Promise<PageRecord | null> {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
  const supabase = allowDraft ? mainAdmin() : mainPublic();

  if (supabase) {
    try {
      let query = supabase.from("pages").select("*").eq("slug", cleanSlug);
      if (!allowDraft) {
        query = query.eq("status", "published");
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return data as PageRecord;
      }
    } catch {
      // fallback
    }
  }

  const fallback = defaultPages[cleanSlug];
  if (fallback) {
    if (!allowDraft && fallback.status !== "published") return null;
    return fallback;
  }

  return null;
}
