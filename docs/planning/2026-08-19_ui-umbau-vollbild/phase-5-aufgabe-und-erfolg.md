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

- [ ] Bildsuche: Aufbau auf die Bühnenhöhe umstellen, Rückmeldung und „Weiter"
      an den unteren Rand
- [ ] Prüfen, ob die Änderung in `ui/task-card/` gehört (dann trifft sie alle
      Aufgaben) oder nur in die Bildsuche — **im Report-Back begründen**
- [ ] Alle fünf Aufgabentypen nach der Änderung durchspielen (AK 7)
- [ ] Ergebnis-Screen: Kontrastfläche unter Überschrift, Hinweistext und
      Statistiken
- [ ] Konfetti hinter den Inhalt legen und `pointer-events: none` geben
- [ ] Sternen-Staffelung gegen den HANDOFF prüfen und nachziehen
- [ ] Kontrast messen (Entwicklerwerkzeuge des Browsers), Ergebnis ins
      Report-Back
- [ ] `prefers-reduced-motion`-Zweige für alles Neue
- [ ] `docs/design/README.md`: die freihändig gebaute Bildsuche als Abweichung
      festhalten — sie hat keinen Prototyp-Screen und braucht ab jetzt eine
      schriftliche Beschreibung
- [ ] `docs/code-map.md` nachziehen

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
