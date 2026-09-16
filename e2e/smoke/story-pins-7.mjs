// Story-pins-7 smoke runner: four story writes that nothing else in the suite
// reaches, driven on the real maps through the real UI.
//
//  1. New game straight through the title (no seed at all): the OverworldScene
//     the intro hands over has exactly `intro_complete` in storyFlags, an empty
//     party/bag/badge list and the preset names.
//  2. Healing at the Cerulean POKeMON CENTER: `visited_cerulean_city` is down
//     before the nurse and up after the machine finishes, and that flag alone
//     is what adds CERULEAN CITY to the FLY list.
//  3. A Power Plant fake ball (pp_voltorb1): `picked_up_pp_voltorb1`, the ball
//     sprite gone, and the wild battle's species/level straight from the data.
//  4. Beating the Champion: `champion` is already up while the Hall of Fame
//     credits are on screen, and reading them through puts the player back in
//     player_house at (3,5) with a fully healed party.
import { createRunner, BASE } from '../lib.mjs';

const t = await createRunner('story-pins-7');
const { page } = t;

const TACKLE = 33;

// --- story-pins-7-only scene readers (the rest live in lib.mjs) --------------
/**
 * The save fields lib's snapshot leaves out (names, badges, per-Pokemon HP /
 * status / PP) plus whether the BattleScene has its Pokemon yet. Works in
 * either scene, and is merged onto `t.state()` by `snap()`.
 */
const extra = () => page.evaluate(() => {
  const g = window.__claudemon; if (!g) return {};
  const monsOf = party => (party ?? []).map(m => ({
    species: m.speciesId, level: m.level, hp: m.currentHp, max: m.stats.hp,
    status: m.status ?? 'NONE',
    pp: (m.moves ?? []).map(mv => `${mv.currentPp}/${mv.maxPp}`).join(' '),
  }));
  const b = g.scene.getScene('BattleScene');
  if (b && b.scene.isActive()) {
    const save = b.playerState?.toSave?.();
    return { name: save?.playerName ?? null, rival: save?.rivalName ?? null, badges: save?.badges ?? [],
             mons: monsOf(b.playerState?.party), ready: !!b.playerPokemon };
  }
  const s = g.scene.getScene('OverworldScene');
  if (!s || !s.scene.isActive() || !s.playerState) return {};
  const save = s.playerState.toSave();
  return { name: save.playerName, rival: save.rivalName, badges: save.badges,
           mons: monsOf(save.party), ready: false };
});
const snap = async () => { const st = await t.state(); return st && { ...st, ...(await extra()) }; };

/** The Fly list the game would offer right now, from the live story flags. */
const flyList = () => page.evaluate(async () => {
  const { getAvailableFlyDestinations } = await import('/src/data/flyDestinations.ts');
  const s = window.__claudemon.scene.getScene('OverworldScene');
  return getAvailableFlyDestinations(s.playerState.storyFlags).map(d => d.mapId);
});

/** Poll `snap()` until `pred` holds. */
async function until(pred, timeout = 30000, what = 'condition') {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const st = await snap();
    if (st && pred(st)) return st;
    await page.waitForTimeout(200);
  }
  throw new Error(`timed out waiting for ${what}`);
}

// Only real trainers on the seeded map count as defeated (so no sighting
// interrupts a walk); the ball NPCs are left alone. No has_pikachu: the
// follower would only lengthen the heal animation.
async function boot({ map, x, y, dir, moves = [TACKLE], badges = [], flags = {}, hurt = false }) {
  const mon = { species: 25, level: 40, moves, ...(hurt ? { hp: 1, status: 'POISON', pp: 0 } : {}) };
  let st = await t.boot({
    map, x, y, badges, defeated: 'trainers', noEncounters: true, party: [mon],
    flags: { rival_battle_lab: true, ...flags },
  });
  if (st.map !== map || st.x !== x || st.y !== y) {
    throw new Error(`booted at ${st.map} ${st.x},${st.y}, wanted ${map} ${x},${y}`);
  }
  if (dir) st = await t.face(dir);
  return { ...st, ...(await extra()) };
}

const check = (name, cond, detail = '') => t.record(name, !!cond, detail);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const healed = mons => mons.every(m => m.hp === m.max && m.status === 'NONE' && m.pp.split(' ').every(s => {
  const [cur, max] = s.split('/'); return cur === max;
}));

try {
  // 1. A brand new game, no seed: through the title and Oak's intro ------------
  {
    await page.goto(`${BASE}/index.html`);
    await page.evaluate(() => { try { localStorage.clear(); } catch { /* ignore */ } });
    await page.goto(`${BASE}/index.html`);
    await page.waitForSelector('canvas');
    await page.waitForFunction(() => !!window.__claudemon, null, { timeout: 20000 });
    const hadSave = await page.evaluate(async () => {
      const { SaveSystem } = await import('/src/systems/SaveSystem.ts');
      return SaveSystem.hasSave();
    });
    check('new game: no save exists, so NEW GAME is the only title option', hadSave === false, String(hadSave));
    let st = null;
    for (let i = 0; i < 90 && !st; i++) { await t.tap('KeyZ'); await page.waitForTimeout(320); st = await t.state(); }
    if (!st) throw new Error('the intro never reached the OverworldScene');
    await t.waitSettled();
    st = await snap();
    check('new game: the intro hands over in player_house at (3,5)',
      st.map === 'player_house' && st.x === 3 && st.y === 5, JSON.stringify({ map: st.map, x: st.x, y: st.y }));
    check('new game: storyFlags is exactly { intro_complete: true }',
      same(Object.keys(st.flags).sort(), ['intro_complete']) && st.flags.intro_complete === true,
      JSON.stringify(st.flags));
    check('new game: no party, no bag, no badges',
      st.party.length === 0 && Object.keys(st.bag).length === 0 && st.badges.length === 0,
      JSON.stringify({ party: st.party.length, bag: st.bag, badges: st.badges }));
    check('new game: the preset names are applied', st.name === 'RED' && st.rival === 'BLUE',
      JSON.stringify({ name: st.name, rival: st.rival }));
    await t.shot('1-new-game');
  }

  // 2. The Cerulean POKeMON CENTER nurse ---------------------------------------
  {
    const seat = await t.seatNextToNpc('pokemon_center_cerulean', 'nurse_cerulean');
    let st = await boot({ map: 'pokemon_center_cerulean', x: 4, y: 7, dir: 'up', hurt: true });
    check('Cerulean centre: visited_cerulean_city is down on arrival',
      !st.flags.visited_cerulean_city, JSON.stringify(st.flags));
    check('Cerulean centre: the party is hurt before the nurse', !healed(st.mons), JSON.stringify(st.mons));
    let fly = await flyList();
    check('Cerulean centre: the FLY list does not offer CERULEAN CITY yet',
      !fly.includes('cerulean_city'), JSON.stringify(fly));

    await t.walkTo(seat.x, seat.y);
    await t.face(seat.dir);
    await t.tap('KeyZ'); await page.waitForTimeout(600);
    st = await t.state();
    check('Cerulean centre: the nurse greets the player', st.textVisible, JSON.stringify(st.text));
    await t.shot('2-nurse');
    await t.advanceText();                     // greeting -> the heal machine runs
    st = await until(s => !s.battle && s.flags.visited_cerulean_city, 40000, 'the heal to finish');
    check('Cerulean centre: healing writes visited_cerulean_city',
      st.flags.visited_cerulean_city === true, JSON.stringify(st.flags));
    st = await until(s => !s.warping, 20000, 'the animation to release input');
    check('Cerulean centre: the party comes back fully healed', healed(st.mons), JSON.stringify(st.mons));
    check('Cerulean centre: no other flag was written',
      same(Object.keys(st.flags).sort(), ['intro_complete', 'rival_battle_lab', 'visited_cerulean_city']),
      JSON.stringify(Object.keys(st.flags).sort()));
    fly = await flyList();
    check('Cerulean centre: that flag alone adds CERULEAN CITY to the FLY list',
      fly.includes('cerulean_city'), JSON.stringify(fly));
    await t.advanceText();
  }

  // 3. A Power Plant fake ball --------------------------------------------------
  {
    const seat = await t.seatNextToNpc('power_plant', 'pp_voltorb1');
    const ambush = seat.npc.ambush;
    let st = await boot({ map: 'power_plant', x: 9, y: 18 });
    check('Power Plant: the fake ball is on the floor and has ambush data',
      st.npcs.includes('pp_voltorb1') && !!ambush, JSON.stringify({ npc: st.npcs.includes('pp_voltorb1'), ambush }));
    st = await t.walkTo(seat.x, seat.y);
    await t.face(seat.dir);
    await t.tap('KeyZ'); await page.waitForTimeout(700);
    st = await t.state();
    if (!st.battle && st.textVisible) { await t.advanceText(); await page.waitForTimeout(1200); }
    st = await until(s => s.battle, 20000, 'the ambush battle');
    await t.shot('3-ambush');
    check('Power Plant: springing the ball writes picked_up_pp_voltorb1',
      st.flags.picked_up_pp_voltorb1 === true, JSON.stringify(Object.keys(st.flags).sort()));
    check('Power Plant: the wild Pokemon is the species and level in the data',
      st.species === ambush.speciesId && st.level === ambush.level,
      JSON.stringify({ got: [st.species, st.level], want: [ambush.speciesId, ambush.level] }));
    check('Power Plant: the ball sprite is gone', !st.npcs.includes('pp_voltorb1'), JSON.stringify(st.npcs));
    st = await boot({ map: 'power_plant', x: 9, y: 18, flags: { picked_up_pp_voltorb1: true } });
    check('Power Plant re-entry: the flag alone keeps the sprung ball hidden',
      !st.npcs.includes('pp_voltorb1') && st.npcs.includes('pp_voltorb2'), JSON.stringify(st.npcs));
  }

  // 4. The Champion and the Hall of Fame ----------------------------------------
  {
    let st = await boot({ map: 'indigo_plateau', x: 10, y: 19, hurt: true });
    check('Champion: the champion flag is down before the fight', !st.flags.champion, JSON.stringify(st.flags));
    // The fight itself is 6 full battles; the run drives the Champion's own
    // end-of-battle branch instead (trainerId === CHAMPION.id -> Hall of Fame).
    await page.evaluate(async () => {
      const { CHAMPION } = await import('/src/data/eliteFour.ts');
      const s = window.__claudemon.scene.getScene('OverworldScene');
      s.scene.start('BattleScene', {
        type: 'trainer', trainerId: CHAMPION.id, trainerName: s.playerState.rivalName,
        trainerClass: 'Champion', playerState: s.playerState.toSave(),
        returnMap: s.currentMap.id, returnX: s.playerGridX, returnY: s.playerGridY,
      });
    });
    st = await until(s => s.battle && s.ready, 25000, 'the Champion battle');
    check('Champion: the battle is against the Champion team, champion still down',
      st.flags.champion !== true, JSON.stringify(Object.keys(st.flags).sort()));
    await page.evaluate(() => { window.__claudemon.scene.getScene('BattleScene').endBattle(); });
    st = await until(s => s.battle && s.flags.champion === true, 25000, 'the Hall of Fame');
    check('Champion: beating the Champion writes champion while the credits run',
      st.flags.champion === true, JSON.stringify(Object.keys(st.flags).sort()));
    await t.shot('4-hall-of-fame');
    for (let i = 0; i < 60; i++) {
      const s = await t.state();
      if (s && !s.battle && s.map === 'player_house') break;
      await t.tap('KeyZ'); await page.waitForTimeout(320);
    }
    await until(s => !s.battle && s.map === 'player_house', 25000, 'the trip home');
    await t.waitSettled();
    st = await snap();
    check('Champion: the player comes back to player_house at (3,5)',
      st.map === 'player_house' && st.x === 3 && st.y === 5, JSON.stringify({ map: st.map, x: st.x, y: st.y }));
    check('Champion: the party is fully healed on the way home', healed(st.mons), JSON.stringify(st.mons));
    check('Champion: champion is still up after the return', st.flags.champion === true, JSON.stringify(st.flags));
    const gate = await page.evaluate(async () => {
      const { checkEntryGates } = await import('/src/logic/warpGate.ts');
      const { ALL_MAPS } = await import('/src/data/maps.ts');
      const p = window.__claudemon.scene.getScene('OverworldScene').playerState;
      const cave = ALL_MAPS['cerulean_cave_1f'];
      const live = {
        storyFlags: p.storyFlags, badges: p.badges, defeatedTrainers: p.defeatedTrainers,
        hasItem: id => p.hasItem(id),
      };
      const shutState = { storyFlags: {}, badges: [], defeatedTrainers: [], hasItem: () => false };
      return {
        open: checkEntryGates(cave, 'cerulean_city', live).ok,
        shut: checkEntryGates(cave, 'cerulean_city', shutState).ok,
      };
    });
    check('Champion: the flag is the one the Cerulean Cave gate reads',
      gate.open === true && gate.shut === false, JSON.stringify(gate));
  }
} catch (e) {
  check('the run completed without an error', false, `ERROR ${e.message}`);
}

await t.finish();
