import hashlib
import secrets
import time
from collections import defaultdict, deque
from functools import wraps

import jwt
from flask import current_app, g, request

from .db import many, one, now, run
from .errors import ApiError


# ---------- JWT ----------
def make_token(user_id):
    days = current_app.config["ACCESS_TOKEN_DAYS"]
    payload = {"sub": str(user_id), "iat": int(time.time()), "exp": int(time.time()) + days * 86400}
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def login_required(fn):
    @wraps(fn)
    def wrapper(*a, **kw):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            raise ApiError(401, "unauthorized", "Log in to continue.")
        try:
            data = jwt.decode(header[7:], current_app.config["SECRET_KEY"], algorithms=["HS256"])
            user = one("SELECT * FROM users WHERE id = ?", (int(data["sub"]),))
        except (jwt.InvalidTokenError, KeyError, ValueError):
            raise ApiError(401, "invalid_token", "Your session has expired. Log in again.")
        if user is None:
            raise ApiError(401, "invalid_token", "Your session has expired. Log in again.")
        g.user = user
        return fn(*a, **kw)
    return wrapper


# ---------- one-time email tokens (password reset) ----------
def _hash(t):
    return hashlib.sha256(t.encode()).hexdigest()


def issue_token(user_id, kind, ttl_hours):
    raw = secrets.token_urlsafe(32)
    run("UPDATE auth_tokens SET used = 1 WHERE user_id = ? AND kind = ? AND used = 0", (user_id, kind))
    run("INSERT INTO auth_tokens(user_id, kind, token_hash, expires_at) VALUES (?,?,?,?)",
        (user_id, kind, _hash(raw), now() + ttl_hours * 3600))
    return raw


def consume_token(raw, kind):
    row = one("SELECT * FROM auth_tokens WHERE token_hash = ? AND kind = ?", (_hash(raw), kind))
    if not row or row["used"] or row["expires_at"] < now():
        raise ApiError(400, "invalid_link", "This link is invalid or has expired. Request a new one.")
    run("UPDATE auth_tokens SET used = 1 WHERE id = ?", (row["id"],))
    return row["user_id"]


# ---------- tiny in-memory rate limiter (use Redis/nginx limits when running several workers) ----------
_hits = defaultdict(deque)


def rate_limit(name, limit=10, per=60):
    def deco(fn):
        @wraps(fn)
        def wrapper(*a, **kw):
            if current_app.config["RATE_LIMIT_AUTH"]:
                key = (name, request.remote_addr)
                q, t = _hits[key], time.time()
                while q and q[0] < t - per:
                    q.popleft()
                if len(q) >= limit:
                    raise ApiError(429, "rate_limited", "Too many attempts. Wait a minute and try again.")
                q.append(t)
            return fn(*a, **kw)
        return wrapper
    return deco
