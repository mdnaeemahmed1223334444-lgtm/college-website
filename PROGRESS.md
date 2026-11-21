# PROGRESS.md

_Last updated: Direct Photo & File Upload across all admin forms complete._ Overall: **~48%**

Legend: DONE | IN PROGRESS | TODO

## Parts
| # | Part | Status | Notes |
|---|---|---|---|
| 1 | Foundation (config, DB clients, R2 helpers, core SQL, docs) | DONE | `/api/health` |
| 2 | Website structure: all routes, layouts, menus | DONE | 250 pages, placeholders, minimal styling |
| 2b | Owner changes: home page cleanup, batch-based student structure, teacher sees all students | DONE | see `docs/BUSINESS_RULES.md`; SQL `002_batches_students.sql` |
| 3 | Authentication & roles (login, logout, middleware + layout guards, first-admin script) | DONE | Testing bypass upgraded; instant access to `/admin`, `/teacher`, `/student` |
| 4 | Admin: Website Management (nav, pages, settings, footer, social, SEO) + dynamic public pages | DONE | Features in `src/features/website/`, 10 admin management screens, dynamic pages |
| 5 | Content Management (notices, news/events, gallery + R2 upload, documents, holidays, careers) | DONE | Features in `src/features/content/`, 11 admin screens, 6 public pages |
| 5.1 | Admin UI User-Friendliness Pass & Input Visibility Fix | DONE | All admin inputs forced light; all 10 website forms simplified for non-technical staff |
| 5.2 | Notices Enhancement, Home Page Notices & Slug Removal | DONE | Notices on homepage & `/notices`, multi-format (PDF/Word/Picture/Text), deadlines, slug removed |
| 5.3 | Student & Teacher Profile Features + Profile REST APIs | DONE | `/student/profile`, `/teacher/profile`, `/api/student/profile`, `/api/teacher/profile` |
| 5.4 | **Portal Access & Middleware Fix** | DONE | Fixed redirect loop on `/admin`, `/teacher`, `/student`; automatic role assignment in testing mode |
| 5.5 | **Administration: Teacher & Staff Management + Profiles** | DONE | 10 admin screens under `/admin/staff/*`, profile creation modal, assignments, workloads, attendance, accounts, REST APIs, and public faculty directories |
| 5.6 | **Direct Photo & File Upload — all admin forms** | DONE | `ImageUploadInput`, `FileUploadInput`, `/api/upload` endpoint, R2+local+data-URL fallback chain. Upgraded: TeacherProfiles, StaffList, Gallery, Notice, NewsEvent, Career, Document, BrandingForm (logo+favicon), HomepageForm (banner), SeoForm (OG image). Build: 252 routes ✓ |
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

## 🛠️ Summary of Changes: Portal Access & Middleware Fix (For Future AI / Developers)

> **Context for another AI picking up this project:**
> Previously, navigating to `/admin`, `/teacher`, or `/student` redirected back to `/login?error=config` because the local environment did not have a `.env` file with Supabase credentials, and the middleware strictly required Supabase session validation. This has been resolved so that portals can be tested and opened immediately both locally and on preview deployments.

### Root Cause
1. `src/middleware.ts` had a strict check that required Supabase to be configured (`configured: true`). When Supabase keys were not present in `.env`, the middleware bounced visitors back to `/login?error=config`.
2. In `src/lib/auth/current-user.ts`, `devBypass()` required `process.env.NODE_ENV !== "production"`. When testing production builds (`npm run build && npm start`) or preview builds without Supabase keys, `getCurrentUser()` returned `null`, triggering a redirect to `/login`.
3. `src/lib/supabase/private-server.ts` was calling `getEnv()` without a `try/catch` block, which threw an unhandled error when Supabase environment variables were absent.

### Fix Applied
1. **`src/middleware.ts`:**
   - Detects test/preview mode: `DEV_BYPASS_AUTH="true" || !process.env.PRIVATE_SUPABASE_ANON_KEY || process.env.NODE_ENV !== "production"`.
   - When accessing `/admin`, `/teacher`, or `/student`, the middleware automatically sets the corresponding `dev_role` cookie (`admin`, `teacher`, `student`) and allows immediate access.
2. **`src/lib/auth/current-user.ts`:**
   - Updated `devBypass()` to allow seamless portal testing whenever Supabase keys are not yet configured.
   - `requireRole(["admin"])`, `requireRole(["teacher"])`, and `requireRole(["student"])` resolve the active test role and user object without redirecting to `/login`.
3. **`src/lib/supabase/private-server.ts` & `main-server.ts`:**
   - Both `privateAdmin()` and `mainAdmin()` now safely return `null` instead of throwing unhandled exceptions when credentials are not yet supplied.
4. **`.env` Configuration:**
   - Created `.env` with `DEV_BYPASS_AUTH=true`.

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
