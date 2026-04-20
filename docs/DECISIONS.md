# DreamCode — Architektur-Entscheidungen

## 2026-04-16: Dynamische Symbol-Aggregation statt statischer frequency
- **Problem:** `dream_symbols.frequency` ist statisch, Zeitfilter filtern nur Dreams aber nicht Symbol-Aggregation
- **Entscheidung:** Neue RPC `get_graph_data_filtered` aggregiert Symbole dynamisch aus gefiltertem Dream-Set via `COUNT(DISTINCT dream_symbol_links.dream_id)`
- **Grund:** Konsistenz — "1 Jahr"-Filter muss auch Symbol-Edges reduzieren, nicht nur Dream-Nodes

## 2026-04-16: research_dreams + user_dreams UNION in Graph-Queries
- **Problem:** `dream_symbol_links.dream_id` verweist auf `research_dreams`, nicht `user_dreams`
- **Entscheidung:** Alle Graph-Queries nutzen UNION beider Tabellen
- **Grund:** Daten kommen primär aus Research-Import, nicht aus User-Eingabe

## 2026-04-16: Deploy auf Helsinki, NICHT Vercel
- **Entscheidung:** Immer auf Hetzner Helsinki deployen
- **Grund:** Volle Kontrolle, keine Vercel-Limits, Backend + Frontend auf einem Server

## Frozen Files
Diese Dateien duerfen NICHT geaendert werden:
- `src/index.css` — globale Styles, zerbricht Layout
- `src/components/LiveSession.tsx` — Audio-Session, fragiles State-Management
- `src/App.tsx` — Haupt-Router, nur bei expliziter Anweisung aendern
