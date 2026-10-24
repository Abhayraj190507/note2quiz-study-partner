const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ic = n => `<svg class="i"><use href="#${n}"/></svg>`;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const now = () => Date.now();
const delay = ms => new Promise(r => setTimeout(r, ms));
const STORE = "n2q-study-partner-v1";

const MODE_META = {
  general: { name: "General", color: "var(--primary)", icon: "sparkle" },
  physics: { name: "Physics", color: "#F9B93F", icon: "atom" },
  math: { name: "Maths", color: "#2DD99A", icon: "math" },
  chemistry: { name: "Chemistry", color: "#2BE0F7", icon: "atom" },
  biology: { name: "Biology", color: "#F2546B", icon: "brain" },
  history: { name: "History", color: "#E07B39", icon: "book" },
  programming: { name: "Coding", color: "#A855F7", icon: "code" },
  english: { name: "English", color: "#34D399", icon: "edit" }
};

const SUGGESTIONS = {
  general: [
    "Explain photosynthesis in simple steps",
    "I am stuck on Newton’s second law — help me",
    "Give a 5-question quiz on cell structure",
    "Compare mitosis and meiosis"
  ],
  physics: [
    "Why does a satellite not fall to Earth?",
    "Derive v² = u² + 2as with meaning of each term",
    "Doubt: is work done zero in uniform circular motion?",
    "Key formulas for kinematics, 1 page"
  ],
  math: [
    "Explain the quadratic formula with an example",
    "How do I integrate by parts?",
    "Doubt: why is 0.999… equal to 1?",
    "Give practice questions on derivatives"
  ],
  chemistry: [
    "Explain mole concept with a numerical",
    "Why do noble gases barely react?",
    "Balance: C₃H₈ + O₂ → CO₂ + H₂O",
    "Summarize periodic trends"
  ],
  biology: [
    "Walk me through the Calvin cycle",
    "Doubt: difference between DNA and RNA",
    "Make flashcards for enzymes",
    "Study tips for NEET biology"
  ],
  history: [
    "Causes of World War I in 5 points",
    "Compare French and Russian revolutions",
    "Timeline of the Indian independence movement",
    "How should I write a history long answer?"
  ],
  programming: [
    "Explain time complexity with examples",
    "Doubt: stack vs queue",
    "Write a Python function for binary search and explain it",
    "How does the event loop work in JavaScript?"
  ],
  english: [
    "Improve this thesis: social media helps students",
    "Explain metaphor vs simile with examples",
    "How do I structure a PEEL paragraph?",
    "Give 8 vocabulary words for exam essays"
  ]
};

const INLINE_FOLLOW = {
  general: ["Give a real-world example", "Make a 4-question quiz", "Simplify even more", "Show a mindmap outline"],
  physics: ["Show the formula sheet", "Work a numerical", "Common exam mistakes", "Relate this to energy"],
  math: ["Another example", "Show the proof", "Practice questions", "Where do students go wrong?"],
  chemistry: ["Show the equation", "A numerical please", "Link to periodic table", "Exam-style question"],
  biology: ["Draw it in words", "Definitions to memorise", "Compare related processes", "MCQ practice"],
  history: ["Add dates", "Cause vs consequence", "How to write this in 8 marks", "A short timeline"],
  programming: ["Show code", "Complexity analysis", "A tiny exercise", "Common bugs"],
  english: ["Give a model paragraph", "More examples", "Tone and vocabulary", "Mark-scheme tips"]
};

const CMD_HINT = {
  explain: "Explain this topic clearly, then go deeper.",
  doubt: "Solve this doubt step by step.",
  summarize: "Summarise the topic into tight bullets.",
  quiz: "Generate short quiz questions with answers.",
  examples: "Give concrete real-world examples.",
  formula: "List the key formulas and what each symbol means.",
  compare: "Compare the two ideas in a table-like structure.",
  tips: "Give practical study tips for this topic.",
  flashcards: "Turn this into Q/A flashcards.",
  mindmap: "Give a mindmap outline of the topic."
};

let toastT;
function toast(msg, kind = "info") {
  const box = $("#toasts");
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span class="toast-icon toast-${kind === "ok" ? "ok" : "info"}"></span><span>${esc(msg)}</span>`;
  box.appendChild(el);
  clearTimeout(toastT);
  toastT = setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 280);
  }, 2400);
}

function md(src) {
  let t = esc(src);
  t = t.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c.trim()}</code></pre>`);
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(^|\n)### (.+)/g, "$1<h4>$2</h4>");
  t = t.replace(/(^|\n)## (.+)/g, "$1<h3>$2</h3>");
  t = t.replace(/(^|\n)- (.+)/g, "$1<li>$2</li>");
  t = t.replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  t = t.replace(/(^|\n)(\d+)\. (.+)/g, "$1<li>$3</li>");
  t = t.split(/\n{2,}/).map(p => {
    if (/^<(h3|h4|ul|ol|pre|blockquote|div)/.test(p.trim())) return p;
    return `<p>${p.replace(/\n/g, "<br>")}</p>`;
  }).join("");
  return t;
}

function parseCommand(text) {
  const m = text.match(/^\/(\w+)\s*([\s\S]*)$/);
  if (!m) return { cmd: null, body: text.trim() };
  const cmd = m[1].toLowerCase();
  if (!(cmd in CMD_HINT) && cmd !== "flashcards" && cmd !== "mindmap") return { cmd: null, body: text.trim() };
  return { cmd, body: (m[2] || "").trim() };
}

function guessTopics(text, mode) {
  const stop = new Set("the a an of and or to in on for with from this that what why how my me i please explain doubt summarize quiz give".split(" "));
  const words = text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(w => w.length > 3 && !stop.has(w));
  const uniq = [...new Set(words)].slice(0, 4);
  if (!uniq.length) uniq.push(MODE_META[mode]?.name || "Study");
  return uniq.map(w => w[0].toUpperCase() + w.slice(1));
}

function stepsBox(title, steps) {
  return `<div class="answer-box"><div class="answer-box-title">${esc(title)}</div><div class="answer-steps">${
    steps.map((s, i) => `<div class="answer-step"><span class="step-num">${i + 1}</span><div class="step-content">${s}</div></div>`).join("")
  }</div></div>`;
}

function sourcesFor(mode, topic) {
  const banks = {
    physics: ["NCERT Physics XI", "Khan Academy · Motion", "Your notes · Mechanics"],
    math: ["NCERT Maths", "Paul’s Online Notes", "Your notes · Calculus"],
    chemistry: ["NCERT Chemistry", "IUPAC Gold Book", "Your notes · Stoichiometry"],
    biology: ["NCERT Biology", "Your notes · Photosynthesis", "OpenStax Biology"],
    history: ["NCERT History", "Your notes · Modern India", "BBC Bitesize"],
    programming: ["MDN Web Docs", "Python docs", "Your notes · DSA"],
    english: ["Purdue OWL", "Cambridge Writing", "Your notes · Essays"],
    general: ["Your uploaded notes", "NCERT companion", "Note2Quiz knowledge"]
  };
  return (banks[mode] || banks.general).map(s => ({ label: s, topic }));
}

function buildReply({ text, mode, cmd, history }) {
  const topic = (parseCommand(text).body || text).replace(/^\/\w+\s*/, "").trim() || MODE_META[mode].name;
  const expert = MODE_META[mode].name;
  const lastUser = [...history].reverse().find(m => m.role === "user");
  const ctx = lastUser && lastUser.text !== text ? ` Building on: “${lastUser.text.slice(0, 80)}”.` : "";
  const command = cmd || parseCommand(text).cmd;
  const topics = guessTopics(topic + " " + text, mode);

  const lead = `<p>I’m in <strong>${esc(expert)}</strong> mode.${ctx}</p>`;

  const byCmd = {
    explain: () => lead +
      `<h3>${esc(topic)}</h3>` +
      `<p><strong>In one line:</strong> ${esc(topic)} is easiest if you split it into “what it is”, “why it happens”, and “how you use it in a question”.</p>` +
      stepsBox("Explanation", [
        `<strong>Intuition.</strong> Picture the idea in the real world first, then attach the school definition.`,
        `<strong>Mechanism.</strong> Name the parts, the sequence, and what each part changes.`,
        `<strong>Exam use.</strong> Write the definition, one diagram/equation, and one example. That trio scores well.`
      ]) +
      `<h4>Deeper pass</h4><p>Once the skeleton is clear, add edge cases (what happens if a variable is zero, reversed, or missing). That is usually the 1-mark “why” they hide in papers.</p>`,
    doubt: () => lead +
      `<h3>Doubt solved: ${esc(topic)}</h3>` +
      `<p>Let’s treat this as a stuck step, not a whole chapter.</p>` +
      stepsBox("How to unstick", [
        `Restate the question in your own words so the unknown is obvious.`,
        `List what you already know (given values, definitions, a formula).`,
        `Do the smallest next legal step. Check units / signs / grammar.`,
        `If two answers fight, the conflict is usually a hidden assumption — name it.`
      ]) +
      `<blockquote>If this doubt came from a numerical, plug a tiny number (2 or 10) and see if the result still makes sense.</blockquote>`,
    summarize: () => lead +
      `<h3>Summary · ${esc(topic)}</h3><ul>` +
      `<li><strong>Core idea:</strong> what the concept is trying to conserve, transform, or explain.</li>` +
      `<li><strong>Must-know terms:</strong> 4–6 words you should be able to define cold.</li>` +
      `<li><strong>Workhorse tool:</strong> the equation, timeline, or structure you always reach for.</li>` +
      `<li><strong>Typical trap:</strong> mixing cause with correlation, or mixing similar-looking terms.</li>` +
      `<li><strong>1-minute recap:</strong> say it out loud without notes; if you stall, that gap is your next card.</li></ul>`,
    quiz: () => lead +
      `<h3>Mini quiz · ${esc(topic)}</h3>` +
      `<ol><li><strong>Recall:</strong> Define ${esc(topic)} in one sentence. <em>Answer:</em> a precise school-book definition plus one example.</li>` +
      `<li><strong>Apply:</strong> What changes if one key variable is doubled?</li>` +
      `<li><strong>True/False:</strong> “The name of the idea is enough; you don’t need conditions.” <em>False</em> — conditions carry marks.</li>` +
      `<li><strong>Compare:</strong> How is this different from the closest cousin concept?</li>` +
      `<li><strong>Explain:</strong> Teach it to a friend in 40 seconds.</li></ol>` +
      `<p>Want these as a full Note2Quiz paper? Open <a href="quiz.html">Quizzes</a>.</p>`,
    examples: () => lead +
      `<h3>Examples · ${esc(topic)}</h3><ul>` +
      `<li><strong>Everyday:</strong> a kitchen / commute / phone analogue of the same structure.</li>` +
      `<li><strong>Lab / classroom:</strong> the demo a teacher would actually run.</li>` +
      `<li><strong>Exam:</strong> a 3-mark “explain with an example” stem using this topic.</li>` +
      `<li><strong>Counter-example:</strong> a case where the naive version fails — that is where distinction marks live.</li></ul>`,
    formula: () => lead +
      `<h3>Formula sheet · ${esc(topic)}</h3>` +
      `<pre><code>quantity  =  related quantities, with units\nΔ(change) = final − initial\nrate      = change / time</code></pre>` +
      `<p>For each symbol: name it, give SI units, and say whether it is a vector. If ${esc(expert)} is not quantitative, treat “formula” as the <strong>sentence pattern</strong> markers want (PEEL, cause → event → consequence).</p>`,
    compare: () => lead +
      `<h3>Compare · ${esc(topic)}</h3>` +
      `<ul><li><strong>Same:</strong> shared purpose or starting point.</li>` +
      `<li><strong>Different:</strong> process, products, conditions, or time scale.</li>` +
      `<li><strong>Memory hook:</strong> one contrast word (e.g. split vs copy, stack vs queue, kinetic vs potential).</li>` +
      `<li><strong>When to use which:</strong> the exam trigger phrase that picks side A vs side B.</li></ul>`,
    tips: () => lead +
      `<h3>Study tips · ${esc(topic)}</h3><ul>` +
      `<li>Active recall: close notes, write 5 bullets, then check gaps.</li>` +
      `<li>Interleave: mix this with a neighbouring topic so you practise choosing the right tool.</li>` +
      `<li>Past paper last: only after you can teach the definition without peeking.</li>` +
      `<li>Sleep on it: one short recap tomorrow beats rereading tonight.</li></ul>`,
    flashcards: () => lead +
      `<h3>Flashcards · ${esc(topic)}</h3><ul>` +
      `<li><strong>Q:</strong> What is ${esc(topic)}? <strong>A:</strong> definition + one example.</li>` +
      `<li><strong>Q:</strong> Name the parts / steps. <strong>A:</strong> ordered list.</li>` +
      `<li><strong>Q:</strong> When does it fail / not apply?</li>` +
      `<li><strong>Q:</strong> Closest mix-up concept, and the difference.</li>` +
      `<li><strong>Q:</strong> One numerical or 3-mark explain question.</li></ul>`,
    mindmap: () => lead +
      `<h3>Mindmap · ${esc(topic)}</h3><ul>` +
      `<li><strong>Centre:</strong> ${esc(topic)}</li>` +
      `<li><strong>Branch 1 — Definition</strong> → key terms → conditions</li>` +
      `<li><strong>Branch 2 — Process / proof</strong> → steps → diagram cues</li>` +
      `<li><strong>Branch 3 — Applications</strong> → examples → exam stems</li>` +
      `<li><strong>Branch 4 — Traps</strong> → mix-ups → “always mention”</li></ul>`
  };

  let html;
  if (command && byCmd[command]) html = byCmd[command]();
  else {
    html = lead +
      `<p>Here’s a study-partner take on <strong>${esc(topic)}</strong>.</p>` +
      stepsBox("Clear path", [
        `<strong>Define it.</strong> One sentence a classmate would accept.`,
        `<strong>Unpack it.</strong> Parts, order, and the “so what”.`,
        `<strong>Use it.</strong> A tiny example, then a harder exam-style twist.`
      ]) +
      `<p>Try a quick command: <code>/doubt</code>, <code>/explain</code>, <code>/quiz</code>, or <code>/tips</code> — or switch expert mode above.</p>`;
  }

  if (state.attached) {
    html += `<p class="msg-time">Using attached file: <strong>${esc(state.attached.name)}</strong> as extra context (frontend preview — send this file with your API call).</p>`;
  }

  return {
    html,
    sources: sourcesFor(mode, topic),
    topics,
    followups: INLINE_FOLLOW[mode] || INLINE_FOLLOW.general
  };
}

/* Swap this for a real backend. Keep the return shape:
   { html, sources:[{label}], topics:[string], followups:[string] } */
async function askStudyPartner(payload) {
  await delay(420 + Math.random() * 380);
  return buildReply(payload);
}

const state = {
  mode: "general",
  chats: [],
  currentId: null,
  sessionStart: now(),
  topics: new Set(),
  attached: null,
  busy: false,
  paletteIndex: 0
};

function loadStore() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || "null");
    if (raw?.chats) {
      state.chats = raw.chats;
      state.currentId = raw.currentId || null;
    }
  } catch { /* ignore */ }
}
function saveStore() {
  localStorage.setItem(STORE, JSON.stringify({ chats: state.chats, currentId: state.currentId }));
}

function currentChat() {
  return state.chats.find(c => c.id === state.currentId) || null;
}
function ensureChat(seedTitle) {
  let c = currentChat();
  if (c) return c;
  c = { id: uid(), title: seedTitle || "New chat", mode: state.mode, updated: now(), messages: [] };
  state.chats.unshift(c);
  state.currentId = c.id;
  saveStore();
  return c;
}

function setMode(mode) {
  if (!MODE_META[mode]) return;
  state.mode = mode;
  const meta = MODE_META[mode];
  $("#currentModeName").textContent = meta.name;
  const badge = $("#currentModeBadge");
  badge.style.background = `color-mix(in srgb, ${meta.color} 18%, transparent)`;
  badge.style.color = meta.color;
  badge.style.borderColor = `color-mix(in srgb, ${meta.color} 30%, transparent)`;
  $$(".mode-card").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  $$(".ims-btn").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  renderSuggestions();
}

function renderSuggestions() {
  const list = SUGGESTIONS[state.mode] || SUGGESTIONS.general;
  $("#suggestionsGrid").innerHTML = list.map(q =>
    `<button class="suggestion-btn" data-q="${esc(q)}"><span class="suggestion-icon">${ic("sparkle")}</span><span>${esc(q)}</span></button>`
  ).join("");
  $$("#suggestionsGrid .suggestion-btn").forEach(b => b.onclick = () => sendMessage(b.dataset.q));
}

function renderInline(followups) {
  const el = $("#inlineSuggestions");
  if (!followups?.length || $("#welcomeState").style.display !== "none") {
    el.classList.add("hidden");
    return;
  }
  el.classList.remove("hidden");
  el.innerHTML = followups.map(q => `<button class="inline-sug-btn" data-q="${esc(q)}">${esc(q)}</button>`).join("");
  $$(".inline-sug-btn", el).forEach(b => b.onclick = () => sendMessage(b.dataset.q));
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function dayLabel(ts) {
  const d = new Date(ts), t = new Date();
  const same = d.toDateString() === t.toDateString();
  const y = new Date(t); y.setDate(t.getDate() - 1);
  if (same) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function renderHistory() {
  const list = $("#historyList");
  if (!state.chats.length) {
    list.innerHTML = `<p class="hp-empty">No chats yet. Start one — it will appear here.</p>`;
    return;
  }
  const groups = {};
  state.chats.forEach(c => {
    const k = dayLabel(c.updated);
    (groups[k] ||= []).push(c);
  });
  list.innerHTML = Object.entries(groups).map(([label, items]) =>
    `<div class="hp-date-label">${esc(label)}</div>` + items.map(c => `
      <div class="hp-item ${c.id === state.currentId ? "active" : ""}" data-id="${c.id}">
        <span class="hp-item-icon">${ic("chat")}</span>
        <div class="hp-item-info">
          <div class="hp-item-title">${esc(c.title)}</div>
          <div class="hp-item-meta">${esc(MODE_META[c.mode]?.name || c.mode)} · ${c.messages.length} msgs</div>
        </div>
        <button class="btn-icon hp-del" data-del="${c.id}" title="Delete">${ic("trash")}</button>
      </div>`).join("")
  ).join("");
  $$(".hp-item", list).forEach(el => {
    el.onclick = e => {
      if (e.target.closest("[data-del]")) return;
      openChat(el.dataset.id);
    };
  });
  $$("[data-del]", list).forEach(b => b.onclick = e => {
    e.stopPropagation();
    deleteChat(b.dataset.del);
  });
}

function openChat(id) {
  const c = state.chats.find(x => x.id === id);
  if (!c) return;
  state.currentId = id;
  saveStore();
  setMode(c.mode);
  $("#welcomeState").style.display = c.messages.length ? "none" : "";
  $("#messages").innerHTML = "";
  c.messages.forEach(m => appendMsg(m, false));
  updateStats();
  renderHistory();
  const lastAi = [...c.messages].reverse().find(m => m.role === "ai");
  renderInline(lastAi?.followups);
  $("#chatArea").scrollTop = $("#chatArea").scrollHeight;
}

function deleteChat(id) {
  state.chats = state.chats.filter(c => c.id !== id);
  if (state.currentId === id) {
    state.currentId = state.chats[0]?.id || null;
    if (state.currentId) openChat(state.currentId);
    else newChat();
  }
  saveStore();
  renderHistory();
  toast("Chat deleted", "ok");
}

function newChat() {
  state.currentId = null;
  state.topics = new Set();
  $("#welcomeState").style.display = "";
  $("#messages").innerHTML = "";
  $("#inlineSuggestions").classList.add("hidden");
  updateStats();
  renderHistory();
  $("#chatInput").focus();
}

function updateStats() {
  const c = currentChat();
  const n = c ? c.messages.length : 0;
  $("#msgCount").textContent = n;
  const mins = Math.max(0, Math.round((now() - state.sessionStart) / 60000));
  $("#sessionTime").textContent = mins < 1 ? "<1m" : mins + "m";
  $("#topicsCount").textContent = state.topics.size;
  const sec = $("#topicTagsSection");
  if (state.topics.size) {
    sec.style.display = "";
    $("#topicTags").innerHTML = [...state.topics].map(t => `<span class="topic-tag">${esc(t)}</span>`).join("");
  } else sec.style.display = "none";
}

function appendMsg(m, animate = true) {
  const wrap = document.createElement("div");
  wrap.className = `msg ${m.role === "user" ? "user-msg" : "ai-msg"}`;
  if (!animate) wrap.style.animation = "none";
  const meta = MODE_META[m.mode || state.mode];
  const avatar = m.role === "user"
    ? `<div class="msg-avatar user"></div>`
    : `<div class="msg-avatar ai">${ic("sparkle")}</div>`;
  const sources = (m.sources || []).length
    ? `<div class="sources">${m.sources.map(s => `<span class="source-pill">${esc(s.label)}</span>`).join("")}</div>`
    : "";
  const actions = m.role === "ai"
    ? `<div class="msg-actions">
        <button class="msg-action-btn" data-copy>${ic("copy")} Copy</button>
        <button class="msg-action-btn" data-regen>${ic("refresh")} Regenerate</button>
        <button class="msg-action-btn" data-cards>${ic("cards")} Make flashcards</button>
      </div>`
    : `<div class="msg-actions"><button class="msg-action-btn" data-copy>${ic("copy")} Copy</button></div>`;
  wrap.innerHTML = `${avatar}<div class="msg-body">
    <div class="msg-header">
      <span class="msg-name">${m.role === "user" ? "You" : "Study Partner"}</span>
      ${m.role === "ai" ? `<span class="msg-mode-tag">${esc(meta.name)}</span>` : ""}
      <span class="msg-time">${fmtTime(m.ts)}</span>
    </div>
    <div class="msg-content">${m.role === "user" ? esc(m.text).replace(/\n/g, "<br>") : m.html}</div>
    ${sources}${actions}
  </div>`;
  $("#messages").appendChild(wrap);
  wrap.querySelector("[data-copy]")?.addEventListener("click", () => {
    const plain = m.text || wrap.querySelector(".msg-content").innerText;
    navigator.clipboard.writeText(plain).then(() => toast("Copied", "ok"));
  });
  wrap.querySelector("[data-cards]")?.addEventListener("click", () => {
    const chat = currentChat();
    const u = [...(chat?.messages || [])].reverse().find(x => x.role === "user");
    const topic = (u?.text || "").replace(/^\/\w+\s*/, "").trim();
    try {
      localStorage.setItem("n2q-flashcards-inbox", JSON.stringify({ title: topic.slice(0, 40), topic, cat: MODE_META[m.mode || state.mode]?.name }));
    } catch { /* ignore */ }
    location.href = "flashcards.html?import=1";
  });
  wrap.querySelector("[data-regen]")?.addEventListener("click", () => {
    const chat = currentChat();
    const lastUser = [...(chat?.messages || [])].reverse().find(x => x.role === "user");
    if (lastUser) sendMessage(lastUser.text, { regenerate: true });
  });
}

function showTyping(on) {
  $("#typingIndicator").classList.toggle("hidden", !on);
  if (on) $("#chatArea").scrollTop = $("#chatArea").scrollHeight;
}

async function sendMessage(raw, { regenerate = false } = {}) {
  const text = (raw ?? $("#chatInput").value).trim();
  if (!text || state.busy) return;
  const { cmd } = parseCommand(text);
  $("#chatInput").value = "";
  autosize();
  hidePalette();

  $("#welcomeState").style.display = "none";
  const chat = ensureChat(text.replace(/^\/\w+\s*/, "").slice(0, 42) || "New chat");
  chat.mode = state.mode;
  chat.updated = now();
  if (!regenerate) {
    const userMsg = { role: "user", text, ts: now(), mode: state.mode };
    chat.messages.push(userMsg);
    appendMsg(userMsg);
  } else {
    if (chat.messages.at(-1)?.role === "ai") chat.messages.pop();
    $("#messages").querySelector(".ai-msg:last-of-type")?.remove();
  }
  saveStore();
  renderHistory();
  updateStats();

  state.busy = true;
  $("#sendBtn").disabled = true;
  showTyping(true);
  try {
    const payload = {
      text,
      mode: state.mode,
      cmd,
      history: chat.messages.map(m => ({ role: m.role, text: m.text || "" })),
      attachment: state.attached
    };
    const reply = await askStudyPartner(payload);
    showTyping(false);
    const aiMsg = {
      role: "ai",
      html: reply.html,
      text: $("#messages") ? undefined : "",
      ts: now(),
      mode: state.mode,
      sources: reply.sources || [],
      followups: reply.followups || []
    };
    const tmp = document.createElement("div");
    tmp.innerHTML = reply.html;
    aiMsg.text = tmp.innerText.trim();
    chat.messages.push(aiMsg);
    chat.updated = now();
    (reply.topics || []).forEach(t => state.topics.add(t));
    saveStore();
    appendMsg(aiMsg);
    renderInline(reply.followups);
    renderHistory();
    updateStats();
    $("#chatArea").scrollTop = $("#chatArea").scrollHeight;
  } catch (err) {
    showTyping(false);
    toast("Could not reach the study partner. Try again.");
  } finally {
    state.busy = false;
    $("#sendBtn").disabled = false;
    $("#chatInput").focus();
  }
}

function autosize() {
  const ta = $("#chatInput");
  ta.style.height = "auto";
  ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
}

function paletteItems() {
  return $$("#cmdPalette .cmd-item");
}
function showPalette() {
  $("#cmdPalette").classList.remove("hidden");
  state.paletteIndex = 0;
  highlightPalette();
}
function hidePalette() {
  $("#cmdPalette").classList.add("hidden");
}
function highlightPalette() {
  paletteItems().forEach((el, i) => el.style.background = i === state.paletteIndex ? "var(--hover2)" : "");
}

function applyCommand(prefix) {
  $("#chatInput").value = prefix;
  hidePalette();
  $("#chatInput").focus();
  autosize();
}

$("#theme").onclick = () => {
  const r = document.documentElement;
  const cur = r.dataset.theme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  r.dataset.theme = cur === "dark" ? "light" : "dark";
};

$("#historyToggle").onclick = () => $("#historyPanel").classList.toggle("open");
$("#historyClose").onclick = () => $("#historyPanel").classList.remove("open");
$("#newChatBtn").onclick = () => { newChat(); toast("New chat", "ok"); };
$("#clearChat").onclick = () => {
  const c = currentChat();
  if (!c) { newChat(); return; }
  c.messages = [];
  saveStore();
  $("#messages").innerHTML = "";
  $("#welcomeState").style.display = "";
  $("#inlineSuggestions").classList.add("hidden");
  updateStats();
  toast("Chat cleared", "ok");
};

$$(".mode-card").forEach(b => b.onclick = () => setMode(b.dataset.mode));
$$(".ims-btn").forEach(b => b.onclick = () => setMode(b.dataset.mode));
$$(".qc-btn").forEach(b => b.onclick = () => {
  const cmd = b.dataset.cmd;
  applyCommand(`/${cmd} `);
  toast(`${CMD_HINT[cmd] || "Command ready"}`);
});
$$("#cmdPalette .cmd-item").forEach(el => {
  el.onclick = () => applyCommand(el.dataset.cmd);
});

$("#sendBtn").onclick = () => sendMessage();
$("#chatInput").addEventListener("input", () => {
  autosize();
  const v = $("#chatInput").value;
  if (v === "/" || /^\/[a-z]*$/.test(v)) showPalette();
  else hidePalette();
});
$("#chatInput").addEventListener("keydown", e => {
  const open = !$("#cmdPalette").classList.contains("hidden");
  if (open) {
    const items = paletteItems();
    if (e.key === "ArrowDown") { e.preventDefault(); state.paletteIndex = (state.paletteIndex + 1) % items.length; highlightPalette(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); state.paletteIndex = (state.paletteIndex - 1 + items.length) % items.length; highlightPalette(); }
    else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); applyCommand(items[state.paletteIndex].dataset.cmd); }
    else if (e.key === "Escape") hidePalette();
    return;
  }
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendMessage(); }
  else if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = ".txt,.md,.pdf,.png,.jpg,.jpeg,.webp";
fileInput.hidden = true;
document.body.appendChild(fileInput);
$("#attachBtn").onclick = () => fileInput.click();
fileInput.onchange = () => {
  const f = fileInput.files?.[0];
  if (!f) return;
  state.attached = { name: f.name, type: f.type, size: f.size };
  toast(`Attached ${f.name}`, "ok");
  if (f.type.startsWith("text/") || /\.(txt|md)$/i.test(f.name)) {
    const reader = new FileReader();
    reader.onload = () => { state.attached.text = String(reader.result).slice(0, 8000); };
    reader.readAsText(f);
  }
};

$("#micBtn").onclick = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast("Voice input is not supported in this browser"); return; }
  const rec = new SR();
  rec.lang = "en-IN";
  rec.onresult = e => {
    const said = e.results[0][0].transcript;
    $("#chatInput").value = ($("#chatInput").value + " " + said).trim();
    autosize();
  };
  rec.onerror = () => toast("Mic unavailable");
  rec.start();
  toast("Listening…");
};

setInterval(updateStats, 30000);

loadStore();
setMode("general");
renderSuggestions();
renderHistory();
if (state.currentId && currentChat()?.messages.length) openChat(state.currentId);
else newChat();

const params = new URLSearchParams(location.search);
if (params.get("mode")) setMode(params.get("mode"));
if (params.get("q")) sendMessage(params.get("q"));

updateStats();
