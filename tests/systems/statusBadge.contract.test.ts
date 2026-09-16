import { describe, it, expect } from 'vitest';
import BATTLE_SCENE_SRC from '../../src/scenes/BattleScene.ts?raw';
import BATTLE_HUD_SRC from '../../src/components/BattleHUD.ts?raw';

/**
 * `BattleScene` and `BattleHUD` both import Phaser, which cannot be loaded in
 * the node test environment, so - the same idiom as `entrances.contract.test.ts`
 * and `moveOverrides.test.ts` - these read the scene as source text. That is
 * enough to pin the thing this PR fixes and that no unit test can see: the
 * wake / thaw branches redraw the HUD *before* they put their message up, so
 * the SLP / FRZ badge is already gone while the player reads "woke up!".
 */

/** The body of one `case '<name>':` in `resolvePreAction`'s switch. */
function preActionCase(name: string): string {
  const start = BATTLE_SCENE_SRC.indexOf(`case '${name}':`);
  expect(start).toBeGreaterThan(-1);
  const rest = BATTLE_SCENE_SRC.slice(start);
  const end = rest.indexOf('\n          return;');
  expect(end).toBeGreaterThan(-1);
  return rest.slice(0, end);
}

describe('pre-action switch: waking and thawing clear the badge immediately', () => {
  for (const branch of ['sleep-wake', 'thaw']) {
    it(`'${branch}' calls updateHUD() before textBox.show`, () => {
      const body = preActionCase(branch);
      const hud = body.indexOf('this.updateHUD()');
      const show = body.indexOf('this.textBox.show');
      expect(hud).toBeGreaterThan(-1);
      expect(show).toBeGreaterThan(-1);
      expect(hud).toBeLessThan(show);
    });
  }

  it("'confusion-self-hit' still refreshes too (the branch this copies)", () => {
    const body = preActionCase('confusion-self-hit');
    expect(body.indexOf('this.updateHUD()')).toBeLessThan(body.indexOf('this.textBox.show'));
  });

  it('the branches that do NOT change status are left alone', () => {
    // 'sleep', 'frozen' and 'paralyzed' leave `status` exactly as the badge
    // already shows it, so an extra redraw there would be noise.
    for (const branch of ['sleep', 'frozen', 'paralyzed']) {
      expect(preActionCase(branch)).not.toContain('this.updateHUD()');
    }
  });
});

describe('status moves redraw the HUD as well', () => {
  /** The `else` branch of doExecuteMove that handles power-0 status moves. */
  const statusBranch = (() => {
    const start = BATTLE_SCENE_SRC.indexOf('// Status move - effect always applies');
    expect(start).toBeGreaterThan(-1);
    return BATTLE_SCENE_SRC.slice(start, start + 1600);
  })();

  it('calls updateHUD() before its text', () => {
    // A status move has no HP tween, so it has no other redraw; without this,
    // a badge it applies (THUNDER WAVE, TOXIC, REST) - or HP it restored
    // (RECOVER, SOFTBOILED) - only appeared during the opponent's reply.
    const hud = statusBranch.indexOf('this.updateHUD()');
    const show = statusBranch.indexOf('this.textBox.show');
    expect(hud).toBeGreaterThan(-1);
    expect(show).toBeGreaterThan(-1);
    expect(hud).toBeLessThan(show);
  });

  it('animates the HP bar of whichever side the move changed', () => {
    expect(statusBranch).toContain('animatePlayerHP');
    expect(statusBranch).toContain('animateOpponentHP');
    // Both sides are checked: RECOVER heals the attacker, an HP-draining
    // status effect would move the defender.
    expect(statusBranch).toContain('attacker.currentHp !== atkHpBefore');
    expect(statusBranch).toContain('defender.currentHp !== defHpBefore');
  });

  it('waits for the bar before the message, as the damage path does', () => {
    const all = statusBranch.indexOf('Promise.all(bars)');
    expect(all).toBeGreaterThan(-1);
    expect(all).toBeLessThan(statusBranch.indexOf('this.updateHUD()'));
  });
});

describe('the end-of-turn tick still refreshes', () => {
  it('burn/poison and LEECH SEED redraw before their message', () => {
    const start = BATTLE_SCENE_SRC.indexOf('private applyStatusDamage');
    expect(start).toBeGreaterThan(-1);
    const body = BATTLE_SCENE_SRC.slice(start, BATTLE_SCENE_SRC.indexOf('resolve();\n    });', start));
    // Two ticks (burn/poison, LEECH SEED), each one updateHUD() then show().
    const order = [...body.matchAll(/this\.(updateHUD|textBox\.show)/g)].map(m => m[1]);
    expect(order).toEqual(['updateHUD', 'textBox.show', 'updateHUD', 'textBox.show']);
  });
});

describe('the HUD reads its badge from the pure module', () => {
  it('BattleHUD uses statusBadge() rather than a private table', () => {
    expect(BATTLE_HUD_SRC).toContain("from '../logic/statusBadge'");
    expect(BATTLE_HUD_SRC).toContain('statusBadge(pokemon.status)');
    expect(BATTLE_HUD_SRC).not.toContain('STATUS_LABELS');
  });

  it('updatePlayer and updateOpponent both refresh the badge', () => {
    for (const fn of ['updatePlayer', 'updateOpponent']) {
      const start = BATTLE_HUD_SRC.indexOf(`${fn}(pokemon: PokemonInstance)`);
      expect(start).toBeGreaterThan(-1);
      expect(BATTLE_HUD_SRC.slice(start, start + 600)).toContain('this.updateStatus(pokemon');
    }
  });
});
