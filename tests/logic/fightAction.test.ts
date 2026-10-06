import { describe, it, expect } from 'vitest';
import { fightAction, hasSelectableMove, noMovesLeftText } from '../../src/logic/fightAction';
import BATTLE_MENU_SRC from '../../src/components/BattleMenu.ts?raw';
import BATTLE_SCENE_SRC from '../../src/scenes/BattleScene.ts?raw';

const pp = (...values: number[]) => values.map(currentPp => ({ currentPp }));

describe('fightAction: what FIGHT does (Gen I AnyMoveToSelect)', () => {
  it('every slot dry -> STRUGGLE on slot 0, the move list never opens', () => {
    expect(fightAction(pp(0, 0, 0, 0))).toEqual({ kind: 'struggle', moveIndex: 0 });
    expect(fightAction(pp(0))).toEqual({ kind: 'struggle', moveIndex: 0 });
  });

  it('any slot with PP -> the move list', () => {
    expect(fightAction(pp(0, 0, 0, 1))).toEqual({ kind: 'menu' });
    expect(fightAction(pp(5, 0))).toEqual({ kind: 'menu' });
    expect(fightAction(pp(35, 30, 20, 10))).toEqual({ kind: 'menu' });
  });

  it('an empty move list counts as dry', () => {
    expect(fightAction([])).toEqual({ kind: 'struggle', moveIndex: 0 });
  });

  it("the disabled slot's PP is ignored: DISABLE on the last move with PP forces STRUGGLE", () => {
    expect(fightAction(pp(10, 0, 0, 0), 0)).toEqual({ kind: 'struggle', moveIndex: 0 });
    expect(fightAction(pp(0, 0, 7), 2)).toEqual({ kind: 'struggle', moveIndex: 0 });
  });

  it('a disabled slot leaves the list open while another slot has PP', () => {
    expect(fightAction(pp(10, 3), 0)).toEqual({ kind: 'menu' });
    expect(fightAction(pp(0, 3), 0)).toEqual({ kind: 'menu' });
  });

  it('no disable (-1, the default) looks at every slot', () => {
    expect(hasSelectableMove(pp(0, 0, 0, 1), -1)).toBe(true);
    expect(hasSelectableMove(pp(0, 0, 0, 0))).toBe(false);
  });
});

describe('noMovesLeftText', () => {
  it("is pokered's _NoMovesLeftText, broken after 'has no'", () => {
    expect(noMovesLeftText('PIKACHU')).toBe('PIKACHU has no\nmoves left!');
  });
});

// The menu and scene are Phaser classes the test environment cannot load, so
// the wiring is pinned at the source level (same approach as
// animationOutcome.test.ts); tools/struggle-menu-e2e.mjs is the live proof.
describe('wiring: FIGHT consults the rule', () => {
  it("BattleMenu's FIGHT case dispatches the struggle slot instead of opening the list", () => {
    const fight = BATTLE_MENU_SRC.slice(BATTLE_MENU_SRC.indexOf('case 0: { // FIGHT'));
    const body = fight.slice(0, fight.indexOf('case 1:'));
    expect(body).toContain('fightAction(this.currentMoves, this.disabledMoveIndex)');
    expect(body).toMatch(/kind === 'struggle'\) this\.onSelect\(\{ type: 'fight', moveIndex: action\.moveIndex \}\)/);
    expect(body).toContain('this.showMoveMenu()');
  });

  it('the scene passes the disabled slot to the menu and prints the Gen I line', () => {
    expect(BATTLE_SCENE_SRC).toContain('this.playerDisable.moveIndex,\n    );');
    expect(BATTLE_SCENE_SRC).toContain('noMovesLeftText(battleName(this.playerPokemon.speciesId, true))');
    // Turn order reads STRUGGLE's priority, not the dry slot's.
    expect(BATTLE_SCENE_SRC).toContain('MOVES_DATA[struggling ? STRUGGLE_MOVE_ID : playerMove.moveId]');
  });
});
