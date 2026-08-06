# QR Generator

Ein kleiner Python-Generator fuer statische QR-Codes. Die Ziel-URL wird direkt
im QR-Code gespeichert: kein Tracking, keine Werbung und kein externer
Weiterleitungsdienst.

Ein QR-Code selbst laeuft nicht ab. Der Link funktioniert, solange die codierte
Webadresse erreichbar bleibt.

## Installation

Python 3.10 oder neuer wird empfohlen.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Verwendung

Interaktiv einen PNG-Hintergrund auswaehlen:

```powershell
python .\qr_generator.py https://example.com
```

Transparentes PNG ohne Rueckfrage erzeugen:

```powershell
python .\qr_generator.py https://example.com --transparent true -o beispiel-qr.png
```

PNG mit weissem Hintergrund:

```powershell
python .\qr_generator.py https://example.com --transparent false -o beispiel-qr.png
```

Drucktaugliches SVG erzeugen:

```powershell
python .\qr_generator.py https://example.com -f svg -o beispiel-qr.svg
```

Eine vorhandene Datei kann bewusst mit `--force` ueberschrieben werden.

## Datenschutz

- Dokumentation und Quellcode verwenden ausschliesslich `example.com` als
  Platzhalter.
- Erzeugte PNG- und SVG-Dateien werden durch `.gitignore` nicht eingecheckt.
- Reale Domains und andere private Daten gehoeren nicht in Commits oder in die
  oeffentliche Dokumentation.

## Empfehlung

Fuer maximale Scan-Sicherheit sollte der QR-Code dunkel auf einem ruhigen,
hellen Hintergrund stehen. Auch bei transparenten PNG-Dateien muss im spaeteren
Layout ausreichend Kontrast vorhanden sein.
