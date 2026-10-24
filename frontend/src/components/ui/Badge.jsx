import { cn } from '../../lib/utils';

const tones = {
  primary: 'bg-primary/15 text-primary', accent: 'bg-accent/15 text-accent', success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning', danger: 'bg-danger/15 text-danger', muted: 'bg-fg/[.07] text-muted',
};
export const Badge = ({ tone = 'muted', className, children }) => (
  <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone], className)}>{children}</span>
);
