# Questoria – Lerninhalte Hessen, Klasse 1

> Arbeitsgrundlage für die datengetriebene Content-Erstellung in Questoria.
>
> **Status:** operationalisierte Questoria-Lernzielstruktur auf Basis der hessischen curricularen Vorgaben, nicht der amtliche Lehrplan Wort für Wort.
>
> **Stand der Quellenprüfung:** 19.08.2026

## 1. Zweck dieses Dokuments

Questoria trennt Spielmechanik und Content: Eine Themenwelt liefert Story, Figuren und Assets; Lerninhalte sollen unabhängig davon definiert und anschließend mit einer Franchise-Welt versehen werden.

Die bestehende Questoria-Architektur unterstützt dieses Vorgehen bereits: Content liegt in austauschbaren Themenwelten, Episoden bestehen aus Eventlisten und Lernstufen können pro Welt definiert werden. Neue Abenteuer sollen primär durch Content und nicht durch Änderungen am Backend entstehen.

Für den schulischen Content wird deshalb folgende Reihenfolge empfohlen:

```text
Curriculum
  ↓
Lernbereich
  ↓
Lernziel
  ↓
Aufgabentyp / Kompetenz
  ↓
Schwierigkeitsstufe
  ↓
Episode / Event
  ↓
Franchise / Themenwelt
```

## 2. Wichtiger curricularer Hinweis

Hessen arbeitet in der Primarstufe mit Kerncurricula. Diese beschreiben Bildungsstandards und Inhaltsfelder sowie den kumulativen Kompetenzaufbau. Die verbindlichen Leistungserwartungen der Kerncurricula sind auf das Ende der Jahrgangsstufe 4 ausgerichtet; für die Jahrgänge 1/2 wird der Kompetenzaufbau beschrieben.

Daraus folgt: Die unten aufgeführten Inhalte sind **keine amtliche, punktgenaue „Lehrplan-Klasse-1“-Liste**, sondern eine für Questoria konkretisierte Lernprogression für Jahrgang 1. Sie soll als Content-Backlog und Datenmodell-Grundlage dienen.

## 3. Empfohlene MVP-Fächer

Für eine erste Questoria-Curriculum-Welt werden empfohlen:

1. Deutsch
2. Mathematik
3. Sachunterricht

Die hessische Kontingentstundentafel weist für Jahrgang 1 12 Wochenstunden Deutsch, 10 Mathematik und 4 Sachunterricht aus. Das macht diese drei Fächer zugleich curricular relevant und für ein digitales Lernspiel besonders ergiebig.

---

# 4. Deutsch

## 4.1 Lernschwerpunkte

Für den frühen Kompetenzaufbau sind insbesondere Sprachgebrauch, Sprechen und Zuhören, Lesen, Schreiben sowie die Auseinandersetzung mit Sprache und Schrift relevant. Für Questoria eignen sich vor allem kleine, klar prüfbare Einheiten.

## 4.2 Lernziele

| ID | Lernziel | Mögliche Questoria-Aufgabe |
|---|---|---|
| `he_gs1_deu_laut_unterscheiden` | Laute am Anfang oder Ende eines Wortes hören und unterscheiden | Welcher Laut ist zu hören? |
| `he_gs1_deu_buchstaben_erkennen` | Buchstaben sicher erkennen | Finde alle gleichen Buchstaben |
| `he_gs1_deu_laut_buchstabe` | Laute passenden Buchstaben zuordnen | Bild → Anfangslaut → Buchstabe |
| `he_gs1_deu_buchstabe_im_wort` | Einen bestimmten Buchstaben in einem Wort erkennen | Wo steht das M? |
| `he_gs1_deu_silben_erkennen` | Wörter in Silben gliedern | Klatsche / sortiere Silben |
| `he_gs1_deu_silben_verbinden` | Silben zu einem Wort verbinden | Aus Silben ein Wort bauen |
| `he_gs1_deu_einfache_woerter_lesen` | Einfache, überwiegend lautgetreue Wörter lesen | Wort einer Figur / einem Bild zuordnen |
| `he_gs1_deu_woerter_schreiben` | Einfache Wörter schreiben bzw. ergänzen | Fehlenden Buchstaben einsetzen |
| `he_gs1_deu_satz_erkennen` | Wörter als zusammengehörigen Satz erkennen | Wörter in richtige Reihenfolge bringen |
| `he_gs1_deu_satzanfang` | Satzanfänge erkennen und Großschreibung anwenden | Richtigen Satzanfang wählen |
| `he_gs1_deu_satzende` | Satzschluss erkennen | Passendes Satzzeichen wählen |
| `he_gs1_deu_hoerverstehen` | Gehörte Informationen aus kurzen Texten entnehmen | Wer, was, wo? |
| `he_gs1_deu_bildfolge_erzaehlen` | Eine Bildfolge sinnvoll ordnen und versprachlichen | Was passiert zuerst? |
| `he_gs1_deu_information_entnehmen` | Eine einfache Information aus einem kurzen Text finden | Finde den Hinweis im Text |
| `he_gs1_deu_kurzen_satz_formulieren` | Einen einfachen Satz zu einer Situation oder einem Bild bilden | Was macht die Figur? |
| `he_gs1_deu_wortschatz_alltag` | Gegenstände, Personen, Orte und Tätigkeiten benennen | Benenne / ordne Dinge zu |

## 4.3 Sinnvolle Schwierigkeitsstufen

### Leicht

- einzelne Laute
- einzelne Buchstaben
- Bild-Buchstaben-Zuordnung
- einzelne Silben
- sehr kurze Wörter
- eindeutige Auswahlaufgaben

### Mittel

- mehrere mögliche Buchstaben
- mehrsilbige Wörter
- kurze Sätze
- kleine Hörtexte
- Satzreihenfolge
- einfache Textfragen

### Schwer

- Wörter ohne Bildstütze
- kurze unbekannte Sätze
- mehrere Informationen gleichzeitig
- kleine eigene Schreibaufgaben
- einfache Schlussfolgerungen aus einem Text

---

# 5. Mathematik

## 5.1 Lernschwerpunkte

Der hessische Kompetenzaufbau nennt unter anderem Zahlvorstellungen und Zahlbeziehungen, Grundrechenarten, Größenvorstellungen, Daten, Raumorientierung sowie geometrische und arithmetische Muster.

Für Questoria ist Mathematik besonders gut geeignet, weil viele mathematische Handlungen direkt in Spielmechaniken übersetzt werden können.

## 5.2 Lernziele

| ID | Lernziel | Mögliche Questoria-Aufgabe |
|---|---|---|
| `he_gs1_mat_mengen_erkennen` | Kleine Mengen strukturiert erkennen | Wie viele Gegenstände liegen hier? |
| `he_gs1_mat_mengen_vergleichen` | Mengen als mehr, weniger oder gleich viele vergleichen | Welche Kiste enthält mehr? |
| `he_gs1_mat_zahlen_erkennen` | Zahlen erkennen und benennen | Finde die Zahl 7 |
| `he_gs1_mat_zahlen_schreiben` | Zahlen korrekt notieren | Trage die fehlende Zahl ein |
| `he_gs1_mat_zahlen_ordnen` | Zahlen der Größe nach ordnen | Sortiere die Zahlen |
| `he_gs1_mat_zahlenstrahl` | Zahlen auf dem Zahlenstrahl verorten | Setze die Zahl an die richtige Stelle |
| `he_gs1_mat_zahlen_zerlegen` | Zahlen in Teilmengen zerlegen | 7 = 5 + 2 |
| `he_gs1_mat_nachbarzahlen` | Vorgänger und Nachfolger bestimmen | Welche Zahl steht davor? |
| `he_gs1_mat_zr_20` | Sicher im Zahlenraum bis 20 orientieren | Schatzsuche auf Zahlenfeldern |
| `he_gs1_mat_addition_bis_10` | Addieren im kleinen Zahlenraum | Gegenstände zusammenzählen |
| `he_gs1_mat_subtraktion_bis_10` | Subtrahieren im kleinen Zahlenraum | Gegenstände wegnehmen |
| `he_gs1_mat_addition_subtraktion_bis_20` | Addieren und Subtrahieren bis 20 | Rechenrätsel |
| `he_gs1_mat_bildliche_rechnung` | Rechnungen mit Bildern / Material verstehen | 3 Äpfel + 2 Äpfel |
| `he_gs1_mat_fehlende_zahl` | Fehlende Zahl in einer Rechnung bestimmen | 5 + ? = 8 |
| `he_gs1_mat_sachaufgabe` | Eine einfache Sachsituation mathematisch erfassen | Wie viele Gegenstände fehlen? |
| `he_gs1_mat_verdoppeln` | Einfache Verdopplungen erkennen und berechnen | Verdopple die Anzahl |
| `he_gs1_mat_halbieren` | Einfache Halbierungen handelnd nachvollziehen | Teile fair auf |
| `he_gs1_mat_muster_arithmetisch` | Zahlmuster erkennen und fortsetzen | 2, 4, 6, … |
| `he_gs1_mat_formen` | Grundformen erkennen und unterscheiden | Finde alle Kreise |
| `he_gs1_mat_muster_geometrisch` | Geometrische Muster erkennen und fortsetzen | Welche Form kommt als Nächstes? |
| `he_gs1_mat_raumlage` | Lagebeziehungen verstehen | links, rechts, oben, unten |
| `he_gs1_mat_wege` | Einfache Wege nachvollziehen und beschreiben | Navigiere zum Ziel |
| `he_gs1_mat_laengen_vergleichen` | Längen direkt vergleichen | Was ist länger? |
| `he_gs1_mat_laengen_messen` | Einfache Längen messen bzw. vergleichen | Messe mit einer Einheit |
| `he_gs1_mat_tagesablauf` | Ereignisse zeitlich ordnen | Was kommt zuerst? |
| `he_gs1_mat_zeitspannen` | Einfache Zeitvorstellungen aufbauen | Wie lange dauert etwas? |
| `he_gs1_mat_geld` | Münzen und einfache Geldbeträge erkennen | Bezahle einen Gegenstand |
| `he_gs1_mat_daten_sammeln` | Einfache Daten aus Beobachtungen sammeln | Wie viele Tiere gibt es? |
| `he_gs1_mat_daten_darstellen` | Daten in einfachen Darstellungen lesen | Welches Symbol kommt am häufigsten vor? |
| `he_gs1_mat_sicherheit` | sicher, möglich und unmöglich unterscheiden | Kann das passieren? |

## 5.3 Sinnvolle Progression

### Leicht

- Mengen bis 10
- Zahlen bis 10
- einfache Vergleiche
- Plus/Minus mit konkretem Material
- Formen und Lagebeziehungen

### Mittel

- Zahlenraum bis 20
- Zahlzerlegung
- einfache Sachsituationen
- Zahlenstrahl
- Muster
- einfache Zeit- und Geldsituationen

### Schwer

- gemischte Aufgaben bis 20
- mehrschrittige Sachsituationen
- fehlende Zahlen
- weniger direkte Bildunterstützung
- kombinierte Raum-, Größen- oder Datenaufgaben

---

# 6. Sachunterricht

## 6.1 Lernschwerpunkte

Der hessische Sachunterricht ist mehrperspektivisch angelegt. Zentrale Perspektiven sind Gesellschaft und Politik, Natur, Raum, Technik sowie Geschichte und Zeit. Für digitale Lernabenteuer sind besonders Beobachten, Erkunden, Ordnen, Vergleichen, Beschreiben und einfaches Untersuchen geeignet.

## 6.2 Lernziele

| ID | Lernziel | Mögliche Questoria-Aufgabe |
|---|---|---|
| `he_gs1_su_ich` | Eigene Person und persönliche Merkmale beschreiben | Welche Beschreibung passt? |
| `he_gs1_su_beduerfnisse` | Grundlegende Bedürfnisse erkennen | Was braucht die Figur? |
| `he_gs1_su_gefuehle` | Grundlegende Gefühle unterscheiden und benennen | Wie fühlt sich die Figur? |
| `he_gs1_su_familie` | Formen des Zusammenlebens kennenlernen | Wer gehört zur Familie? |
| `he_gs1_su_regeln` | Regeln für gemeinsames Handeln verstehen | Welche Regel passt? |
| `he_gs1_su_schule` | Schule und Klassenraum erkunden | Wo findet man etwas? |
| `he_gs1_su_berufe` | Verschiedene Berufe und Tätigkeiten kennenlernen | Wer macht diese Aufgabe? |
| `he_gs1_su_wohnort` | Merkmale des eigenen Wohnortes erkennen | Was gehört zu einem Ort? |
| `he_gs1_su_orientierung` | Sich in einer vertrauten Umgebung orientieren | Finde den Weg |
| `he_gs1_su_raumlage` | links, rechts, vor, hinter, neben usw. anwenden | Ordne Positionen zu |
| `he_gs1_su_weg` | Einfache Wegbeschreibungen verstehen | Folge der Anweisung |
| `he_gs1_su_jahreszeiten` | Jahreszeiten erkennen und unterscheiden | Welche Jahreszeit ist dargestellt? |
| `he_gs1_su_wetter` | Wetter beobachten und beschreiben | Welches Wetter herrscht? |
| `he_gs1_su_pflanzen` | Pflanzen beobachten und grundlegende Merkmale erkennen | Welche Pflanze passt? |
| `he_gs1_su_tiere` | Tiere unterscheiden und Lebensräume zuordnen | Welches Tier lebt hier? |
| `he_gs1_su_koerper` | Körperteile benennen und zuordnen | Wo ist der Ellbogen? |
| `he_gs1_su_gesundheit` | Grundlegende Regeln für Gesundheit kennenlernen | Was ist gesund / sinnvoll? |
| `he_gs1_su_ernaehrung` | Lebensmittel unterscheiden und Ernährungssituationen erkennen | Was gehört zu einer ausgewogenen Mahlzeit? |
| `he_gs1_su_bewegung` | Bedeutung von Bewegung und Ruhe erfahren | Was ist eine passende Aktivität? |
| `he_gs1_su_materialien` | Materialien anhand einfacher Eigenschaften unterscheiden | Was ist weich / hart? |
| `he_gs1_su_wasser` | Eigenschaften und Bedeutung von Wasser entdecken | Was schwimmt / sinkt? |
| `he_gs1_su_licht_schatten` | Einfache Phänomene von Licht und Schatten erkunden | Wo entsteht der Schatten? |
| `he_gs1_su_technik_alltag` | Einfache technische Geräte erkennen und nutzen | Welches Gerät erfüllt die Aufgabe? |
| `he_gs1_su_bauen` | Einfache Konstruktionen planen und untersuchen | Welche Bauteile brauchst du? |
| `he_gs1_su_zeit` | gestern, heute und morgen unterscheiden | Was war vorher? |
| `he_gs1_su_vergangenheit` | Unterschiede zwischen früher und heute erkennen | Früher oder heute? |
| `he_gs1_su_umwelt` | Bedeutung von Natur und Umwelt erkennen | Was gehört wohin? |
| `he_gs1_su_müll` | Abfälle erkennen und einfach sortieren | Welcher Behälter passt? |

---

# 7. Questoria-Datenmodell für Lernziele

Die Lernziele sollten **nicht** an ein Franchise gekoppelt werden.

Empfohlene fachliche Abstraktion:

```json
{
  "id": "he_gs1_mat_mengen_vergleichen",
  "curriculum": "hessen",
  "grade": 1,
  "subject": "mathematik",
  "domain": "zahlen_und_operationen",
  "title": "Mengen vergleichen",
  "description": "Das Kind vergleicht zwei Mengen und erkennt mehr, weniger und gleich viele.",
  "skills": [
    "mehr",
    "weniger",
    "gleich_viele",
    "zuordnen"
  ],
  "difficulty_levels": [
    "leicht",
    "mittel",
    "schwer"
  ],
  "suitable_event_types": [
    "puzzle",
    "exploration",
    "dialog"
  ]
}
```

Die konkreten Franchise-Daten sollten anschließend nur noch die Präsentation liefern:

```text
Lernziel: he_gs1_mat_mengen_vergleichen
        ↓
Aufgabenvariante
        ↓
One Piece / Miraculous / Pokémon / eigene Welt
        ↓
Assets + Figuren + Dialoge + Story-Kontext
```

## 8. Empfohlene Aufgabentypen

Für Klasse 1 reichen zunächst wenige generische Event-/Task-Mechaniken, sofern sie gut parametrisiert werden.

| Aufgabentyp | Besonders geeignet für |
|---|---|
| `choice` | Wissen, Zuordnung, Deutsch, Sachunterricht |
| `multiple_choice` | einfache Sachfragen, Textverständnis |
| `order` | Satzbau, Reihenfolgen, Zeit, Geschichten |
| `match` | Laut/Buchstabe, Bild/Wort, Menge/Zahl |
| `sort` | Kategorien, Größen, Tiere, Materialien |
| `count` | Mengen, Mathematik |
| `fill` | fehlende Buchstaben / Zahlen |
| `sequence` | Muster, Zahlfolgen, Bildfolgen |
| `path` | Raumorientierung, Wegbeschreibung |
| `observe` | Natur, Wetter, Sachunterricht |
| `dialog` | Hörverstehen, sprachliche Entscheidungen |
| `exploration` | Sachunterricht, räumliche Orientierung |

Die tatsächliche Menge der Eventtypen muss an die in Questoria implementierten Eventtypen gekoppelt bleiben. Das bestehende Authoring-Schema arbeitet mit einer geschlossenen Wertemenge für Eventtypen; Content darf daher keine nicht implementierten Eventtypen voraussetzen.

---

# 9. Curriculum zuerst, Franchise danach

Eine Lernaufgabe sollte etwa so aussehen:

```text
Curriculum-ID:
he_gs1_mat_mengen_vergleichen

Schwierigkeitsstufe:
leicht

Ziel:
Das Kind erkennt, welche von zwei dargestellten Mengen größer ist.

Aufgabenstruktur:
Zwei Mengen mit jeweils 1–10 Elementen.

Erwartete Leistung:
Das Kind wählt mehr / weniger / gleich viele korrekt.

Darstellung:
Bildlich, geringe Textmenge.

Franchise:
variabel
```

Daraus können beliebig viele Oberflächen entstehen:

```text
One Piece:
Welche Schatzkiste enthält mehr Münzen?

Pokémon:
In welchem Beutel sind mehr Pokébälle?

Miraculous:
Welche Box enthält mehr Glücksbringer?

Eigene Welt:
Welche Kiste enthält mehr Äpfel?
```

Das **Lernziel bleibt exakt dasselbe**.

---

# 10. Qualitätsregeln für zukünftigen Content

1. Lernziel und Franchise voneinander trennen.
2. Ein Event prüft möglichst genau eine zentrale Fähigkeit.
3. Aufgaben für Klasse 1 kurz und visuell halten.
4. Textmenge nur erhöhen, wenn Lesen bzw. Sprachverständnis selbst Lernziel ist.
5. Bildstützen für frühe Lernstufen bevorzugen.
6. Schwierigkeitsgrad über Anzahl, Komplexität, Hilfen und Transfer erhöhen – nicht bloß über „größere Zahlen“.
7. Jede Lernziel-ID muss eindeutig und stabil bleiben.
8. Curriculum-Referenzen dokumentieren, damit Inhalte später überprüfbar bleiben.
9. Keine Franchise-spezifische Fachlogik in das Lernzielmodell aufnehmen.
10. Lernfortschritt niemals in statischen Content-Dateien speichern; Fortschritt gehört weiterhin in den Spielstand.

---

# 11. Empfohlene nächste Ausbaustufe

Für eine belastbare erste Curriculum-Datenbasis sollte aus dieser Übersicht je Lernziel eine strukturierte Definition entstehen:

```text
ID
Fach
Jahrgang
Bereich
Lernziel
Kurzbeschreibung
Voraussetzungen
Kompetenzkern
Schwierigkeitsstufe 1
Schwierigkeitsstufe 2
Schwierigkeitsstufe 3
Geeignete Aufgabentypen
Beispielaufgabe
Fehlerarten
Hilfestellungen
Curriculum-Referenz
```

Damit entsteht aus einer bloßen Inhaltsliste ein wiederverwendbarer **Questoria Curriculum Layer**, auf den anschließend beliebige Themenwelten und Franchises aufgesetzt werden können.

---

# 12. Quellen

- Hessisches Kultusministerium: **Hessische Kerncurricula – Primarstufe**. Übersicht der Kerncurricula und Fächer: https://kultus.hessen.de/unterricht/kerncurricula-und-lehrplaene/kerncurricula/kerncurricula-primarstufe
- Hessisches Kultusministerium: **Kerncurriculum Deutsch – Primarstufe**: https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/kc_deutsch_prst_2011_1.pdf
- Hessisches Kultusministerium: **Kerncurriculum Mathematik – Primarstufe**: https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/kc_mathematik_prst_2011.pdf
- Hessisches Kultusministerium: **Kerncurriculum Sachunterricht – Primarstufe**: https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/kc_sachunterricht_prst_2011.pdf
- Hessisches Kultusministerium: **Kontingent-Wochenstundentafel Grundschule** (Übersicht in der Informationsbroschüre für Grundschulen): https://www.fortbildung.kultus.hessen.de/sites/kultus.hessen.de/files/2022-01/bf_primarstufe_ein_leitfaden_zur_information_von_tv-h-kraeften_an_grundschulen.pdf
- Hessisches Kultusministerium: **Curriculare Vorgaben / Kerncurricula**: https://kultus.hessen.de/unterricht/kerncurricula-und-lehrplaene/kerncurricula

## 13. Bezug zu Questoria

Die Datei ist als fachlicher Content-Backlog gedacht und ersetzt nicht das verbindliche Questoria-JSON-Schema. Beim Überführen in `data/themes/` sind insbesondere die bestehenden Regeln zu Lernstufen, Eventtypen, Episoden und ausgelagerten Event-Konfigurationen zu beachten.

---

# 14. Projekt-Ergänzungen

**Nicht Teil der Ursprungsfassung.** Alles oberhalb dieser Linie ist die
gelieferte Fassung vom 19.08.2026, unverändert. Hier stehen nur Abweichungen,
die sich beim Anwenden auf echten Questoria-Content ergeben haben — damit
später nachvollziehbar bleibt, was Quelle ist und was Questoria dazugelegt hat.

## 14.1 Nachgetragene Lernziel-IDs

| ID | Lernziel | Warum nachgetragen |
|---|---|---|
| `he_gs1_deu_reime_erkennen` | Reimwörter erkennen und zuordnen | Reimen fehlt in Abschnitt 4.2 vollständig, ist aber Standard-Baustein der phonologischen Bewusstheit und in `pokemon_lesen` bereits zweimal gebaut (`reim_1`, `reim_2`) |

Nachgetragene IDs folgen demselben Namensschema und sind ab Vergabe genauso
stabil zu halten wie die Original-IDs (Qualitätsregel 7).

## 14.2 Aufgabentypen — was es wirklich gibt

Abschnitt 8 listet zwölf Aufgabentypen als Vorschlag. Verbindlich ist
ausschließlich die Typ-Tabelle in
[`data/_authoring/JSON_SCHEMA_REFERENCE.md`](../../data/_authoring/JSON_SCHEMA_REFERENCE.md)
Abschnitt 5.0 — ein Typ existiert erst, wenn seine Angular-Komponente existiert.

Stand 19.08.2026 gebaut: `dialog`, `reward` (beide inline, keine Lernaufgaben)
sowie `multiple_choice`, `text_input`, `image_search`, `word_match`.

Daraus folgt für die Fachplanung: Deutsch lässt sich mit dem Bestand
weitgehend abbilden. **Mathematik nicht** — `count`, `order`, `fill`,
`sequence` und `path` aus Abschnitt 8 sind nicht gebaut. Eine Mathe-Welt
braucht zuerst Engine-Arbeit, nicht Content.

## 14.3 Wie ein Lernziel im Content landet

Eine ausgelagerte Aufgabendatei trägt das Feld `learning_objectives` —
Format und Regeln in `JSON_SCHEMA_REFERENCE.md` Abschnitt 5.0.
