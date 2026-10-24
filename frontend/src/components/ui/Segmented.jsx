import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/** Pill-style tab / option switcher with a sliding highlight. */
export function Segmented({ options, value, onChange, className }) {
  const id = useId();
  return (
    <div className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-fg/[.03] p-1 scroll-hide', className)} role="tablist">
      {options.map((o) => {
        const v = o.value ?? o; const label = o.label ?? o; const on = v === value;
        return (
          <button key={v} role="tab" aria-selected={on} onClick={() => onChange(v)}
            className={cn('relative whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors', on ? 'text-fg' : 'text-muted hover:text-fg')}>
            {on && <motion.span layoutId={id} className="absolute inset-0 rounded-lg bg-fg/10 ring-1 ring-fg/10" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
