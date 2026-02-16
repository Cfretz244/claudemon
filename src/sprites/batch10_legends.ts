import { omanyte } from './pokemon/omanyte';
import { omastar } from './pokemon/omastar';
import { kabuto } from './pokemon/kabuto';
import { kabutops } from './pokemon/kabutops';
import { aerodactyl } from './pokemon/aerodactyl';
import { snorlax } from './pokemon/snorlax';
import { articuno } from './pokemon/articuno';
import { zapdos } from './pokemon/zapdos';
import { moltres } from './pokemon/moltres';
import { dratini } from './pokemon/dratini';
import { dragonair } from './pokemon/dragonair';
import { dragonite } from './pokemon/dragonite';
import { mewtwo } from './pokemon/mewtwo';
import { mew } from './pokemon/mew';
import type { CustomSpriteDrawFn } from './types';

export const BATCH_10: Record<number, CustomSpriteDrawFn> = {
  138: omanyte, 139: omastar,
  140: kabuto, 141: kabutops,
  142: aerodactyl, 143: snorlax,
  144: articuno, 145: zapdos, 146: moltres,
  147: dratini, 148: dragonair, 149: dragonite,
  150: mewtwo, 151: mew,
};
