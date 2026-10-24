import { motion } from 'framer-motion';

/** Donut with legend. `parts` = [{ label, value, tone }]. */
export function Donut({ parts, center, sub }) {
  const total = parts.reduce((a, p) => a + p.value, 0); const r = 54; const C = 2 * Math.PI * r; let acc = 0;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 140 140" className="-rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" strokeWidth="16" className="stroke-fg/10" />
          {parts.map((p, i) => { const len = (p.value / total) * C; const off = -acc; acc += len;
            return <motion.circle key={p.label} cx="70" cy="70" r={r} fill="none" strokeWidth="16" className={`stroke-${p.tone}`} strokeDashoffset={off}
              initial={{ strokeDasharray: `0 ${C}` }} whileInView={{ strokeDasharray: `${Math.max(0, len - 3)} ${C}` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.1 }} />; })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center"><div><p className="font-display text-xl font-semibold">{center}</p><p className="text-[11px] text-muted">{sub}</p></div></div>
      </div>
      <ul className="min-w-[140px] flex-1 space-y-2 text-sm">
        {parts.map((p) => <li key={p.label} className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><i className={`h-2.5 w-2.5 rounded-full bg-${p.tone}`} />{p.label}</span><span className="tabular-nums text-muted">{Math.round((p.value / total) * 100)}%</span></li>)}
      </ul>
    </div>
  );
}
