// The seven Silph Co item balls whose items `data/items.ts` did not define
// until #91: silph_2f_protein, silph_4f_max_revive, silph_6f_hp_up,
// silph_6f_x_accuracy, silph_7f_calcium, silph_9f_carbos, silph_10f_pp_up.
// `itemBallPickup()` returned null for an unknown id, so walking into one did
// nothing at all: no text, no item, no `picked_up_` flag, the sprite stayed.
//
// One scenario per ball: boot the player already standing on a walkable tile
// next to the ball (the seat comes from the live map data, so the runner
// survives re-generated sketches), face it, press Z, and assert on the message,
// the bag, the flag and the sprite. Two of the seven (2F PROTEIN, 4F MAX
// REVIVE) sit in a pocket whose only open neighbour is a Card Key door — a
// GATE tile that `applyFlagGates()` opens from the seeded `has_card_key`, hence
// `allowGate`. A last scenario calls the two pure modules the fix added
// (`logic/vitamins.ts`, `logic/reviveItems.ts`) on the live party Pokemon.
import { createRunner } from '../lib.mjs';

const t = await createRunner('silph-item-balls');
const { page } = t;

/** Every Silph grunt: beaten, so no sighting interrupts a boot next to a ball. */
const TRAINERS = ['silph_1f_grunt1', 'silph_2f_grunt1', 'silph_2f_grunt2', 'silph_3f_grunt1', 'silph_3f_grunt2', 'silph_4f_grunt1', 'silph_4f_grunt2',
  'silph_5f_grunt1', 'jessie_silph', 'silph_6f_grunt1', 'silph_6f_grunt2', 'silph_7f_grunt1', 'rival_silph', 'silph_8f_grunt1', 'silph_8f_grunt2',
  'silph_9f_grunt1', 'silph_9f_grunt2', 'silph_10f_grunt1', 'silph_10f_grunt2', 'silph_11f_grunt1', 'silph_11f_grunt2'];

/** The seven duds: floor, ball id, item id, the NAME the pickup message prints. */
const BALLS = [
  { map: 'silph_co_2f', ball: 'silph_2f_protein', item: 'protein', name: 'PROTEIN' },
  { map: 'silph_co_4f', ball: 'silph_4f_max_revive', item: 'max_revive', name: 'MAX REVIVE' },
  { map: 'silph_co_6f', ball: 'silph_6f_hp_up', item: 'hp_up', name: 'HP UP' },
  { map: 'silph_co_6f', ball: 'silph_6f_x_accuracy', item: 'x_accuracy', name: 'X ACCURACY' },
  { map: 'silph_co_7f', ball: 'silph_7f_calcium', item: 'calcium', name: 'CALCIUM' },
  { map: 'silph_co_9f', ball: 'silph_9f_carbos', item: 'carbos', name: 'CARBOS' },
  { map: 'silph_co_10f', ball: 'silph_10f_pp_up', item: 'pp_up', name: 'PP UP' },
];

const check = (name, cond, detail = '') => t.record(name, !!cond, detail);

try {
  for (const b of BALLS) {
    const seat = await t.seatNextToNpc(b.map, b.ball, { allowGate: true });
    check(`${b.ball}: the map still names item '${b.item}'`, seat.npc.itemId === b.item, `names ${seat.npc.itemId}`);

    let st = await t.boot({
      map: b.map, x: seat.x, y: seat.y, party: [[25, 50]], bag: { card_key: 1 },
      badges: ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL'], defeated: TRAINERS,
      flags: { saffron_open: true, has_card_key: true },
    });
    if (st.map !== b.map || st.x !== seat.x || st.y !== seat.y) {
      throw new Error(`booted at ${st.map} ${st.x},${st.y}, wanted ${b.map} ${seat.x},${seat.y}`);
    }
    check(`${b.ball}: the ball sprite is on the floor before the pickup`, st.npcs.includes(b.ball), 'sprite missing');
    await t.face(seat.dir);
    if (b.ball === 'silph_2f_protein') await t.shot('2f-before-interact');

    // Read the message BEFORE advancing it away.
    await t.tap('KeyZ'); await page.waitForTimeout(600);
    const said = await t.state();
    const text = JSON.stringify(said.text ?? null);
    if (b.ball === 'silph_2f_protein') await t.shot('2f-after-interact');
    check(`${b.ball}: the pickup message names ${b.name}`,
      said.textVisible && text.includes('found') && text.includes(b.name), `text=${text}`);
    await t.advanceText(); await page.waitForTimeout(300);
    st = await t.waitSettled();
    check(`${b.ball}: ${b.item} is in the bag`, st.bag[b.item] === 1, `bag.${b.item}=${st.bag[b.item]}`);
    check(`${b.ball}: picked_up_${b.ball} is set`, st.flags[`picked_up_${b.ball}`] === true, JSON.stringify(st.flags[`picked_up_${b.ball}`]));
    check(`${b.ball}: the ball sprite is gone`, !st.npcs.includes(b.ball), 'still there');
  }

  // --- the two pure modules, called on the live party Pokemon ------------------
  const vit = await page.evaluate(async () => {
    try {
      const { applyVitamin, VITAMIN_STAT } = await import('/src/logic/vitamins.ts');
      const { POKEMON_DATA } = await import('/src/data/pokemon.ts');
      const p = window.__claudemon.scene.getScene('OverworldScene').playerState.party[0];
      const species = POKEMON_DATA[p.speciesId];
      const out = {};
      for (const id of ['protein', 'calcium', 'carbos', 'hp_up']) {
        const stat = VITAMIN_STAT[id];
        const before = p.stats[stat], beforeEv = p.evs[stat];
        const r = applyVitamin(p, id, species);
        out[id] = { ok: r?.ok, stat: r?.stat, rose: p.stats[stat] > before, ev: p.evs[stat] - beforeEv };
      }
      // refusal at the Gen I limit
      p.evs.attack = 25600;
      out.limit = applyVitamin(p, 'protein', species);
      out.notAVitamin = applyVitamin(p, 'potion', species);
      return out;
    } catch (e) { return { error: String(e) }; }
  });
  check('applyVitamin: each vitamin raises its own stat by 2560 stat exp',
    !vit.error && ['protein', 'calcium', 'carbos', 'hp_up'].every(id => vit[id]?.ok && vit[id].rose && vit[id].ev === 2560),
    JSON.stringify(vit));
  check('applyVitamin: refused at 25600, null for a non-vitamin',
    !vit.error && vit.limit?.ok === false && vit.notAVitamin === null, JSON.stringify(vit));

  const rev = await page.evaluate(async () => {
    try {
      const { reviveHp, isReviveItem } = await import('/src/logic/reviveItems.ts');
      return { half: reviveHp('revive', 100), full: reviveHp('max_revive', 100),
               potion: reviveHp('potion', 100), isMax: isReviveItem('max_revive') };
    } catch (e) { return { error: String(e) }; }
  });
  check('reviveHp: REVIVE half, MAX REVIVE full, null otherwise',
    !rev.error && rev.half === 50 && rev.full === 100 && rev.potion === null && rev.isMax === true,
    JSON.stringify(rev));

  check('no page errors', t.errors.length === 0, t.errors.slice(0, 3).join(' | '));
} catch (e) {
  check('the run completed without an error', false, `ERROR ${e.message}`);
}

await t.finish();
