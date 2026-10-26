import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Image as ImageIcon, Layers, ListChecks, MessagesSquare, Presentation, Search, Trash2, UploadCloud } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { PageHeader } from '../components/common/PageHeader';
import { useGame } from '../lib/game';
import { useToast } from '../lib/toast';
import { useData } from '../lib/useData';
import { cn } from '../lib/utils';

const ICON = { PDF: FileText, DOCX: FileText, PPT: Presentation, TXT: FileText, IMG: ImageIcon };
const NOTES_KEY = 'n2q-react-notes'; // "n2q-react-" prefix: cleared on logout/new account like other saved data
const ago = (t) => { if (!t) return 'Earlier'; const m = Math.floor((Date.now() - t) / 60000); if (m < 1) return 'Just now'; if (m < 60) return `${m} min ago`; const h = Math.floor(m / 60); if (h < 24) return `${h} h ago`; return `${Math.floor(h / 24)} d ago`; };
const load = (seed) => { try { const s = JSON.parse(localStorage.getItem(NOTES_KEY)); if (Array.isArray(s)) return s.map((x) => x.status === 'analysing' ? { ...x, status: 'ready', summary: x.summary || 'Saved.' } : x); } catch {} return seed; };
const readText = (f) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result || '')); r.onerror = () => res(''); r.readAsText(f); });
const typeOf = (name) => { const e = name.split('.').pop().toUpperCase(); return ['PDF', 'DOCX', 'PPT', 'PPTX', 'TXT'].includes(e) ? e.replace('PPTX', 'PPT') : 'IMG'; };

export default function Notes() {
  const { awardXp } = useGame(); const toast = useToast(); const input = useRef(null); const { notes: seedNotes, folders } = useData();
  const [files, setFiles] = useState(() => load(seedNotes));
  useEffect(() => { try { localStorage.setItem(NOTES_KEY, JSON.stringify(files)); } catch {} }, [files]); const [drag, setDrag] = useState(false);
  const [q, setQ] = useState(''); const [folder, setFolder] = useState('All'); const [sel, setSel] = useState(seedNotes[0]?.id ?? null);

  const add = (list) => {
    [...list].forEach(async (f) => {
      const id = Date.now() + Math.random();
      const type = typeOf(f.name);
      setFiles((p) => [{ id, name: f.name, type, size: `${Math.max(1, Math.round(f.size / 1024))} KB`, folder: 'All', pages: 1, at: Date.now(), status: 'analysing', summary: '', points: [] }, ...p]);
      setSel(id);
      // Plain-text files are actually read, so the summary reflects what you uploaded. Other formats need the backend to extract text.
      const text = type === 'TXT' ? (await readText(f)).slice(0, 20000) : '';
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const summary = text ? lines.slice(0, 2).join(' ').slice(0, 220) : 'File saved. Connect the backend to extract text and generate quizzes from this file.';
      const points = text ? lines.slice(0, 4).map((l) => l.slice(0, 90)) : ['Saved to your notes'];
      setTimeout(() => setFiles((p) => p.map((x) => x.id === id ? { ...x, status: 'ready', summary, points, text } : x)), 800);
      awardXp(20, `Uploaded ${f.name}`, 'notes');
    });
  };
  const remove = (id) => { setFiles((p) => p.filter((x) => x.id !== id)); setSel(null); };
  const shown = files.filter((f) => (folder === 'All' || f.folder === folder) && f.name.toLowerCase().includes(q.toLowerCase()));
  const cur = files.find((f) => f.id === sel);

  return (
    <div className="space-y-6">
      <PageHeader title="Notes" sub="Everything the quizzes, flashcards and study partner learn from." />
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        className={cn('rounded-2xl border-2 border-dashed p-8 text-center transition', drag ? 'border-primary bg-primary/10' : 'border-line')}>
        <motion.span animate={{ y: drag ? -4 : 0 }} className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary"><UploadCloud className="h-6 w-6" /></motion.span>
        <p className="font-medium">Drop files here, or <button onClick={() => input.current?.click()} className="text-primary underline-offset-2 hover:underline">browse</button></p>
        <p className="mt-1 text-sm text-muted">PDF, DOCX, PPT, TXT and images. Select several at once.</p>
        <input ref={input} type="file" multiple hidden accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*" onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs"><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" /><input className="field pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files" aria-label="Search files" /></div>
        <Segmented options={folders} value={folder} onChange={setFolder} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {shown.map((f) => { const I = ICON[f.type] || FileText; return (
            <button key={f.id} onClick={() => setSel(f.id)} className={cn('glass flex items-start gap-3 rounded-2xl p-4 text-left transition hover:-translate-y-0.5', sel === f.id && 'border-primary/60 ring-1 ring-primary/40')}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><I className="h-5 w-5" /></span>
              <span className="min-w-0"><span className="block truncate text-sm font-medium">{f.name}</span><span className="text-xs text-muted">{f.size}, {f.at ? ago(f.at) : f.when}</span><span className="mt-2 flex gap-1.5"><Badge>{f.type}</Badge>{f.folder !== 'All' && <Badge tone="accent">{f.folder}</Badge>}</span></span>
            </button>); })}
          {!shown.length && <p className="col-span-full rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">{files.length ? 'No files match. Clear the search or pick another folder.' : 'No notes yet. Drop a file above to get started.'}</p>}
        </div>
        <Card className="h-fit lg:sticky lg:top-24">
          <AnimatePresence mode="wait">
            {cur && (
              <motion.div key={cur.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="font-display text-base font-semibold">{cur.name}</h2>
                {cur.status === 'analysing' ? <p className="mt-4 flex items-center gap-2 text-sm text-muted"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />Analysing your notes…</p> : (<>
                  <p className="mt-3 text-sm text-muted">{cur.summary}</p>
                  <ul className="mt-4 space-y-2 text-sm">{cur.points.map((p) => <li key={p} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{p}</li>)}</ul>
                  <div className="mt-5 grid gap-2"><Button to="/app/quiz"><ListChecks className="h-4 w-4" />Generate quiz</Button>
                    <div className="grid grid-cols-2 gap-2"><Button variant="secondary" size="sm" onClick={() => toast('Flashcards created', `From ${cur.name}`)}><Layers className="h-4 w-4" />Flashcards</Button><Button to="/app/partner" variant="secondary" size="sm"><MessagesSquare className="h-4 w-4" />Ask partner</Button></div>
                    <Button variant="secondary" size="sm" onClick={() => remove(cur.id)}><Trash2 className="h-4 w-4" />Delete note</Button></div>
                </>)}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
