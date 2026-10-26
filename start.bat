@echo off
rem One command: builds the React app (first run), installs the backend, and serves everything on http://localhost:5000
cd /d "%~dp0"
if not exist frontend\dist\index.html (
  echo Building the frontend ^(first run only^)...
  pushd frontend
  call npm install --no-audit --no-fund
  call npm run build
  popd
)
cd backend
if not exist .venv ( python -m venv .venv )
call .venv\Scripts\activate
pip install -q -r requirements.txt
if not exist .env ( copy .env.example .env >nul )
echo Note2Quiz is running at http://localhost:5000  ^(demo: /app, classic HTML demo: /classic/^)
python run.py
