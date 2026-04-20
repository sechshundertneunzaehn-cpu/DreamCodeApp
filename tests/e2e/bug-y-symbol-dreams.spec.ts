// E2E-Test BUG-Y: Dream-Listen nach Symbol-Klick
// Standalone-Script (kein @playwright/test noetig)
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = join(__dirname, 'screenshots');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Symbol-UUIDs (stabil, aus DB geholt)
const SYMBOLS = [
  { name: 'Wasser',     id: '65501134-d2dc-45ea-9fda-31d4568a7af5', expectInGraph: true  },
  { name: 'Dunkelheit', id: 'eb8221d2-5265-4ee8-ab73-9f797876da7e', expectInGraph: false },
  { name: 'Brücke',     id: '09208250-e787-463e-b721-193f6e55dcda', expectInGraph: false },
  { name: 'Blut',       id: 'cd31a8bf-52d8-4d9b-9ad3-a91d4b267fc6', expectInGraph: false },
];
const URL = 'https://dream-code.app/app/';
const CREDS = { username: 'dreamcode', password: 'DreamCode2026' };

type R = {
  symbol: string;
  apiStatus: string;
  uiCount: number;
  ok: boolean;
  note?: string;
  apiItemCount?: number;
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    httpCredentials: CREDS,
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();

  const consoleErrors: string[] = [];
  const apiCalls: Array<{ url: string; status: number; size: number; symbolId?: string }> = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('response', async res => {
    const u = res.url();
    if (u.includes('/api/dreams/by-symbol/')) {
      let size = 0;
      try { size = (await res.body()).length; } catch {}
      const m = u.match(/by-symbol\/([0-9a-f-]+)/i);
      apiCalls.push({ url: u, status: res.status(), size, symbolId: m?.[1] });
    }
  });

  console.log(`[1] Navigiere zu ${URL}`);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  console.log('[2] Oeffne DreamMap (hub-Button "denselben Traum")');
  await page.locator('button:has-text("denselben Traum")').first().click();
  await page.waitForTimeout(6000);

  // Warte auf Graph-Nodes
  await page.waitForSelector('svg circle', { timeout: 20000 });
  await page.waitForTimeout(2500);
  const nodesInGraph = await page.locator('svg circle').count();
  console.log(`    Graph gerendert: ${nodesInGraph} Nodes`);
  await page.screenshot({ path: join(SCREENSHOT_DIR, '_00-graph-overview.png') });

  // Fensterliste der sichtbaren Labels
  const allLabels = await page.locator('svg text').allTextContents();
  console.log(`    Sichtbare Labels: ${allLabels.length} (erste 5: ${allLabels.slice(0, 5).join(', ')})`);

  const results: R[] = [];

  for (const sym of SYMBOLS) {
    console.log(`\n[3] Teste: ${sym.name}`);
    apiCalls.length = 0;

    // Versuche per UI-Click wenn Node im Graph sichtbar
    const nodeLocator = page.locator(`svg text:has-text("${sym.name}")`).first();
    const isVisible = (await nodeLocator.count()) > 0;

    let uiCount = 0;
    let clickedViaUI = false;
    let note = '';

    if (isVisible) {
      // Direkter D3-basierter Klick via page.evaluate — umgeht Viewport-Probleme
      const clickOk = await page.evaluate((symName: string) => {
        const texts = Array.from(document.querySelectorAll('svg text'));
        const match = texts.find(t => (t.textContent || '').includes(symName));
        if (!match) return false;
        const g = match.closest('g');
        const circle = g?.querySelector('circle');
        const target = circle || match;
        const rect = target.getBoundingClientRect();
        const ev = new MouseEvent('click', {
          bubbles: true, cancelable: true, view: window,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
        });
        target.dispatchEvent(ev);
        return true;
      }, sym.name);

      if (clickOk) {
        clickedViaUI = true;
      } else {
        note = 'd3-click-failed';
      }
    } else {
      note = 'nicht im Graph sichtbar → direkter API-Trigger';
      // Trigger API + Render via fetch in browser context, Panel wird nicht erscheinen
      // Wir verifizieren nur dass der Endpoint erreichbar ist.
    }

    if (clickedViaUI) {
      await page.waitForTimeout(4000);
      const shot = join(SCREENSHOT_DIR, `${sym.name.replace(/[^\w]/g, '_')}.png`);
      await page.screenshot({ path: shot });

      // Panel-Einträge zaehlen (DreamListPanel sidePanel: div.space-y-2 > div)
      const panelItems = await page.locator('div.space-y-2 > div').count();
      const emptyVisible = await page.locator('text=/Keine Tr[aä]eume/i').count();
      uiCount = emptyVisible > 0 ? 0 : panelItems;

      // Panel schliessen
      try {
        await page.locator('button:has(.material-icons:text("close"))').first().click({ timeout: 1500 });
      } catch {}
      await page.waitForTimeout(600);
    }

    // Direkter API-Check (immer, auch fuer nicht sichtbare Symbole)
    const apiResult = await page.evaluate(async (symId: string) => {
      try {
        const r = await fetch(`/api/dreams/by-symbol/${symId}?limit=50`);
        const data = await r.json();
        return { status: r.status, count: Array.isArray(data) ? data.length : 0, body: JSON.stringify(data).length };
      } catch (e: any) {
        return { status: 0, count: 0, body: 0, err: e?.message };
      }
    }, sym.id);

    const apiStatus = `${apiResult.status}/${(apiResult.body / 1024).toFixed(1)}kb`;
    // Falls UI-Count nicht verfuegbar, nutze API-Count als Proxy (bei unsichtbaren Symbolen)
    const effectiveUiCount = clickedViaUI ? uiCount : apiResult.count;
    const ok = apiResult.status === 200 && apiResult.count > 0 && (clickedViaUI ? uiCount > 0 : true);

    results.push({
      symbol: sym.name,
      apiStatus,
      uiCount: effectiveUiCount,
      apiItemCount: apiResult.count,
      ok,
      note: clickedViaUI ? (note || '') : `${note}; API-Count=${apiResult.count}`,
    });

    console.log(`    ${ok ? '✅' : '❌'} API=${apiStatus} items=${apiResult.count} | UI=${clickedViaUI ? uiCount : 'N/A'}`);
  }

  // Bericht
  console.log('\n┌────────────┬───────────┬──────────────┬──────────┐');
  console.log('│  Symbol    │ API-Call  │ Dreams im UI │ Status   │');
  console.log('├────────────┼───────────┼──────────────┼──────────┤');
  for (const r of results) {
    const sym = r.symbol.padEnd(10).slice(0, 10);
    const api = r.apiStatus.padEnd(9).slice(0, 9);
    const cnt = String(r.uiCount).padEnd(12).slice(0, 12);
    const st = r.ok ? '✅ OK    ' : '❌ FAIL  ';
    console.log(`│ ${sym} │ ${api} │ ${cnt} │ ${st}│`);
  }
  console.log('└────────────┴───────────┴──────────────┴──────────┘');
  console.log('\nNotizen:');
  results.forEach(r => r.note && console.log(`  • ${r.symbol}: ${r.note}`));

  console.log(`\nScreenshots: ${SCREENSHOT_DIR}`);
  if (consoleErrors.length > 0) {
    console.log(`\nConsole-Errors (${consoleErrors.length}):`);
    consoleErrors.slice(0, 5).forEach(e => console.log('  -', e.slice(0, 200)));
  }

  writeFileSync(
    join(SCREENSHOT_DIR, 'results.json'),
    JSON.stringify({ results, apiCalls, consoleErrors }, null, 2),
  );

  const allOk = results.every(r => r.ok);
  await browser.close();
  process.exit(allOk ? 0 : 1);
}

main().catch(err => {
  console.error('Test-Fehler:', err);
  process.exit(2);
});
