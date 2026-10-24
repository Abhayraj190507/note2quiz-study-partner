import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { MarketingLayout } from './components/layout/MarketingLayout';

// Each page is its own chunk, so the landing page loads fast and the app code only loads when needed.
const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Notes = lazy(() => import('./pages/Notes'));
const StudyPartner = lazy(() => import('./pages/StudyPartner'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Flashcards = lazy(() => import('./pages/Flashcards'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Planner = lazy(() => import('./pages/Planner'));
const Focus = lazy(() => import('./pages/Focus'));
const Revision = lazy(() => import('./pages/Revision'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Achievements = lazy(() => import('./pages/Achievements'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Loading = () => (
  <div className="grid min-h-[50vh] place-items-center" role="status" aria-label="Loading">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<MarketingLayout />}><Route index element={<Landing />} /></Route>

        <Route path="login" element={<Auth mode="login" />} />
        <Route path="signup" element={<Auth mode="signup" />} />
        <Route path="forgot-password" element={<Auth mode="forgot" />} />
        <Route path="reset-password" element={<Auth mode="reset" />} />

        <Route path="app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="notes" element={<Notes />} />
          <Route path="partner" element={<StudyPartner />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="flashcards" element={<Flashcards />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="planner" element={<Planner />} />
          <Route path="focus" element={<Focus />} />
          <Route path="revision" element={<Revision />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="achievements" element={<Achievements />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
