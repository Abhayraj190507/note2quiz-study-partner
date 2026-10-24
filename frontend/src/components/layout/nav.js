import { LayoutDashboard, FileText, MessagesSquare, ListChecks, Layers, BarChart3, CalendarDays, Timer, BookMarked, Trophy, Award } from 'lucide-react';

/** Single source of truth for navigation: sidebar, mobile drawer and the Cmd+K palette all read this. */
export const NAV_GROUPS = [
  { title: 'Learn', items: [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/notes', label: 'Notes', icon: FileText },
    { to: '/app/partner', label: 'AI Study Partner', icon: MessagesSquare },
    { to: '/app/quiz', label: 'Quizzes', icon: ListChecks },
    { to: '/app/flashcards', label: 'Flashcards', icon: Layers },
  ] },
  { title: 'Improve', items: [
    { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/app/planner', label: 'Planner', icon: CalendarDays },
    { to: '/app/focus', label: 'Focus mode', icon: Timer },
    { to: '/app/revision', label: 'Revision hub', icon: BookMarked },
  ] },
  { title: 'Compete', items: [
    { to: '/app/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/app/achievements', label: 'Achievements', icon: Award },
  ] },
];
export const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);
