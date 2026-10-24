import json

from flask import Blueprint, g, jsonify, request

from .. import ai
from ..db import jload, many, now, one, run
from ..errors import ApiError, body, text_field
from ..extract import extract, type_label
from ..gamify import award_xp
from ..security import login_required

bp = Blueprint("notes", __name__, url_prefix="/api/notes")


def _size(n):
    return f"{n / 1048576:.1f} MB" if n >= 1048576 else f"{max(1, round(n / 1024))} KB"


def note_json(n, full=False):
    a = jload(n["analysis"], {})
    out = {"id": n["id"], "name": n["name"], "type": n["type"], "size": _size(n["size_bytes"]), "folder": n["folder"],
           "pages": n["pages"], "createdAt": n["created_at"], "status": n["status"], "summary": n["summary"],
           "points": jload(n["points"], []), "topics": a.get("topics", [])}
    if full:
        out.update(definitions=a.get("definitions", []), formulas=a.get("formulas", []), text=n["text"])
    return out


def owned(note_id):
    n = one("SELECT * FROM notes WHERE id = ? AND user_id = ?", (note_id, g.user["id"]))
    if not n:
        raise ApiError(404, "not_found", "Note not found.")
    return n


def _store(name, raw_len, text, pages, status, folder):
    a = ai.analyze(text, name) if status == "ready" else {"summary": "", "points": [], "topics": [], "definitions": [], "formulas": []}
    nid = run("INSERT INTO notes(user_id,name,type,size_bytes,folder,pages,text,summary,points,analysis,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
              (g.user["id"], name, type_label(name), raw_len, folder, pages, text, a["summary"],
               json.dumps(a["points"]), json.dumps(a), status, now()))
    if status == "ready":
        award_xp(g.user["id"], 20, f"Uploaded {name}", "notes")
    return nid


@bp.get("")
@login_required
def list_notes():
    folder, q = request.args.get("folder", ""), request.args.get("q", "").strip().lower()
    rows = many("SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC", (g.user["id"],))
    shown = [n for n in rows if (not folder or folder == "All" or n["folder"] == folder) and q in n["name"].lower()]
    folders = ["All"] + sorted({n["folder"] for n in rows})
    return jsonify({"notes": [note_json(n) for n in shown], "folders": folders})


@bp.post("")
@login_required
def upload():
    """multipart/form-data with one or more `files` (+ optional `folder`), or JSON {name, text, folder} for pasted notes."""
    created, errors = [], []
    if request.files:
        folder = (request.form.get("folder") or "General").strip()[:60] or "General"
        for f in request.files.getlist("files") or request.files.getlist("file"):
            raw = f.read()
            name = (f.filename or "note.txt").strip()[:200]
            try:
                text, pages, status = extract(name, raw)
                created.append(note_json(one("SELECT * FROM notes WHERE id = ?", (_store(name, len(raw), text, pages, status, folder),)), True))
            except ValueError as e:
                errors.append({"name": name, "message": str(e)})
            except RuntimeError as e:
                raise ApiError(501, "extractor_missing", str(e))
    else:
        d = body()
        name = text_field(d, "name", max_len=200)
        text = text_field(d, "text", min_len=20, max_len=200000)
        nid = _store(name if "." in name else name + ".txt", len(text.encode()), text, max(1, len(text) // 3000), "ready",
                     text_field(d, "folder", required=False, max_len=60) or "General")
        created.append(note_json(one("SELECT * FROM notes WHERE id = ?", (nid,)), True))
    if not created and errors:
        raise ApiError(422, "upload_failed", errors[0]["message"])
    return jsonify({"notes": created, "errors": errors}), 201


@bp.get("/<int:note_id>")
@login_required
def get_note(note_id):
    return jsonify({"note": note_json(owned(note_id), True)})


@bp.patch("/<int:note_id>")
@login_required
def edit(note_id):
    n, d = owned(note_id), body()
    name = text_field(d, "name", max_len=200) if "name" in d else n["name"]
    folder = text_field(d, "folder", max_len=60) if "folder" in d else n["folder"]
    text = n["text"]
    status = n["status"]
    if "text" in d:  # lets users paste text for image notes that need OCR
        text = text_field(d, "text", min_len=20, max_len=200000)
        status = "ready"
    run("UPDATE notes SET name = ?, folder = ?, text = ?, status = ? WHERE id = ?", (name, folder, text, status, note_id))
    if "text" in d:
        return reanalyze(note_id)
    return jsonify({"note": note_json(owned(note_id), True)})


@bp.post("/<int:note_id>/analyze")
@login_required
def reanalyze(note_id):
    n = owned(note_id)
    if len(n["text"]) < 20:
        raise ApiError(422, "no_text", "This note has no readable text yet. Paste the text into it first.")
    a = ai.analyze(n["text"], n["name"])
    run("UPDATE notes SET summary = ?, points = ?, analysis = ?, status = 'ready' WHERE id = ?",
        (a["summary"], json.dumps(a["points"]), json.dumps(a), note_id))
    return jsonify({"note": note_json(owned(note_id), True)})


@bp.delete("/<int:note_id>")
@login_required
def delete(note_id):
    owned(note_id)
    run("DELETE FROM notes WHERE id = ?", (note_id,))
    return jsonify({"ok": True})


def collect_text(note_ids=None, folder=None):
    """Notes belonging to the current user as [(name, text, folder)], filtered by ids and/or folder."""
    rows = many("SELECT id, name, text, folder FROM notes WHERE user_id = ? AND status = 'ready' ORDER BY created_at DESC", (g.user["id"],))
    ids = {int(i) for i in note_ids} if note_ids else None
    return [(r["name"], r["text"], r["folder"]) for r in rows
            if (ids is None or r["id"] in ids) and (not folder or folder == "All" or r["folder"] == folder)]
