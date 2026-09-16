// Shared helpers for the e2e smoke runners.
//
// Every runner follows the same shape: seed a save through `editor.html`'s
// module imports, boot `index.html`, press through the title, drive the game
// with real key presses, then assert on REAL scene state read through the
// DEV-only `window.__claudemon` hook (see the game's CLAUDE.md) rather than on
// pixels. Output lines are deterministic — no timings, no paths — so two runs
// diff cleanly.
//
// Usage:
//   import { createRunner } from '../lib.mjs';
//   const t = await createRunner('story');
//   await t.scenario(name, seed, 'up', st => st.flags.x === true || 'detail');
//   await t.finish();
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';

/** A short tap only turns the player; a ~700 ms hold walks one tile. */
export const DIR_KEY = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };

const E2E_DIR = dirname(fileURLToPath(import.meta.url));

/**
 * Launch a browser and return the helper bundle for one runner.
 * `name` also names the screenshot directory (`e2e/shots/<name>/`).
 */
export async function createRunner(name) {
  const shotDir = join(E2E_DIR, 'shots', name);
  mkdirSync(shotDir, { recursive: true });

  // --no-sandbox: CI and the dev containers run Chromium as root.
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 700, height: 640 } })).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  const tap = async (k, ms = 80) => {
    await page.keyboard.down(k);
    await page.waitForTimeout(ms);
    await page.keyboard.up(k);
  };

  const shot = slug => page.screenshot({ path: join(shotDir, `${slug}.png`) });

  // --- state access through the dev hook -------------------------------------
  const overworld = () => page.evaluate(() => {
    const g = window.__claudemon; if (!g) return null;
    const s = g.scene.getScene('OverworldScene');
    if (!s || !s.scene.isActive() || !s.playerState) return null;
    const save = s.playerState.toSave();
    return { map: s.currentMap?.id, x: s.playerGridX, y: s.playerGridY, dir: s.playerDirection,
             flags: save.storyFlags, bag: save.bag, party: save.party.map(p => p.speciesId),
             textVisible: !!s.textBox?.getIsVisible(), warping: !!s.isWarping };
  });

  async function waitOverworld(timeout = 20000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      const st = await overworld();
      if (st && !st.warping) return st;
      await page.waitForTimeout(250);
    }
    throw new Error('overworld never became active');
  }

  async function advanceText(maxPresses = 40) {
    for (let i = 0; i < maxPresses; i++) {
      const st = await overworld();
      if (!st.textVisible) return;
      await tap('KeyZ'); await page.waitForTimeout(350);
    }
    throw new Error('text box never closed');
  }

  // --- boot ------------------------------------------------------------------
  // seed: { map, x, y, flags?, party?, bag?, badges?, defeated?, rivalName? }.
  // `party` is [[speciesId, level], ...]. Fields left out keep the new-save
  // defaults, so a runner that cares about the bag must pass one.
  async function boot(seed) {
    await page.goto(`${BASE}/editor.html`);
    await page.evaluate(async (seed) => {
      const { SaveSystem } = await import('/src/systems/SaveSystem.ts');
      const { createPokemon } = await import('/src/entities/Pokemon.ts');
      const save = SaveSystem.createNewSave('TEST', seed.rivalName ?? 'RIVAL');
      Object.assign(save.storyFlags, { intro_complete: true, ...seed.flags });
      save.party = (seed.party ?? [[25, 10]]).map(([id, lv]) => createPokemon(id, lv, 'TEST'));
      save.currentMap = seed.map; save.playerX = seed.x; save.playerY = seed.y;
      if (seed.bag !== undefined) save.bag = seed.bag;
      if (seed.badges !== undefined) save.badges = seed.badges;
      if (seed.defeated !== undefined) save.defeatedTrainers = seed.defeated;
      SaveSystem.save(save);
    }, seed);
    await page.goto(`${BASE}/index.html`);
    await page.waitForSelector('canvas');
    await page.waitForFunction(() => !!window.__claudemon, null, { timeout: 15000 });
    // Title: splash -> menu -> CONTINUE (first entry). Press Z until the overworld is live.
    for (let i = 0; i < 12; i++) {
      if (await overworld()) break;
      await tap('KeyZ'); await page.waitForTimeout(700);
    }
    return waitOverworld();
  }

  // --- results ---------------------------------------------------------------
  const results = [];
  function record(name, ok, detail = '', { knownBug = false } = {}) {
    results.push({ name, ok, knownBug });
    console.log(`${ok ? 'PASS' : knownBug ? 'KNOWN-BUG' : 'FAIL'}  ${name}${ok ? '' : ' — ' + detail}`);
    return ok;
  }

  /**
   * The talk-to-an-adjacent-NPC scenario: seed, boot, face `face`, press Z,
   * read through the text, then hand the final state to `check`. `check`
   * returns `true` or a detail string.
   */
  async function scenario(name, seed, face, check, { knownBug = false } = {}) {
    let st = await boot(seed);
    await tap(DIR_KEY[face]);            // a short tap only turns, no step
    await page.waitForTimeout(250);
    const slug = name.replace(/\W+/g, '_');
    await shot(`${slug}.pre`);
    await tap('KeyZ'); await page.waitForTimeout(500);
    await advanceText();
    await page.waitForTimeout(400);
    st = await overworld();
    await shot(`${slug}.post`);
    const verdict = check(st);
    return record(name, verdict === true, String(verdict), { knownBug });
  }

  /** Print the error line, close the browser, exit 1 on any non-known FAIL. */
  async function finish() {
    console.log('console/page errors:', errors.length ? errors : 'none');
    await browser.close();
    process.exit(results.some(r => !r.ok && !r.knownBug) ? 1 : 0);
  }

  return { browser, page, errors, shotDir, tap, shot, overworld, waitOverworld, advanceText, boot, record, scenario, finish, results };
}
