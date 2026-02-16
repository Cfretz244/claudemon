import { nidoranM } from './pokemon/nidoranM';
import { nidorino } from './pokemon/nidorino';
import { nidoking } from './pokemon/nidoking';
import { clefairy } from './pokemon/clefairy';
import { clefable } from './pokemon/clefable';
import { vulpix } from './pokemon/vulpix';
import { ninetales } from './pokemon/ninetales';
import { jigglypuff } from './pokemon/jigglypuff';
import { wigglytuff } from './pokemon/wigglytuff';
import { zubat } from './pokemon/zubat';
import { golbat } from './pokemon/golbat';
import { oddish } from './pokemon/oddish';
import { gloom } from './pokemon/gloom';
import { vileplume } from './pokemon/vileplume';
import type { CustomSpriteDrawFn } from './types';

export const BATCH_04: Record<number, CustomSpriteDrawFn> = {
  32: nidoranM, 33: nidorino, 34: nidoking,
  35: clefairy, 36: clefable,
  37: vulpix, 38: ninetales,
  39: jigglypuff, 40: wigglytuff,
  41: zubat, 42: golbat,
  43: oddish, 44: gloom, 45: vileplume,
};
