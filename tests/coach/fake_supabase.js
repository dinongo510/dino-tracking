const KEY='dcoach_auth'; const sess=()=>JSON.parse(sessionStorage.getItem('fake_tab_auth')||localStorage.getItem(KEY)||'null');
const users={'coach@x.vn':'c1','a@x.vn':'a1'};
const DB=JSON.parse(localStorage.getItem('fakedb')||'null')||{
 profiles:[{id:'c1',role:'coach',full_name:'Dino',coach_id:null,status:'active',created_at:'2026-11-01'},
           {id:'a1',role:'client',full_name:'Khách A',phone:'090',coach_id:'c1',status:'active',created_at:'2026-11-20'}],
 health_intakes:[],measurements:[],progress_photos:[],inbody_scans:[],assessments:[],coach_notes:[],
 exercises:[{id:'e1',name_vi:'Lăn foam cơ khép',corrective_step:'inhibit',tags:['ohsa:knees_in']},{id:'e2',name_vi:'Đi ngang với band',corrective_step:'activate',tags:['ohsa:knees_in']},{id:'e3',name_vi:'Squat với band quanh gối',corrective_step:'integrate',tags:['ohsa:knees_in']}]};
const persist=()=>localStorage.setItem('fakedb',JSON.stringify(DB));
let n=0; const uid=()=>'id'+(++n)+Date.now();
function canSee(t,row,me){const prof=DB.profiles.find(p=>p.id===me);
  if(['exercises','foods','meal_templates','day_plan_templates'].includes(t))return true;
  if(t==='program_templates')return row.coach_id===me;
  if(t==='profiles')return row.id===me||row.coach_id===me||row.id===prof?.coach_id;
  if(t==='coach_notes')return prof?.role==='coach';
  const c=DB.profiles.find(p=>p.id===row.client_id);return row.client_id===me||c?.coach_id===me;}
function reloadDB(){const x=localStorage.getItem('fakedb');if(x){const d=JSON.parse(x);for(const k of Object.keys(d))DB[k]=d[k];}}
function Q(t){reloadDB();DB[t]||=[];const me=sess()?.user.id;let f=[],ords=[],lim=null,op='select',payload=null,conf=null,ignoreDup=false;
 const rows=()=>{let r=DB[t].filter(x=>canSee(t,x,me)&&f.every(fn=>fn(x)));r.sort((a,b)=>{for(const o of ords){if(a[o.k]===b[o.k])continue;return (a[o.k]>b[o.k]?1:-1)*(o.asc?1:-1)}return 0});if(lim)r=r.slice(0,lim);return r;};
 const COACH_ONLY=['nutrition_targets','meal_slots','meal_options','alerts','exercises','foods','meal_templates','day_plan_templates','programs','phases','sessions','session_blocks','block_items','program_templates','tracked_lifts','packages','package_uses'];
 const KIDS={meal_slots:['meal_options','slot_id'],programs:['phases','program_id'],phases:['sessions','phase_id'],sessions:['session_blocks','session_id'],session_blocks:['block_items','block_id']};
 const cascade=(tt,ids)=>{const k=KIDS[tt];if(!k||!ids.length)return;DB[k[0]]||=[];const kids=DB[k[0]].filter(x=>ids.includes(x[k[1]]));DB[k[0]]=DB[k[0]].filter(x=>!kids.includes(x));cascade(k[0],kids.map(x=>x.id));};
 const exec=()=>{ if(op!=='select'&&COACH_ONLY.includes(t)&&DB.profiles.find(p=>p.id===me)?.role!=='coach') return {data:null,error:{message:'new row violates row-level security policy'}};
  const arr=Array.isArray(payload)?payload:[payload];
  if(op==='insert'){const out=arr.map(p=>({id:uid(),created_at:new Date().toISOString(),entered_by:me,measured_on:new Date().toISOString().slice(0,10),scanned_on:new Date().toISOString().slice(0,10),...p}));
    for(const r of out){if(DB[t].some(x=>x.id===r.id))return{data:null,error:{message:'duplicate key value violates unique constraint'}};}
    if(t==='messages')for(const r of out){r.author_id=me;r.read_at=null;}for(const r of out)guardRow(t,r,null);DB[t].push(...out);persist();if(t==='messages')for(const r of out)RT.postMessage({table:t,row:r});return{data:Array.isArray(payload)?out:out[0],error:null};}
  if(op==='upsert'){const keys=(conf||'id').split(',');const out=[];for(const p of arr){const ex=DB[t].find(x=>keys.every(k=>x[k]===p[k]));if(ex){if(!ignoreDup){const o={...ex};Object.assign(ex,p);guardRow(t,ex,o);}out.push(ex);}else{const r={id:uid(),created_at:new Date().toISOString(),entered_by:me,...p};guardRow(t,r,null);DB[t].push(r);out.push(r);}}if(t==='session_feedback')out.forEach(feedbackTrigger);persist();return{data:out,error:null};}
  if(op==='update'){rows().forEach(x=>{const o={...x};Object.assign(x,payload);guardRow(t,x,o);});persist();return{error:null};}
  if(op==='delete'){const del=rows();DB[t]=DB[t].filter(x=>!del.includes(x));cascade(t,del.map(x=>x.id));persist();return{error:null};}
  return{data:structuredClone(rows()),error:null};};
 const api={select(){return api},eq(k,v){f.push(x=>x[k]===v);return api},in(k,arr){f.push(x=>arr.includes(x[k]));return api},gte(k,v){f.push(x=>x[k]>=v);return api},lte(k,v){f.push(x=>x[k]<=v);return api},gt(k,v){f.push(x=>x[k]>v);return api},lt(k,v){f.push(x=>x[k]<v);return api},neq(k,v){f.push(x=>x[k]!==v);return api},is(k,v){f.push(x=>v===null?x[k]==null:x[k]===v);return api},not(k,o,v){f.push(x=>o==='is'&&v===null?x[k]!=null:x[k]!==v);return api},overlaps(k,arr){f.push(x=>(x[k]||[]).some(v=>arr.includes(v)));return api},
  order(k,o={}){ords.push({k,asc:o.ascending!==false});return api},limit(l){lim=l;return api},
  insert(p){op='insert';payload=p;return api},upsert(p,o={}){op='upsert';payload=p;conf=o.onConflict;ignoreDup=!!o.ignoreDuplicates;return api},update(p){op='update';payload=p;return api},delete(){op='delete';return api},
  single(){const x=exec();if(x.error)return Promise.resolve(x);const r=[].concat(x.data??[]);return Promise.resolve(r.length===1?{data:r[0],error:null}:{data:null,error:{message:'not found'}})},
  maybeSingle(){const x=exec();return Promise.resolve({data:[].concat(x.data??[])[0]||null,error:x.error})},
  then(res,rej){return new Promise(r=>r(exec())).then(res,rej)}};return api;}


// ---- Realtime giả lập (BroadcastChannel giữa các tab) + trigger cảnh báo như 0007 ----
const RT=new BroadcastChannel('fake-rt'); const subs=new Set();
const RTin=new BroadcastChannel('fake-rt'); RTin.onmessage=(e)=>{const {table,row}=e.data;const me=sess()?.user.id;
  for(const s of subs){if(s.table!==table)continue;const m=/^(\w+)=eq\.(.+)$/.exec(s.filter||'');if(m&&String(row[m[1]])!==m[2])continue;if(!canSee(table,row,me))continue;s.cb({new:row});}};
function feedbackTrigger(fb){if(!fb.completed)return;DB.alerts||=[];const add=(kind,message)=>{const ex=DB.alerts.find(a=>a.client_id===fb.client_id&&a.kind===kind&&a.ref_key===fb.session_id);
  if(ex){ex.message=message;ex.resolved_at=null;}else DB.alerts.push({id:uid(),client_id:fb.client_id,kind,ref_id:fb.session_id,ref_key:fb.session_id,message,created_at:new Date().toISOString(),resolved_at:null});};
  if(fb.pain?.length)add('pain','Khách báo đau: '+fb.pain.map(p=>`${p.area} (${p.level}/5)`).join(', '));
  if(fb.session_rpe>=9.5){const day=id=>DB.sessions?.find(s=>s.id===id)?.scheduled_on||'';const prev=(DB.session_feedback||[]).filter(f=>f.client_id===fb.client_id&&f.completed&&f.session_id!==fb.session_id&&day(f.session_id)<=day(fb.session_id)).sort((a,b)=>day(b.session_id).localeCompare(day(a.session_id)))[0];
    if(prev?.session_rpe>=9.5)add('high_rpe','RPE buổi ≥ 9,5 hai buổi liên tiếp');}}


// ---- Giả lập trigger 0008: check-in / báo cáo giai đoạn ----
function guardRow(t,n,o){const me=sess()?.user.id,coach=DB.profiles.find(p=>p.id===me)?.role==='coach';
  const self=coach&&n.client_id===me; // DINO-014: coach tự làm khách của mình → không chặn
  if(t==='weekly_checkins'&&self){ if(o&&n.coach_reply!==o.coach_reply)n.replied_at=new Date().toISOString(); n.updated_at=new Date().toISOString(); return; }
  if(t==='phase_reviews'&&self){ if(o&&(n.coach_summary!==o.coach_summary||n.next_decisions!==o.next_decisions)&&n.client_agreed_at===o.client_agreed_at)n.client_agreed_at=null; n.status=n.coach_agreed_at&&n.client_agreed_at?'agreed':'open'; return; }
  if(t==='weekly_checkins'){ if(!coach){n.coach_reply=o?o.coach_reply:null;n.replied_at=o?o.replied_at:null;}
    else if(o){for(const k of ['avg_weight_kg','sleep_score','stress_score','energy_score','hardest','client_note','sessions_pct','eat_pct'])n[k]=o[k]; if(n.coach_reply!==o.coach_reply)n.replied_at=new Date().toISOString();}
    n.updated_at=new Date().toISOString();}
  if(t==='phase_reviews'){ if(!coach){for(const k of ['coach_summary','next_decisions','coach_agreed_at'])n[k]=o?o[k]:null;} else {for(const k of ['client_feedback','client_agreed_at'])n[k]=o?o[k]:null;}
    if(o&&(n.coach_summary!==o.coach_summary||n.next_decisions!==o.next_decisions)&&n.client_agreed_at===o.client_agreed_at)n.client_agreed_at=null;
    n.status=n.coach_agreed_at&&n.client_agreed_at?'agreed':'open';}}

// ---- Storage giả lập: lưu dataURL trong localStorage, áp luật thư mục đầu = client_id ----
const SKEY='fakestore'; const store=()=>JSON.parse(localStorage.getItem(SKEY)||'{}'); const saveStore=(o)=>localStorage.setItem(SKEY,JSON.stringify(o));
function canPath(path){const me=sess()?.user.id; const cid=path.split('/')[0]; const c=DB.profiles.find(p=>p.id===cid); return cid===me||c?.coach_id===me;}
const toDataURL=(blob)=>new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(blob);});
const storageApi={from:(bucket)=>({
  async upload(path,blob,opts){ if(!canPath(path)) return {error:{message:'new row violates row-level security policy'}}; const s=store(); if(s[path]&&!opts?.upsert) return {error:{message:'The resource already exists'}}; s[path]={type:blob.type,size:blob.size,data:await toDataURL(blob)}; saveStore(s); return {data:{path},error:null}; },
  async createSignedUrls(paths){ const s=store(); return {data:paths.map(p=>({path:p,signedUrl:(canPath(p)&&s[p])?s[p].data:null,error:null})),error:null}; },
  async remove(paths){ const s=store(); for(const p of paths){ if(!canPath(p)) return {error:{message:'denied'}}; delete s[p]; } saveStore(s); return {data:[],error:null}; },
})};
export function createClient(){return{auth:{getSession:async()=>({data:{session:sess()}}),
 signInWithPassword:async({email,password})=>users[email]&&password==='password1'?(localStorage.setItem(KEY,JSON.stringify({user:{id:users[email]}})),{error:null}):{error:{message:'Invalid login credentials'}},
 signOut:async()=>localStorage.removeItem(KEY),updateUser:async()=>({error:null}),resetPasswordForEmail:async()=>({error:null}),
 onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},from:Q,storage:storageApi,
 channel(){const ch={subs:[],on(type,cfg,cb){this.subs.push({table:cfg.table,filter:cfg.filter,cb});return this},subscribe(){this.subs.forEach(x=>subs.add(x));return this}};return ch;},
 removeChannel(ch){ch.subs.forEach(x=>subs.delete(x));}};}
