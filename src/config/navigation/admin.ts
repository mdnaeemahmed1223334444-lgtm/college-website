import type { NavNode } from "@/types/navigation";

// Menu + route tree for the admin area. Edit titles/order here; pages read from this file.
export const adminNav: NavNode[] = [
  {
    "title": "Dashboard & Analytics",
    "href": "/admin",
    "sections": [
      "Total Students",
      "Total Teachers & Staff",
      "Attendance Statistics",
      "Examination Statistics",
      "Admission Statistics",
      "Financial Overview",
      "Recent Activities",
      "Pending Tasks"
    ]
  },
  {
    "title": "Website Management",
    "href": "/admin/website",
    "children": [
      {
        "title": "ScrollExpand Opening Hero",
        "href": "/admin/website/scroll-expand-hero"
      },
      {
        "title": "Front Page Banner & Ticker",
        "href": "/admin/website/homepage"
      },
      {
        "title": "Menu Links",
        "href": "/admin/website/navigation"
      },
      {
        "title": "Website Pages",
        "href": "/admin/website/pages"
      },
      {
        "title": "College Name & Logo",
        "href": "/admin/website/branding"
      },
      {
        "title": "Front Page Sections",
        "href": "/admin/website/homepage-sections"
      },
      {
        "title": "Colors & Appearance",
        "href": "/admin/website/appearance"
      },
      {
        "title": "Google & Search (SEO)",
        "href": "/admin/website/seo"
      },
      {
        "title": "Footer & Address",
        "href": "/admin/website/footer"
      },
      {
        "title": "Social Media & Helpline",
        "href": "/admin/website/social-links"
      },
      {
        "title": "Feature Switches",
        "href": "/admin/website/features"
      }
    ]
  },
  {
    "title": "Student Management",
    "href": "/admin/students",
    "children": [
      {
        "title": "Batches",
        "href": "/admin/students/batches",
        "sections": [
          "Create batch (e.g. HSC Batch 26)",
          "Batch status: Running / Passed",
          "Running batch year: 1st Year / 2nd Year (promote 1st to 2nd)",
          "Students of each batch, split by Science / Business Studies / Humanities"
        ]
      },
      {
        "title": "Add Student",
        "href": "/admin/students/add",
        "sections": [
          "Select batch (running)",
          "Select group: Science / Business Studies / Humanities",
          "Personal, guardian & contact details",
          "Photo upload (R2, private)",
          "Create login account (optional)"
        ]
      },
      {
        "title": "All Students (Edit / Delete)",
        "href": "/admin/students/list",
        "sections": [
          "Filter: Batch, Year, Group, Status",
          "Open a student to edit EVERYTHING (incl. group)"
        ]
      },
      {
        "title": "Transfer & Group Change",
        "href": "/admin/students/transfer",
        "sections": [
          "Select student",
          "Move to another RUNNING batch (e.g. did not pass HSC)",
          "Change group (Science / Business Studies / Humanities)",
          "New roll (optional)",
          "Reason",
          "Transfer history log"
        ]
      },
      {
        "title": "Admission Records",
        "href": "/admin/students/admission-records"
      },
      {
        "title": "Student ID Generation",
        "href": "/admin/students/id-generation"
      },
      {
        "title": "Student Status Management",
        "href": "/admin/students/status"
      },
      {
        "title": "Bulk Import / Export",
        "href": "/admin/students/import-export"
      },
      {
        "title": "Student Documents",
        "href": "/admin/students/documents"
      },
      {
        "title": "Student Account Management",
        "href": "/admin/students/accounts"
      }
    ]
  },
  {
    "title": "Teacher & Staff Management",
    "href": "/admin/staff",
    "children": [
      {
        "title": "Add / Edit / Remove Staff",
        "href": "/admin/staff/list"
      },
      {
        "title": "Teacher Profiles",
        "href": "/admin/staff/profiles"
      },
      {
        "title": "Department Assignment",
        "href": "/admin/staff/departments"
      },
      {
        "title": "Subject Assignment",
        "href": "/admin/staff/subjects"
      },
      {
        "title": "Class & Section Assignment",
        "href": "/admin/staff/class-section"
      },
      {
        "title": "Teacher Workload",
        "href": "/admin/staff/workload"
      },
      {
        "title": "Staff Attendance",
        "href": "/admin/staff/attendance"
      },
      {
        "title": "Employment Records",
        "href": "/admin/staff/employment"
      },
      {
        "title": "Teacher Account Management",
        "href": "/admin/staff/accounts"
      }
    ]
  },
  {
    "title": "Academic Management",
    "href": "/admin/academic",
    "children": [
      {
        "title": "Manage Departments",
        "href": "/admin/academic/departments"
      },
      {
        "title": "Manage Classes",
        "href": "/admin/academic/classes"
      },
      {
        "title": "Manage Sections",
        "href": "/admin/academic/sections"
      },
      {
        "title": "Manage Subjects",
        "href": "/admin/academic/subjects"
      },
      {
        "title": "Academic Sessions",
        "href": "/admin/academic/sessions"
      },
      {
        "title": "Class Routines",
        "href": "/admin/academic/routines"
      },
      {
        "title": "Academic Calendar",
        "href": "/admin/academic/calendar"
      },
      {
        "title": "Class Teacher Assignment",
        "href": "/admin/academic/class-teachers"
      },
      {
        "title": "Subject Teacher Assignment",
        "href": "/admin/academic/subject-teachers"
      },
      {
        "title": "Academic Rules & Regulations",
        "href": "/admin/academic/rules"
      }
    ]
  },
  {
    "title": "Examination Management",
    "href": "/admin/examinations",
    "children": [
      {
        "title": "Create Examinations",
        "href": "/admin/examinations/create"
      },
      {
        "title": "Exam Schedule",
        "href": "/admin/examinations/schedule"
      },
      {
        "title": "Exam Hall Management",
        "href": "/admin/examinations/halls"
      },
      {
        "title": "Marks Management",
        "href": "/admin/examinations/marks"
      },
      {
        "title": "Grading System",
        "href": "/admin/examinations/grading"
      },
      {
        "title": "Result Approval",
        "href": "/admin/examinations/approval"
      },
      {
        "title": "Publish Results",
        "href": "/admin/examinations/publish"
      },
      {
        "title": "Result Correction",
        "href": "/admin/examinations/correction"
      },
      {
        "title": "Merit List & Ranking",
        "href": "/admin/examinations/merit-list"
      },
      {
        "title": "Marksheet Generation",
        "href": "/admin/examinations/marksheets"
      },
      {
        "title": "Result History",
        "href": "/admin/examinations/history"
      }
    ]
  },
  {
    "title": "Attendance Management",
    "href": "/admin/attendance",
    "children": [
      {
        "title": "View All Attendance",
        "href": "/admin/attendance/all"
      },
      {
        "title": "Student Attendance",
        "href": "/admin/attendance/students"
      },
      {
        "title": "Staff Attendance",
        "href": "/admin/attendance/staff"
      },
      {
        "title": "Attendance Correction",
        "href": "/admin/attendance/correction"
      },
      {
        "title": "Attendance Reports",
        "href": "/admin/attendance/reports"
      },
      {
        "title": "Attendance Rules",
        "href": "/admin/attendance/rules"
      },
      {
        "title": "Attendance Deadlines",
        "href": "/admin/attendance/deadlines"
      },
      {
        "title": "Attendance Locking",
        "href": "/admin/attendance/locking"
      }
    ]
  },
  {
    "title": "Admission Management",
    "href": "/admin/admissions",
    "children": [
      {
        "title": "Admission Applications",
        "href": "/admin/admissions/applications"
      },
      {
        "title": "Application Review",
        "href": "/admin/admissions/review"
      },
      {
        "title": "Applicant Verification",
        "href": "/admin/admissions/verification"
      },
      {
        "title": "Admission Selection",
        "href": "/admin/admissions/selection"
      },
      {
        "title": "Admission Results",
        "href": "/admin/admissions/results"
      },
      {
        "title": "Student Enrollment",
        "href": "/admin/admissions/enrollment"
      },
      {
        "title": "Admission Settings",
        "href": "/admin/admissions/settings"
      }
    ]
  },
  {
    "title": "Finance Management",
    "href": "/admin/finance",
    "children": [
      {
        "title": "Fee Structure",
        "href": "/admin/finance/fee-structure"
      },
      {
        "title": "Student Payments",
        "href": "/admin/finance/payments"
      },
      {
        "title": "Due Payments",
        "href": "/admin/finance/dues"
      },
      {
        "title": "Payment Verification",
        "href": "/admin/finance/verification"
      },
      {
        "title": "Scholarships & Waivers",
        "href": "/admin/finance/scholarships"
      },
      {
        "title": "Payment Receipts",
        "href": "/admin/finance/receipts"
      },
      {
        "title": "Financial Reports",
        "href": "/admin/finance/reports"
      },
      {
        "title": "Payment Settings",
        "href": "/admin/finance/settings"
      }
    ]
  },
  {
    "title": "Content Management",
    "href": "/admin/content",
    "children": [
      {
        "title": "Notice Management",
        "href": "/admin/content/notices"
      },
      {
        "title": "News & Events",
        "href": "/admin/content/news-events"
      },
      {
        "title": "Gallery Management",
        "href": "/admin/content/gallery"
      },
      {
        "title": "Photo & Video Uploads",
        "href": "/admin/content/uploads"
      },
      {
        "title": "Page Content Editor",
        "href": "/admin/content/page-editor"
      },
      {
        "title": "Document Management",
        "href": "/admin/content/documents"
      },
      {
        "title": "Career Circulars",
        "href": "/admin/content/career-circulars"
      },
      {
        "title": "Holiday Management",
        "href": "/admin/content/holidays"
      },
      {
        "title": "Draft & Publish",
        "href": "/admin/content/drafts"
      },
      {
        "title": "Scheduled Publishing",
        "href": "/admin/content/scheduled"
      }
    ]
  },
  {
    "title": "Library Management",
    "href": "/admin/library",
    "children": [
      {
        "title": "Book Management",
        "href": "/admin/library/books"
      },
      {
        "title": "Book Categories",
        "href": "/admin/library/categories"
      },
      {
        "title": "Book Issue & Return",
        "href": "/admin/library/issue-return"
      },
      {
        "title": "Library Members",
        "href": "/admin/library/members"
      },
      {
        "title": "Library Reports",
        "href": "/admin/library/reports"
      }
    ]
  },
  {
    "title": "Communication Management",
    "href": "/admin/communication",
    "children": [
      {
        "title": "Send Notifications",
        "href": "/admin/communication/notifications"
      },
      {
        "title": "Student Announcements",
        "href": "/admin/communication/student-announcements"
      },
      {
        "title": "Teacher Announcements",
        "href": "/admin/communication/teacher-announcements"
      },
      {
        "title": "Brevo Email & Broadcasts",
        "href": "/admin/communication/email"
      },
      {
        "title": "SMS Integration",
        "href": "/admin/communication/sms"
      },
      {
        "title": "Contact Messages",
        "href": "/admin/communication/contact-messages"
      }
    ]
  },
  {
    "title": "Reports & Analytics",
    "href": "/admin/reports",
    "children": [
      {
        "title": "Student Reports",
        "href": "/admin/reports/students"
      },
      {
        "title": "Academic Reports",
        "href": "/admin/reports/academic"
      },
      {
        "title": "Examination Reports",
        "href": "/admin/reports/examination"
      },
      {
        "title": "Attendance Reports",
        "href": "/admin/reports/attendance"
      },
      {
        "title": "Financial Reports",
        "href": "/admin/reports/financial"
      },
      {
        "title": "Admission Reports",
        "href": "/admin/reports/admission"
      },
      {
        "title": "Teacher Performance Reports",
        "href": "/admin/reports/teacher-performance"
      },
      {
        "title": "Export PDF / Excel / CSV",
        "href": "/admin/reports/export"
      }
    ]
  },
  {
    "title": "User & Permission Management",
    "href": "/admin/users",
    "children": [
      {
        "title": "Create User Accounts",
        "href": "/admin/users/accounts"
      },
      {
        "title": "Manage Roles",
        "href": "/admin/users/roles"
      },
      {
        "title": "Assign Permissions",
        "href": "/admin/users/permissions"
      },
      {
        "title": "Reset Passwords",
        "href": "/admin/users/reset-passwords"
      },
      {
        "title": "Activate / Suspend Accounts",
        "href": "/admin/users/status"
      },
      {
        "title": "Login History",
        "href": "/admin/users/login-history"
      },
      {
        "title": "Custom Roles",
        "href": "/admin/users/custom-roles"
      }
    ]
  },
  {
    "title": "System Settings",
    "href": "/admin/settings",
    "children": [
      {
        "title": "College Information",
        "href": "/admin/settings/college-info"
      },
      {
        "title": "Academic Settings",
        "href": "/admin/settings/academic"
      },
      {
        "title": "Grading Configuration",
        "href": "/admin/settings/grading"
      },
      {
        "title": "Fee Configuration",
        "href": "/admin/settings/fees"
      },
      {
        "title": "Portal Settings",
        "href": "/admin/settings/portal"
      },
      {
        "title": "Language & Timezone",
        "href": "/admin/settings/language-timezone"
      },
      {
        "title": "Integrations & API",
        "href": "/admin/settings/integrations"
      },
      {
        "title": "Website Configuration",
        "href": "/admin/settings/website"
      },
      {
        "title": "Feature Configuration",
        "href": "/admin/settings/features"
      }
    ]
  },
  {
    "title": "Security & Backup",
    "href": "/admin/security",
    "children": [
      {
        "title": "Activity Logs",
        "href": "/admin/security/activity-logs"
      },
      {
        "title": "Admin Action History",
        "href": "/admin/security/admin-history"
      },
      {
        "title": "Database Backup",
        "href": "/admin/security/backup"
      },
      {
        "title": "Database Restore",
        "href": "/admin/security/restore"
      },
      {
        "title": "Security Settings",
        "href": "/admin/security/security-settings"
      },
      {
        "title": "Session Management",
        "href": "/admin/security/sessions"
      },
      {
        "title": "Login Security",
        "href": "/admin/security/login-security"
      }
    ]
  },
  {
    "title": "Submission Approval Center",
    "href": "/admin/approvals",
    "sections": [
      "Review submission",
      "Approved? Yes -> Confirm & Publish",
      "Approved? No -> Return to teacher for correction"
    ],
    "children": [
      {
        "title": "Pending Attendance Submissions",
        "href": "/admin/approvals/pending-attendance"
      },
      {
        "title": "Pending Marks Submissions",
        "href": "/admin/approvals/pending-marks"
      },
      {
        "title": "Attendance Correction Requests",
        "href": "/admin/approvals/attendance-corrections"
      },
      {
        "title": "Marks Correction Requests",
        "href": "/admin/approvals/marks-corrections"
      }
    ]
  }
];
