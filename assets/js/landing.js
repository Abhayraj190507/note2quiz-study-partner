const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;

/* hero: notes type out, then quiz answers itself */
const txt="The mitochondrion is the organelle where aerobic respiration happens. It converts glucose and oxygen into ATP, the cell’s main energy currency…";
const t=$("#typed");let k=0;
(function type(){t.textContent=txt.slice(0,k);if(k++<txt.length)setTimeout(type,reduce?0:28);else setTimeout(()=>{k=0;type()},9000)})();
$$("#quiz .opt").forEach(b=>b.onclick=()=>{
  $$("#quiz .opt").forEach(o=>{o.disabled=true;o.classList.add(o.dataset.r==="1"?"right":(o===b?"wrong":""))});
});
setTimeout(()=>$$("#quiz .opt")[1]?.classList.add("right"),reduce?0:6500);

/* reveal on scroll + counters + chart + chat */
const bars=[40,62,48,80,66,92,74];
$("#chart").innerHTML=bars.map(()=>"<i></i>").join("");
function count(el){const n=+el.dataset.n,d=+el.dataset.d||0,s=el.dataset.s||"",t0=performance.now(),D=1600;
  (function f(now){const p=Math.min((now-t0)/D,1),e=1-Math.pow(1-p,4),v=n*e;
  el.textContent=(d?v.toFixed(d):Math.round(v).toLocaleString())+s;if(p<1)requestAnimationFrame(f)})(t0)}
function chat(){$$("#chat .m").forEach((m,i)=>setTimeout(()=>m.classList.add("show"),reduce?0:i*1100))}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;io.unobserve(el);
  el.classList.add("in");
  if(el.dataset.n)count(el);
  if(el.id==="chart")$$("i",el).forEach((b,i)=>setTimeout(()=>b.style.height=bars[i]+"%",i*90));
  if(el.id==="chat")chat();
}),{threshold:.3});
$$(".rv,[data-n],#chart,#chat").forEach(e=>io.observe(e));
