"""
AI layer. Every function tries Claude (when ANTHROPIC_API_KEY is set) and falls back to a deterministic,
offline generator built from the note text, so the app works end to end without any key.
"""
import json
import random
import re
import urllib.error
import urllib.request
from collections import Counter

from flask import current_app

STOP = set("""a about above after again all also am an and any are as at be because been before being below between both but by can
could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its
just me more most my no nor not of off on once only or other our out over own same she should so some such than that the their them
then there these they this those through to too under until up very was we were what when where which while who whom why will with
would you your""".split())
WORD = re.compile(r"[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'\-]{2,}")


# ======================= Claude call =======================
def enabled():
    return bool(current_app.config["ANTHROPIC_API_KEY"])


def _claude(system, user, max_tokens=3000):
    cfg = current_app.config
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps({"model": cfg["ANTHROPIC_MODEL"], "max_tokens": max_tokens, "system": system,
                         "messages": [{"role": "user", "content": user}]}).encode(),
        headers={"content-type": "application/json", "x-api-key": cfg["ANTHROPIC_API_KEY"], "anthropic-version": "2023-06-01"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.load(r)
        return "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")
    except (urllib.error.URLError, TimeoutError, ValueError) as e:
        current_app.logger.warning("Claude call failed, using offline generator: %s", e)
        return None


def _json(system, user, max_tokens=3000):
    if not enabled():
        return None
    out = _claude(system + "\nReply with a single valid JSON value and nothing else.", user, max_tokens)
    if not out:
        return None
    out = re.sub(r"^```(?:json)?|```$", "", out.strip(), flags=re.M).strip()
    try:
        return json.loads(out)
    except ValueError:
        m = re.search(r"[\[{].*[\]}]", out, re.S)
        try:
            return json.loads(m.group(0)) if m else None
        except ValueError:
            return None


def _clip(text, n=14000):
    return text if len(text) <= n else text[:n]


# ======================= text helpers =======================
def sentences(text):
    parts = re.split(r"(?<=[.!?])\s+|\n+", text)
    return [p.strip(" -•*\t") for p in parts if 25 <= len(p.strip()) <= 320]


def keywords(text, n=8):
    c = Counter(w.lower() for w in WORD.findall(text) if w.lower() not in STOP and len(w) > 4)
    return [w for w, _ in c.most_common(n)]


DEF_RE = re.compile(r"^(?P<t>[A-Z][\w\-\s\(\)/’']{1,45}?)\s+(?:is|are|refers to|means|is defined as|are defined as)\s+(?P<d>.{15,240}?)[.;]?$")
COLON_RE = re.compile(r"^(?P<t>[A-Z][\w\-\s\(\)/’']{1,40}):\s+(?P<d>.{15,240}?)[.;]?$")


def find_definitions(text):
    out, seen = [], set()
    for line in re.split(r"(?<=[.!?])\s+|\n+", text):
        line = line.strip(" -•*\t")
        m = DEF_RE.match(line) or COLON_RE.match(line)
        if not m:
            continue
        term = re.sub(r"^(The|A|An)\s+", "", m["t"].strip())
        if len(term.split()) > 5 or term.lower() in seen:
            continue
        seen.add(term.lower())
        out.append({"term": term, "definition": m["d"].strip(), "sentence": line})
    return out


def find_formulas(text):
    out = []
    for line in text.splitlines():
        s = line.strip(" -•*\t")
        if 3 <= len(s) <= 90 and ("=" in s or "∫" in s or "Σ" in s) and not re.search(r"[a-z]{4,}\s+[a-z]{4,}\s+[a-z]{4,}", s):
            name, _, expr = s.partition(":")
            out.append([name.strip(), expr.strip()] if expr.strip() else ["Formula", s])
    return out[:12]


def _rank_sentences(text, k):
    sents = sentences(text)
    freq = Counter(w.lower() for w in WORD.findall(text) if w.lower() not in STOP)
    scored = sorted(range(len(sents)), key=lambda i: -sum(freq[w.lower()] for w in WORD.findall(sents[i])) / (len(sents[i]) ** 0.5))
    return [sents[i] for i in sorted(scored[:k])]


# ======================= analysis =======================
def analyze(text, name=""):
    text = _clip(text)
    data = _json(
        "You analyse student notes. Return {\"summary\": string (2-3 sentences), \"points\": [3-6 short strings], "
        "\"topics\": [up to 6 strings], \"definitions\": [[term, definition]], \"formulas\": [[name, expression]]}.",
        f"Notes titled {name!r}:\n\n{text}")
    if isinstance(data, dict) and data.get("summary"):
        return {"summary": str(data["summary"]), "points": [str(p) for p in data.get("points", [])][:8],
                "topics": [str(t) for t in data.get("topics", [])][:8],
                "definitions": [list(map(str, d))[:2] for d in data.get("definitions", []) if isinstance(d, list) and len(d) >= 2][:20],
                "formulas": [list(map(str, f))[:2] for f in data.get("formulas", []) if isinstance(f, list) and len(f) >= 2][:12]}
    top = _rank_sentences(text, 3)
    defs = find_definitions(text)
    return {"summary": " ".join(top)[:600] or "No readable text was found.",
            "points": _rank_sentences(text, 5),
            "topics": [k.title() for k in keywords(text, 6)],
            "definitions": [[d["term"], d["definition"]] for d in defs[:20]],
            "formulas": find_formulas(text)}


# ======================= quiz =======================
def _blank(sentence, word):
    return re.sub(re.escape(word), "___", sentence, count=1, flags=re.I)


def _offline_quiz(text, count, types, topics):
    rnd = random.Random(hash(text) & 0xFFFF)
    defs = find_definitions(text)
    pool_terms = [d["term"] for d in defs]
    topic = lambda i: topics[i % len(topics)] if topics else "General"
    items = []
    for i, d in enumerate(defs):
        kinds = [k for k in ("m", "t", "f") if k in types] or ["m"]
        k = kinds[i % len(kinds)]
        if k == "m" and len(pool_terms) >= 4:
            opts = rnd.sample([t for t in pool_terms if t != d["term"]], 3) + [d["term"]]
            rnd.shuffle(opts)
            items.append({"t": "m", "q": f"Which term matches this description: “{d['definition']}”?", "o": opts,
                          "a": opts.index(d["term"]), "topic": topic(i), "why": d["sentence"]})
        elif k == "t" and len(defs) > 1:
            if i % 2:
                other = defs[(i + 1) % len(defs)]
                items.append({"t": "t", "q": f"{d['term']} means: {other['definition']}", "a": False, "topic": topic(i),
                              "why": f"Not quite. {d['sentence']}"})
            else:
                items.append({"t": "t", "q": d["sentence"].rstrip("."), "a": True, "topic": topic(i), "why": d["sentence"]})
        else:
            items.append({"t": "f", "q": _blank(d["sentence"], d["term"]), "a": d["term"].lower(), "topic": topic(i), "why": d["sentence"]})
    # top up with cloze questions from key sentences
    for s in _rank_sentences(text, max(count * 2, 6)):
        if len(items) >= count * 2:
            break
        kws = [w for w in WORD.findall(s) if w.lower() not in STOP and len(w) > 5]
        if kws and not any(s == it["why"] for it in items):
            w = max(kws, key=len)
            items.append({"t": "f", "q": _blank(s, w), "a": w.lower(), "topic": topic(len(items)), "why": s})
    rnd.shuffle(items)
    return items[:count]


def make_quiz(text, *, count=6, types=("m", "t", "f"), difficulty="medium", topics=()):
    data = _json(
        "You write quizzes from student notes. Return a JSON array of questions. Each: "
        "{\"t\":\"m\"|\"t\"|\"f\",\"q\":string,\"o\":[4 options] (only for m),\"a\": index for m, boolean for t, lowercase answer string for f,"
        "\"topic\":string,\"why\":one-sentence explanation}. For f questions put ___ where the answer goes and keep the answer to 1-3 words. "
        "Only ask about facts present in the notes.",
        f"Write {count} questions, difficulty {difficulty}, types allowed {list(types)}.\n\nNotes:\n{_clip(text)}")
    if isinstance(data, list):
        good = []
        for q in data:
            try:
                if q["t"] not in types or not q["q"] or not q["why"]:
                    continue
                if q["t"] == "m" and not (isinstance(q["o"], list) and len(q["o"]) == 4 and isinstance(q["a"], int) and 0 <= q["a"] < 4):
                    continue
                if q["t"] == "t" and not isinstance(q["a"], bool):
                    continue
                if q["t"] == "f":
                    q["a"] = str(q["a"]).strip().lower()
                good.append({k: q[k] for k in ("t", "q", "a", "why") + (("o",) if q["t"] == "m" else ())} | {"topic": str(q.get("topic") or "General")})
            except (KeyError, TypeError):
                continue
        if good:
            return good[:count]
    return _offline_quiz(text, count, set(types), list(topics))


# ======================= flashcards =======================
def make_cards(text, count=10):
    data = _json("You write flashcards from student notes. Return [{\"q\":string,\"a\":string}] with short, self-contained questions.",
                 f"Write up to {count} flashcards.\n\n{_clip(text)}")
    if isinstance(data, list):
        cards = [{"q": str(c["q"]).strip(), "a": str(c["a"]).strip()} for c in data if isinstance(c, dict) and c.get("q") and c.get("a")]
        if cards:
            return cards[:count]
    cards = [{"q": f"What is {d['term']}?" if not d["term"].endswith("s") else f"What are {d['term']}?", "a": d["definition"][0].upper() + d["definition"][1:]}
             for d in find_definitions(text)]
    for name, expr in find_formulas(text):
        cards.append({"q": f"Write the formula for {name.lower()}." if name != "Formula" else "Complete the formula.", "a": expr or name})
    for s in _rank_sentences(text, count):
        if len(cards) >= count:
            break
        kws = [w for w in WORD.findall(s) if w.lower() not in STOP and len(w) > 5]
        if kws:
            w = max(kws, key=len)
            cards.append({"q": _blank(s, w), "a": w})
    return cards[:count]


# ======================= retrieval + chat =======================
def chunk(text, size=700):
    out, cur = [], ""
    for para in re.split(r"\n{2,}|(?<=[.!?])\s+(?=[A-Z])", text):
        if len(cur) + len(para) > size and cur:
            out.append(cur.strip()); cur = ""
        cur += para + " "
    if cur.strip():
        out.append(cur.strip())
    return out


def retrieve(query, notes, k=4):
    """notes: iterable of (name, text). Returns [(source_label, chunk)] ranked by keyword overlap."""
    q = {w.lower() for w in WORD.findall(query) if w.lower() not in STOP}
    scored = []
    for name, text in notes:
        for i, c in enumerate(chunk(text)):
            words = Counter(w.lower() for w in WORD.findall(c))
            score = sum(1 + min(words[w], 3) * 0.3 for w in q if w in words)
            if score:
                scored.append((score, f"{name}, section {i + 1}", c))
    scored.sort(key=lambda x: -x[0])
    return [(s, c) for _, s, c in scored[:k]]


LEAD = {"general": "", "doubt": "Let’s clear this up. ", "explain": "Here’s the idea step by step. ",
        "expert": "Here’s how an examiner would look at it. "}
MODE_RULES = {
    "general": "Answer helpfully and concisely.",
    "doubt": "The student is stuck. Find the likely misunderstanding and fix it in plain words.",
    "explain": "Teach the topic from first principles with a simple example, in short steps.",
    "expert": "Act as a subject expert and exam coach: marking criteria, common mistakes, memory tricks.",
}


def chat(mode, message, history, contexts):
    ctx = "\n\n".join(f"[{s}]\n{c}" for s, c in contexts)
    system = ("You are Note2Quiz's AI study partner. " + MODE_RULES.get(mode, MODE_RULES["general"]) +
              " Prefer the student's notes below when relevant and say when something is not in them. Keep answers under 180 words, plain text, no markdown headings.")
    msgs = "\n".join(f"{m['role']}: {m['text']}" for m in history[-6:])
    out = _claude(system, f"Notes:\n{ctx or '(none uploaded or none relevant)'}\n\nConversation so far:\n{msgs}\n\nstudent: {message}", 700) if enabled() else None
    if out:
        return {"text": out.strip(), "sources": [s for s, _ in contexts]}
    if not contexts:
        return {"text": LEAD.get(mode, "") + "I couldn’t find that in your notes yet. Upload notes for this topic, or tell me which file to use, and I’ll answer from them.", "sources": []}
    best = _rank_sentences(" ".join(c for _, c in contexts[:2]), 3)
    return {"text": LEAD.get(mode, "") + "From your notes: " + " ".join(best), "sources": [s for s, _ in contexts[:3]]}


# ======================= revision pack =======================
def revision_pack(text, analysis):
    data = _json("Return {\"checklist\":[5 short last-minute tasks],\"quick\":[4-8 one-line key facts]} for exam revision from these notes.", _clip(text, 9000))
    base = {"checklist": ["Re-read your weakest topics", "Redo every quiz question you missed", "Review all due flashcards",
                          "Write each formula from memory", "Sleep. A tired brain recalls less"],
            "quick": _rank_sentences(text, 6)}
    if isinstance(data, dict):
        for k in ("checklist", "quick"):
            if isinstance(data.get(k), list) and data[k]:
                base[k] = [str(x) for x in data[k]][:10]
    base["formulas"] = analysis.get("formulas", [])
    base["definitions"] = analysis.get("definitions", [])
    return base
