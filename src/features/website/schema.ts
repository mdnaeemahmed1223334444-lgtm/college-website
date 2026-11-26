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
