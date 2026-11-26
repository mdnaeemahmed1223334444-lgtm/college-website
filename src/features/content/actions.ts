"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/current-user";
import { mainAdmin } from "@/lib/supabase/main-server";
import { deleteUploadedFile } from "@/lib/storage/uploader";
import {
  noticeSchema,
  newsEventSchema,
  galleryAlbumSchema,
  documentSchema,
  holidaySchema,
  careerCircularSchema,
} from "./schema";
import { type ContentFeedback, isMeaningfulTitle } from "./types";

function autoSlug(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "item"}-${Date.now().toString(36)}`;
}

export async function saveNoticeAction(_prev: ContentFeedback, formData: FormData): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const rawId = formData.get("id")?.toString();
  const rawTitle = formData.get("title")?.toString().trim() || "";
  let rawSlug = formData.get("slug")?.toString().trim();
  if (!rawSlug && rawTitle) {
    rawSlug = autoSlug(rawTitle);
  }

  // Derive attachment type if not explicitly set
  let attachmentUrl = formData.get("attachment_url")?.toString().trim() || null;
  let attachmentType = formData.get("attachment_type")?.toString().trim() || "none";
  if (attachmentUrl && attachmentType === "none") {
    const lower = attachmentUrl.toLowerCase();
    if (lower.endsWith(".pdf")) attachmentType = "pdf";
    else if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp")) attachmentType = "image";
    else if (lower.endsWith(".doc") || lower.endsWith(".docx")) attachmentType = "word";
  }

  const rawExpiresAt = formData.get("expires_at")?.toString().trim() || null;

  const parsed = noticeSchema.safeParse({
    id: rawId && rawId.length > 10 ? rawId : undefined,
    title: rawTitle,
    slug: rawSlug,
    content: formData.get("content") || "",
    category: formData.get("category") || "General",
    attachment_url: attachmentUrl,
    attachment_type: attachmentType,
    expires_at: rawExpiresAt ? new Date(rawExpiresAt).toISOString() : null,
    is_pinned: formData.get("is_pinned") === "on" || formData.get("is_pinned") === "true",
    is_urgent: formData.get("is_urgent") === "on" || formData.get("is_urgent") === "true",
    status: formData.get("status") || "published",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid notice data." };
  }

  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/");
    revalidatePath("/notices");
    revalidatePath("/information/notice-board");
    revalidatePath("/admin/content/notices");
    return { success: true, message: "Notice saved successfully (Local Preview Mode)." };
  }

  const payload: Record<string, any> = { ...parsed.data, updated_at: new Date().toISOString() };
  if (!parsed.data.id) delete payload.id;

  const { error } = await supabase.from("notices").upsert(payload, { onConflict: "slug" });
  if (error) return { success: false, error: `Failed to save notice: ${error.message}` };

  revalidatePath("/");
  revalidatePath("/notices");
  revalidatePath("/information/notice-board");
  revalidatePath("/admin/content/notices");
  return { success: true, message: "Notice published/updated successfully." };
}

export async function deleteNoticeAction(id: string): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/");
    revalidatePath("/notices");
    revalidatePath("/information/notice-board");
    revalidatePath("/admin/content/notices");
    return { success: true, message: "Notice deleted (Local Preview Mode)." };
  }

  // Delete attached file if uploaded
  const { data: notice } = await supabase.from("notices").select("attachment_url").eq("id", id).maybeSingle();
  if (notice?.attachment_url) {
    await deleteUploadedFile(notice.attachment_url);
  }

  const { error } = await supabase.from("notices").delete().eq("id", id);
  if (error) return { success: false, error: `Delete failed: ${error.message}` };

  revalidatePath("/");
  revalidatePath("/notices");
  revalidatePath("/information/notice-board");
  revalidatePath("/admin/content/notices");
  return { success: true, message: "Notice removed." };
}

export async function saveNewsEventAction(_prev: ContentFeedback, formData: FormData): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const rawId = formData.get("id")?.toString();
  const rawTitle = formData.get("title")?.toString().trim() || "";
  let rawSlug = formData.get("slug")?.toString().trim();
  if (!rawSlug && rawTitle) {
    rawSlug = autoSlug(rawTitle);
  }

  const parsed = newsEventSchema.safeParse({
    id: rawId && rawId.length > 10 ? rawId : undefined,
    title: rawTitle,
    slug: rawSlug,
    summary: formData.get("summary") || "",
    content: formData.get("content") || "",
    type: formData.get("type") || "news",
    category: formData.get("category") || "Campus",
    event_date: formData.get("event_date") || null,
    venue: formData.get("venue") || null,
    cover_image_url: formData.get("cover_image_url") || null,
    status: formData.get("status") || "published",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid news/event data." };
  }

  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/");
    revalidatePath("/information/news-events");
    revalidatePath("/admin/content/news-events");
    return { success: true, message: "News/Event saved successfully (Local Preview Mode)." };
  }

  const payload: Record<string, any> = { ...parsed.data, updated_at: new Date().toISOString() };
  if (!parsed.data.id) delete payload.id;

  const { error } = await supabase.from("news_events").upsert(payload, { onConflict: "slug" });
  if (error) return { success: false, error: `Failed to save: ${error.message}` };

  revalidatePath("/");
  revalidatePath("/information/news-events");
  revalidatePath("/admin/content/news-events");
  return { success: true, message: "News/Event published successfully." };
}

export async function deleteNewsEventAction(id: string): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/information/news-events");
    revalidatePath("/admin/content/news-events");
    return { success: true, message: "News/Event deleted (Local Preview Mode)." };
  }

  // Delete cover image if uploaded
  const { data: item } = await supabase.from("news_events").select("cover_image_url").eq("id", id).maybeSingle();
  if (item?.cover_image_url) {
    await deleteUploadedFile(item.cover_image_url);
  }

  const { error } = await supabase.from("news_events").delete().eq("id", id);
  if (error) return { success: false, error: `Delete failed: ${error.message}` };

  revalidatePath("/information/news-events");
  revalidatePath("/admin/content/news-events");
  return { success: true, message: "News/Event removed." };
}

export async function saveGalleryAlbumAction(_prev: ContentFeedback, formData: FormData): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const rawId = formData.get("id")?.toString();
  const rawTitle = formData.get("title")?.toString().trim() || "";
  let rawSlug = formData.get("slug")?.toString().trim();
  if (!rawSlug && rawTitle) {
    rawSlug = autoSlug(rawTitle);
  }

  const parsed = galleryAlbumSchema.safeParse({
    id: rawId && rawId.length > 10 ? rawId : undefined,
    title: rawTitle,
    slug: rawSlug,
    description: formData.get("description") || "",
    cover_image_url: formData.get("cover_image_url"),
    category: formData.get("category") || "Campus Life",
    media_type: formData.get("media_type") || "photo",
    status: formData.get("status") || "published",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid album data." };
  }

  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/gallery");
    revalidatePath("/admin/content/gallery");
    return { success: true, message: "Gallery album saved successfully (Local Preview Mode)." };
  }

  const payload: Record<string, any> = { ...parsed.data, updated_at: new Date().toISOString() };
  if (!parsed.data.id) delete payload.id;

  const { error } = await supabase.from("gallery_albums").upsert(payload, { onConflict: "slug" });
  if (error) return { success: false, error: `Failed to save album: ${error.message}` };

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/content/gallery");
  return { success: true, message: "Gallery album saved successfully." };
}

export async function deleteGalleryAlbumAction(id: string): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/admin/content/gallery");
    return { success: true, message: "Album deleted (Local Preview Mode)." };
  }

  // 1. Delete all child photos and their physical files
  const { data: items } = await supabase.from("gallery_items").select("media_url, thumbnail_url").eq("album_id", id);
  if (items && items.length > 0) {
    for (const it of items) {
      if (it.media_url) await deleteUploadedFile(it.media_url);
      if (it.thumbnail_url && it.thumbnail_url !== it.media_url) {
        await deleteUploadedFile(it.thumbnail_url);
      }
    }
    await supabase.from("gallery_items").delete().eq("album_id", id);
  }

  // 2. Delete album cover if uploaded
  const { data: album } = await supabase.from("gallery_albums").select("cover_image_url").eq("id", id).maybeSingle();
  if (album?.cover_image_url) {
    await deleteUploadedFile(album.cover_image_url);
  }

  const { error } = await supabase.from("gallery_albums").delete().eq("id", id);
  if (error) return { success: false, error: `Delete failed: ${error.message}` };

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/content/gallery");
  return { success: true, message: "Gallery album removed from database." };
}

export async function addGalleryPhotoAction(_prev: ContentFeedback, formData: FormData): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const media_url = formData.get("media_url")?.toString()?.trim();
  const rawTitle = formData.get("title")?.toString()?.trim() || null;
  const album_id = formData.get("album_id")?.toString()?.trim() || null;
  // Ensure we only store real, meaningful titles and never camera file names
  const title = isMeaningfulTitle(rawTitle) ? rawTitle : null;

  if (!media_url) {
    return { success: false, error: "Please upload or provide an image URL." };
  }

  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/admin/content/gallery");
    return { success: true, message: "Photo added to gallery (Local Preview Mode)." };
  }

  const { error } = await supabase.from("gallery_items").insert({
    album_id: album_id || null,
    media_url,
    thumbnail_url: media_url,
    title,
    media_type: "photo",
  });

  if (error) {
    return { success: false, error: `Failed to save photo: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/content/gallery");
  return { success: true, message: "Photo uploaded and saved to database successfully!" };
}

export async function deleteGalleryPhotoAction(id: string): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const supabase = mainAdmin();
  if (supabase) {
    // 1. Fetch file URLs to remove physical file from disk/storage
    const { data: item } = await supabase
      .from("gallery_items")
      .select("media_url, thumbnail_url")
      .eq("id", id)
      .maybeSingle();

    if (item) {
      if (item.media_url) await deleteUploadedFile(item.media_url);
      if (item.thumbnail_url && item.thumbnail_url !== item.media_url) {
        await deleteUploadedFile(item.thumbnail_url);
      }
    }

    // 2. Delete row from database
    const { error } = await supabase.from("gallery_items").delete().eq("id", id);
    if (error) {
      return { success: false, error: `Delete failed: ${error.message}` };
    }
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/content/gallery");
  revalidatePath("/admin/content/uploads");
  return { success: true, message: "Photo permanently deleted from website and database." };
}

export async function updateGalleryPhotoTitleAction(
  id: string,
  title: string
): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const cleanTitle = isMeaningfulTitle(title) ? title.trim() : null;
  const supabase = mainAdmin();
  if (supabase) {
    const { error } = await supabase
      .from("gallery_items")
      .update({ title: cleanTitle })
      .eq("id", id);
    if (error) {
      return { success: false, error: `Failed to update title: ${error.message}` };
    }
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/content/gallery");
  revalidatePath("/admin/content/uploads");
  return { success: true, message: "Photo title updated successfully." };
}

export async function addGalleryPhotosBatchAction(
  photos: { media_url: string; title?: string }[],
  album_id?: string
): Promise<ContentFeedback & { count?: number }> {
  await requireRole(["admin"]);
  if (!photos || photos.length === 0) {
    return { success: false, error: "No photos provided for batch upload." };
  }

  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/admin/content/gallery");
    revalidatePath("/admin/content/uploads");
    return {
      success: true,
      count: photos.length,
      message: `${photos.length} photos added to gallery (Local Preview Mode).`,
    };
  }

  const rows = photos.map((p, idx) => ({
    album_id: album_id || null,
    media_url: p.media_url,
    thumbnail_url: p.media_url,
    // Never store camera file names as titles
    title: isMeaningfulTitle(p.title) ? p.title!.trim() : null,
    media_type: "photo",
    position: idx,
  }));

  const { error } = await supabase.from("gallery_items").insert(rows);
  if (error) {
    return { success: false, error: `Failed to save photos: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/content/gallery");
  revalidatePath("/admin/content/uploads");
  return {
    success: true,
    count: rows.length,
    message: `Successfully uploaded and saved ${rows.length} photos to database!`,
  };
}

export async function saveDocumentAction(_prev: ContentFeedback, formData: FormData): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const rawId = formData.get("id")?.toString();

  const parsed = documentSchema.safeParse({
    id: rawId && rawId.length > 10 ? rawId : undefined,
    title: formData.get("title"),
    category: formData.get("category") || "General Forms",
    file_url: formData.get("file_url"),
    file_size: formData.get("file_size") || null,
    file_type: formData.get("file_type") || "PDF",
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid document data." };
  }

  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/information/documents");
    revalidatePath("/admin/content/documents");
    return { success: true, message: "Document saved successfully (Local Preview Mode)." };
  }

  const payload: Record<string, any> = { ...parsed.data, updated_at: new Date().toISOString() };
  if (!parsed.data.id) delete payload.id;

  const { error } = await supabase.from("documents").upsert(payload);
  if (error) return { success: false, error: `Failed to save document: ${error.message}` };

  revalidatePath("/information/documents");
  revalidatePath("/admin/content/documents");
  return { success: true, message: "Document saved." };
}

export async function deleteDocumentAction(id: string): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/information/documents");
    revalidatePath("/admin/content/documents");
    return { success: true, message: "Document deleted (Local Preview Mode)." };
  }

  // Delete attached document file from storage if present
  const { data: doc } = await supabase.from("documents").select("file_url").eq("id", id).maybeSingle();
  if (doc?.file_url) {
    await deleteUploadedFile(doc.file_url);
  }

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return { success: false, error: `Delete failed: ${error.message}` };

  revalidatePath("/information/documents");
  revalidatePath("/admin/content/documents");
  return { success: true, message: "Document removed." };
}

export async function saveHolidayAction(_prev: ContentFeedback, formData: FormData): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const rawId = formData.get("id")?.toString();

  const parsed = holidaySchema.safeParse({
    id: rawId && rawId.length > 10 ? rawId : undefined,
    title: formData.get("title"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    total_days: formData.get("total_days"),
    type: formData.get("type") || "National",
    description: formData.get("description") || "",
    year: formData.get("year") || 2026,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid holiday data." };
  }

  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/information/holidays");
    revalidatePath("/admin/content/holidays");
    return { success: true, message: "Holiday saved successfully (Local Preview Mode)." };
  }

  const payload: Record<string, any> = { ...parsed.data };
  if (!parsed.data.id) delete payload.id;

  const { error } = await supabase.from("holidays").upsert(payload);
  if (error) return { success: false, error: `Failed to save holiday: ${error.message}` };

  revalidatePath("/information/holidays");
  revalidatePath("/admin/content/holidays");
  return { success: true, message: "Holiday saved." };
}

export async function deleteHolidayAction(id: string): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/information/holidays");
    revalidatePath("/admin/content/holidays");
    return { success: true, message: "Holiday deleted (Local Preview Mode)." };
  }

  const { error } = await supabase.from("holidays").delete().eq("id", id);
  if (error) return { success: false, error: `Delete failed: ${error.message}` };

  revalidatePath("/information/holidays");
  revalidatePath("/admin/content/holidays");
  return { success: true, message: "Holiday removed." };
}

export async function saveCareerCircularAction(_prev: ContentFeedback, formData: FormData): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const rawId = formData.get("id")?.toString();

  const parsed = careerCircularSchema.safeParse({
    id: rawId && rawId.length > 10 ? rawId : undefined,
    title: formData.get("title"),
    post_name: formData.get("post_name"),
    vacancy: formData.get("vacancy"),
    employment_type: formData.get("employment_type") || "Full-time",
    deadline: formData.get("deadline"),
    circular_file_url: formData.get("circular_file_url") || null,
    requirements: formData.get("requirements") || "",
    application_instructions: formData.get("application_instructions") || "",
    status: formData.get("status") || "published",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid career circular." };
  }

  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/career/circulars");
    revalidatePath("/admin/content/career-circulars");
    return { success: true, message: "Career circular saved successfully (Local Preview Mode)." };
  }

  const payload: Record<string, any> = { ...parsed.data, updated_at: new Date().toISOString() };
  if (!parsed.data.id) delete payload.id;

  const { error } = await supabase.from("career_circulars").upsert(payload);
  if (error) return { success: false, error: `Failed to save circular: ${error.message}` };

  revalidatePath("/career/circulars");
  revalidatePath("/admin/content/career-circulars");
  return { success: true, message: "Career circular posted." };
}

export async function deleteCareerCircularAction(id: string): Promise<ContentFeedback> {
  await requireRole(["admin"]);
  const supabase = mainAdmin();
  if (!supabase) {
    revalidatePath("/career/circulars");
    revalidatePath("/admin/content/career-circulars");
    return { success: true, message: "Circular deleted (Local Preview Mode)." };
  }

  // Delete attached circular file from storage if present
  const { data: circular } = await supabase.from("career_circulars").select("circular_file_url").eq("id", id).maybeSingle();
  if (circular?.circular_file_url) {
    await deleteUploadedFile(circular.circular_file_url);
  }

  const { error } = await supabase.from("career_circulars").delete().eq("id", id);
  if (error) return { success: false, error: `Delete failed: ${error.message}` };

  revalidatePath("/career/circulars");
  revalidatePath("/admin/content/career-circulars");
  return { success: true, message: "Circular removed." };
}
