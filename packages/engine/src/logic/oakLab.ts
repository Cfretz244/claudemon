// Oak's Lab story chain: which stage of Prof. Oak's dialogue the player is at,
// what he says there, what the delivery grants, and when the rival ambushes the
// player on the way out.
//
// Extracted verbatim from OverworldScene (handleOak / the warp intercept in the
// move-complete handler / triggerRivalLabBattle). Behaviour-preserving: the same
// conditions, in the same order, with the same message strings and the same
// side effects. The scene still owns the Phaser parts — music, the Pikachu
// follower sprite, the text box, the battle transition — and substitutes
// {PLAYER}/{RIVAL} in the dialogue exactly as it always did.
//
// The mart side of the parcel lives in `oaksParcel.ts` (who hands it over);
// this module is the lab side (who takes it back). Together they are the whole
// parcel loop: shouldGiveOaksParcel() -> bag -> oakStage() === 'deliver_parcel'.

import { createPokemon } from '../entities/Pokemon';
import { PokemonInstance } from '../types/pokemon.types';

export const LAB_MAP_ID = 'oaks_lab';

/** The starter Oak hands over, as created in handleOak(). */
export const PIKACHU_SPECIES_ID = 25;
export const PIKACHU_LEVEL = 5;

/** Item ids moved by the delivery, and how many Poke Balls come with the Pokedex. */
export const OAKS_PARCEL_ITEM = 'oaks_parcel';
export const POKEDEX_ITEM = 'pokedex';
export const POKE_BALL_ITEM = 'poke_ball';
export const POKE_BALL_REWARD = 5;

/** Story flags the chain writes, in the order the chain writes them. */
export const HAS_PIKACHU_FLAG = 'has_pikachu';
export const DELIVERED_PARCEL_FLAG = 'delivered_parcel';
export const HAS_POKEDEX_FLAG = 'has_pokedex';

/**
 * Where the player is in Oak's chain. `awaiting_parcel` is the fallthrough:
 * Pikachu in hand, parcel neither carried nor delivered.
 */
export type OakStage = 'give_pikachu' | 'deliver_parcel' | 'post_delivery' | 'awaiting_parcel';

/**
 * What Oak says at each stage, as raw templates. The scene runs every line
 * through its `fmt()` ({PLAYER}/{RIVAL} substitution) before showing them;
 * lines without a placeholder pass through unchanged.
 */
export const OAK_DIALOGUE: Record<OakStage, readonly string[]> = {
  give_pikachu: [
    "OAK: Ah, {PLAYER}!\nI've been waiting\nfor you!",
    'I have a POKeMON\nhere for you!',
    'This PIKACHU is quite\nenergetic!',
    'Go on! Take it with\nyou on your journey!',
    '{PLAYER} received\nPIKACHU!',
  ],
  deliver_parcel: [
    "OAK: Oh! That's the\nparcel I was waiting\nfor!",
    'Thank you, {PLAYER}!',
    'OAK: I have something\nfor you in return!',
    "{PLAYER} handed over\nthe OAK'S PARCEL!",
    'OAK: This is a\nPOKeDEX!',
    "It automatically\nrecords data on\nPOKeMON you've seen\nor caught!",
    '{PLAYER} received\nthe POKeDEX!',
    'Here, take these\ntoo!',
    '{PLAYER} received\n5 POKe BALLs!',
  ],
  post_delivery: [
    'OAK: Good luck filling\nup that POKeDEX!',
    'The world is full of\namazing POKeMON!',
  ],
  awaiting_parcel: [
    'OAK: Go explore the\nworld with PIKACHU!',
    'The VIRIDIAN CITY\nMart might have\nsomething for me...',
  ],
};

/** The read-only slice of PlayerState that picks the stage. */
export interface OakChainState {
  storyFlags: Record<string, boolean>;
  hasItem(itemId: string): boolean;
}

/** The mutable slice the stage effects need. PlayerState satisfies it. */
export interface OakChainMutableState extends OakChainState {
  addToParty(pokemon: PokemonInstance): boolean;
  addItem(itemId: string, count?: number): void;
  useItem(itemId: string): boolean;
}

/**
 * Which branch of handleOak() runs, in handleOak()'s own order: the Pikachu
 * grant wins over everything, then an undelivered parcel in the bag, then the
 * post-delivery line, then the "go find the parcel" nudge.
 */
export function oakStage(state: OakChainState): OakStage {
  if (!state.storyFlags[HAS_PIKACHU_FLAG]) return 'give_pikachu';
  if (state.hasItem(OAKS_PARCEL_ITEM) && !state.storyFlags[DELIVERED_PARCEL_FLAG]) {
    return 'deliver_parcel';
  }
  if (state.storyFlags[DELIVERED_PARCEL_FLAG]) return 'post_delivery';
  return 'awaiting_parcel';
}

/**
 * The `give_pikachu` payoff, minus the Phaser bits (cry + follower sprite):
 * a Lv5 Pikachu into the party and the flag. Runs in the text box's onComplete,
 * so the party is only touched once the player has read the whole speech.
 */
export function applyPikachuGrant(state: OakChainMutableState, rng: () => number = Math.random): void {
  state.addToParty(createPokemon(PIKACHU_SPECIES_ID, PIKACHU_LEVEL, 'RED', rng));
  state.storyFlags[HAS_PIKACHU_FLAG] = true;
}

/**
 * The `deliver_parcel` payoff: the parcel leaves the bag, the Pokedex and five
 * Poke Balls arrive, and both flags go up together. `delivered_parcel` is what
 * re-entry guards read (npcVisibility's Route 22 rival, oaksParcel's mart);
 * `has_pokedex` is what the Pokedex menu entry and the Route 2 gate read.
 */
export function applyParcelDelivery(state: OakChainMutableState): void {
  state.useItem(OAKS_PARCEL_ITEM);
  state.addItem(POKEDEX_ITEM);
  state.addItem(POKE_BALL_ITEM, POKE_BALL_REWARD);
  state.storyFlags[DELIVERED_PARCEL_FLAG] = true;
  state.storyFlags[HAS_POKEDEX_FLAG] = true;
}

/** Runs the effects for a stage, if it has any. Talking to Oak again is a no-op. */
export function applyOakStage(stage: OakStage, state: OakChainMutableState, rng: () => number = Math.random): void {
  if (stage === 'give_pikachu') applyPikachuGrant(state, rng);
  else if (stage === 'deliver_parcel') applyParcelDelivery(state);
}

// ── Lab rival ────────────────────────────────────────────────────────────────

/** NPC id, trainer id and flag for the ambush on the way out of the lab. */
export const LAB_RIVAL_NPC_ID = 'rival';
export const LAB_RIVAL_TRAINER_ID = 'rival_lab';
export const RIVAL_BATTLE_LAB_FLAG = 'rival_battle_lab';

/** The read-only slice the trigger checks. */
export interface LabRivalState {
  storyFlags: Record<string, boolean>;
}

/**
 * The rival intercepts the player on the lab's exit warp: only in the lab, only
 * once Pikachu is in hand, and only until `rival_battle_lab` is set. The scene
 * checks this on the warp tile BEFORE warping, so a true verdict swallows the
 * warp entirely.
 */
export function shouldTriggerLabRivalBattle(mapId: string, state: LabRivalState): boolean {
  return mapId === LAB_MAP_ID &&
    !!state.storyFlags[HAS_PIKACHU_FLAG] &&
    !state.storyFlags[RIVAL_BATTLE_LAB_FLAG];
}

export type LabRivalOutcome = 'battle' | 'flag_only';

/**
 * What triggerRivalLabBattle() does once the trigger fires. If the rival sprite
 * is missing from the map, or `rival_lab` is already in defeatedTrainers, it
 * quietly consumes the encounter and lets the player walk out; otherwise the
 * rival's three lines run and the battle starts.
 *
 * BOTH outcomes consume the encounter — see consumeLabRivalEncounter(): the
 * flag is written as the battle LAUNCHES, not when it is won. Gen I's first
 * rival fight happens once whatever the result; before this was fixed only
 * `syncDerivedStoryFlags()` set the flag (from `defeatedTrainers`, on the next
 * init), so a LOST battle whited the player out with the flag still unset and
 * the ambush fired again on every attempt to leave the lab, forever.
 */
export function labRivalTriggerOutcome(ctx: {
  rivalNpcPresent: boolean;
  defeatedTrainers: readonly string[];
}): LabRivalOutcome {
  if (!ctx.rivalNpcPresent || ctx.defeatedTrainers.includes(LAB_RIVAL_TRAINER_ID)) {
    return 'flag_only';
  }
  return 'battle';
}

/**
 * Consume the one-off lab ambush by writing `rival_battle_lab`.
 *
 * Timing is the whole point: the scene calls this at battle START (in the text
 * box's onComplete, immediately before startRivalBattle builds its return
 * data), the same moment Snorlax and the static legendaries write their
 * `<id>_cleared` flags. BattleScene snapshots `playerState.toSave()` when the
 * battle is launched and the whiteout path restarts the overworld from that
 * snapshot, so a flag written here survives a LOSS; a flag derived from
 * `defeatedTrainers` afterwards does not. The 'flag_only' outcome calls it too,
 * so walking out of a rival-less lab still closes the encounter.
 */
export function consumeLabRivalEncounter(state: LabRivalState): void {
  state.storyFlags[RIVAL_BATTLE_LAB_FLAG] = true;
}

/** Which line the rival NPC gives when the player talks to him in the lab. */
export type LabRivalTalk = 'no_pikachu' | 'post_battle' | 'battle';

/**
 * The rival's lab dialogue per branch, as raw {PLAYER}/{RIVAL} templates the
 * scene runs through `fmt()` — same convention as OAK_DIALOGUE. The 'battle'
 * lines are followed by the battle itself (and by consumeLabRivalEncounter,
 * exactly like the warp-tile ambush).
 */
export const LAB_RIVAL_TALK_DIALOGUE: Record<LabRivalTalk, readonly string[]> = {
  no_pikachu: [
    "{RIVAL}: What?\nGramps isn't here?",
    'I want my POKeMON!',
  ],
  post_battle: [
    "{RIVAL}: I'll get\nstronger and beat\nyou next time!",
  ],
  battle: [
    '{RIVAL}: Wait,\n{PLAYER}!',
    "Let's check out our\nnew POKeMON!",
  ],
};

/**
 * Talking to the rival inside the lab, in handleRivalInLab()'s own order: no
 * Pikachu yet -> he is still waiting on Oak; `rival_battle_lab` set -> the
 * post-battle line; otherwise he challenges you on the spot. Because the flag
 * now goes up at battle start, the post-battle line is what he says after a
 * LOSS as well as after a win — which is the Gen I behaviour.
 */
export function labRivalTalkOutcome(state: LabRivalState): LabRivalTalk {
  if (!state.storyFlags[HAS_PIKACHU_FLAG]) return 'no_pikachu';
  if (state.storyFlags[RIVAL_BATTLE_LAB_FLAG]) return 'post_battle';
  return 'battle';
}
