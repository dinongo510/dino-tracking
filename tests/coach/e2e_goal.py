# Chạy từ gốc repo: python tests/coach/e2e_goal.py
import subprocess,time,json,os,sys
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
from playwright.sync_api import sync_playwright
srv=subprocess.Popen([sys.executable,'-m','http.server','8769','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
fake=open(os.path.join(os.path.dirname(__file__),'fake_supabase.js'),encoding='utf-8').read()
db={"profiles":[{"id":"c1","role":"coach","full_name":"Dino","coach_id":None,"status":"active","created_at":"2026-11-01"},{"id":"a1","role":"client","full_name":"Khách A","coach_id":"c1","status":"active","created_at":"2026-11-20"}],
 "health_intakes":[{"id":"h1","client_id":"a1","goal":None,"goal_ratings":{"fat_loss":10,"muscle_gain":10,"performance":10,"health":10},"updated_at":"2026-11-25","parq":{},"lifestyle":{},"diet":{}}],
 "measurements":[],"inbody_scans":[],"assessments":[],"coach_notes":[],"exercises":[]}
try:
 with sync_playwright() as p:
  b=p.chromium.launch()
  ctx=b.new_context(viewport={'width':390,'height':844})
  ctx.add_init_script(f"""
    localStorage.setItem('fakedb', JSON.stringify({json.dumps(db)}));
    localStorage.setItem('dcoach_auth', JSON.stringify({{user:{{id:'c1'}}}}));
  """)
  pg=ctx.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.route('**/cdn.jsdelivr.net/**',lambda r:r.fulfill(status=200,content_type='application/javascript',body=fake))
  pg.goto('http://localhost:8769/coach/#/coach/client/a1')
  pg.wait_for_selector('#gf')
  t=pg.inner_text('main');print('PASS' if 'Chưa chốt' in t else 'FAIL','16a điểm bằng nhau -> "Chưa chốt"')
  print('PASS' if 'Giảm cân 10' in t else 'FAIL','16b hiện điểm khách tự chấm')
  pg.select_option('#gf select','muscle_gain');pg.click('#gf .btn--primary');pg.wait_for_selector('text=Đã chốt mục tiêu')
  pg.wait_for_timeout(500);g=pg.evaluate("JSON.parse(localStorage.getItem('fakedb')).health_intakes[0].goal")
  print('PASS' if g=='muscle_gain' else 'FAIL','16c coach chốt Tăng cơ -> lưu goal =',g)
  print('PASS' if 'Tăng cơ' in pg.inner_text('main') else 'FAIL','16d tóm tắt cập nhật');print('PASS' if not errs else 'FAIL','16e không lỗi JS',errs[:2]);b.close()
finally: srv.terminate()
