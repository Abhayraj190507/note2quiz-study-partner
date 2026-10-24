import logging
import os

from flask import Flask, jsonify, request

from .config import Config
from .db import init_db
from .errors import register_error_handlers


def create_app(overrides=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if overrides:
        app.config.update(overrides)
    if app.config["ENV"] == "production" and app.config["SECRET_KEY"].startswith("dev-only"):
        raise RuntimeError("Set SECRET_KEY in the environment before running in production.")
    logging.basicConfig(level=logging.INFO)
    app.outbox = []  # emails sent in this process (handy for tests and local development)

    init_db(app)
    register_error_handlers(app)

    from .routes import auth, flashcards, notes, partner, productivity, quiz, revision, stats
    for m in (auth, notes, quiz, flashcards, partner, productivity, revision, stats):
        app.register_blueprint(m.bp)

    @app.get("/api/health")
    def health():
        from . import ai
        return jsonify({"status": "ok", "ai": "claude" if ai.enabled() else "offline"})

    @app.after_request
    def cors_and_security(resp):
        origin = request.headers.get("Origin")
        if origin and origin in app.config["FRONTEND_ORIGINS"]:
            resp.headers["Access-Control-Allow-Origin"] = origin
            resp.headers["Vary"] = "Origin"
            resp.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
            resp.headers["Access-Control-Max-Age"] = "600"
        resp.headers["X-Content-Type-Options"] = "nosniff"
        resp.headers["Cache-Control"] = "no-store"
        return resp

    @app.route("/api/<path:_p>", methods=["OPTIONS"])
    def preflight(_p):
        return ("", 204)

    return app
