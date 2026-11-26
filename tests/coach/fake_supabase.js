const KEY='dcoach_auth'; const sess=()=>JSON.parse(localStorage.getItem(KEY)||'null');
const users={'coach@x.vn':'c1','a@x.vn':'a1'};
const DB=JSON.parse(localStorage.getItem('fakedb')||'null')||{
 profiles:[{id:'c1',role:'coach',full_name:'Dino',coach_id:null,status:'active',created_at:'2026-11-01'},
           {id:'a1',role:'client',full_name:'Khách A',phone:'090',coach_id:'c1',status:'active',created_at:'2026-11-20'}],
 health_intakes:[],measurements:[],inbody_scans:[],assessments:[],coach_notes:[],
 exercises:[{id:'e1',name_vi:'Lăn foam cơ khép',corrective_step:'inhibit',tags:['ohsa:knees_in']},{id:'e2',name_vi:'Đi ngang với band',corrective_step:'activate',tags:['ohsa:knees_in']},{id:'e3',name_vi:'Squat với band quanh gối',corrective_step:'integrate',tags:['ohsa:knees_in']}]};
const persist=()=>localStorage.setItem('fakedb',JSON.stringify(DB));
let n=0; const uid=()=>'id'+(++n)+Date.now();
function canSee(t,row,me){const prof=DB.profiles.find(p=>p.id===me);
  if(t==='exercises')return true;
  if(t==='profiles')return row.id===me||row.coach_id===me||row.id===prof?.coach_id;
  if(t==='coach_notes')return prof?.role==='coach';
  const c=DB.profiles.find(p=>p.id===row.client_id);return row.client_id===me||c?.coach_id===me;}
function Q(t){const me=sess()?.user.id;let f=[],ords=[],lim=null,op='select',payload=null,conf=null;
 const rows=()=>{let r=DB[t].filter(x=>canSee(t,x,me)&&f.every(fn=>fn(x)));r.sort((a,b)=>{for(const o of ords){if(a[o.k]===b[o.k])continue;return (a[o.k]>b[o.k]?1:-1)*(o.asc?1:-1)}return 0});if(lim)r=r.slice(0,lim);return r;};
 const exec=()=>{ if(op==='insert'){const r={id:uid(),created_at:new Date().toISOString(),entered_by:me,measured_on:new Date().toISOString().slice(0,10),scanned_on:new Date().toISOString().slice(0,10),...payload};DB[t].push(r);persist();return{data:r,error:null};}
  if(op==='upsert'){const ex=DB[t].find(x=>x[conf]===payload[conf]);if(ex)Object.assign(ex,payload);else DB[t].push({id:uid(),entered_by:me,...payload});persist();return{error:null};}
  if(op==='update'){rows().forEach(x=>Object.assign(x,payload));persist();return{error:null};}
  return{data:rows(),error:null};};
 const api={select(){return api},eq(k,v){f.push(x=>x[k]===v);return api},overlaps(k,arr){f.push(x=>(x[k]||[]).some(v=>arr.includes(v)));return api},
  order(k,o={}){ords.push({k,asc:o.ascending!==false});return api},limit(l){lim=l;return api},
  insert(p){op='insert';payload=p;return api},upsert(p,o){op='upsert';payload=p;conf=o.onConflict;return api},update(p){op='update';payload=p;return api},
  single(){const r=exec().data;return Promise.resolve(r.length===1?{data:r[0],error:null}:{data:null,error:{message:'not found'}})},
  maybeSingle(){return Promise.resolve({data:exec().data[0]||null,error:null})},
  then(res,rej){try{res(exec())}catch(e){rej(e)}}};return api;}
export function createClient(){return{auth:{getSession:async()=>({data:{session:sess()}}),
 signInWithPassword:async({email,password})=>users[email]&&password==='password1'?(localStorage.setItem(KEY,JSON.stringify({user:{id:users[email]}})),{error:null}):{error:{message:'Invalid login credentials'}},
 signOut:async()=>localStorage.removeItem(KEY),updateUser:async()=>({error:null}),resetPasswordForEmail:async()=>({error:null}),
 onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},from:Q};}
