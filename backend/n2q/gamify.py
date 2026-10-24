import time
from datetime import date, datetime, timedelta

from flask import current_app

from .db import get_db, many, one, now

BADGES = [
    ("streak7", "Week warrior", "Study 7 days in a row", "🔥", lambda u: u["streak"] >= 7),
    ("xp1k", "First thousand", "Earn 1,000 XP", "⚡", lambda u: u["xp"] >= 1000),
    ("lvl5", "Level 5", "Reach level 5", "🎓", lambda u: level(u["xp"]) >= 5),
    ("streak30", "Unstoppable", "Study 30 days in a row", "🚀", lambda u: u["streak"] >= 30),
    ("xp5k", "Scholar", "Earn 5,000 XP", "🏆", lambda u: u["xp"] >= 5000),
    ("lvl12", "Level 12", "Reach level 12", "👑", lambda u: level(u["xp"]) >= 12),
]


def level(xp):
    return xp // current_app.config["XP_PER_LEVEL"] + 1


def award_xp(user_id, xp, text, kind):
    """Single place where XP, coins, streak and the activity feed change."""
    db = get_db()
    u = one("SELECT xp, streak, last_active FROM users WHERE id = ?", (user_id,))
    today = date.today()
    last = date.fromisoformat(u["last_active"]) if u["last_active"] else None
    if last == today:
        streak = u["streak"] or 1
    elif last == today - timedelta(days=1):
        streak = u["streak"] + 1
    else:
        streak = 1
    db.execute("UPDATE users SET xp = xp + ?, coins = coins + ?, streak = ?, last_active = ? WHERE id = ?",
               (xp, xp // 5, streak, today.isoformat(), user_id))
    db.execute("INSERT INTO activity(user_id, kind, text, xp, at) VALUES (?,?,?,?,?)", (user_id, kind, text, xp, now()))
    db.commit()


def progress(user):
    per = current_app.config["XP_PER_LEVEL"]
    into = user["xp"] % per
    return {"xp": user["xp"], "coins": user["coins"], "streak": user["streak"], "level": level(user["xp"]),
            "into": into, "toNext": per - into, "progress": round(into / per, 4)}


def badges(user):
    return [{"id": i, "name": n, "desc": d, "emoji": e, "earned": bool(fn(user))} for i, n, d, e, fn in BADGES]


def day_start(days_ago=0):
    d = datetime.combine(date.today() - timedelta(days=days_ago), datetime.min.time())
    return time.mktime(d.timetuple())
