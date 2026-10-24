import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, FileText, GraduationCap, Layers, ListChecks, Plus, Send, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { useStream } from '../hooks/useStream';
import { useToast } from '../lib/toast';
import { REPLIES, FALLBACK, SUGGESTIONS, sessions, notes } from '../data/app';
import { cn } from '../lib/utils';

const MODES = [
  { value: 'general', label: 'General' }, { value: 'doubt', label: 'Doubt solver' },
  { value: 'explain', label: 'Explain a topic' }, { value: 'expert', label: 'Subject expert' },
];
const LEAD = { general: '', doubt: 'Let’s untangle it. ', explain: 'Here it is, step by step. ', expert: 'Exam tip first: be specific and show your working. ' };

/** REPLACE THIS with your AI call, e.g. fetch('/api/partner', { method: 'POST', body: JSON.stringify({ mode, text, noteIds }) }). */
async function askPartner(mode, text) {
  await new Promise((r) => setTimeout(r, 900));
  const hit = REPLIES.find((r) => r.match.test(text)) || FALLBACK;
  return { ...hit, text: LEAD[mode] + hit.text };
}

function Reply({ m, onTick }) {
  const toast = useToast();
  const { shown, done } = useStream(m.text, { speed: 24 });
  useEffect(() => { onTick(); }, [shown, done, onTick]);
  return (
    <div className="glass max-w-[92%] rounded-2xl rounded-bl-md p-4 text-[15px] leading-7 sm:max-w-[80%]">
      <p>{shown}{!done && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-blink bg-accent" />}</p>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">{m.src.map((s) => <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-accent"><FileText className="h-3 w-3" />{s}</span>)}</div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => toast('Flashcards created', '3 cards added to your deck')}><Layers className="h-3.5 w-3.5" />Make flashcards</Button>
            <Button to="/app/quiz" variant="secondary" size="sm"><ListChecks className="h-3.5 w-3.5" />Quiz me on this</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function StudyPartner() {
  const [mode, setMode] = useState('general');
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [use, setUse] = useState(() => new Set(notes.slice(0, 3).map((n) => n.id)));
  const end = useRef(null);
  const scroll = () => end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  useEffect(scroll, [msgs, busy]);

  const send = async (q) => {
    const t = (q ?? text).trim(); if (!t || busy) return;
    setText(''); setBusy(true);
    setMsgs((m) => [...m, { id: Math.random(), role: 'user', text: t }]);
    const r = await askPartner(mode, t);
    setMsgs((m) => [...m, { id: Math.random(), role: 'ai', ...r }]); setBusy(false);
  };
  const toggle = (id) => setUse((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="grid h-[calc(100dvh-8.5rem)] min-h-[520px] gap-4 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_280px]">
      {/* History */}
      <aside className="glass hidden flex-col rounded-2xl p-3 lg:flex">
        <Button variant="secondary" size="sm" className="mb-3 w-full" onClick={() => setMsgs([])}><Plus className="h-4 w-4" />New chat</Button>
        <p className="mb-2 px-2 text-xs text-muted">History</p>
        <ul className="space-y-0.5 overflow-y-auto">{sessions.map((s) => <li key={s.id}><button onClick={() => send(s.title)} className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm text-muted transition hover:bg-fg/[.06] hover:text-fg"><span className="truncate">{s.title}</span><span className="text-[11px]">{s.when}</span></button></li>)}</ul>
      </aside>

      {/* Chat */}
      <section className="glass flex min-h-0 flex-col rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-3 sm:px-5">
          <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-white"><Sparkles className="h-[18px] w-[18px]" /></span><div><h1 className="font-display text-base font-semibold leading-tight">AI Study Partner</h1><p className="text-xs text-muted">Answers from {use.size} of your notes</p></div></div>
          <Segmented options={MODES} value={mode} onChange={setMode} />
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5" aria-live="polite">
          {!msgs.length && (
            <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
              <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary"><GraduationCap className="h-7 w-7" /></span>
              <h2 className="font-display text-xl font-semibold">What are you studying today?</h2>
              <p className="mt-1 text-sm text-muted">Ask about any topic in your notes. Pick a mode above to change how I answer.</p>
              <div className="mt-6 flex w-full flex-col gap-2">{SUGGESTIONS[mode].map((s) => <button key={s} onClick={() => send(s)} className="rounded-xl border border-line px-4 py-2.5 text-left text-sm text-muted transition hover:border-primary/50 hover:bg-primary/10 hover:text-fg">{s}</button>)}</div>
            </div>
          )}
          {msgs.map((m, i) => m.role === 'user'
            ? <motion.p key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] text-white">{m.text}</motion.p>
            : <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><Reply m={m} onTick={scroll} /></motion.div>)}
          {busy && <div className="glass inline-flex gap-1 rounded-2xl rounded-bl-md px-4 py-3" aria-label="Thinking">{[0, 1, 2].map((i) => <i key={i} className="h-2 w-2 animate-dot rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>}
          <div ref={end} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-line p-3 sm:p-4">
          <div className="flex items-end gap-2 rounded-2xl border border-line bg-fg/[.03] p-2 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
            <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder="Ask about your notes…" aria-label="Message" className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-muted/70" />
            <button type="submit" disabled={!text.trim() || busy} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-white transition hover:brightness-110 disabled:opacity-40"><Send className="h-4 w-4" /></button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted">Replies are generated from your notes. Check the cited page before relying on a claim.</p>
        </form>
      </section>

      {/* Context */}
      <aside className="glass hidden overflow-y-auto rounded-2xl p-4 xl:block">
        <h2 className="mb-1 flex items-center gap-2 font-display text-sm font-semibold"><BookOpen className="h-4 w-4 text-primary" />Notes in use</h2>
        <p className="mb-4 text-xs text-muted">Untick a file to keep it out of the answers.</p>
        <ul className="space-y-2">{notes.map((n) => { const on = use.has(n.id); return (
          <li key={n.id}><label className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition', on ? 'border-primary/40 bg-primary/10' : 'border-line')}>
            <input type="checkbox" checked={on} onChange={() => toggle(n.id)} className="mt-1 accent-[rgb(var(--primary))]" /><span className="min-w-0"><span className="block truncate font-medium">{n.name}</span><span className="text-xs text-muted">{n.pages} pages, {n.folder}</span></span></label></li>); })}</ul>
        <div className="mt-5 rounded-xl bg-accent/10 p-3 text-[13px] text-fg/90"><Brain className="mb-1.5 h-4 w-4 text-accent" />Try “quiz me” to turn any chat into practice questions.</div>
      </aside>
    </div>
  );
}
