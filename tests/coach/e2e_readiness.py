# DINO-015 — Chạy từ gốc repo: python tests/coach/e2e_readiness.py
import subprocess, time, os, sys, datetime

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.environ.get('DCOACH_ROOT') or os.path.abspath(os.path.join(HERE, '..', '..'))
FAKE = os.environ.get('DCOACH_FAKE') or os.path.join(HERE, 'fake_supabase.js')

srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8780', '-d', ROOT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)

fake = open(FAKE, encoding='utf-8').read()
R = []
def ok(n, c):
    status = 'PASS' if c else 'FAIL'
    R.append(f'{status} {n}')
    print(f'[{status}] {n}')

T = datetime.date.today()
D = lambda n: (T + datetime.timedelta(days=n)).isoformat()
MON = (T - datetime.timedelta(days=T.weekday())).isoformat()

prof = lambda i, n, mode='online', role='client': {
    "id": i, "role": role, "full_name": n,
    "coach_id": None if role == 'coach' else 'c1',
    "status": "active", "coach_mode": mode, "created_at": "2026-10-01"
}

db = {
    "profiles": [
        prof('c1', 'Dino Coach', role='coach'),
        prof('a1', 'Khách A', 'online')
    ],
    "health_intakes": [
        {"id": "ha1", "client_id": "a1", "updated_at": "2026-11-25", "parq": {}, "lifestyle": {}, "diet": {}},
        {"id": "hc1", "client_id": "c1", "updated_at": "2026-11-25", "parq": {}, "lifestyle": {}, "diet": {}}
    ],
    "assessments": [
        {"id": "as1", "client_id": "a1", "assessed_on": D(-5), "created_at": D(-5), "ohsa": {"knees_in": True}}
    ],
    "exercises": [
        {"id": "e1", "name_vi": "Lăn foam cơ khép", "corrective_step": "inhibit", "tags": ["ohsa:knees_in"], "category": "mobility", "primary_muscles": ["adductors"], "image_urls": []},
        {"id": "e2", "name_vi": "Kéo giãn cơ khép tĩnh", "corrective_step": "lengthen", "tags": ["ohsa:knees_in"], "category": "mobility", "primary_muscles": ["adductors"], "image_urls": []},
        {"id": "e3", "name_vi": "Đi ngang với band", "corrective_step": "activate", "tags": ["ohsa:knees_in"], "category": "strength", "primary_muscles": ["glutes"], "image_urls": []},
        {"id": "e4", "name_vi": "Squat với band quanh gối", "corrective_step": "integrate", "tags": ["ohsa:knees_in"], "category": "strength", "primary_muscles": ["glutes"], "image_urls": []},
        {"id": "sq", "name_vi": "Squat", "corrective_step": None, "tags": [], "category": "strength", "primary_muscles": ["quadriceps"], "image_urls": []}
    ],
    "programs": [
        {"id": "pr", "client_id": "a1", "name": "P1", "model": "linear", "status": "published", "start_date": MON}
    ],
    "phases": [
        {"id": "ph", "client_id": "a1", "program_id": "pr", "order_no": 1, "name": "Nền tảng", "weeks": 4, "start_date": MON, "end_date": D(27), "status": "published"}
    ],
    "sessions": [
        {"id": "s1", "client_id": "a1", "phase_id": "ph", "week_no": 1, "day_no": 1, "scheduled_on": D(0), "title": "Buổi chính chân", "session_type": "strength", "mode": "self"},
        {"id": "s2", "client_id": "a1", "phase_id": "ph", "week_no": 1, "day_no": 2, "scheduled_on": D(1), "title": "Buổi có corrective", "session_type": "strength", "mode": "self"},
        {"id": "s3", "client_id": "a1", "phase_id": "ph", "week_no": 1, "day_no": 3, "scheduled_on": D(2), "title": "Buổi bỏ qua", "session_type": "strength", "mode": "self"}
    ],
    "session_blocks": [
        {"id": "b1", "client_id": "a1", "session_id": "s1", "order_no": 1, "block_type": "straight", "label": "A"},
        {"id": "b2_corr", "client_id": "a1", "session_id": "s2", "order_no": 1, "block_type": "corrective", "label": "A"},
        {"id": "b2_main", "client_id": "a1", "session_id": "s2", "order_no": 2, "block_type": "straight", "label": "B"},
        {"id": "b3", "client_id": "a1", "session_id": "s3", "order_no": 1, "block_type": "straight", "label": "A"}
    ],
    "block_items": [
        {"id": "i1", "client_id": "a1", "block_id": "b1", "exercise_id": "sq", "order_no": 1, "sets": 2, "reps_min": 8, "reps_max": 10, "load_kg": 60, "progression_rule": {"type": "none"}},
        {"id": "i2_corr", "client_id": "a1", "block_id": "b2_corr", "exercise_id": "e3", "order_no": 1, "sets": 2, "reps_min": 10, "reps_max": 12, "load_kg": 0, "progression_rule": {"type": "none"}},
        {"id": "i2_main", "client_id": "a1", "block_id": "b2_main", "exercise_id": "sq", "order_no": 1, "sets": 2, "reps_min": 8, "reps_max": 10, "load_kg": 60, "progression_rule": {"type": "none"}},
        {"id": "i3", "client_id": "a1", "block_id": "b3", "exercise_id": "sq", "order_no": 1, "sets": 1, "reps_min": 5, "reps_max": 5, "load_kg": 50, "progression_rule": {"type": "none"}}
    ],
    "session_feedback": [],
    "set_logs": [],
    "alerts": []
}

B = 'http://localhost:8780/coach/'
DB = lambda pg: pg.evaluate("JSON.parse(localStorage.getItem('fakedb'))")

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

        # 1. Khách mở buổi → thẻ readiness ("Sẵn sàng chưa?")
        login(co, 'a1', '#/client/session/s1')
        co.wait_for_selector('#rdCard')
        ok('1 khách mở buổi → thẻ readiness ("Sẵn sàng chưa?")', 'Sẵn sàng chưa?' in co.inner_text('#rdCard'))

        # 2. Chọn 4 điểm → lưu đúng JSON, completed vẫn false
        # sleep: 2, soreness: 4, stress: 4, energy: 2 (readiness score: 25 -> red)
        co.click('[data-score-row="sleep"] [data-val="2"]')
        co.click('[data-score-row="soreness"] [data-val="4"]')
        co.click('[data-score-row="stress"] [data-val="4"]')
        co.click('[data-score-row="energy"] [data-val="2"]')
        co.click('#rdDone')
        co.wait_for_selector('#rdSummaryCard')

        fb1 = [x for x in DB(co).get('session_feedback', []) if x['session_id'] == 's1'][0]
        ok('2 chọn 4 điểm → lưu đúng JSON, completed vẫn false',
           fb1['completed'] is False and
           fb1['readiness']['sleep'] == 2 and
           fb1['readiness']['soreness'] == 4 and
           fb1['readiness']['stress'] == 4 and
           fb1['readiness']['energy'] == 2 and
           fb1['readiness']['score'] == 25 and
           fb1['readiness']['warmup_done'] is False)

        # 3. Level đúng màu (red, card--flag, 🔴)
        card_cls = co.get_attribute('#rdSummaryCard', 'class') or ''
        card_txt = co.inner_text('#rdSummaryCard')
        ok('3 level đúng màu', fb1['readiness']['level'] == 'red' and 'card--flag' in card_cls and '🔴' in card_txt)

        # 4. Thẻ khởi động hiện đúng bài theo OHSA mẫu
        co.wait_for_selector('#warmupCard')
        wm_txt = co.inner_text('#warmupCard')
        ok('4 thẻ khởi động hiện đúng bài theo OHSA mẫu',
           'Khởi động & chỉnh tư thế' in wm_txt and
           'Lăn foam cơ khép' in wm_txt and
           'Đi ngang với band' in wm_txt)

        # 5. Tick "Đã khởi động" lưu warmup_done
        co.click('#warmupDone')
        co.wait_for_selector('text=Đã khởi động xong ✓')
        fb1_wm = [x for x in DB(co).get('session_feedback', []) if x['session_id'] == 's1'][0]
        ok('5 tick "Đã khởi động" lưu warmup_done', fb1_wm['readiness']['warmup_done'] is True)

        # 6. Buổi có khối corrective → ẩn thẻ khởi động
        co.goto(B + '#/client/session/s2')
        co.wait_for_selector('#rdCard')
        co.click('#rdDone')
        co.wait_for_selector('#rdSummaryCard')
        ok('6 buổi có khối corrective → ẩn thẻ khởi động', len(co.query_selector_all('#warmupCard')) == 0)

        # 7. "Bỏ qua" không lưu gì
        co.goto(B + '#/client/session/s3')
        co.wait_for_selector('#rdCard')
        co.click('#rdSkip')
        co.wait_for_selector('#rdCard', state='detached')
        fbs3 = [x for x in DB(co).get('session_feedback', []) if x['session_id'] == 's3']
        ok('7 "Bỏ qua" không lưu gì', len(fbs3) == 0 and len(co.query_selector_all('#rdSummaryCard')) == 0)

        # 8. Hoàn thành buổi sau đó vẫn giữ readiness
        co.goto(B + '#/client/session/s1')
        co.wait_for_selector('#rdSummaryCard')
        co.click('[data-done]')
        co.select_option('#fin [name=rpe]', '8')
        co.click('#fin button.btn--primary')
        co.wait_for_selector('text=Tuyệt vời! Đã hoàn thành buổi tập.')
        time.sleep(1.2)
        fb1_fin = [x for x in DB(co).get('session_feedback', []) if x['session_id'] == 's1'][0]
        ok('8 hoàn thành buổi sau đó vẫn giữ readiness',
           fb1_fin['completed'] is True and
           fb1_fin['readiness']['score'] == 25 and
           fb1_fin['readiness']['warmup_done'] is True)

        # 9. Coach xem review thấy readiness
        login(co, 'c1', '#/coach/review/s1')
        co.wait_for_selector('#rv')
        rv_txt = co.inner_text('#rv')
        ok('9 coach xem review thấy readiness',
           'Readiness' in rv_txt and '25/100' in rv_txt and 'Đã khởi động ✓' in rv_txt)

        # 10. Inbox có nhãn "Readiness thấp" với buổi red
        co.goto(B + '#/coach/inbox')
        co.wait_for_selector('h1:has-text("Hộp việc")')
        co.wait_for_selector('.badge--hot:has-text("Readiness thấp")')
        inbox_txt = co.inner_text('body')
        ok('10 inbox có nhãn "Readiness thấp" với buổi red', 'Readiness thấp' in inbox_txt)

        # 11. Không tràn ngang 390 px
        w_ok = co.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
        ok('11 không tràn ngang 390 px', w_ok)

        # 12. Không lỗi JS
        if errs:
            print('JS errors:', errs)
        ok('12 không lỗi JS', len(errs) == 0)

        b.close()
finally:
    try:
        srv.terminate()
        srv.kill()
    except:
        pass

print('\n====================================')
print(f'TOTAL: {len(R)} tests | PASS: {len([x for x in R if x.startswith("PASS")])} | FAIL: {len([x for x in R if x.startswith("FAIL")])}')
print('====================================')
if any(x.startswith('FAIL') for x in R):
    sys.exit(1)
