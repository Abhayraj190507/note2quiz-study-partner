import re

from flask import Blueprint, current_app, g, jsonify
from werkzeug.security import check_password_hash, generate_password_hash

from ..db import jload, one, run
from ..errors import ApiError, body, text_field
from ..gamify import badges, progress
from ..mailer import send_mail
from ..security import consume_token, issue_token, login_required, make_token, rate_limit

bp = Blueprint("auth", __name__, url_prefix="/api/auth")
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
DUMMY_HASH = generate_password_hash("not-a-real-password")


def user_json(u):
    return {"id": u["id"], "name": u["name"], "first": u["name"].split()[0], "email": u["email"],
            "college": u["college"], **progress(u)}


def _password(d, name="password"):
    pw = d.get(name)
    if not isinstance(pw, str) or len(pw) < 8:
        raise ApiError(422, "invalid_field", "Use at least 8 characters.", {name: "Use at least 8 characters."})
    if len(pw) > 200:
        raise ApiError(422, "invalid_field", "Password is too long.", {name: "Too long."})
    return pw


def _email(d):
    e = text_field(d, "email", max_len=200).lower()
    if not EMAIL.match(e):
        raise ApiError(422, "invalid_field", "Enter a valid email address.", {"email": "Enter a valid email address."})
    return e


@bp.post("/signup")
@rate_limit("signup", 8)
def signup():
    d = body()
    name, email, pw = text_field(d, "name", min_len=2, max_len=80), _email(d), _password(d)
    if one("SELECT 1 FROM users WHERE email = ?", (email,)):
        raise ApiError(409, "email_taken", "An account with this email already exists.", {"email": "Already registered."})
    import time
    uid = run("INSERT INTO users(name, email, password_hash, college, created_at) VALUES (?,?,?,?,?)",
              (name, email, generate_password_hash(pw), text_field(d, "college", required=False, max_len=120), time.time()))
    u = one("SELECT * FROM users WHERE id = ?", (uid,))
    return jsonify({"token": make_token(uid), "user": user_json(u)}), 201


@bp.post("/login")
@rate_limit("login", 10)
def login():
    d = body()
    email = _email(d)
    pw = d.get("password") if isinstance(d.get("password"), str) else ""
    u = one("SELECT * FROM users WHERE email = ?", (email,))
    ok = check_password_hash(u["password_hash"] if u else DUMMY_HASH, pw)  # constant-ish time either way
    if not (u and ok):
        raise ApiError(401, "bad_credentials", "Email or password is incorrect.")
    return jsonify({"token": make_token(u["id"]), "user": user_json(u)})


@bp.get("/me")
@login_required
def me():
    return jsonify({"user": user_json(g.user), "badges": badges(g.user)})


@bp.patch("/me")
@login_required
def update_me():
    d = body()
    name = text_field(d, "name", min_len=2, max_len=80) if "name" in d else g.user["name"]
    college = text_field(d, "college", required=False, max_len=120) if "college" in d else g.user["college"]
    run("UPDATE users SET name = ?, college = ? WHERE id = ?", (name, college, g.user["id"]))
    return jsonify({"user": user_json(one("SELECT * FROM users WHERE id = ?", (g.user["id"],)))})


@bp.post("/change-password")
@login_required
def change_password():
    d = body()
    if not check_password_hash(g.user["password_hash"], d.get("current", "") if isinstance(d.get("current"), str) else ""):
        raise ApiError(403, "bad_credentials", "Current password is incorrect.", {"current": "Incorrect."})
    run("UPDATE users SET password_hash = ? WHERE id = ?", (generate_password_hash(_password(d, "password")), g.user["id"]))
    return jsonify({"ok": True})


@bp.post("/forgot-password")
@rate_limit("forgot", 5)
def forgot():
    email = _email(body())
    u = one("SELECT * FROM users WHERE email = ?", (email,))
    if u:  # same response either way, so the endpoint can't be used to discover accounts
        raw = issue_token(u["id"], "reset", 1)
        send_mail(u["email"], "Reset your Note2Quiz password",
                  f"Reset your password here (valid for 1 hour):\n{current_app.config['APP_URL']}/reset-password?token={raw}\n\n"
                  "If you didn't ask for this, ignore this email.")
    return jsonify({"ok": True})


@bp.post("/reset-password")
@rate_limit("reset", 10)
def reset():
    d = body()
    pw = _password(d)
    uid = consume_token(text_field(d, "token", max_len=200), "reset")
    run("UPDATE users SET password_hash = ? WHERE id = ?", (generate_password_hash(pw), uid))
    return jsonify({"ok": True})
