// Research-Cards Deploy-Gate — Phase 5.2 (2026-04-20)
// Bedingungen pro Query "wasser" / "katze" / "su":
//   - 🔬 mindestens 1× sichtbar
//   - KEIN SimUser-Name (nour.bey / knoepfchen77 / binta.dak)
//   - Counter-Label "wissenschaftliche Traumberichte" (lang=de) sichtbar
//   - Mindestens 1 Card mit data-study-Attribut im research-list
//   - Screenshot > 10 KB
import { chromium } from 'playwright';
import { mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const URL = process.env.TEST_URL || 'https://dream-code.app/app/';
const BASIC_AUTH = { username: 'dreamcode', password: 'DreamCode2026' };
const SHOT_DIR = '/tmp/dreamcode-screenshots';
mkdirSync(SHOT_DIR, { recursive: true });

const QUERIES = ['wasser', 'katze', 'su'];
const BANNED = ['nour.bey', 'knoepfchen77', 'binta.dak'];

const results = [];
function row(name, ok, note) { results.push({ name, ok, note }); console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${note ? ' — ' + note : ''}`); }

async function openDreamMap(page) {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const t = btns.find(b => (b.textContent || '').toLowerCase().includes('wer hatte'));
      if (!t) return false;
      t.scrollIntoView({ block: 'center' });
      t.click();
      return true;
    });
    if (clicked) break;
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(2500);
}

async function runOne(page, q) {
  const prefix = `smoke-${q}`;
  await openDreamMap(page);
  await page.evaluate((t) => {
    const inp = document.querySelector('input[type="search"]');
    if (!inp) return;
    inp.focus();
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(inp, t);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  }, q);
  // Wait for actual research cards (data-dream-id) to render, not just the label
  await page.waitForFunction(() => {
    const list = document.querySelector('[data-testid="dreammap-research-list"]');
    if (!list) return false;
    return list.querySelectorAll('[data-dream-id]').length >= 1;
  }, { timeout: 12000 }).catch(() => {});
  const shotPath = join(SHOT_DIR, `${prefix}.png`);
  await page.screenshot({ path: shotPath, fullPage: true });
  const sz = statSync(shotPath).size;

  const evals = await page.evaluate((banned) => {
    const body = document.body.innerText;
    const science = body.split('🔬').length - 1;
    const counter = /wissenschaftliche\s+Traumberichte/i.test(body) || /scientific\s+dream\s+reports/i.test(body);
    const bannedHits = banned.map(n => ({ n, hit: body.toLowerCase().includes(n) }));
    const dataStudy = document.querySelectorAll('[data-testid="dreammap-research-list"] [data-study]').length;
    const researchListExists = document.querySelector('[data-testid="dreammap-research-list"]') !== null;
    return { science, counter, bannedHits, dataStudy, researchListExists };
  }, BANNED);

  row(`${q}: 🔬 count >= 1`, evals.science >= 1, `found=${evals.science}`);
  row(`${q}: counter label visible`, evals.counter, evals.counter ? 'ok' : 'missing');
  for (const b of evals.bannedHits) row(`${q}: banned "${b.n}" absent`, !b.hit);
  row(`${q}: research-list [data-study] count >= 1`, evals.dataStudy >= 1, `found=${evals.dataStudy}`);
  row(`${q}: screenshot > 10 KB`, sz > 10240, `${sz} B → ${shotPath}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ httpCredentials: BASIC_AUTH, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  try {
    for (const q of QUERIES) {
      console.log(`\n=== Query: "${q}" ===`);
      await runOne(page, q);
    }
  } finally {
    await browser.close();
  }
  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.log('\nFAIL:');
    for (const r of failed) console.log(`  - ${r.name}${r.note ? ' (' + r.note + ')' : ''}`);
    process.exit(1);
  }
  console.log('\nALL PASS — Deploy-Gate OK');
})();
