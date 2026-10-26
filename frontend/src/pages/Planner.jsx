import { useState } from 'react';
import { Check, Clock, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { PageHeader } from '../components/common/PageHeader';
import { useGame } from '../lib/game';
import { useData } from '../lib/useData';
import { cn } from '../lib/utils';

export default function Planner() {
  const { awardXp } = useGame(); const [done, setDone] = useState(new Set()); const { planner: seed } = useData();
  const [planner, setPlanner] = useState(seed); const [draft, setDraft] = useState({ t: '', day: seed[0].day, m: 30 });
  const all = planner.flatMap((d) => d.tasks); const pct = all.length ? (done.size / all.length) * 100 : 0;
  const addTask = (e) => { e.preventDefault(); if (!draft.t.trim()) return; setPlanner((p) => p.map((d) => d.day === draft.day ? { ...d, tasks: [...d.tasks, { id: `t${Date.now()}`, t: draft.t.trim(), m: Number(draft.m) || 30 }] } : d)); setDraft({ ...draft, t: '' }); };
  const toggle = (t) => setDone((s) => { const n = new Set(s); if (n.has(t.id)) n.delete(t.id); else { n.add(t.id); awardXp(Math.round(t.m / 2), `Finished “${t.t}”`, 'plan'); } return n; });
  return (
    <div className="space-y-6">
      <PageHeader title="Planner" sub="This week’s plan, weighted toward your weakest topics. Tick a task to earn XP." />
      <Card><div className="mb-2 flex justify-between text-sm"><span className="font-medium">Week progress</span><span className="text-muted">{all.length ? `${done.size} of ${all.length} tasks` : 'No tasks yet'}</span></div><Progress value={pct} tone="success" /></Card>
      <form onSubmit={addTask} className="flex flex-wrap gap-2">
        <input className="field min-w-[200px] flex-1" value={draft.t} onChange={(e) => setDraft({ ...draft, t: e.target.value })} placeholder="Add a task, e.g. Revise chapter 3" aria-label="Task" />
        <select className="field w-auto" value={draft.day} onChange={(e) => setDraft({ ...draft, day: e.target.value })} aria-label="Day">{planner.map((d) => <option key={d.day}>{d.day}</option>)}</select>
        <select className="field w-auto" value={draft.m} onChange={(e) => setDraft({ ...draft, m: e.target.value })} aria-label="Minutes">{[15, 30, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}</select>
        <button type="submit" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-white hover:brightness-110"><Plus className="h-4 w-4" />Add</button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {planner.map((d) => (
          <Card key={d.day} className="p-4">
            <h2 className="mb-3 font-display text-sm font-semibold">{d.day}</h2>
            {!d.tasks.length && <p className="text-xs text-muted">Nothing planned</p>}
            <ul className="space-y-2">{d.tasks.map((t) => { const on = done.has(t.id); return (
              <li key={t.id}><button onClick={() => toggle(t)} aria-pressed={on} className={cn('flex w-full items-start gap-2.5 rounded-xl border p-3 text-left text-sm transition', on ? 'border-success/40 bg-success/10' : 'border-line hover:border-primary/50')}>
                <span className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border', on ? 'border-success bg-success text-bg' : 'border-line')}>{on && <Check className="h-3.5 w-3.5" />}</span>
                <span><span className={cn('block', on && 'text-muted line-through')}>{t.t}</span><span className="mt-1 flex items-center gap-1 text-xs text-muted"><Clock className="h-3 w-3" />{t.m} min</span></span></button></li>); })}</ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
