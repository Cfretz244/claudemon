// Oak's lab rival ambush: LOSING the first rival battle must end the encounter.
//
// Gen I: the lab fight happens once, win or lose. The flag `rival_battle_lab`
// used to be derived from `defeatedTrainers` only, so a LOST battle whited the
// player out with the flag still unset and the ambush fired again every time
// they tried to leave the lab.
//
// One boot, one long scenario (the whole point is what survives a whiteout):
//   1. stand next to the lab's door warp, step on it -> the rival's three lines
//      -> the battle. Read `rival_battle_lab` AT BATTLE START.
//   2. lose (Lv1 MAGIKARP with 1 HP) -> whiteout to player_house.
//   3. walk back house -> pallet_town -> lab, step on the door warp again:
//      it must warp instead of re-ambushing.
//   4. talk to the rival in the lab: his post-battle line, not the challenge.
import { createRunner, DIR_KEY } from '../lib.mjs';

const t = await createRunner('lab-rival-reambush');
const { page } = t;

const LAB = 'oaks_lab', HOUSE = 'player_house', TOWN = 'pallet_town';
const INSIDE = { x: 4, y: 10 };    // the floor tile above the lab's exit warp
const RIVAL_SPOT = { x: 7, y: 5 }; // stand here, face left, talk to the rival at 6,5

const at = st => !st ? 'null' : st.battle ? `BATTLE ${st.trainerId} vs ${st.species}`
  : `${st.map} ${st.x},${st.y}${st.textVisible ? ' text=' + JSON.stringify(st.text) : ''}`;

/** Coordinates of the warp on the current map that leads to `target`. */
const warpOn = target => page.evaluate(target => {
  const m = window.__claudemon.scene.getScene('OverworldScene').currentMap;
  const w = m.warps.find(w => w.targetMap === target);
  return w ? { x: w.x, y: w.y } : null;
}, target);

async function takeWarp(target) {
  const w = await warpOn(target);
  if (!w) throw new Error(`no warp to ${target} on this map`);
  // Coming out of a door leaves the player standing ON the return warp; walkTo
  // would then be a no-op, so step off it first.
  let st = await t.state();
  for (const dir of ['down', 'up', 'left', 'right']) {
    if (st.x !== w.x || st.y !== w.y) break;
    const next = await t.step(dir);
    if (next.map === st.map) st = next;
  }
  return t.walkTo(w.x, w.y);
}

/** Mash Z until the battle is over and the overworld is idle (the party loses). */
async function loseBattle() {
  const t0 = Date.now();
  while (Date.now() - t0 < 120000) {
    const st = await t.state();
    if (st && !st.battle && !st.textVisible && !st.warping && !st.moving) return st;
    await t.tap('KeyZ'); await page.waitForTimeout(400);
  }
  throw new Error('battle never ended');
}

/** Walk back from wherever the player is to the lab floor tile above the door. */
async function returnToLabDoor() {
  let st = await t.state();
  if (st.map === HOUSE) st = await takeWarp(TOWN);
  if (st.map === TOWN) st = await takeWarp(LAB);
  if (st.map !== LAB) throw new Error(`could not get back to the lab (at ${st.map})`);
  return t.walkTo(INSIDE.x, INSIDE.y);
}

try {
  // A Lv1 MAGIKARP on 1 HP: the rival's Lv5 EEVEE ends it in one turn.
  let st = await t.boot({
    map: LAB, x: INSIDE.x, y: INSIDE.y, flags: { has_pikachu: true },
    party: [[129, 1, 1]], defeated: [], noEncounters: true,
  });
  t.record('boot: in the lab above the door, ambush armed',
    st.map === LAB && st.x === INSIDE.x && st.y === INSIDE.y
    && !st.flags.rival_battle_lab && st.party.length === 1, at(st));

  // 1. step on the door warp: the rival intercepts.
  st = await t.step('down');
  t.record('stepping on the door warp fires the rival ambush (no warp)',
    st.map === LAB && st.textVisible, at(st));
  await t.advanceText();
  st = await t.waitSettled();
  t.record('the rival_lab battle starts', st.battle && st.trainerId === 'rival_lab', at(st));
  await t.shot('1-battle-start');
  // The flag is written as the battle launches, so it is inside the snapshot
  // BattleScene holds — and therefore survives the whiteout.
  t.record('rival_battle_lab is set AT BATTLE START',
    !!st.battle && st.flags.rival_battle_lab === true, `flags=${JSON.stringify(st.flags)}`);

  // 2. lose it.
  st = await loseBattle();
  await t.shot('2-whiteout');
  t.record("losing whites out to the player's house", st.map === HOUSE, at(st));
  t.record('the rival is NOT in defeatedTrainers (the player lost)',
    !st.defeated.includes('rival_lab'), JSON.stringify(st.defeated));
  t.record('rival_battle_lab survived the whiteout', st.flags.rival_battle_lab === true,
    `flags=${JSON.stringify(st.flags)}`);

  // 3. walk back and try to leave the lab again.
  st = await returnToLabDoor();
  t.record('walked back to the lab door tile',
    st.map === LAB && st.x === INSIDE.x && st.y === INSIDE.y, at(st));
  st = await t.step('down');
  await t.shot('3-second-exit');
  t.record('after the loss the door warp goes through to PALLET TOWN (no re-ambush)',
    st.map === TOWN, at(st));

  // 4. and the rival himself gives his post-battle line.
  if (st.textVisible) { await t.advanceText(); st = await t.waitSettled(); }
  if (st.battle) st = await loseBattle();
  await returnToLabDoor();
  await t.walkTo(RIVAL_SPOT.x, RIVAL_SPOT.y);
  await t.tap(DIR_KEY.left); await page.waitForTimeout(200);
  await t.tap('KeyZ'); await page.waitForTimeout(600);
  st = await t.state();
  await t.shot('4-rival-line');
  t.record('talking to the rival after a LOSS gives his post-battle line',
    !!st.textVisible && /stronger and beat/.test((st.text ?? []).join(' ')), at(st));
} catch (e) {
  t.record('the run completed without an exception', false, e.message);
  await t.shot('error').catch(() => {});
}

await t.finish();
