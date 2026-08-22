#!/usr/bin/env python3
"""Generate crisp transparent QR icons for the web interface."""

from pathlib import Path

from PIL import Image, ImageDraw
import qrcode
from qrcode.constants import ERROR_CORRECT_L


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "static" / "icons"
SIZES = (32, 180, 192, 512)


def qr_matrix() -> list[list[bool]]:
    qr = qrcode.QRCode(
        version=1,
        error_correction=ERROR_CORRECT_L,
        box_size=1,
        border=1,
    )
    qr.add_data("QR Generator")
    qr.make(fit=True)
    return qr.get_matrix()


def render_icon(size: int, matrix: list[list[bool]]) -> Image.Image:
    module_count = len(matrix)
    scale = max(1, size // module_count)
    qr_size = module_count * scale
    offset_x = (size - qr_size) // 2
    offset_y = (size - qr_size) // 2

    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for row, values in enumerate(matrix):
        for column, enabled in enumerate(values):
            if not enabled:
                continue
            left = offset_x + column * scale
            top = offset_y + row * scale
            draw.rectangle(
                (left, top, left + scale - 1, top + scale - 1),
                fill=(0, 0, 0, 255),
            )
    return image


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    matrix = qr_matrix()
    for size in SIZES:
        output = OUTPUT_DIR / f"icon-{size}.png"
        render_icon(size, matrix).save(output, format="PNG", optimize=True)
        print(f"Generated {output.relative_to(ROOT)} ({size}x{size})")


if __name__ == "__main__":
    main()
