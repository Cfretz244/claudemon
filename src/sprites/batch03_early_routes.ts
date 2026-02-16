import { rattata } from './pokemon/rattata';
import { raticate } from './pokemon/raticate';
import { spearow } from './pokemon/spearow';
import { fearow } from './pokemon/fearow';
import { ekans } from './pokemon/ekans';
import { arbok } from './pokemon/arbok';
import { raichu } from './pokemon/raichu';
import { sandshrew } from './pokemon/sandshrew';
import { sandslash } from './pokemon/sandslash';
import { nidoranF } from './pokemon/nidoranF';
import { nidorina } from './pokemon/nidorina';
import { nidoqueen } from './pokemon/nidoqueen';
import type { CustomSpriteDrawFn } from './types';

export const BATCH_03: Record<number, CustomSpriteDrawFn> = {
  19: rattata, 20: raticate,
  21: spearow, 22: fearow,
  23: ekans, 24: arbok,
  26: raichu,
  27: sandshrew, 28: sandslash,
  29: nidoranF, 30: nidorina, 31: nidoqueen,
};
