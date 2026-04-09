/**
 * expand.ts — Region-based University Expander
 *
 * Scrapes Wikipedia "List of universities in [Country]" pages per region,
 * extracts official website URLs, saves to CSV, and pushes to queue.
 *
 * Usage:
 *   npx ts-node src/expand.ts --region gulf
 *   npx ts-node src/expand.ts --region turkey
 *   npx ts-node src/expand.ts --region dach
 *   npx ts-node src/expand.ts --region gulf --dry-run
 */

import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { stringify } from 'csv-stringify/sync';
import { createQueue, createRedisConnection } from './queue';
import { getProxyAgent } from './proxy';
import type { Institution, JobData } from './types';

// ---------------------------------------------------------------------------
// Region definitions
// ---------------------------------------------------------------------------

interface CountryConfig {
  code: string;
  name: string;
  /** Wikipedia slug candidates — tried in order until one succeeds (200) */
  slugs: string[];
}

const REGIONS: Record<string, CountryConfig[]> = {
  gulf: [
    {
      code: 'SA',
      name: 'Saudi Arabia',
      slugs: [
        'List_of_universities_and_colleges_in_Saudi_Arabia',
        'List_of_universities_in_Saudi_Arabia',
      ],
    },
    {
      code: 'AE',
      name: 'United Arab Emirates',
      slugs: [
        'List_of_universities_in_the_United_Arab_Emirates',
        'List_of_universities_in_United_Arab_Emirates',
      ],
    },
    {
      code: 'QA',
      name: 'Qatar',
      slugs: [
        'List_of_universities_in_Qatar',
        'List_of_universities_and_colleges_in_Qatar',
      ],
    },
    {
      code: 'KW',
      name: 'Kuwait',
      slugs: [
        'List_of_universities_in_Kuwait',
        'List_of_universities_and_colleges_in_Kuwait',
      ],
    },
    {
      code: 'BH',
      name: 'Bahrain',
      slugs: [
        'List_of_universities_in_Bahrain',
        'Education_in_Bahrain',
      ],
    },
    {
      code: 'OM',
      name: 'Oman',
      slugs: [
        'List_of_universities_in_Oman',
        'List_of_universities_and_colleges_in_Oman',
      ],
    },
  ],
  turkey: [
    {
      code: 'TR',
      name: 'Turkey',
      slugs: [
        'List_of_universities_and_colleges_in_Turkey',
        'List_of_universities_in_Turkey',
      ],
    },
  ],
  dach: [
    {
      code: 'DE',
      name: 'Germany',
      slugs: [
        'List_of_universities_in_Germany',
        'List_of_universities_and_colleges_in_Germany',
      ],
    },
    {
      code: 'AT',
      name: 'Austria',
      slugs: [
        'List_of_universities_in_Austria',
        'List_of_universities_and_colleges_in_Austria',
      ],
    },
    {
      code: 'CH',
      name: 'Switzerland',
      slugs: [
        'List_of_universities_in_Switzerland',
        'List_of_universities_and_colleges_in_Switzerland',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Domain filtering
// ---------------------------------------------------------------------------

/** Domains that are never official university websites */
const BLOCKED_DOMAINS = new Set([
  // Social media
  'facebook.com', 'fb.com', 'twitter.com', 'x.com', 't.co',
  'instagram.com', 'linkedin.com', 'youtube.com', 'youtu.be',
  'tiktok.com', 'snapchat.com', 'pinterest.com', 'telegram.org',
  // Meta/info aggregators
  'wikipedia.org', 'wikimedia.org', 'wikidata.org',
  'google.com', 'google.co', 'maps.google.com', 'goo.gl',
  'bing.com', 'yahoo.com',
  // URL shorteners
  'bit.ly', 'tinyurl.com', 'ow.ly', 'is.gd', 'shorturl.at',
  // Tech/commercial (never uni sites)
  'microsoft.com', 'apple.com', 'adobe.com', 'amazon.com',
  'github.com', 'archive.org', 'doi.org', 'jstor.org',
  'springer.com', 'elsevier.com', 'researchgate.net',
  'academia.edu',  // aggregator, not an institution
  'coursera.org', 'edx.org', 'udemy.com',
]);

/**
 * Returns true if the URL looks like an official educational website.
 *
 * Strategy (permissive): allow anything that is NOT in the blocklist and
 * is not an obviously commercial/social domain. Educational TLDs are
 * preferred but not required — many Gulf/DACH unis use country TLDs.
 */
function isLikelyUniWebsite(url: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return false;
  }

  // Block known non-university domains
  for (const blocked of BLOCKED_DOMAINS) {
    if (hostname === blocked || hostname.endsWith('.' + blocked)) return false;
  }

  // Must be http/https
  if (!/^https?:\/\//i.test(url)) return false;

  // Skip bare IP addresses
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return false;

  return true;
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

const USER_AGENT =
  'Mozilla/5.0 (compatible; EduBot/1.0; research-scraper)';

async function fetchHtml(
  url: string,
  countryCode = 'US',
): Promise<{ html: string; status: number } | null> {
  const agent = getProxyAgent(countryCode);
  try {
    const resp = await axios.get<string>(url, {
      timeout: 20_000,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      maxRedirects: 5,
      validateStatus: () => true,
      responseType: 'text',
      ...(agent ? { httpsAgent: agent, httpAgent: agent } : {}),
    });
    return {
      html: typeof resp.data === 'string' ? resp.data : String(resp.data),
      status: resp.status,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Wikipedia scraper
// ---------------------------------------------------------------------------

const WIKI_BASE = 'https://en.wikipedia.org/wiki/';

/**
 * Try all slug candidates for a country and return the first HTML that loads.
 */
async function fetchWikipediaPage(
  config: CountryConfig,
): Promise<{ html: string; url: string } | null> {
  for (const slug of config.slugs) {
    const url = WIKI_BASE + slug;
    process.stdout.write(`[wikipedia] Trying ${url} ... `);
    const res = await fetchHtml(url, config.code);
    if (res && res.status < 400) {
      process.stdout.write(`OK (${res.status})\n`);
      return { html: res.html, url };
    }
    process.stdout.write(`${res?.status ?? 'ERR'}\n`);
    await delay(300);
  }
  return null;
}

/**
 * Phase 1: extract external links directly from the list page.
 *
 * Wikipedia list pages often have a "Website" column in tables — these
 * contain direct external links. We grab all external hrefs on the page.
 */
function extractDirectExternalLinks(
  html: string,
  countryCode: string,
  countryName: string,
): Institution[] {
  const $ = cheerio.load(html);
  const results: Institution[] = [];
  const seenUrls = new Set<string>();

  // Try to find rows in wikitables first — usually most reliable
  $('table.wikitable tr').each((_i, row) => {
    let name = '';
    let url = '';

    $(row)
      .find('td, th')
      .each((_j, cell) => {
        const cellText = $(cell).text().trim();
        const extLink = $(cell).find('a[href^="http"]').first();
        const extHref = extLink.attr('href') ?? '';

        // Heuristic: first cell with a /wiki/ internal link → likely the uni name
        if (!name) {
          const internalLink = $(cell).find('a[href^="/wiki/"]').first();
          if (internalLink.length) name = internalLink.text().trim();
        }

        // Cell with an external http link that passes filter → website
        if (!url && extHref && isLikelyUniWebsite(extHref) && !seenUrls.has(extHref.toLowerCase())) {
          url = extHref;
        }
      });

    if (url) {
      seenUrls.add(url.toLowerCase());
      results.push({
        name: name || 'Unknown',
        url,
        country: countryCode,
        type: 'university',
      });
    }
  });

  // Also grab all external links from lists (ul/ol) and plain paragraphs
  $('a[href^="http"]').each((_i, el) => {
    const href = $(el).attr('href') ?? '';
    if (!href || seenUrls.has(href.toLowerCase())) return;
    if (!isLikelyUniWebsite(href)) return;

    seenUrls.add(href.toLowerCase());
    const name = $(el).text().trim() || $(el).closest('li, td, p').text().trim().slice(0, 80);
    results.push({
      name: name || countryName + ' University',
      url: href,
      country: countryCode,
      type: 'university',
    });
  });

  return results;
}

/**
 * Phase 2 (fallback): visit individual Wikipedia article pages and extract
 * the official website from the infobox.
 * Only used when Phase 1 yields fewer than MIN_DIRECT_RESULTS.
 */
const MIN_DIRECT_RESULTS = 5;

function extractWikiArticleLinks(html: string): string[] {
  const $ = cheerio.load(html);
  const links: string[] = [];

  $('a[href^="/wiki/"]').each((_i, el) => {
    const href = $(el).attr('href') ?? '';
    // Skip meta pages
    if (/:(Talk|Help|Wikipedia|File|Category|Template|Special|Portal|WP)/.test(href)) return;
    // Skip disambiguation, "list of", index pages
    if (/\/List_of|\/Index_of|\/Outline_of/i.test(href)) return;
    const full = 'https://en.wikipedia.org' + href.split('#')[0];
    if (!links.includes(full)) links.push(full);
  });

  return links;
}

async function scrapeArticleForWebsite(
  wikiUrl: string,
  countryCode: string,
): Promise<string | null> {
  const res = await fetchHtml(wikiUrl, countryCode);
  if (!res || res.status >= 400) return null;

  const $ = cheerio.load(res.html);

  // Infobox external links (most reliable)
  let found: string | null = null;

  $('table.infobox a[href^="http"], .infobox-data a[href^="http"]').each((_i, el) => {
    if (found) return;
    const href = $(el).attr('href') ?? '';
    if (isLikelyUniWebsite(href)) found = href;
  });

  // Fallback: first external link with "official" or "website" in link text or title
  if (!found) {
    $('a[href^="http"]').each((_i, el) => {
      if (found) return;
      const href = $(el).attr('href') ?? '';
      const text = ($(el).text() + ' ' + ($(el).attr('title') ?? '')).toLowerCase();
      if (
        (text.includes('official') || text.includes('website') || text.includes('homepage')) &&
        isLikelyUniWebsite(href)
      ) {
        found = href;
      }
    });
  }

  return found;
}

async function scrapeViaArticles(
  html: string,
  config: CountryConfig,
): Promise<Institution[]> {
  const articleLinks = extractWikiArticleLinks(html).slice(0, 300);
  console.log(`[wikipedia] Phase 2: visiting ${articleLinks.length} article pages for ${config.name}...`);

  const institutions: Institution[] = [];
  let visited = 0;

  for (const link of articleLinks) {
    visited++;
    if (visited % 25 === 0) {
      process.stdout.write(
        `\r[wikipedia] ${config.name}: ${visited}/${articleLinks.length} articles checked, ${institutions.length} found   `,
      );
    }

    const websiteUrl = await scrapeArticleForWebsite(link, config.code);
    if (websiteUrl) {
      // Extract name from Wikipedia article title
      const title = decodeURIComponent(link.split('/wiki/')[1] ?? '')
        .replace(/_/g, ' ')
        .trim();
      institutions.push({
        name: title,
        url: websiteUrl,
        country: config.code,
        type: 'university',
      });
    }

    await delay(150); // polite delay
  }

  process.stdout.write('\n');
  return institutions;
}

/**
 * Main per-country scrape: Phase 1 (direct links) with Phase 2 fallback.
 */
async function scrapeCountry(config: CountryConfig): Promise<Institution[]> {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`[expand] ${config.name} (${config.code})`);

  const page = await fetchWikipediaPage(config);
  if (!page) {
    console.warn(`[expand] Could not load any Wikipedia page for ${config.name} — skipping.`);
    return [];
  }

  // Phase 1: direct external links from the list page
  const direct = extractDirectExternalLinks(page.html, config.code, config.name);
  console.log(`[wikipedia] Phase 1: ${direct.length} external links found directly on list page`);

  if (direct.length >= MIN_DIRECT_RESULTS) {
    return direct;
  }

  // Phase 2: visit individual articles (slower but thorough)
  console.log(`[wikipedia] Too few direct links (${direct.length}), falling back to article scrape...`);
  const fromArticles = await scrapeViaArticles(page.html, config);
  console.log(`[wikipedia] Phase 2: ${fromArticles.length} institutions found via articles`);

  // Merge, dedup by URL
  const seenUrls = new Set(direct.map((i) => i.url.toLowerCase()));
  const merged = [...direct];
  for (const inst of fromArticles) {
    if (!seenUrls.has(inst.url.toLowerCase())) {
      seenUrls.add(inst.url.toLowerCase());
      merged.push(inst);
    }
  }

  return merged;
}

// ---------------------------------------------------------------------------
// CSV output
// ---------------------------------------------------------------------------

function saveToCsv(institutions: Institution[], region: string): string {
  const outputDir = path.resolve(__dirname, '../../output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outFile = path.join(outputDir, `universities_${region}.csv`);
  const header = 'name,url,country\n';
  const rows = stringify(
    institutions.map((i) => [i.name, i.url, i.country]),
    { quoted: true },
  );

  fs.writeFileSync(outFile, header + rows, 'utf-8');
  console.log(`\n[expand] Saved ${institutions.length} institutions to ${outFile}`);
  return outFile;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

function parseArgs(): { region: string; dryRun: boolean } {
  const args = process.argv.slice(2);
  const regionIdx = args.indexOf('--region');

  if (regionIdx === -1 || !args[regionIdx + 1]) {
    console.error('Usage: npx ts-node src/expand.ts --region <gulf|turkey|dach> [--dry-run]');
    console.error('Available regions:', Object.keys(REGIONS).join(', '));
    process.exit(1);
  }

  const region = args[regionIdx + 1].toLowerCase();
  if (!REGIONS[region]) {
    console.error(`Unknown region: "${region}". Available: ${Object.keys(REGIONS).join(', ')}`);
    process.exit(1);
  }

  return { region, dryRun: args.includes('--dry-run') };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { region, dryRun } = parseArgs();
  const countries = REGIONS[region];

  console.log('='.repeat(60));
  console.log(`  EduScraper — Wikipedia Expander  |  Region: ${region.toUpperCase()}`);
  console.log('='.repeat(60));
  console.log(`Countries: ${countries.map((c) => `${c.name} (${c.code})`).join(', ')}`);
  if (dryRun) console.log('DRY RUN — CSV will be saved, but nothing queued');
  console.log('');

  const allInstitutions: Institution[] = [];

  for (const country of countries) {
    const found = await scrapeCountry(country);
    allInstitutions.push(...found);
    console.log(`[expand] ${country.name}: ${found.length} institutions`);
  }

  // Global dedup by URL
  const seenUrls = new Set<string>();
  const unique = allInstitutions.filter((i) => {
    const key = i.url.toLowerCase();
    if (seenUrls.has(key)) return false;
    seenUrls.add(key);
    return true;
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`[expand] Total unique institutions: ${unique.length}`);

  // Per-country summary
  const byCountry = unique.reduce<Record<string, number>>((acc, i) => {
    acc[i.country] = (acc[i.country] ?? 0) + 1;
    return acc;
  }, {});
  for (const [code, count] of Object.entries(byCountry).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${code.padEnd(4)} ${count}`);
  }

  if (unique.length === 0) {
    console.log('[expand] Nothing to save. Exiting.');
    return;
  }

  // Save CSV
  saveToCsv(unique, region);

  if (dryRun) {
    console.log('[expand] Dry run — skipping queue push.');
    return;
  }

  // Push to BullMQ queue
  console.log('\n[expand] Pushing to queue...');
  const connection = createRedisConnection();
  const queue = createQueue(connection);

  const jobs = unique.map((inst): { name: string; data: JobData } => ({
    name: `expand:${region}:${inst.url}`,
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

main().catch((err: Error) => {
  console.error('[expand] Fatal:', err.message);
  process.exit(1);
});
