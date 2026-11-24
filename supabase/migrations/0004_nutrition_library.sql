-- DINO COACH — 0004: kho thực phẩm, mẫu bữa, thực đơn mẫu cả ngày. Chạy SAU 0001. Status: PROPOSED
-- Giá trị dinh dưỡng là THAM KHẢO (Bảng TPTP Việt Nam / USDA / khẩu phần quán TP.HCM, món nấu sẵn ±20%).

alter table public.foods add column if not exists food_group text;
alter table public.foods add column if not exists grams numeric(6,1);
create unique index if not exists foods_name_vi_key on public.foods (name_vi);

create table if not exists public.meal_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slot text not null check (slot in ('sang','trua','toi','phu')),
  tags text[] not null default '{}',
  items jsonb not null,               -- [{"food_id":"…","qty":1.5}]
  kcal numeric(6,1), protein_g numeric(5,1), carb_g numeric(5,1), fat_g numeric(5,1),
  created_at timestamptz not null default now()
);
create table if not exists public.day_plan_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  goal text check (goal in ('fat_loss','recomp','muscle_gain','performance')),
  meals jsonb not null,               -- [{"slot":"sang","template_id":"…"}]
  kcal numeric(6,1), protein_g numeric(5,1), carb_g numeric(5,1), fat_g numeric(5,1),
  created_at timestamptz not null default now()
);
alter table public.meal_templates enable row level security;
alter table public.day_plan_templates enable row level security;
create policy meal_templates_read  on public.meal_templates for select to authenticated using (true);
create policy meal_templates_write on public.meal_templates for all to authenticated using (private.is_coach()) with check (private.is_coach());
create policy day_plans_read  on public.day_plan_templates for select to authenticated using (true);
create policy day_plans_write on public.day_plan_templates for all to authenticated using (private.is_coach()) with check (private.is_coach());

insert into public.foods (name_vi, food_group, serving, grams, kcal, protein_g, carb_g, fat_g, source) values
('Ức gà luộc/áp chảo (bỏ da)', 'protein', '100 g chín', 100, 165, 31, 0, 3.6, 'tham khảo TPTP VN/USDA'),
('Đùi gà bỏ da (chín)', 'protein', '100 g chín', 100, 180, 25, 0, 8.5, 'tham khảo TPTP VN/USDA'),
('Thăn bò (chín)', 'protein', '100 g chín', 100, 200, 29, 0, 9, 'tham khảo TPTP VN/USDA'),
('Bò xay nạc 90% (chín)', 'protein', '100 g chín', 100, 217, 26, 0, 12, 'tham khảo TPTP VN/USDA'),
('Thăn heo nạc (chín)', 'protein', '100 g chín', 100, 145, 26, 0, 4, 'tham khảo TPTP VN/USDA'),
('Thịt ba chỉ heo (sống)', 'protein', '100 g sống', 100, 260, 16.5, 0, 21.5, 'tham khảo TPTP VN/USDA'),
('Sườn non heo nướng', 'protein', '100 g chín', 100, 280, 22, 3, 20, 'tham khảo TPTP VN/USDA'),
('Cá hồi áp chảo', 'protein', '100 g chín', 100, 206, 22, 0, 12, 'tham khảo TPTP VN/USDA'),
('Cá basa/cá tra hấp', 'protein', '100 g chín', 100, 120, 18, 0, 5, 'tham khảo TPTP VN/USDA'),
('Cá thu (chín)', 'protein', '100 g chín', 100, 160, 24, 0, 6.5, 'tham khảo TPTP VN/USDA'),
('Tôm luộc', 'protein', '100 g chín', 100, 99, 24, 0.2, 0.3, 'tham khảo TPTP VN/USDA'),
('Mực luộc/hấp', 'protein', '100 g chín', 100, 100, 18, 3, 1.5, 'tham khảo TPTP VN/USDA'),
('Trứng gà (luộc)', 'protein', '1 quả 50 g', 50, 72, 6.3, 0.4, 4.8, 'tham khảo TPTP VN/USDA'),
('Lòng trắng trứng', 'protein', '1 quả 33 g', 33, 17, 3.6, 0.2, 0.1, 'tham khảo TPTP VN/USDA'),
('Đậu hũ trắng', 'protein', '100 g', 100, 95, 10.9, 0.7, 5.4, 'tham khảo TPTP VN/USDA'),
('Đậu hũ chiên', 'protein', '100 g', 100, 270, 17, 10, 20, 'tham khảo TPTP VN/USDA'),
('Chả lụa (giò lụa)', 'protein', '100 g', 100, 136, 21.5, 0, 5.5, 'tham khảo TPTP VN/USDA'),
('Cá ngừ hộp ngâm nước (ráo)', 'protein', '100 g', 100, 116, 26, 0, 0.8, 'tham khảo TPTP VN/USDA'),
('Whey protein', 'protein', '1 muỗng 30 g', 30, 120, 24, 3, 1.5, 'tham khảo TPTP VN/USDA'),
('Sữa chua Hy Lạp không đường', 'dairy', '100 g', 100, 73, 10, 4, 2, 'tham khảo TPTP VN/USDA'),
('Sữa chua có đường (hũ)', 'dairy', '1 hũ 100 g', 100, 100, 3.5, 15, 3, 'tham khảo TPTP VN/USDA'),
('Sữa tươi không đường', 'dairy', '1 hộp 180 ml', 180, 110, 5.8, 8.5, 6, 'tham khảo TPTP VN/USDA'),
('Sữa đậu nành không đường', 'dairy', '1 ly 200 ml', 200, 80, 6.5, 4, 4, 'tham khảo TPTP VN/USDA'),
('Phô mai lát', 'dairy', '1 lát 20 g', 20, 60, 3.5, 1, 4.8, 'tham khảo TPTP VN/USDA'),
('Cơm trắng', 'carb', '1 chén 150 g', 150, 195, 4, 42, 0.4, 'tham khảo TPTP VN/USDA'),
('Cơm gạo lứt', 'carb', '1 chén 150 g', 150, 185, 4, 38, 1.5, 'tham khảo TPTP VN/USDA'),
('Bún tươi', 'carb', '100 g', 100, 110, 1.7, 25.7, 0, 'tham khảo TPTP VN/USDA'),
('Bánh phở tươi', 'carb', '100 g', 100, 141, 3.2, 32, 0, 'tham khảo TPTP VN/USDA'),
('Bánh mì (ổ)', 'carb', '1 ổ 80 g', 80, 200, 6.5, 41, 1, 'tham khảo TPTP VN/USDA'),
('Bánh mì sandwich nguyên cám', 'carb', '1 lát 30 g', 30, 75, 3.6, 12.5, 1, 'tham khảo TPTP VN/USDA'),
('Khoai lang luộc', 'carb', '100 g', 100, 86, 1.6, 20, 0.1, 'tham khảo TPTP VN/USDA'),
('Khoai tây luộc', 'carb', '100 g', 100, 87, 1.9, 20, 0.1, 'tham khảo TPTP VN/USDA'),
('Yến mạch (khô)', 'carb', '40 g', 40, 152, 5.3, 27, 2.7, 'tham khảo TPTP VN/USDA'),
('Bắp luộc', 'carb', '1 trái (~100 g hạt)', 100, 96, 3.4, 21, 1.5, 'tham khảo TPTP VN/USDA'),
('Mì gói', 'carb', '1 gói 75 g', 75, 350, 7, 48, 14, 'tham khảo TPTP VN/USDA'),
('Bánh tráng (mỏng)', 'carb', '1 cái 10 g', 10, 33, 0.4, 8, 0, 'tham khảo TPTP VN/USDA'),
('Rau xanh luộc (cải, muống, bí)', 'veg', '1 đĩa 150 g', 150, 38, 3.5, 6, 0.3, 'tham khảo TPTP VN/USDA'),
('Bông cải xanh luộc', 'veg', '100 g', 100, 35, 2.4, 7, 0.4, 'tham khảo TPTP VN/USDA'),
('Salad (xà lách, cà chua, dưa leo) không sốt', 'veg', '1 đĩa 150 g', 150, 25, 1.3, 5, 0.2, 'tham khảo TPTP VN/USDA'),
('Canh rau (1 chén)', 'veg', '1 chén 250 ml', 250, 30, 1.5, 5, 0.5, 'tham khảo TPTP VN/USDA'),
('Chuối', 'fruit', '1 trái 100 g', 100, 89, 1.1, 23, 0.3, 'tham khảo TPTP VN/USDA'),
('Táo', 'fruit', '1 trái 150 g', 150, 78, 0.4, 21, 0.3, 'tham khảo TPTP VN/USDA'),
('Cam', 'fruit', '1 trái 150 g', 150, 70, 1.4, 18, 0.2, 'tham khảo TPTP VN/USDA'),
('Đu đủ', 'fruit', '150 g', 150, 65, 0.7, 16, 0.4, 'tham khảo TPTP VN/USDA'),
('Thanh long', 'fruit', '150 g', 150, 85, 1.8, 20, 0.6, 'tham khảo TPTP VN/USDA'),
('Xoài chín', 'fruit', '150 g', 150, 90, 1.2, 22, 0.6, 'tham khảo TPTP VN/USDA'),
('Dưa hấu', 'fruit', '200 g', 200, 60, 1.2, 15, 0.3, 'tham khảo TPTP VN/USDA'),
('Ổi', 'fruit', '1 trái 150 g', 150, 100, 3.8, 21, 1.4, 'tham khảo TPTP VN/USDA'),
('Dầu ăn', 'fat', '1 muỗng canh 9 g', 9, 81, 0, 0, 9, 'tham khảo TPTP VN/USDA'),
('Bơ đậu phộng', 'fat', '1 muỗng canh 16 g', 16, 94, 3.5, 3.2, 8, 'tham khảo TPTP VN/USDA'),
('Đậu phộng rang', 'fat', '30 g', 30, 170, 7.7, 4.8, 14.6, 'tham khảo TPTP VN/USDA'),
('Hạt điều', 'fat', '30 g', 30, 165, 5.5, 9, 13, 'tham khảo TPTP VN/USDA'),
('Hạnh nhân', 'fat', '30 g', 30, 174, 6.4, 6.5, 15, 'tham khảo TPTP VN/USDA'),
('Quả bơ', 'fat', '1/2 trái 100 g', 100, 160, 2, 8.5, 14.7, 'tham khảo TPTP VN/USDA'),
('Phở bò tái', 'dish', '1 tô thường', 550, 450, 25, 60, 12, 'tham khảo TPTP VN/USDA'),
('Phở gà', 'dish', '1 tô thường', 550, 420, 27, 58, 9, 'tham khảo TPTP VN/USDA'),
('Bún bò Huế', 'dish', '1 tô thường', 600, 550, 28, 65, 18, 'tham khảo TPTP VN/USDA'),
('Bún chả', 'dish', '1 phần', 450, 600, 25, 70, 22, 'tham khảo TPTP VN/USDA'),
('Bún thịt nướng', 'dish', '1 tô', 450, 550, 22, 70, 18, 'tham khảo TPTP VN/USDA'),
('Hủ tiếu Nam Vang', 'dish', '1 tô', 550, 450, 22, 60, 12, 'tham khảo TPTP VN/USDA'),
('Mì Quảng', 'dish', '1 tô', 500, 550, 26, 70, 18, 'tham khảo TPTP VN/USDA'),
('Cơm tấm sườn bì chả', 'dish', '1 dĩa', 450, 750, 35, 90, 25, 'tham khảo TPTP VN/USDA'),
('Cơm tấm sườn', 'dish', '1 dĩa', 380, 600, 30, 80, 17, 'tham khảo TPTP VN/USDA'),
('Cơm gà xối mỡ', 'dish', '1 dĩa', 400, 700, 30, 80, 28, 'tham khảo TPTP VN/USDA'),
('Cơm gà luộc (Hải Nam)', 'dish', '1 dĩa', 400, 600, 32, 75, 17, 'tham khảo TPTP VN/USDA'),
('Bánh mì thịt', 'dish', '1 ổ', 180, 450, 18, 50, 20, 'tham khảo TPTP VN/USDA'),
('Bánh mì ốp la 2 trứng', 'dish', '1 phần', 180, 400, 16, 44, 17, 'tham khảo TPTP VN/USDA'),
('Xôi mặn', 'dish', '1 gói', 250, 450, 15, 65, 14, 'tham khảo TPTP VN/USDA'),
('Bánh cuốn', 'dish', '1 dĩa', 350, 400, 15, 60, 10, 'tham khảo TPTP VN/USDA'),
('Gỏi cuốn tôm thịt', 'dish', '1 cuốn', 70, 70, 5, 10, 1.5, 'tham khảo TPTP VN/USDA'),
('Cháo gà', 'dish', '1 tô', 450, 300, 18, 40, 7, 'tham khảo TPTP VN/USDA'),
('Bò bít tết (150 g thịt + khoai + trứng)', 'dish', '1 phần', 350, 650, 45, 35, 35, 'tham khảo TPTP VN/USDA'),
('Canh chua cá', 'dish', '1 chén', 300, 120, 12, 8, 4, 'tham khảo TPTP VN/USDA'),
('Rau muống xào tỏi', 'dish', '1 dĩa 150 g', 150, 120, 4, 7, 9, 'tham khảo TPTP VN/USDA'),
('Thịt kho trứng', 'dish', '100 g thịt + 1 trứng', 160, 380, 22, 8, 28, 'tham khảo TPTP VN/USDA'),
('Cá kho tộ', 'dish', '100 g cá', 120, 200, 18, 8, 10, 'tham khảo TPTP VN/USDA'),
('Đậu hũ sốt cà', 'dish', '150 g đậu', 200, 200, 14, 8, 12, 'tham khảo TPTP VN/USDA'),
('Trứng chiên', 'dish', '2 quả', 110, 200, 12.5, 1, 16, 'tham khảo TPTP VN/USDA'),
('Gà kho gừng', 'dish', '120 g thịt', 150, 260, 26, 5, 15, 'tham khảo TPTP VN/USDA'),
('Bò xào rau củ', 'dish', '100 g bò + rau', 220, 250, 24, 10, 13, 'tham khảo TPTP VN/USDA'),
('Ức gà nướng/áp chảo ướp sẵn', 'dish', '150 g chín', 150, 260, 46, 2, 7, 'tham khảo TPTP VN/USDA'),
('Cà phê đen không đường', 'drink', '1 ly', 200, 5, 0.3, 0, 0, 'tham khảo TPTP VN/USDA'),
('Cà phê sữa đá', 'drink', '1 ly', 250, 150, 2, 25, 4.5, 'tham khảo TPTP VN/USDA'),
('Bạc xỉu', 'drink', '1 ly', 300, 210, 5, 30, 7.5, 'tham khảo TPTP VN/USDA'),
('Trà sữa trân châu', 'drink', '1 ly size M', 500, 400, 3, 65, 14, 'tham khảo TPTP VN/USDA'),
('Nước mía', 'drink', '1 ly 300 ml', 300, 160, 0, 40, 0, 'tham khảo TPTP VN/USDA'),
('Sinh tố bơ (có sữa đặc)', 'drink', '1 ly', 350, 350, 5, 40, 19, 'tham khảo TPTP VN/USDA'),
('Bia', 'drink', '1 lon 330 ml', 330, 150, 1.5, 13, 0, 'tham khảo TPTP VN/USDA'),
('Bánh flan', 'drink', '1 cái', 100, 130, 4, 20, 4, 'tham khảo TPTP VN/USDA')
on conflict (name_vi) do nothing;

insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Yến mạch whey chuối', 'sang', '{fat_loss,muscle_gain,nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Yến mạch (khô)'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Whey protein'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Chuối'), 'qty', 1)), 361, 30.4, 53, 4.5) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Bánh mì nguyên cám trứng sữa', 'sang', '{fat_loss,nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Bánh mì sandwich nguyên cám'), 'qty', 2), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Trứng gà (luộc)'), 'qty', 2), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Lòng trắng trứng'), 'qty', 2), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Sữa tươi không đường'), 'qty', 1)), 438, 32.8, 34.7, 17.8) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Sữa chua Hy Lạp yến mạch trái cây', 'sang', '{fat_loss,nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Sữa chua Hy Lạp không đường'), 'qty', 2), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Yến mạch (khô)'), 'qty', 0.5), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Thanh long'), 'qty', 1)), 307, 24.4, 41.5, 5.9) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Khoai lang trứng sữa đậu nành', 'sang', '{fat_loss,nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Khoai lang luộc'), 'qty', 2), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Trứng gà (luộc)'), 'qty', 2), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Sữa đậu nành không đường'), 'qty', 1)), 396, 22.3, 44.8, 13.8) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Phở gà + thêm trứng', 'sang', '{an_ngoai}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Phở gà'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Trứng gà (luộc)'), 'qty', 1)), 492, 33.3, 58.4, 13.8) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Bánh mì ốp la + sữa đậu nành', 'sang', '{an_ngoai}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Bánh mì ốp la 2 trứng'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Sữa đậu nành không đường'), 'qty', 1)), 480, 22.5, 48, 21) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Xôi mặn + cà phê đen', 'sang', '{an_ngoai,muscle_gain}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Xôi mặn'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cà phê đen không đường'), 'qty', 1)), 455, 15.3, 65, 14) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Yến mạch bơ đậu phộng tăng cân', 'sang', '{muscle_gain,nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Yến mạch (khô)'), 'qty', 2), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Whey protein'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Bơ đậu phộng'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Chuối'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Sữa tươi không đường'), 'qty', 1)), 717, 45.0, 91.7, 21.2) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Cơm gạo lứt ức gà rau', 'trua', '{fat_loss,nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cơm gạo lứt'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Ức gà luộc/áp chảo (bỏ da)'), 'qty', 1.5), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Rau xanh luộc (cải, muống, bí)'), 'qty', 1)), 470, 54.0, 44.0, 7.2) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Cơm cá hồi bông cải', 'trua', '{fat_loss,muscle_gain,nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cơm trắng'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cá hồi áp chảo'), 'qty', 1.5), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Bông cải xanh luộc'), 'qty', 1.5)), 556, 40.6, 52.5, 19.0) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Cơm bò xào rau củ canh rau', 'trua', '{muscle_gain,nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cơm trắng'), 'qty', 1.5), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Bò xào rau củ'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Canh rau (1 chén)'), 'qty', 1)), 572, 31.5, 78.0, 14.1) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Cơm gà luộc (bỏ da, ít cơm)', 'trua', '{fat_loss,an_ngoai}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cơm gà luộc (Hải Nam)'), 'qty', 1)), 600, 32, 75, 17) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Cơm tấm sườn (không bì chả) + rau', 'trua', '{an_ngoai,muscle_gain}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cơm tấm sườn'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Salad (xà lách, cà chua, dưa leo) không sốt'), 'qty', 1)), 625, 31.3, 85, 17.2) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Bún thịt nướng (ít mỡ hành)', 'trua', '{an_ngoai}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Bún thịt nướng'), 'qty', 1)), 550, 22, 70, 18) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Cơm cá kho canh chua', 'trua', '{nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cơm trắng'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cá kho tộ'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Canh chua cá'), 'qty', 1)), 515, 34, 58, 14.4) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Cơm đậu hũ sốt cà trứng (chay trứng)', 'trua', '{fat_loss,nau_nha,chay}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cơm gạo lứt'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Đậu hũ sốt cà'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Trứng gà (luộc)'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Rau xanh luộc (cải, muống, bí)'), 'qty', 1)), 495, 27.8, 52.4, 18.6) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Cơm gà kho gừng rau muống', 'trua', '{muscle_gain,nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cơm trắng'), 'qty', 1.5), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Gà kho gừng'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Rau muống xào tỏi'), 'qty', 1)), 672, 36.0, 75.0, 24.6) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Khoai lang cá basa salad', 'toi', '{fat_loss,nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Khoai lang luộc'), 'qty', 2), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cá basa/cá tra hấp'), 'qty', 1.5), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Salad (xà lách, cà chua, dưa leo) không sốt'), 'qty', 1)), 377, 31.5, 45.0, 7.9) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Cơm tôm luộc rau', 'toi', '{fat_loss,nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cơm trắng'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Tôm luộc'), 'qty', 1.5), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Rau xanh luộc (cải, muống, bí)'), 'qty', 1)), 382, 43.5, 48.3, 1.1) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Bò bít tết', 'toi', '{muscle_gain,an_ngoai}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Bò bít tết (150 g thịt + khoai + trứng)'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Salad (xà lách, cà chua, dưa leo) không sốt'), 'qty', 1)), 675, 46.3, 40, 35.2) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Phở bò tái + rau', 'toi', '{an_ngoai}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Phở bò tái'), 'qty', 1)), 450, 25, 60, 12) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Gỏi cuốn tôm thịt (4 cuốn) + đậu hũ', 'toi', '{fat_loss,an_ngoai}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Gỏi cuốn tôm thịt'), 'qty', 4), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Đậu hũ trắng'), 'qty', 1)), 375, 30.9, 40.7, 11.4) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Cơm ức gà nướng bơ', 'toi', '{muscle_gain,nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cơm trắng'), 'qty', 1.5), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Ức gà nướng/áp chảo ướp sẵn'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Quả bơ'), 'qty', 0.5), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Rau xanh luộc (cải, muống, bí)'), 'qty', 1)), 670, 56.5, 75.2, 15.2) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Thăn heo khoai tây rau', 'toi', '{fat_loss,nau_nha}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Thăn heo nạc (chín)'), 'qty', 1.5), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Khoai tây luộc'), 'qty', 2), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Bông cải xanh luộc'), 'qty', 1)), 426, 45.2, 47.0, 6.6) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Cháo gà + trứng', 'toi', '{an_ngoai,nhe_bung}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cháo gà'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Trứng gà (luộc)'), 'qty', 1)), 372, 24.3, 40.4, 11.8) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Whey + chuối', 'phu', '{fat_loss,muscle_gain}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Whey protein'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Chuối'), 'qty', 1)), 209, 25.1, 26, 1.8) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Sữa chua Hy Lạp + hạnh nhân', 'phu', '{fat_loss}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Sữa chua Hy Lạp không đường'), 'qty', 1.5), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Hạnh nhân'), 'qty', 0.5)), 196, 18.2, 9.2, 10.5) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Trứng luộc + táo', 'phu', '{fat_loss}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Trứng gà (luộc)'), 'qty', 2), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Táo'), 'qty', 1)), 222, 13.0, 21.8, 9.9) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Bánh mì nguyên cám bơ đậu phộng + sữa', 'phu', '{muscle_gain}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Bánh mì sandwich nguyên cám'), 'qty', 2), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Bơ đậu phộng'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Sữa tươi không đường'), 'qty', 1)), 354, 16.5, 36.7, 16) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Sữa đậu nành + bắp', 'phu', '{fat_loss}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Sữa đậu nành không đường'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Bắp luộc'), 'qty', 1)), 176, 9.9, 25, 5.5) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Cá ngừ + bánh mì nguyên cám', 'phu', '{fat_loss,muscle_gain}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Cá ngừ hộp ngâm nước (ráo)'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Bánh mì sandwich nguyên cám'), 'qty', 2)), 266, 33.2, 25.0, 2.8) on conflict (name) do nothing;
insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ('Trái cây + hạt điều', 'phu', '{muscle_gain}', jsonb_build_array(jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Xoài chín'), 'qty', 1), jsonb_build_object('food_id', (select id from public.foods where name_vi = 'Hạt điều'), 'qty', 1)), 255, 6.7, 31, 13.6) on conflict (name) do nothing;
insert into public.day_plan_templates (name, goal, meals, kcal, protein_g, carb_g, fat_g) values ('Giảm mỡ (nấu nhà) ~1380 kcal', 'fat_loss', jsonb_build_array(jsonb_build_object('slot', 'sang', 'template_id', (select id from public.meal_templates where name = 'Sữa chua Hy Lạp yến mạch trái cây')), jsonb_build_object('slot', 'trua', 'template_id', (select id from public.meal_templates where name = 'Cơm gạo lứt ức gà rau')), jsonb_build_object('slot', 'toi', 'template_id', (select id from public.meal_templates where name = 'Khoai lang cá basa salad')), jsonb_build_object('slot', 'phu', 'template_id', (select id from public.meal_templates where name = 'Trứng luộc + táo'))), 1376, 123, 152, 31) on conflict (name) do nothing;
insert into public.day_plan_templates (name, goal, meals, kcal, protein_g, carb_g, fat_g) values ('Giảm mỡ (nấu nhà) ~1500 kcal', 'fat_loss', jsonb_build_array(jsonb_build_object('slot', 'sang', 'template_id', (select id from public.meal_templates where name = 'Yến mạch whey chuối')), jsonb_build_object('slot', 'trua', 'template_id', (select id from public.meal_templates where name = 'Cơm cá hồi bông cải')), jsonb_build_object('slot', 'toi', 'template_id', (select id from public.meal_templates where name = 'Cơm tôm luộc rau')), jsonb_build_object('slot', 'phu', 'template_id', (select id from public.meal_templates where name = 'Sữa chua Hy Lạp + hạnh nhân'))), 1495, 133, 163, 35) on conflict (name) do nothing;
insert into public.day_plan_templates (name, goal, meals, kcal, protein_g, carb_g, fat_g) values ('Giảm mỡ (ăn ngoài) ~1660 kcal', 'fat_loss', jsonb_build_array(jsonb_build_object('slot', 'sang', 'template_id', (select id from public.meal_templates where name = 'Bánh mì ốp la + sữa đậu nành')), jsonb_build_object('slot', 'trua', 'template_id', (select id from public.meal_templates where name = 'Cơm gà luộc (bỏ da, ít cơm)')), jsonb_build_object('slot', 'toi', 'template_id', (select id from public.meal_templates where name = 'Gỏi cuốn tôm thịt (4 cuốn) + đậu hũ')), jsonb_build_object('slot', 'phu', 'template_id', (select id from public.meal_templates where name = 'Whey + chuối'))), 1664, 110, 190, 51) on conflict (name) do nothing;
insert into public.day_plan_templates (name, goal, meals, kcal, protein_g, carb_g, fat_g) values ('Duy trì / recomp ~1710 kcal', 'recomp', jsonb_build_array(jsonb_build_object('slot', 'sang', 'template_id', (select id from public.meal_templates where name = 'Khoai lang trứng sữa đậu nành')), jsonb_build_object('slot', 'trua', 'template_id', (select id from public.meal_templates where name = 'Cơm tấm sườn (không bì chả) + rau')), jsonb_build_object('slot', 'toi', 'template_id', (select id from public.meal_templates where name = 'Thăn heo khoai tây rau')), jsonb_build_object('slot', 'phu', 'template_id', (select id from public.meal_templates where name = 'Cá ngừ + bánh mì nguyên cám'))), 1713, 132, 202, 40) on conflict (name) do nothing;
insert into public.day_plan_templates (name, goal, meals, kcal, protein_g, carb_g, fat_g) values ('Tăng cơ (nấu nhà) ~2620 kcal', 'muscle_gain', jsonb_build_array(jsonb_build_object('slot', 'sang', 'template_id', (select id from public.meal_templates where name = 'Yến mạch bơ đậu phộng tăng cân')), jsonb_build_object('slot', 'trua', 'template_id', (select id from public.meal_templates where name = 'Cơm gà kho gừng rau muống')), jsonb_build_object('slot', 'toi', 'template_id', (select id from public.meal_templates where name = 'Cơm ức gà nướng bơ')), jsonb_build_object('slot', 'phu', 'template_id', (select id from public.meal_templates where name = 'Bánh mì nguyên cám bơ đậu phộng + sữa')), jsonb_build_object('slot', 'phu', 'template_id', (select id from public.meal_templates where name = 'Whey + chuối'))), 2622, 179, 305, 79) on conflict (name) do nothing;
insert into public.day_plan_templates (name, goal, meals, kcal, protein_g, carb_g, fat_g) values ('Tăng cơ (ăn ngoài) ~2520 kcal', 'muscle_gain', jsonb_build_array(jsonb_build_object('slot', 'sang', 'template_id', (select id from public.meal_templates where name = 'Xôi mặn + cà phê đen')), jsonb_build_object('slot', 'trua', 'template_id', (select id from public.meal_templates where name = 'Cơm bò xào rau củ canh rau')), jsonb_build_object('slot', 'toi', 'template_id', (select id from public.meal_templates where name = 'Bò bít tết')), jsonb_build_object('slot', 'phu', 'template_id', (select id from public.meal_templates where name = 'Trái cây + hạt điều')), jsonb_build_object('slot', 'phu', 'template_id', (select id from public.meal_templates where name = 'Whey + chuối')), jsonb_build_object('slot', 'phu', 'template_id', (select id from public.meal_templates where name = 'Bánh mì nguyên cám bơ đậu phộng + sữa'))), 2520, 141, 277, 95) on conflict (name) do nothing;
