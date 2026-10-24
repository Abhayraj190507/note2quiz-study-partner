import { Lock, Zap } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { PageHeader } from '../components/common/PageHeader';
import { useGame } from '../lib/game';
import { badges } from '../data/app';
import { cn } from '../lib/utils';

const missions = [{ t: 'Finish one quiz', now: 1, max: 1, xp: 30 }, { t: 'Review 20 flashcards', now: 14, max: 20, xp: 40 }, { t: 'Complete a focus session', now: 0, max: 1, xp: 50 }];

export default function Achievements() {
  const g = useGame();
  return (
    <div className="space-y-6">
      <PageHeader title="Achievements" sub="Badges unlock automatically as your XP, level and streak grow." />
      <Card className="flex flex-wrap items-center gap-6">
        <span className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent font-display text-3xl font-bold text-white">{g.level}</span>
        <div className="min-w-[220px] flex-1"><p className="font-display text-lg font-semibold">Level {g.level}</p><p className="mb-3 text-sm text-muted">{g.into} / 500 XP. {g.toNext} to go.</p><Progress value={g.progress * 100} /></div>
        <div className="text-right"><p className="flex items-center justify-end gap-1.5 font-display text-2xl font-semibold"><Zap className="h-5 w-5 text-warning" />{g.coins}</p><p className="text-xs text-muted">coins</p></div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b) => { const on = b.need(g); return (
            <div key={b.id} className={cn('glass rounded-2xl p-5 text-center transition', !on && 'opacity-55')}>
              <span className={cn('mx-auto grid h-14 w-14 place-items-center rounded-2xl text-2xl', on ? 'bg-primary/15' : 'bg-fg/[.06]')} aria-hidden="true">{on ? b.emoji : <Lock className="h-5 w-5 text-muted" />}</span>
              <p className="mt-3 text-sm font-medium">{b.name}</p><p className="mt-0.5 text-xs text-muted">{b.desc}</p>
            </div>); })}
        </div>
        <Card>
          <CardHeader title="Today’s missions" sub="Resets at midnight" />
          <ul className="space-y-5">{missions.map((m) => <li key={m.t}><div className="mb-1.5 flex justify-between text-sm"><span>{m.t}</span><span className="text-success">+{m.xp} XP</span></div><Progress value={(m.now / m.max) * 100} tone="accent" /></li>)}</ul>
        </Card>
      </div>
    </div>
  );
}
