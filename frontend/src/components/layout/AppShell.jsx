import { useEffect, useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search, X, Zap } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { ThemeToggle } from '../common/ThemeToggle';
import { useGame } from '../../lib/game';

export function AppShell() {
  const [drawer, setDrawer] = useState(false); const [palette, setPalette] = useState(false);
  const { pathname } = useLocation(); const g = useGame();
  useEffect(() => { setDrawer(false); window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-bg/80 backdrop-blur-xl lg:block"><Sidebar /></aside>

      <AnimatePresence>
        {drawer && (<>
          <motion.div className="fixed inset-0 z-40 bg-black/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
          <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-surface lg:hidden" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
            <button onClick={() => setDrawer(false)} aria-label="Close menu" className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-fg/10"><X className="h-4 w-4" /></button>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </motion.aside>
        </>)}
      </AnimatePresence>

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-bg/75 px-4 backdrop-blur-xl sm:px-6">
        <button onClick={() => setDrawer(true)} aria-label="Open menu" className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-fg/[.07] lg:hidden"><Menu className="h-5 w-5" /></button>
        <button onClick={() => setPalette(true)} className="flex h-9 flex-1 items-center gap-2 rounded-xl border border-line bg-fg/[.03] px-3 text-sm text-muted transition hover:border-fg/20 sm:max-w-sm">
          <Search className="h-4 w-4" /><span className="flex-1 text-left">Search or jump to…</span><kbd className="hidden rounded border border-line px-1.5 text-[11px] sm:block">Ctrl K</kbd>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-[13px] font-medium text-primary sm:flex"><Zap className="h-3.5 w-3.5" />{g.xp.toLocaleString()} XP</span>
          <ThemeToggle />
          <Link to="/" className="hidden text-[13px] text-muted hover:text-fg md:block">Home</Link>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white" aria-label="Your profile">MC</span>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <AnimatePresence mode="wait">
          <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} className="mx-auto max-w-[1180px]">
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <CommandPalette open={palette} setOpen={setPalette} />
    </div>
  );
}
