/** Soft colour glow + grid used behind hero and auth screens. Pure CSS, no JS. */
export const Backdrop = () => (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <div className="bg-grid absolute inset-0" />
    <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
    <div className="absolute -top-10 right-[8%] h-[300px] w-[420px] rounded-full bg-accent/15 blur-[110px]" />
  </div>
);
