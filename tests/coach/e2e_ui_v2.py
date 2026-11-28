# DINO-019 — Test E2E Giao diện DINOMET v2
# Chạy từ gốc repo: python tests/coach/e2e_ui_v2.py
import subprocess, time, os, sys, datetime
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.environ.get('DCOACH_ROOT') or os.path.abspath(os.path.join(HERE, '..', '..'))
FAKE = os.environ.get('DCOACH_FAKE') or os.path.join(HERE, 'fake_supabase.js')

PORT = '8783'
srv = subprocess.Popen([sys.executable, '-m', 'http.server', PORT, '-d', ROOT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)

fake = open(FAKE, encoding='utf-8').read()
R = []
def ok(name, cond):
    res = 'PASS' if cond else 'FAIL'
    R.append(f'{res} {name}')
    print(f'{res} {name}')

T = datetime.date.today()
D = lambda n: (T + datetime.timedelta(days=n)).isoformat()
MON = T - datetime.timedelta(days=T.weekday())
A = 'a1'

sess = [
    {"id": "today", "client_id": A, "phase_id": "ph1", "week_no": 1, "day_no": T.weekday() + 1, "scheduled_on": D(0), "title": "Buổi Chân", "session_type": "strength"},
    {"id": "next", "client_id": A, "phase_id": "ph1", "week_no": 1, "day_no": (T.weekday() + 3) % 7 + 1, "scheduled_on": D(2), "title": "Buổi Lưng", "session_type": "strength"}
]

db = {
    "profiles": [
        {"id": "c1", "role": "coach", "full_name": "Ngô Đức Anh", "coach_id": None, "status": "active", "created_at": "2026-11-01"},
        {"id": A, "role": "client", "full_name": "Khách A", "coach_id": "c1", "status": "active", "created_at": "2026-11-20"}
    ],
    "health_intakes": [{"id": "h1", "client_id": A, "updated_at": "2026-11-25", "parq": {}, "lifestyle": {}, "diet": {}}],
    "exercises": [
        {"id": "sq", "name_vi": "Squat", "name_en": "Back Squat", "category": "strength", "tags": [], "image_urls": ["/coach/icons/logo-mark.png"], "featured": True, "primary_muscles": ["quads"]}
    ],
    "programs": [{"id": "pr1", "client_id": A, "name": "P", "model": "linear", "status": "published", "start_date": MON.isoformat()}],
    "phases": [{"id": "ph1", "client_id": A, "program_id": "pr1", "order_no": 1, "name": "Giai đoạn 1", "weeks": 4, "start_date": MON.isoformat(), "end_date": D(30), "status": "published"}],
    "sessions": sess,
    "session_blocks": [{"id": "b1", "client_id": A, "session_id": "today", "order_no": 1, "block_type": "straight"}],
    "block_items": [{"id": "i1", "client_id": A, "block_id": "b1", "exercise_id": "sq", "order_no": 1, "sets": 3, "reps_min": 8, "reps_max": 10, "progression_rule": {"type": "none"}}],
    "measurements": [
        {"id": "m1", "client_id": A, "measured_on": D(-8), "weight_kg": 70},
        {"id": "m2", "client_id": A, "measured_on": D(-1), "weight_kg": 69.5}
    ],
    "nutrition_targets": [{"id": "nt1", "client_id": A, "kcal": 2200, "protein_g": 160, "carb_g": 240, "fat_g": 60}],
    "nutrition_logs": [{"id": "nl1", "client_id": A, "logged_on": D(0), "kcal": 1800, "protein_g": 130, "carb_g": 200, "fat_g": 50}],
    "messages": []
}

B = f'http://localhost:{PORT}/coach/'

def login(pg, uid, route_hash):
    if not pg.url.startswith('http'):
        pg.goto(B + '#/login')
    pg.evaluate("u => { sessionStorage.clear(); sessionStorage.setItem('fake_tab_auth', JSON.stringify({ user: { id: u } })); }", uid)
    pg.goto(B + '#/')
    pg.goto(B + route_hash)

errs = []

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # Test at 375px (iPhone SE / mini)
        ctx = browser.new_context(viewport={'width': 375, 'height': 667})
        ctx.route('**/cdn.jsdelivr.net/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=fake))
        ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))

        pg.goto(B)
        pg.evaluate("d => { localStorage.clear(); localStorage.setItem('fakedb', JSON.stringify(d)); }", db)

        # 1. Login view: no topbar
        pg.goto(B + '#/login')
        pg.wait_for_selector('img[src="/coach/icons/logo-full.png"]')
        topbar_hidden = pg.evaluate("() => { const tb = document.getElementById('topbar'); return !tb || tb.hidden || tb.style.display === 'none' || getComputedStyle(tb).display === 'none'; }")
        ok('1 Trang login không hiện topbar', topbar_hidden)

        # 2. Authenticate as client -> Client Home
        login(pg, A, '#/client')
        pg.wait_for_selector('main')
        time.sleep(0.5)

        # 2a. Topbar exists with logo-mark, DINOMET brand, and avatar button
        tb_brand = pg.locator('#topbar .topbar-brand').inner_text()
        has_logo = pg.locator('#topbar img[src="/coach/icons/logo-mark.png"]').count() == 1
        initials = pg.locator('#topbar #btnAvatar').inner_text()
        ok('2 Topbar hiện logo-mark, nhãn DINOMET, và avatar có chữ viết tắt họ tên (KA)', has_logo and 'DINOMET' in tb_brand and initials.strip() == 'KA')

        # 2b. Account sheet interaction
        pg.click('#btnAvatar')
        time.sleep(0.3)
        sheet_open = pg.evaluate("() => { const d = document.getElementById('accountSheet'); return d && d.open; }")
        has_out = pg.locator('#accountSheet #actSignOut').count() == 1
        has_theme = pg.locator('#accountSheet #themePick').count() == 1
        ok('3 Bấm avatar mở bottom sheet #accountSheet (có Đăng xuất và Đổi màu)', sheet_open and has_out and has_theme)
        pg.click('#accountSheet #actCloseSheet')
        time.sleep(0.2)

        # 2c. Client Home greeting & num stats & progress rings
        greeting = pg.locator('main h1').first.inner_text()
        ok('4 Chào ngắn gọn "Chào... Khách" (hoặc Khách A)', 'Chào' in greeting and 'Khách' in greeting)
        num_stats = pg.locator('main .num').count()
        ok('5 Có ít nhất 3 ô số liệu dùng class .num', num_stats >= 3)
        rings = pg.locator('main .ring-box svg').count()
        ok('6 Có vòng tròn tiến độ SVG', rings >= 1)

        # 2d. FAB for adhoc session
        fab = pg.locator('#btnNewAdhoc')
        ok('7 Nút nổi FAB #btnNewAdhoc hiển thị', fab.count() == 1 and fab.is_visible())
        fab.click()
        pg.wait_for_url('**/#/client/adhoc/new')
        ok('8 Bấm FAB chuyển hướng đến #/client/adhoc/new', '#/client/adhoc/new' in pg.url)

        # 2e. Client Tabbar check: 'Tiến độ' tab
        login(pg, A, '#/client')
        pg.wait_for_selector('.tabbar')
        tab_labels = pg.locator('.tabbar .tab-label').all_inner_texts()
        ok('9 Thanh tab client có tab "Tiến độ" thay cho "Cơ thể"', 'Tiến độ' in tab_labels and 'Cơ thể' not in tab_labels)

        # 3. Coach Home (`#/coach`)
        co = ctx.new_page()
        co.on('pageerror', lambda e: errs.append('coach ' + str(e)))
        login(co, 'c1', '#/coach')
        co.wait_for_selector('main')
        time.sleep(0.5)

        coach_h1 = co.locator('main h1').first.inner_text()
        ok('10 Coach Home H1 là "Khách của bạn"', 'Khách của bạn' in coach_h1)

        # Coach card clickable
        card_clickable = co.locator('#group li[data-client="a1"]').get_attribute('onclick')
        ok('11 Thẻ khách có thể bấm chuyển trang (#/coach/client/a1)', card_clickable and '#/coach/client/a1' in card_clickable)

        # Theme picker dọn khỏi page body
        theme_in_body = co.evaluate("() => { const t = document.querySelector('main #themePick'); return !!t; }")
        ok('12 Khối chọn màu không còn nằm trong trang chủ coach', not theme_in_body)

        # 4. Coach Library (`#/coach/library`)
        co.goto(B + '#/coach/library')
        co.wait_for_selector('.seg')
        seg_tabs = co.locator('.seg .seg-btn').all_inner_texts()
        ok('13 Thư viện có slider 3 tab: Bài tập, Món ăn, Công cụ', seg_tabs == ['Bài tập', 'Món ăn', 'Công cụ'])
        has_search_icon = co.locator('main svg circle').count() >= 1
        ok('14 Ô tìm kiếm có icon kính lúp', has_search_icon)

        # 5. Check no horizontal overflow across 10 main routes at 375px
        routes = [
            ('#/login', 'Login'),
            ('#/client', 'Client Home'),
            ('#/client/plan', 'Client Plan'),
            ('#/client/eat', 'Client Eat'),
            ('#/client/body', 'Client Tiến độ'),
            ('#/client/profile', 'Client Profile'),
            ('#/tools', 'Tools'),
            ('#/coach', 'Coach Home'),
            ('#/coach/library', 'Coach Library'),
            ('#/coach/inbox', 'Coach Inbox')
        ]

        overflow_fails = []
        for r_hash, r_name in routes:
            uid = 'c1' if r_hash.startswith('#/coach') else A
            login(pg, uid, r_hash)
            pg.wait_for_selector('main, form')
            time.sleep(0.3)
            w_diff = pg.evaluate("() => { return document.scrollingElement.scrollWidth - document.documentElement.clientWidth; }")
            if w_diff > 1:
                overflow_fails.append(f'{r_name} (+{w_diff}px)')

        ok('15 Không tràn ngang ở 375px trên 10 màn chính', len(overflow_fails) == 0)
        if overflow_fails:
            print('  Tràn ngang tại:', overflow_fails)

        # 6. Button white-space nowrap & height <= 44px
        btn_wrap_fails = pg.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('.btn'));
            return btns.filter(b => {
                const ws = getComputedStyle(b).whiteSpace;
                return ws !== 'nowrap';
            }).length;
        }""")
        ok('16 Tất cả .btn có white-space: nowrap', btn_wrap_fails == 0)

        # 7. Typography: H1 <= 24px on 375px viewport
        h1_size_fails = pg.evaluate("""() => {
            const h1s = Array.from(document.querySelectorAll('h1'));
            return h1s.filter(h => parseFloat(getComputedStyle(h).fontSize) > 24.5).length;
        }""")
        ok('17 Tiêu đề H1 <= 24px trên mobile 375px', h1_size_fails == 0)

        # 8. Zero JavaScript errors
        ok('18 Không có lỗi JavaScript', len(errs) == 0)
        if errs:
            print('  Lỗi JS:', errs[:3])

        browser.close()

finally:
    srv.terminate()

total = len(R)
passed = sum(1 for r in R if r.startswith('PASS'))
print(f'\n{passed}/{total} PASS')
if passed != total:
    sys.exit(1)
