# DreamCode — Lebender Kontext für Claude

## Aktueller Status (Stand: 16.04.2026)
- App live auf dream-code.app/app/
- Knowledge Graph Bug: User-Expansion bei Symbol-Klick funktioniert nicht
- Seit 6 Tagen ungelöst

## Infrastruktur
- Server: Hetzner 89.167.38.29 (Helsinki, CX53)
- Frontend: /var/www/dreamcode, nginx
- Backend: /opt/dreamcode-api, PM2 Port 3001
- Supabase: xwcftfgujacsutwhossi (Frankfurt)
- Deploy: npm run build && rsync dist/ root@89.167.38.29:/var/www/dreamcode/

## Frozen Files (NIEMALS ändern)
- src/index.css
- src/components/LiveSession.tsx
- src/App.tsx

## Aktuelle Baustelle
Bug: KnowledgeGraph.tsx onClick Zeile 384
- Symbol-Klick zeigt Detail-Panel rechts (OK)
- ABER keine User-Nodes + Links im Graph
- Backend /api/graph/symbol/:id liefert dreamers Array
- useNodeExpansion soll User-Nodes pushen, tut es aber nicht sichtbar

## Nächster Schritt
Claude liest 3 Files selbst via GitHub-Connector und findet Bug zeilenweise.
