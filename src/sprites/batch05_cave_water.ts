import { paras } from './pokemon/paras';
import { parasect } from './pokemon/parasect';
import { venonat } from './pokemon/venonat';
import { venomoth } from './pokemon/venomoth';
import { diglett } from './pokemon/diglett';
import { dugtrio } from './pokemon/dugtrio';
import { meowth } from './pokemon/meowth';
import { persian } from './pokemon/persian';
import { psyduck } from './pokemon/psyduck';
import { golduck } from './pokemon/golduck';
import { mankey } from './pokemon/mankey';
import { primeape } from './pokemon/primeape';
import { growlithe } from './pokemon/growlithe';
import { arcanine } from './pokemon/arcanine';
import { poliwag } from './pokemon/poliwag';
import { poliwhirl } from './pokemon/poliwhirl';
import { poliwrath } from './pokemon/poliwrath';
import type { CustomSpriteDrawFn } from './types';

export const BATCH_05: Record<number, CustomSpriteDrawFn> = {
  46: paras, 47: parasect,
  48: venonat, 49: venomoth,
  50: diglett, 51: dugtrio,
  52: meowth, 53: persian,
  54: psyduck, 55: golduck,
  56: mankey, 57: primeape,
  58: growlithe, 59: arcanine,
  60: poliwag, 61: poliwhirl, 62: poliwrath,
};
