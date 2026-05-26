-- site_content: 관리자가 편집 가능한 사이트 콘텐츠 (key-value JSONB)
create table if not exists public.site_content (
  key   text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.site_content enable row level security;

-- 공개 읽기 (프론트엔드에서 캐싱된 서버컴포넌트로 조회)
create policy "site_content_public_read"
  on public.site_content for select
  using (true);

-- service_role만 쓰기 (관리자 Server Action에서 admin client 사용)
-- RLS를 우회하는 service_role 키 사용으로 별도 INSERT/UPDATE 정책 불필요.

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger site_content_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();
