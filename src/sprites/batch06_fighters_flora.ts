import { abra } from './pokemon/abra';
import { kadabra } from './pokemon/kadabra';
import { alakazam } from './pokemon/alakazam';
import { machop } from './pokemon/machop';
import { machoke } from './pokemon/machoke';
import { machamp } from './pokemon/machamp';
import { bellsprout } from './pokemon/bellsprout';
import { weepinbell } from './pokemon/weepinbell';
import { victreebel } from './pokemon/victreebel';
import { tentacool } from './pokemon/tentacool';
import { tentacruel } from './pokemon/tentacruel';
import { geodude } from './pokemon/geodude';
import { graveler } from './pokemon/graveler';
import { golem } from './pokemon/golem';
import { ponyta } from './pokemon/ponyta';
import { rapidash } from './pokemon/rapidash';
import { slowpoke } from './pokemon/slowpoke';
import type { CustomSpriteDrawFn } from './types';

export const BATCH_06: Record<number, CustomSpriteDrawFn> = {
  63: abra, 64: kadabra, 65: alakazam,
  66: machop, 67: machoke, 68: machamp,
  69: bellsprout, 70: weepinbell, 71: victreebel,
  72: tentacool, 73: tentacruel,
  74: geodude, 75: graveler, 76: golem,
  77: ponyta, 78: rapidash,
  79: slowpoke,
};
