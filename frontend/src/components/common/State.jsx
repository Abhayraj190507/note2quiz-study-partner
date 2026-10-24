import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const Spinner = ({ className = 'h-8 w-8' }) => <span className={`inline-block animate-spin rounded-full border-2 border-primary border-t-transparent ${className}`} />;

export const Loading = ({ label = 'Loading' }) => (
  <div className="grid min-h-[40vh] place-items-center" role="status" aria-label={label}><Spinner /></div>
);

export function ErrorCard({ error, onRetry }) {
  return (
    <Card className="mx-auto max-w-md text-center">
      <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-danger/15 text-danger"><AlertTriangle className="h-5 w-5" /></span>
      <p className="font-medium">{error?.message || 'Something went wrong.'}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>Try again</Button>}
    </Card>
  );
}

/** Shows a spinner on first load and an error card if nothing could be loaded; otherwise renders children. */
export function Gate({ state, children }) {
  if (state.loading && !state.data) return <Loading />;
  if (state.error && !state.data) return <ErrorCard error={state.error} onRetry={state.reload} />;
  return children;
}

export function Empty({ icon: Icon, title, body, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-10 text-center">
      {Icon && <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary"><Icon className="h-6 w-6" /></span>}
      <p className="font-display text-lg font-semibold">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-5 flex justify-center gap-2">{action}</div>}
    </div>
  );
}

export const FormError = ({ children }) => children ? <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{children}</p> : null;
