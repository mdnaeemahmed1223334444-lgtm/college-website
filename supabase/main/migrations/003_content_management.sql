-- MAIN DATABASE (Supabase 1) : Content Management (Notices, News/Events, Gallery, Documents, Holidays, Careers)
-- Run in the Supabase SQL editor of the MAIN project after 001_core.sql and 002_website_defaults.sql.

-- 1. Notices Table
create table if not exists notices (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  content         text not null default '',
  category        text not null default 'General', -- 'Academic', 'Admission', 'Examination', 'General', 'Administrative'
  attachment_url  text,
  is_pinned       boolean not null default false,
  is_urgent       boolean not null default false,
  status          content_status not null default 'published',
  published_at    timestamptz default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_notices_status on notices(status);
create index if not exists idx_notices_category on notices(category);
create trigger trg_notices_updated before update on notices
  for each row execute function set_updated_at();

-- 2. News & Events Table
create table if not exists news_events (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  summary         text not null default '',
  content         text not null default '',
  type            text not null default 'news', -- 'news' | 'event'
  category        text not null default 'Campus', -- 'Academic', 'Cultural', 'Sports', 'Campus', 'Achievement'
  event_date      timestamptz,
  venue           text,
  cover_image_url text,
  status          content_status not null default 'published',
  published_at    timestamptz default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_news_type on news_events(type);
create index if not exists idx_news_status on news_events(status);
create trigger trg_news_events_updated before update on news_events
  for each row execute function set_updated_at();

-- 3. Gallery Albums & Items
create table if not exists gallery_albums (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  description     text default '',
  cover_image_url text not null,
  category        text not null default 'Campus Life', -- 'Campus Life', 'Sports', 'Cultural', 'Academic', 'Facilities'
  media_type      text not null default 'photo', -- 'photo' | 'video'
  status          content_status not null default 'published',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_gallery_albums_updated before update on gallery_albums
  for each row execute function set_updated_at();

create table if not exists gallery_items (
  id              uuid primary key default gen_random_uuid(),
  album_id        uuid references gallery_albums(id) on delete cascade,
  title           text,
  media_url       text not null,
  thumbnail_url   text,
  media_type      text not null default 'photo',
  position        int not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists idx_gallery_album on gallery_items(album_id);

-- 4. Downloadable Documents
create table if not exists documents (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  category        text not null default 'General Forms', -- 'Academic', 'Admission', 'Syllabus', 'General Forms', 'Policies'
  file_url        text not null,
  file_size       text, -- e.g. "1.2 MB"
  file_type       text not null default 'PDF', -- 'PDF', 'DOCX', 'ZIP'
  is_active       boolean not null default true,
  downloads_count int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_documents_updated before update on documents
  for each row execute function set_updated_at();

-- 5. Academic & National Holidays
create table if not exists holidays (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  start_date      date not null,
  end_date        date not null,
  total_days      int not null default 1,
  type            text not null default 'National', -- 'National', 'Academic', 'Religious', 'Special'
  description     text default '',
  year            int not null default 2026,
  created_at      timestamptz not null default now()
);
create index if not exists idx_holidays_year on holidays(year);

-- 6. Career Circulars
create table if not exists career_circulars (
  id                        uuid primary key default gen_random_uuid(),
  title                     text not null,
  post_name                 text not null,
  vacancy                   int not null default 1,
  employment_type           text not null default 'Full-time', -- 'Full-time', 'Part-time', 'Contractual'
  deadline                  date not null,
  circular_file_url         text,
  requirements              text default '',
  application_instructions  text default '',
  status                    content_status not null default 'published',
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
create trigger trg_career_circulars_updated before update on career_circulars
  for each row execute function set_updated_at();

-- ---------- Row Level Security ----------
alter table notices           enable row level security;
alter table news_events       enable row level security;
alter table gallery_albums    enable row level security;
alter table gallery_items     enable row level security;
alter table documents         enable row level security;
alter table holidays          enable row level security;
alter table career_circulars  enable row level security;

-- Public read policies
create policy "public read published notices" on notices for select
  using (status = 'published');
create policy "public read published news" on news_events for select
  using (status = 'published');
create policy "public read published albums" on gallery_albums for select
  using (status = 'published');
create policy "public read gallery items" on gallery_items for select
  using (true);
create policy "public read active documents" on documents for select
  using (is_active = true);
create policy "public read holidays" on holidays for select
  using (true);
create policy "public read published careers" on career_circulars for select
  using (status = 'published');

-- ---------- Initial Seed Data ----------
insert into notices (title, slug, content, category, is_pinned, is_urgent, status) values
(
  'Admission Circular for HSC Session 2026-2027',
  'admission-circular-hsc-2026-2027',
  '<p>Applications are invited from eligible candidates for admission into Class XI (HSC) in Science, Business Studies, and Humanities groups for the academic session 2026-2027.</p><p>Students must apply online through the college portal or board central admission system before the deadline.</p>',
  'Admission',
  true,
  true,
  'published'
),
(
  'HSC Pre-Board Examination Schedule Published',
  'hsc-pre-board-exam-schedule',
  '<p>The pre-board examination for HSC 2nd year students will commence on December 10, 2026. Detailed subject-wise routine is available on the examination notice board.</p>',
  'Examination',
  true,
  false,
  'published'
),
(
  'College Annual Sports Meet 2026 Participation Notice',
  'annual-sports-meet-2026',
  '<p>The Annual Athletics & Sports Competition 2026 will take place on the college ground. Interested participants should register with their class physical education teacher by next Sunday.</p>',
  'General',
  false,
  false,
  'published'
),
(
  'Class Routine Revision for HSC 1st Year (Science & Business)',
  'class-routine-revision-hsc-1st-year',
  '<p>Please note that laboratory and lecture slots for Physics and Accounting have been slightly adjusted starting from this Monday. Check the updated routine online.</p>',
  'Academic',
  false,
  false,
  'published'
)
on conflict (slug) do nothing;

insert into news_events (title, slug, summary, content, type, category, event_date, venue, cover_image_url, status) values
(
  'National Science Olympiad: DMC Students Win 3 First Prizes',
  'national-science-olympiad-winners-2026',
  'Dhaka Model College students showcased exceptional brilliance in the National Science Olympiad finals.',
  '<p>In a momentous achievement, three students from our Science department secured the top positions in Physics and Chemistry at the 14th National Science Olympiad. The Governing Body and Principal congratulate our brilliant winners.</p>',
  'news',
  'Achievement',
  now(),
  'National Science Museum, Dhaka',
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
  'published'
),
(
  'Annual Inter-College Debate Championship 2026',
  'inter-college-debate-championship-2026',
  'Three-day national parliamentary debate tournament hosting 32 prestigious collegiate teams.',
  '<p>The College Debating Society is thrilled to host the 2026 National Parliamentary Debate Tournament from December 15 to December 17. The grand finale will be graced by distinguished educationists.</p>',
  'event',
  'Cultural',
  '2026-12-15 09:30:00+06',
  'Central College Auditorium',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
  'published'
),
(
  'Inauguration of Modern STEM & AI Learning Laboratory',
  'inauguration-modern-stem-ai-lab',
  'State-of-the-art computer and robotics lab equipped with 60 high-performance workstations inaugurated.',
  '<p>To prepare students for fourth industrial revolution skills, Dhaka Model College has inaugurated a dedicated STEM & AI laboratory with robotics kits, 3D printers, and high-speed fiber connectivity.</p>',
  'news',
  'Academic',
  now(),
  'IT Complex, Level 4',
  'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
  'published'
)
on conflict (slug) do nothing;

insert into gallery_albums (title, slug, description, cover_image_url, category, media_type, status) values
(
  'Campus Infrastructure & Facilities',
  'campus-infrastructure-facilities',
  'A visual tour of our multimedia classrooms, science labs, central library, and green campus grounds.',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
  'Facilities',
  'photo',
  'published'
),
(
  'Annual Athletics & Sports Competition',
  'annual-athletics-sports-competition',
  'High-energy highlights from sprint races, high jump, cricket tournament, and prize giving ceremony.',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
  'Sports',
  'photo',
  'published'
),
(
  'Science Fair & Innovation Showcase',
  'science-fair-innovation-showcase',
  'Creative working models, environmental solutions, and robotics projects presented by young innovators.',
  'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=800&q=80',
  'Academic',
  'photo',
  'published'
)
on conflict (slug) do nothing;

insert into documents (title, category, file_url, file_size, file_type, is_active) values
(
  'College Prospectus & Academic Guide 2026-2027',
  'Admission',
  '/documents/prospectus-2026.pdf',
  '4.5 MB',
  'PDF',
  true
),
(
  'HSC Board Syllabus & Marks Distribution (Science)',
  'Syllabus',
  '/documents/syllabus-science.pdf',
  '2.1 MB',
  'PDF',
  true
),
(
  'HSC Board Syllabus & Marks Distribution (Business Studies)',
  'Syllabus',
  '/documents/syllabus-business.pdf',
  '1.8 MB',
  'PDF',
  true
),
(
  'Student Leave Application Form',
  'General Forms',
  '/documents/leave-application.pdf',
  '350 KB',
  'PDF',
  true
),
(
  'Code of Conduct & Disciplinary Policy Handbook',
  'Policies',
  '/documents/conduct-handbook.pdf',
  '820 KB',
  'PDF',
  true
);

insert into holidays (title, start_date, end_date, total_days, type, description, year) values
('New Year Day', '2026-01-01', '2026-01-01', 1, 'National', 'First day of the Gregorian year', 2026),
('International Mother Language Day', '2026-02-21', '2026-02-21', 1, 'National', 'Martyrs Day and International Mother Language Day', 2026),
('Independence and National Day', '2026-03-26', '2026-03-26', 1, 'National', 'Commemoration of National Independence', 2026),
('Bengali New Year (Pohela Boishakh)', '2026-04-14', '2026-04-14', 1, 'Cultural', 'First day of Bengali calendar 1433', 2026),
('Eid-ul-Fitr Vacation', '2026-03-18', '2026-03-24', 7, 'Religious', 'Holy Eid-ul-Fitr festival and break', 2026),
('Summer Vacation', '2026-06-15', '2026-06-25', 11, 'Academic', 'Mid-year academic summer break', 2026),
('National Mourning Day', '2026-08-15', '2026-08-15', 1, 'National', 'National Mourning Day', 2026),
('Durga Puja', '2026-10-18', '2026-10-21', 4, 'Religious', 'Sharodiya Durga Puja festivities', 2026),
('Victory Day', '2026-12-16', '2026-12-16', 1, 'National', 'National Victory Day', 2026),
('Winter Vacation', '2026-12-24', '2026-12-31', 8, 'Academic', 'Annual winter vacation', 2026);

insert into career_circulars (title, post_name, vacancy, employment_type, deadline, circular_file_url, requirements, application_instructions, status) values
(
  'Recruitment of Lecturer in English',
  'Lecturer (English)',
  2,
  'Full-time',
  '2026-12-31',
  '/careers/lecturer-english.pdf',
  'Minimum Master''s degree in English with at least two 1st class/division (or CGPA 3.0+). Prior teaching experience at HSC level preferred.',
  'Send CV, attested copies of certificates, and 2 passport photos to hr@dhakamodelcollege.edu.bd or submit at principal''s office.',
  'published'
),
(
  'Recruitment of ICT Demonstrator / Lab Assistant',
  'ICT Demonstrator',
  1,
  'Full-time',
  '2026-12-25',
  '/careers/ict-demonstrator.pdf',
  'Diploma in Computer Technology or B.Sc in CSE. Strong hands-on knowledge in PC troubleshooting, networking, and Python/C programming.',
  'Apply through the online portal or submit sealed application addressed to the Principal by the deadline.',
  'published'
);
