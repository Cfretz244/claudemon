import { caterpie } from './pokemon/caterpie';
import { metapod } from './pokemon/metapod';
import { butterfree } from './pokemon/butterfree';
import { weedle } from './pokemon/weedle';
import { kakuna } from './pokemon/kakuna';
import { beedrill } from './pokemon/beedrill';
import { pidgey } from './pokemon/pidgey';
import { pidgeotto } from './pokemon/pidgeotto';
import { pidgeot } from './pokemon/pidgeot';
import type { CustomSpriteDrawFn } from './types';

export const BATCH_02: Record<number, CustomSpriteDrawFn> = {
  10: caterpie, 11: metapod, 12: butterfree,
  13: weedle, 14: kakuna, 15: beedrill,
  16: pidgey, 17: pidgeotto, 18: pidgeot,
};
