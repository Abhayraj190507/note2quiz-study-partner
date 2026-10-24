from flask import Blueprint, g, jsonify, request

from .. import ai
from ..db import get_db, many, now, one, run
from ..errors import ApiError, body, int_field, text_field
from ..gamify import award_xp
from ..security import login_required
from .notes import collect_text

bp = Blueprint("flashcards", __name__, url_prefix="/api/flashcards")
MIN, DAY = 60, 86400
RATINGS = ("again", "hard", "good", "easy")


def card_json(c):
    return {"id": c["id"], "q": c["q"], "a": c["a"], "tag": c["tag"], "bookmarked": bool(c["bookmarked"]), "noteId": c["note_id"],
            "dueAt": c["due_at"], "due": c["due_at"] <= now(), "intervalDays": c["interval_days"], "reps": c["reps"]}


def owned(cid):
    c = one("SELECT * FROM cards WHERE id = ? AND user_id = ?", (cid, g.user["id"]))
    if not c:
        raise ApiError(404, "not_found", "Card not found.")
    return c


def schedule(c, rating):
    """Small SM-2 variant. Returns (ease, interval_days, reps, due_at)."""
    ease, iv, reps, t = c["ease"], c["interval_days"], c["reps"], now()
    if rating == "again":
        return max(1.3, ease - 0.2), 0, 0, t + MIN
    if rating == "hard":
        return max(1.3, ease - 0.05), max(1, round(iv * 1.2)), reps + 1, t + max(1, round(iv * 1.2)) * DAY
    if rating == "good":
        iv = 3 if reps == 0 else max(3, round(max(iv, 1) * ease))
        return ease, iv, reps + 1, t + iv * DAY
    iv = 7 if reps == 0 else max(7, round(max(iv, 1) * ease * 1.3))
    return ease + 0.15, iv, reps + 1, t + iv * DAY


@bp.get("")
@login_required
def list_cards():
    a = request.args
    sql, args = "SELECT * FROM cards WHERE user_id = ?", [g.user["id"]]
    if a.get("tag") and a["tag"] != "All":
        sql += " AND tag = ?"; args.append(a["tag"])
    if a.get("bookmarked") == "1":
        sql += " AND bookmarked = 1"
    if a.get("due") == "1":
        sql += " AND due_at <= ?"; args.append(now())
    if a.get("q"):
        sql += " AND (q LIKE ? OR a LIKE ?)"; args += [f"%{a['q']}%"] * 2
    sql += " ORDER BY due_at ASC, id ASC LIMIT ?"; args.append(min(int(a.get("limit", 200) or 200), 500))
    cards = many(sql, args)
    due = one("SELECT COUNT(*) c FROM cards WHERE user_id = ? AND due_at <= ?", (g.user["id"], now()))["c"]
    tags = ["All"] + [r["tag"] for r in many("SELECT DISTINCT tag FROM cards WHERE user_id = ? ORDER BY tag", (g.user["id"],))]
    return jsonify({"cards": [card_json(c) for c in cards], "dueCount": due, "tags": tags})


@bp.post("")
@login_required
def create():
    d = body()
    cid = run("INSERT INTO cards(user_id, q, a, tag, due_at, created_at) VALUES (?,?,?,?,?,?)",
              (g.user["id"], text_field(d, "q", max_len=1000), text_field(d, "a", max_len=2000),
               text_field(d, "tag", required=False, max_len=40) or "General", now(), now()))
    return jsonify({"card": card_json(owned(cid))}), 201


@bp.post("/generate")
@login_required
def generate():
    """Body: {noteId} or {text} (+ count, tag). Cards are saved and returned."""
    d = body()
    count = int_field(d, "count", lo=1, hi=30, default=10)
    note_id = d.get("noteId")
    if note_id:
        notes = collect_text([note_id])
        if not notes:
            raise ApiError(404, "not_found", "Note not found or has no readable text yet.")
        text, tag, name = notes[0][1], text_field(d, "tag", required=False, max_len=40) or notes[0][2], notes[0][0]
    else:
        text, tag, name = text_field(d, "text", min_len=40, max_len=100000), text_field(d, "tag", required=False, max_len=40) or "General", "pasted text"
    cards = ai.make_cards(text, count)
    if not cards:
        raise ApiError(422, "not_enough_content", "Couldn't find enough material to make cards. Try longer notes.")
    db = get_db()
    ids = [db.execute("INSERT INTO cards(user_id, note_id, q, a, tag, due_at, created_at) VALUES (?,?,?,?,?,?,?)",
                      (g.user["id"], note_id if note_id else None, c["q"][:1000], c["a"][:2000], tag, now(), now())).lastrowid for c in cards]
    db.commit()
    award_xp(g.user["id"], 10, f"Created {len(ids)} flashcards from {name}", "cards")
    return jsonify({"cards": [card_json(owned(i)) for i in ids]}), 201


@bp.patch("/<int:cid>")
@login_required
def edit(cid):
    c, d = owned(cid), body()
    run("UPDATE cards SET q = ?, a = ?, tag = ?, bookmarked = ? WHERE id = ?",
        (text_field(d, "q", max_len=1000) if "q" in d else c["q"], text_field(d, "a", max_len=2000) if "a" in d else c["a"],
         text_field(d, "tag", max_len=40) if "tag" in d else c["tag"], int(bool(d["bookmarked"])) if "bookmarked" in d else c["bookmarked"], cid))
    return jsonify({"card": card_json(owned(cid))})


@bp.delete("/<int:cid>")
@login_required
def delete(cid):
    owned(cid)
    run("DELETE FROM cards WHERE id = ?", (cid,))
    return jsonify({"ok": True})


@bp.post("/review")
@login_required
def review():
    """Body: {reviews: [{id, rating: again|hard|good|easy}]}. Sending a whole session at once pays XP once (2 per card)."""
    reviews = body().get("reviews")
    if not isinstance(reviews, list) or not reviews or len(reviews) > 200:
        raise ApiError(422, "invalid_field", "Send 1-200 reviews.")
    db, done = get_db(), []
    for r in reviews:
        if not isinstance(r, dict) or r.get("rating") not in RATINGS:
            raise ApiError(422, "invalid_field", f"rating must be one of {', '.join(RATINGS)}.")
        c = owned(int(r.get("id", 0)))
        ease, iv, reps, due = schedule(c, r["rating"])
        db.execute("UPDATE cards SET ease = ?, interval_days = ?, reps = ?, due_at = ? WHERE id = ?", (ease, iv, reps, due, c["id"]))
        done.append(c["id"])
    db.commit()
    xp = 2 * len(done)
    award_xp(g.user["id"], xp, f"Reviewed {len(done)} flashcard{'s' if len(done) != 1 else ''}", "cards")
    return jsonify({"reviewed": len(done), "xp": xp, "cards": [card_json(owned(i)) for i in done]})
