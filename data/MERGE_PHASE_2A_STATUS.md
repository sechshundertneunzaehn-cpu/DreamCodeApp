# Merge Phase 2A — Abschluss-Status

**Datum:** 2026-04-18 21:03 (+0300)
**Strategie:** Option C — feldweiser Merge. B Skelett + A Anreicherung.
**Generator:** `scripts/merge_kb.py`
**Ausgeführt:** 2026-04-18 20:49 (+0300)

## Input

| Quelle | Datei | Symbole |
|---|---|---|
| A | `data/knowledgeBase.ts` | 801 (roh) / 790 (nach Dedup, 11 IDs gemergt) |
| B | `data/traumsymbole.json` | 877 |

**A-Duplikate gemergt:** `bruecke, gefaengnis, hoelle, koenig, koenigin, loewe, nacht, oel, schildkroete, wueste, zahn` (jeweils 2× → 1×).

## Output

**Datei:** `data/traumsymbole.v3.json` — **879 Symbole**, 0 ID-Duplikate, 9 normierte Kategorien.

| Metrik | Wert |
|---|---|
| B-matched (A→B ergänzt) | 790 |
| A-exclusive (`a_<id>`, neue Symbole aus A) | 2 |
| B-only (kein A-Pendant) | 87 |
| **Gesamt v3** | **879** |

**Kategorien-Enum** (alle singular, lowercase, ASCII):
`objekt (200) · emotion (135) · aktion (108) · natur (100) · tier (90) · ort (85) · person (75) · koerper (68) · spirituell (18)`

**Originale unangetastet:** `knowledgeBase.ts` und `traumsymbole.json` nur gelesen. Kein App-Import geändert.

## Kernzahlen

| Was | Count |
|---|---|
| Neue Traditionen in `additional_sources` (pro-Symbol-Summen) | ~250+ Felder |
| A-Versionen als `A_alternative_interpretation` archiviert (B gewinnt bei Konflikt) | **258 Felder** |
| Leere `ost_west_vergleich` entfernt (Report-Count) | 616 (Script-alt) / real 867 ohne Feld in v3 |
| Name-Kollisionen in A (zwei IDs, gleicher normierter Name) | 4: `zahn↔zaehne`, `nacht↔dunkelheit`, `markt↔markt_basar`, `meer↔ozean` |
| Ungemappte A-Quellen (geskippt) | **1** — siehe Offene Punkte |
| ID-Duplikate in v3 | **0** |

## Sample-Diff

Vollständiger Before/After-Diff für **Zahn** im Merge-Report (`traumsymbole.v3.merge-report.md`). Felder `jung`, `medieval`, `theravada` aus A nach `additional_sources` migriert; Ibn-Sirin- und Freud-A-Varianten als `A_alternative_interpretation` archiviert (B-Text blieb primär); Keywords aus A (`Zähne verlieren`, `Gebiss`, `Mund`, `Karies`) in `synonyme` unioniert; `kategorie: Körper → koerper`.

## Offene Punkte

1. **`PYTHAGOREAN` unbekannte Quelle** — ein A-Interpretation-Source-Wert, der nicht in `SOURCE_MAP` steht. Betroffen: **1 Symbol** (`objekt_011`, 1 Interpretation). Entscheidung nötig: manuell nach `additional_sources.pythagorean` mappen ODER bewusst verwerfen? → Empfehlung: SOURCE_MAP-Eintrag nachziehen (`PYTHAGOREAN → pythagorean / "Pythagoräische Tradition"`), Rerun.

2. **Multi-Language-Übersetzung der Symbol-Inhalte** — Interpretationen aktuell 100 % Deutsch. Abdeckung EN/AR/TR/…: **0 %**. Nicht im Scope von Phase 2A. → **Phase 2B** öffnen.

3. **Report-Kosmetik eingebaut, noch nicht gelaufen:**
   - `ost_west_vergleich`-Drop erfasst jetzt auch `null`, leer-string, leer-list und fehlend.
   - Sample-Diff-Liste ist nicht mehr hardcoded `feuer/zahn/balkon`, sondern wählt dynamisch die 3 Symbole mit den meisten A-neuen-Traditionen aus.
   Diese Änderungen liegen im Script, greifen aber erst beim **nächsten Rerun** — bewusst nicht jetzt ausgeführt.

4. **Sample-Diffs aktuell nur 1** im bestehenden Report (Zahn). Feuer und Balkon matchten die Hardcode-Liste nicht, weil die B-IDs anders lauten oder die Symbole dort keine A-Anreicherung erhielten. Ab nächstem Rerun automatisch 3 garantiert-nicht-leere Diffs.

5. **App-Integration** (Import-Pfad ändern auf `traumsymbole.v3.json`): **außerhalb Phase 2A**. Nicht berührt. Empfohlen als separates Mini-Increment nach Phase 2B.

## Status

**MERGE_PHASE_2A_ABGESCHLOSSEN**
