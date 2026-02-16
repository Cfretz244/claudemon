import { bulbasaur } from './pokemon/bulbasaur';
import { ivysaur } from './pokemon/ivysaur';
import { venusaur } from './pokemon/venusaur';
import { charmander } from './pokemon/charmander';
import { charmeleon } from './pokemon/charmeleon';
import { charizard } from './pokemon/charizard';
import { squirtle } from './pokemon/squirtle';
import { wartortle } from './pokemon/wartortle';
import { blastoise } from './pokemon/blastoise';
import { pikachu } from './pokemon/pikachu';
import type { CustomSpriteDrawFn } from './types';

export const BATCH_01: Record<number, CustomSpriteDrawFn> = {
  1: bulbasaur, 2: ivysaur, 3: venusaur,
  4: charmander, 5: charmeleon, 6: charizard,
  7: squirtle, 8: wartortle, 9: blastoise,
  25: pikachu,
};
