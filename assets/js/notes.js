const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ic=n=>`<svg class="i"><use href="#${n}"/></svg>`;
const MAX=50*1024*1024,DAY=864e5;

/* ---- file types ---- */
const TYPES={pdf:{l:"PDF",c:"#F2546B",name:"PDF"},doc:{l:"DOC",c:"#4C8DFF",name:"Document"},slides:{l:"PPT",c:"#F9B93F",name:"Slides"},text:{l:"TXT",c:"#8D94A8",name:"Text"},image:{l:"IMG",c:"#2DD99A",name:"Image"}};
const EXT={pdf:"pdf",doc:"doc",docx:"doc",ppt:"slides",pptx:"slides",txt:"text",md:"text",png:"image",jpg:"image",jpeg:"image",gif:"image",webp:"image",svg:"image"};
const ext=n=>(n.split(".").pop()||"").toLowerCase();
const fmt=b=>b<1024?b+" B":b<1048576?(b/1024).toFixed(0)+" KB":(b/1048576).toFixed(1)+" MB";
const ago=t=>{const d=Math.floor((Date.now()-t)/DAY);if(d<=0)return"Today";if(d===1)return"Yesterday";if(d<7)return d+" days ago";return new Date(t).toLocaleDateString(undefined,{day:"numeric",month:"short"})};
let uid=0;const now=Date.now();

/* ---- state ---- */
let cats=[{n:"Biology",c:"#2DD99A"},{n:"Chemistry",c:"#7C5CFC"},{n:"Law",c:"#F9B93F"},{n:"Mathematics",c:"#2BE0F7"},{n:"History",c:"#E04BD8"}];
const mk=(name,size,cat,ago_,fav,text)=>({id:++uid,name,ext:ext(name),type:EXT[ext(name)],size,cat,fav:!!fav,date:now-ago_*DAY,file:null,url:null,text:text||null});
let files=[mk("Cell biology, week 4.pdf",2400000,"Biology",0,1),mk("Organic chemistry ch6.docx",860000,"Chemistry",0),mk("Constitutional law outline.pdf",5600000,"Law",1,1),
 mk("Calculus revision slides.pptx",12400000,"Mathematics",2),mk("Krebs cycle diagram.png",410000,"Biology",3),mk("Reading list.txt",3200,"History",5,0,"Reading list, semester 1\n\n1. The Making of the Modern World\n2. A People’s History\n3. Primary sources packet\n\nFinish chapters 1 to 3 before the seminar."),
 mk("Lab safety notes.docx",150000,null,9),mk("Whiteboard photo.jpg",3100000,null,12)];
let hist=[{id:1,name:"Cell biology, week 4.pdf",ext:"pdf",size:2400000,t:now-3e5,s:"done"},{id:2,name:"Organic chemistry ch6.docx",ext:"docx",size:860000,t:now-36e5,s:"done"},{id:3,name:"lecture.mp4",ext:"mp4",size:98e6,t:now-DAY,s:"fail",err:"Unsupported file type"}];
const S={f:{k:"all"},q:"",sort:"date",view:"grid"};

/* ---- smart folders ---- */
const SMART=[["all","All files","folder",()=>1],["recent","Recent","clock",f=>now-f.date<7*DAY],["fav","Favorites","star",f=>f.fav],["pdf","PDFs","file",f=>f.type==="pdf"],
 ["doc","Documents","file",f=>f.type==="doc"||f.type==="text"],["slides","Slides","slides",f=>f.type==="slides"],["image","Images","img",f=>f.type==="image"],["large","Large files","upload",f=>f.size>5*1048576],["none","Unsorted","folder",f=>!f.cat]];
const catColor=n=>(cats.find(c=>c.n===n)||{}).c;
function inFilter(f){const a=S.f;if(a.k==="cat")return f.cat===a.v;return SMART.find(s=>s[0]===a.k)[3](f)}
function visible(){const q=S.q.trim().toLowerCase();let r=files.filter(f=>inFilter(f)&&(!q||f.name.toLowerCase().includes(q)||(f.cat||"").toLowerCase().includes(q)||TYPES[f.type].name.toLowerCase().includes(q)));
 return r.sort((a,b)=>S.sort==="name"?a.name.localeCompare(b.name):S.sort==="size"?b.size-a.size:b.date-a.date)}
const hl=n=>{const q=S.q.trim();if(!q)return esc(n);const i=n.toLowerCase().indexOf(q.toLowerCase());return i<0?esc(n):esc(n.slice(0,i))+"<mark>"+esc(n.slice(i,i+q.length))+"</mark>"+esc(n.slice(i+q.length))}

/* ---- render ---- */
function renderLib(){
 $("#smart").innerHTML=SMART.map(s=>`<button class="f ${S.f.k===s[0]?"on":""}" data-k="${s[0]}">${ic(s[2])}${s[1]}<em>${files.filter(s[3]).length}</em></button>`).join("");
 $("#cats").innerHTML=cats.map(c=>`<button class="f ${S.f.k==="cat"&&S.f.v===c.n?"on":""}" data-c="${esc(c.n)}" style="--c:${c.c}"><span class="sw"></span>${esc(c.n)}<em>${files.filter(f=>f.cat===c.n).length}</em></button>`).join("");
}
function renderFiles(){
 const list=visible(),a=S.f,title=a.k==="cat"?a.v:SMART.find(s=>s[0]===a.k)[1];
 $("#crumb").innerHTML=esc(title)+`<small>${list.length} ${list.length===1?"file":"files"}</small>`;
 const tot=files.reduce((x,f)=>x+f.size,0);$("#summary").textContent=`${files.length} files, ${fmt(tot)} used of 5 GB`;
 $("#files").className="files"+(S.view==="list"?" list":"");
 if(!list.length){$("#files").innerHTML=`<div class="empty">${ic(S.q?"search":"folder")}<h3>${S.q?"No files match “"+esc(S.q)+"”":"Nothing here yet"}</h3><p>${S.q?"Try a different search.":"Drop files anywhere on this page to add them."}</p></div>`;return}
 $("#files").innerHTML=list.map((f,i)=>{const t=TYPES[f.type],cc=catColor(f.cat);
  const th=f.type==="image"&&f.url?`style="--c:${t.c};background-image:url(${f.url})"`:`style="--c:${t.c}"`;
  return `<article class="file" data-id="${f.id}" style="animation-delay:${Math.min(i,12)*25}ms" tabindex="0" aria-label="${esc(f.name)}">
  <div class="thumb" ${th}>${f.type==="image"&&f.url?"":`<span class="ext">${t.l}</span>`}${f.fav?`<span class="star">${ic("star")}</span>`:""}</div>
  <div class="fb"><div><div class="fn">${hl(f.name)}</div><div class="fm"><span>${fmt(f.size)}</span><span>·</span><span>${ago(f.date)}</span></div></div>
  ${f.cat?`<span class="tag" style="--c:${cc}">${esc(f.cat)}</span>`:`<span class="tag">Unsorted</span>`}</div>
  <div class="acts"><button data-a="fav" class="${f.fav?"on":""}" aria-label="Favorite">${ic("star")}</button><button data-a="del" aria-label="Delete">${ic("trash")}</button></div></article>`}).join("");
}
function renderHist(){
 const c=hist.filter(h=>h.s==="up").length;$("#histCount").hidden=!c;
 $("#hist").innerHTML=hist.length?hist.map(h=>{const t=TYPES[EXT[h.ext]]||{l:h.ext.toUpperCase().slice(0,4),c:"#8D94A8"};
  return `<div class="h ${h.s==="done"?"done":h.s==="fail"?"fail":""}" style="--c:${t.c}"><div class="hi">${t.l}</div><div style="min-width:0"><b>${esc(h.name)}</b>
  <small>${h.s==="up"?"Uploading… "+Math.round(h.p||0)+"%":h.s==="done"?"Uploaded · "+fmt(h.size)+" · "+ago(h.t):"Failed: "+esc(h.err)}</small>
  ${h.s==="up"?`<div class="bar"><i style="width:${h.p||0}%"></i></div>`:""}</div></div>`}).join(""):`<p class="sub" style="padding:28px 0;text-align:center">No uploads yet.</p>`;
}
const all=()=>{renderLib();renderFiles();renderHist();save()};

/* ---- toast ---- */
let tt;function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),2600)}


/* ---- persistence (IndexedDB: keeps the real files + folders, favorites, history across refreshes) ---- */
const DB_NAME="n2q-notes-v1",STORE="kv",KEY="state";
let dbp=null,saveT=null,warned=false;
function openDB(){if(dbp)return dbp;
 dbp=new Promise((res,rej)=>{if(!window.indexedDB)return rej(new Error("IndexedDB unavailable"));
  const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
 return dbp}
async function loadState(){
 try{const db=await openDB();
  const st=await new Promise((res,rej)=>{const q=db.transaction(STORE).objectStore(STORE).get(KEY);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
  if(!st)return;
  cats=st.cats||cats;uid=Math.max(uid,st.uid||0);
  files=(st.files||[]).map(f=>({...f,url:f.file?URL.createObjectURL(f.file):null}));
  hist=(st.hist||[]).filter(h=>h.s!=="up");
 }catch(e){console.warn("Could not load saved notes",e)}
}
function saveNow(){
 const snap={cats,uid,hist:hist.filter(h=>h.s!=="up"),files:files.map(({url,...f})=>f)};
 return openDB().then(db=>new Promise((res,rej)=>{const t=db.transaction(STORE,"readwrite");t.objectStore(STORE).put(snap,KEY);t.oncomplete=res;t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)}))
  .catch(e=>{console.warn("Save failed",e);if(!warned){warned=true;toast(e&&e.name==="QuotaExceededError"?"Not enough browser storage to save these files":"Couldn't save your notes in this browser")}})}
function save(){clearTimeout(saveT);saveT=setTimeout(saveNow,150)}
addEventListener("pagehide",()=>{clearTimeout(saveT);saveNow()});
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}

/* ---- upload ---- */
const GUESS=[["Biology",/bio|cell|krebs|gene|anat/i],["Chemistry",/chem|organic|molec/i],["Law",/law|legal|contract|tort/i],["Mathematics",/math|calc|algebra|stat/i],["History",/hist|reading|war|empire/i]];
function guess(n){const g=GUESS.find(x=>x[1].test(n));return g&&cats.some(c=>c.n===g[0])?g[0]:null}
function upload(list){
 [...list].forEach(file=>{
  const e=ext(file.name),h={id:++uid,name:file.name,ext:e,size:file.size,t:Date.now(),s:"up",p:0};hist.unshift(h);
  if(!EXT[e]){h.s="fail";h.err="Unsupported file type (."+e+")";return}
  if(file.size>MAX){h.s="fail";h.err="Larger than 50 MB";return}
  const step=6+Math.random()*10,iv=setInterval(()=>{h.p+=step*(.5+Math.random());renderHist();
   if(h.p>=100){clearInterval(iv);h.s="done";h.t=Date.now();
    const cat=S.f.k==="cat"?S.f.v:guess(file.name);
    const f={id:++uid,name:file.name,ext:e,type:EXT[e],size:file.size,cat,fav:false,date:Date.now(),file,url:URL.createObjectURL(file),text:null};
    files.unshift(f);all();toast(cat?`${file.name} added to ${cat}`:`${file.name} uploaded`)}},160);
 });
 const bad=hist.slice(0,list.length).filter(h=>h.s==="fail").length;
 if(bad)toast(`${bad} ${bad>1?"files were":"file was"} rejected. See upload history.`);
 if(list.length>bad){$("#drawer").hidden=false}
 renderHist();
}
const input=$("#fileInput");
$("#pick").onclick=()=>input.click();
$("#drop").onclick=()=>input.click();
$("#drop").onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();input.click()}};
input.onchange=()=>{upload(input.files);input.value=""};
let dc=0;const over=$("#over");
addEventListener("dragenter",e=>{if(e.dataTransfer&&[...e.dataTransfer.types].includes("Files")){dc++;over.classList.add("show");$("#drop").classList.add("on")}});
addEventListener("dragleave",()=>{if(--dc<=0){dc=0;over.classList.remove("show");$("#drop").classList.remove("on")}});
addEventListener("dragover",e=>e.preventDefault());
addEventListener("drop",e=>{e.preventDefault();dc=0;over.classList.remove("show");$("#drop").classList.remove("on");if(e.dataTransfer.files.length)upload(e.dataTransfer.files)});

/* ---- folders, search, sort, view ---- */
$("#smart").onclick=e=>{const b=e.target.closest("[data-k]");if(b){S.f={k:b.dataset.k};all()}};
$("#cats").onclick=e=>{const b=e.target.closest("[data-c]");if(b){S.f={k:"cat",v:b.dataset.c};all()}};
$("#addCat").onclick=()=>{const i=$("#catin");i.hidden=!i.hidden;if(!i.hidden)i.focus()};
$("#catin").onkeydown=e=>{if(e.key==="Escape"){e.target.hidden=true}
 if(e.key==="Enter"){const n=e.target.value.trim();if(!n)return;if(cats.some(c=>c.n.toLowerCase()===n.toLowerCase())){toast("That category already exists");return}
  cats.push({n,c:["#2DD99A","#7C5CFC","#F9B93F","#2BE0F7","#E04BD8","#F2546B","#4C8DFF"][cats.length%7]});e.target.value="";e.target.hidden=true;all();toast(`Category “${n}” created`)}};
$("#q").oninput=e=>{S.q=e.target.value;renderFiles()};
addEventListener("keydown",e=>{if(e.key==="/"&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$("#q").focus()}
 if(e.key==="Escape"){closeModal();$("#drawer").hidden=true}});
$("#sort").onchange=e=>{S.sort=e.target.value;renderFiles()};
$("#vg").onclick=()=>{S.view="grid";$("#vg").classList.add("on");$("#vl").classList.remove("on");renderFiles()};
$("#vl").onclick=()=>{S.view="list";$("#vl").classList.add("on");$("#vg").classList.remove("on");renderFiles()};

/* ---- card actions + preview ---- */
let cur=null;
const byId=id=>files.find(f=>f.id===+id);
function del(f){if(f.url)URL.revokeObjectURL(f.url);files=files.filter(x=>x!==f);all();toast(`Deleted ${f.name}`)}
$("#files").onclick=e=>{const card=e.target.closest(".file");if(!card)return;const f=byId(card.dataset.id),a=e.target.closest("[data-a]");
 if(a){e.stopPropagation();if(a.dataset.a==="fav"){f.fav=!f.fav;all()}else del(f);return}openModal(f)};
$("#files").onkeydown=e=>{if(e.key==="Enter"&&e.target.classList.contains("file"))openModal(byId(e.target.dataset.id))};
function openModal(f){
 cur=f;const t=TYPES[f.type];$("#pn").value=f.name;$("#pmeta").textContent=`${t.name} · ${fmt(f.size)} · ${ago(f.date)}`;
 $("#pcat").innerHTML=`<option value="">Unsorted</option>`+cats.map(c=>`<option ${c.n===f.cat?"selected":""}>${esc(c.n)}</option>`).join("");
 $("#pfav").querySelector("span").textContent=f.fav?"Favorited":"Favorite";$("#pfav").style.color=f.fav?"var(--warn)":"";
 const dl=$("#pdl");if(f.url){dl.href=f.url;dl.download=f.name;dl.hidden=false}else dl.hidden=true;
 const b=$("#pbody");b.innerHTML="";
 if(f.type==="image"&&f.url)b.innerHTML=`<img alt="${esc(f.name)}" src="${f.url}">`;
 else if(f.type==="pdf"&&f.url)b.innerHTML=`<iframe title="${esc(f.name)}" src="${f.url}"></iframe>`;
 else if(f.type==="text"&&(f.file||f.text)){b.innerHTML="<pre></pre>";if(f.text)$("pre",b).textContent=f.text;else f.file.text().then(x=>$("pre",b).textContent=x.slice(0,20000))}
 else b.innerHTML=`<div class="nopv"><span class="ext" style="--c:${t.c}">${t.l}</span><h3 style="font-family:var(--fd)">${f.url?"Preview isn’t available in the browser":"Sample file"}</h3><p>${f.url?`${t.name} files can’t be previewed here. Download it to open in your app, or generate a quiz straight from it.`:"This is a demo entry, so there’s nothing to preview. Upload your own file to see a live preview."}</p></div>`;
 $("#modal").hidden=false;
}
function closeModal(){$("#modal").hidden=true;$("#pbody").innerHTML="";cur=null}
$("#closeM").onclick=closeModal;$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
$("#pn").onchange=e=>{const v=e.target.value.trim();if(v&&cur){cur.name=v;all()}};
$("#pcat").onchange=e=>{cur.cat=e.target.value||null;all();toast(cur.cat?`Moved to ${cur.cat}`:"Moved to Unsorted")};
$("#pfav").onclick=()=>{cur.fav=!cur.fav;$("#pfav").querySelector("span").textContent=cur.fav?"Favorited":"Favorite";$("#pfav").style.color=cur.fav?"var(--warn)":"";all()};
$("#pdel").onclick=()=>{const f=cur;closeModal();del(f)};
$("#pquiz").onclick=()=>toast(`Generating a quiz from ${cur.name}…`);
/* Hand the file to the Flashcards module (it reads this key on load) */
$("#pcards").onclick=async()=>{
 const f=cur;let text=f.text||"";
 if(!text&&f.type==="text"&&f.file){try{text=(await f.file.text()).slice(0,20000)}catch(e){}}
 try{localStorage.setItem("n2q-flashcards-inbox",JSON.stringify({title:f.name.replace(/\.[^.]+$/,""),cat:f.cat,text}))}catch(e){}
 location.href="flashcards.html?import=1"};

/* ---- history drawer, theme ---- */
$("#histBtn").onclick=()=>{const d=$("#drawer");d.hidden=!d.hidden};
$("#closeH").onclick=()=>$("#drawer").hidden=true;
$("#clearH").onclick=()=>{hist=hist.filter(h=>h.s==="up");renderHist();save()};
$("#theme").onclick=()=>{const r=document.documentElement,c=r.dataset.theme||(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark");r.dataset.theme=c==="dark"?"light":"dark"};
loadState().then(all);
