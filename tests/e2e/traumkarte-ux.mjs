// Traumkarte-UX Gate — Phase C (2026-04-20, Bugs 1/3/4/6)
// BUG 2/5 skipped (funktional OK bzw. optional)
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point as turfPoint } from '@turf/helpers';

const URL = process.env.TEST_URL || 'https://dream-code.app/app/';
const SHOT = '/tmp/dreamcode-screenshots';
const GEO = JSON.parse(readFileSync('public/world-110m.geojson', 'utf8'));
mkdirSync(SHOT, { recursive: true });

const results = [];
function row(name, ok, note) { results.push({ name, ok, note }); console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${note ? ' — ' + note : ''}`); }

async function openDreamMap(page) {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    const ok = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => (x.textContent||'').toLowerCase().includes('wer hatte'));
      if (!b) return false;
      b.scrollIntoView({block:'center'}); b.click(); return true;
    });
    if (ok) break;
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(3000);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ httpCredentials: { username: 'dreamcode', password: 'DreamCode2026' }, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  try {
    await openDreamMap(page);

    // ============ BUG 4: Back-Button ============
    console.log('\n=== BUG 4: Back-Button ===');
    const backInfo = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => /arrow_back/.test(b.innerHTML) || /zurück|^back$/i.test(b.getAttribute('aria-label')||''));
      return btn ? {
        aria: btn.getAttribute('aria-label'),
        title: btn.getAttribute('title'),
        text: (btn.textContent||'').trim(),
        hasArrowBack: /arrow_back/.test(btn.innerHTML),
      } : null;
    });
    row('Back-Button aria-label present', !!backInfo?.aria, backInfo ? `aria="${backInfo.aria}" text="${backInfo.text}"` : 'not found');
    row('Back-Button uses arrow_back icon', backInfo?.hasArrowBack === true);

    // ============ BUG 6: Filter panel gated ============
    console.log('\n=== BUG 6: Filter-Panel gated ===');
    const filterInfo = await page.evaluate(() => ({
      numberInputs: document.querySelectorAll('input[type="number"]').length,
      ortInput: !!Array.from(document.querySelectorAll('input')).find(i => i.placeholder === 'Ort'),
      landInput: !!Array.from(document.querySelectorAll('input')).find(i => i.placeholder === 'Land'),
    }));
    row('Filter-Panel Age-Inputs entfernt', filterInfo.numberInputs === 0, `numberInputs=${filterInfo.numberInputs}`);
    row('Filter-Panel Ort/Land entfernt', !filterInfo.ortInput && !filterInfo.landInput, `ort=${filterInfo.ortInput} land=${filterInfo.landInput}`);

    // ============ BUG 3: WorldMap dots on land ============
    console.log('\n=== BUG 3: WorldMap-Dots auf Land ===');
    const dotsJson = JSON.parse(readFileSync('components/WorldMapPreview.dots.json', 'utf8'));
    let onLand = 0, total = dotsJson.dots.length;
    const ocean = [];
    for (const d of dotsJson.dots) {
      const pt = turfPoint([d.lng, d.lat]);
      let isLand = false;
      for (const f of GEO.features) {
        if (!f.geometry) continue;
        try { if (booleanPointInPolygon(pt, f)) { isLand = true; break; } } catch {}
      }
      if (isLand) onLand++; else ocean.push({ lat: d.lat, lng: d.lng, country: d.country });
    }
    row('WorldMap dots on land (point-in-polygon)', onLand / total >= 0.95, `${onLand}/${total} on land, ${ocean.length} edge/ocean: ${JSON.stringify(ocean.slice(0,3))}`);
    // Screenshot WMP
    const wmpShot = join(SHOT, 'traumkarte-wmp.png');
    await page.locator('button[aria-label="Weltkarte erkunden"]').screenshot({ path: wmpShot });
    row('WMP screenshot saved', statSync(wmpShot).size > 10000, `${statSync(wmpShot).size} B → ${wmpShot}`);

    // ============ BUG 1: Legend-Scroll ============
    console.log('\n=== BUG 1: Legend-Scroll ===');
    await page.evaluate(() => {
      const fk = Array.from(document.querySelectorAll('button')).find(b => /forschungskarte/i.test(b.textContent||''));
      fk?.click();
    });
    await page.waitForTimeout(5000);
    const legendInfo = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-study-id]');
      if (items.length === 0) return { items: 0 };
      const container = items[0].parentElement;
      return {
        items: items.length,
        scrollHeight: container.scrollHeight,
        clientHeight: container.clientHeight,
        scrollable: container.scrollHeight > container.clientHeight,
        visibleItems: Array.from(items).filter(it => {
          const r = it.getBoundingClientRect();
          return r.top >= 0 && r.bottom <= window.innerHeight;
        }).length,
      };
    });
    row('Legend hat 99 Items', legendInfo.items === 99, `${legendInfo.items}`);
    row('Legend-Container-Height sinnvoll (>= 400px)', legendInfo.clientHeight >= 400, `clientHeight=${legendInfo.clientHeight}`);
    row('Legend scrollable', legendInfo.scrollable === true);
    row('Legend zeigt mindestens 8 Items ohne Scroll', legendInfo.visibleItems >= 8, `visible=${legendInfo.visibleItems}`);

    // Screenshot Research-Map
    const rmShot = join(SHOT, 'traumkarte-research-map.png');
    await page.screenshot({ path: rmShot, fullPage: false });
    row('Research-Map screenshot', statSync(rmShot).size > 10000, `${statSync(rmShot).size} B → ${rmShot}`);

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
