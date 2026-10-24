const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

/* ---------- validation rules (return "" when valid) ---------- */
const rules={
  required:v=>v.trim()?"":"This field is required.",
  name:v=>v.trim().length<2?"Enter your full name.":"",
  email:v=>!v.trim()?"Enter your email address.":/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())?"":"Enter a valid email address.",
  loginpw:v=>v?"":"Enter your password.",
  password:v=>v.length<8?"Use at least 8 characters.":!/[A-Z]/.test(v)||!/\d/.test(v)?"Add an uppercase letter and a number.":"",
  match:(v,el)=>!v?"Confirm your password.":v!==$(el.dataset.match).value?"Passwords don’t match.":"",
  terms:(v,el)=>el.checked?"":"Please accept the terms to continue."
};
function check(el){
  const f=el.closest(".field");const msg=rules[el.dataset.v](el.value,el);
  f.classList.toggle("error",!!msg);f.classList.toggle("ok",!msg&&el.value&&el.type!=="checkbox");
  $(".err",f).textContent=msg;el.setAttribute("aria-invalid",!!msg);return !msg;
}
$$("[data-v]").forEach(el=>{
  el.addEventListener("blur",()=>{el.dataset.t=1;check(el)});
  el.addEventListener("input",()=>{if(el.dataset.t||el.closest(".field").classList.contains("error"))check(el);
    if(el.dataset.v==="password"){meter(el);const m=$("[data-match]");if(m&&m.dataset.t)check(m)}});
});

/* ---------- show / hide password ---------- */
$$(".eye").forEach(b=>b.onclick=()=>{const i=b.previousElementSibling,s=i.type==="password";i.type=s?"text":"password";
  b.setAttribute("aria-label",s?"Hide password":"Show password");b.style.color=s?"var(--primary)":""});

/* ---------- password strength ---------- */
function meter(el){
  const v=el.value,m=$(".meter",el.closest(".field"));if(!m)return;
  const s=Math.min(4,(v.length>=8)+/[A-Z]/.test(v)+/\d/.test(v)+/[^A-Za-z0-9]/.test(v)+(v.length>=12?1:0)-(v?0:9));
  const sc=Math.max(0,s),cols=["var(--bad)","#F9B93F","var(--accent)","var(--ok)"];
  $$("i",m).forEach((b,i)=>b.style.background=i<sc?cols[sc-1]:"");
  $(".mt",el.closest(".field")).textContent=v?["Too weak","Weak","Good","Strong"][Math.max(0,sc-1)]:"Use 8+ characters with a capital letter and a number.";
}

/* ---------- submit handling (front end only: hook your API in go()) ---------- */
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2800)}
/* remember who signed up / logged in so the app can show their name */
function saveUser(form,email){
  try{
    const nameEl=$("[name=name]",form),old=JSON.parse(localStorage.getItem("n2q-user")||"null");
    if(nameEl){localStorage.setItem("n2q-user",JSON.stringify({name:nameEl.value.trim().replace(/\s+/g," "),email:email.trim()}));return}
    if(form.dataset.next==="dashboard.html"&&email){ /* login has no name field: keep the saved one for this email, else derive it */
      if(old&&old.email&&old.email.toLowerCase()===email.trim().toLowerCase())return;
      const n=email.split("@")[0].replace(/[._-]+/g," ").trim().replace(/\b\w/g,c=>c.toUpperCase());
      localStorage.setItem("n2q-user",JSON.stringify({name:n||"Student",email:email.trim()}));
    }
  }catch(e){}
}
$$("form[data-next]").forEach(form=>form.addEventListener("submit",e=>{
  e.preventDefault();
  const bad=$$("[data-v]",form).filter(el=>{el.dataset.t=1;return !check(el)});
  if(bad.length){bad[0].focus();bad.forEach(b=>{const f=b.closest(".field");f.classList.remove("shake");void f.offsetWidth;f.classList.add("shake")});return}
  const btn=$("button[type=submit]",form);btn.classList.add("load");btn.disabled=true;
  const email=($("[type=email]",form)||{}).value||"";
  saveUser(form,email);
  setTimeout(()=>{ /* TODO: replace with a real fetch() to your backend */
    if(form.dataset.mode==="swap"){form.hidden=true;$("#done").hidden=false;const em=$("#sentto");if(em)em.textContent=email;return}
    location.href=form.dataset.next;
  },900);
}));
