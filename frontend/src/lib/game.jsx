import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { useToast } from './toast';

/**
 * Shared progress state (XP, level, streak, activity). Every module reads and writes it,
 * so finishing a quiz, a focus session or a planner task all move the same numbers.
 * Persisted in localStorage. Swap for your backend later.
 */
const KEY = 'n2q-react-game-v1';
const USER_KEY = 'n2q-react-user';
export const XP_PER_LEVEL = 500;
const H = 3600000;

/** A brand-new account starts with nothing: no XP, no streak, no activity. */
const empty = () => ({ xp: 0, streak: 0, coins: 0, activity: [] });

/** Sample progress, shown only to visitors who have not created an account (demo mode). */
const seed = () => ({
  xp: 3860, streak: 12, coins: 240,
  activity: [
    { id: 1, kind: 'quiz', text: 'Scored 90% on Cell Biology quiz', xp: 90, at: Date.now() - 2 * H },
    { id: 2, kind: 'cards', text: 'Reviewed 24 flashcards', xp: 48, at: Date.now() - 5 * H },
    { id: 3, kind: 'focus', text: 'Finished a 25 min focus session', xp: 50, at: Date.now() - 22 * H },
    { id: 4, kind: 'notes', text: 'Uploaded Thermodynamics Lecture 6.pdf', xp: 20, at: Date.now() - 30 * H },
  ],
});

function reducer(state, a) {
  if (a.type === 'award')
    return {
      ...state, xp: state.xp + a.xp, coins: state.coins + Math.round(a.xp / 5),
      activity: [{ id: Math.random(), kind: a.kind, text: a.text, xp: a.xp, at: Date.now() }, ...state.activity].slice(0, 12),
    };
  if (a.type === 'reset') return a.state;
  return state;
}

const readUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } };
/** Remove every saved n2q-react-* value (progress, notes, planner, ...) so a new account never inherits old or demo data. */
const wipeData = () => {
  try { Object.keys(localStorage).filter((k) => k.startsWith('n2q-react-') && k !== USER_KEY).forEach((k) => localStorage.removeItem(k)); } catch {}
};

const Ctx = createContext(null);
export const useGame = () => useContext(Ctx);

export function GameProvider({ children }) {
  const toast = useToast();
  const [user, setUserState] = useState(readUser);
  const [s, dispatch] = useReducer(reducer, null, () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || (readUser() ? empty() : seed()); } catch { return readUser() ? empty() : seed(); }
  });
  // Demo visitors (no account) keep nothing between visits; real accounts are saved.
  useEffect(() => { try { if (user) localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }, [s, user]);

  const saveUser = (u) => { setUserState(u); try { u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY); } catch {} };
  /** Create an account: wipe demo data and start from zero. */
  const signUp = useCallback(({ name, email }) => {
    wipeData(); dispatch({ type: 'reset', state: empty() });
    saveUser({ name: name.trim().replace(/\s+/g, ' '), email: email.trim(), college: '' });
  }, []);
  /** Log in: same email keeps its data; a different or first-time email starts clean (no accounts server yet). */
  const login = useCallback(({ email }) => {
    const old = readUser(); const same = old && old.email.toLowerCase() === email.trim().toLowerCase();
    if (same) { saveUser(old); return; }
    wipeData(); dispatch({ type: 'reset', state: empty() });
    const n = email.split('@')[0].replace(/[._-]+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
    saveUser({ name: n || 'Student', email: email.trim(), college: '' });
  }, []);
  /** Log out and return to demo mode with sample data. */
  const logout = useCallback(() => { wipeData(); saveUser(null); dispatch({ type: 'reset', state: seed() }); }, []);

  const awardXp = useCallback((xp, text, kind = 'quiz') => {
    dispatch({ type: 'award', xp, text, kind });
    toast(`+${xp} XP`, text);
  }, [toast]);

  const value = useMemo(() => {
    const level = Math.floor(s.xp / XP_PER_LEVEL) + 1;
    const into = s.xp % XP_PER_LEVEL;
    return {
      ...s, level, into, progress: into / XP_PER_LEVEL, toNext: XP_PER_LEVEL - into, awardXp,
      user, isDemo: !user, setUser: saveUser, signUp, login, logout,
    };
  }, [s, awardXp, user, signUp, login, logout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
