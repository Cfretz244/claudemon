import { describe, it, expect } from 'vitest';
import BATTLE_SCENE_SRC from '../../src/scenes/BattleScene.ts?raw';
import BATTLE_HUD_SRC from '../../src/components/BattleHUD.ts?raw';
import PARTY_SCREEN_SRC from '../../src/components/PartyScreen.ts?raw';

/**
 * `BattleScene`, `BattleHUD` and `PartyScreen` all import Phaser, which cannot
 * be loaded in the node test environment, so - the same idiom as
 * `statusBadge.contract.test.ts` - these read them as source text. That is
 * enough to pin the two things about the EXP bar that no unit test can see:
 * it is drawn in the PLAYER's box only, and the fill animation finishes before
 * the "grew to Lv." message goes up.
 */

/** The body of the EXP-award loop in `handleOpponentFaint`. */
const expLoop = (() => {
  const start = BATTLE_SCENE_SRC.indexOf('// Award EXP to each living participant');
  expect(start).toBeGreaterThan(-1);
  const end = BATTLE_SCENE_SRC.indexOf('// Update HUD in case active Pokemon leveled up', start);
  expect(end).toBeGreaterThan(start);
  return BATTLE_SCENE_SRC.slice(start, end);
})();

describe('the HUD reads the bar from the pure module', () => {
  it('BattleHUD imports expProgress from src/logic/expBar', () => {
    expect(BATTLE_HUD_SRC).toContain("from '../logic/expBar'");
    expect(BATTLE_HUD_SRC).toContain('expProgress(pokemon).fraction');
  });

  it('updatePlayer sets the bar from expProgress', () => {
    const start = BATTLE_HUD_SRC.indexOf('updatePlayer(pokemon: PokemonInstance)');
    expect(start).toBeGreaterThan(-1);
    expect(BATTLE_HUD_SRC.slice(start, start + 600)).toContain('this.setPlayerExp(expProgress(pokemon).fraction)');
  });
});

describe('the EXP bar exists only in the player box', () => {
  it('updateOpponent never touches an EXP bar', () => {
    const start = BATTLE_HUD_SRC.indexOf('updateOpponent(pokemon: PokemonInstance)');
    expect(start).toBeGreaterThan(-1);
    const body = BATTLE_HUD_SRC.slice(start, start + 600);
    expect(body).not.toMatch(/[Ee]xp/);
  });

  it('there is no opponent-side EXP member at all', () => {
    expect(BATTLE_HUD_SRC).not.toMatch(/opponentExp/);
    // Every EXP-ish member the HUD touches is a player one; none of them
    // mention the opponent.
    const ids = [...BATTLE_HUD_SRC.matchAll(/this\.(\w*[Ee]xp\w*)/g)].map(m => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      expect(id).toMatch(/[Pp]layer/);
      expect(id).not.toMatch(/[Oo]pponent/);
    }
  });

  it('the bar is inside the player box, in whole pixels', () => {
    // Player box: fillRoundedRect(GAME_WIDTH - 82, 64, 80, 32).
    const x = /const EXP_BAR_X = GAME_WIDTH - (\d+);/.exec(BATTLE_HUD_SRC);
    const y = /const EXP_BAR_Y = (\d+);/.exec(BATTLE_HUD_SRC);
    const w = /const EXP_BAR_WIDTH = (\d+);/.exec(BATTLE_HUD_SRC);
    const h = /const EXP_BAR_HEIGHT = (\d+);/.exec(BATTLE_HUD_SRC);
    expect(x && y && w && h).toBeTruthy();
    const left = 160 - Number(x![1]);
    const top = Number(y![1]);
    expect(left).toBeGreaterThanOrEqual(160 - 82);
    expect(left + Number(w![1])).toBeLessThanOrEqual(160 - 2);
    expect(top).toBeGreaterThan(64);
    expect(top + Number(h![1])).toBeLessThanOrEqual(64 + 32);
    expect(Number(h![1])).toBeLessThanOrEqual(2);   // 1-2 px tall
    // Same left edge and width as the player HP bar: HealthBar(GAME_WIDTH - 74, 78, 62, 3).
    expect(Number(x![1])).toBe(74);
    expect(Number(w![1])).toBe(62);
  });

  it('the fill width is rounded to whole pixels', () => {
    expect(BATTLE_HUD_SRC).toContain('Math.round(EXP_BAR_WIDTH * this.playerExpFraction)');
  });

  it('animatePlayerExp returns a Promise and ticks the level text between legs', () => {
    const start = BATTLE_HUD_SRC.indexOf('animatePlayerExp(');
    expect(start).toBeGreaterThan(-1);
    const body = BATTLE_HUD_SRC.slice(start, start + 1600);
    expect(body).toContain('Promise<void>');
    expect(body).toContain('this.playerLevelText.setText(`Lv${next.level}`)');
    expect(body).toContain('this.setPlayerExp(next.from)');
    expect(BATTLE_HUD_SRC).toContain('msPerFull: number = 600');
    // The full bar is held for a beat before it wraps, or the player never
    // sees it full: the tween's last frame and the wrap are the same frame.
    expect(body).toContain('this.scene.time.delayedCall(EXP_LEVEL_HOLD_MS');
    expect(BATTLE_HUD_SRC).toMatch(/const EXP_LEVEL_HOLD_MS = \d+;/);
  });
});

describe('the battle EXP loop animates before it announces', () => {
  it('captures exp/level BEFORE addExperience mutates them', () => {
    const capture = expLoop.indexOf('const expBefore = pokemon.exp');
    const level = expLoop.indexOf('const levelBefore = pokemon.level');
    const add = expLoop.indexOf('addExperience(pokemon, expEach)');
    expect(capture).toBeGreaterThan(-1);
    expect(level).toBeGreaterThan(-1);
    expect(capture).toBeLessThan(add);
    expect(level).toBeLessThan(add);
  });

  it('awaits animatePlayerExp after addExperience and before the "grew to" text', () => {
    const anim = expLoop.indexOf('await this.hud.animatePlayerExp(');
    const add = expLoop.indexOf('addExperience(pokemon, expEach)');
    const grew = expLoop.indexOf('grew to');
    expect(anim).toBeGreaterThan(add);
    expect(grew).toBeGreaterThan(-1);
    expect(anim).toBeLessThan(grew);
  });

  it('builds the segments from the captured values', () => {
    expect(expLoop).toContain('expGainSegments(expBefore, levelBefore, pokemon.exp)');
    expect(BATTLE_SCENE_SRC).toContain("import { expGainSegments } from '../logic/expBar';");
  });

  it('only animates for the ACTIVE mon - a bench participant has no box', () => {
    expect(expLoop).toContain('if (pokemon === this.playerPokemon) {');
    const guard = expLoop.indexOf('if (pokemon === this.playerPokemon) {');
    expect(guard).toBeLessThan(expLoop.indexOf('await this.hud.animatePlayerExp('));
  });

  it('leaves the rest of the loop alone', () => {
    // The level-up jingle still fires where it always did, immediately before
    // addExperience, and the EXP message still precedes both.
    const gained = expLoop.indexOf('EXP. Points!');
    const jingle = expLoop.indexOf('soundSystem.levelUp()');
    const add = expLoop.indexOf('addExperience(pokemon, expEach)');
    expect(gained).toBeLessThan(jingle);
    expect(jingle).toBeLessThan(add);
    // Move learning and the evolution check still hang off each level-up.
    expect(expLoop).toContain('for (const lu of levelUps) {');
    expect(expLoop).toContain('checkEvolution(pokemon)');
  });
});

describe('the party summary quotes the same helper', () => {
  it('shows EXP to next Lv from src/logic/expBar', () => {
    expect(PARTY_SCREEN_SRC).toContain("from '../logic/expBar'");
    expect(PARTY_SCREEN_SRC).toContain('EXP to next Lv:');
    expect(PARTY_SCREEN_SRC).toContain('expToNextLevel(p)');
  });

  it('shows -- at level 100 rather than a meaningless 0', () => {
    expect(PARTY_SCREEN_SRC).toContain("p.level >= MAX_LEVEL ? '--'");
  });
});
