export type StudyGroup = "science" | "business_studies" | "humanities";
export type StudentStatus = "active" | "suspended" | "dropped" | "passed_out";
export type StudyYear = "first_year" | "second_year";

export interface StudentProfile {
  id: string;
  studentCode: string;
  fullName: string;
  banglaName?: string;
  batchName: string; // e.g. "HSC Batch 26"
  batchYear: StudyYear; // "first_year" | "second_year"
  group: StudyGroup;
  roll: number;
  section: string;
  status: StudentStatus;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string; // YYYY-MM-DD
  bloodGroup: string;
  religion: string;
  nationality: string;
  address: string;
  permanentAddress?: string;
  fatherName: string;
  fatherPhone?: string;
  motherName: string;
  motherPhone?: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation?: string;
  photoUrl?: string;
  admissionDate: string;
  academicSession: string;
}

export interface TeacherProfile {
  id: string;
  teacherCode: string; // e.g. "T-104"
  fullName: string;
  banglaName?: string;
  designation: string; // e.g. "Assistant Professor & Head"
  department: string; // e.g. "Department of Physics"
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  dateOfBirth?: string;
  bloodGroup: string;
  joiningDate: string;
  qualification: string; // e.g. "M.Sc in Physics (DU), B.Sc (Hons)"
  specialization?: string; // e.g. "Quantum Mechanics, Electronics"
  roomNumber?: string; // e.g. "Room 304, Science Building"
  address?: string;
  bio?: string;
  photoUrl?: string;
  assignedClasses: Array<{
    className: string;
    group: string;
    subject: string;
    time?: string;
  }>;
  isClassTeacher?: boolean;
  classTeacherOf?: string; // e.g. "Class XI - Science A"
}

export interface ProfileFeedback {
  success?: boolean;
  message?: string;
  error?: string;
}
