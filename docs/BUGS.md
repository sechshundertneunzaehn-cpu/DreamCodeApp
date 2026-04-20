# DreamCode — Bug-Tracker

## Offen

### BUG-001: User-Nodes spawnen nicht bei Symbol-Klick (seit 10.04.2026)
- **Schwere:** Mittel (Feature funktioniert nicht, aber App laeuft)
- **Wo:** Knowledge Graph Visualisierung
- **Symptom:** Klick auf Symbol zeigt Detail-Panel (OK), DreamList (OK), aber keine User-Nodes im Graph
- **Root Cause:** Noch nicht final identifiziert — wahrscheinlich Visibility-Filter
- **Workaround:** User-Nodes erscheinen beim Initial-Load, nur On-Click-Expansion fehlt
- **Siehe:** CURRENT_TASK.md

## Behoben

### BUG-002: Zeitfilter filtert nur Dreams, nicht Symbol-Aggregation (behoben 16.04.2026)
- **Fix:** Neue RPC `get_graph_data_filtered` mit dynamischer Aggregation
- **Migration:** 014_graph_time_filter.sql

### BUG-003: json-Equality-Fehler in RPC (behoben 16.04.2026)
- **Symptom:** `could not identify an equality operator for type json`
- **Fix:** `row_to_json(...)::jsonb` statt `DISTINCT row_to_json(...)`

### BUG-004: research_dreams fehlt in Graph-Query (behoben 16.04.2026)
- **Symptom:** 0 Symbole bei gefilterter Abfrage
- **Fix:** UNION mit research_dreams in `get_graph_data_filtered`
