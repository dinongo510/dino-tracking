-- =====================================================================
-- DINO COACH ONLINE — Supabase schema + RLS   (DINO-006, status: PROPOSED)
-- Chạy 1 lần trong Supabase Dashboard > SQL Editor của PROJECT MỚI.
-- Sau khi chạy: Authentication > Sign In / Providers > TẮT "Allow new users to sign up"
-- (khách chỉ vào qua link mời).
-- =====================================================================

create extension if not exists pgcrypto;
create schema if not exists private;
grant usage on schema private to authenticated;   -- để policy RLS gọi được các hàm private.*

-- ---------- 1. TÀI KHOẢN ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'client' check (role in ('coach','client')),
  full_name   text,
  phone       text,
  coach_id    uuid references public.profiles(id),
  status      text not null default 'active' check (status in ('active','paused','ended')),
  created_at  timestamptz not null default now()
);
create index on public.profiles (coach_id);

-- Hàm kiểm tra quyền (security definer để không lặp RLS)
create or replace function private.is_coach() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'coach');
$$;

create or replace function private.can_access(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select cid = (select auth.uid())
      or exists (select 1 from public.profiles p
                 where p.id = cid and p.coach_id = (select auth.uid()));
$$;

-- Khách xem được tên coach của mình (hàm riêng để policy không tự gọi lại chính bảng profiles)
create or replace function private.my_coach_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select coach_id from public.profiles where id = (select auth.uid());
$$;

-- Tự tạo profile khi Dino mời khách (inviteUserByEmail với data: {full_name, coach_id})
create or replace function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, coach_id)
  values (new.id,
          new.raw_user_meta_data->>'full_name',
          coalesce(nullif(new.raw_user_meta_data->>'coach_id','')::uuid,
                   -- mời từ Dashboard không kèm coach_id → gán cho coach duy nhất (Dino)
                   (select id from public.profiles where role = 'coach' order by created_at limit 1)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- Khách không được tự đổi role / coach_id
create or replace function private.lock_profile_fields() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- auth.uid() rỗng = chạy từ SQL Editor/admin → cho phép (dùng để set role coach lần đầu)
  if (select auth.uid()) is not null and not private.is_coach() and (new.role <> old.role or new.coach_id is distinct from old.coach_id) then
    raise exception 'Không được đổi role hoặc coach';
  end if;
  return new;
end $$;
create trigger profiles_lock before update on public.profiles
  for each row execute function private.lock_profile_fields();

alter table public.profiles enable row level security;
create policy profiles_select on public.profiles for select to authenticated
  using (private.can_access(id) or id = private.my_coach_id());
create policy profiles_update on public.profiles for update to authenticated
  using (private.can_access(id)) with check (private.can_access(id));

-- ---------- 2. HỒ SƠ & ĐO LƯỜNG (khách + coach cùng ghi) ----------
create table public.health_intakes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.profiles(id) on delete cascade,
  dob date, sex text check (sex in ('male','female')), height_cm numeric(5,1),
  goal text check (goal in ('fat_loss','recomp','muscle_gain','performance')),
  activity_factor numeric(4,3) default 1.375,
  parq jsonb default '{}'::jsonb, parq_flag boolean default false,
  injuries text, surgeries text, medical text, medications text,
  return_cleared boolean,                     -- đã được bác sĩ cho phép vận động lại sau chấn thương/phẫu thuật
  emergency_contact text, doctor_contact text, -- tên + SĐT
  goal_ratings jsonb default '{}'::jsonb,     -- {"fat_loss":0-10,"muscle_gain":0-10,"performance":0-10,"health":0-10}
  current_activity text, active_days_60min int,
  diet jsonb default '{}'::jsonb,             -- health_score, current_diet, salt/sugar/fat (low|medium|high), snack_control, alcohol_per_week, caffeine_per_week
  lifestyle jsonb default '{}'::jsonb,        -- ngủ, stress, nghề nghiệp, giải trí, sở thích, lịch tập, dụng cụ (xem file nội dung khách)
  entered_by uuid default auth.uid(),
  created_at timestamptz not null default now(), updated_at timestamptz default now()
);

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric(5,2), neck_cm numeric(5,1), chest_cm numeric(5,1), waist_cm numeric(5,1),
  hip_cm numeric(5,1), arm_cm numeric(5,1), thigh_cm numeric(5,1), note text,
  entered_by uuid default auth.uid(), created_at timestamptz not null default now()
);

create table public.inbody_scans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  scanned_on date not null default current_date,
  weight_kg numeric(5,2), smm_kg numeric(5,2), pbf_pct numeric(4,1), ffm_kg numeric(5,2),
  visceral_fat_level int, bmr_inbody int, sheet_photo_path text,
  entered_by uuid default auth.uid(), created_at timestamptz not null default now()
);

create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  taken_on date not null default current_date,
  angle text not null check (angle in ('front','side','back')),
  storage_path text not null,           -- progress/<client_id>/<file>.webp
  phase_id uuid,
  entered_by uuid default auth.uid(), created_at timestamptz not null default now()
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  assessed_on date not null default current_date,
  ohsa jsonb default '{}'::jsonb,       -- {"feet_turn_out":true,"knees_in":false,...}
  note text,
  entered_by uuid default auth.uid(), created_at timestamptz not null default now()
);

-- Ghi chú nội bộ của coach: bảng riêng, khách KHÔNG đọc được (không để trong health_intakes)
create table public.coach_notes (
  client_id uuid primary key references public.profiles(id) on delete cascade,
  notes text, updated_at timestamptz not null default now()
);
alter table public.coach_notes enable row level security;
create policy coach_notes_coach on public.coach_notes for all to authenticated
  using (private.is_coach() and private.can_access(client_id))
  with check (private.is_coach() and private.can_access(client_id));

-- ---------- 3. THƯ VIỆN BÀI TẬP (dùng chung) ----------
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name_vi text not null, name_en text,
  category text,                         -- strength, run, hyrox, corrective, mobility, conditioning
  primary_muscles text[], secondary_muscles text[], equipment text[],
  image_urls text[], video_url text, cues text, source text,
  corrective_step text check (corrective_step in ('inhibit','lengthen','activate','integrate')),
  created_at timestamptz not null default now()
);
alter table public.exercises enable row level security;
create policy exercises_read  on public.exercises for select to authenticated using (true);
create policy exercises_write on public.exercises for all    to authenticated
  using (private.is_coach()) with check (private.is_coach());

-- ---------- 4. GIÁO ÁN (coach ghi, khách đọc) ----------
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  model text check (model in ('linear','undulating','block','custom')),
  start_date date, status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now()
);

create table public.phases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  order_no int not null, name text not null, goal text, weeks int not null default 4,
  start_date date, end_date date, handover_note text,
  status text not null default 'draft' check (status in ('draft','published','done')),
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  phase_id uuid not null references public.phases(id) on delete cascade,
  week_no int not null, day_no int not null, scheduled_on date,
  title text, session_type text check (session_type in ('strength','run','hyrox','circuit','corrective','mixed')),
  coach_note text, created_at timestamptz not null default now()
);

create table public.session_blocks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  order_no int not null, label text,     -- A, B1/B2, Finisher...
  block_type text not null check (block_type in
    ('straight','superset','circuit','emom','amrap','for_time','run','hyrox','corrective')),
  rounds int, work_sec int, rest_sec int, time_cap_sec int, note text,
  created_at timestamptz not null default now()
);

create table public.block_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  block_id uuid not null references public.session_blocks(id) on delete cascade,
  exercise_id uuid references public.exercises(id),
  order_no int not null,
  sets int, reps_min int, reps_max int,
  load_kg numeric(6,2), pct_1rm numeric(4,1), target_rpe numeric(3,1),
  tempo text, rest_sec int,
  distance_m int, duration_sec int, target_pace text, hr_zone int,
  progression_rule jsonb,                -- {"type":"double","upper_kg":2.5,"lower_kg":5}
  note text, created_at timestamptz not null default now()
);

-- ---------- 5. THỰC HIỆN & TRAO ĐỔI (khách ghi) ----------
create table public.set_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  block_item_id uuid not null references public.block_items(id) on delete cascade,
  set_no int not null, reps int, load_kg numeric(6,2), rpe numeric(3,1),
  distance_m int, duration_sec int, avg_hr int, done boolean default true,
  logged_at timestamptz not null default now(),
  unique (block_item_id, set_no)
);

create table public.session_feedback (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid not null unique references public.sessions(id) on delete cascade,
  completed boolean default false, session_rpe numeric(3,1),
  pain jsonb,                            -- [{"area":"knee_left","level":3}]
  note text, coach_reviewed boolean default false,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  context_type text not null check (context_type in ('session','checkin','phase','general')),
  context_id uuid,
  author_id uuid not null default auth.uid() references public.profiles(id),
  body text not null, read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- 6. DINH DƯỠNG ----------
create table public.foods (
  id uuid primary key default gen_random_uuid(),
  name_vi text not null, serving text not null,
  kcal numeric(6,1) not null, protein_g numeric(5,1), carb_g numeric(5,1), fat_g numeric(5,1),
  source text, created_at timestamptz not null default now()
);
alter table public.foods enable row level security;
create policy foods_read  on public.foods for select to authenticated using (true);
create policy foods_write on public.foods for all    to authenticated
  using (private.is_coach()) with check (private.is_coach());

create table public.nutrition_targets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  valid_from date not null default current_date,
  formula text check (formula in ('mifflin','katch')),
  bmr int, tdee int, kcal int, protein_g int, carb_g int, fat_g int,
  status text not null default 'proposed' check (status in ('proposed','approved')),
  created_at timestamptz not null default now()
);

create table public.meal_slots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  order_no int not null, name text not null, kcal_pct numeric(4,1) not null,
  created_at timestamptz not null default now()
);

create table public.meal_options (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  slot_id uuid not null references public.meal_slots(id) on delete cascade,
  label text, items jsonb not null,      -- [{"food_id":"...","qty":1.5}]
  kcal numeric(6,1), protein_g numeric(5,1),
  created_at timestamptz not null default now()
);

create table public.meal_checks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  check_date date not null default current_date,
  slot_id uuid references public.meal_slots(id) on delete set null,
  option_id uuid references public.meal_options(id) on delete set null,
  level text not null check (level in ('on','near','off')),
  photo_path text, note text,
  created_at timestamptz not null default now(),
  unique (client_id, check_date, slot_id)
);

-- ---------- 7. CHECK-IN & BÁO CÁO GIAI ĐOẠN ----------
create table public.weekly_checkins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  avg_weight_kg numeric(5,2), sleep_score int, stress_score int, energy_score int,
  hardest text, client_note text, coach_reply text,
  created_at timestamptz not null default now(),
  unique (client_id, week_start)
);

create table public.phase_reviews (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  phase_id uuid not null unique references public.phases(id) on delete cascade,
  coach_summary text, client_feedback text, next_decisions text,
  status text not null default 'open' check (status in ('open','agreed')),
  created_at timestamptz not null default now()
);

-- ---------- 8. RLS hàng loạt + index client_id ----------
do $$
declare t text;
begin
  -- Khách + coach cùng đọc/ghi
  foreach t in array array['health_intakes','measurements','inbody_scans','progress_photos',
    'assessments','set_logs','session_feedback','messages','meal_checks','weekly_checkins','phase_reviews']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create index on public.%I (client_id)', t);
    execute format($p$create policy %I on public.%I for all to authenticated
      using (private.can_access(client_id)) with check (private.can_access(client_id))$p$, t||'_rw', t);
  end loop;

  -- Coach ghi, khách chỉ đọc
  foreach t in array array['programs','phases','sessions','session_blocks','block_items',
    'nutrition_targets','meal_slots','meal_options']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create index on public.%I (client_id)', t);
    execute format($p$create policy %I on public.%I for select to authenticated
      using (private.can_access(client_id))$p$, t||'_read', t);
    execute format($p$create policy %I on public.%I for all to authenticated
      using (private.is_coach() and private.can_access(client_id))
      with check (private.is_coach() and private.can_access(client_id))$p$, t||'_coach_write', t);
  end loop;
end $$;

-- Index khóa ngoại hay dùng
create index on public.phases (program_id);
create index on public.sessions (phase_id);
create index on public.session_blocks (session_id);
create index on public.block_items (block_id);
create index on public.messages (context_type, context_id, created_at);
create index on public.measurements (client_id, measured_on);

-- ---------- 9. REALTIME ----------
alter publication supabase_realtime add table public.messages, public.set_logs, public.session_feedback;

-- ---------- 10. STORAGE: bucket ảnh riêng tư ----------
insert into storage.buckets (id, name, public) values ('progress','progress', false)
  on conflict (id) do nothing;

create policy progress_rw on storage.objects for all to authenticated
  using (bucket_id = 'progress' and private.can_access(((storage.foldername(name))[1])::uuid))
  with check (bucket_id = 'progress' and private.can_access(((storage.foldername(name))[1])::uuid));

-- ---------- 11. TÀI KHOẢN COACH ----------
-- Sau khi Dino tự tạo user của mình trong Authentication > Users, chạy:
-- update public.profiles set role = 'coach', full_name = 'Ngô Đức Anh' where id = '<UUID của Dino>';
