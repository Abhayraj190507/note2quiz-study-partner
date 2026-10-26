#!/usr/bin/env sh
# One command: builds the React app (first run), installs the backend, and serves everything on http://localhost:5000
set -e
cd "$(dirname "$0")"
if [ ! -f frontend/dist/index.html ]; then
  echo "Building the frontend (first run only)..."
  (cd frontend && npm install --no-audit --no-fund && npm run build)
fi
cd backend
[ -d .venv ] || python3 -m venv .venv
. .venv/bin/activate
pip install -q -r requirements.txt
[ -f .env ] || cp .env.example .env
echo "Note2Quiz is running at http://localhost:5000  (demo: /app, classic HTML demo: /classic/)"
python run.py
