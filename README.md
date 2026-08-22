# QR Generator

English | [Deutsch](README.de.md)

A compact Python generator for static QR codes. Each target address is stored
directly in the code. There is no redirect service, tracking, or advertising.

## Preview

![QR Generator web interface](docs/screenshots/qr-generator-preview.png)

![QR Generator color customization](docs/screenshots/qr-generator-color-preview.png)

![QR Generator dark mode](docs/screenshots/qr-generator-dark-preview.png)

## Overview

The generator creates QR codes for complete HTTP and HTTPS addresses. Output is
available as PNG or SVG. PNG files can use either a white or transparent
background.

A generated QR code does not expire. It remains functional as long as the
stored target address is available.

## Features

1. Direct storage of the target address
2. PNG and SVG output
3. Optional transparent PNG background
4. High error correction for reliable scanning
5. Validation of complete HTTP and HTTPS addresses
6. Protection against accidental overwriting of existing files
7. Local web interface with a live preview and color controls
8. PNG download with a fixed `qr-code.png` filename
9. Transparent favicon, Apple touch icon, and PWA icons
10. Persistent light and dark interface themes
11. Animated monochrome particle background
12. Interactive color wheel with pointer and keyboard controls

## Requirements

Python 3.10 or newer is recommended.

## Quick start

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Usage

### Web interface

Start the local web app:

```powershell
python .\web_app.py
```

Open `http://127.0.0.1:5000` in a browser. Enter a web address, choose the QR
color using the spectrum, RGB values, hex code, or quick presets, and select
**Generate**. Use **Save QR code** to download `qr-code.png`. When no protocol
is entered, the app automatically adds `https://`. Transparent output is
enabled by default. After the first generation, color and transparency changes
update the preview automatically.

The web interface runs locally. Entered URLs are not sent to an external QR
service.

### Tests

```powershell
python -m pip install -r requirements-dev.txt
python -m pytest -q
```

<details>
<summary>Optional command line usage</summary>

### Interactive mode

```powershell
python .\qr_generator.py https://example.com
```

For PNG output, the program asks whether the background should be transparent.

### Transparent PNG

```powershell
python .\qr_generator.py https://example.com --transparent true -o example_qr.png
```

### PNG with a white background

```powershell
python .\qr_generator.py https://example.com --transparent false -o example_qr.png
```

### Scalable SVG

```powershell
python .\qr_generator.py https://example.com -f svg -o example_qr.svg
```

### Replace an existing file

```powershell
python .\qr_generator.py https://example.com -o example_qr.png --force
```

</details>

## Privacy

The documentation and source code use only `example.com` as a placeholder.
Real addresses are provided only when running the program locally.

Generated PNG and SVG files are excluded from Git commits by `.gitignore`.
Before publishing, review the planned commit with `git show`.

## Scanning reliability

For reliable recognition, display the QR code in a dark color on a calm, light
background. Transparent PNG files require sufficient contrast in the final
layout. Preserve the clear margin around the code.

## Project structure

```text
qr_generator.py
web_app.py
templates/
static/
tools/
tests/
docs/
requirements.txt
requirements-dev.txt
README.md
README.de.md
.gitignore
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for the
full terms.
