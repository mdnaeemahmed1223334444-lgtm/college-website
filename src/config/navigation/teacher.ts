import type { NavNode } from "@/types/navigation";

// Menu + route tree for the teacher area. Edit titles/order here; pages read from this file.
export const teacherNav: NavNode[] = [
  {
    "title": "Teacher Dashboard",
    "href": "/teacher",
    "sections": [
      "Today's Classes",
      "Pending Attendance",
      "Pending Marks Submission",
      "Recent Activities",
      "Notifications"
    ]
  },
  {
    "title": "My Profile",
    "href": "/teacher/profile"
  },
  {
    "title": "Assigned Classes",
    "href": "/teacher/classes"
  },
  {
    "title": "Class Routines",
    "href": "/teacher/routines"
  },
  {
    "title": "Student Information",
    "href": "/teacher/students",
    "sections": [
      "ALL students (every batch, group and status), read-only",
      "Search & filter: Batch, Year, Group, Status",
      "Open any student to see FULL details"
    ],
    "children": [
      {
        "title": "Student Performance",
        "href": "/teacher/students/performance"
      },
      {
        "title": "Student Attendance Records",
        "href": "/teacher/students/attendance"
      }
    ]
  },
  {
    "title": "Attendance Management",
    "href": "/teacher/attendance",
    "sections": [
      "Select Batch (running)",
      "Select Year (1st / 2nd)",
      "Select Group (Science / Business Studies / Humanities)",
      "Select Date",
      "View Student List",
      "Mark Attendance (Present / Absent / Late / Excused)",
      "Save as Draft",
      "Submit Attendance"
    ],
    "children": [
      {
        "title": "Attendance History",
        "href": "/teacher/attendance/history"
      },
      {
        "title": "Edit / Correction Requests",
        "href": "/teacher/attendance/corrections"
      }
    ]
  },
  {
    "title": "Examination & Marks",
    "href": "/teacher/marks",
    "sections": [
      "Select Examination",
      "Select Batch & Group",
      "Select Subject",
      "Student Marks Entry (Obtained / Maximum / Practical-Written)",
      "Save as Draft",
      "Submit Marks"
    ],
    "children": [
      {
        "title": "Marks Submission History",
        "href": "/teacher/marks/history"
      },
      {
        "title": "Edit / Correction Requests",
        "href": "/teacher/marks/corrections"
      }
    ]
  },
  {
    "title": "Exam Hall Duties",
    "href": "/teacher/exam-duties"
  },
  {
    "title": "Notices & Announcements",
    "href": "/teacher/notices"
  },
  {
    "title": "Academic Reports",
    "href": "/teacher/reports",
    "children": [
      {
        "title": "Attendance Reports",
        "href": "/teacher/reports/attendance"
      },
      {
        "title": "Examination Reports",
        "href": "/teacher/reports/examination"
      },
      {
        "title": "Student Performance Reports",
        "href": "/teacher/reports/performance"
      }
    ]
  },
  {
    "title": "Submission History",
    "href": "/teacher/submissions"
  }
];
