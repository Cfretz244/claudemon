import { seaking } from './pokemon/seaking';
import { staryu } from './pokemon/staryu';
import { starmie } from './pokemon/starmie';
import { mrMime } from './pokemon/mrMime';
import { scyther } from './pokemon/scyther';
import { jynx } from './pokemon/jynx';
import { electabuzz } from './pokemon/electabuzz';
import { magmar } from './pokemon/magmar';
import { pinsir } from './pokemon/pinsir';
import { tauros } from './pokemon/tauros';
import { magikarp } from './pokemon/magikarp';
import { gyarados } from './pokemon/gyarados';
import { lapras } from './pokemon/lapras';
import { ditto } from './pokemon/ditto';
import { eevee } from './pokemon/eevee';
import { vaporeon } from './pokemon/vaporeon';
import { jolteon } from './pokemon/jolteon';
import { flareon } from './pokemon/flareon';
import { porygon } from './pokemon/porygon';
import type { CustomSpriteDrawFn } from './types';

export const BATCH_09: Record<number, CustomSpriteDrawFn> = {
  119: seaking, 120: staryu, 121: starmie,
  122: mrMime,
  123: scyther, 124: jynx,
  125: electabuzz, 126: magmar,
  127: pinsir, 128: tauros,
  129: magikarp, 130: gyarados,
  131: lapras, 132: ditto,
  133: eevee, 134: vaporeon, 135: jolteon, 136: flareon,
  137: porygon,
};
