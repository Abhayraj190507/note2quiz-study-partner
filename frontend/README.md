# Note2Quiz frontend (React)

A production-ready React app that brings every Note2Quiz module into one product:
landing page, auth, dashboard, notes, AI study partner, quizzes, flashcards, analytics,
planner, focus mode, revision hub, leaderboard and achievements.

**Stack:** React 18, Vite, React Router, Tailwind CSS, Framer Motion, Lucide icons.
The original plain HTML version is untouched in the parent folder.

## Run it (step by step)

1. Install Node.js 18 or newer from https://nodejs.org
2. Open a terminal in this `frontend` folder.
3. Install the packages (once):  `npm install`
4. Start the app:  `npm run dev`  (opens http://localhost:5173)
5. Make a production build:  `npm run build`, then preview it with `npm run preview`

## Deploy

Run `npm run build` and upload the `dist` folder to Netlify or Vercel.
`public/_redirects` and `vercel.json` already make page refreshes work on both.

The Netlify configuration excludes only `Publishdirectory` from secrets scanning
because it contains a public build output path. Scanning remains enabled for all
other environment variables. Configure the publish directory in Netlify's build
settings; it does not need a separate environment variable.

## Folder structure

```
src/
  main.jsx            entry: providers (router, toasts, shared progress state)
  App.jsx             all routes, lazy-loaded per page
  styles/index.css    theme tokens (dark + light) and shared utility classes
  lib/                utils, toast system, game state (XP, level, streak, activity)
  hooks/              useCountUp, useStream (streaming text)
  data/               sample data for every module (swap for your API)
  components/
    ui/               Button, Card, Badge, Progress, ProgressRing, Segmented
    charts/           AreaChart, BarChart, Radar, Donut, Heatmap, Sparkline (pure SVG)
    layout/           AppShell, Sidebar, CommandPalette, MarketingLayout, nav config
    common/           Logo, StatCard, PageHeader, ThemeToggle, Backdrop
  pages/              one file per screen (landing/ holds the hero demo and sections)
```

## How the modules are connected

`lib/game.jsx` holds XP, level, streak and recent activity in one place (saved in localStorage).
Finishing a quiz, reviewing flashcards, ticking a planner task, uploading notes or completing a
focus session all call `awardXp()`, so the dashboard, sidebar, achievements and leaderboard update together.

Navigation lives in `components/layout/nav.js` and feeds the sidebar, mobile drawer and the
Ctrl/Cmd + K command palette.

## Connecting a real backend

Each integration point is a single function with a comment saying `REPLACE`:

- `pages/StudyPartner.jsx`: `askPartner()` (your AI call)
- `pages/Auth.jsx`: the `setTimeout` inside `submit()` (your login request)
- `data/app.js`: sample notes, quiz bank, deck, planner and leaderboard

All names, stats and testimonials are sample data.
