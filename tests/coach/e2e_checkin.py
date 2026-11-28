# DINO-012 — Chạy từ gốc repo: python tests/coach/e2e_checkin.py
import subprocess,time,os,sys,datetime,base64,tempfile
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('DCOACH_ROOT') or os.path.abspath(os.path.join(HERE,'..','..'))
FAKE=os.environ.get('DCOACH_FAKE') or os.path.join(HERE,'fake_supabase.js')
srv=subprocess.Popen([sys.executable,'-m','http.server','8777','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
fake=open(FAKE,encoding='utf-8').read();R=[]
def ok(n,c):R.append(('PASS' if c else 'FAIL')+' '+n)
T=datetime.date.today();D=lambda n:(T+datetime.timedelta(days=n)).isoformat();MON=T-datetime.timedelta(days=T.weekday());W=MON.isoformat()
A='a1';dow=T.weekday()  # 0 = T2
ex=[{"id":"sq","name_vi":"Squat","category":"strength","primary_muscles":["quadriceps"],"tags":[],"image_urls":[]},{"id":"z2","name_vi":"Chạy Z2","category":"run","tags":[],"image_urls":[]}]
# giai đoạn 4 tuần kết thúc ngày mai → báo cáo mở; tuần 1 & 4 có buổi + kết quả tạ
ps=(T-datetime.timedelta(days=26)); PS=ps.isoformat(); PE=D(1)
def S(i,wk,date): return {"id":i,"client_id":A,"phase_id":"ph1","week_no":wk,"day_no":datetime.date.fromisoformat(date).weekday()+1,"scheduled_on":date,"title":"Buổi "+i,"session_type":"strength"}
sess=[S("s1",1,PS),S("s2",2,(ps+datetime.timedelta(days=7)).isoformat()),S("s3",3,(ps+datetime.timedelta(days=14)).isoformat()),S("s4",4,(ps+datetime.timedelta(days=21)).isoformat()),S("s5",4,D(0))]
blocks=[{"id":"b"+s["id"],"client_id":A,"session_id":s["id"],"order_no":1,"block_type":"straight"} for s in sess]
items=[{"id":"i"+s["id"],"client_id":A,"block_id":"b"+s["id"],"exercise_id":"sq","order_no":1,"sets":3,"reps_min":8,"reps_max":10,"load_kg":60,"progression_rule":{"type":"none"}} for s in sess]
items.append({"id":"irun","client_id":A,"block_id":"bs2","exercise_id":"z2","order_no":2,"sets":1,"distance_m":5000,"progression_rule":{"type":"none"}})
logs=[{"id":"l1","client_id":A,"block_item_id":"is1","set_no":1,"reps":10,"load_kg":60,"done":True},{"id":"l2","client_id":A,"block_item_id":"is4","set_no":1,"reps":8,"load_kg":70,"done":True},
      {"id":"l3","client_id":A,"block_item_id":"irun","set_no":1,"distance_m":5000,"done":True}]
meas=[{"id":"m1","client_id":A,"measured_on":D(-14),"weight_kg":70.0,"waist_cm":84},{"id":"m2","client_id":A,"measured_on":D(-7),"weight_kg":70.05},{"id":"m3","client_id":A,"measured_on":D(0),"weight_kg":70.02,"waist_cm":82},
      {"id":"m0","client_id":A,"measured_on":PS,"weight_kg":72,"waist_cm":86}]
checks=[{"id":"c%d"%i,"client_id":A,"slot_id":"sl1","check_date":D(-i),"level":"on"} for i in range(0,7)]
png=os.path.join(tempfile.gettempdir(),'p.png');open(png,'wb').write(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGP8z8DwnwEJMDGgAQBVhQH/7bh3xgAAAABJRU5ErkJggg=='))
db={"profiles":[{"id":"c1","role":"coach","full_name":"Ngô Đức Anh","coach_id":None,"status":"active","created_at":"2026-11-01"},{"id":A,"role":"client","full_name":"Khách A","coach_id":"c1","status":"active","created_at":"2026-10-20"},{"id":"b1","role":"client","full_name":"Khách B","coach_id":"c1","status":"active","created_at":"2026-10-20"}],
 "health_intakes":[{"id":"h1","client_id":A,"updated_at":"2026-11-25","goal":"fat_loss","parq":{},"lifestyle":{},"diet":{}},{"id":"h2","client_id":"b1","updated_at":"2026-11-25","parq":{},"lifestyle":{},"diet":{}}],
 "exercises":ex,"programs":[{"id":"pr1","client_id":A,"name":"P","model":"linear","status":"published","start_date":PS}],
 "phases":[{"id":"ph1","client_id":A,"program_id":"pr1","order_no":1,"name":"Nền tảng","weeks":4,"start_date":PS,"end_date":PE,"status":"published","goal":"fat_loss"}],
 "sessions":sess,"session_blocks":blocks,"block_items":items,"set_logs":logs,
 "session_feedback":[{"id":"f1","client_id":A,"session_id":"s1","completed":True},{"id":"f4","client_id":A,"session_id":"s4","completed":True}],
 "measurements":meas,"meal_slots":[{"id":"sl1","client_id":A,"order_no":1,"name":"Trưa","kcal_pct":100}],"meal_checks":checks,
 "nutrition_targets":[{"id":"nt1","client_id":A,"valid_from":"2026-11-01","formula":"mifflin","bmr":1700,"tdee":2300,"kcal":1900,"protein_g":130,"carb_g":228,"fat_g":52,"status":"approved","created_at":"2026-11-01"}],
 "progress_photos":[{"id":"p1","client_id":A,"taken_on":PS,"angle":"front","storage_path":"a1/p_start.webp"},{"id":"p2","client_id":A,"taken_on":D(0),"angle":"front","storage_path":"a1/p_end.webp"}]}
B='http://localhost:8777/coach/'
DB=lambda pg: pg.evaluate("JSON.parse(localStorage.getItem('fakedb'))")
def login(pg,uid,hash):
    if not pg.url.startswith('http'): pg.goto(B+'#/login')
    pg.evaluate("u=>{sessionStorage.clear();sessionStorage.setItem('fake_tab_auth',JSON.stringify({user:{id:u}}))}",uid); pg.goto(B+'#/'); pg.goto(B+hash)
try:
 with sync_playwright() as p:
  b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':844});errs=[]
  ctx.route('**/cdn.jsdelivr.net/**',lambda r:r.fulfill(status=200,content_type='application/javascript',body=fake))
  ctx.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(status=200,content_type='text/css',body=''))
  cl=ctx.new_page();cl.on('pageerror',lambda e:errs.append('client '+str(e)));cl.on('dialog',lambda d:d.accept())
  cl.goto(B);cl.evaluate("d=>{localStorage.clear();localStorage.setItem('fakedb',JSON.stringify(d));localStorage.setItem('fakestore',JSON.stringify({'a1/p_start.webp':{data:'data:image/png;base64,iVBORw0KGgo='},'a1/p_end.webp':{data:'data:image/png;base64,iVBORw0KGgo='}}))}",db)
  # 1. Thẻ nhắc check-in (T7, CN, T2, T3)
  login(cl,A,'#/client');cl.wait_for_selector('main .card--hi')
  has=cl.locator('text=CHECK-IN TUẦN').count()==1
  ok('1 thẻ CHECK-IN TUẦN hiện đúng ngày (T7/CN/T2/T3)', has == (dow in (5,6,0,1)))
  ok('2 thẻ BÁO CÁO GIAI ĐOẠN hiện khi giai đoạn còn ≤ 3 ngày', cl.locator('text=BÁO CÁO GIAI ĐOẠN').count()==1)
  # 2. Form check-in (tuần này)
  cl.goto(B+f'#/client/checkin?w={W}');cl.wait_for_selector('#cf')
  ok('3 cân TB tuần tự điền (70)', cl.input_value('#cf [name=w]')=='70')
  t0=time.time()
  cl.click('#cf .btn--primary');cl.wait_for_selector('text=Chấm điểm giấc ngủ')
  ok('4 chưa chấm điểm → nhắc', True)
  for col,v in (('sleep_score',4),('stress_score',2),('energy_score',4)): cl.click(f'#cf [data-score={col}][data-v="{v}"]')
  cl.fill('#cf [name=hardest]','Tăng ca 3 tối');cl.click('#cf .btn--primary');cl.wait_for_selector('text=Đã gửi check-in ✓')
  ok(f'5 khách check-in < 2 phút ({time.time()-t0:.1f} giây tự động)', time.time()-t0<120)
  ci=[c for c in DB(cl)['weekly_checkins'] if c['client_id']==A][0]
  ok('6 lưu: cân 70, ngủ 4 / stress 2 / năng lượng 4, % ăn 100, % buổi', ci['avg_weight_kg']==70 and [ci['sleep_score'],ci['stress_score'],ci['energy_score']]==[4,2,4] and ci['eat_pct']==100 and ci['sessions_pct'] is not None)
  r=cl.evaluate("""async(id)=>{const m=await import('/coach/js/supabaseClient.js');const db=await m.sb();await db.from('weekly_checkins').update({coach_reply:'khách tự viết'}).eq('id',id);
     const x=await db.from('weekly_checkins').select('coach_reply').eq('id',id).single();return x.data.coach_reply}""",ci['id'])
  ok('7 khách không tự ghi được câu trả lời của coach', r is None)
  cl.goto(B+'#/client');cl.wait_for_selector('main .card--hi')
  ok('8 gửi xong: thẻ nhắc check-in tuần này biến mất', cl.locator('text=CHECK-IN TUẦN').count()==0 or dow in (0,1))
  # 3. Coach: hộp việc → check-in → đề xuất kcal
  co=ctx.new_page();co.on('pageerror',lambda e:errs.append('coach '+str(e)));co.on('dialog',lambda d:d.accept())
  login(co,'c1','#/coach/inbox');co.wait_for_selector('text=Check-in chờ trả lời')
  co.click('main a[href^="#/coach/checkin/"]');co.wait_for_selector('#rf')
  t=co.inner_text('main')
  ok('9 UAT(2): cân đứng 2 tuần + ăn 100% → Giảm kcal −150, lý do "Cân đứng 2 tuần"', 'Giảm kcal -150 kcal' in t and 'Cân đứng 2 tuần' in t)
  ok('10 mục tiêu mới 1750 kcal · C 191', '1750 kcal · P 130 · C 191 · F 52' in t)
  co.click('#apply');co.wait_for_selector('text=Đã áp dụng mục tiêu mới.')
  nt=sorted([x for x in DB(co)['nutrition_targets'] if x['client_id']==A],key=lambda x:x['created_at'])
  ok('11 áp dụng → mục tiêu mới approved 1750, giữ công thức', len(nt)==2 and nt[-1]['kcal']==1750 and nt[-1]['status']=='approved' and nt[-1]['formula']=='mifflin')
  co.fill('#rf [name=reply]','Tuần tốt! Giảm 150 kcal, giữ 3 buổi.');co.click('#rf .btn--primary');co.wait_for_selector('text=Đã trả lời')
  ci=[c for c in DB(co)['weekly_checkins'] if c['client_id']==A][0]
  ok('12 coach trả lời: lưu reply + replied_at, không sửa được điểm của khách', ci['coach_reply'].startswith('Tuần tốt') and ci['replied_at'] and ci['sleep_score']==4)
  co.fill('#mf [name=body]','Nhớ ngủ trước 23h nhé');co.click('#mf .btn--primary');co.wait_for_selector('#msgs >> text=Nhớ ngủ')
  ok('13 chat theo check-in lưu context checkin', any(m['context_type']=='checkin' and m['context_id']==ci['id'] for m in DB(co)['messages']))
  co.goto(B+'#/coach/inbox');co.wait_for_selector('h1:has-text("Hộp việc")');co.wait_for_timeout(400)
  ok('14 đã trả lời → rời mục "Check-in chờ trả lời"', 'Check-in chờ trả lời' not in co.inner_text('main'))
  # UAT(3): tuân thủ 70% → cần trao đổi
  co.evaluate("id=>{const d=JSON.parse(localStorage.getItem('fakedb'));const c=d.weekly_checkins.find(x=>x.id===id);c.eat_pct=70;localStorage.setItem('fakedb',JSON.stringify(d))}",ci['id'])
  co.goto(B+f'#/coach/checkin/{ci["id"]}');co.wait_for_selector('#rf')
  t=co.inner_text('main')
  ok('15 UAT(3): ăn 70% → "Cần trao đổi", không có nút áp dụng', 'Cần trao đổi' in t and co.locator('#apply').count()==0)
  # 4. Khách thấy trả lời
  cl.goto(B+f'#/client/checkin?w={W}');cl.wait_for_selector('text=Coach trả lời')
  ok('16 khách thấy câu trả lời + tin nhắn của coach', 'Tuần tốt! Giảm 150 kcal' in cl.inner_text('main') and 'Nhớ ngủ trước 23h' in cl.inner_text('main'))
  # 5. Báo cáo giai đoạn
  co.goto(B+'#/coach/client/a1/plan');co.wait_for_selector('text=Báo cáo giai đoạn');co.click('text=Báo cáo giai đoạn');co.wait_for_selector('#rf [name=coach_summary]')
  t=co.inner_text('main')
  ok('17 UAT(4): cân 72 → 70,02 (↓ 2), eo 86 → 82', '72 → 70' in t and '↓ 2' in t and '86 → 82' in t)
  ok('18 ảnh đầu / cuối đủ 2 mốc', co.locator('figure img').count()==2)
  ok('19 buổi đã tập 2/5, top tăng 1RM Squat 80 → 88,7, chạy 5 km', '2/5' in t.replace('\n','') and 'Squat' in t and '88,7' in t and '5 km' in t.replace('\n',' '))
  co.fill('#rf [name=coach_summary]','Giảm 2 kg, eo −4 cm. Squat tăng 11%.');co.click('#agree');co.wait_for_selector('text=Bạn đã đồng ý ✓')
  cl.goto(B+'#/phase/ph1');cl.wait_for_selector('#rf')
  ok('20 khách chỉ đọc phần coach, được viết nhận xét', cl.get_attribute('#rf [name=coach_summary]','readonly') is not None and cl.get_attribute('#rf [name=client_feedback]','readonly') is None)
  cl.fill('#rf [name=client_feedback]','Em thấy khỏe hơn, muốn chạy nhiều hơn.');cl.click('#agree');cl.wait_for_selector('text=Hai bên đã thống nhất ✓')
  rv=DB(cl)['phase_reviews'][0]
  ok('21 hai bên đồng ý → agreed (nhận xét của khách không làm mất đồng ý của coach)', rv['status']=='agreed' and rv['coach_agreed_at'] and rv['client_agreed_at'])
  co.reload();co.wait_for_selector('#next');co.click('#next');co.wait_for_url('**/plan?phase=*')
  d=DB(co);nph=[p for p in d['phases'] if p['id']!='ph1']
  ok('22 UAT(5): "Tạo giai đoạn tiếp" ra bản nháp, bắt đầu sau ngày kết thúc, có buổi', len(nph)==1 and nph[0]['status']=='draft' and nph[0]['start_date']==D(2) and len([s for s in d['sessions'] if s['phase_id']==nph[0]['id']])>0)
  bb=ctx.new_page();login(bb,'b1','#/client');bb.wait_for_selector('.tabbar')
  r=bb.evaluate("""async()=>{const m=await import('/coach/js/supabaseClient.js');const db=await m.sb();
     const a=await db.from('weekly_checkins').select('*').eq('client_id','a1');const b=await db.from('phase_reviews').select('*').eq('client_id','a1');return [a.data.length,b.data.length]}""")
  ok('23 khách B không đọc được check-in / báo cáo của A', r==[0,0])
  ok('24 không lỗi JS', not errs)
  if errs: print(errs[:3])
  b.close()
except Exception as e:
  print('EXC',str(e)[:400])
finally:
  srv.terminate()
print('\n'.join(R));print(f"{sum(r.startswith('PASS') for r in R)}/{len(R)} PASS")
