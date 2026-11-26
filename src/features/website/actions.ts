"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/current-user";
import { mainAdmin } from "@/lib/supabase/main-server";
import { deleteUploadedFile } from "@/lib/storage/uploader";
import {
  getBrandingSettings,
  getAppearanceSettings,
  getHomepageSettings,
  getSeoSettings,
  getScrollExpandHeroSettings,
} from "./queries";
import {
  brandingSchema,
  appearanceSchema,
  homepageSchema,
  homepageSectionsSchema,
  seoSchema,
  footerSchema,
  socialLinksSchema,
  featuresSchema,
  navigationItemSchema,
  pageSchema,
  scrollExpandHeroSchema,
} from "./schema";
import type { ActionFeedback, BrandingSettings } from "./types";

/** Save any JSON object into site_settings table */
async function saveSettingRecord(key: string, value: Record<string, any>): Promise<ActionFeedback> {
  await requireRole(["admin"]);
  const supabase = mainAdmin();
  if (!supabase) {
    // In local preview/test mode without Supabase
    revalidatePath("/", "layout");
    return { success: true, message: "Settings saved successfully (Local Preview Mode)." };
  }

  const { error } = await supabase.from("site_settings").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    const msg = error.message || (error as any).details || "Database error";
    const hint = (error as any).hint ? ` (Hint: ${(error as any).hint})` : "";
    return { success: false, error: `Failed to save setting: ${msg}${hint}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/", "page");
  revalidatePath("/admin/website", "layout");
  return { success: true, message: "Settings updated successfully." };
}

export async function updateBrandingAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const existing = await getBrandingSettings();
  const getVal = (key: string): string => {
    if (!formData.has(key)) return (existing as any)[key] || "";
    const v = formData.get(key);
    return typeof v === "string" ? v.trim() : "";
  };

  const parsed = brandingSchema.safeParse({
    collegeName: getVal("collegeName"),
    shortName: getVal("shortName"),
    motto: getVal("motto"),
    establishedYear: getVal("establishedYear"),
    eiin: getVal("eiin"),
    collegeCode: getVal("collegeCode"),
    logoUrl: getVal("logoUrl"),
    faviconUrl: getVal("faviconUrl"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid branding data." };
  }

  // Automatic cleanup of old replaced logo or favicon
  if (existing.logoUrl && existing.logoUrl !== parsed.data.logoUrl) {
    await deleteUploadedFile(existing.logoUrl);
  }
  if (existing.faviconUrl && existing.faviconUrl !== parsed.data.faviconUrl) {
    await deleteUploadedFile(existing.faviconUrl);
  }

  return saveSettingRecord("branding", parsed.data);
}

export async function updateAppearanceAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const existing = await getAppearanceSettings();
  const getVal = (key: string): string => {
    if (!formData.has(key)) return (existing as any)[key] || "";
    const v = formData.get(key);
    return typeof v === "string" ? v.trim() : "";
  };

  const parsed = appearanceSchema.safeParse({
    primaryColor: getVal("primaryColor"),
    secondaryColor: getVal("secondaryColor"),
    accentColor: getVal("accentColor"),
    fontFamily: getVal("fontFamily"),
    headerSticky: formData.has("headerSticky")
      ? formData.get("headerSticky") === "on" || formData.get("headerSticky") === "true"
      : existing.headerSticky,
    containerWidth: getVal("containerWidth"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid appearance data." };
  }

  return saveSettingRecord("appearance", parsed.data);
}

export async function updateHomepageAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const existing = await getHomepageSettings();
  const str = (key: string): string => ((formData.get(key) as string) ?? "").trim();

  const parsed = homepageSchema.safeParse({
    heroTitle: str("heroTitle"),
    heroSubtitle: str("heroSubtitle"),
    heroCtaText: str("heroCtaText"),
    heroCtaLink: str("heroCtaLink"),
    heroSecondaryText: str("heroSecondaryText"),
    heroSecondaryLink: str("heroSecondaryLink"),
    bannerImageUrl: str("bannerImageUrl"),
    aboutMainImageUrl: str("aboutMainImageUrl"),
    aboutSecondaryImageUrl: str("aboutSecondaryImageUrl"),
    admissionCtaImageUrl: str("admissionCtaImageUrl"),
    noticeTickerSpeed: formData.get("noticeTickerSpeed"),
    noticeTickerText: str("noticeTickerText"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid homepage data." };
  }

  // Automatic cleanup of replaced images
  if (existing.bannerImageUrl && existing.bannerImageUrl !== parsed.data.bannerImageUrl) {
    await deleteUploadedFile(existing.bannerImageUrl);
  }
  if (existing.aboutMainImageUrl && existing.aboutMainImageUrl !== parsed.data.aboutMainImageUrl) {
    await deleteUploadedFile(existing.aboutMainImageUrl);
  }
  if (existing.aboutSecondaryImageUrl && existing.aboutSecondaryImageUrl !== parsed.data.aboutSecondaryImageUrl) {
    await deleteUploadedFile(existing.aboutSecondaryImageUrl);
  }
  if (existing.admissionCtaImageUrl && existing.admissionCtaImageUrl !== parsed.data.admissionCtaImageUrl) {
    await deleteUploadedFile(existing.admissionCtaImageUrl);
  }

  // Update ScrollExpand enable/disable state if included in form submission
  if (formData.has("scrollExpandEnabled")) {
    const isScrollExpandEnabled = formData.get("scrollExpandEnabled") === "true";
    const currentHero = await getScrollExpandHeroSettings();
    await saveSettingRecord("scroll_expand_hero", {
      ...currentHero,
      enabled: isScrollExpandEnabled,
    });
    revalidatePath("/admin/website/scroll-expand-hero");
  }

  return saveSettingRecord("homepage", parsed.data);
}

export async function updateHomepageSectionsAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const parsed = homepageSectionsSchema.safeParse({
    noticeTicker: formData.get("noticeTicker") === "on" || formData.get("noticeTicker") === "true",
    heroSection: formData.get("heroSection") === "on" || formData.get("heroSection") === "true",
    quickLinks: formData.get("quickLinks") === "on" || formData.get("quickLinks") === "true",
    latestNews: formData.get("latestNews") === "on" || formData.get("latestNews") === "true",
    galleryPreview: formData.get("galleryPreview") === "on" || formData.get("galleryPreview") === "true",
    statistics: formData.get("statistics") === "on" || formData.get("statistics") === "true",
    principalMessage: formData.get("principalMessage") === "on" || formData.get("principalMessage") === "true",
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid sections configuration." };
  }

  return saveSettingRecord("homepage_sections", parsed.data);
}

export async function updateSeoAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const existing = await getSeoSettings();
  const str = (key: string): string => ((formData.get(key) as string) ?? "").trim();

  const parsed = seoSchema.safeParse({
    metaTitle: str("metaTitle"),
    metaDescription: str("metaDescription"),
    keywords: str("keywords"),
    ogImageUrl: str("ogImageUrl"),
    googleAnalyticsId: str("googleAnalyticsId"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid SEO data." };
  }

  // Automatic cleanup of replaced OG image
  if (existing.ogImageUrl && existing.ogImageUrl !== parsed.data.ogImageUrl) {
    await deleteUploadedFile(existing.ogImageUrl);
  }

  return saveSettingRecord("seo", parsed.data);
}

export async function updateFooterAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const str = (key: string): string => ((formData.get(key) as string) ?? "").trim();
  const parsed = footerSchema.safeParse({
    copyrightText: str("copyrightText"),
    aboutText: str("aboutText"),
    address: str("address"),
    phone: str("phone"),
    email: str("email"),
    emergencyHelpline: str("emergencyHelpline"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid footer data." };
  }

  return saveSettingRecord("footer", parsed.data);
}

export async function updateSocialLinksAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const str = (key: string): string => ((formData.get(key) as string) ?? "").trim();
  const parsed = socialLinksSchema.safeParse({
    facebook: str("facebook"),
    youtube: str("youtube"),
    twitter: str("twitter"),
    linkedin: str("linkedin"),
    instagram: str("instagram"),
    whatsapp: str("whatsapp"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid social links." };
  }

  return saveSettingRecord("social_links", parsed.data);
}

export async function updateFeaturesAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const parsed = featuresSchema.safeParse({
    onlineAdmission: formData.get("onlineAdmission") === "on",
    studentPortal: formData.get("studentPortal") === "on",
    teacherPortal: formData.get("teacherPortal") === "on",
    resultPublishing: formData.get("resultPublishing") === "on",
    careerPortal: formData.get("careerPortal") === "on",
    noticeBoard: formData.get("noticeBoard") === "on",
    gallery: formData.get("gallery") === "on",
    onlinePayment: formData.get("onlinePayment") === "on",
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid features configuration." };
  }

  return saveSettingRecord("features", parsed.data);
}

export async function saveNavigationItemAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  await requireRole(["admin"]);
  const rawId = formData.get("id")?.toString();
  const rawParentId = formData.get("parent_id")?.toString();

  const parsed = navigationItemSchema.safeParse({
    id: rawId && rawId.length > 10 ? rawId : undefined,
    parent_id: rawParentId && rawParentId.length > 10 ? rawParentId : null,
    location: formData.get("location") || "header",
    label: formData.get("label"),
    href: formData.get("href"),
    position: formData.get("position"),
    is_visible: formData.get("is_visible") === "on" || formData.get("is_visible") === "true",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid navigation item data." };
  }

  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/", "layout");
    return { success: true, message: "Navigation saved successfully (Local Preview Mode)." };
  }

  const payload: Record<string, any> = {
    label: parsed.data.label,
    href: parsed.data.href,
    location: parsed.data.location,
    position: parsed.data.position,
    is_visible: parsed.data.is_visible,
    parent_id: parsed.data.parent_id ?? null,
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.id) {
    payload.id = parsed.data.id;
  }

  const { error } = await supabase.from("navigation_items").upsert(payload);
  if (error) {
    return { success: false, error: `Failed to save navigation item: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Navigation item saved successfully." };
}

export async function deleteNavigationItemAction(id: string): Promise<ActionFeedback> {
  await requireRole(["admin"]);
  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/", "layout");
    return { success: true, message: "Item deleted (Local Preview Mode)." };
  }

  const { error } = await supabase.from("navigation_items").delete().eq("id", id);
  if (error) {
    return { success: false, error: `Delete failed: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Navigation item deleted." };
}

export async function savePageAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  await requireRole(["admin"]);
  const rawId = formData.get("id")?.toString();
  const rawTitle = formData.get("title")?.toString().trim() || "";
  let rawSlug = formData.get("slug")?.toString().trim();
  if (!rawSlug && rawTitle) {
    rawSlug = rawTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const parsed = pageSchema.safeParse({
    id: rawId && rawId.length > 10 ? rawId : undefined,
    slug: rawSlug,
    title: rawTitle,
    content: formData.get("content") || "",
    status: formData.get("status") || "draft",
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid page data." };
  }

  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath(`/${parsed.data.slug}`);
    revalidatePath("/admin/website/pages");
    return { success: true, message: "Page saved successfully (Local Preview Mode)." };
  }

  const payload: Record<string, any> = {
    slug: parsed.data.slug,
    title: parsed.data.title,
    content: parsed.data.content,
    status: parsed.data.status,
    seo_title: parsed.data.seo_title,
    seo_description: parsed.data.seo_description,
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.id) {
    payload.id = parsed.data.id;
  }

  const { error } = await supabase.from("pages").upsert(payload, { onConflict: "slug" });
  if (error) {
    return { success: false, error: `Failed to save page: ${error.message}` };
  }

  revalidatePath(`/${parsed.data.slug}`);
  revalidatePath("/admin/website/pages");
  return { success: true, message: "Page saved successfully." };
}

export async function deletePageAction(id: string): Promise<ActionFeedback> {
  await requireRole(["admin"]);
  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/admin/website/pages");
    return { success: true, message: "Page removed (Local Preview Mode)." };
  }

  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) {
    return { success: false, error: `Delete failed: ${error.message}` };
  }

  revalidatePath("/admin/website/pages");
  return { success: true, message: "Page deleted successfully." };
}

export async function updateScrollExpandHeroAction(
  _prev: ActionFeedback,
  formData: FormData
): Promise<ActionFeedback> {
  const existing = await getScrollExpandHeroSettings();
  const str = (key: string): string => ((formData.get(key) as string) ?? "").trim();
  const num = (key: string, defVal: number): number => {
    const raw = formData.get(key);
    if (raw === null || raw === undefined || raw === "") return defVal;
    const n = Number(raw);
    return isNaN(n) ? defVal : n;
  };

  const parsed = scrollExpandHeroSchema.safeParse({
    enabled: formData.has("enabled")
      ? formData.get("enabled") === "on" || formData.get("enabled") === "true" || formData.get("enabled") === "1"
      : false,
    heroImage: str("heroImage") || existing.heroImage,
    heroTitle: str("heroTitle") || existing.heroTitle,
    heroSubtitle: str("heroSubtitle"),
    scrollHint: str("scrollHint") || "Scroll to explore",
    ctaText: str("ctaText"),
    ctaLink: str("ctaLink"),
    secondaryCtaText: str("secondaryCtaText"),
    secondaryCtaLink: str("secondaryCtaLink"),
    startWidth: num("startWidth", existing.startWidth),
    startHeight: num("startHeight", existing.startHeight),
    startRadius: num("startRadius", existing.startRadius),
    endRadius: num("endRadius", existing.endRadius),
    mediaZoom: num("mediaZoom", existing.mediaZoom),
    scrollDistance: num("scrollDistance", existing.scrollDistance),
    holdDistance: num("holdDistance", existing.holdDistance),
    smoothing: num("smoothing", existing.smoothing),
    overlayScrim: num("overlayScrim", existing.overlayScrim),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid hero settings." };
  }

  // Automatic cleanup of old replaced hero image from storage
  if (existing.heroImage && existing.heroImage !== parsed.data.heroImage) {
    await deleteUploadedFile(existing.heroImage);
  }

  const result = await saveSettingRecord("scroll_expand_hero", parsed.data);
  if (result.success) {
    revalidatePath("/");
    revalidatePath("/admin/website");
    revalidatePath("/admin/website/scroll-expand-hero");
  }
  return result;
}
