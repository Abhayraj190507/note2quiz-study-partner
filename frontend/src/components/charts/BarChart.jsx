import { motion } from 'framer-motion';

/** Vertical bars. `data` = [{ label, value }]. Highlights `active` index. */
export function BarChart({ data, height = 160, active, unit = '' }) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
      {data.map((d, i) => (
        <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2 text-center">
          <span className="text-[11px] tabular-nums text-muted">{d.value}{unit}</span>
          <motion.div className={`w-full rounded-md ${i === active ? 'bg-primary' : 'bg-primary/35'}`} initial={{ height: 0 }} whileInView={{ height: `${(d.value / max) * 78}%` }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.05, ease: [0.2, 0.8, 0.2, 1] }} />
          <span className="text-[11px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
