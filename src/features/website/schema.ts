import { z } from "zod";

export const brandingSchema = z.object({
  collegeName: z.string().trim().min(1, "College name is required"),
  shortName: z.string().trim().default(""),
  motto: z.string().trim().default(""),
  establishedYear: z.string().trim().default(""),
  eiin: z.string().trim().default(""),
  collegeCode: z.string().trim().default(""),
  logoUrl: z.string().trim().default(""),
  faviconUrl: z.string().trim().default(""),
});

export const appearanceSchema = z.object({
  primaryColor: z.string().trim().default("#1e40af"),
  secondaryColor: z.string().trim().default("#0f766e"),
  accentColor: z.string().trim().default("#f59e0b"),
  fontFamily: z.string().trim().default("Inter, sans-serif"),
  headerSticky: z.boolean().default(true),
  containerWidth: z.string().trim().default("max-w-7xl"),
});

export const homepageSchema = z.object({
  heroTitle: z.string().trim().min(1, "Hero title is required"),
  heroSubtitle: z.string().trim().default(""),
  heroCtaText: z.string().trim().default(""),
  heroCtaLink: z.string().trim().default(""),
  heroSecondaryText: z.string().trim().default(""),
  heroSecondaryLink: z.string().trim().default(""),
  bannerImageUrl: z.string().trim().default(""),
  noticeTickerSpeed: z.coerce.number().default(25),
  noticeTickerText: z.string().trim().default(""),
});

export const homepageSectionsSchema = z.object({
  noticeTicker: z.boolean().default(true),
  heroSection: z.boolean().default(true),
  quickLinks: z.boolean().default(true),
  latestNews: z.boolean().default(true),
  galleryPreview: z.boolean().default(true),
  statistics: z.boolean().default(true),
  principalMessage: z.boolean().default(true),
});

export const seoSchema = z.object({
  metaTitle: z.string().trim().min(1, "Meta title is required"),
  metaDescription: z.string().trim().default(""),
  keywords: z.string().trim().default(""),
  ogImageUrl: z.string().trim().default(""),
  googleAnalyticsId: z.string().trim().default(""),
});

export const footerSchema = z.object({
  copyrightText: z.string().trim().default(""),
  aboutText: z.string().trim().default(""),
  address: z.string().trim().default(""),
  phone: z.string().trim().default(""),
  email: z.string().trim().default(""),
  emergencyHelpline: z.string().trim().default(""),
});

export const socialLinksSchema = z.object({
  facebook: z.string().trim().default(""),
  youtube: z.string().trim().default(""),
  twitter: z.string().trim().default(""),
  linkedin: z.string().trim().default(""),
  instagram: z.string().trim().default(""),
  whatsapp: z.string().trim().default(""),
});

export const featuresSchema = z.object({
  onlineAdmission: z.boolean().default(true),
  studentPortal: z.boolean().default(true),
  teacherPortal: z.boolean().default(true),
  resultPublishing: z.boolean().default(true),
  careerPortal: z.boolean().default(false),
  noticeBoard: z.boolean().default(true),
  gallery: z.boolean().default(true),
  onlinePayment: z.boolean().default(false),
});

export const navigationItemSchema = z.object({
  id: z.string().uuid().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  location: z.enum(["header", "footer"]).default("header"),
  label: z.string().trim().min(1, "Label is required"),
  href: z.string().trim().min(1, "Link URL is required"),
  position: z.coerce.number().default(0),
  is_visible: z.boolean().default(true),
});

export const pageSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().optional(),
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().default(""),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
  publish_at: z.string().nullable().optional(),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
});
