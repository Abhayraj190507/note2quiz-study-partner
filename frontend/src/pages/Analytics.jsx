import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, ListChecks, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Segmented } from '../components/ui/Segmented';
import { Progress } from '../components/ui/Progress';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { AreaChart } from '../components/charts/AreaChart';
import { Radar } from '../components/charts/Radar';
import { Donut } from '../components/charts/Donut';
import { Heatmap } from '../components/charts/Heatmap';
import { useData } from '../lib/useData';
import { BarChart3 } from 'lucide-react';
import { seeded } from '../lib/utils';

const RANGES = {
  '7D': { n: 7, labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], seed: 7 },
  '30D': { n: 10, labels: ['D3', 'D6', 'D9', 'D12', 'D15', 'D18', 'D21', 'D24', 'D27', 'D30'], seed: 30 },
  '90D': { n: 12, labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'], seed: 90 },
};

function build(range) {
  const { n, seed } = RANGES[range]; const r = seeded(seed * 97);
  const mult = range === '7D' ? 1 : range === '30D' ? 3 : 7;
  const minutes = Array.from({ length: n }, (_, i) => Math.round((45 + r() * 50 + i * 2) * mult));
  const accuracy = Array.from({ length: n }, (_, i) => Math.min(96, Math.round(58 + (i / (n - 1)) * 26 + r() * 6)));
  return { minutes, accuracy };
}
const heat = (() => { const r = seeded(11); return Array.from({ length: 16 }, (_, w) => Array.from({ length: 7 }, () => Math.min(4, Math.floor(r() * 5 * (0.5 + w / 20))))); })();

export default function Analytics() {
  const { subjects, weakTopics, isDemo } = useData();
  const [range, setRange] = useState('7D');
  const { labels } = RANGES[range]; const d = useMemo(() => build(range), [range]);
  const hrs = Math.round(d.minutes.reduce((a, b) => a + b, 0) / 60);
  const gain = d.accuracy[d.accuracy.length - 1] - d.accuracy[0];
  const best = labels[d.minutes.indexOf(Math.max(...d.minutes))];
  const gap = weakTopics[0];

  if (!isDemo) return (
    <div className="space-y-6">
      <PageHeader title="Analytics" sub="Where your time goes, what you’ve mastered, and what to fix next." />
      <div className="glass mx-auto max-w-lg rounded-3xl p-10 text-center">
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary"><BarChart3 className="h-6 w-6" /></span>
        <p className="font-display text-xl font-semibold">No data yet</p>
        <p className="mt-2 text-muted">Take a quiz or finish a focus session and your charts will appear here.</p>
        <Button to="/app/quiz" className="mt-6">Take a quiz</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" sub="Where your time goes, what you’ve mastered, and what to fix next." action={<Segmented options={Object.keys(RANGES)} value={range} onChange={setRange} />} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Clock} label="Hours studied" value={hrs} suffix="h" delta={14} tone="primary" spark={d.minutes} />
        <StatCard icon={Target} label="Average accuracy" value={Math.round(d.accuracy.reduce((a, b) => a + b, 0) / d.accuracy.length)} suffix="%" delta={gain} tone="success" spark={d.accuracy} />
        <StatCard icon={ListChecks} label="Quizzes completed" value={range === '7D' ? 9 : range === '30D' ? 31 : 88} delta={8} tone="accent" />
        <StatCard icon={Flame} label="Best streak" value={21} suffix=" days" tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Study time" sub={`Minutes studied, ${range === '7D' ? 'this week' : range === '30D' ? 'last 30 days' : 'last 90 days'}`} />
          <AreaChart key={`t${range}`} labels={labels} height={200} unit="m" series={[{ name: 'Minutes', data: d.minutes, tone: 'primary' }]} />
          <div className="mt-6 border-t border-line pt-5">
            <p className="mb-2 text-sm font-medium">Quiz accuracy</p>
            <AreaChart key={`a${range}`} labels={labels} height={170} unit="%" max={100} series={[{ name: 'Accuracy', data: d.accuracy, tone: 'accent' }]} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Subject mastery" sub="Share of questions answered correctly" />
          <Radar axes={subjects.map((s) => ({ label: s.name, value: s.mastery }))} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Where the time goes" />
          <Donut parts={subjects.map((s) => ({ label: s.name, value: s.minutes, tone: s.tone }))} center={`${Math.round(subjects.reduce((a, s) => a + s.minutes, 0) / 60)}h`} sub="total" />
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Consistency" sub="Each square is a day. Darker means more study." />
          <Heatmap weeks={heat} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Topics to work on" sub="Lowest-scoring topics from your last 10 quizzes" />
          <ul className="space-y-4">
            {weakTopics.map((t) => (
              <li key={t.topic} className="flex items-center gap-4">
                <div className="min-w-0 flex-1"><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="truncate">{t.topic} <span className="text-muted">({t.subject})</span></span><span className="tabular-nums text-muted">{t.score}%</span></div>
                  <Progress value={t.score} tone={t.score < 50 ? 'danger' : t.score < 65 ? 'warning' : 'accent'} /></div>
                <Button to="/app/quiz" variant="secondary" size="sm">Practice</Button>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-primary/30">
          <CardHeader title="What to do next" action={<span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary"><Lightbulb className="h-4 w-4" /></span>} />
          <ul className="space-y-3 text-[15px]">
            <li>Your accuracy moved <b className="text-success">{gain >= 0 ? '+' : ''}{gain} points</b> over this period.</li>
            <li>Your longest sessions land on <b>{best}</b>. Put hard topics there.</li>
            <li><b>{gap.topic}</b> is the biggest gap at {gap.score}%. A 15 minute quiz today would help most.</li>
          </ul>
          <Link to="/app/partner" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">Ask the partner to explain it <ArrowRight className="h-4 w-4" /></Link>
        </Card>
      </div>
    </div>
  );
}
