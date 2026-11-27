export type StudyGroup = "science" | "business_studies" | "humanities";
export type StudentStatus = "active" | "suspended" | "dropped" | "passed_out";
export type StudyYear = "first_year" | "second_year";
export type GenderType = "male" | "female" | "other";

export interface BatchRecord {
  id: string;
  name: string;
  exam_year: number;
  status: "running" | "passed";
  current_year?: StudyYear | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudentRecord {
  id: string;
  profile_id?: string | null;
  student_code: string;
  full_name: string;
  bangla_name?: string | null;
  batch_id: string;
  batch_name?: string;
  study_group: StudyGroup;
  roll: number;
  section?: string | null;
  status: StudentStatus;
  gender: GenderType;
  religion?: string | null;
  date_of_birth?: string | null;
  blood_group?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  permanent_address?: string | null;
  father_name?: string | null;
  father_phone?: string | null;
  mother_name?: string | null;
  mother_phone?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  guardian_relation?: string | null;
  photo_url?: string | null;
  photo_key?: string | null;
  rfid_card_id?: string | null;
  rfid_card_data?: string | null;
  // Extended Academic & Document fields
  academic_session?: string | null;
  admission_date?: string | null;
  registration_number?: string | null;
  previous_institution?: string | null;
  document_url?: string | null;
  document_name?: string | null;
  // Account credential status
  has_password?: boolean;
  password_hash?: string | null;
  current_password?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  scienceCount: number;
  businessCount: number;
  humanitiesCount: number;
  maleCount: number;
  femaleCount: number;
}

export interface StudentFeedback {
  success?: boolean;
  error?: string;
  message?: string;
  studentId?: string;
  generatedPassword?: string;
}
