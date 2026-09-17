// Pins `trainerPrizeMoney` to the numbers the shipped game pays TODAY, for one
// battle of every trainer class in the game. The extraction moved the rule out
// of `BattleScene.handleBattleEnd()`; these are the payouts measured on main
// before the move (see docs/reviews/pr114-behaviour.md §6), so a future edit
// that "fixes" the rule to read the data files has to change this file and say
// why.
import { describe, it, expect } from 'vitest';
import { trainerPrizeMoney } from '../src/battle/rewards';
import { createPokemon } from '../src/entities/Pokemon';
import { TRAINERS } from '../src/data/trainers';
import { GYM_LEADERS } from '../src/data/gymLeaders';
import { ELITE_FOUR, CHAMPION } from '../src/data/eliteFour';

/** The mon still on the field when a trainer runs out of party: their last. */
const finalOf = (team: Array<{ speciesId: number; level: number }>) => {
  const last = team[team.length - 1];
  return createPokemon(last.speciesId, last.level);
};

describe('trainerPrizeMoney', () => {
  it('is the final opponent level x 50, for every trainer class', () => {
    const cases: Array<[string, Array<{ speciesId: number; level: number }>, number, number]> = [
      // name, team, final level, payout
      ['normal trainer (BUG CATCHER RICK)', TRAINERS.forest_trainer1.team, 6, 300],
      ['gym leader (BROCK)', GYM_LEADERS.brock.team, 12, 600],
      ['Elite Four (LORELEI)', ELITE_FOUR[0].team, 56, 2800],
      ['Champion', CHAMPION.team, 65, 3250],
      ['lab rival', TRAINERS.rival_lab.team, 5, 250],
      ['Route 22 rival', TRAINERS.rival_route22.team, 8, 400],
    ];
    for (const [label, team, level, payout] of cases) {
      const final = finalOf(team);
      expect(final.level, label).toBe(level);
      expect(trainerPrizeMoney(final), label).toBe(payout);
    }
  });

  it('ignores the `prizeMoney` fields in the trainer data — they are dead', () => {
    // Deliberate: no code path has ever read them, and honouring them would
    // silently change every payout in the game. Listed here so the difference
    // is a documented decision rather than an oversight.
    expect(TRAINERS.forest_trainer1.prizeMoney).toBe(60);
    expect(trainerPrizeMoney(finalOf(TRAINERS.forest_trainer1.team))).toBe(300);
    expect(GYM_LEADERS.brock.prizeMoney).toBe(1386);
    expect(trainerPrizeMoney(finalOf(GYM_LEADERS.brock.team))).toBe(600);
    expect(CHAMPION.prizeMoney).toBe(6435);
    expect(trainerPrizeMoney(finalOf(CHAMPION.team))).toBe(3250);
  });

  it('scales linearly and pays nothing for a level-0 opponent', () => {
    const mon = createPokemon(25, 5);
    expect(trainerPrizeMoney({ ...mon, level: 1 })).toBe(50);
    expect(trainerPrizeMoney({ ...mon, level: 100 })).toBe(5000);
    expect(trainerPrizeMoney({ ...mon, level: 0 })).toBe(0);
  });
});
