// Pure slot machine logic — no Phaser dependencies, fully unit-testable.
// Mirrors the Pokemon Yellow slot machine (asymmetric reel strips, payout
// scaling by bet, REPLAY refunds, and the special "cherry on left reel" rule).

export type SlotSymbol =
  | 'SEVEN'
  | 'PIKACHU'
  | 'JIGGLY'
  | 'ODDISH'
  | 'PSYDUCK'
  | 'CHERRY'
  | 'BAR'
  | 'REPLAY';

export type Bet = 1 | 2 | 3;

export type MatchType =
  | 'jackpot_seven'
  | 'three_pikachu'
  | 'three_pokemon'
  | 'three_bar'
  | 'three_cherry'
  | 'two_cherry'
  | 'replay'
  | 'none';

export interface SpinResult {
  reels: [SlotSymbol, SlotSymbol, SlotSymbol]; // visible center row, left → right
  reelIndices: [number, number, number]; // position on each strip that landed on the center row
  payout: number; // coins won (already scaled by bet)
  matchType: MatchType;
  isReplay: boolean; // true if bet should be refunded
}

// Each strip is exactly 21 symbols. Asymmetric distributions favor near-misses
// on the right reel and make CHERRY on the left reel reliably reachable.
export const REEL_STRIPS: Record<0 | 1 | 2, SlotSymbol[]> = {
  0: [
    'CHERRY', 'PSYDUCK', 'BAR', 'ODDISH', 'REPLAY',
    'CHERRY', 'JIGGLY', 'BAR', 'CHERRY', 'PIKACHU',
    'REPLAY', 'PSYDUCK', 'CHERRY', 'JIGGLY', 'BAR',
    'REPLAY', 'ODDISH', 'CHERRY', 'SEVEN', 'REPLAY',
    'SEVEN',
  ],
  1: [
    'BAR', 'JIGGLY', 'ODDISH', 'CHERRY', 'PIKACHU',
    'BAR', 'PSYDUCK', 'REPLAY', 'JIGGLY', 'ODDISH',
    'BAR', 'PSYDUCK', 'PIKACHU', 'JIGGLY', 'CHERRY',
    'REPLAY', 'ODDISH', 'PSYDUCK', 'BAR', 'REPLAY',
    'SEVEN',
  ],
  2: [
    'BAR', 'PSYDUCK', 'JIGGLY', 'BAR', 'ODDISH',
    'CHERRY', 'BAR', 'JIGGLY', 'PSYDUCK', 'REPLAY',
    'BAR', 'ODDISH', 'PSYDUCK', 'JIGGLY', 'CHERRY',
    'BAR', 'REPLAY', 'ODDISH', 'PIKACHU', 'REPLAY',
    'SEVEN',
  ],
};

// Triple-match payout for [bet1, bet2, bet3]. CHERRY is the triple-cherry value;
// the "any single cherry on left reel" prize is handled in evaluateLine().
export const PAYOUT_TABLE: Record<SlotSymbol, [number, number, number]> = {
  SEVEN:   [100, 200, 300],
  PIKACHU: [ 30,  60, 100],
  JIGGLY:  [ 12,  24,  40],
  ODDISH:  [ 12,  24,  40],
  PSYDUCK: [ 12,  24,  40],
  BAR:     [  6,  12,  20],
  CHERRY:  [  3,   5,   8],
  REPLAY:  [  0,   0,   0],
};

const TWO_CHERRY_PAYOUT: Record<Bet, number> = { 1: 1, 2: 2, 3: 4 };

export function evaluateLine(
  reels: [SlotSymbol, SlotSymbol, SlotSymbol],
  bet: Bet
): { payout: number; matchType: MatchType; isReplay: boolean } {
  const [a, b, c] = reels;

  if (a === b && b === c) {
    if (a === 'REPLAY') {
      return { payout: 0, matchType: 'replay', isReplay: true };
    }
    if (a === 'SEVEN') {
      return { payout: PAYOUT_TABLE.SEVEN[bet - 1], matchType: 'jackpot_seven', isReplay: false };
    }
    if (a === 'PIKACHU') {
      return { payout: PAYOUT_TABLE.PIKACHU[bet - 1], matchType: 'three_pikachu', isReplay: false };
    }
    if (a === 'JIGGLY' || a === 'ODDISH' || a === 'PSYDUCK') {
      return { payout: PAYOUT_TABLE[a][bet - 1], matchType: 'three_pokemon', isReplay: false };
    }
    if (a === 'BAR') {
      return { payout: PAYOUT_TABLE.BAR[bet - 1], matchType: 'three_bar', isReplay: false };
    }
    if (a === 'CHERRY') {
      return { payout: PAYOUT_TABLE.CHERRY[bet - 1], matchType: 'three_cherry', isReplay: false };
    }
  }

  // Single cherry on the left reel pays a small consolation prize.
  if (a === 'CHERRY') {
    return { payout: TWO_CHERRY_PAYOUT[bet], matchType: 'two_cherry', isReplay: false };
  }

  return { payout: 0, matchType: 'none', isReplay: false };
}

function pickIndex(strip: SlotSymbol[], rng: () => number): number {
  return Math.floor(rng() * strip.length);
}

export function spin(rng: () => number, bet: Bet): SpinResult {
  let i0 = pickIndex(REEL_STRIPS[0], rng);
  let i1 = pickIndex(REEL_STRIPS[1], rng);
  let i2 = pickIndex(REEL_STRIPS[2], rng);

  // Bet-3 luck boost: when the natural result is no match, give a small chance
  // to bias the middle reel toward REPLAY for a free spin. Cosmetic — same
  // intent as Yellow's bet-3 incentive.
  const naturalReels: [SlotSymbol, SlotSymbol, SlotSymbol] = [
    REEL_STRIPS[0][i0],
    REEL_STRIPS[1][i1],
    REEL_STRIPS[2][i2],
  ];
  const naturalEval = evaluateLine(naturalReels, bet);

  if (bet === 3 && naturalEval.matchType === 'none' && rng() < 0.1) {
    // Try to find a REPLAY match by lining up REPLAY on all three reels.
    if (naturalReels[0] === 'REPLAY' && naturalReels[2] === 'REPLAY') {
      const middleReplayIdx = REEL_STRIPS[1].findIndex(s => s === 'REPLAY');
      if (middleReplayIdx !== -1) i1 = middleReplayIdx;
    }
  }

  const reels: [SlotSymbol, SlotSymbol, SlotSymbol] = [
    REEL_STRIPS[0][i0],
    REEL_STRIPS[1][i1],
    REEL_STRIPS[2][i2],
  ];
  const result = evaluateLine(reels, bet);

  return {
    reels,
    reelIndices: [i0, i1, i2],
    payout: result.payout,
    matchType: result.matchType,
    isReplay: result.isReplay,
  };
}
