import { chromium, devices } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';
const OUT = '/home/dejavu/Projects/DreamCode/app/DreamCodeApp-current/tests/screenshots/final';
mkdirSync(OUT, { recursive: true });
const AUTH = 'Basic ' + Buffer.from('dreamcode:DreamCode2026').toString('base64');
const URL = 'https://dream-code.app/app/';

async function shot(page: any, name: string) {
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false });
  console.log('  shot:', name);
}

async function openMap(browser: any, locale: string, viewport: any, devicePre?: any) {
  const ctxOpts: any = devicePre ? { ...devicePre, viewport, extraHTTPHeaders: { Authorization: AUTH } } : { viewport, extraHTTPHeaders: { Authorization: AUTH } };
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  await page.addInitScript((loc: string) => { try { localStorage.setItem('dreamcode_language', loc); } catch {} }, locale);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3500);
  const hub = page.locator('button:has(span.material-icons:has-text("hub"))').first();
  await hub.waitFor({ state: 'visible', timeout: 15000 });
  await hub.click();
  await page.waitForTimeout(2500);
  return { ctx, page };
}

async function typeSearch(page: any, q: string) {
  const input = page.locator('[placeholder*="Durchsuche"], [placeholder*="Search dreams"], [placeholder*="ابحث"], [placeholder*="Rüya"]').first();
  await input.scrollIntoViewIfNeeded();
  await input.click();
  await input.fill('');
  await input.fill(q);
  await page.waitForTimeout(2000);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  // Desktop wasser
  {
    const { ctx, page } = await openMap(browser, 'de', { width: 1440, height: 900 });
    await typeSearch(page, 'wasser'); await shot(page, 'desktop-wasser-de');
    await ctx.close();
  }
  // Desktop water
  {
    const { ctx, page } = await openMap(browser, 'en', { width: 1440, height: 900 });
    await typeSearch(page, 'water'); await shot(page, 'desktop-water-en');
    await ctx.close();
  }
  // Desktop ocean
  {
    const { ctx, page } = await openMap(browser, 'en', { width: 1440, height: 900 });
    await typeSearch(page, 'ocean'); await shot(page, 'desktop-ocean-en');
    await ctx.close();
  }
  // Mobile ar
  {
    const { ctx, page } = await openMap(browser, 'ar', { width: 390, height: 844 }, devices['iPhone 13']);
    await typeSearch(page, 'ماء'); await shot(page, 'mobile-maa-ar');
    await ctx.close();
  }
  await browser.close();
  console.log('all screenshots in', OUT);
})().catch(e => { console.error(e); process.exit(2); });
