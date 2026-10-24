const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ic=n=>`<svg class="i"><use href="#${n}"/></svg>`;
const h=new Date().getHours();$("#hello").textContent=(h<12?"Good morning":h<18?"Good afternoon":"Good evening")+", "+(()=>{try{const u=JSON.parse(localStorage.getItem("n2q-user"));return u&&u.name?u.name.split(" ")[0]:"Aarav"}catch(e){return"Aarav"}})();

/* sparklines */
function spark(d,c){const w=200,hh=36,m=Math.max(...d),n=Math.min(...d),p=d.map((v,i)=>[i/(d.length-1)*w,hh-4-(v-n)/(m-n||1)*(hh-8)]);
  const l=p.map((q,i)=>(i?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1)).join(" ");
  return `<svg class="spark" viewBox="0 0 ${w} ${hh}" preserveAspectRatio="none"><path d="${l}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`}
/* live count of due cards from the Flashcards module (falls back to the sample 24) */
let dueCards=24;try{const f=JSON.parse(localStorage.getItem("n2q-flashcards-v1"));if(f&&Array.isArray(f.cards))dueCards=f.cards.filter(c=>c.due<=Date.now()).length}catch(e){}
const stats=[["Study time","12h 40m","+18%",1,[4,6,5,8,7,9,11],"var(--primary)"],["Quizzes taken","23","+4",1,[2,3,3,4,3,5,4],"var(--accent)"],
["Avg. accuracy","88%","+3%",1,[78,80,83,82,85,87,88],"var(--ok)"],["Cards due",String(dueCards),"-6",0,[40,38,35,30,29,27,dueCards],"var(--warn)"]];
$("#stats").innerHTML=stats.map(s=>`<div class="card stat c3 h"><div class="hd" style="margin:0"><span class="sub">${s[0]}</span><span class="chip ${s[3]?"":"d"}">${s[2]}</span></div><div class="v">${s[1]}</div>${spark(s[4],s[5])}</div>`).join("");

/* levels */
$("#levels").innerHTML=[10,11,12,13,14].map(l=>`<span class="chip" style="${l===12?"background:var(--primary);color:#fff":l>12?"background:var(--hover);color:var(--muted)":""}">${l<=12?"Lv "+l:"Lv "+l}</span>`).join("");

/* heatmap */
const lv=[1,2,2,3,1,2,3,2,3,3,2,3,3,2];
$("#heat").innerHTML=lv.map(v=>`<i class="l${v}"></i>`).join("");

/* rings */
const rings=[["Study hours",5,7,"var(--primary)","5 / 7 h"],["Quizzes",4,6,"var(--accent)","4 / 6"],["Cards",78,100,"var(--ok)","78 / 100"]];
const R=34,C=2*Math.PI*R;
$("#rings").innerHTML=rings.map(r=>`<div><div class="ringbox"><svg width="84" height="84" viewBox="0 0 84 84"><circle class="ring-bg" cx="42" cy="42" r="${R}" fill="none" stroke-width="8"/>
<circle class="ring-fg" data-p="${r[1]/r[2]}" cx="42" cy="42" r="${R}" fill="none" stroke="${r[3]}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
<div class="t" style="font-size:.95rem">${Math.round(r[1]/r[2]*100)}%</div></div><small>${r[0]}</small><span>${r[4]}</span></div>`).join("");

/* weekly bars */
const days=[["Mon",95],["Tue",120],["Wed",70],["Thu",140],["Fri",110],["Sat",160],["Sun",65]];
$("#bars").innerHTML=days.map(d=>`<div class="col"><div class="b" data-v="${d[1]} min" data-h="${d[1]/170*100}"></div><span>${d[0]}</span></div>`).join("");

/* monthly goals */
$("#goals").innerHTML=[["Complete 80 quizzes",58,80],["Master 40 concepts",31,40],["Study 50 hours",29,50],["Upload 12 notes",11,12]].map(g=>
 `<div class="goal"><div><span>${g[0]}</span><span class="sub">${g[1]}/${g[2]}</span></div><div class="bar"><i data-w="${g[1]/g[2]*100}"></i></div></div>`).join("");

/* accuracy line */
const acc=[72,75,70,78,80,76,82,84,81,85,83,86,84,88,85,87,90,86,88,91,87,89,92,88,90,89,93,90,91,94];
const pts=acc.map((v,i)=>[i/(acc.length-1)*600,150-(v-65)/32*140]);
const path=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
$("#line").innerHTML=`<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--primary)" stop-opacity=".35"/><stop offset="1" stop-color="var(--primary)" stop-opacity="0"/></linearGradient></defs>
${[30,70,110].map(y=>`<line x1="0" x2="600" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="3 5" vector-effect="non-scaling-stroke"/>`).join("")}
<path d="${path} L600 150 L0 150Z" fill="url(#g)"/><path id="lp" d="${path}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;

/* activity */
$("#acts").innerHTML=[["quiz","Scored 92% on Cell biology quiz","12 questions · +120 XP","2h ago"],["file","Uploaded “Organic chemistry, ch. 6”","Generated 18 flashcards","5h ago"],
["chat","Asked study partner about enzyme inhibition","Explained from your notes","Yesterday"],["cards","Reviewed 40 flashcards","Recall 86% · +80 XP","Yesterday"],["trophy","Unlocked “Two week streak”","Achievement · +200 XP","2 days ago"]]
.map(a=>`<div class="act"><span class="ic">${ic(a[0])}</span><div><b>${a[1]}</b><small>${a[2]}</small></div><small>${a[3]}</small></div>`).join("");

/* achievements */
$("#ach").innerHTML=[["Two week streak","Study 14 days in a row","trophy","linear-gradient(135deg,#F9B93F,#F2546B)",1],["Quiz master","Finish 50 quizzes","target","linear-gradient(135deg,var(--primary),var(--accent))",1],
["Sharp mind","90% accuracy in a week","star","linear-gradient(135deg,#2DD99A,#2BE0F7)",1],["Note collector","Upload 25 notes","file","linear-gradient(135deg,#E04BD8,var(--primary))",1],
["Early bird","Study before 7 am, 5 times","clock","",0],["Concept master","Master 300 concepts","cards","",0],["Month streak","Study 30 days in a row","flame","",0],["Top 10","Reach your school’s top 10","trophy","",0]]
.map(a=>`<div class="a ${a[4]?"":"lock"}"><div class="badge" style="background:${a[3]}">${ic(a[2]).replace('class="i"','class="i" style="width:22px;height:22px"')}</div><b>${a[0]}</b><small>${a[1]}</small></div>`).join("");

/* animate on view */
function count(el){const n=+el.dataset.n,t0=performance.now();(function f(t){const p=Math.min((t-t0)/1400,1);el.textContent=Math.round(n*(1-Math.pow(1-p,4))).toLocaleString();if(p<1)requestAnimationFrame(f)})(t0)}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const el=e.target;
 if(el.dataset.n)count(el);
 if(el.classList.contains("bar")){const i=$("i",el);i.style.width=i.dataset.w+"%"}
 if(el.classList.contains("ring-fg"))el.style.strokeDashoffset=C*(1-el.dataset.p);
 if(el.classList.contains("b"))el.style.height=el.dataset.h+"%";
 if(el.id==="lp"){const L=el.getTotalLength();el.style.strokeDasharray=L;el.style.strokeDashoffset=L;el.getBoundingClientRect();el.style.transition="stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1)";el.style.strokeDashoffset=0}
}),{threshold:.3});
$$("[data-n],.bar,.ring-fg,#bars .b,#lp").forEach(e=>io.observe(e));

/* toast + theme */
let tt;function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),2400)}
$$("[data-toast]").forEach(b=>b.onclick=()=>toast(b.dataset.toast));
$("#theme").onclick=()=>{const r=document.documentElement,c=r.dataset.theme||(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark");r.dataset.theme=c==="dark"?"light":"dark"};
