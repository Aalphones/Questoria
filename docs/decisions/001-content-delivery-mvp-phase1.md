# ADR-001: Content-Auslieferung im ersten Meilenstein

**Status:** entschieden · 01.08.2026 — **abgelöst durch
[ADR-005](005-content-auslieferung-ab-meilenstein-2.md)** (14.08.2026)

## Kontext

Der erste Meilenstein baut den Startbildschirm mit den Themenwelten und der
Lernstufen-Auswahl. Die Weltdaten liegen als JSON im Repository. Ein
PHP-Backend entsteht parallel, hat aber in diesem Meilenstein bewusst nur
einen Health-Endpoint und keine Content-Schnittstelle.

## Optionen

1. **Content-API sofort bauen** — Frontend holt alles über HTTP vom Backend.
2. **Statische Dateien aus dem Frontend-Build** — Frontend liest die JSON als
   Asset aus dem eigenen Auslieferungsverzeichnis.

## Entscheidung

Option 2. Das Frontend liest `assets/main_hub.json` und die
`world_config.json` der gewählten Welt als statische Dateien. Beide Aufrufe
laufen bereits über `HttpClient` und den `ContentService` — es ändern sich
später nur die URLs, nicht die Signaturen und nicht das Schema.

**Wo die Dateien liegen:** alles unterhalb von `frontend/public/`. Ein
ursprünglich geplanter Build-Schritt, der den Content-Ordner aus dem
Repository-Wurzelverzeichnis in den Build kopiert, ist **nicht möglich** —
der Angular-Build lehnt Asset-Quellen außerhalb des eigenen Projektordners
ab („asset path must be within the workspace root"). In diesem Meilenstein
existiert ohnehin nur eine Testwelt für die Entwicklung; echter Content
kommt mit der Content-Schnittstelle.

## Konsequenzen

- Kein Frontend-Backend-Wiring in Meilenstein 1, das später umgebaut werden
  müsste — der Austausch beschränkt sich auf zwei URLs im `ContentService`.
- Die Testwelt `dev_fixture` lebt unter `frontend/public/data/themes/` und
  ist ausdrücklich kein echter Fandom-Content.
- Echter Content unter `data/themes/` im Repository-Wurzelverzeichnis wird
  **nicht** in den Frontend-Build kopiert. Sobald er vor der Content-API
  gebraucht würde, braucht es einen Kopier-Schritt vor dem Build oder eine
  Verknüpfung im Dateisystem — beides bewusst aufgeschoben, weil die
  Content-Schnittstelle in Meilenstein 2 die Frage ohnehin beantwortet.
