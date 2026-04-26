import { describe, it, expect } from 'vitest';
import {
  evaluateLine,
  spin,
  REEL_STRIPS,
  PAYOUT_TABLE,
  SlotSymbol,
  Bet,
} from '../../src/logic/slotMachine';

const ALL_SYMBOLS: SlotSymbol[] = [
  'SEVEN', 'PIKACHU', 'JIGGLY', 'ODDISH', 'PSYDUCK', 'CHERRY', 'BAR', 'REPLAY',
];

describe('evaluateLine', () => {
  describe('triple matches scale by bet', () => {
    for (const sym of ['SEVEN', 'PIKACHU', 'JIGGLY', 'ODDISH', 'PSYDUCK', 'BAR', 'CHERRY'] as SlotSymbol[]) {
      it(`triple ${sym} pays the table value for each bet`, () => {
        for (const bet of [1, 2, 3] as Bet[]) {
          const result = evaluateLine([sym, sym, sym], bet);
          expect(result.payout).toBe(PAYOUT_TABLE[sym][bet - 1]);
          expect(result.isReplay).toBe(false);
        }
      });
    }
  });

  it('triple SEVEN is the jackpot match type', () => {
    expect(evaluateLine(['SEVEN', 'SEVEN', 'SEVEN'], 3).matchType).toBe('jackpot_seven');
  });

  it('triple PIKACHU is three_pikachu', () => {
    expect(evaluateLine(['PIKACHU', 'PIKACHU', 'PIKACHU'], 3).matchType).toBe('three_pikachu');
  });

  it('triple JIGGLY/ODDISH/PSYDUCK is three_pokemon', () => {
    for (const sym of ['JIGGLY', 'ODDISH', 'PSYDUCK'] as SlotSymbol[]) {
      expect(evaluateLine([sym, sym, sym], 2).matchType).toBe('three_pokemon');
    }
  });

  it('triple BAR is three_bar', () => {
    expect(evaluateLine(['BAR', 'BAR', 'BAR'], 1).matchType).toBe('three_bar');
  });

  it('triple CHERRY is three_cherry', () => {
    expect(evaluateLine(['CHERRY', 'CHERRY', 'CHERRY'], 1).matchType).toBe('three_cherry');
  });

  it('triple REPLAY refunds the bet', () => {
    const result = evaluateLine(['REPLAY', 'REPLAY', 'REPLAY'], 2);
    expect(result.matchType).toBe('replay');
    expect(result.isReplay).toBe(true);
    expect(result.payout).toBe(0);
  });

  describe('single cherry on left reel', () => {
    it('pays the consolation prize when middle/right do not match left', () => {
      const result = evaluateLine(['CHERRY', 'BAR', 'JIGGLY'], 1);
      expect(result.matchType).toBe('two_cherry');
      expect(result.payout).toBe(1);
    });

    it('scales by bet (bet 2 = 2 coins, bet 3 = 4 coins)', () => {
      expect(evaluateLine(['CHERRY', 'BAR', 'JIGGLY'], 2).payout).toBe(2);
      expect(evaluateLine(['CHERRY', 'BAR', 'JIGGLY'], 3).payout).toBe(4);
    });

    it('triple CHERRY does not also count as two_cherry', () => {
      expect(evaluateLine(['CHERRY', 'CHERRY', 'CHERRY'], 1).matchType).toBe('three_cherry');
    });
  });

  describe('no match', () => {
    it('returns 0 payout and matchType "none"', () => {
      const result = evaluateLine(['BAR', 'JIGGLY', 'ODDISH'], 3);
      expect(result.matchType).toBe('none');
      expect(result.payout).toBe(0);
      expect(result.isReplay).toBe(false);
    });

    it('left reel that is not a cherry does not pay', () => {
      expect(evaluateLine(['BAR', 'CHERRY', 'CHERRY'], 1).matchType).toBe('none');
    });
  });
});

describe('spin', () => {
  it('returns reels matching the chosen indices on each strip', () => {
    // rng returns 0, then 0, then 0 → all reels land on index 0 of their strips
    const seq = [0, 0, 0];
    let i = 0;
    const rng = () => seq[i++];
    const result = spin(rng, 1);
    expect(result.reelIndices).toEqual([0, 0, 0]);
    expect(result.reels).toEqual([
      REEL_STRIPS[0][0], REEL_STRIPS[1][0], REEL_STRIPS[2][0],
    ]);
  });

  it('produces a triple-7 jackpot when all three reels point at the SEVEN slot', () => {
    // SEVEN is at the last index (20) on every strip. rng() * 21 floored → 20
    // requires rng() in [20/21, 1). Use 0.99 to be safe.
    const rng = () => 0.99;
    const result = spin(rng, 3);
    expect(result.reels).toEqual(['SEVEN', 'SEVEN', 'SEVEN']);
    expect(result.matchType).toBe('jackpot_seven');
    expect(result.payout).toBe(PAYOUT_TABLE.SEVEN[2]);
  });

  it('respects bet multiplier in payout', () => {
    const rng = () => 0.99; // triple SEVEN
    expect(spin(rng, 1).payout).toBe(PAYOUT_TABLE.SEVEN[0]);
    expect(spin(rng, 2).payout).toBe(PAYOUT_TABLE.SEVEN[1]);
    expect(spin(rng, 3).payout).toBe(PAYOUT_TABLE.SEVEN[2]);
  });
});

describe('REEL_STRIPS invariants', () => {
  it('every strip has exactly 21 symbols (matches Yellow)', () => {
    expect(REEL_STRIPS[0]).toHaveLength(21);
    expect(REEL_STRIPS[1]).toHaveLength(21);
    expect(REEL_STRIPS[2]).toHaveLength(21);
  });

  it('every strip contains every symbol at least once', () => {
    for (const reelKey of [0, 1, 2] as const) {
      const strip = REEL_STRIPS[reelKey];
      for (const sym of ALL_SYMBOLS) {
        expect(strip, `reel ${reelKey} missing ${sym}`).toContain(sym);
      }
    }
  });

  it('SEVEN is rare on every strip (≤ 2 per strip)', () => {
    for (const reelKey of [0, 1, 2] as const) {
      const sevenCount = REEL_STRIPS[reelKey].filter(s => s === 'SEVEN').length;
      expect(sevenCount).toBeLessThanOrEqual(2);
      expect(sevenCount).toBeGreaterThanOrEqual(1);
    }
  });

  it('left reel has more cherries than right reel (consolation rule)', () => {
    const leftCherries = REEL_STRIPS[0].filter(s => s === 'CHERRY').length;
    const rightCherries = REEL_STRIPS[2].filter(s => s === 'CHERRY').length;
    expect(leftCherries).toBeGreaterThan(rightCherries);
  });
});

describe('PAYOUT_TABLE', () => {
  it('every entry monotonically increases with bet', () => {
    for (const sym of Object.keys(PAYOUT_TABLE) as SlotSymbol[]) {
      const [b1, b2, b3] = PAYOUT_TABLE[sym];
      expect(b2).toBeGreaterThanOrEqual(b1);
      expect(b3).toBeGreaterThanOrEqual(b2);
    }
  });

  it('SEVEN is the highest single-triple payout at every bet level', () => {
    for (let bet = 0 as 0 | 1 | 2; bet <= 2; bet++) {
      const sevenPay = PAYOUT_TABLE.SEVEN[bet];
      for (const sym of Object.keys(PAYOUT_TABLE) as SlotSymbol[]) {
        if (sym === 'SEVEN') continue;
        expect(PAYOUT_TABLE[sym][bet]).toBeLessThan(sevenPay);
      }
    }
  });
});
