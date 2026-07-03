// Pure wild-encounter selection and trainer-encounter-theme logic, extracted
// from OverworldScene for unit testing.

import { WildEncounterTable } from '../types/map.types';
import { TRAINERS } from '../data/trainers';

export interface WildPick {
  speciesId: number;
  level: number;
}

/**
 * Weighted pick from an encounter table, rolling a level in
 * [minLevel, maxLevel]. Returns null only if the table is empty.
 * rng consumption order (preserved from the scene): one roll for the
 * species pick, then one roll for the level.
 */
export function pickWildEncounter(
  table: WildEncounterTable,
  rng: () => number = Math.random,
): WildPick | null {
  const totalWeight = table.encounters.reduce((sum, e) => sum + e.weight, 0);
  let roll = rng() * totalWeight;
  for (const enc of table.encounters) {
    roll -= enc.weight;
    if (roll <= 0) {
      const level = enc.minLevel + Math.floor(rng() * (enc.maxLevel - enc.minLevel + 1));
      return { speciesId: enc.speciesId, level };
    }
  }
  return null;
}

/** Which encounter music theme plays when a trainer spots the player. */
export function getEncounterTheme(npcId: string): string {
  if (npcId.startsWith('rival_')) return 'rival_theme';
  const trainerData = TRAINERS[npcId];
  const trainerClass = trainerData?.class || '';
  const EVIL_CLASSES = ['Team Rocket', 'Boss', 'Channeler'];
  if (EVIL_CLASSES.includes(trainerClass)) return 'evil_encounter';
  const FEMALE_CLASSES = ['Lass', 'Beauty', 'Jr. Trainer', 'Cooltrainer', 'Swimmer'];
  if (FEMALE_CLASSES.includes(trainerClass)) return 'female_encounter';
  return 'trainer_encounter';
}
