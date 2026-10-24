import { Button } from '../components/ui/Button';
import { Logo } from '../components/common/Logo';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div><Logo /><p className="mt-10 font-display text-6xl font-bold">404</p><p className="mt-3 text-muted">That page doesn’t exist. It may have moved.</p><div className="mt-8 flex justify-center gap-3"><Button to="/">Go home</Button><Button to="/app" variant="secondary">Open the app</Button></div></div>
    </div>
  );
}
