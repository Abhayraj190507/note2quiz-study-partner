import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Segmented } from '../components/ui/Segmented';
import { PageHeader } from '../components/common/PageHeader';
import { useGame } from '../lib/game';
import { board, user } from '../data/app';
import { cn } from '../lib/utils';

export default function Leaderboard() {
  const g = useGame(); const [scope, setScope] = useState('Global');
  const rows = useMemo(() => {
    const all = [...board, { name: `${user.name} (you)`, xp: g.xp, college: user.college, me: true }].sort((a, b) => b.xp - a.xp);
    return (scope === 'My college' ? all.filter((r) => r.college === user.college) : all).map((r, i) => ({ ...r, rank: i + 1 }));
  }, [g.xp, scope]);
  const top = rows.slice(0, 3); const order = [top[1], top[0], top[2]].filter(Boolean); const h = { 1: 'h-32', 2: 'h-24', 3: 'h-20' };
  const me = rows.find((r) => r.me); const above = rows[me.rank - 2];

  return (
    <div className="space-y-6">
      <PageHeader title="Leaderboard" sub={above ? `${(above.xp - me.xp).toLocaleString()} XP to pass ${above.name.split(' ')[0]}.` : 'You’re in first place.'} action={<Segmented options={['Global', 'My college']} value={scope} onChange={setScope} />} />
      <div className="mx-auto flex max-w-xl items-end justify-center gap-3 pt-6">
        {order.map((r) => (
          <div key={r.name} className="flex flex-1 flex-col items-center text-center">
            {r.rank === 1 && <Crown className="mb-1 h-5 w-5 text-warning" />}
            <span className={cn('grid h-12 w-12 place-items-center rounded-full text-sm font-semibold text-white', r.me ? 'bg-gradient-to-br from-primary to-accent' : 'bg-fg/20')}>{r.name[0]}</span>
            <p className="mt-2 w-full truncate text-sm font-medium">{r.name.split(' ')[0]}</p><p className="text-xs text-muted">{r.xp.toLocaleString()} XP</p>
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: 'bottom' }} transition={{ duration: 0.7, delay: r.rank * 0.1 }} className={cn('mt-3 grid w-full place-items-start rounded-t-xl bg-gradient-to-b from-primary/40 to-primary/5 pt-3 font-display text-2xl font-semibold', h[r.rank])}><span className="w-full text-center">{r.rank}</span></motion.div>
          </div>
        ))}
      </div>
      <Card className="p-2">
        <ul>{rows.map((r) => (
          <li key={r.name} className={cn('flex items-center gap-4 rounded-xl px-4 py-3', r.me && 'bg-primary/15 ring-1 ring-primary/30')}>
            <span className="w-6 text-sm tabular-nums text-muted">{r.rank}</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-fg/10 text-sm font-medium">{r.name[0]}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{r.name}</p><p className="truncate text-xs text-muted">{r.college}</p></div>
            <span className="text-sm font-medium tabular-nums">{r.xp.toLocaleString()} XP</span>
          </li>))}</ul>
      </Card>
    </div>
  );
}
