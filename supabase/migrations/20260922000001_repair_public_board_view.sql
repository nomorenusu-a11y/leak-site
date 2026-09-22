-- Restore the public, masked live-board projection when migration history and schema drift apart.
begin;
create or replace view public.leak_request_board with (security_barrier = true) as
select id, masked_name, region, status, created_at, updated_at
from public.leak_requests
where visible_on_board = true;
revoke all on public.leak_request_board from public, anon, authenticated;
grant select on public.leak_request_board to anon, authenticated, service_role;
notify pgrst, 'reload schema';
commit;
