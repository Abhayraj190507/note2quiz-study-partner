import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, CornerDownLeft } from 'lucide-react';
import { ALL_NAV } from './nav';
import { cn } from '../../lib/utils';

/** Ctrl/Cmd + K jump-to menu. Open state lives in the parent so the top bar button can trigger it too. */
export function CommandPalette({ open, setOpen }) {
  const nav = useNavigate(); const [q, setQ] = useState(''); const [i, setI] = useState(0); const input = useRef(null);
  const items = useMemo(() => ALL_NAV.filter((n) => n.label.toLowerCase().includes(q.toLowerCase())), [q]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);
  useEffect(() => { if (open) { setQ(''); setI(0); setTimeout(() => input.current?.focus(), 30); } }, [open]);

  const go = (item) => { if (item) { nav(item.to); setOpen(false); } };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(x + 1, items.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(x - 1, 0)); }
    if (e.key === 'Enter') go(items[i]);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] grid place-items-start justify-items-center bg-black/50 px-4 pt-[14vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div role="dialog" aria-label="Jump to" className="glass w-full max-w-lg overflow-hidden rounded-2xl bg-surface" initial={{ y: -12, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: -8, scale: 0.98 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 text-muted" />
              <input ref={input} value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} onKeyDown={onKeyDown} placeholder="Jump to a page…" className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {items.map((n, k) => (
                <li key={n.to}>
                  <button onMouseEnter={() => setI(k)} onClick={() => go(n)} className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm', k === i ? 'bg-primary/15 text-fg' : 'text-muted')}>
                    <n.icon className="h-4 w-4" /><span className="flex-1">{n.label}</span>{k === i && <CornerDownLeft className="h-3.5 w-3.5" />}
                  </button>
                </li>
              ))}
              {!items.length && <li className="px-3 py-6 text-center text-sm text-muted">Nothing matches “{q}”.</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
