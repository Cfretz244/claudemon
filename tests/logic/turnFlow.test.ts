import { describe, it, expect } from 'vitest';
import { roundContinues } from '../../src/logic/turnFlow';

describe('roundContinues', () => {
  const cases: Array<{ name: string; firstHp: number; secondHp: number; expected: boolean }> = [
    { name: 'both alive: the second mover acts', firstHp: 20, secondHp: 14, expected: true },
    { name: 'both at 1 HP: still a round', firstHp: 1, secondHp: 1, expected: true },
    // The bug this module fixes: SELF-DESTRUCT / EXPLOSION (and recoil) can
    // leave the FIRST mover at 0 HP. Gen I ends the round on any faint.
    { name: 'first mover self-destructed: round is over', firstHp: 0, secondHp: 14, expected: false },
    { name: 'normal KO, second mover fainted', firstHp: 20, secondHp: 0, expected: false },
    { name: 'both fainted (self-destruct KO)', firstHp: 0, secondHp: 0, expected: false },
    { name: 'negative HP is fainted too', firstHp: -3, secondHp: 14, expected: false },
  ];

  for (const { name, firstHp, secondHp, expected } of cases) {
    it(name, () => {
      expect(roundContinues({ currentHp: firstHp }, { currentHp: secondHp })).toBe(expected);
    });
  }

  it('is symmetric in its arguments (either faint ends the round)', () => {
    expect(roundContinues({ currentHp: 0 }, { currentHp: 5 }))
      .toBe(roundContinues({ currentHp: 5 }, { currentHp: 0 }));
  });
});
