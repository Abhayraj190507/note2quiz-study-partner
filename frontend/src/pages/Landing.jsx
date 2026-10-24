import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Play, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Backdrop } from '../components/common/Backdrop';
import { Sparkline } from '../components/charts/Sparkline';
import { HeroDemo } from './landing/HeroDemo';
import { ProductTabs } from './landing/ProductTabs';
import { AiShowcase } from './landing/AiShowcase';
import { features, stats, testimonials, faqs } from '../data/landing';
import { useCountUp } from '../hooks/useCountUp';
import { cn } from '../lib/utils';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } } };

function Section({ id, className, children }) {
  return <section id={id} className={cn('page scroll-mt-20 py-20 sm:py-28', className)}>{children}</section>;
}

function Stat({ n, label, suffix }) {
  const [ref, v] = useCountUp(n, { duration: 1.6 });
  return <div><p className="font-display text-4xl font-semibold tabular-nums sm:text-5xl"><span ref={ref}>{v}</span>{suffix}</p><p className="mt-2 max-w-[220px] text-sm text-muted">{label}</p></div>;
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 py-5 text-left font-medium">
        {q}<motion.span animate={{ rotate: open ? 45 : 0 }} className="text-muted"><Plus className="h-5 w-5" /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="max-w-2xl pb-5 text-muted">{a}</p></motion.div>}
      </AnimatePresence>
    </div>
  );
}

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <Backdrop />
        <div className="page grid items-center gap-14 pb-20 pt-32 sm:pt-40 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-28">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.p variants={item} className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-fg/[.04] px-3.5 py-1.5 text-[13px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />Now answering from your own lecture notes
            </motion.p>
            <motion.h1 variants={item} className="text-[2.6rem] font-bold leading-[1.04] tracking-[-0.035em] text-balance sm:text-6xl lg:text-[4.1rem]">Your notes, turned into the quiz you’ll be asked.</motion.h1>
            <motion.p variants={item} className="mt-6 max-w-xl text-lg text-muted">Upload lecture notes. Note2Quiz writes the questions, schedules the flashcards, and answers your doubts with the page number to check.</motion.p>
            <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
              <Button to="/signup" size="lg">Start studying free <ArrowRight className="h-4 w-4" /></Button>
              <Button to="/app" size="lg" variant="secondary"><Play className="h-4 w-4" />Try the live demo</Button>
            </motion.div>
            <motion.p variants={item} className="mt-6 text-sm text-muted">Works with PDF, Word, slides, plain text and photos of your notes.</motion.p>
          </motion.div>
          <HeroDemo />
        </div>
      </div>

      {/* Stats */}
      <div className="border-y border-line bg-fg/[.02]">
        <div className="page grid grid-cols-2 gap-8 py-12 lg:grid-cols-4">{stats.map((s) => <Stat key={s.label} {...s} />)}</div>
      </div>

      {/* Features */}
      <Section id="features">
        <h2 className="max-w-2xl font-display text-3xl font-semibold sm:text-4xl text-balance">Everything between “I have notes” and “I know this”.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map((f, i) => (
            <div key={f.title} className={cn('glass group relative overflow-hidden rounded-2xl p-6 transition hover:border-primary/40', f.span)}>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><f.icon className="h-5 w-5" /></span>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 max-w-md text-[15px] text-muted">{f.body}</p>
              {i === 0 && <div className="mt-6 flex flex-wrap gap-2">{['PDF', 'DOCX', 'PPT', 'TXT', 'PNG'].map((t) => <span key={t} className="rounded-md border border-line bg-fg/[.04] px-2.5 py-1 text-xs text-muted">{t}</span>)}</div>}
              {i === 4 && <Sparkline data={[3, 5, 4, 7, 6, 9, 8, 12, 11, 15]} tone="accent" className="mt-6 h-14 w-full" />}
            </div>
          ))}
        </div>
      </Section>

      {/* Product */}
      <Section id="product" className="pt-0 sm:pt-0">
        <div className="mb-10 max-w-2xl"><h2 className="font-display text-3xl font-semibold sm:text-4xl text-balance">One workspace for the whole study loop.</h2><p className="mt-4 text-muted">Click through the real screens. Every one is in the app you can open right now.</p></div>
        <ProductTabs />
      </Section>

      {/* AI */}
      <Section id="ai" className="pt-4 sm:pt-4"><AiShowcase /></Section>

      {/* Testimonials */}
      <Section className="pt-4 sm:pt-4">
        <h2 className="max-w-xl font-display text-3xl font-semibold sm:text-4xl text-balance">Students notice the difference in their marks.</h2>
        <div className="mt-12 grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
          {testimonials.map((t, i) => (
            <figure key={t.name} className={cn('glass flex flex-col justify-between rounded-2xl p-6', i === 0 && 'lg:p-8')}>
              <blockquote className={cn('text-fg/90', i === 0 ? 'font-display text-xl leading-snug lg:text-2xl' : 'text-[15px]')}>“{t.q}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-white">{t.name[0]}</span><span className="text-sm"><b className="font-medium">{t.name}</b><br /><span className="text-muted">{t.role}</span></span></figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="pt-4 sm:pt-4">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]"><h2 className="font-display text-3xl font-semibold sm:text-4xl">Questions students ask first</h2><div className="border-t border-line">{faqs.map((f) => <Faq key={f.q} {...f} />)}</div></div>
      </Section>

      {/* CTA */}
      <Section className="pt-4 sm:pt-4">
        <div className="glass relative overflow-hidden rounded-3xl p-8 text-center sm:p-16">
          <div className="absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/30 blur-[100px]" aria-hidden="true" />
          <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-semibold sm:text-5xl text-balance">Make tonight’s study session count.</h2>
          <p className="relative mx-auto mt-4 max-w-md text-muted">Upload one lecture and take your first quiz in under a minute.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3"><Button to="/signup" size="lg">Create your free account</Button><Button to="/app" size="lg" variant="secondary">Explore the app</Button></div>
        </div>
      </Section>
    </>
  );
}
