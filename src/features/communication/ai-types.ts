export type AiProvider = "google" | "custom";

export interface GoogleAiKeyItem {
  id: string;
  name?: string;
  apiKey: string;
  isActive: boolean;
  addedAt: string;
}

export interface EmailTemplateItem {
  id: string;
  name: string;
  category: "institutional" | "urgent" | "celebration" | "clean" | "academic" | "custom";
  description: string;
  isBuiltIn?: boolean;
  badgeLabel: string;
  primaryColor: string;
  accentColor: string;
  sampleSubject?: string;
  sampleBody?: string;
  htmlTemplate?: string;
  aiPromptInstructions?: string;
  updatedAt?: string;
}

export interface EmailAiConfig {
  provider: AiProvider;
  googleKeys: GoogleAiKeyItem[];
  googleModel: string;
  customBaseUrl: string;
  customApiKey: string;
  customModel: string;
  defaultTone: "institutional" | "urgent" | "celebration" | "clean" | "academic";
  enabled: boolean;
}

export const defaultEmailAiConfig: EmailAiConfig = {
  provider: "google",
  googleKeys: [],
  googleModel: "gemini-3.8-flash",
  customBaseUrl: "https://api.openai.com/v1",
  customApiKey: "",
  customModel: "gpt-4o-mini",
  defaultTone: "institutional",
  enabled: true,
};

export const defaultBuiltInTemplates: EmailTemplateItem[] = [
  {
    id: "royal_institutional",
    name: "🏛️ Royal Institutional",
    category: "institutional",
    badgeLabel: "OFFICIAL NOTICE",
    primaryColor: "#1e3a8a", // Navy
    accentColor: "#c5a46d", // Gold
    description: "Deep Navy & Gold header, formal executive styling, official seal & registrar sign-off. Best for notices and administrative updates.",
    sampleSubject: "Official Notice: Academic Term Schedule & Campus Guidelines",
    sampleBody: "This is to notify all faculty and students that the upcoming academic semester will officially commence on Monday. Regular class attendance is mandatory. The updated routine has been published on the college portal.",
    aiPromptInstructions: "Render with an authoritative deep navy (#1e3a8a) banner, gold (#c5a46d) border accent, formal seal badge 'OFFICIAL ANNOUNCEMENT', structured highlight cards for key dates, and official Office of the Principal sign-off.",
  },
  {
    id: "urgent_alert",
    name: "🚨 Urgent Exam & Campus Alert",
    category: "urgent",
    badgeLabel: "URGENT ALERT",
    primaryColor: "#b91c1c", // Crimson Red
    accentColor: "#fef2f2", // Soft Amber/Red
    description: "High-contrast crimson badge, alert highlight cards, deadline countdown styling. Best for exam dates, deadlines, and emergency alerts.",
    sampleSubject: "URGENT: Pre-Board Examination Schedule & Admit Card Distribution",
    sampleBody: "Urgent attention required: Admit card distribution for the upcoming term examination will close on Thursday at 2:00 PM. No students will be permitted in the exam hall without verified admit cards.",
    aiPromptInstructions: "Render with a vibrant crimson/red warning banner (#b91c1c), high-contrast warning icon cards (⚠️), soft red background highlights (#fef2f2), bold deadline callouts, and an action button for downloading schedules.",
  },
  {
    id: "celebration_event",
    name: "🎉 Celebration & Gala Event",
    category: "celebration",
    badgeLabel: "CAMPUS CELEBRATION",
    primaryColor: "#4f46e5", // Indigo Gradient
    accentColor: "#a855f7", // Purple
    description: "Vibrant indigo-to-purple gradient header, festive cards, RSVP action button. Best for annual day, sports, cultural fests, and achievements.",
    sampleSubject: "Invitation: Annual Cultural Fest & Prize Giving Ceremony 2026",
    sampleBody: "We warmly invite you to celebrate the Annual Cultural Day of Haji Rahmatullah Model Degree College! Join us for student performances, honorary awards, and guest speaker sessions starting at 10:00 AM.",
    aiPromptInstructions: "Render with a festive modern gradient banner (Indigo #4f46e5 to Purple #7c3aed), celebratory icons (✨, 🏆, 🎭), stylized schedule timeline cards, and a prominent RSVP/Explore button.",
  },
  {
    id: "clean_minimalist",
    name: "📋 Modern Clean Minimalist",
    category: "clean",
    badgeLabel: "GENERAL UPDATE",
    primaryColor: "#0f172a", // Slate
    accentColor: "#0284c7", // Sky blue
    description: "Ultra-crisp typography, soft slate borders, high-readability bullet points. Best for routine circulars, newsletters, and quick updates.",
    sampleSubject: "Weekly Campus Digest: Important Announcements & Reminders",
    sampleBody: "Here is your weekly summary of campus activities, library book returns, and club meetings scheduled for the upcoming week. Please review the details below.",
    aiPromptInstructions: "Render with ultra-clean modern typography, subtle slate borders (#e2e8f0), minimalist monochrome header with cyan/sky accent (#0284c7), crisp bullet cards, and ultra-readable paragraph line-height.",
  },
  {
    id: "academic_digest",
    name: "📜 Academic Dean's Circular",
    category: "academic",
    badgeLabel: "ACADEMIC CIRCULAR",
    primaryColor: "#065f46", // Emerald Green
    accentColor: "#d97706", // Amber
    description: "Deep emerald and warm amber styling, syllabus highlights, faculty contact information. Best for syllabus updates and academic affairs.",
    sampleSubject: "Academic Affairs Circular: Practical Classes & Lab Protocols",
    sampleBody: "Please be informed of the revised schedule for Physics, Chemistry, and Biology practical sessions. All students must wear lab coats and adhere strictly to laboratory safety standards.",
    aiPromptInstructions: "Render with deep academic emerald green (#065f46) header, gold/amber badge (#d97706), lab equipment/instruction highlight boxes, and a departmental coordinator signature footer.",
  },
];
