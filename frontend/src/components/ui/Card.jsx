import { cn } from '../../lib/utils';

export const Card = ({ className, children, ...p }) => (
  <div className={cn('glass rounded-2xl p-5', className)} {...p}>{children}</div>
);

export const CardHeader = ({ title, sub, action, className }) => (
  <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
    <div className="min-w-0">
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {sub && <p className="mt-0.5 text-[13px] text-muted">{sub}</p>}
    </div>
    {action}
  </div>
);
