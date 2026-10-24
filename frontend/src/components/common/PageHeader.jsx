export const PageHeader = ({ title, sub, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="font-display text-2xl font-semibold sm:text-[28px]">{title}</h1>
      {sub && <p className="mt-1 max-w-xl text-muted">{sub}</p>}
    </div>
    {action}
  </div>
);
