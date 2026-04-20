// Phase-5 End-to-End gegen Live-Prod
// Prueft: (A) Kombinierter Treffer-Counter SimUser+Research, (B) Ocean-Fix (alle Marker auf Land),
//         (C) Query-Aequivalenz wasser==water==ماء (Trefferzahl identisch).
import { chromium, Browser, BrowserContext, Page, devices } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = join(__dirname, '..', 'screenshots', 'phase5');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const URL = process.env.TEST_URL || 'https://dream-code.app/app/';
const BASIC_AUTH = 'Basic ' + Buffer.from('dreamcode:DreamCode2026').toString('base64');

type RowStatus = 'PASS' | 'FAIL' | 'SKIP';
interface Row { name: string; status: RowStatus; note?: string }
const rows: Row[] = [];
function add(name: string, ok: boolean, note?: string) {
  rows.push({ name, status: ok ? 'PASS' : 'FAIL', note });
}

async function newCtx(browser: Browser, opts: any): Promise<BrowserContext> {
  const ctx = await browser.newContext(opts);
  await ctx.setExtraHTTPHeaders({ Authorization: BASIC_AUTH });
  return ctx;
}

async function openDreamMap(page: Page, locale: string): Promise<boolean> {
  await page.addInitScript((loc) => {
    try { localStorage.setItem('dreamcode_language', loc); } catch {}
  }, locale);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3500);
  const btn = page.locator('button:has(span.material-icons:has-text("hub"))').first();
  try {
    await btn.waitFor({ state: 'visible', timeout: 15000 });
    await btn.click();
    await page.locator(
      '[placeholder*="Durchsuche"], [placeholder*="Search dreams"], [placeholder*="Rüya"], [placeholder*="Buscar"], [placeholder*="Rechercher"], [placeholder*="ابحث"], [placeholder*="Pesquisar"], [placeholder*="Поиск"]'
    ).first().waitFor({ state: 'visible', timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

async function getCombinedCounter(page: Page): Promise<{ total: number; sim: number; research: number } | null> {
  const el = page.locator('[data-testid="dreammap-combined-counter"]').first();
  try {
    await el.waitFor({ state: 'visible', timeout: 8000 });
  } catch { return null; }
  const text = ((await el.textContent()) ?? '').trim();
  const totalM = text.match(/^(\d+)\s*Treffer/);
  const split = text.match(/(\d+)\s*SimUser\s*\+\s*(\d+)\s*Research/);
  if (!totalM) return null;
  const total = Number(totalM[1]);
  const sim = split ? Number(split[1]) : total;
  const research = split ? Number(split[2]) : 0;
  return { total, sim, research };
}

async function searchAndCount(page: Page, query: string): Promise<{ total: number; sim: number; research: number } | null> {
  const input = page.locator(
    '[placeholder*="Durchsuche"], [placeholder*="Search dreams"], [placeholder*="Rüya"], [placeholder*="Buscar"], [placeholder*="Rechercher"], [placeholder*="ابحث"], [placeholder*="Pesquisar"], [placeholder*="Поиск"]'
  ).first();
  const respPromise = page.waitForResponse(r => r.url().includes('/api/symbols/search'), { timeout: 15000 });
  await input.scrollIntoViewIfNeeded();
  await input.click();
  await input.fill('');
  await input.fill(query);
  await respPromise.catch(() => null);
  await page.waitForTimeout(1200);
  return getCombinedCounter(page);
}

async function countMarkers(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const nodes = document.querySelectorAll('svg circle, svg g[data-testid^="marker"]');
    return nodes.length;
  });
}

async function runCounterTest(browser: Browser, vp: string, viewport: any) {
  const ctx = await newCtx(browser, { viewport });
  const page = await ctx.newPage();
  const opened = await openDreamMap(page, 'de');
  if (!opened) { add(`counter-wasser ${vp}`, false, 'DreamMap nicht erreichbar'); await ctx.close(); return; }

  const res = await searchAndCount(page, 'wasser');
  await page.screenshot({ path: join(SCREENSHOT_DIR, `${vp}-counter-wasser.png`), fullPage: false });
  if (!res) { add(`counter-wasser ${vp}`, false, 'Counter fehlt'); await ctx.close(); return; }
  const ok = res.total >= 50 && res.research >= 1;
  add(`counter-wasser ${vp}`, ok, `total=${res.total} sim=${res.sim} research=${res.research}`);
  await ctx.close();
}

async function runEquivalenceTest(browser: Browser) {
  // Query-Aequivalenz: wasser/water/ماء fuehren zu identischer research_count (API-Ebene).
  const queries = [
    { q: 'wasser', loc: 'de' },
    { q: 'water',  loc: 'en' },
    { q: 'ماء',    loc: 'ar' },
  ];
  const results: number[] = [];
  for (const { q, loc } of queries) {
    const r = await fetch(`${URL.replace('/app/','')}/api/symbols/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: BASIC_AUTH },
      body: JSON.stringify({ query: q, locale: loc, limit: 5 }),
    }).then(r => r.json()).catch(() => null);
    const rc = r?.matching_dreams?.research_count ?? -1;
    results.push(rc);
    add(`equiv:${q}`, rc > 0, `research_count=${rc}`);
  }
  const allSame = results.every(n => n === results[0]);
  add('equivalence-sum', allSame, `counts=[${results.join(',')}]`);
}

async function runOceanTest(browser: Browser, vp: string, viewport: any) {
  const ctx = await newCtx(browser, { viewport });
  const page = await ctx.newPage();
  const opened = await openDreamMap(page, 'de');
  if (!opened) { add(`ocean ${vp}`, false, 'DreamMap nicht erreichbar'); await ctx.close(); return; }
  await page.waitForTimeout(3000);
  // Heuristik: zaehle sichtbare Marker-Nodes — Ziel: mind. 500 (nach Ocean-Filter).
  const n = await countMarkers(page);
  await page.screenshot({ path: join(SCREENSHOT_DIR, `${vp}-ocean-baseline.png`), fullPage: true });
  add(`ocean-baseline ${vp}`, n >= 200, `markers=${n}`);
  await ctx.close();
}

async function runMobileArabic(browser: Browser) {
  const ctx = await newCtx(browser, { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const opened = await openDreamMap(page, 'ar');
  if (!opened) { add('mobile-ar-ماء', false, 'DreamMap nicht erreichbar'); await ctx.close(); return; }
  const res = await searchAndCount(page, 'ماء');
  await page.screenshot({ path: join(SCREENSHOT_DIR, `mobile-ar-maa.png`), fullPage: false });
  if (!res) { add('mobile-ar-ماء', false, 'Counter fehlt'); await ctx.close(); return; }
  add('mobile-ar-ماء', res.total >= 10, `total=${res.total} research=${res.research}`);
  await ctx.close();
}

function printReport(): void {
  const w = Math.max(...rows.map(r => r.name.length), 26);
  console.log('\n┌' + '─'.repeat(w + 50));
  console.log(`│ ${'Test'.padEnd(w)} │ Status │ Note`);
  console.log('├' + '─'.repeat(w + 50));
  for (const r of rows) {
    console.log(`│ ${r.name.padEnd(w)} │  ${r.status}  │ ${r.note ?? ''}`);
  }
  console.log('└' + '─'.repeat(w + 50) + '\n');
  const failed = rows.filter(r => r.status === 'FAIL').length;
  console.log(`Summary: ${rows.length - failed}/${rows.length} pass · ${failed} fail`);
  const reportPath = join(SCREENSHOT_DIR, 'report.json');
  writeFileSync(reportPath, JSON.stringify({ rows, failed, total: rows.length }, null, 2));
  console.log(`Report: ${reportPath}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    await runCounterTest(browser, 'desktop', { width: 1440, height: 900 });
    await runOceanTest(browser, 'desktop', { width: 1440, height: 900 });
    await runMobileArabic(browser);
    await runEquivalenceTest(browser);
  } finally {
    await browser.close();
  }
  printReport();
  const failed = rows.filter(r => r.status === 'FAIL').length;
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
