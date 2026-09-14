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
import { isMapOutdoor, isMapCave } from '../../src/logic/fieldMoves';
import { ALL_MAPS } from '../../src/data/maps';
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
        // noTarget = the indoor/cave refusal, added with the "FLY only
        // outdoors" fix; it mirrors TELEPORT's "Can't use TELEPORT here!".
        noTarget: ["Can't use FLY\nhere!"],
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

  it('FLY ignores the faced tile entirely', () => {
    expect(canUseFieldMove('fly', withAll('fly'), { targetValid: false }).outcome).toBe('ok');
    expect(canUseFieldMove('fly', withAll('fly'), { isSurfing: true }).outcome).toBe('ok');
    expect(canUseFieldMove('fly', noBadge('fly'), { targetValid: false }).outcome).toBe('no_badge');
  });

  // FLY's place gate. Previously handleFieldMove() case 19 checked only the
  // THUNDER badge, so the fly map opened from inside Oak's lab, a Pokemon
  // Center or Mt. Moon; Gen I FLY works only on outdoor route/town maps.
  it('FLY outdoors with the badge is ok', () => {
    const d = canUseFieldMove('fly', withAll('fly'), { isOutdoor: true, isCave: false });
    expect(d.outcome).toBe('ok');
    expect(d.message).toEqual([]);
  });

  it('FLY indoors is refused with "Can\'t use FLY here!"', () => {
    const d = canUseFieldMove('fly', withAll('fly'), { isOutdoor: false, isCave: false });
    expect(d.outcome).toBe('no_target');
    expect(d.message).toEqual(["Can't use FLY\nhere!"]);
    expect(d.handled).toBe(false);
  });

  it('FLY in a cave is refused even when the map reads as outdoor', () => {
    // Some cave maps have outdoor tiles on an edge (an open mouth), so the
    // cave test is an independent veto rather than the inverse of isOutdoor.
    const d = canUseFieldMove('fly', withAll('fly'), { isOutdoor: true, isCave: true });
    expect(d.outcome).toBe('no_target');
    expect(d.message).toEqual(["Can't use FLY\nhere!"]);
  });

  it('the missing badge wins over the place', () => {
    for (const ctx of [{ isOutdoor: false }, { isCave: true }, { isOutdoor: false, isCave: true }]) {
      const d = canUseFieldMove('fly', noBadge('fly'), ctx);
      expect(d.outcome).toBe('no_badge');
      expect(d.message).toEqual(['You need the THUNDER\nBADGE to use FLY!']);
    }
  });

  it('the FLY place gate defaults to outdoors, so the other gates are untouched', () => {
    expect(canUseFieldMove('fly', withAll('fly')).outcome).toBe('ok');
    for (const move of ['cut', 'surf', 'strength', 'flash'] as FieldMove[]) {
      expect(canUseFieldMove(move, withAll(move), { isOutdoor: false, isCave: true }).outcome, move)
        .toBe(canUseFieldMove(move, withAll(move)).outcome);
    }
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

describe('isMapOutdoor / isMapCave on the real maps (what FLY\'s place gate reads)', () => {
  it('routes and towns are outdoor and not caves', () => {
    for (const id of ['pallet_town', 'route1', 'viridian_city', 'cerulean_city']) {
      const map = ALL_MAPS[id];
      expect(map, id).toBeDefined();
      expect(isMapOutdoor(map), id).toBe(true);
      expect(isMapCave(map), id).toBe(false);
    }
  });

  it('buildings are not outdoor', () => {
    const indoors = Object.keys(ALL_MAPS).filter(
      id => id === 'oaks_lab' || id.startsWith('pokemon_center') || id.startsWith('pokemart'),
    );
    expect(indoors.length).toBeGreaterThan(2);
    for (const id of indoors) {
      expect(isMapOutdoor(ALL_MAPS[id]), id).toBe(false);
    }
  });

  it('Mt. Moon floors read as caves', () => {
    for (const id of ['mt_moon', 'mt_moon_b1f', 'mt_moon_b2f']) {
      const map = ALL_MAPS[id];
      expect(map, id).toBeDefined();
      expect(isMapCave(map), id).toBe(true);
    }
  });

  it('every map is refused by the FLY gate unless it is outdoor and not a cave', () => {
    const st = withAll('fly');
    for (const [id, map] of Object.entries(ALL_MAPS)) {
      const outcome = canUseFieldMove('fly', st, {
        isOutdoor: isMapOutdoor(map),
        isCave: isMapCave(map),
      }).outcome;
      expect(outcome, id).toBe(isMapOutdoor(map) && !isMapCave(map) ? 'ok' : 'no_target');
    }
  });
});
