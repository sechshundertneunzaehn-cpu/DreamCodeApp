import 'dotenv/config';
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import * as fs from 'fs';
import * as path from 'path';
import { stringify } from 'csv-stringify/sync';
import { scrapeInstitution } from './scraper';
import type { JobData, JobResult, EmailResult, ScraperStats } from './types';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
const CONCURRENCY = parseInt(process.env.CONCURRENCY ?? '50', 10);
const OUTPUT_FILE = process.env.OUTPUT_FILE ?? path.resolve(__dirname, '../../output/results.csv');
const STATS_FILE = path.resolve(__dirname, '../../output/stats.json');
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Rate limit: max requests per domain per second
const RATE_LIMIT_RPS = parseInt(process.env.RATE_LIMIT_RPS ?? '5', 10);

export const QUEUE_NAME = 'edu-scrape';

// ---------------------------------------------------------------------------
// Redis connection (shared across queue + worker)
// ---------------------------------------------------------------------------

export function createRedisConnection(): IORedis {
  const conn = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
    lazyConnect: false,
  });
  conn.on('error', (err) => console.error('[redis] error:', err.message));
  return conn;
}

// ---------------------------------------------------------------------------
// Per-domain rate limiting (in-process token bucket)
// ---------------------------------------------------------------------------

const domainLastRequest = new Map<string, number>();

async function waitForDomainRateLimit(url: string): Promise<void> {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return;
  }

  const minGapMs = 1000 / RATE_LIMIT_RPS;
  const now = Date.now();
  const last = domainLastRequest.get(hostname) ?? 0;
  const waitMs = minGapMs - (now - last);

  if (waitMs > 0) {
    await new Promise((res) => setTimeout(res, waitMs));
  }

  domainLastRequest.set(hostname, Date.now());
}

// ---------------------------------------------------------------------------
// CSV output helpers
// ---------------------------------------------------------------------------

const CSV_HEADERS = ['name', 'email', 'institution', 'country', 'url', 'source_url', 'scraped_at'];

function ensureOutputFile(): void {
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(OUTPUT_FILE)) {
    fs.writeFileSync(OUTPUT_FILE, CSV_HEADERS.join(',') + '\n', 'utf-8');
  }
}

function appendEmailsToCSV(emails: EmailResult[]): void {
  if (emails.length === 0) return;
  const rows = emails.map((e) =>
    stringify([[e.name, e.email, e.institution, e.country, e.url, e.source_url, e.scraped_at]], {
      quoted: true,
    })
  );
  fs.appendFileSync(OUTPUT_FILE, rows.join(''), 'utf-8');
}

// ---------------------------------------------------------------------------
// Stats persistence
// ---------------------------------------------------------------------------

function loadStats(): ScraperStats {
  if (fs.existsSync(STATS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8')) as ScraperStats;
    } catch {
      // ignore corrupt stats
    }
  }
  return {
    total: 0,
    done: 0,
    failed: 0,
    noEmail: 0,
    emailsFound: 0,
    byCountry: {},
    startedAt: Date.now(),
  };
}

function saveStats(stats: ScraperStats): void {
  const dir = path.dirname(STATS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Telegram notifications (optional)
// ---------------------------------------------------------------------------

async function sendTelegram(message: string): Promise<void> {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const { default: axios } = await import('axios');
    await axios.post(url, { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' });
  } catch (err) {
    console.warn('[telegram] Failed to send notification:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Queue creation helper (exported for import.ts)
// ---------------------------------------------------------------------------

export function createQueue(connection: IORedis): Queue<JobData, JobResult> {
  return new Queue<JobData, JobResult>(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5_000, // 5s, 10s, 20s
      },
      removeOnComplete: { age: 3600 * 24, count: 1000 },
      removeOnFail: { age: 3600 * 24 * 7 },
    },
  });
}

// ---------------------------------------------------------------------------
// Worker
// ---------------------------------------------------------------------------

export async function startWorkers(): Promise<void> {
  ensureOutputFile();

  const connection = createRedisConnection();
  const queue = createQueue(connection);
  const stats = loadStats();

  // Sync total from queue if available
  const jobCounts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed');
  stats.total = Object.values(jobCounts).reduce((a, b) => a + b, 0);
  saveStats(stats);

  let emailsThisRun = 0;
  const MILESTONE_EVERY = 500;

  const worker = new Worker<JobData, JobResult>(
    QUEUE_NAME,
    async (job: Job<JobData, JobResult>) => {
      const { institutionUrl, institutionName, country } = job.data;

      await waitForDomainRateLimit(institutionUrl);

      const result = await scrapeInstitution(institutionUrl, institutionName, country);

      if (result.emails.length > 0) {
        appendEmailsToCSV(result.emails);
      }

      // Update stats
      if (result.status === 'ok') {
        stats.done++;
        stats.emailsFound += result.emails.length;
        stats.byCountry[country] = (stats.byCountry[country] ?? 0) + result.emails.length;
        emailsThisRun += result.emails.length;
      } else if (result.status === 'no_email') {
        stats.noEmail++;
        stats.done++;
      } else {
        stats.failed++;
      }

      saveStats(stats);

      // Milestone notifications
      if (emailsThisRun > 0 && emailsThisRun % MILESTONE_EVERY < result.emails.length) {
        await sendTelegram(
          `*EduScraper Meilenstein*\n` +
            `Emails gefunden: *${stats.emailsFound}*\n` +
            `Jobs erledigt: ${stats.done}/${stats.total}\n` +
            `Fehlgeschlagen: ${stats.failed}`
        );
      }

      return result;
    },
    {
      connection,
      concurrency: CONCURRENCY,
      limiter: {
        max: CONCURRENCY,
        duration: 1000,
      },
    }
  );

  worker.on('failed', (job, err) => {
    if (job) {
      console.error(`[worker] Job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`);
    }
  });

  worker.on('error', (err) => {
    console.error('[worker] Worker error:', err.message);
  });

  const queueEvents = new QueueEvents(QUEUE_NAME, { connection: createRedisConnection() });

  queueEvents.on('completed', ({ jobId }) => {
    process.stdout.write(`\r[queue] Done: ${stats.done} | Emails: ${stats.emailsFound} | Failed: ${stats.failed}   `);
  });

  console.log(`[queue] Workers started (concurrency: ${CONCURRENCY})`);
  console.log(`[queue] Output: ${OUTPUT_FILE}`);
  console.log(`[queue] Press Ctrl+C to stop (progress is saved)`);

  await sendTelegram(
    `*EduScraper gestartet*\n` +
      `Jobs in Queue: ${stats.total}\n` +
      `Concurrency: ${CONCURRENCY}\n` +
      `Output: results.csv`
  );

  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('\n[queue] Shutting down gracefully...');
    await worker.close();
    await queue.close();
    connection.disconnect();
    process.exit(0);
  });
}

// Run when called directly
if (require.main === module) {
  startWorkers().catch((err) => {
    console.error('[queue] Fatal error:', err);
    process.exit(1);
  });
}
