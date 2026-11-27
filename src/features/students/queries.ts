import "server-only";
import { privateAdmin } from "@/lib/supabase/private-server";
import type { StudentRecord, BatchRecord, StudentStats, StudyGroup, StudentStatus } from "./types";

export const defaultBatches: BatchRecord[] = [
  {
    id: "batch-2026",
    name: "HSC Batch 26",
    exam_year: 2026,
    status: "running",
    current_year: "second_year",
  },
  {
    id: "batch-2027",
    name: "HSC Batch 27",
    exam_year: 2027,
    status: "running",
    current_year: "first_year",
  },
];

export const defaultStudents: StudentRecord[] = [
  {
    id: "std-001",
    student_code: "STU-2026-1001",
    full_name: "Tanvir Ahmed",
    bangla_name: "তানভীর আহমেদ",
    batch_id: "batch-2026",
    batch_name: "HSC Batch 26",
    study_group: "science",
    roll: 101,
    status: "active",
    gender: "male",
    religion: "Islam",
    date_of_birth: "2008-04-15",
    blood_group: "B+",
    phone: "01712345678",
    email: "tanvir.ahmed@student.college.edu",
    address: "House 24, Road 7, Sector 4, Uttara, Dhaka",
    permanent_address: "Village: Ramnagar, Post: Kaliganj, Gazipur",
    father_name: "Khandaker Mustafizur Rahman",
    father_phone: "01819223344",
    mother_name: "Nasima Akter",
    mother_phone: "01911556677",
    guardian_name: "Khandaker Mustafizur Rahman",
    guardian_phone: "01819223344",
    guardian_relation: "Father",
    photo_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    rfid_card_id: "RFID-94821",
    notes: "Science Olympiad Winner 2025",
    created_at: "2024-07-01T00:00:00Z",
    updated_at: "2024-07-01T00:00:00Z",
  },
  {
    id: "std-002",
    student_code: "STU-2026-1002",
    full_name: "Farhana Yasmin",
    bangla_name: "ফারহানা ইয়াসমিন",
    batch_id: "batch-2026",
    batch_name: "HSC Batch 26",
    study_group: "science",
    roll: 102,
    status: "active",
    gender: "female",
    religion: "Islam",
    date_of_birth: "2008-08-20",
    blood_group: "A+",
    phone: "01798765432",
    email: "farhana.yasmin@student.college.edu",
    address: "Flat 5B, Lakeview Tower, Gulshan-2, Dhaka",
    father_name: "Engr. Monirul Islam",
    mother_name: "Begum Salma Khatun",
    guardian_name: "Engr. Monirul Islam",
    guardian_phone: "01711223344",
    guardian_relation: "Father",
    photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    rfid_card_id: "RFID-94822",
    notes: "Math Club President",
    created_at: "2024-07-01T00:00:00Z",
    updated_at: "2024-07-01T00:00:00Z",
  },
  {
    id: "std-003",
    student_code: "STU-2026-2001",
    full_name: "Rakibul Hasan",
    bangla_name: "রাকিবুল হাসান",
    batch_id: "batch-2026",
    batch_name: "HSC Batch 26",
    study_group: "business_studies",
    roll: 201,
    status: "active",
    gender: "male",
    religion: "Islam",
    date_of_birth: "2008-02-10",
    blood_group: "O+",
    phone: "01855667788",
    email: "rakibul.hasan@student.college.edu",
    address: "Dhanmondi 8/A, Dhaka",
    father_name: "Abdur Rashid",
    mother_name: "Hasna Begum",
    guardian_name: "Abdur Rashid",
    guardian_phone: "01855667700",
    guardian_relation: "Father",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    rfid_card_id: "RFID-94823",
    notes: "Debating Club Executive",
    created_at: "2024-07-01T00:00:00Z",
    updated_at: "2024-07-01T00:00:00Z",
  },
  {
    id: "std-004",
    student_code: "STU-2027-3001",
    full_name: "Sadia Afrin",
    bangla_name: "সাদিয়া আফরিন",
    batch_id: "batch-2027",
    batch_name: "HSC Batch 27",
    study_group: "humanities",
    roll: 301,
    status: "active",
    gender: "female",
    religion: "Islam",
    date_of_birth: "2009-01-12",
    blood_group: "AB+",
    phone: "01999887766",
    email: "sadia.afrin@student.college.edu",
    address: "Mirpur 10, Dhaka",
    father_name: "Kazi Nurul Huda",
    mother_name: "Ferdousi Begum",
    guardian_name: "Kazi Nurul Huda",
    guardian_phone: "01999887700",
    guardian_relation: "Father",
    photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    rfid_card_id: "RFID-94824",
    notes: "Cultural Secretary",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-07-01T00:00:00Z",
  },
];

export async function getBatches(): Promise<BatchRecord[]> {
  const supabase = privateAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .order("exam_year", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as BatchRecord[];
      }
    } catch {
      // fallback
    }
  }
  return defaultBatches;
}

export async function getStudents(filters?: {
  batchId?: string;
  group?: StudyGroup | "all";
  status?: StudentStatus | "all";
  search?: string;
}): Promise<StudentRecord[]> {
  const supabase = privateAdmin();
  if (supabase) {
    try {
      let query = supabase
        .from("students")
        .select(`
          *,
          batches:batch_id (
            id,
            name,
            exam_year,
            current_year
          )
        `)
        .order("roll", { ascending: true });

      if (filters?.batchId && filters.batchId !== "all") {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.batchId);
        if (isUuid) {
          query = query.eq("batch_id", filters.batchId);
        } else {
          // If a batch name or slug was passed, find batch id
          const { data: bMatch } = await supabase
            .from("batches")
            .select("id")
            .or(`id.eq.${filters.batchId},name.ilike.%${filters.batchId}%`)
            .maybeSingle();
          if (bMatch?.id) {
            query = query.eq("batch_id", bMatch.id);
          } else {
            query = query.eq("batch_id", filters.batchId);
          }
        }
      }
      if (filters?.group && filters.group !== "all") {
        query = query.eq("study_group", filters.group);
      }
      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.trim();
        query = query.or(`full_name.ilike.%${q}%,student_code.ilike.%${q}%,phone.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d: any) => {
          let ext: Record<string, any> = {};
          if (d.notes && d.notes.startsWith("{")) {
            try {
              ext = JSON.parse(d.notes);
            } catch {}
          }
          return {
            ...d,
            batch_name: d.batches?.name || "Unassigned",
            photo_url: d.photo_url || d.photo_key || null,
            academic_session: d.academic_session || ext.academic_session || "2025-2026",
            admission_date: d.admission_date || ext.admission_date,
            registration_number: d.registration_number || ext.registration_number,
            previous_institution: d.previous_institution || ext.previous_institution,
            document_url: d.document_url || ext.document_url,
            document_name: d.document_name || ext.document_name,
            has_password: Boolean(d.password_hash || ext.password_hash || ext.current_password),
            password_hash: d.password_hash || ext.password_hash,
            current_password: d.current_password || ext.current_password || (d.password_hash ? undefined : "student123"),
            notes: ext.admin_notes || d.notes,
          };
        }) as StudentRecord[];
      }
    } catch {
      // fallback
    }
  }

  // Fallback filtering
  let list = [...defaultStudents];
  if (filters?.batchId && filters.batchId !== "all") {
    const qb = filters.batchId.toLowerCase();
    list = list.filter(
      (s) => s.batch_id.toLowerCase() === qb || (s.batch_name && s.batch_name.toLowerCase().includes(qb))
    );
  }
  if (filters?.group && filters.group !== "all") {
    list = list.filter((s) => s.study_group === filters.group);
  }
  if (filters?.status && filters.status !== "all") {
    list = list.filter((s) => s.status === filters.status);
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.student_code.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        s.roll.toString().includes(q)
    );
  }
  return list;
}

export async function getStudentById(id: string): Promise<StudentRecord | null> {
  const supabase = privateAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          batches:batch_id (
            id,
            name,
            exam_year,
            current_year
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        let ext: Record<string, any> = {};
        if (data.notes && data.notes.startsWith("{")) {
          try {
            ext = JSON.parse(data.notes);
          } catch {}
        }
        return {
          ...data,
          batch_name: data.batches?.name || "Unassigned",
          photo_url: data.photo_url || data.photo_key || null,
          academic_session: data.academic_session || ext.academic_session || "2025-2026",
          admission_date: data.admission_date || ext.admission_date,
          registration_number: data.registration_number || ext.registration_number,
          previous_institution: data.previous_institution || ext.previous_institution,
          document_url: data.document_url || ext.document_url,
          document_name: data.document_name || ext.document_name,
          has_password: Boolean(data.password_hash || ext.password_hash || ext.current_password),
          password_hash: data.password_hash || ext.password_hash,
          current_password: data.current_password || ext.current_password || (data.password_hash ? undefined : "student123"),
          notes: ext.admin_notes || data.notes,
        } as StudentRecord;
      }
    } catch {
      // fallback
    }
  }

  return defaultStudents.find((s) => s.id === id) || null;
}

export async function getStudentStats(): Promise<StudentStats> {
  const students = await getStudents();
  return {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === "active").length,
    scienceCount: students.filter((s) => s.study_group === "science").length,
    businessCount: students.filter((s) => s.study_group === "business_studies").length,
    humanitiesCount: students.filter((s) => s.study_group === "humanities").length,
    maleCount: students.filter((s) => s.gender === "male").length,
    femaleCount: students.filter((s) => s.gender === "female").length,
  };
}
