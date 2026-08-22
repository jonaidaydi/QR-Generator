#!/usr/bin/env python3
"""Local web interface for generating static QR codes."""

from __future__ import annotations

from io import BytesIO
import re
from urllib.parse import urlsplit

from flask import Flask, jsonify, render_template, request, send_file
import qrcode
from qrcode.constants import ERROR_CORRECT_H


app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
app.jinja_env.auto_reload = True
APP_VERSION = "1.2.0"
HEX_COLOR = re.compile(r"^#[0-9A-Fa-f]{6}$")


@app.after_request
def prevent_stale_assets(response):
    """Prevent mixed frontend versions while the local app is being updated."""
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    response.headers["X-QR-Generator-Version"] = APP_VERSION
    return response


def normalize_url(value: str) -> str:
    """Add HTTPS when needed and validate the resulting web address."""
    url = value.strip()
    if not url:
        raise ValueError("Enter a web address.")

    if not re.match(r"^[A-Za-z][A-Za-z0-9+.-]*://", url):
        url = f"https://{url.lstrip('/')}"

    parsed = urlsplit(url)
    if parsed.scheme.lower() not in {"http", "https"} or not parsed.netloc:
        raise ValueError("Enter a valid web address.")
    return url


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/health")
def health():
    return jsonify(status="ok", version=APP_VERSION)


@app.post("/api/qr")
def create_qr():
    data = request.get_json(silent=True) or {}
    raw_url = str(data.get("url", ""))
    color = str(data.get("color", "#000000")).strip()
    transparent = bool(data.get("transparent", True))

    try:
        url = normalize_url(raw_url)
    except ValueError as error:
        return jsonify(error=str(error)), 400
    if not HEX_COLOR.fullmatch(color):
        return jsonify(error="Enter a valid six digit hex color."), 400

    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=12,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    background = "transparent" if transparent else "white"
    image = qr.make_image(fill_color=color, back_color=background)
    output = BytesIO()
    image.save(output, format="PNG")
    output.seek(0)

    return send_file(
        output,
        mimetype="image/png",
        download_name="qr-code.png",
        max_age=0,
    )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
