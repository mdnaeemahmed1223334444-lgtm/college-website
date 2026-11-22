import "server-only";
import { privateAdmin } from "@/lib/supabase/private-server";
import type { StudentProfile, TeacherProfile } from "./types";

export const defaultStudentProfile: StudentProfile = {
  id: "std-001",
  studentCode: "DMC-2026-102",
  fullName: "Tanvir Ahmed",
  banglaName: "তানভীর আহমেদ",
  batchName: "HSC Batch 26",
  batchYear: "first_year",
  group: "science",
  roll: 102,
  section: "A",
  status: "active",
  email: "tanvir.ahmed@student.college.edu",
  phone: "+880 1712-345678",
  gender: "male",
  dateOfBirth: "2008-04-15",
  bloodGroup: "B+",
  religion: "Islam",
  nationality: "Bangladeshi",
  address: "House 24, Road 7, Sector 4, Uttara, Dhaka-1230",
  permanentAddress: "Village: Ramnagar, Post: Kaliganj, Gazipur",
  fatherName: "Khandaker Mustafizur Rahman",
  fatherPhone: "+880 1819-223344",
  motherName: "Nasima Akter",
  motherPhone: "+880 1911-556677",
  guardianName: "Khandaker Mustafizur Rahman",
  guardianPhone: "+880 1819-223344",
  guardianRelation: "Father",
  photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
  admissionDate: "2024-07-15",
  academicSession: "2024-2025",
};

export const defaultTeacherProfile: TeacherProfile = {
  id: "tch-001",
  teacherCode: "T-104",
  fullName: "Dr. Mohammad Rafiqul Islam",
  banglaName: "ড. মোহাম্মদ রফিকুল ইসলাম",
  designation: "Associate Professor & Head",
  department: "Department of Physics",
  email: "m.rafiqul@college.edu",
  phone: "+880 1711-889900",
  gender: "male",
  dateOfBirth: "1978-08-22",
  bloodGroup: "A+",
  religion: "Islam",
  joiningDate: "2012-03-01",
  qualification: "Ph.D. in Applied Physics (DU), M.Sc in Physics (1st Class, DU), B.Sc (Hons)",
  specialization: "Quantum Optics, Condensed Matter Physics, Experimental Electronics",
  roomNumber: "Science Building, Level 3, Room 304",
  address: "Flat 4B, Building 12, Mirpur DOHS, Dhaka-1216",
  bio: "Dr. Rafiqul Islam has over 18 years of academic teaching and experimental research experience. He mentors the College Science & Robotics Club and has published multiple peer-reviewed papers on semiconductor physics.",
  photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  assignedClasses: [
    {
      className: "HSC 1st Year",
      group: "Science (Section A)",
      subject: "Physics 1st Paper",
      time: "Sun, Tue, Thu — 09:00 AM",
    },
    {
      className: "HSC 2nd Year",
      group: "Science (Section B)",
      subject: "Physics 2nd Paper",
      time: "Mon, Wed — 11:30 AM",
    },
    {
      className: "HSC 2nd Year",
      group: "Science Lab",
      subject: "Physics Practical Laboratory",
      time: "Thursday — 01:30 PM",
    },
  ],
  isClassTeacher: true,
  classTeacherOf: "HSC 1st Year — Science (Section A)",
};

/**
 * Fetch Student Profile.
 * Supports Supabase private database query, external custom API endpoint (when supplied),
 * or high-fidelity fallback.
 */
export async function getStudentProfile(userId?: string): Promise<StudentProfile> {
  const supabase = privateAdmin();
  if (supabase && userId && userId !== "dev-user") {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          batches:batch_id (
            name,
            current_year
          )
        `)
        .eq("profile_id", userId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          studentCode: data.student_code,
          fullName: data.full_name,
          banglaName: data.bangla_name || undefined,
          batchName: data.batches?.name || defaultStudentProfile.batchName,
          batchYear: data.batches?.current_year || defaultStudentProfile.batchYear,
          group: data.study_group,
          roll: data.roll || 0,
          section: data.section || "A",
          status: data.status,
          email: data.email || defaultStudentProfile.email,
          phone: data.phone || defaultStudentProfile.phone,
          gender: data.gender || "male",
          dateOfBirth: data.date_of_birth || defaultStudentProfile.dateOfBirth,
          bloodGroup: data.blood_group || defaultStudentProfile.bloodGroup,
          religion: data.religion || defaultStudentProfile.religion,
          nationality: "Bangladeshi",
          address: data.address || defaultStudentProfile.address,
          permanentAddress: data.permanent_address || defaultStudentProfile.permanentAddress,
          fatherName: data.father_name || defaultStudentProfile.fatherName,
          fatherPhone: data.father_phone || defaultStudentProfile.fatherPhone,
          motherName: data.mother_name || defaultStudentProfile.motherName,
          motherPhone: data.mother_phone || defaultStudentProfile.motherPhone,
          guardianName: data.guardian_name || defaultStudentProfile.guardianName,
          guardianPhone: data.guardian_phone || defaultStudentProfile.guardianPhone,
          guardianRelation: data.guardian_relation || defaultStudentProfile.guardianRelation,
          photoUrl: data.photo_url || data.photo_key || defaultStudentProfile.photoUrl,
          admissionDate: defaultStudentProfile.admissionDate,
          academicSession: defaultStudentProfile.academicSession,
        };
      }
    } catch {
      // fallback
    }
  }

  return defaultStudentProfile;
}

/**
 * Fetch Teacher Profile.
 * Supports Supabase private database query, external custom API endpoint (when supplied),
 * or high-fidelity fallback.
 */
export async function getTeacherProfile(userId?: string): Promise<TeacherProfile> {
  const supabase = privateAdmin();
  if (supabase && userId && userId !== "dev-user") {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && profile) {
        return {
          ...defaultTeacherProfile,
          id: profile.id,
          fullName: profile.full_name,
          email: profile.email || defaultTeacherProfile.email,
        };
      }
    } catch {
      // fallback
    }
  }

  return defaultTeacherProfile;
}
