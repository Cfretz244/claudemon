import { describe, it, expect } from 'vitest';
import BATTLE_SCENE_SRC from '../../src/scenes/BattleScene.ts?raw';
import {
  CHARGE_MESSAGES,
  isChargeMove,
  isSemiInvulnerableCharge,
  chargeMessage,
  resolveChargeStep,
  cancelsCharge,
  clearsCharge,
  PreActionAction,
} from '../../src/logic/chargeMoves';
import { MOVES_DATA } from '../../src/data/moves';
import { MoveEffect } from '../../src/types/pokemon.types';

/** The six moves data/moves.ts tags MoveEffect.CHARGE. */
const CHARGE_IDS = [13, 19, 76, 91, 130, 143];
const NAMES: Record<number, string> = {
  13: 'RAZOR WIND', 19: 'FLY', 76: 'SOLAR BEAM',
  91: 'DIG', 130: 'SKULL BASH', 143: 'SKY ATTACK',
};

describe('the CHARGE move set', () => {
  it('is exactly the six moves tagged MoveEffect.CHARGE in the data', () => {
    const tagged = Object.keys(MOVES_DATA)
      .map(Number)
      .filter(id => MOVES_DATA[id].effect === MoveEffect.CHARGE)
      .sort((a, b) => a - b);
    expect(tagged).toEqual(CHARGE_IDS);
  });

  it.each(CHARGE_IDS)('%i is a charge move with a turn-1 message', id => {
    expect(isChargeMove(id)).toBe(true);
    expect(CHARGE_MESSAGES[id]).toBeTruthy();
    expect(MOVES_DATA[id].name).toBe(NAMES[id]);
  });

  it('is false for everything else, including near misses', () => {
    // HYPER BEAM (63) is the other "locked for a turn" move, but it recharges
    // AFTER firing rather than charging before, so it must not come through here.
    for (const id of [1, 63, 129, 144, 165]) expect(isChargeMove(id)).toBe(false);
    expect(isChargeMove(9999)).toBe(false);
  });

  it('only FLY and DIG take the user off the field', () => {
    expect(isSemiInvulnerableCharge(19)).toBe(true);
    expect(isSemiInvulnerableCharge(91)).toBe(true);
    for (const id of [13, 76, 130, 143]) expect(isSemiInvulnerableCharge(id)).toBe(false);
    // Not a charge move at all: never semi-invulnerable, whatever its id.
    expect(isSemiInvulnerableCharge(63)).toBe(false);
  });
});

describe('chargeMessage', () => {
  it.each([
    [76, 'BULBASAUR took in\nsunlight!'],
    [19, 'PIDGEY flew up high!'],
    [91, 'DIGLETT dug a hole!'],
    [130, 'SQUIRTLE lowered\nits head!'],
    [143, 'PIDGEOT is glowing!'],
    [13, 'PIDGEOTTO made a\nwhirlwind!'],
  ])('%i names the user', (id, expected) => {
    const name = (expected as string).split(' ')[0];
    expect(chargeMessage(id as number, name)).toBe(expected);
  });

  it('prefixes work, so the opponent-side name comes through verbatim', () => {
    expect(chargeMessage(76, 'Foe EXEGGUTOR')).toBe('Foe EXEGGUTOR took in\nsunlight!');
  });

  it('is null for a move that does not charge', () => {
    expect(chargeMessage(1, 'RATTATA')).toBeNull();
    expect(chargeMessage(63, 'SNORLAX')).toBeNull();
  });
});

describe('resolveChargeStep', () => {
  it('charges when nothing is stored', () => {
    expect(resolveChargeStep(null, 0)).toBe('charge');
    expect(resolveChargeStep(undefined, 2)).toBe('charge');
  });

  it('releases only the slot that was stored', () => {
    const charging = { moveIndex: 2, moveId: 76 };
    expect(resolveChargeStep(charging, 2)).toBe('release');
    expect(resolveChargeStep(charging, 0)).toBe('charge');
  });

  it('is idempotent per slot: two charges in a row cannot both release', () => {
    // The scene clears the state as the release starts, so this is the shape
    // the next use sees.
    expect(resolveChargeStep({ moveIndex: 1, moveId: 19 }, 1)).toBe('release');
    expect(resolveChargeStep(null, 1)).toBe('charge');
  });
});

describe('cancelsCharge', () => {
  const CANCELS: PreActionAction[] = [
    'sleep', 'frozen', 'paralyzed', 'flinch', 'confusion-self-hit',
  ];
  const KEEPS: PreActionAction[] = [
    'attack', 'confusion-attack', 'confusion-snap', 'sleep-wake', 'thaw', 'recharge',
  ];

  it.each(CANCELS)('%s loses the turn AND the stored move', action => {
    expect(cancelsCharge(action)).toBe(true);
  });

  it.each(KEEPS)('%s still lets the move come out', action => {
    expect(cancelsCharge(action)).toBe(false);
  });
});

describe('clearsCharge', () => {
  it('leaving the field drops the charge, with no message of its own', () => {
    expect(clearsCharge('switch-out')).toBe(true);
    expect(clearsCharge('faint')).toBe(true);
    expect(clearsCharge('battle-end')).toBe(true);
  });
});

/**
 * Scene wiring, in the repo's source-as-text idiom: BattleScene imports Phaser,
 * which cannot load in the node environment, so the contract is pinned by
 * reading the source. These are the four places the two-turn rule has to be
 * respected for the lock to be real.
 */
describe('BattleScene honours the charge lock', () => {
  it('the player menu never opens while the player is charging', () => {
    expect(BATTLE_SCENE_SRC).toMatch(
      /const charging = this\.playerVolatile\.charging;\s*\n\s*if \(charging\) \{[\s\S]{0,200}this\.executeTurn\(charging\.moveIndex\);/,
    );
  });

  it('selectAIMove is reached through one helper that respects the lock', () => {
    // Exactly one call site left, inside aiMoveIndex(), so no bag / ball /
    // potion / revive / run / switch path can re-roll a charging opponent.
    const calls = [...BATTLE_SCENE_SRC.matchAll(/selectAIMove\(/g)];
    expect(calls).toHaveLength(1);
    expect(BATTLE_SCENE_SRC).toMatch(
      /private aiMoveIndex\(\): number \{\s*\n\s*const charging = this\.opponentVolatile\.charging;\s*\n\s*if \(charging\) return charging\.moveIndex;/,
    );
  });

  it('a cancelled charge puts the user back on the field', () => {
    expect(BATTLE_SCENE_SRC).toMatch(/if \(event\.chargeCancelled\) this\.clearCharge\(isPlayer\);/);
    expect(BATTLE_SCENE_SRC).toMatch(/this\.clearCharge\(true\);/);   // player faint
    expect(BATTLE_SCENE_SRC).toMatch(/this\.clearCharge\(false\);/);  // opponent faint
    expect(BATTLE_SCENE_SRC).toMatch(/vol\.charging = null;/);        // switch / reset
  });

  it('delegates charge and release to the engine', () => {
    expect(BATTLE_SCENE_SRC).toContain('executeBattleMove(isPlayer ? player : opponent');
    expect(BATTLE_SCENE_SRC).not.toContain('private doChargeTurn(');
  });
  it('plays the engine phase and restores the sprite after release', () => {
    expect(BATTLE_SCENE_SRC).toContain('phase: event.phase');
    expect(BATTLE_SCENE_SRC).toContain("if (event.phase === 'release') sprite.setAlpha(1)");
  });
});
