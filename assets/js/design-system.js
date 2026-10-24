const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Palette */
const colors = [["Void","#0A0C14","Page background"],["Slate","#131622","Raised surfaces"],["Hairline","#252A3B","Borders"],
  ["Mist","#8D94A8","Secondary text"],["Paper","#EBEEF5","Primary text"],["Ultraviolet","#7C5CFC","Actions, focus"],
  ["Ion","#2BE0F7","Progress, links"],["Mint","#2DD99A","Correct answers"],["Amber","#F9B93F","Warnings"],["Coral","#F2546B","Errors"]];
$("#palette").innerHTML = colors.map(([n,h,u]) =>
  `<div class="glass card" style="padding:12px"><div class="swatch" style="background:${h}"></div>
   <div style="font-weight:500;font-size:.875rem">${n}</div><div class="mono">${h}</div><div class="small" style="font-size:.75rem">${u}</div></div>`).join("");

/* Skeletons */
const skel = `<div class="glass card" style="display:grid;gap:16px"><div class="row" style="flex-wrap:nowrap">
  <div class="skel" style="width:36px;height:36px"></div><div style="flex:1;display:grid;gap:8px">
  <div class="skel" style="height:14px;width:65%"></div><div class="skel" style="height:12px;width:35%"></div></div></div>
  <div class="skel" style="height:6px;border-radius:99px"></div></div>`;
$("#skels").innerHTML = skel + skel;

/* Progress bars animate when scrolled into view */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { const i = $("i", e.target); i.style.width = i.dataset.w + "%"; io.unobserve(e.target); }
}), { threshold: .4 });
$$(".bar").forEach(b => io.observe(b));

/* Toasts */
const icons = { success: "i-ok", error: "i-warn", info: "i-info" };
function toast(tone, title, body = "") {
  const el = document.createElement("div");
  el.className = `toast glass t-${tone}`;
  el.innerHTML = `<svg class="icon"><use href="#${icons[tone]}"/></svg><div><p></p><span></span></div>
    <button class="x" aria-label="Dismiss"><svg class="icon"><use href="#i-x"/></svg></button>`;
  $("p", el).textContent = title; $("span", el).textContent = body;
  const close = () => { el.classList.add("out"); setTimeout(() => el.remove(), 250); };
  $(".x", el).onclick = close; setTimeout(close, 4000);
  $("#toasts").append(el);
}
$$("[data-toast]").forEach(b => b.onclick = () => toast(...b.dataset.toast.split("|")));

/* Modal */
const modal = $("#modal"); let lastFocus;
function openModal() { lastFocus = document.activeElement; modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); setTimeout(() => $("input", modal).focus(), 50); }
function closeModal() { modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); lastFocus && lastFocus.focus(); }
$$("[data-open=modal]").forEach(b => b.onclick = openModal);
$$("[data-close]").forEach(b => b.onclick = closeModal);
modal.addEventListener("click", e => e.target === modal && closeModal());
addEventListener("keydown", e => e.key === "Escape" && modal.classList.contains("open") && closeModal());

/* Loading demo */
function demo(btn) {
  btn.classList.add("loading");
  setTimeout(() => { btn.classList.remove("loading"); toast("success", "Quiz ready", "12 questions from Cell biology, week 4."); }, 1400);
}
$("#run").onclick = e => demo(e.currentTarget);
$("#go").onclick = e => { closeModal(); demo(e.currentTarget); };

/* Theme toggle (remembered only for this visit, dark first) */
$("#theme").onclick = () => {
  const r = document.documentElement, cur = r.dataset.theme || (matchMedia("(prefers-color-scheme:light)").matches ? "light" : "dark");
  r.dataset.theme = cur === "dark" ? "light" : "dark";
};
