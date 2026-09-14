// Field-move (HM) gates: which badge and which party move each overworld move
// needs, and exactly what the scene says when one is missing.
//
// Extracted verbatim from OverworldScene (handleFieldMove / handleCut /
// handleSurf / handleStrength / useFlash). Behaviour-preserving: the same
// conditions, in the same order, with the same message strings. The scene still
// owns the tile lookups and the effects; it passes the tile verdict in as
// `targetValid` and shows `decision.message`.
//
// Two entry points reach these gates in the game:
//   * the PartyScreen field-move menu -> OverworldScene.handleFieldMove()
//   * pressing Z at a tile -> interact() -> handleCut/handleSurf/handleStrength
// `handled` mirrors what the tile handler returns to interact(): true means it
// consumed the interaction. Cut and Strength consume it even when the gate
// fails (to show their hint); Surf only consumes a successful surf, which is
// why walking up to water without SURF says nothing at all.

export type FieldMove = 'cut' | 'fly' | 'surf' | 'strength' | 'flash';

/** MOVES_DATA ids, as switched on in OverworldScene.handleFieldMove(). */
export const FIELD_MOVE_IDS: Record<FieldMove, number> = {
  cut: 15,
  fly: 19,
  surf: 57,
  strength: 70,
  flash: 148,
};

/** Badge each field move requires. Cross-checked against GYM_LEADERS in tests. */
export const FIELD_MOVE_BADGES: Record<FieldMove, string> = {
  cut: 'CASCADE',
  fly: 'THUNDER',
  surf: 'SOUL',
  strength: 'RAINBOW',
  flash: 'BOULDER',
};

/**
 * Field moves whose gate also requires a party Pokemon that knows the move.
 * FLY is the odd one out: handleFieldMove() checks only the badge, because the
 * move can only be picked from the PartyScreen entry of a Pokemon that has it.
 */
export const FIELD_MOVE_NEEDS_PARTY_MOVE: Record<FieldMove, boolean> = {
  cut: true,
  fly: false,
  surf: true,
  strength: true,
  flash: true,
};

const CUT_HINT = ['This tree looks like\nit can be CUT down!'];
const STRENGTH_HINT = ['This boulder looks\nlike it can be moved!'];
const SURF_NO_SPOT = ["You can't SURF here!"];

/**
 * Every message a failed field-move gate can produce, by move and outcome.
 * Empty = the scene stays silent. `fly.noMove` and `fly.noTarget` are never
 * produced (FLY checks only its badge); they are here to keep the table total.
 */
export const FIELD_MOVE_MESSAGES: Record<
  FieldMove,
  { noTarget: string[]; noBadge: string[]; noMove: string[] }
> = {
  cut: { noTarget: ["There's nothing to\nCUT here!"], noBadge: CUT_HINT, noMove: CUT_HINT },
  fly: { noTarget: [], noBadge: ['You need the THUNDER\nBADGE to use FLY!'], noMove: [] },
  surf: {
    noTarget: SURF_NO_SPOT,
    noBadge: ['You need the SOUL\nBADGE to use SURF!'],
    noMove: SURF_NO_SPOT,
  },
  strength: {
    noTarget: ["There's nothing to\nuse STRENGTH on!"],
    noBadge: STRENGTH_HINT,
    noMove: STRENGTH_HINT,
  },
  flash: { noTarget: [], noBadge: [], noMove: [] },
};

export type FieldMoveOutcome = 'ok' | 'no_move' | 'no_badge' | 'no_target';

export interface FieldMoveState {
  badges: readonly string[];
  party: ReadonlyArray<{ moves: ReadonlyArray<{ moveId: number }> }>;
}

export interface FieldMoveContext {
  /** The faced tile is a valid target: CUT_TREE / water / BOULDER. Fly ignores it. */
  targetValid: boolean;
  /** Surf only: the player is already surfing (handleSurf bails out first). */
  isSurfing: boolean;
  /** Flash only: the map is dark (`currentMap.isDark`). */
  isDark: boolean;
  /** Flash only: flash was already used on this map. */
  flashUsed: boolean;
}

export interface FieldMoveDecision {
  outcome: FieldMoveOutcome;
  /** Exactly what the scene shows for this outcome; [] means it stays silent. */
  message: string[];
  /** What the tile handler returns to interact(): true = interaction consumed. */
  handled: boolean;
}

const DEFAULT_CONTEXT: FieldMoveContext = {
  targetValid: true,
  isSurfing: false,
  isDark: true,
  flashUsed: false,
};

export function partyKnowsMove(state: FieldMoveState, moveId: number): boolean {
  return state.party.some(p => p.moves.some(m => m.moveId === moveId));
}

export function hasFieldMoveBadge(move: FieldMove, state: FieldMoveState): boolean {
  return state.badges.includes(FIELD_MOVE_BADGES[move]);
}

function deny(move: FieldMove, outcome: 'no_target' | 'no_badge' | 'no_move', handled: boolean): FieldMoveDecision {
  const table = FIELD_MOVE_MESSAGES[move];
  const message = outcome === 'no_target' ? table.noTarget : outcome === 'no_badge' ? table.noBadge : table.noMove;
  return { outcome, message: message.slice(), handled };
}

/**
 * The field-move gate for one move. `ctx` defaults to "the target is valid",
 * which is how handleFieldMove()'s badge pre-check for FLY reads it.
 */
export function canUseFieldMove(
  move: FieldMove,
  state: FieldMoveState,
  ctx: Partial<FieldMoveContext> = {},
): FieldMoveDecision {
  const c: FieldMoveContext = { ...DEFAULT_CONTEXT, ...ctx };
  const hasBadge = hasFieldMoveBadge(move, state);
  const hasMove = partyKnowsMove(state, FIELD_MOVE_IDS[move]);

  switch (move) {
    case 'cut':
      // handleCut(): tile check first, then `!partyHasMove(15) || !CASCADE`.
      if (!c.targetValid) return deny('cut', 'no_target', false);
      if (!hasMove || !hasBadge) return deny('cut', hasMove ? 'no_badge' : 'no_move', true);
      return { outcome: 'ok', message: [], handled: true };

    case 'fly':
      // handleFieldMove() case 19: badge only, no party-move check.
      if (!hasBadge) return deny('fly', 'no_badge', false);
      return { outcome: 'ok', message: [], handled: true };

    case 'surf':
      // handleFieldMove() case 57 shows the badge message BEFORE calling
      // handleSurf(), so a missing badge wins over a missing move or tile.
      if (!hasBadge) return deny('surf', 'no_badge', false);
      // handleSurf(): already surfing / not water / no move all return false,
      // and the party-menu caller turns that into one message.
      if (c.isSurfing || !c.targetValid) return deny('surf', 'no_target', false);
      if (!hasMove) return deny('surf', 'no_move', false);
      return { outcome: 'ok', message: [], handled: true };

    case 'strength':
      // handleStrength(): tile check first, then `!partyHasMove(70) || !RAINBOW`.
      if (!c.targetValid) return deny('strength', 'no_target', false);
      if (!hasMove || !hasBadge) return deny('strength', hasMove ? 'no_badge' : 'no_move', true);
      return { outcome: 'ok', message: [], handled: true };

    case 'flash':
      // useFlash(): `!isDark || flashUsed` returns silently, and so does
      // `!partyHasMove(148) || !BOULDER`.
      if (!c.isDark || c.flashUsed) return deny('flash', 'no_target', false);
      if (!hasMove || !hasBadge) return deny('flash', hasMove ? 'no_badge' : 'no_move', false);
      return { outcome: 'ok', message: [], handled: true };
  }
}
