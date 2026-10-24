from datetime import date, datetime, timedelta

from flask import Blueprint, g, jsonify, request

from ..db import get_db, many, now, one, run
from ..errors import ApiError, body, int_field, text_field
from ..gamify import award_xp
from ..security import login_required

bp = Blueprint("productivity", __name__, url_prefix="/api")


def _day(v, default=None):
    if v is None:
        if default:
            return default
        raise ApiError(422, "invalid_field", "day is required (YYYY-MM-DD).", {"day": "Required."})
    try:
        return date.fromisoformat(str(v)).isoformat()
    except ValueError:
        raise ApiError(422, "invalid_field", "day must look like 2026-10-24.", {"day": "Use YYYY-MM-DD."})


def task_json(t):
    return {"id": t["id"], "t": t["title"], "title": t["title"], "day": t["day"], "m": t["minutes"], "minutes": t["minutes"], "done": bool(t["done"])}


def _task(tid):
    t = one("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (tid, g.user["id"]))
    if not t:
        raise ApiError(404, "not_found", "Task not found.")
    return t


@bp.get("/planner")
@login_required
def planner():
    """?start=YYYY-MM-DD&days=7 (default: this week from Monday). Returns tasks grouped per day."""
    today = date.today()
    start = date.fromisoformat(_day(request.args.get("start"), (today - timedelta(days=today.weekday())).isoformat()))
    days = max(1, min(int(request.args.get("days", 7) or 7), 62))
    end = start + timedelta(days=days - 1)
    rows = many("SELECT * FROM tasks WHERE user_id = ? AND day BETWEEN ? AND ? ORDER BY day, id", (g.user["id"], start.isoformat(), end.isoformat()))
    out = []
    for i in range(days):
        d = start + timedelta(days=i)
        out.append({"date": d.isoformat(), "day": d.strftime("%a"), "tasks": [task_json(t) for t in rows if t["day"] == d.isoformat()]})
    return jsonify({"days": out})


@bp.post("/planner/tasks")
@login_required
def add_task():
    d = body()
    tid = run("INSERT INTO tasks(user_id, title, day, minutes, created_at) VALUES (?,?,?,?,?)",
              (g.user["id"], text_field(d, "title", max_len=140), _day(d.get("day")), int_field(d, "minutes", lo=5, hi=480, default=25), now()))
    return jsonify({"task": task_json(_task(tid))}), 201


@bp.patch("/planner/tasks/<int:tid>")
@login_required
def edit_task(tid):
    t, d = _task(tid), body()
    done = int(bool(d["done"])) if "done" in d else t["done"]
    run("UPDATE tasks SET title = ?, day = ?, minutes = ?, done = ? WHERE id = ?",
        (text_field(d, "title", max_len=140) if "title" in d else t["title"], _day(d["day"]) if "day" in d else t["day"],
         int_field(d, "minutes", lo=5, hi=480) if "minutes" in d else t["minutes"], done, tid))
    xp = 0
    if done and not t["xp_awarded"]:  # pay once per task, so ticking/unticking can't farm XP
        xp = 15
        run("UPDATE tasks SET xp_awarded = 1 WHERE id = ?", (tid,))
        award_xp(g.user["id"], xp, f"Finished: {t['title']}", "planner")
    return jsonify({"task": task_json(_task(tid)), "xp": xp})


@bp.delete("/planner/tasks/<int:tid>")
@login_required
def delete_task(tid):
    _task(tid)
    run("DELETE FROM tasks WHERE id = ?", (tid,))
    return jsonify({"ok": True})


@bp.post("/planner/ai-plan")
@login_required
def ai_plan():
    """Adds one revision task per weak topic over the coming days (weakest first), skipping ones already planned."""
    weak = many("""SELECT subject, topic, CAST(correct AS REAL) / total AS r FROM topic_stats
                   WHERE user_id = ? AND total >= 2 ORDER BY r ASC, total DESC LIMIT 5""", (g.user["id"],))
    if not weak:
        raise ApiError(400, "no_data", "Take a quiz first so I know which topics to focus on.")
    existing = {r["title"] for r in many("SELECT title FROM tasks WHERE user_id = ? AND day >= ?", (g.user["id"], date.today().isoformat()))}
    added = []
    for i, w in enumerate(weak):
        title = f"Revise {w['topic']} ({w['subject']})"
        if title in existing:
            continue
        tid = run("INSERT INTO tasks(user_id, title, day, minutes, created_at) VALUES (?,?,?,?,?)",
                  (g.user["id"], title, (date.today() + timedelta(days=i)).isoformat(), 30, now()))
        added.append(task_json(_task(tid)))
    return jsonify({"tasks": added}), 201


# ------------------------------- focus mode -------------------------------
@bp.post("/focus/sessions")
@login_required
def log_focus():
    d = body()
    minutes = int_field(d, "minutes", lo=1, hi=180)
    task_id = d.get("taskId")
    if task_id:
        _task(int(task_id))
    run("INSERT INTO focus_sessions(user_id, task_id, minutes, created_at) VALUES (?,?,?,?)", (g.user["id"], task_id, minutes, now()))
    xp = minutes * 2
    award_xp(g.user["id"], xp, f"Finished a {minutes} min focus session", "focus")
    return jsonify({"xp": xp}), 201


@bp.get("/focus/summary")
@login_required
def focus_summary():
    start = datetime.combine(date.today(), datetime.min.time()).timestamp()
    wk = datetime.combine(date.today() - timedelta(days=6), datetime.min.time()).timestamp()
    row = lambda since: one("SELECT COUNT(*) n, COALESCE(SUM(minutes),0) m FROM focus_sessions WHERE user_id = ? AND created_at >= ?", (g.user["id"], since))
    t, w = row(start), row(wk)
    return jsonify({"today": {"sessions": t["n"], "minutes": t["m"]}, "week": {"sessions": w["n"], "minutes": w["m"]}})
