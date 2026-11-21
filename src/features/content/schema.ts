import { z } from "zod";

export const noticeSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().optional(),
  content: z.string().default(""),
  category: z.string().trim().default("General"),
  attachment_url: z.string().trim().nullable().optional(),
  attachment_type: z.enum(["none", "pdf", "image", "word"]).default("none").optional(),
  expires_at: z.string().nullable().optional(),
  is_pinned: z.boolean().default(false),
  is_urgent: z.boolean().default(false),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
});

export const newsEventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().optional(),
  summary: z.string().trim().default(""),
  content: z.string().default(""),
  type: z.enum(["news", "event"]).default("news"),
  category: z.string().trim().default("Campus"),
  event_date: z.string().nullable().optional(),
  venue: z.string().trim().nullable().optional(),
  cover_image_url: z.string().trim().nullable().optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
});

export const galleryAlbumSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Album title is required"),
  slug: z.string().trim().optional(),
  description: z.string().trim().default(""),
  cover_image_url: z.string().trim().min(1, "Cover image URL is required"),
  category: z.string().trim().default("Campus Life"),
  media_type: z.enum(["photo", "video"]).default("photo"),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
});

export const galleryItemSchema = z.object({
  id: z.string().uuid().optional(),
  album_id: z.string().uuid(),
  title: z.string().trim().nullable().optional(),
  media_url: z.string().trim().min(1, "Media URL is required"),
  thumbnail_url: z.string().trim().nullable().optional(),
  media_type: z.enum(["photo", "video"]).default("photo"),
  position: z.coerce.number().default(0),
});

export const documentSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Document title is required"),
  category: z.string().trim().default("General Forms"),
  file_url: z.string().trim().min(1, "File URL or attachment is required"),
  file_size: z.string().trim().nullable().optional(),
  file_type: z.string().trim().default("PDF"),
  is_active: z.boolean().default(true),
});

export const holidaySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Holiday name is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  total_days: z.coerce.number().min(1).default(1),
  type: z.string().trim().default("National"),
  description: z.string().trim().default(""),
  year: z.coerce.number().default(2026),
});

export const careerCircularSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Circular title is required"),
  post_name: z.string().trim().min(1, "Post name is required"),
  vacancy: z.coerce.number().min(1).default(1),
  employment_type: z.string().trim().default("Full-time"),
  deadline: z.string().min(1, "Application deadline is required"),
  circular_file_url: z.string().trim().nullable().optional(),
  requirements: z.string().default(""),
  application_instructions: z.string().default(""),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
});
