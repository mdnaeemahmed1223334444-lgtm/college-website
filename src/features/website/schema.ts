import { z } from "zod";

const safeString = (defaultVal = "") =>
  z
    .preprocess((val) => (val === null || val === undefined ? defaultVal : String(val)), z.string().trim())
    .default(defaultVal);

export const brandingSchema = z.object({
  collegeName: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().trim().min(1, "College name is required")
  ),
  shortName: safeString(""),
  motto: safeString(""),
  establishedYear: safeString(""),
  eiin: safeString(""),
  collegeCode: safeString(""),
  logoUrl: safeString(""),
  faviconUrl: safeString(""),
});

export const appearanceSchema = z.object({
  primaryColor: safeString("#1e40af"),
  secondaryColor: safeString("#0f766e"),
  accentColor: safeString("#f59e0b"),
  fontFamily: safeString("Inter, sans-serif"),
  headerSticky: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
  containerWidth: safeString("max-w-7xl"),
});

export const homepageSchema = z.object({
  heroTitle: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().trim().min(1, "Hero title is required")
  ),
  heroSubtitle: safeString(""),
  heroCtaText: safeString(""),
  heroCtaLink: safeString(""),
  heroSecondaryText: safeString(""),
  heroSecondaryLink: safeString(""),
  bannerImageUrl: safeString(""),
  aboutMainImageUrl: safeString(""),
  aboutSecondaryImageUrl: safeString(""),
  admissionCtaImageUrl: safeString(""),
  noticeTickerSpeed: z.preprocess((val) => (val ? Number(val) : 25), z.number()).default(25),
  noticeTickerText: safeString(""),
});

export const homepageSectionsSchema = z.object({
  noticeTicker: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
  heroSection: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
  quickLinks: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
  latestNews: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
  galleryPreview: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
  statistics: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
  principalMessage: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
});

export const seoSchema = z.object({
  metaTitle: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().trim().min(1, "Meta title is required")
  ),
  metaDescription: safeString(""),
  keywords: safeString(""),
  ogImageUrl: safeString(""),
  googleAnalyticsId: safeString(""),
});

export const footerSchema = z.object({
  copyrightText: safeString(""),
  aboutText: safeString(""),
  address: safeString(""),
  phone: safeString(""),
  email: safeString(""),
  emergencyHelpline: safeString(""),
});

export const socialLinksSchema = z.object({
  facebook: safeString(""),
  youtube: safeString(""),
  twitter: safeString(""),
  linkedin: safeString(""),
  instagram: safeString(""),
  whatsapp: safeString(""),
});

export const featuresSchema = z.object({
  onlineAdmission: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
  studentPortal: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
  teacherPortal: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
  resultPublishing: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
  careerPortal: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(false),
  noticeBoard: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
  gallery: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
  onlinePayment: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(false),
});

export const navigationItemSchema = z.object({
  id: z.string().uuid().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  location: z.enum(["header", "footer"]).default("header"),
  label: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().trim().min(1, "Label is required")
  ),
  href: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().trim().min(1, "Link URL is required")
  ),
  position: z.preprocess((val) => (val ? Number(val) : 0), z.number()).default(0),
  is_visible: z.preprocess((val) => val === true || val === "true" || val === "on", z.boolean()).default(true),
});

export const pageSchema = z.object({
  id: z.string().uuid().optional(),
  slug: safeString(""),
  title: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().trim().min(1, "Title is required")
  ),
  content: safeString(""),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
  publish_at: z.string().nullable().optional(),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
});

export const scrollExpandHeroSchema = z.object({
  enabled: z.preprocess((val) => val === true || val === "true" || val === "on" || val === 1 || val === "1", z.boolean()).default(true),
  heroImage: safeString(""),
  heroTitle: safeString("Where Minds Meet Possibilities"),
  heroSubtitle: safeString("Building knowledge, character, and a brighter future through academic excellence and modern innovation."),
  scrollHint: safeString("Scroll to explore"),
  ctaText: safeString("Discover Admission ↗"),
  ctaLink: safeString("/admission/apply"),
  secondaryCtaText: safeString("Explore Academics"),
  secondaryCtaLink: safeString("/academic/courses"),
  startWidth: z.preprocess((val) => (val !== "" && val !== null && val !== undefined ? Number(val) : 42), z.number().min(10).max(100)).default(42),
  startHeight: z.preprocess((val) => (val !== "" && val !== null && val !== undefined ? Number(val) : 58), z.number().min(10).max(100)).default(58),
  startRadius: z.preprocess((val) => (val !== "" && val !== null && val !== undefined ? Number(val) : 24), z.number().min(0).max(100)).default(24),
  endRadius: z.preprocess((val) => (val !== "" && val !== null && val !== undefined ? Number(val) : 0), z.number().min(0).max(100)).default(0),
  mediaZoom: z.preprocess((val) => (val !== "" && val !== null && val !== undefined ? Number(val) : 1.35), z.number().min(1.0).max(3.0)).default(1.35),
  scrollDistance: z.preprocess((val) => (val !== "" && val !== null && val !== undefined ? Number(val) : 1.2), z.number().min(0.2).max(5.0)).default(1.2),
  holdDistance: z.preprocess((val) => (val !== "" && val !== null && val !== undefined ? Number(val) : 0.35), z.number().min(0.0).max(2.0)).default(0.35),
  smoothing: z.preprocess((val) => (val !== "" && val !== null && val !== undefined ? Number(val) : 0.1), z.number().min(0.0).max(1.0)).default(0.1),
  overlayScrim: z.preprocess((val) => (val !== "" && val !== null && val !== undefined ? Number(val) : 0.45), z.number().min(0.0).max(1.0)).default(0.45),
});
