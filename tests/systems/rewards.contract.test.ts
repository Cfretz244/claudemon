// `BattleScene` imports Phaser, which cannot load in the node test env, so —
// the idiom used by `expBar.contract.test.ts` and friends — this reads it as
// source text. It pins the one thing the unit test on `trainerPrizeMoney`
// cannot see: that the scene actually CALLS the shared rule instead of keeping
// its own copy of `level * 50`.
import { describe, it, expect } from 'vitest';
import BATTLE_SCENE_SRC from '../../src/scenes/BattleScene.ts?raw';
import { trainerPrizeMoney } from '@claudemon/engine/battle/rewards';
import { createPokemon } from '../../src/entities/Pokemon';

describe('BattleScene pays out through the engine', () => {
  it('imports trainerPrizeMoney from the engine package', () => {
    expect(BATTLE_SCENE_SRC).toContain(
      "import { trainerPrizeMoney } from '@claudemon/engine/battle/rewards';",
    );
  });

  it('the payout site calls it with the final opponent', () => {
    const start = BATTLE_SCENE_SRC.indexOf('// Prize money');
    expect(start).toBeGreaterThan(-1);
    const block = BATTLE_SCENE_SRC.slice(start, start + 200);
    expect(block).toContain('const prizeMoney = trainerPrizeMoney(this.opponentPokemon);');
    expect(block).toContain('this.playerState.money += prizeMoney;');
  });

  it('keeps no second copy of the rule in the scene', () => {
    expect(BATTLE_SCENE_SRC).not.toMatch(/level\s*\*\s*50/);
  });

  it('and the rule itself still pays what it paid before the move', () => {
    expect(trainerPrizeMoney(createPokemon(95, 12))).toBe(600);
  });
});
