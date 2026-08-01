# Findings — Core Architecture

Erkenntnisse während der Umsetzung, die eine spätere Phase betreffen. Format:

- [ ] → Phase N: <Erkenntnis>

---

- [ ] → Meilenstein 2 (Content-API): Der Angular-Build kann **keine** Assets
  außerhalb von `frontend/` einsammeln — `data/themes/` im
  Repository-Wurzelverzeichnis landet nicht im Build (ADR-001). Solange die
  Content-Schnittstelle fehlt, liegt Content nur unter `frontend/public/`.
  Wer echten Content vor der API braucht, braucht einen Kopier-Schritt vor
  dem Build.
- [ ] → Phase 2 (Backend): PHP und MySQL sind auf dieser Maschine **nicht im
  PATH**. Vor Phase 2 installieren oder Pfade setzen, sonst scheitert schon
  `composer install`.
- [ ] → Phase 2/3: Die Testpflicht ist projektweit gestrichen (siehe
  `docs/conventions/testing.md`) — kein PHPUnit, kein `composer test`, kein
  Test-Schritt in der CI. Die JWT-Middleware wird von Hand gegengeprüft.
- [ ] → Meilenstein 2 (Karten): Die Abstands-Tokens stammen wertgleich aus
  dem Prototyp und sind krumme Pixelwerte (4.4px, 8.8px …). Für die
  Kartenansichten prüfen, ob daraus eine saubere Skala in `rem` wird —
  sobald das passiert, ändert sich nur die Token-Datei, keine Komponente.
