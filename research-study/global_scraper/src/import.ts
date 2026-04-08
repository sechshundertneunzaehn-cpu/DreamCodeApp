/**
 * import.ts
 *
 * Reads existing scraped email CSVs + the institution source list,
 * deduplicates already-scraped URLs and known emails,
 * then pushes only NEW institutions into the BullMQ queue.
 *
 * Usage:
 *   npx ts-node src/import.ts [--dry-run] [--country US] [--limit 1000]
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { parse } from 'csv-parse/sync';
import { createQueue, createRedisConnection } from './queue.js';
import type { Institution, JobData } from './types.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DATA_DIR = process.env.DATA_DIR ?? path.resolve(__dirname, '../../../us_education_data');
const OUTPUT_DIR = path.join(DATA_DIR, 'output');
const SIMPLE_EXPORTS_DIR = path.join(DATA_DIR, 'simple_exports');

const EXISTING_EMAIL_FILES = [
  path.join(OUTPUT_DIR, 'higher_ed_full_run_emails.csv'),
  path.join(OUTPUT_DIR, 'k12_full_run_emails.csv'),
  path.join(OUTPUT_DIR, 'k12_full_run_streaming.csv'),
  path.join(OUTPUT_DIR, 'subpage_crawl_streaming.csv'),
  // Also include our own output if it exists
  path.resolve(__dirname, '../../output/results.csv'),
];

const SOURCE_FILE_ALL = path.join(SIMPLE_EXPORTS_DIR, 'usa_simple_all.csv');
const SOURCE_FILE_UNIS = path.join(SIMPLE_EXPORTS_DIR, 'usa_simple_universities.csv');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(): { dryRun: boolean; country: string | null; limit: number } {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    country: args.includes('--country') ? args[args.indexOf('--country') + 1] : null,
    limit: args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : Infinity,
  };
}

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

function readCsvSafe(filePath: string): Record<string, string>[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`[import] File not found, skipping: ${filePath}`);
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
    }) as Record<string, string>[];
  } catch (err) {
    console.warn(`[import] Could not parse ${path.basename(filePath)}: ${(err as Error).message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Step 1: Collect already-known emails
// ---------------------------------------------------------------------------

function collectKnownEmails(): Set<string> {
  const known = new Set<string>();

  for (const file of EXISTING_EMAIL_FILES) {
    const rows = readCsvSafe(file);
    for (const row of rows) {
      // Try common column names
      const email =
        row['email'] ??
        row['Email'] ??
        row['EMAIL'] ??
        row['e-mail'] ??
        '';
      if (email && email.includes('@')) {
        known.add(email.toLowerCase().trim());
      }
    }
    if (rows.length > 0) {
      console.log(`[import] ${path.basename(file)}: ${rows.length} rows`);
    }
  }

  console.log(`[import] Total known emails: ${known.size}`);
  return known;
}

// ---------------------------------------------------------------------------
// Step 2: Collect already-scraped URLs (from output CSVs)
// ---------------------------------------------------------------------------

function collectScrapedUrls(): Set<string> {
  const scraped = new Set<string>();

  for (const file of EXISTING_EMAIL_FILES) {
    const rows = readCsvSafe(file);
    for (const row of rows) {
      const url = row['url'] ?? row['URL'] ?? row['website'] ?? row['Website'] ?? '';
      if (url) scraped.add(url.toLowerCase().trim());
    }
  }

  console.log(`[import] Already-scraped URLs: ${scraped.size}`);
  return scraped;
}

// ---------------------------------------------------------------------------
// Step 3: Parse institution source files
// ---------------------------------------------------------------------------

/**
 * Tries to map a CSV row to an Institution.
 * The simple_exports CSVs may have different column names, so we try several.
 */
function rowToInstitution(row: Record<string, string>): Institution | null {
  const url =
    row['website'] ??
    row['Website'] ??
    row['url'] ??
    row['URL'] ??
    row['homepage'] ??
    row['Homepage'] ??
    '';

  if (!url || !url.startsWith('http')) return null;

  const name =
    row['name'] ??
    row['Name'] ??
    row['institution'] ??
    row['Institution'] ??
    row['school_name'] ??
    row['SchoolName'] ??
    'Unknown';

  const country =
    row['country'] ??
    row['Country'] ??
    row['country_code'] ??
    row['CountryCode'] ??
    'US';

  const typeRaw =
    (row['type'] ?? row['Type'] ?? row['institution_type'] ?? '').toLowerCase();

  let type: Institution['type'] = 'other';
  if (typeRaw.includes('university') || typeRaw.includes('college') || typeRaw.includes('higher')) {
    type = 'university';
  } else if (typeRaw.includes('k12') || typeRaw.includes('school') || typeRaw.includes('elementary') || typeRaw.includes('middle') || typeRaw.includes('high')) {
    type = 'k12';
  }

  return { name: name.trim(), url: url.trim(), country: country.trim().toUpperCase(), type };
}

async function loadInstitutions(filterCountry: string | null): Promise<Institution[]> {
  const institutions: Institution[] = [];
  const seenUrls = new Set<string>();

  const sourceFiles = [SOURCE_FILE_ALL, SOURCE_FILE_UNIS].filter(fs.existsSync);

  if (sourceFiles.length === 0) {
    console.warn(`[import] No source files found in ${SIMPLE_EXPORTS_DIR}`);
    console.warn('[import] Set DATA_DIR in .env or place files at the expected path.');
    return [];
  }

  for (const file of sourceFiles) {
    const rows = readCsvSafe(file);
    console.log(`[import] Loading ${path.basename(file)}: ${rows.length} rows`);

    for (const row of rows) {
      const inst = rowToInstitution(row);
      if (!inst) continue;
      if (seenUrls.has(inst.url.toLowerCase())) continue;
      if (filterCountry && inst.country !== filterCountry.toUpperCase()) continue;

      seenUrls.add(inst.url.toLowerCase());
      institutions.push(inst);
    }
  }

  return institutions;
}

// ---------------------------------------------------------------------------
// Step 4: Push new jobs to queue
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { dryRun, country, limit } = parseArgs();

  console.log('='.repeat(60));
  console.log('  EduScraper Import');
  console.log('='.repeat(60));
  if (dryRun) console.log('[import] DRY RUN — nothing will be queued\n');

  // 1. Existing data
  const knownEmails = collectKnownEmails();
  const scrapedUrls = collectScrapedUrls();

  // 2. Source institutions
  const institutions = await loadInstitutions(country);
  console.log(`[import] Total institutions in source: ${institutions.length}`);

  // 3. Filter out already-scraped
  const newInstitutions = institutions.filter(
    (inst) => !scrapedUrls.has(inst.url.toLowerCase())
  );
  console.log(`[import] New (unscraped) institutions: ${newInstitutions.length}`);

  const toQueue = newInstitutions.slice(0, limit);
  console.log(`[import] Queuing ${toQueue.length} institutions`);

  if (dryRun || toQueue.length === 0) {
    console.log('[import] Done (dry run or nothing to queue).');
    return;
  }

  // 4. Queue
  const connection = createRedisConnection();
  const queue = createQueue(connection);

  // Batch-add for performance (500 per batch)
  const BATCH_SIZE = 500;
  let queued = 0;

  for (let i = 0; i < toQueue.length; i += BATCH_SIZE) {
    const batch = toQueue.slice(i, i + BATCH_SIZE);
    const jobs = batch.map((inst): { name: string; data: JobData } => ({
      name: `scrape:${inst.url}`,
      data: {
        institutionUrl: inst.url,
        institutionName: inst.name,
        country: inst.country,
      },
    }));

    await queue.addBulk(jobs);
    queued += batch.length;
    process.stdout.write(`\r[import] Queued ${queued}/${toQueue.length}...`);
  }

  process.stdout.write('\n');
  console.log(`[import] Done. ${queued} jobs added to queue "${queue.name}".`);
  console.log('[import] Run "npm run scrape" to start workers.');

  await queue.close();
  connection.disconnect();
}

main().catch((err) => {
  console.error('[import] Fatal:', err);
  process.exit(1);
});
