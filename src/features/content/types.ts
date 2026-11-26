import type { ContentStatus } from "@/features/website/types";

export type NoticeCategory =
  | "Academic"
  | "Admission"
  | "Examination"
  | "General"
  | "Administrative";

export type NoticeAttachmentType = "none" | "pdf" | "image" | "word";

export interface NoticeRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: NoticeCategory | string;
  attachment_url: string | null;
  attachment_type?: NoticeAttachmentType | string;
  expires_at?: string | null;
  is_pinned: boolean;
  is_urgent: boolean;
  status: ContentStatus;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export type NewsEventType = "news" | "event";

export interface NewsEventRecord {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  type: NewsEventType;
  category: string;
  event_date: string | null;
  venue: string | null;
  cover_image_url: string | null;
  status: ContentStatus;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryAlbumRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  category: string;
  media_type: "photo" | "video";
  status: ContentStatus;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryItemRecord {
  id: string;
  album_id: string | null;
  title: string | null;
  media_url: string;
  thumbnail_url: string | null;
  media_type: "photo" | "video";
  position: number;
  created_at?: string;
}

/**
 * Checks if a photo caption or title is a real, meaningful human title
 * and NOT an auto-generated camera filename (like "IMG 8101.JPG", "IMG_8101", "DSC_0045"),
 * file extension, temp ID, or empty string.
 */
export function isMeaningfulTitle(title?: string | null): boolean {
  if (!title) return false;
  const t = title.trim();
  if (!t) return false;
  if (/^(img|dsc|photo|pic|image|file|scan|screenshot|whatsapp)[-_ ]?\d+/i.test(t)) return false;
  if (/\.(jpg|jpeg|png|webp|gif|bmp|tiff|svg|pdf)$/i.test(t)) return false;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i.test(t)) return false;
  if (/^temp-\d+/i.test(t)) return false;
  if (/^(campus photo|campus highlight|photo|image|untitled)$/i.test(t)) return false;
  return true;
}

export interface DocumentRecord {
  id: string;
  title: string;
  category: string;
  file_url: string;
  file_size: string | null;
  file_type: string;
  is_active: boolean;
  downloads_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface HolidayRecord {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  total_days: number;
  type: "National" | "Academic" | "Religious" | "Special" | "Cultural" | string;
  description: string;
  year: number;
  created_at?: string;
}

export interface CareerCircularRecord {
  id: string;
  title: string;
  post_name: string;
  vacancy: number;
  employment_type: string;
  deadline: string;
  circular_file_url: string | null;
  requirements: string;
  application_instructions: string;
  status: ContentStatus;
  created_at?: string;
  updated_at?: string;
}

export type ContentFeedback = {
  success?: boolean;
  error?: string;
  message?: string;
};
