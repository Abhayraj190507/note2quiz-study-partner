/* AI Revision Hub — frontend only.
   Content lives in DATA below. Replace buildSubject() with your AI call
   to generate notes, questions, formulas and definitions from a student's notes. */
const DATA={
"Machine Learning":{
notes:[["Supervised vs Unsupervised",["Supervised learns from labelled pairs (x, y): regression, classification","Unsupervised finds structure in unlabelled data: clustering, PCA","Semi-supervised mixes a small labelled set with a large unlabelled one"]],
["Bias–Variance Trade-off",["High bias means underfitting, high variance means overfitting","More model complexity lowers bias but raises variance","Fix with regularisation, more data, cross-validation"]],
["Decision Trees",["Split on the feature giving the best information gain or Gini drop","Deep trees overfit: prune or limit depth","Random forests average many trees trained on bootstrap samples"]],
["Evaluation Metrics",["Accuracy misleads on imbalanced classes","Precision cares about false positives, recall about false negatives","ROC-AUC measures ranking quality across thresholds"]]],
rapid:["Train / validation / test split: never tune on the test set","Normalise features before KNN, SVM and gradient descent","L1 gives sparse weights, L2 shrinks weights smoothly","k-means needs k up front and is sensitive to initialisation","Gradient descent: learning rate too high diverges, too low crawls","Overfitting signal: low train error, high validation error"],
qs:[["Explain the bias–variance trade-off with an example.",10,"hi","Total error = bias² + variance + noise. A linear model on curved data has high bias; a degree-15 polynomial on 20 points has high variance. Choose complexity where validation error is lowest."],
["Differentiate between bagging and boosting.",5,"hi","Bagging trains models in parallel on bootstrap samples and averages them to cut variance. Boosting trains sequentially, each model focusing on previous errors, to cut bias."],
["Why do we use regularisation?",5,"mid","It penalises large weights so the model cannot memorise noise, which reduces overfitting. L1 adds |w|, L2 adds w²."],
["Derive the update rule for gradient descent.",10,"mid","Minimise J(θ). Move opposite the gradient: θ := θ − α ∇J(θ). For linear regression, ∂J/∂θⱼ = (1/m) Σ (h(x) − y)·xⱼ."]],
f:[["Linear regression hypothesis","h(x) = θᵀx","Prediction as weighted sum of features"],["Gradient descent update","θⱼ := θⱼ − α ∂J/∂θⱼ","α is the learning rate"],["Sigmoid","σ(z) = 1 / (1 + e⁻ᶻ)","Squashes any value into (0, 1)"],["Precision / Recall","P = TP/(TP+FP),  R = TP/(TP+FN)","Trade-off controlled by threshold"],["F1 score","F1 = 2PR / (P + R)","Harmonic mean of precision and recall"],["Entropy","H = −Σ pᵢ log₂ pᵢ","Impurity measure used by decision trees"]],
defs:[["Overfitting","When a model learns noise in the training data and performs poorly on unseen data."],["Cross-validation","Rotating train and validation folds to estimate generalisation more reliably."],["Feature scaling","Rescaling features to a similar range so no single feature dominates."],["Hyperparameter","A setting chosen before training, such as learning rate or tree depth."],["Confusion matrix","A table of TP, FP, TN and FN counts for a classifier."]]},
"Deep Learning":{
notes:[["Neural Network Basics",["Layer output = activation(Wx + b)","Backpropagation applies the chain rule to get gradients","Non-linear activations let networks learn complex functions"]],
["CNNs",["Convolution filters share weights and detect local patterns","Pooling shrinks feature maps and adds translation tolerance","Used for images, also audio spectrograms"]],
["RNNs and LSTMs",["RNNs carry a hidden state across time steps","Vanishing gradients limit long memory","LSTM gates (forget, input, output) control what is kept"]],
["Transformers",["Self-attention relates every token to every other token","Positional encodings supply order information","Parallel training makes them far faster than RNNs"]]],
rapid:["ReLU avoids saturation but can die for negative inputs","Dropout is active at train time only","Batch norm stabilises and speeds up training","Softmax turns logits into a probability distribution","Use Adam as a safe default optimiser","Early stopping watches validation loss"],
qs:[["Explain backpropagation step by step.",10,"hi","1) Forward pass computes outputs and loss. 2) Compute dLoss/dOutput. 3) Apply the chain rule layer by layer backwards to get gradients for each weight. 4) Update weights with an optimiser."],
["What is the vanishing gradient problem and how is it reduced?",5,"hi","Gradients shrink exponentially through many layers, so early layers barely learn. Use ReLU, residual connections, batch norm, LSTM gates and good initialisation (He/Xavier)."],
["Compare CNN and RNN.",5,"mid","CNN: spatial data, local filters, weight sharing. RNN: sequential data, hidden state over time. Transformers now replace RNNs for many sequence tasks."],
["Describe the attention mechanism.",10,"mid","Each token makes query, key and value vectors. Scores = softmax(QKᵀ/√dₖ), then output = scores · V, a weighted mix of values."]],
f:[["Softmax","softmax(zᵢ) = eᶻⁱ / Σ eᶻʲ","Outputs sum to 1"],["Cross-entropy loss","L = −Σ yᵢ log(ŷᵢ)","Standard loss for classification"],["Conv output size","O = (N − F + 2P)/S + 1","N input, F filter, P padding, S stride"],["Attention","Attn = softmax(QKᵀ/√dₖ)·V","Scaled dot-product attention"],["Adam update","θ := θ − α m̂ / (√v̂ + ε)","Momentum plus adaptive rates"]],
defs:[["Epoch","One full pass through the training dataset."],["Batch size","Number of samples processed before one weight update."],["Activation function","A non-linear function applied to a neuron's weighted sum."],["Transfer learning","Reusing a pre-trained model as the starting point for a new task."],["Embedding","A dense vector representing a word, item or token."]]},
"Probability & Stats":{
notes:[["Bayes' Theorem",["Updates belief using new evidence","Posterior ∝ likelihood × prior","Basis of Naive Bayes classifiers"]],
["Distributions",["Binomial: n trials, success probability p","Poisson: events in a fixed interval","Normal: mean μ, variance σ², 68-95-99.7 rule"]],
["Hypothesis Testing",["Null H₀ is the default claim, H₁ the alternative","p-value: probability of data at least as extreme given H₀","Reject H₀ when p < α"]]],
rapid:["Independent events: P(A∩B) = P(A)P(B)","Variance is the square of standard deviation","Correlation does not imply causation","Central limit theorem: sample means approach normal","Type I = false positive, Type II = false negative"],
qs:[["State and prove Bayes' theorem.",10,"hi","From P(A∩B) = P(A|B)P(B) = P(B|A)P(A), divide by P(B): P(A|B) = P(B|A)P(A)/P(B)."],
["Explain the central limit theorem.",5,"hi","For large n, the distribution of the sample mean tends to a normal with mean μ and variance σ²/n, whatever the population shape."],
["Differentiate Type I and Type II errors.",5,"mid","Type I (α): rejecting a true H₀. Type II (β): failing to reject a false H₀. Power = 1 − β."]],
f:[["Bayes","P(A|B) = P(B|A)P(A)/P(B)","Posterior from likelihood and prior"],["Variance","σ² = E[X²] − (E[X])²","Spread of a distribution"],["Binomial","P(X=k) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ","k successes in n trials"],["Z-score","z = (x − μ) / σ","Distance from mean in standard deviations"]],
defs:[["Random variable","A numerical outcome of a random experiment."],["Expected value","The probability-weighted average of all outcomes."],["Confidence interval","A range that would contain the true parameter in a stated share of repeated samples."],["p-value","Probability of results at least as extreme as observed, assuming H₀ is true."]]}};

const TABS=[["notes","Quick notes","M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"],["rapid","Last minute","M13 2 3 14h9l-1 8 10-12h-9z"],["qs","Important Qs","M9 9a3 3 0 1 1 4 2.8c-.7.4-1 1-1 1.7M12 17h.01"],["f","Formulas","M18 7V4H6l6 8-6 8h12v-3"],["defs","Definitions","M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"],["exam","Exam mode","M12 8v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"]];
const KEY="n2q-revision-hub-v1",INBOX="n2q-flashcards-inbox";
const $=s=>document.querySelector(s);
const ic=(p,c="i")=>`<svg class="${c}" viewBox="0 0 24 24"><path d="${p}"/></svg>`;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
let S={sub:"Machine Learning",tab:"notes",done:{},stars:{}},q="",fav=false,ex=null,tm=null;
try{Object.assign(S,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){}
if(!DATA[S.sub])S.sub="Machine Learning";
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const key=(t,i)=>S.sub+"|"+t+"|"+i;
const hit=s=>!q||s.toLowerCase().includes(q.toLowerCase());
const toast=m=>{const t=$("#toast");if(!t)return;t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2200)};

function progress(){const d=DATA[S.sub],k=[...d.notes.map((_,i)=>key("notes",i)),...d.rapid.map((_,i)=>key("rapid",i))],n=k.filter(x=>S.done[x]).length;
  $("#plabel").textContent=`${n} of ${k.length} notes and checkpoints revised`;$("#pbar").style.width=(n/k.length*100)+"%"}
const searchBar=ph=>`<div class="rh-row"><input class="rh-field" type="search" id="q" placeholder="${ph}" value="${esc(q)}" aria-label="Search">${S.tab==="qs"?`<button class="rh-btn ${fav?"p":""}" data-fav>Bookmarked only</button>`:""}</div>`;

function examView(){
  if(!ex)return `<div class="card rh-exam rh-card"><h3>Exam preparation mode</h3><p style="color:var(--muted)">A timed drill through every question for ${esc(S.sub)}. Reveal each answer, then rate yourself honestly.</p><label class="rh-row" style="color:var(--muted)">Minutes <input class="rh-field" type="number" id="mins" value="10" min="1" max="180" style="width:90px"></label><button class="rh-btn p" data-start style="width:max-content">Start drill</button></div>`;
  if(ex.end){const t=ex.got+ex.miss;return `<div class="card rh-exam rh-card"><h3>Drill complete</h3><div class="rh-stats"><div class="rh-stat"><b>${ex.got}</b>Confident</div><div class="rh-stat"><b>${ex.miss}</b>Revisit</div><div class="rh-stat"><b>${t?Math.round(ex.got/t*100):0}%</b>Score</div></div><p style="color:var(--muted)">${ex.miss?"Questions you missed are bookmarked in Important Qs.":"Clean run. Keep your notes light now."}</p><button class="rh-btn p" data-reset style="width:max-content">Back</button></div>`}
  const x=ex.list[ex.i];
  return `<div class="card rh-exam rh-card"><div class="rh-row" style="justify-content:space-between"><span style="color:var(--muted)">Question ${ex.i+1} of ${ex.list.length}</span><span class="rh-timer ${ex.left<60?"low":""}" id="tm">${fmt(ex.left)}</span></div><div class="rh-q">${esc(x[0])}</div><span class="rh-tag">${x[1]} marks</span><div class="rh-ans ${ex.show?"open":""}">${esc(x[3])}</div>${ex.show?`<div class="rh-row"><button class="rh-btn s" data-rate="1">Got it</button><button class="rh-btn d" data-rate="0">Need to revisit</button></div>`:`<button class="rh-btn p" data-reveal style="width:max-content">Reveal answer</button>`}<button class="rh-btn" data-end style="width:max-content">End drill</button></div>`}

function render(keep){
  $("#subjects").innerHTML=Object.keys(DATA).map(s=>`<button class="rh-chip" aria-pressed="${s===S.sub}" data-s="${s}">${s}</button>`).join("");
  $("#tabs").innerHTML=TABS.map(t=>`<button class="rh-tab" role="tab" aria-selected="${t[0]===S.tab}" data-t="${t[0]}">${ic(t[2])}${t[1]}</button>`).join("");
  progress();const d=DATA[S.sub];let h="",n=0;
  if(S.tab==="notes"){const l=d.notes.map((x,i)=>[x,i]).filter(([x])=>hit(x[0]+x[1].join()));n=l.length;
    h=searchBar("Search notes")+`<div class="rh-grid">`+l.map(([x,i])=>`<article class="card rh-card ${S.done[key("notes",i)]?"done":""}"><h3>${esc(x[0])}</h3><ul>${x[1].map(b=>`<li>${esc(b)}</li>`).join("")}</ul><button class="rh-btn ${S.done[key("notes",i)]?"s":""}" data-d="${key("notes",i)}">${S.done[key("notes",i)]?"Revised":"Mark as revised"}</button></article>`).join("")+`</div><div class="rh-row"><button class="rh-btn" data-fc>${ic("m12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5")}Make flashcards from these notes</button></div>`}
  if(S.tab==="rapid"){n=1;h=`<div class="card rh-card" style="max-width:640px"><h3>Last minute checklist</h3><p style="color:var(--muted)">Tick each point as you recall it without looking.</p>`+d.rapid.map((r,i)=>`<button class="rh-check ${S.done[key("rapid",i)]?"on":""}" data-d="${key("rapid",i)}"><span class="rh-box"></span><span>${esc(r)}</span></button>`).join("")+`</div>`}
  if(S.tab==="qs"){const l=d.qs.map((x,i)=>[x,i]).filter(([x,i])=>hit(x[0])&&(!fav||S.stars[key("qs",i)]));n=l.length;
    h=searchBar("Search questions")+`<div class="rh-grid">`+l.map(([x,i])=>`<article class="card rh-card"><div class="rh-row" style="justify-content:space-between"><span class="rh-tag ${x[2]}">${x[1]} marks${x[2]=="hi"?" · frequently asked":""}</span><button class="rh-btn rh-star" aria-pressed="${!!S.stars[key("qs",i)]}" data-star="${key("qs",i)}" aria-label="Bookmark" style="width:36px;padding:0">${ic("m12 2 3 7 7 .6-5.4 4.8L18.2 22 12 18l-6.2 4 1.6-7.6L2 9.6 9 9z")}</button></div><h3>${esc(x[0])}</h3><div class="rh-ans" id="a${i}">${esc(x[3])}</div><button class="rh-btn" data-ans="a${i}">Show answer</button></article>`).join("")+`</div>`}
  if(S.tab==="f"){const l=d.f.filter(x=>hit(x.join()));n=l.length;
    h=searchBar("Search formulas")+`<div class="rh-grid">`+l.map(x=>`<article class="card rh-card"><h3>${esc(x[0])}</h3><div class="rh-mono">${esc(x[1])}</div><p style="color:var(--muted)">${esc(x[2])}</p><button class="rh-btn" data-copy="${esc(x[1])}">Copy formula</button></article>`).join("")+`</div>`}
  if(S.tab==="defs"){const l=d.defs.filter(x=>hit(x.join())).sort((a,b)=>a[0].localeCompare(b[0]));n=l.length;
    h=searchBar("Search definitions")+`<div class="rh-grid">`+l.map(x=>`<article class="card rh-card"><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></article>`).join("")+`</div>`}
  if(S.tab==="exam"){n=1;h=examView()}
  if(!n)h+=`<div class="rh-empty">Nothing matches. Try another search.</div>`;
  $("#view").innerHTML=h;
  const f=$("#q");if(f){f.oninput=e=>{q=e.target.value;const p=f.selectionStart;render(true);const g=$("#q");g.focus();g.setSelectionRange(p,p)};if(keep&&document.activeElement===document.body&&q){f.focus();f.setSelectionRange(q.length,q.length)}}
}
function stop(){clearInterval(tm);tm=null}
document.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;const a=b.dataset;
  if(a.s){stop();ex=null;S.sub=a.s;q="";save();render()}
  else if(a.t){stop();if(a.t!=="exam")ex=null;S.tab=a.t;q="";render()}
  else if(a.d){S.done[a.d]=!S.done[a.d];save();render(true)}
  else if(a.star){S.stars[a.star]=!S.stars[a.star];save();render(true)}
  else if("fav"in a){fav=!fav;render(true)}
  else if(a.ans){const n=document.getElementById(a.ans);n.classList.toggle("open");b.textContent=n.classList.contains("open")?"Hide answer":"Show answer"}
  else if(a.copy){navigator.clipboard&&navigator.clipboard.writeText(a.copy).then(()=>toast("Formula copied")).catch(()=>{})}
  else if("fc"in a){const text=DATA[S.sub].notes.map(n=>n[0]+"\n"+n[1].join("\n")).join("\n\n");
    try{localStorage.setItem(INBOX,JSON.stringify({title:S.sub+" revision notes",cat:S.sub,text}))}catch(err){}
    location.href="flashcards.html"}
  else if("start"in a){const m=Math.max(1,+$("#mins").value||10);ex={list:[...DATA[S.sub].qs].sort(()=>Math.random()-.5),i:0,show:false,got:0,miss:0,left:m*60};stop();
    tm=setInterval(()=>{ex.left--;const n=$("#tm");if(n){n.textContent=fmt(ex.left);n.classList.toggle("low",ex.left<60)}if(ex.left<=0){stop();ex.end=true;render()}},1000);render()}
  else if("reveal"in a){ex.show=true;render()}
  else if(a.rate){const x=ex.list[ex.i];if(a.rate=="1")ex.got++;else{ex.miss++;S.stars[key("qs",DATA[S.sub].qs.indexOf(x))]=true;save()}ex.show=false;ex.i++;if(ex.i>=ex.list.length){stop();ex.end=true}render()}
  else if("end"in a){stop();ex.end=true;render()}
  else if("reset"in a){ex=null;render()}
});
$("#theme").onclick=()=>{const r=document.documentElement,c=r.dataset.theme||(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark");r.dataset.theme=c==="dark"?"light":"dark"};
const tp=new URLSearchParams(location.search).get("tab");if(TABS.some(t=>t[0]===tp))S.tab=tp;
render();
