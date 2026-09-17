// The engine's deterministic RNG. Every rule function that consumes randomness
// takes an optional trailing `rng: () => number` defaulting to `Math.random`,
// so the Phaser app keeps the platform RNG untouched while a consumer (the 3D
// client, a replay, a test) can hand in a seeded stream and get the same
// battle twice.
//
// Mulberry32: one 32-bit word of state, uniform on [0, 1), fast, and with no
// hidden global — two instances with the same seed never interfere.

/** A source of uniform numbers in [0, 1), interchangeable with `Math.random`. */
export type Rng = () => number;

export class SeededRandom {
  constructor(public state: number) {
    this.state >>>= 0;
  }

  /**
   * Bound on construction (an arrow property, not a method) so `seeded.next`
   * can be passed straight into an `rng` parameter without a wrapper.
   */
  next = (): number => {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let n = this.state;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

/** `new SeededRandom(seed).next`, for the common "just give me a stream" case. */
export function seededRng(seed: number): Rng {
  return new SeededRandom(seed).next;
}
