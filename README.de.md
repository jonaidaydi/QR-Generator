# QR Generator

[English](README.md) | Deutsch

Ein kompakter Python Generator für statische QR Codes. Jede Zieladresse wird
direkt im Code gespeichert. Es gibt keinen Weiterleitungsdienst, kein Tracking
und keine Werbung.

## Vorschau

![Weboberfläche des QR Generators](docs/screenshots/qr-generator-preview.png)

![Farbanpassung im QR Generator](docs/screenshots/qr-generator-color-preview.png)

## Überblick

Der Generator erstellt QR Codes für vollständige HTTP und HTTPS Adressen. Die
Ausgabe ist als PNG oder SVG möglich. PNG Dateien können mit einem weißen oder
transparenten Hintergrund erzeugt werden.

Ein erzeugter QR Code besitzt kein Ablaufdatum. Er funktioniert, solange die
gespeicherte Zieladresse erreichbar bleibt.

## Funktionen

1. Direkte Speicherung der Zieladresse
2. Ausgabe als PNG oder SVG
3. Optional transparenter PNG Hintergrund
4. Hohe Fehlerkorrektur für zuverlässiges Scannen
5. Validierung vollständiger HTTP und HTTPS Adressen
6. Schutz vor unbeabsichtigtem Überschreiben vorhandener Dateien
7. Lokale Weboberfläche mit Vorschau und Farbauswahl
8. PNG Download mit dem festen Dateinamen `qr-code.png`
9. Transparentes Favicon, Apple Touch Icon und PWA Icons

## Voraussetzungen

Python 3.10 oder neuer wird empfohlen.

## Schnellstart

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Verwendung

### Weboberfläche

Die lokale Web App starten:

```powershell
python .\web_app.py
```

Im Browser `http://127.0.0.1:5000` öffnen. Eine Webadresse eingeben, die QR Farbe
über das Spektrum, RGB Werte, den Hex Farbcode oder die Presets wählen und
**Generate** auswählen. Mit **Save QR code** wird `qr-code.png` gespeichert.
Wenn kein Protokoll angegeben ist, ergänzt die App automatisch `https://`.
Transparente Ausgabe ist standardmäßig aktiviert. Nach der ersten Generierung
aktualisieren Änderungen an Farbe und Transparenz die Vorschau automatisch.

Die Weboberfläche läuft lokal. Eingegebene URLs werden nicht an einen externen
QR Dienst gesendet.

### Tests

```powershell
python -m pip install -r requirements-dev.txt
python -m pytest -q
```

<details>
<summary>Optionale Verwendung über die Kommandozeile</summary>

### Interaktiver Start

```powershell
python .\qr_generator.py https://example.com
```

Bei einer PNG Ausgabe fragt das Programm, ob der Hintergrund transparent sein
soll.

### Transparentes PNG

```powershell
python .\qr_generator.py https://example.com --transparent true -o beispiel_qr.png
```

### PNG mit weißem Hintergrund

```powershell
python .\qr_generator.py https://example.com --transparent false -o beispiel_qr.png
```

### Skalierbares SVG

```powershell
python .\qr_generator.py https://example.com -f svg -o beispiel_qr.svg
```

### Vorhandene Datei ersetzen

```powershell
python .\qr_generator.py https://example.com -o beispiel_qr.png --force
```

</details>

## Datenschutz

Die Dokumentation und der Quellcode verwenden ausschließlich `example.com` als
Platzhalter. Reale Adressen müssen nur beim lokalen Programmaufruf angegeben
werden.

Erzeugte PNG und SVG Dateien werden durch `.gitignore` nicht in Git Commits
aufgenommen. Vor jeder Veröffentlichung sollte der geplante Commit trotzdem mit
`git show` geprüft werden.

## Scanqualität

Für eine zuverlässige Erkennung sollte der QR Code dunkel dargestellt werden
und auf einem ruhigen, hellen Hintergrund stehen. Bei transparenten PNG Dateien
muss das spätere Layout ausreichend Kontrast bieten. Der freie Rand um den Code
sollte erhalten bleiben.

## Projektstruktur

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

## Lizenz

Dieses Projekt steht unter der MIT License. Die vollständigen Bedingungen stehen
in der Datei [LICENSE](LICENSE).
