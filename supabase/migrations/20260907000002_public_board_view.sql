-- Additive bridge. Deploy before application readers switch to this view.
-- This intentionally uses the owner to project ONLY public columns; security_invoker
-- would require callers to retain SELECT on the sensitive base table.
begin;
create view public.leak_request_board with (security_barrier = true) as
select id, masked_name, region, status, created_at, updated_at
from public.leak_requests where visible_on_board = true;
revoke all on public.leak_request_board from public, anon, authenticated;
grant select on public.leak_request_board to anon, authenticated, service_role;
commit;
