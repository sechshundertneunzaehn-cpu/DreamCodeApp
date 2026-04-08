# EduScraper — Global Education Email Scraper

Zero-LLM email scraper for educational institutions. Uses Regex + Cheerio instead of expensive API calls.

## Architecture

```
usa_simple_all.csv (120k URLs)
        │
        ▼
   src/import.ts          ← deduplicates, pushes new URLs to queue
        │
        ▼
   BullMQ Queue (Redis)   ← 50 parallel workers, per-domain rate limiting
        │
        ▼
   src/scraper.ts         ← fetches homepage + contact pages, extracts emails via regex
        │
        ▼
   output/results.csv     ← Name, Email, Institution, Country, URL (Mailmerge-ready)
```

## Quick Start

### 1. Start Redis
```bash
docker-compose up -d redis
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure
```bash
cp .env.example .env
# Edit .env: set DATA_DIR to your us_education_data path
```

### 4. Import existing data + queue new URLs
```bash
npm run import
# Options:
#   --dry-run          preview without queuing
#   --country US       filter by country
#   --limit 5000       only queue first N institutions
```

### 5. Start scraping
```bash
npm run scrape
```

### 6. Watch progress (separate terminal)
```bash
npm run dashboard
```

### Phase 2: Global expansion
```bash
npm run expand -- --countries DE,UK,FR,TR,IN --source all
# Sources: wikipedia | whed | all
```

## Output Format

`output/results.csv` — compatible with Mailmerge tools:

| Column | Description |
|---|---|
| `name` | Contact name (empty if not found) |
| `email` | Email address |
| `institution` | Institution name |
| `country` | ISO country code (US, DE, etc.) |
| `url` | Institution homepage |
| `source_url` | Sub-page where email was found |
| `scraped_at` | ISO timestamp |

## Proxy Setup

Supports IPRoyal and Bright Data residential proxies via `.env`:

```env
PROXY_ENABLED=true
PROXY_URL_US=http://user:pass@us.iproyal.com:12321
PROXY_URL_EU=http://user:pass@eu.iproyal.com:12321
```

Geo-routing is automatic based on institution country code.

## Performance

- 50 concurrent workers
- Rate limited: 5 req/sec per domain
- 3 retries with exponential backoff (5s → 10s → 20s)
- Already-scraped URLs are skipped on re-import
- Crash-safe: progress persists in Redis + CSV

## Telegram Notifications

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

Sends milestone alerts every 500 emails found.
