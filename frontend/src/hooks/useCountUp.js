import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/** Counts from 0 to `to` the first time the element scrolls into view. */
export function useCountUp(to, { duration = 1.4, decimals = 0 } = {}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration, ease: [0.2, 0.8, 0.2, 1], onUpdate: (x) => setV(x) });
    return () => c.stop();
  }, [inView, to, duration, reduce]);
  return [ref, decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()];
}
