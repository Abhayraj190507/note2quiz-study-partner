import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, MailCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/common/Logo';
import { Backdrop } from '../components/common/Backdrop';
import { ThemeToggle } from '../components/common/ThemeToggle';

const COPY = {
  login: { title: 'Welcome back', sub: 'Log in to pick up your streak.', cta: 'Log in', fields: ['email', 'password'] },
  signup: { title: 'Create your account', sub: 'Free for students. No card needed.', cta: 'Create account', fields: ['name', 'email', 'password'] },
  forgot: { title: 'Reset your password', sub: 'Enter your email and we’ll send a reset link.', cta: 'Send reset link', fields: ['email'] },
  reset: { title: 'Choose a new password', sub: 'Use at least 8 characters.', cta: 'Update password', fields: ['password', 'confirm'] },
};
const LABEL = { name: 'Full name', email: 'Email', password: 'Password', confirm: 'Confirm password' };
const AUTOCOMPLETE = { name: 'name', email: 'email', password: 'current-password', confirm: 'new-password' };


export default function Auth({ mode }) {
  const c = COPY[mode]; const nav = useNavigate();
  const [v, setV] = useState({ name: '', email: '', password: '', confirm: '' }); const [err, setErr] = useState({});
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false);

  const validate = () => {
    const e = {};
    if (c.fields.includes('name') && v.name.trim().length < 2) e.name = 'Enter your name.';
    if (c.fields.includes('email') && !/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email address.';
    if (c.fields.includes('password') && v.password.length < 8) e.password = 'Use at least 8 characters.';
    if (c.fields.includes('confirm') && v.confirm !== v.password) e.confirm = 'Passwords don’t match.';
    return e;
  };
  /** REPLACE the timeout with your real auth request. */
  const submit = (ev) => {
    ev.preventDefault(); const e = validate(); setErr(e); if (Object.keys(e).length) return;
    setBusy(true);
    setTimeout(() => { setBusy(false); if (mode === 'login' || mode === 'signup') nav('/app'); else if (mode === 'forgot') setSent(true); else nav('/login'); }, 800);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between"><Logo /><ThemeToggle /></div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <AnimatePresence mode="wait">
            <motion.div key={sent ? 'sent' : mode} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {sent ? (
                <div className="text-center"><span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-success/15 text-success"><MailCheck className="h-7 w-7" /></span><h1 className="font-display text-2xl font-semibold">Link sent</h1><p className="mt-2 text-muted">If {v.email} has an account, a reset link is on its way.</p><Button to="/reset-password" variant="secondary" className="mt-6">I have the link</Button></div>
              ) : (<>
                <h1 className="font-display text-3xl font-semibold">{c.title}</h1><p className="mt-2 text-muted">{c.sub}</p>
                <form onSubmit={submit} noValidate className="mt-6 space-y-4">
                  {c.fields.map((f) => (
                    <div key={f}>
                      <div className="mb-1.5 flex justify-between text-sm"><label htmlFor={f} className="font-medium">{LABEL[f]}</label>{f === 'password' && mode === 'login' && <Link to="/forgot-password" className="text-primary hover:underline">Forgot?</Link>}</div>
                      <div className="relative">
                        <input id={f} className="field" type={f === 'email' ? 'email' : f === 'name' ? 'text' : show ? 'text' : 'password'} autoComplete={AUTOCOMPLETE[f]} value={v[f]} onChange={(e) => setV({ ...v, [f]: e.target.value })} aria-invalid={!!err[f]} aria-describedby={err[f] ? `${f}-e` : undefined} />
                        {(f === 'password' || f === 'confirm') && <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-3 text-muted hover:text-fg">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
                      </div>
                      {err[f] && <p id={`${f}-e`} className="mt-1.5 text-[13px] text-danger">{err[f]}</p>}
                    </div>
                  ))}
                  <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? 'Please wait…' : c.cta}</Button>
                </form>
                <p className="mt-6 text-center text-sm text-muted">
                  {mode === 'login' && <>New here? <Link to="/signup" className="text-primary hover:underline">Create an account</Link></>}
                  {mode === 'signup' && <>Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link></>}
                  {(mode === 'forgot' || mode === 'reset') && <Link to="/login" className="text-primary hover:underline">Back to log in</Link>}
                </p>
              </>)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-line bg-fg/[.02] lg:flex lg:items-center lg:justify-center lg:p-14">
        <Backdrop />
        <div className="glass max-w-md rounded-3xl p-8">
          <Sparkles className="h-6 w-6 text-primary" />
          <p className="mt-5 font-display text-2xl font-semibold leading-snug text-balance">“I stopped rewriting my notes and started testing myself on them.”</p>
          <p className="mt-6 text-sm text-muted">Priya N., Chemistry. Went from a C to an A- in one term.</p>
        </div>
      </div>
    </div>
  );
}
