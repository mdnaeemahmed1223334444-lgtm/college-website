"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/current-user";
import { mainAdmin } from "@/lib/supabase/main-server";
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
} from "./schema";
import type { ActionFeedback } from "./types";

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
    return { success: false, error: `Failed to save setting: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Settings updated successfully." };
}

export async function updateBrandingAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const parsed = brandingSchema.safeParse({
    collegeName: formData.get("collegeName"),
    shortName: formData.get("shortName"),
    motto: formData.get("motto"),
    establishedYear: formData.get("establishedYear"),
    eiin: formData.get("eiin"),
    collegeCode: formData.get("collegeCode"),
    logoUrl: formData.get("logoUrl"),
    faviconUrl: formData.get("faviconUrl"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid branding data." };
  }

  return saveSettingRecord("branding", parsed.data);
}

export async function updateAppearanceAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const parsed = appearanceSchema.safeParse({
    primaryColor: formData.get("primaryColor"),
    secondaryColor: formData.get("secondaryColor"),
    accentColor: formData.get("accentColor"),
    fontFamily: formData.get("fontFamily"),
    headerSticky: formData.get("headerSticky") === "on" || formData.get("headerSticky") === "true",
    containerWidth: formData.get("containerWidth"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid appearance data." };
  }

  return saveSettingRecord("appearance", parsed.data);
}

export async function updateHomepageAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const parsed = homepageSchema.safeParse({
    heroTitle: formData.get("heroTitle"),
    heroSubtitle: formData.get("heroSubtitle"),
    heroCtaText: formData.get("heroCtaText"),
    heroCtaLink: formData.get("heroCtaLink"),
    heroSecondaryText: formData.get("heroSecondaryText"),
    heroSecondaryLink: formData.get("heroSecondaryLink"),
    bannerImageUrl: formData.get("bannerImageUrl"),
    noticeTickerSpeed: formData.get("noticeTickerSpeed"),
    noticeTickerText: formData.get("noticeTickerText"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid homepage data." };
  }

  return saveSettingRecord("homepage", parsed.data);
}

export async function updateHomepageSectionsAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const parsed = homepageSectionsSchema.safeParse({
    noticeTicker: formData.get("noticeTicker") === "on",
    heroSection: formData.get("heroSection") === "on",
    quickLinks: formData.get("quickLinks") === "on",
    latestNews: formData.get("latestNews") === "on",
    galleryPreview: formData.get("galleryPreview") === "on",
    statistics: formData.get("statistics") === "on",
    principalMessage: formData.get("principalMessage") === "on",
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid sections configuration." };
  }

  return saveSettingRecord("homepage_sections", parsed.data);
}

export async function updateSeoAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const parsed = seoSchema.safeParse({
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    keywords: formData.get("keywords"),
    ogImageUrl: formData.get("ogImageUrl"),
    googleAnalyticsId: formData.get("googleAnalyticsId"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid SEO data." };
  }

  return saveSettingRecord("seo", parsed.data);
}

export async function updateFooterAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const parsed = footerSchema.safeParse({
    copyrightText: formData.get("copyrightText"),
    aboutText: formData.get("aboutText"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    emergencyHelpline: formData.get("emergencyHelpline"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid footer data." };
  }

  return saveSettingRecord("footer", parsed.data);
}

export async function updateSocialLinksAction(_prev: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const parsed = socialLinksSchema.safeParse({
    facebook: formData.get("facebook"),
    youtube: formData.get("youtube"),
    twitter: formData.get("twitter"),
    linkedin: formData.get("linkedin"),
    instagram: formData.get("instagram"),
    whatsapp: formData.get("whatsapp"),
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
