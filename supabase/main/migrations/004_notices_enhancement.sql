-- MAIN DATABASE (Supabase 1) : Notices Enhancement
-- Adds deadline expiration support (expires_at) and attachment_type (pdf, image, word, none)

alter table if exists notices add column if not exists expires_at timestamptz;
alter table if exists notices add column if not exists attachment_type text default 'none';
create index if not exists idx_notices_expires_at on notices(expires_at);
