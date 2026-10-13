-- Warm newly-public pages before notifying Naver. A cold post render reads several
-- Supabase relations; warming the Cloudflare ISR entry first prevents crawlers from
-- being the first request after a scheduled post becomes public.
create or replace function public.warm_recent_public_pages()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  queued bigint;
begin
  with requests as (
    select net.http_get(
      url := 'https://nomorenusu.com/posts/' || posts.slug,
      headers := '{"Accept":"text/html","User-Agent":"Nomorenusu-Cache-Warmer/1.0"}'::jsonb,
      timeout_milliseconds := 20000
    )
    from public.posts
    where posts.published = true
      and posts.published_at <= now()
      and posts.published_at >= now() - interval '4 hours'
  )
  select count(*)::bigint into queued from requests;

  return queued;
end;
$$;

revoke all on function public.warm_recent_public_pages() from public, anon, authenticated;

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id from cron.job where jobname = 'warm-recent-public-pages';
  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  select jobid into existing_job_id from cron.job where jobname = 'notify-naver-indexnow-recent';
  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;
end;
$$;

select cron.schedule(
  'warm-recent-public-pages',
  '*/10 * * * *',
  'select public.warm_recent_public_pages();'
);

-- Run after the :20 cache-warming pass. The existing function sends only URLs
-- already public at execution time, so future scheduled URLs remain private.
select cron.schedule(
  'notify-naver-indexnow-recent',
  '25 */2 * * *',
  'select public.notify_naver_indexnow_recent();'
);

select public.warm_recent_public_pages();
