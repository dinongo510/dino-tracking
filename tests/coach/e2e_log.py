# DINO-010 — Chạy từ gốc repo: python tests/coach/e2e_log.py
import subprocess,time,json,os,sys,datetime
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('DCOACH_ROOT') or os.path.abspath(os.path.join(HERE,'..','..'))
FAKE=os.environ.get('DCOACH_FAKE') or os.path.join(HERE,'fake_supabase.js')
srv=subprocess.Popen([sys.executable,'-m','http.server','8774','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
fake=open(FAKE,encoding='utf-8').read();R=[]
def ok(n,c):R.append(('PASS' if c else 'FAIL')+' '+n)
T=datetime.date.today();MON=T-datetime.timedelta(days=T.weekday());D=lambda n:(T+datetime.timedelta(days=n)).isoformat()
A='a1';ex=[{"id":"sq","name_vi":"Squat tạ đòn","category":"strength","primary_muscles":["quadriceps"],"tags":[],"image_urls":[]},
 {"id":"bp","name_vi":"Đẩy ngực tạ đòn","category":"strength","primary_muscles":["chest"],"tags":[],"image_urls":[]},
 {"id":"z2","name_vi":"Chạy nhẹ (Zone 2)","category":"run","primary_muscles":[],"tags":[],"image_urls":[]},
 {"id":"kb","name_vi":"Vung tạ ấm","category":"conditioning","primary_muscles":["glutes"],"tags":[],"image_urls":[]}]
dbl={"type":"double","upper_kg":2.5,"lower_kg":5}
def S(i,date,w,title): return {"id":i,"client_id":A,"phase_id":"ph1","week_no":w,"day_no":datetime.date.fromisoformat(date).weekday()+1,"scheduled_on":date,"title":title,"session_type":"strength"}
db={"profiles":[{"id":"c1","role":"coach","full_name":"Dino","coach_id":None,"status":"active","created_at":"2026-11-01"},
   {"id":A,"role":"client","full_name":"Khách A","coach_id":"c1","status":"active","created_at":"2026-11-20"},
   {"id":"b1","role":"client","full_name":"Khách B","coach_id":"c1","status":"active","created_at":"2026-11-20"}],
 "health_intakes":[{"id":"h1","client_id":A,"updated_at":"2026-11-25","parq":{},"lifestyle":{},"diet":{}},{"id":"h2","client_id":"b1","updated_at":"2026-11-25","parq":{},"lifestyle":{},"diet":{}}],
 "exercises":ex,
 "programs":[{"id":"pr1","client_id":A,"name":"P","model":"linear","status":"published","start_date":(MON-datetime.timedelta(days=7)).isoformat()}],
 "phases":[{"id":"ph1","client_id":A,"program_id":"pr1","order_no":1,"name":"Nền tảng","weeks":4,"start_date":(MON-datetime.timedelta(days=7)).isoformat(),"end_date":D(30),"status":"published"}],
 "sessions":[S("s1",D(0),2,"Buổi hôm nay"),S("s2",D(7),3,"Buổi tuần sau"),S("old1",(MON-datetime.timedelta(days=7)).isoformat(),1,"Cũ 1"),S("old2",(MON-datetime.timedelta(days=5)).isoformat(),1,"Cũ 2")],
 "session_blocks":[{"id":"b_a","client_id":A,"session_id":"s1","order_no":1,"label":"A","block_type":"straight"},
   {"id":"b_r","client_id":A,"session_id":"s1","order_no":2,"label":"B","block_type":"run"},
   {"id":"b_c","client_id":A,"session_id":"s1","order_no":3,"label":"C","block_type":"circuit","rounds":2,"work_sec":3,"rest_sec":2},
   {"id":"b_n","client_id":A,"session_id":"s2","order_no":1,"label":"A","block_type":"straight"}],
 "block_items":[{"id":"i_sq","client_id":A,"block_id":"b_a","exercise_id":"sq","order_no":1,"sets":3,"reps_min":8,"reps_max":10,"load_kg":60,"rest_sec":90,"progression_rule":dbl},
   {"id":"i_bp","client_id":A,"block_id":"b_a","exercise_id":"bp","order_no":2,"sets":3,"reps_min":8,"reps_max":10,"load_kg":40,"rest_sec":0,"progression_rule":dbl},
   {"id":"i_run","client_id":A,"block_id":"b_r","exercise_id":"z2","order_no":1,"sets":1,"distance_m":3000,"progression_rule":{"type":"none"}},
   {"id":"i_kb","client_id":A,"block_id":"b_c","exercise_id":"kb","order_no":1,"sets":1,"reps_min":15,"reps_max":15,"progression_rule":{"type":"none"}},
   {"id":"n_sq","client_id":A,"block_id":"b_n","exercise_id":"sq","order_no":1,"sets":3,"reps_min":8,"reps_max":10,"load_kg":60,"progression_rule":dbl}],
 "messages":[{"id":"mB","client_id":"b1","context_type":"session","context_id":"xx","author_id":"b1","body":"tin của B","created_at":"2026-11-25T00:00:00Z"}]}
B='http://localhost:8774/coach/'
DB=lambda pg: pg.evaluate("JSON.parse(localStorage.getItem('fakedb'))")
def login(pg,uid,hash):
    if not pg.url.startswith('http'): pg.goto(B+'#/login')
    pg.evaluate("u=>{sessionStorage.clear();sessionStorage.setItem('fake_tab_auth',JSON.stringify({user:{id:u}}))}",uid); pg.goto(B+'#/'); pg.goto(B+hash)
try:
 with sync_playwright() as p:
  b=p.chromium.launch();ctx=b.new_context(viewport={'width':1280,'height':900});errs=[]
  ctx.route('**/cdn.jsdelivr.net/**',lambda r:r.fulfill(status=200,content_type='application/javascript',body=fake))
  cl=ctx.new_page();cl.on('pageerror',lambda e:errs.append('client: '+str(e)))
  cl.goto(B);cl.evaluate("d=>{localStorage.clear();localStorage.setItem('fakedb',JSON.stringify(d))}",db)
  # 1. Khách: Hôm nay → phiếu
  login(cl,A,'#/client');cl.wait_for_selector('main a.card:has-text("Buổi hôm nay")');cl.click('main a.card:has-text("Buổi hôm nay")')
  cl.wait_for_selector('[data-item=i_sq] tr[data-set="3"]')
  ok('1 phiếu: điền sẵn 8 rep × 60 kg, 3 hiệp', cl.input_value('[data-item=i_sq] tr[data-set="1"] [data-k=reps]')=='8' and cl.input_value('[data-item=i_sq] tr[data-set="1"] [data-k=load_kg]')=='60')
  ok('2 circuit 2 vòng = 2 dòng; bài chạy có ô thời gian', cl.locator('[data-item=i_kb] tr[data-set]').count()==2 and cl.locator('[data-item=i_run] [data-k=duration]').count()==1)
  # 2. Đẩy ngực: không sửa số, chỉ bấm ✓
  t0=time.time()
  for n in (1,2,3): cl.click(f'[data-item=i_bp] tr[data-set="{n}"] [data-done]')
  cl.wait_for_function("document.querySelectorAll('[data-item=i_bp] [data-done].btn--primary').length===3")
  ok(f'3 ghi 3 hiệp không sửa số ({(time.time()-t0)*1000:.0f} ms)', len([l for l in DB(cl)['set_logs'] if l['block_item_id']=='i_bp'])==3)
  # 3. Squat: đạt đỉnh 10 rep RPE 8 → đồng hồ nghỉ
  for n in (1,2,3):
    cl.fill(f'[data-item=i_sq] tr[data-set="{n}"] [data-k=reps]','10');cl.select_option(f'[data-item=i_sq] tr[data-set="{n}"] [data-k=rpe]','8')
    cl.click(f'[data-item=i_sq] tr[data-set="{n}"] [data-done]')
  cl.wait_for_selector('#restbar')
  ok('4 tick hiệp có rest_sec → hiện đồng hồ nghỉ', '1:' in cl.inner_text('#rleft') or '0:' in cl.inner_text('#rleft'))
  cl.click('#rskip')
  sq=[l for l in DB(cl)['set_logs'] if l['block_item_id']=='i_sq']
  ok('5 lưu squat 10 rep × 60 kg RPE 8', len(sq)==3 and all(l['reps']==10 and l['rpe']==8 for l in sq))
  # bỏ tick 1 hiệp rồi tick lại
  cl.click('[data-item=i_bp] tr[data-set="3"] [data-done]');cl.wait_for_timeout(200)
  ok('6 bỏ tick → done=false', [l for l in DB(cl)['set_logs'] if l['block_item_id']=='i_bp' and l['set_no']==3][0]['done'] is False)
  cl.click('[data-item=i_bp] tr[data-set="3"] [data-done]');cl.wait_for_timeout(200)
  # 4. Mất mạng giữa buổi
  ctx.set_offline(True)
  cl.fill('[data-item=i_run] [data-k=distance_m]','3000');cl.fill('[data-item=i_run] [data-k=duration]','15:00')
  ok('7 pace tự tính 5:00', cl.inner_text('[data-item=i_run] [data-pace]').strip()=='5:00')
  cl.click('[data-item=i_run] [data-done]');cl.wait_for_selector('#sync:not([hidden])')
  ok('8 mất mạng: báo "Chưa đồng bộ 1 hiệp", chưa ghi lên máy chủ', 'Chưa đồng bộ 1' in cl.inner_text('#sync') and not [l for l in DB(cl)['set_logs'] if l['block_item_id']=='i_run'])
  cl.evaluate("location.hash='#/client/plan'");cl.wait_for_selector('h1:has-text("Lịch tập")')
  cl.evaluate("location.hash='#/client/session/s1'");cl.wait_for_selector('[data-item=i_run] [data-done]')
  ok('9 rời phiếu rồi quay lại khi mất mạng: hiệp vẫn còn (đã tick)', 'btn--primary' in cl.get_attribute('[data-item=i_run] [data-done]','class'))
  ctx.set_offline(False);cl.wait_for_selector('#sync',state='hidden',timeout=8000)
  run=[l for l in DB(cl)['set_logs'] if l['block_item_id']=='i_run']
  ok('10 có mạng lại: tự đồng bộ, 3000 m / 900 giây', len(run)==1 and run[0]['distance_m']==3000 and run[0]['duration_sec']==900)
  # 5. Đồng hồ circuit
  cl.click('[data-timer="2"]');cl.click('[data-tpanel="2"] [data-tgo]');cl.wait_for_timeout(3600)
  ok('11 đồng hồ circuit: LÀM → NGHỈ', 'NGHỈ' in cl.inner_text('[data-tpanel="2"] [data-tlabel]'))
  cl.click('[data-tpanel="2"] [data-treset]')
  # 6. Chat realtime 2 tab
  co=ctx.new_page();co.on('pageerror',lambda e:errs.append('coach: '+str(e)))
  login(co,'c1','#/coach/review/s1');co.wait_for_selector('#mf')
  ok('12 coach xem phiếu khi khách đang ghi dở', 'đang ghi dở' in co.inner_text('main'))
  cl.fill('#mf [name=body]','Coach ơi gối hơi đau');t0=time.time();cl.click('#mf .btn--primary')
  co.wait_for_selector('#msgs >> text=Coach ơi gối hơi đau',timeout=4000);dt=time.time()-t0
  ok(f'13 coach thấy tin khách không cần tải lại ({dt*1000:.0f} ms)', dt<2)
  co.fill('#mf [name=body]','Giảm tải squat buổi sau nhé');co.press('#mf [name=body]','Control+Enter')
  cl.wait_for_selector('#msgs >> text=Giảm tải squat',timeout=4000)
  ok('14 coach gửi bằng Ctrl+Enter → khách thấy ngay', True)
  m=[x for x in DB(cl)['messages'] if x['client_id']==A]
  ok('15 tin của khách đã được coach đánh dấu đọc', all(x['read_at'] for x in m if x['author_id']==A))
  # 7. Hoàn thành buổi có đau
  cl.select_option('#fin [name=rpe]','8');cl.check('[data-pain="Gối trái"]');cl.select_option('[data-lvl="Gối trái"]','3');cl.fill('#fin [name=note]','Gối trái hơi nhói')
  cl.click('#fin .btn--primary');cl.wait_for_url('**#/client/plan',timeout=5000)
  d=DB(cl);fb=[f for f in d['session_feedback'] if f['session_id']=='s1'][0]
  ok('16 hoàn thành: completed, RPE 8, đau Gối trái 3', fb['completed'] and fb['session_rpe']==8 and fb['pain']==[{'area':'Gối trái','level':3}])
  ok('17 cảnh báo đau tự tạo', any(a['kind']=='pain' and 'Gối trái (3/5)' in a['message'] for a in d.get('alerts',[])))
  cl.wait_for_selector('text=✓ Đã tập')
  ok('18 lịch tập hiện ✓ Đã tập', cl.locator('main li:has-text("Buổi hôm nay") >> text=✓ Đã tập').count()==1)
  # 8. Hộp việc
  co.goto(B+'#/coach/inbox');co.wait_for_selector('h1:has-text("Hộp việc")');co.wait_for_selector('text=Cảnh báo')
  t=co.inner_text('main')
  ok('19 hộp việc: cảnh báo đau + bỏ 2 buổi tuần trước', 'Gối trái (3/5)' in t and 'Bỏ 2/2 buổi tuần trước' in t)
  ok('20 thứ tự: cảnh báo → buổi chưa xem', t.index('Cảnh báo')<t.index('Buổi vừa xong chưa xem'))
  ok('21 tab Hộp việc đã bật', co.get_attribute('.tabbar a:has-text("Hộp việc")','aria-disabled') is None)
  co.reload();co.wait_for_selector('text=Cảnh báo')
  ok('22 mở lại hộp việc không nhân đôi cảnh báo bỏ buổi', len([a for a in DB(co)['alerts'] if a['kind']=='missed'])==1)
  # 9. Xem phiếu + gợi ý + áp dụng
  co.click('main a:has-text("Buổi hôm nay") >> nth=0');co.wait_for_selector('h1:has-text("Buổi hôm nay")')
  t=co.inner_text('main')
  ok('23 phiếu coach: khối lượng 2.760 kg + 1RM ước tính squat', '2.760 kg' in t and 'Squat tạ đòn' in t and '80 kg' in t)
  ok('24 gợi ý squat 60 → 65 kg (thân dưới +5)', '60 → 65 kg' in t)
  ok('25 đẩy ngực 8 rep → giữ tải', 'Giữ tải' in t)
  ok('26 tô màu: các hiệp trong khoảng rep = Đạt', t.count('Đạt')>=6)
  co.click('[data-apply="0"]');co.wait_for_selector('text=Đã đặt 65 kg')
  ok('27 áp dụng: squat buổi tuần sau = 65 kg', [i for i in DB(co)['block_items'] if i['id']=='n_sq'][0]['load_kg']==65)
  co.click('#seen');co.wait_for_selector('.badge:has-text("Đã xem")')
  co.goto(B+'#/coach/inbox');co.wait_for_selector('h1:has-text("Hộp việc")');co.wait_for_timeout(300)
  ok('28 bấm Đã xem → buổi rời hộp việc', 'Buổi vừa xong chưa xem' not in co.inner_text('main'))
  n0=co.locator('[data-resolve]').count();co.click('[data-resolve] >> nth=0');co.wait_for_selector('text=Đã đóng cảnh báo.');co.wait_for_timeout(300)
  ok('29 "Đã xử lý" → cảnh báo biến mất', co.locator('[data-resolve]').count()==n0-1)
  # 10. Bảo mật (API)
  r=cl.evaluate("""async()=>{const m=await import('/coach/js/supabaseClient.js');const db=await m.sb();
     const a=await db.from('messages').select('*').eq('client_id','b1');
     const b=await db.from('alerts').insert({client_id:'a1',kind:'missed',ref_key:'x',message:'x'});
     const c=await db.from('messages').insert({client_id:'a1',context_type:'session',context_id:'s1',author_id:'c1',body:'giả coach'}).select().single();
     return {n:a.data.length,err:!!b.error,author:c.data.author_id}}""")
  ok('30 khách A không đọc tin của B, không tự tạo cảnh báo, không giả danh coach', r['n']==0 and r['err'] and r['author']=='a1')
  ok('31 không lỗi JS', not errs)
  if errs: print(errs[:3])
  b.close()
except Exception as e:
  print('EXC',str(e)[:400])
finally:
  srv.terminate()
print('\n'.join(R));print(f"{sum(r.startswith('PASS') for r in R)}/{len(R)} PASS")
