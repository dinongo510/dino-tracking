# Chạy từ gốc repo: python tests/coach/e2e_photos.py   (cần: pip install playwright pillow && playwright install chromium)
import subprocess,time,json,os,sys,tempfile
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('DCOACH_ROOT') or os.path.abspath(os.path.join(HERE,'..','..'))
FAKE=os.environ.get('DCOACH_FAKE') or os.path.join(HERE,'fake_supabase.js')
IMG=tempfile.mkdtemp()
from PIL import Image
for n,(w,h) in {'front':(3000,4000),'side':(3000,4000),'back':(4000,3000),'sheet':(2480,3508)}.items():
    Image.effect_noise((w//4,h//4),60).convert('RGB').resize((w,h)).save(os.path.join(IMG,n+'.png'))
P=lambda n: os.path.join(IMG,n+'.png')
srv=subprocess.Popen([sys.executable,'-m','http.server','8771','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
fake=open(FAKE,encoding='utf-8').read();R=[]
def ok(n,c):R.append(('PASS' if c else 'FAIL')+' '+n)
db={"profiles":[{"id":"c1","role":"coach","full_name":"Dino","coach_id":None,"status":"active","created_at":"2026-11-01"},
 {"id":"a1","role":"client","full_name":"Khách A","coach_id":"c1","status":"active","created_at":"2026-11-20"},
 {"id":"b1","role":"client","full_name":"Khách B","coach_id":"c1","status":"active","created_at":"2026-11-20"}],
 "health_intakes":[{"id":"h1","client_id":"a1","updated_at":"2026-11-25","goal":"fat_loss","parq":{},"lifestyle":{},"diet":{}},{"id":"h2","client_id":"b1","updated_at":"2026-11-25","goal":"fat_loss","parq":{},"lifestyle":{},"diet":{}}],
 "measurements":[],"inbody_scans":[],"assessments":[],"coach_notes":[],"exercises":[],"progress_photos":[]}
B='http://localhost:8771/coach/'
def login(pg,uid,hash):
    pg.evaluate("u=>localStorage.setItem('dcoach_auth',JSON.stringify({user:{id:u}}))",uid); pg.goto('about:blank'); pg.goto(B+hash)
try:
 with sync_playwright() as p:
  b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.route('**/cdn.jsdelivr.net/**',lambda r:r.fulfill(status=200,content_type='application/javascript',body=fake))
  pg.goto(B);pg.evaluate("d=>{localStorage.clear();localStorage.setItem('fakedb',JSON.stringify(d))}",db)
  # --- Khách A tải 3 góc ---
  login(pg,'a1','#/client/body');pg.wait_for_selector('#addP')
  ok('1 khách chưa có ảnh -> hiện hướng dẫn', 'Chưa có ảnh' in pg.inner_text('#photos'))
  pg.click('#addP');pg.fill('#dp [name=taken_on]','2026-11-01')
  for k in ('front','side','back'): pg.set_input_files(f'#dp [name={k}]',P(k))
  ok('2 chọn file -> báo dung lượng gốc', 'sẽ nén' in pg.inner_text('#pv_front'))
  pg.click('#dp .btn--primary');pg.wait_for_selector('text=Đã tải 3 ảnh',timeout=20000)
  st=pg.evaluate("JSON.parse(localStorage.getItem('fakestore'))")
  sizes=[v['size'] for v in st.values()];types={v['type'] for v in st.values()}
  ok(f'3 nén 3 ảnh 12MP: {[round(s/1024) for s in sizes]} KB, mỗi ảnh <= 250 KB', len(sizes)==3 and max(sizes)<=250*1024)
  ok(f'4 định dạng WebP ({types})', types=={'image/webp'})
  ok('5 đường dẫn bắt đầu bằng client_id', all(k.startswith('a1/') for k in st))
  rows=pg.evaluate("JSON.parse(localStorage.getItem('fakedb')).progress_photos")
  ok('6 ghi 3 dòng progress_photos đúng góc', sorted(r['angle'] for r in rows)==['back','front','side'])
  ok('7 hiện 3 ảnh của ngày 01/11', pg.locator('#photos img').count()==3)
  # --- Mốc thứ 2 + so sánh ---
  pg.click('#addP');pg.fill('#dp [name=taken_on]','2026-11-26');pg.set_input_files('#dp [name=front]',P('front'))
  pg.click('#dp .btn--primary');pg.wait_for_selector('text=Đã tải 1 ảnh',timeout=20000);pg.wait_for_selector('#cmp')
  cmp=pg.locator('#cmp img').count()
  ok(f'8 có 2 mốc -> khung so sánh hiện ({cmp} ảnh: trước có cả 2 mốc, nghiêng/sau chỉ mốc đầu)', cmp==4)
  # --- Ảnh phiếu InBody ---
  pg.click('#addI');pg.fill('#di [name=weight_kg]','75,4');pg.set_input_files('#di [name=sheet]',P('sheet'))
  pg.click('#di .btn--primary');pg.wait_for_selector('text=Xem ảnh phiếu InBody',timeout=20000)
  ib=pg.evaluate("JSON.parse(localStorage.getItem('fakedb')).inbody_scans[0]")
  ok('9 InBody lưu kèm ảnh phiếu (thư mục a1/inbody/)', ib['sheet_photo_path'].startswith('a1/inbody/') and ib['weight_kg']==75.4)
  # --- Xóa ---
  n0=pg.locator('[data-del]').count();pg.locator('[data-del]').first.click();pg.wait_for_selector('text=Đã xóa ảnh')
  pg.wait_for_timeout(300);rows=pg.evaluate("JSON.parse(localStorage.getItem('fakedb')).progress_photos")
  ok(f'10 khách xóa ảnh của mình (còn {len(rows)}/4 dòng, file trong kho cũng bị xóa)', len(rows)==3 and len(pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('fakestore')))"))==4)
  # --- Coach xem ---
  login(pg,'c1','#/coach/client/a1');
  pg.wait_for_selector('#photos img')
  ok('11 coach thấy ảnh của khách A', pg.locator('#photos img').count()>=3)
  ok('12 coach không có nút xóa ảnh do khách tải', pg.locator('#photos [data-del]').count()==0)
  ok('13 coach thấy link ảnh phiếu InBody', pg.locator('text=Xem ảnh phiếu InBody').count()==1)
  # --- Khách B: không thấy, không ghi được vào thư mục của A ---
  login(pg,'b1','#/client/body');pg.wait_for_selector('#addP')
  ok('14 khách B không thấy ảnh của A', pg.locator('#photos img').count()==0)
  res=pg.evaluate("""async()=>{const m=await import('/coach/js/supabaseClient.js');const c=await m.sb();const r=await c.storage.from('progress').upload('a1/hack.webp',new Blob(['x'],{type:'image/webp'}));const s=await c.storage.from('progress').createSignedUrls(Object.keys(JSON.parse(localStorage.getItem('fakestore'))));return {up:!!r.error, leak:s.data.filter(d=>d.signedUrl).length}}""")
  ok(f'15 khách B ghi vào thư mục A bị chặn, đọc link ảnh A = {res["leak"]}', res['up'] and res['leak']==0)
  # --- File không phải ảnh ---
  bad=os.path.join(IMG,'note.txt');open(bad,'w').write('x')
  pg.click('#addP');pg.set_input_files('#dp [name=front]',bad);pg.click('#dp .btn--primary');pg.wait_for_selector('#toast:not([hidden])')
  ok('16 chọn file không phải ảnh -> báo lỗi tiếng Việt', 'không phải ảnh' in pg.inner_text('#toast'))
  ok('17 không lỗi JS', not errs); errs and print(errs[:3]); b.close()
finally: srv.terminate()
print('\n'.join(R))
