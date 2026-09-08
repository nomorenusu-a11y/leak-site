-- One analysis row per reusable source image. AI output and human correction stay
-- separate so automated selection can be improved without changing original files.
create table if not exists public.media_asset_analysis (
  asset_id uuid primary key references public.media_assets(id) on delete cascade,
  analysis_status text not null default 'pending'
    check (analysis_status in ('pending', 'analyzing', 'tagged', 'needs_review', 'failed')),
  analysis_version text,
  scene_summary text,
  work_stage text
    check (work_stage is null or work_stage in ('damage', 'inspection', 'detection', 'repair', 'completion', 'unknown')),
  visible_subject_tags text[] not null default '{}',
  leak_type_tags text[] not null default '{}',
  symptom_tags text[] not null default '{}',
  confidence smallint check (confidence is null or confidence between 0 and 100),
  ai_result jsonb not null default '{}'::jsonb,
  human_tags jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz,
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_asset_analysis_selection_idx
  on public.media_asset_analysis (analysis_status, work_stage, confidence desc);

create index if not exists media_asset_analysis_subject_tags_idx
  on public.media_asset_analysis using gin (visible_subject_tags);

create index if not exists media_asset_analysis_leak_type_tags_idx
  on public.media_asset_analysis using gin (leak_type_tags);

alter table public.media_asset_analysis enable row level security;

comment on table public.media_asset_analysis is
  'AI-assisted and human-reviewed visual tags for reusable admin media assets. No inferred location or unverified job outcome is stored as fact.';
