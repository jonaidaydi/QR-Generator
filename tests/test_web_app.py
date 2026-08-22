from io import BytesIO

from PIL import Image

from web_app import app


def test_index_contains_generator_controls():
    client = app.test_client()
    response = client.get("/")
    assert response.status_code == 200
    assert b'placeholder="https://example.com"' in response.data
    assert b"Save QR code" in response.data


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


def test_api_rejects_incomplete_url():
    client = app.test_client()
    response = client.post(
        "/api/qr",
        json={"url": "example.com", "color": "#000000", "transparent": False},
    )
    assert response.status_code == 400


def test_api_rejects_invalid_color():
    client = app.test_client()
    response = client.post(
        "/api/qr",
        json={"url": "https://example.com", "color": "black", "transparent": False},
    )
    assert response.status_code == 400
