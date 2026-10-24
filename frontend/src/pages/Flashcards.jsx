import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { PageHeader } from '../components/common/PageHeader';
import { useGame } from '../lib/game';
import { deck } from '../data/app';

const RATES = [['Again', 'danger', 'in 1 min'], ['Hard', 'warning', 'in 1 day'], ['Good', 'accent', 'in 3 days'], ['Easy', 'success', 'in 7 days']];

export default function Flashcards() {
  const { awardXp } = useGame(); const paid = useRef(false);
  const [i, setI] = useState(0); const [flip, setFlip] = useState(false);
  const finished = i >= deck.length; const c = deck[i];
  const rate = () => { setFlip(false); setI((x) => x + 1); };

  useEffect(() => { if (finished && !paid.current) { paid.current = true; awardXp(deck.length * 2, `Reviewed ${deck.length} flashcards`, 'cards'); } }, [finished, awardXp]);
  useEffect(() => {
    const h = (e) => { if (finished) return; if (e.code === 'Space') { e.preventDefault(); setFlip((f) => !f); } if (flip && /^[1-4]$/.test(e.key)) rate(); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Flashcards" sub="Flip, rate how well you knew it, and each card returns at the right time." />
      <Progress value={(Math.min(i, deck.length) / deck.length) * 100} className="mb-6" />
      {finished ? (
        <div className="glass rounded-3xl p-10 text-center">
          <p className="font-display text-2xl font-semibold">Deck complete</p><p className="mt-2 text-muted">{deck.length} cards reviewed. They’ll come back on the schedule you chose.</p>
          <Button className="mt-6" onClick={() => { setI(0); paid.current = false; }}><RotateCcw className="h-4 w-4" />Review again</Button>
        </div>
      ) : (<>
        <button onClick={() => setFlip(!flip)} aria-label="Flip card" className="block h-72 w-full text-left [perspective:1200px]">
          <motion.div className="relative h-full w-full [transform-style:preserve-3d]" animate={{ rotateY: flip ? 180 : 0 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}>
            <div className="glass absolute inset-0 flex flex-col justify-between rounded-3xl p-8 [backface-visibility:hidden]"><Badge tone="primary" className="w-fit">{c.tag}</Badge><p className="font-display text-xl font-semibold leading-snug sm:text-2xl">{c.q}</p><p className="text-sm text-muted">Tap or press space to reveal</p></div>
            <div className="glass absolute inset-0 flex flex-col justify-between rounded-3xl border-accent/40 p-8 [backface-visibility:hidden] [transform:rotateY(180deg)]"><Badge tone="accent" className="w-fit">Answer</Badge><p className="text-lg leading-relaxed">{c.a}</p><p className="text-sm text-muted">Card {i + 1} of {deck.length}</p></div>
          </motion.div>
        </button>
        <div className={`mt-6 grid grid-cols-2 gap-2 transition sm:grid-cols-4 ${flip ? '' : 'pointer-events-none opacity-40'}`}>
          {RATES.map(([l, t, when], k) => <button key={l} onClick={rate} className={`rounded-xl border border-line bg-${t}/10 px-3 py-3 text-center transition hover:border-fg/30`}><span className={`block text-sm font-medium text-${t}`}>{l}</span><span className="text-[11px] text-muted">{when} (key {k + 1})</span></button>)}
        </div>
      </>)}
    </div>
  );
}
