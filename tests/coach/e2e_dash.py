# DINO-013 — Chạy từ gốc repo: python tests/coach/e2e_dash.py
import subprocess,time,os,sys,datetime,zipfile,io,re
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('DCOACH_ROOT') or os.path.abspath(os.path.join(HERE,'..','..'))
FAKE=os.environ.get('DCOACH_FAKE') or os.path.join(HERE,'fake_supabase.js')
srv=subprocess.Popen([sys.executable,'-m','http.server','8778','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
fake=open(FAKE,encoding='utf-8').read();R=[]
def ok(n,c):R.append(('PASS' if c else 'FAIL')+' '+n)
T=datetime.date.today();D=lambda n:(T+datetime.timedelta(days=n)).isoformat()
MON=T-datetime.timedelta(days=T.weekday());M=lambda w:(MON+datetime.timedelta(days=7*w)).isoformat()   # thứ Hai tuần w (0 = tuần này)
A,B_,C='a1','b1','c9'
ex=[{"id":"sq","name_vi":"Squat","category":"strength","primary_muscles":["quadriceps"],"tags":[],"image_urls":[]},
    {"id":"bp","name_vi":"Đẩy ngực","category":"strength","primary_muscles":["chest"],"tags":[],"image_urls":[]},
    {"id":"dl","name_vi":"Deadlift","category":"strength","primary_muscles":["hamstrings"],"tags":[],"image_urls":[]},
    {"id":"z2","name_vi":"Chạy Z2","category":"run","tags":[],"image_urls":[]}]
# A: GĐ1 (xong) → GĐ2 bắt đầu thứ Hai tuần trước; GĐ3 nháp (không được hiện mốc)
phases=[{"id":"p1","client_id":A,"program_id":"pr1","order_no":1,"name":"Nền tảng","weeks":8,"start_date":M(-9),"end_date":(MON-datetime.timedelta(days=8)).isoformat(),"status":"done"},
        {"id":"p2","client_id":A,"program_id":"pr1","order_no":2,"name":"Giảm mỡ 2","weeks":4,"start_date":M(-1),"end_date":(MON+datetime.timedelta(days=20)).isoformat(),"status":"published"},
        {"id":"p3","client_id":A,"program_id":"pr1","order_no":3,"name":"Nháp","weeks":4,"start_date":(MON+datetime.timedelta(days=21)).isoformat(),"status":"draft"},
        {"id":"pb","client_id":B_,"program_id":"prb","order_no":1,"name":"B nền tảng","weeks":4,"start_date":M(-1),"end_date":(MON+datetime.timedelta(days=20)).isoformat(),"status":"published"}]
# buổi 7 ngày gần nhất: A 3 buổi xong 1 → 33% ; B 2 buổi xong 2
sess=[{"id":f"sa{i}","client_id":A,"phase_id":"p2","week_no":1,"day_no":1,"scheduled_on":D(-i),"title":"A"} for i in (1,3,5)]+[{"id":f"sb{i}","client_id":B_,"phase_id":"pb","week_no":1,"day_no":1,"scheduled_on":D(-i),"title":"B"} for i in (2,4)]
fb=[{"id":"fa1","client_id":A,"session_id":"sa1","completed":True},{"id":"fb2","client_id":B_,"session_id":"sb2","completed":True},{"id":"fb4","client_id":B_,"session_id":"sb4","completed":True}]
# cân của A: 10 tuần, giảm dần; vài lần có eo/mông
meas=[{"id":f"m{i}","client_id":A,"measured_on":D(-i),"weight_kg":round(80+i*0.05,2),**({"waist_cm":85+i*0.05,"hip_cm":98} if i%14==0 else {})} for i in range(0,70,2)]
meas+= [{"id":"mb1","client_id":B_,"measured_on":D(-1),"weight_kg":60},{"id":"mb2","client_id":B_,"measured_on":D(-15),"weight_kg":60.1}]
scans=[{"id":"ib1","client_id":A,"scanned_on":D(-56),"weight_kg":82.8,"smm_kg":33.1,"pbf_pct":24.5,"ffm_kg":62.5},{"id":"ib2","client_id":A,"scanned_on":D(-2),"weight_kg":80.1,"smm_kg":33.6,"pbf_pct":22.0,"ffm_kg":62.6}]
items=[{"id":"isq","client_id":A,"block_id":"x","exercise_id":"sq","order_no":1},{"id":"ibp","client_id":A,"block_id":"x","exercise_id":"bp","order_no":2},
       {"id":"idl","client_id":A,"block_id":"x","exercise_id":"dl","order_no":3},{"id":"irun","client_id":A,"block_id":"x","exercise_id":"z2","order_no":4,"hr_zone":2}]
def lg(i,item,day,reps=None,kg=None,**k): return {"id":f"l{i}","client_id":A,"block_item_id":item,"set_no":1,"reps":reps,"load_kg":kg,"done":True,"logged_at":day+"T10:00:00",**k}
logs=[]; n=0
for w in range(-3,1):                      # 4 tuần: squat tăng 5 kg/tuần, đẩy ngực 2,5 kg/tuần, deadlift 1 lần/tuần
  d=(MON+datetime.timedelta(days=7*w+min(1,T.weekday()))).isoformat()
  for _ in range(3): n+=1; logs.append(lg(n,'isq',d,5,100+5*(w+3)))
  for _ in range(2): n+=1; logs.append(lg(n,'ibp',d,8,60+2.5*(w+3)))
  n+=1; logs.append(lg(n,'idl',d,5,120))
  n+=1; logs.append(lg(n,'irun',d,distance_m=5000,duration_sec=1800))
checks=[{"id":f"cb{i}","client_id":B_,"slot_id":"sb","check_date":D(-i),"level":"on"} for i in range(7)]
db={"profiles":[{"id":"c1","role":"coach","full_name":"Ngô Đức Anh","coach_id":None,"status":"active","created_at":"2026-11-01"},
   {"id":A,"role":"client","full_name":"Khách A","coach_id":"c1","status":"active","phone":"0900","created_at":"2026-09-01"},
   {"id":B_,"role":"client","full_name":"Khách B","coach_id":"c1","status":"active","phone":"0911","created_at":"2026-09-01"},
   {"id":C,"role":"client","full_name":"Khách C","coach_id":"c1","status":"paused","created_at":"2026-09-01"}],
 "health_intakes":[{"id":f"h{x}","client_id":x,"updated_at":"2026-11-25","parq":{},"lifestyle":{},"diet":{}} for x in (A,B_,C)],
 "exercises":ex,"programs":[{"id":"pr1","client_id":A,"name":"P","model":"linear","status":"published","start_date":M(-9)},{"id":"prb","client_id":B_,"name":"PB","model":"linear","status":"published","start_date":M(-1)}],
 "phases":phases,"sessions":sess,"session_feedback":fb,"measurements":meas,"inbody_scans":scans,"block_items":items,"set_logs":logs,
 "meal_slots":[{"id":"sa","client_id":A,"order_no":1,"name":"Trưa","kcal_pct":100},{"id":"sb","client_id":B_,"order_no":1,"name":"Trưa","kcal_pct":100}],"meal_checks":checks,
 "alerts":[{"id":"al1","client_id":A,"kind":"pain","ref_key":"x","message":"Khách báo đau: Gối trái (3/5)","created_at":D(-1),"resolved_at":None}],
 "weekly_checkins":[{"id":"w1","client_id":B_,"week_start":M(-1),"created_at":D(-6)+"T10:00:00","coach_reply":"ok"}],
 "coach_notes":[{"id":"n1","client_id":A,"body":"Ghi chú nội bộ, có dấu phẩy, \"ngoặc\""}]}
B='http://localhost:8778/coach/'
DB=lambda pg: pg.evaluate("JSON.parse(localStorage.getItem('fakedb'))")
def login(pg,uid,hash):
    if not pg.url.startswith('http'): pg.goto(B+'#/login')
    pg.evaluate("u=>{sessionStorage.clear();sessionStorage.setItem('fake_tab_auth',JSON.stringify({user:{id:u}}))}",uid); pg.goto(B+'#/'); pg.goto(B+hash)
vals=lambda pg,chart,s=0: pg.eval_on_selector_all(f'[data-chart="{chart}"] [data-s="{s}"]','els=>els.map(e=>[e.dataset.x,Number(e.dataset.v)])')
try:
 with sync_playwright() as p:
  b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':844},accept_downloads=True);errs=[]
  ctx.route('**/cdn.jsdelivr.net/**',lambda r:r.fulfill(status=200,content_type='application/javascript',body=fake))
  ctx.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(status=200,content_type='text/css',body=''))
  co=ctx.new_page();co.on('pageerror',lambda e:errs.append('coach '+str(e)));co.on('dialog',lambda d:d.accept())
  co.goto(B);co.evaluate("d=>{localStorage.clear();localStorage.setItem('fakedb',JSON.stringify(d))}",db)
  # 1. Bảng tổng nhóm
  login(co,'c1','#/coach');co.wait_for_selector('#group li')
  order=co.eval_on_selector_all('#group li','els=>els.map(e=>e.dataset.client)')
  ok(f'1 UAT(4) bảng tổng nhóm: khách có cảnh báo lên đầu, tạm dừng xuống cuối ({order})', order==[A,B_,C])
  ra=co.inner_text(f'#group li[data-client={A}]')
  ok('2 dòng khách A: ⚠ cảnh báo, giai đoạn + tuần 2/4, Tập 33%, cân ▼, lý do cần chú ý', re.search(r'⚠ \d',ra) and 'Giảm mỡ 2 · tuần 2/4' in ra and 'Tập 33%' in ra and 'Cân ▼' in ra and 'chưa check-in' in ra)
  rb=co.inner_text(f'#group li[data-client={B_}]')
  ok('3 dòng khách B: Tập 100% · Ăn 100% · Cân — · không có lý do cảnh báo', 'Tập 100%' in rb and 'Ăn 100%' in rb and 'Cân —' in rb and 'chưa check-in' not in rb and 'cảnh báo' not in rb)
  # 2. Dashboard khách A (coach)
  t0=time.time();co.click(f'#group li[data-client={A}] >> text=Tiến độ');co.wait_for_selector('[data-chart="weight"]')
  ok(f'4 UAT(1) mở dashboard 1 khách ({time.time()-t0:.1f} giây)', time.time()-t0<30)
  tx=co.inner_text('main')
  ok('5 ô tóm tắt: cân TB 7 ngày, tập 33%, cảnh báo đau hiện', 'Cân TB 7 ngày' in tx and '33%' in tx and 'Gối trái' in tx)
  ok('6 mặc định "Giai đoạn này" + tab Khách sáng', co.get_attribute('[data-range=phase]','aria-pressed')=='true' and co.inner_text('.tabbar [aria-current=page]')=='Khách')
  pts=dict(vals(co,'weight'));raw={m['measured_on']:m['weight_kg'] for m in meas if m['client_id']==A}
  checks3=[D(0),D(-4),D(-8)] ; inr=[d for d in checks3 if d>=M(-1)]
  ok(f'7 UAT(2) biểu đồ cân khớp số thô ({len(inr)} mốc kiểm tay)', all(abs(pts.get(d,-1)-raw[d])<1e-9 for d in inr) and all(d>=M(-1) for d in pts))
  co.click('[data-range="3m"]');co.wait_for_function("document.querySelectorAll('[data-chart=weight] [data-s=\"0\"]').length>20")
  pts=dict(vals(co,'weight'))
  ok('8 bộ lọc 3 tháng: đủ 35 lần cân, 3 mốc kiểm tay D-0/D-30/D-68 khớp', len(pts)==35 and all(abs(pts[d]-raw[d])<1e-9 for d in (D(0),D(-30),D(-68))))
  ok('9 mốc chuyển giai đoạn vẽ đường dọc GĐ1, GĐ2 (không có GĐ3 nháp)', co.locator('[data-chart="weight"] .mark-label').all_text_contents()==['GĐ1','GĐ2'])
  avg=dict(vals(co,'weight',1))
  exp=round(sum(raw[d] for d in raw if D(-6)<=d<=D(0))/len([d for d in raw if D(-6)<=d<=D(0)]),2)
  ok(f'10 đường TB 7 ngày hôm nay = {exp}', abs(avg[D(0)]-exp)<1e-9)
  ib=dict(vals(co,'pbf'))
  ok('11 InBody PBF 24,5 → 22,0 đúng 2 lần đo', ib=={D(-56):24.5,D(-2):22.0})
  e=vals(co,'e1rm',0)
  ok(f'12 1RM squat theo tuần (tự lấy bài tập nhiều nhất): {e[-1] if e else None}', e and e[-1][1]==round(115*(1+5/30),1) and 'Đang tự lấy' in co.inner_text('main'))
  vol=co.eval_on_selector_all('[data-chart="volume"] rect','els=>els.map(e=>e.dataset.x+"|"+e.dataset.v)')
  ok('13 khối lượng tuần này: squat 3×5×115 = 1725', f'{M(0)}|1725' in vol)
  km=dict(vals(co,'km'));pace=dict(vals(co,'pace'))
  ok('14 chạy: 5 km/tuần, pace easy 6:00 (360 giây/km)', km.get(M(0))==5 and pace.get(M(0))==360 and 'easy' in co.inner_text('[data-chart="pace"]'))
  ad={(x,v) for s_,x,v in (a.split('|') for a in co.eval_on_selector_all('[data-chart="adherence"] rect','els=>els.map(e=>e.dataset.s+"|"+e.dataset.x+"|"+e.dataset.v)')) if s_=='0'}
  wk=lambda d:(datetime.date.fromisoformat(d)-datetime.timedelta(days=datetime.date.fromisoformat(d).weekday())).isoformat()
  exp={}
  for s_ in sess:
    if s_['client_id']!=A: continue
    t_,d_=exp.get(wk(s_['scheduled_on']),(0,0)); exp[wk(s_['scheduled_on'])]=(t_+1,d_+(s_['id']=='sa1'))
  expv={(w,str(int(d_*100/t_+0.5))) for w,(t_,d_) in exp.items() if d_}
  ok(f'15 tuân thủ % buổi mỗi tuần khớp tính tay {sorted(expv)}', ad==expv)
  # 3. Chọn bài theo dõi
  co.click('#pick');co.wait_for_selector('#dlg[open]')
  ok('16 hộp chọn bài: chỉ bài có tạ (3 bài, không có Chạy Z2)', co.locator('#tl input').count()==3 and 'Chạy Z2' not in co.inner_text('#tl'))
  co.check('#tl input[value=dl]');co.check('#tl input[value=bp]');co.click('#tf .btn--primary');co.wait_for_selector('text=Đã lưu bài theo dõi.')
  tl=sorted((t['exercise_id'],t['order_no']) for t in DB(co)['tracked_lifts'] if t['client_id']==A)
  names=co.locator('[data-chart="e1rm"] .legend span').all_inner_texts()
  ok(f'17 lưu bài theo dõi → biểu đồ chỉ còn 2 bài đã chọn {names}', len(tl)==2 and set(x[0] for x in tl)=={'dl','bp'} and sorted(names)==['Deadlift','Đẩy ngực'])
  # 4. Xuất CSV
  with co.expect_download() as dl: co.click('#csv')
  f=dl.value; data=open(f.path(),'rb').read(); z=zipfile.ZipFile(io.BytesIO(data)); nm=z.namelist()
  mc=z.read('measurements.csv'); cn=z.read('coach_notes.csv').decode('utf-8')
  ok(f'18 UAT(5) xuất zip: {len(nm)} bảng, tên file {f.suggested_filename}', len(nm)>=20 and 'measurements.csv' in nm and 'set_logs.csv' in nm and f.suggested_filename.startswith('dino-coach_khach-a_') and z.testzip() is None)
  ok('19 CSV có BOM UTF-8, đủ 35 dòng cân, tiếng Việt + dấu phẩy không vỡ', mc.startswith(b'\xef\xbb\xbf') and mc.decode('utf-8').count('\r\n')==36 and '"Ghi chú nội bộ, có dấu phẩy, ""ngoặc"""' in cn)
  ok('20 chỉ dữ liệu khách A (không lẫn B)', B_ not in z.read('measurements.csv').decode() and 'Khách B' not in z.read('profiles.csv').decode('utf-8'))
  # 5. Khách
  cl=ctx.new_page();cl.on('pageerror',lambda e:errs.append('client '+str(e)))
  login(cl,A,'#/client/body');cl.wait_for_selector('text=Xem biểu đồ tiến độ')
  cl.click('text=Xem biểu đồ tiến độ');cl.wait_for_selector('[data-chart="weight"]')
  ok('21 khách mở dashboard của mình từ tab Tiến độ (tab Tiến độ sáng)', cl.inner_text('.tabbar [aria-current=page]') in ('Tiến độ','Cơ thể') and len(vals(cl,'weight'))>0)
  ok('22 khách không có nút Xuất CSV / Chọn bài, không thấy cảnh báo', cl.locator('#csv').count()==0 and cl.locator('#pick').count()==0 and 'Gối trái' not in cl.inner_text('main'))
  ok('23 khách thấy bài theo dõi coach đã chọn', sorted(cl.locator('[data-chart="e1rm"] .legend span').all_inner_texts())==['Deadlift','Đẩy ngực'])
  cl.goto(B+f'#/dash/{B_}');time.sleep(1.2)
  ok('24 UAT(3) khách mở #/dash/<khách khác> → bị chặn, không thấy dữ liệu B', '/dash/' not in cl.url or 'Khách B' not in cl.inner_text('main'))
  r=cl.evaluate("""async()=>{const m=await import('/coach/js/supabaseClient.js');const db=await m.sb();
     const w=await db.from('tracked_lifts').insert({client_id:'a1',exercise_id:'sq',order_no:9});return !!w.error}""")
  ok('25 khách không tự sửa được bài theo dõi (RLS)', r)
  cl.goto(B+'#/client/dash');cl.wait_for_selector('[data-chart="adherence"]')
  co.goto(B+'#/coach');co.wait_for_selector('#group li')
  ok('26 không tràn ngang ở 390 px (dashboard khách + bảng tổng nhóm)', cl.evaluate("document.documentElement.scrollWidth<=innerWidth+1") and co.evaluate("document.documentElement.scrollWidth<=innerWidth+1"))
  ok('27 không lỗi JavaScript', not errs)
  if errs: print(errs)
  b.close()
except Exception as ex_:
  import traceback;traceback.print_exc();R.append('FAIL lỗi chạy test: '+str(ex_))
finally:
  srv.terminate()
print('\n'.join(R)); print(f"{sum(r.startswith('PASS') for r in R)}/{len(R)} PASS")
