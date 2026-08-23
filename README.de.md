# QR Generator

[English](README.md) | Deutsch

Ein schneller und installierbarer QR Code Generator, der vollständig im Browser
läuft. Adressen werden direkt gespeichert. Es gibt kein Tracking, keine Werbung,
keine Weiterleitung, kein Benutzerkonto und keinen externen QR Dienst.

## Version 2

Version 2 führt eine eigenständige Browser App mit kompakter schwarzer und
oranger Oberfläche ein. Sie ersetzt den lokalen Python Webserver aus Version 1.
Die frühere Umsetzung bleibt über die Git Historie und das Release der Version 1
verfügbar.

## Vorschau

![QR Generator](docs/screenshots/qr-generator-v2.png)

## Funktionen

1. Vollständig lokale QR Erzeugung im Browser
2. Automatische Ergänzung von HTTPS
3. Live Vorschau nach der ersten Generierung
4. Interaktives Farbrad
5. System Farbauswahl, RGB Werte, Hex Eingabe und Schwarz Weiß Presets
6. Transparenter PNG Hintergrund ist standardmäßig aktiviert
7. Hohe Fehlerkorrektur für zuverlässiges Scannen
8. PNG Download als `qr-code.png`
9. Responsives Layout für Desktop, Android und iPhone
10. Installierbare PWA mit offline verfügbarem App Gerüst
11. Bedienung per Tastatur und Unterstützung reduzierter Bewegung

## App verwenden

`index.html` über einen lokalen Webserver öffnen. Zum Beispiel:

```powershell
npx serve .
```

Anschließend die im Terminal angezeigte Adresse öffnen. Eine Webadresse eingeben,
**Generate** auswählen, Farbe und Transparenz anpassen und mit **Save** speichern.

Die App kann ebenfalls als statische Seite über GitHub Pages oder jeden anderen
statischen Webhost betrieben werden.

## Entwicklung

Node.js 18 oder neuer wird benötigt, um das JavaScript Paket neu zu erstellen.

```powershell
npm install
npm run check
```

`npm run check` erstellt das Browser Paket neu und testet die automatische
Aufbereitung von Webadressen.

## Datenschutz

Quellcode und Dokumentation enthalten ausschließlich `example.com` als
Platzhalter. Eingegebene Adressen verlassen den Browser nicht. Erzeugte Dateien
werden lokal gespeichert und standardmäßig von Git ausgeschlossen.

## Gültigkeit des QR Codes

Der erzeugte QR Code besitzt kein Ablaufdatum, weil die Zieladresse direkt im
Bild gespeichert wird. Er funktioniert, solange die gespeicherte Adresse
erreichbar bleibt.

## Lizenz

Dieses Projekt steht unter der MIT License. Siehe [LICENSE](LICENSE).
