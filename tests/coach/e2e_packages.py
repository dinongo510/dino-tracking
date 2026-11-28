# DINO-014 — Chạy từ gốc repo: python tests/coach/e2e_packages.py
import subprocess,time,os,sys,datetime,re
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('DCOACH_ROOT') or os.path.abspath(os.path.join(HERE,'..','..'))
FAKE=os.environ.get('DCOACH_FAKE') or os.path.join(HERE,'fake_supabase.js')
srv=subprocess.Popen([sys.executable,'-m','http.server','8779','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
fake=open(FAKE,encoding='utf-8').read();R=[]
def ok(n,c):R.append(('PASS' if c else 'FAIL')+' '+n)
T=datetime.date.today();D=lambda n:(T+datetime.timedelta(days=n)).isoformat();MON=(T-datetime.timedelta(days=T.weekday())).isoformat()
A,L,G,N='a1','l1','g1','n1'
def addm(iso,n):
  y,m,d=map(int,iso.split('-'));m0=m-1+n;y+=m0//12;m=m0%12+1
  import calendar;d=min(d,calendar.monthrange(y,m)[1]);return datetime.date(y,m,d)
end1m=(addm(D(0),1)-datetime.timedelta(days=1)).isoformat()
prof=lambda i,n,mode='online',role='client':{"id":i,"role":role,"full_name":n,"coach_id":None if role=='coach' else 'c1',"status":"active","coach_mode":mode,"created_at":"2026-10-01"}
sess=[{"id":"spt","client_id":A,"phase_id":"ph","week_no":1,"day_no":T.weekday()+1,"scheduled_on":D(0),"title":"PT chân","session_type":"strength","mode":"pt"},
      {"id":"sself","client_id":A,"phase_id":"ph","week_no":1,"day_no":min(7,T.weekday()+2),"scheduled_on":D(1),"title":"Tự tập","session_type":"strength","mode":"self"}]
db={"profiles":[prof('c1','Ngô Đức Anh',role='coach'),prof(A,'Khách A','offline'),prof(L,'Khách Khóa'),prof(G,'Khách Ân hạn'),prof(N,'Khách Mới')],
 "health_intakes":[{"id":"h"+x,"client_id":x,"updated_at":"2026-11-25","parq":{},"lifestyle":{},"diet":{}} for x in (A,L,G,N,'c1')],
 "exercises":[{"id":"sq","name_vi":"Squat","category":"strength","primary_muscles":["quadriceps"],"tags":[],"image_urls":[]}],
 "programs":[{"id":"pr","client_id":A,"name":"P","model":"linear","status":"published","start_date":MON}],
 "phases":[{"id":"ph","client_id":A,"program_id":"pr","order_no":1,"name":"Nền tảng","weeks":4,"start_date":MON,"end_date":D(27),"status":"published"}],
 "sessions":sess,"session_blocks":[{"id":"b1","client_id":A,"session_id":"spt","order_no":1,"block_type":"straight"},{"id":"b2","client_id":A,"session_id":"sself","order_no":1,"block_type":"straight"}],
 "block_items":[{"id":"i1","client_id":A,"block_id":"b1","exercise_id":"sq","order_no":1,"sets":2,"reps_min":8,"reps_max":10,"load_kg":60,"progression_rule":{"type":"none"}},
                {"id":"i2","client_id":A,"block_id":"b2","exercise_id":"sq","order_no":1,"sets":2,"reps_min":8,"reps_max":10,"load_kg":60,"progression_rule":{"type":"none"}}],
 "packages":[{"id":"pA","client_id":A,"name":"3 buổi PT","total_sessions":3,"start_date":D(-10),"end_date":None,"price_vnd":3000000,"paid_vnd":2000000,"status":"active","created_at":D(-10)},
             {"id":"pL","client_id":L,"name":None,"total_sessions":None,"start_date":D(-40),"end_date":D(-5),"price_vnd":None,"paid_vnd":0,"status":"active","created_at":D(-40)},
             {"id":"pG","client_id":G,"name":None,"total_sessions":None,"start_date":D(-32),"end_date":D(-2),"price_vnd":1500000,"paid_vnd":1500000,"status":"active","created_at":D(-32)}],
 "package_uses":[]}
B='http://localhost:8779/coach/'
DB=lambda pg: pg.evaluate("JSON.parse(localStorage.getItem('fakedb'))")
def login(pg,uid,hash):
    if not pg.url.startswith('http'): pg.goto(B+'#/login')
    pg.evaluate("u=>{sessionStorage.clear();sessionStorage.setItem('fake_tab_auth',JSON.stringify({user:{id:u}}))}",uid); pg.goto(B+'#/'); pg.goto(B+hash)
try:
 with sync_playwright() as p:
  b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':844});errs=[]
  ctx.route('**/cdn.jsdelivr.net/**',lambda r:r.fulfill(status=200,content_type='application/javascript',body=fake))
  ctx.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(status=200,content_type='text/css',body=''))
  co=ctx.new_page();co.on('pageerror',lambda e:errs.append('coach '+str(e)));co.on('dialog',lambda d:d.accept())
  co.goto(B);co.evaluate("d=>{localStorage.clear();localStorage.setItem('fakedb',JSON.stringify(d))}",db)
  # 1. Bảng tổng nhóm
  login(co,'c1','#/coach');co.wait_for_selector('#group li')
  order=co.eval_on_selector_all('#group li','els=>els.map(e=>e.dataset.client)')
  ok(f'1 khách có vấn đề gói lên trước khách bình thường ({order})', order.index(N)==3)
  t=lambda c: co.inner_text(f'#group li[data-client={c}]')
  ok('2 lý do: đã khóa / hết hạn ân hạn / còn nợ; nhãn Offline', 'app đã khóa' in t(L) and 'gói hết hạn 2 ngày' in t(G) and 'còn nợ 1.000.000 đ' in t(A) and 'Offline' in t(A) and 'Online' in t(N))
  # 2. Trang khách A: gói
  co.goto(B+f'#/coach/client/{A}');co.wait_for_selector('[data-pkg=pA]')
  ok('3 gói A: còn 3/3 buổi · không thời hạn, giá 3.000.000 đ, còn nợ 1.000.000 đ, hình thức Offline',
     'còn 3/3 buổi · không thời hạn' in co.inner_text('[data-pkg=pA]') and 'còn nợ 1.000.000 đ' in co.inner_text('[data-pkg=pA]') and co.input_value('#cmode')=='offline')
  co.click('[data-use=pA]');co.wait_for_selector('#udlg[open]');co.fill('#uf [name=note]','PT ngoài lịch');co.click('#uf .btn--primary');co.wait_for_selector('text=Đã trừ 1 buổi.')
  co.wait_for_selector('[data-pkg=pA] >> text=còn 2/3 buổi')
  u=[x for x in DB(co)['package_uses'] if x['package_id']=='pA']
  ok('4 trừ tay 1 buổi (PT ngoài lịch) → còn 2/3, lưu ngày + ghi chú', len(u)==1 and u[0]['used_on']==D(0) and u[0]['note']=='PT ngoài lịch' and u[0]['session_id'] is None)
  co.click('[data-pkg=pA] summary');co.click('[data-unuse]');co.wait_for_selector('[data-pkg=pA] >> text=còn 3/3 buổi')
  ok('5 hoàn lại buổi → còn 3/3', not [x for x in DB(co)['package_uses'] if x['package_id']=='pA'])
  co.click('#newpkg');co.wait_for_selector('#pdlg[open]');co.fill('#pf [name=total]','8');co.select_option('#pf [name=dur]','1');co.fill('#pf [name=price]','3,5tr');co.fill('#pf [name=paid]','1tr')
  prev=co.inner_text('#pprev');co.click('#pf .btn--primary');co.wait_for_selector('text=Đã thêm gói.')
  np_=[x for x in DB(co)['packages'] if x['client_id']==A and x['id']!='pA'][0]
  ok(f'6 gói mới 8 buổi · 1 tháng ({prev}): hết hạn {end1m}, giá 3.500.000, trả 1.000.000', np_['total_sessions']==8 and np_['end_date']==end1m and np_['price_vnd']==3500000 and np_['paid_vnd']==1000000 and '8 buổi · 1 tháng' in prev)
  co.click(f'[data-pkg="{np_["id"]}"] [data-end]');co.wait_for_selector('text=Đã kết thúc gói.')
  ok('7 kết thúc gói → trạng thái ended, hiện "Đã kết thúc"', [x for x in DB(co)['packages'] if x['id']==np_['id']][0]['status']=='ended' and 'Đã kết thúc' in co.inner_text(f'[data-pkg="{np_["id"]}"]'))
  co.select_option('#cmode','hybrid');co.wait_for_selector('text=Đã đổi sang Kết hợp.')
  ok('8 đổi hình thức → Kết hợp', [x for x in DB(co)['profiles'] if x['id']==A][0]['coach_mode']=='hybrid')
  # 3. Soạn buổi: chọn loại buổi
  co.goto(B+'#/coach/session/sself');co.wait_for_selector('#sm')
  co.select_option('#sm','pt');co.click('#save');co.wait_for_timeout(700)
  ok('9 màn soạn buổi: đổi "Khách tự tập" → "PT tại chỗ" lưu vào sessions.mode', [x for x in DB(co)['sessions'] if x['id']=='sself'][0]['mode']=='pt')
  co.select_option('#sm','self');co.click('#save');co.wait_for_timeout(700)
  co.goto(B+f'#/coach/client/{A}/plan');co.wait_for_selector('text=PT chân')
  ok('10 giáo án coach: buổi PT có nhãn PT', 'PT ·' in co.inner_text('main'))
  # 4. Coach ghi buổi PT → trừ gói
  co.goto(B+'#/coach/review/spt');co.wait_for_selector('text=Buổi PT tại chỗ')
  ok('11 trang kết quả buổi PT: "chưa trừ gói" + nút ghi kết quả', 'chưa trừ gói' in co.inner_text('main'))
  co.click('text=Ghi kết quả buổi PT');co.wait_for_selector('#fin')
  ok('12 coach mở được phiếu buổi PT (không bị chuyển về trang xem)', '/client/session/spt' in co.url and 'bạn ghi kết quả cho Khách A' in co.inner_text('main') and co.inner_text('.tabbar [aria-current=page]')=='Khách')
  for n in (1,2): co.click(f'[data-item=i1] tr[data-set="{n}"] [data-done]')
  co.wait_for_function("document.querySelectorAll('[data-item=i1] [data-done].btn--primary').length===2")
  co.select_option('#fin [name=rpe]','8');co.click('#fin .btn--primary');co.wait_for_selector('text=Đã lưu và trừ 1 buổi')
  msg=co.inner_text('.toast');co.wait_for_selector('text=đã trừ gói ngày')
  d=DB(co);u=[x for x in d['package_uses'] if x['session_id']=='spt'];fb=[x for x in d['session_feedback'] if x['session_id']=='spt'][0]
  ok(f'13 hoàn thành buổi PT → trừ 1 buổi gói 3 buổi ({msg})', len(u)==1 and u[0]['package_id']=='pA' and 'còn 2/3 buổi' in msg and fb['completed'] and fb['coach_reviewed'])
  ok('14 set_logs do coach ghi gắn đúng khách A', len([x for x in d['set_logs'] if x['block_item_id']=='i1' and x['client_id']==A])==2)
  co.click('text=Sửa kết quả');co.wait_for_selector('#fin');co.click('#fin .btn--primary');co.wait_for_selector('text=đã được trừ gói trước đó');co.wait_for_selector('#rv')
  ok('15 lưu lại buổi PT không trừ lần 2', len([x for x in DB(co)['package_uses'] if x['session_id']=='spt'])==1)
  # 5. Khách A
  cl=ctx.new_page();cl.on('pageerror',lambda e:errs.append('client '+str(e)))
  login(cl,A,'#/client');cl.wait_for_selector('#pkgcard')
  ok('16 khách thấy gói: "3 buổi PT · còn 2/3 buổi"', '3 buổi PT' in cl.inner_text('#pkgcard') and 'còn 2/3 buổi' in cl.inner_text('#pkgcard'))
  cl.goto(B+'#/client/plan');cl.wait_for_selector('text=PT chân')
  ok('17 lịch tập khách: buổi PT ghi "Tập với Coach"', 'Tập với Coach' in cl.inner_text('main'))
  r=cl.evaluate("""async()=>{const m=await import('/coach/js/supabaseClient.js');const db=await m.sb();
     const a=await db.from('packages').insert({client_id:'a1',total_sessions:99,start_date:'2026-01-01'});
     const b=await db.from('package_uses').delete().eq('client_id','a1');const c=await db.from('profiles').select('coach_mode').eq('id','a1').single();return [!!a.error,!!b.error]}""")
  ok('18 khách không tự thêm gói / xóa buổi đã dùng (RLS)', r==[True,True])
  # 6. Khóa app
  lk=ctx.new_page();lk.on('pageerror',lambda e:errs.append('lock '+str(e)))
  login(lk,L,'#/client');lk.wait_for_selector('#locked')
  t1=lk.inner_text('#locked');lk.goto(B+'#/client/plan');lk.wait_for_selector('#locked')
  ok(f'19 khách online hết hạn quá 3 ngày → màn hình khóa ở mọi trang, giữ dữ liệu, có Đăng xuất', 'Gói tập đã hết hạn' in t1 and D(-5)[8:10]+'/'+D(-5)[5:7] in t1 and lk.locator('#lout').count()==1 and lk.locator('#tabbar a').count()==0)
  gr=ctx.new_page();gr.on('pageerror',lambda e:errs.append('grace '+str(e)))
  login(gr,G,'#/client');gr.wait_for_selector('main .card')
  ok('20 hết hạn 2 ngày → chưa khóa, báo "khóa sau 2 ngày"', gr.locator('#locked').count()==0 and 'khóa sau 2 ngày' in gr.inner_text('main'))
  # coach gia hạn → khách mở lại
  co.goto(B+f'#/coach/client/{L}');co.wait_for_selector('text=App của khách đang khóa')
  co.click('#newpkg');co.wait_for_selector('#pdlg[open]');co.select_option('#pf [name=dur]','1');co.click('#pf .btn--primary');co.wait_for_selector('text=Đã thêm gói.')
  lk.evaluate("location.reload()");lk.wait_for_selector('main');time.sleep(1.2)
  ok('21 coach thêm gói 1 tháng → khách hết khóa', lk.locator('#locked').count()==0)
  # 7. Tập của tôi
  co.goto(B+'#/coach');co.wait_for_selector('#self');co.click('#self');co.wait_for_selector('#back')
  ok('22 "Mở chế độ tập" → giao diện khách của chính coach, có nút "← Về Coach"', co.url.endswith('#/client') and 'Ngô Đức Anh' in co.inner_text('main'))
  co.goto(B+'#/');co.wait_for_selector('#back')
  ok('23 mở lại app (#/) vẫn ở chế độ tập — không cần đăng xuất', co.url.endswith('#/client'))
  W=MON;co.goto(B+f'#/client/checkin?w={W}');co.wait_for_selector('#cf')
  for col,v in (('sleep_score',4),('stress_score',2),('energy_score',5)): co.click(f'#cf [data-score={col}][data-v="{v}"]')
  co.click('#cf .btn--primary');co.wait_for_selector('text=Đã gửi check-in ✓')
  ci=[x for x in DB(co)['weekly_checkins'] if x['client_id']=='c1']
  ok('24 coach tự check-in cho mình: lưu đủ điểm (không bị chặn như khi sửa của khách)', len(ci)==1 and [ci[0]['sleep_score'],ci[0]['stress_score'],ci[0]['energy_score']]==[4,2,5])
  co.goto(B+'#/client');co.wait_for_selector('#back');co.click('#back');co.wait_for_selector('#group li')
  co.goto(B+'#/');co.wait_for_selector('#group li')
  ok('25 "← Về Coach" → về bảng khách; mở lại app ở chế độ coach', co.url.endswith('#/coach'))
  cl.goto(B+'#/client');cl.wait_for_selector('#pkgcard')
  ok('26 không tràn ngang ở 390 px', all(x.evaluate("document.documentElement.scrollWidth<=innerWidth+1") for x in (co,cl,lk)))
  ok('27 không lỗi JavaScript', not errs)
  if errs: print(errs)
  b.close()
except Exception as ex_:
  import traceback;traceback.print_exc();R.append('FAIL lỗi chạy test: '+str(ex_))
finally:
  srv.terminate()
print('\n'.join(R)); print(f"{sum(r.startswith('PASS') for r in R)}/{len(R)} PASS")
