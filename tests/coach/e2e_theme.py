# DINO-011b — Chạy từ gốc repo: python tests/coach/e2e_theme.py
import subprocess,time,os,sys,datetime
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('DCOACH_ROOT') or os.path.abspath(os.path.join(HERE,'..','..'))
FAKE=os.environ.get('DCOACH_FAKE') or os.path.join(HERE,'fake_supabase.js')
srv=subprocess.Popen([sys.executable,'-m','http.server','8776','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
fake=open(FAKE,encoding='utf-8').read();R=[]
def ok(n,c):R.append(('PASS' if c else 'FAIL')+' '+n)
T=datetime.date.today();D=lambda n:(T+datetime.timedelta(days=n)).isoformat();MON=T-datetime.timedelta(days=T.weekday())
A='a1'
def S(i,date,title): return {"id":i,"client_id":A,"phase_id":"ph1","week_no":1,"day_no":datetime.date.fromisoformat(date).weekday()+1,"scheduled_on":date,"title":title,"session_type":"strength"}
sess=[S("today",D(0),"Buổi nay"),S("next",D(2),"Buổi tới")]
missed = T.weekday()>0
if missed: sess.append(S("miss",D(-1),"Buổi lỡ"))
db={"profiles":[{"id":"c1","role":"coach","full_name":"Ngô Đức Anh","coach_id":None,"status":"active","created_at":"2026-11-01"},{"id":A,"role":"client","full_name":"Khách A","coach_id":"c1","status":"active","created_at":"2026-11-20"}],
 "health_intakes":[{"id":"h1","client_id":A,"updated_at":"2026-11-25","parq":{},"lifestyle":{},"diet":{}}],"exercises":[{"id":"sq","name_vi":"Squat","category":"strength","tags":[],"image_urls":[]}],
 "programs":[{"id":"pr1","client_id":A,"name":"P","model":"linear","status":"published","start_date":MON.isoformat()}],
 "phases":[{"id":"ph1","client_id":A,"program_id":"pr1","order_no":1,"name":"G1","weeks":4,"start_date":MON.isoformat(),"end_date":D(30),"status":"published"}],
 "sessions":sess,"session_blocks":[{"id":"b1","client_id":A,"session_id":"today","order_no":1,"block_type":"straight"}],
 "block_items":[{"id":"i1","client_id":A,"block_id":"b1","exercise_id":"sq","order_no":1,"sets":3,"reps_min":8,"reps_max":10,"progression_rule":{"type":"none"}}],
 "measurements":[{"id":"m1","client_id":A,"measured_on":D(-8),"weight_kg":70},{"id":"m2","client_id":A,"measured_on":D(-1),"weight_kg":69.5}],
 "messages":[{"id":"mm","client_id":A,"context_type":"session","context_id":"today","author_id":"c1","body":"Nhớ khởi động kỹ","created_at":D(0)+"T01:00:00Z"}]}
B='http://localhost:8776/coach/'
def login(pg,uid,hash):
    if not pg.url.startswith('http'): pg.goto(B+'#/login')
    pg.evaluate("u=>{sessionStorage.clear();sessionStorage.setItem('fake_tab_auth',JSON.stringify({user:{id:u}}))}",uid); pg.goto(B+'#/'); pg.goto(B+hash)
H=lambda pg: pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--h').trim()")
try:
 with sync_playwright() as p:
  b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':844});errs=[]
  ctx.route('**/cdn.jsdelivr.net/**',lambda r:r.fulfill(status=200,content_type='application/javascript',body=fake))
  ctx.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(status=200,content_type='text/css',body=''))
  pg=ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.goto(B);pg.evaluate("d=>{localStorage.clear();localStorage.setItem('fakedb',JSON.stringify(d))}",db)
  pg.goto(B+'#/login');pg.wait_for_selector('img[src="/coach/icons/logo-full.png"][alt="DINOMET"]')
  ok('0 trang login: có logo DINOMET logo-full.png', pg.locator('img[src="/coach/icons/logo-full.png"][alt="DINOMET"]').count()==1)
  mf=pg.evaluate("fetch('/coach/manifest.json').then(r=>r.json())")
  ok('0b manifest có tên DINOMET và 3 icons', mf.get('name')=='DINOMET' and len(mf.get('icons',[]))==3)
  login(pg,A,'#/client');pg.wait_for_selector('main .card--hi')
  t=pg.inner_text('main .card--hi')
  ok('1 Hôm nay: BUỔI HÔM NAY "Buổi nay" + nút Bắt đầu tập', 'BUỔI HÔM NAY' in t and 'Buổi nay' in t and 'Bắt đầu tập' in t)
  ok('2 nhắc tập bù buổi lỡ trong tuần' if missed else '2 (thứ Hai: không có buổi lỡ)', ('Tập bù "Buổi lỡ"' in t) if missed else ('Tập bù' not in t))
  m=pg.inner_text('main')
  ok('3 cân TB tuần 69,5 ↓ 0,5 kg + tin coach', '69,5' in m and '↓ 0,5 kg' in m and 'Nhớ khởi động kỹ' in m)
  wv=pg.evaluate("[...document.querySelectorAll('.tabbar .tab-label')].map(e=>[e.closest('a').hasAttribute('aria-current'), e.getBoundingClientRect().width, e.textContent])")
  ok('4 thanh tab: 5 biểu tượng, tab đang chọn là Hôm nay', pg.locator('.tabbar a svg').count()==5 and [x[2] for x in wv if x[0]]==['Hôm nay'])
  ok('5 màu mặc định --h = 355', H(pg)=='355')
  ok('5b logo-mark hiện ở đầu trang Hôm nay khách', pg.locator('img[src="/coach/icons/logo-mark.png"]').count()>=1)
  # hoàn thành buổi hôm nay → buổi lỡ thành TẬP BÙ, hoặc buổi tới thành BUỔI KẾ TIẾP
  pg.evaluate("()=>{const d=JSON.parse(localStorage.getItem('fakedb'));d.session_feedback=[{id:'f1',client_id:'a1',session_id:'today',completed:true}];localStorage.setItem('fakedb',JSON.stringify(d))}")
  pg.reload();pg.wait_for_selector('main .card--hi')
  t=pg.inner_text('main .card--hi')
  ok('6 xong buổi hôm nay → ' + ('TẬP BÙ "Buổi lỡ"' if missed else 'BUỔI KẾ TIẾP "Buổi tới"'), ('TẬP BÙ' in t and 'Buổi lỡ' in t and 'đã xong ✓' in t) if missed else ('BUỔI KẾ TIẾP' in t and 'Buổi tới' in t and 'Xem trước' in t))
  # chọn màu ở Hồ sơ
  pg.click('.tabbar a[href="#/client/profile"]');pg.wait_for_selector('#themePick')
  pg.click('#themePick [data-hue="217"]')
  ok('7 bấm màu Xanh dương → --h 217, lưu dcoach_hue, nút được đánh dấu', H(pg)=='217' and pg.evaluate("localStorage.getItem('dcoach_hue')")=='217' and pg.get_attribute('#themePick [data-hue="217"]','aria-pressed')=='true')
  pg.fill('#themePick .hue-range','300');pg.dispatch_event('#themePick .hue-range','change')
  ok('8 kéo thanh màu → --h 300', H(pg)=='300' and pg.evaluate("localStorage.getItem('dcoach_hue')")=='300')
  pg.reload();pg.wait_for_selector('#themePick')
  ok('9 tải lại vẫn giữ màu 300 (áp trước khi vẽ)', H(pg)=='300')
  a1=pg.evaluate("getComputedStyle(document.querySelector('.tabbar a[aria-current]')).backgroundImage")
  ok('10 tab đang chọn dùng gradient theo màu mới (không có nền đặc)', a1.count('gradient')>=2 and 'hsl(300' in a1.replace(' ','') or 'rgb' in a1)
  # coach chọn màu trong menu tài khoản góc trên
  co=ctx.new_page();co.on('pageerror',lambda e:errs.append('coach '+str(e)));login(co,'c1','#/coach');co.wait_for_selector('#btnAvatar')
  co.click('#btnAvatar');co.wait_for_selector('#themePick')
  ok('11 menu tài khoản coach có khối chọn màu, dùng chung màu trên máy, 6 swatch', H(co)=='300' and co.locator('#themePick .swatch').count()==6)
  ok('11b logo-mark hiện ở đầu trang chủ coach', co.locator('img[src="/coach/icons/logo-mark.png"]').count()>=1)
  ok('12 không lỗi JS', not errs)
  if errs: print(errs[:3])
  b.close()
except Exception as e:
  print('EXC',str(e)[:400])
finally:
  srv.terminate()
print('\n'.join(R));print(f"{sum(r.startswith('PASS') for r in R)}/{len(R)} PASS")
