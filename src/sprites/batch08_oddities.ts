import { kingler } from './pokemon/kingler';
import { voltorb } from './pokemon/voltorb';
import { electrode } from './pokemon/electrode';
import { exeggcute } from './pokemon/exeggcute';
import { exeggutor } from './pokemon/exeggutor';
import { cubone } from './pokemon/cubone';
import { marowak } from './pokemon/marowak';
import { hitmonlee } from './pokemon/hitmonlee';
import { hitmonchan } from './pokemon/hitmonchan';
import { lickitung } from './pokemon/lickitung';
import { koffing } from './pokemon/koffing';
import { weezing } from './pokemon/weezing';
import { rhyhorn } from './pokemon/rhyhorn';
import { rhydon } from './pokemon/rhydon';
import { chansey } from './pokemon/chansey';
import { tangela } from './pokemon/tangela';
import { kangaskhan } from './pokemon/kangaskhan';
import { horsea } from './pokemon/horsea';
import { seadra } from './pokemon/seadra';
import { goldeen } from './pokemon/goldeen';
import type { CustomSpriteDrawFn } from './types';

export const BATCH_08: Record<number, CustomSpriteDrawFn> = {
  99: kingler, 100: voltorb, 101: electrode,
  102: exeggcute, 103: exeggutor,
  104: cubone, 105: marowak,
  106: hitmonlee, 107: hitmonchan,
  108: lickitung,
  109: koffing, 110: weezing,
  111: rhyhorn, 112: rhydon,
  113: chansey, 114: tangela, 115: kangaskhan,
  116: horsea, 117: seadra, 118: goldeen,
};
