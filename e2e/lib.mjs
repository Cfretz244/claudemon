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

/** A short tap turns and then steps; against a solid tile it only turns. */
export const DIR_KEY = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
export const OPPOSITE_DIR = { up: 'down', down: 'up', left: 'right', right: 'left' };

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
  /** Whichever scene is up: `{ battle: true, ... }` or the overworld snapshot. */
  const state = () => page.evaluate(() => {
    const g = window.__claudemon; if (!g) return null;
    const b = g.scene.getScene('BattleScene');
    if (b && b.scene.isActive()) {
      const opp = b.opponentParty ?? [];
      const save = b.playerState?.toSave?.();
      return { battle: true, trainerId: b.trainerId ?? null, trainerName: b.trainerName ?? null,
               trainerClass: b.trainerClass ?? null, returnMap: b.returnMap ?? null,
               species: opp[0]?.speciesId ?? null, level: opp[0]?.level ?? null,
               team: opp.map(p => [p.speciesId, p.level]),
               menuActive: !!b.menu?.active, menuMode: b.menu?.mode ?? null,
               text: b.textBox?.messages ?? [], textVisible: !!b.textBox?.getIsVisible(),
               flags: save?.storyFlags ?? {}, defeated: save?.defeatedTrainers ?? [] };
    }
    const s = g.scene.getScene('OverworldScene');
    if (!s || !s.scene.isActive() || !s.playerState) return null;
    const save = s.playerState.toSave();
    return { battle: false, map: s.currentMap?.id, x: s.playerGridX, y: s.playerGridY, dir: s.playerDirection,
             flags: save.storyFlags, bag: save.bag, defeated: save.defeatedTrainers,
             party: save.party.map(p => [p.speciesId, p.level]),
             text: s.textBox?.messages ?? [], textVisible: !!s.textBox?.getIsVisible(),
             warping: !!s.isWarping, moving: !!s.isMoving };
  });

  /** The overworld snapshot, or null while a battle (or a transition) owns the screen. */
  const overworld = async () => { const st = await state(); return st && !st.battle ? st : null; };
  /** The BattleScene snapshot, or null when no battle is running. */
  const battle = async () => { const st = await state(); return st && st.battle ? st : null; };

  async function waitOverworld(timeout = 20000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      const st = await overworld();
      if (st && !st.warping) return st;
      await page.waitForTimeout(250);
    }
    throw new Error('overworld never became active');
  }

  /** Wait for a battle, or for the overworld to stop warping/walking for 3 polls. */
  async function waitSettled(timeout = 25000) {
    const t0 = Date.now(); let quiet = 0;
    while (Date.now() - t0 < timeout) {
      const st = await state();
      if (st && (st.battle || (!st.warping && !st.moving))) { if (++quiet >= 3) return st; } else quiet = 0;
      await page.waitForTimeout(150);
    }
    throw new Error('never settled');
  }

  /** Z through an open text box until it closes or a battle takes over. */
  async function advanceText(maxPresses = 40) {
    for (let i = 0; i < maxPresses; i++) {
      const st = await state();
      if (!st || st.battle || !st.textVisible) return st;
      await tap('KeyZ'); await page.waitForTimeout(350);
    }
    throw new Error('text box never closed');
  }

  // --- movement --------------------------------------------------------------
  /**
   * Turn to face `dir` without stepping. `update()` turns on the frame a NEW
   * direction is pressed and walks from the next one, so this is only safe when
   * the faced tile is solid (a sign, an NPC, a wall) — which is what a runner
   * that is about to press Z wants. Throws if the player moved.
   */
  async function face(dir) {
    const seat = await state();
    for (let i = 0; i < 5; i++) {
      await tap(DIR_KEY[dir]);
      await page.waitForTimeout(250);
      const st = await state();
      if (st.x !== seat.x || st.y !== seat.y) throw new Error(`facing ${dir} stepped off ${seat.x},${seat.y}`);
      if (st.dir === dir) return st;
    }
    throw new Error(`could not turn ${dir}`);
  }

  /** One step: face `dir` if needed, hold until something changes, then settle. */
  async function step(dir) {
    const before = await state();
    if (!before.battle && before.dir !== dir) { await tap(DIR_KEY[dir]); await page.waitForTimeout(150); }
    await page.keyboard.down(DIR_KEY[dir]);
    const t0 = Date.now();
    while (Date.now() - t0 < 3000) {
      const p = await state();
      if (!p || p.battle || p.moving || p.warping || p.x !== before.x || p.y !== before.y
          || (p.textVisible && !before.textVisible)) break;
      await page.waitForTimeout(25);
    }
    await page.keyboard.up(DIR_KEY[dir]);
    return waitSettled();
  }

  /** BFS on the LIVE map (collision, spawned NPCs, ledges and other warps blocked). */
  const pathTo = (x, y) => page.evaluate(([tx, ty]) => {
    const LEDGE = 9;
    const s = window.__claudemon.scene.getScene('OverworldScene'); const m = s.currentMap;
    const npcs = new Set(m.npcs.filter(n => !s.npcSprites || s.npcSprites.has(n.id)).map(n => `${n.x},${n.y}`));
    const warps = new Set(m.warps.map(w => `${w.x},${w.y}`));
    const k = (x, y) => `${x},${y}`;
    const prev = new Map([[k(s.playerGridX, s.playerGridY), null]]);
    const q = [[s.playerGridX, s.playerGridY]];
    while (q.length) {
      const [cx, cy] = q.shift();
      if (cx === tx && cy === ty) break;
      for (const [dx, dy, d] of [[1, 0, 'right'], [-1, 0, 'left'], [0, 1, 'down'], [0, -1, 'up']]) {
        const nx = cx + dx, ny = cy + dy, nk = k(nx, ny);
        if (nx < 0 || ny < 0 || nx >= m.width || ny >= m.height || prev.has(nk)) continue;
        if (m.collision[ny][nx] || npcs.has(nk) || m.tiles[ny][nx] === LEDGE) continue;
        if (warps.has(nk) && !(nx === tx && ny === ty)) continue;
        prev.set(nk, [k(cx, cy), d]); q.push([nx, ny]);
      }
    }
    if (!prev.has(k(tx, ty))) return null;
    const out = []; let cur = k(tx, ty);
    while (prev.get(cur)) { const [p, d] = prev.get(cur); out.unshift(d); cur = p; }
    return out;
  }, [x, y]);

  /** Walk to `x,y` on the current map, replanning after every step. */
  async function walkTo(x, y) {
    let st = await state();
    const startMap = st.map;
    for (let replans = 0, steps = 0; ; steps++) {
      if (st.x === x && st.y === y) return st;
      if (steps > 200) throw new Error(`walkTo ${x},${y}: too many steps`);
      const path = await pathTo(x, y);
      if (!path) throw new Error(`no path from ${st.x},${st.y} to ${x},${y} on ${st.map}`);
      const before = st;
      st = await step(path[0]);
      if (st.battle || st.textVisible || st.map !== startMap) return st;
      const dx = { right: 1, left: -1, up: 0, down: 0 }[path[0]], dy = { down: 1, up: -1, left: 0, right: 0 }[path[0]];
      if (st.x !== before.x + dx || st.y !== before.y + dy) {
        if (++replans > 20) throw new Error(`walkTo ${x},${y}: stuck at ${st.x},${st.y}`);
      }
    }
  }

  // --- map lookups (read the real map data before seeding) ---------------------
  const onEditor = async fn => { await page.goto(`${BASE}/editor.html`); return fn(); };

  /**
   * A walkable tile next to an NPC and the direction that faces it. Snorlax (and
   * the other `tall` sprites) block the tile above and below their own, so those
   * seats are skipped: sitting beside it is what a player would actually do.
   */
  const seatNextToNpc = (mapId, npcId) => onEditor(() => page.evaluate(async ({ mapId, npcId }) => {
    const { ALL_MAPS } = await import('/src/data/maps.ts');
    const map = ALL_MAPS[mapId]; if (!map) throw new Error(`no map ${mapId}`);
    const npc = map.npcs.find(n => n.id === npcId); if (!npc) throw new Error(`no npc ${npcId} on ${mapId}`);
    const tall = npc.id.startsWith('snorlax_');
    for (const [dir, dx, dy] of [['left', 1, 0], ['right', -1, 0], ['up', 0, 1], ['down', 0, -1]]) {
      const x = npc.x + dx, y = npc.y + dy;
      if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue;
      if (map.collision[y][x]) continue;
      if (tall && x === npc.x) continue;             // inside the extended hitbox
      if (map.warps.some(o => o.x === x && o.y === y)) continue;
      if (map.npcs.some(n => n.x === x && n.y === y)) continue;
      return { x, y, dir, npc: { x: npc.x, y: npc.y } };
    }
    throw new Error(`no walkable seat next to ${npcId}`);
  }, { mapId, npcId }));

  /** A walkable tile next to a tile (a sign, a poster) and the direction that faces it. */
  const seatNextToTile = (mapId, tx, ty) => onEditor(() => page.evaluate(async ({ mapId, tx, ty }) => {
    const { ALL_MAPS } = await import('/src/data/maps.ts');
    const map = ALL_MAPS[mapId]; if (!map) throw new Error(`no map ${mapId}`);
    for (const [dir, dx, dy] of [['up', 0, 1], ['down', 0, -1], ['left', 1, 0], ['right', -1, 0]]) {
      const x = tx + dx, y = ty + dy;
      if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue;
      if (map.collision[y][x]) continue;
      if (map.npcs.some(n => n.x === x && n.y === y)) continue;
      return { x, y, dir };
    }
    throw new Error(`no walkable seat next to ${mapId} ${tx},${ty}`);
  }, { mapId, tx, ty }));

  /** A walkable, warp-free, NPC-free tile next to a warp `from` -> `to`. */
  const seatNextToWarp = (from, to) => onEditor(() => page.evaluate(async ({ from, to }) => {
    const { ALL_MAPS } = await import('/src/data/maps.ts');
    const map = ALL_MAPS[from]; if (!map) throw new Error(`no map ${from}`);
    const warps = map.warps.filter(w => w.targetMap === to);
    if (!warps.length) throw new Error(`no warp ${from} -> ${to}`);
    for (const w of warps) for (const [dir, dx, dy] of [['up', 0, 1], ['down', 0, -1], ['left', 1, 0], ['right', -1, 0]]) {
      const x = w.x + dx, y = w.y + dy;
      if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue;
      if (map.collision[y][x]) continue;
      if (map.warps.some(o => o.x === x && o.y === y)) continue;
      if (map.npcs.some(n => n.x === x && n.y === y)) continue;
      return { x, y, dir, warp: { x: w.x, y: w.y } };
    }
    throw new Error(`no walkable seat next to any warp ${from} -> ${to}`);
  }, { from, to }));

  // --- boot ------------------------------------------------------------------
  // seed: { map, x, y, flags?, party?, bag?, badges?, defeated?, rivalName?,
  //         noEncounters? }. `party` is [[speciesId, level, currentHp?], ...].
  // Fields left out keep the new-save defaults, so a runner that cares about the
  // bag must pass one. `noEncounters` zeroes every map's encounter rate, which a
  // runner that walks across live maps needs to stay deterministic.
  async function boot(seed) {
    await page.goto(`${BASE}/editor.html`);
    await page.evaluate(async (seed) => {
      const { SaveSystem } = await import('/src/systems/SaveSystem.ts');
      const { createPokemon } = await import('/src/entities/Pokemon.ts');
      const save = SaveSystem.createNewSave('TEST', seed.rivalName ?? 'RIVAL');
      Object.assign(save.storyFlags, { intro_complete: true, ...seed.flags });
      save.party = (seed.party ?? [[25, 10]]).map(([id, lv, hp]) => {
        const mon = createPokemon(id, lv, 'TEST');
        if (hp !== undefined) mon.currentHp = hp;
        return mon;
      });
      save.currentMap = seed.map; save.playerX = seed.x; save.playerY = seed.y;
      if (seed.bag !== undefined) save.bag = seed.bag;
      if (seed.badges !== undefined) save.badges = seed.badges;
      if (seed.defeated !== undefined) save.defeatedTrainers = seed.defeated;
      SaveSystem.save(save);
    }, seed);
    await page.goto(`${BASE}/index.html`);
    await page.waitForSelector('canvas');
    await page.waitForFunction(() => !!window.__claudemon, null, { timeout: 15000 });
    if (seed.noEncounters) {
      // Same module instance the game uses (dev server, same URL), so this really
      // does turn the rolls off.
      await page.evaluate(async () => {
        const { ALL_MAPS } = await import('/src/data/maps.ts');
        for (const m of Object.values(ALL_MAPS)) for (const k of ['wildEncounters', 'surfEncounters']) if (m[k]) m[k].grassRate = 0;
      });
    }
    // Title: splash -> menu -> CONTINUE (first entry). Press Z until the overworld is live.
    for (let i = 0; i < 12; i++) {
      if (await overworld()) break;
      await tap('KeyZ'); await page.waitForTimeout(700);
    }
    return waitSettled();
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

  return { browser, page, errors, shotDir, tap, shot, state, overworld, battle, waitOverworld,
           waitSettled, advanceText, face, step, walkTo, seatNextToNpc, seatNextToTile,
           seatNextToWarp, boot, record, scenario, finish, results };
}
