-- =====================================================================
-- DINO COACH — 0007: cảnh báo cho Hộp việc của Coach (DINO-010 mục 2.5)
-- Chạy SAU 0006. Status: PROPOSED
-- - Khách chỉ ĐỌC cảnh báo của mình; coach đọc/ghi/đóng cảnh báo khách của mình.
-- - Đau + RPE cao: trigger trên session_feedback tự tạo (khách không cần quyền ghi alerts).
-- - Bỏ buổi + km chạy tăng đột ngột: app của coach tính khi mở Hộp việc rồi ghi vào.
-- - ref_key chống trùng: cùng khách + cùng loại + cùng ref_key chỉ có 1 cảnh báo.
-- =====================================================================
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('pain','high_rpe','missed','run_load')),
  ref_id uuid,                 -- buổi tập liên quan (nếu có)
  ref_key text not null,       -- khóa chống trùng: id buổi, hoặc thứ Hai của tuần
  message text not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (client_id, kind, ref_key)
);
create index if not exists alerts_client_open on public.alerts (client_id, resolved_at);

alter table public.alerts enable row level security;
create policy alerts_read on public.alerts for select to authenticated
  using (private.can_access(client_id));
create policy alerts_coach_write on public.alerts for all to authenticated
  using (private.is_coach() and private.can_access(client_id))
  with check (private.is_coach() and private.can_access(client_id));
grant select, insert, update, delete on public.alerts to authenticated;

-- Trigger: khi khách hoàn thành buổi → cảnh báo đau / RPE ≥ 9,5 hai buổi liên tiếp
create or replace function private.feedback_alerts() returns trigger
language plpgsql security definer set search_path = '' as $$
declare prev_rpe numeric; areas text;
begin
  if not coalesce(new.completed, false) then return new; end if;

  if new.pain is not null and jsonb_typeof(new.pain) = 'array' and jsonb_array_length(new.pain) > 0 then
    select string_agg(format('%s (%s/5)', p->>'area', p->>'level'), ', ') into areas
      from jsonb_array_elements(new.pain) p;
    insert into public.alerts (client_id, kind, ref_id, ref_key, message)
      values (new.client_id, 'pain', new.session_id, new.session_id::text, 'Khách báo đau: ' || areas)
      on conflict (client_id, kind, ref_key) do update set message = excluded.message, resolved_at = null;
  end if;

  if new.session_rpe >= 9.5 then
    select f.session_rpe into prev_rpe
      from public.session_feedback f join public.sessions s on s.id = f.session_id
      where f.client_id = new.client_id and f.completed and f.session_id <> new.session_id
        and s.scheduled_on <= (select scheduled_on from public.sessions where id = new.session_id)
      order by s.scheduled_on desc, f.created_at desc limit 1;
    if prev_rpe >= 9.5 then
      insert into public.alerts (client_id, kind, ref_id, ref_key, message)
        values (new.client_id, 'high_rpe', new.session_id, new.session_id::text, 'RPE buổi ≥ 9,5 hai buổi liên tiếp')
        on conflict (client_id, kind, ref_key) do nothing;
    end if;
  end if;
  return new;
end $$;
revoke all on function private.feedback_alerts() from public;

drop trigger if exists session_feedback_alerts on public.session_feedback;
create trigger session_feedback_alerts after insert or update of completed, pain, session_rpe
  on public.session_feedback for each row execute function private.feedback_alerts();

-- Khách chỉ được đánh dấu "đã đọc" tin của người kia, không sửa nội dung / tác giả tin
create or replace function private.lock_message_fields() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.body is distinct from old.body or new.author_id is distinct from old.author_id
     or new.client_id is distinct from old.client_id or new.context_id is distinct from old.context_id then
    raise exception 'Chỉ được đánh dấu đã đọc';
  end if;
  return new;
end $$;
drop trigger if exists messages_lock on public.messages;
create trigger messages_lock before update on public.messages
  for each row execute function private.lock_message_fields();

-- Tin nhắn: tác giả phải là chính người đang đăng nhập
create or replace function private.force_message_author() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (select auth.uid()) is not null then new.author_id := (select auth.uid()); end if;
  return new;
end $$;
drop trigger if exists messages_author on public.messages;
create trigger messages_author before insert on public.messages
  for each row execute function private.force_message_author();
