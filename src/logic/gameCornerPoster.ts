// The Game Corner poster: the hidden switch that opens the Rocket Hideout.
//
// Extracted verbatim from OverworldScene.readSign()'s special case for the
// `game_corner:11,2` SIGN tile. Behaviour-preserving: the same three branches,
// in the same order, with the same message strings, and the flag still written
// by the scene from the text box's onComplete.
//
// The flag it writes, `game_corner_poster_found`, is the one the Rocket Hideout
// B1F entry gate requires when coming from the Game Corner
// (`maps_hideout.ts`); that gate's message is empty, so a player who has not
// found the switch simply cannot take the stairs and is told nothing.
// `gameCornerPoster.test.ts` pins the two sides against each other.

/** The poster is a SIGN tile, so it is addressed by `readSign`'s `<mapId>:<x>,<y>` key. */
export const POSTER_MAP_ID = 'game_corner';
export const POSTER_X = 11;
export const POSTER_Y = 2;
export const POSTER_SIGN_KEY = `${POSTER_MAP_ID}:${POSTER_X},${POSTER_Y}`;

/** The flag the switch sets — read by the Rocket Hideout B1F entry gate. */
export const POSTER_FOUND_FLAG = 'game_corner_poster_found';

/** The Rocket who guards the poster; the switch only appears once he is beaten. */
export const POSTER_ROCKET_TRAINER_ID = 'game_corner_poster_rocket';

/**
 * Which of the three readings the player gets:
 *  - `found`: the switch has already been flipped.
 *  - `reveal`: the guard is beaten and this reading flips it.
 *  - `plain`: the guard still stands there; it is just a poster.
 */
export type PosterStage = 'found' | 'reveal' | 'plain';

export const POSTER_MESSAGES: Record<PosterStage, readonly string[]> = {
  found: ['The hidden stairs\nlead underground...'],
  reveal: ["There's a switch\nbehind the poster!", 'A hidden staircase\nappeared!'],
  plain: ['A poster for a GAME\nCORNER tournament...'],
};

/** The read-only slice of PlayerState the poster reads. */
export interface PosterState {
  storyFlags: Record<string, boolean>;
  defeatedTrainers: readonly string[];
}

export interface PosterDecision {
  stage: PosterStage;
  /** Exactly what the scene shows. */
  messages: string[];
  /** The flag to set once the messages are read, or null. */
  setsFlag: string | null;
}

/** True for the one sign key `readSign()` diverts into this module. */
export function isPosterSign(signKey: string): boolean {
  return signKey === POSTER_SIGN_KEY;
}

/**
 * Reading the poster. The already-found branch wins over everything (so the
 * flag is only ever written once), then the beaten guard, then the plain
 * poster. Note the flag is what gates the hideout stairs, not the guard: a
 * player who beats the Rocket but never reads the poster stays locked out.
 */
export function posterOutcome(state: PosterState): PosterDecision {
  if (state.storyFlags[POSTER_FOUND_FLAG]) {
    return { stage: 'found', messages: POSTER_MESSAGES.found.slice(), setsFlag: null };
  }
  if (state.defeatedTrainers.includes(POSTER_ROCKET_TRAINER_ID)) {
    return { stage: 'reveal', messages: POSTER_MESSAGES.reveal.slice(), setsFlag: POSTER_FOUND_FLAG };
  }
  return { stage: 'plain', messages: POSTER_MESSAGES.plain.slice(), setsFlag: null };
}
