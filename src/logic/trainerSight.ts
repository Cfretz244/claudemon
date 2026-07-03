// Pure trainer line-of-sight math, extracted from OverworldScene so it can be
// unit tested. The scene handles the resulting encounter (animation, battle).

import { MapData, NPCData, TileType } from '../types/map.types';
import { DIR_VECTORS } from '../utils/constants';

export interface SightResult {
  spotted: boolean;
  distance: number;
}

/**
 * Whether `npc` (a trainer with a sightRange) can see the player at
 * (playerX, playerY): the player must be on the trainer's facing axis within
 * sightRange, with no solid tile or other NPC in between. Water tiles don't
 * block sight while the player is surfing.
 */
export function computeTrainerSight(
  npc: NPCData,
  playerX: number,
  playerY: number,
  map: MapData,
  isSurfing: boolean,
): SightResult {
  const none: SightResult = { spotted: false, distance: 0 };
  if (!npc.sightRange) return none;

  const vec = DIR_VECTORS[npc.direction];
  const dx = playerX - npc.x;
  const dy = playerY - npc.y;

  // Player must be along the trainer's facing axis
  let inSight = false;
  let distance = 0;
  if (vec.x !== 0 && dy === 0) {
    distance = dx * vec.x; // positive if player is in the direction trainer faces
    inSight = distance > 0 && distance <= npc.sightRange;
  } else if (vec.y !== 0 && dx === 0) {
    distance = dy * vec.y;
    inSight = distance > 0 && distance <= npc.sightRange;
  }
  if (!inSight) return none;

  // Check for obstacles between trainer and player
  for (let i = 1; i < distance; i++) {
    const checkX = npc.x + vec.x * i;
    const checkY = npc.y + vec.y * i;
    const tileBlocked = map.collision[checkY]?.[checkX];
    // Water tiles are not obstacles when surfing
    const isWater = map.tiles[checkY]?.[checkX] === TileType.WATER;
    if (tileBlocked && !(isSurfing && isWater)) return none;
    for (const otherNpc of map.npcs) {
      if (otherNpc.id !== npc.id && otherNpc.x === checkX && otherNpc.y === checkY) {
        return none;
      }
    }
  }

  return { spotted: true, distance };
}
