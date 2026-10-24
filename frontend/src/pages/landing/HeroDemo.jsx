import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, FileText, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

const OPTIONS = ['Ribosome', 'Mitochondrion', 'Golgi body', 'Lysosome'];
const TIMING = [1300, 1500, 1500, 1700, 3000]; // how long each step stays on screen

/** The one memorable moment: a sentence in the notes becomes a quiz question, then gets answered. */
export function HeroDemo() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? 4 : 0);
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % 5), TIMING[step]);
    return () => clearTimeout(t);
  }, [step, reduce]);

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-primary/30 via-transparent to-accent/20 blur-3xl" />

      {/* Notes */}
      <div className="glass rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2 text-[13px] text-muted"><FileText className="h-4 w-4" />Cell Biology: Lecture 4.pdf <span className="ml-auto">page 6</span></div>
        <p className="text-[15px] leading-7 text-fg/90">
          Mitochondria are the site of{' '}
          <motion.mark className="rounded px-0.5 text-fg" style={{ backgroundImage: 'linear-gradient(rgb(var(--primary)/.4), rgb(var(--primary)/.4))', backgroundRepeat: 'no-repeat', backgroundColor: 'transparent' }}
            animate={{ backgroundSize: step >= 1 ? '100% 100%' : '0% 100%' }} transition={{ duration: 0.9, ease: 'easeInOut' }}>
            aerobic respiration, producing most of the cell’s ATP
          </motion.mark>{' '}
          through the electron transport chain on the inner membrane.
        </p>
      </div>

      {/* Connector */}
      <div className="relative mx-auto h-10 w-px bg-gradient-to-b from-primary/60 to-transparent">
        <AnimatePresence>
          {step === 2 && <motion.span initial={{ top: 0, opacity: 0 }} animate={{ top: '100%', opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute -left-[3px] h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_12px_rgb(var(--accent))]" />}
        </AnimatePresence>
      </div>

      {/* Question */}
      <div className="glass min-h-[290px] rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between text-[13px]">
          <span className="flex items-center gap-1.5 text-primary"><Sparkles className="h-4 w-4" />{step < 3 ? (step === 2 ? 'Writing a question…' : 'Waiting for a note') : 'Multiple choice'}</span>
          <AnimatePresence>{step === 4 && <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-full bg-success/15 px-2.5 py-0.5 font-medium text-success">+40 XP</motion.span>}</AnimatePresence>
        </div>
        {step < 3 ? (
          <div className="space-y-3" aria-hidden="true">
            {[88, 64, 100, 100, 100].map((w, i) => (
              <div key={i} className="relative h-4 overflow-hidden rounded-md bg-fg/[.07]" style={{ width: `${w}%`, opacity: step === 2 ? 1 : 0.4 }}>
                {step === 2 && <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-fg/15 to-transparent" />}
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="font-display text-[17px] font-semibold leading-snug">Which organelle produces most of a cell’s ATP?</p>
            <ul className="mt-4 space-y-2">
              {OPTIONS.map((o, i) => {
                const picked = step === 4 && i === 1;
                return (
                  <motion.li key={o} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className={cn('flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-colors duration-300', picked ? 'border-success bg-success/15 text-fg' : 'border-line bg-fg/[.03] text-muted')}>
                    {o}{picked && <Check className="h-4 w-4 text-success" />}
                  </motion.li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
