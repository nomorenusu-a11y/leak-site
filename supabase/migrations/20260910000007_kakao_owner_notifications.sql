-- One encrypted OAuth token set for the owner-facing Kakao "send to me" notification.
-- Tokens are encrypted by the application before being stored.
create table if not exists public.admin_integrations (
  provider text primary key,
  access_token_encrypted text not null,
  refresh_token_encrypted text not null,
  expires_at timestamptz not null,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_integrations_provider_check
    check (provider in ('kakao_owner_notify'))
);

alter table public.admin_integrations enable row level security;
revoke all on public.admin_integrations from public, anon, authenticated;

drop trigger if exists admin_integrations_set_updated_at on public.admin_integrations;
create trigger admin_integrations_set_updated_at
before update on public.admin_integrations
for each row execute function public.set_updated_at();
