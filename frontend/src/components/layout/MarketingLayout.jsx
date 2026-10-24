import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo, LogoMark } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

const LINKS = [['Features', '#features'], ['Product', '#product'], ['AI partner', '#ai'], ['FAQ', '#faq']];

export function MarketingLayout() {
  const [scrolled, setScrolled] = useState(false); const [open, setOpen] = useState(false); const { pathname } = useLocation();
  useEffect(() => { const f = () => setScrolled(window.scrollY > 12); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, []);
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="relative">
      <header className={cn('fixed inset-x-0 top-0 z-50 transition-all', scrolled || open ? 'border-b border-line bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent')}>
        <div className="page flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Site">
            {LINKS.map(([l, h]) => <a key={l} href={`/${h}`} className="rounded-lg px-3 py-2 text-sm text-muted transition hover:text-fg">{l}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">Log in</Button>
            <Button to="/app" size="sm" className="hidden sm:inline-flex">Open the app</Button>
            <button className="grid h-9 w-9 place-items-center rounded-lg text-muted md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {open && (
          <div className="page flex flex-col gap-1 pb-4 md:hidden">
            {LINKS.map(([l, h]) => <a key={l} href={`/${h}`} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-muted hover:bg-fg/5">{l}</a>)}
            <div className="mt-2 flex gap-2"><Button to="/login" variant="secondary" className="flex-1">Log in</Button><Button to="/app" className="flex-1">Open the app</Button></div>
          </div>
        )}
      </header>
      <Outlet />
      <Footer />
    </div>
  );
}

function Footer() {
  const cols = [
    ['Product', [['Dashboard', '/app'], ['Quizzes', '/app/quiz'], ['AI Study Partner', '/app/partner'], ['Analytics', '/app/analytics']]],
    ['Study tools', [['Notes', '/app/notes'], ['Flashcards', '/app/flashcards'], ['Planner', '/app/planner'], ['Focus mode', '/app/focus']]],
    ['Account', [['Log in', '/login'], ['Sign up', '/signup'], ['Reset password', '/forgot-password']]],
  ];
  return (
    <footer className="border-t border-line">
      <div className="page grid gap-10 py-14 md:grid-cols-[1.4fr_2fr]">
        <div><Logo /><p className="mt-4 max-w-xs text-sm text-muted">Upload your notes. Get quizzes, flashcards and a study partner that answers from your own material.</p></div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {cols.map(([t, ls]) => <div key={t}><p className="mb-3 text-sm font-medium">{t}</p><ul className="space-y-2">{ls.map(([l, to]) => <li key={l}><Link to={to} className="text-sm text-muted transition hover:text-fg">{l}</Link></li>)}</ul></div>)}
        </div>
      </div>
      <div className="page flex flex-wrap items-center justify-between gap-3 border-t border-line py-6 text-[13px] text-muted">
        <span className="flex items-center gap-2"><LogoMark size={18} />© {new Date().getFullYear()} Note2Quiz</span><span>Built for students who’d rather study than reformat notes.</span>
      </div>
    </footer>
  );
}
