# Merge-Report: traumsymbole.v3.json

Merge-Strategie: **Option C** — feldweiser Merge. B (Skelett) + A (Anreicherung).

## Mengen

| Quelle | Symbole |
|---|---|
| A (knowledgeBase.ts) roh | 801 |
| A dedupliziert | 790 |
| B (traumsymbole.json) | 877 |
| **Output v3** | **879** |
| — davon B-matched | 790 |
| — davon A-exclusive | 2 |

## Duplikate in A (gemergt)

- `koenig`
- `koenigin`
- `nacht`
- `bruecke`
- `gefaengnis`
- `schildkroete`
- `wueste`
- `hoelle`
- `loewe`
- `oel`
- `zahn`

## Name-Kollisionen in A (zwei verschiedene IDs, gleicher normierter Name)

- zahn <-> zaehne ('zaehne')
- nacht <-> dunkelheit ('dunkelheit')
- markt <-> markt_basar ('markt')
- meer <-> ozean ('ozean')

## Konflikte / Unbekannte Quellen

- objekt_011: unknown A-source PYTHAGOREAN (skipped)

## Alternative Ibn-Sirin/Freud-Versionen (B gewinnt, A archiviert)

Gesamt: 258 Felder mit `A_alternative_interpretation`.

- objekt_016:ibn_sirin
- adamsapfel:freud
- adler:ibn_sirin
- alptraum:ibn_sirin
- angst:ibn_sirin
- anker:medieval
- arena:jung
- arzt:ibn_sirin
- auge:freud
- baer:jung
- bart:ibn_sirin
- bauch:freud
- bauen:ibn_sirin
- objekt_018:ibn_sirin
- blume:ibn_sirin
- ort_003:ibn_sirin
- bushaltestelle:gestalt
- chef:freud
- dach:jung
- darm:gestalt
- diamant:jung
- natur_008:ibn_sirin
- natur_008:ibn_sirin
- natur_009:ibn_sirin
- eis:freud
- objekt_023:ibn_sirin
- objekt_023:ibn_sirin
- erde:ibn_sirin
- tier_003:ibn_sirin
- tier_004:ibn_sirin
- … (+228 weitere)

## Leere ost_west_vergleich (entfernt)

Gesamt entfernt: **616** Symbole.

## Kategorien-Normierung

### Vor Merge (B roh)

| Kategorie | Anzahl |
|---|---|
| `Objekte` | 200 |
| `Emotionen` | 135 |
| `Aktivitäten` | 107 |
| `Natur` | 100 |
| `Tiere` | 90 |
| `Orte` | 85 |
| `Personen` | 74 |
| `Körper` | 68 |
| `Spirituelles` | 18 |

### Nach Merge (normiert)

| Kategorie | Anzahl |
|---|---|
| `objekt` | 200 |
| `emotion` | 135 |
| `aktion` | 108 |
| `natur` | 100 |
| `tier` | 90 |
| `ort` | 85 |
| `person` | 75 |
| `koerper` | 68 |
| `spirituell` | 18 |

## Neue Traditionen pro Symbol (Top 25)

| Symbol-ID | Neue Traditionen |
|---|---|
| `person_005` | 4 |
| `ozean` | 4 |
| `symbol_009` | 4 |
| `natur_009` | 3 |
| `objekt_006` | 3 |
| `objekt_037` | 3 |
| `objekt_081` | 3 |
| `objekt_011` | 3 |
| `tier_023` | 3 |
| `ort_015` | 3 |
| `zahn` | 3 |
| `zaehne` | 3 |
| `objekt_017` | 2 |
| `natur_005` | 2 |
| `symbol_005` | 2 |
| `symbol_007` | 2 |
| `natur_025` | 2 |
| `tier_019` | 2 |
| `objekt_002` | 2 |
| `adler` | 1 |
| `affe` | 1 |
| `alptraum` | 1 |
| `altar` | 1 |
| `alter_mann` | 1 |
| `ameise` | 1 |

## Sample-Diffs (3 Symbole)

### Zahn

**Vorher (B):**
```json
{
  "id": "zahn",
  "name": "Zahn",
  "kategorie": "Körper",
  "synonyme": [
    "Zähne"
  ],
  "emoji": "🦷",
  "freud": {
    "vorhanden": true,
    "interpretation": "Zahnausfall wird als Symbol für Kastration, sexuelle Impotenz oder Geburtsträume gedeutet."
  },
  "ibn_sirin": {
    "vorhanden": true,
    "deutungen": [
      "Die Zähne symbolisieren die Familie und die Lebensdauer (Ajal). Die oberen Zähne sind männliche Verwandte, die unteren weibliche.",
      "Der Verlust eines Zahnes ohne Schmerz bedeutet Langlebigkeit; mit Schmerz den Verlust eines Verwandten oder von Wohlstand."
    ]
  },
  "verwandte_symbole": [],
  "ost_west_vergleich": {},
  "traumtyp_kategorien": []
}
```

**Nachher (v3):**
```json
{
  "id": "zahn",
  "name": "Zahn",
  "kategorie": "koerper",
  "synonyme": [
    "Zähne",
    "Zähne verlieren",
    "Gebiss",
    "Mund",
    "Karies"
  ],
  "emoji": "🦷",
  "freud": {
    "vorhanden": true,
    "interpretation": "Zahnausfall wird als Symbol für Kastration, sexuelle Impotenz oder Geburtsträume gedeutet.",
    "A_alternative_interpretation": "Zahnausfall ist nach Freud mit Kastrationsangst und dem Verlust männlicher Potenz verbunden. Auch Geburtsträume können dahinterstecken."
  },
  "ibn_sirin": {
    "vorhanden": true,
    "deutungen": [
      "Die Zähne symbolisieren die Familie und die Lebensdauer (Ajal). Die oberen Zähne sind männliche Verwandte, die unteren weibliche.",
      "Der Verlust eines Zahnes ohne Schmerz bedeutet Langlebigkeit; mit Schmerz den Verlust eines Verwandten oder von Wohlstand."
    ],
    "A_alternative_interpretation": [
      "Zähne repräsentieren Familienmitglieder. Einen Zahn verlieren bedeutet den Verlust eines Angehörigen oder den Weggang aus der Familie. Schöne Zähne verheißen Stärke der Familie."
    ]
  },
  "verwandte_symbole": [],
  "additional_sources": {
    "jung": {
      "label": "C.G. Jung",
      "text": "Zähne symbolisieren Durchsetzungskraft und Vitalität. Ihr Verlust zeigt Ohnmacht, Angst vor Kontrollverlust oder sozialer Entblößung."
    },
    "medieval": {
      "label": "Mittelalterliche Tradition",
      "text": "Zähne wurden als Symbol der Stärke des Glaubens gesehen. Ihr Verlust deutete auf Schwächung der spirituellen Widerstandskraft hin."
    },
    "theravada": {
      "label": "Theravada",
      "text": "Zahnverlust weist auf das Vergänglichkeitsprinzip (Anicca) hin – eine Erinnerung, dass körperliche Attribute nicht das wahre Selbst sind."
    }
  }
}
```
