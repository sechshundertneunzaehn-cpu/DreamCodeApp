/**
 * dashboard.ts — Live CLI dashboard
 *
 * Shows scraping progress with auto-refresh every 5 seconds.
 * Uses only ANSI escape codes — no heavy TUI dependencies.
 *
 * Usage: npx ts-node src/dashboard.ts
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import IORedis from 'ioredis';
import { Queue } from 'bullmq';
import { createRedisConnection, QUEUE_NAME } from './queue.js';
import type { ScraperStats } from './types.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATS_FILE = path.resolve(__dirname, '../../output/stats.json');
const REFRESH_INTERVAL_MS = 5_000;

// ---------------------------------------------------------------------------
// ANSI helpers
// ---------------------------------------------------------------------------

const ANSI = {
  clear: '\x1b[2J\x1b[H',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
  bgDark: '\x1b[48;5;234m',
  white: '\x1b[37m',
};

function color(text: string, c: string): string {
  return `${c}${text}${ANSI.reset}`;
}

function pad(str: string | number, width: number, align: 'left' | 'right' = 'right'): string {
  const s = String(str);
  if (align === 'left') return s.padEnd(width);
  return s.padStart(width);
}

function bar(value: number, max: number, width = 30): string {
  const filled = max > 0 ? Math.round((value / max) * width) : 0;
  const empty = width - filled;
  return (
    color('[', ANSI.dim) +
    color('█'.repeat(filled), ANSI.green) +
    color('░'.repeat(empty), ANSI.dim) +
    color(']', ANSI.dim)
  );
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function formatNumber(n: number): string {
  return n.toLocaleString('de-DE');
}

// ---------------------------------------------------------------------------
// Stats loading
// ---------------------------------------------------------------------------

function loadStats(): ScraperStats | null {
  if (!fs.existsSync(STATS_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8')) as ScraperStats;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Queue stats (from Redis)
// ---------------------------------------------------------------------------

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

async function getQueueStats(queue: Queue): Promise<QueueStats> {
  try {
    const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed');
    return counts as QueueStats;
  } catch {
    return { waiting: 0, active: 0, completed: 0, failed: 0 };
  }
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function renderDashboard(stats: ScraperStats | null, qStats: QueueStats): string {
  const now = Date.now();
  const elapsed = stats ? now - stats.startedAt : 0;
  const ratePerMin =
    elapsed > 0 && stats ? Math.round((stats.emailsFound / (elapsed / 1000)) * 60) : 0;

  const lines: string[] = [];

  lines.push('');
  lines.push(
    color('  ╔══════════════════════════════════════════════════════╗', ANSI.cyan)
  );
  lines.push(
    color('  ║', ANSI.cyan) +
      color('          EduScraper — Live Dashboard                  ', ANSI.bold) +
      color('║', ANSI.cyan)
  );
  lines.push(
    color('  ╚══════════════════════════════════════════════════════╝', ANSI.cyan)
  );
  lines.push('');

  const total = stats?.total ?? qStats.waiting + qStats.active + qStats.completed + qStats.failed;
  const done = stats?.done ?? qStats.completed;
  const failed = stats?.failed ?? qStats.failed;
  const emails = stats?.emailsFound ?? 0;

  // Main stats row
  lines.push(
    `  ${color('Total', ANSI.dim)}   ${color(formatNumber(total), ANSI.bold)}` +
      `  │  ${color('Done', ANSI.dim)}   ${color(formatNumber(done), ANSI.green)}` +
      `  │  ${color('Active', ANSI.dim)}  ${color(formatNumber(qStats.active), ANSI.yellow)}` +
      `  │  ${color('Failed', ANSI.dim)}  ${color(formatNumber(failed), ANSI.red)}`
  );
  lines.push('');

  // Progress bar
  lines.push(`  ${bar(done, total)}  ${total > 0 ? Math.round((done / total) * 100) : 0}%`);
  lines.push('');

  // Emails
  lines.push(
    `  ${color('Emails found:', ANSI.bold)}  ${color(formatNumber(emails), ANSI.green + ANSI.bold)}` +
      `   ${color(`(${formatNumber(ratePerMin)}/min)`, ANSI.dim)}`
  );

  lines.push(
    `  ${color('Waiting:', ANSI.dim)}       ${formatNumber(qStats.waiting)}` +
      `   ${color('Elapsed:', ANSI.dim)}  ${formatDuration(elapsed)}`
  );
  lines.push('');

  // Per-country breakdown
  if (stats && Object.keys(stats.byCountry).length > 0) {
    lines.push(`  ${color('Emails per Country:', ANSI.bold)}`);
    lines.push(`  ${color('─'.repeat(52), ANSI.dim)}`);

    const sorted = Object.entries(stats.byCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    const maxCount = sorted[0]?.[1] ?? 1;

    for (const [country, count] of sorted) {
      const countBar = bar(count, maxCount, 15);
      lines.push(
        `  ${color(pad(country, 5, 'left'), ANSI.cyan)}  ${countBar}  ${color(formatNumber(count), ANSI.bold)}`
      );
    }
    lines.push('');
  }

  lines.push(`  ${color('─'.repeat(52), ANSI.dim)}`);
  lines.push(
    `  ${color('Refreshing every 5s  •  Ctrl+C to exit', ANSI.dim)}  ` +
      `${color(new Date().toLocaleTimeString(), ANSI.dim)}`
  );
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const connection = createRedisConnection();
  const queue = new Queue(QUEUE_NAME, { connection });

  async function refresh(): Promise<void> {
    const [stats, qStats] = await Promise.all([
      Promise.resolve(loadStats()),
      getQueueStats(queue),
    ]);

    process.stdout.write(ANSI.clear);
    process.stdout.write(renderDashboard(stats, qStats));
  }

  await refresh();
  const interval = setInterval(refresh, REFRESH_INTERVAL_MS);

  process.on('SIGINT', async () => {
    clearInterval(interval);
    process.stdout.write('\n[dashboard] Exiting.\n');
    await queue.close();
    connection.disconnect();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[dashboard] Fatal:', err);
  process.exit(1);
});
