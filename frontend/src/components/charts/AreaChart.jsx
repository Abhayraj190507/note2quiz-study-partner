import { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { smoothPath } from './path';

/** Responsive area/line chart with hover tooltip. `series` = [{ name, data, tone }] (first one is filled). */
export function AreaChart({ series, labels, height = 240, unit = '', max: forceMax }) {
  const id = useId();
  const [hover, setHover] = useState(null);
  const W = 640; const H = height; const pad = { l: 34, r: 12, t: 14, b: 26 };
  const max = forceMax ?? Math.ceil(Math.max(...series.flatMap((s) => s.data)) * 1.15 / 10) * 10;
  const x = (i) => pad.l + (i / (labels.length - 1)) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t));
  const step = Math.max(1, Math.ceil(labels.length / 8));

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Chart" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: `rgb(var(--${series[0].tone || 'primary'}))`, stopOpacity: 0.35 }} /><stop offset="1" style={{ stopColor: `rgb(var(--${series[0].tone || 'primary'}))`, stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}><line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="stroke-fg/10" strokeDasharray="3 5" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="fill-muted text-[11px]">{t}</text></g>
        ))}
        {labels.map((l, i) => i % step === 0 && <text key={l + i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-muted text-[11px]">{l}</text>)}
        {series.map((s, k) => {
          const pts = s.data.map((v, i) => [x(i), y(v)]); const line = smoothPath(pts);
          return (
            <g key={s.name}>
              {k === 0 && <motion.path d={`${line} L${x(s.data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${id})`} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }} />}
              <motion.path d={line} fill="none" strokeWidth="2.5" strokeLinecap="round" className={`stroke-${s.tone || 'primary'}`} strokeDasharray={k ? '5 5' : undefined}
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeOut' }} />
            </g>
          );
        })}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} className="stroke-fg/20" />}
        {hover != null && series.map((s) => <circle key={s.name} cx={x(hover)} cy={y(s.data[hover])} r="4.5" className={`fill-bg stroke-2 stroke-${s.tone || 'primary'}`} />)}
        {labels.map((l, i) => <rect key={i} x={x(i) - (W / labels.length) / 2} y={0} width={W / labels.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={-1} />)}
      </svg>
      {hover != null && (
        <div className="pointer-events-none absolute top-1 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > labels.length / 2 ? '-110%' : '10%'})` }}>
          <p className="mb-1 font-medium">{labels[hover]}</p>
          {series.map((s) => <p key={s.name} className="text-muted"><span className={`mr-1.5 inline-block h-2 w-2 rounded-full bg-${s.tone || 'primary'}`} />{s.name}: <b className="text-fg">{s.data[hover]}{unit}</b></p>)}
        </div>
      )}
    </div>
  );
}
