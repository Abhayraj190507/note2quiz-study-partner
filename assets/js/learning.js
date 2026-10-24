/* Learning Analytics (progress.html) + Gamification (achievements.html). Frontend only.
   Activity below is generated from a fixed seed so charts have data.
   Replace DAYS / QZ with real study logs from your backend. */
const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SUBJ=[["Machine Learning","var(--primary)"],["Deep Learning","var(--accent)"],["Probability & Stats","var(--ok)"],["Python","var(--warn)"],["DSA","#F472B6"]];
const WEAK=[["Regularisation","SVM kernels","Ensembles"],["Backpropagation","Attention","Batch norm"],["Bayes theorem","Hypothesis tests","Distributions"],["Decorators","Generators","NumPy broadcasting"],["Dynamic programming","Graph traversal","Heaps"]];
const mk=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const R=mk(2610),T0=new Date();T0.setHours(0,0,0,0);
const DAYS=[];
for(let i=89;i>=0;i--){const d=new Date(T0);d.setDate(d.getDate()-i);const we=d.getDay()%6===0,on=i<9||R()>(we?.3:.14);
  const mins=on?Math.round((we?35:50)+R()*70+(90-i)*.25):0,w=SUBJ.map(()=>R()+.2),sw=w.reduce((a,b)=>a+b);
  const quizzes=on&&R()>.5?1+(R()>.75?1:0):0,cards=on?Math.round(R()*32):0;
  DAYS.push({d,mins,sm:w.map(x=>Math.round(mins*x/sw)),quizzes,cards,xp:mins*2+quizzes*25+Math.round(cards/2)})}
Object.assign(DAYS[89],{mins:47,sm:[18,10,9,6,4],quizzes:1,cards:14,xp:94+25+7});
const QZ=[];for(let i=0;i<24;i++){const d=new Date(T0);d.setDate(d.getDate()-Math.round(62-i*2.5));QZ.push({d,s:Math.floor(R()*5),score:Math.min(98,Math.round(56+i*1.5+R()*14)),sec:Math.round(420+R()*300-i*6)})}
const sum=(a,f=x=>x)=>a.reduce((t,x)=>t+f(x),0),avg=a=>a.length?sum(a)/a.length:0;
const fd=d=>d.toLocaleDateString("en",{day:"numeric",month:"short"}),fh=m=>(m/60).toFixed(1)+" h";
let streak=0;for(let i=89;i>=0&&DAYS[i].mins>0;i--)streak++;
const WK=DAYS.slice(83),PW=DAYS.slice(76,83);

/* ---------- SVG chart helpers ---------- */
let gid=0;
const grad=(id,a="var(--accent)",b="var(--primary)",v=1)=>`<linearGradient id="${id}" x1="0" y1="0" x2="${v?0:1}" y2="${v}"><stop offset="0" style="stop-color:${a}"/><stop offset="1" style="stop-color:${b}"/></linearGradient>`;
const grid=(p,W,ih,max,n=3)=>Array.from({length:n+1},(_,k)=>{const y=p.t+ih-ih*k/n;return `<line x1="${p.l}" x2="${W-p.r}" y1="${y}" y2="${y}" class="lx-grid"/><text x="${p.l-6}" y="${y+4}" class="lx-ax" text-anchor="end">${Math.round(max*k/n)}</text>`}).join("");
function bars(v,lab,o={}){const W=640,H=o.h||230,p={l:36,r:8,t:14,b:26},iw=W-p.l-p.r,ih=H-p.t-p.b,raw=Math.max(...v,o.goal||0)*1.05||1,u=raw>30?10:1,max=Math.ceil(raw/3/u)*u*3,bw=iw/v.length,id="b"+gid++;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label)}"><defs>${grad(id)}</defs>${grid(p,W,ih,max)}`;
  v.forEach((x,i)=>{const h=ih*x/max,xx=p.l+i*bw+bw*.17;s+=`<rect class="lx-bar" x="${xx}" y="${p.t+ih-h}" width="${bw*.66}" height="${h}" rx="5" fill="url(#${id})" style="animation-delay:${i*35}ms" data-tip="${esc(o.tip(i))}"/>`+(i%(o.every||1)?"":`<text x="${xx+bw*.33}" y="${H-8}" class="lx-ax" text-anchor="middle">${esc(lab[i])}</text>`)});
  if(o.goal){const y=p.t+ih-ih*o.goal/max;s+=`<line x1="${p.l}" x2="${W-p.r}" y1="${y}" y2="${y}" class="lx-goal"/><text x="${W-p.r}" y="${y-5}" class="lx-ax" text-anchor="end" style="fill:var(--warn)">${o.goalLabel}</text>`}
  return s+"</svg>"}
function line(v,lab,o={}){const W=640,H=o.h||230,p={l:36,r:12,t:14,b:26},iw=W-p.l-p.r,ih=H-p.t-p.b,lo=o.min??Math.min(...v)*.9,hi=o.max??Math.max(...v)*1.08,n=v.length,id="l"+gid++;
  const X=i=>p.l+iw*i/(n-1),Y=x=>p.t+ih-ih*(x-lo)/(hi-lo),P=v.map((x,i)=>[X(i),Y(x)]);
  let d=`M${P[0]}`;for(let i=0;i<n-1;i++){const a=P[i-1]||P[i],b=P[i],c=P[i+1],e=P[i+2]||c;d+=`C${b[0]+(c[0]-a[0])/6},${b[1]+(c[1]-a[1])/6} ${c[0]-(e[0]-b[0])/6},${c[1]-(e[1]-b[1])/6} ${c[0]},${c[1]}`}
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label)}"><defs>${grad(id+"a","var(--primary)","transparent")}${grad(id,"var(--primary)","var(--accent)",0)}</defs>${grid(p,W,ih,hi).replace(/>(\d+)</g,(m,x)=>`>${Math.round(lo+(hi-lo)*(+x/hi))}<`)}`;
  s+=`<path d="${d}L${X(n-1)},${p.t+ih}L${X(0)},${p.t+ih}Z" fill="url(#${id}a)" opacity=".28"/><path class="lx-draw" d="${d}" fill="none" stroke="url(#${id})" stroke-width="3" stroke-linecap="round"/>`;
  if(o.trend){const mx=(n-1)/2,my=avg(v),m=v.reduce((t,x,i)=>t+(i-mx)*(x-my),0)/v.reduce((t,x,i)=>t+(i-mx)**2,0);s+=`<line x1="${X(0)}" y1="${Y(my+m*(0-mx))}" x2="${X(n-1)}" y2="${Y(my+m*(n-1-mx))}" stroke="var(--ok)" stroke-width="1.5" stroke-dasharray="6 5"/>`}
  if(o.target){const y=Y(o.target);s+=`<line x1="${p.l}" x2="${W-p.r}" y1="${y}" y2="${y}" class="lx-goal"/><text x="${W-p.r}" y="${y-5}" class="lx-ax" text-anchor="end" style="fill:var(--warn)">Target ${o.target}%</text>`}
  P.forEach((q,i)=>{s+=`<circle class="lx-dot" cx="${q[0]}" cy="${q[1]}" r="3.5" fill="var(--panel)" stroke="var(--accent)" stroke-width="2" data-tip="${esc(o.tip(i))}"/>`+(i%(o.every||1)?"":`<text x="${q[0]}" y="${H-8}" class="lx-ax" text-anchor="middle">${esc(lab[i])}</text>`)});
  return s+"</svg>"}
function heat(){const W=13*24+36,st=new Date(T0);st.setDate(st.getDate()-st.getDay()-84);let s=`<svg viewBox="0 0 ${W} 190" style="max-width:520px" role="img" aria-label="Study activity heatmap, last 13 weeks">`;
  ["Mon","Wed","Fri"].forEach((t,i)=>s+=`<text x="0" y="${36+i*48+13}" class="lx-ax">${t}</text>`);
  for(let w=0;w<13;w++)for(let k=0;k<7;k++){const d=new Date(st);d.setDate(d.getDate()+w*7+k);if(d>T0)continue;const r=DAYS.find(x=>+x.d===+d),m=r?r.mins:0,lv=!m?0:m<30?1:m<60?2:m<90?3:4;
    s+=`<rect class="lx-cell" x="${36+w*24}" y="${8+k*24}" width="20" height="20" fill="${lv?`color-mix(in srgb,var(--primary) ${[0,25,50,75,100][lv]}%,transparent)`:"var(--hover)"}" data-tip="${fd(d)} · ${m?m+" min":"no study"}"/>`}
  return s+"</svg>"}
function radar(v){const cx=170,cy=150,r=100,n=v.length,id="r"+gid++,pt=(i,k)=>[cx+r*k*Math.sin(2*Math.PI*i/n),cy-r*k*Math.cos(2*Math.PI*i/n)];
  let s=`<svg viewBox="0 0 340 300" role="img" aria-label="Subject mastery radar"><defs>${grad(id,"var(--accent)","var(--primary)",1)}</defs>`;
  [.25,.5,.75,1].forEach(k=>s+=`<polygon points="${v.map((_,i)=>pt(i,k)).join(" ")}" fill="none" class="lx-grid"/>`);
  v.forEach((_,i)=>{const a=pt(i,1),b=pt(i,1.2);s+=`<line x1="${cx}" y1="${cy}" x2="${a[0]}" y2="${a[1]}" class="lx-grid"/><text x="${b[0]}" y="${b[1]+4}" class="lx-ax" text-anchor="${b[0]>cx+4?"start":b[0]<cx-4?"end":"middle"}">${esc(SUBJ[i][0].split(" ")[0])}</text>`});
  const P=v.map((x,i)=>pt(i,x/100));s+=`<polygon points="${P.join(" ")}" fill="url(#${id})" fill-opacity=".35" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>`;
  P.forEach((q,i)=>s+=`<circle class="lx-dot" cx="${q[0]}" cy="${q[1]}" r="4.5" fill="${SUBJ[i][1]}" data-tip="${SUBJ[i][0]} · ${v[i]}% mastery"/>`);return s+"</svg>"}
function donut(seg,center,sub,size=170){const r=64,c=2*Math.PI*r,t=sum(seg,x=>x.v)||1;let o=0,s=`<svg viewBox="0 0 170 170" style="width:${size}px;margin:auto" role="img" aria-label="${esc(sub)}"><circle cx="85" cy="85" r="${r}" fill="none" stroke="var(--hover)" stroke-width="16"/>`;
  seg.forEach(x=>{const l=c*x.v/t;s+=`<circle cx="85" cy="85" r="${r}" fill="none" stroke="${x.c}" stroke-width="16" stroke-dasharray="${Math.max(l-3,0)} ${c}" stroke-dashoffset="${-o}" transform="rotate(-90 85 85)" stroke-linecap="round" data-tip="${esc(x.n)} · ${x.t}"/>`;o+=l});
  return s+`<text x="85" y="86" text-anchor="middle" style="font:700 24px var(--fd);fill:var(--fg)">${center}</text><text x="85" y="104" text-anchor="middle" class="lx-ax">${sub}</text></svg>`}
function ring(p,big,sm,size=150){const r=62,c=2*Math.PI*r,id="g"+gid++;
  return `<svg viewBox="0 0 160 160" style="width:${size}px" role="img" aria-label="${esc(sm)}"><defs>${grad(id,"var(--accent)","var(--primary)",1)}</defs><circle cx="80" cy="80" r="${r}" fill="none" stroke="var(--hover)" stroke-width="14"/><circle cx="80" cy="80" r="${r}" fill="none" stroke="url(#${id})" stroke-width="14" stroke-linecap="round" stroke-dasharray="${c*Math.min(p,1)} ${c}" transform="rotate(-90 80 80)" style="transition:stroke-dasharray 1s"/><text x="80" y="82" text-anchor="middle" style="font:700 32px var(--fd);fill:var(--fg)">${big}</text><text x="80" y="102" text-anchor="middle" class="lx-ax">${sm}</text></svg>`}
const IC={flame:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.4 1-3.2.3.7.9 1.2 1.5 1.2z",zap:"M13 2 3 14h9l-1 8 10-12h-9z",trophy:"M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4M6 3h12v7a6 6 0 0 1-12 0zM12 16v3M8 21h8",star:"m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2L7 14.2 2 9.3l6.9-1z",bulb:"M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V18h6v-1.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z",clock:"M12 6v6l4 2M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",cards:"m12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5",target:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",book:"M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z",up:"M12 19V5M5 12l7-7 7 7",coin:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM9 9h5a2 2 0 0 1 0 4H9m0 0h5.5a2 2 0 0 1 0 4H9M12 7v10",gift:"M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",chk:"M20 6 9 17l-5-5"};
const ic=(n,c="i")=>`<svg class="${c}" viewBox="0 0 24 24"><path d="${IC[n]}"/></svg>`;
const tip=document.createElement("div");tip.className="lx-tip";document.body.append(tip);
document.addEventListener("mousemove",e=>{const t=e.target.closest&&e.target.closest("[data-tip]");if(!t){tip.style.opacity=0;return}tip.textContent=t.dataset.tip;tip.style.opacity=1;tip.style.left=Math.min(e.clientX+14,innerWidth-200)+"px";tip.style.top=e.clientY+16+"px"});
const toast=m=>{const t=$("#toast");if(!t)return;t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2400)};
$("#theme").onclick=()=>{const r=document.documentElement,c=r.dataset.theme||(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark");r.dataset.theme=c==="dark"?"light":"dark";if(window.draw)draw()};

/* ---------- derived stats ---------- */
const sub=SUBJ.map((s,i)=>{const q=QZ.filter(x=>x.s===i),acc=q.length?Math.round(avg(q.map(x=>x.score))):70,min=sum(DAYS,d=>d.sm[i]),h=q.length>>1,
  tr=q.length>=4?Math.round(avg(q.slice(h).map(x=>x.score))-avg(q.slice(0,h).map(x=>x.score))):0;
  return {n:s[0],c:s[1],acc,min,tr,q:q.length,mastery:Math.round(acc*.7+Math.min(100,min/6)*.3),weak:WEAK[i][i%3]}});
const last8=QZ.slice(-8),first8=QZ.slice(0,8),wkXp=sum(WK,d=>d.xp),pwXp=sum(PW,d=>d.xp);

/* ---------- progress.html ---------- */
if(document.body.dataset.page==="progress"){
  let tab="daily";
  const dl=(a,b)=>b?`<span class="lx-d ${a>=b?"up":"dn"}">${a>=b?"▲":"▼"} ${Math.abs(Math.round((a-b)/b*100))}% vs last week</span>`:"";
  $("#kpis").innerHTML=[["Current streak",streak+" days","var(--warn)",`<span class="lx-d up">Best: ${Math.max(streak,19)} days</span>`],["XP this week",wkXp.toLocaleString(),"var(--primary)",dl(wkXp,pwXp)],["Average score",Math.round(avg(last8.map(x=>x.score)))+"%","var(--ok)",`<span class="lx-d up">▲ ${Math.round(avg(last8.map(x=>x.score))-avg(first8.map(x=>x.score)))} pts since you started</span>`],["Study time (7 days)",fh(sum(WK,d=>d.mins)),"var(--accent)",dl(sum(WK,d=>d.mins),sum(PW,d=>d.mins))]]
   .map(k=>`<div class="card lx-kpi" style="--c:${k[2]}"><small>${k[0]}</small><b>${k[1]}</b>${k[3]}</div>`).join("");
  function prog(){let h="";
    if(tab==="daily"){const D=DAYS.slice(-14),t=DAYS[89];
      h=`<div class="lx-2"><div>${bars(D.map(d=>d.mins),D.map(d=>d.d.getDate()),{label:"Minutes studied per day, last 14 days",goal:60,goalLabel:"Goal 60 min",every:1,tip:i=>`${fd(D[i].d)} · ${D[i].mins} min · ${D[i].xp} XP`})}</div>
      <div style="display:grid;gap:12px;justify-items:center;align-content:center">${ring(t.mins/60,t.mins,"of 60 min")}<div class="lx-legend" style="width:100%"><div><i style="background:var(--primary)"></i>XP today<span>${t.xp}</span></div><div><i style="background:var(--ok)"></i>Quizzes<span>${t.quizzes}</span></div><div><i style="background:var(--warn)"></i>Cards reviewed<span>${t.cards}</span></div></div></div></div>`}
    if(tab==="weekly"){const W=Array.from({length:12},(_,i)=>DAYS.slice(6+i*7,13+i*7)),lb=W.map((_,i)=>"W"+(i+1));
      h=`<div class="lx-3" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))"><div><h2 style="font-size:.9rem;color:var(--muted)">Study hours per week</h2>${bars(W.map(w=>+(sum(w,d=>d.mins)/60).toFixed(1)),lb,{h:210,label:"Study hours per week",tip:i=>`Week ${i+1} · ${fh(sum(W[i],d=>d.mins))} · ${sum(W[i],d=>d.mins>0)} active days`})}</div>
      <div><h2 style="font-size:.9rem;color:var(--muted)">XP earned per week</h2>${line(W.map(w=>sum(w,d=>d.xp)),lb,{h:210,label:"XP per week",trend:1,tip:i=>`Week ${i+1} · ${sum(W[i],d=>d.xp)} XP`})}</div></div>`}
    if(tab==="monthly"){const ms=[2,1,0].map(k=>{const m=new Date(T0.getFullYear(),T0.getMonth()-k,1),r=DAYS.filter(d=>d.d.getMonth()===m.getMonth()&&d.d.getFullYear()===m.getFullYear());return {n:m.toLocaleDateString("en",{month:"long"}),r}});
      h=`<div class="lx-2"><div>${heat()}<div class="lx-legend" style="grid-auto-flow:column;justify-content:start;gap:14px;margin-top:6px"><div style="color:var(--muted)">Less</div>${[0,25,50,75,100].map(p=>`<i style="width:14px;height:14px;border-radius:4px;background:${p?`color-mix(in srgb,var(--primary) ${p}%,transparent)`:"var(--hover)"}"></i>`).join("")}<div style="color:var(--muted)">More</div></div></div>
      <div style="display:grid;gap:12px">${ms.map(m=>{const hr=sum(m.r,d=>d.mins)/60;return `<div style="padding:12px;border:1px solid var(--line);border-radius:12px"><div class="lx-hd" style="margin:0 0 6px"><b>${m.n}</b><span class="lx-chip">${m.r.filter(d=>d.mins).length} active days</span></div><div class="lx-track"><i style="width:${Math.min(100,hr/40*100)}%"></i></div><small style="color:var(--muted)">${hr.toFixed(1)} of 40 h goal · ${sum(m.r,d=>d.xp).toLocaleString()} XP</small></div>`}).join("")}</div></div>`}
    $("#prog").innerHTML=h}
  $("#ptabs").onclick=e=>{const b=e.target.closest("button");if(!b)return;tab=b.dataset.t;$("#ptabs").querySelectorAll("button").forEach(x=>x.setAttribute("aria-selected",x===b));prog()};
  window.draw=()=>{prog();
    const tm=sum(sub,s=>s.min);
    $("#subj").innerHTML=`<div class="lx-3"><div>${radar(sub.map(s=>s.mastery))}</div><div style="display:grid;gap:14px;align-content:center">${donut(sub.map(s=>({v:s.min,c:s.c,n:s.n,t:fh(s.min)})),Math.round(tm/60)+" h","study time")}<div class="lx-legend">${sub.map(s=>`<div><i style="background:${s.c}"></i>${s.n}<span>${Math.round(s.min/tm*100)}%</span></div>`).join("")}</div></div>
    <div>${sub.slice().sort((a,b)=>b.mastery-a.mastery).map(s=>`<div class="lx-row" style="--c:${s.c}"><span>${s.n}</span><div class="lx-track"><i style="width:${s.mastery}%"></i></div><b>${s.mastery}%</b></div><div style="margin:-6px 0 6px;display:flex;gap:6px;flex-wrap:wrap"><span class="lx-chip">Accuracy ${s.acc}%</span><span class="lx-chip" style="color:var(--${s.tr>=0?"ok":"bad"})">${s.tr>=0?"▲":"▼"} ${Math.abs(s.tr)} pts</span><span class="lx-chip">Weak: ${s.weak}</span></div>`).join("")}</div></div>`;
    const sc=QZ.map(q=>q.score),best=Math.max(...sc),st=sub.slice().sort((a,b)=>b.mastery-a.mastery),act=sum(DAYS.slice(-30),d=>d.mins>0);
    $("#perf").innerHTML=`<div class="lx-2"><div>${line(sc,QZ.map((q,i)=>i+1),{min:40,max:100,target:80,trend:1,every:3,label:"Quiz scores over time",tip:i=>`Quiz ${i+1} · ${fd(QZ[i].d)} · ${sc[i]}% · ${SUBJ[QZ[i].s][0]}`})}<div class="lx-legend" style="grid-auto-flow:column;justify-content:start;gap:16px;margin-top:8px"><div><i style="background:var(--accent)"></i>Score</div><div><i style="background:var(--ok)"></i>Trend</div><div><i style="background:var(--warn)"></i>Target</div></div></div>
    <div style="display:grid;gap:14px">${[["trophy","var(--warn)",`Best score ${best}%`,`Average ${Math.round(avg(sc))}% over ${QZ.length} quizzes, about ${Math.round(avg(QZ.map(q=>q.sec))/60)} min each.`],["up","var(--ok)",`Strongest: ${st[0].n}`,`${st[0].mastery}% mastery. Keep it fresh with a weekly quiz.`],["target","var(--bad)",`Focus next: ${st[4].n}`,`Weakest topic is ${st[4].weak}. Spend 2 short sessions on it.`],["flame","var(--primary)",`Consistency ${Math.round(act/30*100)}%`,`You studied on ${act} of the last 30 days.`]].map(i=>`<div class="lx-ins" style="--c:${i[1]}"><span class="ib">${ic(i[0])}</span><div><b>${i[2]}</b><div style="color:var(--muted);font-size:.88rem">${i[3]}</div></div></div>`).join("")}</div></div>`};
  draw();
}

/* ---------- achievements.html ---------- */
if(document.body.dataset.page==="achievements"){
  const GK="n2q-gamify-v1";let G={xp:0,coins:0,claimed:{},owned:{}};
  try{Object.assign(G,JSON.parse(localStorage.getItem(GK)||"{}"))}catch(e){}
  const save=()=>{try{localStorage.setItem(GK,JSON.stringify(G))}catch(e){}};
  const XP=()=>3840+G.xp,COINS=()=>640+G.coins,xpAt=l=>Math.round(24*l*l),lvl=x=>{let l=1;while(xpAt(l+1)<=x)l++;return l};
  const TITLES=["Newcomer","Learner","Explorer","Scholar","Strategist","Specialist","Master","Sage"],title=l=>TITLES[Math.min(7,Math.floor((l-1)/3))];
  const hubN=()=>{try{const s=JSON.parse(localStorage.getItem("n2q-revision-hub-v1")||"{}");return Object.keys(s.done||{}).filter(k=>s.done[k]&&k.includes("|notes|")).length}catch(e){return 0}};
  const ws=new Date(T0);ws.setDate(ws.getDate()-ws.getDay());const wkq=QZ.filter(q=>q.d>=ws&&q.score>=80).length+2;
  const tdy=DAYS[89],ds=T0.toDateString(),wsd=ws.toDateString();
  const MIS=[["Daily",[["d1","Study for 60 minutes",tdy.mins,60,60,20,ds],["d2","Complete a quiz",tdy.quizzes,1,40,15,ds],["d3","Review 20 flashcards",tdy.cards,20,30,10,ds],["d4","Mark 3 notes revised in the Revision Hub",hubN(),3,50,15,ds]]],["Weekly",[["w1","Study on 6 days this week",sum(WK,d=>d.mins>0),6,200,60,wsd],["w2","Score 80%+ on 3 quizzes",wkq,3,150,45,wsd],["w3","Earn 1,200 XP this week",wkXp,1200,250,80,wsd]]]];
  const BD=[["First steps","Joined Note2Quiz","star","var(--accent)",1],["7-day streak","Study 7 days in a row","flame","var(--warn)",streak>=7],["30-day streak","Study 30 days in a row","flame","var(--bad)",streak>=30],["Quiz starter","Complete 10 quizzes","target","var(--ok)",QZ.length>=10],["Quiz master","Complete 50 quizzes","trophy","var(--warn)",QZ.length>=50],["Sharp mind","Average 80%+ on last 5","bulb","var(--primary)",avg(QZ.slice(-5).map(q=>q.score))>=80],["Perfectionist","Score 98% or more","zap","var(--accent)",Math.max(...QZ.map(q=>q.score))>=98],["Card shark","Review 300 flashcards","cards","var(--ok)",sum(DAYS,d=>d.cards)>=300],["Deep diver","20 h in one subject","clock","var(--primary)",sub.some(s=>s.min>=1200)],["Note keeper","Revise 3 notes in the hub","book","var(--accent)",hubN()>=3],["Polymath","Study all 5 subjects this week","bulb","#F472B6",SUBJ.every((_,i)=>sum(WK,d=>d.sm[i])>0)],["Level 10","Reach level 10","up","var(--warn)",lvl(XP())>=10]];
  const AC=[["Consistency","Longest study streak","flame",Math.max(streak,19),[7,14,30,60],"days"],["Quiz champion","Quizzes completed","target",QZ.length+12,[10,25,50,100],"quizzes"],["Time invested","Hours studied","clock",Math.round(sum(DAYS,d=>d.mins)/60),[10,25,50,100],"hours"],["Card collector","Flashcards reviewed","cards",sum(DAYS,d=>d.cards)+40,[100,300,600,1000],"cards"]];
  const SHOP=[["Streak freeze","Protects your streak for one missed day",50,"flame","var(--warn)"],["Aurora profile frame","A glowing frame for your avatar",200,"star","var(--primary)"],["5 extra AI credits","More AI quiz and note generations",150,"zap","var(--accent)"],["Quiz Master title","Show it under your name",250,"trophy","var(--warn)"],["Focus theme pack","Three calm study themes",120,"gift","var(--ok)"],["Double XP hour","2× XP for one hour of study",180,"up","#F472B6"]];
  const clk=(m,k)=>m[0]+"@"+m[6];
  window.draw=()=>{const x=XP(),l=lvl(x),a=xpAt(l),b=xpAt(l+1),p=(x-a)/(b-a);
    $("#hero").innerHTML=`<div class="ring">${ring(p,l,"LEVEL",150)}</div><div><h2 style="font-size:1.3rem">${title(l)}</h2><p class="lx-sub">${(b-x).toLocaleString()} XP to level ${l+1} · ${x.toLocaleString()} XP total</p><div class="lx-track" style="margin-top:12px;max-width:380px"><i style="width:${p*100}%"></i></div><div class="lx-stats"><span class="lx-pill" style="--c:var(--primary)">${ic("zap")}${x.toLocaleString()} XP</span><span class="lx-pill" style="--c:var(--warn)">${ic("coin")}${COINS().toLocaleString()} coins</span><span class="lx-pill" style="--c:var(--bad)">${ic("flame")}${streak}-day streak</span><span class="lx-pill" style="--c:var(--ok)">${ic("star")}${BD.filter(z=>z[4]).length}/${BD.length} badges</span></div></div>`;
    $("#road").innerHTML=[0,1,2,3,4].map(k=>{const n=l+k,rw=n%5===0?"Rare reward box":n%2?"+50 coins":"+30 coins";return `<div class="lx-lv ${k?"":"cur"}"><small>${k?"Level":"You are"}</small><b>${n}</b><small>${xpAt(n).toLocaleString()} XP</small><small style="color:var(--warn)">${k?rw:title(n)}</small></div>`}).join("");
    $("#mis").innerHTML=MIS.map(g=>`<div><h3 style="margin:0 0 10px;font:600 .9rem var(--fb);color:var(--muted)">${g[0]} missions</h3><div class="lx-mis">${g[1].map(m=>{const done=m[2]>=m[3],cl=G.claimed[clk(m)];return `<div class="lx-m ${cl?"ok":""}"><div><b>${m[1]}</b><div class="lx-rw"><span style="color:var(--primary)">+${m[4]} XP</span><span style="color:var(--warn)">+${m[5]} coins</span></div></div><button class="lx-btn ${done&&!cl?"p":""}" data-claim="${m[0]}" ${done&&!cl?"":"disabled"}>${cl?"Claimed":done?"Claim":Math.min(m[2],m[3])+" / "+m[3]}</button><div class="lx-track"><i style="width:${Math.min(100,m[2]/m[3]*100)}%;--c:${cl?"var(--ok)":"var(--primary)"}"></i></div></div>`}).join("")}</div></div>`).join("");
    $("#shop").innerHTML=SHOP.map((s,i)=>`<div class="lx-it" style="--c:${s[4]}"><span class="ib">${ic(s[3])}</span><div><b>${s[0]}</b><div style="color:var(--muted);font-size:.85rem">${s[1]}</div></div><button class="lx-btn ${G.owned[i]?"":"p"}" data-buy="${i}" ${G.owned[i]||COINS()<s[2]?"disabled":""}>${G.owned[i]?"Owned":ic("coin")+s[2]+" coins"}</button></div>`).join("");
    $("#badges").innerHTML=BD.map(z=>`<div class="lx-bd ${z[4]?"":"lock"}" style="--c:${z[3]}" data-tip="${z[2]&&esc(z[1])}"><span class="hx">${ic(z[2])}</span><b style="font-size:.9rem">${z[0]}</b><small>${z[4]?"Unlocked":z[1]}</small></div>`).join("");
    $("#ach").innerHTML=AC.map(c=>{const t=c[4].findIndex(v=>c[3]<v),nx=t<0?null:c[4][t],pv=t<=0?0:c[4][t-1];return `<div class="card" style="box-shadow:none"><div class="lx-ins" style="--c:var(--primary)"><span class="ib">${ic(c[2])}</span><div style="flex:1"><b>${c[0]}</b><div style="color:var(--muted);font-size:.85rem">${c[1]}: ${c[3]} ${c[5]}${nx?` · next tier at ${nx}`:" · all tiers complete"}</div></div></div><div class="lx-track" style="margin-top:12px"><i style="width:${nx?Math.max(4,(c[3]-pv)/(nx-pv)*100):100}%"></i></div><div class="lx-pips">${c[4].map(v=>`<i class="${c[3]>=v?"on":""}" data-tip="Tier: ${v} ${c[5]}"></i>`).join("")}</div></div>`}).join("")};
  document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b||b.disabled)return;const d=b.dataset;
    if(d.claim){const m=MIS.flatMap(g=>g[1]).find(z=>z[0]===d.claim),o=lvl(XP());G.claimed[clk(m)]=1;G.xp+=m[4];G.coins+=m[5];save();draw();const n=lvl(XP());toast(n>o?`Level up! You reached level ${n}`:`+${m[4]} XP and +${m[5]} coins`)}
    if(d.buy){const s=SHOP[d.buy];G.owned[d.buy]=1;G.coins-=s[2];save();draw();toast(`${s[0]} unlocked`)}});
  draw();
}
