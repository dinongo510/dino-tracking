import json
from urllib.parse import quote_plus
from exercises_data import E
from foods_data import F, T, D
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

q = lambda s: "'" + str(s).replace("'", "''") + "'"
arr = lambda csv: "'{" + ",".join(x.strip().replace("'", "''") for x in csv.split(",") if x.strip()) + "}'"
yt = lambda en: "https://www.youtube.com/results?search_query=" + quote_plus(en + " exercise form")
SLOT = {"sang": "Sáng", "trua": "Trưa", "toi": "Tối", "phu": "Phụ"}
GOAL = {"fat_loss": "Giảm mỡ", "recomp": "Duy trì / recomp", "muscle_gain": "Tăng cơ"}
fd = {f[0]: f for f in F}

def totals(items):
    k = p = c = fa = 0
    for fn, n in items:
        f = fd[fn]; k += f[4] * n; p += f[5] * n; c += f[6] * n; fa += f[7] * n
    return round(k), round(p, 1), round(c, 1), round(fa, 1)
tt = {t[0]: totals(t[3]) for t in T}
day_rows = []
for name, goal, ts in D:
    k = sum(tt[t][0] for t in ts); p = sum(tt[t][1] for t in ts); c = sum(tt[t][2] for t in ts); fa = sum(tt[t][3] for t in ts)
    day_rows.append((f"{name} ~{round(k, -1)} kcal", goal, ts, round(k), round(p), round(c), round(fa)))

# ---------------- SQL 0003: bài tập ----------------
L = ["-- DINO COACH — 0003: kho bài tập cốt lõi (%d bài). Chạy SAU 0002. Status: PROPOSED" % len(E),
     "-- name_en theo tên free-exercise-db khi có → script import (DINO-008) ghép ảnh theo name_en.",
     "-- video_url tạm = link tìm YouTube; Dino thay bằng video của mình dần.",
     "insert into public.exercises (name_vi, name_en, category, primary_muscles, secondary_muscles, equipment, tags, featured, is_custom, cues, video_url, source) values"]
vals = []
for vi, en, cat, pm, sm, eq, pat, lvl, cue in E:
    tags = f"{cat},pattern:{pat},level:{lvl},dino_core"
    vals.append(f"({q(vi)}, {q(en)}, {q(cat)}, {arr(pm)}, {arr(sm)}, {arr(eq)}, {arr(tags)}, true, false, {q(cue)}, {q(yt(en))}, 'dino-core')")
L.append(",\n".join(vals) + ";")
open("0003_dino_core_exercises.sql", "w").write("\n".join(L) + "\n")

# ---------------- SQL 0004: dinh dưỡng ----------------
S = ["""-- DINO COACH — 0004: kho thực phẩm, mẫu bữa, thực đơn mẫu cả ngày. Chạy SAU 0001. Status: PROPOSED
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
""",
"insert into public.foods (name_vi, food_group, serving, grams, kcal, protein_g, carb_g, fat_g, source) values"]
S.append(",\n".join(f"({q(n)}, {q(g)}, {q(sv)}, {gr}, {k}, {p}, {c}, {fa}, 'tham khảo TPTP VN/USDA')" for n, g, sv, gr, k, p, c, fa in F)
         + "\non conflict (name_vi) do nothing;\n")
for name, slot, tags, items in T:
    k, p, c, fa = tt[name]
    objs = ", ".join(f"jsonb_build_object('food_id', (select id from public.foods where name_vi = {q(fn)}), 'qty', {n})" for fn, n in items)
    S.append(f"insert into public.meal_templates (name, slot, tags, items, kcal, protein_g, carb_g, fat_g) values ({q(name)}, {q(slot)}, {arr(tags)}, jsonb_build_array({objs}), {k}, {p}, {c}, {fa}) on conflict (name) do nothing;")
for name, goal, ts, k, p, c, fa in day_rows:
    slots = [next(t[1] for t in T if t[0] == x) for x in ts]
    objs = ", ".join(f"jsonb_build_object('slot', {q(s)}, 'template_id', (select id from public.meal_templates where name = {q(x)}))" for s, x in zip(slots, ts))
    S.append(f"insert into public.day_plan_templates (name, goal, meals, kcal, protein_g, carb_g, fat_g) values ({q(name)}, {q(goal)}, jsonb_build_array({objs}), {k}, {p}, {c}, {fa}) on conflict (name) do nothing;")
open("0004_nutrition_library.sql", "w").write("\n".join(S) + "\n")

# ---------------- Excel để Dino duyệt ----------------
wb = Workbook()
RED = Font(bold=True, color="FFFFFF"); FILL = PatternFill("solid", fgColor="C0392B")
def sheet(ws, headers, rows, widths):
    ws.append(headers)
    for c in ws[1]: c.font = RED; c.fill = FILL; c.alignment = Alignment(vertical="center", wrap_text=True)
    for r in rows: ws.append(list(r))
    for i, w in enumerate(widths, 1): ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A2"; ws.auto_filter.ref = ws.dimensions

ws = wb.active; ws.title = "Bài tập"
sheet(ws, ["Tên Việt", "Tên Anh", "Nhóm", "Cơ chính", "Cơ phụ", "Dụng cụ", "Mẫu chuyển động", "Cấp độ", "Cue", "Link video (thay bằng video của Dino)"],
      [(vi, en, cat, pm, sm, eq, pat, lvl, cue, yt(en)) for vi, en, cat, pm, sm, eq, pat, lvl, cue in E],
      [32, 34, 13, 14, 26, 14, 14, 12, 50, 40])
ws = wb.create_sheet("Thực phẩm")
sheet(ws, ["Món / thực phẩm", "Nhóm", "Khẩu phần", "Gram", "Kcal", "Protein (g)", "Carb (g)", "Fat (g)"], F, [42, 10, 22, 8, 8, 11, 10, 9])
ws = wb.create_sheet("Mẫu bữa")
sheet(ws, ["Tên mẫu", "Bữa", "Tags", "Thành phần", "Kcal", "Protein (g)", "Carb (g)", "Fat (g)"],
      [(n, SLOT[s], tg, " + ".join(f"{fn} ×{q_}" for fn, q_ in it), *tt[n]) for n, s, tg, it in T], [40, 8, 26, 80, 8, 11, 10, 9])
ws = wb.create_sheet("Thực đơn ngày")
sheet(ws, ["Thực đơn", "Mục tiêu", "Các bữa", "Kcal", "Protein (g)", "Carb (g)", "Fat (g)"],
      [(n, GOAL[g], " → ".join(ts), k, p, c, fa) for n, g, ts, k, p, c, fa in day_rows], [34, 14, 110, 8, 11, 10, 9])
ws = wb.create_sheet("Ghi chú")
for line in ["Giá trị dinh dưỡng là THAM KHẢO: Bảng thành phần thực phẩm Việt Nam (Viện Dinh dưỡng), USDA, khẩu phần quán phổ biến TP.HCM.",
             "Món nấu sẵn dao động ±20% tùy quán và cách nấu — Dino đối chiếu và sửa trước khi giao khách.",
             "Thực đơn ngày là khung xuất phát: trong app (DINO-011) nhân/giảm số khẩu phần để khớp kcal mục tiêu của từng khách.",
             "Bài tập: tên Anh theo free-exercise-db để ghép ảnh tự động khi import; link video hiện là link tìm YouTube, thay dần bằng video của Dino.",
             "Sửa trong file này → gửi lại Claude/AG để sinh lại SQL (0003, 0004)."]:
    ws.append([line])
ws.column_dimensions["A"].width = 140
wb.save("DINO_Coach_Kho_bai_tap_va_meal_plan.xlsx")
print(len(E), "bài |", len(F), "thực phẩm |", len(T), "mẫu bữa |", len(D), "thực đơn ngày")
for r in day_rows: print(r[0], "P", r[4])
