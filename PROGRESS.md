# PROGRESS.md

_Last updated: Student & Teacher Profiles + REST API Endpoints complete._ Overall: **~43%**

Legend: DONE | IN PROGRESS | TODO

## Parts
| # | Part | Status | Notes |
|---|---|---|---|
| 1 | Foundation (config, DB clients, R2 helpers, core SQL, docs) | DONE | `/api/health` |
| 2 | Website structure: all routes, layouts, menus | DONE | 250 pages, placeholders, minimal styling |
| 2b | Owner changes: home page cleanup, batch-based student structure, teacher sees all students | DONE | see `docs/BUSINESS_RULES.md`; SQL `002_batches_students.sql` |
| 3 | Authentication & roles (login, logout, middleware + layout guards, first-admin script) | DONE | Testing-mode credentials bypass added; 1-click Admin/Teacher/Student sign-in |
| 4 | Admin: Website Management (nav, pages, settings, footer, social, SEO) + dynamic public pages | DONE | Features in `src/features/website/`, 10 admin management screens, dynamic pages |
| 5 | Content Management (notices, news/events, gallery + R2 upload, documents, holidays, careers) | DONE | Features in `src/features/content/`, 11 admin screens, 6 public pages |
| 5.1 | Admin UI User-Friendliness Pass & Input Visibility Fix | DONE | All admin inputs forced light; all 10 website forms simplified for non-technical staff |
| 5.2 | Notices Enhancement, Home Page Notices & Slug Removal | DONE | Notices on homepage & `/notices`, multi-format (PDF/Word/Picture/Text), deadlines, slug removed |
| 5.3 | **Student & Teacher Profile Features + Profile REST APIs** | DONE | `/student/profile`, `/teacher/profile`, `/api/student/profile`, `/api/teacher/profile` |
| 6 | Academic Management (departments, subjects, sessions, routines, calendar) | TODO | **Next** |
| 7 | Student Management: batches, add student, list/edit, transfer/group change, ID generation, photos; teacher read-only student views; Teacher/Staff mgmt | TODO | DB schema already done (2b) |
| 8 | Attendance (teacher entry by batch/group, draft/submit, admin view) | TODO | |
| 9 | Examination & marks | TODO | |
| 10 | Submission Approval Center | TODO | |
| 11 | Student Portal real pages | TODO | Profile is live; routines, ID card, fees, results next |
| 12 | Teacher Portal real pages | TODO | Profile is live; attendance entry, marks next |
| 13 | Admission (public apply + admin review/enrollment) | TODO | |
| 14 | Finance | TODO | |
| 15 | Library | TODO | |
| 16 | Communication, Reports/Export, Security & Backup, Contact form | TODO | |

---

## 🛠️ Summary of Changes: Student & Teacher Profile Features (For Future AI / Developers)

> **Context for another AI picking up this project:**
> The profile feature for both **Student** and **Teacher** portals has been built with clean, modular architecture. It is fully operational with high-fidelity realistic fallback data and Supabase private database support. In addition, dedicated REST API endpoints (`/api/student/profile` and `/api/teacher/profile`) are now live, ready for the client/developer to plug in external APIs or custom database services.

### 1. Data Models & Schemas (`src/features/profile/`)
- **`types.ts`:**
  - `StudentProfile`: id, studentCode (e.g. `DMC-2026-102`), fullName, banglaName, batchName (e.g. `HSC Batch 26`), batchYear (`first_year` / `second_year`), group (`science` / `business_studies` / `humanities`), roll, section, status, email, phone, gender, dateOfBirth, bloodGroup, religion, nationality, address, permanentAddress, fatherName, motherName, guardianName, guardianPhone, photoUrl, admissionDate, academicSession.
  - `TeacherProfile`: id, teacherCode (e.g. `T-104`), fullName, banglaName, designation, department, email, phone, gender, bloodGroup, joiningDate, qualification, specialization, roomNumber, address, bio, photoUrl, assignedClasses (className, group, subject, time), isClassTeacher, classTeacherOf.
  - `ProfileFeedback`: success, message, error.
- **`schema.ts`:**
  - `updateStudentProfileSchema`: validates personal phone, email, present address, guardian emergency phone.
  - `updateTeacherProfileSchema`: validates phone, email, roomNumber, address, specialization, bio.
  - `changePasswordSchema`: validates current password, new password (min 6 chars), and confirmation match.
- **`queries.ts`:**
  - `getStudentProfile(userId?: string)`: Queries Supabase private DB `students` + `batches`, falling back to `defaultStudentProfile`.
  - `getTeacherProfile(userId?: string)`: Queries Supabase private DB `profiles`, falling back to `defaultTeacherProfile`.
- **`actions.ts`:**
  - `updateStudentProfileAction`: protected with `requireRole(["student"])`, validates input, updates profile, revalidates `/student/profile`.
  - `updateTeacherProfileAction`: protected with `requireRole(["teacher"])`, validates input, updates profile, revalidates `/teacher/profile`.
  - `changePasswordAction`: updates user password via Supabase Auth admin API.

### 2. REST API Endpoints (`src/app/api/`)
- **`GET /api/student/profile` & `PUT /api/student/profile` (`src/app/api/student/profile/route.ts`):**
  - Authenticates student/admin role.
  - Returns complete student profile JSON or accepts JSON payload to update contact fields.
- **`GET /api/teacher/profile` & `PUT /api/teacher/profile` (`src/app/api/teacher/profile/route.ts`):**
  - Authenticates teacher/admin role.
  - Returns complete teacher profile JSON or accepts JSON payload to update faculty contact/bio fields.

### 3. Portal UI Views
- **Student Profile (`/student/profile`):**
  - Component: `src/components/student/StudentProfileView.tsx`.
  - Profile banner with photo, full name, student ID badge (`#DMC-2026-102`), active badge, batch, year, group, and roll.
  - Tabs:
    1. 🎓 **Academic & Identity:** Student code, class roll, batch, study group, section, session, admission date, plus digital ID card shortcut.
    2. 👨‍👩‍👦 **Personal & Guardian:** Father, mother, designated emergency guardian contact, date of birth, blood group, religion, nationality, and living address.
    3. ✏️ **Update Contact:** Form allowing student to update phone, email, address, and guardian emergency contact with one click.
    4. 🔒 **Security & Password:** Secure password change form.
- **Teacher Profile (`/teacher/profile`):**
  - Component: `src/components/teacher/TeacherProfileView.tsx`.
  - Faculty header with photo, designation, department, faculty code (`#T-104`), and active status badge.
  - Tabs:
    1. 👨‍🏫 **Faculty Role & Classes:** Designation, department, joining date, room number, class teacher assignment, and grid of active teaching schedules/classes.
    2. 🎓 **Qualifications & Bio:** Academic degrees, research specializations, and biographical summary.
    3. ✏️ **Edit Profile Info:** Update contact phone, email, office desk/room, specialization, and bio.
    4. 🔒 **Security & Password:** Secure password change form.

### 4. How to Plug In Your External APIs
When you provide your backend APIs:
1. Open `src/features/profile/queries.ts` and replace or enhance the fetch logic inside `getStudentProfile()` and `getTeacherProfile()` to call your backend API endpoint.
2. In `src/features/profile/actions.ts`, forward the `PUT` or `POST` mutation to your external API.
3. Alternatively, client apps or mobile apps can directly call `GET /api/student/profile` and `GET /api/teacher/profile`.

---

## Next up: Part 6 (Academic Management)
- Admin screens under `/admin/academic/*`:
  - Departments (`/admin/academic/departments`)
  - Subjects (`/admin/academic/subjects`)
  - Sessions (`/admin/academic/sessions`)
  - Classes & Sections (`/admin/academic/classes`, `/admin/academic/sections`)
  - Subject Teachers & Class Teachers (`/admin/academic/subject-teachers`, `/admin/academic/class-teachers`)
  - Class Routines & Rules (`/admin/academic/routines`, `/admin/academic/rules`)
  - Calendar (`/admin/academic/calendar`)
- Public Academic pages: `/academic/departments-subjects`, `/academic/courses`, `/academic/class-routine`, `/academic/academic-calendar`.
- Note for AI: Use `src/features/academic/` with `{types.ts, schema.ts, queries.ts, actions.ts}`. Maintain fallback defaults so preview works without live DB.
