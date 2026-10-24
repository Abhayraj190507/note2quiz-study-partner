# Note2Quiz backend

Flask + SQLite REST API for the React app in `../frontend`. JSON in, JSON out, JWT auth.

## Run it
```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                   # then edit SECRET_KEY (and ANTHROPIC_API_KEY if you have one)
python run.py                                          # http://localhost:5000/api/health
python -m unittest discover -s tests -v                # 17 tests
```
Then start the frontend (`cd ../frontend && npm run dev`). Vite forwards `/api` to port 5000.

## AI
- **With `ANTHROPIC_API_KEY`**: summaries, quizzes, flashcards, study-partner answers and revision packs come from Claude (`ANTHROPIC_MODEL`).
- **Without it**: a built-in offline generator builds them from the note text (definitions, formulas, fill-in-the-blank, keyword retrieval). It works, but questions are simpler. `GET /api/health` shows which mode is active.
- If a Claude call fails, the request falls back to the offline generator instead of erroring.

## Endpoints (all under `/api`, JSON; send `Authorization: Bearer <token>` except auth routes)
| Area | Endpoints |
|---|---|
| Auth | `POST auth/signup` `auth/login` `auth/forgot-password` `auth/reset-password` `auth/change-password` · `GET/PATCH auth/me` |
| Notes | `GET notes?folder=&q=` · `POST notes` (multipart `files`+`folder`, or JSON `{name,text,folder}`) · `GET/PATCH/DELETE notes/<id>` · `POST notes/<id>/analyze` |
| Quiz | `POST quiz/generate {subject,count,types:[m,t,f],difficulty,noteIds}` · `GET quiz/<id>` · `POST quiz/<id>/submit {answers,seconds}` · `GET quiz/attempts`, `quiz/attempts/<id>` |
| Flashcards | `GET flashcards?due=1&tag=&q=&bookmarked=1` · `POST flashcards` · `POST flashcards/generate {noteId\|text,count}` · `PATCH/DELETE flashcards/<id>` · `POST flashcards/review {reviews:[{id,rating}]}` |
| Study partner | `POST partner/chat {message,mode,sessionId,noteIds}` · `GET partner/sessions`, `partner/sessions/<id>` · `DELETE partner/sessions/<id>` |
| Planner | `GET planner?start=&days=` · `POST planner/tasks` · `PATCH/DELETE planner/tasks/<id>` · `POST planner/ai-plan` |
| Focus | `POST focus/sessions {minutes,taskId}` · `GET focus/summary` |
| Revision | `GET revision?subject=` |
| Stats | `GET dashboard` `analytics?range=week\|month\|quarter` `achievements` `leaderboard?scope=global\|college\|friends&period=week\|month\|all` · `GET/POST friends` · `DELETE friends/<id>` |

Errors are always `{"error": {"code", "message", "fields?"}}` with a matching HTTP status (401 login needed, 404 not yours/not found, 422 bad input, 429 rate limited).

## Behaviour worth knowing
- **XP is server-side** (quiz 10/correct +20 if ≥80%, notes 20, cards 2 each, focus 2/min, planner task 15 once, 500 XP per level). The streak updates on the first XP of each day.
- Quiz answers are graded on the server (`m` = option index, `t` = true/false, `f` = text, case-insensitive). A quiz can be submitted once.
- Every query is scoped to the logged-in user. Passwords use scrypt; reset links are single-use and stored hashed.
- Uploads: PDF, DOCX, PPTX, TXT/MD, images. Only extracted text is stored. **Images are stored without text (OCR isn't bundled)**: `PATCH notes/<id> {text}` to paste the text in.
- Accounts are active as soon as they sign up; there is no email verification. Password-reset emails are printed to the server log until you set `SMTP_*`.

## Deploy
`Procfile` (Render/Railway/Heroku) and `Dockerfile` are included. Set `APP_ENV=production`, `SECRET_KEY`, `FRONTEND_ORIGINS`, `APP_URL`, and put `DATABASE` on a persistent disk. SQLite suits one server; for several, move to Postgres and swap the rate limiter for Redis.

## Not included yet
OCR for images, streaming (SSE) chat replies, and the frontend pages are still on sample data. `frontend/src/lib/api.js` is the ready-made client to wire them up.
