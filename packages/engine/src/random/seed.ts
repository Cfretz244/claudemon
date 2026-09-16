/** Mulberry32: explicit state, isolated from rendering randomness. */
export class SeededRandom {
  constructor(public state: number) {
    this.state >>>= 0;
  }
  next = (): number => {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let n = this.state;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}
