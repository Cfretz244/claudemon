import { describe, it, expect } from 'vitest';
import {
  interceptWarp,
  needsOakEscort,
  pewterGuideBlocks,
  badgeCheckOutcome,
  OAK_INTERCEPT_MESSAGES,
  OAK_ESCORT_TO_MAP,
  OAK_ESCORT_DESTINATION,
  PEWTER_GUIDE_FROM_MAP,
  PEWTER_GUIDE_TO_MAP,
  PEWTER_GUIDE_BADGE,
  PEWTER_GUIDE_NPC_ID,
  BADGE_CHECK_REQUIREMENTS,
  ALL_BADGES_REQUIRED,
  BADGE_CHECK_PASSED_SUFFIX,
  badgeCheckBaseId,
  badgeCheckClearedFlag,
  RoadBlockState,
  walkPath,
  oakLabDoorstep,
  oakGreetingSpot,
  Tile,
} from '../../src/logic/roadBlocks';
import { ALL_MAPS } from '../../src/data/maps';
import { GYM_LEADERS } from '../../src/data/gymLeaders';
import { PlayerState } from '../../src/entities/Player';

/**
 * Pins the two hard-coded warp interceptions (gap #4) and the Route 23 badge
 * checks (gap #5) extracted from OverworldScene into src/logic/roadBlocks.ts.
 *
 * These are the blocks that stop a warp with a walking NPC instead of a
 * message, so they run in `warpTo` ahead of the data-driven `entryGates`.
 */

/** The player state slice the road blocks read. `party` length is all that matters. */
function state(partySize: number, badges: string[] = []): RoadBlockState {
  return { party: new Array(partySize).fill({}), badges };
}
const ALL_EIGHT = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH', 'VOLCANO', 'EARTH'];

describe('interceptWarp — Oak escort (Route 1)', () => {
  it('blocks the Pallet Town -> Route 1 warp with an empty party', () => {
    const block = interceptWarp('pallet_town', 'route1', state(0));
    expect(block.kind).toBe('oak_escort');
    expect(block.npcId).toBeNull();
    expect(block.messages).toEqual([
      ["OAK: Hey! Wait!\nDon't go out!"],
      [
        "It's unsafe! Wild\nPOKeMON live in\ntall grass!",
        'You need your own\nPOKeMON for your\nprotection.',
        'Come with me to\nmy lab!',
      ],
    ]);
    expect(block.messages).toBe(OAK_INTERCEPT_MESSAGES);
  });

  it('lets the warp through as soon as the party is not empty', () => {
    for (const size of [1, 2, 6]) {
      expect(interceptWarp('pallet_town', 'route1', state(size)).kind, `party ${size}`).toBe('none');
    }
  });

  it('is target-only: any map -> Route 1 with an empty party is intercepted', () => {
    for (const from of ['pallet_town', 'viridian_city', 'route2', '']) {
      expect(interceptWarp(from, 'route1', state(0)).kind, from).toBe('oak_escort');
    }
  });

  it('badges make no difference to it', () => {
    expect(interceptWarp('pallet_town', 'route1', state(0, ALL_EIGHT)).kind).toBe('oak_escort');
    expect(interceptWarp('pallet_town', 'route1', state(1, [])).kind).toBe('none');
  });

  it('runs before the Pewter guide: an empty party heading for Route 1 wins', () => {
    // Not reachable in the shipped maps, but it pins warpTo's branch order.
    expect(interceptWarp(PEWTER_GUIDE_FROM_MAP, 'route1', state(0)).kind).toBe('oak_escort');
  });

  it('needsOakEscort is exactly "the party is empty"', () => {
    expect(needsOakEscort(state(0))).toBe(true);
    expect(needsOakEscort(state(1))).toBe(false);
    expect(needsOakEscort(state(6))).toBe(false);
  });

  it('a fresh PlayerState needs the escort; one with a Pokemon does not', () => {
    const player = new PlayerState();
    expect(needsOakEscort(player)).toBe(true);
    expect(interceptWarp('pallet_town', OAK_ESCORT_TO_MAP, player).kind).toBe('oak_escort');
  });
});

describe('interceptWarp — Pewter guide (Route 3)', () => {
  it('blocks Pewter City -> Route 3 without the BOULDER badge', () => {
    const block = interceptWarp('pewter_city', 'route3', state(1));
    expect(block.kind).toBe('pewter_guide');
    expect(block.npcId).toBe('pewter_guide');
    // The guide speaks his own map dialogue, so the scene supplies no strings.
    expect(block.messages).toEqual([]);
  });

  it('opens once BOULDER is in hand', () => {
    expect(interceptWarp('pewter_city', 'route3', state(1, ['BOULDER'])).kind).toBe('none');
    expect(interceptWarp('pewter_city', 'route3', state(1, ALL_EIGHT)).kind).toBe('none');
  });

  it('is not opened by any other badge', () => {
    const others = ALL_EIGHT.filter(b => b !== PEWTER_GUIDE_BADGE);
    expect(interceptWarp('pewter_city', 'route3', state(1, others)).kind).toBe('pewter_guide');
  });

  it('is one-directional: Route 3 -> Pewter City is always open', () => {
    expect(interceptWarp('route3', 'pewter_city', state(1)).kind).toBe('none');
    expect(interceptWarp('route3', 'pewter_city', state(1, ['BOULDER'])).kind).toBe('none');
  });

  it('only fires from Pewter City, not from any other map warping to Route 3', () => {
    for (const from of ['mt_moon', 'route4', 'pewter_gym', '']) {
      expect(interceptWarp(from, 'route3', state(1)).kind, from).toBe('none');
    }
  });

  it('does not care about the party', () => {
    expect(interceptWarp('pewter_city', 'route3', state(6)).kind).toBe('pewter_guide');
    // ...but an empty party on this warp is still just the guide: Oak only
    // watches Route 1.
    expect(interceptWarp('pewter_city', 'route3', state(0)).kind).toBe('pewter_guide');
  });

  it('pewterGuideBlocks is the same predicate', () => {
    expect(pewterGuideBlocks('pewter_city', 'route3', state(1))).toBe(true);
    expect(pewterGuideBlocks('pewter_city', 'route3', state(1, ['BOULDER']))).toBe(false);
    expect(pewterGuideBlocks('route3', 'pewter_city', state(1))).toBe(false);
  });
});

describe('interceptWarp — everything else is untouched', () => {
  const UNRELATED: Array<[string, string]> = [
    ['pallet_town', 'oaks_lab'],
    ['pallet_town', 'route21'],
    ['viridian_city', 'route2'],
    ['viridian_city', 'route22'],
    ['route2', 'viridian_forest'],
    ['pewter_city', 'pewter_gym'],
    ['pewter_city', 'route2'],
    ['route3', 'mt_moon'],
    ['cerulean_city', 'route4'],
    ['route23', 'victory_road'],
  ];

  it('returns "none" for unrelated map pairs in every state', () => {
    for (const [from, to] of UNRELATED) {
      for (const s of [state(0), state(1), state(0, ALL_EIGHT), state(6, ALL_EIGHT)]) {
        expect(interceptWarp(from, to, s).kind, `${from} -> ${to}`).toBe('none');
      }
    }
  });

  it('a "none" verdict carries no message and no NPC', () => {
    const block = interceptWarp('cerulean_city', 'route4', state(1));
    expect(block.messages).toEqual([]);
    expect(block.npcId).toBeNull();
  });
});

describe('road-block map data', () => {
  it('Pallet Town really warps to Route 1 (the tile Oak intercepts)', () => {
    const warps = ALL_MAPS['pallet_town'].warps.filter(w => w.targetMap === OAK_ESCORT_TO_MAP);
    expect(warps.length).toBeGreaterThan(0);
  });

  it("Oak's escort lands the player in his lab", () => {
    const lab = ALL_MAPS[OAK_ESCORT_DESTINATION.mapId];
    expect(lab).toBeDefined();
    expect(lab.collision[OAK_ESCORT_DESTINATION.y][OAK_ESCORT_DESTINATION.x]).toBe(false);
  });

  it('the guide is an NPC of Pewter City with dialogue of his own', () => {
    const guide = ALL_MAPS[PEWTER_GUIDE_FROM_MAP].npcs.find(n => n.id === PEWTER_GUIDE_NPC_ID);
    expect(guide).toBeDefined();
    expect(guide!.dialogue.length).toBeGreaterThan(0);
  });

  it('both sides of the guide gate are real warps', () => {
    expect(ALL_MAPS[PEWTER_GUIDE_FROM_MAP].warps.some(w => w.targetMap === PEWTER_GUIDE_TO_MAP)).toBe(true);
    expect(ALL_MAPS[PEWTER_GUIDE_TO_MAP].warps.some(w => w.targetMap === PEWTER_GUIDE_FROM_MAP)).toBe(true);
  });

  it('the badge the guide waits for is the one Pewter Gym awards', () => {
    expect(GYM_LEADERS['brock'].badge).toBe(PEWTER_GUIDE_BADGE);
  });
});

describe('badgeCheckOutcome — the three named Route 23 guards', () => {
  const CASES: Array<[string, string, string]> = [
    ['badge_check1', 'BOULDER', 'BOULDER BADGE'],
    ['badge_check2', 'CASCADE', 'CASCADE BADGE'],
    ['badge_check3', 'THUNDER', 'THUNDER BADGE'],
  ];

  it('maps each guard to its badge', () => {
    expect(BADGE_CHECK_REQUIREMENTS).toEqual({
      badge_check1: { badge: 'BOULDER', name: 'BOULDER BADGE' },
      badge_check2: { badge: 'CASCADE', name: 'CASCADE BADGE' },
      badge_check3: { badge: 'THUNDER', name: 'THUNDER BADGE' },
    });
  });

  it.each(CASES)('%s passes with %s', (id, badge, name) => {
    const out = badgeCheckOutcome(id, state(1, [badge]));
    expect(out.pass).toBe(true);
    expect(out.badge).toBe(badge);
    expect(out.badgeName).toBe(name);
    expect(out.requiresAllBadges).toBe(false);
    expect(out.message).toEqual([`GUARD: ${name}?\nVery good!`, 'You may pass!']);
    // A pass now also steps the guard out of the fence row's gap for good.
    expect(out.clearFlag).toBe(`${id}_cleared`);
  });

  it.each(CASES)('%s refuses without %s', (id, badge, name) => {
    const out = badgeCheckOutcome(id, state(1, []));
    expect(out.pass).toBe(false);
    expect(out.badge).toBe(badge);
    expect(out.badgeName).toBe(name);
    expect(out.requiresAllBadges).toBe(false);
    expect(out.message).toEqual([
      `GUARD: You need the\n${name} to pass!`,
      'Come back when you\nhave it!',
    ]);
    // Refusing changes nothing: he stays in the gap.
    expect(out.clearFlag).toBeNull();
  });

  it.each(CASES)('%s is not satisfied by the other seven badges', (id, badge) => {
    const others = ALL_EIGHT.filter(b => b !== badge);
    expect(badgeCheckOutcome(id, state(1, others)).pass).toBe(false);
    expect(badgeCheckOutcome(id, state(1, [...others, badge])).pass).toBe(true);
  });

  it('each guard asks only about his own badge, so the three are independent', () => {
    const withBoulder = state(1, ['BOULDER']);
    expect(badgeCheckOutcome('badge_check1', withBoulder).pass).toBe(true);
    expect(badgeCheckOutcome('badge_check2', withBoulder).pass).toBe(false);
    expect(badgeCheckOutcome('badge_check3', withBoulder).pass).toBe(false);
  });

  it('the party is irrelevant to every guard', () => {
    expect(badgeCheckOutcome('badge_check1', state(0, ['BOULDER'])).pass).toBe(true);
    expect(badgeCheckOutcome('badge_check1', state(6, [])).pass).toBe(false);
  });
});

describe('badgeCheckOutcome — any other badge_check id wants all eight', () => {
  const OTHER_IDS = ['badge_check4', 'badge_check_final', 'badge_check', 'badge_check0'];

  it.each(OTHER_IDS)('%s refuses with seven badges', id => {
    const out = badgeCheckOutcome(id, state(1, ALL_EIGHT.slice(0, 7)));
    expect(out.pass).toBe(false);
    expect(out.badge).toBeNull();
    expect(out.badgeName).toBeNull();
    expect(out.requiresAllBadges).toBe(true);
    expect(out.message).toEqual(['GUARD: You need more\nBADGES to pass!']);
    expect(out.clearFlag).toBeNull();
  });

  it.each(OTHER_IDS)('%s passes with all eight', id => {
    const out = badgeCheckOutcome(id, state(1, ALL_EIGHT));
    expect(out.pass).toBe(true);
    expect(out.badge).toBeNull();
    expect(out.badgeName).toBeNull();
    expect(out.requiresAllBadges).toBe(true);
    expect(out.message).toEqual(['GUARD: All BADGES\nverified! Go ahead!']);
    expect(out.clearFlag).toBe(`${id}_cleared`);
  });

  it('flips at exactly eight, one badge at a time', () => {
    for (let n = 0; n <= 8; n++) {
      expect(badgeCheckOutcome('badge_check4', state(1, ALL_EIGHT.slice(0, n))).pass, `${n} badges`)
        .toBe(n >= ALL_BADGES_REQUIRED);
    }
    expect(ALL_BADGES_REQUIRED).toBe(8);
  });

  it('counts badges without validating them (eight junk strings pass)', () => {
    const junk = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    expect(badgeCheckOutcome('badge_check4', state(1, junk)).pass).toBe(true);
  });

  it('a PlayerState with every gym badge satisfies every guard', () => {
    const player = new PlayerState();
    player.badges = Object.values(GYM_LEADERS).map(l => l.badge);
    for (const id of [...Object.keys(BADGE_CHECK_REQUIREMENTS), ...OTHER_IDS]) {
      expect(badgeCheckOutcome(id, player).pass, id).toBe(true);
    }
  });
});

describe('badge-check data', () => {
  it('every required badge is awarded by exactly one gym leader', () => {
    const leaderBadges = Object.values(GYM_LEADERS).map(l => l.badge);
    expect(leaderBadges).toHaveLength(ALL_BADGES_REQUIRED);
    for (const [id, req] of Object.entries(BADGE_CHECK_REQUIREMENTS)) {
      expect(leaderBadges.filter(b => b === req.badge), `${id} -> ${req.badge}`).toHaveLength(1);
      expect(req.name).toBe(`${req.badge} BADGE`);
    }
  });

  // Changed by the "guards must actually block" fix: each named guard now
  // ships with a `_passed` twin, the plain-dialogue NPC that stands beside the
  // gap once he has stepped aside. The old pin listed only the three guards.
  it('the shipped badge_check NPCs are the three named guards plus one _passed twin each, all on Route 23', () => {
    const found: string[] = [];
    for (const [mapId, map] of Object.entries(ALL_MAPS)) {
      for (const npc of map.npcs) {
        if (!npc.id.startsWith('badge_check')) continue;
        found.push(npc.id);
        expect(mapId, npc.id).toBe('route23');
      }
    }
    const guards = Object.keys(BADGE_CHECK_REQUIREMENTS);
    expect(found.sort()).toEqual([...guards, ...guards.map(g => `${g}${BADGE_CHECK_PASSED_SUFFIX}`)].sort());
  });

  it('the three guards ask for the first three badges, in gym order', () => {
    const gymOrder = Object.values(GYM_LEADERS).map(l => l.badge);
    expect([1, 2, 3].map(n => BADGE_CHECK_REQUIREMENTS[`badge_check${n}`].badge))
      .toEqual(gymOrder.slice(0, 3));
  });
});

describe('badge-check clear flags', () => {
  it('a guard and his twin share one flag', () => {
    for (const id of Object.keys(BADGE_CHECK_REQUIREMENTS)) {
      expect(badgeCheckClearedFlag(id)).toBe(`${id}_cleared`);
      expect(badgeCheckClearedFlag(`${id}${BADGE_CHECK_PASSED_SUFFIX}`)).toBe(`${id}_cleared`);
    }
  });

  it('badgeCheckBaseId strips the suffix and leaves everything else alone', () => {
    expect(badgeCheckBaseId('badge_check2_passed')).toBe('badge_check2');
    expect(badgeCheckBaseId('badge_check2')).toBe('badge_check2');
    expect(badgeCheckBaseId('oak')).toBe('oak');
  });

  it('the flags are distinct per guard, so clearing one does not clear another', () => {
    const flags = Object.keys(BADGE_CHECK_REQUIREMENTS).map(badgeCheckClearedFlag);
    expect(new Set(flags).size).toBe(flags.length);
  });
});

// ── Oak's escort walk ────────────────────────────────────────────────────────
//
// The cutscene used to hard-code Pallet's geometry ("walk west to x=6, then up
// the lane"), so re-drawing the town silently walked Oak through a house. It is
// now a shortest path over the map's own collision grid; these pin the walk
// against the real map, so the next person to move the lab cannot break it
// without a red test.

/** A tiny map: `#` is solid, `.` is floor. */
function grid(rows: string[], warps: Array<{ x: number; y: number; targetMap: string }> = []) {
  return {
    width: rows[0].length,
    height: rows.length,
    collision: rows.map(r => [...r].map(c => c === '#')),
    warps,
  };
}
const asKeys = (path: Tile[]) => path.map(t => `${t.x},${t.y}`);

describe('walkPath', () => {
  const open = grid(['.....', '.###.', '.....']);

  it('walks a straight line, and does not include the tile it starts on', () => {
    expect(asKeys(walkPath(open, { x: 0, y: 0 }, { x: 3, y: 0 })!)).toEqual(['1,0', '2,0', '3,0']);
  });

  it('goes around a wall rather than through it', () => {
    const path = walkPath(open, { x: 1, y: 0 }, { x: 1, y: 2 })!;
    expect(path.some(t => open.collision[t.y][t.x])).toBe(false);
    expect(path[path.length - 1]).toEqual({ x: 1, y: 2 });
    expect(path.length).toBe(4);       // down the left column and back along the bottom
  });

  it('takes the shortest way, and every step is next to the last', () => {
    const path = [{ x: 0, y: 0 }, ...walkPath(open, { x: 0, y: 0 }, { x: 4, y: 2 })!];
    for (let i = 1; i < path.length; i++) {
      expect(Math.abs(path[i].x - path[i - 1].x) + Math.abs(path[i].y - path[i - 1].y)).toBe(1);
    }
    expect(path.length - 1).toBe(6);
  });

  it('returns an empty path when it is already there', () => {
    expect(walkPath(open, { x: 2, y: 0 }, { x: 2, y: 0 })).toEqual([]);
  });

  it('refuses a destination that is a wall, off the map, or blocked by an NPC', () => {
    expect(walkPath(open, { x: 0, y: 0 }, { x: 2, y: 1 })).toBeNull();
    expect(walkPath(open, { x: 0, y: 0 }, { x: 9, y: 9 })).toBeNull();
    expect(walkPath(open, { x: 0, y: 0 }, { x: 3, y: 0 }, new Set(['3,0']))).toBeNull();
  });

  it('returns null when the destination is walled off entirely', () => {
    const sealed = grid(['...#...', '...#...']);
    expect(walkPath(sealed, { x: 0, y: 0 }, { x: 6, y: 0 })).toBeNull();
  });

  it('treats a blocked tile as a wall — a one-wide corridor closes', () => {
    const corridor = grid(['.....']);
    expect(walkPath(corridor, { x: 0, y: 0 }, { x: 4, y: 0 }, new Set(['2,0']))).toBeNull();
  });
});

describe("Oak's escort walk, on the real Pallet Town", () => {
  const pallet = ALL_MAPS.pallet_town;
  const labDoor = pallet.warps.find(w => w.targetMap === OAK_ESCORT_DESTINATION.mapId)!;

  it('Oak steps out onto the doorstep below his lab door, not into the facade', () => {
    const step = oakLabDoorstep(pallet)!;
    expect(step).toEqual({ x: labDoor.x, y: labDoor.y + 1 });
    expect(pallet.collision[step.y][step.x]).toBe(false);
  });

  it('has no doorstep on a map with no lab', () => {
    expect(oakLabDoorstep(ALL_MAPS.route1)).toBeNull();
  });

  it('walks from the lab to a player standing in the Route 1 gap, and back again', () => {
    const doorstep = oakLabDoorstep(pallet)!;
    const player = { x: 9, y: 1 };                 // where Route 1 puts you back
    const greeting = oakGreetingSpot(pallet, doorstep, player)!;
    expect(greeting).not.toBeNull();
    // He stops next to the player — never on top of them.
    expect(Math.abs(greeting.spot.x - player.x) + Math.abs(greeting.spot.y - player.y)).toBe(1);
    expect(greeting.path[greeting.path.length - 1]).toEqual(greeting.spot);
    expect(greeting.path.every(t => !pallet.collision[t.y][t.x])).toBe(true);
    // And he can lead them home from there.
    const home = walkPath(pallet, greeting.spot, doorstep)!;
    expect(home[home.length - 1]).toEqual(doorstep);
  });

  it('prefers the tile south of the player, so he faces them up the path', () => {
    const doorstep = oakLabDoorstep(pallet)!;
    const player = { x: 9, y: 2 };
    expect(oakGreetingSpot(pallet, doorstep, player)!.spot).toEqual({ x: 9, y: 3 });
  });

  it('takes another neighbouring tile when the south one is taken', () => {
    const doorstep = oakLabDoorstep(pallet)!;
    const player = { x: 9, y: 2 };
    const greeting = oakGreetingSpot(pallet, doorstep, player, new Set(['9,3']))!;
    expect(greeting.spot).not.toEqual({ x: 9, y: 3 });
    expect(Math.abs(greeting.spot.x - player.x) + Math.abs(greeting.spot.y - player.y)).toBe(1);
  });

  it('can reach every tile the town warps you in on', () => {
    const doorstep = oakLabDoorstep(pallet)!;
    for (const map of Object.values(ALL_MAPS)) {
      for (const w of map.warps) {
        if (w.targetMap !== 'pallet_town') continue;
        const at = `${map.id} (${w.x},${w.y})`;
        expect(oakGreetingSpot(pallet, doorstep, { x: w.targetX, y: w.targetY }), at).not.toBeNull();
      }
    }
  });

  it('gives up rather than teleporting when the player is unreachable', () => {
    const island = grid(['..#..']);
    expect(oakGreetingSpot(island, { x: 0, y: 0 }, { x: 4, y: 0 })).toBeNull();
  });
});
