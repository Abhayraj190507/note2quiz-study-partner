from flask import jsonify, request


class ApiError(Exception):
    def __init__(self, status, code, message, fields=None):
        self.status, self.code, self.message, self.fields = status, code, message, fields


def body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ApiError(400, "invalid_json", "Send a JSON object in the request body.")
    return data


def text_field(data, name, *, min_len=1, max_len=5000, required=True, default=""):
    v = data.get(name, default)
    if v is None:
        v = default
    if not isinstance(v, str):
        raise ApiError(422, "invalid_field", f"{name} must be text.", {name: "Must be text."})
    v = v.strip()
    if required and len(v) < min_len:
        raise ApiError(422, "invalid_field", f"{name} is required.", {name: "This field is required."})
    if len(v) > max_len:
        raise ApiError(422, "invalid_field", f"{name} is too long.", {name: f"Max {max_len} characters."})
    return v


def int_field(data, name, *, lo=None, hi=None, default=None):
    v = data.get(name, default)
    if v is None:
        raise ApiError(422, "invalid_field", f"{name} is required.", {name: "This field is required."})
    try:
        v = int(v)
    except (TypeError, ValueError):
        raise ApiError(422, "invalid_field", f"{name} must be a number.", {name: "Must be a number."})
    if (lo is not None and v < lo) or (hi is not None and v > hi):
        raise ApiError(422, "invalid_field", f"{name} must be between {lo} and {hi}.", {name: f"Between {lo} and {hi}."})
    return v


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def _api(e):
        out = {"error": {"code": e.code, "message": e.message}}
        if e.fields:
            out["error"]["fields"] = e.fields
        return jsonify(out), e.status

    @app.errorhandler(404)
    def _404(_e):
        return jsonify({"error": {"code": "not_found", "message": "Not found."}}), 404

    @app.errorhandler(405)
    def _405(_e):
        return jsonify({"error": {"code": "method_not_allowed", "message": "Method not allowed."}}), 405

    @app.errorhandler(413)
    def _413(_e):
        return jsonify({"error": {"code": "too_large", "message": "File is too large."}}), 413

    @app.errorhandler(Exception)
    def _500(e):
        from flask import current_app
        from werkzeug.exceptions import HTTPException
        if isinstance(e, HTTPException):
            return jsonify({"error": {"code": e.name.lower().replace(" ", "_"), "message": e.description}}), e.code
        current_app.logger.exception("Unhandled error")
        return jsonify({"error": {"code": "server_error", "message": "Something went wrong on our side."}}), 500
