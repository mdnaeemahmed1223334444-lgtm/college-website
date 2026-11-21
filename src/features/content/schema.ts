import { z } from "zod";

// null-safe string coercion: formData.get() returns null for missing fields,
// which Zod z.string() rejects. preprocess converts null → "".
const str = z.preprocess((v) => v ?? "", z.string());
const strMin = (min: number, msg: string) =>
  z.preprocess((v) => v ?? "", z.string().min(min, msg));
const strOpt = z.preprocess((v) => (!v ? undefined : v), z.string().optional());
const strNullable = z.preprocess((v) => (!v ? null : v), z.string().nullable().optional());

export const noticeSchema = z.object({
  id: z.string().uuid().optional(),
  title: strMin(1, "Title is required"),
  slug: strOpt,
  content: str.default(""),
  category: str.default("General"),
  attachment_url: strNullable,
  attachment_type: z.enum(["none", "pdf", "image", "word"]).default("none").optional(),
  expires_at: strNullable,
  is_pinned: z.boolean().default(false),
  is_urgent: z.boolean().default(false),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
});

export const newsEventSchema = z.object({
  id: z.string().uuid().optional(),
  title: strMin(1, "Title is required"),
  slug: strOpt,
  summary: str.default(""),
  content: str.default(""),
  type: z.enum(["news", "event"]).default("news"),
  category: str.default("Campus"),
  event_date: strNullable,
  venue: strNullable,
  cover_image_url: strNullable,
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
});

export const galleryAlbumSchema = z.object({
  id: z.string().uuid().optional(),
  title: strMin(1, "Album title is required"),
  slug: strOpt,
  description: str.default(""),
  cover_image_url: strMin(1, "Cover photo is required — please upload an image or paste a URL"),
  category: str.default("Campus Life"),
  media_type: z.enum(["photo", "video"]).default("photo"),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
});

export const galleryItemSchema = z.object({
  id: z.string().uuid().optional(),
  album_id: z.string().uuid(),
  title: strNullable,
  media_url: strMin(1, "Media URL is required"),
  thumbnail_url: strNullable,
  media_type: z.enum(["photo", "video"]).default("photo"),
  position: z.coerce.number().default(0),
});

export const documentSchema = z.object({
  id: z.string().uuid().optional(),
  title: strMin(1, "Document title is required"),
  category: str.default("General Forms"),
  file_url: strMin(1, "Please upload a file or paste a URL"),
  file_size: strNullable,
  file_type: str.default("PDF"),
  is_active: z.boolean().default(true),
});

export const holidaySchema = z.object({
  id: z.string().uuid().optional(),
  title: strMin(1, "Holiday name is required"),
  start_date: strMin(1, "Start date is required"),
  end_date: strMin(1, "End date is required"),
  total_days: z.coerce.number().min(1).default(1),
  type: str.default("National"),
  description: str.default(""),
  year: z.coerce.number().default(2026),
});

export const careerCircularSchema = z.object({
  id: z.string().uuid().optional(),
  title: strMin(1, "Circular title is required"),
  post_name: strMin(1, "Post name is required"),
  vacancy: z.coerce.number().min(1).default(1),
  employment_type: str.default("Full-time"),
  deadline: strMin(1, "Application deadline is required"),
  circular_file_url: strNullable,
  requirements: str.default(""),
  application_instructions: str.default(""),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
});
