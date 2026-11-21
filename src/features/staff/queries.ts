import { privateAdmin } from "@/lib/supabase/private-server";
import type { StaffProfileRecord, StaffStats, StaffAttendanceRecord, StaffFilter } from "./types";

export const DEFAULT_STAFF_MEMBERS: StaffProfileRecord[] = [
  // Principal & Administration
  {
    id: "staff-001",
    employee_id: "T-100",
    full_name: "Prof. Dr. Mohammad Rafiqul Islam",
    bangla_name: "প্রফেসর ড. মোহাম্মদ রফিকুল ইসলাম",
    role: "teacher",
    designation: "Principal",
    department: "Administration",
    email: "principal@college.edu.bd",
    phone: "+880 1711-000101",
    gender: "male",
    blood_group: "O+",
    date_of_birth: "1968-05-14",
    nid: "1968269000101001",
    present_address: "Principal's Quarter, College Campus, Dhaka",
    permanent_address: "Mirpur, Dhaka",
    highest_degree: "Ph.D in Physics, M.Sc (DU)",
    institution: "University of Dhaka",
    specialization: "Solid State Physics & Educational Administration",
    experience_years: 28,
    joining_date: "1998-02-15",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    bio: "Prof. Dr. Rafiqul Islam has served in higher secondary and degree college education for over 28 years, leading national curriculum committees and academic excellence initiatives.",
    room_number: "Room 101, Administrative Building",
    is_head_of_department: true,
    is_class_teacher: false,
    weekly_periods: 6,
    assigned_subjects: ["Physics 2nd Paper (Selected Topics)"],
    assigned_classes: ["XII Science A"],
    display_order: 1,
    show_on_website: true,
  },
  {
    id: "staff-002",
    employee_id: "T-101",
    full_name: "Mrs. Nasreen Akhter",
    bangla_name: "নাসরীন আক্তার",
    role: "teacher",
    designation: "Vice Principal & Associate Professor",
    department: "English",
    email: "nasreen.akhter@college.edu.bd",
    phone: "+880 1711-000102",
    gender: "female",
    blood_group: "A+",
    date_of_birth: "1972-09-20",
    highest_degree: "M.A in English Literature (DU), B.A (Hons)",
    institution: "University of Dhaka",
    specialization: "Modern English Literature & ELT",
    experience_years: 22,
    joining_date: "2003-04-10",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    bio: "Dedicated educationist with expertise in communicative language teaching, faculty mentoring, and student welfare governance.",
    room_number: "Room 102, Administrative Building",
    is_head_of_department: false,
    is_class_teacher: false,
    weekly_periods: 10,
    assigned_subjects: ["English 1st Paper", "English 2nd Paper"],
    assigned_classes: ["XI Science A", "XII Business Studies"],
    display_order: 2,
    show_on_website: true,
  },
  // Science Faculty
  {
    id: "staff-003",
    employee_id: "T-102",
    full_name: "Dr. Kazi Mahbubur Rahman",
    bangla_name: "ড. কাজী মাহবুবুর রহমান",
    role: "teacher",
    designation: "Associate Professor & Head of Department",
    department: "Physics",
    email: "kazi.mahbub@college.edu.bd",
    phone: "+880 1711-000103",
    gender: "male",
    blood_group: "B+",
    date_of_birth: "1975-11-08",
    highest_degree: "Ph.D in Nuclear Physics, M.Sc (BUET/DU)",
    institution: "University of Dhaka",
    specialization: "Quantum Mechanics & Semiconductor Devices",
    experience_years: 20,
    joining_date: "2005-08-01",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    bio: "Author of HSC Physics textbooks, national science fair coordinator, and senior examiner.",
    room_number: "Science Lab Complex, Room 204",
    is_head_of_department: true,
    is_class_teacher: true,
    class_teacher_section: "Class XI - Science A",
    weekly_periods: 18,
    assigned_subjects: ["Physics 1st Paper", "Physics 2nd Paper", "Physics Practical"],
    assigned_classes: ["XI Science A", "XI Science B", "XII Science A"],
    display_order: 3,
    show_on_website: true,
  },
  {
    id: "staff-004",
    employee_id: "T-103",
    full_name: "Mr. Tanvir Hasan",
    bangla_name: "তানভীর হাসান",
    role: "teacher",
    designation: "Assistant Professor",
    department: "Chemistry",
    email: "tanvir.hasan@college.edu.bd",
    phone: "+880 1711-000104",
    gender: "male",
    blood_group: "O+",
    date_of_birth: "1982-03-25",
    highest_degree: "M.Sc in Applied Chemistry & Chemical Engineering (RU)",
    institution: "University of Rajshahi",
    specialization: "Organic Synthesis & Environmental Chemistry",
    experience_years: 14,
    joining_date: "2011-02-15",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    bio: "Inspiring chemistry educator focusing on concept clarity and hands-on laboratory exploration.",
    room_number: "Chemistry Lab Building, Room 102",
    is_head_of_department: true,
    is_class_teacher: true,
    class_teacher_section: "Class XI - Science B",
    weekly_periods: 20,
    assigned_subjects: ["Chemistry 1st Paper", "Chemistry 2nd Paper", "Chemistry Practical"],
    assigned_classes: ["XI Science A", "XI Science B", "XII Science B"],
    display_order: 4,
    show_on_website: true,
  },
  {
    id: "staff-005",
    employee_id: "T-104",
    full_name: "Mrs. Sultana Parvin",
    bangla_name: "সুলতানা পারভীন",
    role: "teacher",
    designation: "Assistant Professor & Head of Department",
    department: "Biology",
    email: "sultana.parvin@college.edu.bd",
    phone: "+880 1711-000105",
    gender: "female",
    blood_group: "AB+",
    date_of_birth: "1984-06-18",
    highest_degree: "M.Sc in Botany (DU), B.Sc (Hons)",
    institution: "University of Dhaka",
    specialization: "Genetics, Plant Biotechnology & Physiology",
    experience_years: 12,
    joining_date: "2013-05-10",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    bio: "Head of Biology Department, coordinator of Nature Club, and medical admission test mentor.",
    room_number: "Biology Wing, Room 301",
    is_head_of_department: true,
    is_class_teacher: false,
    weekly_periods: 18,
    assigned_subjects: ["Biology 1st Paper (Botany)", "Biology 2nd Paper (Zoology)"],
    assigned_classes: ["XI Science A", "XII Science A", "XII Science B"],
    display_order: 5,
    show_on_website: true,
  },
  {
    id: "staff-006",
    employee_id: "T-105",
    full_name: "Mr. Abul Kalam Azad",
    bangla_name: "আবুল কালাম আজাদ",
    role: "teacher",
    designation: "Senior Lecturer",
    department: "Mathematics",
    email: "azad.math@college.edu.bd",
    phone: "+880 1711-000106",
    gender: "male",
    blood_group: "A-",
    date_of_birth: "1986-12-04",
    highest_degree: "M.Sc in Pure Mathematics (JU)",
    institution: "Jahangirnagar University",
    specialization: "Differential Calculus, Geometry & Vectors",
    experience_years: 10,
    joining_date: "2015-01-20",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
    bio: "Math Olympiad mentor with a track record of preparing students for top engineering universities.",
    room_number: "Main Academic Building, Room 208",
    is_head_of_department: true,
    is_class_teacher: true,
    class_teacher_section: "Class XII - Science A",
    weekly_periods: 22,
    assigned_subjects: ["Higher Mathematics 1st Paper", "Higher Mathematics 2nd Paper"],
    assigned_classes: ["XI Science A", "XI Science B", "XII Science A", "XII Science B"],
    display_order: 6,
    show_on_website: true,
  },
  {
    id: "staff-007",
    employee_id: "T-106",
    full_name: "Ms. Farhana Haque",
    bangla_name: "ফারহানা হক",
    role: "teacher",
    designation: "Lecturer",
    department: "Information & Communication Technology",
    email: "farhana.ict@college.edu.bd",
    phone: "+880 1711-000107",
    gender: "female",
    blood_group: "O+",
    date_of_birth: "1991-08-12",
    highest_degree: "B.Sc in Computer Science & Engineering (CUET)",
    institution: "Chittagong University of Engineering & Technology",
    specialization: "Web Technologies, C Programming & Database Systems",
    experience_years: 7,
    joining_date: "2018-09-01",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    bio: "ICT lab supervisor, robotics club mentor, and developer of the digital classroom portal.",
    room_number: "Computer Lab 1",
    is_head_of_department: true,
    is_class_teacher: false,
    weekly_periods: 20,
    assigned_subjects: ["Information & Communication Technology (Theory & Lab)"],
    assigned_classes: ["XI Science", "XI Humanities", "XI Business Studies", "XII All"],
    display_order: 7,
    show_on_website: true,
  },
  // Business Studies Faculty
  {
    id: "staff-008",
    employee_id: "T-107",
    full_name: "Mr. Anisur Rahman",
    bangla_name: "আনিসুর রহমান",
    role: "teacher",
    designation: "Assistant Professor & Head of Department",
    department: "Accounting",
    email: "anisur.accounting@college.edu.bd",
    phone: "+880 1711-000108",
    gender: "male",
    blood_group: "B+",
    date_of_birth: "1980-04-16",
    highest_degree: "M.Com in Accounting (DU), CA (CC)",
    institution: "University of Dhaka",
    specialization: "Financial Accounting & Cost Management",
    experience_years: 16,
    joining_date: "2009-06-15",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    bio: "Head of Business Studies stream, expert in IFRS financial reporting and commerce curriculum.",
    room_number: "Commerce Faculty Room 104",
    is_head_of_department: true,
    is_class_teacher: true,
    class_teacher_section: "Class XI - Business Studies A",
    weekly_periods: 18,
    assigned_subjects: ["Accounting 1st Paper", "Accounting 2nd Paper"],
    assigned_classes: ["XI Business Studies A", "XII Business Studies A"],
    display_order: 8,
    show_on_website: true,
  },
  {
    id: "staff-009",
    employee_id: "T-108",
    full_name: "Mrs. Shamima Nasrin",
    bangla_name: "শামীমা নাসরিন",
    role: "teacher",
    designation: "Senior Lecturer",
    department: "Business Organization & Management",
    email: "shamima.bom@college.edu.bd",
    phone: "+880 1711-000109",
    gender: "female",
    blood_group: "A+",
    date_of_birth: "1985-02-28",
    highest_degree: "MBA in Management Studies (DU)",
    institution: "University of Dhaka",
    specialization: "Human Resource Management & Business Ethics",
    experience_years: 11,
    joining_date: "2014-03-01",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80",
    bio: "Passionate educator guiding students in business communication, entrepreneurship, and leadership.",
    room_number: "Commerce Faculty Room 105",
    is_head_of_department: true,
    is_class_teacher: false,
    weekly_periods: 16,
    assigned_subjects: ["Business Organization & Management 1st & 2nd Paper"],
    assigned_classes: ["XI Business Studies A", "XII Business Studies A"],
    display_order: 9,
    show_on_website: true,
  },
  {
    id: "staff-010",
    employee_id: "T-109",
    full_name: "Mr. Golam Sarwar",
    bangla_name: "গোলাম সারওয়ার",
    role: "teacher",
    designation: "Lecturer",
    department: "Finance & Banking",
    email: "sarwar.finance@college.edu.bd",
    phone: "+880 1711-000110",
    gender: "male",
    blood_group: "O-",
    date_of_birth: "1990-07-21",
    highest_degree: "M.Com in Banking & Insurance (DU)",
    institution: "University of Dhaka",
    specialization: "Banking Operations & Capital Markets",
    experience_years: 8,
    joining_date: "2017-01-15",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    bio: "Coordinates business quiz competitions and stock market investment workshops for young scholars.",
    room_number: "Commerce Faculty Room 106",
    is_head_of_department: true,
    is_class_teacher: false,
    weekly_periods: 16,
    assigned_subjects: ["Finance, Banking & Insurance 1st & 2nd Paper"],
    assigned_classes: ["XI Business Studies A", "XII Business Studies A"],
    display_order: 10,
    show_on_website: true,
  },
  // Humanities Faculty
  {
    id: "staff-011",
    employee_id: "T-110",
    full_name: "Mr. Motiur Rahman",
    bangla_name: "মতিউর রহমান",
    role: "teacher",
    designation: "Associate Professor & Head of Department",
    department: "Bangla",
    email: "motiur.bangla@college.edu.bd",
    phone: "+880 1711-000111",
    gender: "male",
    blood_group: "AB-",
    date_of_birth: "1974-01-15",
    highest_degree: "M.A in Bengali Literature (DU), B.A (Hons)",
    institution: "University of Dhaka",
    specialization: "Modern Bengali Poetry, Drama & Linguistics",
    experience_years: 23,
    joining_date: "2002-09-01",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    bio: "Renowned literary critic, cultural committee president, and chief editor of the annual college magazine.",
    room_number: "Arts Faculty Building, Room 201",
    is_head_of_department: true,
    is_class_teacher: true,
    class_teacher_section: "Class XI - Humanities A",
    weekly_periods: 18,
    assigned_subjects: ["Bangla 1st Paper", "Bangla 2nd Paper"],
    assigned_classes: ["XI Science A", "XI Humanities A", "XII Humanities A"],
    display_order: 11,
    show_on_website: true,
  },
  {
    id: "staff-012",
    employee_id: "T-111",
    full_name: "Mrs. Rokeya Begum",
    bangla_name: "রোকেয়া বেগম",
    role: "teacher",
    designation: "Assistant Professor",
    department: "Economics",
    email: "rokeya.econ@college.edu.bd",
    phone: "+880 1711-000112",
    gender: "female",
    blood_group: "O+",
    date_of_birth: "1981-10-10",
    highest_degree: "M.S.S in Economics (DU)",
    institution: "University of Dhaka",
    specialization: "Macroeconomics, Development Economics & Statistics",
    experience_years: 15,
    joining_date: "2010-04-12",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&auto=format&fit=crop&q=80",
    bio: "Guides students in analytical thinking, socioeconomic surveys, and policy debates.",
    room_number: "Arts Faculty Building, Room 203",
    is_head_of_department: true,
    is_class_teacher: false,
    weekly_periods: 16,
    assigned_subjects: ["Economics 1st Paper", "Economics 2nd Paper"],
    assigned_classes: ["XI Humanities A", "XII Humanities A"],
    display_order: 12,
    show_on_website: true,
  },
  {
    id: "staff-013",
    employee_id: "T-112",
    full_name: "Mr. Jahangir Alam",
    bangla_name: "জাহাঙ্গীর আলম",
    role: "teacher",
    designation: "Senior Lecturer",
    department: "Civics & Good Governance",
    email: "jahangir.civics@college.edu.bd",
    phone: "+880 1711-000113",
    gender: "male",
    blood_group: "B+",
    date_of_birth: "1983-05-30",
    highest_degree: "M.S.S in Political Science (RU)",
    institution: "University of Rajshahi",
    specialization: "Constitutional Law & Governance Studies",
    experience_years: 13,
    joining_date: "2012-07-01",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    bio: "Debate club advisor fostering student engagement in parliamentary debate and constitution literacy.",
    room_number: "Arts Faculty Building, Room 205",
    is_head_of_department: true,
    is_class_teacher: false,
    weekly_periods: 16,
    assigned_subjects: ["Civics & Good Governance 1st & 2nd Paper"],
    assigned_classes: ["XI Humanities A", "XII Humanities A"],
    display_order: 13,
    show_on_website: true,
  },
  // Administrative & Support Staff
  {
    id: "staff-014",
    employee_id: "S-201",
    full_name: "Mr. Abdul Matin",
    bangla_name: "আব্দুল মতিন",
    role: "staff",
    designation: "Head Assistant & Office Superintendent",
    department: "Administration",
    email: "matin.office@college.edu.bd",
    phone: "+880 1711-000201",
    gender: "male",
    blood_group: "A+",
    date_of_birth: "1976-03-12",
    highest_degree: "B.A (Pass), Post-Graduate Diploma in Management",
    institution: "National University",
    specialization: "Institutional Records, Board Correspondence & Archiving",
    experience_years: 24,
    joining_date: "2001-01-15",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    bio: "Oversees general administrative office functions, education board communications, and registry files.",
    room_number: "Main Office, Desk 1",
    display_order: 14,
    show_on_website: true,
  },
  {
    id: "staff-015",
    employee_id: "S-202",
    full_name: "Mr. Kamal Uddin",
    bangla_name: "কামাল উদ্দিন",
    role: "staff",
    designation: "Senior Accountant",
    department: "Accounts & Finance",
    email: "accounts@college.edu.bd",
    phone: "+880 1711-000202",
    gender: "male",
    blood_group: "O+",
    date_of_birth: "1980-08-20",
    highest_degree: "M.Com in Accounting (NU)",
    institution: "National University",
    specialization: "Tuition Billing, Payroll, Bank Reconciliation & Audit",
    experience_years: 18,
    joining_date: "2007-03-01",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    bio: "In charge of student fee collection, financial bookkeeping, monthly staff salaries, and annual fiscal audits.",
    room_number: "Accounts Section, Counter 1",
    display_order: 15,
    show_on_website: true,
  },
  {
    id: "staff-016",
    employee_id: "S-203",
    full_name: "Mrs. Shahnaz Parvin",
    bangla_name: "শাহনাজ পারভীন",
    role: "staff",
    designation: "Librarian",
    department: "Library",
    email: "library@college.edu.bd",
    phone: "+880 1711-000203",
    gender: "female",
    blood_group: "B+",
    date_of_birth: "1986-04-14",
    highest_degree: "M.A in Information Science & Library Management (DU)",
    institution: "University of Dhaka",
    specialization: "Digital Cataloging, Koha ILS, E-Resource Archiving",
    experience_years: 11,
    joining_date: "2014-06-10",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    bio: "Manages central college library housing 25,000+ volumes, journal subscriptions, and student study reading halls.",
    room_number: "Central Library Desk",
    display_order: 16,
    show_on_website: true,
  },
  {
    id: "staff-017",
    employee_id: "S-204",
    full_name: "Mr. Tariqul Islam",
    bangla_name: "তরিকুল ইসলাম",
    role: "staff",
    designation: "IT Officer & System Administrator",
    department: "IT & Media",
    email: "it@college.edu.bd",
    phone: "+880 1711-000204",
    gender: "male",
    blood_group: "AB+",
    date_of_birth: "1992-10-05",
    highest_degree: "B.Sc in Computer Science & Engineering",
    institution: "East West University",
    specialization: "Campus LAN, CCTV Surveillance, Website & Biometrics",
    experience_years: 6,
    joining_date: "2019-11-01",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    bio: "Responsible for network server infrastructure, biometric attendance integration, and smart classroom AV systems.",
    room_number: "Server Room, 2nd Floor",
    display_order: 17,
    show_on_website: true,
  },
  {
    id: "staff-018",
    employee_id: "S-205",
    full_name: "Mr. Babul Mia",
    bangla_name: "বাবুল মিয়া",
    role: "staff",
    designation: "Senior Science Laboratory Demonstrator",
    department: "Physics",
    email: "lab.physics@college.edu.bd",
    phone: "+880 1711-000205",
    gender: "male",
    blood_group: "O+",
    date_of_birth: "1978-02-17",
    highest_degree: "B.Sc (Pass in Physics & Chemistry)",
    institution: "National University",
    specialization: "Optical Apparatus, Vernier Calipers & Electrical Circuits",
    experience_years: 21,
    joining_date: "2004-05-12",
    employment_type: "permanent",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    bio: "Prepares physics experimental apparatus, oversees student safety protocols, and manages equipment calibration.",
    room_number: "Physics Lab Preparation Room",
    display_order: 18,
    show_on_website: true,
  },
];

export async function getStaffList(filter?: StaffFilter): Promise<StaffProfileRecord[]> {
  try {
    const privClient = privateAdmin();
    if (privClient) {
      let query = privClient.from("staff_profiles").select("*").order("display_order", { ascending: true });
      if (filter?.role && filter.role !== "all") {
        query = query.eq("role", filter.role);
      }
      if (filter?.department && filter.department !== "all") {
        query = query.eq("department", filter.department);
      }
      if (filter?.status && filter.status !== "all") {
        query = query.eq("status", filter.status);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let results = data as StaffProfileRecord[];
        if (filter?.search) {
          const s = filter.search.toLowerCase();
          results = results.filter(
            (item) =>
              item.full_name.toLowerCase().includes(s) ||
              item.employee_id.toLowerCase().includes(s) ||
              item.email.toLowerCase().includes(s) ||
              item.phone.includes(s) ||
              item.department.toLowerCase().includes(s)
          );
        }
        return results;
      }
    }
  } catch (err) {
    console.warn("getStaffList fallback to default seeds", err);
  }

  // Fallback seed filtering
  let items = [...DEFAULT_STAFF_MEMBERS];
  if (filter?.role && filter.role !== "all") {
    items = items.filter((x) => x.role === filter.role);
  }
  if (filter?.department && filter.department !== "all") {
    items = items.filter((x) => x.department.toLowerCase() === filter.department?.toLowerCase());
  }
  if (filter?.status && filter.status !== "all") {
    items = items.filter((x) => x.status === filter.status);
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    items = items.filter(
      (item) =>
        item.full_name.toLowerCase().includes(s) ||
        (item.bangla_name && item.bangla_name.includes(s)) ||
        item.employee_id.toLowerCase().includes(s) ||
        item.email.toLowerCase().includes(s) ||
        item.phone.includes(s) ||
        item.department.toLowerCase().includes(s) ||
        item.designation.toLowerCase().includes(s)
    );
  }
  return items;
}

export async function getStaffProfileById(id: string): Promise<StaffProfileRecord | null> {
  try {
    const privClient = privateAdmin();
    if (privClient) {
      const { data, error } = await privClient.from("staff_profiles").select("*").eq("id", id).maybeSingle();
      if (!error && data) {
        return data as StaffProfileRecord;
      }
    }
  } catch (err) {
    console.warn("getStaffProfileById fallback", err);
  }

  const found = DEFAULT_STAFF_MEMBERS.find((x) => x.id === id || x.employee_id === id);
  return found || null;
}

export async function getTeacherProfiles(): Promise<StaffProfileRecord[]> {
  const staff = await getStaffList({ role: "teacher" });
  return staff.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

export async function getStaffMembers(): Promise<StaffProfileRecord[]> {
  const staff = await getStaffList({ role: "staff" });
  return staff.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

export async function getStaffStats(): Promise<StaffStats> {
  const all = await getStaffList();
  const teachers = all.filter((x) => x.role === "teacher");
  const support = all.filter((x) => x.role === "staff");
  const active = all.filter((x) => x.status === "active");
  const onLeave = all.filter((x) => x.status === "on_leave");
  const departments = new Set(all.map((x) => x.department));

  const totalPeriods = teachers.reduce((acc, t) => acc + (t.weekly_periods || 0), 0);
  const avgWeeklyPeriods = teachers.length > 0 ? Math.round((totalPeriods / teachers.length) * 10) / 10 : 0;

  return {
    totalStaff: all.length,
    totalTeachers: teachers.length,
    totalSupportStaff: support.length,
    activeCount: active.length,
    onLeaveCount: onLeave.length,
    departmentCount: departments.size,
    avgWeeklyPeriods,
  };
}

export async function getDailyStaffAttendance(dateStr?: string): Promise<StaffAttendanceRecord[]> {
  const today = dateStr || new Date().toISOString().split("T")[0];
  const all = await getStaffList();

  // Realistic mock daily attendance
  return all.map((staff, idx) => {
    let status: "present" | "absent" | "late" | "leave" = "present";
    let inTime = "08:15 AM";
    let outTime = "03:30 PM";

    if (staff.status === "on_leave" || idx === 8) {
      status = "leave";
      inTime = "-";
      outTime = "-";
    } else if (idx === 3 || idx === 11) {
      status = "late";
      inTime = "08:50 AM";
    } else if (idx === 15) {
      status = "absent";
      inTime = "-";
      outTime = "-";
    }

    return {
      id: `att-${staff.id}-${today}`,
      staff_id: staff.id,
      employee_id: staff.employee_id,
      full_name: staff.full_name,
      role: staff.role,
      department: staff.department,
      date: today,
      in_time: inTime,
      out_time: outTime,
      status,
      remarks: status === "leave" ? "Approved Casual Leave" : status === "late" ? "Traffic delay" : undefined,
    };
  });
}
