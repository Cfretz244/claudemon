// Picking up an item ball: what the player is told, what goes in the bag,
// which story flags go up and which ball sprites vanish.
//
// Extracted verbatim from OverworldScene.pickUpItemBall(). Behaviour-preserving:
// the same unknown-item no-op, the same message string, the same flag names and
// the same sprite removals in the same order. The scene still owns the Phaser
// half — the text box, `PlayerState.addItem`, `syncDerivedStoryFlags()`,
// `applyFlagGates()` and destroying the sprites — and it still applies all of
// it from the text box's onComplete, exactly where it did before:
//
//   addItem -> flags -> syncDerivedStoryFlags -> applyFlagGates -> removeSprites
//
// `itemBallAction()` in `src/logic/encounters.ts` decides whether a ball is a
// pickup at all or a fake ball that ambushes the player; this module only
// handles the pickup half.
//
// Two flags are in play and they are written by different owners:
//  - `picked_up_<npc id>` (this module) is what `shouldSkipNPC()` hides a taken
//    ball by, so the ball stays gone across map re-entries and saves.
//  - `has_<key item>` (NOT this module) is derived by `syncDerivedStoryFlags()`
//    from the bag, which is why the scene calls it here: a door key picked up
//    on a Silph floor has to open that floor's `has_card_key` gates on the spot
//    rather than on the next map load. `itemBalls.test.ts` pins that chain.
//
// One ordering note: the scene used to write `got_fossil` AFTER
// `applyFlagGates()`, and now writes it with the other flags, before. That is
// unobservable — no `GateData.flag` in any shipped map is `got_fossil` (the
// only gate flags are `has_card_key` and the four Pokemon Mansion switches),
// and the flag's real readers are `shouldSkipNPC()` and Mt. Moon's north
// entry gate, both of which run later. `itemBalls.test.ts` pins the gate-flag
// sweep that makes it safe.

import { ITEMS } from '../data/items';
import { NPCData } from '../types/map.types';

/** The flag that hides a taken ball, read by `shouldSkipNPC()`. */
export const pickedUpFlag = (npcId: string) => `picked_up_${npcId}`;

/** The two Mt. Moon fossil balls: taking one takes the other off the floor. */
export const HELIX_FOSSIL_BALL = 'mt_moon_helix_fossil';
export const DOME_FOSSIL_BALL = 'mt_moon_dome_fossil';
export const FOSSIL_BALL_IDS = [HELIX_FOSSIL_BALL, DOME_FOSSIL_BALL] as const;

/** Set alongside `picked_up_<id>` for either fossil; gates Mt. Moon's north mouth. */
export const GOT_FOSSIL_FLAG = 'got_fossil';

/** The other fossil ball, or null for any ball that is not a fossil. */
export function otherFossilBall(npcId: string): string | null {
  if (npcId === HELIX_FOSSIL_BALL) return DOME_FOSSIL_BALL;
  if (npcId === DOME_FOSSIL_BALL) return HELIX_FOSSIL_BALL;
  return null;
}

export interface ItemBallPickup {
  /** Exactly what the scene shows, before anything is applied. */
  messages: string[];
  /** The item id handed to `PlayerState.addItem()`. */
  itemId: string;
  /** Story flags the scene sets to true, in order, before the derived sync. */
  flags: string[];
  /** NPC ids whose sprites the scene destroys, in order (own ball first). */
  removeSprites: string[];
}

/** The read-only slice of PlayerState the message needs. */
export interface ItemBallState {
  name: string;
}

/**
 * Picking up the ball `npc`. Null means "nothing happens": the ball has no
 * `itemId`, or names an item that is not in `ITEMS`. That is the original
 * `const item = ITEMS[npc.itemId!]; if (!item) return;` — no text, no flag, no
 * sprite removal, and the ball is still there afterwards.
 *
 * The flag is never checked here: a taken ball is hidden by `shouldSkipNPC()`,
 * so this is never reached for one.
 */
export function itemBallPickup(
  npc: Pick<NPCData, 'id' | 'itemId'>,
  state: ItemBallState,
): ItemBallPickup | null {
  const item = npc.itemId ? ITEMS[npc.itemId] : undefined;
  if (!item) return null;

  const flags = [pickedUpFlag(npc.id)];
  const removeSprites = [npc.id];
  const other = otherFossilBall(npc.id);
  if (other) {
    flags.push(GOT_FOSSIL_FLAG);
    removeSprites.push(other);
  }

  return {
    messages: [`${state.name} found\n${item.name}!`],
    itemId: npc.itemId!,
    flags,
    removeSprites,
  };
}
