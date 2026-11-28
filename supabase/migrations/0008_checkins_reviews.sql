-- =====================================================================
-- DINO COACH — 0008: check-in tuần + báo cáo giai đoạn (DINO-012)
-- Chạy SAU 0007. Status: PROPOSED
-- - weekly_checkins: lưu kèm % buổi tập / % ăn của tuần; coach_reply + replied_at chỉ coach ghi.
-- - phase_reviews: mỗi bên "Đồng ý" riêng; đủ 2 bên → status 'agreed' (tự động).
--   Coach sửa tóm tắt/quyết định sau khi khách đồng ý → khách đồng ý lại.
-- - Khách chỉ ghi phần của khách, coach chỉ ghi phần của coach (trigger chặn).
-- =====================================================================
alter table public.weekly_checkins
  add column if not exists sessions_pct int,
  add column if not exists eat_pct int,
  add column if not exists replied_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.phase_reviews
  add column if not exists coach_agreed_at timestamptz,
  add column if not exists client_agreed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- ---------- Check-in: khách không ghi được phần trả lời của coach ----------
create or replace function private.guard_checkin() returns trigger
language plpgsql set search_path = '' as $$
declare coach boolean := private.is_coach();
begin
  if (select auth.uid()) is null then return new; end if;     -- SQL Editor / hệ thống
  if not coach then
    if tg_op = 'INSERT' then new.coach_reply := null; new.replied_at := null;
    else new.coach_reply := old.coach_reply; new.replied_at := old.replied_at; end if;
  else
    if tg_op = 'UPDATE' then                                   -- coach không sửa câu trả lời của khách
      new.avg_weight_kg := old.avg_weight_kg; new.sleep_score := old.sleep_score; new.stress_score := old.stress_score;
      new.energy_score := old.energy_score; new.hardest := old.hardest; new.client_note := old.client_note;
      new.sessions_pct := old.sessions_pct; new.eat_pct := old.eat_pct;
      if new.coach_reply is distinct from old.coach_reply then new.replied_at := now(); end if;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists weekly_checkins_guard on public.weekly_checkins;
create trigger weekly_checkins_guard before insert or update on public.weekly_checkins
  for each row execute function private.guard_checkin();

-- ---------- Báo cáo giai đoạn: mỗi bên chỉ ghi phần mình; đủ 2 đồng ý → agreed ----------
create or replace function private.guard_review() returns trigger
language plpgsql set search_path = '' as $$
declare coach boolean := private.is_coach();
begin
  if (select auth.uid()) is not null then
    if not coach then
      if tg_op = 'INSERT' then new.coach_summary := null; new.next_decisions := null; new.coach_agreed_at := null;
      else new.coach_summary := old.coach_summary; new.next_decisions := old.next_decisions; new.coach_agreed_at := old.coach_agreed_at; end if;
    else
      if tg_op = 'INSERT' then new.client_feedback := null; new.client_agreed_at := null;
      else new.client_feedback := old.client_feedback; new.client_agreed_at := old.client_agreed_at; end if;
    end if;
  end if;
  -- Coach sửa tóm tắt / quyết định sau khi khách đã đồng ý → khách phải đồng ý lại
  -- (khách viết nhận xét của mình không làm mất lượt đồng ý của coach)
  if tg_op = 'UPDATE' and (new.coach_summary is distinct from old.coach_summary or new.next_decisions is distinct from old.next_decisions)
     and new.client_agreed_at is not distinct from old.client_agreed_at then
    new.client_agreed_at := null;
  end if;
  new.status := case when new.coach_agreed_at is not null and new.client_agreed_at is not null then 'agreed' else 'open' end;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists phase_reviews_guard on public.phase_reviews;
create trigger phase_reviews_guard before insert or update on public.phase_reviews
  for each row execute function private.guard_review();
