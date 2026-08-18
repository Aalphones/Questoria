# Phase 3 — Anmeldebildschirm im Frontend

Die Anmeldung ist für Erwachsene, nicht für Kinder — sie kommt einmal pro Gerät
und danach nie wieder ins Blickfeld. Entsprechend nüchtern, aber im selben
Bildvokabular wie der Rest.

## Kontext (vorher lesen)

- [README.md](README.md) → „Kontrakt" (Anmeldung) und AK 1
- [docs/conventions/angular.md](../../conventions/angular.md),
  [docs/conventions/css.md](../../conventions/css.md)
- `docs/design/HANDOFF.md` → Abschnitt „1. Profilauswahl (`login`)" für die
  Deko-Elemente und die Typografie, und „Design Tokens"
- `frontend/src/app/routing/` — bestehende Wächter und Auflöser als Muster
- `frontend/src/app/services/content.service.ts` — Muster für einen Dienst mit
  `HttpClient`
- `frontend/src/app/ui/content-error/` — Muster für eine Fehlermeldung im
  Design-System

## Design-Deckung

Für einen Account-Login mit E-Mail und Passwort gibt es **kein Mockup** — der
Prototyp-Screen `login` ist die Profilauswahl (Phase 4), nicht diese Seite.
Diese Phase baut freihändig, aber ausschließlich aus vorhandenen Tokens und
Bausteinen. Verbindliche Struktur (das ist der Prüfmaßstab, nicht „sieht gut
aus"):

- Vollflächig zentriert, gleiche Deko wie der Profilauswahl-Screen: Kreis in
  `--color-accent-300` oben rechts, zwei Wolken-Pillen mit `eqBob`, zwei
  überlappende Halbkreise unten als Wellen.
- Kicker-Tag „Story-Lernabenteuer", darunter H1 „Questoria" in
  `clamp(52px, 8vw, 96px)`, `--color-accent-700`.
- Eine Karte (max. 420px breit, `--radius-lg`, `--shadow-md`) mit:
  Überschrift „Anmelden", Feld „E-Mail", Feld „Passwort", Primär-Knopf
  „Los geht's".
- Unter den Feldern eine dezente Zeile in `--color-text-muted`:
  „Diese Anmeldung ist für Erwachsene. Danach wählt dein Kind nur noch sein
  Bild." — das ist die Erklärungs-Affordance, keine Deko, und gehört zur AK.
- Fehlerfall: Meldung **über** dem Knopf, `--color-accent-700`, Text
  „E-Mail oder Passwort stimmt nicht." Keine Rohfehlermeldung, keine
  Statusnummer.
- Kein Vorlese-Knopf, keine Sprachausgabe, keine Kopfleiste auf diesem Screen.

## Abnahmekriterien

1. Ein nicht angemeldeter Aufruf einer beliebigen Adresse landet auf `/login`,
   ohne dass vorher ein halb geladener Spiel-Screen aufblitzt.
2. Nach erfolgreicher Anmeldung geht es weiter zu der Adresse, die ursprünglich
   aufgerufen wurde — nicht stur auf die Planetenkarte.
3. Falsche Daten zeigen die Meldung aus dem Abschnitt oben; die Felder bleiben
   ausgefüllt, das Passwort wird nicht geleert.
4. Läuft die Sitzung während des Spielens ab (`401` auf irgendeinen Aufruf),
   landet man auf dem Anmeldebildschirm statt in einer Fehlerkaskade.
5. Der Screen ist per Tastatur bedienbar: Tab durch beide Felder zum Knopf,
   Enter im Passwortfeld meldet an. Beide Felder haben ein `<label>`.
6. Die Struktur oben ist Punkt für Punkt vorhanden.

## Checkliste

- [x] `frontend/src/app/services/auth.service.ts`: Signal
      `currentUser = signal<AuthUser | null>(null)`, Methoden `login(email, password)`,
      `logout()`, `restoreSession()` (ruft `GET /api/auth/me`).
      Muster: `content.service.ts`. Kein Token im Browser-Speicher — das
      Cookie erledigt das, der Dienst hält nur den Benutzer im Speicher.
      Zusätzlich `markSignedOut()` und ein `sessionChecked`-Merker, damit ein
      gecachtes `restoreSession()`-Ergebnis nach Login/Logout/`401` nicht
      veraltet weiterlebt (beim Bauen entdeckt, nicht im Plan vorgezeichnet).
- [x] `frontend/src/app/models/auth.types.ts`: `AuthUser` (`id`, `username`,
      `role`) und `PlayerProfile` (schon hier definiert, Phase 4 nutzt es).
- [x] `frontend/src/app/features/auth/login.ts` + `login.html` + `login.scss`
      nach der Struktur oben. Formular als Reactive Form.
- [x] `frontend/src/app/routing/auth.guard.ts`: prüft `currentUser()`; ist es
      leer, einmal `restoreSession()` abwarten und erst dann auf `/login`
      umleiten — sonst wirft ein Neuladen jeden angemeldeten Benutzer raus.
      Die ursprünglich gewünschte Adresse als `redirectTo`-Parameter mitgeben.
- [x] `frontend/src/app/routing/session-expired.interceptor.ts`: fängt `401`
      aus jedem Aufruf ab, leert `currentUser` und schickt auf `/login`.
      Ausgenommen: der Anmelde-Aufruf selbst (sonst überschreibt der Abfang die
      Fehlermeldung im Formular).
- [x] Routen: `/login` ohne Wächter, alle bestehenden Routen bekommen den
      `authGuard` **vor** `worldConfigResolver` — ein nicht Angemeldeter darf
      keinen Content-Aufruf auslösen.
- [x] Interceptor in `app.config.ts` registrieren.

## Doku-Updates

- [x] `docs/code-map.md`: `features/auth/` und `services/auth.service.ts` vom
      Soll- in den Ist-Stand, neue Zeile in der Routen-Tabelle für `/login`,
      Hinweis auf den Wächter.
- [x] `docs/design/README.md` → „Bewusste Abweichungen": neuer Punkt, dass der
      Anmeldebildschirm ohne Mockup entstanden ist und welche Struktur dafür
      festgelegt wurde (Verweis auf diese Phasendatei).

## Report-Back

`ng build` und `ng lint` laufen grün. Einzige Abweichung vom Plan: der
`AuthService` braucht einen `sessionChecked`-Merker zusätzlich zum
gecachten `restoreSession()`-Observable — ohne ihn hätte der Wächter nach
einem Login oder Logout innerhalb derselben Seitenladung eine veraltete
Antwort wiederverwendet (Endlosschleife bzw. fälschlich noch angemeldet nach
Logout). Kein Backend-Kontakt möglich (Datenbank lokal nicht erreichbar,
siehe STATE.md) — die Smoke-Checkliste in der README läuft am Server.

**Unsicherste Stelle:** [login.scss](login.scss) — die Deko-Elemente (Kreis,
Wolken, Wellen) sind freihändig aus Tokens gebaut, ohne Mockup zum Abgleich.
Prüfen: sieht der Screen im Browser wie in der Design-Deckung oben
beschrieben aus, nicht nur strukturell korrekt.
