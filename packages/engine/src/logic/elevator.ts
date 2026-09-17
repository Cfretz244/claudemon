// Data-driven elevators: which floors an `elevator_` NPC offers and whether
// the player may use it. Pure so map data can be tested without the scene.
import type { ElevatorData, ElevatorFloor, MapData } from '../types/map.types';
import { GateState, requirementMet } from './warpGate';

export type ElevatorAccess =
  | { ok: true; floors: ElevatorFloor[] }
  | { ok: false; message: string[] };

export const DEFAULT_LOCKED_MESSAGE = ["It's an elevator,\nbut it won't move...", 'It needs a special\nkey.'];
export const NO_ELEVATOR_MESSAGE = ["It's an elevator,\nbut it won't move..."];

/** Story flag set when the player arrives on `mapId`, for floors that have an elevator. */
export const visitedFlag = (mapId: string) => `visited_${mapId}`;

/**
 * The floor menu for this map's elevator, or the message to show instead.
 * Stops with an unmet `requires` are left out of the menu.
 */
export function elevatorAccess(map: Pick<MapData, 'elevator'>, state: GateState): ElevatorAccess {
  const data: ElevatorData | undefined = map.elevator;
  if (!data || data.floors.length === 0) return { ok: false, message: NO_ELEVATOR_MESSAGE };
  if (data.requires && !requirementMet(data.requires, state)) {
    return { ok: false, message: data.lockedMessage ?? DEFAULT_LOCKED_MESSAGE };
  }
  return { ok: true, floors: data.floors.filter(f => !f.requires || requirementMet(f.requires, state)) };
}

/** The floor to ride to, or null when it is the floor the player is already on. */
export function elevatorTarget(floors: ElevatorFloor[], index: number, currentMapId: string): ElevatorFloor | null {
  const floor = floors[index];
  if (!floor || floor.targetMap === currentMapId) return null;
  return floor;
}
