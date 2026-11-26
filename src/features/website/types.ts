export type ContentStatus = "draft" | "published" | "scheduled" | "archived";

export interface BrandingSettings {
  collegeName: string;
  shortName: string;
  motto: string;
  establishedYear: string;
  eiin: string;
  collegeCode: string;
  logoUrl: string;
  faviconUrl: string;
}

export interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerSticky: boolean;
  containerWidth: string;
}

export interface HomepageSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroSecondaryText: string;
  heroSecondaryLink: string;
  bannerImageUrl: string;
  aboutMainImageUrl?: string;
  aboutSecondaryImageUrl?: string;
  admissionCtaImageUrl?: string;
  noticeTickerSpeed: number;
  noticeTickerText: string;
}

export interface HomepageSectionsSettings {
  noticeTicker: boolean;
  heroSection: boolean;
  quickLinks: boolean;
  latestNews: boolean;
  galleryPreview: boolean;
  statistics: boolean;
  principalMessage: boolean;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl: string;
  googleAnalyticsId: string;
}

export interface FooterSettings {
  copyrightText: string;
  aboutText: string;
  address: string;
  phone: string;
  email: string;
  emergencyHelpline: string;
}

export interface SocialLinksSettings {
  facebook: string;
  youtube: string;
  twitter: string;
  linkedin: string;
  instagram: string;
  whatsapp: string;
}

export interface FeatureSettings {
  onlineAdmission: boolean;
  studentPortal: boolean;
  teacherPortal: boolean;
  resultPublishing: boolean;
  careerPortal: boolean;
  noticeBoard: boolean;
  gallery: boolean;
  onlinePayment: boolean;
}

export interface NavigationItemRecord {
  id: string;
  parent_id: string | null;
  location: "header" | "footer";
  label: string;
  href: string;
  position: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PageRecord {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: ContentStatus;
  publish_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ActionFeedback = {
  success?: boolean;
  error?: string;
  message?: string;
};
