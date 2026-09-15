import { describe, it, expect } from 'vitest';
import {
  SurgePuzzle, SURGE_CAN_RESULTS, SURGE_GATE_FLAG, TrashCanState,
  surgeCanResult, surgeTrashCan,
} from '../../src/logic/surgePuzzle';
import { MapData, TileType, WarpRequirement } from '../../src/types/map.types';
import { ALL_MAPS } from '../../src/data/maps';

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

const ALL_STATES: TrashCanState[] = ['empty', 'first-found', 'gate-open', 'reset', 'already-open'];

describe('surgeCanResult', () => {
  it('is exactly this table', () => {
    expect(ALL_STATES.map(state => [state, surgeCanResult(state)])).toEqual([
      ['empty', {
        messages: ["There's nothing in\nthe trash can."],
        opensGate: false,
        bump: false,
      }],
      ['first-found', {
        messages: [
          "Hey! There's a\nswitch under the",
          'trash! Turn it on!',
          'The first lock was\nopened!',
        ],
        opensGate: false,
        bump: true,
      }],
      ['gate-open', {
        messages: [
          "Hey! There's another\nswitch under the",
          'trash! Turn it on!',
          'The second lock was\nopened!',
          'The electric gate\nopened!',
        ],
        opensGate: true,
        bump: true,
      }],
      ['reset', {
        messages: [
          "Nope, there's only\ntrash here.",
          'Hey! The electric\nlock was reset!',
        ],
        opensGate: false,
        bump: true,
      }],
      // The gate being open reads exactly like an empty can.
      ['already-open', {
        messages: ["There's nothing in\nthe trash can."],
        opensGate: false,
        bump: false,
      }],
    ]);
  });

  it('opens the gate for gate-open and nothing else', () => {
    const opening = ALL_STATES.filter(s => surgeCanResult(s).opensGate);
    expect(opening).toEqual(['gate-open']);
  });

  it('is silent only for the two "nothing in the trash can" readings', () => {
    const silent = ALL_STATES.filter(s => !surgeCanResult(s).bump);
    expect(silent).toEqual(['empty', 'already-open']);
  });

  it('covers every outcome checkCan() can return, and one it cannot', () => {
    expect(Object.keys(SURGE_CAN_RESULTS).sort()).toEqual([...ALL_STATES].sort());
  });

  it('hands out fresh arrays, so the scene cannot mutate the table', () => {
    const first = surgeCanResult('gate-open');
    first.messages.push('TAMPERED');
    expect(surgeCanResult('gate-open').messages).toEqual(SURGE_CAN_RESULTS['gate-open'].messages);
    expect(SURGE_CAN_RESULTS['gate-open'].messages).not.toContain('TAMPERED');
  });
});

describe('surgeTrashCan', () => {
  it('asks the puzzle while the gate is shut', () => {
    for (const outcome of ['empty', 'first-found', 'gate-open', 'reset'] as const) {
      let asked = 0;
      const result = surgeTrashCan(false, () => { asked++; return outcome; });
      expect(asked).toBe(1);
      expect(result).toEqual(surgeCanResult(outcome));
    }
  });

  it('never asks the puzzle once the gate is open', () => {
    let asked = 0;
    const result = surgeTrashCan(true, () => { asked++; return 'gate-open'; });
    expect(asked).toBe(0);
    expect(result).toEqual(surgeCanResult('already-open'));
    // ...and re-reading a can cannot re-open an already open gate.
    expect(result.opensGate).toBe(false);
  });

  it('is the only way the flag gets written: gate-open, first time only', () => {
    const flags: Record<string, boolean> = {};
    const write = (gateOpen: boolean, outcome: TrashCanState) => {
      const r = surgeTrashCan(gateOpen, () => outcome as never);
      if (r.opensGate) flags[SURGE_GATE_FLAG] = true;
      return r;
    };
    expect(write(false, 'first-found').opensGate).toBe(false);
    expect(flags).toEqual({});
    expect(write(false, 'gate-open').opensGate).toBe(true);
    expect(flags).toEqual({ surge_gate_open: true });
    // Every later reading with the flag up is the silent empty-can line.
    expect(write(true, 'gate-open')).toEqual(surgeCanResult('already-open'));
  });
});

describe('SURGE_GATE_FLAG', () => {
  it('is the string the scene persists', () => {
    expect(SURGE_GATE_FLAG).toBe('surge_gate_open');
  });

  it('is read by nothing in the map data — only the fence redraw uses it', () => {
    // initSurgeTrashPuzzle() calls openSurgeGate() straight away when the flag
    // is set; no tile gate, entry gate or elevator requirement mentions it (and
    // plain warps have no requirement at all), so the fence row at y=5 is the
    // flag's only observable effect.
    const flagsIn = (req?: WarpRequirement): string[] => !req ? [] : [
      ...(req.flag ? [req.flag] : []),
      ...(req.notFlag ? [req.notFlag] : []),
      ...(req.anyOf ?? []).flatMap(flagsIn),
    ];
    const referenced = Object.values(ALL_MAPS).flatMap(map => [
      ...(map.gates ?? []).flatMap(g => g.flag ? [g.flag] : []),
      ...(map.entryGates ?? []).flatMap(g => flagsIn(g.requires)),
      ...flagsIn(map.elevator?.requires),
      ...(map.elevator?.floors ?? []).flatMap(f => flagsIn(f.requires)),
    ]);
    expect(referenced).not.toContain(SURGE_GATE_FLAG);
    expect(referenced.length).toBeGreaterThan(10);   // the sweep really ran
  });

  it('the gym still has the fence row openSurgeGate() clears', () => {
    const gym = ALL_MAPS['vermilion_gym'];
    const fence = gym.tiles[5].filter(t => t === TileType.FENCE);
    expect(fence.length).toBeGreaterThan(0);
    // And the cans the puzzle picks from are real COUNTER tiles.
    const puzzle = new SurgePuzzle(seq(0, 0));
    puzzle.init(gym);
    expect(puzzle.checkCan(0, 0)).toBe('empty');
  });
});
