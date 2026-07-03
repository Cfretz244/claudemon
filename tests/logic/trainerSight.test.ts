import { describe, it, expect } from 'vitest';
import { computeTrainerSight } from '../../src/logic/trainerSight';
import { MapData, NPCData, TileType } from '../../src/types/map.types';
import { Direction } from '../../src/utils/constants';

function makeMap(overrides: Partial<MapData> = {}): MapData {
  const W = 10, H = 10;
  return {
    id: 'test_map', name: 'TEST', width: W, height: H,
    tiles: Array.from({ length: H }, () => Array(W).fill(TileType.PATH)),
    collision: Array.from({ length: H }, () => Array(W).fill(false)),
    warps: [], npcs: [],
    ...overrides,
  };
}

function trainer(overrides: Partial<NPCData> = {}): NPCData {
  return {
    id: 'trainer1', x: 5, y: 5, spriteColor: 0,
    direction: Direction.RIGHT, dialogue: [], isTrainer: true, sightRange: 3,
    ...overrides,
  };
}

describe('computeTrainerSight', () => {
  it('spots a player directly in the facing direction within range', () => {
    const result = computeTrainerSight(trainer(), 7, 5, makeMap(), false);
    expect(result).toEqual({ spotted: true, distance: 2 });
  });

  it('does not spot a player behind the trainer', () => {
    expect(computeTrainerSight(trainer(), 3, 5, makeMap(), false).spotted).toBe(false);
  });

  it('does not spot a player beyond sightRange', () => {
    expect(computeTrainerSight(trainer(), 9, 5, makeMap(), false).spotted).toBe(false);
  });

  it('does not spot a player off the facing axis', () => {
    expect(computeTrainerSight(trainer(), 7, 6, makeMap(), false).spotted).toBe(false);
  });

  it('works on the vertical axis', () => {
    const npc = trainer({ direction: Direction.DOWN });
    expect(computeTrainerSight(npc, 5, 7, makeMap(), false)).toEqual({ spotted: true, distance: 2 });
    expect(computeTrainerSight(npc, 5, 3, makeMap(), false).spotted).toBe(false);
  });

  it('is blocked by a solid tile between trainer and player', () => {
    const map = makeMap();
    map.collision[5][6] = true;
    expect(computeTrainerSight(trainer(), 7, 5, map, false).spotted).toBe(false);
  });

  it('sees across water only when the player is surfing', () => {
    const map = makeMap();
    map.tiles[5][6] = TileType.WATER;
    map.collision[5][6] = true;
    expect(computeTrainerSight(trainer(), 7, 5, map, false).spotted).toBe(false);
    expect(computeTrainerSight(trainer(), 7, 5, map, true).spotted).toBe(true);
  });

  it('is blocked by another NPC in the line of sight', () => {
    const blocker: NPCData = { id: 'npc2', x: 6, y: 5, spriteColor: 0, direction: Direction.UP, dialogue: [] };
    const map = makeMap({ npcs: [blocker] });
    expect(computeTrainerSight(trainer(), 7, 5, map, false).spotted).toBe(false);
  });

  it('adjacent player is spotted (no tiles in between to block)', () => {
    const map = makeMap();
    map.collision[5][6] = true; // irrelevant: distance 1 has no in-between tiles
    expect(computeTrainerSight(trainer(), 6, 5, map, false)).toEqual({ spotted: true, distance: 1 });
  });

  it('returns not-spotted for an NPC without sightRange', () => {
    expect(computeTrainerSight(trainer({ sightRange: undefined }), 6, 5, makeMap(), false).spotted).toBe(false);
  });
});
