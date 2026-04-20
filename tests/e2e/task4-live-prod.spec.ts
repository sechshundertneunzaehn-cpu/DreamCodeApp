// Task-4 End-to-End gegen Live-Prod (BLACK)
// Testet Symbol-Suche multilingual + Regressionen auf dream-code.app/app/
// Läuft gegen echte Prod — kein Mock, kein Dev-Server.
import { chromium, Browser, BrowserContext, Page, devices } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = join(__dirname, '..', 'screenshots', 'task4-prod');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const URL = process.env.TEST_URL || 'https://dream-code.app/app/';
const BASIC_AUTH = 'Basic ' + Buffer.from('dreamcode:DreamCode2026').toString('base64');
// Cross-origin API-Calls gehen an dream-code.app — Basic Auth IMMER setzen.
const USE_AUTH = true;
const WASSER_NAME_RE = /wasser|water|ماء/i;
const LATENCY_BUDGET_MS = 2000;

interface SearchCase {
  query: string;
  locale: string;
  label: string;
  expectRtl?: boolean;
  expectTranslatedHint?: boolean;
  expectedChips?: number;
}

const CASES: SearchCase[] = [
  { query: 'Wasser',     locale: 'de', label: 'wasser-de',    expectedChips: 1 },
  { query: 'water',      locale: 'en', label: 'water-en',     expectedChips: 1 },
  { query: 'ماء',        locale: 'ar', label: 'maa-ar',       expectRtl: true, expectedChips: 1 },
  { query: 'su',         locale: 'tr', label: 'su-tr',        expectedChips: 1 },
  { query: 'liquid h2o', locale: 'en', label: 'liquid-h2o-en', expectTranslatedHint: true, expectedChips: 1 },
];

type RowStatus = '✓' | '✗' | '–';
interface Row { name: string; status: RowStatus; note?: string }
const rows: Row[] = [];
function add(name: string, ok: boolean, note?: string) {
  rows.push({ name, status: ok ? '✓' : '✗', note });
}

async function dumpDom(page: Page, tag: string, selector = 'body'): Promise<string> {
  try {
    const html = await page.locator(selector).first().innerHTML({ timeout: 2000 });
    const out = join(SCREENSHOT_DIR, `dom-${tag}.html`);
    writeFileSync(out, html.slice(0, 20000));
    return out;
  } catch {
    return '(dom-dump fehlgeschlagen)';
  }
}

async function newContextWithAuth(browser: Browser, opts: any): Promise<BrowserContext> {
  const ctx = await browser.newContext(opts);
  if (USE_AUTH) await ctx.setExtraHTTPHeaders({ Authorization: BASIC_AUTH });
  return ctx;
}

async function openApp(page: Page, locale: string): Promise<void> {
  await page.addInitScript((loc) => {
    try { localStorage.setItem('dreamcode_language', loc); } catch {}
  }, locale);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  // Onboarding / Login können Overlays produzieren — warte einfach auf HOME-textarea oder Symbol-Button.
  await page.waitForTimeout(3500);
}

async function openSymbolLibrary(page: Page): Promise<boolean> {
  // Der Symbol-Library-Button enthält den stabilen Sub-Text "877".
  const btn = page.locator('button:has-text("877")').first();
  try {
    await btn.waitFor({ state: 'visible', timeout: 20000 });
    await btn.click();
    await page.locator('[data-testid="symbol-search-input"]').waitFor({ state: 'visible', timeout: 15000 });
    return true;
  } catch {
    return false;
  }
}

interface ApiResult { status: number | null; matchedVia: string | null; translatedTo: string | null; latencyMs: number | null }

async function testSearch(page: Page, vp: string, c: SearchCase): Promise<void> {
  const label = `${c.label} ${vp}`;
  const api: ApiResult = { status: null, matchedVia: null, translatedTo: null, latencyMs: null };
  const input = page.locator('[data-testid="symbol-search-input"]');

  const respPromise = page.waitForResponse(r => r.url().includes('/api/symbols/search'), { timeout: 15000 });

  await input.scrollIntoViewIfNeeded();
  await input.click();
  await input.fill('');
  await input.fill(c.query);

  const resp = await respPromise.catch(() => null);
  if (resp) {
    api.status = resp.status();
    try {
      const body = await resp.json();
      api.matchedVia = body?.matched_via ?? null;
      api.translatedTo = body?.translated_to ?? null;
      api.latencyMs = typeof body?.latency_ms === 'number' ? body.latency_ms : null;
    } catch { /* ignore */ }
  }
  await page.waitForTimeout(800);

  // Result-Check: Wasser-Symbol sichtbar (Name enthält wasser/water/ماء)
  const hasWasser = await page.evaluate((pat) => {
    const re = new RegExp(pat, 'i');
    const items = Array.from(document.querySelectorAll('div.space-y-2 > div'));
    return items.some(el => re.test(el.textContent || ''));
  }, WASSER_NAME_RE.source);

  const inputDir = await input.getAttribute('dir');
  const hintLocator = page.locator('[data-testid="translated-hint"]');
  const hintVisible = await hintLocator.isVisible().catch(() => false);
  const hintText = hintVisible ? ((await hintLocator.textContent()) ?? '').trim() : '';

  await page.screenshot({ path: join(SCREENSHOT_DIR, `${vp}-${c.label}.png`), fullPage: false });

  const notes: string[] = [];
  let ok = true;

  if (api.status !== 200) { ok = false; notes.push(`API-Status=${api.status}`); }
  if (!api.matchedVia) { ok = false; notes.push('matched_via fehlt'); }
  if (api.latencyMs !== null && api.latencyMs > LATENCY_BUDGET_MS) {
    ok = false; notes.push(`latenz=${api.latencyMs}ms > ${LATENCY_BUDGET_MS}`);
  }
  if (!hasWasser) { ok = false; notes.push('Wasser-Symbol nicht im UI'); }
  if (c.expectRtl && inputDir !== 'rtl') {
    ok = false; notes.push(`dir="${inputDir}" (erwartet rtl)`);
  }
  if (c.expectTranslatedHint) {
    if (!hintVisible) { ok = false; notes.push('translated-hint fehlt'); }
    else if (!hintText.includes(c.query)) {
      ok = false; notes.push(`hint-text enthält query nicht: "${hintText}"`);
    }
  }

  if (!ok) await dumpDom(page, `${vp}-${c.label}`, 'body');

  add(`${c.label.padEnd(16)} ${vp}`, ok, notes.length ? `[api=${api.status}, via=${api.matchedVia}, lat=${api.latencyMs}ms] ${notes.join(' | ')}` : `via=${api.matchedVia}, lat=${api.latencyMs}ms`);
  console.log(`  ${ok ? '✓' : '✗'} ${label}  api=${api.status} via=${api.matchedVia} lat=${api.latencyMs}ms  ${notes.join(' | ')}`);
}

async function openDreamMap(page: Page): Promise<boolean> {
  // Home hat einen Secondary-Button mit Material-Icon "hub" (DreamMap).
  const btn = page.locator('button:has(span.material-icons:has-text("hub"))').first();
  try {
    await btn.waitFor({ state: 'visible', timeout: 15000 });
    await btn.click();
    await page.locator('[placeholder*="Durchsuche"], [placeholder*="Search dreams"], [placeholder*="Rüya"], [placeholder*="Buscar"], [placeholder*="Rechercher"], [placeholder*="ابحث"], [placeholder*="Pesquisar"], [placeholder*="Поиск"]').first()
      .waitFor({ state: 'visible', timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

async function testDreamMapSearch(page: Page, vp: string, c: SearchCase): Promise<void> {
  const label = `dm-${c.label} ${vp}`;
  const api: ApiResult = { status: null, matchedVia: null, translatedTo: null, latencyMs: null };

  const input = page.locator('[placeholder*="Durchsuche"], [placeholder*="Search dreams"], [placeholder*="Rüya"], [placeholder*="Buscar"], [placeholder*="Rechercher"], [placeholder*="ابحث"], [placeholder*="Pesquisar"], [placeholder*="Поиск"]').first();

  const respPromise = page.waitForResponse(r => r.url().includes('/api/symbols/search'), { timeout: 15000 });
  await input.scrollIntoViewIfNeeded();
  await input.click();
  await input.fill('');
  await input.fill(c.query);

  const resp = await respPromise.catch(() => null);
  if (resp) {
    api.status = resp.status();
    try {
      const body = await resp.json();
      api.matchedVia = body?.matched_via ?? null;
      api.translatedTo = body?.translated_to ?? null;
      api.latencyMs = typeof body?.latency_ms === 'number' ? body.latency_ms : null;
    } catch { /* ignore */ }
  }
  await page.waitForTimeout(600);

  const sectionVisible = await page.locator('[data-testid="dreammap-symbol-section"]').isVisible().catch(() => false);
  const chips = page.locator('[data-testid="dreammap-symbol-chip"]');
  const chipCount = await chips.count().catch(() => 0);
  let hasWasser = false;
  for (let i = 0; i < chipCount; i++) {
    const txt = ((await chips.nth(i).textContent()) || '').trim();
    if (WASSER_NAME_RE.test(txt)) { hasWasser = true; break; }
  }

  const hintLocator = page.locator('[data-testid="dreammap-symbol-translated-hint"]');
  const hintVisible = await hintLocator.isVisible().catch(() => false);
  const hintText = hintVisible ? ((await hintLocator.textContent()) ?? '').trim() : '';

  const sectionDir = await page.locator('[data-testid="dreammap-symbol-section"]').getAttribute('dir').catch(() => null);

  await page.screenshot({ path: join(SCREENSHOT_DIR, `dreammap-${vp}-${c.label}.png`), fullPage: false });

  const notes: string[] = [];
  let ok = true;
  if (api.status !== 200) { ok = false; notes.push(`API-Status=${api.status}`); }
  if (!sectionVisible) { ok = false; notes.push('Section fehlt'); }
  if (chipCount === 0) { ok = false; notes.push('keine Chips'); }
  if (typeof c.expectedChips === 'number' && chipCount !== c.expectedChips) {
    ok = false; notes.push(`chips=${chipCount} (erwartet ${c.expectedChips})`);
  }
  if (!hasWasser) { ok = false; notes.push('Wasser-Chip fehlt'); }
  if (c.expectRtl && sectionDir !== 'rtl') { ok = false; notes.push(`dir="${sectionDir}" (erwartet rtl)`); }
  if (c.expectTranslatedHint) {
    if (!hintVisible) { ok = false; notes.push('translated-hint fehlt'); }
    else if (!hintText.includes(c.query)) { ok = false; notes.push(`hint ohne query: "${hintText}"`); }
  }
  if (api.latencyMs !== null && api.latencyMs > LATENCY_BUDGET_MS) { ok = false; notes.push(`latenz=${api.latencyMs}ms > ${LATENCY_BUDGET_MS}`); }

  if (!ok) await dumpDom(page, `dm-${vp}-${c.label}`, 'body');

  add(`dm-${c.label.padEnd(14)} ${vp}`, ok, notes.length ? `[api=${api.status}, via=${api.matchedVia}, chips=${chipCount}] ${notes.join(' | ')}` : `via=${api.matchedVia}, chips=${chipCount}`);
  console.log(`  ${ok ? '✓' : '✗'} ${label}  api=${api.status} via=${api.matchedVia} chips=${chipCount}  ${notes.join(' | ')}`);
}

async function runDreamMapCases(page: Page, vp: string): Promise<void> {
  console.log(`\n— DreamMap-Haupt-Suchbar (${vp}) —`);
  for (const c of CASES) {
    await openApp(page, c.locale);
    const opened = await openDreamMap(page);
    if (!opened) {
      await dumpDom(page, `dm-${vp}-${c.label}-nav-fail`);
      add(`dm-${c.label.padEnd(14)} ${vp}`, false, 'DreamMap nicht erreichbar');
      continue;
    }
    await testDreamMapSearch(page, vp, c);
  }
}

async function runSearchCases(page: Page, vp: string): Promise<void> {
  for (const c of CASES) {
    // Neu-Öffnen der Library je Fall: sicherer als locale-Wechsel
    await openApp(page, c.locale);
    const opened = await openSymbolLibrary(page);
    if (!opened) {
      await dumpDom(page, `${vp}-${c.label}-nav-fail`);
      add(`${c.label.padEnd(16)} ${vp}`, false, 'Symbol-Library nicht erreichbar');
      continue;
    }
    await testSearch(page, vp, c);
  }
}

async function runRegressionChecks(page: Page, vp: string): Promise<void> {
  console.log(`\n— Regressionen (${vp}) —`);
  await openApp(page, 'de');

  // Voice-Bot: zentrale gradient-fuchsia Nav-Button mit material-icons graphic_eq
  const voiceBtn = page.locator('button:has(span.material-icons:has-text("graphic_eq"))').first();
  const voiceVisible = await voiceBtn.isVisible().catch(() => false);
  await page.screenshot({ path: join(SCREENSHOT_DIR, `${vp}-regression-home.png`), fullPage: false });
  add(`voice-bot         ${vp}`, voiceVisible, voiceVisible ? undefined : 'Voice-Bot-Button fehlt');

  // Hauptchat: Dream-Input textarea mit placeholder
  const chat = page.locator('textarea').first();
  const chatVisible = await chat.isVisible().catch(() => false);
  add(`chat              ${vp}`, chatVisible, chatVisible ? undefined : 'Dream-Textarea fehlt');

  // Forschungskarte: via Footer-Link (worldmap_link). Fallback: scrolle zum footer.
  let researchOk = false;
  let legendCount = -1;
  try {
    // Footer ist unten — scrolle runter, dann Link finden.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const footerLinks = page.locator('footer button');
    const n = await footerLinks.count();
    let clicked = false;
    for (let i = 0; i < n; i++) {
      const txt = ((await footerLinks.nth(i).textContent()) || '').toLowerCase();
      if (txt.includes('welt') || txt.includes('karte') || txt.includes('map') || txt.includes('world')) {
        await footerLinks.nth(i).click();
        clicked = true;
        break;
      }
    }
    if (!clicked) throw new Error('kein Worldmap-Link im Footer');
    await page.waitForTimeout(5000);
    // 99 Studien in Legende — suche nach der Anzahl-Anzeige
    const text = await page.locator('body').innerText();
    const m = text.match(/(\d+)\s*(Studien|studies)/i);
    if (m) legendCount = Number(m[1]);
    researchOk = legendCount === 99;
    await page.screenshot({ path: join(SCREENSHOT_DIR, `${vp}-regression-research.png`), fullPage: false });
  } catch (e: any) {
    await dumpDom(page, `${vp}-regression-research-fail`);
  }
  add(`forschungskarte   ${vp}`, researchOk, researchOk ? `${legendCount} Studien` : `legend=${legendCount}`);
}

function printReport(): void {
  const w1 = Math.max(...rows.map(r => r.name.length), 26);
  const line = '─'.repeat(w1 + 2) + '┬────────┬' + '─'.repeat(60);
  console.log('\n┌' + line);
  console.log(`│ ${'Test'.padEnd(w1)} │ Status │ Note`);
  console.log('├' + line);
  for (const r of rows) {
    console.log(`│ ${r.name.padEnd(w1)} │   ${r.status}    │ ${r.note ?? ''}`);
  }
  console.log('└' + line + '\n');

  const failed = rows.filter(r => r.status === '✗').length;
  console.log(`Summary: ${rows.length - failed}/${rows.length} pass · ${failed} fail`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  const desktopCtx = await newContextWithAuth(browser, { viewport: { width: 1440, height: 900 } });
  const desktop = await desktopCtx.newPage();
  console.log('════ Desktop 1440×900 ════');
  await runSearchCases(desktop, 'desktop');
  await runDreamMapCases(desktop, 'desktop');
  await runRegressionChecks(desktop, 'desktop');
  await desktopCtx.close();

  const mobileCtx = await newContextWithAuth(browser, { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } });
  const mobile = await mobileCtx.newPage();
  console.log('\n════ Mobile 390×844 ════');
  await runSearchCases(mobile, 'mobile');
  await runDreamMapCases(mobile, 'mobile');
  await runRegressionChecks(mobile, 'mobile');
  await mobileCtx.close();

  await browser.close();
  printReport();
  const failed = rows.filter(r => r.status === '✗').length;
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(2); });
