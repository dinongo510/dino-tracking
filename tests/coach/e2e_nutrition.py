# DINO-011 — Chạy từ gốc repo: python tests/coach/e2e_nutrition.py
import subprocess,time,json,os,sys,datetime,base64,tempfile
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('DCOACH_ROOT') or os.path.abspath(os.path.join(HERE,'..','..'))
FAKE=os.environ.get('DCOACH_FAKE') or os.path.join(HERE,'fake_supabase.js')
srv=subprocess.Popen([sys.executable,'-m','http.server','8775','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
fake=open(FAKE,encoding='utf-8').read();R=[]
def ok(n,c):R.append(('PASS' if c else 'FAIL')+' '+n)
TODAY=datetime.date.today().isoformat()
def F(i,n,g,kcal,p,c,f,serv='100 g'): return {"id":i,"name_vi":n,"food_group":g,"serving":serv,"kcal":kcal,"protein_g":p,"carb_g":c,"fat_g":f,"source":"test"}
foods=[F('ga','Ức gà luộc','protein',165,31,0,3.6),F('ca','Cá basa','protein',130,18,0,6),F('bo','Thăn bò','protein',200,29,0,9),F('heo','Thăn heo nạc','protein',145,26,0,4),
 F('trung','Trứng gà','protein',72,6.3,0.4,4.8,'1 quả'),F('com','Cơm trắng','carb',200,4,44,0.4,'1 chén'),F('kl','Khoai lang','carb',130,2,30,0.2),F('yen','Yến mạch','carb',150,5,27,2.5,'40 g'),
 F('rau','Rau luộc','veg',30,2,5,0.3,'1 đĩa'),F('tao','Táo','fruit',80,0.3,21,0.2,'1 quả'),F('whey','Whey protein','protein',120,24,3,1.5,'1 muỗng')]
mt=[{"id":"m1","name":"Yến mạch whey","slot":"sang","tags":[],"items":[{"food_id":"yen","qty":1},{"food_id":"whey","qty":1}],"kcal":270,"protein_g":29,"carb_g":30,"fat_g":4},
 {"id":"m2","name":"Cơm gà rau","slot":"trua","tags":[],"items":[{"food_id":"com","qty":1.5},{"food_id":"ga","qty":1.5},{"food_id":"rau","qty":1}],"kcal":578,"protein_g":54,"carb_g":71,"fat_g":6},
 {"id":"m3","name":"Khoai cá","slot":"toi","tags":[],"items":[{"food_id":"kl","qty":1.5},{"food_id":"ca","qty":1.5},{"food_id":"rau","qty":1}],"kcal":420,"protein_g":32,"carb_g":50,"fat_g":9},
 {"id":"m4","name":"Trứng táo","slot":"phu","tags":[],"items":[{"food_id":"trung","qty":2},{"food_id":"tao","qty":1}],"kcal":224,"protein_g":13,"carb_g":22,"fat_g":10}]
dp=[{"id":"d1","name":"Giảm mỡ mẫu ~1492","goal":"fat_loss","meals":[{"slot":"sang","template_id":"m1"},{"slot":"trua","template_id":"m2"},{"slot":"toi","template_id":"m3"},{"slot":"phu","template_id":"m4"}],"kcal":1492,"protein_g":128,"carb_g":173,"fat_g":29}]
db={"profiles":[{"id":"c1","role":"coach","full_name":"Dino","coach_id":None,"status":"active","created_at":"2026-11-01"},
   {"id":"a1","role":"client","full_name":"Khách A","coach_id":"c1","status":"active","created_at":"2026-11-20"},
   {"id":"b1","role":"client","full_name":"Khách B","coach_id":"c1","status":"active","created_at":"2026-11-20"}],
 "health_intakes":[{"id":"h1","client_id":"a1","updated_at":"2026-11-25","sex":"male","dob":"1996-01-01","height_cm":175,"goal":"fat_loss","activity_factor":1.375,"parq":{},"lifestyle":{},"diet":{}},
   {"id":"h2","client_id":"b1","updated_at":"2026-11-25","parq":{},"lifestyle":{},"diet":{}}],
 "measurements":[{"id":"me1","client_id":"a1","measured_on":"2026-11-20","weight_kg":80,"created_at":"2026-11-20"}],
 "foods":foods,"meal_templates":mt,"day_plan_templates":dp,"exercises":[]}
B='http://localhost:8775/coach/'
DB=lambda pg: pg.evaluate("JSON.parse(localStorage.getItem('fakedb'))")
def login(pg,uid,hash):
    if not pg.url.startswith('http'): pg.goto(B+'#/login')
    pg.evaluate("u=>{sessionStorage.clear();sessionStorage.setItem('fake_tab_auth',JSON.stringify({user:{id:u}}))}",uid); pg.goto(B+'#/'); pg.goto(B+hash)
png=os.path.join(tempfile.gettempdir(),'meal.png')
open(png,'wb').write(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGP8z8DwnwEJMDGgAQBVhQH/7bh3xgAAAABJRU5ErkJggg=='))
try:
 with sync_playwright() as p:
  b=p.chromium.launch();ctx=b.new_context(viewport={'width':1280,'height':900});errs=[]
  ctx.route('**/cdn.jsdelivr.net/**',lambda r:r.fulfill(status=200,content_type='application/javascript',body=fake))
  co=ctx.new_page();co.on('pageerror',lambda e:errs.append('coach: '+str(e)));co.on('dialog',lambda d:d.accept())
  co.goto(B);co.evaluate("d=>{localStorage.clear();localStorage.setItem('fakedb',JSON.stringify(d))}",db)
  # 1. Mục tiêu
  login(co,'c1','#/coach/client/a1');co.wait_for_selector('text=Dinh dưỡng →');co.click('text=Dinh dưỡng →');co.wait_for_selector('#tf')
  t=co.inner_text('main')
  ok('1 tự tính: Mifflin BMR 1749 · TDEE 2405 · 1980 kcal P176 C175 F64', 'BMR 1749 · TDEE 2405' in t and '1980 kcal · P 176 · C 175 · F 64' in t)
  ok('2 form điền sẵn đề xuất', co.input_value('#tf [name=kcal]')=='1980' and co.input_value('#tf [name=carb_g]')=='175')
  co.fill('#tf [name=kcal]','2000');co.dispatch_event('#tf [name=kcal]','input')
  ok('3 sửa kcal 2000 → tinh bột tự tính 180', co.input_value('#tf [name=carb_g]')=='180')
  co.click('#tf .btn--primary');co.wait_for_selector('text=Đang áp dụng từ')
  tg=DB(co)['nutrition_targets']
  ok('4 duyệt → nutrition_targets approved 2000/176/180/64, formula mifflin', len(tg)==1 and tg[0]['status']=='approved' and [tg[0][k] for k in ('kcal','protein_g','carb_g','fat_g')]==[2000,176,180,64] and tg[0]['formula']=='mifflin')
  # 2. Áp thực đơn mẫu
  co.select_option('#dpSel','d1');co.click('#dpApply');co.wait_for_selector('[data-slot] >> nth=3')
  d=DB(co);sl=sorted(d['meal_slots'],key=lambda x:x['order_no'])
  ok('5 áp thực đơn mẫu: 4 bữa Sáng/Trưa/Tối/Phụ, 4 phương án', [s['name'] for s in sl]==['Sáng','Trưa','Tối','Phụ'] and len(d['meal_options'])==4)
  tr=[o for o in d['meal_options'] if o['slot_id']==sl[1]['id']][0]
  ok('6 nhân hệ số 2000/1492=1,34 làm tròn 0,5: cơm 1,5→2, gà 1,5→2, rau 1→1,5', [i['qty'] for i in tr['items']]==[2,2,1.5])
  # 3. Gợi ý phương án bữa Trưa
  co.click(f'[data-slot="{sl[1]["id"]}"] [data-suggest]');co.wait_for_selector(f'[data-slot="{sl[1]["id"]}"] [data-pick]')
  sug=co.locator(f'[data-slot="{sl[1]["id"]}"] [data-sug] li')
  ok('7 gợi ý ra 3 lựa chọn', sug.count()==3)
  co.click(f'[data-slot="{sl[1]["id"]}"] [data-pick="0"]');co.wait_for_selector('text=Đã thêm phương án.')
  co.wait_for_timeout(400);card=co.inner_text(f'[data-slot="{sl[1]["id"]}"]')
  ok('8 phương án gợi ý được lưu và hiện ✓ vừa khung', card.count('✓ vừa khung')>=1 and len([o for o in DB(co)['meal_options'] if o['slot_id']==sl[1]['id']])==2)
  # 4. Soạn tay phương án bữa Tối
  co.click(f'[data-slot="{sl[2]["id"]}"] [data-build]');co.wait_for_selector('#dob[open]')
  co.fill('#obQ','than bo');co.click('#obRes [data-add=bo]');co.fill('#obQ','com');co.click('#obRes [data-add=com]')
  co.fill('#obRows [data-q="0"]','2');co.dispatch_event('#obRows [data-q="0"]','change')
  ok('9 hộp soạn: tìm không dấu, tổng sống 600 kcal', '600 kcal' in co.inner_text('#obTot'))
  co.fill('#fob [name=label]','Bò cơm');co.click('#fob .btn--primary');co.wait_for_selector('text=Đã lưu phương án.')
  bo=[o for o in DB(co)['meal_options'] if o['label']=='Bò cơm']
  ok('10 lưu phương án tay (kcal 600, đạm 62)', len(bo)==1 and bo[0]['kcal']==600 and bo[0]['protein_g']==62)
  # 5. Mẫu bữa + xóa phương án
  co.wait_for_selector(f'[data-slot="{sl[0]["id"]}"] [data-mt]');co.select_option(f'[data-slot="{sl[0]["id"]}"] [data-mt]','m1');co.wait_for_selector('text=Đã thêm "Yến mạch whey"')
  co.wait_for_timeout(300);n0=len(DB(co)['meal_options'])
  co.click(f'[data-slot="{sl[0]["id"]}"] [data-delopt] >> nth=0');co.wait_for_timeout(600)
  ok('11 thêm từ mẫu bữa rồi xóa 1 phương án', n0==7 and len(DB(co)['meal_options'])==6)
  ok('11b nhãn ✗ ghi rõ lý do (thừa/thiếu kcal, thiếu đạm)', any(k in co.inner_text('main') for k in ('% kcal','thiếu đạm')) and '✗ lệch khung' not in co.inner_text('main'))
  # 6. Kho món: dán 20 món CSV
  co.goto(B+'#/coach/foods');co.wait_for_selector('#fl li')
  ok('12 kho món: 11 món, tìm không dấu', '11/11 món' in co.inner_text('#fc'))
  co.click('#fcsv');csv='\n'.join(['tên;khẩu phần;kcal;đạm;tinh bột;béo;nguồn']+[f'Món thử {i};1 tô;{400+i};20,5;50;10;quán' for i in range(1,20)]+['Ức gà luộc;100 g;170;32;0;4;sửa'])
  co.fill('#csvIn',csv);co.click('#csvChk')
  ok('13 xem trước: 20 hợp lệ, 1 trùng tên → cập nhật', '20' in co.inner_text('#csvPrev strong') and '1 trùng tên' in co.inner_text('#csvPrev'))
  co.click('#csvSave');co.wait_for_selector('text=Đã lưu 20 món.')
  fd=DB(co)['foods']
  ok('14 lưu đúng: 30 món, "Món thử 1" đạm 20,5, Ức gà cập nhật 170', len(fd)==30 and [f for f in fd if f['name_vi']=='Món thử 1'][0]['protein_g']==20.5 and [f for f in fd if f['name_vi']=='Ức gà luộc'][0]['kcal']==170)
  # 7. Khách: tab Ăn, check 4 bữa
  cl=ctx.new_page();cl.on('pageerror',lambda e:errs.append('client: '+str(e)))
  login(cl,'a1','#/client');cl.wait_for_selector('.tabbar a:has-text("Ăn")');cl.click('.tabbar a:has-text("Ăn")');cl.wait_for_selector('[data-slot] >> nth=3')
  t=cl.inner_text('main')
  ok('15 tab Ăn: mục tiêu 2000 kcal, 4 bữa, có phương án', '2000 kcal' in t and cl.locator('[data-slot]').count()==4 and 'Cơm gà rau' in t)
  t0=time.time()
  for i,l in enumerate(['on','near','on','off']): cl.click(f'[data-slot] >> nth={i} >> [data-level={l}]');cl.wait_for_timeout(150)
  cl.wait_for_timeout(500);dt=time.time()-t0
  ck=[c for c in DB(cl).get('meal_checks',[]) if c['client_id']=='a1']
  ok(f'16 check 4 bữa bằng 4 lần bấm ({dt:.1f} giây)', len(ck)==4 and sorted(c['level'] for c in ck)==['near','off','on','on'] and all(c['check_date']==TODAY for c in ck))
  cl.click(f'[data-slot] >> nth=1 >> input[type=radio] >> nth=1');cl.wait_for_timeout(400)
  tr_ck=[c for c in DB(cl)['meal_checks'] if c['slot_id']==sl[1]['id']][0]
  ok('17 đổi phương án sau khi check → lưu option_id mới', tr_ck['option_id']!=tr['id'])
  cl.set_input_files('[data-slot] >> nth=0 >> [data-photo]',png);cl.wait_for_selector('text=Đã lưu ảnh bữa ăn.');cl.wait_for_selector('[data-slot] >> nth=0 >> img')
  ph=[c for c in DB(cl)['meal_checks'] if c['slot_id']==sl[0]['id']][0]['photo_path']
  ok('18 ảnh bữa ăn lưu ở <client_id>/meals/', ph.startswith('a1/meals/'))
  cl.fill('[data-slot] >> nth=3 >> [data-note]','Ăn thêm 1 ly trà sữa');cl.dispatch_event('[data-slot] >> nth=3 >> [data-note]','change');cl.wait_for_selector('text=Đã lưu ghi chú.')
  ok('19 ghi chú lưu', [c for c in DB(cl)['meal_checks'] if c['slot_id']==sl[3]['id']][0]['note']=='Ăn thêm 1 ly trà sữa')
  cl.reload();cl.wait_for_selector('[data-slot] >> nth=3')
  ok('20 tuân thủ 7 ngày = (1+0,5+1+0)/(4×7) = 9%', 'Tuân thủ 7 ngày' in cl.inner_text('main') and '9%' in cl.inner_text('main'))
  cl.click('text=← Hôm trước');cl.wait_for_selector('text=Hôm sau →')
  ok('21 xem ngày hôm trước: chưa có check', cl.locator('[data-level][style*="background"]').count()==0)
  # 8. Coach xem nhật ký
  co.goto(B+'#/coach/client/a1/nutrition');co.wait_for_selector('text=Nhật ký ăn 7 ngày')
  t=co.inner_text('main')
  ok('22 coach: nhật ký hôm nay đủ mức + ảnh + ghi chú, tuân thủ 9%', 'Tuân thủ 9%' in t and t.count('Gần đúng')>=1 and 'Ăn thêm 1 ly trà sữa' in t and co.locator('img[src^="data:image"]').count()==1)
  # 9. Bảo mật
  bb=ctx.new_page();login(bb,'b1','#/client/eat');bb.wait_for_selector('text=Chưa có thực đơn')
  r=bb.evaluate("""async(p)=>{const m=await import('/coach/js/supabaseClient.js');const db=await m.sb();
     const a=await db.from('meal_checks').select('*').eq('client_id','a1');
     const u=await db.storage.from('progress').createSignedUrls([p],60);
     const t=await db.from('nutrition_targets').insert({client_id:'b1',kcal:5000,status:'approved'});
     const f=await db.from('foods').insert({name_vi:'hack',serving:'1',kcal:1});
     return {n:a.data.length,url:u.data[0].signedUrl,terr:!!t.error,ferr:!!f.error}}""",ph)
  ok('23 khách B: không thấy check/ảnh của A, không tự duyệt mục tiêu, không sửa kho món', r['n']==0 and r['url'] is None and r['terr'] and r['ferr'])
  ok('24 không lỗi JS', not errs)
  if errs: print(errs[:3])
  b.close()
except Exception as e:
  print('EXC',str(e)[:400])
finally:
  srv.terminate()
print('\n'.join(R));print(f"{sum(r.startswith('PASS') for r in R)}/{len(R)} PASS")
