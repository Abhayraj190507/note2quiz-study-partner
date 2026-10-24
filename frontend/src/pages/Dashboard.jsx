import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Brain, FileUp, Flame, Layers, ListChecks, MessagesSquare, Target, Zap } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { ProgressRing } from '../components/ui/ProgressRing';
import { StatCard } from '../components/common/StatCard';
import { BarChart } from '../components/charts/BarChart';
import { useGame } from '../lib/game';
import { timeAgo } from '../lib/utils';
import { goals, user, week } from '../data/app';

const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const kindIcon = { quiz: ListChecks, cards: Layers, focus: Target, notes: FileUp, plan: Award };
const actions = [
  { to: '/app/notes', icon: FileUp, label: 'Upload notes', sub: 'PDF, DOCX, slides, images', tone: 'primary' },
  { to: '/app/quiz', icon: ListChecks, label: 'Start a quiz', sub: 'Built from your notes', tone: 'accent' },
  { to: '/app/partner', icon: MessagesSquare, label: 'Ask the partner', sub: 'Answers with citations', tone: 'success' },
  { to: '/app/flashcards', icon: Layers, label: 'Review cards', sub: '14 due today', tone: 'warning' },
];

export default function Dashboard() {
  const g = useGame();
  const total = week.reduce((a, d) => a + d.value, 0);
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-[90px]" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">{greet()}, {user.first}.</h1>
            <p className="mt-2 text-muted">You’re on a {g.streak}-day streak and 26% away from this week’s goal. One quiz on <b className="font-medium text-fg">entropy</b> would close most of it.</p>
            <div className="mt-5 flex flex-wrap gap-3"><Button to="/app/quiz">Resume where you left off <ArrowRight className="h-4 w-4" /></Button><Button to="/app/partner" variant="secondary">Ask the partner</Button></div>
          </div>
          <ProgressRing value={74} size={120} stroke={10} tone="accent"><div><p className="font-display text-2xl font-semibold">74%</p><p className="text-[11px] text-muted">weekly goal</p></div></ProgressRing>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Zap} label="Total XP" value={g.xp} delta={12} spark={[3, 4, 3, 6, 5, 8, 9]} tone="primary" />
        <StatCard icon={Brain} label={`Level progress (${Math.round(g.progress * 100)}%)`} value={g.level} suffix="" spark={[2, 3, 5, 4, 6, 7, 9]} tone="accent" />
        <StatCard icon={Flame} label="Day streak" value={g.streak} delta={9} spark={[1, 2, 4, 5, 7, 9, 12]} tone="warning" />
        <StatCard icon={Target} label="Quiz accuracy" value={78} suffix="%" delta={6} spark={[60, 66, 64, 70, 72, 75, 78]} tone="success" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader title="Study time this week" sub={`${Math.floor(total / 60)}h ${total % 60}m so far. Saturday was your best day.`} action={<Badge tone="success">+14% vs last week</Badge>} />
          <BarChart data={week} active={5} unit="m" height={190} />
        </Card>
        <Card>
          <CardHeader title="Weekly goals" sub="Resets on Monday" />
          <ul className="space-y-5">
            {goals.map((x) => (
              <li key={x.label}>
                <div className="mb-1.5 flex justify-between text-sm"><span>{x.label}</span><span className="tabular-nums text-muted">{x.now}{x.unit} / {x.max}{x.unit}</span></div>
                <Progress value={(x.now / x.max) * 100} tone={x.tone} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Activity + actions */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader title="Recent activity" />
          <ul className="space-y-1">
            {g.activity.slice(0, 5).map((a) => { const I = kindIcon[a.kind] || Award; return (
              <li key={a.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-fg/[.04]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary"><I className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm">{a.text}</p><p className="text-xs text-muted">{timeAgo(a.at)}</p></div>
                <span className="text-sm font-medium text-success">+{a.xp} XP</span>
              </li>); })}
          </ul>
        </Card>
        <div>
          <h3 className="mb-4 font-display text-base font-semibold">Quick actions</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {actions.map((a) => (
              <Link key={a.to} to={a.to} className="glass group flex items-center gap-4 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-primary/40">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-${a.tone}/15 text-${a.tone}`}><a.icon className="h-5 w-5" /></span>
                <span className="min-w-0"><span className="block text-sm font-medium">{a.label}</span><span className="block truncate text-xs text-muted">{a.sub}</span></span>
                <ArrowRight className="ml-auto h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-fg" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
