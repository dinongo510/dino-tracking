# DINO-016 — Chạy từ gốc repo: python tests/coach/e2e_tools.py
import subprocess, time, os, sys, datetime, re
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.environ.get('DCOACH_ROOT') or os.path.abspath(os.path.join(HERE, '..', '..'))
FAKE = os.environ.get('DCOACH_FAKE') or os.path.join(HERE, 'fake_supabase.js')
PORT = '8781'
srv = subprocess.Popen([sys.executable, '-m', 'http.server', PORT, '-d', ROOT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
fake = open(FAKE, encoding='utf-8').read()
R = []

def ok(n, c):
  R.append(('PASS' if c else 'FAIL') + ' ' + n)

T = datetime.date.today()
D = lambda n: (T + datetime.timedelta(days=n)).isoformat()
MON = (T - datetime.timedelta(days=T.weekday())).isoformat()
A = 'a1'
C = 'c1'

ex = [
  {"id": "goblet_sq", "name_vi": "Goblet squat", "category": "strength", "primary_muscles": ["quadriceps"], "secondary_muscles": ["glutes"], "tags": [], "image_urls": []},
  {"id": "bench", "name_vi": "Đẩy ngực", "category": "strength", "primary_muscles": ["chest"], "secondary_muscles": ["triceps"], "tags": [], "image_urls": []},
  {"id": "run", "name_vi": "Chạy ngoài trời", "category": "run", "primary_muscles": ["calves"], "tags": [], "image_urls": []}
]

sess = [{"id": "s1", "client_id": A, "phase_id": "ph1", "week_no": 1, "day_no": 1, "scheduled_on": D(0), "title": "Sức mạnh A", "session_type": "strength", "mode": "self"}]
b_items = [
  {"id": "it1", "client_id": A, "block_id": "blk1", "exercise_id": "goblet_sq", "order_no": 1, "sets": 3, "reps_min": 10, "reps_max": 12, "load_kg": 24, "rest_sec": 60, "progression_rule": {"type": "none"}},
  {"id": "it2", "client_id": A, "block_id": "blk1", "exercise_id": "bench", "order_no": 2, "sets": 3, "reps_min": 8, "reps_max": 8, "load_kg": 80, "rest_sec": 90, "progression_rule": {"type": "none"}},
  {"id": "it3", "client_id": A, "block_id": "blk1", "exercise_id": "run", "order_no": 3, "distance_m": 5000, "duration_sec": 1500, "progression_rule": {"type": "none"}}
]

# Set logs generating volume, matrix dots, and PRs
logs = [
  # Goblet squat: 2 sets today (24kg x 12) + 2 sets 3 days ago (20kg x 12) -> set 3 is open for testing
  {"id": "l1", "client_id": A, "block_item_id": "it1", "set_no": 1, "reps": 12, "load_kg": 24, "done": True, "logged_at": D(0) + "T09:00:00"},
  {"id": "l2", "client_id": A, "block_item_id": "it1", "set_no": 2, "reps": 12, "load_kg": 24, "done": True, "logged_at": D(0) + "T09:05:00"},
  {"id": "l4", "client_id": A, "block_item_id": "it1", "set_no": 1, "reps": 12, "load_kg": 20, "done": True, "logged_at": D(-3) + "T09:00:00"},
  {"id": "l5", "client_id": A, "block_item_id": "it1", "set_no": 2, "reps": 12, "load_kg": 20, "done": True, "logged_at": D(-3) + "T09:05:00"},
  # Bench: 8 reps @ 80 kg today -> e1RM ~ 101.3 kg
  {"id": "l6", "client_id": A, "block_item_id": "it2", "set_no": 1, "reps": 8, "load_kg": 80, "done": True, "logged_at": D(0) + "T09:20:00"},
  # Run: 5000m in 1500s (pace 5:00) today
  {"id": "l7", "client_id": A, "block_item_id": "it3", "set_no": 1, "distance_m": 5000, "duration_sec": 1500, "done": True, "logged_at": D(0) + "T09:40:00"}
]

db = {
  "profiles": [
    {"id": C, "role": "coach", "full_name": "Ngô Đức Anh", "coach_id": None, "status": "active", "created_at": "2026-10-01"},
    {"id": A, "role": "client", "full_name": "Khách A", "coach_id": C, "status": "active", "phone": "0900", "coach_mode": "online", "created_at": "2026-10-01"}
  ],
  "health_intakes": [{"id": "h" + x, "client_id": x, "updated_at": "2026-11-25", "parq": {}, "lifestyle": {}, "diet": {}} for x in (C, A)],
  "exercises": ex,
  "programs": [{"id": "pr1", "client_id": A, "name": "Giáo án A", "model": "linear", "status": "published", "start_date": MON}],
  "phases": [{"id": "ph1", "client_id": A, "program_id": "pr1", "order_no": 1, "name": "Giai đoạn 1", "weeks": 4, "start_date": MON, "end_date": D(27), "status": "published"}],
  "sessions": sess,
  "session_blocks": [{"id": "blk1", "client_id": A, "session_id": "s1", "order_no": 1, "block_type": "straight"}],
  "block_items": b_items,
  "set_logs": logs,
  "measurements": [],
  "inbody_scans": [],
  "session_feedback": [],
  "meal_checks": [],
  "meal_slots": [],
  "tracked_lifts": [],
  "alerts": [],
  "weekly_checkins": [],
  "packages": [],
  "package_uses": []
}

B = f'http://localhost:{PORT}/coach/'

def login(pg, uid, hash_path):
  if not pg.url.startswith('http'):
    pg.goto(B + '#/login')
  pg.evaluate("u => { localStorage.setItem('dcoach_auth', JSON.stringify({ user: { id: u } })); sessionStorage.setItem('fake_tab_auth', JSON.stringify({ user: { id: u } })); }", uid)
  pg.goto('about:blank')
  pg.goto(B + hash_path)

try:
  with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844})
    errs = []
    ctx.route('**/cdn.jsdelivr.net/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=fake))
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    co = ctx.new_page()
    co.on('pageerror', lambda e: errs.append('page error: ' + str(e)))
    co.on('dialog', lambda d: d.accept())

    co.goto(B)
    co.evaluate("d => { localStorage.clear(); localStorage.setItem('fakedb', JSON.stringify(d)); }", db)

    # 1. Khách: mở từ Hồ sơ -> 4 thẻ hoạt động đúng
    login(co, A, '#/client/profile')
    co.wait_for_selector('a[href="#/tools"]')
    ok('1 Hồ sơ khách có link Công cụ hỗ trợ', co.is_visible('a[href="#/tools"]'))

    co.click('a[href="#/tools"]')
    co.wait_for_selector('#cardPace')
    ok('2 Mở trang #/tools thành công', '#/tools' in co.url)

    # Thẻ 1: Pace & dự đoán giải
    co.fill('#p_m', '5')
    co.fill('#p_s', '30')
    co.dispatch_event('#p_s', 'input')
    spd_val = co.input_value('#p_spd')
    ok(f'3 Đổi pace 5:30 -> ~10,9 km/h ({spd_val})', '10,9' in spd_val or '10.9' in spd_val)

    # Ô nhập chấp nhận cả dấu phẩy tiếng Việt ("10,9")
    co.fill('#p_spd', '12,0')
    co.dispatch_event('#p_spd', 'input')
    p_m_val = co.input_value('#p_m')
    p_s_val = co.input_value('#p_s')
    ok(f'3b Nhập vận tốc kiểu phẩy 12,0 -> pace 5:00 ({p_m_val}:{p_s_val})', p_m_val == '5' and p_s_val == '00')

    co.fill('#t_dist', '10')
    co.fill('#t_min', '55')
    co.fill('#t_sec', '0')
    co.dispatch_event('#t_sec', 'input')
    race_grid = co.inner_text('#racePredGrid')
    ok('4 Dự đoán giải từ 10km 55:00 hiện đủ cự ly dấu phẩy (21,1 km, 42,2 km)', ('21,1 km' in race_grid or '21.1' in race_grid) and ('42,2 km' in race_grid or '42.2' in race_grid))

    # Kiểm tra ô nhập không bị cắt chữ (scrollWidth <= clientWidth)
    inputs_to_check = ['#t_dist', '#t_min', '#t_sec', '#p_m', '#p_s', '#p_spd', '#rm_kg', '#rm_reps', '#pl_target']
    clipped = []
    for sel in inputs_to_check:
      sw, cw = co.evaluate(f's => {{ const el = document.querySelector(s); return [el.scrollWidth, el.clientWidth]; }}', sel)
      if sw > cw + 1:
        clipped.append((sel, sw, cw))
    ok(f'4b Các ô nhập không bị cắt số (scrollWidth <= clientWidth) ({clipped})', len(clipped) == 0)

    # Thẻ 2: 1RM & Bảng %
    co.fill('#rm_kg', '80')
    co.fill('#rm_reps', '8')
    co.dispatch_event('#rm_reps', 'input')
    rm_res = co.inner_text('#rm_res_epley')
    ok(f'5 1RM 80kg x 8 reps -> ~101 kg ({rm_res})', '101' in rm_res)
    co.click('#card1RM summary')
    co.wait_for_selector('#rmTable')
    rm_tbl = co.inner_text('#rmTable')
    ok('6 Bảng % 1RM hiện đủ các mốc 100% đến 50%', '100%' in rm_tbl and '85%' in rm_tbl and '50%' in rm_tbl)

    # Thẻ 3: Lắp đĩa tạ 87.5kg thanh 20
    co.fill('#pl_target', '87.5')
    co.select_option('#pl_bar', '20')
    co.dispatch_event('#pl_target', 'input')
    plate_res = co.inner_text('#plResultBox')
    ok(f'7 Lắp đĩa 87.5kg thanh 20 -> 25 + 5 + 2.5 + 1.25 ({plate_res})', '25 kg' in plate_res and '5 kg' in plate_res and ('2,5 kg' in plate_res or '2.5 kg' in plate_res) and ('1,25 kg' in plate_res or '1.25 kg' in plate_res))

    # Thẻ 4: WOD ngẫu nhiên
    co.select_option('#wod_type', 'amrap')
    co.select_option('#wod_min', '20')
    co.click('#spinWod')
    co.wait_for_timeout(200)
    wod_res = co.inner_text('#wodCard')
    ok('8 WOD lọc AMRAP <= 20 phút hiển thị đúng', 'AMRAP' in wod_res)
    co.click('#spinWod')
    co.wait_for_timeout(200)
    wod_res2 = co.inner_text('#wodCard')
    ok('9 Bấm "Quay WOD khác" hiển thị bài tập', len(wod_res2) > 20)

    # 2. Coach mở từ Thư viện
    login(co, C, '#/coach/library')
    co.wait_for_selector('a[href="#/tools"]')
    ok('10 Thư viện coach có link Công cụ hỗ trợ', co.is_visible('a[href="#/tools"]'))
    co.click('a[href="#/tools"]')
    co.wait_for_selector('#cardPace')
    ok('11 Coach điều hướng vào #/tools thành công', '#/tools' in co.url)

    # 3. Tiến độ: Sơ đồ cơ, ma trận 14 ngày, bảng PR
    login(co, C, f'#/dash/{A}')
    co.wait_for_selector('#muscleHeatmapCard', timeout=5000)
    ok('12 Thẻ Sơ đồ nhóm cơ hiển thị', co.is_visible('#muscleHeatmapCard'))

    # Sơ đồ cơ: kiểm tra đùi trước sáng hơn nhóm không tập (ví dụ lưng trên / traps)
    quad_style = co.get_attribute('[data-muscle="quadriceps"]', 'style')
    trap_style = co.get_attribute('[data-muscle="traps"]', 'style')
    ok(f'13 Cơ đã tập (quads) sáng hơn cơ chưa tập (traps)', 'hsl(' in quad_style and 'rgba' in trap_style)
    ok('13b Có chú thích thang màu dưới sơ đồ cơ', co.is_visible('#bodymapLegend'))

    # Chạm/click vào cơ -> hiển thị nhãn chi tiết có số hiệp và số buổi
    co.click('[data-muscle="quadriceps"]')
    active_label = co.inner_text('#activeMuscleLabel')
    ok(f'14 Chạm cơ đùi trước hiện số hiệp & số buổi ({active_label})', 'Đùi trước' in active_label and 'hiệp/tuần' in active_label and 'buổi' in active_label)

    # Chạm chỗ trống bỏ chọn
    co.click('#muscleHeatmapCard')
    reset_label = co.inner_text('#activeMuscleLabel')
    ok(f'14b Chạm chỗ trống bỏ chọn ({reset_label})', 'Chạm bó cơ' in reset_label)

    # Ma trận tần suất 14 ngày
    co.wait_for_selector('#freqMatrixCard')
    matrix_headers = co.eval_on_selector_all('#freqMatrixCard th', 'els => els.map(e => e.innerText.trim()).filter(Boolean)')
    ok(f'15 Ma trận tần suất 14 ngày có đủ 14 cột ngày (có {len(matrix_headers)-1} cột ngày)', len(matrix_headers) == 15)
    quad_row = co.inner_text('#freqMatrixCard tr:has-text("Đùi trước")')
    ok('16 Hàng Đùi trước trong ma trận có hiển thị', 'Đùi trước' in quad_row)

    # Bảng PR
    co.wait_for_selector('#prCard')
    pr_text = co.inner_text('#prCard')
    ok('17 Bảng PR hiển thị bài tập (Đẩy ngực, Goblet squat)', 'Đẩy ngực' in pr_text and 'Goblet squat' in pr_text)
    ok('18 Kỷ lục mới lập có nhãn "Mới"', 'Mới' in pr_text)

    # 4. Nút âm thanh đồng hồ nghỉ lưu dcoach_sound
    login(co, A, '#/client/session/s1')
    co.wait_for_selector('[data-done]')
    # Bấm hoàn thành hiệp 3 của goblet squat (chưa ghi, có rest_sec: 60)
    co.click('tr[data-set="3"] [data-done]')
    co.wait_for_selector('#restbar')
    ok('19 Hoàn thành hiệp kích hoạt đồng hồ nghỉ #restbar', co.is_visible('#restbar'))

    co.click('#rsound')
    sound_val1 = co.evaluate("localStorage.getItem('dcoach_sound')")
    icon1 = co.inner_text('#rsound')
    ok(f'20 Bấm nút âm thanh đổi sang tắt ({icon1}, localStorage={sound_val1})', sound_val1 == '0' and icon1 == '🔕')

    co.click('#rsound')
    sound_val2 = co.evaluate("localStorage.getItem('dcoach_sound')")
    icon2 = co.inner_text('#rsound')
    ok(f'21 Bấm lần nữa đổi sang bật ({icon2}, localStorage={sound_val2})', sound_val2 == '1' and icon2 == '🔔')
    co.click('#rskip')

    # 5. Kiểm tra tràn ngang và lỗi JS
    co.goto(B + '#/tools')
    co.wait_for_timeout(300)
    scroll_w = co.evaluate("document.documentElement.scrollWidth")
    inner_w = co.evaluate("window.innerWidth")
    ok(f'22 Không tràn ngang ở 390px (scrollWidth={scroll_w}, innerWidth={inner_w})', scroll_w <= inner_w + 1)
    ok(f'23 Không có lỗi JavaScript ({errs})', len(errs) == 0)

except Exception as ex:
  print('DEBUG URL:', co.url)
  print('DEBUG ERRS:', errs)
  ok(f'EXCEPTION: {ex}', False)
finally:
  try:
    b.close()
  except:
    pass
  srv.terminate()

print('----------------------------------------')
for r in R:
  print(r)
print('----------------------------------------')
fails = [r for r in R if r.startswith('FAIL')]
if fails:
  sys.exit(1)
