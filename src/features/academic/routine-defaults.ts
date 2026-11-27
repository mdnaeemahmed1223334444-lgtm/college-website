export interface PeriodSlot {
  number: number;
  label: string;
  defaultStart: string;
  defaultEnd: string;
}

export interface BreakSlot {
  label: string;
  defaultStart: string;
  defaultEnd: string;
  afterPeriod: number;
}

// 7 class periods without tiffin
export const DEFAULT_PERIODS: PeriodSlot[] = [
  { number: 1, label: "Period 1", defaultStart: "09:00", defaultEnd: "09:45" },
  { number: 2, label: "Period 2", defaultStart: "09:45", defaultEnd: "10:30" },
  { number: 3, label: "Period 3", defaultStart: "10:30", defaultEnd: "11:15" },
  { number: 4, label: "Period 4", defaultStart: "11:45", defaultEnd: "12:30" },
  { number: 5, label: "Period 5", defaultStart: "12:30", defaultEnd: "13:15" },
  { number: 6, label: "Period 6", defaultStart: "13:15", defaultEnd: "13:55" },
  { number: 7, label: "Period 7", defaultStart: "13:55", defaultEnd: "14:35" },
];

// Always breaks (tiffin time) after 3 periods: 11:15 AM - 11:45 AM (30 minutes)
export const TIFFIN_BREAK: BreakSlot = {
  label: "Tiffin Break",
  defaultStart: "11:15",
  defaultEnd: "11:45",
  afterPeriod: 3,
};

export const COLLEGE_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

export const DEFAULT_ROUTINES_BY_GROUP: Record<string, Record<string, string[]>> = {
  science: {
    Sunday: [
      "Physics 1st Paper",
      "Chemistry 1st Paper",
      "Higher Math 1st Paper",
      "Biology 1st Paper",
      "Bangla 1st Paper",
      "English 1st Paper",
      "ICT",
    ],
    Monday: [
      "Chemistry 1st Paper",
      "Physics 1st Paper",
      "Biology 1st Paper",
      "Higher Math 1st Paper",
      "English 1st Paper",
      "Bangla 1st Paper",
      "Physics Practical",
    ],
    Tuesday: [
      "Higher Math 1st Paper",
      "Biology 1st Paper",
      "Physics 1st Paper",
      "Chemistry 1st Paper",
      "ICT",
      "English 2nd Paper",
      "Chemistry Practical",
    ],
    Wednesday: [
      "Biology 1st Paper",
      "Higher Math 1st Paper",
      "Chemistry 1st Paper",
      "Physics 1st Paper",
      "Bangla 2nd Paper",
      "English 2nd Paper",
      "Biology Practical",
    ],
    Thursday: [
      "Physics 2nd Paper",
      "Chemistry 2nd Paper",
      "Biology 2nd Paper",
      "Higher Math 2nd Paper",
      "ICT Lab",
      "General Science",
      "Physical Training (PT)",
    ],
  },
  business_studies: {
    Sunday: [
      "Accounting 1st Paper",
      "Business Organization",
      "Finance & Banking",
      "Economics 1st Paper",
      "Bangla 1st Paper",
      "English 1st Paper",
      "ICT",
    ],
    Monday: [
      "Business Organization",
      "Accounting 1st Paper",
      "Economics 1st Paper",
      "Finance & Banking",
      "English 1st Paper",
      "Bangla 1st Paper",
      "Business Math",
    ],
    Tuesday: [
      "Finance & Banking",
      "Economics 1st Paper",
      "Accounting 1st Paper",
      "Business Organization",
      "ICT",
      "English 2nd Paper",
      "Accounting Workshop",
    ],
    Wednesday: [
      "Economics 1st Paper",
      "Finance & Banking",
      "Business Organization",
      "Accounting 1st Paper",
      "Bangla 2nd Paper",
      "English 2nd Paper",
      "Case Studies",
    ],
    Thursday: [
      "Accounting 2nd Paper",
      "Business Org 2nd",
      "Finance 2nd Paper",
      "Economics 2nd Paper",
      "ICT Lab",
      "Career Guidance",
      "Physical Training (PT)",
    ],
  },
  humanities: {
    Sunday: [
      "History 1st Paper",
      "Civics & Governance",
      "Economics 1st Paper",
      "Social Work 1st Paper",
      "Bangla 1st Paper",
      "English 1st Paper",
      "ICT",
    ],
    Monday: [
      "Civics & Governance",
      "History 1st Paper",
      "Social Work 1st Paper",
      "Economics 1st Paper",
      "English 1st Paper",
      "Bangla 1st Paper",
      "General Studies",
    ],
    Tuesday: [
      "Economics 1st Paper",
      "Social Work 1st Paper",
      "History 1st Paper",
      "Civics & Governance",
      "ICT",
      "English 2nd Paper",
      "Debate & Logic",
    ],
    Wednesday: [
      "Social Work 1st Paper",
      "Economics 1st Paper",
      "Civics & Governance",
      "History 1st Paper",
      "Bangla 2nd Paper",
      "English 2nd Paper",
      "Literature & Culture",
    ],
    Thursday: [
      "History 2nd Paper",
      "Civics 2nd Paper",
      "Economics 2nd Paper",
      "Social Work 2nd Paper",
      "ICT Practical",
      "Reading / Library",
      "Physical Training (PT)",
    ],
  },
};

export const GROUP_SUBJECT_SUGGESTIONS: Record<string, string[]> = {
  science: [
    "Physics 1st Paper",
    "Physics 2nd Paper",
    "Physics Practical",
    "Chemistry 1st Paper",
    "Chemistry 2nd Paper",
    "Chemistry Practical",
    "Higher Math 1st Paper",
    "Higher Math 2nd Paper",
    "Higher Math Practical",
    "Biology 1st Paper",
    "Biology 2nd Paper",
    "Biology Practical",
    "Bangla 1st Paper",
    "Bangla 2nd Paper",
    "English 1st Paper",
    "English 2nd Paper",
    "ICT",
    "Physical Training (PT)",
  ],
  business_studies: [
    "Accounting 1st Paper",
    "Accounting 2nd Paper",
    "Business Organization",
    "Finance & Banking",
    "Economics 1st Paper",
    "Economics 2nd Paper",
    "Bangla 1st Paper",
    "Bangla 2nd Paper",
    "English 1st Paper",
    "English 2nd Paper",
    "ICT",
    "Physical Training (PT)",
  ],
  humanities: [
    "History 1st Paper",
    "History 2nd Paper",
    "Civics & Governance",
    "Economics 1st Paper",
    "Economics 2nd Paper",
    "Social Work 1st Paper",
    "Social Work 2nd Paper",
    "Bangla 1st Paper",
    "Bangla 2nd Paper",
    "English 1st Paper",
    "English 2nd Paper",
    "ICT",
    "Physical Training (PT)",
  ],
};

/**
 * Checks whether a period is a non-standard dismissal activity
 * (Physical Training or Practical class), which is not counted as a regular theory class
 * gate requirement for early-checkout.
 */
export function isSpecialOrExemptClass(subject: string, isPt?: boolean, isPractical?: boolean): boolean {
  if (isPt || isPractical) return true;
  const s = subject.toLowerCase();
  return s.includes("physical training") || s.includes("(pt)") || s.includes("practical");
}
