// Lt. Surge's trash-can switch puzzle, extracted from OverworldScene.
// Holds the puzzle state (can positions, which cans hide the switches, and
// whether the first switch was found); the scene renders text/sound and opens
// the gate. RNG is injectable for tests.

import { MapData, TileType } from '../types/map.types';

export type TrashCanOutcome = 'empty' | 'first-found' | 'gate-open' | 'reset';

export class SurgePuzzle {
  private cans: Array<[number, number]> = [];
  private firstSwitch?: [number, number];
  private secondSwitch?: [number, number];
  private firstFound = false;
  private rng: () => number;

  constructor(rng: () => number = Math.random) {
    this.rng = rng;
  }

  /** Collects trash-can (COUNTER tile) positions and places the switches. */
  init(map: MapData): void {
    this.cans = [];
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.tiles[y][x] === TileType.COUNTER) {
          this.cans.push([x, y]);
        }
      }
    }
    this.firstFound = false;
    this.randomizeSwitches();
  }

  /**
   * Picks a random first switch; the second is an adjacent can when one
   * exists (any other can as fallback).
   */
  randomizeSwitches(): void {
    if (this.cans.length < 2) return;

    const firstIdx = Math.floor(this.rng() * this.cans.length);
    this.firstSwitch = this.cans[firstIdx];

    const [fx, fy] = this.firstSwitch;
    const adjacent = this.cans.filter(([x, y]) => {
      if (x === fx && y === fy) return false;
      return (Math.abs(x - fx) + Math.abs(y - fy)) === 1;
    });

    if (adjacent.length > 0) {
      this.secondSwitch = adjacent[Math.floor(this.rng() * adjacent.length)];
    } else {
      const others = this.cans.filter(([x, y]) => x !== fx || y !== fy);
      this.secondSwitch = others[Math.floor(this.rng() * others.length)];
    }
  }

  /** Resolves checking the can at (x, y), advancing/resetting puzzle state. */
  checkCan(x: number, y: number): TrashCanOutcome {
    const isFirst = this.firstSwitch && x === this.firstSwitch[0] && y === this.firstSwitch[1];
    const isSecond = this.secondSwitch && x === this.secondSwitch[0] && y === this.secondSwitch[1];

    if (!this.firstFound) {
      if (isFirst) {
        this.firstFound = true;
        return 'first-found';
      }
      return 'empty';
    }

    if (isSecond) {
      return 'gate-open';
    }
    this.firstFound = false;
    this.randomizeSwitches();
    return 'reset';
  }
}

// ── The outcome -> what the scene does table ─────────────────────────────────
//
// Extracted verbatim from OverworldScene.handleSurgeTrashCan()'s switch, plus
// its "the gate is already open" short-circuit above it. Behaviour-preserving:
// the same four outcomes with the same message strings, the same three that
// play the bump SFX, and the flag still written by the scene at the same
// moment — before the text box, not from its onComplete (so quitting with the
// "electric gate opened" line still up leaves the gate open on the next boot;
// `openSurgeGate()` redraws the fence from the flag on every map load).

/** The flag that records a solved puzzle. Read by `initSurgeTrashPuzzle()`. */
export const SURGE_GATE_FLAG = 'surge_gate_open';

/**
 * The fifth "outcome": the gate is already open, so the cans are just cans and
 * the puzzle is never consulted. Not a `TrashCanOutcome` because `checkCan()`
 * cannot return it — it is decided before the puzzle is asked.
 */
export type TrashCanState = TrashCanOutcome | 'already-open';

export interface SurgeCanResult {
  /** Exactly what the scene shows. */
  messages: string[];
  /** True only for 'gate-open': the scene writes SURGE_GATE_FLAG and, from the text box's onComplete, calls openSurgeGate(). */
  opensGate: boolean;
  /** Whether the scene plays the bump SFX. The two "nothing in the trash can" readings are silent. */
  bump: boolean;
}

const EMPTY_CAN = ["There's nothing in\nthe trash can."];

/** Every reading of a trash can, exhaustively. */
export const SURGE_CAN_RESULTS: Record<TrashCanState, SurgeCanResult> = {
  'first-found': {
    messages: [
      "Hey! There's a\nswitch under the",
      'trash! Turn it on!',
      'The first lock was\nopened!',
    ],
    opensGate: false,
    bump: true,
  },
  'gate-open': {
    messages: [
      "Hey! There's another\nswitch under the",
      'trash! Turn it on!',
      'The second lock was\nopened!',
      'The electric gate\nopened!',
    ],
    opensGate: true,
    bump: true,
  },
  reset: {
    messages: [
      "Nope, there's only\ntrash here.",
      'Hey! The electric\nlock was reset!',
    ],
    opensGate: false,
    bump: true,
  },
  empty: { messages: EMPTY_CAN, opensGate: false, bump: false },
  'already-open': { messages: EMPTY_CAN, opensGate: false, bump: false },
};

/** What the scene does about one reading. Returns fresh arrays. */
export function surgeCanResult(outcome: TrashCanState): SurgeCanResult {
  const result = SURGE_CAN_RESULTS[outcome];
  return { messages: result.messages.slice(), opensGate: result.opensGate, bump: result.bump };
}

/**
 * Checking the trash can the player is facing. With the gate already open the
 * puzzle is NOT consulted at all (`checkCan` is never called, so its hidden
 * first-switch state cannot be disturbed by a post-badge poke at the cans) and
 * the player just gets the empty-can line.
 */
export function surgeTrashCan(gateOpen: boolean, checkCan: () => TrashCanOutcome): SurgeCanResult {
  return surgeCanResult(gateOpen ? 'already-open' : checkCan());
}
