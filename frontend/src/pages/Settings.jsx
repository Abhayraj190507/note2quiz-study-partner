import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/common/PageHeader';
import { FormError } from '../components/common/State';
import { api } from '../lib/api';
import { useGame } from '../lib/game';
import { useToast } from '../lib/toast';

export default function Settings() {
  const { user, setUser, logout } = useGame(); const toast = useToast(); const nav = useNavigate();
  const [p, setP] = useState({ name: user.name, college: user.college || '' }); const [pe, setPe] = useState(''); const [pb, setPb] = useState(false);
  const [w, setW] = useState({ current: '', password: '' }); const [we, setWe] = useState(''); const [wb, setWb] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault(); setPb(true); setPe('');
    try { const r = await api.patch('/auth/me', p); setUser(r.user); toast('Profile saved'); } catch (x) { setPe(x.fields ? Object.values(x.fields)[0] : x.message); } finally { setPb(false); }
  };
  const savePassword = async (e) => {
    e.preventDefault(); setWb(true); setWe('');
    try { await api.post('/auth/change-password', w); setW({ current: '', password: '' }); toast('Password changed'); } catch (x) { setWe(x.fields ? Object.values(x.fields)[0] : x.message); } finally { setWb(false); }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" sub="Your profile and account." />
      <Card>
        <CardHeader title="Profile" sub="Your college is used for the “My college” leaderboard." />
        <form onSubmit={saveProfile} className="space-y-4">
          <FormError>{pe}</FormError>
          <div><label htmlFor="name" className="mb-1.5 block text-sm font-medium">Full name</label><input id="name" className="field" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></div>
          <div><label htmlFor="college" className="mb-1.5 block text-sm font-medium">College or school</label><input id="college" className="field" value={p.college} onChange={(e) => setP({ ...p, college: e.target.value })} placeholder="Optional" maxLength={120} /></div>
          <div className="text-sm text-muted">Email: {user.email}</div>
          <Button type="submit" disabled={pb}>{pb ? 'Saving…' : 'Save profile'}</Button>
        </form>
      </Card>
      <Card>
        <CardHeader title="Change password" />
        <form onSubmit={savePassword} className="space-y-4">
          <FormError>{we}</FormError>
          <div><label htmlFor="cur" className="mb-1.5 block text-sm font-medium">Current password</label><input id="cur" type="password" autoComplete="current-password" className="field" value={w.current} onChange={(e) => setW({ ...w, current: e.target.value })} /></div>
          <div><label htmlFor="new" className="mb-1.5 block text-sm font-medium">New password</label><input id="new" type="password" autoComplete="new-password" className="field" value={w.password} onChange={(e) => setW({ ...w, password: e.target.value })} /></div>
          <Button type="submit" disabled={wb || !w.current || w.password.length < 8}>{wb ? 'Saving…' : 'Change password'}</Button>
        </form>
      </Card>
      <Button variant="secondary" onClick={() => { logout(); nav('/', { replace: true }); }}><LogOut className="h-4 w-4" />Log out</Button>
    </div>
  );
}
