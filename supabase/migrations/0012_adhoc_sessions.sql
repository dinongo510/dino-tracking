-- =====================================================================
-- DINO COACH — 0012: Buổi tập ngoài lịch (DINO-017)
-- Chạy SAU 0011. Status: PROPOSED (KHÔNG CHẠY TRỰC TIẾP — chờ Claude duyệt)
-- - sessions.adhoc: boolean not null default false (buổi ngoài lịch)
-- - sessions.created_by: uuid default auth.uid()
-- - sessions.phase_id: drop not null, ràng buộc: adhoc or phase_id is not null
-- - RLS thêm:
--   * Khách tự thêm/sửa/xóa session adhoc = true, mode = 'self' của chính mình.
--   * Khách tự thêm/sửa/xóa session_blocks và block_items thuộc session adhoc của chính mình.
--   * Khách KHÔNG sửa được buổi trong giáo án, KHÔNG tạo được buổi PT, KHÔNG tạo được buổi cho khách khác.
--   * Coach giữ nguyên toàn quyền như cũ.
-- =====================================================================

alter table public.sessions add column if not exists adhoc boolean not null default false;
alter table public.sessions add column if not exists created_by uuid default auth.uid();
alter table public.sessions alter column phase_id drop not null;

do $$ begin
  alter table public.sessions add constraint sessions_adhoc_phase_chk
    check (adhoc = true or phase_id is not null);
exception when duplicate_object then null; end $$;

create index if not exists sessions_adhoc on public.sessions (client_id, adhoc);

-- ---------- RLS BỔ SUNG CHO KHÁCH TỰ TẬP NGOÀI LỊCH ----------

-- 1. sessions
drop policy if exists sessions_client_adhoc_write on public.sessions;
create policy sessions_client_adhoc_write on public.sessions
  for all to authenticated
  using (
    not private.is_coach()
    and client_id = auth.uid()
    and adhoc = true
    and mode = 'self'
  )
  with check (
    not private.is_coach()
    and client_id = auth.uid()
    and adhoc = true
    and mode = 'self'
  );

-- 2. session_blocks
drop policy if exists session_blocks_client_adhoc_write on public.session_blocks;
create policy session_blocks_client_adhoc_write on public.session_blocks
  for all to authenticated
  using (
    not private.is_coach()
    and client_id = auth.uid()
    and exists (
      select 1 from public.sessions s
      where s.id = session_id
        and s.client_id = auth.uid()
        and s.adhoc = true
        and s.mode = 'self'
    )
  )
  with check (
    not private.is_coach()
    and client_id = auth.uid()
    and exists (
      select 1 from public.sessions s
      where s.id = session_id
        and s.client_id = auth.uid()
        and s.adhoc = true
        and s.mode = 'self'
    )
  );

-- 3. block_items
drop policy if exists block_items_client_adhoc_write on public.block_items;
create policy block_items_client_adhoc_write on public.block_items
  for all to authenticated
  using (
    not private.is_coach()
    and client_id = auth.uid()
    and exists (
      select 1 from public.session_blocks b
      join public.sessions s on s.id = b.session_id
      where b.id = block_id
        and s.client_id = auth.uid()
        and s.adhoc = true
        and s.mode = 'self'
    )
  )
  with check (
    not private.is_coach()
    and client_id = auth.uid()
    and exists (
      select 1 from public.session_blocks b
      join public.sessions s on s.id = b.session_id
      where b.id = block_id
        and s.client_id = auth.uid()
        and s.adhoc = true
        and s.mode = 'self'
    )
  );

/*
-- =====================================================================
-- KHỐI TEST SQL CHO CLAUDE AUDITOR (Kiểm thử Postgres 16 / SQL Editor)
-- =====================================================================
-- Giả định đã có user Khách A (uuid_a), Khách B (uuid_b), Coach C (uuid_c)

-- 1. Khách A tạo buổi ngoài lịch mode 'self' của chính mình -> PHẢI THÀNH CÔNG
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"<UUID_A>","role":"authenticated"}';
insert into public.sessions (id, client_id, adhoc, mode, week_no, day_no, scheduled_on, title, session_type)
values ('11111111-1111-1111-1111-111111111111', '<UUID_A>', true, 'self', 0, 1, current_date, 'Buổi tự do A', 'strength');

-- 2. Khách A tạo khối và bài tập cho buổi ngoài lịch vừa tạo -> PHẢI THÀNH CÔNG
insert into public.session_blocks (id, client_id, session_id, order_no, block_type)
values ('22222222-2222-2222-2222-222222222222', '<UUID_A>', '11111111-1111-1111-1111-111111111111', 1, 'straight');

insert into public.block_items (id, client_id, block_id, exercise_id, order_no, sets)
values ('33333333-3333-3333-3333-333333333333', '<UUID_A>', '22222222-2222-2222-2222-222222222222', '<EXERCISE_ID>', 1, 3);

-- 3. Khách A sửa tên buổi ngoài lịch của mình -> PHẢI THÀNH CÔNG
update public.sessions set title = 'Buổi tự do đã sửa' where id = '11111111-1111-1111-1111-111111111111';

-- 4. Khách A xóa buổi ngoài lịch của mình -> PHẢI THÀNH CÔNG
delete from public.sessions where id = '11111111-1111-1111-1111-111111111111';

-- 5. BẢO MẬT: Khách A cố sửa buổi tập trong giáo án (adhoc = false) -> PHẢI THẤT BẠI (0 rows updated)
update public.sessions set title = 'Hack giáo án' where id = '<SESSION_IN_PHASE_ID>';

-- 6. BẢO MẬT: Khách A cố tạo buổi ngoài lịch cho Khách B -> PHẢI BỊ CHẶN (policy check violation)
insert into public.sessions (client_id, adhoc, mode, week_no, day_no, scheduled_on, title)
values ('<UUID_B>', true, 'self', 0, 1, current_date, 'Tạo trộm');

-- 7. BẢO MẬT: Khách A cố tạo buổi ngoài lịch với mode = 'pt' (để gian lận PT) -> PHẢI BỊ CHẶN
insert into public.sessions (client_id, adhoc, mode, week_no, day_no, scheduled_on, title)
values ('<UUID_A>', true, 'pt', 0, 1, current_date, 'PT tự xưng');

-- 8. Coach tạo buổi ngoài lịch mode 'pt' cho khách -> PHẢI THÀNH CÔNG
set local "request.jwt.claims" = '{"sub":"<UUID_C>","role":"authenticated"}';
insert into public.sessions (id, client_id, adhoc, mode, week_no, day_no, scheduled_on, title, session_type)
values ('44444444-4444-4444-4444-444444444444', '<UUID_A>', true, 'pt', 0, 1, current_date, 'PT ngoài lịch của Coach', 'strength');
*/
