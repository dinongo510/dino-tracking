# DINO-017 — Chạy từ gốc repo: python tests/coach/e2e_adhoc.py
import subprocess, time, os, sys, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.environ.get('DCOACH_ROOT') or os.path.abspath(os.path.join(HERE, '..', '..'))
FAKE = os.environ.get('DCOACH_FAKE') or os.path.join(HERE, 'fake_supabase.js')

srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8782', '-d', ROOT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)

fake = open(FAKE, encoding='utf-8').read()
R = []
def ok(name, cond):
    R.append(('PASS' if cond else 'FAIL') + ' ' + name)

T = datetime.date.today()
D = lambda n: (T + datetime.timedelta(days=n)).isoformat()
MON = (T - datetime.timedelta(days=T.weekday())).isoformat()

prof = lambda i, n, role='client': {
    "id": i, "role": role, "full_name": n,
    "coach_id": None if role == 'coach' else 'c1',
    "status": "active", "coach_mode": "online", "created_at": "2026-10-01"
}

db = {
    "profiles": [prof('c1', 'Dino Coach', role='coach'), prof('a1', 'Khách A'), prof('b1', 'Khách B')],
    "health_intakes": [
        {"id": "h_c1", "client_id": "c1", "updated_at": "2026-11-25", "parq": {}, "lifestyle": {}, "diet": {}},
        {"id": "h_a1", "client_id": "a1", "updated_at": "2026-11-25", "parq": {}, "lifestyle": {}, "diet": {}},
        {"id": "h_b1", "client_id": "b1", "updated_at": "2026-11-25", "parq": {}, "lifestyle": {}, "diet": {}},
    ],
    "exercises": [
        {"id": "sq", "name_vi": "Squat", "category": "strength", "primary_muscles": ["quadriceps"], "secondary_muscles": ["glutes"], "tags": [], "image_urls": []},
        {"id": "run", "name_vi": "Chạy ngoài trời", "category": "run", "primary_muscles": ["quadriceps", "calves"], "secondary_muscles": ["hamstrings"], "tags": [], "image_urls": []},
    ],
    "programs": [{"id": "pr_a", "client_id": "a1", "name": "Giáo án A", "model": "linear", "status": "published", "start_date": MON}],
    "phases": [{"id": "ph_a", "client_id": "a1", "program_id": "pr_a", "order_no": 1, "name": "GĐ 1", "weeks": 4, "start_date": MON, "end_date": D(27), "status": "published"}],
    "sessions": [
        {"id": "s_a1", "client_id": "a1", "phase_id": "ph_a", "week_no": 1, "day_no": T.weekday() + 1, "scheduled_on": D(0), "title": "Buổi chính A", "session_type": "strength", "mode": "self", "adhoc": False}
    ],
    "session_blocks": [
        {"id": "b_a1", "client_id": "a1", "session_id": "s_a1", "order_no": 1, "block_type": "straight"}
    ],
    "block_items": [
        {"id": "i_a1", "client_id": "a1", "block_id": "b_a1", "exercise_id": "sq", "order_no": 1, "sets": 3, "reps_min": 8, "reps_max": 10, "load_kg": 70, "progression_rule": {"type": "none"}}
    ],
    "set_logs": [
        {"id": "l_a1", "client_id": "a1", "block_item_id": "i_a1", "set_no": 1, "reps": 10, "load_kg": 70, "done": True, "logged_at": D(0) + "T08:00:00Z"}
    ],
    "session_feedback": [
        {"id": "fb_a1", "client_id": "a1", "session_id": "s_a1", "completed": True, "session_rpe": 8, "coach_reviewed": True}
    ],
    "packages": [
        {"id": "p_a1", "client_id": "a1", "name": "Gói 10 buổi PT", "total_sessions": 10, "start_date": D(-5), "end_date": D(60), "price_vnd": 5000000, "paid_vnd": 5000000, "status": "active", "created_at": D(-5)}
    ],
    "package_uses": []
}

B = 'http://localhost:8782/coach/'
DB = lambda pg: pg.evaluate("JSON.parse(localStorage.getItem('fakedb'))")

def login(pg, uid, hash_path):
    if not pg.url.startswith('http'):
        pg.goto(B + '#/login')
    pg.evaluate("u => { sessionStorage.clear(); localStorage.setItem('dcoach_auth', JSON.stringify({user: {id: u}})); sessionStorage.setItem('fake_tab_auth', JSON.stringify({user: {id: u}})) }", uid)
    pg.goto(B + '#/')
    pg.goto(B + hash_path)

try:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 390, 'height': 844})
        errs = []
        ctx.route('**/cdn.jsdelivr.net/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=fake))
        ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('dialog', lambda d: d.accept())

        pg.goto(B)
        pg.evaluate("d => { localStorage.clear(); localStorage.setItem('fakedb', JSON.stringify(d)) }", db)

        # -----------------------------------------------------------------
        # 1. Khách B chưa có giáo án -> Hôm nay có nút "+ Buổi tự do"
        # -----------------------------------------------------------------
        login(pg, 'b1', '#/client')
        pg.wait_for_selector('#btnNewAdhoc')
        ok('1 Khách B chưa có giáo án thấy nút + Buổi tự do trên Hôm nay', pg.is_visible('#btnNewAdhoc'))

        # Lịch tập cũng có nút + Buổi tự do
        pg.goto(B + '#/client/plan')
        pg.wait_for_selector('a[href="#/client/adhoc/new"]')
        ok('2 Lịch tập của Khách B có nút + Buổi tự do', pg.is_visible('a[href="#/client/adhoc/new"]'))

        # -----------------------------------------------------------------
        # 2. Tạo nhanh buổi tự do 2 bài (1 tạ, 1 chạy)
        # -----------------------------------------------------------------
        pg.click('a[href="#/client/adhoc/new"]')
        pg.wait_for_selector('#adhocForm')
        ok('3 Mở màn hình tạo buổi ngoài lịch #/client/adhoc/new', '#/client/adhoc/new' in pg.url)

        # Thêm bài Squat
        pg.fill('#exSearch', 'squat')
        pg.wait_for_selector('[data-add-ex="sq"]')
        pg.click('[data-add-ex="sq"]')

        # Thêm bài Chạy ngoài trời
        pg.fill('#exSearch', 'chay')
        pg.wait_for_selector('[data-add-ex="run"]')
        pg.click('[data-add-ex="run"]')

        # Nhập thông số bài tập
        pg.wait_for_selector('#selectedBox [data-idx="0"]')
        pg.fill('#selectedBox [data-idx="0"] input[data-k="load_kg"]', '80')
        pg.fill('#selectedBox [data-idx="1"] input[data-k="distance_m"]', '5000')
        pg.fill('#selectedBox [data-idx="1"] input[data-k="duration"]', '25:00')

        # Bấm lưu buổi tập -> chuyển sang phiếu ghi
        pg.click('#adhocForm button[type="submit"]')
        pg.wait_for_selector('#log')
        curr_url = pg.url
        ok('4 Lưu buổi tự do thành công và chuyển thẳng sang phiếu ghi #/client/session/:id', '#/client/session/' in curr_url)

        # Lấy session ID vừa tạo
        b_sess_id = curr_url.split('/session/')[1].split('?')[0]
        s_row = [x for x in DB(pg)['sessions'] if x['id'] == b_sess_id][0]
        ok('5 Session ngoài lịch có adhoc=true, phase_id=null, week_no=0', s_row['adhoc'] is True and s_row.get('phase_id') is None and s_row['week_no'] == 0)

        # -----------------------------------------------------------------
        # 3. Phiếu ghi mở -> tick hiệp + hoàn thành
        # -----------------------------------------------------------------
        # Tick hoàn thành các hiệp
        done_btns = pg.query_selector_all('[data-done]')
        for b_el in done_btns:
            b_el.click()
            time.sleep(0.05)

        # Hoàn thành buổi
        pg.select_option('#fin select[name="rpe"]', '8')
        pg.click('#fin button.btn--primary')
        pg.wait_for_selector('text=Đã hoàn thành buổi tập.')
        time.sleep(1)

        # -----------------------------------------------------------------
        # 4. Coach thấy trong Hộp việc "Buổi tự tập ngoài lịch", bấm "Đã xem" thì mất
        # -----------------------------------------------------------------
        login(pg, 'c1', '#/coach/inbox')
        pg.wait_for_selector('text=Buổi tự tập ngoài lịch')
        ok('6 Coach thấy mục Buổi tự tập ngoài lịch trong Hộp việc', pg.is_visible('text=Buổi tự tập ngoài lịch'))

        # Bấm vào buổi tự tập ngoài lịch -> mở review
        pg.click(f'a[href="#/coach/review/{b_sess_id}"]')
        pg.wait_for_selector('#rv')
        ok('7 Trang review có nhãn Ngoài lịch', 'Ngoài lịch' in pg.inner_text('#rv'))

        # Bấm nút "Đã xem"
        pg.click('#seen')
        pg.wait_for_selector('text=Đã đánh dấu xem.')
        time.sleep(0.5)

        # Quay lại Hộp việc -> mục biến mất
        pg.goto(B + '#/coach/inbox')
        time.sleep(0.5)
        ok('8 Bấm Đã xem xong thì buổi ngoài lịch không còn trong Hộp việc', not pg.is_visible('text=Buổi tự tập ngoài lịch'))

        # -----------------------------------------------------------------
        # 5. % tập 7 ngày không đổi vì buổi tự do
        # -----------------------------------------------------------------
        # Khách A có 1 buổi giáo án hoàn thành -> 100%
        login(pg, 'a1', '#/client')
        pg.wait_for_selector('text=Tập 7 ngày')
        t7 = pg.inner_text('.card:has-text("Tập 7 ngày")')
        ok('9 Khách A có 100% tập 7 ngày', '100%' in t7)

        # Khách A tạo thêm 1 buổi tự do chưa hoàn thành
        pg.goto(B + '#/client/adhoc/new')
        pg.wait_for_selector('#adhocForm')
        pg.fill('#exSearch', 'squat')
        pg.wait_for_selector('[data-add-ex="sq"]')
        pg.click('[data-add-ex="sq"]')
        pg.click('#adhocForm button[type="submit"]')
        pg.wait_for_selector('#log')

        # Quay lại trang Hôm nay -> % tập 7 ngày vẫn phải là 100% (không bị kéo xuống 50% vì buổi tự do)
        pg.goto(B + '#/client')
        pg.wait_for_selector('text=Tập 7 ngày')
        t7_after = pg.inner_text('.card:has-text("Tập 7 ngày")')
        ok('10 Buổi ngoài lịch không làm giảm % tuân thủ 7 ngày (vẫn 100%)', '100%' in t7_after)

        # Kiểm tra thẻ riêng "BUỔI TỰ DO HÔM NAY" trên Hôm nay
        ok('11 Thẻ riêng BUỔI TỰ DO HÔM NAY hiển thị trên trang Hôm nay', pg.is_visible('text=BUỔI TỰ DO HÔM NAY'))

        # -----------------------------------------------------------------
        # 6. PR / sơ đồ cơ có bài vừa tập từ buổi ngoài lịch của Khách B
        # -----------------------------------------------------------------
        login(pg, 'b1', '#/client/dash')
        pg.wait_for_selector('#bodymapContainer')
        dash_text = pg.inner_text('body')
        ok('12 Dashboard của Khách B hiển thị PR 1RM Squat hoặc Chạy từ buổi tự do', 'Squat' in dash_text or 'Chạy' in dash_text)

        # -----------------------------------------------------------------
        # 7. Khách sửa / xóa buổi tự do chưa hoàn thành
        # -----------------------------------------------------------------
        login(pg, 'a1', '#/client/plan')
        pg.wait_for_selector('a[href*="#/client/adhoc/"][href*="/edit"]')
        edit_href = pg.get_attribute('a[href*="#/client/adhoc/"][href*="/edit"]', 'href')

        pg.goto(B + edit_href)
        pg.wait_for_selector('#btnDelete')
        pg.fill('input[name="title"]', 'Buổi tự do đã sửa tên')
        pg.click('button[type="submit"]')
        pg.wait_for_selector('#log')
        ok('13 Khách sửa tên buổi tự do thành công', 'Buổi tự do đã sửa tên' in pg.inner_text('#log'))

        # Bấm xóa buổi
        pg.goto(B + edit_href)
        pg.wait_for_selector('#btnDelete')
        pg.click('#btnDelete')
        pg.wait_for_selector('text=Đã xóa buổi tập ngoài lịch.')
        time.sleep(0.5)
        ok('14 Khách xóa buổi tự do chưa hoàn thành thành công', 'Buổi tự do đã sửa tên' not in pg.inner_text('body'))

        # -----------------------------------------------------------------
        # 8. Bảo mật: Khách không tạo được buổi PT / không sửa buổi giáo án
        # -----------------------------------------------------------------
        rls_pt_fail = pg.evaluate("""async () => {
          const { sb } = await import('./js/supabaseClient.js');
          const db = await sb();
          const { data, error } = await db.from('sessions').insert({
            client_id: 'b1', adhoc: true, mode: 'pt', week_no: 0, day_no: 1, scheduled_on: '2026-11-28', title: 'Gian lận PT'
          });
          return !!error;
        }""")
        ok('15 RLS: Khách cố tạo buổi ngoài lịch mode=pt bị chặn', rls_pt_fail is True)

        rls_edit_phase_fail = pg.evaluate("""async () => {
          const { sb } = await import('./js/supabaseClient.js');
          const db = await sb();
          const { data, error } = await db.from('sessions').update({ title: 'Hack giáo án' }).eq('id', 's_a1');
          return !!error;
        }""")
        ok('16 RLS: Khách cố sửa buổi giáo án bị chặn', rls_edit_phase_fail is True)

        # -----------------------------------------------------------------
        # 9. Coach tạo buổi ngoài lịch PT cho khách -> hoàn thành trừ 1 buổi gói
        # -----------------------------------------------------------------
        login(pg, 'c1', f'#/client/adhoc/new?client=a1&mode=pt')
        pg.wait_for_selector('#adhocForm')
        pg.fill('#exSearch', 'squat')
        pg.wait_for_selector('[data-add-ex="sq"]')
        pg.click('[data-add-ex="sq"]')
        pg.click('#adhocForm button[type="submit"]')
        pg.wait_for_selector('#log')
        coach_pt_sid = pg.url.split('/session/')[1].split('?')[0]
        ok('17 Coach tạo buổi PT ngoài lịch cho khách thành công', '#/client/session/' in pg.url)

        # Coach hoàn thành buổi PT tại chỗ
        pg.wait_for_selector('#fin button.btn--primary')
        pg.click('[data-done]') # tick 1 set
        pg.select_option('#fin select[name="rpe"]', '8')
        pg.click('#fin button.btn--primary')
        pg.wait_for_selector('text=Đã lưu và trừ 1 buổi')
        time.sleep(1)

        # Kiểm tra package_uses đã có bản ghi trừ gói
        uses = DB(pg)['package_uses']
        pt_use = [u for u in uses if u.get('session_id') == coach_pt_sid]
        ok('18 Hoàn thành buổi PT ngoài lịch tự động trừ 1 buổi trong gói', len(pt_use) == 1 and pt_use[0]['client_id'] == 'a1')

        # -----------------------------------------------------------------
        # 10. Kiểm tra tràn ngang và lỗi console JS
        # -----------------------------------------------------------------
        no_overflow = pg.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        ok('19 Giao diện không tràn ngang 390 px', no_overflow is True)
        ok('20 Không có lỗi JavaScript console', len(errs) == 0)

        b.close()

finally:
    srv.terminate()

print("\n--- KẾT QUẢ E2E ADHOC ---")
for r in R:
    print(r)
failed = [r for r in R if r.startswith('FAIL')]
if failed or errs:
    print(f"\n{len(failed)} FAILED checks! Errors: {errs}")
    sys.exit(1)
else:
    print(f"\nTẤT CẢ {len(R)}/{len(R)} CHECKS ĐÃ PASS!")
