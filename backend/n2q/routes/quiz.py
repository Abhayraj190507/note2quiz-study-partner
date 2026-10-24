import json

from flask import Blueprint, g, jsonify, request

from .. import ai
from ..db import get_db, jload, many, now, one, run
from ..errors import ApiError, body, int_field, text_field
from ..gamify import award_xp
from ..security import login_required
from .notes import collect_text

bp = Blueprint("quiz", __name__, url_prefix="/api/quiz")


def norm(s):
    return " ".join(str(s).strip().lower().split())


def is_right(q, a):
    if q["t"] == "f":
        return norm(a) == norm(q["a"])
    if q["t"] == "t":
        return isinstance(a, bool) and a == q["a"]
    return isinstance(a, int) and not isinstance(a, bool) and a == q["a"]


def answer_text(q):
    return q["o"][q["a"]] if q["t"] == "m" else ("True" if q["a"] else "False") if q["t"] == "t" else q["a"]


@bp.post("/generate")
@login_required
def generate():
    d = body()
    count = int_field(d, "count", lo=1, hi=30, default=6)
    types = [t for t in d.get("types", ["m", "t", "f"]) if t in ("m", "t", "f")] or ["m", "t", "f"]
    difficulty = d.get("difficulty", "medium") if d.get("difficulty") in ("easy", "medium", "hard") else "medium"
    subject = text_field(d, "subject", required=False, max_len=60) or "General"
    notes = collect_text(d.get("noteIds"), None if d.get("noteIds") else subject)
    if not notes:
        raise ApiError(400, "no_notes", "Upload notes for this subject first, then I can build a quiz from them.")
    text = "\n\n".join(t for _, t, _ in notes)
    topics = [t for n in notes for t in jload(one("SELECT analysis FROM notes WHERE user_id = ? AND name = ?", (g.user["id"], n[0]))["analysis"], {}).get("topics", [])][:6]
    questions = ai.make_quiz(text, count=count, types=types, difficulty=difficulty, topics=topics)
    if not questions:
        raise ApiError(422, "not_enough_content", "Those notes don't have enough text to make questions. Add more detail and try again.")
    qid = run("INSERT INTO quizzes(user_id, subject, config, questions, created_at) VALUES (?,?,?,?,?)",
              (g.user["id"], subject, json.dumps({"count": count, "types": types, "difficulty": difficulty}), json.dumps(questions), now()))
    return jsonify({"quizId": qid, "subject": subject, "questions": questions,
                    "suggestedSeconds": len(questions) * 40}), 201


def _quiz(qid):
    q = one("SELECT * FROM quizzes WHERE id = ? AND user_id = ?", (qid, g.user["id"]))
    if not q:
        raise ApiError(404, "not_found", "Quiz not found.")
    return q


@bp.get("/<int:qid>")
@login_required
def get_quiz(qid):
    q = _quiz(qid)
    return jsonify({"quizId": qid, "subject": q["subject"], "questions": jload(q["questions"], [])})


@bp.post("/<int:qid>/submit")
@login_required
def submit(qid):
    """answers: list aligned with questions; each is an option index (m), boolean (t), string (f) or null (skipped)."""
    quiz, d = _quiz(qid), body()
    if one("SELECT 1 FROM quiz_attempts WHERE quiz_id = ?", (qid,)):
        raise ApiError(409, "already_submitted", "This quiz was already submitted. Generate a new one to try again.")
    questions = jload(quiz["questions"], [])
    answers = d.get("answers")
    if not isinstance(answers, list) or len(answers) > len(questions):
        raise ApiError(422, "invalid_field", "answers must be a list with one entry per question.")
    answers = answers + [None] * (len(questions) - len(answers))
    seconds = int_field(d, "seconds", lo=0, hi=36000, default=0)
    detail, correct = [], 0
    db = get_db()
    for q, a in zip(questions, answers):
        ok = a is not None and is_right(q, a)
        correct += ok
        detail.append({"q": q["q"], "t": q["t"], "topic": q["topic"], "given": a, "ok": ok, "answer": answer_text(q), "why": q["why"]})
        db.execute("""INSERT INTO topic_stats(user_id, subject, topic, correct, total) VALUES (?,?,?,?,1)
                      ON CONFLICT(user_id, subject, topic) DO UPDATE SET correct = correct + ?, total = total + 1""",
                   (g.user["id"], quiz["subject"], q["topic"], int(ok), int(ok)))
    total = len(questions)
    score = round(100 * correct / total) if total else 0
    aid = db.execute("INSERT INTO quiz_attempts(user_id, quiz_id, subject, total, correct, score, seconds, detail, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
                     (g.user["id"], qid, quiz["subject"], total, correct, score, seconds, json.dumps(detail), now())).lastrowid
    db.commit()
    xp = correct * 10 + (20 if score >= 80 else 0)
    if xp:
        award_xp(g.user["id"], xp, f"Scored {score}% on {quiz['subject']} quiz", "quiz")
    return jsonify({"attemptId": aid, "score": score, "correct": correct, "total": total, "seconds": seconds, "xp": xp, "detail": detail})


@bp.get("/attempts")
@login_required
def attempts():
    rows = many("SELECT id, subject, total, correct, score, seconds, created_at FROM quiz_attempts WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                (g.user["id"], min(int(request.args.get("limit", 20) or 20), 100)))
    return jsonify({"attempts": [dict(r) for r in rows]})


@bp.get("/attempts/<int:aid>")
@login_required
def attempt(aid):
    r = one("SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ?", (aid, g.user["id"]))
    if not r:
        raise ApiError(404, "not_found", "Attempt not found.")
    out = {k: r[k] for k in ("id", "subject", "total", "correct", "score", "seconds", "created_at")}
    detail = jload(r["detail"], [])
    by_topic = {}
    for x in detail:
        t = by_topic.setdefault(x["topic"], {"topic": x["topic"], "correct": 0, "total": 0})
        t["total"] += 1; t["correct"] += x["ok"]
    return jsonify({**out, "detail": detail, "topics": list(by_topic.values())})
