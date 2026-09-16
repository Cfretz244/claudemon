// Oak's Lab smoke runner: every stage of Prof. Oak's chain, plus the lab rival
// ambush that fires on the exit warp. Each scenario is a fresh boot next to Oak
// (or on the tile above the lab door) and asserts on REAL scene state — the
// story flags, the bag, the party, and the BattleScene the ambush starts.
import { createRunner, DIR_KEY } from '../lib.mjs';

const t = await createRunner('oak');
const { page } = t;

const OAK_FLAGS = ['has_pikachu', 'delivered_parcel', 'has_pokedex', 'rival_battle_lab'];
const flagStr = f => OAK_FLAGS.map(k => `${k}=${f[k] ? 1 : 0}`).join(' ');
const bagStr = b => Object.keys(b).sort().map(k => `${k}x${b[k]}`).join(',') || '(empty)';

/** Seed next to Oak, face him, read his speech, then assert the end state. */
const talkToOak = (name, seed, check) => t.scenario(name, { bag: {}, ...seed }, 'up', check);

/** Seed on the tile above the lab's exit warp and walk into it. */
async function walkOutOfLab(name, seed, check) {
  await t.boot({ bag: {}, ...seed });
  const slug = name.replace(/\W+/g, '_');
  await t.shot(`${slug}.pre`);
  await page.keyboard.down(DIR_KEY.down);
  for (let i = 0; i < 20; i++) {          // release as soon as the step starts
    await page.waitForTimeout(60);
    const st = await t.state();
    if (!st || st.battle || st.moving || st.warping) break;
  }
  await page.keyboard.up(DIR_KEY.down);
  await page.waitForTimeout(1500);
  // The ambush is a text box first: read the rival's lines, then press through
  // them, which is what actually starts the battle.
  const mid = await t.state();
  const ambush = mid && !mid.battle && mid.textVisible ? mid.text.slice() : [];
  if (ambush.length) await t.advanceText();
  await page.waitForTimeout(2500);
  const bt = await t.battle();
  const over = bt ? null : await t.waitOverworld();
  await t.shot(`${slug}.post`);
  const verdict = check({ battle: bt, over, ambush });
  t.record(name, verdict === true, String(verdict));
}

// --- Oak's chain, stage by stage ---------------------------------------------
const OAK_SPOT = { map: 'oaks_lab', x: 4, y: 4 };

await talkToOak('1. fresh game: Oak hands over Pikachu',
  { ...OAK_SPOT, flags: {}, party: [] },
  st => (st.flags.has_pikachu === true && JSON.stringify(st.party) === '[[25,5]]'
         && !st.flags.delivered_parcel && !st.flags.has_pokedex && bagStr(st.bag) === '(empty)')
        || `flags=${flagStr(st.flags)} party=${JSON.stringify(st.party)} bag=${bagStr(st.bag)}`);

await talkToOak('2. has Pikachu, no parcel: Oak points at the Viridian mart',
  { ...OAK_SPOT, flags: { has_pikachu: true } },
  st => (!st.flags.delivered_parcel && !st.flags.has_pokedex && bagStr(st.bag) === '(empty)')
        || `flags=${flagStr(st.flags)} bag=${bagStr(st.bag)}`);

await talkToOak('3. parcel in the bag: Pokedex + 5 Poke Balls',
  { ...OAK_SPOT, flags: { has_pikachu: true }, bag: { oaks_parcel: 1 } },
  st => (st.flags.delivered_parcel === true && st.flags.has_pokedex === true
         && st.bag.pokedex === 1 && st.bag.poke_ball === 5 && !st.bag.oaks_parcel)
        || `flags=${flagStr(st.flags)} bag=${bagStr(st.bag)}`);

await talkToOak('4. after delivery: nothing granted a second time',
  { ...OAK_SPOT, flags: { has_pikachu: true, delivered_parcel: true, has_pokedex: true },
    bag: { pokedex: 1, poke_ball: 5 } },
  st => (st.bag.pokedex === 1 && st.bag.poke_ball === 5) || `bag=${bagStr(st.bag)}`);

await talkToOak('5. delivered but carrying a parcel (save-editor state): keeps it',
  { ...OAK_SPOT, flags: { has_pikachu: true, delivered_parcel: true, has_pokedex: true },
    bag: { oaks_parcel: 1 } },
  st => (st.bag.oaks_parcel === 1 && !st.bag.pokedex) || `bag=${bagStr(st.bag)}`);

// --- the lab rival on the way out ---------------------------------------------
const LAB_DOOR = { map: 'oaks_lab', x: 4, y: 10 };

await walkOutOfLab('6. has Pikachu, never fought: the rival blocks the door',
  { ...LAB_DOOR, flags: { has_pikachu: true } },
  r => (r.ambush.length === 3 && r.battle && r.battle.trainerId === 'rival_lab'
        && r.battle.trainerName === 'RIVAL' && r.battle.trainerClass === 'Rival')
       || `ambush=${r.ambush.length} battle=${JSON.stringify(r.battle?.trainerId)} map=${r.over?.map}`);

await walkOutOfLab('7. rival_battle_lab already set: the player just leaves',
  { ...LAB_DOOR, flags: { has_pikachu: true, rival_battle_lab: true } },
  r => (!r.battle && !r.ambush.length && r.over.map === 'pallet_town')
       || `battle=${JSON.stringify(r.battle?.trainerId)} map=${r.over?.map}`);

await walkOutOfLab('8. rival_lab already beaten (flag derived on load): no rematch',
  { ...LAB_DOOR, flags: { has_pikachu: true }, defeated: ['rival_lab'] },
  r => (!r.battle && !r.ambush.length && r.over.map === 'pallet_town' && r.over.flags.rival_battle_lab === true)
       || `battle=${JSON.stringify(r.battle?.trainerId)} map=${r.over?.map} flags=${r.over && flagStr(r.over.flags)}`);

await walkOutOfLab('9. no Pikachu yet: no ambush',
  { ...LAB_DOOR, flags: {}, party: [] },
  r => (!r.battle && !r.ambush.length && r.over.map === 'pallet_town')
       || `battle=${JSON.stringify(r.battle?.trainerId)} map=${r.over?.map}`);

await t.finish();
