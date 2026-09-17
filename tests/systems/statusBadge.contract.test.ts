import { describe, it, expect } from 'vitest';
import BATTLE_SCENE_SRC from '../../src/scenes/BattleScene.ts?raw';
import BATTLE_HUD_SRC from '../../src/components/BattleHUD.ts?raw';
import MOVE_SRC from '../../packages/engine/src/battle/move.ts?raw';

/**
 * `BattleScene` and `BattleHUD` both import Phaser, which cannot be loaded in
 * the node test environment, so - the same idiom as `entrances.contract.test.ts`
 * and `moveOverrides.test.ts` - these read the scene as source text. That is
 * enough to pin the thing #116 fixed and that no unit test can see: the
 * wake / thaw branches redraw the HUD *before* they put their message up, so
 * the SLP / FRZ badge is already gone while the player reads "woke up!".
 *
 * R3 moved the decision into `packages/engine/src/battle/move.ts`, which names
 * the two refresh points on the event (`presentation.refreshHudBefore` /
 * `refreshHudAfter`). WHICH branches refresh is pinned behaviourally in
 * `packages/engine/tests/moveContract.test.ts` ("#116: the HUD refresh points
 * survive as event fields"); what is pinned here is that the renderer still
 * draws them at the same two moments relative to the text and the bars.
 */

const RENDER = BATTLE_SCENE_SRC.slice(
  BATTLE_SCENE_SRC.indexOf('private renderMoveEvent('),
  BATTLE_SCENE_SRC.indexOf('private settleMoveEvent('),
);
const SETTLE = BATTLE_SCENE_SRC.slice(
  BATTLE_SCENE_SRC.indexOf('private settleMoveEvent('),
  BATTLE_SCENE_SRC.indexOf('private applyStatusDamage('),
);

describe('waking and thawing clear the badge immediately', () => {
  it('the engine asks for the refresh on exactly the status-changing branches', () => {
    const set = MOVE_SRC.match(/const PRE_ACTION_REFRESHES_HUD: PreActionAction\[\] = \[([^\]]*)\]/);
    expect(set).not.toBeNull();
    const branches = set![1].split(',').map(b => b.trim().replace(/'/g, '')).filter(Boolean).sort();
    expect(branches).toEqual(['confusion-self-hit', 'sleep-wake', 'thaw']);
    // 'sleep', 'frozen' and 'paralyzed' leave `status` exactly as the badge
    // already shows it, so an extra redraw there would be noise.
    for (const quiet of ['sleep', 'frozen', 'paralyzed']) expect(branches).not.toContain(quiet);
  });

  it('the renderer redraws BEFORE the pre-action text goes up', () => {
    const hud = RENDER.indexOf('if (event.presentation.refreshHudBefore) this.updateHUD();');
    expect(hud).toBeGreaterThan(-1);
    // Every way out of renderMoveEvent shows its text after that point.
    const shows = [...RENDER.matchAll(/this\.textBox\.show\(/g)].map(m => m.index!);
    expect(shows.length).toBeGreaterThan(0);
    for (const show of shows) expect(hud).toBeLessThan(show);
  });

  it('the refresh is the event\'s call, not a branch the scene re-derives', () => {
    // The scene must not second-guess it: no status/sleep tests of its own in
    // the renderer half.
    expect(RENDER).not.toMatch(/StatusCondition\./);
    expect(RENDER).not.toMatch(/woke up|thawed/i);
  });
});

describe('status moves redraw the HUD as well', () => {
  it('the post-animation half waits for the bars, then redraws, then talks', () => {
    // A status move has no HP tween of its own unless it moved HP, so without
    // this a badge it applied (THUNDER WAVE, TOXIC, REST) - or HP it restored
    // (RECOVER, SOFTBOILED) - only appeared during the opponent's reply.
    const finish = SETTLE.indexOf('const finish = () => {');
    expect(finish).toBeGreaterThan(-1);
    const body = SETTLE.slice(finish, SETTLE.indexOf('};', finish));
    const hud = body.indexOf('this.updateHUD()');
    const show = body.indexOf('this.textBox.show(event.messages');
    expect(hud).toBeGreaterThan(-1);
    expect(show).toBeGreaterThan(-1);
    expect(hud).toBeLessThan(show);
    expect(SETTLE).toContain('void Promise.all(bars).then(finish);');
  });

  it('animates the HP bar of whichever side the move changed', () => {
    // Both sides are checked: RECOVER heals the attacker, an HP-draining
    // status effect would move the defender. The engine decides which.
    expect(SETTLE).toContain('if (pres.animateAttackerHp) bars.push(this.animateHpBar(event.actorIsPlayer');
    expect(SETTLE).toContain('if (pres.animateDefenderHp) bars.push(this.animateHpBar(!event.actorIsPlayer');
    expect(MOVE_SRC).toContain('pres.animateAttackerHp = sp.currentHp !== atkHpBefore;');
    expect(MOVE_SRC).toContain('pres.animateDefenderHp = sq.currentHp !== defHpBefore;');
  });

  it('a turn that moved no HP waits for nothing (no unconditional 500 ms)', () => {
    expect(SETTLE).toContain('if (bars.length > 0) void Promise.all(bars).then(finish);');
    expect(SETTLE).toContain('else finish();');
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
