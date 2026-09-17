// Road blocks: the two hard-coded warp interceptions in the overworld (Oak
// stopping a partyless player leaving Pallet Town, and the Pewter guide barring
// the east exit until BROCK is beaten) plus the Route 23 badge-check guards.
//
// Extracted verbatim from OverworldScene (`warpTo`'s two intercept branches,
// `checkWildEncounter`'s partyless branch and `handleBadgeCheck`).
// Behaviour-preserving: the same conditions, in the same order, with the same
// message strings. The scene still owns the cutscenes — Oak's walk from the lab
// door, the guide's walk to the player and back — and the text box; this module
// only decides *whether* a block fires and *what* is said.
//
// These are deliberately NOT the data-driven `entryGates` of `warpGate.ts`:
// both of these block a warp with a walking NPC rather than a message, which is
// why they are hard-coded ahead of `checkEntryGates()` in `warpTo`.

/** Warp target that Oak refuses to let a partyless player reach. */
export const OAK_ESCORT_TO_MAP = 'route1';

/** Where Oak's escort cutscene drops the player once it finishes. */
export const OAK_ESCORT_DESTINATION = { mapId: 'oaks_lab', x: 4, y: 11 };

/** The Pewter guide's gate: `pewter_city` -> `route3`, opened by BOULDER. */
export const PEWTER_GUIDE_FROM_MAP = 'pewter_city';
export const PEWTER_GUIDE_TO_MAP = 'route3';
export const PEWTER_GUIDE_BADGE = 'BOULDER';
export const PEWTER_GUIDE_NPC_ID = 'pewter_guide';

/**
 * Oak's two text batches, in the order `triggerOakIntercept()` shows them: the
 * first line is its own `show()` call, the remaining three are a second batch
 * shown from its onComplete, and the walk back to the lab starts after those.
 */
export const OAK_INTERCEPT_MESSAGES: readonly string[][] = [
  ["OAK: Hey! Wait!\nDon't go out!"],
  [
    "It's unsafe! Wild\nPOKeMON live in\ntall grass!",
    'You need your own\nPOKeMON for your\nprotection.',
    'Come with me to\nmy lab!',
  ],
];

export type RoadBlockKind = 'none' | 'oak_escort' | 'pewter_guide';

/** The read-only slice of PlayerState the road blocks look at. */
export interface RoadBlockState {
  party: readonly unknown[];
  badges: readonly string[];
}

export interface RoadBlock {
  kind: RoadBlockKind;
  /**
   * The text batches the scene shows, in order. Empty for `pewter_guide`: the
   * guide speaks his own `dialogue` from the map data (`npcId`), not a string
   * baked into the scene.
   */
  messages: readonly string[][];
  /** The NPC that does the blocking, when it is a real map NPC. */
  npcId: string | null;
}

const NO_BLOCK: RoadBlock = { kind: 'none', messages: [], npcId: null };

/**
 * Oak stops a player with an empty party. The same condition guards both of his
 * entry points: stepping onto the Route 1 warp, and stepping on an encounter
 * tile with nothing to fight with.
 */
export function needsOakEscort(state: RoadBlockState): boolean {
  return state.party.length === 0;
}

/** The guide blocks the Pewter -> Route 3 warp only, and only without BOULDER. */
export function pewterGuideBlocks(fromMapId: string, toMapId: string, state: RoadBlockState): boolean {
  return toMapId === PEWTER_GUIDE_TO_MAP &&
    fromMapId === PEWTER_GUIDE_FROM_MAP &&
    !state.badges.includes(PEWTER_GUIDE_BADGE);
}

/**
 * Which intercept (if any) swallows a warp from `fromMapId` to `toMapId`.
 * Order is `warpTo`'s own: Oak's check runs first, so a partyless player heading
 * for Route 1 is escorted no matter what else is true. Both checks run before
 * the data-driven `entryGates`, so an intercept wins over a gate message.
 */
export function interceptWarp(fromMapId: string, toMapId: string, state: RoadBlockState): RoadBlock {
  if (toMapId === OAK_ESCORT_TO_MAP && needsOakEscort(state)) {
    return { kind: 'oak_escort', messages: OAK_INTERCEPT_MESSAGES, npcId: null };
  }
  if (pewterGuideBlocks(fromMapId, toMapId, state)) {
    return { kind: 'pewter_guide', messages: [], npcId: PEWTER_GUIDE_NPC_ID };
  }
  return NO_BLOCK;
}

// ── Route 23 badge checks ────────────────────────────────────────────────────

/**
 * The three named guards and the badge each one asks for. Any other
 * `badge_check*` NPC id falls through to the "all eight" check — the NPC
 * dispatcher routes every id with that prefix here.
 */
export const BADGE_CHECK_REQUIREMENTS: Record<string, { badge: string; name: string }> = {
  badge_check1: { badge: 'BOULDER', name: 'BOULDER BADGE' },
  badge_check2: { badge: 'CASCADE', name: 'CASCADE BADGE' },
  badge_check3: { badge: 'THUNDER', name: 'THUNDER BADGE' },
};

/** How many badges an unnamed `badge_check*` guard wants. */
export const ALL_BADGES_REQUIRED = 8;

/** Suffix on the id of the "stepped aside" twin standing beside each gap. */
export const BADGE_CHECK_PASSED_SUFFIX = '_passed';

/** `badge_check1_passed` -> `badge_check1`; any other id is returned as-is. */
export function badgeCheckBaseId(npcId: string): string {
  return npcId.endsWith(BADGE_CHECK_PASSED_SUFFIX)
    ? npcId.slice(0, -BADGE_CHECK_PASSED_SUFFIX.length)
    : npcId;
}

/**
 * The story flag a guard sets once he has seen the badge and stepped out of
 * the gap. `npcVisibility` swaps the guard for his `_passed` twin on it, and
 * the guard stops blocking his tile.
 */
export function badgeCheckClearedFlag(npcId: string): string {
  return `${badgeCheckBaseId(npcId)}_cleared`;
}

export interface BadgeCheckOutcome {
  pass: boolean;
  /** The single badge this guard asks for; null for the "all eight" guard. */
  badge: string | null;
  /** Its display name, as spoken; null for the "all eight" guard. */
  badgeName: string | null;
  /** True when this id is not in the table and the guard wants all eight. */
  requiresAllBadges: boolean;
  message: string[];
  /**
   * Story flag the scene must set when the text closes, on a pass only: the
   * guard steps aside for good. Null while he is still refusing.
   */
  clearFlag: string | null;
}

/**
 * What a Route 23 guard says, and whether he steps aside. A known id checks
 * its one badge; anything else counts badges and needs all eight. On a pass
 * the outcome also names the flag that clears him off the gap tile for good
 * (`clearFlag`); refusing has no effect beyond the message.
 */
export function badgeCheckOutcome(npcId: string, state: RoadBlockState): BadgeCheckOutcome {
  const req = BADGE_CHECK_REQUIREMENTS[npcId];
  if (req) {
    const pass = state.badges.includes(req.badge);
    return {
      pass,
      badge: req.badge,
      badgeName: req.name,
      requiresAllBadges: false,
      message: pass
        ? [`GUARD: ${req.name}?\nVery good!`, 'You may pass!']
        : [`GUARD: You need the\n${req.name} to pass!`, 'Come back when you\nhave it!'],
      clearFlag: pass ? badgeCheckClearedFlag(npcId) : null,
    };
  }
  const pass = state.badges.length >= ALL_BADGES_REQUIRED;
  return {
    pass,
    badge: null,
    badgeName: null,
    requiresAllBadges: true,
    message: pass
      ? ['GUARD: All BADGES\nverified! Go ahead!']
      : ['GUARD: You need more\nBADGES to pass!'],
    clearFlag: pass ? badgeCheckClearedFlag(npcId) : null,
  };
}
