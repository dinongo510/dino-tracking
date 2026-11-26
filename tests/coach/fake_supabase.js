const KEY='dcoach_auth'; const sess=()=>JSON.parse(localStorage.getItem(KEY)||'null');
const users={'coach@x.vn':'c1','a@x.vn':'a1'};
const DB=JSON.parse(localStorage.getItem('fakedb')||'null')||{
 profiles:[{id:'c1',role:'coach',full_name:'Dino',coach_id:null,status:'active',created_at:'2026-11-01'},
           {id:'a1',role:'client',full_name:'Khách A',phone:'090',coach_id:'c1',status:'active',created_at:'2026-11-20'}],
 health_intakes:[],measurements:[],progress_photos:[],inbody_scans:[],assessments:[],coach_notes:[],
 exercises:[{id:'e1',name_vi:'Lăn foam cơ khép',corrective_step:'inhibit',tags:['ohsa:knees_in']},{id:'e2',name_vi:'Đi ngang với band',corrective_step:'activate',tags:['ohsa:knees_in']},{id:'e3',name_vi:'Squat với band quanh gối',corrective_step:'integrate',tags:['ohsa:knees_in']}]};
const persist=()=>localStorage.setItem('fakedb',JSON.stringify(DB));
let n=0; const uid=()=>'id'+(++n)+Date.now();
function canSee(t,row,me){const prof=DB.profiles.find(p=>p.id===me);
  if(t==='exercises')return true;
  if(t==='profiles')return row.id===me||row.coach_id===me||row.id===prof?.coach_id;
  if(t==='coach_notes')return prof?.role==='coach';
  const c=DB.profiles.find(p=>p.id===row.client_id);return row.client_id===me||c?.coach_id===me;}
function Q(t){DB[t]||=[];const me=sess()?.user.id;let f=[],ords=[],lim=null,op='select',payload=null,conf=null;
 const rows=()=>{let r=DB[t].filter(x=>canSee(t,x,me)&&f.every(fn=>fn(x)));r.sort((a,b)=>{for(const o of ords){if(a[o.k]===b[o.k])continue;return (a[o.k]>b[o.k]?1:-1)*(o.asc?1:-1)}return 0});if(lim)r=r.slice(0,lim);return r;};
 const exec=()=>{ if(op!=='select'&&['exercises','foods','meal_templates','day_plan_templates'].includes(t)&&DB.profiles.find(p=>p.id===me)?.role!=='coach') return {data:null,error:{message:'new row violates row-level security policy'}};
  if(op==='insert'){const r={id:uid(),created_at:new Date().toISOString(),entered_by:me,measured_on:new Date().toISOString().slice(0,10),scanned_on:new Date().toISOString().slice(0,10),...payload};DB[t].push(r);persist();return{data:r,error:null};}
  if(op==='upsert'){const ex=DB[t].find(x=>x[conf]===payload[conf]);if(ex)Object.assign(ex,payload);else DB[t].push({id:uid(),entered_by:me,...payload});persist();return{error:null};}
  if(op==='update'){rows().forEach(x=>Object.assign(x,payload));persist();return{error:null};}
  if(op==='delete'){const del=new Set(rows());DB[t]=DB[t].filter(x=>!del.has(x));persist();return{error:null};}
  return{data:rows(),error:null};};
 const api={select(){return api},eq(k,v){f.push(x=>x[k]===v);return api},overlaps(k,arr){f.push(x=>(x[k]||[]).some(v=>arr.includes(v)));return api},
  order(k,o={}){ords.push({k,asc:o.ascending!==false});return api},limit(l){lim=l;return api},
  insert(p){op='insert';payload=p;return api},upsert(p,o){op='upsert';payload=p;conf=o.onConflict;return api},update(p){op='update';payload=p;return api},delete(){op='delete';return api},
  single(){const r=exec().data;return Promise.resolve(r.length===1?{data:r[0],error:null}:{data:null,error:{message:'not found'}})},
  maybeSingle(){return Promise.resolve({data:exec().data[0]||null,error:null})},
  then(res,rej){try{res(exec())}catch(e){rej(e)}}};return api;}

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
 onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},from:Q,storage:storageApi};}
