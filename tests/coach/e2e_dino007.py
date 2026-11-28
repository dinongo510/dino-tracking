# Chạy: pip install playwright && playwright install chromium
# Từ thư mục gốc repo:  python3 coach/tests/e2e_dino007.py
import subprocess,time,os,sys,tempfile
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
from playwright.sync_api import sync_playwright
tmpdir = tempfile.gettempdir()
srv=subprocess.Popen([sys.executable,'-m','http.server','8766','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
fake=open(os.path.join(os.path.dirname(__file__),'fake_supabase.js')).read();R=[]
def ok(n,c):R.append(('PASS' if c else 'FAIL')+' '+n)
try:
 with sync_playwright() as p:
  b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':844});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.route('**/cdn.jsdelivr.net/**',lambda r:r.fulfill(status=200,content_type='application/javascript',body=fake))
  B='http://localhost:8766/coach/'
  pg.goto(B);pg.wait_for_selector('[name=email]');pg.fill('[name=email]','a@x.vn');pg.fill('[name=password]','password1');pg.click('button.btn--primary')
  pg.wait_for_url('**#/client/intake');ok('1 khách mới -> wizard',True)
  # bước 1
  pg.fill('[data-k="dob"]','1995-05-10');pg.select_option('[data-k="sex"]','male');pg.fill('[data-k="height_cm"]','172');pg.fill('[data-k="measure.weight_kg"]','78,5')
  pg.click('button.btn--primary');pg.wait_for_selector('#toast:not([hidden])');ok('2 thiếu liên hệ khẩn cấp -> báo lỗi','khẩn cấp' in pg.inner_text('#toast'))
  pg.fill('[data-k="emergency_contact"]','Vợ - 091');pg.click('button.btn--primary');pg.wait_for_selector('text=Bước 2/5')
  # thoát giữa chừng rồi vào lại
  pg.goto(B+'#/client');pg.wait_for_selector('text=Bước 2/5');ok('3 thoát giữa chừng -> tiếp tục bước 2',True)
  pg.fill('[data-k="active_days_60min"]','1');pg.select_option('[data-k="lifestyle.experience"]','none')
  pg.eval_on_selector('[data-k="goal_ratings.fat_loss"]',"e=>{e.value=9;e.dispatchEvent(new Event('input'))}")
  pg.click('button.btn--primary');pg.wait_for_selector('text=Bước 3/5')
  pg.click('input[data-k="diet.sugar"][value=high]');pg.click('button.btn--primary');pg.wait_for_selector('text=Bước 4/5')
  pg.click('input[data-k="lifestyle.job_sitting"][value=yes]');pg.click('button.btn--primary');pg.wait_for_selector('text=Bước 5/5')
  for i in range(1,8): pg.click(f'input[data-k="parq.q{i}"][value={"yes" if i==6 else "no"}]')
  pg.click('button.btn--primary');pg.wait_for_selector('text=Cảm ơn bạn');ok('4 có câu Có -> thông báo coach liên hệ','24 giờ' in pg.inner_text('main'))
  pg.click('text=Về trang chính');pg.wait_for_selector('text=Hôm nay');ok('5 hoàn thành -> vào trang chính',True)
  pg.click('.tabbar a[href="#/client/body"]');pg.wait_for_selector('text=Số đo');ok('6 cân từ wizard có trong Số đo','78.5' in pg.inner_text('main'))
  pg.click('#addM');pg.fill('#dm [name=weight_kg]','77');pg.fill('#dm [name=waist_cm]','88');pg.click('#dm .btn--primary');pg.wait_for_selector('text=▼1.5')
  ok('7 thêm số đo, hiện chênh lệch ▼1.5',True)
  pg.click('.tabbar >> text=Hồ sơ');pg.wait_for_selector('text=Hồ sơ của bạn');ok('8 xem hồ sơ','Vợ - 091' in pg.inner_text('main'))
  pg.screenshot(path=os.path.join(tmpdir, 'dino007_client_body.png'),full_page=False)
  pg.evaluate("localStorage.removeItem('dcoach_auth')");pg.goto(B+'#/login');pg.wait_for_selector('[name=email]')
  pg.fill('[name=email]','coach@x.vn');pg.fill('[name=password]','password1');pg.click('button.btn--primary');pg.wait_for_selector('.list')
  pg.click('text=Khách A');pg.wait_for_selector('text=Tóm tắt')
  t=pg.inner_text('main');ok('9 coach thấy cờ đỏ','Cờ đỏ' in t);ok('10 mục tiêu suy ra Giảm mỡ','Giảm mỡ' in t)
  ok('11 gợi ý: ngồi lâu + đường cao + mới tập','Ngồi lâu' in t and 'bữa phụ' in t and 'Mới tập' in t)
  ok('12 hệ số vận động 1.375','1.375' in t)
  pg.fill('#nf textarea','khách hay đau gối');pg.click('#nf button');pg.wait_for_selector('#toast:not([hidden])')
  pg.check('#of [name=knees_in]');pg.click('#of .btn--primary');pg.wait_for_selector('text=Gợi ý corrective')
  t=pg.inner_text('#corr');ok('13 OHSA gối đổ vào -> bài corrective','Lăn foam cơ khép' in t and 'Mông nhỡ' in t)
  pg.screenshot(path=os.path.join(tmpdir, 'dino007_coach_client.png'),full_page=True)
  # khách không thấy ghi chú nội bộ
  pg.evaluate("localStorage.setItem('dcoach_auth',JSON.stringify({user:{id:'a1'}}))");pg.reload();pg.wait_for_url('**#/client');pg.goto(B+'#/client/profile');pg.wait_for_selector('text=Hồ sơ của bạn')
  ok('14 khách không thấy ghi chú nội bộ','đau gối' not in pg.inner_text('main'))
  ok('15 không lỗi JS',not errs);print(errs[:3]);b.close()
finally: srv.terminate()
print('\n'.join(R))
