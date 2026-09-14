-- Future-dated published posts are scheduled content. Keep them private until due.
drop policy if exists posts_select_published on public.posts;
create policy posts_select_published
  on public.posts
  for select
  to anon, authenticated
  using (published = true and published_at <= now());

drop policy if exists post_images_select_published on public.post_images;
create policy post_images_select_published
  on public.post_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_images.post_id
        and p.published = true
        and p.published_at <= now()
    )
  );

create or replace function public.get_region_posts(p_region_id text) returns setof public.posts
language sql stable security invoker set search_path = '' as $$
  with recursive descendants as (
    select id from public.regions where id = p_region_id and active
    union all
    select r.id from public.regions r join descendants d on r.parent_id = d.id where r.active
  )
  select p.* from public.posts p where p.published and p.published_at <= now() and (
    exists(select 1 from public.post_locations l join descendants d on d.id = l.region_id where l.post_id = p.id)
    or (p_region_id in ('1100000000','1132000000') and p.region_tags @> array['도봉구']::text[]
        and not exists(select 1 from public.post_locations l where l.post_id = p.id))
  );
$$;
