# ADR-003: Backend neben dem ausgelieferten Bereich, Brücke im Webbereich

**Status:** entschieden · 01.08.2026

## Kontext

[ADR-002](002-php-stack-und-betrieb.md) ging von einer eigenen Adresse für die
API aus, deren Web-Wurzel direkt auf `backend/public/` zeigt. Der gemessene
Zustand auf dem Paket ist ein anderer:

- Der SFTP-Zugang beginnt eine Ebene **über** dem ausgelieferten Bereich; dort
  liegt nur `public/`.
- `questoria.info` liefert genau dieses `public/` aus (gemessen: `document_root`
  endet auf `/htdocs/questoria/public`).
- Eine eigene Adresse für die API gibt es nicht. Die Oberfläche läuft unter der
  Hauptadresse, die API darunter unter `/api`.

Damit steht die Frage, wo Programmcode, `vendor/` und vor allem die Datei mit den
Datenbank-Zugangsdaten liegen.

## Optionen

1. Eine eigene Adresse im Panel anlegen und auf ein eigenes Verzeichnis zeigen
   lassen. Sauber, kostet Handarbeit und Wartezeit.
2. Das ganze Backend nach `public/api/` legen. Einfach, aber `.env`, `src/` und
   `vendor/` lägen dann im ausgelieferten Bereich, geschützt nur durch eine
   Zugriffsregel-Datei.
3. Backend **neben** den ausgelieferten Bereich legen, im Webbereich steht nur
   eine Brücke aus drei Dateien.

## Entscheidung

**Option 3.** Auf dem Server:

```
/
  backend/          ← src, vendor, .env — über keine Adresse erreichbar
  public/           ← das ist der ausgelieferte Bereich
    api/            ← Brücke: index.php, diag.php, .htaccess (aus api-bridge/ im Git)
    <Oberfläche>
```

Die Brücke ist eine Zeile, die die echte Eintrittsstelle einbindet. `__DIR__`
zeigt in der eingebundenen Datei auf deren eigenen Ort, deshalb findet das
Backend seine Pfade unverändert — am Programmcode ändert sich nichts.

Vorbedingung, gemessen statt vermutet: `open_basedir` ist auf diesem Paket leer,
der übergeordnete Ordner ist also lesbar.

## Konsequenzen

- Zugangsdaten und Programmcode sind über keine Adresse erreichbar — auch dann
  nicht, wenn eine Zugriffsregel-Datei einmal nicht greift.
- **Die Routen behalten ihr `/api`-Präfix, und der angefragte Pfad wird nicht
  gekürzt.** Die Brücke liegt unter `/api/`, die Route heißt genauso. Eine
  Kürzung um das Skriptverzeichnis — im ersten Entwurf als Vorsichtsmaßnahme
  eingebaut — hätte exakt das Präfix weggeschnitten, das gebraucht wird, und
  lautlos auf jeden Pfad mit 404 geantwortet.
- **Ein `200` auf `https://questoria.info/.env` ist kein Befund.** Das Paket
  beantwortet jeden unbekannten Pfad mit der Startseite der Anwendung. Wer prüfen
  will, ob etwas offenliegt, muss den **Inhalt** ansehen, nicht den Statuscode.
  Gegenprobe: ein erfundener Pfad liefert dieselbe Antwort, Byte für Byte.
- **Drei Dateien mehr, die zum Backend passen müssen.** Ändert sich der Name der
  Eintrittsstelle, ändert sich die Brücke mit.
- `backend/.htaccess` und `backend/public/.htaccess` bleiben liegen, obwohl sie
  in diesem Aufbau nicht greifen — sie sind die Rückfallebene, falls das Backend
  doch einmal im ausgelieferten Bereich landet.
- Der Abgleich des Frontends muss den Brücken-Ordner aussparen. Er kommt im Build
  nicht vor; ohne Ausschluss räumt der nächste Lauf die API weg.
- Wird später doch eine eigene Adresse eingerichtet, entfällt die Brücke
  ersatzlos; die Zielpfade stehen alle in `deploy.env`.
