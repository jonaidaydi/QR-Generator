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
HEX_COLOR = re.compile(r"^#[0-9A-Fa-f]{6}$")


def is_valid_url(value: str) -> bool:
    """Return true for complete HTTP and HTTPS URLs."""
    parsed = urlsplit(value)
    return parsed.scheme.lower() in {"http", "https"} and bool(parsed.netloc)


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/qr")
def create_qr():
    data = request.get_json(silent=True) or {}
    url = str(data.get("url", "")).strip()
    color = str(data.get("color", "#000000")).strip()
    transparent = bool(data.get("transparent", False))

    if not is_valid_url(url):
        return jsonify(error="Enter a complete URL beginning with http:// or https://."), 400
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
