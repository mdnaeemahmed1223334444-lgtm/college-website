import type { NavNode } from "@/types/navigation";

// Menu + route tree for the student area. Edit titles/order here; pages read from this file.
export const studentNav: NavNode[] = [
  {
    "title": "Student Dashboard",
    "href": "/student",
    "sections": [
      "Personal Overview",
      "Upcoming Events",
      "Important Notifications"
    ]
  },
  {
    "title": "My Profile",
    "href": "/student/profile"
  },
  {
    "title": "Digital Student ID Card",
    "href": "/student/id-card"
  },
  {
    "title": "Class Routine",
    "href": "/student/class-routine"
  },
  {
    "title": "Exam Schedule",
    "href": "/student/exam-schedule"
  },
  {
    "title": "Examination Results",
    "href": "/student/results",
    "children": [
      {
        "title": "Result History",
        "href": "/student/results/history"
      },
      {
        "title": "Subject-wise Marks",
        "href": "/student/results/subject-marks"
      },
      {
        "title": "Grades & GPA",
        "href": "/student/results/grades-gpa"
      },
      {
        "title": "Marksheet Download",
        "href": "/student/results/marksheet"
      }
    ]
  },
  {
    "title": "Attendance Records",
    "href": "/student/attendance",
    "children": [
      {
        "title": "Attendance History",
        "href": "/student/attendance/history"
      },
      {
        "title": "Attendance Percentage",
        "href": "/student/attendance/percentage"
      }
    ]
  },
  {
    "title": "Fees & Payments",
    "href": "/student/fees",
    "children": [
      {
        "title": "Paid Fees",
        "href": "/student/fees/paid"
      },
      {
        "title": "Due Fees",
        "href": "/student/fees/due"
      },
      {
        "title": "Payment History",
        "href": "/student/fees/history"
      },
      {
        "title": "Payment Receipts",
        "href": "/student/fees/receipts"
      }
    ]
  },
  {
    "title": "Notices & Announcements",
    "href": "/student/notices"
  },
  {
    "title": "Academic Performance",
    "href": "/student/performance",
    "children": [
      {
        "title": "Overall Performance",
        "href": "/student/performance/overall"
      },
      {
        "title": "Subject-wise Performance",
        "href": "/student/performance/subject-wise"
      },
      {
        "title": "Class Ranking",
        "href": "/student/performance/ranking"
      }
    ]
  },
  {
    "title": "Library",
    "href": "/student/library",
    "children": [
      {
        "title": "Available Books",
        "href": "/student/library/available"
      },
      {
        "title": "Issued Books",
        "href": "/student/library/issued"
      }
    ]
  },
  {
    "title": "Download Documents",
    "href": "/student/documents"
  }
];
