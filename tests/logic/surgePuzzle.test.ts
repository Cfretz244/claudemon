import { describe, it, expect } from 'vitest';
import { SurgePuzzle } from '../../src/logic/surgePuzzle';
import { MapData, TileType } from '../../src/types/map.types';

// 3 trash cans in a row at y=2: (2,2) (3,2) (4,2)
function gymMap(): MapData {
  const W = 8, H = 5;
  const tiles = Array.from({ length: H }, () => Array(W).fill(TileType.INDOOR_FLOOR));
  tiles[2][2] = TileType.COUNTER;
  tiles[2][3] = TileType.COUNTER;
  tiles[2][4] = TileType.COUNTER;
  return {
    id: 'vermilion_gym', name: 'GYM', width: W, height: H,
    tiles, collision: Array.from({ length: H }, () => Array(W).fill(false)),
    warps: [], npcs: [],
  };
}

function seq(...values: number[]): () => number {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

describe('SurgePuzzle', () => {
  it('finding first then adjacent second switch opens the gate', () => {
    // rng: first pick idx 0 -> (2,2); adjacent = [(3,2)]; pick idx 0
    const puzzle = new SurgePuzzle(seq(0, 0));
    puzzle.init(gymMap());
    expect(puzzle.checkCan(2, 2)).toBe('first-found');
    expect(puzzle.checkCan(3, 2)).toBe('gate-open');
  });

  it('wrong can before the first switch is just empty', () => {
    const puzzle = new SurgePuzzle(seq(0, 0));
    puzzle.init(gymMap());
    expect(puzzle.checkCan(4, 2)).toBe('empty');
    // state unchanged: first switch still findable
    expect(puzzle.checkCan(2, 2)).toBe('first-found');
  });

  it('wrong second can resets the puzzle and re-randomizes', () => {
    const puzzle = new SurgePuzzle(seq(0, 0, /* re-randomize: */ 0.9, 0));
    puzzle.init(gymMap());
    expect(puzzle.checkCan(2, 2)).toBe('first-found');
    expect(puzzle.checkCan(4, 2)).toBe('reset');
    // After reset the first switch moved (rng 0.9 -> idx 2 = (4,2))
    expect(puzzle.checkCan(4, 2)).toBe('first-found');
  });

  it('second switch is always adjacent to the first when possible', () => {
    for (const r of [0, 0.4, 0.7, 0.99]) {
      const puzzle = new SurgePuzzle(seq(0.4, r)); // first = idx 1 = (3,2)
      puzzle.init(gymMap());
      expect(puzzle.checkCan(3, 2)).toBe('first-found');
      // Both neighbors are valid seconds; anything else resets
      const left = new SurgePuzzle(seq(0.4, r));
      left.init(gymMap());
      left.checkCan(3, 2);
      const outcomes = [left.checkCan(2, 2), puzzle.checkCan(4, 2)];
      expect(outcomes).toContain('gate-open');
    }
  });
});
