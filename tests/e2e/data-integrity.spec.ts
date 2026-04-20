// E2E-Test: Daten-Integritaet (Aufgabe 1, 2, 3)
// Verifiziert: PAGE_SIZE 100, Infinite-Scroll, Counter-Konsistenz, Export.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = join(__dirname, 'screenshots-data-integrity');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const URL = 'https://dream-code.app/app/';
const CREDS = { username: 'dreamcode', password: 'DreamCode2026' };

// Symbole mit unterschiedlichen Link-Anzahlen fuer Stress + Edge-Cases
const SYMBOLS = [
  { name: 'Wasser', id: '65501134-d2dc-45ea-9fda-31d4568a7af5', expectedTotal: 56,  expectedHint: 2499 },
  { name: 'Haus',   id: 'f2c17829-4460-47aa-a628-2b750f4bfea0', expectedTotal: 285, expectedHint: 6654 },
  { name: 'Nacht',  id: '148df202-616c-4d5a-b3be-3b1dd9c6aff8', expectedTotal: 285, expectedHint: 5092 },
];

interface Report {
  symbol: string;
  total: number | null;
  freqHint: number | null;
  initialItems: number;
  pageSize: number | null;
  apiCalls: number;
  scrollLoadedTotal: number;
  exportCsvBytes: number;
  exportJsonBytes: number;
  exportCsvRows: number;
  ok: boolean;
  notes: string[];
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    httpCredentials: CREDS,
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
  });
  const page = await ctx.newPage();

  console.log(`[Setup] navigiere zu ${URL}`);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // DreamMap oeffnen
  await page.locator('button:has-text("denselben Traum")').first().click();
  await page.waitForTimeout(6000);
  await page.waitForSelector('svg circle', { timeout: 20000 });
  await page.waitForTimeout(2000);
  console.log('[Setup] Graph geladen');

  const reports: Report[] = [];

  for (const sym of SYMBOLS) {
    console.log(`\n=== Teste ${sym.name} (links=${sym.expectedTotal}, NLP-Hint=${sym.expectedHint}) ===`);
    const notes: string[] = [];
    const apiCalls: Array<{ url: string; status: number; total: string | null; hint: string | null }> = [];

    const respHandler = (res: any) => {
      const u = res.url();
      if (u.includes(`/api/dreams/by-symbol/${sym.id}`)) {
        apiCalls.push({
          url: u.split('?')[1] || '',
          status: res.status(),
          total: res.headers()['x-total-count'] || null,
          hint: res.headers()['x-frequency-hint'] || null,
        });
      }
    };
    page.on('response', respHandler);

    // Symbol per Backend-Direktklick (kein UI-Klick noetig fuer scroll-test)
    // Triggere DreamListPanel via direkter API-Aufruf — und scrolle danach in der Liste
    // Aber besser: per UI-Klick auf Node falls sichtbar, sonst skippen
    const visibleInGraph = await page.locator(`svg text:has-text("${sym.name}")`).count();
    if (visibleInGraph > 0) {
      const clicked = await page.evaluate((symName: string) => {
        const texts = Array.from(document.querySelectorAll('svg text'));
        const match = texts.find(t => (t.textContent || '').includes(symName));
        if (!match) return false;
        const g = match.closest('g');
        const target = g?.querySelector('circle') || match;
        const rect = target.getBoundingClientRect();
        target.dispatchEvent(new MouseEvent('click', {
          bubbles: true, cancelable: true, view: window,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
        }));
        return true;
      }, sym.name);
      if (!clicked) notes.push('UI-Click failed');
      await page.waitForTimeout(2500);
    } else {
      notes.push('Symbol nicht im sichtbaren Graph');
      page.off('response', respHandler);
      reports.push({
        symbol: sym.name, total: null, freqHint: null,
        initialItems: 0, pageSize: null, apiCalls: 0, scrollLoadedTotal: 0,
        exportCsvBytes: 0, exportJsonBytes: 0, exportCsvRows: 0,
        ok: false, notes,
      });
      continue;
    }

    // Initial-Load: PAGE_SIZE pruefen
    const firstCall = apiCalls[0];
    const headerTotal = firstCall ? Number(firstCall.total) : null;
    const headerHint = firstCall ? Number(firstCall.hint) : null;
    const pageSize = firstCall ? Number(new URLSearchParams(firstCall.url).get('limit')) : null;

    console.log(`  Initial-API: total=${headerTotal} hint=${headerHint} limit=${pageSize}`);
    if (pageSize !== 100) notes.push(`PAGE_SIZE=${pageSize}, erwartet 100`);
    if (headerTotal !== sym.expectedTotal) notes.push(`Total=${headerTotal}, erwartet ${sym.expectedTotal}`);
    if (headerHint !== sym.expectedHint) notes.push(`Hint=${headerHint}, erwartet ${sym.expectedHint}`);

    const initialItems = await page.locator('div.space-y-2 > div').count();
    // Header-Text "X von Y Träumen" auslesen (Single-Source-of-Truth fuer geladene Items)
    const readHeaderCount = async (): Promise<{ loaded: number; total: number }> => {
      const txt = await page.evaluate(() => {
        // Suche nach Text "X von Y" im DreamListPanel-Header
        const all = Array.from(document.querySelectorAll('span'));
        for (const el of all) {
          const t = (el.textContent || '').trim();
          if (/\d+\s*von\s*\d+/.test(t)) return t;
        }
        for (const el of all) {
          const t = (el.textContent || '').trim();
          if (/^\d+\s+Tr[aä]um/.test(t)) return t;
        }
        return '';
      });
      const m = txt.match(/(\d+)\s*von\s*(\d+)/i);
      if (m) return { loaded: Number(m[1]), total: Number(m[2]) };
      const m2 = txt.match(/^(\d+)\s+Tr[aä]um/);
      return m2 ? { loaded: Number(m2[1]), total: Number(m2[1]) } : { loaded: 0, total: 0 };
    };
    const initialHdr = await readHeaderCount();
    console.log(`  UI: ${initialItems} sichtbare DOM-Items (virtualisiert), Header: ${initialHdr.loaded}/${initialHdr.total}`);

    await page.screenshot({ path: join(SCREENSHOT_DIR, `${sym.name}-initial.png`) });

    // Infinite-Scroll: scrolle Panel-Container zum Ende und triggere weitere Loads
    // Beachte: Items virtualisiert → Counter nicht via DOM, sondern via Header-Text "X von Y".
    const scrollContainer = page.locator('div.flex-1.overflow-y-auto').first();
    let lastLoaded = initialHdr.loaded;
    let stableRounds = 0;
    for (let i = 0; i < 20 && stableRounds < 2; i++) {
      await scrollContainer.evaluate((el: HTMLElement) => { el.scrollTop = el.scrollHeight; });
      await page.waitForTimeout(900);
      const hdr = await readHeaderCount();
      if (hdr.loaded === lastLoaded) stableRounds++;
      else { stableRounds = 0; lastLoaded = hdr.loaded; }
    }
    const finalHdr = await readHeaderCount();
    const finalCount = finalHdr.loaded;
    console.log(`  Nach Scroll: ${finalCount}/${finalHdr.total} (Header), ${apiCalls.length} API-Calls`);
    await page.screenshot({ path: join(SCREENSHOT_DIR, `${sym.name}-scrolled.png`) });

    // Direkter Export-Test (parallel zur UI, schneller)
    const csvRes = await page.evaluate(async (symId: string) => {
      const r = await fetch(`/api/dreams/export?symbol_id=${symId}&format=csv`);
      const t = await r.text();
      return { bytes: t.length, rows: t.split('\n').filter(l => l.length > 0).length, ct: r.headers.get('content-type') };
    }, sym.id);
    const jsonRes = await page.evaluate(async (symId: string) => {
      const r = await fetch(`/api/dreams/export?symbol_id=${symId}&format=json`);
      const t = await r.text();
      let parsed: any = null;
      try { parsed = JSON.parse(t); } catch {}
      return { bytes: t.length, valid: Array.isArray(parsed), entries: Array.isArray(parsed) ? parsed.length : 0 };
    }, sym.id);

    if (!csvRes.ct?.includes('text/csv')) notes.push(`CSV Content-Type: ${csvRes.ct}`);
    if (!jsonRes.valid) notes.push('JSON-Export ungueltig');
    if (csvRes.rows !== sym.expectedTotal + 1) notes.push(`CSV-Zeilen=${csvRes.rows}, erwartet ${sym.expectedTotal + 1}`);
    if (jsonRes.entries !== sym.expectedTotal) notes.push(`JSON-Entries=${jsonRes.entries}, erwartet ${sym.expectedTotal}`);

    console.log(`  Export CSV: ${csvRes.bytes}B, ${csvRes.rows} rows`);
    console.log(`  Export JSON: ${jsonRes.bytes}B, ${jsonRes.entries} entries`);

    // Panel schliessen
    try {
      await page.locator('button:has(.material-icons:text("close"))').first().click({ timeout: 1500 });
    } catch {}
    await page.waitForTimeout(500);
    page.off('response', respHandler);

    const ok = (
      headerTotal === sym.expectedTotal &&
      headerHint === sym.expectedHint &&
      pageSize === 100 &&
      finalCount === sym.expectedTotal &&
      jsonRes.entries === sym.expectedTotal &&
      csvRes.rows === sym.expectedTotal + 1
    );
    reports.push({
      symbol: sym.name,
      total: headerTotal,
      freqHint: headerHint,
      initialItems,
      pageSize,
      apiCalls: apiCalls.length,
      scrollLoadedTotal: finalCount,
      exportCsvBytes: csvRes.bytes,
      exportJsonBytes: jsonRes.bytes,
      exportCsvRows: csvRes.rows,
      ok,
      notes,
    });
  }

  console.log('\n=== ABSCHLUSSBERICHT ===');
  for (const r of reports) {
    const status = r.ok ? '✅' : '❌';
    console.log(`${status} ${r.symbol}: total=${r.total} hint=${r.freqHint} pageSize=${r.pageSize}`);
    console.log(`    initial=${r.initialItems} → scroll=${r.scrollLoadedTotal} (${r.apiCalls} API-Calls)`);
    console.log(`    Export CSV=${r.exportCsvRows}rows/${r.exportCsvBytes}B, JSON=${r.exportJsonBytes}B`);
    if (r.notes.length) console.log(`    Hinweise: ${r.notes.join('; ')}`);
  }
  writeFileSync(join(SCREENSHOT_DIR, 'report.json'), JSON.stringify(reports, null, 2));
  console.log(`\nArtefakte: ${SCREENSHOT_DIR}`);

  const allOk = reports.every(r => r.ok);
  await browser.close();
  process.exit(allOk ? 0 : 1);
}

main().catch(err => { console.error('Test-Fehler:', err); process.exit(2); });
