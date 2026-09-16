// Story-misc smoke runner: the three story triggers pinned by "Story pins 5" —
// the two sleeping Snorlax (POKe FLUTE), the Game Corner poster switch (and the
// Rocket Hideout stairs it unlocks), and the Marowak ghost on the stairs into
// Pokemon Tower 7F.
//
// Each scenario seeds a save next to the thing, boots, interacts (Z at an NPC or
// a sign, or one step into a warp) and asserts on REAL scene state: the exact
// text shown, the story flags, and — when a battle starts — the opponent's
// species and level read off BattleScene.
import { createRunner, DIR_KEY } from '../lib.mjs';

const t = await createRunner('story-misc');
const { page } = t;

/** Live maps everywhere here, so every boot turns the encounter rolls off. */
const boot = seed => t.boot({
  party: [[25, 30]], bag: {}, badges: [], defeated: [], noEncounters: true,
  ...seed,
  flags: { has_pikachu: true, ...seed.flags },
});

const same = (got, want) => JSON.stringify(got) === JSON.stringify(want);
const checkText = (got, want) =>
  same(got, want) ? '' : `expected text ${JSON.stringify(want)}, got ${JSON.stringify(got)}`;
const record = (name, detail) => t.record(name, !detail, detail);

const ASLEEP = [
  'A huge POKeMON is\nblocking the path!',
  "It's sleeping soundly...",
  'Zzz... Zzz...',
  'Maybe a melody could\nwake it up?',
];
const wake = name => [`${name} used the\nPOKe FLUTE!`, 'SNORLAX woke up!\nIt looks angry!'];
const GHOST = [
  "The SILPH SCOPE\nreveals the GHOST's\ntrue identity!",
  "It's the restless\nspirit of MAROWAK!",
];

/** Step off `seat` into the warp/tile it faces. */
async function stepInto(dir) {
  await t.tap(DIR_KEY[dir]); await page.waitForTimeout(200);
  await page.keyboard.down(DIR_KEY[dir]); await page.waitForTimeout(700); await page.keyboard.up(DIR_KEY[dir]);
  await page.waitForTimeout(1200);
}

// --- 1. the two Snorlax ------------------------------------------------------
/** Face a Snorlax, press Z, assert the script and (with the flute) the battle. */
async function snorlaxScenario(name, mapId, npcId, { flute }) {
  const slug = name.replace(/\W+/g, '_');
  let detail = '';
  try {
    const seat = await t.seatNextToNpc(mapId, npcId);
    let st = await boot({ map: mapId, x: seat.x, y: seat.y, bag: flute ? { poke_flute: 1 } : {} });
    if (st.map !== mapId || st.x !== seat.x || st.y !== seat.y) {
      throw new Error(`seeded at ${mapId} ${seat.x},${seat.y} but booted at ${st.map} ${st.x},${st.y}`);
    }
    if (st.flags[`${npcId}_cleared`]) throw new Error('seeded already cleared');
    await t.tap(DIR_KEY[seat.dir]); await page.waitForTimeout(250);
    await t.tap('KeyZ'); await page.waitForTimeout(700);
    st = await t.state();
    await t.shot(slug);
    detail = checkText(st.textVisible ? st.text : [], flute ? wake('TEST') : ASLEEP);
    if (!detail) {
      st = await t.advanceText();
      if (st && !st.battle) { await page.waitForTimeout(1500); st = await t.state(); }
      await t.shot(`${slug}_after`);
      if (flute) {
        if (!st.battle) detail = `expected a wild battle, still on ${st.map} ${st.x},${st.y}`;
        else if (st.species !== 143 || st.level !== 30) detail = `expected SNORLAX(143) Lv30, got species ${st.species} Lv${st.level}`;
        else if (st.trainerId) detail = `expected a wild battle, got trainer ${st.trainerId}`;
        else if (!st.flags[`${npcId}_cleared`]) detail = `${npcId}_cleared not set when the battle started`;
      } else {
        if (st.battle) detail = `expected no battle, got species ${st.species}`;
        else if (st.flags[`${npcId}_cleared`]) detail = `${npcId}_cleared set without the flute`;
        else if (st.x !== seat.x || st.y !== seat.y) detail = `expected to stay at ${seat.x},${seat.y}, got ${st.x},${st.y}`;
      }
    }
  } catch (e) { detail = `ERROR ${e.message}`; }
  record(name, detail);
}

for (const [mapId, npcId] of [['route12', 'snorlax_route12'], ['route16', 'snorlax_route16']]) {
  await snorlaxScenario(`${npcId} without the POKe FLUTE: only the sleeping script, no battle`, mapId, npcId, { flute: false });
  await snorlaxScenario(`${npcId} with the POKe FLUTE: wakes into a Lv30 SNORLAX and sets its flag`, mapId, npcId, { flute: true });
}

// --- 2. the Game Corner poster ------------------------------------------------
async function posterScenario(name, seed, expect) {
  const slug = name.replace(/\W+/g, '_');
  let detail = '';
  try {
    const seat = await t.seatNextToTile('game_corner', 11, 2);
    await boot({ ...seed, map: 'game_corner', x: seat.x, y: seat.y });
    await t.face(seat.dir);                 // the poster is a solid SIGN tile: turning is safe
    await t.tap('KeyZ'); await page.waitForTimeout(700);
    let st = await t.state();
    await t.shot(slug);
    detail = checkText(st.textVisible ? st.text : [], expect.text);
    if (!detail) {
      st = await t.advanceText();
      const got = !!st.flags['game_corner_poster_found'];
      if (got !== expect.flag) detail = `expected game_corner_poster_found=${expect.flag} after reading, got ${got}`;
    }
  } catch (e) { detail = `ERROR ${e.message}`; }
  record(name, detail);
}

await posterScenario('Game Corner poster with the guard still standing: just a poster, no flag',
  { defeated: [] }, { text: ['A poster for a GAME\nCORNER tournament...'], flag: false });
await posterScenario('Game Corner poster with the guard beaten: the switch is found and the flag is set',
  { defeated: ['game_corner_poster_rocket'] },
  { text: ["There's a switch\nbehind the poster!", 'A hidden staircase\nappeared!'], flag: true });
await posterScenario('Game Corner poster once found: the stairs line, flag untouched',
  { defeated: ['game_corner_poster_rocket'], flags: { game_corner_poster_found: true } },
  { text: ['The hidden stairs\nlead underground...'], flag: true });

// The flag is what the Rocket Hideout stairs read: same seed, one step onto the
// warp, with and without it.
async function hideoutStairsScenario(name, seed, expect) {
  const slug = name.replace(/\W+/g, '_');
  let detail = '';
  try {
    const seat = await t.seatNextToWarp('game_corner', 'rocket_hideout_b1f');
    await boot({ ...seed, map: 'game_corner', x: seat.x, y: seat.y });
    await stepInto(seat.dir);
    const st = await t.waitSettled();
    await t.shot(slug);
    if (st.map !== expect.map) detail = `expected to be on ${expect.map}, got ${st.map} (text ${JSON.stringify(st.text)})`;
    else if (!same(st.textVisible ? st.text : [], expect.text ?? [])) detail = checkText(st.text, expect.text ?? []);
  } catch (e) { detail = `ERROR ${e.message}`; }
  record(name, detail);
}

await hideoutStairsScenario('Rocket Hideout stairs without the poster flag: silently shut',
  { defeated: ['game_corner_poster_rocket'] }, { map: 'game_corner' });
await hideoutStairsScenario('Rocket Hideout stairs with the poster flag: open',
  { defeated: ['game_corner_poster_rocket'], flags: { game_corner_poster_found: true } },
  { map: 'rocket_hideout_b1f' });

// --- 3. the Marowak ghost on the 7F stairs ------------------------------------
// The warp LANDS first: the reveal runs on 7F, the battle is fought from there,
// and `marowak_ghost_defeated` is written by BattleScene only on a win or a
// catch — so it is still down when the battle starts. (This check used to pin
// the opposite, pre-fix behaviour: flag on entry, battle back on 6F.)
async function marowakScenario(name, seed, expect) {
  const slug = name.replace(/\W+/g, '_');
  let detail = '';
  try {
    const seat = await t.seatNextToWarp('pokemon_tower_6f', 'pokemon_tower_7f');
    await boot({
      ...seed, map: 'pokemon_tower_6f', x: seat.x, y: seat.y,
      bag: { silph_scope: 1 },
      // The 7F Rockets and Jessie are out of the way for this check.
      flags: { tower_rockets_cleared: true, ...(seed.flags ?? {}) },
      defeated: ['tower_trainer5', 'tower_trainer8', 'tower_rocket1', 'tower_rocket2', 'jessie_tower'],
    });
    await stepInto(seat.dir);
    let st = await t.state();
    await t.shot(slug);
    if (!st.battle && st.map !== 'pokemon_tower_7f') {
      detail = `expected the warp to land on pokemon_tower_7f, got ${st.map}`;
    } else {
      detail = checkText(st.battle ? [] : (st.textVisible ? st.text : []), expect.text);
    }
    if (!detail) {
      st = await t.advanceText();
      if (st && !st.battle) { await page.waitForTimeout(1500); st = await t.waitSettled(); }
      await t.shot(`${slug}_after`);
      if (expect.battle) {
        if (!st.battle) detail = `expected a wild battle, ended on ${st.map} ${st.x},${st.y}`;
        else if (st.species !== 105 || st.level !== 30) detail = `expected MAROWAK(105) Lv30, got species ${st.species} Lv${st.level}`;
        else if (st.trainerId) detail = `expected a wild battle, got trainer ${st.trainerId}`;
        else if (st.flags['marowak_ghost_defeated']) detail = 'marowak_ghost_defeated set before the battle was won';
        else if (st.returnMap !== 'pokemon_tower_7f') detail = `expected the battle to return to 7F, got ${st.returnMap}`;
      } else {
        if (st.battle) detail = `expected no battle, got species ${st.species}`;
        else if (st.map !== 'pokemon_tower_7f') detail = `expected to be on pokemon_tower_7f, got ${st.map}`;
      }
    }
  } catch (e) { detail = `ERROR ${e.message}`; }
  record(name, detail);
}

await marowakScenario('First entry into Pokemon Tower 7F: the player lands on 7F, the ghost is revealed and a Lv30 MAROWAK attacks',
  {}, { text: GHOST, battle: true });
await marowakScenario('Second entry (marowak_ghost_defeated set): the stairs just warp',
  { flags: { marowak_ghost_defeated: true } }, { text: [], battle: false });

await t.finish();
