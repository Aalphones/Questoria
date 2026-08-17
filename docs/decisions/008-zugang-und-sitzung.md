# ADR-008: Zugang und Sitzung

**Status:** entschieden · 17.08.2026

## Kontext

Questoria läuft im privaten Kreis — [Critical Rule 6](../../AGENTS.md) hält fest,
dass die Plattform kein öffentliches Angebot ist. Bis Meilenstein 3 war das eine
Absichtserklärung: Wer die Adresse kannte, sah die Planetenkarte, und die
Fandom-Inhalte unter `/content/` lagen offen im Webbereich
([ADR-005](005-content-auslieferung-ab-meilenstein-2.md), letzter Punkt).

Mit Meilenstein 4 soll der Zugang tatsächlich verschlossen sein. Zwei Dinge
müssen dieselbe Anmeldung prüfen: die REST-Schnittstelle unter `/api/` **und**
die Auslieferung der Bilder, Töne und JSON-Dateien unter `/content/`. Letztere
holt der Browser als gewöhnliche Ressourcen — über `<img src>`, `<audio src>`
und Hintergrundbilder im Stylesheet.

## Optionen

1. **Token im Browser-Speicher, im `Authorization`-Kopf mitgeschickt.** Das
   übliche Muster für eine REST-Schnittstelle. Scheitert an den Bilddateien: Ein
   `<img src>` schickt keinen selbstgesetzten Kopf mit. Jedes Bild müsste per
   Skript geladen und in eine Blob-Adresse umgewandelt werden — für ein
   bildlastiges Kinderspiel der falsche Preis, und der Browser-Cache fällt
   dabei weg.
2. **Sitzungs-Cookie.** Der Browser schickt es bei *jeder* Anfrage an die
   Domain mit, auch bei Bildern und Tönen. Dieselbe Sitzung gilt damit für
   Schnittstelle und Dateien.
3. **Passwortschutz des Webservers vor dem ganzen Ordner** (`.htaccess`).
   Verschließt alles auf einen Schlag, kennt aber keine Profile, keine
   Abmeldung und keinen Weg zu einer freundlichen Anmeldemaske für Kinder.

## Entscheidung

Option 2. Die Sitzung ist ein JWT in einem Cookie `qst_session`, gesetzt als
`HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000` (30 Tage). `Secure`
entfällt nur, wenn `APP_ENV=local` gesetzt ist — über `http://localhost` würde
der Browser ein `Secure`-Cookie sonst verwerfen und lokal wäre keine Anmeldung
möglich.

`HttpOnly` heißt: Kein JavaScript im Browser kommt an das Token heran. Ein
eingeschleustes Skript könnte es also nicht auslesen und weitergeben.

Angemeldet wird **ein Eltern-Login pro Gerät**. Ein Kind tippt nie ein Passwort;
nach der Anmeldung wählt es nur noch sein Profil.

## Konsequenzen

- **Kein Registrierungsweg in der Oberfläche.** Accounts legt der Betreiber an.
  Das hält den Kreis geschlossen, ohne dass eine Einladungs- oder
  Freischaltmechanik gebaut werden muss.
- **Accounts entstehen außerhalb der Anwendung.**
  `backend/bin/create-user.php` legt einen an. 🔴 Das Skript setzt eine
  Datenbankverbindung von außen voraus — das Strato-Paket hat weder eine
  Kommandozeile noch eine von außen erreichbare MySQL-Adresse (geprüft am
  17.08.2026: Port 3306 der Datenbankadresse antwortet von außen nicht). Der
  **erste** Account entsteht deshalb über einen geschützten Endpunkt nach dem
  Muster von `POST /api/migrate`: `POST /api/setup/user`, Token im Kopf
  `X-Setup-Token` (Wert `SETUP_TOKEN` aus `deploy.env`), ohne Token `404`.
  Gebaut in Phase 2. Das Skript bleibt für den Fall eines späteren
  Fernzugriffs auf die Datenbank bestehen.
- **Ohne Datenbank keine Anmeldung.** Die Content-Schnittstelle las bisher nur
  Dateien und lief auch ohne Datenbank; ab jetzt hängt jeder Aufruf außer
  `/api/health` und `/api/migrate` an einer erreichbaren Datenbank.
- **Die Sitzung wird bei jedem Aufruf gegen die Datenbank geprüft**, nicht nur
  gegen die Signatur des Tokens. Ein gelöschter Account ist damit sofort
  ausgesperrt und nicht erst nach 30 Tagen.
- **Erlaubte Herkünfte müssen namentlich in `CORS_ORIGINS` stehen.** Sobald
  Anmeldedaten mitgeschickt werden, lehnt der Browser ein `*` als erlaubte
  Herkunft ab.
- **Die Weiche vor `/content/` ist der zweite Teil und liegt in Phase 2** — die
  Entscheidung für das Cookie ist genau das, was sie möglich macht.

## Nachtrag: die Auslieferung der Dateien (Phase 2, 17.08.2026)

Bilder, Töne und Weltdateien liegen im ausgelieferten Bereich. Bisher gab der
Webserver sie direkt heraus — an jeden, der die Adresse kannte. Jetzt schreibt
eine Regel im Content-Ordner **jede** Anfrage auf ein kleines PHP-Skript um, das
dasselbe Sitzungs-Cookie prüft wie die Schnittstelle. Ohne Anmeldung: `403`,
ohne ein Byte Dateiinhalt.

**Warum kein Serverpasswort vor dem ganzen Ordner** (Option 3 oben, jetzt
konkret geworden):

- Es fragt **pro Gerät ein zweites Mal** nach Zugangsdaten — genau die Hürde,
  die ein Kind nie nehmen soll.
- Der Browser schickt dieses Passwort im `Authorization`-Kopf. Denselben Kopf
  benutzt die Schnittstelle; auf geteiltem Hosting wird er außerdem schon einmal
  durch eine Umschreibe-Regel durchgereicht, damit er überhaupt ankommt. Zwei
  Bedeutungen für denselben Kopf sind eine Fehlerquelle ohne Gegenwert.
- Es kennt keine Abmeldung und keinen Ablauf.

**Die Weiche schlägt bewusst nicht in der Datenbank nach.** Sie prüft nur die
Signatur des Tokens und dessen Ablaufdatum. Grund: Sie läuft für *jedes einzelne
Bild und jeden Ton* eines Screens. Würde sie zusätzlich den Benutzer laden, wäre
bei einer hakenden Datenbank nicht nur der Spielstand weg, sondern die ganze
Optik des Spiels. Ein gelöschter Account kommt damit bis zu 30 Tage lang noch an
Bilddateien — nicht aber an Profile, Spielstände oder irgendeinen Aufruf unter
`/api/`, denn dort bleibt der Datenbank-Blick bestehen.

Die Antwort trägt `Cache-Control: private` — die Datei gehört zu einer Sitzung
und darf nie in einem gemeinsam genutzten Zwischenspeicher landen, aus dem ein
Unangemeldeter sie bekäme. Der Browser-Cache des angemeldeten Geräts bleibt
erlaubt und ist das, was die Weiche schnell genug macht.

Fehlt dem Webserver das Umschreibe-Modul, liefert die Regel **gar nichts** aus,
statt in den alten offenen Zustand zurückzufallen.
