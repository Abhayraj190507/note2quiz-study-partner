# Note2Quiz

Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run
Open `index.html` in any browser (or serve the folder with `npx serve`).

## Pages
- `index.html`: landing page (links to the dashboard and design system)
- `dashboard.html`: student dashboard
- `analyze.html`: AI note analysis (summary, key points, topics, concepts, formulas, definitions, highlights, mind map). Uses sample data; replace `analyzeNotes()` in `assets/js/analyze.js` with your API call.
- `quiz.html`: AI quiz generator (5 question types, difficulty, timer, count, topic and subject), playable quiz and results. Sample question bank; replace `build()` in `assets/js/quiz.js` with your AI call.
- `study-partner.html`: AI study partner (chat, doubt solving, topic explanation, subject expert modes, suggested questions, quick commands, chat history). Frontend only; replace `askStudyPartner()` in `assets/js/study-partner.js` with your API call.
- `flashcards.html`: flashcard module (AI-generated and manual cards, categories, search, bookmarks, spaced-repetition review, 3D flip cards). Frontend only; cards live in `localStorage` (`n2q-flashcards-v1`). Replace `generateFlashcards()` in `assets/js/flashcards.js` with your API call. Other pages hand cards over through the `n2q-flashcards-inbox` key: "Create flashcards" and "Make flashcard" on `analyze.html`, "Make flashcards" in the `notes.html` file preview, and "Make flashcards" under Study Partner replies. `dashboard.html` shows the live due count and links to `flashcards.html?review=1`.
- `revision-hub.html`: AI Revision Hub (quick notes, last-minute checklist, important questions with bookmarks, formula sheets, definitions, timed exam mode; subject switcher). Frontend only; progress lives in `localStorage` (`n2q-revision-hub-v1`). Content is the `DATA` object in `assets/js/revision-hub.js`; replace it (or add a `buildSubject()` call) with your AI API. "Make flashcards from these notes" hands the notes to `flashcards.html` through the `n2q-flashcards-inbox` key.
- `progress.html`: Learning analytics (daily/weekly/monthly progress, subject analysis radar and donut, quiz performance trend, insights). Hand-built SVG charts in `assets/js/learning.js`.
- `achievements.html`: Gamification (XP, levels, coins, missions, rewards shop, badges, tiered achievements). State in `localStorage` (`n2q-gamify-v1`); the Revision Hub mission reads `n2q-revision-hub-v1`. Activity data is generated from a seed; replace `DAYS` and `QZ` with real logs.
- `planner.html`: Study planner (daily, weekly, monthly views and goals). Tasks and goals in `localStorage` (`n2q-planner-v1`); finishing a task or goal adds XP and coins to `n2q-gamify-v1`. "AI plan my day" is a stub that adds tasks for weak topics.
- `focus.html`: Focus mode (Pomodoro timer, session tracking, full screen, space/F shortcuts). Sessions in `n2q-focus-v1`; each focus minute earns 2 XP. The task picker reads today's planner tasks.
- `leaderboard.html`: Global, college and friends boards for weekly, monthly and all-time XP, with podium, leagues and rank gap hints. Other users are seeded sample data; set `COLLEGE` at the top of the leaderboard block in `assets/js/productivity.js`.
- `result.html`: quiz result report (score, accuracy, time analysis, strengths/weaknesses; pie, bar, ring and heatmap charts). Sample attempt data at the top of `assets/js/result.js`.
- `design-system.html`: tokens and UI kit

## Structure
- `assets/css/`: one stylesheet per page
- `assets/js/`: one script per page

## Notes
- Fonts (Sora, Inter) load from Google Fonts; system fonts are used offline.
- All stats, names and testimonials are sample data.


## React frontend
`frontend/` contains the production React app that integrates every module above (landing, auth, dashboard, notes, study partner, quizzes, flashcards, analytics, planner, focus, revision, leaderboard, achievements). See `frontend/README.md`. The plain HTML files in this folder are unchanged.


## Backend
`backend/` is a Flask + SQLite REST API (auth, notes, AI quizzes, flashcards, study partner, planner, focus, analytics, leaderboard). See `backend/README.md`.
