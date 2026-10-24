import { motion } from 'framer-motion';

/** Radar / spider chart. `axes` = [{ label, value (0-100) }]. */
export function Radar({ axes, size = 280 }) {
  const c = size / 2; const R = size / 2 - 42; const n = axes.length;
  const pt = (i, v) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return [c + Math.cos(a) * R * v, c + Math.sin(a) * R * v]; };
  const poly = (v) => axes.map((a, i) => pt(i, v ?? a.value / 100).join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-[320px]" role="img" aria-label="Subject mastery radar">
      {[0.25, 0.5, 0.75, 1].map((r) => <polygon key={r} points={poly(r)} fill="none" className="stroke-fg/10" />)}
      {axes.map((a, i) => { const [x, y] = pt(i, 1); const [lx, ly] = pt(i, 1.2);
        return <g key={a.label}><line x1={c} y1={c} x2={x} y2={y} className="stroke-fg/10" />
          <text x={lx} y={ly + 4} textAnchor="middle" className="fill-muted text-[11px]">{a.label}</text></g>; })}
      <motion.polygon points={poly()} className="fill-primary/25 stroke-primary" strokeWidth="2" strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} style={{ transformOrigin: `${c}px ${c}px` }} transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }} />
      {axes.map((a, i) => { const [x, y] = pt(i, a.value / 100); return <circle key={a.label} cx={x} cy={y} r="3.5" className="fill-accent" />; })}
    </svg>
  );
}
