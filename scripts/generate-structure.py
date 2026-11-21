"""
One-time generator for the website STRUCTURE (routes + nav config + docs/ROUTES.md).
Source of truth afterwards = the generated files themselves (edit them directly).
Re-running overwrites page.tsx files that are generated, so avoid re-running after editing pages.
"""
import json, os

def n(slug, title, children=None, sections=None, hidden=False):
    return {"slug": slug, "title": title, "children": children, "sections": sections, "hidden": hidden}

# ------------------------------------------------------------------ PUBLIC
PUBLIC = [
  n("about", "About Us", [
    n("overview", "College Overview"),
    n("principals-message", "Principal's Message"),
    n("teachers", "Teachers", [
      n("science", "Science Teachers"),
      n("business-studies", "Business Studies Teachers"),
      n("humanities", "Humanities Teachers"),
    ]),
    n("staff", "Other Staff"),
    n("mission-vision", "Mission & Vision"),
    n("history", "College History"),
    n("management-committee", "Management Committee"),
    n("departments", "Departments"),
  ]),
  n("academic", "Academic", [
    n("departments-subjects", "Departments & Subjects"),
    n("courses", "Courses"),
    n("class-routine", "Class Routine"),
    n("academic-calendar", "Academic Calendar"),
    n("exam-schedule", "Exam Schedule"),
    n("parent-guidelines", "Guidelines for Parents"),
    n("dress-code", "Student Dress Code"),
    n("co-curricular", "Co-curricular Activities"),
    n("regulations", "Academic Regulations"),
  ]),
  n("information", "Information", [
    n("notice-board", "Notice Board"),
    n("news-events", "News & Events"),
    n("facilities", "College Facilities"),
    n("achievements", "Achievements"),
    n("holidays", "Holiday List"),
    n("policies", "Policies & Guidelines"),
    n("library", "Library"),
    n("health-awareness", "Health & Environment Awareness"),
    n("payment-information", "Payment Information"),
    n("documents", "Important Documents"),
  ]),
  n("admission", "Admission", [
    n("circular", "Admission Circular"),
    n("apply", "Online Application"),
    n("requirements", "Admission Requirements"),
    n("fees-payment", "Fees & Payment"),
    n("scholarships", "Scholarships"),
    n("transfer", "Transfer Procedures"),
    n("results", "Admission Results"),
    n("faq", "Admission FAQ"),
  ]),
  n("gallery", "Photo & Video Gallery"),
  n("career", "Career / Employment", [
    n("at-a-glance", "At a Glance"),
    n("circulars", "Employment Circulars"),
    n("apply", "Online Job Application"),
    n("results", "Recruitment Exam Results"),
  ], hidden=True),
  n("contact", "Contact Us"),
  n("login", "Login / Portal"),
]

# ------------------------------------------------------------------ STUDENT
STUDENT = [
  n("", "Student Dashboard", sections=["Personal Overview", "Upcoming Events", "Important Notifications"]),
  n("profile", "My Profile"),
  n("id-card", "Digital Student ID Card"),
  n("class-routine", "Class Routine"),
  n("exam-schedule", "Exam Schedule"),
  n("results", "Examination Results", [
    n("history", "Result History"),
    n("subject-marks", "Subject-wise Marks"),
    n("grades-gpa", "Grades & GPA"),
    n("marksheet", "Marksheet Download"),
  ]),
  n("attendance", "Attendance Records", [
    n("history", "Attendance History"),
    n("percentage", "Attendance Percentage"),
  ]),
  n("fees", "Fees & Payments", [
    n("paid", "Paid Fees"),
    n("due", "Due Fees"),
    n("history", "Payment History"),
    n("receipts", "Payment Receipts"),
  ]),
  n("notices", "Notices & Announcements"),
  n("performance", "Academic Performance", [
    n("overall", "Overall Performance"),
    n("subject-wise", "Subject-wise Performance"),
    n("ranking", "Class Ranking"),
  ]),
  n("library", "Library", [
    n("available", "Available Books"),
    n("issued", "Issued Books"),
  ]),
  n("documents", "Download Documents"),
]

# ------------------------------------------------------------------ TEACHER
TEACHER = [
  n("", "Teacher Dashboard", sections=["Today's Classes", "Pending Attendance", "Pending Marks Submission", "Recent Activities", "Notifications"]),
  n("profile", "My Profile"),
  n("classes", "Assigned Classes"),
  n("routines", "Class Routines"),
  n("students", "Student Information", [
    n("performance", "Student Performance"),
    n("attendance", "Student Attendance Records"),
  ], sections=["ALL students (every batch, group and status), read-only",
               "Search & filter: Batch, Year, Group, Status",
               "Open any student to see FULL details"]),
  n("attendance", "Attendance Management", [
    n("history", "Attendance History"),
    n("corrections", "Edit / Correction Requests"),
  ], sections=["Select Batch (running)", "Select Year (1st / 2nd)", "Select Group (Science / Business Studies / Humanities)", "Select Date", "View Student List",
               "Mark Attendance (Present / Absent / Late / Excused)", "Save as Draft", "Submit Attendance"]),
  n("marks", "Examination & Marks", [
    n("history", "Marks Submission History"),
    n("corrections", "Edit / Correction Requests"),
  ], sections=["Select Examination", "Select Batch & Group", "Select Subject",
               "Student Marks Entry (Obtained / Maximum / Practical-Written)", "Save as Draft", "Submit Marks"]),
  n("exam-duties", "Exam Hall Duties"),
  n("notices", "Notices & Announcements"),
  n("reports", "Academic Reports", [
    n("attendance", "Attendance Reports"),
    n("examination", "Examination Reports"),
    n("performance", "Student Performance Reports"),
  ]),
  n("submissions", "Submission History"),
]

# ------------------------------------------------------------------ ADMIN
ADMIN = [
  n("", "Dashboard & Analytics", sections=["Total Students", "Total Teachers & Staff", "Attendance Statistics",
      "Examination Statistics", "Admission Statistics", "Financial Overview", "Recent Activities", "Pending Tasks"]),
  n("website", "Website Management", [
    n("homepage", "Manage Homepage"), n("navigation", "Navigation Menu Management"),
    n("pages", "Website Pages Management"), n("branding", "Logo & Branding"),
    n("homepage-sections", "Homepage Sections"), n("appearance", "Website Appearance"),
    n("seo", "SEO & Metadata"), n("footer", "Footer Management"),
    n("social-links", "Social Media Links"), n("features", "Enable / Disable Features"),
  ]),
  n("students", "Student Management", [
    n("batches", "Batches", sections=[
      "Create batch (e.g. HSC Batch 26)",
      "Batch status: Running / Passed",
      "Running batch year: 1st Year / 2nd Year (promote 1st to 2nd)",
      "Students of each batch, split by Science / Business Studies / Humanities"]),
    n("add", "Add Student", sections=[
      "Select batch (running)", "Select group: Science / Business Studies / Humanities",
      "Personal, guardian & contact details", "Photo upload (R2, private)",
      "Create login account (optional)"]),
    n("list", "All Students (Edit / Delete)", sections=[
      "Filter: Batch, Year, Group, Status", "Open a student to edit EVERYTHING (incl. group)"]),
    n("transfer", "Transfer & Group Change", sections=[
      "Select student", "Move to another RUNNING batch (e.g. did not pass HSC)",
      "Change group (Science / Business Studies / Humanities)", "New roll (optional)",
      "Reason", "Transfer history log"]),
    n("admission-records", "Admission Records"),
    n("id-generation", "Student ID Generation"),
    n("status", "Student Status Management"),
    n("import-export", "Bulk Import / Export"),
    n("documents", "Student Documents"),
    n("accounts", "Student Account Management"),
  ]),
  n("staff", "Teacher & Staff Management", [
    n("list", "Add / Edit / Remove Staff"), n("profiles", "Teacher Profiles"),
    n("departments", "Department Assignment"), n("subjects", "Subject Assignment"),
    n("class-section", "Class & Section Assignment"), n("workload", "Teacher Workload"),
    n("attendance", "Staff Attendance"), n("employment", "Employment Records"),
    n("accounts", "Teacher Account Management"),
  ]),
  n("academic", "Academic Management", [
    n("departments", "Manage Departments"), n("classes", "Manage Classes"),
    n("sections", "Manage Sections"), n("subjects", "Manage Subjects"),
    n("sessions", "Academic Sessions"), n("routines", "Class Routines"),
    n("calendar", "Academic Calendar"), n("class-teachers", "Class Teacher Assignment"),
    n("subject-teachers", "Subject Teacher Assignment"), n("rules", "Academic Rules & Regulations"),
  ]),
  n("examinations", "Examination Management", [
    n("create", "Create Examinations"), n("schedule", "Exam Schedule"),
    n("halls", "Exam Hall Management"), n("marks", "Marks Management"),
    n("grading", "Grading System"), n("approval", "Result Approval"),
    n("publish", "Publish Results"), n("correction", "Result Correction"),
    n("merit-list", "Merit List & Ranking"), n("marksheets", "Marksheet Generation"),
    n("history", "Result History"),
  ]),
  n("attendance", "Attendance Management", [
    n("all", "View All Attendance"), n("students", "Student Attendance"),
    n("staff", "Staff Attendance"), n("correction", "Attendance Correction"),
    n("reports", "Attendance Reports"), n("rules", "Attendance Rules"),
    n("deadlines", "Attendance Deadlines"), n("locking", "Attendance Locking"),
  ]),
  n("admissions", "Admission Management", [
    n("applications", "Admission Applications"), n("review", "Application Review"),
    n("verification", "Applicant Verification"), n("selection", "Admission Selection"),
    n("results", "Admission Results"), n("enrollment", "Student Enrollment"),
    n("settings", "Admission Settings"),
  ]),
  n("finance", "Finance Management", [
    n("fee-structure", "Fee Structure"), n("payments", "Student Payments"),
    n("dues", "Due Payments"), n("verification", "Payment Verification"),
    n("scholarships", "Scholarships & Waivers"), n("receipts", "Payment Receipts"),
    n("reports", "Financial Reports"), n("settings", "Payment Settings"),
  ]),
  n("content", "Content Management", [
    n("notices", "Notice Management"), n("news-events", "News & Events"),
    n("gallery", "Gallery Management"), n("uploads", "Photo & Video Uploads"),
    n("page-editor", "Page Content Editor"), n("documents", "Document Management"),
    n("career-circulars", "Career Circulars"), n("holidays", "Holiday Management"),
    n("drafts", "Draft & Publish"), n("scheduled", "Scheduled Publishing"),
  ]),
  n("library", "Library Management", [
    n("books", "Book Management"), n("categories", "Book Categories"),
    n("issue-return", "Book Issue & Return"), n("members", "Library Members"),
    n("reports", "Library Reports"),
  ]),
  n("communication", "Communication Management", [
    n("notifications", "Send Notifications"), n("student-announcements", "Student Announcements"),
    n("teacher-announcements", "Teacher Announcements"), n("email", "Email Integration"),
    n("sms", "SMS Integration"), n("contact-messages", "Contact Messages"),
  ]),
  n("reports", "Reports & Analytics", [
    n("students", "Student Reports"), n("academic", "Academic Reports"),
    n("examination", "Examination Reports"), n("attendance", "Attendance Reports"),
    n("financial", "Financial Reports"), n("admission", "Admission Reports"),
    n("teacher-performance", "Teacher Performance Reports"), n("export", "Export PDF / Excel / CSV"),
  ]),
  n("users", "User & Permission Management", [
    n("accounts", "Create User Accounts"), n("roles", "Manage Roles"),
    n("permissions", "Assign Permissions"), n("reset-passwords", "Reset Passwords"),
    n("status", "Activate / Suspend Accounts"), n("login-history", "Login History"),
    n("custom-roles", "Custom Roles"),
  ]),
  n("settings", "System Settings", [
    n("college-info", "College Information"), n("academic", "Academic Settings"),
    n("grading", "Grading Configuration"), n("fees", "Fee Configuration"),
    n("portal", "Portal Settings"), n("language-timezone", "Language & Timezone"),
    n("integrations", "Integrations & API"), n("website", "Website Configuration"),
    n("features", "Feature Configuration"),
  ]),
  n("security", "Security & Backup", [
    n("activity-logs", "Activity Logs"), n("admin-history", "Admin Action History"),
    n("backup", "Database Backup"), n("restore", "Database Restore"),
    n("security-settings", "Security Settings"), n("sessions", "Session Management"),
    n("login-security", "Login Security"),
  ]),
  n("approvals", "Submission Approval Center", [
    n("pending-attendance", "Pending Attendance Submissions"),
    n("pending-marks", "Pending Marks Submissions"),
    n("attendance-corrections", "Attendance Correction Requests"),
    n("marks-corrections", "Marks Correction Requests"),
  ], sections=["Review submission", "Approved? Yes -> Confirm & Publish", "Approved? No -> Return to teacher for correction"]),
]

AREAS = [
  # (varname, file, base href, route dir under src/app, tree)
  ("publicNav",  "public",  "",         "src/app/(public)", PUBLIC),
  ("studentNav", "student", "/student", "src/app/student",  STUDENT),
  ("teacherNav", "teacher", "/teacher", "src/app/teacher",  TEACHER),
  ("adminNav",   "admin",   "/admin",   "src/app/admin",    ADMIN),
]
CUSTOM = {"/", "/login", "/contact"}   # hand-written pages, generator skips them

def build(nodes, base):
    out = []
    for nd in nodes:
        href = base + ("/" + nd["slug"] if nd["slug"] else "") if base != "" or nd["slug"] else "/"
        if base == "" and nd["slug"]:
            href = "/" + nd["slug"]
        d = {"title": nd["title"], "href": href}
        if nd["sections"]: d["sections"] = nd["sections"]
        if nd.get("hidden"): d["hidden"] = True
        if nd["children"]: d["children"] = build(nd["children"], href)
        out.append(d)
    return out

def walk(nodes):
    for nd in nodes:
        yield nd
        if nd.get("children"):
            yield from walk(nd["children"])

routes_md = ["# ROUTES.md: complete route map (generated)\n",
             "Page file = `src/app/<route>/page.tsx` (public routes live in the `(public)` group, which is not part of the URL).\n"]

for var, fname, base, appdir, tree in AREAS:
    data = build(tree, base)
    with open(f"src/config/navigation/{fname}.ts", "w") as f:
        f.write('import type { NavNode } from "@/types/navigation";\n\n')
        f.write(f"// Menu + route tree for the {fname} area. Edit titles/order here; pages read from this file.\n")
        f.write(f"export const {var}: NavNode[] = {json.dumps(data, indent=2, ensure_ascii=False)};\n")
    routes_md.append(f"\n## {fname.capitalize()}\n")
    def md(nodes, depth=0):
        for nd in nodes:
            routes_md.append("  " * depth + f"- `{nd['href'] or '/'}`: {nd['title']}" + (" _(hidden from menus)_" if nd.get("hidden") else ""))
            for s in nd.get("sections", []) or []:
                routes_md.append("  " * (depth + 1) + f"- _(on page)_ {s}")
            if nd.get("children"): md(nd["children"], depth + 1)
    md(data)
    for nd in walk(data):
        href = nd["href"]
        if href in CUSTOM: continue
        rel = href[len(base):].strip("/") if base else href.strip("/")
        pdir = os.path.join(appdir, rel) if rel else appdir
        os.makedirs(pdir, exist_ok=True)
        with open(os.path.join(pdir, "page.tsx"), "w") as f:
            f.write('import PlaceholderPage from "@/components/shared/PlaceholderPage";\n\n')
            f.write(f'// {nd["title"]}\n')
            f.write(f'export default function Page() {{\n  return <PlaceholderPage href="{href}" />;\n}}\n')

with open("docs/ROUTES.md", "w") as f:
    f.write("\n".join(routes_md) + "\n")

print("pages:", sum(1 for a in AREAS for _ in walk(build(a[4], a[2]))))
