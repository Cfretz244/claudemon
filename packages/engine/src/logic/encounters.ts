// Pure wild-encounter selection and trainer-encounter-theme logic, extracted
// from OverworldScene for unit testing.

import { MapData, NPCData, TileType, WildEncounterTable } from '../types/map.types';
import { TRAINERS } from '../data/trainers';

/** Tiles that roll `wildEncounters` on foot unless the map overrides them. */
export const DEFAULT_ENCOUNTER_TILES: readonly TileType[] = [TileType.TALL_GRASS, TileType.CAVE_FLOOR];
/** Tiles that roll `surfEncounters` while surfing (not overridable). */
export const SURF_ENCOUNTER_TILES: readonly TileType[] = [TileType.WATER, TileType.CURRENT];

/** The tile types that can start a wild battle on this map in the given mode. */
export function encounterTilesOf(map: Pick<MapData, 'encounterTiles'>, surfing: boolean): readonly TileType[] {
  return surfing ? SURF_ENCOUNTER_TILES : (map.encounterTiles ?? DEFAULT_ENCOUNTER_TILES);
}

/** The encounter table rolled on this map in the given mode, if any. */
export function encounterTableOf(map: Pick<MapData, 'wildEncounters' | 'surfEncounters'>, surfing: boolean): WildEncounterTable | undefined {
  return surfing ? map.surfEncounters : map.wildEncounters;
}

/** True when stepping onto `tile` can roll a wild encounter here. */
export function rollsEncounterOn(map: Pick<MapData, 'encounterTiles'>, tile: TileType | undefined, surfing: boolean): boolean {
  return tile !== undefined && encounterTilesOf(map, surfing).includes(tile);
}

export type ItemBallAction =
  | { kind: 'item'; itemId: string }
  | { kind: 'ambush'; speciesId: number; level: number };

/**
 * What picking up an item ball does: give its item, or (for a fake ball)
 * start a wild battle. `ambush` wins when both are set. Null for a ball that
 * is neither (nothing to pick up).
 */
export function itemBallAction(npc: Pick<NPCData, 'isItemBall' | 'itemId' | 'ambush'>): ItemBallAction | null {
  if (!npc.isItemBall) return null;
  if (npc.ambush) return { kind: 'ambush', speciesId: npc.ambush.speciesId, level: npc.ambush.level };
  if (npc.itemId) return { kind: 'item', itemId: npc.itemId };
  return null;
}

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
