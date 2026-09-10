-- Reusable administrator-owned image library. Assets are intentionally separate
-- from post_images so one uploaded source can be selected for a draft without
-- requiring the administrator to browse their Mac folder for every new post.
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  file_name text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  source_sha256 text unique,
  source_relative_path text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Supports environments where the table was created before the sync metadata
-- fields were added to this migration.
alter table public.media_assets
  add column if not exists source_sha256 text,
  add column if not exists source_relative_path text;

create unique index if not exists media_assets_source_sha256_key
  on public.media_assets (source_sha256)
  where source_sha256 is not null;

create index if not exists media_assets_active_created_at_idx
  on public.media_assets (active, created_at desc);

alter table public.media_assets enable row level security;

comment on table public.media_assets is
  'Admin-only reusable source photo library. Videos are never added; posts copy a selected asset URL into post_images.';
