/* Study planner (planner.html), focus mode (focus.html), leaderboard (leaderboard.html). Frontend only.
   State lives in localStorage; XP and coins are shared with achievements.html via n2q-gamify-v1.
   Replace the seeded leaderboard users with real data from your backend. */
const $=s=>document.querySelector(s),PG=document.body.dataset.page;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const T0=new Date();T0.setHours(0,0,0,0);
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const sum=(a,f=x=>x)=>a.reduce((t,x)=>t+f(x),0),uid=()=>Math.random().toString(36).slice(2,9);
const SUBJ=[["Machine Learning","var(--primary)"],["Deep Learning","var(--accent)"],["Probability & Stats","var(--ok)"],["Python","var(--warn)"],["DSA","#F472B6"]];
const ld=(k,d)=>{try{return Object.assign(d,JSON.parse(localStorage.getItem(k)||"{}"))}catch(e){return d}},sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const toast=m=>{const t=$("#toast");if(!t)return;t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2600)};
const reward=(xp,c)=>{const g=ld("n2q-gamify-v1",{xp:0,coins:0,claimed:{},owned:{}});g.xp+=xp;g.coins+=c;sv("n2q-gamify-v1",g)};
const ic=p=>`<svg class="i" viewBox="0 0 24 24"><path d="${p}"/></svg>`;
let rg=0;const ring=(p,big,sm,cls="")=>{const r=62,c=2*Math.PI*r,id="rg"+rg++;return `<svg viewBox="0 0 160 160" class="${cls}" style="width:150px" role="img" aria-label="${esc(sm)}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:var(--primary)"/></linearGradient></defs><circle cx="80" cy="80" r="${r}" fill="none" stroke="var(--hover)" stroke-width="14"/><circle cx="80" cy="80" r="${r}" fill="none" stroke="url(#${id})" stroke-width="14" stroke-linecap="round" stroke-dasharray="${c*Math.min(p,1)} ${c}" transform="rotate(-90 80 80)"/><text x="80" y="84" text-anchor="middle" style="font:700 30px var(--fd);fill:var(--fg)">${big}</text><text x="80" y="104" text-anchor="middle" style="font-size:11px;fill:var(--muted)">${sm}</text></svg>`};
$("#theme").onclick=()=>{const r=document.documentElement,c=r.dataset.theme||(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark");r.dataset.theme=c==="dark"?"light":"dark"};
const FK="n2q-focus-v1";
const weekStart=d=>addD(d,-((d.getDay()+6)%7));

/* ================= PLANNER ================= */
if(PG==="planner"){
  const P=ld("n2q-planner-v1",{tasks:[],goals:[],seeded:0}),save=()=>sv("n2q-planner-v1",P);
  if(!P.seeded){const t=(d,s,x,m,done)=>P.tasks.push({id:uid(),t:x,s,d:iso(addD(T0,d)),m,done:!!done,paid:!!done});
    t(0,0,"Revise Bayes theorem notes",45);t(0,1,"Quiz: neural networks",30);t(0,3,"Practise Python decorators",40);t(0,4,"Solve 3 DP problems",50,1);
    t(1,2,"Hypothesis testing worksheet",40);t(1,0,"Flashcards: regularisation",20);t(2,1,"Attention mechanism summary",45);t(3,4,"Graph traversal practice",60);t(4,0,"Mock test: ML unit 3",90);t(-1,1,"Backpropagation revision",40,1);
    const g=(x,s,tg,u,pr,due)=>P.goals.push({id:uid(),t:x,s,tg,u,pr,due:iso(addD(T0,due))});
    g("Finish ML unit 3 revision",0,10,"topics",6,14);g("Average 85% on quizzes",1,85,"%",78,30);g("Study 40 hours this month",3,40,"hours",28,9);P.seeded=1;save()}
  let view="daily",cur=new Date(T0);
  const on=d=>P.tasks.filter(t=>t.d===iso(d)),fmtD=d=>d.toLocaleDateString("en",{weekday:"long",day:"numeric",month:"long"});
  const row=t=>`<div class="pl-t ${t.done?"done":""}" style="--c:${SUBJ[t.s][1]}"><button class="pl-ck" data-a="tg" data-id="${t.id}" aria-label="Toggle done"></button><div><b>${esc(t.t)}</b><small>${SUBJ[t.s][0]} · ${t.m} min${t.done?"":` · +${Math.round(t.m/2)} XP`}</small></div>${t.done?"<span></span>":`<a class="lx-btn" href="focus.html?task=${t.id}">${ic("M5 3l14 9-14 9z")}Focus</a>`}<button class="lx-btn" data-a="del" data-id="${t.id}" aria-label="Delete">×</button></div>`;
  const AI=[[0,"Regularisation"],[1,"Attention"],[2,"Hypothesis tests"],[3,"Decorators"],[4,"Dynamic programming"],[1,"Backpropagation"]];
  const views={
    daily(){const L=on(cur).sort((a,b)=>a.done-b.done),tot=sum(L,t=>t.m),dn=sum(L.filter(t=>t.done),t=>t.m),left=L.filter(t=>!t.done).length;
      return `<div class="lx-2"><div><form class="pl-add" id="addT"><input id="nt" placeholder="Add a task, e.g. Revise Unit 3" required maxlength="80" aria-label="Task"><select id="ns" aria-label="Subject">${SUBJ.map((s,i)=>`<option value="${i}">${s[0]}</option>`).join("")}</select><input id="nm" type="number" value="30" min="5" step="5" aria-label="Minutes"><button class="lx-btn p">Add</button></form><div class="pl-list">${L.map(row).join("")||`<div style="padding:28px;text-align:center;color:var(--muted)">Nothing planned for this day. Add a task or let AI plan it.</div>`}</div></div>
      <div style="display:grid;gap:14px;justify-items:center;align-content:start">${ring(tot?dn/tot:0,Math.round(tot?dn/tot*100:0)+"%","completed")}<div class="lx-legend" style="width:100%"><div><i style="background:var(--primary)"></i>Planned<span>${tot} min</span></div><div><i style="background:var(--ok)"></i>Completed<span>${dn} min</span></div></div><p style="color:var(--muted);font-size:.88rem;text-align:center">${tot&&!left?"Day cleared! Nice work.":left?`${left} task${left>1?"s":""} to go. Finish them for +${sum(L.filter(t=>!t.done),t=>Math.round(t.m/2))} XP.`:"Plan your day to start earning XP."}</p><button class="lx-btn" data-a="ai" style="width:100%">${ic("m12 3 1.9 5.8L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.2z")}AI plan my day</button></div></div>`},
    weekly(){const s=weekStart(cur),days=Array.from({length:7},(_,i)=>addD(s,i)),all=days.flatMap(on),pl=sum(all,t=>t.m);
      return `<div class="lx-hd" style="margin-top:-4px"><span class="lx-chip">${(pl/60).toFixed(1)} h planned · ${all.filter(t=>t.done).length}/${all.length} tasks done</span></div><div class="pl-week">${days.map(d=>{const L=on(d),m=sum(L,t=>t.m);return `<div class="pl-day ${+d===+T0?"today":""}"><div class="lx-hd" style="margin:0"><b>${d.toLocaleDateString("en",{weekday:"short"})} ${d.getDate()}</b><span class="lx-chip">${m} m</span></div><div class="lx-track"><i style="width:${Math.min(100,m/180*100)}%;--c:${m>180?"var(--bad)":"var(--primary)"}"></i></div>${L.map(t=>`<button class="pl-chip ${t.done?"done":""}" style="--c:${SUBJ[t.s][1]}" data-a="day" data-d="${iso(d)}">${esc(t.t)}</button>`).join("")}<button class="lx-btn" data-a="day" data-d="${iso(d)}">+ Add</button></div>`}).join("")}</div>`},
    monthly(){const f=new Date(cur.getFullYear(),cur.getMonth(),1),lead=(f.getDay()+6)%7,n=new Date(cur.getFullYear(),cur.getMonth()+1,0).getDate();let c="";
      for(let i=0;i<lead;i++)c+=`<div></div>`;
      for(let k=1;k<=n;k++){const d=new Date(cur.getFullYear(),cur.getMonth(),k),L=on(d),m=sum(L,t=>t.m);c+=`<button class="pl-c ${+d===+T0?"today":""}" style="--h:${Math.min(40,m/4)}" data-a="day" data-d="${iso(d)}"><span>${k}</span><span>${L.slice(0,4).map(t=>`<i style="--c:${t.done?"var(--ok)":SUBJ[t.s][1]}"></i>`).join("")}<small style="color:var(--muted)">${L.length?L.filter(t=>t.done).length+"/"+L.length:""}</small></span></button>`}
      return `<div class="pl-cal">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(x=>`<b>${x}</b>`).join("")}${c}</div>`},
    goals(){return `<form class="pl-add" id="addG" style="grid-template-columns:1fr 90px 100px 150px auto"><input id="gt" placeholder="New goal, e.g. Complete 30 quizzes" required maxlength="70" aria-label="Goal"><input id="gg" type="number" min="1" value="10" aria-label="Target"><input id="gu" value="quizzes" aria-label="Unit" maxlength="12"><input id="gd" type="date" value="${iso(addD(T0,14))}" aria-label="Deadline"><button class="lx-btn p">Add goal</button></form>
      <div class="lx-3">${P.goals.map(g=>{const p=Math.min(1,g.pr/g.tg),left=Math.ceil((new Date(g.due)-T0)/864e5);return `<div class="pl-goal ${p>=1?"ok":""}" style="--c:${SUBJ[g.s][1]}"><div class="lx-hd" style="margin:0"><b>${esc(g.t)}</b><button class="lx-btn" data-a="delg" data-id="${g.id}" aria-label="Delete goal">×</button></div><div class="lx-track"><i style="width:${p*100}%;--c:${p>=1?"var(--ok)":"var(--primary)"}"></i></div><div class="lx-hd" style="margin:0"><span>${g.pr} / ${g.tg} ${esc(g.u)}</span><span class="lx-chip">${p>=1?"Completed":left<0?"Overdue":left+" days left"}</span></div><div class="lx-hd" style="margin:0"><div style="display:flex;gap:6px"><button class="lx-btn" data-a="gm" data-id="${g.id}">−</button><button class="lx-btn p" data-a="gp" data-id="${g.id}">+ Progress</button></div><small style="color:var(--warn)">${p>=1?"+100 XP earned":"Reward: +100 XP"}</small></div></div>`}).join("")}</div>`}};
  const nav=()=>{const ap=view==="monthly"?`${cur.toLocaleDateString("en",{month:"long",year:"numeric"})}`:view==="weekly"?`Week of ${weekStart(cur).toLocaleDateString("en",{day:"numeric",month:"short"})}`:fmtD(cur);return view==="goals"?"":`<div class="pl-bar"><button class="lx-btn" data-a="prev" aria-label="Previous">‹</button><b>${ap}</b><button class="lx-btn" data-a="next" aria-label="Next">›</button><button class="lx-btn" data-a="today">Today</button></div>`};
  const draw=()=>{const wk=P.tasks.filter(t=>t.d>=iso(weekStart(T0))&&t.d<=iso(addD(weekStart(T0),6)));$("#pk").innerHTML=[["Today",on(T0).filter(t=>t.done).length+"/"+on(T0).length+" tasks","var(--primary)"],["This week",Math.round(wk.filter(t=>t.done).length/(wk.length||1)*100)+"% done","var(--ok)"],["Goals",P.goals.filter(g=>g.pr>=g.tg).length+"/"+P.goals.length+" reached","var(--warn)"]].map(k=>`<div class="card lx-kpi" style="--c:${k[2]}"><small>${k[0]}</small><b>${k[1]}</b></div>`).join("");
    $("#pv").innerHTML=nav()+views[view]()};
  $("#ptabs").onclick=e=>{const b=e.target.closest("button");if(!b)return;view=b.dataset.t;$("#ptabs").querySelectorAll("button").forEach(x=>x.setAttribute("aria-selected",x===b));draw()};
  const step=n=>{if(view==="monthly")cur=new Date(cur.getFullYear(),cur.getMonth()+n,1);else cur=addD(cur,n*(view==="weekly"?7:1))};
  document.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a,id=b.dataset.id;
    if(a==="prev")step(-1);if(a==="next")step(1);if(a==="today")cur=new Date(T0);
    if(a==="day"){cur=new Date(b.dataset.d+"T00:00");view="daily";$("#ptabs").querySelectorAll("button").forEach(x=>x.setAttribute("aria-selected",x.dataset.t==="daily"))}
    if(a==="tg"){const t=P.tasks.find(x=>x.id===id);t.done=!t.done;if(t.done&&!t.paid){t.paid=1;reward(Math.round(t.m/2),Math.round(t.m/6));toast(`Task done! +${Math.round(t.m/2)} XP, +${Math.round(t.m/6)} coins`)}}
    if(a==="del")P.tasks=P.tasks.filter(x=>x.id!==id);
    if(a==="delg")P.goals=P.goals.filter(x=>x.id!==id);
    if(a==="ai"){const have=on(cur).map(t=>t.t),add=AI.map(x=>[x[0],"Practise: "+x[1]]).filter(x=>!have.includes(x[1])).slice(0,3);add.forEach((x,i)=>P.tasks.push({id:uid(),t:x[1],s:x[0],d:iso(cur),m:[30,25,20][i],done:false,paid:false}));toast(add.length?`Added ${add.length} tasks for your weakest topics`:"Your plan already covers the weak topics")}
    if(a==="gp"||a==="gm"){const g=P.goals.find(x=>x.id===id);g.pr=Math.max(0,g.pr+(a==="gp"?1:-1));if(g.pr>=g.tg&&!g.paid){g.paid=1;reward(100,30);toast("Goal reached! +100 XP, +30 coins")}}
    save();draw()});
  document.addEventListener("submit",e=>{e.preventDefault();
    if(e.target.id==="addT"){P.tasks.push({id:uid(),t:$("#nt").value.trim(),s:+$("#ns").value,d:iso(cur),m:+$("#nm").value||30,done:false,paid:false})}
    if(e.target.id==="addG"){P.goals.push({id:uid(),t:$("#gt").value.trim(),s:0,tg:+$("#gg").value||1,u:$("#gu").value||"units",pr:0,due:$("#gd").value})}
    save();draw()});
  draw();
}

/* ================= FOCUS ================= */
if(PG==="focus"){
  const F=ld(FK,{sessions:[],set:{f:25,s:5,l:15}}),P=ld("n2q-planner-v1",{tasks:[]}),save=()=>sv(FK,F);
  const MODES={f:["Focus","var(--primary)"],s:["Short break","var(--ok)"],l:["Long break","var(--accent)"]},Q=["Small steps every day beat big pushes once a week.","Deep work now, rest earned.","One task. Full attention. Go.","Your future exams are watching. Keep going.","Breaks are part of the plan. Breathe and stretch."];
  let mode="f",left=F.set.f*60,run=false,endAt=0,cycle=0,tid=null,pre=new URLSearchParams(location.search).get("task");
  const todays=()=>P.tasks.filter(t=>t.d===iso(T0)&&!t.done),mins=a=>sum(a,s=>s.m);
  const dayMin=d=>mins(F.sessions.filter(s=>s.d===iso(d)));
  const DEMO=[95,120,60,150,80,110];
  const wkData=()=>Array.from({length:7},(_,i)=>{const d=addD(T0,i-6);return {d,m:dayMin(d)+(i<6?DEMO[i]:0)}});
  const fmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
  const full=()=>F.set[mode]*60;
  function beep(){try{const a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.setValueAtTime(.2,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.9);o.start();o.stop(a.currentTime+.9)}catch(e){}}
  function ringHtml(){const r=118,c=2*Math.PI*r;return `<svg class="fo-ring" viewBox="0 0 280 280" role="timer" aria-live="off"><defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--accent)"/><stop offset="1" id="fs2" style="stop-color:var(--primary)"/></linearGradient></defs><circle cx="140" cy="140" r="${r}" fill="none" stroke="var(--hover)" stroke-width="16"/><circle id="arc" cx="140" cy="140" r="${r}" fill="none" stroke="url(#fg)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${c} ${c}" transform="rotate(-90 140 140)" style="filter:drop-shadow(0 0 10px var(--primary))"/><text id="tt" x="140" y="150" text-anchor="middle" class="fo-time"></text><text id="tl" x="140" y="180" text-anchor="middle" style="font-size:14px;fill:var(--muted)"></text></svg>`}
  function tick(){if(run){left=Math.max(0,Math.round((endAt-Date.now())/1000));if(left<=0)return done()}paint()}
  function paint(){const c=2*Math.PI*118,p=left/full();$("#arc").style.strokeDashoffset=c*(1-p)*-1+"";$("#arc").setAttribute("stroke-dasharray",`${c*p} ${c}`);$("#tt").textContent=fmt(left);$("#tl").textContent=MODES[mode][0];document.title=(run?fmt(left)+" · ":"")+MODES[mode][0]+" · Note2Quiz";$("#go").textContent=run?"Pause":left<full()?"Resume":"Start";$("#fs2").style.stopColor=MODES[mode][1]}
  function done(){run=false;beep();if(mode==="f"){const t=P.tasks.find(x=>x.id===tid),m=F.set.f;F.sessions.push({d:iso(T0),ts:Date.now(),m,t:t?t.t:"Free study"});cycle++;const xp=m*2,co=Math.round(m/5);reward(xp,co);save();toast(`Session complete! +${xp} XP, +${co} coins`);setMode(cycle%4===0?"l":"s")}else{toast("Break over. Ready for another round?");setMode("f")}stats()}
  function setMode(m){mode=m;left=full();run=false;$("#modes").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===m));$("#quote").textContent=m==="f"?Q[Math.floor(Math.random()*3)]:Q[4];$("#dots").innerHTML=[0,1,2,3].map(i=>`<i class="${i<cycle%4||(cycle&&cycle%4===0&&mode==="l")?"on":""}"></i>`).join("");paint()}
  function stats(){const tdm=dayMin(T0),w=wkData(),tw=sum(w,x=>x.m),mx=Math.max(...w.map(x=>x.m),120);
    $("#stats").innerHTML=`<div class="lx-kpis"><div class="card lx-kpi" style="--c:var(--primary)"><small>Today</small><b>${tdm} min</b><span class="lx-d ${tdm>=120?"up":""}">${tdm>=120?"Daily goal reached":120-tdm+" min to your 120 min goal"}</span></div><div class="card lx-kpi" style="--c:var(--ok)"><small>Sessions today</small><b>${F.sessions.filter(s=>s.d===iso(T0)).length}</b></div><div class="card lx-kpi" style="--c:var(--accent)"><small>This week</small><b>${(tw/60).toFixed(1)} h</b></div></div>
    <div class="lx-2" style="margin-top:16px"><div class="card"><h2 style="font-size:1rem;margin-bottom:14px">Focus time, last 7 days</h2><div class="fo-bars">${w.map(x=>`<div title="${x.m} min"><span>${x.m}</span><i style="height:${Math.max(4,Math.round(x.m/mx*100))}px"></i><span>${x.d.toLocaleDateString("en",{weekday:"short"})}</span></div>`).join("")}</div></div>
    <div class="card"><h2 style="font-size:1rem;margin-bottom:12px">Session log</h2><div class="fo-log">${F.sessions.slice(-8).reverse().map(s=>`<div><span>${esc(s.t)}</span><b>${s.m} min</b></div>`).join("")||`<span style="color:var(--muted)">No sessions yet. Start your first focus round.</span>`}</div></div></div>`}
  $("#fo").innerHTML=`<div class="fo-stage card" id="stage"><div class="fo-modes fo-hide" id="modes">${Object.entries(MODES).map(([k,v])=>`<button data-m="${k}" aria-pressed="${k==="f"}">${v[0]}</button>`).join("")}</div>${ringHtml()}<div class="fo-quote" id="quote"></div><div class="fo-dots" id="dots"></div><div class="fo-ctl"><button class="lx-btn p fo-go" id="go">Start</button><button class="lx-btn fo-hide" id="reset">Reset</button><button class="lx-btn fo-hide" id="skip">Skip</button><button class="lx-btn" id="fs">${ic("M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3")}Full screen</button></div><label class="fo-hide fo-set">Working on <select class="pl-field" id="task" style="width:auto;max-width:260px"><option value="">Free study</option>${todays().map(t=>`<option value="${t.id}">${esc(t.t)}</option>`).join("")}</select></label><div class="fo-set fo-hide">Focus <input type="number" id="sf" min="1" max="120" value="${F.set.f}"> Short <input type="number" id="ss" min="1" max="60" value="${F.set.s}"> Long <input type="number" id="sl" min="1" max="60" value="${F.set.l}"> min</div></div><div id="stats" style="margin-top:16px"></div>`;
  if(pre&&todays().some(t=>t.id===pre)){$("#task").value=pre;tid=pre}
  $("#task").onchange=e=>tid=e.target.value||null;
  $("#modes").onclick=e=>{const b=e.target.closest("button");if(b&&!run)setMode(b.dataset.m)};
  const toggle=()=>{if(run){run=false}else{run=true;endAt=Date.now()+left*1000;try{new AudioContext().resume()}catch(e){}}paint()};
  $("#go").onclick=toggle;$("#reset").onclick=()=>{run=false;left=full();paint()};$("#skip").onclick=()=>{run=false;setMode(mode==="f"?"s":"f")};
  [["sf","f"],["ss","s"],["sl","l"]].forEach(([id,k])=>$("#"+id).onchange=e=>{F.set[k]=Math.max(.1,+e.target.value||F.set[k]);save();if(!run&&mode===k){left=full();paint()}});
  const fs=()=>document.fullscreenElement?document.exitFullscreen():$("#stage").requestFullscreen&&$("#stage").requestFullscreen().catch(()=>toast("Full screen is not available here"));
  $("#fs").onclick=fs;
  document.addEventListener("keydown",e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.code==="Space"){e.preventDefault();toggle()}if(e.key==="f")fs()});
  document.addEventListener("fullscreenchange",()=>{$("#fs").lastChild.textContent=document.fullscreenElement?"Exit full screen":"Full screen"});
  window.F_TEST={done:()=>{left=0;run=true;endAt=0;tick()}};
  setInterval(tick,250);setMode("f");stats();
}

/* ================= LEADERBOARD ================= */
if(PG==="leaderboard"){
  const COLLEGE="DVSIET Meerut",G=ld("n2q-gamify-v1",{xp:0}),F=ld(FK,{sessions:[]});
  const mk=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},R=mk(77);
  const FN="Aditi Rohan Meera Kabir Ishaan Sana Vihaan Diya Arjun Riya Kunal Tara Neel Anaya Dev Pooja Yash Naina Rahul Simran Karan Isha Aman Kriti Varun Sneha Harsh Mitali Sahil Ritu".split(" "),LN="S K M P G R T N B V D J".split(" ");
  const CO=[COLLEGE,"IIT Roorkee","NSUT Delhi","JIIT Noida","BITS Pilani","AKTU Lucknow"];
  const U=Array.from({length:60},(_,i)=>({n:FN[i%30]+" "+LN[(i*7)%12]+".",c:i%5===0?COLLEGE:CO[1+Math.floor(R()*5)],fr:[3,8,14,21,27,33,40].includes(i),w:Math.round(250+2500*R()**1.5),a:Math.round(1200+8800*R()**1.8),st:Math.floor(R()*40),ch:Math.floor(R()*9)-3,hu:Math.floor(R()*360)}));
  U.forEach(u=>{u.m=Math.round(u.w*(3.3+R()*1.5))});
  const wkS=addD(T0,-((T0.getDay()+6)%7)),fx=F.sessions.filter(s=>s.d>=iso(wkS)).reduce((t,s)=>t+s.m*2,0);
  const ME={n:(()=>{try{return JSON.parse(localStorage.getItem("n2q-user")).name.replace(/[<>&"']/g,"")}catch(e){return null}})()||"Aarav Sharma",me:1,c:COLLEGE,w:1455+fx+G.xp,m:5010+fx+G.xp,a:3840+G.xp,st:14,ch:2,hu:265};
  let scope="global",per="weekly",full=false;const key={weekly:"w",monthly:"m",all:"a"};
  const LG=[["Bronze",0,"#D58A4B"],["Silver",800,"#A5B4CF"],["Gold",1400,"var(--warn)"],["Platinum",2000,"var(--accent)"],["Diamond",2600,"var(--primary)"]];
  const init=n=>n.split(" ").map(x=>x[0]).join("");
  const reset=()=>{const e=per==="monthly"?new Date(T0.getFullYear(),T0.getMonth()+1,1):addD(wkS,7),d=Math.max(0,e-Date.now()),dd=Math.floor(d/864e5),h=Math.floor(d%864e5/36e5);return per==="all"?"All-time ranking":`${per==="weekly"?"Week":"Month"} resets in ${dd}d ${h}h`};
  const av=(u,c="")=>`<span class="lb-av ${c}" style="--hu:${u.hu}">${init(u.n)}</span>`;
  function draw(){const k=key[per],pool=[...U,ME].filter(u=>scope==="global"||(scope==="college"?u.c===COLLEGE:u.fr||u.me)).sort((a,b)=>b[k]-a[k]),mi=pool.findIndex(u=>u.me),top=pool.slice(0,3);
    const lg=[...LG].reverse().find(l=>ME.w>=l[1]),nl=LG[LG.indexOf(lg)+1];
    const pod=[1,0,2].map(i=>top[i]&&`<div class="lb-p r${i+1}">${i===0?`<span class="cr">${ic("m2 7 5 5 5-8 5 8 5-5-2 12H4z")}</span>`:""}${av(top[i])}<b>${esc(top[i].n)}${top[i].me?" (You)":""}</b><small style="color:var(--muted)">#${i+1}</small><span>${top[i][k].toLocaleString()} XP</span></div>`).join("");
    let gap0=false;const rows=pool.slice(3).map((u,j)=>{const r=j+4;if(!full&&r>20&&Math.abs(r-(mi+1))>2){const g=gap0?"":`<div class="lb-zone" style="--c:var(--muted)">· · ·</div>`;gap0=true;return g}gap0=false;const z=per==="weekly"&&scope==="global"?(r===11?`<div class="lb-zone" style="--c:var(--ok)">PROMOTION ZONE ENDS</div>`:r===pool.length-4?`<div class="lb-zone" style="--c:var(--bad)">DEMOTION ZONE</div>`:""):"";
      return z+`<div class="lb-row ${u.me?"me":""}"><span class="lb-rk">${r}</span>${av(u)}<div><b>${esc(u.n)}${u.me?" (You)":""}</b><small class="hide-s"> ${scope==="global"?esc(u.c):"Lv "+(Math.floor(Math.sqrt(u.a/24))||1)}</small></div><span class="hide-s" title="Streak">🔥 ${u.st}</span><span><b>${u[k].toLocaleString()}</b> <small>XP</small> ${scope==="friends"&&!u.me?`<button class="lx-btn" data-ch="${esc(u.n)}" style="height:28px;margin-left:6px">Challenge</button>`:`<span class="lb-ch ${u.ch>0?"u":u.ch<0?"d":"z"}">${u.ch>0?"▲"+u.ch:u.ch<0?"▼"+-u.ch:"–"}</span>`}</span></div>`}).join("")+(pool.length>24?`<div style="text-align:center;margin-top:10px"><button class="lx-btn" data-full>${full?"Show fewer":"Show full table"}</button></div>`:"");
    const ahead=pool[mi-1],gap=ahead?ahead[k]-ME[k]+1:0;
    $("#lbv").innerHTML=`<div class="lx-hd"><span class="lx-chip">${reset()}</span>${scope==="friends"?`<button class="lx-btn" data-inv>Invite a friend</button>`:`<span class="lx-chip" style="color:${lg[2]}">${lg[0]} league${nl?` · ${nl[1]-ME.w>0?nl[1]-ME.w+" XP to "+nl[0]:""}`:""}</span>`}</div><div class="lb-pod">${pod}</div><div style="display:grid;gap:2px;margin-top:14px">${rows}</div>
    <div class="lb-me"><div><b style="font-size:1.1rem">You are #${mi+1} of ${pool.length}</b><div style="opacity:.9;font-size:.9rem">${ahead?`${gap.toLocaleString()} XP to overtake ${esc(ahead.n)} — ${Math.ceil(gap/2)<=240?`about ${Math.ceil(gap/2)} min of focus`:"a few strong study days"}`:"You lead the board. Defend your spot!"}</div></div><a class="lx-btn" href="focus.html">Start focus session</a></div>`}
  [["#scope","scope"],["#period","per"]].forEach(([id,v])=>$(id).onclick=e=>{const b=e.target.closest("button");if(!b)return;if(v==="scope")scope=b.dataset.t;else per=b.dataset.t;$(id).querySelectorAll("button").forEach(x=>x.setAttribute("aria-selected",x===b));draw()});
  document.addEventListener("click",e=>{const c=e.target.closest("[data-ch]");if(c)toast(`Challenge sent to ${c.dataset.ch}. Most XP this week wins bragging rights`);if(e.target.closest("[data-full]")){full=!full;draw()}if(e.target.closest("[data-inv]")){navigator.clipboard&&navigator.clipboard.writeText(location.href).catch(()=>{});toast("Invite link copied")}});
  draw();
}
