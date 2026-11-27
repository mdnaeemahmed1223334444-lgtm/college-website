export type BroadcastTarget =
  | "all"
  | "students"
  | "teachers"
  | "batch"
  | "science"
  | "business_studies"
  | "humanities"
  | "individual"
  | "custom";

export interface EmailBroadcastSettings {
  enabled: boolean;
  sender_name: string;
  sender_email: string;
  auto_send_on_notice: boolean;
  auto_send_on_news?: boolean;
  global_blocked_emails: string[]; // List of emails or student IDs permanently saved as blocked
  last_tested_at?: string;
}

export interface RecipientInfo {
  email: string;
  name: string;
  role: "student" | "teacher" | "custom";
  batchName?: string;
  batchId?: string;
  studyGroup?: string;
  studentCode?: string;
  studentId?: string;
  employeeId?: string;
}

export interface EmailDispatchFeedback {
  success?: boolean;
  error?: string;
  message?: string;
  recipientCount?: number;
  blockedCount?: number;
}

export interface BroadcastLogItem {
  id: string;
  subject: string;
  target_summary: string;
  recipient_count: number;
  blocked_count: number;
  sent_at: string;
  status: "sent" | "failed" | "disabled";
}
