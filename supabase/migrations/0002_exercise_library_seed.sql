-- =====================================================================
-- DINO COACH — 0002: mở rộng thư viện bài tập + seed HYROX / Chạy / Corrective
-- Chạy SAU 0001. Status: PROPOSED (thuộc DINO-008)
-- Tag OHSA dùng cho DINO-007: ohsa:feet_turn_out | ohsa:knees_in | ohsa:forward_lean
--                             | ohsa:low_back_arch | ohsa:arms_forward
-- =====================================================================

alter table public.exercises
  add column if not exists tags      text[]  not null default '{}',
  add column if not exists featured  boolean not null default false,   -- bài Dino hay dùng, hiện trước
  add column if not exists is_custom boolean not null default false,   -- Dino tự tạo (không từ free-exercise-db)
  add column if not exists external_id text unique;                    -- id gốc free-exercise-db khi import

create index if not exists exercises_tags_gin on public.exercises using gin (tags);
create index if not exists exercises_category_idx on public.exercises (category);

-- ---------- HYROX: 8 trạm thi đấu ----------
insert into public.exercises (name_vi, name_en, category, equipment, tags, is_custom, featured, cues) values
('SkiErg 1000 m',             'SkiErg',                'hyrox', '{skierg}',          '{hyrox,station:1}', true, true, 'Gập hông kéo xuống, không chỉ kéo tay; giữ nhịp đều'),
('Đẩy sled 50 m',             'Sled Push',             'hyrox', '{sled}',            '{hyrox,station:2}', true, true, 'Người nghiêng 45°, tay duỗi hoặc gập, bước ngắn nhanh'),
('Kéo sled 50 m',             'Sled Pull',             'hyrox', '{sled,rope}',       '{hyrox,station:3}', true, true, 'Ngồi thấp, kéo bằng chân + lưng, tay luân phiên'),
('Burpee nhảy xa 80 m',       'Burpee Broad Jump',     'hyrox', '{}',                '{hyrox,station:4}', true, true, 'Không chống tay quá xa; tiếp đất mềm, đi vào burpee tiếp'),
('Chèo 1000 m',               'Row',                   'hyrox', '{rower}',           '{hyrox,station:5}', true, true, 'Chân – thân – tay; về theo thứ tự ngược lại'),
('Xách tạ đi 200 m',          'Farmers Carry',         'hyrox', '{kettlebell}',      '{hyrox,station:6}', true, true, 'Vai kéo xuống, siết core, bước ngắn nhanh'),
('Lunge túi cát 100 m',       'Sandbag Lunges',        'hyrox', '{sandbag}',         '{hyrox,station:7}', true, true, 'Gối sau chạm sàn nhẹ, thân thẳng'),
('Ném bóng tường 100 lần',    'Wall Balls',            'hyrox', '{medicine_ball}',   '{hyrox,station:8}', true, true, 'Squat qua song song, dùng lực chân đẩy bóng');

-- ---------- CHẠY ----------
insert into public.exercises (name_vi, name_en, category, tags, is_custom, featured, cues) values
('Chạy nhẹ (Zone 2)',         'Easy Run',              'run', '{run,zone2}',        true, true, 'Nói chuyện được thành câu; HR vùng 2'),
('Chạy hồi phục',             'Recovery Run',          'run', '{run,zone1}',        true, false,'Rất nhẹ, 20–40 phút'),
('Chạy tempo',                'Tempo Run',             'run', '{run,threshold}',    true, true, 'Khó nhưng giữ được 20–40 phút; HR vùng 3–4'),
('Chạy interval',             'Interval Run',          'run', '{run,vo2max}',       true, true, 'Ghi số lặp, cự ly, pace mục tiêu, nghỉ giữa lặp'),
('Chạy dài',                  'Long Run',              'run', '{run,endurance}',    true, true, 'Pace thoải mái, tăng cự ly ≤ 10%/tuần'),
('Chạy compromised 1 km',     'Compromised Run',       'run', '{run,hyrox}',        true, true, 'Chạy ngay sau trạm HYROX, giữ pace thi đấu');

-- ---------- CORRECTIVE (NASM CEx: inhibit → lengthen → activate → integrate) ----------
insert into public.exercises (name_vi, name_en, category, corrective_step, tags, is_custom, cues) values
-- Inhibit (SMR / lăn foam)
('Lăn foam bắp chân',             'SMR Calves',                 'corrective','inhibit',  '{corrective,ohsa:feet_turn_out,ohsa:forward_lean}', true, 'Giữ điểm đau 30–60 giây'),
('Lăn foam đùi sau ngoài',        'SMR Biceps Femoris',         'corrective','inhibit',  '{corrective,ohsa:feet_turn_out,ohsa:knees_in}',     true, 'Xoay nhẹ chân ra ngoài để vào phần ngoài'),
('Lăn foam cơ khép',              'SMR Adductors',              'corrective','inhibit',  '{corrective,ohsa:knees_in}',                        true, 'Nằm sấp, chân co sang bên'),
('Lăn foam TFL / IT band',        'SMR TFL / IT Band',          'corrective','inhibit',  '{corrective,ohsa:knees_in}',                        true, 'Lăn vùng trước–ngoài hông'),
('Lăn foam đùi trước / gập hông', 'SMR Quadriceps / Hip Flexors','corrective','inhibit', '{corrective,ohsa:forward_lean,ohsa:low_back_arch}', true, 'Giữ điểm đau 30–60 giây'),
('Lăn foam cơ xô',                'SMR Latissimus Dorsi',       'corrective','inhibit',  '{corrective,ohsa:low_back_arch,ohsa:arms_forward}', true, 'Nằm nghiêng, tay duỗi qua đầu'),
('Lăn foam lưng trên',            'SMR Thoracic Spine',         'corrective','inhibit',  '{corrective,ohsa:arms_forward}',                    true, 'Ôm ngực, không lăn xuống thắt lưng'),
-- Lengthen (giãn tĩnh 30 giây)
('Giãn bắp chân (gối thẳng)',     'Static Gastrocnemius Stretch','corrective','lengthen','{corrective,ohsa:feet_turn_out,ohsa:forward_lean}', true, 'Gót sát sàn, mũi chân thẳng hướng'),
('Giãn bắp chân (gối co)',        'Static Soleus Stretch',      'corrective','lengthen', '{corrective,ohsa:feet_turn_out,ohsa:forward_lean}', true, 'Co gối sau để vào soleus'),
('Giãn cơ khép (lunge ngang)',    'Static Adductor Stretch',    'corrective','lengthen', '{corrective,ohsa:knees_in}',                        true, 'Lưng thẳng, đẩy hông sang bên'),
('Giãn gập hông quỳ một gối',     'Kneeling Hip Flexor Stretch','corrective','lengthen', '{corrective,ohsa:knees_in,ohsa:forward_lean,ohsa:low_back_arch}', true, 'Siết mông bên quỳ, không võng lưng'),
('Giãn cơ xô với bóng',           'Ball Lat Stretch',           'corrective','lengthen', '{corrective,ohsa:low_back_arch,ohsa:arms_forward}', true, 'Quỳ, tay đặt lên bóng, đẩy hông về sau'),
('Giãn ngực ở khung cửa',         'Doorway Pec Stretch',        'corrective','lengthen', '{corrective,ohsa:arms_forward}',                    true, 'Khuỷu ngang vai, bước nhẹ ra trước'),
-- Activate (đơn khớp, 1–2 hiệp × 10–15, giữ 2 giây đỉnh)
('Nhón gót một chân',             'Single-Leg Calf Raise',      'corrective','activate', '{corrective,ohsa:feet_turn_out}',                   true, 'Giữ mắt cá thẳng, không đổ ra ngoài'),
('Đi ngang với band',             'Tube Walking (Lateral)',     'corrective','activate', '{corrective,ohsa:knees_in}',                        true, 'Gối không sụp vào, bước ngắn'),
('Dạng hông nằm nghiêng',         'Side-Lying Hip Abduction',   'corrective','activate', '{corrective,ohsa:knees_in}',                        true, 'Chân hơi ra sau, mũi chân hướng trước'),
('Cầu mông',                      'Floor Bridge',               'corrective','activate', '{corrective,ohsa:knees_in,ohsa:forward_lean,ohsa:low_back_arch}', true, 'Siết mông, không ưỡn thắt lưng'),
('Chim – chó (quadruped)',        'Quadruped Opposite Arm/Leg', 'corrective','activate', '{corrective,ohsa:low_back_arch,ohsa:forward_lean}', true, 'Hóp bụng, hông không xoay'),
('Plank hóp bụng',                'Plank with Drawing-In',      'corrective','activate', '{corrective,ohsa:low_back_arch}',                   true, 'Rốn kéo vào cột sống, thở đều'),
('Nâng ngực nằm sấp (cobra)',     'Prone Cobra',                'corrective','activate', '{corrective,ohsa:arms_forward}',                    true, 'Xoay ngón cái ra ngoài, kéo bả vai xuống'),
('Xoay ngoài vai với band',       'Band External Rotation',     'corrective','activate', '{corrective,ohsa:arms_forward}',                    true, 'Khuỷu sát sườn, xoay chậm'),
('Kéo cáp thấp nhẹ (nhấn bả)',    'Standing Cable Row (light)', 'corrective','activate', '{corrective,ohsa:arms_forward}',                    true, 'Ép bả vai xuống và vào'),
-- Integrate (toàn thân, 1–3 hiệp × 10–15, kiểm soát)
('Squat tựa bóng vào tường',      'Ball Wall Squat',            'corrective','integrate','{corrective,ohsa:feet_turn_out,ohsa:knees_in,ohsa:forward_lean}', true, 'Gối theo hướng ngón 2–3'),
('Squat với band quanh gối',      'Banded Squat',               'corrective','integrate','{corrective,ohsa:knees_in}',                        true, 'Đẩy gối ra chống band'),
('Bước bục giữ thăng bằng',       'Step-Up to Balance',         'corrective','integrate','{corrective,ohsa:feet_turn_out,ohsa:knees_in}',     true, 'Giữ 2 giây trên một chân'),
('Squat kết hợp kéo cáp',         'Squat to Row',               'corrective','integrate','{corrective,ohsa:low_back_arch,ohsa:arms_forward,ohsa:forward_lean}', true, 'Đứng lên mới kéo, bả vai xuống'),
('Squat kết hợp đẩy qua đầu',     'Squat to Overhead Press',    'corrective','integrate','{corrective,ohsa:arms_forward,ohsa:low_back_arch}', true, 'Không ưỡn lưng khi đẩy');
