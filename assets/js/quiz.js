const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ic=n=>`<svg class="i"><use href="#${n}"/></svg>`;
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const words=s=>(String(s).match(/\S+/g)||[]).length,norm=s=>String(s).toLowerCase().replace(/[^a-z0-9² ]/g,"").trim();
let tt;const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),2400)};
$("#theme").onclick=()=>{const r=document.documentElement,c=r.dataset.theme||(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark");r.dataset.theme=c==="dark"?"light":"dark"};

/* ---- Question types ---- */
const TY={
 m:{n:"Multiple choice",ic:"mcq",c:"var(--primary)",s:40,p:1,d:"Pick one of four options"},
 t:{n:"True / False",ic:"tf",c:"var(--accent)",s:20,p:1,d:"Judge a statement"},
 f:{n:"Fill in the blank",ic:"fill",c:"var(--ok)",s:35,p:1,d:"Complete the sentence"},
 s:{n:"Short answer",ic:"chat",c:"var(--warn)",s:90,p:2,d:"Answer in 1–3 sentences"},
 l:{n:"Long answer",ic:"file",c:"var(--pink)",s:240,p:4,d:"Write a structured response"}};
const M=(q,o,a,d)=>({t:"m",q,o,a,d}),T=(q,a,d)=>({t:"t",q,a,d}),F=(q,a,d)=>({t:"f",q,a,d}),S=(q,m,k,d)=>({t:"s",q,m,k,d}),L=(q,m,k,d)=>({t:"l",q,m,k,d});
/* Sample bank. Replace build() with a call to your AI service. */
const BANK={
 Biology:{c:"var(--ok)",topics:{
  Cells:[M("Which organelle produces most of a cell’s ATP?",["Ribosome","Mitochondrion","Golgi body","Lysosome"],1,1),T("Plant cells and animal cells both contain mitochondria.",true,1),F("The ___ membrane controls what enters and leaves the cell.",["plasma","cell"],1),
   S("Why is the cell membrane described as selectively permeable?","It lets some substances such as water and oxygen pass while controlling others through channels and transport proteins.",["selectively","channels","transport","pass","proteins"],2),
   L("Compare prokaryotic and eukaryotic cells, giving at least three differences.","Eukaryotic cells have a nucleus and membrane-bound organelles; prokaryotes do not. Prokaryotes are smaller, have circular DNA and no mitochondria.",["nucleus","organelles","dna","smaller","mitochondria","circular"],3)],
  Genetics:[M("A cross between Aa and Aa gives what genotype ratio?",["1:1","3:1","1:2:1","9:3:3:1"],2,2),T("DNA is made of amino acids.",false,1),F("Genes are made of ___.",["dna"],1),
   S("What is the difference between genotype and phenotype?","Genotype is the set of alleles an organism carries; phenotype is the observable trait that results.",["alleles","observable","trait","genetic"],2),
   L("Describe how a mutation can change a protein and what effect that may have.","A change in the DNA base sequence alters mRNA codons, which may change an amino acid, altering protein shape and function.",["dna","sequence","amino acid","protein","shape","function"],3)]}},
 Chemistry:{c:"var(--accent)",topics:{
  Atoms:[M("What is the charge of a proton?",["Negative","Neutral","Positive","Variable"],2,1),T("Isotopes of an element have different numbers of neutrons.",true,2),F("The atomic number equals the number of ___.",["protons","proton"],1),
   S("Why do noble gases rarely react?","They have full outer electron shells, so they are stable and do not gain, lose or share electrons.",["full","outer","shell","stable","electrons"],2),
   L("Explain how electron arrangement sets an element’s position in the periodic table.","Elements in a group share the number of outer electrons, giving similar properties, while the period shows the number of shells.",["group","outer","electrons","period","shells","properties"],3)],
  Reactions:[M("Which of these is an exothermic process?",["Melting ice","Burning methane","Boiling water","Evaporation"],1,2),T("A catalyst is used up in a reaction.",false,2),F("Total mass is unchanged in a reaction, known as conservation of ___.",["mass"],1),
   S("State two ways to speed up a chemical reaction.","Raise the temperature, increase concentration or surface area, or add a catalyst, so particles collide more often.",["temperature","concentration","surface","catalyst","collide"],2),
   L("Using collision theory, explain why higher temperature increases reaction rate.","Particles gain kinetic energy and collide more frequently, and more collisions exceed the activation energy, so more are successful.",["kinetic","collide","frequent","activation","energy","successful"],3)]}},
 "Computer Science":{c:"var(--primary)",topics:{
  Algorithms:[M("What is the time complexity of binary search?",["O(n)","O(log n)","O(n²)","O(1)"],1,2),T("Binary search works on unsorted arrays.",false,1),F("A function that calls itself is called ___.",["recursive","recursion"],1),
   S("What is the difference between a stack and a queue?","A stack is last-in first-out; a queue is first-in first-out.",["lifo","fifo","last","first"],1),
   L("Compare bubble sort and merge sort for efficiency and approach.","Bubble sort swaps adjacent items, O(n²). Merge sort divides the list, sorts halves and merges, O(n log n), but needs extra memory.",["swap","divide","merge","n log n","n²","memory"],3)],
  "Web basics":[M("Which HTML tag creates a hyperlink?",["<link>","<a>","<href>","<nav>"],1,1),T("CSS defines the structure of a web page.",false,1),F("HTTP status 404 means page not ___.",["found"],1),
   S("What does responsive design mean?","The layout adapts to different screen sizes using flexible grids and media queries.",["screen","flexible","media","adapt"],2),
   L("Explain what happens between typing a URL and a page appearing.","The browser finds the IP through DNS, connects to the server, sends an HTTP request, receives HTML and renders it with CSS and JavaScript.",["dns","server","request","html","render","ip"],3)]}}};

/* ---- Your own subjects: questions are written from the notes you paste or upload ---- */
const STOP=new Set("the and for that with this from are was were has have had not but you your they their them then than into over also can will would should could about which what when where while there these those been being such more most other some any each many much very only just like use used using may might must per via our out off all both how why who whom whose does did done make made get got its it's because between within without during after before under above while however therefore thus hence since though although whether either neither another every same own own too still even ever never always often usually sometimes first second third next last new old good bad high low big small large".split(" "));
const KEY="n2q-quiz-subjects-v1",PAL=["var(--pink)","var(--warn)","var(--accent)","var(--ok)","var(--primary)"];
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sentences=t=>{const out=[],seen=new Set();
 String(t).replace(/\r/g,"").split(/\n+/).forEach(line=>{line=line.replace(/^[\s\-\*•\u2022>#\d.)]+/,"").trim();
  line.split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/).forEach(x=>{x=x.trim();const n=words(x);
   if(n>=6&&n<=45&&x.length>=30&&!seen.has(x.toLowerCase())){seen.add(x.toLowerCase());out.push(x)}})});
 return out};
const kws=s=>(s.match(/[A-Za-z][A-Za-z\-']{3,}/g)||[]).map(w=>w.toLowerCase()).filter(w=>!STOP.has(w));
const reWord=w=>new RegExp("\\b"+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","i");
function genBank(text){
 const SS=sentences(text),freq={};
 SS.forEach(s=>new Set(kws(s)).forEach(w=>freq[w]=(freq[w]||0)+1));
 const rank=w=>(freq[w]||0)*2+Math.min(w.length,10)/10,terms=Object.keys(freq).sort((a,b)=>rank(b)-rank(a)),out=[];
 const lvl=x=>{const n=words(x);return n<14?1:n<24?2:3};
 SS.forEach((st,i)=>{
  const ks=[...new Set(kws(st))].sort((a,b)=>rank(b)-rank(a));if(!ks.length)return;
  const key=ks[0],re=reWord(key),blanked=st.replace(re,"___"),d=lvl(st);
  if(!blanked.includes("___"))return;
  const dist=shuf(terms.slice(0,40).filter(w=>w!==key&&!ks.includes(w))).slice(0,3);
  out.push(F(blanked,[norm(key)],d));
  if(dist.length===3){const o=shuf([key,...dist]);out.push(M("Which term best completes this statement from your notes?  “"+blanked+"”",o,o.indexOf(key),d))}
  if(dist.length&&i%2)out.push(T(st.replace(re,dist[0]),false,d));else out.push(T(st,true,d));
  const df=st.match(/^(.{2,50}?)\s+(is|are|refers to|means|is defined as)\s+(.{12,})/i);
  if(df)out.push(S(`What ${/^are$/i.test(df[2])?"are":"is"} ${df[1].replace(/^(the|a|an)\s+/i,m=>m.toLowerCase())}?`,st,ks.slice(0,5),d));
  else if(ks.length>=3)out.push(S(`In your notes, what is said about “${key}”?`,st,ks.slice(0,5),d));
  if(i%3===0&&SS[i+1]){const win=SS.slice(i,i+3),wk=[...new Set(win.flatMap(kws))].sort((a,b)=>rank(b)-rank(a)).slice(0,6);
   out.push(L(`Discuss “${key}” in detail, using your notes.`,win.join(" "),wk,3))}
 });
 return out}
const saveSubs=()=>{try{localStorage.setItem(KEY,JSON.stringify(Object.entries(BANK).filter(([,v])=>v.custom).map(([n,v])=>({n,t:v.text,c:v.c}))))}catch(e){}};
const loadSubs=()=>{try{(JSON.parse(localStorage.getItem(KEY))||[]).forEach(x=>{if(x&&x.n&&x.t&&!BANK[x.n])BANK[x.n]={c:x.c||PAL[0],custom:true,text:x.t,topics:{"Your notes":genBank(x.t)}}})}catch(e){}};
/* Read text notes you saved on the My notes page (same browser) */
function savedTextNotes(){return new Promise(res=>{try{const r=indexedDB.open("n2q-notes-v1",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");
 r.onerror=()=>res([]);r.onsuccess=()=>{try{const q=r.result.transaction("kv").objectStore("kv").get("state");
  q.onsuccess=()=>res(((q.result||{}).files||[]).filter(f=>f.type==="text"&&(f.file||f.text)));q.onerror=()=>res([])}catch(e){res([])}}}catch(e){res([])}})}

/* ---- Settings ---- */
const DF={easy:["Easy","var(--ok)","Recall and recognition. Good for a first pass."],medium:["Medium","var(--warn)","Applying ideas to new situations."],hard:["Hard","var(--bad)","Multi-step reasoning and detailed explanations."],mixed:["Mixed","var(--primary)","A balanced spread from easy to hard."]};
const cfg={sub:"Biology",top:new Set(["Cells","Genetics"]),types:new Set(["m","t","f","s","l"]),count:10,want:10,editName:null,diff:"mixed",tm:"off",mins:0,secs:60,title:"Biology practice quiz"};
const pool=()=>Object.entries(BANK[cfg.sub].topics).filter(([k])=>cfg.top.has(k)).flatMap(e=>e[1]);
const maxQ=()=>Math.max(1,Math.min(200,pool().filter(x=>cfg.types.has(x.t)).length));
function build(){
 const tg={easy:1,medium:2,hard:3}[cfg.diff],by={};
 [...cfg.types].forEach(t=>by[t]=pool().filter(x=>x.t===t).sort((a,b)=>tg?Math.abs(a.d-tg)-Math.abs(b.d-tg):Math.random()-.5));
 const out=[],ks=Object.keys(by);let go=true;
 while(out.length<cfg.count&&go){go=false;ks.forEach(t=>{if(out.length<cfg.count&&by[t].length){out.push(by[t].shift());go=true}})}
 return out}
const est=qs=>qs.reduce((a,q)=>a+TY[q.t].s,0);
const mmss=s=>{s=Math.max(0,Math.round(s));return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")};
const autoMins=qs=>Math.max(2,Math.ceil(est(qs)/300)*5);

/* ---- Config view ---- */
const view=$("#view");
function drawCfg(){
 view.innerHTML=`<div class="qg"><div class="stack">
 <section class="card sec"><h3>Subject</h3><span class="sub">What are you studying?</span><div class="tiles" id="s-sub"></div><div class="row" id="cs-acts"></div></section>
 <section class="card sec" id="cs" hidden></section>
 <section class="card sec"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><h3>Topics</h3><span class="sub">Pick one or more</span></div><button class="btn btn-sm" id="allt"></button></div><div class="chips" id="s-top"></div></section>
 <section class="card sec"><h3>Question types</h3><span class="sub">Mix any combination. Questions are split evenly across your choices</span><div class="tiles tys" id="s-ty"></div></section>
 <section class="card sec"><h3>Number of questions</h3><span class="sub" id="cnt-s"></span><div class="rng"><input type="range" id="cnt" min="1" aria-label="Number of questions"><input type="number" id="cnt-n" class="cnum" min="1" inputmode="numeric" aria-label="Type how many questions you want"></div></section>
 <section class="card sec"><h3>Difficulty</h3><span class="sub">Questions closest to this level are chosen first</span><div class="seg" id="s-df"></div><p class="hint" id="df-h"></p></section>
 <section class="card sec"><h3>Timer</h3><span class="sub">Add time pressure, or study at your own pace</span><div class="seg" id="s-tm"></div><div id="tm-o"></div></section>
 </div><aside class="card bp" id="bp" aria-label="Quiz summary"></aside></div>`;
 const sl=$("#cnt");sl.oninput=()=>{cfg.count=cfg.want=+sl.value;upd(true)};
 const nb=$("#cnt-n");nb.oninput=()=>{const v=parseInt(nb.value,10);if(!v||v<1)return;cfg.want=v;upd(true)};nb.onblur=()=>{nb.value=cfg.count};
 $("#allt").onclick=()=>{const all=Object.keys(BANK[cfg.sub].topics);cfg.top=cfg.top.size===all.length?new Set([all[0]]):new Set(all);upd()};
 view.onclick=cfgClick;upd();
}
function cfgClick(e){
 const b=e.target.closest("[data-k]");if(!b)return;const k=b.dataset.k,v=b.dataset.v;
 if(k==="newsub")return openEditor(null);
 if(k==="editsub")return openEditor(cfg.sub);
 if(k==="delsub"){if(!confirm(`Delete the subject “${cfg.sub}”?`))return;delete BANK[cfg.sub];saveSubs();closeEditor();cfg.sub="Biology";cfg.top=new Set(["Cells","Genetics"]);cfg.title="Biology practice quiz";toast("Subject deleted");return upd()}
 if(k==="csfile")return $("#cs-f").click();
 if(k==="cscancel")return closeEditor();
 if(k==="cssave")return saveSubject();
 if(k==="sub"&&v!==cfg.sub){cfg.sub=v;cfg.top=new Set([Object.keys(BANK[v].topics)[0]]);cfg.title=v+" practice quiz"}
 if(k==="top"){cfg.top.has(v)?cfg.top.size>1&&cfg.top.delete(v):cfg.top.add(v)}
 if(k==="ty"){cfg.types.has(v)?cfg.types.size>1&&cfg.types.delete(v):cfg.types.add(v)}
 if(k==="df")cfg.diff=v;if(k==="tm")cfg.tm=v;
 if(k==="mins")cfg.mins=Math.max(1,(cfg.mins||autoMins(build()))+ +v);
 if(k==="auto")cfg.mins=0;if(k==="secs")cfg.secs=+v;
 if(k==="go")return generate();
 upd()}
function upd(keepSlider){
 const mx=maxQ();cfg.count=Math.max(1,Math.min(cfg.want,mx));const sl=$("#cnt");sl.max=mx;sl.value=cfg.count;
 const nb=$("#cnt-n");nb.max=mx;if(document.activeElement!==nb||+nb.value>mx)nb.value=cfg.count;
 $("#cnt-s").textContent=BANK[cfg.sub].custom?`Slide or type a number. Up to ${mx} can be made from your notes`:`Slide or type a number. Up to ${mx} in the sample bank, add your own subject for more`;
 if(keepSlider!==true){
  $("#s-sub").innerHTML=Object.entries(BANK).map(([n,s])=>`<button class="tile ${n===cfg.sub?"on":""}" style="--c:${s.c}" data-k="sub" data-v="${esc(n)}"><span class="g">${esc(n[0].toUpperCase())}</span>${esc(n)}</button>`).join("")+`<button class="tile add" style="--c:var(--primary)" data-k="newsub"><span class="g">+</span>Add your subject</button>`;
  $("#cs-acts").innerHTML=BANK[cfg.sub].custom?`<button class="btn btn-sm" data-k="editsub">Edit notes</button><button class="btn btn-sm" data-k="delsub">Delete subject</button><span class="sub" style="margin:0">Your own subject, saved in this browser</span>`:"";
  const ts=Object.keys(BANK[cfg.sub].topics);$("#s-top").innerHTML=ts.map(t=>`<button class="ch ${cfg.top.has(t)?"on":""}" data-k="top" data-v="${t}" aria-pressed="${cfg.top.has(t)}">${t}</button>`).join("");
  $("#allt").textContent=cfg.top.size===ts.length?"Clear":"Select all";
  $("#s-ty").innerHTML=Object.entries(TY).map(([k,t])=>`<button class="tile ${cfg.types.has(k)?"on":""}" style="--c:${t.c}" data-k="ty" data-v="${k}" aria-pressed="${cfg.types.has(k)}"><span class="g">${ic(t.ic)}</span><span>${t.n}<small>${t.d}</small></span></button>`).join("");
  $("#s-df").innerHTML=Object.entries(DF).map(([k,d])=>`<button class="${k===cfg.diff?"on":""}" style="--c:${d[1]}" data-k="df" data-v="${k}">${d[0]}</button>`).join("");$("#df-h").textContent=DF[cfg.diff][2];
  $("#s-tm").innerHTML=[["off","No timer"],["quiz","Whole quiz"],["q","Per question"]].map(([k,n])=>`<button class="${k===cfg.tm?"on":""}" data-k="tm" data-v="${k}">${n}</button>`).join("");
  const qs=build(),m=cfg.mins||autoMins(qs);
  $("#tm-o").innerHTML=cfg.tm==="quiz"?`<div class="row"><div class="step"><button data-k="mins" data-v="-5" aria-label="Less time">−</button><b>${m} min</b><button data-k="mins" data-v="5" aria-label="More time">+</button></div><button class="btn btn-sm" data-k="auto">Auto (${autoMins(qs)} min)</button><span class="sub">Quiz ends when time runs out</span></div>`:
   cfg.tm==="q"?`<div class="row"><div class="chips">${[30,60,90,120].map(s=>`<button class="ch ${cfg.secs===s?"on":""}" data-k="secs" data-v="${s}">${s}s</button>`).join("")}</div><span class="sub">Long answers get 4× this time</span></div>`:"";
 }
 const qs=build(),cn={};qs.forEach(q=>cn[q.t]=(cn[q.t]||0)+1);
 const pts=qs.reduce((a,q)=>a+TY[q.t].p,0),tm=cfg.tm==="quiz"?(cfg.mins||autoMins(qs))+" min":cfg.tm==="q"?cfg.secs+"s each":"Untimed";
 const ty=Object.keys(TY).filter(k=>cn[k]);
 $("#bp").innerHTML=`<input id="ttl" value="${esc(cfg.title)}" maxlength="60" aria-label="Quiz title"><div class="sub" style="margin:-8px 0 0">${cfg.sub} · ${[...cfg.top].join(", ")}</div>
 <div><div class="mix">${ty.map(k=>`<i style="--c:${TY[k].c};flex:${cn[k]}"></i>`).join("")}</div></div>
 <div class="lg2">${ty.map(k=>`<div style="--c:${TY[k].c}"><i></i>${TY[k].n}<b>${cn[k]}</b></div>`).join("")}</div>
 <div class="kv"><div><small>Questions</small><b>${qs.length}</b></div><div><small>Total points</small><b>${pts}</b></div><div><small>Difficulty</small><b style="color:${DF[cfg.diff][1]}">${DF[cfg.diff][0]}</b></div><div><small>Timer</small><b>${tm}</b></div></div>
 <div class="sub" style="margin:0">${ic("clock")} About ${Math.ceil(est(qs)/60)} min to finish</div>
 <button class="btn btn-p btn-lg" data-k="go">${ic("spark")}Generate quiz</button>
 <span class="sub" style="text-align:center;margin:0">${BANK[cfg.sub].custom?"Questions are written from your notes":"Preview uses a sample question bank"}</span>`;
 $("#ttl").oninput=e=>cfg.title=e.target.value;
}


/* ---- Add / edit your own subject ---- */
function closeEditor(){const c=$("#cs");if(c){c.hidden=true;c.innerHTML=""}cfg.editName=null}
async function openEditor(name){
 const c=$("#cs");cfg.editName=name;c.hidden=false;
 c.innerHTML=`<h3>${name?"Edit your subject":"Add your subject"}</h3><span class="sub">Name it and add your notes. Questions are written from your own text.</span>
 <input class="fld" id="cs-n" placeholder="Subject name, e.g. Economics" maxlength="40" aria-label="Subject name">
 <textarea class="ta fld-t" id="cs-t" rows="9" placeholder="Paste your notes here. Full sentences work best (definitions, facts, explanations)." aria-label="Your notes"></textarea>
 <div class="row"><button class="btn btn-sm" data-k="csfile">Upload .txt or .md file</button><select class="fld sel" id="cs-from" aria-label="Use a note saved in My notes" hidden></select><span class="sub" id="cs-c" style="margin:0"></span></div>
 <input type="file" id="cs-f" accept=".txt,.md,text/plain" hidden>
 <div class="row"><button class="btn btn-p btn-sm" data-k="cssave">Save subject</button><button class="btn btn-sm" data-k="cscancel">Cancel</button></div>
 <p class="hint">PDF, Word and slide files can’t be read in the browser. Copy the text out of them and paste it above.</p>`;
 const n=$("#cs-n"),t=$("#cs-t"),cnt=()=>{const k=sentences(t.value).length;$("#cs-c").textContent=t.value.trim()?`${k} usable sentence${k===1?"":"s"} found`:""};
 if(name){n.value=name;t.value=BANK[name].text}
 t.oninput=cnt;cnt();
 $("#cs-f").onchange=async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;if(f.size>2e6)return toast("That file is too large (2 MB max for notes text)");
  t.value=(t.value?t.value+"\n\n":"")+await f.text();if(!n.value)n.value=f.name.replace(/\.[^.]+$/,"").slice(0,40);cnt()};
 savedTextNotes().then(list=>{const sel=$("#cs-from");if(!sel||!list.length)return;sel.hidden=false;
  sel.innerHTML=`<option value="">Use a note from My notes…</option>`+list.map((f,i)=>`<option value="${i}">${esc(f.name)}</option>`).join("");
  sel.onchange=async()=>{const f=list[sel.value];if(!f)return;const x=f.text||await f.file.text();t.value=(t.value?t.value+"\n\n":"")+x;if(!n.value)n.value=f.name.replace(/\.[^.]+$/,"").slice(0,40);sel.value="";cnt()}});
 c.scrollIntoView({behavior:"smooth",block:"nearest"});n.focus()}
function saveSubject(){
 const name=$("#cs-n").value.trim(),text=$("#cs-t").value.trim(),old=cfg.editName;
 if(!name)return toast("Give your subject a name");
 if(Object.keys(BANK).some(k=>k.toLowerCase()===name.toLowerCase()&&k!==old))return toast("A subject with that name already exists");
 const items=genBank(text);
 if(items.length<3)return toast("Add more notes: a few full sentences are needed to write questions");
 const col=old&&BANK[old]?BANK[old].c:PAL[Object.values(BANK).filter(v=>v.custom).length%PAL.length];
 if(old)delete BANK[old];
 BANK[name]={c:col,custom:true,text,topics:{"Your notes":items}};saveSubs();
 cfg.sub=name;cfg.top=new Set(["Your notes"]);cfg.title=name+" practice quiz";closeEditor();upd();
 toast(`“${name}” saved. Up to ${maxQ()} questions available`)}

/* ---- Generate ---- */
async function generate(){
 const steps=["Reading your topics","Choosing question types","Matching difficulty","Writing answer keys"];
 view.onclick=null;view.innerHTML=`<div class="gen"><div class="orb"></div><h2 class="h" style="font:600 1.4rem var(--fd)">Generating “${esc(cfg.title)}”</h2><p class="sub" id="gs"></p></div>`;
 for(const s of steps){$("#gs").textContent=s+"…";await new Promise(r=>setTimeout(r,420))}
 const qs=build();if(!qs.length){toast("No questions could be made. Add more notes or pick other types.");return drawCfg()}start(qs)}

/* ---- Player ---- */
let P=null;
function start(qs){clearInterval(P?.id);
 P={qs,i:0,a:qs.map(()=>null),total:cfg.tm==="quiz"?(cfg.mins||autoMins(qs))*60:0,left:0,ql:0,t0:Date.now(),tm:cfg.tm,secs:cfg.secs};
 P.left=P.total;resetQ();drawQ();P.id=setInterval(tick,1000)}
const qTime=()=>P.secs*(P.qs[P.i].t==="l"?4:1);
function resetQ(){P.ql=P.tm==="q"?qTime():0}
function tick(){
 if(P.tm==="quiz"){P.left--;if(P.left<=0){toast("Time’s up");return finish()}}
 if(P.tm==="q"){P.ql--;if(P.ql<=0){P.i<P.qs.length-1?(toast("Time’s up for this question"),go(P.i+1)):finish();return}}
 const el=$("#tm");if(el){const v=P.tm==="quiz"?P.left:P.ql,tot=P.tm==="quiz"?P.total:qTime();el.lastChild.textContent=mmss(v);el.classList.toggle("low",v<=Math.max(10,tot*.15))}}
function go(n){P.i=n;resetQ();drawQ()}
function drawQ(){
 const q=P.qs[P.i],t=TY[q.t],a=P.a[P.i],n=P.qs.length;let body="";
 if(q.t==="m")body=`<div class="opts">${q.o.map((o,k)=>`<button class="opt ${a===k?"on":""}" data-a="${k}"><kbd>${k+1}</kbd>${esc(o)}</button>`).join("")}</div>`;
 if(q.t==="t")body=`<div class="opts tfs">${[["True",true],["False",false]].map(([l,v])=>`<button class="opt ${a===v?"on":""}" data-a="${v}">${l}</button>`).join("")}</div>`;
 if(q.t==="s"||q.t==="l"){const tg=q.t==="l"?"Aim for 60–120 words":"Aim for 1–3 sentences";body=`<textarea class="ta" id="ta" rows="${q.t==="l"?10:4}" placeholder="Type your answer…">${esc(a||"")}</textarea><div class="cn"><span>${tg}</span><span id="wc">${words(a||"")} words</span></div>`}
 const title=q.t==="f"?esc(q.q).replace("___",`<input class="fi" id="fi" value="${esc(a||"")}" aria-label="Your answer" autocomplete="off">`):esc(q.q);
 const tmr=P.tm==="off"?"":`<span class="tm" id="tm">${ic("clock")}<span>${mmss(P.tm==="quiz"?P.left:P.ql)}</span></span>`;
 view.onclick=null;
 view.innerHTML=`<div class="pl"><div class="ph"><span class="sub">Question ${P.i+1} of ${n}</span><div class="bar"><i style="width:${(P.i+1)/n*100}%"></i></div>${tmr}</div>
 <section class="card qc" style="--c:${t.c}"><span class="tb">${ic(t.ic)}${t.n} · ${t.p} pt${t.p>1?"s":""}</span><h2 class="qt">${title}</h2>${body}</section>
 <div class="pf"><button class="btn" id="prev" ${P.i?"":"disabled"}>Previous</button><div class="dots">${P.qs.map((_,k)=>`<button class="${P.a[k]!=null&&P.a[k]!==""?"ans":""} ${k===P.i?"cur":""}" data-j="${k}" aria-label="Go to question ${k+1}">${k+1}</button>`).join("")}</div>
 <button class="btn btn-p" id="next">${P.i===n-1?"Finish quiz":"Next"}</button></div></div>`;
 $("#prev").onclick=()=>go(P.i-1);$("#next").onclick=()=>P.i===n-1?confirmFinish():go(P.i+1);
 $$("[data-j]").forEach(b=>b.onclick=()=>go(+b.dataset.j));
 $$("[data-a]").forEach(b=>b.onclick=()=>{P.a[P.i]=b.dataset.a==="true"?true:b.dataset.a==="false"?false:+b.dataset.a;drawQ()});
 const ta=$("#ta");if(ta){ta.oninput=()=>{P.a[P.i]=ta.value;$("#wc").textContent=words(ta.value)+" words"};ta.focus()}
 const fi=$("#fi");if(fi){fi.oninput=()=>P.a[P.i]=fi.value;fi.focus()}
}
document.addEventListener("keydown",e=>{if(!P||!$(".pl")||e.target.matches("input,textarea"))return;const q=P.qs[P.i];
 if(q.t==="m"&&/^[1-4]$/.test(e.key)){P.a[P.i]=+e.key-1;drawQ()}if(e.key==="ArrowRight"&&P.i<P.qs.length-1)go(P.i+1);if(e.key==="ArrowLeft"&&P.i)go(P.i-1)});
function confirmFinish(){const un=P.a.filter(x=>x==null||x==="").length;if(un&&!confirm(`${un} question${un>1?"s are":" is"} unanswered. Finish anyway?`))return;finish()}

/* ---- Grading + results ---- */
function grade(q,a){
 const p=TY[q.t].p;if(a==null||a==="")return{s:0,st:"none"};
 if(q.t==="m"||q.t==="t")return a===q.a?{s:p,st:"ok"}:{s:0,st:"no"};
 if(q.t==="f")return q.a.includes(norm(a))?{s:p,st:"ok"}:{s:0,st:"no"};
 const txt=norm(a),hit=q.k.filter(k=>txt.includes(norm(k))).length,r=Math.min(1,hit/Math.ceil(q.k.length*.6)),s=Math.round(r*p*2)/2;
 return{s,st:r>=.8?"ok":r>0?"mid":"no",hit,tot:q.k.length}}
function finish(){
 clearInterval(P.id);const took=Math.round((Date.now()-P.t0)/1000),G=P.qs.map((q,i)=>grade(q,P.a[i]));
 const max=P.qs.reduce((a,q)=>a+TY[q.t].p,0),got=G.reduce((a,g)=>a+g.s,0),pct=Math.round(got/max*100);
 const by={};P.qs.forEach((q,i)=>{const b=by[q.t]??={s:0,m:0};b.s+=G[i].s;b.m+=TY[q.t].p});
 const msg=pct>=85?"Excellent work":pct>=60?"Good progress":"Keep practising";
 const show=(q,a)=>q.t==="m"?(a==null?"No answer":q.o[a]):q.t==="t"?(a==null?"No answer":a?"True":"False"):(a||"No answer");
 const key=q=>q.t==="m"?q.o[q.a]:q.t==="t"?(q.a?"True":"False"):q.t==="f"?q.a[0]:q.m;
 const LB={ok:["Correct","s-ok"],mid:["Partly correct","s-mid"],no:["Incorrect","s-no"],none:["Unanswered","s-no"]};
 view.innerHTML=`<div class="pl" style="max-width:1100px"><div class="rs"><section class="card sec" style="text-align:center"><div class="ring" style="--p:${pct}"><div>${pct}%</div></div><h3 style="font-size:1.3rem">${msg}</h3><p class="sub" style="margin:4px 0 16px">${got} of ${max} points · ${mmss(took)} taken</p>
 <div class="row" style="justify-content:center"><button class="btn" id="re">Retake</button><button class="btn btn-p" id="nw">New quiz</button></div></section>
 <section class="card sec"><h3>By question type</h3><span class="sub">${esc(cfg.title)}</span>${Object.entries(by).map(([k,b])=>`<div class="br" style="--c:${TY[k].c}"><div><span>${TY[k].n}</span><b>${b.s}/${b.m}</b></div><div class="bar"><i style="width:${b.s/b.m*100}%"></i></div></div>`).join("")}<p class="hint">Short and long answers are scored by keyword coverage in this preview. Connect your AI grader for full marking.</p></section></div>
 <section class="card sec"><h3>Review answers</h3><span class="sub">See what you answered and what was expected</span>${P.qs.map((q,i)=>{const g=G[i],l=LB[g.st];return `<div class="rv" style="--c:${TY[q.t].c}"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><small>${i+1}. ${TY[q.t].n}</small><span class="st ${l[1]}">${l[0]} · ${g.s}/${TY[q.t].p}</span></div><p class="q">${esc(q.q).replace("___","_____")}</p><p><small>Your answer</small><br>${esc(show(q,P.a[i]))}</p>${g.st==="ok"&&q.t!=="s"&&q.t!=="l"?"":`<p><small>${q.t==="s"||q.t==="l"?"Model answer":"Correct answer"}</small><br>${esc(key(q))}</p>`}</div>`}).join("")}</section></div>`;
 $("#re").onclick=()=>start(P.qs);$("#nw").onclick=drawCfg}
loadSubs();drawCfg();
