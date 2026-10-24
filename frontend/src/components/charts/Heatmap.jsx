/** Study-consistency grid. `weeks` = array of 7-number arrays (0-4 intensity). */
const shade = ['bg-fg/[.06]', 'bg-primary/25', 'bg-primary/45', 'bg-primary/70', 'bg-primary'];
export function Heatmap({ weeks }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scroll-hide" role="img" aria-label="Study consistency heatmap">
      {weeks.map((w, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          {w.map((v, j) => <span key={j} title={`${v} / 4`} className={`h-4 w-4 rounded-[5px] sm:h-[18px] sm:w-[18px] ${shade[v]}`} />)}
        </div>
      ))}
    </div>
  );
}
