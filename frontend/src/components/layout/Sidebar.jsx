import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Sparkles } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Progress } from '../ui/Progress';
import { NAV_GROUPS } from './nav';
import { useGame } from '../../lib/game';
import { cn } from '../../lib/utils';

export function Sidebar({ onNavigate }) {
  const g = useGame();
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div className="px-2 pt-1"><Logo to="/app" /></div>
      <nav className="flex-1 space-y-6" aria-label="Main">
        {NAV_GROUPS.map((grp) => (
          <div key={grp.title}>
            <p className="mb-2 px-3 text-xs font-medium text-muted">{grp.title}</p>
            <ul className="space-y-0.5">
              {grp.items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink to={to} end={end} onClick={onNavigate}
                    className={({ isActive }) => cn('relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors', isActive ? 'text-fg' : 'text-muted hover:bg-fg/[.05] hover:text-fg')}>
                    {({ isActive }) => (<>
                      {isActive && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-lg bg-primary/15 ring-1 ring-primary/30" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                      <Icon className={cn('relative h-[18px] w-[18px]', isActive && 'text-primary')} />
                      <span className="relative">{label}</span>
                    </>)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="glass rounded-xl p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 font-medium"><Sparkles className="h-4 w-4 text-primary" />Level {g.level}</span>
          <span className="flex items-center gap-1 text-warning"><Flame className="h-4 w-4" />{g.streak}</span>
        </div>
        <Progress value={g.progress * 100} />
        <p className="mt-2 text-xs text-muted">{g.toNext} XP to level {g.level + 1}</p>
      </div>
    </div>
  );
}
