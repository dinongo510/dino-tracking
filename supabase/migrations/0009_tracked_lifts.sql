-- =====================================================================
-- DINO COACH — 0009: bài "theo dõi" trên dashboard sức mạnh (DINO-013)
-- Chạy SAU 0008. Status: PROPOSED
-- - Coach chọn 3–5 bài chính cho mỗi khách; khách chỉ đọc.
-- - Dashboard tính phía máy từ các bảng có sẵn (RLS áp dụng bình thường) → KHÔNG cần view.
-- =====================================================================
create table if not exists public.tracked_lifts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  order_no int not null default 1,
  created_at timestamptz not null default now(),
  unique (client_id, exercise_id)
);
create index if not exists tracked_lifts_client on public.tracked_lifts (client_id);

alter table public.tracked_lifts enable row level security;
drop policy if exists tracked_lifts_read on public.tracked_lifts;
create policy tracked_lifts_read on public.tracked_lifts for select to authenticated
  using (private.can_access(client_id));
drop policy if exists tracked_lifts_coach_write on public.tracked_lifts;
create policy tracked_lifts_coach_write on public.tracked_lifts for all to authenticated
  using (private.is_coach() and private.can_access(client_id))
  with check (private.is_coach() and private.can_access(client_id));
grant select, insert, update, delete on public.tracked_lifts to authenticated;
