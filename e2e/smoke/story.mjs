// Story-trigger smoke runner. Each scenario seeds a save, boots into the
// overworld, talks to an adjacent NPC, and asserts on REAL scene state
// (flags/bag) rather than pixels.
import { createRunner } from '../lib.mjs';

const t = await createRunner('story');

const afterPikachu = { has_pikachu: true, rival_battle_lab: true };

await t.scenario('Viridian Mart clerk hands over Oak\'s Parcel',
  { map: 'pokemart', x: 3, y: 2, flags: afterPikachu, bag: {} }, 'left',
  st => st.bag.oaks_parcel === 1 || `bag=${JSON.stringify(st.bag)}`);

await t.scenario('Oak takes the Parcel, gives Pokedex + 5 Poke Balls',
  { map: 'oaks_lab', x: 4, y: 4, flags: afterPikachu, bag: { oaks_parcel: 1 } }, 'up',
  st => (st.flags.delivered_parcel && st.flags.has_pokedex && st.bag.poke_ball === 5 && !st.bag.oaks_parcel)
        || `flags=${JSON.stringify({ d: st.flags.delivered_parcel, p: st.flags.has_pokedex })} bag=${JSON.stringify(st.bag)}`);

await t.scenario('Oak after delivery: no second Pokedex, no more balls',
  { map: 'oaks_lab', x: 4, y: 4, flags: { ...afterPikachu, delivered_parcel: true, has_pokedex: true }, bag: { poke_ball: 5 } }, 'up',
  st => st.bag.poke_ball === 5 || `bag=${JSON.stringify(st.bag)}`);

await t.scenario('Pewter Mart clerk does NOT hand out the Parcel (fixed in #46)',
  { map: 'pokemart_pewter', x: 3, y: 2, flags: afterPikachu, bag: {} }, 'left',
  st => !st.bag.oaks_parcel || `bag=${JSON.stringify(st.bag)}`);

await t.finish();
