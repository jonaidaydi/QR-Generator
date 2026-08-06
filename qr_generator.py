#!/usr/bin/env python3
"""Erzeugt statische QR-Codes, die eine URL direkt enthalten.

Einmalige Installation:
    python -m pip install "qrcode[pil]"

Beispiele:
    python qr_generator.py https://example.com
    python qr_generator.py https://example.com -o mein-code.png
    python qr_generator.py https://example.com --transparent true
    python qr_generator.py https://example.com -f svg
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from urllib.parse import urlsplit

try:
    import qrcode
    from qrcode.constants import ERROR_CORRECT_H
except ImportError as exc:
    raise SystemExit(
        'Das Paket "qrcode" fehlt. Installiere es mit:\n'
        '  python -m pip install "qrcode[pil]"'
    ) from exc


def validiere_url(text: str) -> str:
    """Akzeptiert nur vollstaendige HTTP(S)-URLs und veraendert sie nicht."""
    url = text.strip()
    daten = urlsplit(url)
    if daten.scheme.lower() not in {"http", "https"} or not daten.netloc:
        raise argparse.ArgumentTypeError(
            "Bitte eine vollstaendige URL mit http:// oder https:// angeben."
        )
    return url


def standard_dateiname(url: str, format_name: str) -> Path:
    hostname = urlsplit(url).hostname or "url"
    sicherer_name = re.sub(r"[^A-Za-z0-9.-]+", "-", hostname).strip(".-")
    return Path(f"qr-{sicherer_name or 'url'}.{format_name}")


def argumente() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Erzeugt einen statischen QR-Code ohne Tracking, Werbung oder "
            "Weiterleitungsdienst."
        )
    )
    parser.add_argument(
        "url",
        nargs="?",
        help="Vollstaendige Zieladresse, zum Beispiel https://example.com",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Ausgabedatei (Standard: qr-DOMAIN.png beziehungsweise .svg)",
    )
    parser.add_argument(
        "-f",
        "--format",
        choices=("png", "svg"),
        default="png",
        help="Dateiformat; SVG eignet sich besonders fuer den Druck (Standard: png)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Eine bereits vorhandene Ausgabedatei ueberschreiben",
    )
    parser.add_argument(
        "--transparent",
        choices=("true", "false"),
        help=(
            "PNG-Hintergrund transparent schalten. Ohne diese Option wird "
            "interaktiv nach true oder false gefragt."
        ),
    )
    return parser.parse_args()


def main() -> None:
    args = argumente()

    roher_wert = args.url if args.url is not None else input("URL: ")
    try:
        url = validiere_url(roher_wert)
    except argparse.ArgumentTypeError as exc:
        raise SystemExit(f"Fehler: {exc}") from exc

    output = args.output or standard_dateiname(url, args.format)
    erwartete_endung = f".{args.format}"
    if output.suffix.lower() != erwartete_endung:
        raise SystemExit(
            f"Fehler: Fuer das Format {args.format} muss die Datei auf "
            f"{erwartete_endung} enden."
        )
    if output.exists() and not args.force:
        raise SystemExit(
            f"Fehler: {output} existiert bereits. Nutze --force zum Ueberschreiben."
        )

    transparent = True
    if args.format == "png":
        transparenz_eingabe = args.transparent
        if transparenz_eingabe is None:
            transparenz_eingabe = input(
                "QR transparent? true oder false [false]: "
            ).strip().lower() or "false"
        if transparenz_eingabe not in {"true", "false"}:
            raise SystemExit("Fehler: Bitte nur true oder false eingeben.")
        transparent = transparenz_eingabe == "true"

    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=12,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    output.parent.mkdir(parents=True, exist_ok=True)
    if args.format == "svg":
        from qrcode.image.svg import SvgPathImage

        bild = qr.make_image(image_factory=SvgPathImage)
    else:
        hintergrund = "transparent" if transparent else "white"
        bild = qr.make_image(fill_color="black", back_color=hintergrund)

    bild.save(output)
    print(f"Gespeichert: {output.resolve()}")
    print(f"Direkt codierte URL: {url}")
    print(f"QR transparent: {str(transparent).lower()}")


if __name__ == "__main__":
    main()
