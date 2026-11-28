# DINO-009 — Chạy từ gốc repo: python tests/coach/e2e_plan.py
import subprocess,time,json,os,sys,datetime
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('DCOACH_ROOT') or os.path.abspath(os.path.join(HERE,'..','..'))
FAKE=os.environ.get('DCOACH_FAKE') or os.path.join(HERE,'fake_supabase.js')
srv=subprocess.Popen([sys.executable,'-m','http.server','8773','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
fake=open(FAKE,encoding='utf-8').read();R=[]
def ok(n,c):R.append(('PASS' if c else 'FAIL')+' '+n)
today=datetime.date.today(); monday=today-datetime.timedelta(days=today.weekday()); tday=today.weekday()+1
other=1 if tday!=1 else 2
ex=[{"id":"sq","name_vi":"Squat tạ đòn","category":"strength","tags":[],"featured":True,"image_urls":[]},
 {"id":"bp","name_vi":"Đẩy ngực tạ đòn","category":"strength","tags":[],"featured":False,"image_urls":[]},
 {"id":"z2","name_vi":"Chạy nhẹ (Zone 2)","category":"run","tags":["run"],"featured":True,"image_urls":[]},
 {"id":"cr","name_vi":"Chạy compromised 1 km","category":"run","tags":["run","hyrox"],"featured":True,"image_urls":[]},
 {"id":"sl","name_vi":"Kéo sled 50 m","category":"hyrox","tags":["hyrox"],"featured":False,"image_urls":[]},
 {"id":"f1","name_vi":"Lăn foam cơ khép","category":"corrective","corrective_step":"inhibit","tags":["ohsa:knees_in"],"image_urls":[]},
 {"id":"g1","name_vi":"Cầu mông","category":"corrective","corrective_step":"activate","tags":["ohsa:knees_in"],"image_urls":[]}]
tpl={"name":"Mẫu thử 4 tuần","goal":"fat_loss","model":"linear","weeks":4,"handover_note":"Tập đều 3 buổi.","sessions":[
 {"day":tday,"title":"Lower","type":"strength","blocks":[{"type":"straight","label":"A","items":[
   {"exercise":"Squat tạ đòn","sets":4,"reps_min":5,"reps_max":5,"target_rpe":7,"rest_sec":180,"progression_rule":{"type":"rpe_wave","weeks":[7,7.5,8,6]}},
   {"exercise":"Bài không tồn tại","sets":3,"reps_min":10,"reps_max":10}]}]},
 {"day":other,"title":"Chạy Z2","type":"run","blocks":[{"type":"run","items":[{"exercise":"Chạy nhẹ (Zone 2)","sets":1,"duration_sec":1800,"hr_zone":2}]}]}]}
db={"profiles":[{"id":"c1","role":"coach","full_name":"Dino","coach_id":None,"status":"active","created_at":"2026-11-01"},{"id":"a1","role":"client","full_name":"Khách A","coach_id":"c1","status":"active","created_at":"2026-11-20"}],
 "health_intakes":[{"id":"h1","client_id":"a1","updated_at":"2026-11-25","goal":"fat_loss","parq":{},"lifestyle":{},"diet":{}}],"exercises":ex,
 "assessments":[{"id":"as1","client_id":"a1","assessed_on":"2026-11-24","ohsa":{"knees_in":True},"created_at":"2026-11-24"}],
 "program_templates":[{"id":"t1","coach_id":"c1","name":tpl["name"],"goal":"fat_loss","model":"linear","weeks":4,"payload":tpl}]}
B='http://localhost:8773/coach/'
D=lambda pg: pg.evaluate("JSON.parse(localStorage.getItem('fakedb'))")
def login(pg,uid,hash):
    pg.evaluate("u=>{localStorage.setItem('dcoach_auth',JSON.stringify({user:{id:u}}));sessionStorage.clear()}",uid); pg.goto('about:blank'); pg.goto(B+hash)
try:
 with sync_playwright() as p:
  b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  dlg=[];pg.on('dialog',lambda d:(dlg.append(d.message),d.accept(d.default_value) if d.type=='prompt' else d.accept()))
  pg.route('**/cdn.jsdelivr.net/**',lambda r:r.fulfill(status=200,content_type='application/javascript',body=fake))
  pg.goto(B);pg.evaluate("d=>{localStorage.clear();localStorage.setItem('fakedb',JSON.stringify(d))}",db)
  # 1. Trang khách có nút Giáo án
  login(pg,'c1','#/coach/client/a1');pg.wait_for_selector('text=Giáo án tập luyện')
  pg.click('text=Giáo án tập luyện');pg.wait_for_selector('#np')
  ok('1 trang khách → Giáo án → form tạo', pg.is_visible('#np [name=tpl]'))
  # 2. Tạo từ mẫu + sinh tuần
  pg.fill('#np [name=start]',monday.isoformat());pg.select_option('#np [name=tpl]','t1');pg.click('#np .btn--primary')
  pg.wait_for_selector('text=Tuần 4');d=D(pg)
  ss=d['sessions'];ph=d['phases'][0]
  ok(f'2 tạo từ mẫu: 1 giai đoạn 4 tuần, {len(ss)} buổi (cần 8)', len(d['phases'])==1 and ph['weeks']==4 and len(ss)==8 and ph['status']=='draft')
  ok('3 ngày kết thúc + ngày từng buổi đúng', ph['end_date']==(monday+datetime.timedelta(days=27)).isoformat() and
     all(s['scheduled_on']==(monday+datetime.timedelta(days=(s['week_no']-1)*7+s['day_no']-1)).isoformat() for s in ss))
  it=d['block_items'];bl={x['id']:x for x in d['session_blocks']};se={x['id']:x for x in ss}
  sq={se[bl[i['block_id']]['session_id']]['week_no']:i for i in it if i['exercise_id']=='sq'}
  ok(f'4 sóng RPE 7→7.5→8 + deload tuần 4 (sets {sq[4]["sets"]}, RPE {sq[4]["target_rpe"]})', [sq[w]['target_rpe'] for w in (1,2,3)]==[7,7.5,8] and sq[4]['sets']<4)
  ok('5 bài thiếu trong thư viện bị bỏ + báo', not any(i['exercise_id'] is None for i in it) and pg.locator('text=không tìm thấy trong thư viện').count()>=1)
  ok('6 nháp: badge "khách chưa thấy"', pg.locator('text=Nháp — khách chưa thấy').count()==1)
  # 3. Khách chưa thấy nháp
  login(pg,'a1','#/client/plan');pg.wait_for_selector('text=Chưa có lịch tập')
  ok('7 khách: giai đoạn nháp không hiện', pg.locator('text=Chưa có lịch tập').count()==1)
  # 4. Soạn buổi tuần 1: sửa tải, thêm corrective từ OHSA, thêm HYROX + compromised
  login(pg,'c1',f'#/coach/client/a1/plan');pg.wait_for_selector('a[href^="#/coach/session/"]')
  w1=[s for s in ss if s['week_no']==1 and s['day_no']==tday][0]
  old_item=[i for i in it if bl[i['block_id']]['session_id']==w1['id']][0]
  pg.click(f'a[href="#/coach/session/{w1["id"]}"]');pg.wait_for_selector('[data-blk="0"]')
  pg.fill('[data-blk="0"] [data-it="0"] [data-ik=load_kg]','80')
  ok('8 tóm tắt bài cập nhật ngay', '80 kg' in pg.inner_text('[data-blk="0"] [data-it="0"] [data-sum]'))
  pg.select_option('#nbt','corrective');pg.click('#addB');pg.click('[data-blk="1"] [data-ohsa]')
  pg.wait_for_selector('[data-blk="1"] [data-it="1"]')
  ok('9 corrective từ OHSA: thêm Lăn foam + Cầu mông', 'Lăn foam' in pg.inner_text('[data-blk="1"]') and 'Cầu mông' in pg.inner_text('[data-blk="1"]'))
  pg.select_option('#nbt','hyrox');pg.click('#addB');pg.click('[data-blk="2"] [data-addi]');pg.wait_for_selector('#dex[open]')
  ok('10 hộp chọn bài lọc sẵn nhóm HYROX', pg.input_value('#exc')=='hyrox')
  pg.fill('#exq','keo sled');pg.click('#exl [data-id=sl]');pg.click('[data-blk="2"] [data-cmp]')
  t=pg.inner_text('[data-blk="2"]')
  ok('11 HYROX: chèn chạy compromised trước trạm', t.index('Chạy compromised')<t.index('Kéo sled'))
  ok('12 khối HYROX có ô số vòng', pg.locator('[data-blk="2"] [data-bk=rounds]').count()==1)
  pg.click('#save');pg.wait_for_selector('text=Đã lưu buổi tập.');d=D(pg)
  mine=[i for i in d['block_items'] if any(b['id']==i['block_id'] and b['session_id']==w1['id'] for b in d['session_blocks'])]
  same=[i for i in mine if i['id']==old_item['id']]
  ok(f'13 lưu: giữ nguyên id bài cũ + tải 80 kg, tổng {len(mine)} bài', len(same)==1 and same[0]['load_kg']==80 and len(mine)==1+2+2)
  # Xóa 1 bài rồi lưu: chỉ bài đó bị xóa
  pg.click('[data-blk="1"] [data-it="0"] [data-idel]');pg.click('#save');pg.wait_for_selector('text=Đã lưu ✓');d=D(pg)
  mine2=[i for i in d['block_items'] if any(b['id']==i['block_id'] and b['session_id']==w1['id'] for b in d['session_blocks'])]
  ok('14 xóa 1 bài: còn 4, id khác giữ nguyên', len(mine2)==4 and old_item['id'] in [i['id'] for i in mine2])
  # 5. Sinh lại tuần 2–4 (ghi đè) → tuần 2 có khối corrective
  pg.goto(B+'#/coach/client/a1/plan');pg.wait_for_selector('#gen');dlg.clear();pg.click('#gen');pg.wait_for_selector('text=tuần cuối deload')
  d=D(pg);w2=[s for s in d['sessions'] if s['week_no']==2 and s['day_no']==tday]
  nb=len([b for b in d['session_blocks'] if b['session_id']==w2[0]['id']]) if w2 else 0
  ok(f'15 sinh lại tuần 2–4: có hỏi ghi đè, tuần 2 có {nb} khối', len(dlg)==2 and len(d['sessions'])==8 and nb==3)
  # 6. Chép tuần
  pg.click('[data-copy="3"]');pg.wait_for_selector('text=Đã chép tuần 2 sang tuần 3');d=D(pg)
  ok('16 chép tuần 2 → 3 (vẫn 8 buổi, ngày tuần 3 đúng)', len(d['sessions'])==8 and all(s['scheduled_on']==(monday+datetime.timedelta(days=14+s['day_no']-1)).isoformat() for s in d['sessions'] if s['week_no']==3))
  # 7. Lưu thành mẫu
  pg.click('#tplSave');pg.wait_for_selector('#dtp[open]');pg.fill('#ftp [name=name]','Mẫu thử Dino');pg.click('#ftp .btn--primary');pg.wait_for_selector('text=Đã lưu mẫu');pg.wait_for_selector('#tplSave');d=D(pg)
  nt=[t for t in d['program_templates'] if t['name']==ph['name'] or t['name']=='Mẫu thử 4 tuần']
  pg.click('#addPh');pg.wait_for_selector('#dph[open]')
  ok('17b mẫu vừa lưu hiện ngay trong "Bắt đầu từ mẫu" (không cần tải lại)', 'Mẫu thử Dino' in pg.inner_text('#fph [name=tpl]'))
  pg.click('#fph [data-close]')
  ok('17 lưu thành mẫu mới (có khối corrective)', len(d['program_templates'])==2 and len([x for x in d['program_templates'][1]['payload']['sessions'] if x['title']=='Lower'][0]['blocks'])==3)
  # 8. Phát hành → khách thấy
  pg.click('#pub');pg.wait_for_selector('text=Đã phát hành');d=D(pg)
  ok('18 phát hành: giai đoạn + chương trình published', d['phases'][0]['status']=='published' and d['programs'][0]['status']=='published')
  # Giai đoạn 2 nháp
  pg.click('#addPh');pg.wait_for_selector('#dph[open]')
  ok('19 giai đoạn 2 tự đề xuất ngày bắt đầu nối tiếp', pg.input_value('#fph [name=start]')==(monday+datetime.timedelta(days=28)).isoformat())
  pg.click('#fph .btn--primary');pg.wait_for_selector('text=Đã thêm giai đoạn.')
  login(pg,'a1','#/client');pg.wait_for_selector('h2:has-text("Hôm nay")')
  ok('20 khách: trang Hôm nay hiện buổi "Lower"', pg.locator('main a.card:has-text("Lower")').count()==1)
  ok('21 có tab Lịch tập', pg.locator('.tabbar a:has-text("Lịch tập")').count()==1)
  pg.click('.tabbar a:has-text("Lịch tập")');pg.wait_for_selector('text=Tuần 1 ·')
  t=pg.inner_text('main')
  ok('22 lịch tuần 1: 2 buổi, đánh dấu Hôm nay, ghi chú bàn giao, không thấy giai đoạn nháp', 'Hôm nay' in t and 'Tập đều 3 buổi.' in t and pg.locator('main ul.list > li').count()==2 and 'Giai đoạn 1/1' in t)
  pg.click('text=Tuần sau →');pg.wait_for_selector('text=Tuần 2 ·')
  ok('23 chuyển tuần sau', pg.locator('main ul.list > li').count()==2)
  pg.goto(B+'#/client/plan');pg.wait_for_selector('main a:has-text("Lower")');pg.click('main a:has-text("Lower")');pg.wait_for_selector('h1:has-text("Lower")')
  t=pg.inner_text('main')
  ok('24 khách xem buổi: tên bài + 4 × 5 · 80 kg + khối corrective', 'Squat tạ đòn' in t and '4 × 5 · 80 kg' in t and 'Corrective' in t and 'Chạy compromised' in t)
  pg.click('main a:has-text("Squat tạ đòn")');pg.wait_for_selector('h1:has-text("Squat tạ đòn")')
  ok('25 bấm bài → trang chi tiết bài', pg.url.endswith('#/exercise/sq'))
  pg.goto(B+'#/coach/client/a1/plan');pg.wait_for_url('**#/client')
  ok('26 khách gõ link giáo án coach → bị đẩy về', pg.url.endswith('#/client'))
  # 9. Đổi ngày bắt đầu → dời lịch
  login(pg,'c1','#/coach/client/a1/plan?phase='+ph['id']);pg.wait_for_selector('#edPh');pg.click('#edPh')
  nm=monday+datetime.timedelta(days=7);pg.fill('#fph [name=start]',nm.isoformat());pg.click('#fph .btn--primary');pg.wait_for_selector('text=Đã lưu giai đoạn.');d=D(pg)
  s1=[s for s in d['sessions'] if s['phase_id']==ph['id']]
  ok('27 đổi ngày bắt đầu → dời ngày mọi buổi', all(s['scheduled_on']==(nm+datetime.timedelta(days=(s['week_no']-1)*7+s['day_no']-1)).isoformat() for s in s1) and d['phases'][0]['end_date']==(nm+datetime.timedelta(days=27)).isoformat())
  ok('28 không lỗi JS', not errs)
  if errs: print(errs[:3])
  b.close()
finally:
  srv.terminate()
print('\n'.join(R));print(f"{sum(r.startswith('PASS') for r in R)}/{len(R)} PASS")
