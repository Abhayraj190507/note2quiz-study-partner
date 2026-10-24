import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/** Reveals `text` a few words at a time, like a streaming AI reply. Returns { shown, done }. */
export function useStream(text, { start = true, speed = 28 } = {}) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  const [n, setN] = useState(0);
  useEffect(() => { setN(0); }, [text]);
  useEffect(() => {
    if (!start) return;
    if (reduce) { setN(words.length); return; }
    if (n >= words.length) return;
    const t = setTimeout(() => setN((x) => x + 1), speed);
    return () => clearTimeout(t);
  }, [n, start, reduce, words.length, speed]);
  return { shown: words.slice(0, n).join(' '), done: n >= words.length };
}
