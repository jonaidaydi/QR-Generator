from io import BytesIO

from PIL import Image

from web_app import app, normalize_url


def test_index_contains_generator_controls():
    client = app.test_client()
    response = client.get("/")
    assert response.status_code == 200
    assert b'placeholder="example.com"' in response.data
    assert b"Save QR code" in response.data
    assert b'id="transparent" type="checkbox" checked' in response.data


def test_frontend_includes_live_preview_updates():
    client = app.test_client()
    response = client.get("/static/app.js")
    assert response.status_code == 200
    assert b"scheduleLivePreview" in response.data
    assert b"latestRequest" in response.data
    assert b"transparentInput.checked = true" in response.data


def test_responses_disable_browser_cache_and_report_version():
    client = app.test_client()
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json == {"status": "ok", "version": "1.1.0"}
    assert response.headers["Cache-Control"] == "no-store, no-cache, must-revalidate, max-age=0"
    assert response.headers["X-QR-Generator-Version"] == "1.1.0"


def test_api_generates_png_with_requested_color():
    client = app.test_client()
    response = client.post(
        "/api/qr",
        json={"url": "https://example.com", "color": "#3157D5", "transparent": False},
    )
    assert response.status_code == 200
    assert response.mimetype == "image/png"
    image = Image.open(BytesIO(response.data)).convert("RGBA")
    colors = {color for _, color in image.getcolors(maxcolors=image.width * image.height)}
    assert (49, 87, 213, 255) in colors


def test_api_accepts_url_without_scheme():
    client = app.test_client()
    response = client.post(
        "/api/qr",
        json={"url": "example.com", "color": "#000000"},
    )
    assert response.status_code == 200
    image = Image.open(BytesIO(response.data)).convert("RGBA")
    assert image.getpixel((0, 0))[3] == 0


def test_url_normalization_preserves_or_adds_scheme():
    assert normalize_url("example.com/path") == "https://example.com/path"
    assert normalize_url("http://example.com") == "http://example.com"


def test_api_rejects_unsupported_scheme():
    client = app.test_client()
    response = client.post(
        "/api/qr",
        json={"url": "ftp://example.com", "color": "#000000"},
    )
    assert response.status_code == 400


def test_api_rejects_invalid_color():
    client = app.test_client()
    response = client.post(
        "/api/qr",
        json={"url": "https://example.com", "color": "black", "transparent": False},
    )
    assert response.status_code == 400
