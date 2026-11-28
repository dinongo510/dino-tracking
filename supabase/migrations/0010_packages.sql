-- =====================================================================
-- DINO COACH — 0010: gói tập (buổi / thời hạn), buổi PT tại chỗ, "Tập của tôi" cho coach (DINO-014)
-- Chạy SAU 0009. Status: PROPOSED
-- - profiles.coach_mode: online / offline / hybrid (chỉ coach đổi).
-- - sessions.mode: 'self' khách tự tập · 'pt' tập với coach tại chỗ (coach ghi, trừ 1 buổi của gói).
-- - packages: gói theo buổi (total_sessions) và/hoặc thời hạn (end_date; NULL = không thời hạn), giá + đã trả.
-- - package_uses: mỗi buổi đã dùng (gắn buổi PT nếu có; 1 buổi chỉ trừ 1 lần).
-- - Coach tự làm khách của mình ("Tập của tôi"): dòng của chính coach không bị chặn ghi ở check-in / báo cáo.
-- =====================================================================
alter table public.profiles add column if not exists coach_mode text not null default 'online';
do $$ begin
  alter table public.profiles add constraint profiles_coach_mode_chk check (coach_mode in ('online','offline','hybrid'));
exception when duplicate_object then null; end $$;

alter table public.sessions add column if not exists mode text not null default 'self';
do $$ begin
  alter table public.sessions add constraint sessions_mode_chk check (mode in ('self','pt'));
exception when duplicate_object then null; end $$;

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  name text,
  total_sessions int check (total_sessions is null or total_sessions > 0),   -- NULL = không giới hạn buổi
  start_date date not null default current_date,
  end_date date,                                                              -- NULL = không thời hạn
  price_vnd bigint check (price_vnd is null or price_vnd >= 0),
  paid_vnd bigint not null default 0 check (paid_vnd >= 0),
  status text not null default 'active' check (status in ('active','ended')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists packages_client on public.packages (client_id);

create table if not exists public.package_uses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete cascade,
  session_id uuid unique references public.sessions(id) on delete set null,  -- 1 buổi PT chỉ trừ 1 lần
  used_on date not null default current_date,
  note text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists package_uses_package on public.package_uses (package_id);
create index if not exists package_uses_client on public.package_uses (client_id);

do $$
declare t text;
begin
  foreach t in array array['packages','package_uses'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t||'_read', t);
    execute format($p$create policy %I on public.%I for select to authenticated using (private.can_access(client_id))$p$, t||'_read', t);
    execute format('drop policy if exists %I on public.%I', t||'_coach_write', t);
    execute format($p$create policy %I on public.%I for all to authenticated
      using (private.is_coach() and private.can_access(client_id)) with check (private.is_coach() and private.can_access(client_id))$p$, t||'_coach_write', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- Khách không tự đổi role / coach / hình thức coaching
create or replace function private.lock_profile_fields() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is not null and not private.is_coach()
     and (new.role <> old.role or new.coach_id is distinct from old.coach_id or new.coach_mode is distinct from old.coach_mode) then
    raise exception 'Không được đổi role, coach hoặc hình thức coaching';
  end if;
  return new;
end $$;

-- Check-in: như 0008, nhưng coach tự check-in cho chính mình thì ghi được hết
create or replace function private.guard_checkin() returns trigger
language plpgsql set search_path = '' as $$
declare me uuid := (select auth.uid()); coach boolean := private.is_coach();
begin
  if me is null then return new; end if;
  if new.client_id = me and coach then
    if tg_op = 'UPDATE' and new.coach_reply is distinct from old.coach_reply then new.replied_at := now(); end if;
  elsif not coach then
    if tg_op = 'INSERT' then new.coach_reply := null; new.replied_at := null;
    else new.coach_reply := old.coach_reply; new.replied_at := old.replied_at; end if;
  else
    if tg_op = 'UPDATE' then
      new.avg_weight_kg := old.avg_weight_kg; new.sleep_score := old.sleep_score; new.stress_score := old.stress_score;
      new.energy_score := old.energy_score; new.hardest := old.hardest; new.client_note := old.client_note;
      new.sessions_pct := old.sessions_pct; new.eat_pct := old.eat_pct;
      if new.coach_reply is distinct from old.coach_reply then new.replied_at := now(); end if;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

-- Báo cáo giai đoạn: như 0008, coach làm báo cáo cho chính mình thì ghi được cả 2 phần
create or replace function private.guard_review() returns trigger
language plpgsql set search_path = '' as $$
declare me uuid := (select auth.uid()); coach boolean := private.is_coach();
begin
  if me is not null and not (coach and new.client_id = me) then
    if not coach then
      if tg_op = 'INSERT' then new.coach_summary := null; new.next_decisions := null; new.coach_agreed_at := null;
      else new.coach_summary := old.coach_summary; new.next_decisions := old.next_decisions; new.coach_agreed_at := old.coach_agreed_at; end if;
    else
      if tg_op = 'INSERT' then new.client_feedback := null; new.client_agreed_at := null;
      else new.client_feedback := old.client_feedback; new.client_agreed_at := old.client_agreed_at; end if;
    end if;
  end if;
  if tg_op = 'UPDATE' and (new.coach_summary is distinct from old.coach_summary or new.next_decisions is distinct from old.next_decisions)
     and new.client_agreed_at is not distinct from old.client_agreed_at then
    new.client_agreed_at := null;
  end if;
  new.status := case when new.coach_agreed_at is not null and new.client_agreed_at is not null then 'agreed' else 'open' end;
  new.updated_at := now();
  return new;
end $$;
