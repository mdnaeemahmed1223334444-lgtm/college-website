import "server-only";
import { mainPublic, mainAdmin } from "@/lib/supabase/main-server";
import type {
  NoticeRecord,
  NewsEventRecord,
  GalleryAlbumRecord,
  GalleryItemRecord,
  DocumentRecord,
  HolidayRecord,
  CareerCircularRecord,
} from "./types";

export const defaultNotices: NoticeRecord[] = [
  {
    id: "not-1",
    title: "Admission Circular for HSC Session 2026-2027",
    slug: "admission-circular-hsc-2026-2027",
    content:
      "<p>Applications are invited from eligible candidates for admission into Class XI (HSC) in Science, Business Studies, and Humanities groups for the academic session 2026-2027.</p><p>Students must apply online through the college portal or board central admission system before the deadline.</p>",
    category: "Admission",
    attachment_url: "/documents/admission-guidelines.pdf",
    is_pinned: true,
    is_urgent: true,
    status: "published",
    published_at: "2026-11-15T08:00:00Z",
    created_at: "2026-11-15T08:00:00Z",
  },
  {
    id: "not-2",
    title: "HSC Pre-Board Examination Schedule Published",
    slug: "hsc-pre-board-exam-schedule",
    content:
      "<p>The pre-board examination for HSC 2nd year students will commence on December 10, 2026. Detailed subject-wise routine is available on the examination notice board.</p>",
    category: "Examination",
    attachment_url: "/documents/exam-routine-2026.pdf",
    is_pinned: true,
    is_urgent: false,
    status: "published",
    published_at: "2026-11-10T09:00:00Z",
    created_at: "2026-11-10T09:00:00Z",
  },
  {
    id: "not-3",
    title: "College Annual Sports Meet 2026 Participation Notice",
    slug: "annual-sports-meet-2026",
    content:
      "<p>The Annual Athletics & Sports Competition 2026 will take place on the college ground. Interested participants should register with their class physical education teacher by next Sunday.</p>",
    category: "General",
    attachment_url: null,
    is_pinned: false,
    is_urgent: false,
    status: "published",
    published_at: "2026-11-05T10:00:00Z",
    created_at: "2026-11-05T10:00:00Z",
  },
  {
    id: "not-4",
    title: "Class Routine Revision for HSC 1st Year (Science & Business)",
    slug: "class-routine-revision-hsc-1st-year",
    content:
      "<p>Please note that laboratory and lecture slots for Physics and Accounting have been slightly adjusted starting from this Monday. Check the updated routine online.</p>",
    category: "Academic",
    attachment_url: null,
    is_pinned: false,
    is_urgent: false,
    status: "published",
    published_at: "2026-11-01T11:00:00Z",
    created_at: "2026-11-01T11:00:00Z",
  },
];

export const defaultNewsEvents: NewsEventRecord[] = [
  {
    id: "news-1",
    title: "National Science Olympiad: DMC Students Win 3 First Prizes",
    slug: "national-science-olympiad-winners-2026",
    summary:
      "Dhaka Model College students showcased exceptional brilliance in the National Science Olympiad finals.",
    content:
      "<p>In a momentous achievement, three students from our Science department secured the top positions in Physics and Chemistry at the 14th National Science Olympiad. The Governing Body and Principal congratulate our brilliant winners.</p>",
    type: "news",
    category: "Achievement",
    event_date: "2026-11-18T10:00:00Z",
    venue: "National Science Museum, Dhaka",
    cover_image_url:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
    status: "published",
    published_at: "2026-11-18T10:00:00Z",
  },
  {
    id: "event-2",
    title: "Annual Inter-College Debate Championship 2026",
    slug: "inter-college-debate-championship-2026",
    summary:
      "Three-day national parliamentary debate tournament hosting 32 prestigious collegiate teams.",
    content:
      "<p>The College Debating Society is thrilled to host the 2026 National Parliamentary Debate Tournament from December 15 to December 17. The grand finale will be graced by distinguished educationists.</p>",
    type: "event",
    category: "Cultural",
    event_date: "2026-12-15T09:30:00Z",
    venue: "Central College Auditorium",
    cover_image_url:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
    status: "published",
    published_at: "2026-11-12T10:00:00Z",
  },
  {
    id: "news-3",
    title: "Inauguration of Modern STEM & AI Learning Laboratory",
    slug: "inauguration-modern-stem-ai-lab",
    summary:
      "State-of-the-art computer and robotics lab equipped with 60 high-performance workstations inaugurated.",
    content:
      "<p>To prepare students for fourth industrial revolution skills, Dhaka Model College has inaugurated a dedicated STEM & AI laboratory with robotics kits, 3D printers, and high-speed fiber connectivity.</p>",
    type: "news",
    category: "Academic",
    event_date: "2026-11-02T11:00:00Z",
    venue: "IT Complex, Level 4",
    cover_image_url:
      "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80",
    status: "published",
    published_at: "2026-11-02T11:00:00Z",
  },
];

export const defaultAlbums: GalleryAlbumRecord[] = [
  {
    id: "alb-1",
    title: "Campus Infrastructure & Facilities",
    slug: "campus-infrastructure-facilities",
    description:
      "A visual tour of our multimedia classrooms, science labs, central library, and green campus grounds.",
    cover_image_url:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    category: "Facilities",
    media_type: "photo",
    status: "published",
  },
  {
    id: "alb-2",
    title: "Annual Athletics & Sports Competition",
    slug: "annual-athletics-sports-competition",
    description:
      "High-energy highlights from sprint races, high jump, cricket tournament, and prize giving ceremony.",
    cover_image_url:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    category: "Sports",
    media_type: "photo",
    status: "published",
  },
  {
    id: "alb-3",
    title: "Science Fair & Innovation Showcase",
    slug: "science-fair-innovation-showcase",
    description:
      "Creative working models, environmental solutions, and robotics projects presented by young innovators.",
    cover_image_url:
      "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=800&q=80",
    category: "Academic",
    media_type: "photo",
    status: "published",
  },
];

export const defaultDocuments: DocumentRecord[] = [
  {
    id: "doc-1",
    title: "College Prospectus & Academic Guide 2026-2027",
    category: "Admission",
    file_url: "/documents/prospectus-2026.pdf",
    file_size: "4.5 MB",
    file_type: "PDF",
    is_active: true,
    downloads_count: 1420,
  },
  {
    id: "doc-2",
    title: "HSC Board Syllabus & Marks Distribution (Science)",
    category: "Syllabus",
    file_url: "/documents/syllabus-science.pdf",
    file_size: "2.1 MB",
    file_type: "PDF",
    is_active: true,
    downloads_count: 890,
  },
  {
    id: "doc-3",
    title: "HSC Board Syllabus & Marks Distribution (Business Studies)",
    category: "Syllabus",
    file_url: "/documents/syllabus-business.pdf",
    file_size: "1.8 MB",
    file_type: "PDF",
    is_active: true,
    downloads_count: 650,
  },
  {
    id: "doc-4",
    title: "Student Leave Application Form",
    category: "General Forms",
    file_url: "/documents/leave-application.pdf",
    file_size: "350 KB",
    file_type: "PDF",
    is_active: true,
    downloads_count: 420,
  },
  {
    id: "doc-5",
    title: "Code of Conduct & Disciplinary Policy Handbook",
    category: "Policies",
    file_url: "/documents/conduct-handbook.pdf",
    file_size: "820 KB",
    file_type: "PDF",
    is_active: true,
    downloads_count: 310,
  },
];

export const defaultHolidays: HolidayRecord[] = [
  { id: "hol-1", title: "New Year Day", start_date: "2026-01-01", end_date: "2026-01-01", total_days: 1, type: "National", description: "First day of the Gregorian year", year: 2026 },
  { id: "hol-2", title: "International Mother Language Day", start_date: "2026-02-21", end_date: "2026-02-21", total_days: 1, type: "National", description: "Martyrs Day and International Mother Language Day", year: 2026 },
  { id: "hol-3", title: "Independence and National Day", start_date: "2026-03-26", end_date: "2026-03-26", total_days: 1, type: "National", description: "Commemoration of National Independence", year: 2026 },
  { id: "hol-4", title: "Bengali New Year (Pohela Boishakh)", start_date: "2026-04-14", end_date: "2026-04-14", total_days: 1, type: "Cultural", description: "First day of Bengali calendar 1433", year: 2026 },
  { id: "hol-5", title: "Eid-ul-Fitr Vacation", start_date: "2026-03-18", end_date: "2026-03-24", total_days: 7, type: "Religious", description: "Holy Eid-ul-Fitr festival and break", year: 2026 },
  { id: "hol-6", title: "Summer Vacation", start_date: "2026-06-15", end_date: "2026-06-25", total_days: 11, type: "Academic", description: "Mid-year academic summer break", year: 2026 },
  { id: "hol-7", title: "National Mourning Day", start_date: "2026-08-15", end_date: "2026-08-15", total_days: 1, type: "National", description: "National Mourning Day", year: 2026 },
  { id: "hol-8", title: "Durga Puja", start_date: "2026-10-18", end_date: "2026-10-21", total_days: 4, type: "Religious", description: "Sharodiya Durga Puja festivities", year: 2026 },
  { id: "hol-9", title: "Victory Day", start_date: "2026-12-16", end_date: "2026-12-16", total_days: 1, type: "National", description: "National Victory Day", year: 2026 },
  { id: "hol-10", title: "Winter Vacation", start_date: "2026-12-24", end_date: "2026-12-31", total_days: 8, type: "Academic", description: "Annual winter vacation", year: 2026 },
];

export const defaultCareers: CareerCircularRecord[] = [
  {
    id: "car-1",
    title: "Recruitment of Lecturer in English",
    post_name: "Lecturer (English)",
    vacancy: 2,
    employment_type: "Full-time",
    deadline: "2026-12-31",
    circular_file_url: "/careers/lecturer-english.pdf",
    requirements:
      "Minimum Master's degree in English with at least two 1st class/division (or CGPA 3.0+). Prior teaching experience at HSC level preferred.",
    application_instructions:
      "Send CV, attested copies of certificates, and 2 passport photos to hr@dhakamodelcollege.edu.bd or submit at principal's office.",
    status: "published",
  },
  {
    id: "car-2",
    title: "Recruitment of ICT Demonstrator / Lab Assistant",
    post_name: "ICT Demonstrator",
    vacancy: 1,
    employment_type: "Full-time",
    deadline: "2026-12-25",
    circular_file_url: "/careers/ict-demonstrator.pdf",
    requirements:
      "Diploma in Computer Technology or B.Sc in CSE. Strong hands-on knowledge in PC troubleshooting, networking, and Python/C programming.",
    application_instructions:
      "Apply through the online portal or submit sealed application addressed to the Principal by the deadline.",
    status: "published",
  },
];

/** Fetch notices with optional category filter */
export async function getNotices(options?: {
  category?: string;
  status?: string;
  limit?: number;
  includeExpired?: boolean;
}): Promise<NoticeRecord[]> {
  const supabase = options?.status ? mainAdmin() || mainPublic() : mainPublic();
  const nowIso = new Date().toISOString();

  if (supabase) {
    try {
      let query = supabase.from("notices").select("*").order("is_pinned", { ascending: false }).order("published_at", { ascending: false });
      if (options?.status && options.status !== "all") {
        query = query.eq("status", options.status);
      } else if (!options?.status) {
        query = query.eq("status", "published");
      }

      // Automatically filter out expired notices for public display
      if (!options?.includeExpired && (!options?.status || options.status === "published")) {
        query = query.or(`expires_at.is.null,expires_at.gt.${nowIso}`);
      }

      if (options?.category && options.category !== "all") query = query.eq("category", options.category);
      if (options?.limit) query = query.limit(options.limit);

      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as NoticeRecord[];
    } catch {
      // fallback
    }
  }

  const now = new Date();
  let list = [...defaultNotices];

  // Auto-hide expired notices
  if (!options?.includeExpired && (!options?.status || options.status === "published")) {
    list = list.filter((n) => !n.expires_at || new Date(n.expires_at) > now);
  }

  if (options?.category && options.category !== "all") {
    list = list.filter((n) => n.category.toLowerCase() === options.category?.toLowerCase());
  }
  if (options?.status && options.status !== "all") {
    list = list.filter((n) => n.status === options.status);
  }
  if (options?.limit) {
    list = list.slice(0, options.limit);
  }
  return list;
}

export async function getNoticeBySlug(slug: string): Promise<NoticeRecord | null> {
  const supabase = mainPublic();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("notices").select("*").eq("slug", slug).maybeSingle();
      if (!error && data) return data as NoticeRecord;
    } catch {
      // fallback
    }
  }
  return defaultNotices.find((n) => n.slug === slug) ?? null;
}

/** Fetch news & events */
export async function getNewsEvents(options?: {
  type?: "news" | "event";
  status?: string;
  limit?: number;
}): Promise<NewsEventRecord[]> {
  const supabase = options?.status ? mainAdmin() || mainPublic() : mainPublic();
  if (supabase) {
    try {
      let query = supabase.from("news_events").select("*").order("published_at", { ascending: false });
      if (options?.status) query = query.eq("status", options.status);
      else query = query.eq("status", "published");
      if (options?.type) query = query.eq("type", options.type);
      if (options?.limit) query = query.limit(options.limit);

      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as NewsEventRecord[];
    } catch {
      // fallback
    }
  }

  let list = [...defaultNewsEvents];
  if (options?.type) list = list.filter((n) => n.type === options.type);
  if (options?.status) list = list.filter((n) => n.status === options.status);
  if (options?.limit) list = list.slice(0, options.limit);
  return list;
}

export async function getNewsEventBySlug(slug: string): Promise<NewsEventRecord | null> {
  const supabase = mainPublic();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("news_events").select("*").eq("slug", slug).maybeSingle();
      if (!error && data) return data as NewsEventRecord;
    } catch {
      // fallback
    }
  }
  return defaultNewsEvents.find((n) => n.slug === slug) ?? null;
}

/** Fetch gallery albums */
export async function getGalleryAlbums(status?: string): Promise<GalleryAlbumRecord[]> {
  const supabase = status ? mainAdmin() || mainPublic() : mainPublic();
  if (supabase) {
    try {
      let query = supabase.from("gallery_albums").select("*").order("created_at", { ascending: false });
      if (status) query = query.eq("status", status);
      else query = query.eq("status", "published");

      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as GalleryAlbumRecord[];
    } catch {
      // fallback
    }
  }
  return defaultAlbums;
}

export async function getGalleryAlbumBySlug(slug: string): Promise<GalleryAlbumRecord | null> {
  const supabase = mainPublic();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("gallery_albums").select("*").eq("slug", slug).maybeSingle();
      if (!error && data) return data as GalleryAlbumRecord;
    } catch {
      // fallback
    }
  }
  return defaultAlbums.find((a) => a.slug === slug) ?? null;
}

export async function getGalleryItems(albumId: string): Promise<GalleryItemRecord[]> {
  const supabase = mainPublic();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .eq("album_id", albumId)
        .order("position", { ascending: true });
      if (!error && data && data.length > 0) return data as GalleryItemRecord[];
    } catch {
      // fallback
    }
  }
  return [];
}

/** Fetch documents */
export async function getDocuments(options?: {
  category?: string;
  activeOnly?: boolean;
}): Promise<DocumentRecord[]> {
  const supabase = mainPublic();
  if (supabase) {
    try {
      let query = supabase.from("documents").select("*").order("created_at", { ascending: false });
      if (options?.activeOnly !== false) query = query.eq("is_active", true);
      if (options?.category && options.category !== "all") query = query.eq("category", options.category);

      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as DocumentRecord[];
    } catch {
      // fallback
    }
  }

  let list = [...defaultDocuments];
  if (options?.category && options.category !== "all") {
    list = list.filter((d) => d.category.toLowerCase() === options.category?.toLowerCase());
  }
  return list;
}

/** Fetch holidays */
export async function getHolidays(year = 2026): Promise<HolidayRecord[]> {
  const supabase = mainPublic();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("holidays")
        .select("*")
        .eq("year", year)
        .order("start_date", { ascending: true });
      if (!error && data && data.length > 0) return data as HolidayRecord[];
    } catch {
      // fallback
    }
  }
  return defaultHolidays;
}

/** Fetch careers */
export async function getCareerCirculars(status?: string): Promise<CareerCircularRecord[]> {
  const supabase = status ? mainAdmin() || mainPublic() : mainPublic();
  if (supabase) {
    try {
      let query = supabase.from("career_circulars").select("*").order("deadline", { ascending: true });
      if (status) query = query.eq("status", status);
      else query = query.eq("status", "published");

      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as CareerCircularRecord[];
    } catch {
      // fallback
    }
  }
  return defaultCareers;
}

export async function getCareerCircularById(id: string): Promise<CareerCircularRecord | null> {
  const supabase = mainPublic();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("career_circulars").select("*").eq("id", id).maybeSingle();
      if (!error && data) return data as CareerCircularRecord;
    } catch {
      // fallback
    }
  }
  return defaultCareers.find((c) => c.id === id) ?? null;
}

/** Aggregate counts for Admin Content overview */
export async function getContentDashboardStats() {
  const [notices, news, albums, docs, holidays, careers] = await Promise.all([
    getNotices({ status: undefined }),
    getNewsEvents({ status: undefined }),
    getGalleryAlbums(),
    getDocuments({ activeOnly: false }),
    getHolidays(),
    getCareerCirculars(),
  ]);

  return {
    totalNotices: notices.length,
    urgentNotices: notices.filter((n) => n.is_urgent).length,
    totalNews: news.filter((n) => n.type === "news").length,
    totalEvents: news.filter((n) => n.type === "event").length,
    totalAlbums: albums.length,
    totalDocuments: docs.length,
    totalHolidays: holidays.length,
    totalCareers: careers.length,
  };
}
