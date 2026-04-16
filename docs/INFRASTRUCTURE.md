# DreamCode — Infrastruktur

## Server
| Rolle | Host | IP | Details |
|---|---|---|---|
| Produktion | Helsinki (Hetzner CX53) | 89.167.38.29 | Frontend + Backend |
| Datenbank | Supabase Frankfurt | xwcftfgujacsutwhossi | PostgreSQL + Auth + RLS |

## Pfade auf Helsinki
- Frontend: `/var/www/dreamcode/` (nginx)
- Backend: `/opt/dreamcode-api/` (PM2, Port 3001)
- Proxy: nginx reverse-proxy `/api/*` → localhost:3001

## Lokale Entwicklung
- Frontend: `~/Projects/DreamCode/app/DreamCodeApp-current/`
- Backend: `~/Projects/DreamCode/backend/`
- Dev-Server: `npm run dev` (Port 5173)

## Deploy-Prozess
```bash
# Frontend
cd ~/Projects/DreamCode/app/DreamCodeApp-current
npm run build
rsync -avz --delete dist/ root@89.167.38.29:/var/www/dreamcode/

# Backend
rsync -avz --exclude node_modules --exclude .env src/ root@89.167.38.29:/opt/dreamcode-api/src/
ssh root@89.167.38.29 "pm2 restart dreamcode-api"

# DB-Migration
npx supabase db push --include-all
```

## GitHub-Repos (privat)
- Frontend: https://github.com/sechshundertneunzaehn-cpu/DreamCodeApp
- Backend: https://github.com/sechshundertneunzaehn-cpu/dreamcode-api

## SSH
- Key: `~/.ssh/id_rsa_ai-server`
