import json

from flask import Blueprint, g, jsonify, request

from .. import ai
from ..db import jload, many, now, one, run
from ..errors import ApiError, body, text_field
from ..security import login_required
from .notes import collect_text

bp = Blueprint("partner", __name__, url_prefix="/api/partner")
MODES = ("general", "doubt", "explain", "expert")


def _session(sid):
    s = one("SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?", (sid, g.user["id"]))
    if not s:
        raise ApiError(404, "not_found", "Chat not found.")
    return s


def _msg(m):
    return {"id": m["id"], "role": m["role"], "text": m["text"], "src": jload(m["sources"], []), "at": m["created_at"]}


@bp.post("/chat")
@login_required
def chat():
    """Body: {message, mode?, sessionId?, noteIds?}. Answers from the user's own notes (keyword retrieval + Claude if configured)."""
    d = body()
    message = text_field(d, "message", max_len=2000)
    mode = d.get("mode") if d.get("mode") in MODES else "general"
    if d.get("sessionId"):
        s = _session(int(d["sessionId"]))
        sid = s["id"]
    else:
        sid = run("INSERT INTO chat_sessions(user_id, title, mode, created_at, updated_at) VALUES (?,?,?,?,?)",
                  (g.user["id"], message[:60], mode, now(), now()))
    history = [{"role": m["role"], "text": m["text"]} for m in many("SELECT role, text FROM chat_messages WHERE session_id = ? ORDER BY id", (sid,))]
    notes = collect_text(d.get("noteIds"))
    reply = ai.chat(mode, message, history, ai.retrieve(message, [(n, t) for n, t, _ in notes]))
    run("INSERT INTO chat_messages(session_id, role, text, created_at) VALUES (?,?,?,?)", (sid, "user", message, now()))
    mid = run("INSERT INTO chat_messages(session_id, role, text, sources, created_at) VALUES (?,?,?,?,?)",
              (sid, "ai", reply["text"], json.dumps(reply["sources"]), now()))
    run("UPDATE chat_sessions SET updated_at = ?, mode = ? WHERE id = ?", (now(), mode, sid))
    return jsonify({"sessionId": sid, "message": _msg(one("SELECT * FROM chat_messages WHERE id = ?", (mid,)))})


@bp.get("/sessions")
@login_required
def sessions():
    rows = many("SELECT id, title, mode, updated_at FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50", (g.user["id"],))
    return jsonify({"sessions": [dict(r) for r in rows]})


@bp.get("/sessions/<int:sid>")
@login_required
def session(sid):
    s = _session(sid)
    msgs = many("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY id", (sid,))
    return jsonify({"session": {"id": s["id"], "title": s["title"], "mode": s["mode"]}, "messages": [_msg(m) for m in msgs]})


@bp.delete("/sessions/<int:sid>")
@login_required
def delete(sid):
    _session(sid)
    run("DELETE FROM chat_sessions WHERE id = ?", (sid,))
    return jsonify({"ok": True})
