import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { BookOpenCheck, Quote, ShieldCheck } from 'lucide-react';
import { useStream } from '../../hooks/useStream';

const ANSWER = 'Entropy measures how spread out energy is. In an isolated system it never decreases, which is why heat flows from hot to cold and never the other way round. For a reversible process, ΔS = Q / T.';

export function AiShowcase() {
  const ref = useRef(null); const inView = useInView(ref, { once: true, margin: '-120px' });
  const { shown, done } = useStream(ANSWER, { start: inView, speed: 38 });
  const points = [
    [Quote, 'Every answer cites the file and page it came from.'],
    [ShieldCheck, 'If your notes do not cover it, the partner says so instead of guessing.'],
    [BookOpenCheck, 'Turn any reply into flashcards or a quiz with one click.'],
  ];
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div>
        <h2 className="font-display text-3xl font-semibold sm:text-4xl text-balance">Ask your notes a question and get a straight answer.</h2>
        <p className="mt-4 max-w-md text-muted">General chatbots answer from the whole internet. The study partner answers from the lectures you actually sat through, so what you learn matches what you’ll be examined on.</p>
        <ul className="mt-8 space-y-4">{points.map(([I, t]) => <li key={t} className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent"><I className="h-[18px] w-[18px]" /></span><span className="pt-1.5 text-fg/90">{t}</span></li>)}</ul>
      </div>
      <div ref={ref} className="glass rounded-2xl p-5 sm:p-6">
        <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-white">I don’t get entropy. Can you explain it simply?</p>
        <div className="mt-4 min-h-[170px] rounded-2xl rounded-bl-md border border-line bg-fg/[.03] p-4 text-[15px] leading-7">
          {shown || <span className="inline-flex gap-1 py-2">{[0, 1, 2].map((i) => <i key={i} className="h-2 w-2 animate-dot rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>}
          {!done && shown && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-blink bg-accent" />}
          {done && <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-accent">Thermodynamics Lecture 6.pdf, p. 11</span><span className="rounded-full bg-fg/[.07] px-2.5 py-0.5 text-xs text-muted">Make flashcards</span></div>}
        </div>
      </div>
    </div>
  );
}
