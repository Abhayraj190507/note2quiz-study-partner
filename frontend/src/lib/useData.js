import { useMemo } from 'react';
import { useGame } from './game';
import * as demo from '../data/app';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** What a brand-new account sees: no files, no history, no scores. */
const blank = {
  week: DAYS.map((label) => ({ label, value: 0 })),
  goals: [
    { label: 'Study hours', now: 0, max: 10, unit: 'h', tone: 'primary' },
    { label: 'Quizzes', now: 0, max: 4, unit: '', tone: 'accent' },
    { label: 'Flashcards', now: 0, max: 60, unit: '', tone: 'success' },
  ],
  subjects: [], weakTopics: [], notes: [], deck: [], sessions: [],
  planner: DAYS.slice(0, 5).map((day) => ({ day, tasks: [] })),
  board: [],
  revision: { checklist: demo.revision.checklist, formulas: [], definitions: [], quick: [] },
};

/**
 * One place that decides between sample data (visitors without an account) and
 * empty data (anyone who has created an account). Pages call this instead of importing data/app directly.
 */
export function useData() {
  const { isDemo, user } = useGame();
  return useMemo(() => {
    if (isDemo) return { ...demo, isDemo: true, user: demo.user };
    const first = user.name.split(' ')[0];
    return { ...demo, ...blank, isDemo: false, user: { name: user.name, first, college: user.college || '' } };
  }, [isDemo, user]);
}
