import { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { PageHeader } from '../components/common/PageHeader';
import { useGame } from '../lib/game';
import { planner } from '../data/app';
import { cn } from '../lib/utils';

export default function Planner() {
  const { awardXp } = useGame(); const [done, setDone] = useState(new Set());
  const all = planner.flatMap((d) => d.tasks); const pct = (done.size / all.length) * 100;
  const toggle = (t) => setDone((s) => { const n = new Set(s); if (n.has(t.id)) n.delete(t.id); else { n.add(t.id); awardXp(Math.round(t.m / 2), `Finished “${t.t}”`, 'plan'); } return n; });
  return (
    <div className="space-y-6">
      <PageHeader title="Planner" sub="This week’s plan, weighted toward your weakest topics. Tick a task to earn XP." />
      <Card><div className="mb-2 flex justify-between text-sm"><span className="font-medium">Week progress</span><span className="text-muted">{done.size} of {all.length} tasks</span></div><Progress value={pct} tone="success" /></Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {planner.map((d) => (
          <Card key={d.day} className="p-4">
            <h2 className="mb-3 font-display text-sm font-semibold">{d.day}</h2>
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
