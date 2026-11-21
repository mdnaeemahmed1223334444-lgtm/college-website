-- MAIN DATABASE (Supabase 1) : public website content
-- Run in the Supabase SQL editor of the MAIN project.

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create type content_status as enum ('draft', 'published', 'scheduled', 'archived');

-- Key/value website settings (college name, logo path, contact info, feature flags...)
create table site_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
create trigger trg_site_settings_updated before update on site_settings
  for each row execute function set_updated_at();

-- Navigation menu (supports nested items via parent_id)
create table navigation_items (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references navigation_items(id) on delete cascade,
  location    text not null default 'header',   -- 'header' | 'footer'
  label       text not null,
  href        text not null,
  position    int  not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_nav_parent on navigation_items(parent_id);
create trigger trg_nav_updated before update on navigation_items
  for each row execute function set_updated_at();

-- Generic editable pages (About, Mission & Vision, History, Guidelines, ...)
create table pages (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,          -- e.g. 'about/mission-vision'
  title            text not null,
  content          text not null default '',      -- HTML or Markdown (decided in Part 3)
  status           content_status not null default 'draft',
  publish_at       timestamptz,
  seo_title        text,
  seo_description  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger trg_pages_updated before update on pages
  for each row execute function set_updated_at();

-- ---------- Row Level Security ----------
-- Public (anon) can only READ published/visible content. All writes go through the
-- server using the service-role key after an admin check.
alter table site_settings    enable row level security;
alter table navigation_items enable row level security;
alter table pages            enable row level security;

drop policy if exists "public read settings" on site_settings;
create policy "public read settings" on site_settings for select using (true);

drop policy if exists "public read visible nav" on navigation_items;
create policy "public read visible nav" on navigation_items for select using (is_visible);

drop policy if exists "public read published pages" on pages;
create policy "public read published pages" on pages for select
  using (status = 'published' or (status = 'scheduled' and publish_at <= now()));

drop policy if exists "service_role full access on site_settings" on site_settings;
create policy "service_role full access on site_settings" on site_settings for all to service_role using (true) with check (true);

drop policy if exists "service_role full access on navigation_items" on navigation_items;
create policy "service_role full access on navigation_items" on navigation_items for all to service_role using (true) with check (true);

drop policy if exists "service_role full access on pages" on pages;
create policy "service_role full access on pages" on pages for all to service_role using (true) with check (true);

-- ---------- Permissions & Grants ----------
grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to service_role, postgres;
grant all on all sequences in schema public to service_role, postgres;
grant all on all routines in schema public to service_role, postgres;

grant select on table public.site_settings to anon, authenticated;
grant select on table public.navigation_items to anon, authenticated;
grant select on table public.pages to anon, authenticated;

alter default privileges in schema public grant all on tables to service_role, postgres;
alter default privileges in schema public grant all on sequences to service_role, postgres;
alter default privileges in schema public grant all on routines to service_role, postgres;
