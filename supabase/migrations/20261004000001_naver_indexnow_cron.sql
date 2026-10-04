-- Notify Naver shortly after scheduled posts become public. This runs inside
-- Supabase, so publication discovery does not depend on opening the admin UI.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_naver_indexnow_recent()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_id bigint;
  url_list jsonb;
begin
  select jsonb_agg(source.url order by source.url)
  into url_list
  from (
    select 'https://nomorenusu.com/'::text as url
    union
    select 'https://nomorenusu.com/posts'::text
    union
    select 'https://nomorenusu.com/posts/' || posts.slug
    from public.posts
    where posts.published = true
      and posts.published_at <= now()
      and posts.published_at >= now() - interval '4 hours'
  ) as source;

  select net.http_post(
    url := 'https://searchadvisor.naver.com/indexnow',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := jsonb_build_object(
      'host', 'nomorenusu.com',
      'key', '3c7a9a6877ce54921ba048ae7f5156b8890269597cfb609911671e25cda05e40',
      'keyLocation', 'https://nomorenusu.com/3c7a9a6877ce54921ba048ae7f5156b8890269597cfb609911671e25cda05e40.txt',
      'urlList', url_list
    ),
    timeout_milliseconds := 20000
  ) into request_id;

  return request_id;
end;
$$;

revoke all on function public.notify_naver_indexnow_recent() from public, anon, authenticated;

do $$
declare
  existing_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = 'notify-naver-indexnow-recent';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;
end;
$$;

select cron.schedule(
  'notify-naver-indexnow-recent',
  '17 */2 * * *',
  'select public.notify_naver_indexnow_recent();'
);

-- Queue one request immediately when the migration is applied.
select public.notify_naver_indexnow_recent();
