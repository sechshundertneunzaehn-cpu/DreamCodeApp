/**
 * expand.ts — Phase 2: Global University Expander
 *
 * Scrapes university lists from:
 *   1. Wikipedia "List of universities in <Country>" pages
 *   2. WHED database (whed.net) — IAU World Higher Education Database
 *
 * Outputs new institution URLs directly into the BullMQ queue.
 *
 * Usage:
 *   npx ts-node src/expand.ts [--countries DE,UK,FR] [--source wikipedia|whed|all] [--dry-run]
 */

import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { createQueue, createRedisConnection } from './queue';
import { getProxyAgent } from './proxy';
import type { Institution, JobData } from './types';

// ---------------------------------------------------------------------------
// Target countries
// ---------------------------------------------------------------------------

interface CountryConfig {
  code: string;
  name: string;
  wikipediaSlug: string;
  whedCode?: string;
}

const TARGET_COUNTRIES: CountryConfig[] = [
  { code: 'DE', name: 'Germany', wikipediaSlug: 'List_of_universities_in_Germany', whedCode: 'de' },
  { code: 'GB', name: 'United Kingdom', wikipediaSlug: 'List_of_universities_in_the_United_Kingdom', whedCode: 'gb' },
  { code: 'FR', name: 'France', wikipediaSlug: 'List_of_universities_and_grandes_%C3%A9coles_in_France', whedCode: 'fr' },
  { code: 'TR', name: 'Turkey', wikipediaSlug: 'List_of_universities_in_Turkey', whedCode: 'tr' },
  { code: 'SA', name: 'Saudi Arabia', wikipediaSlug: 'List_of_universities_in_Saudi_Arabia', whedCode: 'sa' },
  { code: 'EG', name: 'Egypt', wikipediaSlug: 'List_of_universities_in_Egypt', whedCode: 'eg' },
  { code: 'IN', name: 'India', wikipediaSlug: 'List_of_universities_in_India', whedCode: 'in' },
  { code: 'JP', name: 'Japan', wikipediaSlug: 'List_of_universities_in_Japan', whedCode: 'jp' },
  { code: 'BR', name: 'Brazil', wikipediaSlug: 'List_of_universities_in_Brazil', whedCode: 'br' },
  { code: 'AU', name: 'Australia', wikipediaSlug: 'List_of_universities_in_Australia', whedCode: 'au' },
  { code: 'CA', name: 'Canada', wikipediaSlug: 'List_of_universities_in_Canada', whedCode: 'ca' },
  { code: 'MX', name: 'Mexico', wikipediaSlug: 'List_of_universities_in_Mexico', whedCode: 'mx' },
  { code: 'AR', name: 'Argentina', wikipediaSlug: 'List_of_universities_in_Argentina', whedCode: 'ar' },
  { code: 'ZA', name: 'South Africa', wikipediaSlug: 'List_of_universities_in_South_Africa', whedCode: 'za' },
  { code: 'NG', name: 'Nigeria', wikipediaSlug: 'List_of_universities_in_Nigeria', whedCode: 'ng' },
  { code: 'PK', name: 'Pakistan', wikipediaSlug: 'List_of_universities_in_Pakistan', whedCode: 'pk' },
  { code: 'ID', name: 'Indonesia', wikipediaSlug: 'List_of_universities_in_Indonesia', whedCode: 'id' },
  { code: 'PH', name: 'Philippines', wikipediaSlug: 'List_of_universities_in_the_Philippines', whedCode: 'ph' },
  { code: 'KR', name: 'South Korea', wikipediaSlug: 'List_of_universities_in_South_Korea', whedCode: 'kr' },
  { code: 'CN', name: 'China', wikipediaSlug: 'List_of_universities_in_China', whedCode: 'cn' },
];

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);

  const countriesArg = args.includes('--countries')
    ? args[args.indexOf('--countries') + 1]?.split(',')
    : null;

  const source = args.includes('--source')
    ? (args[args.indexOf('--source') + 1] as 'wikipedia' | 'whed' | 'all')
    : 'all';

  return {
    dryRun: args.includes('--dry-run'),
    countries: countriesArg
      ? TARGET_COUNTRIES.filter((c) => countriesArg.includes(c.code))
      : TARGET_COUNTRIES,
    source,
  };
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

const USER_AGENT =
  'Mozilla/5.0 (compatible; EduBot/1.0; +https://github.com/example/global-scraper)';

async function fetchHtml(url: string, countryCode = 'US'): Promise<string | null> {
  const agent = getProxyAgent(countryCode);
  try {
    const resp = await axios.get(url, {
      timeout: 20_000,
      headers: { 'User-Agent': USER_AGENT },
      maxRedirects: 5,
      validateStatus: () => true,
      ...(agent ? { httpsAgent: agent, httpAgent: agent } : {}),
    });
    if (resp.status >= 400) return null;
    return typeof resp.data === 'string' ? resp.data : String(resp.data);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Wikipedia scraper
// ---------------------------------------------------------------------------

const WIKIPEDIA_BASE = 'https://en.wikipedia.org/wiki/';

/**
 * Scrapes a Wikipedia list-of-universities page and returns institutions.
 * Wikipedia pages contain tables or lists with links to university articles;
 * the university's external website is often in an infobox.
 * For efficiency we just collect links to Wikipedia articles, then visit each
 * to grab the official website from the infobox.
 */
async function scrapeWikipediaCountry(config: CountryConfig): Promise<Institution[]> {
  const url = WIKIPEDIA_BASE + config.wikipediaSlug;
  console.log(`[wikipedia] Fetching ${config.name}: ${url}`);

  const html = await fetchHtml(url, config.code);
  if (!html) {
    console.warn(`[wikipedia] Could not fetch ${config.name}`);
    return [];
  }

  const $ = cheerio.load(html);
  const wikiLinks: string[] = [];

  // Collect all /wiki/ links that look like university names (not meta pages)
  $('a[href^="/wiki/"]').each((_i, el) => {
    const href = $(el).attr('href') ?? '';
    // Skip meta/help/category pages
    if (/:(Talk|Help|Wikipedia|File|Category|Template|Special|Portal)/.test(href)) return;
    const fullUrl = 'https://en.wikipedia.org' + href;
    if (!wikiLinks.includes(fullUrl)) wikiLinks.push(fullUrl);
  });

  console.log(`[wikipedia] Found ${wikiLinks.length} candidate links for ${config.name}`);

  const institutions: Institution[] = [];

  // Visit each Wikipedia article to find the official website
  // Limit to first 200 to avoid abuse
  const toVisit = wikiLinks.slice(0, 200);
  let visited = 0;

  for (const wikiUrl of toVisit) {
    visited++;
    if (visited % 20 === 0) {
      process.stdout.write(`\r[wikipedia] ${config.name}: ${visited}/${toVisit.length} articles...`);
    }

    const articleHtml = await fetchHtml(wikiUrl, config.code);
    if (!articleHtml) continue;

    const $a = cheerio.load(articleHtml);
    let websiteUrl: string | null = null;
    let institutionName = $a('h1#firstHeading').text().trim();

    // Look for external website in infobox
    $a('table.infobox a.external').each((_i, el) => {
      const href = $a(el).attr('href') ?? '';
      if (href.startsWith('http') && !websiteUrl) {
        websiteUrl = href;
      }
    });

    // Also check "official website" links
    if (!websiteUrl) {
      $a('a.external[href]').each((_i, el) => {
        const text = $a(el).text().toLowerCase();
        const href = $a(el).attr('href') ?? '';
        if ((text.includes('official') || text.includes('website')) && href.startsWith('http')) {
          if (!websiteUrl) websiteUrl = href;
        }
      });
    }

    if (websiteUrl && institutionName) {
      institutions.push({
        name: institutionName,
        url: websiteUrl,
        country: config.code,
        type: 'university',
      });
    }

    // Small delay to be polite to Wikipedia
    await new Promise((res) => setTimeout(res, 200));
  }

  process.stdout.write('\n');
  console.log(`[wikipedia] ${config.name}: found ${institutions.length} institutions with websites`);
  return institutions;
}

// ---------------------------------------------------------------------------
// WHED (whed.net) scraper
// ---------------------------------------------------------------------------

/**
 * WHED = IAU World Higher Education Database
 * URL pattern: https://whed.net/results.php?Cname=&fac=&Coun=DE&lang=en&search=search
 *
 * Results page contains a list of universities with official website links.
 */
async function scrapeWhed(config: CountryConfig): Promise<Institution[]> {
  if (!config.whedCode) return [];

  const url = `https://whed.net/results.php?Cname=&fac=&Coun=${config.whedCode.toUpperCase()}&lang=en&search=search`;
  console.log(`[whed] Fetching ${config.name}: ${url}`);

  const html = await fetchHtml(url, config.code);
  if (!html) {
    console.warn(`[whed] Could not fetch ${config.name}`);
    return [];
  }

  const $ = cheerio.load(html);
  const institutions: Institution[] = [];

  // WHED results are typically in a table or dl list
  $('a[href*="http"]').each((_i, el) => {
    const href = $(el).attr('href') ?? '';
    const text = $(el).text().trim();

    // Skip internal WHED links
    if (href.includes('whed.net')) return;
    if (!href.startsWith('http')) return;
    if (!text) return;

    institutions.push({
      name: text,
      url: href,
      country: config.code,
      type: 'university',
    });
  });

  // Also try to follow pagination
  const nextLinks: string[] = [];
  $('a[href*="results.php"]').each((_i, el) => {
    const href = $(el).attr('href') ?? '';
    if (href.includes('page=') || href.includes('start=')) {
      const full = href.startsWith('http') ? href : 'https://whed.net/' + href;
      if (!nextLinks.includes(full)) nextLinks.push(full);
    }
  });

  // Fetch up to 5 more pages
  for (const nextUrl of nextLinks.slice(0, 5)) {
    await new Promise((res) => setTimeout(res, 500));
    const pageHtml = await fetchHtml(nextUrl, config.code);
    if (!pageHtml) continue;

    const $p = cheerio.load(pageHtml);
    $p('a[href*="http"]').each((_i, el) => {
      const href = $p(el).attr('href') ?? '';
      const text = $p(el).text().trim();
      if (href.includes('whed.net')) return;
      if (!href.startsWith('http') || !text) return;
      if (!institutions.find((i) => i.url === href)) {
        institutions.push({ name: text, url: href, country: config.code, type: 'university' });
      }
    });
  }

  console.log(`[whed] ${config.name}: found ${institutions.length} institutions`);
  return institutions;
}

// ---------------------------------------------------------------------------
// Save expanded institutions to file + queue
// ---------------------------------------------------------------------------

async function saveExpandedList(institutions: Institution[]): Promise<void> {
  const outputDir = path.resolve(__dirname, '../../output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outFile = path.join(outputDir, 'expanded_institutions.jsonl');
  const lines = institutions.map((i) => JSON.stringify(i)).join('\n') + '\n';
  fs.appendFileSync(outFile, lines, 'utf-8');
  console.log(`[expand] Saved ${institutions.length} institutions to ${outFile}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { dryRun, countries, source } = parseArgs();

  console.log('='.repeat(60));
  console.log('  EduScraper — Global Expander (Phase 2)');
  console.log('='.repeat(60));
  console.log(`Countries: ${countries.map((c) => c.code).join(', ')}`);
  console.log(`Source: ${source}`);
  if (dryRun) console.log('DRY RUN — no queuing');
  console.log('');

  const allInstitutions: Institution[] = [];

  for (const country of countries) {
    if (source === 'wikipedia' || source === 'all') {
      const wikiInsts = await scrapeWikipediaCountry(country);
      allInstitutions.push(...wikiInsts);
    }

    if (source === 'whed' || source === 'all') {
      const whedInsts = await scrapeWhed(country);
      allInstitutions.push(...whedInsts);
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allInstitutions.filter((i) => {
    const key = i.url.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`\n[expand] Total unique institutions found: ${unique.length}`);
  await saveExpandedList(unique);

  if (dryRun || unique.length === 0) {
    console.log('[expand] Done (dry run or no institutions found).');
    return;
  }

  // Push to queue
  const connection = createRedisConnection();
  const queue = createQueue(connection);

  const jobs = unique.map((inst): { name: string; data: JobData } => ({
    name: `expand:${inst.url}`,
    data: {
      institutionUrl: inst.url,
      institutionName: inst.name,
      country: inst.country,
    },
  }));

  const BATCH_SIZE = 500;
  let queued = 0;

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    await queue.addBulk(jobs.slice(i, i + BATCH_SIZE));
    queued += Math.min(BATCH_SIZE, jobs.length - i);
    process.stdout.write(`\r[expand] Queued ${queued}/${jobs.length}...`);
  }

  process.stdout.write('\n');
  console.log(`[expand] Done. ${queued} jobs added to queue.`);

  await queue.close();
  connection.disconnect();
}

main().catch((err) => {
  console.error('[expand] Fatal:', err);
  process.exit(1);
});
