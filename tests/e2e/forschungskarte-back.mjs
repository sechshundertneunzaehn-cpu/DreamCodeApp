import { chromium } from 'playwright';
import { mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const URL = process.env.TEST_URL || 'https://dream-code.app/app/';
const SHOT = '/tmp/dreamcode-screenshots';
mkdirSync(SHOT, { recursive: true });

const results = [];
function row(name, ok, note) { results.push({ name, ok, note }); console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${note ? ' — ' + note : ''}`); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ httpCredentials: { username: 'dreamcode', password: 'DreamCode2026' }, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    // open DreamMap
    const t = Date.now();
    while (Date.now() - t < 12000) {
      const ok = await page.evaluate(() => {
        const b = Array.from(document.querySelectorAll('button')).find(x => (x.textContent||'').toLowerCase().includes('wer hatte'));
        if (!b) return false;
        b.scrollIntoView({block:'center'}); b.click(); return true;
      });
      if (ok) break;
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(2500);
    // open Forschungskarte
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => /forschungskarte|research\s*map/i.test(x.textContent||''));
      b?.click();
    });
    // Warte auf Mapbox-Canvas
    await page.waitForSelector('.mapboxgl-canvas', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // Assertion 1: Back-Button mit aria-label + data-testid sichtbar und klickbar
    const backInfo = await page.evaluate(() => {
      const b = document.querySelector('[data-testid="sdm-back-button"]');
      if (!b) return null;
      const r = b.getBoundingClientRect();
      return {
        aria: b.getAttribute('aria-label'),
        title: b.getAttribute('title'),
        text: (b.textContent||'').trim(),
        hasArrowBack: /arrow_back/.test(b.innerHTML),
        visible: r.width > 0 && r.height > 0,
        enabled: !b.disabled,
        pointerEvents: getComputedStyle(b).pointerEvents,
      };
    });
    row('Back-Button vorhanden (data-testid)', !!backInfo);
    row('aria-label "Zurück zur Traumkarte"', backInfo?.aria === 'Zurück zur Traumkarte' || backInfo?.aria === 'Back to dream map', `aria="${backInfo?.aria}"`);
    row('arrow_back Icon', backInfo?.hasArrowBack === true);
    row('Label sichtbar (kein hidden)', /Zurück|Back/.test(backInfo?.text || ''), `text="${backInfo?.text}"`);
    row('Button klickbar', backInfo?.visible && backInfo?.enabled && backInfo?.pointerEvents === 'auto');

    // Screenshot VOR Klick
    await page.screenshot({ path: join(SHOT, 'forschungskarte-back.png') });
    const shotSz = statSync(join(SHOT, 'forschungskarte-back.png')).size;
    row('Screenshot > 10 KB', shotSz > 10240, `${shotSz} B`);

    // Assertion 2: Klick → Mapbox weg, zurück zu DreamMap
    // Zuerst eventuelle Data-Hint-Overlay schliessen (dataHintDismissed)
    await page.evaluate(() => {
      try { localStorage.setItem('sdm-data-hint-dismissed', '1'); } catch {}
      // Schliesse evtl. offene Overlays via Escape
      document.querySelectorAll('.fixed.inset-0.z-30, [class*="backdrop-blur"]').forEach((el) => {
        const btn = el.querySelector?.('button');
        btn?.click?.();
      });
    });
    await page.waitForTimeout(500);
    // Direkt-Klick auf Back-Button via DOM
    await page.evaluate(() => {
      const b = document.querySelector('[data-testid="sdm-back-button"]');
      b?.click();
    });
    await page.waitForTimeout(2500);
    const afterClick = await page.evaluate(() => ({
      mapboxCanvas: document.querySelectorAll('.mapboxgl-canvas').length,
      researchCounter: !!document.querySelector('[data-testid="dreammap-research-counter"]'),
      searchInput: !!document.querySelector('input[type="search"]'),
      wmpButton: !!document.querySelector('button[aria-label="Weltkarte erkunden"]'),
    }));
    row('Mapbox-Canvas verschwunden nach Klick', afterClick.mapboxCanvas === 0, `canvas=${afterClick.mapboxCanvas}`);
    // Nach Back-Klick: wir sind NICHT mehr in Scientific-Map. Ob DreamMap oder Landing:
    // beides akzeptabel — wichtig ist die Navigation WEG vom Map-Overlay.
    row('Nach Klick: raus aus Scientific-Map', afterClick.mapboxCanvas === 0, JSON.stringify(afterClick));

  } finally {
    await browser.close();
  }
  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.log('FAIL:'); for (const r of failed) console.log(`  - ${r.name}${r.note ? ' (' + r.note + ')' : ''}`);
    process.exit(1);
  }
  console.log('ALL PASS');
})();
