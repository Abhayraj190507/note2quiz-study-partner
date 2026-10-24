import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Send } from 'lucide-react';
import { Segmented } from '../../components/ui/Segmented';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { BarChart } from '../../components/charts/BarChart';
import { AreaChart } from '../../components/charts/AreaChart';
import { Radar } from '../../components/charts/Radar';
import { week, subjects } from '../../data/app';
import { cn } from '../../lib/utils';

const TABS = [
  { value: 'dash', label: 'Dashboard', url: 'app' }, { value: 'quiz', label: 'Quiz', url: 'app/quiz' },
  { value: 'partner', label: 'Study partner', url: 'app/partner' }, { value: 'analytics', label: 'Analytics', url: 'app/analytics' },
];

function Dash() {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
      <div className="glass flex items-center gap-5 rounded-xl p-5">
        <ProgressRing value={74} size={104} stroke={10}><div><p className="font-display text-2xl font-semibold">74%</p><p className="text-[11px] text-muted">weekly goal</p></div></ProgressRing>
        <div><p className="flex items-center gap-1.5 text-warning"><Flame className="h-4 w-4" /><b className="font-display text-lg text-fg">12 days</b></p><p className="text-sm text-muted">Longest streak this term</p></div>
      </div>
      <div className="glass rounded-xl p-5"><p className="mb-3 text-sm font-medium">Minutes studied this week</p><BarChart data={week} active={5} height={140} /></div>
    </div>
  );
}
function Quiz() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-3 flex items-center justify-between text-sm text-muted"><span>Question 4 of 10</span><span>0:42</span></div>
      <div className="mb-4 h-1.5 rounded-full bg-fg/10"><div className="h-full w-[40%] rounded-full bg-primary" /></div>
      <div className="glass rounded-xl p-5">
        <p className="font-display text-lg font-semibold">A cross between Aa and Aa gives which genotype ratio?</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">{['1:1', '3:1', '1:2:1', '9:3:3:1'].map((o, i) => <li key={o} className={cn('rounded-xl border px-4 py-2.5 text-sm', i === 2 ? 'border-success bg-success/15' : 'border-line text-muted')}>{o}</li>)}</ul>
        <p className="mt-4 rounded-lg bg-success/10 p-3 text-[13px] text-success">AA : Aa : aa appears in a 1 : 2 : 1 ratio.</p>
      </div>
    </div>
  );
}
function Partner() {
  return (
    <div className="mx-auto max-w-xl space-y-3">
      <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-white">Why does SN2 invert the stereocenter?</p>
      <div className="glass max-w-[92%] rounded-2xl rounded-bl-md p-4 text-sm">
        <p>The nucleophile attacks from the side opposite the leaving group, so the stereocenter flips like an umbrella in the wind.</p>
        <span className="mt-3 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-accent">Organic Chemistry Summary.docx, p. 3</span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm text-muted"><span className="flex-1">Ask about your notes…</span><Send className="h-4 w-4" /></div>
    </div>
  );
}
function Analytics() {
  return (
    <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
      <div className="glass rounded-xl p-5"><p className="mb-2 text-sm font-medium">Accuracy, last 14 days</p><AreaChart labels={['1','2','3','4','5','6','7','8','9','10','11','12','13','14']} series={[{ name: 'Accuracy', data: [58,61,60,66,64,70,72,71,76,78,77,82,84,86] }]} unit="%" height={190} max={100} /></div>
      <div className="glass rounded-xl p-5"><Radar axes={subjects.map((s) => ({ label: s.name, value: s.mastery }))} size={240} /></div>
    </div>
  );
}
const VIEWS = { dash: Dash, quiz: Quiz, partner: Partner, analytics: Analytics };

export function ProductTabs() {
  const [tab, setTab] = useState('dash'); const View = VIEWS[tab]; const cur = TABS.find((t) => t.value === tab);
  return (
    <div>
      <div className="mb-6 flex justify-center"><Segmented options={TABS} value={tab} onChange={setTab} /></div>
      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/70" /><span className="h-2.5 w-2.5 rounded-full bg-warning/70" /><span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <span className="mx-auto rounded-md bg-fg/[.05] px-4 py-1 text-xs text-muted">note2quiz.app/{cur.url}</span><span className="w-12" />
        </div>
        <div className="min-h-[360px] p-4 sm:p-8">
          <AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}><View /></motion.div></AnimatePresence>
        </div>
      </div>
    </div>
  );
}
