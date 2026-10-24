import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-primary text-white shadow-[0_0_0_1px_rgb(var(--primary)/.6),0_8px_24px_-8px_rgb(var(--primary)/.7)] hover:brightness-110',
  secondary: 'glass hover:bg-fg/5',
  ghost: 'text-muted hover:bg-fg/[.07] hover:text-fg',
  danger: 'bg-danger/15 text-danger hover:bg-danger/25',
};
const sizes = { sm: 'h-8 px-3 text-[13px]', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' };

/** Renders a router <Link> when `to` is passed, otherwise a <button>. */
export const Button = forwardRef(function Button({ variant = 'primary', size = 'md', to, className, children, ...rest }, ref) {
  const cls = cn(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[.97] disabled:pointer-events-none disabled:opacity-50',
    variants[variant], sizes[size], className,
  );
  return to
    ? <Link ref={ref} to={to} className={cls} {...rest}>{children}</Link>
    : <button ref={ref} className={cls} {...rest}>{children}</button>;
});
