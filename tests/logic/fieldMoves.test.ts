import { describe, it, expect } from 'vitest';
import {
  canUseFieldMove,
  hasFieldMoveBadge,
  partyKnowsMove,
  FIELD_MOVE_IDS,
  FIELD_MOVE_BADGES,
  FIELD_MOVE_MESSAGES,
  FIELD_MOVE_NEEDS_PARTY_MOVE,
  FieldMove,
  FieldMoveState,
} from '../../src/logic/fieldMoves';
import { GYM_LEADERS } from '../../src/data/gymLeaders';
import { MOVES_DATA } from '../../src/data/moves';

const MOVES: FieldMove[] = ['cut', 'fly', 'surf', 'strength', 'flash'];

/** A party state with the given move ids spread over one Pokemon. */
function state(badges: string[], moveIds: number[]): FieldMoveState {
  return { badges, party: [{ moves: moveIds.map(moveId => ({ moveId })) }] };
}
const withAll = (move: FieldMove) => state([FIELD_MOVE_BADGES[move]], [FIELD_MOVE_IDS[move]]);
const noBadge = (move: FieldMove) => state([], [FIELD_MOVE_IDS[move]]);
const noMove = (move: FieldMove) => state([FIELD_MOVE_BADGES[move]], []);
const neither = () => state([], []);

describe('field-move tables', () => {
  it('maps each field move to its Gym badge', () => {
    expect(FIELD_MOVE_BADGES).toEqual({
      cut: 'CASCADE',
      fly: 'THUNDER',
      surf: 'SOUL',
      strength: 'RAINBOW',
      flash: 'BOULDER',
    });
  });

  it('maps each field move to its MOVES_DATA id', () => {
    expect(FIELD_MOVE_IDS).toEqual({ cut: 15, fly: 19, surf: 57, strength: 70, flash: 148 });
  });

  it('every field-move id is a real move with the expected name', () => {
    for (const move of MOVES) {
      const data = MOVES_DATA[FIELD_MOVE_IDS[move]];
      expect(data, move).toBeDefined();
      expect(data.name).toBe(move.toUpperCase());
    }
  });

  it('every required badge is awarded by exactly one gym leader', () => {
    const leaderBadges = Object.values(GYM_LEADERS).map(l => l.badge);
    for (const move of MOVES) {
      const badge = FIELD_MOVE_BADGES[move];
      expect(leaderBadges.filter(b => b === badge), `${move} -> ${badge}`).toHaveLength(1);
    }
  });

  it('the five gates use five distinct badges', () => {
    expect(new Set(Object.values(FIELD_MOVE_BADGES)).size).toBe(5);
  });

  it('badge strings match the gym leaders that give them', () => {
    expect(GYM_LEADERS.brock.badge).toBe(FIELD_MOVE_BADGES.flash);
    expect(GYM_LEADERS.misty.badge).toBe(FIELD_MOVE_BADGES.cut);
    expect(GYM_LEADERS.lt_surge.badge).toBe(FIELD_MOVE_BADGES.fly);
    expect(GYM_LEADERS.erika.badge).toBe(FIELD_MOVE_BADGES.strength);
    expect(GYM_LEADERS.koga.badge).toBe(FIELD_MOVE_BADGES.surf);
  });

  it('only FLY skips the party-move requirement', () => {
    expect(FIELD_MOVE_NEEDS_PARTY_MOVE).toEqual({
      cut: true, fly: false, surf: true, strength: true, flash: true,
    });
  });

  it('pins every gate message', () => {
    expect(FIELD_MOVE_MESSAGES).toEqual({
      cut: {
        noTarget: ["There's nothing to\nCUT here!"],
        noBadge: ['This tree looks like\nit can be CUT down!'],
        noMove: ['This tree looks like\nit can be CUT down!'],
      },
      fly: {
        noTarget: [],
        noBadge: ['You need the THUNDER\nBADGE to use FLY!'],
        noMove: [],
      },
      surf: {
        noTarget: ["You can't SURF here!"],
        noBadge: ['You need the SOUL\nBADGE to use SURF!'],
        noMove: ["You can't SURF here!"],
      },
      strength: {
        noTarget: ["There's nothing to\nuse STRENGTH on!"],
        noBadge: ['This boulder looks\nlike it can be moved!'],
        noMove: ['This boulder looks\nlike it can be moved!'],
      },
      flash: { noTarget: [], noBadge: [], noMove: [] },
    });
  });

  it('no two moves share a message (no copy-paste across gates)', () => {
    const seen = new Map<string, FieldMove>();
    for (const move of MOVES) {
      for (const line of new Set(Object.values(FIELD_MOVE_MESSAGES[move]).flat())) {
        expect(seen.get(line), `${line} used by ${seen.get(line)} and ${move}`).toBeUndefined();
        seen.set(line, move);
      }
    }
  });

  it('only FLY and SURF name the missing badge; CUT/STRENGTH show a generic hint', () => {
    // Cut and Strength show the same line whether the badge or the move is the
    // one missing, so the player is never told which badge a tree wants.
    for (const move of MOVES) {
      const line = FIELD_MOVE_MESSAGES[move].noBadge[0] ?? '';
      const namesBadge = line.includes(FIELD_MOVE_BADGES[move]);
      expect(namesBadge, move).toBe(move === 'fly' || move === 'surf');
    }
    expect(FIELD_MOVE_MESSAGES.cut.noBadge).toEqual(FIELD_MOVE_MESSAGES.cut.noMove);
    expect(FIELD_MOVE_MESSAGES.strength.noBadge).toEqual(FIELD_MOVE_MESSAGES.strength.noMove);
  });
});

describe('helpers', () => {
  it('partyKnowsMove looks across the whole party', () => {
    const st: FieldMoveState = {
      badges: [],
      party: [{ moves: [{ moveId: 1 }] }, { moves: [{ moveId: 15 }, { moveId: 57 }] }],
    };
    expect(partyKnowsMove(st, 15)).toBe(true);
    expect(partyKnowsMove(st, 57)).toBe(true);
    expect(partyKnowsMove(st, 70)).toBe(false);
    expect(partyKnowsMove({ badges: [], party: [] }, 15)).toBe(false);
  });

  it('hasFieldMoveBadge reads the per-move badge', () => {
    for (const move of MOVES) {
      expect(hasFieldMoveBadge(move, state([FIELD_MOVE_BADGES[move]], []))).toBe(true);
      expect(hasFieldMoveBadge(move, state(['MARSH', 'VOLCANO', 'EARTH'], []))).toBe(false);
    }
  });
});

describe('canUseFieldMove: the 5 x (badge) x (move) table', () => {
  it.each(MOVES)('%s: badge + move in party = ok', move => {
    const d = canUseFieldMove(move, withAll(move));
    expect(d.outcome).toBe('ok');
    expect(d.message).toEqual([]);
    expect(d.handled).toBe(true);
  });

  it.each(MOVES)('%s: no badge is refused', move => {
    const d = canUseFieldMove(move, noBadge(move));
    expect(d.outcome).toBe('no_badge');
    expect(d.message).toEqual(FIELD_MOVE_MESSAGES[move].noBadge);
  });

  it.each(MOVES)('%s: no party Pokemon knows it', move => {
    const d = canUseFieldMove(move, noMove(move));
    if (FIELD_MOVE_NEEDS_PARTY_MOVE[move]) {
      expect(d.outcome).toBe('no_move');
      expect(d.message).toEqual(FIELD_MOVE_MESSAGES[move].noMove);
    } else {
      // FLY is gated on the badge alone (the PartyScreen entry supplies the move)
      expect(d.outcome).toBe('ok');
    }
  });

  it.each(MOVES)('%s: neither badge nor move is refused', move => {
    const d = canUseFieldMove(move, neither());
    expect(d.outcome).not.toBe('ok');
  });

  it('with neither, CUT/STRENGTH/FLASH report the missing move first', () => {
    // the scene's condition is `!partyHasMove(id) || !badges.includes(badge)`
    expect(canUseFieldMove('cut', neither()).outcome).toBe('no_move');
    expect(canUseFieldMove('strength', neither()).outcome).toBe('no_move');
    expect(canUseFieldMove('flash', neither()).outcome).toBe('no_move');
  });

  it('with neither, SURF reports the missing badge first', () => {
    // handleFieldMove() case 57 checks the SOUL badge before calling handleSurf()
    expect(canUseFieldMove('surf', neither()).outcome).toBe('no_badge');
    expect(canUseFieldMove('surf', neither()).message).toEqual(['You need the SOUL\nBADGE to use SURF!']);
  });

  it('a move on a second party member still counts', () => {
    const st: FieldMoveState = {
      badges: ['CASCADE'],
      party: [{ moves: [{ moveId: 1 }] }, { moves: [{ moveId: 15 }] }],
    };
    expect(canUseFieldMove('cut', st).outcome).toBe('ok');
  });

  it('an empty party fails every gate that needs a move', () => {
    for (const move of MOVES) {
      const st: FieldMoveState = { badges: [FIELD_MOVE_BADGES[move]], party: [] };
      const expected = FIELD_MOVE_NEEDS_PARTY_MOVE[move] ? 'no_move' : 'ok';
      expect(canUseFieldMove(move, st).outcome, move).toBe(expected);
    }
  });

  it('unrelated badges do not open a gate', () => {
    const all = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH', 'VOLCANO', 'EARTH'];
    for (const move of MOVES) {
      const without = all.filter(b => b !== FIELD_MOVE_BADGES[move]);
      expect(canUseFieldMove(move, state(without, [FIELD_MOVE_IDS[move]])).outcome, move).toBe('no_badge');
    }
    for (const move of MOVES) {
      expect(canUseFieldMove(move, state(all, [FIELD_MOVE_IDS[move]])).outcome, move).toBe('ok');
    }
  });

  it('the returned message is a copy (the scene hands it to TextBox)', () => {
    const d = canUseFieldMove('cut', neither());
    d.message.push('mutated');
    expect(canUseFieldMove('cut', neither()).message).toEqual(['This tree looks like\nit can be CUT down!']);
  });
});

describe('canUseFieldMove: target conditions', () => {
  it('CUT with no tree in front reports no_target and does not consume the interact', () => {
    const d = canUseFieldMove('cut', withAll('cut'), { targetValid: false });
    expect(d.outcome).toBe('no_target');
    expect(d.message).toEqual(["There's nothing to\nCUT here!"]);
    expect(d.handled).toBe(false);
  });

  it('CUT at a tree without the badge still consumes the interact (shows the hint)', () => {
    const d = canUseFieldMove('cut', noBadge('cut'), { targetValid: true });
    expect(d.handled).toBe(true);
    expect(d.message).toEqual(['This tree looks like\nit can be CUT down!']);
  });

  it('the tree check comes before the badge check', () => {
    expect(canUseFieldMove('cut', neither(), { targetValid: false }).outcome).toBe('no_target');
  });

  it('STRENGTH with no boulder in front reports no_target', () => {
    const d = canUseFieldMove('strength', withAll('strength'), { targetValid: false });
    expect(d.outcome).toBe('no_target');
    expect(d.message).toEqual(["There's nothing to\nuse STRENGTH on!"]);
    expect(d.handled).toBe(false);
  });

  it('STRENGTH at a boulder without the badge consumes the interact', () => {
    const d = canUseFieldMove('strength', noBadge('strength'), { targetValid: true });
    expect(d.handled).toBe(true);
    expect(d.message).toEqual(['This boulder looks\nlike it can be moved!']);
  });

  it('the boulder check comes before the badge check', () => {
    expect(canUseFieldMove('strength', neither(), { targetValid: false }).outcome).toBe('no_target');
  });

  it('SURF checks the badge before the water tile', () => {
    const d = canUseFieldMove('surf', noBadge('surf'), { targetValid: false });
    expect(d.outcome).toBe('no_badge');
    expect(d.message).toEqual(['You need the SOUL\nBADGE to use SURF!']);
  });

  it('SURF onto dry land reports no_target with the same "can\'t SURF here" line', () => {
    const d = canUseFieldMove('surf', withAll('surf'), { targetValid: false });
    expect(d.outcome).toBe('no_target');
    expect(d.message).toEqual(["You can't SURF here!"]);
  });

  it('SURF while already surfing is refused', () => {
    const d = canUseFieldMove('surf', withAll('surf'), { targetValid: true, isSurfing: true });
    expect(d.outcome).toBe('no_target');
    expect(d.message).toEqual(["You can't SURF here!"]);
  });

  it('no SURF denial ever consumes the interact (water without SURF says nothing)', () => {
    for (const ctx of [{ targetValid: false }, { isSurfing: true }, {}]) {
      expect(canUseFieldMove('surf', noBadge('surf'), ctx).handled).toBe(false);
      expect(canUseFieldMove('surf', noMove('surf'), ctx).handled).toBe(false);
    }
  });

  it('FLY ignores the target tile entirely', () => {
    expect(canUseFieldMove('fly', withAll('fly'), { targetValid: false }).outcome).toBe('ok');
    expect(canUseFieldMove('fly', withAll('fly'), { isSurfing: true }).outcome).toBe('ok');
    expect(canUseFieldMove('fly', noBadge('fly'), { targetValid: false }).outcome).toBe('no_badge');
  });

  it('FLASH needs a dark map that has not been lit yet', () => {
    expect(canUseFieldMove('flash', withAll('flash'), { isDark: true }).outcome).toBe('ok');
    expect(canUseFieldMove('flash', withAll('flash'), { isDark: false }).outcome).toBe('no_target');
    expect(canUseFieldMove('flash', withAll('flash'), { isDark: true, flashUsed: true }).outcome).toBe('no_target');
  });

  it('FLASH is silent whatever the reason', () => {
    for (const st of [withAll('flash'), noBadge('flash'), noMove('flash'), neither()]) {
      for (const ctx of [{}, { isDark: false }, { flashUsed: true }]) {
        expect(canUseFieldMove('flash', st, ctx).message).toEqual([]);
      }
    }
  });

  it('the darkness check comes before the badge check', () => {
    expect(canUseFieldMove('flash', neither(), { isDark: false }).outcome).toBe('no_target');
  });
});
