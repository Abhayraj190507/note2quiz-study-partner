from datetime import date, datetime, timedelta

from flask import Blueprint, g, jsonify, request

from ..db import many, now, one, run
from ..errors import ApiError, body, text_field
from ..gamify import badges, day_start, progress
from ..security import login_required

bp = Blueprint("stats", __name__, url_prefix="/api")
WEEK_GOALS = {"hours": 10, "quizzes": 4, "flashcards": 60}
TONES = ["success", "accent", "primary", "warning", "danger"]


def _activity(uid, limit=12):
    return [{"id": a["id"], "kind": a["kind"], "text": a["text"], "xp": a["xp"], "at": a["at"] * 1000}
            for a in many("SELECT * FROM activity WHERE user_id = ? ORDER BY at DESC LIMIT ?", (uid, limit))]


def _daily_minutes(uid, days):
    """Study minutes per day = focus minutes + time spent in quizzes."""
    out = []
    for i in range(days - 1, -1, -1):
        a, b = day_start(i), day_start(i - 1)
        f = one("SELECT COALESCE(SUM(minutes),0) m FROM focus_sessions WHERE user_id = ? AND created_at >= ? AND created_at < ?", (uid, a, b))["m"]
        q = one("SELECT COALESCE(SUM(seconds),0) s FROM quiz_attempts WHERE user_id = ? AND created_at >= ? AND created_at < ?", (uid, a, b))["s"]
        d = date.today() - timedelta(days=i)
        out.append({"date": d.isoformat(), "label": d.strftime("%a"), "value": round(f + q / 60)})
    return out


def _subjects(uid):
    rows = many("SELECT subject, SUM(correct) c, SUM(total) t FROM topic_stats WHERE user_id = ? GROUP BY subject ORDER BY subject", (uid,))
    secs = {r["subject"]: r["s"] for r in many("SELECT subject, SUM(seconds) s FROM quiz_attempts WHERE user_id = ? GROUP BY subject", (uid,))}
    return [{"name": r["subject"], "mastery": round(100 * r["c"] / r["t"]), "minutes": round(secs.get(r["subject"], 0) / 60),
             "tone": TONES[i % len(TONES)]} for i, r in enumerate(rows)]


def _weak(uid, limit=4):
    rows = many("""SELECT subject, topic, ROUND(100.0 * correct / total) score FROM topic_stats
                   WHERE user_id = ? AND total >= 2 ORDER BY 1.0 * correct / total ASC, total DESC LIMIT ?""", (uid, limit))
    return [{"topic": r["topic"], "subject": r["subject"], "score": int(r["score"])} for r in rows]


@bp.get("/dashboard")
@login_required
def dashboard():
    u, wk = g.user, day_start(6)
    minutes = sum(d["value"] for d in _daily_minutes(u["id"], 7))
    quizzes = one("SELECT COUNT(*) c FROM quiz_attempts WHERE user_id = ? AND created_at >= ?", (u["id"], wk))["c"]
    cards = one("SELECT COALESCE(SUM(xp),0) / 2 c FROM activity WHERE user_id = ? AND kind = 'cards' AND text LIKE 'Reviewed%' AND at >= ?", (u["id"], wk))["c"]
    due = one("SELECT COUNT(*) c FROM cards WHERE user_id = ? AND due_at <= ?", (u["id"], now()))["c"]
    today = one("SELECT COUNT(*) n, COALESCE(SUM(done),0) d FROM tasks WHERE user_id = ? AND day = ?", (u["id"], date.today().isoformat()))
    return jsonify({
        "user": {"name": u["name"], "first": u["name"].split()[0], "college": u["college"]}, **progress(u),
        "week": _daily_minutes(u["id"], 7),
        "goals": [{"label": "Study hours", "now": round(minutes / 60, 1), "max": WEEK_GOALS["hours"], "unit": "h", "tone": "primary"},
                  {"label": "Quizzes", "now": quizzes, "max": WEEK_GOALS["quizzes"], "unit": "", "tone": "accent"},
                  {"label": "Flashcards", "now": int(cards), "max": WEEK_GOALS["flashcards"], "unit": "", "tone": "success"}],
        "subjects": _subjects(u["id"]), "weakTopics": _weak(u["id"]), "dueCards": due,
        "today": {"tasks": today["n"], "done": today["d"]}, "activity": _activity(u["id"]),
        "notesCount": one("SELECT COUNT(*) c FROM notes WHERE user_id = ?", (u["id"],))["c"]})


@bp.get("/analytics")
@login_required
def analytics():
    """?range=week|month|quarter"""
    days = {"week": 7, "month": 30, "quarter": 90}.get(request.args.get("range", "week"), 7)
    uid = g.user["id"]
    trend = many("SELECT subject, score, created_at FROM quiz_attempts WHERE user_id = ? ORDER BY created_at DESC LIMIT 12", (uid,))[::-1]
    heat = {r["d"]: r["xp"] for r in many(
        "SELECT date(at, 'unixepoch', 'localtime') d, SUM(xp) xp FROM activity WHERE user_id = ? AND at >= ? GROUP BY d", (uid, day_start(89)))}
    avg = one("SELECT ROUND(AVG(score)) a, COUNT(*) n FROM quiz_attempts WHERE user_id = ? AND created_at >= ?", (uid, day_start(days - 1)))
    return jsonify({
        "daily": _daily_minutes(uid, min(days, 31)), "subjects": _subjects(uid), "weakTopics": _weak(uid, 8),
        "quizTrend": [{"subject": r["subject"], "score": r["score"], "at": r["created_at"]} for r in trend],
        "heatmap": [{"date": (date.today() - timedelta(days=i)).isoformat(),
                     "xp": heat.get((date.today() - timedelta(days=i)).isoformat(), 0)} for i in range(89, -1, -1)],
        "averageScore": int(avg["a"]) if avg["a"] is not None else None, "quizzes": avg["n"]})


@bp.get("/achievements")
@login_required
def achievements():
    return jsonify({**progress(g.user), "badges": badges(g.user), "activity": _activity(g.user["id"], 30)})


# ------------------------------- leaderboard -------------------------------
@bp.get("/leaderboard")
@login_required
def leaderboard():
    """?scope=global|college|friends&period=week|month|all"""
    scope, period = request.args.get("scope", "global"), request.args.get("period", "week")
    since = {"week": day_start(6), "month": day_start(29)}.get(period, 0)
    me = g.user
    where, args = "", []
    if scope == "college":
        if not me["college"]:
            return jsonify({"rows": [], "me": None, "note": "Add your college in settings to see this board."})
        where, args = "AND u.college = ?", [me["college"]]
    elif scope == "friends":
        where, args = "AND (u.id = ? OR u.id IN (SELECT friend_id FROM friends WHERE user_id = ?))", [me["id"], me["id"]]
    rows = many(f"""SELECT u.id, u.name, u.college, COALESCE(SUM(a.xp), 0) xp FROM users u
                    LEFT JOIN activity a ON a.user_id = u.id AND a.at >= ? WHERE 1=1 {where}
                    GROUP BY u.id ORDER BY xp DESC, u.id ASC LIMIT 100""", [since, *args])
    board = [{"rank": i + 1, "id": r["id"], "name": r["name"], "college": r["college"], "xp": r["xp"], "you": r["id"] == me["id"]} for i, r in enumerate(rows)]
    mine = next((b for b in board if b["you"]), None)
    gap = None
    if mine and mine["rank"] > 1:
        above = board[mine["rank"] - 2]
        gap = {"toRank": above["rank"], "xp": above["xp"] - mine["xp"] + 1}
    return jsonify({"rows": board[:50], "me": mine, "gap": gap})


@bp.get("/friends")
@login_required
def friends():
    rows = many("SELECT u.id, u.name, u.college FROM friends f JOIN users u ON u.id = f.friend_id WHERE f.user_id = ? ORDER BY u.name", (g.user["id"],))
    return jsonify({"friends": [dict(r) for r in rows]})


@bp.post("/friends")
@login_required
def add_friend():
    email = text_field(body(), "email", max_len=200).lower()
    f = one("SELECT id, name, college FROM users WHERE email = ?", (email,))
    if not f or f["id"] == g.user["id"]:
        raise ApiError(404, "not_found", "No Note2Quiz account uses that email.")
    run("INSERT OR IGNORE INTO friends(user_id, friend_id) VALUES (?,?)", (g.user["id"], f["id"]))
    return jsonify({"friend": dict(f)}), 201


@bp.delete("/friends/<int:fid>")
@login_required
def remove_friend(fid):
    run("DELETE FROM friends WHERE user_id = ? AND friend_id = ?", (g.user["id"], fid))
    return jsonify({"ok": True})
