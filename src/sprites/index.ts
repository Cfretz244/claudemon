import { BATCH_01 } from './batch01_starters';
import { BATCH_02 } from './batch02_bugs_birds';
import { BATCH_03 } from './batch03_early_routes';
import { BATCH_04 } from './batch04_nidos_fairies';
import { BATCH_05 } from './batch05_cave_water';
import { BATCH_06 } from './batch06_fighters_flora';
import { BATCH_07 } from './batch07_magnets_ghosts';
import { BATCH_08 } from './batch08_oddities';
import { BATCH_09 } from './batch09_late_game';
import { BATCH_10 } from './batch10_legends';
import type { CustomSpriteDrawFn } from './types';

export type { CustomSpriteDrawFn };

export const CUSTOM_POKEMON_SPRITES: Record<number, CustomSpriteDrawFn> = {
  ...BATCH_01,
  ...BATCH_02,
  ...BATCH_03,
  ...BATCH_04,
  ...BATCH_05,
  ...BATCH_06,
  ...BATCH_07,
  ...BATCH_08,
  ...BATCH_09,
  ...BATCH_10,
};
