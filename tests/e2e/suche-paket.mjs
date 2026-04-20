// Phase-5 Deploy-Gate für AND-Suche + Modi + Pagination (2026-04-20)
// User-Zitate als Assertions.
import { chromium } from 'playwright';
import { mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const URL = process.env.TEST_URL || 'https://dream-code.app/app/';
const SHOT = '/tmp/dreamcode-screenshots';
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

async function typeSearch(page, q) {
  await page.evaluate((t) => {
    const inp = document.querySelector('input[type="search"]');
    if (!inp) return;
    inp.focus();
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(inp, t);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  }, q);
  await page.waitForFunction(() => {
    const c = document.querySelector('[data-testid="dreammap-research-counter"]');
    if (!c) return false;
    const m = c.innerText.match(/^([\d.,]+)/);
    if (!m) return false;
    return m[1] !== '0';
  }, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
}

async function getCounter(page) {
  return page.evaluate(() => {
    const c = document.querySelector('[data-testid="dreammap-research-counter"]');
    if (!c) return { total: null, text: null };
    const txt = c.innerText;
    const m = txt.match(/^([\d.,]+)/);
    return { total: m ? parseInt(m[1].replace(/[.,]/g, ''), 10) : null, text: txt };
  });
}

async function setMode(page, mode) {
  await page.evaluate((m) => {
    const btn = document.querySelector(`[data-search-mode="${m}"]`);
    btn?.click();
  }, mode);
  await page.waitForTimeout(1500);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ httpCredentials: { username: 'dreamcode', password: 'DreamCode2026' }, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  try {
    await openDreamMap(page);

    // === User-Zitat 1: "wasser" > 1500 ===
    console.log('\n=== "wasser" (all_words) ===');
    await typeSearch(page, 'wasser');
    let c = await getCounter(page);
    row('"wasser" > 1500 Treffer', (c.total || 0) > 1500, `total=${c.total} text="${c.text}"`);
    await page.screenshot({ path: join(SHOT, 'suche-wasser.png') });

    // === User-Zitat 2: "ich trinke wasser" 50–500 ===
    console.log('\n=== "ich trinke wasser" (all_words) ===');
    await typeSearch(page, 'ich trinke wasser');
    c = await getCounter(page);
    row('"ich trinke wasser" 50 < total < 500', (c.total || 0) > 50 && (c.total || 0) < 500, `total=${c.total}`);
    await page.screenshot({ path: join(SHOT, 'suche-trinke-wasser.png') });

    // === User-Zitat 3: "ich trinke kaltes wasser" < 50 ===
    console.log('\n=== "ich trinke kaltes wasser" ===');
    await typeSearch(page, 'ich trinke kaltes wasser');
    c = await getCounter(page);
    row('"ich trinke kaltes wasser" < 50', (c.total || 0) < 50 && (c.total || 0) > 0, `total=${c.total}`);

    // === User-Zitat 4: "ich trinke kaltes klares wasser" ≈ 1 ===
    console.log('\n=== "ich trinke kaltes klares wasser" ===');
    await typeSearch(page, 'ich trinke kaltes klares wasser');
    c = await getCounter(page);
    row('"ich trinke kaltes klares wasser" <= 5', (c.total || 0) <= 5 && (c.total || 0) >= 1, `total=${c.total}`);
    await page.screenshot({ path: join(SHOT, 'suche-kaltes-klares.png') });

    // === Modi-Chips sichtbar ===
    console.log('\n=== Modi-Chips ===');
    const modeInfo = await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('[data-search-mode]'));
      return chips.map(c => ({ mode: c.getAttribute('data-search-mode'), active: c.getAttribute('data-active') === 'true', text: (c.textContent||'').trim() }));
    });
    row('3 Modi-Chips sichtbar', modeInfo.length === 3, JSON.stringify(modeInfo));
    row('Default = all_words aktiv', modeInfo.find(c => c.mode === 'all_words')?.active === true);

    // === exactPhrase filtert strenger ===
    console.log('\n=== Mode exact_phrase vergleich ===');
    await typeSearch(page, 'klares wasser');
    const all_c = (await getCounter(page)).total || 0;
    await setMode(page, 'exact_phrase');
    const phrase_c = (await getCounter(page)).total || 0;
    row('exact_phrase ≤ all_words für "klares wasser"', phrase_c <= all_c, `all_words=${all_c} exact_phrase=${phrase_c}`);

    // === Pagination: scroll + counter-Änderung ===
    console.log('\n=== Infinite-Scroll Pagination ===');
    await setMode(page, 'all_words');
    await typeSearch(page, 'water');
    const pre = await page.evaluate(() => {
      const c = document.querySelector('[data-testid="dreammap-loaded-count"]');
      return c ? c.innerText : null;
    });
    const preItems = await page.evaluate(() => document.querySelectorAll('[data-testid="dreammap-research-list"] [data-dream-id]').length);
    // Scroll sentinel into view
    await page.evaluate(() => {
      const s = document.querySelector('[data-testid="dreammap-infinite-sentinel"]');
      s?.scrollIntoView({ behavior: 'instant', block: 'end' });
    });
    await page.waitForTimeout(2500);
    await page.evaluate(() => {
      const s = document.querySelector('[data-testid="dreammap-infinite-sentinel"]');
      s?.scrollIntoView({ behavior: 'instant', block: 'end' });
    });
    await page.waitForTimeout(2000);
    const postItems = await page.evaluate(() => document.querySelectorAll('[data-testid="dreammap-research-list"] [data-dream-id]').length);
    row('Infinite-Scroll lädt mehr Items', postItems > preItems, `vor=${preItems}, nach=${postItems}`);
    await page.screenshot({ path: join(SHOT, 'pagination-200.png') });

    // Screenshot sizes ok
    for (const f of ['suche-wasser.png','suche-trinke-wasser.png','suche-kaltes-klares.png','pagination-200.png']) {
      const sz = statSync(join(SHOT, f)).size;
      row(`${f} > 10 KB`, sz > 10240, `${sz} B`);
    }

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
