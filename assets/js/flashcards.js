const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ic=n=>`<svg class="i"><use href="#${n}"/></svg>`;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const REDUCED=matchMedia("(prefers-reduced-motion:reduce)").matches;
const KEY="n2q-flashcards-v1",INBOX="n2q-flashcards-inbox",DAY=864e5,MIN=6e4,HR=36e5;
const PAL=["#2DD99A","#7C5CFC","#2BE0F7","#F9B93F","#E04BD8","#F2546B","#4C8DFF"];

/* toast + theme (same pattern as the other pages) */
let tt;const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),2600)};
$("#theme").onclick=()=>{const r=document.documentElement,c=r.dataset.theme||(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark");r.dataset.theme=c==="dark"?"light":"dark"};

/* ============ Sample knowledge ============
   One entry = [question, answer, term, definition sentence, hint].
   Powers the seed deck and the offline AI generator. Replace generateFlashcards() with your API call. */
const BANK={
 Biology:[
  ["Which organelle produces most of a cell’s ATP?","The mitochondrion, through oxidative phosphorylation on its inner membrane.","Mitochondrion","The mitochondrion produces most of a cell’s ATP.","The powerhouse"],
  ["What is the overall equation for photosynthesis?","6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂","Photosynthesis","Photosynthesis converts light energy into chemical energy stored in glucose.","CO₂ in, glucose out"],
  ["Where does the Calvin cycle take place?","In the stroma of the chloroplast, using ATP and NADPH from the light reactions to fix CO₂.","Calvin cycle","The Calvin cycle fixes CO₂ into glucose in the stroma.","Light-independent"],
  ["What is the difference between genotype and phenotype?","Genotype is the set of alleles an organism carries; phenotype is the trait you can observe.","Genotype","A genotype is the combination of alleles an organism carries.",""],
  ["What does an enzyme do to activation energy?","It lowers it, so the reaction speeds up, and the enzyme is not used up.","Enzyme","An enzyme is a biological catalyst that lowers activation energy.",""],
  ["Where does glycolysis occur, and what does it produce?","In the cytoplasm: one glucose becomes two pyruvate, with a net gain of 2 ATP.","Glycolysis","Glycolysis splits glucose into two pyruvate in the cytoplasm.",""],
  ["A cross between Aa and Aa gives which genotype ratio?","1 AA : 2 Aa : 1 aa, which is a 3:1 phenotype ratio for a dominant trait.","Punnett square","A Punnett square predicts the genotype ratios of a genetic cross.","Draw the square"],
  ["What are stomata?","Tiny leaf pores that regulate gas exchange. Guard cells open and close them.","Stomata","Stomata are tiny leaf pores that regulate gas exchange.",""]],
 Chemistry:[
  ["Why do noble gases rarely react?","Their outer electron shells are full, so they are stable and do not gain, lose or share electrons.","Noble gas","A noble gas has a full outer electron shell, so it rarely reacts.",""],
  ["What is a mole?","6.022 × 10²³ particles of a substance (Avogadro’s number).","Mole","A mole is 6.022 × 10²³ particles of a substance.","Avogadro"],
  ["State Le Chatelier’s principle.","When an equilibrium is disturbed, the system shifts to oppose the change.","Le Chatelier’s principle","Le Chatelier’s principle says an equilibrium shifts to oppose any disturbance.",""],
  ["Exothermic vs endothermic: what is the difference?","Exothermic reactions release heat (ΔH < 0); endothermic reactions absorb it (ΔH > 0).","Exothermic reaction","An exothermic reaction releases heat to its surroundings.",""],
  ["What does the atomic number tell you?","The number of protons in the nucleus, which defines the element.","Atomic number","The atomic number is the number of protons in an atom’s nucleus.",""],
  ["What does a catalyst do?","It speeds up a reaction by giving a lower-energy pathway, and it is not consumed.","Catalyst","A catalyst speeds up a reaction without being used up.",""],
  ["Balance: C₃H₈ + O₂ → CO₂ + H₂O","C₃H₈ + 5O₂ → 3CO₂ + 4H₂O","Combustion","Combustion is a reaction of a fuel with oxygen that releases energy.","Balance C, then H, then O"],
  ["Which bond forms when atoms share electrons?","A covalent bond.","Covalent bond","A covalent bond forms when two atoms share a pair of electrons.",""]],
 "Computer Science":[
  ["What is the time complexity of binary search?","O(log n), and it only works on sorted data.","Binary search","Binary search halves a sorted list each step, giving O(log n).","Halving"],
  ["Stack vs queue: what is the difference?","A stack is last-in first-out (LIFO); a queue is first-in first-out (FIFO).","Stack","A stack is a last-in first-out data structure.",""],
  ["What is recursion?","A function that calls itself on a smaller input until it reaches a base case.","Recursion","Recursion is when a function calls itself on a smaller input.","Don’t forget the base case"],
  ["What does HTTP status 404 mean?","Not Found: the server can’t find the requested page.","HTTP 404","HTTP 404 means the server cannot find the requested page.",""],
  ["What does DNS do?","It translates domain names into IP addresses.","DNS","DNS translates domain names into IP addresses.",""],
  ["Bubble sort vs merge sort?","Bubble sort is O(n²) and swaps neighbours; merge sort is O(n log n) and divides, sorts and merges.","Merge sort","Merge sort divides a list, sorts the halves and merges them in O(n log n).",""],
  ["What is the DOM?","A tree of objects representing an HTML page that JavaScript can read and change.","DOM","The DOM is a tree representation of a web page that JavaScript can change.",""],
  ["What is Big O notation?","A way to describe how an algorithm’s running time grows as the input grows.","Big O notation","Big O notation describes how an algorithm’s cost grows with input size.",""]],
 Mathematics:[
  ["What is the quadratic formula?","x = (−b ± √(b² − 4ac)) / 2a","Quadratic formula","The quadratic formula gives the roots of ax² + bx + c = 0.","Needs a, b and c"],
  ["What is the derivative of sin x?","cos x","Derivative","A derivative measures the instantaneous rate of change of a function.",""],
  ["State the integration by parts formula.","∫u dv = uv − ∫v du","Integration by parts","Integration by parts rewrites ∫u dv as uv − ∫v du.","LIATE"],
  ["What does Pythagoras’ theorem say?","In a right triangle, a² + b² = c², where c is the hypotenuse.","Pythagoras’ theorem","Pythagoras’ theorem relates the sides of a right triangle: a² + b² = c².",""],
  ["What is the discriminant?","b² − 4ac. Positive: two real roots; zero: one; negative: none real.","Discriminant","The discriminant b² − 4ac decides how many real roots a quadratic has.",""],
  ["What is the derivative of eˣ?","eˣ. It is its own derivative.","Exponential function","The exponential function eˣ is its own derivative.",""],
  ["What is the chain rule?","d/dx f(g(x)) = f′(g(x)) · g′(x)","Chain rule","The chain rule differentiates a function of a function.",""],
  ["What is a prime number?","A whole number greater than 1 with exactly two factors: 1 and itself.","Prime number","A prime number has exactly two factors: 1 and itself.",""]]
};
const SUBJECT_COLOR={Biology:PAL[0],Chemistry:PAL[1],"Computer Science":PAL[2],Mathematics:PAL[3]};

/* ============ Store ============ */
let db=load()||seed();
function load(){try{const r=JSON.parse(localStorage.getItem(KEY));if(r&&Array.isArray(r.cards)&&Array.isArray(r.cats))return r}catch(e){}return null}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}
function seed(){
 const now=Date.now(),cats=Object.keys(BANK).map(n=>({id:n.toLowerCase().replace(/\W+/g,"-"),name:n,color:SUBJECT_COLOR[n]})),cards=[];
 const future={"Biology":[5],"Chemistry":[3],"Computer Science":[4],"Mathematics":[3]},bookmarked={"Biology":[0],"Chemistry":[2],"Computer Science":[0],"Mathematics":[0]};
 const fresh={"Biology":[6],"Chemistry":[4],"Computer Science":[6],"Mathematics":[6]},manual={"Biology":[3,7],"Chemistry":[5],"Computer Science":[2],"Mathematics":[1,5]};
 cats.forEach(c=>BANK[c.name].slice(0,7).forEach((e,i)=>{
  const isF=future[c.name].includes(i),isN=fresh[c.name].includes(i);
  const card={id:uid(),front:e[0],back:e[1],hint:e[4],cat:c.id,src:manual[c.name].includes(i)?"manual":"ai",bm:bookmarked[c.name].includes(i),created:now-(20-i)*DAY,last:null,lapses:0,
   reps:isN?0:isF?4:1+(i%3),ease:2.3+(i%3)*.1,int:isN?0:isF?(i%2?30:9):1+(i%4)*2,due:now-(1+Math.random()*30)*HR};
  if(isF)card.due=now+(card.int>20?12:4)*DAY;
  if(!isN)card.last=now-DAY*(1+i%3);
  cards.push(card)}));
 return {v:1,cats,cards,log:[],streak:{last:null,n:0}}}

const status=c=>c.reps===0?"new":c.int>=21?"mastered":c.int>=3?"review":"learning";
const ST={new:"New",learning:"Learning",review:"Review",mastered:"Mastered"};
const isDue=c=>c.due<=Date.now();
const catOf=id=>db.cats.find(c=>c.id===id)||{id:null,name:"Unsorted",color:"#8D94A8"};
const todayKey=()=>new Date().toDateString();
const reviewedToday=()=>db.log.filter(l=>new Date(l.t).toDateString()===todayKey()).length;

/* ============ Spaced repetition (SM-2 style) ============ */
function nextState(c,r){ // r: 0 again, 1 hard, 2 good, 3 easy
 let i=c.int,e=c.ease,now=Date.now(),due,lapses=c.lapses,reps=Math.max(1,c.reps);
 if(r===0){e=Math.max(1.3,e-.2);i=0;due=now+10*MIN;lapses++}
 else{
  if(r===1){e=Math.max(1.3,e-.15);i=i<1?.5:Math.max(1,Math.round(i*1.2))}
  if(r===2){i=i<1?1:i<3?3:Math.round(i*e)}
  if(r===3){e+=.15;i=i<1?4:Math.round(i*e*1.3+1)}
  due=now+i*DAY;reps=c.reps+1}
 return {int:i,ease:e,due,lapses,reps}}
const fmtIn=ms=>ms<HR?Math.max(1,Math.round(ms/MIN))+"m":ms<DAY?Math.round(ms/HR)+"h":Math.round(ms/DAY)+"d";

/* ============ Library state ============ */
const S={k:"all",v:null,src:"all",q:"",sort:"due"};
let fresh=new Set();
const SMART=[["all","All cards","cards",()=>true],["due","Due today","clock",isDue],["bm","Bookmarked","bookmark",c=>c.bm],["new","New","spark",c=>c.reps===0],["learning","Learning","bulb",c=>status(c)==="learning"],["mastered","Mastered","check",c=>status(c)==="mastered"]];
function inFilter(c){if(S.k==="cat")return c.cat===S.v;return SMART.find(s=>s[0]===S.k)[3](c)}
function visible(){
 const q=S.q.trim().toLowerCase();
 let r=db.cards.filter(c=>inFilter(c)&&(S.src==="all"||c.src===S.src)&&(!q||[c.front,c.back,c.hint,catOf(c.cat).name].some(t=>(t||"").toLowerCase().includes(q))));
 return r.sort((a,b)=>S.sort==="new"?b.created-a.created:S.sort==="az"?a.front.localeCompare(b.front):a.due-b.due)}
const hl=t=>{const q=S.q.trim();if(!q)return esc(t);const i=String(t).toLowerCase().indexOf(q.toLowerCase());return i<0?esc(t):esc(t.slice(0,i))+"<mark>"+esc(t.slice(i,i+q.length))+"</mark>"+esc(t.slice(i+q.length))};
const title=()=>S.k==="cat"?catOf(S.v).name:SMART.find(s=>s[0]===S.k)[1];

/* ============ 3D card markup + tilt ============ */
function cardHTML(c,{i=0,review=false}={}){
 const cat=catOf(c.cat),s=status(c);
 const bm=`<button class="bm ${c.bm?"on":""}" data-a="bm" aria-label="${c.bm?"Remove bookmark":"Bookmark"}" aria-pressed="${c.bm}">${ic("bookmark")}</button>`;
 const tag=`<span class="tag">${esc(cat.name)}</span>${c.src==="ai"?`<span class="aib" title="Generated by AI">${ic("spark")}AI</span>`:""}`;
 const front=review?esc(c.front):hl(c.front),back=review?esc(c.back):hl(c.back);
 return `<article class="fc" data-id="${c.id}" style="--c:${cat.color};--i:${Math.min(i,14)}">
 <div class="flip" tabindex="0" role="button" aria-label="Flashcard. Press Enter to flip"><div class="tilt"><div class="fi">
  <div class="face front"><div class="ft">${tag}<span class="sp"></span>${review?"":bm}</div>
   <p class="fq"><span>${front}</span></p>
   <div class="ff"><span class="st st-${s}">${ST[s]}</span><span class="sp"></span>${review?"":`<span>Click to flip</span>`}</div></div>
  <div class="face back"><div class="ft"><span class="tag">Answer</span><span class="sp"></span>${review?"":bm}</div>
   <p class="fa"><span>${back}</span></p>
   <div class="ff">${review?"":`<div class="act"><button data-a="edit" aria-label="Edit card">${ic("edit")}</button><button data-a="del" aria-label="Delete card">${ic("trash")}</button></div>`}<span class="sp"></span><span>${isDue(c)?"Due now":"Next in "+fmtIn(c.due-Date.now())}</span></div></div>
 </div></div></div></article>`}

/* pointer tilt + glare on any .flip inside root */
function wireTilt(root){
 if(REDUCED||matchMedia("(hover:none)").matches)return;
 root.addEventListener("pointermove",e=>{
  const f=e.target.closest(".flip");if(!f)return;const t=$(".tilt",f),r=f.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  const max=f.closest(".rvc")?5:9;t.classList.add("live");
  t.style.setProperty("--rx",((.5-y)*max).toFixed(2)+"deg");t.style.setProperty("--ry",((x-.5)*max*1.4).toFixed(2)+"deg");
  f.style.setProperty("--mx",(x*100)+"%");f.style.setProperty("--my",(y*100)+"%");
  $$(".face",f).forEach(el=>{el.style.setProperty("--mx",(x*100)+"%");el.style.setProperty("--my",(y*100)+"%")})});
 root.addEventListener("pointerout",e=>{const f=e.target.closest(".flip");if(!f||f.contains(e.relatedTarget))return;const t=$(".tilt",f);t.classList.remove("live");t.style.setProperty("--rx","0deg");t.style.setProperty("--ry","0deg")})}

/* ============ Library view ============ */
const view=$("#view");
function swap(html){view.innerHTML=html;if(view.firstElementChild)view.firstElementChild.classList.add("vt");scrollTo({top:0})}
function drawLibrary(){
 const due=db.cards.filter(isDue).length;
 view.onclick=libClick;view.onkeydown=libKey;
 swap(`<div class="lw">
 <section class="hero">
  <div><span class="pill">${ic("clock")}${due?`${due} due today`:"All caught up"}</span>
   <h1 id="heroT">${due?"Review what you’re about to forget":"Nothing due. Keep it fresh anyway"}</h1>
   <p>${due?`About ${Math.max(1,Math.round(due*.5))} minutes. Cards come back right before you’d forget them.`:"Practise any deck, or generate new cards from your notes."}</p>
   <div class="row"><button class="btn btn-p btn-lg" data-go="review-all">${ic("zap")}${due?"Start review":"Practise all cards"}</button><button class="btn btn-lg" data-go="ai">${ic("spark")}Generate from notes</button></div></div>
  <div class="fan" aria-hidden="true"><i></i><i></i><i></i></div>
 </section>
 <section class="tiles" id="tiles"></section>
 <div class="split">
  <nav class="lib" aria-label="Decks and filters"><h4>Smart filters</h4><div id="smart"></div>
   <h4>Categories <button class="mini" id="addCat" aria-label="New category">${ic("plus")}</button></h4>
   <input class="catin" id="catin" placeholder="Category name, then Enter" hidden maxlength="24"><div id="cats"></div></nav>
  <section><div class="bar2"><div class="crumb" id="crumb"></div><span class="sp"></span>
   <div class="seg" id="srcSeg" aria-label="Card source">${[["all","All"],["ai","AI"],["manual","Manual"]].map(([k,n])=>`<button data-src="${k}" class="${S.src===k?"on":""}">${n}</button>`).join("")}</div>
   <select id="sort" aria-label="Sort cards"><option value="due">Due first</option><option value="new">Newest</option><option value="az">A to Z</option></select>
   <button class="btn btn-sm" data-go="review" id="studyThis">${ic("zap")}Study these</button></div>
   <div class="fgrid" id="grid"></div></section>
 </div></div>`);
 $("#sort").value=S.sort;renderAll();wireTilt($("#grid"))}
function renderAll(){renderTiles();renderLib();renderGrid()}
function renderTiles(){
 const due=db.cards.filter(isDue).length,m=db.cards.filter(c=>status(c)==="mastered").length,b=db.cards.filter(c=>c.bm).length;
 $("#tiles").innerHTML=[["due","Due today",due,"clock","var(--warn)"],["all","Reviewed today",reviewedToday(),"redo","var(--primary)"],["mastered","Mastered",m,"check","var(--ok)"],["bm","Bookmarked",b,"bookmark","var(--accent)"]]
  .map(t=>`<button class="tile" data-k="${t[0]}" style="--c:${t[4]}"><span class="g">${ic(t[3])}</span><span><b>${t[2]}</b><small>${t[1]}</small></span></button>`).join("")}
function renderLib(){
 $("#smart").innerHTML=SMART.map(s=>`<button class="f ${S.k===s[0]?"on":""}" data-k="${s[0]}">${ic(s[2])}${s[1]}<em>${db.cards.filter(s[3]).length}</em></button>`).join("");
 $("#cats").innerHTML=db.cats.map(c=>`<button class="f ${S.k==="cat"&&S.v===c.id?"on":""}" data-cat="${c.id}" style="--c:${c.color}"><span class="sw"></span>${esc(c.name)}<em>${db.cards.filter(x=>x.cat===c.id).length}</em><span class="mini del" data-delcat="${c.id}" role="button" aria-label="Delete ${esc(c.name)}">${ic("x")}</span></button>`).join("")
  +(db.cards.some(c=>!c.cat)?`<button class="f ${S.k==="cat"&&S.v===null?"on":""}" data-cat="" style="--c:#8D94A8"><span class="sw"></span>Unsorted<em>${db.cards.filter(c=>!c.cat).length}</em></button>`:"")}
function renderGrid(){
 const list=visible();
 $("#crumb").innerHTML=esc(title())+`<small>${list.length} ${list.length===1?"card":"cards"}</small>`;
 $("#studyThis").disabled=!list.length;
 if(!list.length){
  $("#grid").innerHTML=`<div class="empty">${ic(S.q?"search":"cards")}<h3>${S.q?`No cards match “${esc(S.q)}”`:S.k==="bm"?"No bookmarks yet":db.cards.length?"Nothing in this view":"Your deck is empty"}</h3>
  <p>${S.q?"Try another word, or clear the search.":S.k==="bm"?"Tap the bookmark on any card to keep it handy.":"Write a card yourself or let AI draft some from your notes."}</p>
  <div class="row"><button class="btn" data-go="ai">${ic("spark")}AI generate</button><button class="btn btn-p" data-go="new">${ic("plus")}New card</button></div></div>`;return}
 $("#grid").innerHTML=list.map((c,i)=>cardHTML(c,{i})).join("");
 $$("#grid .fc").forEach(el=>{if(fresh.has(el.dataset.id))el.classList.add("fresh")});fresh=new Set()}

function libClick(e){
 const t=e.target;let b;
 if(b=t.closest("[data-go]")){const g=b.dataset.go;if(g==="review-all")startReview(null);if(g==="review")startReview("filter");if(g==="ai"){G.from=null;G.results=[];openAI()}if(g==="new")openEditor();return}
 if(b=t.closest("[data-delcat]")){e.stopPropagation();removeCat(b.dataset.delcat);return}
 if(b=t.closest("[data-k]")){S.k=b.dataset.k;S.v=null;renderAll();return}
 if(b=t.closest("[data-cat]")){S.k="cat";S.v=b.dataset.cat||null;renderAll();return}
 if(b=t.closest("[data-src]")){S.src=b.dataset.src;$$("#srcSeg button").forEach(x=>x.classList.toggle("on",x===b));renderGrid();return}
 if(t.closest("#addCat")){const i=$("#catin");i.hidden=!i.hidden;if(!i.hidden)i.focus();return}
 const card=t.closest(".fc");if(!card)return;const c=db.cards.find(x=>x.id===card.dataset.id);if(!c)return;
 if(b=t.closest("[data-a]")){e.stopPropagation();const a=b.dataset.a;
  if(a==="bm")toggleBm(c);if(a==="edit")openEditor(c);if(a==="del")delCard(c);return}
 $(".flip",card).classList.toggle("is-flipped")}
function libKey(e){
 if(e.target.id==="catin"){if(e.key==="Escape")e.target.hidden=true;if(e.key==="Enter"){const n=e.target.value.trim();if(!n)return;addCat(n);e.target.value="";e.target.hidden=true}return}
 const f=e.target.closest&&e.target.closest(".flip");if(f&&(e.key==="Enter"||e.key===" ")&&!e.target.closest("button")){e.preventDefault();f.classList.toggle("is-flipped")}}
view.addEventListener("change",e=>{if(e.target.id==="sort"){S.sort=e.target.value;renderGrid()}});

function addCat(name){
 if(db.cats.some(c=>c.name.toLowerCase()===name.toLowerCase())){toast("That category already exists");return db.cats.find(c=>c.name.toLowerCase()===name.toLowerCase())}
 const c={id:uid(),name,color:PAL[db.cats.length%PAL.length]};db.cats.push(c);save();if($("#cats"))renderLib();toast(`Category “${name}” created`);return c}
function ensureCat(name){return db.cats.find(c=>c.name.toLowerCase()===name.toLowerCase())||(()=>{const c={id:uid(),name,color:SUBJECT_COLOR[name]||PAL[db.cats.length%PAL.length]};db.cats.push(c);save();return c})()}
function removeCat(id){const c=catOf(id),n=db.cards.filter(x=>x.cat===id).length;
 if(!confirm(`Delete “${c.name}”?${n?` Its ${n} card${n>1?"s":""} will move to Unsorted.`:""}`))return;
 db.cards.forEach(x=>{if(x.cat===id)x.cat=null});db.cats=db.cats.filter(x=>x.id!==id);if(S.k==="cat"&&S.v===id){S.k="all";S.v=null}save();renderAll();toast(`Deleted “${c.name}”`)}
function toggleBm(c){
 c.bm=!c.bm;save();renderTiles();renderLib();
 if(S.k==="bm")return renderGrid();
 $$(`.fc[data-id="${c.id}"] .bm`).forEach(b=>{b.classList.toggle("on",c.bm);b.setAttribute("aria-pressed",c.bm)});
 toast(c.bm?"Bookmarked":"Bookmark removed")}
function delCard(c){
 if(!confirm("Delete this card?"))return;
 const el=$(`.fc[data-id="${c.id}"]`);db.cards=db.cards.filter(x=>x!==c);save();
 if(el&&!REDUCED){el.style.transition="transform .3s,opacity .3s";el.style.transform="scale(.85)";el.style.opacity="0";setTimeout(renderAll,280)}else renderAll();toast("Card deleted")}

/* search + shortcuts */
$("#q").oninput=e=>{S.q=e.target.value;if($("#grid"))renderGrid();else if(e.target.value)exitReview()};
addEventListener("keydown",e=>{
 const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName),modal=$(".fm.open");
 if(e.key==="Escape"){if(modal)closeModals();else if(R)exitReview();else if(document.activeElement===$("#q")){$("#q").blur()}return}
 if(modal&&(e.metaKey||e.ctrlKey)&&e.key==="Enter"){if(modal.id==="edM")saveCard(false)}
 if(typing||modal||e.metaKey||e.ctrlKey||e.altKey)return;
 if(e.key==="/"){e.preventDefault();$("#q").focus();return}
 if(R&&$(".rv"))return reviewKey(e);
 if(e.key==="n"||e.key==="N"){e.preventDefault();openEditor()}});

/* ============ Modals ============ */
function openM(id){const m=$("#"+id);m.classList.add("open");m.dataset.last=document.activeElement?.id||""}
function closeModals(){$$(".fm.open").forEach(m=>m.classList.remove("open"))}
$$(".fm").forEach(m=>{m.addEventListener("mousedown",e=>{if(e.target===m)closeModals()});$$("[data-close]",m).forEach(b=>b.onclick=closeModals)});

/* ---------- Manual editor ---------- */
let editing=null;
function openEditor(c){
 editing=c||null;$("#edT").textContent=c?"Edit card":"New card";
 $("#edFront").value=c?c.front:"";$("#edBack").value=c?c.back:"";$("#edHint").value=c?c.hint||"":"";
 fillCatSelect($("#edCat"),c?c.cat:(S.k==="cat"?S.v:null));$("#edNewCat").hidden=true;$("#edNewCat").value="";
 $("#edMore").hidden=!!c;$("#edSave").textContent=c?"Save changes":"Save card";$("#edMsg").textContent="";
 drawPrev();openM("edM");setTimeout(()=>$("#edFront").focus(),120)}
function fillCatSelect(sel,val,extra=""){
 sel.innerHTML=extra+`<option value="">Unsorted</option>`+db.cats.map(c=>`<option value="${c.id}" ${c.id===val?"selected":""}>${esc(c.name)}</option>`).join("")+`<option value="__new">+ New category…</option>`}
function drawPrev(){
 const cid=$("#edCat").value,cat=db.cats.find(c=>c.id===cid)||{name:cid==="__new"&&$("#edNewCat").value.trim()||"Unsorted",color:"#8D94A8"};
 const fl=$("#edPrev .flip")?.classList.contains("is-flipped");
 $("#edPrev").innerHTML=`<article class="fc" style="--c:${cat.color}"><div class="flip ${fl?"is-flipped":""}"><div class="tilt"><div class="fi">
  <div class="face front"><div class="ft"><span class="tag">${esc(cat.name)}</span></div><p class="fq"><span>${esc($("#edFront").value)||"<span style='color:var(--muted)'>Your question appears here</span>"}</span></p><div class="ff"><span class="st st-new">New</span></div></div>
  <div class="face back"><div class="ft"><span class="tag">Answer</span></div><p class="fa"><span>${esc($("#edBack").value)||"<span style='color:var(--muted)'>Your answer appears here</span>"}</span></p></div></div></div></div></article>`;}
$("#edPrev").onclick=()=>$("#edPrev .flip").classList.toggle("is-flipped");
$("#edFront").oninput=drawPrev;$("#edBack").oninput=drawPrev;$("#edNewCat").oninput=drawPrev;
$("#edFront").onfocus=()=>$("#edPrev .flip")?.classList.remove("is-flipped");$("#edBack").onfocus=()=>$("#edPrev .flip")?.classList.add("is-flipped");
$("#edCat").onchange=e=>{const n=e.target.value==="__new";$("#edNewCat").hidden=!n;if(n)$("#edNewCat").focus();drawPrev()};
function saveCard(another){
 const front=$("#edFront").value.trim(),back=$("#edBack").value.trim();
 if(!front||!back){$("#edMsg").textContent=!front?"Add something to the front of the card.":"Add the answer on the back.";$(!front?"#edFront":"#edBack").focus();return}
 let cat=$("#edCat").value;
 if(cat==="__new"){const n=$("#edNewCat").value.trim();if(!n){$("#edMsg").textContent="Name the new category or pick another.";$("#edNewCat").focus();return}cat=ensureCat(n).id}
 const hint=$("#edHint").value.trim();
 if(editing){Object.assign(editing,{front,back,hint,cat:cat||null});toast("Card updated")}
 else{const c={id:uid(),front,back,hint,cat:cat||null,src:"manual",bm:false,reps:0,ease:2.5,int:0,due:Date.now(),lapses:0,created:Date.now(),last:null};db.cards.unshift(c);fresh.add(c.id);toast("Card added")}
 save();
 if(another&&!editing){$("#edFront").value="";$("#edBack").value="";$("#edHint").value="";fillCatSelect($("#edCat"),cat||null);drawPrev();$("#edFront").focus();if($("#cats"))renderAll();return}
 closeModals();
 if(!R&&$("#grid")){
  if(editing)renderAll();
  else{Object.assign(S,{k:"all",v:null,src:"all",q:"",sort:"new"});$("#q").value="";drawLibrary()}}}
$("#edSave").onclick=()=>saveCard(false);$("#edMore").onclick=()=>saveCard(true);
$("#newCard").onclick=()=>openEditor();

/* ============ AI generation ============ */
const G={tab:"notes",title:"",text:"",subject:"Biology",topic:"",count:8,style:"mixed",cat:"auto",results:[],sel:new Set(),from:null};
const STYLES=[["mixed","Mixed"],["qa","Question & answer"],["def","Term & definition"],["cloze","Fill the blank"]];
const SAMPLE_NOTES=`Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. Chlorophyll is the green pigment that absorbs mainly red and blue light. The light-dependent reactions happen in the thylakoid membranes and produce ATP, NADPH and oxygen. The Calvin cycle is the set of reactions in the stroma that fix carbon dioxide into glucose. ATP is the cell’s main short-term energy currency. Stomata are tiny pores on leaves that regulate gas exchange. Cellular respiration breaks down glucose with oxygen to release usable energy as ATP. Light intensity, carbon dioxide concentration and temperature limit the rate of photosynthesis.`;
const maxCount=()=>G.tab==="topic"?(G.style==="mixed"?24:8):20;

/* Replace with your backend. Keep the return shape: [{front, back, hint}] */
async function generateFlashcards(o){
 await sleep(0);
 return o.mode==="notes"?fromText(o.text,o.count,o.style):fromBank(o.subject,o.topic,o.count,o.style)}
function styleCard(e,s){
 const [q,a,t,d,h]=e;
 if(s==="def")return {front:t,back:d,hint:"Say it in your own words first"};
 if(s==="cloze"){const re=new RegExp("(?:(?:the|a|an)\\s+)?"+t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i");if(re.test(d))return {front:d.replace(re,"_____"),back:t,hint:h||"Fill in the key term"}}
 return {front:q,back:a,hint:h}}
function fromBank(subject,topic,count,style){
 let pool=BANK[subject]||[];const w=topic.toLowerCase().split(/\W+/).filter(x=>x.length>2);
 if(w.length){const m=pool.filter(e=>w.some(x=>e.slice(0,4).join(" ").toLowerCase().includes(x)));if(m.length)pool=m}
 const cycle=["qa","def","cloze"],out=[],passes=style==="mixed"?3:1,order=shuffle(pool);
 for(let p=0;p<passes;p++)order.forEach((e,j)=>out.push(styleCard(e,style==="mixed"?cycle[(j+p)%3]:style)));
 return out.slice(0,count)}
function fromText(text,count,style){
 const sents=(text.replace(/\s+/g," ").match(/[^.!?]+[.!?]/g)||[]).map(s=>s.trim()).filter(s=>s.split(" ").length>=5);
 const defs=[],rest=[];
 sents.forEach(s=>{const m=s.match(/^(?:The |A |An )?(.{3,48}?)\s+(is|are|means|refers to)\s+(.+?)[.!?]$/i);m?defs.push({s,term:m[1],verb:m[2].toLowerCase()==="are"?"are":"is",def:m[3]}):rest.push(s)});
 const cycle=["qa","def","cloze"],out=[],up=x=>x.replace(/^\w/,c=>c.toUpperCase());
 defs.forEach((d,i)=>{const st=style==="mixed"?cycle[i%3]:style;
  if(st==="def")out.push({front:up(d.term),back:d.s,hint:"Define it in your own words"});
  else if(st==="cloze"){const re=new RegExp("(?:(?:the|a|an)\\s+)?"+d.term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i");out.push({front:d.s.replace(re,"_____"),back:up(d.term),hint:"Fill in the key term"})}
  else out.push({front:`What ${d.verb} ${d.term}?`,back:up(d.def)+".",hint:""})});
 rest.forEach(s=>{const words=s.replace(/[.!?]$/,"").split(" "),k=words.reduce((b,w,i)=>w.replace(/\W/g,"").length>words[b].replace(/\W/g,"").length?i:b,0),key=words[k].replace(/[^\w’'-]/g,"");
  if(key.length>4)out.push({front:words.map((w,i)=>i===k?"_____":w).join(" ")+".",back:key,hint:"Fill in the missing word"})});
 return out.slice(0,count)}

function openAI(prefill){
 if(prefill)Object.assign(G,prefill);
 openM("aiM");drawAI(G.results.length&&G.from==="inbox"?"preview":"config")}
const guessCat=n=>[["Biology",/bio|cell|photo|krebs|gene|enzyme|stomata/i],["Chemistry",/chem|organic|molec|mole|reaction/i],["Computer Science",/code|program|algorithm|web|cs\b|data/i],["Mathematics",/math|calc|algebra|quadratic|deriv/i]].find(x=>x[1].test(n))?.[0]||null;

function drawAI(stage){
 const b=$("#aiBody");
 if(stage==="config"){
  const cats=[["auto","Auto (suggested)"],["none","Unsorted"],...db.cats.map(c=>[c.id,c.name])];
  b.innerHTML=`<div class="gb"><div class="tabs" role="tablist"><button data-tab="notes" class="${G.tab==="notes"?"on":""}" role="tab">From my notes</button><button data-tab="topic" class="${G.tab==="topic"?"on":""}" role="tab">From a topic</button></div>
  ${G.tab==="notes"?`<div class="lbl2"><span>Notes <small>Paste text, or load a .txt or .md file</small></span><textarea class="in" id="gText" rows="8" placeholder="Paste your notes here…">${esc(G.text)}</textarea>
   <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-sm" id="gSample">Use sample notes</button><button class="btn btn-sm" id="gFile">${ic("upload")}Load file</button><input type="file" id="gFileIn" accept=".txt,.md" hidden><span class="sp"></span><span class="hint" id="gWc"></span></div></div>`
  :`<div class="lbl2"><span>Subject</span><div class="chips">${Object.keys(BANK).map(s=>`<button class="ch ${G.subject===s?"on":""}" style="--c:${SUBJECT_COLOR[s]}" data-subj="${s}">${s}</button>`).join("")}</div></div>
   <label class="lbl2"><span>Topic <small>Optional. Narrow it down, e.g. “enzymes” or “sorting”</small></span><input class="in" id="gTopic" value="${esc(G.topic)}" maxlength="60" placeholder="Anything in ${esc(G.subject)}"></label>
   <p class="hint">This preview uses a built-in sample library. Connect your AI service in <code>generateFlashcards()</code> to cover any topic.</p>`}
  <div class="opt-g"><div class="lbl2"><span>Card style</span><div class="chips">${STYLES.map(([k,n])=>`<button class="ch ${G.style===k?"on":""}" data-style="${k}">${n}</button>`).join("")}</div></div>
   <div class="lbl2"><span>Number of cards</span><div class="rng"><input type="range" id="gCount" min="3" max="${maxCount()}" value="${Math.min(G.count,maxCount())}" aria-label="Number of cards"><b id="gCountV">${Math.min(G.count,maxCount())}</b></div></div>
   <label class="lbl2"><span>Save to</span><select class="in" id="gCat">${cats.map(([v,n])=>`<option value="${v}" ${G.cat===v?"selected":""}>${esc(n)}</option>`).join("")}</select></label></div></div>
  <div class="fmf"><span class="sp"></span><button class="btn" data-close>Cancel</button><button class="btn btn-p" id="gGo">${ic("spark")}Generate cards</button></div>`;
  $$("[data-close]",b).forEach(x=>x.onclick=closeModals);
  const wc=()=>{const t=$("#gText");if(t)$("#gWc").textContent=(t.value.match(/\S+/g)||[]).length+" words"};
  if($("#gText")){$("#gText").oninput=e=>{G.text=e.target.value;wc()};wc();
   $("#gSample").onclick=()=>{G.text=SAMPLE_NOTES;G.title="Photosynthesis";$("#gText").value=G.text;wc()};
   $("#gFile").onclick=()=>$("#gFileIn").click();
   $("#gFileIn").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{G.text=String(r.result).slice(0,20000);G.title=f.name.replace(/\.[^.]+$/,"");$("#gText").value=G.text;wc();toast("Loaded "+f.name)};r.readAsText(f)}}
  if($("#gTopic"))$("#gTopic").oninput=e=>G.topic=e.target.value;
  $("#gCount").oninput=e=>{G.count=+e.target.value;$("#gCountV").textContent=G.count};
  $("#gCat").onchange=e=>G.cat=e.target.value;
  $("#gGo").onclick=runAI;
  b.onclick=e=>{let x;
   if(x=e.target.closest("[data-tab]")){G.tab=x.dataset.tab;drawAI("config")}
   if(x=e.target.closest("[data-subj]")){G.subject=x.dataset.subj;drawAI("config")}
   if(x=e.target.closest("[data-style]")){G.style=x.dataset.style;G.count=Math.min(G.count,maxCount());drawAI("config")}}}
 if(stage==="preview")drawPreview()}
async function runAI(){
 if(G.tab==="notes"&&(G.text.match(/\S+/g)||[]).length<8){toast("Add a few lines of notes first");$("#gText").focus();return}
 const steps=["Reading your material","Finding the key ideas","Writing questions and answers","Checking each card"];
 $("#aiBody").onclick=null;
 $("#aiBody").innerHTML=`<div class="gb"><div class="gen"><div class="orb"></div><h3 style="font-family:var(--fd)">Creating your flashcards</h3><ul class="steps" id="gs">${steps.map(s=>`<li><span class="s">${ic("check")}</span>${s}</li>`).join("")}</ul></div></div>`;
 const lis=$$("#gs li");
 const job=generateFlashcards({mode:G.tab,text:G.text,subject:G.subject,topic:G.topic,count:G.count,style:G.style}).catch(()=>null);
 for(const li of lis){li.className="run";await sleep(REDUCED?60:380);li.className="ok"}
 const res=await job;
 if(!res||!res.length){toast("Couldn’t make cards from that. Add more detail and try again.");return drawAI("config")}
 G.results=res;G.sel=new Set(res.map((_,i)=>i).filter(i=>!db.cards.some(c=>c.front.trim().toLowerCase()===res[i].front.trim().toLowerCase())));
 G.from=null;drawAI("preview")}
function drawPreview(){
 const b=$("#aiBody"),dup=i=>db.cards.some(c=>c.front.trim().toLowerCase()===G.results[i].front.trim().toLowerCase());
 const cats=[["auto","Auto (suggested)"],["none","Unsorted"],...db.cats.map(c=>[c.id,c.name])];
 b.innerHTML=`<div class="gb"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div><h3 style="font-family:var(--fd)" id="pvT"></h3><span class="hint">Untick anything you don’t want. Duplicates start unticked.</span></div><span class="sp"></span>
  <button class="btn btn-sm" id="pvAll"></button></div>
  <div class="pv">${G.results.map((r,i)=>`<label class="gp ${G.sel.has(i)?"on":""}" style="--i:${Math.min(i,12)}"><input type="checkbox" data-i="${i}" ${G.sel.has(i)?"checked":""}><div><b>${esc(r.front)}</b><span>${esc(r.back)}</span></div>${dup(i)?`<span class="dup">Already in deck</span>`:"<span></span>"}</label>`).join("")}</div>
  <label class="lbl2" style="max-width:260px"><span>Save to</span><select class="in" id="gCat2">${cats.map(([v,n])=>`<option value="${v}" ${G.cat===v?"selected":""}>${esc(n)}</option>`).join("")}</select></label></div>
  <div class="fmf"><button class="btn" id="pvBack">Back</button><button class="btn" id="pvRe">${ic("redo")}Regenerate</button><span class="sp"></span><button class="btn btn-p" id="pvAdd"></button></div>`;
 const upd=()=>{$("#pvT").textContent=`${G.results.length} cards ready`;$("#pvAdd").textContent=`Add ${G.sel.size} card${G.sel.size===1?"":"s"}`;$("#pvAdd").disabled=!G.sel.size;$("#pvAll").textContent=G.sel.size===G.results.length?"Untick all":"Tick all"};
 upd();
 b.onclick=null;
 $$("[data-i]",b).forEach(cb=>cb.onchange=()=>{const i=+cb.dataset.i;cb.checked?G.sel.add(i):G.sel.delete(i);cb.closest(".gp").classList.toggle("on",cb.checked);upd()});
 $("#pvAll").onclick=()=>{const all=G.sel.size===G.results.length;G.sel=new Set(all?[]:G.results.map((_,i)=>i));$$("[data-i]",b).forEach(cb=>{cb.checked=G.sel.has(+cb.dataset.i);cb.closest(".gp").classList.toggle("on",cb.checked)});upd()};
 $("#gCat2").onchange=e=>G.cat=e.target.value;
 $("#pvBack").onclick=()=>drawAI("config");$("#pvRe").onclick=runAI;$("#pvAdd").onclick=addGenerated}
function addGenerated(){
 let catId=null;
 if(G.cat==="auto"){const n=G.tab==="topic"?G.subject:G.fromCat||guessCat(G.title+" "+G.text);if(n)catId=ensureCat(n).id}
 else if(G.cat!=="none")catId=G.cat;
 const now=Date.now(),ids=[];
 [...G.sel].sort((a,b)=>a-b).forEach((i,k)=>{const r=G.results[i],c={id:uid(),front:r.front,back:r.back,hint:r.hint||"",cat:catId,src:"ai",bm:false,reps:0,ease:2.5,int:0,due:now,lapses:0,created:now+k,last:null};db.cards.unshift(c);ids.push(c.id)});
 save();fresh=new Set(ids);closeModals();
 S.k=catId?"cat":"new";S.v=catId;S.src="all";S.q="";S.sort="new";$("#q").value="";
 R=null;drawLibrary();toast(`Added ${ids.length} AI card${ids.length>1?"s":""} to ${catId?catOf(catId).name:"your deck"}`);
 G.results=[];G.sel=new Set();G.from=null;G.fromCat=null}
$("#aiOpen").onclick=()=>{G.from=null;G.results=[];openAI()};

/* ============ Review ============ */
let R=null;
function startReview(scope){
 let pool=scope==="filter"?visible():db.cards.slice();
 let due=pool.filter(isDue).sort((a,b)=>a.due-b.due),cram=false;
 if(!due.length){if(!pool.length){toast("No cards to review here yet");return}due=shuffle(pool).slice(0,20);cram=true}
 R={ids:due.map(c=>c.id),total:due.length,pos:0,done:0,flipped:false,busy:false,hint:false,t0:Date.now(),rates:[0,0,0,0],missed:new Set(),label:scope==="filter"?title():"All decks",cram};
 view.onclick=reviewClick;view.onkeydown=null;
 drawReview(true)}
const cur=()=>db.cards.find(c=>c.id===R.ids[R.pos]);
function drawReview(first){
 const c=cur();if(!c)return finishReview();
 if(first||!$(".rv")){swap(`<div class="rv">
  <div class="rvt"><button class="btn btn-sm" data-r="exit">${ic("back")}Exit</button><div class="bar"><i id="rvBar" style="width:0"></i></div><b id="rvCount"></b><button class="bm" id="rvBm" data-r="bm" aria-label="Bookmark">${ic("bookmark")}</button></div>
  <div class="stage enter rvc" id="stage"></div><div class="hintbox" id="hintBox"></div><div class="ctl" id="ctl"></div>
  <div class="keys"><span><kbd>Space</kbd>Flip</span><span><kbd>1</kbd>–<kbd>4</kbd>Rate</span><span><kbd>H</kbd>Hint</span><span><kbd>B</kbd>Bookmark</span><span><kbd>Esc</kbd>Exit</span></div></div>`);
  wireTilt($("#stage"))}
 R.flipped=false;R.hint=false;R.busy=false;
 const st=$("#stage");st.className="stage rvc enter";st.innerHTML=cardHTML(c,{review:true});
 $("#rvCount").textContent=`${Math.min(R.done+1,R.total)} of ${R.total}${R.cram?" · practice":""}`;$("#rvBar").style.width=(R.done/R.total*100)+"%";
 const bm=$("#rvBm");bm.classList.toggle("on",c.bm);$("#hintBox").textContent="";
 $("#ctl").innerHTML=`<div style="display:grid;gap:8px"><button class="btn btn-p showbtn" data-r="flip">${ic("flip")}Show answer</button>${c.hint?`<button class="btn btn-sm" style="justify-self:center;border:0;box-shadow:none;background:none;color:var(--warn)" data-r="hint">${ic("bulb")}Show hint</button>`:""}</div>`}
function flipCard(){
 if(!R||R.busy)return;const f=$("#stage .flip");R.flipped=!R.flipped;f.classList.toggle("is-flipped",R.flipped);
 if(R.flipped){const c=cur();$("#hintBox").textContent="";
  const lab={0:["Again","var(--bad)"],1:["Hard","var(--warn)"],2:["Good","var(--primary)"],3:["Easy","var(--ok)"]};
  $("#ctl").innerHTML=`<div class="rates">${[0,1,2,3].map(r=>{const n=nextState(c,r);return `<button class="rate" style="--c:${lab[r][1]}" data-rate="${r}">${lab[r][0]}<small>${fmtIn(n.due-Date.now())} · ${r+1}</small></button>`}).join("")}</div>`}
 else $("#ctl").innerHTML=`<button class="btn btn-p showbtn" data-r="flip">${ic("flip")}Show answer</button>`}
function rate(r){
 if(!R||!R.flipped||R.busy)return;R.busy=true;const c=cur(),n=nextState(c,r);
 Object.assign(c,n,{last:Date.now()});R.rates[r]++;db.log.push({t:Date.now(),r,id:c.id});if(db.log.length>800)db.log=db.log.slice(-800);bumpStreak();
 if(r===0){R.missed.add(c.id);R.ids.push(c.id)}else R.done++;
 save();const st=$("#stage");st.classList.remove("enter");st.classList.add(r===0?"out-d":"out-l");
 setTimeout(()=>{R.pos++;drawReview()},REDUCED?30:300)}
function bumpStreak(){const t=todayKey(),s=db.streak;if(s.last===t)return;const y=new Date(Date.now()-DAY).toDateString();s.n=s.last===y?s.n+1:1;s.last=t}
function reviewClick(e){
 const b=e.target.closest("[data-r],[data-rate]");
 if(b){if(b.dataset.rate!==undefined)return rate(+b.dataset.rate);const a=b.dataset.r;
  if(a==="exit")return exitReview();if(a==="flip")return flipCard();
  if(a==="bm"){const c=cur();c.bm=!c.bm;save();b.classList.toggle("on",c.bm);return}
  if(a==="hint")return showHint()}
 if(e.target.closest("#stage .flip")&&!e.target.closest("button")&&$(".rv"))flipCard()}
function showHint(){const c=cur();if(!c||!c.hint)return;R.hint=!R.hint;$("#hintBox").textContent=R.hint?"Hint: "+c.hint:""}
function reviewKey(e){
 if(e.key===" "||e.key==="Enter"){e.preventDefault();flipCard()}
 else if(/^[1-4]$/.test(e.key))rate(+e.key-1);
 else if(e.key==="h"||e.key==="H")showHint();
 else if(e.key==="b"||e.key==="B"){const c=cur();if(c){c.bm=!c.bm;save();$("#rvBm").classList.toggle("on",c.bm)}}}
function exitReview(){R=null;drawLibrary()}
function finishReview(){
 const n=R.rates.reduce((a,b)=>a+b,0),good=R.rates[2]+R.rates[3],pct=n?Math.round(good/n*100):0,secs=Math.round((Date.now()-R.t0)/1000),xp=R.rates[1]*5+R.rates[2]*10+R.rates[3]*12;
 const mm=`${Math.floor(secs/60)}m ${String(secs%60).padStart(2,"0")}s`,missed=[...R.missed];
 const L=[["Again","var(--bad)"],["Hard","var(--warn)"],["Good","var(--primary)"],["Easy","var(--ok)"]];
 const msg=pct>=85?"Excellent recall":pct>=60?"Good session":"Worth another pass";
 swap(`<div class="sm"><div class="smc"><div class="ring" id="ring" style="--p:0"><div id="ringN">0%</div></div>
  <div><h2>${msg}</h2><p class="sub" style="margin-top:4px">${R.total} ${R.total===1?"card":"cards"} in ${mm} · +${xp} XP${db.streak.n>1?` · ${db.streak.n}-day streak`:""}</p>
  ${L.map((l,i)=>`<div class="br" style="--c:${l[1]}"><div><span>${l[0]}</span><b>${R.rates[i]}</b></div><div class="bar"><i data-w="${n?R.rates[i]/n*100:0}" style="width:0"></i></div></div>`).join("")}</div></div>
  <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${missed.length?`<button class="btn" data-r="again">${ic("redo")}Review ${missed.length} missed</button>`:""}<button class="btn btn-p" data-r="exit">${ic("back")}Back to flashcards</button></div></div>`);
 const missedIds=missed;R.missedIds=missedIds;
 if(missedIds.length)view.onclick=e=>{const b=e.target.closest("[data-r]");if(!b)return;if(b.dataset.r==="exit")return exitReview();
  if(b.dataset.r==="again"){const pool=missedIds.map(id=>db.cards.find(c=>c.id===id)).filter(Boolean);R={ids:pool.map(c=>c.id),total:pool.length,pos:0,done:0,flipped:false,busy:false,hint:false,t0:Date.now(),rates:[0,0,0,0],missed:new Set(),label:"Missed cards",cram:true};view.onclick=reviewClick;drawReview(true)}};
 requestAnimationFrame(()=>requestAnimationFrame(()=>$$(".br .bar i").forEach(i=>i.style.width=i.dataset.w+"%")));
 const t0=performance.now(),el=$("#ring"),nEl=$("#ringN");(function f(t){const p=REDUCED?1:Math.min((t-t0)/1100,1),v=Math.round(pct*(1-Math.pow(1-p,3)));el.style.setProperty("--p",v);nEl.textContent=v+"%";if(p<1)requestAnimationFrame(f)})(t0)}

/* ============ Handoff from other pages ============
   notes.html, analyze.html and study-partner.html drop a request in localStorage and link here. */
function consumeInbox(){
 let box=null;try{box=JSON.parse(localStorage.getItem(INBOX));localStorage.removeItem(INBOX)}catch(e){}
 if(!box)return false;
 Object.assign(G,{title:box.title||"",text:box.text||"",topic:"",cat:"auto",fromCat:box.cat||null,count:Math.min(8,maxCount())});
 if(Array.isArray(box.cards)&&box.cards.length){
  G.results=box.cards.map(c=>({front:c.front,back:c.back,hint:c.hint||""}));G.sel=new Set(G.results.map((_,i)=>i).filter(i=>!db.cards.some(c=>c.front.trim().toLowerCase()===G.results[i].front.trim().toLowerCase())));
  G.tab="notes";G.from="inbox";openM("aiM");drawPreview();toast(`${G.results.length} cards imported${box.title?" from "+box.title:""}. Review them, then add`);return true}
 const sub=guessCat([box.cat,box.topic,box.title].join(" "));
 if(box.text)G.tab="notes";
 else if(sub){G.tab="topic";G.subject=sub;G.topic=(box.topic||"").replace(/^(make|create|generate)\s+flashcards?\s+(for|on|about)?\s*/i,"")}
 else{G.tab="notes";toast(`Paste your notes${box.title?" from “"+box.title+"”":""} and AI will turn them into cards`)}
 G.from=null;G.results=[];openM("aiM");drawAI("config");return true}

/* ============ Boot ============ */
(function(){
 const p=new URLSearchParams(location.search);
 drawLibrary();
 if(consumeInbox())return;
 if(p.get("review")==="1")startReview(null);
 else if(p.get("new")==="1")openEditor();
})();
