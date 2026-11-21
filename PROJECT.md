# PROJECT.md: College Website (read this first)

> For any AI/dev: this file is the single source of truth about the project.
> Current status is in `PROGRESS.md`. Do NOT re-read every file; use this map.

## 1. What we are building
A college website with 4 areas:
1. **Public website** (About, Academic, Information, Admission, Gallery, Career, Contact)
2. **Student Portal** (profile, ID card, routine, results, attendance, fees, library...)
3. **Teacher Portal** (classes, attendance entry, marks entry, reports, submissions)
4. **Admin Panel** (17 management modules incl. Submission Approval Center)

Workflow rule: Teachers *submit* attendance/marks -> Admin *reviews* -> approve (publish to students) or return for correction.

## 2. Tech stack & infrastructure
| Service | Purpose |
|---|---|
| Next.js 15 (App Router) + TypeScript + Tailwind 3 | App + API routes |
| Vercel | Hosting |
| GitHub | Code, SQL migrations, logos/static assets, docs |
| **Supabase 1 (MAIN)** | Public content: pages, notices, news/events, gallery metadata, admission info, nav, settings |
| **Supabase 2 (PRIVATE)** | Auth + students, teachers, classes, attendance, marks, results, fees, library loans |
| Cloudflare R2 | All images (student/teacher/gallery/site) |

### Security rules (never break)
- Browser NEVER receives service-role keys. All DB/R2 access is server-side (`src/lib/*`, route handlers, server actions).
- `mainAdmin()` / `privateAdmin()` bypass RLS: call them ONLY after verifying the user's role.
- RLS is enabled on every table. Main DB: anon can read published content only. Private DB: no anon access.
- R2 key folders: `public/...` (public URL) and `private/...` (signed URLs only).
- Auth accounts live in Supabase 2 (`profiles.role` = admin | teacher | student).

## 3. Folder structure (each concern in its own file)
```
src/
  app/
    (public)/           PUBLIC website (route group, not in URL): layout + one folder per page
      page.tsx            Home (composed from components/home/*)
      about/ academic/ information/ admission/ gallery/ career/ contact/ login/
    student/            STUDENT portal (layout.tsx = sidebar shell, one folder per page)
    teacher/            TEACHER portal
    admin/              ADMIN panel (17 modules)
    api/health/         GET /api/health (env + DB check)
    not-found.tsx
  components/
    layout/             PublicHeader, PublicFooter, PortalShell, PortalSidebar (restyle these)
    home/               HeroSection, NoticeTicker, QuickLinks, LatestNews, GalleryPreview
    shared/             PlaceholderPage (temporary body of every unbuilt page)
  config/
    navigation/         public.ts student.ts teacher.ts admin.ts  = menu + route tree (SOURCE OF TRUTH for titles/hrefs)
                        index.ts = findNode() / findParent() helpers
    env.ts              validated env (server only)      site.ts  static site name
  lib/
    supabase/main-server.ts      mainPublic(), mainAdmin()
    supabase/private-server.ts   privateAnon(), privateAdmin()
    storage/r2.ts                upload/delete/presign/public URL helpers
    utils/api-response.ts        ok() / fail()
  types/                roles.ts, navigation.ts
  features/auth/        actions.ts, schema.ts, types.ts
  lib/auth/             roles.ts (constants), current-user.ts (getCurrentUser, requireRole)
  middleware.ts         route guard
supabase/main/migrations/      SQL for Supabase 1 (numbered)
supabase/private/migrations/   SQL for Supabase 2 (numbered)
scripts/generate-structure.py  one-time generator that created pages + nav config (do not re-run after editing pages)
docs/ROUTES.md   full route map (247 pages)   docs/MODULES.md  feature map   docs/BUSINESS_RULES.md  batches/roles rules
```

### How a page works
Every route is its own `page.tsx`. Unbuilt pages are `<PlaceholderPage href="/x/y" />`, which reads title/children/sections from `config/navigation/*`. To build a page: replace the placeholder inside that one file with the real component. To rename/reorder/add a menu item: edit the matching file in `config/navigation/` (and add/rename the folder).
`sections` in the nav config = things shown INSIDE a page (dashboard widgets, form steps), not separate routes.

Convention for real features: `src/features/<module>/{queries.ts, actions.ts, schema.ts, types.ts}` + its own SQL migration. Keep data logic out of JSX files.

## 3b. Authentication (built in Part 3)
- Accounts live in Supabase Auth of the PRIVATE project; `profiles.role` = admin | teacher | student; `profiles.status` must be `active`.
- Login: `features/auth/actions.ts` (`loginAction`, `logoutAction`) + `components/auth/LoginForm.tsx` at `/login`. Email + password.
- Guards: `src/middleware.ts` (first check: /admin=admin, /teacher=teacher, /student=student) and `requireRole([...])` in `lib/auth/current-user.ts` (second check, used in every portal layout and must be used in every server action / data function).
- Session helper: `lib/supabase/private-session.ts` (acts as the user, anon key). Data work still uses `privateAdmin()` after `requireRole`.
- First admin: `npm run create-admin -- email password "Full Name"`.
- Local preview without Supabase: set `DEV_BYPASS_AUTH=true` in `.env.local` (ignored in production).

## 3c. Business rules
Batches, groups, transfers, and who-can-see-what are in `docs/BUSINESS_RULES.md`. READ IT before touching students/attendance/marks.

## 4. Build approach
Built **part by part** (see `PROGRESS.md`). Frontend styling is intentionally minimal; another AI will restyle later, so keep UI components dumb (props in, JSX out) and keep data logic in `features/`/`lib/`, never inside JSX files.

## 5. Setup
1. `npm install`
2. Copy `.env.example` -> `.env.local`, fill values.
3. Run `supabase/main/migrations/*.sql` in Supabase 1, `supabase/private/migrations/*.sql` in Supabase 2 (in numeric order: 001_core, 002_batches_students).
4. Create R2 bucket; make only `public/` served via custom domain/r2.dev.
5. `npm run dev`. Browse any route; open `/api/health` (all should be `ok`).
   Portals are protected. Either run `npm run create-admin` and log in, or set `DEV_BYPASS_AUTH=true` to preview layouts.

## 6. Database naming
snake_case tables, uuid PKs, `created_at`/`updated_at` timestamps, enums for fixed sets. Migrations are additive and numbered per database.
