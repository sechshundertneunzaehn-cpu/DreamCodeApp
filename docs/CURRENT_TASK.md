# DreamCode — Aktuelle Aufgabe

## Bug: User-Expansion im Knowledge Graph

### Problem
Klick auf Symbol-Node (z.B. "Wasser") soll verbundene User-Nodes + Links im Graph spawnen.
Backend liefert die Daten korrekt, aber die Nodes erscheinen nicht sichtbar.

### Diagnose (16.04.2026)
1. `KnowledgeGraph.tsx:384` — onClick ruft `toggleExpansion()`
2. `useNodeExpansion.ts` — fetcht `/api/graph/symbol/{dbId}`, erstellt Symbol + User GraphNodes
3. API liefert `{ connected: [...], dreamers: [...] }` — korrekt verifiziert
4. Expansion-Injection-Effect (KnowledgeGraph.tsx:596) injiziert Nodes in D3-Simulation
5. **Vermutung:** Expansion-Nodes werden erstellt aber durch Visibility-Filter ausgeblendet

### Relevante Dateien
- `components/KnowledgeGraph.tsx` — D3 Rendering + Expansion-Injection
- `hooks/useNodeExpansion.ts` — API-Fetch + Node/Link-Erstellung
- `services/graphDataService.ts` — Graph-Daten laden
- Backend: `/opt/dreamcode-api/src/routes/graphSymbol.ts`

### Naechster Schritt
Visibility-Filter in tick-Handler (KnowledgeGraph.tsx:438-513) pruefen:
- `isNodeVisible()` koennte `exp_*` und `exp_usr_*` IDs filtern
- `visibleIds` Set enthaelt nur bekannte Prefixe (sym_, cul_, usr_, emo_, elem_)
