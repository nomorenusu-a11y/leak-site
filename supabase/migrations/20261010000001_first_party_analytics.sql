create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  event_name text not null check (event_name in ('page_view','view_post','click_call','click_kakao','cta_click','submit_quote','filter_region','scroll_50','scroll_90','outbound_click','click_post_cta')),
  path text not null check (length(path) between 1 and 500),
  source text not null default 'direct' check (length(source) between 1 and 120),
  referrer_host text check (referrer_host is null or length(referrer_host) <= 255),
  search_query text check (search_query is null or length(search_query) <= 200),
  utm_source text check (utm_source is null or length(utm_source) <= 100),
  utm_campaign text check (utm_campaign is null or length(utm_campaign) <= 100),
  is_search boolean not null default false,
  device_category text not null default 'desktop' check (device_category in ('mobile','tablet','desktop')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and pg_column_size(metadata) <= 4096)
);

create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_session_created_idx on public.analytics_events (session_id, created_at desc);
create index if not exists analytics_events_source_created_idx on public.analytics_events (source, created_at desc);
create index if not exists analytics_events_event_created_idx on public.analytics_events (event_name, created_at desc);
create index if not exists analytics_events_path_created_idx on public.analytics_events (path, created_at desc);

alter table public.analytics_events enable row level security;
revoke all on table public.analytics_events from anon, authenticated;
grant all on table public.analytics_events to service_role;
