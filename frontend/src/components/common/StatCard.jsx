import { Card } from '../ui/Card';
import { Sparkline } from '../charts/Sparkline';
import { useCountUp } from '../../hooks/useCountUp';
import { cn } from '../../lib/utils';

/** Number card with optional trend chip and sparkline. `value` must be numeric. */
export function StatCard({ icon: Icon, label, value, suffix = '', delta, spark, tone = 'primary' }) {
  const [ref, shown] = useCountUp(value);
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className={cn('grid h-9 w-9 place-items-center rounded-lg', `bg-${tone}/15 text-${tone}`)}><Icon className="h-[18px] w-[18px]" /></span>
        {delta != null && <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', delta >= 0 ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger')}>{delta >= 0 ? '+' : ''}{delta}%</span>}
      </div>
      <p className="mt-4 font-display text-3xl font-semibold tabular-nums"><span ref={ref}>{shown}</span>{suffix}</p>
      <p className="text-[13px] text-muted">{label}</p>
      {spark && <Sparkline data={spark} tone={tone} className="absolute bottom-3 right-4 h-10 w-24 opacity-80" />}
    </Card>
  );
}
