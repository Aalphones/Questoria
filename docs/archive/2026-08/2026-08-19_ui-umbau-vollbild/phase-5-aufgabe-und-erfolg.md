# Phase 5 — Aufgabenfläche und Erfolgsmoment

**Rating:** standard (zwei Screens, klare Befunde, Bühne steht bereits)

## Kontext — was der Bearbeiter lesen muss

- [phase-1-buehne.md](phase-1-buehne.md) — muss fertig sein
- `frontend/src/app/features/events/image-search/` — der zu kleine Screen
- `frontend/src/app/ui/task-card/` — die gemeinsame Hülle **aller**
  Aufgabentypen; eine Änderung hier trifft Quiz, Texteingabe, Bildsuche und
  Wort-Bild-Paare gleichzeitig
- `frontend/src/app/features/result/` — der „Ort geschafft"-Screen
- `docs/design/HANDOFF.md`, Abschnitte „7. Minispiel" und „8. Ergebnis" —
  Ergebnis ist dort vollständig beschrieben: zehn Konfetti-Rauten, drei
  Sterne, H2 „Ort geschafft!", drei Statistik-Karten, Erfolgs-Pille, zwei CTAs
- `frontend/src/styles/_motion.scss`

## Teil A — Die Bildsuche wird groß

Befund: sie sitzt zu klein, „Weiter" und die Rückmeldung liegen erst nach dem
Rollen im Bild. Für die Bildsuche gibt es **keinen Prototyp-Screen** — der
Eventtyp ist jünger als das Design. Sie wird deshalb freihändig gebaut, aus
vorhandenen Tokens und im Einklang mit der Aufgaben-Hülle.

Zielaufbau: Suchbild so groß wie die Bühne es zulässt, Aufgabenstellung darüber,
Rückmeldung und „Weiter" **fest am unteren Rand** — nicht unter dem Bild, wo sie
mitwandern und aus dem Sichtfeld rutschen.

## Teil B — Der Erfolgsmoment wird lesbar und feiert mehr

Drei Befunde am „Ort geschafft"-Screen, alle drei mit Vorlage im HANDOFF:

1. **Text auf dem Hintergrundbild kaum lesbar.** Es fehlt die Kontrastfläche.
   Das Design arbeitet an dieser Stelle mit Karten (`--color-surface`); die
   Umsetzung setzt den Text direkt aufs Bild.
2. **Konfetti liegt über dem Text.** Im Design sind es zehn absolut gesetzte
   Rauten — als Schmuck **hinter** dem Inhalt, nicht darüber.
3. **Zu wenig Feier.** Die drei Sterne erscheinen im Design nacheinander
   (`eqPop`, gestaffelt 0 / 0,12 / 0,24 s). Das ist gebaut oder nicht — prüfen
   und nachziehen.

## Abnahmekriterien

1. Bei der Bildsuche liegen Aufgabenstellung, Bild, Rückmeldung und „Weiter"
   gleichzeitig im Bild, ohne zu rollen — bei 4:3, 16:10 und im Hochformat.
2. Das Suchbild nutzt die verfügbare Fläche deutlich besser als heute; die
   Trefferflächen bleiben mindestens 44 × 44 px und mit der Tastatur erreichbar
   (das ist heute schon so und darf nicht verloren gehen).
3. Jeder Text auf dem Ergebnis-Screen steht auf einer Fläche mit einem
   Kontrastverhältnis von mindestens 4,5:1 — gemessen, nicht geschätzt.
4. Das Konfetti liegt hinter allen Inhalten und fängt keine Klicks ab.
5. Die drei Sterne erscheinen nacheinander mit der Staffelung aus dem HANDOFF.
6. Alle Bewegungen dieser Phase haben einen `prefers-reduced-motion`-Zweig; bei
   eingeschalteter Bewegungsreduktion erscheinen Sterne und Konfetti ohne
   Bewegung, aber sie erscheinen.
7. Die Änderungen an `ui/task-card/` brechen keinen der anderen vier
   Aufgabentypen — alle einmal durchgespielt.

## Checkliste

- [x] Bildsuche: Aufbau auf die Bühnenhöhe umstellen, Rückmeldung und „Weiter"
      an den unteren Rand
- [x] Prüfen, ob die Änderung in `ui/task-card/` gehört (dann trifft sie alle
      Aufgaben) oder nur in die Bildsuche — **im Report-Back begründen**
- [ ] Alle fünf Aufgabentypen nach der Änderung durchspielen (AK 7) — **User,
      Screen für Screen, siehe Report-Back**
- [x] Ergebnis-Screen: Kontrastfläche unter Überschrift, Hinweistext und
      Statistiken
- [x] Konfetti hinter den Inhalt legen und `pointer-events: none` geben
      (`pointer-events: none` stand schon)
- [x] Sternen-Staffelung gegen den HANDOFF prüfen und nachziehen (stand schon,
      keine Änderung nötig)
- [x] Kontrast **gerechnet** aus den Token-Hexwerten (kein Browser zur Hand in
      dieser Session) — Ergebnis und Formel im Report-Back; **User misst mit
      den Entwicklerwerkzeugen nach**
- [x] `prefers-reduced-motion`-Zweige für alles Neue (nichts Neues animiert;
      bestehende globale Regel in `_tokens.scss` deckt Sterne + Konfetti ab)
- [x] `docs/design/README.md`: die freihändig gebaute Bildsuche als Abweichung
      festhalten
- [x] `docs/code-map.md` geprüft — Beschreibung von `ui/task-card/` bleibt auf
      Grobheitsebene korrekt, keine Änderung nötig

## Risiken

🟡 **`ui/task-card/` ist die Hülle aller Aufgaben.** Der bequeme Weg — die Hülle
für die Bildsuche umbauen — ändert stillschweigend vier weitere Screens. Wenn die
Bildsuche etwas Eigenes braucht, bekommt sie es lokal, additiv, ohne die
gemeinsame Hülle anzufassen.

🟡 **„Zu wenig Feier" ist Geschmack.** Die drei prüfbaren Teile (Kontrast,
Ebenenreihenfolge, Staffelung) stehen in den AK. Ob es sich danach festlich
genug anfühlt, entscheidet nur dein Auge — bleibt es dabei zu blass, ist das ein
neuer Befund, keine offene Phase.

## Report-Back

**Teil A — Bildsuche füllt die Bühne.** `ui/task-card/` bekam einen neuen,
optionalen Eingang `fill` (Default `false`). Ohne ihn verhält sich die Hülle
exakt wie vorher — `.task-card__body` ist `display: contents`, jedes projizierte
Element bleibt sein eigenes Grid-Item. Nur die Bildsuche setzt `[fill]="true"`:
der Körper wird dann eine eigene Grid-Zeile mit der restlichen Bühnenhöhe
(`minmax(0, 1fr)`), intern ein Flex-Column, und die Bildfläche bekommt
`flex: 1 1 0%` bei festem `aspect-ratio: 16/9` — sie wächst also in die
verfügbare Höhe, ohne das Seitenverhältnis zu verlassen, an dem die
Ziel-Koordinaten im Content hängen. Zähler bleibt `flex: none`, Rückmeldung +
„Weiter" sitzen wie bisher als eigene Grid-Zeile unter dem Körper — die liegt
schon immer außerhalb des wachsenden Bereichs, das war nicht das Problem.

**Warum in der Hülle statt lokal in der Bildsuche:** Ein rein lokaler Umbau
hätte bedeutet, `ui/task-card/` zu ignorieren und die Höhenverteilung am
Elternelement vorbei zu erzwingen — das hätte gegen den Bühnen-Kontrakt aus
Phase 1 verstoßen („kein Screen rechnet seine Höhe selbst"). Der Opt-in-Eingang
ist additiv: die drei anderen Konsumenten (Quiz, Wörter zuordnen, Texteingabe)
übergeben `fill` nicht und sind laut Build/Lint unverändert.

🟡 **Ungeprüft im Browser:** `aspect-ratio` + `flex-grow` mit `flex-basis: 0%`
in einer Flex-Column ist moderne, aber korrekt spezifizierte Interaktion
(Chrome/Firefox/Safari unterstützen sie seit ~2021) — trotzdem nur am Bildschirm
wirklich zu verifizieren, nicht am Code. Prüfen bei 4:3, 16:10 und Hochformat
(AK 1): füllt das Bild die Höhe, ohne die Breite zu sprengen, und bleibt alles
ohne Rollen sichtbar?

🟡 **AK 7 (alle Aufgabentypen durchspielen) ist beim User, nicht bei mir** —
privates Profil, agentenlos, kein Dev-Server in dieser Session gestartet.

**Teil B — Erfolgsmoment.**
- Titel + Hinweistext stehen jetzt in einem `.result__panel` mit
  `--color-surface`-Hintergrund, wie die Statistik-Karten. Der Hinweistext lief
  vorher auf `--color-text-muted` — auf der neuen Fläche gerechnet nur
  **~3,45:1** Kontrast (color-mix 55% Tinte auf Parchment-Fläche), unter der
  AK-Vorgabe. Umgestellt auf volle `--color-text`: **~12,4:1** (WCAG-Formel,
  Hex-Werte aus `_tokens.scss`: `--color-surface #ebddc5` gegen `--color-text
  #201e1d`). 🟡 **Gerechnet, nicht mit den Entwicklerwerkzeugen gemessen** —
  kein Browser in dieser Session offen. Bitte einmal nachmessen, auch wenn die
  Marge groß genug ist, dass ein Rechenfehler sie kaum auffräße.
- Konfetti bekam `z-index: -1`. `.episode` trägt `isolation: isolate` — das ist
  der nächste echte Stapelkontext über der Konfetti (weder `:host` von
  `qst-result` noch `.episode__stage` erzeugen selbst einen, beide setzen kein
  `z-index`). Darin landet die Konfetti hinter dem unpositionierten Inhalt
  (Titel, Karten, CTAs), aber vor `.episode__backdrop` (ebenfalls `z-index:
  -1`, aber früher im Markup). 🟡 Auch das ist Stapelkontext-Logik auf Papier,
  nicht am Bildschirm bestätigt.
- Sternen-Staffelung und `pointer-events: none` auf der Konfetti standen schon
  — keine Änderung nötig, nur geprüft.

**Nebenbefund, nicht behoben:** `--size-answer-image: clamp(4rem, 12vh, 8.75rem)`
in `_tokens.scss` ist eine vierte `vh`-Stelle (Bildgröße in der Quiz-Antwort),
nicht in FINDINGS.md getaggt und deshalb bewusst nicht angefasst — dieselbe
Tablet-Falle wie die drei behobenen. Neuer Befund, keine offene Phase.
