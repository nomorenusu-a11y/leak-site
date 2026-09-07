-- Additive schema only. No existing post, category, request or storage data is modified.
begin;
create table public.regions (
  id text primary key check (id ~ '^[0-9]{10}$'),
  parent_id text references public.regions(id),
  level text not null check (level in ('city','district','dong')),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  active boolean not null default true,
  source_url text not null,
  source_checked_on date not null,
  unique(parent_id, slug),
  check ((level = 'city') = (parent_id is null))
);
create unique index regions_city_slug on public.regions(slug) where parent_id is null;
create function public.validate_region_parent() returns trigger language plpgsql set search_path = '' as $$
declare parent_level text;
begin
  if new.parent_id is not null then
    select level into parent_level from public.regions where id = new.parent_id;
    if (new.level = 'district' and parent_level is distinct from 'city') or
       (new.level = 'dong' and parent_level is distinct from 'district') then
      raise exception 'Invalid region hierarchy';
    end if;
  end if;
  if TG_OP = 'UPDATE' and (new.level <> old.level or new.parent_id is distinct from old.parent_id) then
    raise exception 'Region hierarchy changes require a reviewed migration';
  end if;
  return new;
end $$;
create trigger regions_parent_check before insert or update on public.regions
  for each row execute function public.validate_region_parent();

create table public.region_pages (
  region_id text primary key references public.regions(id),
  title text not null,
  description text not null,
  intro text not null,
  faq jsonb not null default '[]'::jsonb check (jsonb_typeof(faq) = 'array'),
  published boolean not null default false,
  indexable boolean not null default false,
  updated_at timestamptz not null default now()
);
create trigger region_pages_updated before update on public.region_pages
  for each row execute function public.handle_updated_at();

-- One verified actual location per case. A district is allowed when dong is unknown.
create table public.post_locations (
  post_id uuid primary key references public.posts(id) on delete cascade,
  region_id text not null references public.regions(id),
  verified_at timestamptz not null default now()
);
create index post_locations_region_idx on public.post_locations(region_id, post_id);
create function public.validate_post_location() returns trigger language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from public.regions where id = new.region_id and active and level in ('district','dong')) then
    raise exception 'Case location must be an active district or legal dong';
  end if;
  return new;
end $$;
create trigger post_locations_check before insert or update on public.post_locations
  for each row execute function public.validate_post_location();

create table public.seo_terms (
  id text primary key,
  axis text not null check (axis in ('building_type','leak_type','symptom','detection_method','work_type')),
  slug text not null,
  label text not null,
  unique(axis, slug),
  unique(id, axis)
);
create table public.post_terms (
  post_id uuid not null references public.posts(id) on delete cascade,
  term_id text not null,
  axis text not null,
  primary key(post_id, term_id),
  foreign key(term_id, axis) references public.seo_terms(id, axis)
);
create index post_terms_term_idx on public.post_terms(term_id, post_id);

alter table public.regions enable row level security;
alter table public.region_pages enable row level security;
alter table public.post_locations enable row level security;
alter table public.seo_terms enable row level security;
alter table public.post_terms enable row level security;
create policy regions_read on public.regions for select to anon, authenticated using(active);
-- Read drafts only through service_role. Web routes also enforce the six-route allowlist.
create policy region_pages_read on public.region_pages for select to anon, authenticated using(published and exists(select 1 from public.regions r where r.id = region_id and r.active));
create policy seo_terms_read on public.seo_terms for select to anon, authenticated using(true);
create policy post_locations_read on public.post_locations for select to anon, authenticated
 using(exists(select 1 from public.posts p where p.id = post_id and p.published));
create policy post_terms_read on public.post_terms for select to anon, authenticated
 using(exists(select 1 from public.posts p where p.id = post_id and p.published));
revoke all on public.regions, public.region_pages, public.post_locations, public.seo_terms, public.post_terms from anon, authenticated;
grant select on public.regions, public.region_pages, public.post_locations, public.seo_terms, public.post_terms to anon, authenticated;
grant all on public.regions, public.region_pages, public.post_locations, public.seo_terms, public.post_terms to service_role;

-- Atomic case classification save. No inference or changes to posts.region_tags/category/content.
create function public.set_post_seo(p_post_id uuid, p_region_id text, p_term_ids text[])
returns void language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.posts where id = p_post_id for update;
  if not found then raise exception 'Post not found'; end if;
  if cardinality(p_term_ids) > 50 or exists (
    select 1 from unnest(p_term_ids) t where not exists(select 1 from public.seo_terms s where s.id = t)
  ) then raise exception 'Unknown classification'; end if;
  delete from public.post_locations where post_id = p_post_id;
  if p_region_id is not null then
    insert into public.post_locations(post_id,region_id) values(p_post_id,p_region_id);
  end if;
  delete from public.post_terms where post_id = p_post_id;
  insert into public.post_terms(post_id,term_id,axis)
    select p_post_id,id,axis from public.seo_terms where id = any(p_term_ids);
  -- Changes affect public case metadata and sitemap lastmod.
  update public.posts set updated_at = now() where id = p_post_id;
end $$;
revoke all on function public.set_post_seo(uuid,text,text[]) from public, anon, authenticated;
grant execute on function public.set_post_seo(uuid,text,text[]) to service_role;

-- Uses EXISTS instead of joins so a case appears once. RLS still applies.
create function public.get_region_posts(p_region_id text) returns setof public.posts
language sql stable security invoker set search_path = '' as $$
  with recursive descendants as (
    select id from public.regions where id = p_region_id and active
    union all
    select r.id from public.regions r join descendants d on r.parent_id = d.id where r.active
  )
  select p.* from public.posts p where p.published and (
    exists(select 1 from public.post_locations l join descendants d on d.id = l.region_id where l.post_id = p.id)
    or (p_region_id in ('1100000000','1132000000') and p.region_tags @> array['도봉구']::text[]
        and not exists(select 1 from public.post_locations l where l.post_id = p.id))
  );
$$;
revoke all on function public.get_region_posts(text) from public;
grant execute on function public.get_region_posts(text) to anon, authenticated, service_role;

-- Only the six approved pilot regions. Source metadata is retained.
insert into public.regions(id,parent_id,level,slug,name,source_url,source_checked_on) values('1100000000',null,'city','seoul','서울','https://sema.seoul.go.kr/semaaa/data/upload/attach/10000/17455/20210917105609506.pdf','2026-09-07');
insert into public.region_pages(region_id,title,description,intro,faq,published,indexable,updated_at) values('1100000000','서울 누수탐지 지역 안내','서울 누수 상담과 지역별 시공사례 안내. 도봉구와 창동·쌍문동·방학동·도봉동의 지역 안내를 확인하고, 공개된 실제 작업사례를 살펴보세요.','서울 지역 누수 상담을 준비할 때는 작업 주소와 물이 보이는 위치를 함께 확인해 주세요. 현재 상세 지역 안내는 도봉구부터 제공하고 있습니다.','[{"question": "지역 안내에서 무엇을 확인할 수 있나요?", "answer": "구와 법정동별 안내에서 상담 준비사항과 해당 지역으로 확인된 공개 시공사례를 볼 수 있습니다. 다른 지역의 사례는 전체 시공사례에서 확인할 수 있습니다."}, {"question": "상담 전에 무엇을 준비하면 좋을까요?", "answer": "작업 주소, 건물 유형, 물이 보이는 위치, 처음 발견한 시점과 사진을 준비해 주세요. 확인되지 않은 누수 원인이나 탐지방법은 기재하지 않아도 됩니다."}, {"question": "상담만으로 작업 범위와 비용이 확정되나요?", "answer": "사진과 증상은 상담을 위한 참고 정보입니다. 실제 원인과 작업 범위는 현장 확인이 필요하며, 비용과 방문 일정은 상담 시 확인해 주세요."}]'::jsonb,true,true,'2026-09-07T00:00:00Z');
insert into public.regions(id,parent_id,level,slug,name,source_url,source_checked_on) values('1132000000','1100000000','district','dobong-gu','도봉구','https://sema.seoul.go.kr/semaaa/data/upload/attach/10000/17455/20210917105609506.pdf','2026-09-07');
insert into public.region_pages(region_id,title,description,intro,faq,published,indexable,updated_at) values('1132000000','도봉구 누수탐지 · 법정동별 안내','도봉구 누수탐지 상담 안내. 창동·쌍문동·방학동·도봉동의 법정동별 안내, 공개 시공사례와 상담 전 준비사항을 확인하세요.','도봉구의 창동·쌍문동·방학동·도봉동을 기준으로 작업 지역을 찾아보세요. 행정동 번호 대신 주소에 기재된 법정동을 사용하며, 시공사례의 원문과 사진은 기존 작업사례에서 확인할 수 있습니다.','[{"question": "창1동과 창동은 같은 분류인가요?", "answer": "이 안내는 법정동인 창동을 기준으로 합니다. 창1동처럼 번호가 있는 행정동별 페이지는 나누지 않습니다. 주소에 적힌 법정동을 확인해 주세요."}, {"question": "상담 전에 무엇을 준비하면 좋을까요?", "answer": "작업 주소, 건물 유형, 물이 보이는 위치, 처음 발견한 시점과 사진을 준비해 주세요. 확인되지 않은 누수 원인이나 탐지방법은 기재하지 않아도 됩니다."}, {"question": "상담만으로 작업 범위와 비용이 확정되나요?", "answer": "사진과 증상은 상담을 위한 참고 정보입니다. 실제 원인과 작업 범위는 현장 확인이 필요하며, 비용과 방문 일정은 상담 시 확인해 주세요."}]'::jsonb,true,true,'2026-09-07T00:00:00Z');
insert into public.regions(id,parent_id,level,slug,name,source_url,source_checked_on) values('1132010700','1132000000','dong','chang-dong','창동','https://sema.seoul.go.kr/semaaa/data/upload/attach/10000/17455/20210917105609506.pdf','2026-09-07');
insert into public.region_pages(region_id,title,description,intro,faq,published,indexable,updated_at) values('1132010700','창동 누수탐지 상담 · 시공사례 안내','도봉구 창동 누수 상담 안내. 물이 보이는 위치와 발생 시점 등 상담 준비사항을 확인하고, 창동으로 확인된 실제 시공사례를 살펴보세요.','창동에서 누수 상담을 요청하실 때는 공동주택명이나 도로명주소와 함께 물이 보이는 층·공간을 알려 주세요. 건물명만으로 현장을 단정하지 않고, 확인된 주소를 바탕으로 작업 지역을 연결합니다.','[{"question": "창동 사례는 어떻게 구분하나요?", "answer": "실제 작업 주소가 법정동 창동으로 확인된 공개 게시글만 이 페이지에 연결합니다. 도봉구 태그만 있는 글은 창동 사례로 간주하지 않습니다."}, {"question": "상담 전에 무엇을 준비하면 좋을까요?", "answer": "작업 주소, 건물 유형, 물이 보이는 위치, 처음 발견한 시점과 사진을 준비해 주세요. 확인되지 않은 누수 원인이나 탐지방법은 기재하지 않아도 됩니다."}, {"question": "상담만으로 작업 범위와 비용이 확정되나요?", "answer": "사진과 증상은 상담을 위한 참고 정보입니다. 실제 원인과 작업 범위는 현장 확인이 필요하며, 비용과 방문 일정은 상담 시 확인해 주세요."}]'::jsonb,true,true,'2026-09-07T00:00:00Z');
insert into public.regions(id,parent_id,level,slug,name,source_url,source_checked_on) values('1132010500','1132000000','dong','ssangmun-dong','쌍문동','https://sema.seoul.go.kr/semaaa/data/upload/attach/10000/17455/20210917105609506.pdf','2026-09-07');
insert into public.region_pages(region_id,title,description,intro,faq,published,indexable,updated_at) values('1132010500','쌍문동 누수탐지 상담 · 시공사례 안내','도봉구 쌍문동 누수 상담 안내. 젖은 벽지·천장 물자국 등 관찰한 증상과 주소를 준비하고, 확인된 쌍문동 시공사례를 확인하세요.','쌍문동 현장 상담에는 젖은 벽지나 천장 물자국처럼 눈에 보이는 변화와 발견 시점을 알려 주세요. 증상만으로 배관 종류나 원인을 확정하지 않으며, 이 페이지의 사례는 실제 작업 지역을 확인한 글에 한해 연결합니다.','[{"question": "쌍문동의 특정 누수 유형만 상담할 수 있나요?", "answer": "관찰한 증상을 먼저 알려 주시면 됩니다. 보일러나 수도배관 등 원인이 확인되지 않은 상태에서 특정 유형으로 단정할 필요는 없습니다."}, {"question": "상담 전에 무엇을 준비하면 좋을까요?", "answer": "작업 주소, 건물 유형, 물이 보이는 위치, 처음 발견한 시점과 사진을 준비해 주세요. 확인되지 않은 누수 원인이나 탐지방법은 기재하지 않아도 됩니다."}, {"question": "상담만으로 작업 범위와 비용이 확정되나요?", "answer": "사진과 증상은 상담을 위한 참고 정보입니다. 실제 원인과 작업 범위는 현장 확인이 필요하며, 비용과 방문 일정은 상담 시 확인해 주세요."}]'::jsonb,true,true,'2026-09-07T00:00:00Z');
insert into public.regions(id,parent_id,level,slug,name,source_url,source_checked_on) values('1132010600','1132000000','dong','banghak-dong','방학동','https://sema.seoul.go.kr/semaaa/data/upload/attach/10000/17455/20210917105609506.pdf','2026-09-07');
insert into public.region_pages(region_id,title,description,intro,faq,published,indexable,updated_at) values('1132010600','방학동 누수탐지 상담 · 시공사례 안내','도봉구 방학동 누수 상담 안내. 증상이 시작된 시점과 사용 상황을 정리하고, 작업 주소가 확인된 방학동 시공사례를 살펴보세요.','방학동에서 물이 새거나 습기가 생겼다면 증상이 언제 시작됐는지, 물을 사용할 때나 비가 올 때 달라지는지를 상담 시 알려 주세요. 확인되지 않은 원인이나 장비 사용 내역을 사례 정보에 추가하지 않습니다.','[{"question": "비가 올 때만 나타나는 증상도 알려야 하나요?", "answer": "네. 비가 오는 날과 맑은 날의 차이, 물을 사용한 시간 등 관찰한 상황을 함께 전달해 주세요. 원인은 현장 확인 전까지 확정하지 않습니다."}, {"question": "상담 전에 무엇을 준비하면 좋을까요?", "answer": "작업 주소, 건물 유형, 물이 보이는 위치, 처음 발견한 시점과 사진을 준비해 주세요. 확인되지 않은 누수 원인이나 탐지방법은 기재하지 않아도 됩니다."}, {"question": "상담만으로 작업 범위와 비용이 확정되나요?", "answer": "사진과 증상은 상담을 위한 참고 정보입니다. 실제 원인과 작업 범위는 현장 확인이 필요하며, 비용과 방문 일정은 상담 시 확인해 주세요."}]'::jsonb,true,true,'2026-09-07T00:00:00Z');
insert into public.regions(id,parent_id,level,slug,name,source_url,source_checked_on) values('1132010800','1132000000','dong','dobong-dong','도봉동','https://sema.seoul.go.kr/semaaa/data/upload/attach/10000/17455/20210917105609506.pdf','2026-09-07');
insert into public.region_pages(region_id,title,description,intro,faq,published,indexable,updated_at) values('1132010800','도봉동 누수탐지 상담 · 시공사례 안내','도봉구 도봉동 누수 상담 안내. 도봉구와 법정동 도봉동을 구분해 작업 위치를 확인하고, 공개된 도봉동 시공사례와 상담 안내를 보세요.','도봉동은 도봉구에 속한 법정동입니다. 구 이름만으로 도봉동 현장이라고 판단하지 않으며, 주소가 도봉동으로 확인된 작업만 이곳에 연결합니다. 상담 시에는 건물 주소와 물이 보이는 위치를 함께 준비해 주세요.','[{"question": "도봉구 사례가 모두 도봉동 사례인가요?", "answer": "아닙니다. 도봉구에는 창동·쌍문동·방학동·도봉동이 있습니다. 도봉구 태그만으로 도봉동에 연결하지 않고 실제 작업 위치를 확인합니다."}, {"question": "상담 전에 무엇을 준비하면 좋을까요?", "answer": "작업 주소, 건물 유형, 물이 보이는 위치, 처음 발견한 시점과 사진을 준비해 주세요. 확인되지 않은 누수 원인이나 탐지방법은 기재하지 않아도 됩니다."}, {"question": "상담만으로 작업 범위와 비용이 확정되나요?", "answer": "사진과 증상은 상담을 위한 참고 정보입니다. 실제 원인과 작업 범위는 현장 확인이 필요하며, 비용과 방문 일정은 상담 시 확인해 주세요."}]'::jsonb,true,true,'2026-09-07T00:00:00Z');
insert into public.seo_terms(id,axis,slug,label) values('building_type:apartment','building_type','apartment','아파트');
insert into public.seo_terms(id,axis,slug,label) values('building_type:multi-family','building_type','multi-family','연립·다세대');
insert into public.seo_terms(id,axis,slug,label) values('building_type:detached-house','building_type','detached-house','단독주택');
insert into public.seo_terms(id,axis,slug,label) values('building_type:officetel','building_type','officetel','오피스텔');
insert into public.seo_terms(id,axis,slug,label) values('building_type:commercial','building_type','commercial','상가·업무시설');
insert into public.seo_terms(id,axis,slug,label) values('leak_type:water-supply-pipe','leak_type','water-supply-pipe','수도배관 누수');
insert into public.seo_terms(id,axis,slug,label) values('leak_type:hot-water-pipe','leak_type','hot-water-pipe','온수배관 누수');
insert into public.seo_terms(id,axis,slug,label) values('leak_type:heating-pipe','leak_type','heating-pipe','난방배관 누수');
insert into public.seo_terms(id,axis,slug,label) values('leak_type:boiler','leak_type','boiler','보일러 누수');
insert into public.seo_terms(id,axis,slug,label) values('leak_type:concealed-pipe','leak_type','concealed-pipe','매립배관 누수');
insert into public.seo_terms(id,axis,slug,label) values('leak_type:bathroom','leak_type','bathroom','화장실/욕실 누수');
insert into public.seo_terms(id,axis,slug,label) values('leak_type:kitchen','leak_type','kitchen','싱크대/주방 누수');
insert into public.seo_terms(id,axis,slug,label) values('leak_type:ceiling','leak_type','ceiling','천장 누수');
insert into public.seo_terms(id,axis,slug,label) values('leak_type:balcony','leak_type','balcony','베란다 누수');
insert into public.seo_terms(id,axis,slug,label) values('leak_type:exterior-rain','leak_type','exterior-rain','외벽/빗물 누수');
insert into public.seo_terms(id,axis,slug,label) values('symptom:meter-running','symptom','meter-running','계량기가 계속 돌아감');
insert into public.seo_terms(id,axis,slug,label) values('symptom:water-bill-rise','symptom','water-bill-rise','수도요금 급증');
insert into public.seo_terms(id,axis,slug,label) values('symptom:ceiling-stain','symptom','ceiling-stain','천장 물자국');
insert into public.seo_terms(id,axis,slug,label) values('symptom:wet-wallpaper','symptom','wet-wallpaper','벽지 젖음');
insert into public.seo_terms(id,axis,slug,label) values('symptom:damp-floor','symptom','damp-floor','바닥 습기');
insert into public.seo_terms(id,axis,slug,label) values('symptom:boiler-pressure-drop','symptom','boiler-pressure-drop','보일러 압력 저하');
insert into public.seo_terms(id,axis,slug,label) values('symptom:downstairs-leak','symptom','downstairs-leak','아랫집 누수');
insert into public.seo_terms(id,axis,slug,label) values('symptom:mold-moisture','symptom','mold-moisture','곰팡이/습기');
insert into public.seo_terms(id,axis,slug,label) values('detection_method:air-pressure-test','detection_method','air-pressure-test','공압검사');
insert into public.seo_terms(id,axis,slug,label) values('detection_method:tracer-gas','detection_method','tracer-gas','가스탐지');
insert into public.seo_terms(id,axis,slug,label) values('detection_method:acoustic','detection_method','acoustic','청음탐지');
insert into public.seo_terms(id,axis,slug,label) values('detection_method:thermal-imaging','detection_method','thermal-imaging','열화상');
insert into public.seo_terms(id,axis,slug,label) values('work_type:pipe-repair','work_type','pipe-repair','배관 보수');
insert into public.seo_terms(id,axis,slug,label) values('work_type:partial-excavation','work_type','partial-excavation','부분 굴착');
insert into public.seo_terms(id,axis,slug,label) values('work_type:pipe-replacement','work_type','pipe-replacement','배관 교체');
insert into public.seo_terms(id,axis,slug,label) values('work_type:restoration','work_type','restoration','복구');
commit;
