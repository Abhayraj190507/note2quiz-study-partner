import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Progress = ({ value, tone = 'primary', className }) => (
  <div className={cn('h-2 overflow-hidden rounded-full bg-fg/[.08]', className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
    <motion.div className={cn('h-full rounded-full', `bg-${tone}`)} initial={{ width: 0 }} whileInView={{ width: `${Math.min(100, value)}%` }}
      viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }} />
  </div>
);
