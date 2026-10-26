import { useState } from 'react';
import { Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Segmented } from '../components/ui/Segmented';
import { PageHeader } from '../components/common/PageHeader';
import { useData } from '../lib/useData';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const TABS = ['Quick notes', 'Last-minute checklist', 'Formulas', 'Definitions'];

export default function Revision() {
  const { revision: R, isDemo } = useData();
  const [tab, setTab] = useState(TABS[0]); const [done, setDone] = useState(new Set());
  return (
    <div className="space-y-6">
      <PageHeader title="Revision hub" sub="The short version of everything, for the night before." />
      <Segmented options={TABS} value={tab} onChange={setTab} />
      <Card className="p-2 sm:p-4">
        {tab !== 'Last-minute checklist' && !R[tab === 'Quick notes' ? 'quick' : tab === 'Formulas' ? 'formulas' : 'definitions'].length && <div className="p-8 text-center"><p className="font-medium">Nothing here yet</p><p className="mt-1 text-sm text-muted">Upload notes and your {tab.toLowerCase()} will be collected here.</p><Button to="/app/notes" size="sm" className="mt-4">Upload notes</Button></div>}
        {tab === 'Quick notes' && <ul className="divide-y divide-line">{R.quick.map((t) => <li key={t} className="px-3 py-4">{t}</li>)}</ul>}
        {tab === 'Last-minute checklist' && <ul>{R.checklist.map((t) => { const on = done.has(t); return (
          <li key={t}><button onClick={() => setDone((s) => { const n = new Set(s); n.has(t) ? n.delete(t) : n.add(t); return n; })} aria-pressed={on} className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition hover:bg-fg/[.04]">
            <span className={cn('grid h-5 w-5 place-items-center rounded-md border', on ? 'border-success bg-success text-bg' : 'border-line')}>{on && <Check className="h-3.5 w-3.5" />}</span><span className={cn(on && 'text-muted line-through')}>{t}</span></button></li>); })}</ul>}
        {tab === 'Formulas' && <dl className="grid gap-3 p-2 sm:grid-cols-2">{R.formulas.map(([k, v]) => <div key={k} className="rounded-xl border border-line bg-fg/[.03] p-4"><dt className="text-sm text-muted">{k}</dt><dd className="mt-1 font-display text-lg">{v}</dd></div>)}</dl>}
        {tab === 'Definitions' && <dl className="divide-y divide-line">{R.definitions.map(([k, v]) => <div key={k} className="px-3 py-4"><dt className="font-medium">{k}</dt><dd className="mt-0.5 text-muted">{v}</dd></div>)}</dl>}
      </Card>
    </div>
  );
}
