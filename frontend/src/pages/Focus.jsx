import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { ProgressRing } from '../components/ui/ProgressRing';
import { PageHeader } from '../components/common/PageHeader';
import { useGame } from '../lib/game';

const MODES = { Focus: 25, 'Short break': 5, 'Long break': 15 };
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function Focus() {
  const { awardXp } = useGame();
  const [mode, setMode] = useState('Focus'); const [left, setLeft] = useState(25 * 60); const [run, setRun] = useState(false); const [sessions, setSessions] = useState(0);
  const total = MODES[mode] * 60;
  const pick = (m) => { setMode(m); setRun(false); setLeft(MODES[m] * 60); };

  useEffect(() => {
    if (!run) return;
    if (left <= 0) { setRun(false); if (mode === 'Focus') { setSessions((s) => s + 1); awardXp(50, 'Finished a 25 min focus session', 'focus'); } return; }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000); return () => clearTimeout(t);
  }, [run, left, mode, awardXp]);
  useEffect(() => { document.title = run ? `${fmt(left)} · Note2Quiz` : 'Note2Quiz'; return () => { document.title = 'Note2Quiz'; }; }, [run, left]);

  return (
    <div className="mx-auto max-w-lg text-center">
      <PageHeader title="Focus mode" sub="One task, no tabs. Finish a focus session to earn 50 XP." />
      <div className="mb-8 flex justify-center"><Segmented options={Object.keys(MODES)} value={mode} onChange={pick} /></div>
      <div className="flex justify-center"><ProgressRing value={((total - left) / total) * 100} size={260} stroke={12} tone="primary"><div><p className="font-display text-6xl font-semibold tabular-nums" aria-live="off">{fmt(left)}</p><p className="mt-1 text-sm text-muted">{sessions} sessions today</p></div></ProgressRing></div>
      <div className="mt-8 flex justify-center gap-3">
        <Button size="lg" onClick={() => setRun(!run)} disabled={left <= 0}>{run ? <><Pause className="h-4 w-4" />Pause</> : <><Play className="h-4 w-4" />{left < total ? 'Resume' : 'Start'}</>}</Button>
        <Button size="lg" variant="secondary" onClick={() => pick(mode)}><RotateCcw className="h-4 w-4" />Reset</Button>
      </div>
    </div>
  );
}
