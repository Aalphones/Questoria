# ADR-004: Event Engine — alles Spielbare ist ein Event

**Status:** entschieden · 14.08.2026

## Kontext

Die ursprüngliche Beschreibung von Questoria trennte drei Dinge: eine
Dialog-Engine, ein Minispiel-System und den Ablauf, der beides aneinanderreiht
(Dialog → Minispiel → Ende). Damit gab es zwei Sonderwege durch eine Episode
und zwei Stellen, an denen ein neuer Spielbaustein anzudocken wäre.

Das Ziel ist aber nicht eine Lernplattform mit Minispielen. Das Ziel ist eine
Geschichte, die man spielt: Ein Kind startet Questoria, weil es wissen will,
wie es weitergeht — nicht, um Aufgaben abzuarbeiten. Dialog, Erkundung, Rätsel
und Belohnung sind dabei gleichrangige Bausteine derselben Erzählung.

Zum Entscheidungszeitpunkt existiert weder eine Dialog- noch eine
Minispiel-Komponente, und `data/themes/` ist leer. Die Umstellung kostet
Dokumentation, keinen Code und keinen Content.

## Optionen

1. **Dialog und Minispiel bleiben getrennte Systeme** — Episode trägt eine
   Dialogliste und eine Minispiel-Referenz, der Ablauf ist fest verdrahtet.
2. **Ein Ablaufmechanismus für alles** — Episode ist eine Liste von Events,
   Dialog ist einer von vielen Eventtypen.

## Entscheidung

Option 2. Eine Episode besteht **ausschließlich** aus einer Eventliste.

- **Dialog hat keine Sonderrolle.** `{ "type": "dialog", ... }` steht
  gleichberechtigt neben `multiple_choice`, `exploration` oder `card_battle`.
- **Die Engine kennt Eventtypen, das Backend kennt nur deren Konfiguration.**
  Zu jedem Typ gehört genau eine Angular-Komponente. Der Event Loader wählt
  sie über `ngComponentOutlet` — es gibt keine Verzweigung nach Typ im
  Ablauf-Gerüst.
- **Der Ablauf ist eine Reihenfolge, kein Muster.** Nicht „Dialog, dann
  Quiz", sondern was die Eventliste sagt: Dialog → Erkundung → Kampf →
  Belohnung → Dialog.

Verbindliche Grundregel, die daraus folgt:

> **Neue Gameplay-Features brauchen keine neuen REST-Endpunkte.**
> Sie entstehen aus einem neuen Eventtyp, einer neuen Angular-Komponente und
> neuen Event-Konfigurationen im Content — nie aus Backend-Code.

## Konsequenzen

- **Das Frontend ist die vollständige Spiel-Engine.** Story-Ablauf,
  Eventabwicklung, Dialogfluss, Quests, Inventar, Auslöser, Story-Merker,
  Erfolge, Ton und Animation liegen im Client.
- **Das Backend interpretiert kein Gameplay.** Es liefert Event-Konfigurationen,
  Episoden, Welten, Assets, Lokalisierungen und persistiert Nutzer, Profile und
  Spielstände. Mehr nicht.
- **Neuer Inhalt ist ein Content-Paket, kein Release.** Eine neue Welt besteht
  aus JSON, Bildern, Ton und Texten — nicht aus Backend-Code.
- **Ein Vokabelwechsel zieht sich durch die ganze Doku:** „Minispiel" heißt
  Gameplay-Event, „Minispiel-System" heißt Event Engine, `game_type` heißt
  `type`, der Ordner `minigames/` heißt `events/`. Die Terminologie-Tabelle
  steht in [docs/glossary.md](../glossary.md). In der Datenbank zieht Migration
  `008` die Statistik-Spalte `minigames_completed` auf `events_completed` nach —
  als eigener Schritt, weil der Migrationsrunner bereits angewendete Dateien
  überspringt.
- **Meilenstein 3 und 4 wurden zusammengezogen.** Dialog-Engine und
  Minispiel-System waren derselbe Mechanismus, zweimal geplant. Siehe
  [docs/PROJECT.md](../PROJECT.md) → Meilensteine.
- **Offline-Fähigkeit wird möglich, aber nicht sofort gebaut.** Weil das
  Gameplay vollständig im Client läuft, reicht ein lokaler Cache aus JSON und
  Assets, um ohne Netz zu spielen. Das Netz wird dann nur noch für Login,
  Spielstände und Content-Aktualisierungen gebraucht. Gebaut wird das nach dem
  MVP (Meilenstein 6), vorbereitet wird es dadurch, dass sämtlicher Content
  ausschließlich über den `ContentService` geladen wird — die Stelle, an der
  ein Cache später eingehängt wird.

## Was diese Entscheidung *nicht* ändert

- Das Content-Repository bleibt statisches, versioniertes JSON im Git
  ([ADR-001](001-content-delivery-mvp-phase1.md) für die Auslieferung im
  ersten Meilenstein).
- Der PHP-Mini-Stack und der Shared-Hosting-Betrieb bleiben unverändert
  ([ADR-002](002-php-stack-und-betrieb.md), [ADR-003](003-backend-ausserhalb-des-webbereichs.md)).
- Die zwei festen Bühnenplätze `left`/`right` bleiben — sie sind jetzt Teil der
  Konfiguration des `dialog`-Events statt eines eigenen Dialog-Systems.
