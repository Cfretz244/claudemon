// Story-pins-6 smoke runner: the story writes behind item-ball pickup, the
// fossil pair, the CUT-tree flag and the Vermilion Gym gate, driven on the real
// maps through the real UI.
//
//  1. An ordinary route item ball (Route 24 NUGGET): the found text, the bag,
//     `picked_up_<id>`, the sprite gone — and still gone on a fresh entry.
//  2. Mt. Moon's HELIX FOSSIL: `got_fossil` plus the DOME ball taken off the
//     floor with it (and both still gone on a fresh entry).
//  3. Silph Co 5F CARD KEY: `has_card_key` is derived on the spot and the door
//     that reads it opens, so the player can walk straight through it.
//  4. Route 2 CUT tree: `cut_route2_12_13` written when the tile turns to
//     grass, and the tile still grass on a fresh entry.
//  5. Vermilion Gym trash cans: empty -> first lock -> second lock (the
//     `surge_gate_open` flag is up while the "electric gate opened" text is
//     still on screen), the fence row gone, and every later can reading the
//     silent empty-can line.
//
// The puzzle's switch positions are random per boot, so they are read from the
// scene and never printed: two runs diff to nothing.
import { createRunner } from '../lib.mjs';

const t = await createRunner('story-pins-6');
const { page } = t;

const CUT = 15, TACKLE = 33;
const GRASS = 0, FLOOR = 12, FENCE = 10, CUT_TREE = 20, COUNTER = 13, GATE = 36;

// --- story-pins-6-only scene readers (the rest live in lib.mjs) --------------
const tileAt = (x, y) => page.evaluate(([x, y]) => {
  const m = window.__claudemon.scene.getScene('OverworldScene').currentMap;
  return { tile: m.tiles[y][x], solid: !!m.collision[y][x] };
}, [x, y]);
/** The tile the player is facing right now. */
const faced = () => page.evaluate(() => {
  const s = window.__claudemon.scene.getScene('OverworldScene');
  const vec = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[s.playerDirection] ?? [0, 0];
  return s.currentMap?.tiles?.[s.playerGridY + vec[1]]?.[s.playerGridX + vec[0]] ?? null;
});
/** Row 5 of the gym: the fence the solved puzzle removes. */
const fenceRow = () => page.evaluate(() => {
  const m = window.__claudemon.scene.getScene('OverworldScene').currentMap;
  return m.tiles[5].map((tile, x) => [tile, !!m.collision[5][x]]);
});
/** The puzzle's own switch positions (random per boot — read, never printed). */
const surgeSwitches = () => page.evaluate(() => {
  const p = window.__claudemon.scene.getScene('OverworldScene').surgePuzzle;
  return { first: p?.firstSwitch ?? null, second: p?.secondSwitch ?? null, cans: (p?.cans ?? []).slice() };
});
/** The option labels the party screen is showing (the field-move list). */
const partyOptions = () => page.evaluate(() =>
  (window.__claudemon.scene.getScene('OverworldScene').partyScreen?.currentOptionLabels ?? []).slice());

// Every NPC on the seeded map counts as defeated, so no sighting interrupts the
// walk (it is also what makes the Mt. Moon fossils visible at all: the fossil
// nerd has to be beaten first). No has_pokedex, so POKeMON is the first
// start-menu entry.
async function boot({ map, x, y, dir, moves = [TACKLE], badges = [], flags = {} }) {
  let st = await t.boot({
    map, x, y, badges, defeated: 'all', noEncounters: true,
    party: [{ species: 25, level: 40, moves }],
    flags: { has_pikachu: true, rival_battle_lab: true, ...flags },
  });
  if (st.map !== map || st.x !== x || st.y !== y) {
    throw new Error(`booted at ${st.map} ${st.x},${st.y}, wanted ${map} ${x},${y}`);
  }
  if (dir) st = await t.face(dir);
  return st;
}

// --- the party-menu entry point (field moves) --------------------------------
async function openPartyOptions() {
  await t.tap('Enter'); await page.waitForTimeout(400);
  await t.tap('KeyZ'); await page.waitForTimeout(600);   // POKeMON (first entry: no POKeDEX yet)
  await t.tap('KeyZ'); await page.waitForTimeout(500);   // the first party Pokemon -> options
  return partyOptions();
}
async function useFieldMove(label) {
  const options = await openPartyOptions();
  const i = options.indexOf(label);
  if (i < 0) { for (let k = 0; k < 3; k++) { await t.tap('KeyX'); await page.waitForTimeout(300); } return { offered: false, options }; }
  for (let k = 0; k < i; k++) { await t.tap('ArrowDown'); await page.waitForTimeout(200); }
  await t.tap('KeyZ'); await page.waitForTimeout(800);
  return { offered: true, options };
}
/** Face `dir` and press Z; returns the state with the text still up. */
async function pressZ(dir) {
  if (dir) await t.face(dir);
  await t.tap('KeyZ'); await page.waitForTimeout(700);
  return t.state();
}

const check = (name, cond, detail = '') => t.record(name, !!cond, detail);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

try {
  // 1. An ordinary route item ball: Route 24's NUGGET ---------------------------
  {
    let st = await boot({ map: 'route24', x: 6, y: 3, dir: 'up' });
    check('Route 24: the NUGGET ball is on the floor before it is taken',
      st.npcs.includes('route24_nugget') && !st.flags.picked_up_route24_nugget, JSON.stringify(st.npcs));
    st = await pressZ();
    check('Route 24 ball: "TEST found\\nNUGGET!"', same(st.text, ['TEST found\nNUGGET!']), JSON.stringify(st.text));
    check('Route 24 ball: nothing is applied while the text is still up',
      !st.flags.picked_up_route24_nugget && !st.bag.nugget, JSON.stringify(st.bag));
    await t.shot('1-nugget-text');
    await t.advanceText(); await page.waitForTimeout(400); st = await t.state();
    check('Route 24 ball: the NUGGET is in the bag', st.bag.nugget === 1, JSON.stringify(st.bag));
    check('Route 24 ball: picked_up_route24_nugget is the only new story flag',
      st.flags.picked_up_route24_nugget === true && !st.flags.got_fossil, JSON.stringify(st.flags));
    check('Route 24 ball: the sprite is gone', !st.npcs.includes('route24_nugget'), JSON.stringify(st.npcs));
    await t.shot('1-nugget-gone');

    // A fresh entry with only the flag seeded: shouldSkipNPC() keeps it hidden.
    st = await boot({ map: 'route24', x: 6, y: 3, dir: 'up', flags: { picked_up_route24_nugget: true } });
    check('Route 24 re-entry: the ball is still gone', !st.npcs.includes('route24_nugget'), JSON.stringify(st.npcs));
    st = await pressZ();
    check('Route 24 re-entry: Z at the empty tile says nothing', !st.textVisible && !st.bag.nugget,
      JSON.stringify({ text: st.text, bag: st.bag }));
  }

  // 2. Mt. Moon: one fossil takes the other off the floor -----------------------
  {
    let st = await boot({ map: 'mt_moon_b2f', x: 9, y: 9, dir: 'up' });
    check('Mt. Moon B2F: both fossil balls are out with the nerd beaten',
      st.npcs.includes('mt_moon_helix_fossil') && st.npcs.includes('mt_moon_dome_fossil'), JSON.stringify(st.npcs));
    st = await pressZ();
    check('Mt. Moon helix: "TEST found\\nHELIX FOSSIL!"', same(st.text, ['TEST found\nHELIX FOSSIL!']), JSON.stringify(st.text));
    await t.shot('2-helix-text');
    await t.advanceText(); await page.waitForTimeout(400); st = await t.state();
    check('Mt. Moon helix: the HELIX FOSSIL is in the bag and the DOME is not',
      st.bag.helix_fossil === 1 && !st.bag.dome_fossil, JSON.stringify(st.bag));
    check('Mt. Moon helix: picked_up_mt_moon_helix_fossil + got_fossil are set',
      st.flags.picked_up_mt_moon_helix_fossil === true && st.flags.got_fossil === true, JSON.stringify(st.flags));
    check('Mt. Moon helix: the dome ball is NOT marked picked up',
      !st.flags.picked_up_mt_moon_dome_fossil, JSON.stringify(st.flags));
    check('Mt. Moon helix: both fossil sprites are gone',
      !st.npcs.includes('mt_moon_helix_fossil') && !st.npcs.includes('mt_moon_dome_fossil'), JSON.stringify(st.npcs));
    await t.shot('2-fossils-gone');

    st = await boot({ map: 'mt_moon_b2f', x: 9, y: 9, dir: 'up',
      flags: { picked_up_mt_moon_helix_fossil: true, got_fossil: true } });
    check('Mt. Moon re-entry: got_fossil keeps BOTH balls hidden',
      !st.npcs.includes('mt_moon_helix_fossil') && !st.npcs.includes('mt_moon_dome_fossil'), JSON.stringify(st.npcs));
  }

  // 3. Silph Co 5F: the CARD KEY opens the door that reads has_card_key ---------
  {
    let st = await boot({ map: 'silph_co_5f', x: 11, y: 4, dir: 'up' });
    let gate = await tileAt(12, 1);
    check('Silph 5F: the door is a closed GATE before the key',
      gate.tile === GATE && gate.solid && !st.flags.has_card_key, JSON.stringify({ gate, has: st.flags.has_card_key }));
    st = await pressZ();
    check('Silph 5F ball: "TEST found\\nCARD KEY!"', same(st.text, ['TEST found\nCARD KEY!']), JSON.stringify(st.text));
    await t.shot('3-cardkey-text');
    await t.advanceText(); await page.waitForTimeout(400); st = await t.state();
    check('Silph 5F ball: the CARD KEY is in the bag and picked_up is set',
      st.bag.card_key === 1 && st.flags.picked_up_silph_5f_card_key === true, JSON.stringify({ bag: st.bag }));
    check('Silph 5F ball: has_card_key was derived on the spot', st.flags.has_card_key === true, JSON.stringify(st.flags));
    gate = await tileAt(12, 1);
    check('Silph 5F ball: the door opened without a map reload',
      gate.tile === FLOOR && !gate.solid, JSON.stringify(gate));
    await t.shot('3-door-open');
    await t.walkTo(11, 1);
    st = await t.step('right');
    check('Silph 5F: the player walks straight through the opened door, no message',
      st.map === 'silph_co_5f' && st.x === 12 && st.y === 1 && !st.textVisible, JSON.stringify(st));
  }

  // 4. Route 2: cutting a tree writes cut_route2_12_13 --------------------------
  {
    let st = await boot({ map: 'route2', x: 11, y: 13, dir: 'right', moves: [CUT], badges: ['CASCADE'] });
    let tile = await faced();
    check('Route 2: seeded facing the CUT_TREE', tile === CUT_TREE, JSON.stringify({ faced: tile }));
    check('Route 2: no cut flag before cutting',
      !Object.keys(st.flags).some(k => k.startsWith('cut_')), JSON.stringify(Object.keys(st.flags).filter(k => k.startsWith('cut_'))));
    const used = await useFieldMove('CUT');
    st = await t.state();
    check('Route 2: the party menu offers CUT', used.offered, JSON.stringify(used.options));
    check('Route 2: "Used CUT!"', same(st.text, ['Used CUT!']), JSON.stringify(st.text));
    await t.shot('4-used-cut');
    await t.advanceText(); await page.waitForTimeout(400); st = await t.state();
    tile = await faced();
    check('Route 2: the tree became walkable grass', tile === GRASS, JSON.stringify({ faced: tile }));
    check('Route 2: cut_route2_12_13 is the flag written',
      same(Object.keys(st.flags).filter(k => k.startsWith('cut_')), ['cut_route2_12_13']),
      JSON.stringify(Object.keys(st.flags).filter(k => k.startsWith('cut_'))));
    await t.shot('4-tree-cut');

    st = await boot({ map: 'route2', x: 11, y: 13, dir: 'right', moves: [CUT], badges: ['CASCADE'],
      flags: { cut_route2_12_13: true } });
    const cut = await tileAt(12, 13);
    check('Route 2 re-entry: the flag alone keeps the tile cut',
      await faced() === GRASS && cut.tile === GRASS && !cut.solid, JSON.stringify(cut));
    st = await t.step('right');
    check('Route 2 re-entry: the player can walk onto the cut tile',
      st.x === 12 && st.y === 13, JSON.stringify({ x: st.x, y: st.y }));
  }

  // 5. Vermilion Gym: the trash-can puzzle and surge_gate_open ------------------
  {
    const EMPTY = ["There's nothing in\nthe trash can."];
    let st = await boot({ map: 'vermilion_gym', x: 4, y: 13 });
    check('Vermilion Gym: surge_gate_open is unset on arrival', !st.flags.surge_gate_open, JSON.stringify(st.flags.surge_gate_open ?? null));
    let row = await fenceRow();
    check('Vermilion Gym: the fence row is up before the puzzle',
      row.filter(([tile, solid]) => tile === FENCE && solid).length === 8, JSON.stringify(row));
    await t.shot('5-fence-up');

    const { first, second, cans } = await surgeSwitches();
    if (!first || !second) throw new Error('the puzzle placed no switches');
    const key = ([x, y]) => `${x},${y}`;
    const plain = cans.find(c => key(c) !== key(first) && key(c) !== key(second));
    if (!plain) throw new Error('no non-switch can to read');
    /** Stand in the aisle below a can and press Z at it. */
    const readCan = async ([cx, cy]) => {
      const tile = await tileAt(cx, cy);
      if (tile.tile !== COUNTER) throw new Error(`the can at the puzzle position is not a COUNTER tile (${tile.tile})`);
      await t.walkTo(cx, cy + 1);
      return pressZ('up');
    };

    st = await readCan(plain);
    check('Vermilion Gym: a can with no switch is empty', same(st.text, EMPTY), JSON.stringify(st.text));
    check('Vermilion Gym: an empty can does not open the gate', !st.flags.surge_gate_open, 'flag set');
    await t.advanceText(); await page.waitForTimeout(300);

    st = await readCan(first);
    check('Vermilion Gym: the first switch shows the first-lock script', same(st.text, [
      "Hey! There's a\nswitch under the", 'trash! Turn it on!', 'The first lock was\nopened!',
    ]), JSON.stringify(st.text));
    check('Vermilion Gym: the first lock does not open the gate', !st.flags.surge_gate_open, 'flag set');
    await t.shot('5-first-lock');
    await t.advanceText(); await page.waitForTimeout(300);

    st = await readCan(second);
    check('Vermilion Gym: the second switch shows the second-lock script', same(st.text, [
      "Hey! There's another\nswitch under the", 'trash! Turn it on!',
      'The second lock was\nopened!', 'The electric gate\nopened!',
    ]), JSON.stringify(st.text));
    check('Vermilion Gym: surge_gate_open is already set while the text is still up',
      st.flags.surge_gate_open === true, 'flag not set before the text');
    row = await fenceRow();
    check('Vermilion Gym: the fence is still there until the text is read through',
      row.filter(([tile]) => tile === FENCE).length === 8, JSON.stringify(row));
    await t.shot('5-second-lock');
    await t.advanceText(); await page.waitForTimeout(600);
    row = await fenceRow();
    check('Vermilion Gym: the fence row is gone once the text closes',
      row.filter(([tile]) => tile === FENCE).length === 0 && row.slice(1, 9).every(([tile, solid]) => tile === FLOOR && !solid),
      JSON.stringify(row));
    await t.shot('5-fence-gone');

    st = await readCan(first);
    check('Vermilion Gym: with the gate open every can is just a can again', same(st.text, EMPTY), JSON.stringify(st.text));
    await t.advanceText(); await page.waitForTimeout(300);
    await t.walkTo(4, 6);
    st = await t.step('up');   // a held key can carry the player a second tile
    check('Vermilion Gym: the player walks through where the fence was',
      st.map === 'vermilion_gym' && st.x === 4 && st.y <= 5, JSON.stringify({ x: st.x, y: st.y }));

    st = await boot({ map: 'vermilion_gym', x: 4, y: 13, flags: { surge_gate_open: true } });
    row = await fenceRow();
    check('Vermilion Gym re-entry: the flag alone removes the fence on load',
      row.filter(([tile]) => tile === FENCE).length === 0, JSON.stringify(row));
    const sw = await surgeSwitches();
    check('Vermilion Gym re-entry: the puzzle is not even set up', !sw.first && !sw.second, JSON.stringify(sw));
    st = await readCan([2, 7]);
    check('Vermilion Gym re-entry: a can reads the empty line, no script', same(st.text, EMPTY), JSON.stringify(st.text));
    await t.advanceText();
  }
} catch (e) {
  check('the run completed without an error', false, `ERROR ${e.message}`);
}

await t.finish();
