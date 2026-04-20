// E2E: Symbol-Suche i18n (Task-4 BLUE)
// Testet POST /api/symbols/search gegen Live-Backend via Vite-Proxy.
// 4 Queries: Wasser/water/ماء/su → alle sollen Wasser-Symbol liefern.
// RTL-Assert für arabische Query.
import { chromium, Browser, Page, devices } from 'playwright';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = join(__dirname, 'screenshots-symbol-search');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const APP_URL = process.env.APP_URL || 'http://localhost:3000/app/';
const WASSER_SYMBOL_ID = '65501134-d2dc-45ea-9fda-31d4568a7af5';

interface QueryCase {
  query: string;
  locale: string;
  label: string;
  expectRtlInput?: boolean;
  expectTranslatedHint?: boolean;
}

const CASES: QueryCase[] = [
  { query: 'Wasser',    locale: 'de', label: 'de-wasser' },
  { query: 'water',     locale: 'en', label: 'en-water' },
  { query: 'ماء',       locale: 'ar', label: 'ar-maa', expectRtlInput: true },
  { query: 'su',        locale: 'tr', label: 'tr-su' },
  { query: 'liquid h2o', locale: 'en', label: 'en-liquid-h2o', expectTranslatedHint: true },
];

async function openSymbolsPage(page: Page, locale: string): Promise<void> {
  await page.addInitScript((loc) => {
    try { localStorage.setItem('dreamcode_language', loc); } catch {}
  }, locale);
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Versuche Symbol-Library-Button zu finden (stabiler Sub-Text "877 · Freud · Ibn Sirin").
  const btn = page.locator('button:has-text("877")').first();
  await btn.waitFor({ state: 'visible', timeout: 15000 });
  await btn.click();
  await page.waitForTimeout(800);

  // Search-Input suchen (placeholder lokalisiert — stabiler: input innerhalb DreamSymbolsPage)
  await page.locator('[data-testid="symbol-search-input"]').waitFor({ state: 'visible', timeout: 10000 });
}

async function runCaseOn(page: Page, c: QueryCase, vpLabel: string): Promise<{ ok: boolean; notes: string[]; apiStatus: number | null; matchedVia: string | null }> {
  const notes: string[] = [];
  let apiStatus: number | null = null;
  let apiBody: any = null;

  const handler = async (res: any) => {
    if (res.url().includes('/api/symbols/search')) {
      apiStatus = res.status();
      try { apiBody = await res.json(); } catch { /* ignore */ }
    }
  };
  page.on('response', handler);

  const input = page.locator('[data-testid="symbol-search-input"]');
  await input.scrollIntoViewIfNeeded();
  await input.click();
  await input.fill(c.query);

  // Debounce 300ms + Netzwerk-RTT
  await page.waitForResponse(r => r.url().includes('/api/symbols/search'), { timeout: 10000 }).catch(() => {
    notes.push('kein API-Call erkannt');
  });
  await page.waitForTimeout(600);

  // Results prüfen: Wasser-Symbol (Name enthält "Wasser" / water / ماء) sichtbar
  const resultHasWasser = await page.evaluate((wid) => {
    // Auf symbolId matchen ist zuverlässiger — aber DOM hat keinen data-id. Also per Name-Match.
    const items = Array.from(document.querySelectorAll('div.space-y-2 > div'));
    return items.some(el => /wasser|water|ماء/i.test(el.textContent || ''));
  }, WASSER_SYMBOL_ID);

  if (!resultHasWasser) notes.push('Wasser-Symbol nicht im UI-Result gefunden');

  const matchedVia: string | null = apiBody?.matched_via ?? null;
  const translatedTo: string | null = apiBody?.translated_to ?? null;

  // Translated-Hint erwartet wenn Backend via Gemini übersetzt (inkl. query_cache).
  const isTranslated = matchedVia === 'gemini_translation' || matchedVia === 'query_cache';
  const hintLocator = page.locator('[data-testid="translated-hint"]');
  const hintVisible = await hintLocator.isVisible().catch(() => false);
  const hintText = hintVisible ? ((await hintLocator.textContent()) ?? '').trim() : '';
  if (isTranslated && !hintVisible) {
    notes.push(`translated-hint NICHT sichtbar trotz matched_via=${matchedVia}`);
  }
  if (!isTranslated && hintVisible) {
    notes.push(`translated-hint sichtbar obwohl matched_via=${matchedVia}`);
  }

  if (c.expectTranslatedHint) {
    if (!isTranslated) notes.push(`erwartete Übersetzung, bekam matched_via=${matchedVia}`);
    if (!hintText.includes(c.query)) notes.push(`hint-text enthält query "${c.query}" nicht: "${hintText}"`);
    if (translatedTo && !hintText.includes(translatedTo)) {
      notes.push(`hint-text enthält translated_to "${translatedTo}" nicht: "${hintText}"`);
    }
  }

  // RTL-Assert
  if (c.expectRtlInput) {
    const dir = await input.getAttribute('dir');
    if (dir !== 'rtl') notes.push(`Input dir="${dir}", erwartet "rtl"`);
  }

  await page.screenshot({ path: join(SCREENSHOT_DIR, `${vpLabel}-${c.label}.png`), fullPage: false });
  page.off('response', handler);

  return {
    ok: !!resultHasWasser && (!c.expectRtlInput || notes.every(n => !n.startsWith('Input dir'))),
    notes,
    apiStatus,
    matchedVia,
  };
}

async function runViewport(browser: Browser, vpLabel: string, contextOpts: any): Promise<void> {
  console.log(`\n════ Viewport: ${vpLabel} ════`);
  const ctx = await browser.newContext(contextOpts);
  const page = await ctx.newPage();

  for (const c of CASES) {
    console.log(`\n— ${vpLabel} · ${c.label} (${c.query}, locale=${c.locale}) —`);
    await openSymbolsPage(page, c.locale);
    const report = await runCaseOn(page, c, vpLabel);
    console.log(`  api=${report.apiStatus} matched_via=${report.matchedVia} ok=${report.ok}`);
    if (report.notes.length) console.log(`  NOTES: ${report.notes.join(' | ')}`);
  }

  await ctx.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  await runViewport(browser, 'desktop', { viewport: { width: 1280, height: 800 } });
  await runViewport(browser, 'mobile', { ...devices['iPhone 13'] });
  await browser.close();
  console.log(`\n✓ Screenshots: ${SCREENSHOT_DIR}`);
}

main().catch(err => { console.error(err); process.exit(1); });
