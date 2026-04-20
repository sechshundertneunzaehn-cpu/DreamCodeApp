# DreamCode — Letzte 7 Tage

## Zeitraum
10.04.2026 bis 16.04.2026

## Kern-Bug (ungeloest, seit ~10.04.2026)
Knowledge Graph: Klick auf Symbol-Node spawnt keine User-Nodes im Graph.
- Detail-Panel rechts funktioniert (setSelectedNode, setDreamListNode)
- Backend /api/graph/symbol/:id liefert dreamers Array (verifiziert: 30 Dreamer fuer "Haus")
- useNodeExpansion pusht Symbol-Nodes UND User-Nodes in expansion.nodes[]
- Expansion-Injection-Effect (KnowledgeGraph.tsx:596) injiziert in D3-Simulation
- ABER: Nodes erscheinen nicht sichtbar im Graph

## Was versucht wurde (chronologisch)

### 10.04.2026 — Security Audit + Store-Readiness
- Alle API-Keys aus Client-Bundle entfernt (Claude, ElevenLabs, OpenRouter, DeepSeek, Replicate)
- Backend-Migration: Keys nur noch server-seitig in /api/ Routes
- TypeScript strict mode aktiviert, ESLint eingerichtet
- Capacitor Android-Build konfiguriert, App-Icons generiert
- 196 console.logs bereinigt, DEV-Bypass entfernt
- RTL-Support fuer Farsi/Urdu in allen Komponenten

### 11.04.2026 — Research-Daten + Map
- 27.675 Forschungsprofile importiert + DreamMap Cyan-Layer
- Mapbox Token-Fix + Supabase Pagination
- Scientific Study Participation + Discount-System
- Beast Mode Session: 5 Bug-Fixes (Dates, Search, Profile, Filter, Navigation)

### 12.04.2026 — Backend-Konsolidierung + Knowledge Graph
- 305 neue Traumsymbole migriert (801 gesamt)
- Multi-Tradition Backend umgebaut (traditions[] statt tradition string)
- Kategorien Multi-Select fuer KI-Interpretation
- Stripe Webhooks, Tier-Auth, Rate-Limiting, Sanitisierung
- CORS + Auth + Sprachgruppen-Routing
- Backend auf Hetzner Helsinki migriert (weg von Vercel wegen 12-Function-Limit)
- 9 UI-Fixes: traditions, cosmicDNA, chatfield, bottomnav, prices, markdown, PDF

### 13.04.2026 — Internationalisierung
- Sprach-Integration vervollstaendigt: videoI18n + LANG_NAMES + RTL
- Neue Uebersetzungsdateien fuer 10+ Sprachen

### 14.04.2026 — Knowledge Graph UI
- Hintergrund-Bubbles im KnowledgeGraph komplett ausblenden bei Suche
- Visibility-Filter fuer Search-Modus angepasst

### 16.04.2026 — Knowledge Graph Zeitfilter + User-Expansion + GitHub
- Bug-Diagnose: 7-Punkte-Analyse des onClick-Handlers (Zeile 384)
- Erkannt: useNodeExpansion expandiert nur Symbole, NICHT User
- Neue RPC get_graph_data_filtered: dynamische Symbol-Aggregation mit Zeitfilter
- research_dreams UNION Fix (dream_symbol_links verweisen auf research_dreams)
- json/jsonb Cast-Fix in RPC
- Zeitfilter-UI: Buttons 1J/3J/5J/10J/Alle im Graph
- Backend graphSymbol.ts erweitert: liefert jetzt dreamers[] zusaetzlich
- useNodeExpansion.ts umgeschrieben: erstellt User-GraphNodes + dreamed_by-Links
- KnowledgeGraph.tsx: Expansion-Nodes visuell differenziert (User=gruen, Symbol=bunt)
- GitHub-Repos erstellt: DreamCodeApp (Frontend) + dreamcode-api (Backend)
- Obsidian-Vault /docs/ mit obsidian-git Auto-Sync eingerichtet

## Aktueller Code-Stand

### KnowledgeGraph.tsx (c5982dc, 16.04.2026)
- ~880 Zeilen, D3 Force Simulation
- onClick Handler Zeile 384: ruft toggleExpansion + setzt DreamListNode
- Expansion-Injection-Effect Zeile 596: injiziert expNodes in Simulation
- Zeitfilter-Buttons (1J/3J/5J/10J/Alle) unten links
- Visibility-Filter im tick-Handler Zeile 438-513
- Expansion-Nodes: unterschiedliche Darstellung fuer User (gruen) vs Symbol (bunt)

### useNodeExpansion.ts (c5982dc, 16.04.2026)
- Fetcht /api/graph/symbol/{dbId}
- Erstellt Symbol-Nodes (type: 'symbol', id: exp_{id})
- Erstellt User-Nodes (type: 'user', id: exp_usr_{userId}, color: #10b981)
- Erstellt Links: related (Symbol) + dreamed_by (User)
- Toggle: zweiter Klick auf gleiches Symbol = collapse

### graphSymbol.ts Backend (16.04.2026, auf Helsinki)
- GET /api/graph/symbol/:symbolId
- Liefert: { symbol, connected[], interpretations[], dreamers[] }
- Dreamer-Aggregation: dream_symbol_links → user_id gruppiert
- Fallback: research_dreams → participant_id wenn keine user_id
- Limit: 30 Dreamer, 12 Connected Symbols

## Was definitiv funktioniert
- Initial-Load: alle Symbol/Culture/User/Emotion/Element Nodes werden korrekt gerendert
- D3 Force Simulation: Zoom, Pan, Drag, Pulse-Animation
- Detail-Panel rechts bei Symbol-Klick (setSelectedNode)
- DreamListPanel: Traum-Texte werden geladen und angezeigt
- Backend-Endpoint: liefert korrekte Daten (verifiziert mit curl)
- Zeitfilter: RPC gibt korrekte dynamische Aggregation zurueck
- Suche: Symbole werden gefunden + hervorgehoben
- Kategorie-Filter: funktioniert clientseitig
- Demographische Filter: Backend-Endpoint + Frontend-Integration

## Was definitiv NICHT funktioniert
- User-Nodes + Linien spawnen NICHT sichtbar bei Symbol-Klick
- Auch nach useNodeExpansion-Erweiterung + Deploy: keine visuelle Aenderung
- Unklar ob Nodes in Simulation landen aber unsichtbar sind, oder gar nicht erstellt werden

## Verdachtsmomente (aus Diagnose 16.04.2026)

### Verdacht 1: Visibility-Filter blockt Expansion-Nodes
- tick-Handler (Zeile 438-513) berechnet `visibleIds` Set
- `visibleIds` wird aus searchIds, expandedIds, userIds, demoFilter aufgebaut
- Expansion-Nodes (exp_*, exp_usr_*) sind in KEINEM dieser Sets enthalten
- visStateRef.current hat zwar expansionNodeIds, aber diese werden nur bei aktiver Suche addiert (Zeile 462-465)
- OHNE aktive Suche: `hasFilter = false` → opacity 1 fuer alle → sollte sichtbar sein
- MIT aktiver Suche: Expansion-Nodes werden moeglicherweise gefiltert

### Verdacht 2: Expansion-Effect feuert nicht oder zu frueh
- Effect haengt an [expansion.sourceNodeId, expansion.nodes, expansion.links]
- Wenn toggleExpansion async ist und setState batched wird: Effect koennte mit leerem State feuern
- Cleanup am Anfang entfernt alte Expansion-Elemente (.exp-link, .exp-node)

### Verdacht 3: API-Call scheitert still
- useNodeExpansion catch-Block setzt EMPTY state ohne Fehlermeldung
- Wenn /api/graph/symbol/{dbId} 404/500 zurueckgibt: kein Fehler sichtbar
- ABER: curl-Test zeigt korrekte Response → API funktioniert

### Verdacht 4: D3 SVG-Selektion findet Expansion-Gruppe nicht
- expNodeEls = nodeGroup.selectAll('.exp-node') koennte leer sein
- Wenn nodeGroup (g.select('g.nodes')) nicht den richtigen Container findet
- Wuerde bedeuten: Nodes werden zur Simulation hinzugefuegt aber nie gezeichnet

## Naechster Schritt
Claude liest KnowledgeGraph.tsx + useNodeExpansion.ts + graphSymbol.ts
zeilenweise im neuen Project und findet Root-Cause.
Fokus: Verdacht 1 (Visibility-Filter) und Verdacht 4 (SVG-Selektion).
