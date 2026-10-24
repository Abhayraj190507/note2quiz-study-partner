import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useToast } from './toast';

/**
 * Shared progress state (XP, level, streak, activity). Every module reads and writes it,
 * so finishing a quiz, a focus session or a planner task all move the same numbers.
 * Persisted in localStorage. Swap for your backend later.
 */
const KEY = 'n2q-react-game-v1';
export const XP_PER_LEVEL = 500;
const H = 3600000;

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
  return state;
}

const Ctx = createContext(null);
export const useGame = () => useContext(Ctx);

export function GameProvider({ children }) {
  const toast = useToast();
  const [s, dispatch] = useReducer(reducer, null, () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { return seed(); }
  });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }, [s]);

  const awardXp = useCallback((xp, text, kind = 'quiz') => {
    dispatch({ type: 'award', xp, text, kind });
    toast(`+${xp} XP`, text);
  }, [toast]);

  const value = useMemo(() => {
    const level = Math.floor(s.xp / XP_PER_LEVEL) + 1;
    const into = s.xp % XP_PER_LEVEL;
    return { ...s, level, into, progress: into / XP_PER_LEVEL, toNext: XP_PER_LEVEL - into, awardXp };
  }, [s, awardXp]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
