import { smoothPath } from './path';

export function Sparkline({ data, tone = 'primary', className }) {
  const max = Math.max(...data); const min = Math.min(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * 100, 28 - ((v - min) / (max - min || 1)) * 24]);
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d={smoothPath(pts)} fill="none" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" className={`stroke-${tone}`} />
    </svg>
  );
}
