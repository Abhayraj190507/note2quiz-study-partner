const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ic=n=>`<svg class="i"><use href="#${n}"/></svg>`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const words=s=>(s.trim().match(/\S+/g)||[]).length;

/* ================= Sample data =================
   Everything below SAMPLE_* stands in for the AI response.
   Swap analyzeNotes() for a real API call that returns the same shape. */
const SAMPLE_NOTE=`# Photosynthesis & Cellular Respiration, Unit 4

{d|Photosynthesis is the process by which plants, algae and some bacteria convert light energy into chemical energy stored in glucose.} It takes place in the {c|chloroplasts}, which contain the green pigment chlorophyll. {d|Chlorophyll absorbs mainly red and blue light.} The overall reaction is {f|6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂}.

The process has two stages. In the {c|light-dependent reactions}, held in the {c|thylakoid} membranes, light splits water and releases oxygen while producing ATP and NADPH. {d|ATP (adenosine triphosphate) is the cell’s main short-term energy currency.} {d|The Calvin cycle is the set of light-independent reactions in the stroma that use ATP and NADPH to fix CO₂ into glucose.} {k|Remember: the Calvin cycle does not use light directly, but it stops without the ATP and NADPH made in the light reactions.}

{d|Cellular respiration breaks down glucose with oxygen to release usable energy as ATP.} It is roughly the reverse of photosynthesis: {f|C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP}. It runs in three steps: {c|glycolysis} in the cytoplasm, then the {c|Krebs cycle} and the {c|electron transport chain} in the mitochondria. One glucose yields about 30–32 ATP.

{k|Three factors limit the rate of photosynthesis: light intensity, CO₂ concentration and temperature.} Whichever is in shortest supply sets the rate. {d|Stomata are tiny leaf pores that regulate gas exchange.} When they close to save water, CO₂ intake drops and the rate falls.

Energy changes decide whether a reaction happens on its own: {f|ΔG = ΔH − TΔS}. A negative ΔG means the reaction is spontaneous. {k|Exam tip: photosynthesis is endergonic (ΔG > 0), respiration is exergonic (ΔG < 0).}`;
const SAMPLE_PLAIN=SAMPLE_NOTE.replace(/^# /,"").replace(/\{[dfkc]\|([^}]*)\}/g,"$1");

const SAMPLE_RESULT={
 summary:{
  brief:"Photosynthesis converts light energy into glucose in two stages: light reactions in the thylakoids make ATP, NADPH and oxygen, and the Calvin cycle in the stroma uses them to fix CO₂. Cellular respiration reverses the process to release ATP. Light, CO₂ and temperature limit the rate.",
  detailed:["Photosynthesis lets plants, algae and some bacteria store light energy as glucose inside chloroplasts. It has two stages: the light-dependent reactions in the thylakoid membranes split water to make ATP, NADPH and oxygen, and the Calvin cycle in the stroma uses that ATP and NADPH to fix carbon dioxide into glucose.","Cellular respiration is roughly the reverse. Glycolysis, the Krebs cycle and the electron transport chain break glucose down with oxygen, yielding about 30–32 ATP per molecule.","The rate of photosynthesis is limited by light intensity, CO₂ and temperature, and closing stomata cuts CO₂ intake. Gibbs free energy explains the direction: photosynthesis is endergonic and respiration is exergonic."],
  bullets:["Photosynthesis stores light energy as glucose in two linked stages.","The light reactions feed ATP and NADPH to the Calvin cycle.","Respiration releases that energy again, about 30–32 ATP per glucose.","Light, CO₂ and temperature limit the rate; the scarcest one decides."]
 },
 keyPoints:[
  {t:"Photosynthesis turns light energy into chemical energy stored in glucose, inside the chloroplasts.",l:"hi",b:"Critical"},
  {t:"Light reactions (thylakoids) make ATP, NADPH and O₂; the Calvin cycle (stroma) uses them to build glucose.",l:"hi",b:"Critical"},
  {t:"The Calvin cycle needs no light directly, but stops without the products of the light reactions.",l:"md",b:"Important"},
  {t:"Respiration is roughly the reverse of photosynthesis and yields about 30–32 ATP per glucose.",l:"md",b:"Important"},
  {t:"Light, CO₂ and temperature limit photosynthesis; the scarcest factor sets the rate.",l:"md",b:"Important"},
  {t:"Photosynthesis is endergonic (ΔG > 0); respiration is exergonic (ΔG < 0).",l:"lo",b:"Exam tip"}
 ],
 topics:{
  meta:[["Subject","Biology"],["Level","Intro undergraduate"],["Confidence","94%"]],
  list:[
   {n:"Photosynthesis",s:96,c:"var(--ok)",k:["chloroplast","chlorophyll","Calvin cycle","thylakoid"]},
   {n:"Cellular respiration",s:81,c:"var(--accent)",k:["glycolysis","Krebs cycle","ATP yield"]},
   {n:"Plant biology",s:67,c:"var(--primary)",k:["stomata","gas exchange"]},
   {n:"Bioenergetics",s:58,c:"var(--pink)",k:["ATP","NADPH","Gibbs energy"]},
   {n:"Limiting factors",s:44,c:"var(--warn)",k:["light","CO₂","temperature"]}
  ]
 },
 concepts:[
  {n:"Light-dependent reactions",r:96,lv:"Core",c:"var(--ok)",d:"Light splits water in the thylakoids, producing ATP, NADPH and oxygen."},
  {n:"Calvin cycle",r:94,lv:"Core",c:"var(--ok)",d:"Uses ATP and NADPH in the stroma to fix CO₂ into glucose."},
  {n:"Chloroplast structure",r:82,lv:"Supporting",c:"var(--accent)",d:"Thylakoids hold chlorophyll; the stroma surrounds them."},
  {n:"Electron transport chain",r:78,lv:"Supporting",c:"var(--accent)",d:"Mitochondrial step that produces most of the ATP in respiration."},
  {n:"Limiting factors",r:71,lv:"Supporting",c:"var(--accent)",d:"The scarcest of light, CO₂ or temperature caps the reaction rate."},
  {n:"Gibbs free energy",r:58,lv:"Advanced",c:"var(--warn)",d:"ΔG sign predicts whether a reaction is spontaneous."}
 ],
 formulas:[
  {n:"Photosynthesis (overall)",eq:"6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂",v:[["CO₂","carbon dioxide"],["H₂O","water"],["C₆H₁₂O₆","glucose"],["O₂","oxygen"]]},
  {n:"Cellular respiration (overall)",eq:"C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP",v:[["C₆H₁₂O₆","glucose"],["ATP","~30–32 per glucose"]]},
  {n:"Gibbs free energy",eq:"ΔG = ΔH − TΔS",v:[["ΔG","free energy change"],["ΔH","enthalpy change"],["T","temperature (K)"],["ΔS","entropy change"]]}
 ],
 definitions:[
  {t:"Photosynthesis",d:"The process by which plants, algae and some bacteria convert light energy into chemical energy stored in glucose."},
  {t:"Chlorophyll",d:"Green pigment in chloroplasts that absorbs mainly red and blue light."},
  {t:"ATP",d:"Adenosine triphosphate, the cell’s main short-term energy currency."},
  {t:"Calvin cycle",d:"Light-independent reactions in the stroma that use ATP and NADPH to fix CO₂ into glucose."},
  {t:"Cellular respiration",d:"Breakdown of glucose with oxygen to release usable energy as ATP."},
  {t:"Stomata",d:"Tiny leaf pores that regulate gas exchange."}
 ],
 mindmap:{root:"Photosynthesis & respiration",branches:[
  {n:"Light reactions",c:"var(--primary)",s:1,l:["Thylakoid membranes","Water splitting","ATP + NADPH","O₂ released"]},
  {n:"Calvin cycle",c:"var(--accent)",s:1,l:["Stroma","CO₂ fixation","Uses ATP + NADPH","Glucose made"]},
  {n:"Limiting factors",c:"var(--ok)",s:1,l:["Light intensity","CO₂ level","Temperature","Stomata"]},
  {n:"Chloroplast",c:"var(--warn)",s:-1,l:["Chlorophyll","Thylakoids","Stroma"]},
  {n:"Cellular respiration",c:"var(--pink)",s:-1,l:["Glycolysis","Krebs cycle","Electron transport","30–32 ATP"]}
 ]}
};

/* Replace this with your backend call, e.g.
   const r=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})});return r.json(); */
async function analyzeNotes(text){return SAMPLE_RESULT}

/* ================= Modules ================= */
const MODS=[
 {id:"summary",label:"Summary",icon:"spark",c:"var(--primary)"},
 {id:"keyPoints",label:"Key points",icon:"list",c:"var(--warn)"},
 {id:"topics",label:"Topics",icon:"tag",c:"var(--accent)"},
 {id:"concepts",label:"Concepts",icon:"bulb",c:"var(--ok)"},
 {id:"formulas",label:"Formulas",icon:"sigma",c:"var(--pink)"},
 {id:"definitions",label:"Definitions",icon:"book",c:"var(--blue)"},
 {id:"highlights",label:"Highlights",icon:"marker",c:"var(--orange)"},
 {id:"mindmap",label:"Mind map",icon:"map",c:"var(--violet)"}
];
const on=new Set(MODS.map(m=>m.id));
let result=null,elapsed=0,sumMode="brief";

/* toast + theme */
let tt;function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),2400)}
$("#theme").onclick=()=>{const r=document.documentElement,c=r.dataset.theme||(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark");r.dataset.theme=c==="dark"?"light":"dark"};
const copy=async(t,m="Copied to clipboard")=>{try{await navigator.clipboard.writeText(t);toast(m)}catch{toast("Copy is blocked in this browser")}};

/* ================= Input ================= */
const ta=$("#text"),wc=()=>{$("#wc").textContent=words(ta.value).toLocaleString()+" words"};
ta.value=SAMPLE_PLAIN;wc();ta.oninput=wc;
$("#sample").onclick=()=>{ta.value=SAMPLE_PLAIN;$("#title").value="Photosynthesis & cellular respiration";wc();toast("Sample notes loaded")};
$("#clear").onclick=()=>{ta.value="";wc();ta.focus()};
const pick=()=>$("#file").click();$("#pick").onclick=pick;$("#up-top").onclick=pick;
$("#file").onchange=e=>{const f=e.target.files[0];if(!f)return;
 if(!/\.(txt|md)$/i.test(f.name)){toast("This preview reads .txt and .md files only");return}
 const r=new FileReader();r.onload=()=>{ta.value=String(r.result);$("#title").value=f.name.replace(/\.[^.]+$/,"");wc();toast("Loaded "+f.name)};r.readAsText(f);e.target.value=""};
["dragover","drop"].forEach(ev=>ta.addEventListener(ev,e=>{e.preventDefault();if(ev==="drop"){const f=e.dataTransfer.files[0];if(f){$("#file").files=e.dataTransfer.files;$("#file").onchange({target:$("#file")})}}}));

$("#mods").innerHTML=MODS.map(m=>`<button class="mod on" data-id="${m.id}" style="--c:${m.c}" aria-pressed="true">${ic(m.icon)}${m.label}</button>`).join("");
$("#mods").onclick=e=>{const b=e.target.closest(".mod");if(!b)return;const id=b.dataset.id;
 if(on.has(id)&&on.size===1){toast("Keep at least one module on");return}
 on.has(id)?on.delete(id):on.add(id);b.classList.toggle("on",on.has(id));b.setAttribute("aria-pressed",on.has(id));
 if(result)renderResults(false)};

/* ================= Pipeline ================= */
const STEP_LABEL={summary:"Writing the summary",keyPoints:"Extracting key points",topics:"Detecting topics",concepts:"Mapping concepts",formulas:"Finding formulas",definitions:"Finding definitions",highlights:"Highlighting important content",mindmap:"Building the mind map"};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function runPipeline(){
 const steps=["Reading your notes",...MODS.filter(m=>on.has(m.id)).map(m=>STEP_LABEL[m.id])];
 $("#steps").innerHTML=steps.map(s=>`<li><span class="st">${ic("check")}</span>${s}</li>`).join("");
 const lis=$$("#steps li"),b=$("#pipe-b"),p=$("#pipe-p");
 for(let i=0;i<lis.length;i++){
  lis[i].className="run";$("#pipe-s").textContent=steps[i]+"…";
  await sleep(i===0?450:300+Math.random()*180);
  lis[i].className="ok";const pc=Math.round((i+1)/lis.length*100);b.style.width=pc+"%";p.textContent=pc+"%";
 }
 $("#pipe-s").textContent="Done";
}

$("#go").onclick=async()=>{
 if(words(ta.value)<8){toast("Add a few lines of notes first");ta.focus();return}
 const go=$("#go");go.disabled=true;go.classList.add("loading");
 $("#results").hidden=true;$("#pipe").hidden=false;$("#pipe-b").style.width="0";$("#pipe-p").textContent="0%";
 $("#pipe-t").textContent="Analyzing “"+($("#title").value.trim()||"Untitled note")+"”";
 $("#pipe").scrollIntoView({behavior:"smooth",block:"start"});
 const t0=performance.now();
 try{
  const [data]=await Promise.all([analyzeNotes(ta.value),runPipeline()]);
  result=data;elapsed=(performance.now()-t0)/1000;await sleep(350);
  $("#pipe").hidden=true;renderResults(true);
  $("#results").scrollIntoView({behavior:"smooth",block:"start"});
 }catch(err){toast("Analysis failed. Please try again.");$("#pipe").hidden=true}
 go.disabled=false;go.classList.remove("loading");
};

/* ================= Cards ================= */
const card=(id,span,title,sub,body,{count,actions="",delay=0}={})=>{
 const m=MODS.find(x=>x.id===id);
 return `<article class="card rc ${span}" id="m-${id}" style="--c:${m.c};--d:${delay}ms"><header class="rh"><span class="rt">${ic(m.icon)}</span><div><h3>${title}</h3><span class="sub">${sub}</span></div><div class="ra">${count!=null?`<span class="cnt">${count}</span>`:""}${actions}</div></header>${body}</article>`};
const ibtn=(act,icon,label)=>`<button class="ib" data-act="${act}" aria-label="${label}" title="${label}">${ic(icon)}</button>`;

function sumBody(r){
 const s=r.summary;let html;
 if(sumMode==="brief")html=`<p>${esc(s.brief)}</p>`;
 else if(sumMode==="detailed")html=s.detailed.map(p=>`<p>${esc(p)}</p>`).join("");
 else html=`<ul>${s.bullets.map(b=>`<li>${esc(b)}</li>`).join("")}</ul>`;
 return html}
function sumText(r){return sumMode==="brief"?r.summary.brief:sumMode==="detailed"?r.summary.detailed.join("\n\n"):r.summary.bullets.map(b=>"• "+b).join("\n")}

const BUILD={
 summary:(r,d)=>{const w=words(ta.value),sw=words(sumText(r)),pct=Math.max(0,Math.round((1-sw/w)*100));
  const seg=["brief","detailed","bullets"].map(k=>`<button data-mode="${k}" class="${k===sumMode?"on":""}">${k[0].toUpperCase()+k.slice(1)}</button>`).join("");
  return card("summary","c8","Summary","The whole note in a few lines",
   `<div style="margin-bottom:16px"><div class="seg2" id="seg" role="tablist">${seg}</div></div><div class="lede" id="sum-body">${sumBody(r)}</div>
    <div class="cond"><div class="row2"><span>Condensed from <b>${w}</b> to <b id="sw">${sw}</b> words</span><b id="sp" style="color:var(--ok)">${pct}% shorter</b></div><div class="bar"><i id="sbar" data-w="${pct}"></i></div></div>`,
   {actions:ibtn("copy-sum","copy","Copy summary"),delay:d})},
 keyPoints:(r,d)=>card("keyPoints","c4","Key points","What to remember",
   r.keyPoints.map((k,i)=>`<div class="kp"><span class="n">${i+1}</span><div><p>${esc(k.t)}</p><span class="lv ${k.l}">${k.b}</span></div></div>`).join(""),
   {count:r.keyPoints.length,actions:ibtn("copy-kp","copy","Copy key points"),delay:d}),
 topics:(r,d)=>card("topics","c5","Detected topics","Ranked by relevance to your note",
   `<div class="pills">${r.topics.meta.map(m=>`<span class="pill">${m[0]} <b>${m[1]}</b></span>`).join("")}</div>`+
   r.topics.list.map((t,i)=>`<div class="tp" style="--tc:${t.c}"><div class="t1">${esc(t.n)}${i===0?'<span class="main">Main topic</span>':""}<em>${t.s}%</em></div><div class="bar"><i data-w="${t.s}"></i></div><div class="kw">${t.k.map(k=>`<span>${esc(k)}</span>`).join("")}</div></div>`).join(""),
   {count:r.topics.list.length,delay:d}),
 concepts:(r,d)=>card("concepts","c7","Key concepts","Ideas your notes depend on",
   `<div class="cg">${r.concepts.map(c=>`<div class="cc" style="--c:${c.c};--p:${c.r}"><div class="rg"><b>${c.r}</b></div><div><h4>${esc(c.n)}<span class="lvl2">${c.lv}</span></h4><p>${esc(c.d)}</p></div></div>`).join("")}</div>`,
   {count:r.concepts.length,delay:d}),
 formulas:(r,d)=>card("formulas","c6","Formulas","Equations found in your notes",
   r.formulas.map(f=>`<div class="fm"><div class="fn">${esc(f.n)}<button class="ib" data-eq="${esc(f.eq)}" aria-label="Copy formula" title="Copy formula">${ic("copy")}</button></div><div class="eq">${esc(f.eq)}</div><div class="vars">${f.v.map(v=>`<span><b>${esc(v[0])}</b>${esc(v[1])}</span>`).join("")}</div></div>`).join(""),
   {count:r.formulas.length,delay:d}),
 definitions:(r,d)=>card("definitions","c6","Definitions","Terms explained in your notes",
   r.definitions.map(x=>`<div class="df"><div class="tm"><h4>${esc(x.t)}</h4><button data-card="${esc(x.t)}">${ic("cards")}Make flashcard</button></div><p>${esc(x.d)}</p></div>`).join(""),
   {count:r.definitions.length,delay:d}),
 highlights:(r,d)=>{const p=parseNote();
  const L=[["d","Definitions","var(--blue)"],["f","Formulas","var(--pink)"],["k","Important","var(--warn)"],["c","Concepts","var(--ok)"]];
  return card("highlights","c12","Highlighted notes","Your note, annotated. Toggle a type to show or hide it",
   `<div class="legend" id="legend">${L.map(l=>`<button class="lg on" data-t="${l[0]}" style="--c:${l[2]}" aria-pressed="true"><i></i>${l[1]}<em>${p.counts[l[0]]}</em></button>`).join("")}</div><div class="paper" id="paper">${p.html}</div>`,
   {count:Object.values(p.counts).reduce((a,b)=>a+b,0),delay:d})},
 mindmap:(r,d)=>card("mindmap","c12","Mind map","Drag to pan. Click a branch to collapse it",
   `<div class="mm" id="mm"><div class="mmt">${ibtn("zin","plus","Zoom in")}${ibtn("zout","minus","Zoom out")}${ibtn("zfit","fit","Reset view")}<button class="btn btn-sm" id="mm-all" style="border:0;box-shadow:none;background:none">Collapse all</button></div><svg id="mm-svg" role="img" aria-label="Mind map of the note"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--primary)"/><stop offset="1" style="stop-color:var(--accent)"/></linearGradient></defs><g id="mm-g"></g></svg><span class="mmh">Drag to pan · Buttons to zoom</span></div>`,
   {count:r.mindmap.branches.length+" branches",delay:d})
};
const SPAN_ORDER=["summary","keyPoints","topics","concepts","formulas","definitions","highlights","mindmap"];

function parseNote(){
 const counts={d:0,f:0,k:0,c:0},LBL={d:"Definition",f:"Formula",k:"Important",c:"Concept"};
 const html=SAMPLE_NOTE.split(/\n\n/).map(p=>{
  if(p.startsWith("# "))return `<h4>${esc(p.slice(2))}</h4>`;
  return `<p>${esc(p).replace(/\{([dfkc])\|([^}]*)\}/g,(m,t,x)=>{counts[t]++;return `<mark class="hl hl-${t}" title="${LBL[t]}">${x}</mark>`})}</p>`}).join("");
 return {html,counts}}

/* ================= Render ================= */
function renderResults(animate){
 const r=result,w=words(ta.value),title=esc($("#title").value.trim()||"Untitled note");
 const stats=[["Words",w.toLocaleString(),"file","var(--primary)"],["Read time",Math.max(1,Math.ceil(w/220))+" min","clock","var(--accent)"],["Topics",r.topics.list.length,"tag","var(--ok)"],["Concepts",r.concepts.length,"bulb","var(--warn)"],["Formulas",r.formulas.length,"sigma","var(--pink)"],["Definitions",r.definitions.length,"book","var(--blue)"]];
 let d=animate?60:0,step=animate?70:0;
 const cards=SPAN_ORDER.filter(id=>on.has(id)).map(id=>{const h=BUILD[id](r,d);d+=step;return h}).join("");
 $("#results").innerHTML=`
 <div class="rhead"><div><span class="chip ok">${ic("check")}Analysis complete</span><span class="chip pv" title="Sample data until the AI service is connected">Sample results</span><h2>${title}</h2><span class="sub">${w} words · analyzed in ${elapsed.toFixed(1)}s · ${on.size} of 8 modules</span></div>
  <div class="acts2"><button class="btn" id="copy-all">${ic("copy")}Copy all</button><button class="btn" id="rerun">${ic("redo")}Re-run</button></div></div>
 <div class="strip">${stats.map((s,i)=>`<div class="sc" style="--c:${s[3]};--d:${i*40}ms"><span class="l">${ic(s[2])}${s[0]}</span><div class="v">${s[1]}</div></div>`).join("")}</div>
 <div class="grid" id="cards">${cards}</div>
 <div class="cta" style="--d:${d+40}ms"><div><h3>Ready to test yourself?</h3><p>Turn this analysis into practice questions and flashcards.</p></div><div class="row"><button class="btn" id="mk-cards">${ic("cards")}Create flashcards</button><button class="btn btn-p" data-toast="Quiz generator opened">${ic("quiz")}Generate quiz</button></div></div>`;
 $("#results").hidden=false;
 $$("[data-toast]",$("#results")).forEach(b=>b.onclick=()=>toast(b.dataset.toast));
 requestAnimationFrame(()=>requestAnimationFrame(()=>$$("#results .bar i").forEach(i=>i.style.width=i.dataset.w+"%")));
 if(on.has("mindmap"))initMM();
}

/* Hand cards to the Flashcards module (flashcards.html reads this key on load) */
const FC_INBOX="n2q-flashcards-inbox";
const defCard=x=>({front:"What is "+x.t+"?",back:x.d});
function queueCards(cards){
 let box;try{box=JSON.parse(localStorage.getItem(FC_INBOX))||{}}catch(e){box={}}
 box.title=$("#title").value.trim()||"AI analysis";box.cat=result?.topics?.meta?.[0]?.[1]||box.cat||null;box.cards=box.cards||[];
 cards.forEach(c=>{if(!box.cards.some(x=>x.front===c.front))box.cards.push(c)});
 try{localStorage.setItem(FC_INBOX,JSON.stringify(box))}catch(e){toast("Couldn’t save cards in this browser")}
 return box.cards.length}

/* Delegated card interactions */
$("#results").addEventListener("click",e=>{
 const t=e.target;let b;
 if(b=t.closest("#seg button")){sumMode=b.dataset.mode;$$("#seg button").forEach(x=>x.classList.toggle("on",x===b));
  $("#sum-body").innerHTML=sumBody(result);const w=words(ta.value),sw=words(sumText(result)),pct=Math.max(0,Math.round((1-sw/w)*100));
  $("#sw").textContent=sw;$("#sp").textContent=pct+"% shorter";$("#sbar").style.width=pct+"%";return}
 if(b=t.closest("[data-act]")){const a=b.dataset.act;
  if(a==="copy-sum")copy(sumText(result),"Summary copied");
  if(a==="copy-kp")copy(result.keyPoints.map((k,i)=>`${i+1}. ${k.t}`).join("\n"),"Key points copied");
  if(a==="zin")zoom(1.2);if(a==="zout")zoom(1/1.2);if(a==="zfit"){mm.x=mm.y=0;mm.k=1;applyMM()}return}
 if(b=t.closest("[data-eq]")){copy(b.dataset.eq,"Formula copied");return}
 if(b=t.closest("[data-card]")){const d=result.definitions.find(x=>x.t===b.dataset.card);if(!d)return;
  const n=queueCards([defCard(d)]);b.innerHTML=ic("check")+"Queued";b.disabled=true;toast(`Queued “${d.t}” for Flashcards (${n} waiting)`);return}
 if(t.closest("#mk-cards")){const n=queueCards([...result.definitions.map(defCard),...result.concepts.map(c=>({front:"Explain: "+c.n,back:c.d})),...result.formulas.map(f=>({front:f.n+": write the equation",back:f.eq}))]);
  toast(`${n} flashcards ready. Opening Flashcards…`);setTimeout(()=>location.href="flashcards.html?import=1",500);return}
 if(b=t.closest("#legend .lg")){const on2=b.classList.toggle("on");b.setAttribute("aria-pressed",on2);$("#paper").classList.toggle("off-"+b.dataset.t,!on2);return}
 if(t.closest("#copy-all")){const r=result;copy(`${$("#title").value}\n\nSUMMARY\n${sumText(r)}\n\nKEY POINTS\n${r.keyPoints.map((k,i)=>`${i+1}. ${k.t}`).join("\n")}\n\nDEFINITIONS\n${r.definitions.map(x=>`${x.t}: ${x.d}`).join("\n")}\n\nFORMULAS\n${r.formulas.map(f=>`${f.n}: ${f.eq}`).join("\n")}`,"Full analysis copied");return}
 if(t.closest("#rerun")){$("#go").click();return}
 if(t.closest("#mm-all")){toggleAll();return}
});

/* ================= Mind map ================= */
const mm={x:0,y:0,k:1,collapsed:new Set(),fresh:true};
const cv=document.createElement("canvas").getContext("2d");
const tw=(t,f)=>{cv.font=f;return cv.measureText(t).width};
const H=36,GAP=24;
function applyMM(){const g=$("#mm-g");if(g)g.setAttribute("transform",`translate(${mm.x} ${mm.y}) scale(${mm.k})`)}
function zoom(f){mm.k=Math.min(2.5,Math.max(.5,mm.k*f));applyMM()}
const curve=(x1,y1,x2,y2)=>{const m=(x1+x2)/2;return `M${x1} ${y1}C${m} ${y1} ${m} ${y2} ${x2} ${y2}`};

function drawMM(){
 const M=result.mindmap,svg=$("#mm-svg");if(!svg)return;
 const rootW=tw(M.root,"700 15px Sora, system-ui")+52,hr=rootW/2;
 let out="",minX=-hr,maxX=hr,minY=-28,maxY=28,ld=0;
 [1,-1].forEach(S=>{
  const bs=M.branches.filter(b=>b.s===S);if(!bs.length)return;
  const hs=bs.map(b=>(mm.collapsed.has(b.n)?1:b.l.length)*H);
  const total=hs.reduce((a,b)=>a+b,0)+GAP*(bs.length-1);let y=-total/2;
  bs.forEach((b,bi)=>{
   const h=hs[bi],by=y+h/2,top=y;y+=h+GAP;
   const bw=tw(b.n,"600 13.5px Inter, system-ui")+40,near=S*(hr+74),far=near+S*bw,bx=Math.min(near,far);
   let g=`<g class="grp" style="--c:${b.c}"><path class="cn" stroke-width="3" d="${curve(S*hr,0,near,by)}"/>`;
   const col=mm.collapsed.has(b.n);
   if(!col)b.l.forEach((l,i)=>{
    const ly=top+i*H+H/2,lw=tw(l,"500 12.5px Inter, system-ui")+36,ln=far+S*58,lx=Math.min(ln,ln+S*lw);
    g+=`<path class="cn" stroke-width="1.8" d="${curve(far,by,ln,ly)}"/><g class="lf" style="--ld:${(ld++)*18}ms"><rect x="${lx}" y="${ly-14}" width="${lw}" height="28" rx="9"/><circle cx="${lx+14}" cy="${ly}" r="3.2"/><text x="${lx+24}" y="${ly}" dominant-baseline="central">${esc(l)}</text></g>`;
    minX=Math.min(minX,lx);maxX=Math.max(maxX,lx+lw);minY=Math.min(minY,ly-20);maxY=Math.max(maxY,ly+20)});
   g+=`<g class="brn" data-b="${esc(b.n)}" tabindex="0" role="button" aria-label="${esc(b.n)}, ${col?"collapsed":"expanded"}"><rect x="${bx}" y="${by-19}" width="${bw}" height="38" rx="12"/><text x="${bx+bw/2}" y="${by}" text-anchor="middle" dominant-baseline="central">${esc(b.n)}</text></g>`;
   if(col){const cx=far+S*16;g+=`<g class="bdg"><circle cx="${cx}" cy="${by}" r="12"/><text x="${cx}" y="${by}" text-anchor="middle" dominant-baseline="central">+${b.l.length}</text></g>`;minX=Math.min(minX,cx-14);maxX=Math.max(maxX,cx+14)}
   minX=Math.min(minX,bx);maxX=Math.max(maxX,bx+bw);minY=Math.min(minY,by-24);maxY=Math.max(maxY,by+24);
   out+=g+"</g>"});
 });
 out+=`<g class="root"><rect x="${-hr}" y="-26" width="${rootW}" height="52" rx="18" fill="url(#rg)"/><text x="0" y="0" text-anchor="middle" dominant-baseline="central">${esc(M.root)}</text></g>`;
 $("#mm-g").innerHTML=out;
 if(mm.fresh){const p=40;svg.setAttribute("viewBox",`${minX-p} ${minY-p} ${maxX-minX+2*p} ${maxY-minY+2*p}`);mm.fresh=false}
 $("#mm-all").textContent=mm.collapsed.size?"Expand all":"Collapse all";
 applyMM();
}
function toggleAll(){const bs=result.mindmap.branches;mm.collapsed.size?mm.collapsed.clear():bs.forEach(b=>mm.collapsed.add(b.n));drawMM()}

function initMM(){
 Object.assign(mm,{x:0,y:0,k:1,fresh:true});mm.collapsed.clear();
 const box=$("#mm"),svg=$("#mm-svg");drawMM();
 svg.addEventListener("mouseover",e=>{const g=e.target.closest(".grp");$$(".grp",svg).forEach(x=>x.classList.toggle("act",x===g));svg.classList.toggle("dim",!!g)});
 svg.addEventListener("mouseleave",()=>{svg.classList.remove("dim");$$(".grp.act",svg).forEach(x=>x.classList.remove("act"))});
 let d=null,moved=false;
 svg.addEventListener("pointerdown",e=>{d={x:e.clientX,y:e.clientY,ox:mm.x,oy:mm.y};moved=false;svg.setPointerCapture(e.pointerId);box.classList.add("drag")});
 svg.addEventListener("pointermove",e=>{if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;
  const vb=svg.viewBox.baseVal,r=svg.getBoundingClientRect(),s=Math.max(vb.width/r.width,vb.height/r.height);
  mm.x=d.ox+dx*s;mm.y=d.oy+dy*s;applyMM()});
 const end=()=>{d=null;box.classList.remove("drag")};
 svg.addEventListener("pointerup",end);svg.addEventListener("pointercancel",end);
 const tog=n=>{mm.collapsed.has(n)?mm.collapsed.delete(n):mm.collapsed.add(n);drawMM()};
 svg.addEventListener("click",e=>{const b=e.target.closest(".brn");if(b&&!moved)tog(b.dataset.b)});
 svg.addEventListener("keydown",e=>{const b=e.target.closest(".brn");if(b&&(e.key==="Enter"||e.key===" ")){e.preventDefault();tog(b.dataset.b)}});
 box.addEventListener("wheel",e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();zoom(e.deltaY<0?1.1:1/1.1)}},{passive:false});
}
