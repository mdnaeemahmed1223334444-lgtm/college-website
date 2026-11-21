import type { NavNode } from "@/types/navigation";

// Menu + route tree for the public area. Edit titles/order here; pages read from this file.
export const publicNav: NavNode[] = [
  {
    "title": "About Us",
    "href": "/about",
    "children": [
      {
        "title": "College Overview",
        "href": "/about/overview"
      },
      {
        "title": "Principal's Message",
        "href": "/about/principals-message"
      },
      {
        "title": "Teachers",
        "href": "/about/teachers",
        "children": [
          {
            "title": "Science Teachers",
            "href": "/about/teachers/science"
          },
          {
            "title": "Business Studies Teachers",
            "href": "/about/teachers/business-studies"
          },
          {
            "title": "Humanities Teachers",
            "href": "/about/teachers/humanities"
          }
        ]
      },
      {
        "title": "Other Staff",
        "href": "/about/staff"
      },
      {
        "title": "Mission & Vision",
        "href": "/about/mission-vision"
      },
      {
        "title": "College History",
        "href": "/about/history"
      },
      {
        "title": "Management Committee",
        "href": "/about/management-committee"
      },
      {
        "title": "Departments",
        "href": "/about/departments"
      }
    ]
  },
  {
    "title": "Academic",
    "href": "/academic",
    "children": [
      {
        "title": "Departments & Subjects",
        "href": "/academic/departments-subjects"
      },
      {
        "title": "Courses",
        "href": "/academic/courses"
      },
      {
        "title": "Class Routine",
        "href": "/academic/class-routine"
      },
      {
        "title": "Academic Calendar",
        "href": "/academic/academic-calendar"
      },
      {
        "title": "Exam Schedule",
        "href": "/academic/exam-schedule"
      },
      {
        "title": "Guidelines for Parents",
        "href": "/academic/parent-guidelines"
      },
      {
        "title": "Student Dress Code",
        "href": "/academic/dress-code"
      },
      {
        "title": "Co-curricular Activities",
        "href": "/academic/co-curricular"
      },
      {
        "title": "Academic Regulations",
        "href": "/academic/regulations"
      }
    ]
  },
  {
    "title": "Notices",
    "href": "/notices"
  },
  {
    "title": "Information",
    "href": "/information",
    "children": [
      {
        "title": "News & Events",
        "href": "/information/news-events"
      },
      {
        "title": "College Facilities",
        "href": "/information/facilities"
      },
      {
        "title": "Achievements",
        "href": "/information/achievements"
      },
      {
        "title": "Holiday List",
        "href": "/information/holidays"
      },
      {
        "title": "Policies & Guidelines",
        "href": "/information/policies"
      },
      {
        "title": "Library",
        "href": "/information/library"
      },
      {
        "title": "Health & Environment Awareness",
        "href": "/information/health-awareness"
      },
      {
        "title": "Payment Information",
        "href": "/information/payment-information"
      },
      {
        "title": "Important Documents",
        "href": "/information/documents"
      }
    ]
  },
  {
    "title": "Admission",
    "href": "/admission",
    "children": [
      {
        "title": "Admission Circular",
        "href": "/admission/circular"
      },
      {
        "title": "Online Application",
        "href": "/admission/apply"
      },
      {
        "title": "Admission Requirements",
        "href": "/admission/requirements"
      },
      {
        "title": "Fees & Payment",
        "href": "/admission/fees-payment"
      },
      {
        "title": "Scholarships",
        "href": "/admission/scholarships"
      },
      {
        "title": "Transfer Procedures",
        "href": "/admission/transfer"
      },
      {
        "title": "Admission Results",
        "href": "/admission/results"
      },
      {
        "title": "Admission FAQ",
        "href": "/admission/faq"
      }
    ]
  },
  {
    "title": "Photo & Video Gallery",
    "href": "/gallery"
  },
  {
    "title": "Career / Employment",
    "href": "/career",
    "hidden": true,
    "children": [
      {
        "title": "At a Glance",
        "href": "/career/at-a-glance"
      },
      {
        "title": "Employment Circulars",
        "href": "/career/circulars"
      },
      {
        "title": "Online Job Application",
        "href": "/career/apply"
      },
      {
        "title": "Recruitment Exam Results",
        "href": "/career/results"
      }
    ]
  },
  {
    "title": "Contact Us",
    "href": "/contact"
  },
  {
    "title": "Login / Portal",
    "href": "/login"
  }
];
