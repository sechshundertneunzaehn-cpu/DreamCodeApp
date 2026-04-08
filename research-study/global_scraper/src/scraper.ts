import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { getProxyAgent } from './proxy';
import type { EmailResult, JobResult } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

/** Tokens that indicate a contact / staff / about page. */
const CONTACT_PATH_TOKENS = [
  'contact', 'contact-us', 'contactus',
  'kontakt', 'kontaktiere',
  'about', 'about-us', 'aboutus', 'about/contact',
  'impressum', 'legal-notice', 'legal',
  'staff', 'faculty', 'team',
  'directory', 'people', 'administration',
  'reach-us', 'reach', 'get-in-touch',
];

/** Never crawl these — they waste time and never have useful emails. */
const SKIP_EXTENSIONS = /\.(pdf|png|jpg|jpeg|gif|svg|zip|docx?|xlsx?|pptx?|mp4|webp|ico|woff2?)$/i;

const REQUEST_TIMEOUT_MS = 12_000;
const MAX_CONTACT_PAGES = 5;

const USER_AGENT =
  'Mozilla/5.0 (compatible; EduMailBot/1.0; +https://github.com/example/global-scraper)';

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

function buildAxiosConfig(countryCode: string, url: string) {
  const agent = getProxyAgent(countryCode);
  return {
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    maxRedirects: 5,
    ...(agent ? { httpsAgent: agent, httpAgent: agent } : {}),
    // Do not throw on 4xx/5xx — handle manually
    validateStatus: () => true,
  };
}

async function fetchHtml(url: string, countryCode: string): Promise<string | null> {
  try {
    const resp = await axios.get(url, buildAxiosConfig(countryCode, url));
    if (resp.status >= 400) return null;
    const ct: string = resp.headers['content-type'] ?? '';
    if (!ct.includes('html')) return null;
    return typeof resp.data === 'string' ? resp.data : String(resp.data);
  } catch (_err) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Email extraction
// ---------------------------------------------------------------------------

function extractEmailsFromHtml(html: string, institutionName: string, country: string, pageUrl: string): EmailResult[] {
  const raw = html.match(EMAIL_REGEX) ?? [];

  // Filter out obviously bogus patterns
  const filtered = [...new Set(raw)].filter((e) => {
    if (e.length > 254) return false;
    if (e.startsWith('.') || e.endsWith('.')) return false;
    // skip image/file false-positives like "background.png@2x"
    if (/\.(png|jpg|gif|svg|webp|woff|ttf)@/i.test(e)) return false;
    // skip version strings like "1.0@example"
    if (/^\d+\.\d+@/.test(e)) return false;
    return true;
  });

  const now = new Date().toISOString();
  return filtered.map((email) => ({
    name: '',
    email: email.toLowerCase(),
    institution: institutionName,
    country,
    url: pageUrl,
    source_url: pageUrl,
    scraped_at: now,
  }));
}

// ---------------------------------------------------------------------------
// Link discovery
// ---------------------------------------------------------------------------

function normalizeUrl(base: string, href: string): string | null {
  try {
    const u = new URL(href, base);
    // Stay on same origin
    const baseHost = new URL(base).hostname;
    if (u.hostname !== baseHost) return null;
    if (SKIP_EXTENSIONS.test(u.pathname)) return null;
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

function findContactLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const found: string[] = [];

  $('a[href]').each((_i, el) => {
    const href = $(el).attr('href') ?? '';
    const text = $(el).text().toLowerCase();
    const combined = (href + ' ' + text).toLowerCase();

    const isContact = CONTACT_PATH_TOKENS.some((t) => combined.includes(t));
    if (!isContact) return;

    const normalized = normalizeUrl(baseUrl, href);
    if (normalized && !found.includes(normalized)) {
      found.push(normalized);
    }
  });

  return found.slice(0, MAX_CONTACT_PAGES);
}

// ---------------------------------------------------------------------------
// Main scrape function — exported
// ---------------------------------------------------------------------------

/**
 * Scrapes a single institution URL for contact emails.
 * Never throws — returns a JobResult with status 'failed' on errors.
 */
export async function scrapeInstitution(
  institutionUrl: string,
  institutionName: string,
  country: string,
): Promise<JobResult> {
  const visitedUrls = new Set<string>();
  const allEmails: EmailResult[] = [];
  const contactPagesVisited: string[] = [];

  // ---- Step 1: fetch homepage ----
  const homepageHtml = await fetchHtml(institutionUrl, country);
  if (!homepageHtml) {
    return {
      emails: [],
      contactPagesVisited: [],
      status: 'failed',
      error: `Could not fetch homepage: ${institutionUrl}`,
    };
  }

  visitedUrls.add(institutionUrl);

  // Extract any emails directly on homepage (some schools put them there)
  const homepageEmails = extractEmailsFromHtml(homepageHtml, institutionName, country, institutionUrl);
  allEmails.push(...homepageEmails);

  // ---- Step 2: find and visit contact-type sub-pages ----
  const contactLinks = findContactLinks(homepageHtml, institutionUrl);

  for (const link of contactLinks) {
    if (visitedUrls.has(link)) continue;
    visitedUrls.add(link);

    const subHtml = await fetchHtml(link, country);
    if (!subHtml) continue;

    contactPagesVisited.push(link);
    const subEmails = extractEmailsFromHtml(subHtml, institutionName, country, link);
    allEmails.push(...subEmails);

    // Also check one level deeper if it's a directory/staff page
    if (/directory|faculty|staff|people/i.test(link)) {
      const deepLinks = findContactLinks(subHtml, link)
        .filter((l) => !visitedUrls.has(l))
        .slice(0, 3);

      for (const deepLink of deepLinks) {
        if (visitedUrls.has(deepLink)) continue;
        visitedUrls.add(deepLink);

        const deepHtml = await fetchHtml(deepLink, country);
        if (!deepHtml) continue;

        contactPagesVisited.push(deepLink);
        const deepEmails = extractEmailsFromHtml(deepHtml, institutionName, country, deepLink);
        allEmails.push(...deepEmails);
      }
    }
  }

  // ---- Step 3: Deduplicate by email address ----
  const seen = new Set<string>();
  const uniqueEmails = allEmails.filter((r) => {
    if (seen.has(r.email)) return false;
    seen.add(r.email);
    return true;
  });

  return {
    emails: uniqueEmails,
    contactPagesVisited,
    status: uniqueEmails.length > 0 ? 'ok' : 'no_email',
  };
}
