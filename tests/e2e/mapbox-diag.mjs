import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const URL = process.env.TEST_URL || 'https://dream-code.app/app/';
const SHOT = '/tmp/dreamcode-screenshots';

const failed = [];
const consoleErrs = [];
const mapboxResponses = [];
const mapboxRequests = [];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    httpCredentials: { username: 'dreamcode', password: 'DreamCode2026' },
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  page.on('requestfailed', (req) => {
    if (req.url().includes('mapbox')) failed.push({ url: req.url(), err: req.failure()?.errorText });
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrs.push(msg.text().slice(0, 300));
  });
  page.on('response', (res) => {
    const u = res.url();
    if (u.includes('api.mapbox.com')) {
      mapboxResponses.push({ url: u.slice(0, 160), status: res.status() });
    }
  });
  page.on('request', (req) => {
    if (req.url().includes('api.mapbox.com')) mapboxRequests.push(req.url().slice(0, 160));
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});

  // Navigate to DreamMap then to Research-Map (Mapbox overlay)
  const t = Date.now();
  while (Date.now() - t < 12000) {
    const ok = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find((x) => (x.textContent || '').toLowerCase().includes('wer hatte'));
      if (!b) return false;
      b.scrollIntoView({ block: 'center' });
      b.click();
      return true;
    });
    if (ok) break;
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(2500);
  // Klick "Forschungskarte" or "science Forschungskarte"
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) => /forschungskarte|research\s*map/i.test(x.textContent || ''));
    if (b) b.click();
  });
  await page.waitForTimeout(6000);
  // WorldMapPreview-Vorschau-Klick falls Forschungskarte nicht direkt offen
  await page.evaluate(() => {
    const b = document.querySelector('button[aria-label="Weltkarte erkunden"]');
    if (b) b.click();
  });
  await page.waitForTimeout(6000);

  // Button-Inventur: aria-labels der Mapbox-Ctrl + Seiten-Panel-Buttons
  const buttons = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('button'));
    return nodes.map((b) => {
      const r = b.getBoundingClientRect();
      return {
        text: (b.textContent || '').trim().slice(0, 60),
        aria: b.getAttribute('aria-label') || '',
        title: b.getAttribute('title') || '',
        visible: r.width > 0 && r.height > 0,
        enabled: !b.disabled,
        pointerEvents: getComputedStyle(b).pointerEvents,
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    }).filter((x) => x.visible && (x.aria || x.text || x.title));
  });

  const canvasCount = await page.evaluate(() => document.querySelectorAll('canvas').length);
  const mapboxMarkers = await page.evaluate(() => document.querySelectorAll('.mapboxgl-marker').length);
  const legendCount = await page.evaluate(() => document.querySelectorAll('[data-study-id]').length);

  await page.screenshot({ path: join(SHOT, 'mapbox-diag.png'), fullPage: true });
  writeFileSync(join(SHOT, 'mapbox-diag.json'), JSON.stringify({
    failed_requests: failed,
    console_errors: consoleErrs.slice(0, 20),
    mapbox_responses_sample: mapboxResponses.slice(0, 20),
    mapbox_status_counts: mapboxResponses.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {}),
    mapbox_request_total: mapboxRequests.length,
    canvas_count: canvasCount,
    mapbox_markers: mapboxMarkers,
    legend_study_count: legendCount,
    buttons,
  }, null, 2));
  writeFileSync(join(SHOT, 'mapbox-buttons.json'), JSON.stringify(buttons, null, 2));

  console.log('failed:', failed.length);
  console.log('console errs:', consoleErrs.length);
  console.log('mapbox requests:', mapboxRequests.length);
  console.log('status counts:', JSON.stringify(mapboxResponses.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {})));
  console.log('canvas:', canvasCount, 'markers:', mapboxMarkers, 'legend:', legendCount);
  console.log('buttons total:', buttons.length);

  await browser.close();
})();
