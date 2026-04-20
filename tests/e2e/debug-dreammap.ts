import { chromium } from 'playwright';
const URL = 'https://dream-code.app/app/';
const AUTH = 'Basic ' + Buffer.from('dreamcode:DreamCode2026').toString('base64');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: { Authorization: AUTH },
  });
  const page = await ctx.newPage();
  const logs: string[] = [];
  page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`));
  page.on('response', r => {
    if (r.url().includes('/api/symbols/search')) console.log('API:', r.status(), r.url());
  });
  await page.addInitScript(() => { try { localStorage.setItem('dreamcode_language','de'); } catch {} });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  const hub = page.locator('button:has(span.material-icons:has-text("hub"))').first();
  await hub.click();
  await page.waitForTimeout(2000);
  const input = page.locator('[placeholder*="Durchsuche"], [placeholder*="Rüya"]').first();
  await input.click();
  await input.fill('wasser');
  await page.waitForTimeout(2500);
  const counter = await page.locator('[data-testid="dreammap-combined-counter"]').count();
  const dreamerSpan = await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span'));
    const m = spans.find(s => /Gematchte/.test(s.textContent || ''));
    return m?.textContent ?? null;
  });
  const usersLen = await page.evaluate(() => {
    // count visible markers/pins in SVG
    return document.querySelectorAll('svg circle[r]').length;
  });
  console.log('counter elements:', counter);
  console.log('matched-span:', dreamerSpan);
  console.log('svg circles:', usersLen);
  await page.screenshot({ path: '/tmp/debug-wasser.png', fullPage: true });
  await browser.close();
})();
