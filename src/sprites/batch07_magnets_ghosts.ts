import { slowbro } from './pokemon/slowbro';
import { magnemite } from './pokemon/magnemite';
import { magneton } from './pokemon/magneton';
import { farfetchd } from './pokemon/farfetchd';
import { doduo } from './pokemon/doduo';
import { dodrio } from './pokemon/dodrio';
import { seel } from './pokemon/seel';
import { dewgong } from './pokemon/dewgong';
import { grimer } from './pokemon/grimer';
import { muk } from './pokemon/muk';
import { shellder } from './pokemon/shellder';
import { cloyster } from './pokemon/cloyster';
import { gastly } from './pokemon/gastly';
import { haunter } from './pokemon/haunter';
import { gengar } from './pokemon/gengar';
import { onix } from './pokemon/onix';
import { drowzee } from './pokemon/drowzee';
import { hypno } from './pokemon/hypno';
import { krabby } from './pokemon/krabby';
import type { CustomSpriteDrawFn } from './types';

export const BATCH_07: Record<number, CustomSpriteDrawFn> = {
  80: slowbro, 81: magnemite, 82: magneton,
  83: farfetchd, 84: doduo, 85: dodrio,
  86: seel, 87: dewgong,
  88: grimer, 89: muk,
  90: shellder, 91: cloyster,
  92: gastly, 93: haunter, 94: gengar,
  95: onix,
  96: drowzee, 97: hypno,
  98: krabby,
};
