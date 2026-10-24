import hashlib
import json

from flask import Blueprint, g, jsonify, request

from .. import ai
from ..db import jload, many, one, run
from ..errors import ApiError
from ..security import login_required
from .notes import collect_text

bp = Blueprint("revision", __name__, url_prefix="/api/revision")


@bp.get("")
@login_required
def pack():
    """?subject=Biology. Builds quick notes, checklist, formulas and definitions from that subject's notes (cached until notes change)."""
    subject = request.args.get("subject", "All")
    notes = collect_text(None, subject)
    if not notes:
        raise ApiError(400, "no_notes", "Upload notes for this subject to build a revision pack.")
    text = "\n\n".join(t for _, t, _ in notes)
    digest = hashlib.sha256(text.encode()).hexdigest()
    hit = one("SELECT digest, data FROM revision_cache WHERE user_id = ? AND subject = ?", (g.user["id"], subject))
    if hit and hit["digest"] == digest:
        return jsonify({"subject": subject, "cached": True, **jload(hit["data"], {})})
    rows = many("SELECT analysis FROM notes WHERE user_id = ? AND status = 'ready' AND (? = 'All' OR folder = ?)", (g.user["id"], subject, subject))
    merged = {"formulas": [], "definitions": []}
    for r in rows:
        a = jload(r["analysis"], {})
        merged["formulas"] += a.get("formulas", []); merged["definitions"] += a.get("definitions", [])
    data = ai.revision_pack(text, merged)
    run("INSERT INTO revision_cache(user_id, subject, digest, data) VALUES (?,?,?,?) ON CONFLICT(user_id, subject) DO UPDATE SET digest = excluded.digest, data = excluded.data",
        (g.user["id"], subject, digest, json.dumps(data)))
    return jsonify({"subject": subject, "cached": False, **data})
