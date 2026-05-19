-- =============================================================================
-- leak-site initial migration
-- 실행 위치:
--   1) Supabase Dashboard > SQL Editor (전체 복붙 후 Run)
--   2) 또는 CLI: `supabase db push` (link 이후)
-- 모든 statement는 idempotent. 다시 실행해도 에러 없음.
-- =============================================================================

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ============================================================
-- updated_at 자동 갱신 트리거 함수
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Tables: leak_requests (견적 신청)
-- ============================================================
create table if not exists public.leak_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  customer_name   text not null,
  phone           text not null,
  region          text,
  apartment       text,
  symptom         text not null,

  utm_source      text,
  utm_campaign    text,
  city_code       text,

  status          text not null default 'pending'
                    check (status in ('pending','quote','active','done')),
  admin_memo      text,
  visible_on_board boolean not null default true,

  -- 보드 노출용 마스킹: 1자=그대로, 2자=홍o, 3자+=홍o동
  -- length/substring/||는 모두 IMMUTABLE이라 STORED 허용.
  masked_name text generated always as (
    case
      when length(customer_name) <= 1 then customer_name
      when length(customer_name) = 2 then substring(customer_name from 1 for 1) || 'o'
      else substring(customer_name from 1 for 1)
           || 'o'
           || substring(customer_name from length(customer_name) for 1)
    end
  ) stored
);

create index if not exists leak_requests_created_at_desc_idx
  on public.leak_requests (created_at desc);
create index if not exists leak_requests_status_idx
  on public.leak_requests (status);
create index if not exists leak_requests_board_visible_idx
  on public.leak_requests (visible_on_board, created_at desc);

drop trigger if exists leak_requests_set_updated_at on public.leak_requests;
create trigger leak_requests_set_updated_at
  before update on public.leak_requests
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Tables: posts (시공 사례 게시판)
-- ============================================================
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  title           text not null,
  slug            text not null unique,
  content         text not null,
  excerpt         text,
  cover_image_url text,
  region_tags     text[] not null default '{}',
  category        text,
  view_count      integer not null default 0,
  published       boolean not null default true,
  published_at    timestamptz not null default now()
);

create index if not exists posts_published_published_at_idx
  on public.posts (published, published_at desc);
create index if not exists posts_slug_idx
  on public.posts (slug);
create index if not exists posts_region_tags_gin_idx
  on public.posts using gin (region_tags);

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Tables: post_images (게시글 첨부 이미지)
-- ============================================================
create table if not exists public.post_images (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  url         text not null,
  alt_text    text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists post_images_post_id_sort_idx
  on public.post_images (post_id, sort_order);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.leak_requests enable row level security;
alter table public.posts         enable row level security;
alter table public.post_images   enable row level security;

-- leak_requests: 누구나 INSERT (폼 제출), 보드 노출 행만 SELECT
drop policy if exists leak_requests_insert_public on public.leak_requests;
create policy leak_requests_insert_public
  on public.leak_requests
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists leak_requests_select_visible on public.leak_requests;
create policy leak_requests_select_visible
  on public.leak_requests
  for select
  to anon, authenticated
  using (visible_on_board = true);

-- posts: 공개된 글만 SELECT
drop policy if exists posts_select_published on public.posts;
create policy posts_select_published
  on public.posts
  for select
  to anon, authenticated
  using (published = true);

-- post_images: 속한 post가 공개된 경우만 SELECT
drop policy if exists post_images_select_published on public.post_images;
create policy post_images_select_published
  on public.post_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_images.post_id and p.published = true
    )
  );

-- 관리자 작업(INSERT/UPDATE/DELETE)은 service_role이 RLS 우회하므로 별도 정책 불필요.

-- ============================================================
-- Realtime: leak_requests 변경을 공개 보드에 푸시
-- ALTER PUBLICATION은 IF NOT EXISTS가 없어 DO 블록으로 idempotent 처리.
-- ============================================================
do $$
begin
  alter publication supabase_realtime add table public.leak_requests;
exception
  when duplicate_object then null;
  when undefined_object then
    -- supabase_realtime 퍼블리케이션이 없으면 (로컬 dev 등) 무시
    null;
end $$;

-- ============================================================
-- Storage buckets
-- ============================================================
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('request-images', 'request-images', true)
on conflict (id) do nothing;

-- ============================================================
-- Storage policies on storage.objects
-- ============================================================
-- post-images: public read only. 업로드는 service_role(관리자) 전용 → 정책 없음.
drop policy if exists post_images_public_read on storage.objects;
create policy post_images_public_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'post-images');

-- request-images: public read + anon insert (서버 admin 클라이언트 외에 향후 직접 업로드도 허용)
drop policy if exists request_images_public_read on storage.objects;
create policy request_images_public_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'request-images');

drop policy if exists request_images_public_insert on storage.objects;
create policy request_images_public_insert
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'request-images');
