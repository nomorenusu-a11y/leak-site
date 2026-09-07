-- NOT an automatic migration. Apply only after reviewing docs/seo/ROLLOUT.md,
-- deploying the public view/readers, and checking existing grants and consumers.
-- No stored rows or uploads are changed or deleted.
begin;
revoke all on public.leak_requests from public, anon, authenticated;
drop policy if exists leak_requests_select_visible on public.leak_requests;
drop policy if exists leak_requests_insert_public on public.leak_requests;
-- All production submissions now use the validated server action + service_role.
-- The application no longer subscribes to this sensitive table's realtime stream.
do $$
begin
  if exists(select 1 from pg_publication_tables where pubname='supabase_realtime'
            and schemaname='public' and tablename='leak_requests') then
    alter publication supabase_realtime drop table public.leak_requests;
  end if;
end $$;
commit;
