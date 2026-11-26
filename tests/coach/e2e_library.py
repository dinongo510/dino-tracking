# Chạy từ gốc repo: python tests/coach/e2e_library.py
import subprocess,time,json,os,sys
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('DCOACH_ROOT') or os.path.abspath(os.path.join(HERE,'..','..'))
FAKE=os.environ.get('DCOACH_FAKE') or os.path.join(HERE,'fake_supabase.js')
srv=subprocess.Popen([sys.executable,'-m','http.server','8772','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
fake=open(FAKE,encoding='utf-8').read();R=[]
def ok(n,c):R.append(('PASS' if c else 'FAIL')+' '+n)
IMG='data:image/svg+xml,'+'%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22/%3E'
ex=[{"id":"e1","name_vi":"Đẩy ngực tạ đòn","name_en":"Barbell Bench Press - Medium Grip","category":"strength","primary_muscles":["chest"],"equipment":["barbell"],"tags":["dino_core"],"featured":False,"image_urls":[IMG,IMG],"cues":"Bả vai khép","video_url":"https://www.youtube.com/results?search_query=bench"},
 {"id":"e2","name_vi":"Squat tạ đòn sau lưng","name_en":"Barbell Full Squat","category":"strength","primary_muscles":["quadriceps"],"equipment":["barbell"],"tags":[],"featured":True,"image_urls":[IMG,IMG]},
 {"id":"e3","name_vi":"Đi ngang với band","name_en":"Tube Walking (Lateral)","category":"corrective","corrective_step":"activate","primary_muscles":[],"equipment":[],"tags":["corrective","ohsa:knees_in"],"featured":False,"image_urls":[]},
 {"id":"e4","name_vi":"Kéo sled 50 m","name_en":"Sled Pull","category":"hyrox","primary_muscles":[],"equipment":["sled"],"tags":["hyrox"],"featured":False,"image_urls":[]}]
for i in range(60): ex.append({"id":f"x{i}","name_vi":f"Bài phụ {i:02d}","name_en":f"Extra {i}","category":"strength","primary_muscles":["biceps"],"equipment":["dumbbell"],"tags":[],"featured":False,"image_urls":[]})
db={"profiles":[{"id":"c1","role":"coach","full_name":"Dino","coach_id":None,"status":"active","created_at":"2026-11-01"},{"id":"a1","role":"client","full_name":"Khách A","coach_id":"c1","status":"active","created_at":"2026-11-20"}],
 "health_intakes":[{"id":"h1","client_id":"a1","updated_at":"2026-11-25","goal":"fat_loss","parq":{},"lifestyle":{},"diet":{}}],"exercises":ex}
B='http://localhost:8772/coach/'
def login(pg,uid,hash):
    pg.evaluate("u=>{localStorage.setItem('dcoach_auth',JSON.stringify({user:{id:u}}));sessionStorage.clear()}",uid); pg.goto('about:blank'); pg.goto(B+hash)
try:
 with sync_playwright() as p:
  b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.route('**/cdn.jsdelivr.net/**',lambda r:r.fulfill(status=200,content_type='application/javascript',body=fake))
  pg.goto(B);pg.evaluate("d=>{localStorage.clear();localStorage.setItem('fakedb',JSON.stringify(d))}",db)
  login(pg,'c1','#/coach');pg.wait_for_selector('.tabbar a:has-text("Thư viện")')
  ok('1 tab Thư viện đã bật', pg.get_attribute('.tabbar a:has-text("Thư viện")','aria-disabled') is None)
  pg.click('.tabbar a:has-text("Thư viện")');pg.wait_for_selector('#ls li')
  ok(f'2 hiện 40 bài đầu + nút Xem thêm ({pg.locator("#ls li").count()})', pg.locator('#ls li').count()==40 and pg.is_visible('#more'))
  ok('3 bài hay dùng ★ đứng đầu', pg.inner_text('#ls li >> nth=0').startswith('★ Squat'))
  t0=time.time();pg.fill('#q','day nguc');pg.wait_for_function("document.querySelectorAll('#ls li').length===1");dt=time.time()-t0
  ok(f'4 gõ không dấu "day nguc" -> Đẩy ngực tạ đòn ({dt*1000:.0f} ms)', 'Đẩy ngực tạ đòn' in pg.inner_text('#ls') and dt<1)
  pg.fill('#q','');pg.select_option('#ft','ohsa:');pg.wait_for_function("document.querySelectorAll('#ls li').length===1")
  ok('5 lọc nhãn Corrective theo OHSA', 'Đi ngang với band' in pg.inner_text('#ls'))
  pg.select_option('#ft','');pg.select_option('#fc','hyrox');ok('6 lọc nhóm HYROX', pg.locator('#ls li').count()==1 and 'Kéo sled' in pg.inner_text('#ls'))
  pg.select_option('#fc','')
  # Sửa bài: thêm video thật + bật ★
  pg.fill('#q','bench');pg.wait_for_function("document.querySelectorAll('#ls li').length===1");pg.click('[data-edit=e1]')
  pg.fill('#ef [name=video_url]','https://youtu.be/dQw4w9WgXcQ');pg.check('#ef [name=featured]');pg.click('#ef .btn--primary');pg.wait_for_selector('text=Đã lưu bài.')
  e1=[e for e in pg.evaluate("JSON.parse(localStorage.getItem('fakedb')).exercises") if e['id']=='e1'][0]
  ok('7 sửa bài: lưu video + ★', e1['video_url']=='https://youtu.be/dQw4w9WgXcQ' and e1['featured'] is True)
  # Chi tiết bài: ảnh + video nhúng
  pg.click('#ls a[href="#/exercise/e1"]');pg.wait_for_selector('h1:has-text("Đẩy ngực")')
  ok('8 chi tiết: 2 ảnh + video YouTube nhúng', pg.locator('main img').count()==2 and 'youtube-nocookie.com/embed/dQw4w9WgXcQ' in (pg.get_attribute('main iframe','src') or ''))
  ok('9 coach thấy link "Sửa bài này"', pg.locator('text=Sửa bài này').count()==1)
  # Thêm bài mới
  pg.goto(B+'#/coach/library');pg.wait_for_selector('#add');pg.click('#add');pg.fill('#ef [name=name_vi]','Chèo landmine');pg.fill('#ef [name=primary_muscles]','middle back, lats');pg.click('#ef .btn--primary');pg.wait_for_selector('text=Đã thêm bài.')
  new=[e for e in pg.evaluate("JSON.parse(localStorage.getItem('fakedb')).exercises") if e['name_vi']=='Chèo landmine']
  ok('10 thêm bài mới (is_custom, cơ chính tách đúng)', len(new)==1 and new[0]['is_custom'] and new[0]['primary_muscles']==['middle back','lats'])
  # Dán danh sách
  pg.click('#imp');pg.fill('#it','name_en;name_vi;video_url;cues\nbarbell full squat;Squat sau lưng;https://youtu.be/abc12345678;Gối theo mũi chân\nKettlebell Halo;Xoay tạ ấm quanh đầu;;\nFace Pull;;youtube.com/x;\n')
  pg.click('#ip');t=pg.inner_text('#ipv')
  ok('11 xem trước: 1 cập nhật · 1 mới · 1 lỗi', '1 bài cập nhật' in t and '1 bài mới' in t and '1 dòng lỗi' in t)
  pg.click('#isave');pg.wait_for_selector('text=Đã lưu 2 bài.')
  dbx=pg.evaluate("JSON.parse(localStorage.getItem('fakedb')).exercises")
  sq=[e for e in dbx if e['id']=='e2'][0]; kb=[e for e in dbx if e['name_vi']=='Xoay tạ ấm quanh đầu']
  ok('12 dán danh sách: cập nhật tên/video/cue + tạo bài mới ★', sq['name_vi']=='Squat sau lưng' and sq['video_url'].endswith('abc12345678') and sq['cues']=='Gối theo mũi chân' and len(kb)==1 and kb[0]['featured'])
  # Khách
  login(pg,'a1','#/coach/library');pg.wait_for_url('**#/client')
  ok('13 khách gõ #/coach/library -> bị đẩy về', pg.url.endswith('#/client'))
  pg.goto(B+'#/exercise/e1');pg.wait_for_selector('h1:has-text("Đẩy ngực")')
  ok('14 khách xem được chi tiết bài, không có link Sửa', pg.locator('text=Sửa bài này').count()==0)
  res=pg.evaluate("async()=>{const m=await import('/coach/js/supabaseClient.js');const c=await m.sb();const r=await c.from('exercises').update({name_vi:'hack'}).eq('id','e1');return !!r.error}")
  ok('15 khách gọi API sửa bài -> bị chặn', res)
  ok('16 không lỗi JS', not errs); errs and print(errs[:3]); b.close()
finally: srv.terminate()
print('\n'.join(R))
