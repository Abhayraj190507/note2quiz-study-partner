import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Clock, RotateCcw, X, MessagesSquare } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { Progress } from '../components/ui/Progress';
import { ProgressRing } from '../components/ui/ProgressRing';
import { PageHeader } from '../components/common/PageHeader';
import { useGame } from '../lib/game';
import { BANK } from '../data/app';
import { cn } from '../lib/utils';

const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const isRight = (q, a) => (q.t === 'f' ? String(a).trim().toLowerCase() === q.a : a === q.a);
const answerText = (q) => (q.t === 'm' ? q.o[q.a] : q.t === 't' ? (q.a ? 'True' : 'False') : q.a);

export default function Quiz() {
  const [phase, setPhase] = useState('setup');
  const [cfg, setCfg] = useState({ subject: 'Biology', count: 6, timed: 'On' });
  const [qs, setQs] = useState([]); const [i, setI] = useState(0); const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]); const [left, setLeft] = useState(0); const [total, setTotal] = useState(0);

  const max = BANK[cfg.subject].length; const count = Math.min(cfg.count, max);
  const start = () => { const list = shuffle(BANK[cfg.subject]).slice(0, count); const t = count * 40; setQs(list); setI(0); setPicked(null); setAnswers([]); setTotal(t); setLeft(t); setPhase('play'); };
  const finish = useCallback((all) => { setAnswers(all); setPhase('result'); }, []);

  // countdown
  useEffect(() => {
    if (phase !== 'play' || cfg.timed !== 'On') return;
    if (left <= 0) { finish(answers); return; }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000); return () => clearTimeout(t);
  }, [phase, left, cfg.timed, answers, finish]);

  const q = qs[i];
  const submit = (a) => { if (picked !== null || !q) return; setPicked(a); setAnswers((p) => [...p.slice(0, i), { q, a, ok: isRight(q, a) }]); };
  const next = () => { if (i + 1 >= qs.length) finish(answers); else { setI(i + 1); setPicked(null); } };

  // keyboard: 1-4 to pick, Enter for next
  useEffect(() => {
    if (phase !== 'play') return;
    const h = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (picked !== null && e.key === 'Enter') next();
      if (picked === null && q?.t === 'm' && /^[1-4]$/.test(e.key)) submit(Number(e.key) - 1);
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  });

  if (phase === 'setup') return <Setup cfg={cfg} setCfg={setCfg} max={max} count={count} start={start} />;
  if (phase === 'result') return <Result answers={answers} qs={qs} used={total - left} again={start} reset={() => setPhase('setup')} timed={cfg.timed === 'On'} />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between text-sm">
        <span className="font-medium">Question {i + 1} of {qs.length}</span>
        {cfg.timed === 'On' && <span className={cn('flex items-center gap-1.5 tabular-nums', left < 30 ? 'text-danger' : 'text-muted')}><Clock className="h-4 w-4" />{fmt(left)}</span>}
      </div>
      <Progress value={((i + (picked !== null ? 1 : 0)) / qs.length) * 100} className="mb-6" />
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
          <Card className="p-6 sm:p-8">
            <span className="text-xs text-muted">{q.topic}</span>
            <h2 className="mt-1 font-display text-xl font-semibold leading-snug sm:text-2xl">{q.q}</h2>
            <div className="mt-6"><Answer q={q} picked={picked} submit={submit} /></div>
            <AnimatePresence>
              {picked !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                  <div className={cn('mt-5 rounded-xl p-4 text-sm', isRight(q, picked) ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger')}>
                    <p className="font-medium">{isRight(q, picked) ? 'Correct.' : `Not quite. The answer is ${answerText(q)}.`}</p><p className="mt-1 text-fg/80">{q.why}</p>
                  </div>
                  <div className="mt-5 flex justify-end"><Button onClick={next}>{i + 1 >= qs.length ? 'See results' : 'Next question'} <ArrowRight className="h-4 w-4" /></Button></div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Answer({ q, picked, submit }) {
  const [txt, setTxt] = useState('');
  const state = (ok, chosen) => (picked === null ? 'border-line bg-fg/[.03] hover:border-primary/60 hover:bg-primary/10' : ok ? 'border-success bg-success/15' : chosen ? 'border-danger bg-danger/15' : 'border-line opacity-50');
  const Mark = ({ ok, chosen }) => (picked === null ? null : ok ? <Check className="h-4 w-4 text-success" /> : chosen ? <X className="h-4 w-4 text-danger" /> : null);
  if (q.t === 'f') return (
    <form onSubmit={(e) => { e.preventDefault(); if (txt.trim()) submit(txt); }} className="flex gap-2">
      <input value={txt} onChange={(e) => setTxt(e.target.value)} disabled={picked !== null} placeholder="Type your answer" aria-label="Your answer" className="field" autoFocus />
      <Button type="submit" disabled={picked !== null || !txt.trim()}>Check</Button>
    </form>
  );
  const opts = q.t === 'm' ? q.o : ['True', 'False'];
  return (
    <ul className="grid gap-3">
      {opts.map((o, k) => { const val = q.t === 'm' ? k : k === 0; const ok = q.t === 'm' ? k === q.a : val === q.a; const chosen = picked === val && picked !== null;
        return (<li key={o}><button disabled={picked !== null} onClick={() => submit(val)} className={cn('flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition active:scale-[.99]', state(ok, chosen))}>
          {q.t === 'm' && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-fg/10 text-xs text-muted">{k + 1}</span>}<span className="flex-1">{o}</span><Mark ok={ok} chosen={chosen} /></button></li>); })}
    </ul>
  );
}

function Setup({ cfg, setCfg, max, count, start }) {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New quiz" sub="Choose a subject and length. Questions come from your notes and mix three formats." />
      <Card className="space-y-7 p-6 sm:p-8">
        <div><p className="mb-2 text-sm font-medium">Subject</p><Segmented options={Object.keys(BANK)} value={cfg.subject} onChange={(v) => setCfg({ ...cfg, subject: v })} /></div>
        <div>
          <div className="mb-2 flex justify-between text-sm"><span className="font-medium">Number of questions</span><span className="tabular-nums text-muted">{count}</span></div>
          <input type="range" min="3" max={max} value={count} onChange={(e) => setCfg({ ...cfg, count: Number(e.target.value) })} aria-label="Number of questions" className="w-full accent-[rgb(var(--primary))]" />
        </div>
        <div><p className="mb-2 text-sm font-medium">Timer</p><Segmented options={['On', 'Off']} value={cfg.timed} onChange={(v) => setCfg({ ...cfg, timed: v })} /></div>
        <Button size="lg" className="w-full" onClick={start}>Start quiz <ArrowRight className="h-4 w-4" /></Button>
      </Card>
    </div>
  );
}

function Result({ answers, qs, used, again, reset, timed }) {
  const { awardXp } = useGame(); const done = useRef(false);
  const right = answers.filter((a) => a.ok).length; const pct = Math.round((right / qs.length) * 100);
  const xp = right * 20 + (pct >= 80 ? 30 : 0);
  useEffect(() => { if (done.current) return; done.current = true; awardXp(xp, `Scored ${pct}% on a ${qs.length}-question quiz`, 'quiz'); }, [awardXp, xp, pct, qs.length]);
  const byTopic = useMemo(() => { const m = {}; qs.forEach((q, i) => { const t = (m[q.topic] ||= { n: 0, ok: 0 }); t.n++; if (answers[i]?.ok) t.ok++; }); return Object.entries(m).map(([k, v]) => ({ topic: k, pct: Math.round((v.ok / v.n) * 100) })); }, [qs, answers]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="flex flex-wrap items-center gap-8 p-6 sm:p-8">
        <ProgressRing value={pct} size={140} stroke={12} tone={pct >= 70 ? 'success' : pct >= 50 ? 'warning' : 'danger'}><div><p className="font-display text-3xl font-semibold">{pct}%</p><p className="text-xs text-muted">{right} of {qs.length}</p></div></ProgressRing>
        <div className="min-w-[220px] flex-1">
          <h1 className="font-display text-2xl font-semibold">{pct >= 80 ? 'Strong result.' : pct >= 50 ? 'Solid start. Review the misses.' : 'Worth another pass.'}</h1>
          <p className="mt-1 text-muted">You earned <b className="text-success">+{xp} XP</b>{timed ? ` in ${fmt(used)}` : ''}.</p>
          <div className="mt-5 flex flex-wrap gap-2"><Button onClick={again}><RotateCcw className="h-4 w-4" />Retake</Button><Button variant="secondary" onClick={reset}>New quiz</Button><Button to="/app/partner" variant="ghost"><MessagesSquare className="h-4 w-4" />Ask the partner</Button></div>
        </div>
      </Card>
      <Card><h2 className="mb-4 font-display text-base font-semibold">By topic</h2><ul className="space-y-4">{byTopic.map((t) => <li key={t.topic}><div className="mb-1.5 flex justify-between text-sm"><span>{t.topic}</span><span className="tabular-nums text-muted">{t.pct}%</span></div><Progress value={t.pct} tone={t.pct >= 70 ? 'success' : t.pct >= 50 ? 'warning' : 'danger'} /></li>)}</ul></Card>
      <Card><h2 className="mb-4 font-display text-base font-semibold">Review</h2>
        <ul className="divide-y divide-line">{qs.map((q, i) => { const a = answers[i]; return (
          <li key={i} className="flex gap-3 py-4"><span className={cn('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full', a?.ok ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger')}>{a?.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}</span>
            <div className="text-sm"><p className="font-medium">{q.q}</p><p className="mt-1 text-muted">{a ? `Answer: ${answerText(q)}. ` : 'Not answered. '}{q.why}</p></div></li>); })}</ul>
      </Card>
    </div>
  );
}
