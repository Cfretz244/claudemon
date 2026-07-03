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
