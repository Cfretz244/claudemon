// Whether a Poke Mart clerk should hand over Oak's Parcel instead of opening
// the shop. Only the Viridian City mart (map id 'pokemart') carries it.

export const PARCEL_MART_ID = 'pokemart';

export function shouldGiveOaksParcel(
  mapId: string,
  storyFlags: Record<string, boolean>,
  hasItem: (id: string) => boolean,
): boolean {
  return mapId === PARCEL_MART_ID &&
    !!storyFlags['has_pikachu'] &&
    !hasItem('oaks_parcel') &&
    !storyFlags['delivered_parcel'];
}

/**
 * The mart clerk's hand-off, shared so a second renderer says the same three
 * lines. `{PLAYER}` is the placeholder the scene used to interpolate inline;
 * `oaksParcelDialogue()` fills it in, so the strings stay in one place.
 */
export const OAKS_PARCEL_DIALOGUE = [
  "Hey! You came from\nPALLET TOWN?",
  "I have a package\nfor PROF. OAK!",
  "{PLAYER} received\nOAK's PARCEL!",
] as const;

export const PLAYER_NAME_PLACEHOLDER = '{PLAYER}';

/** The three lines with the player's name substituted, in order. */
export function oaksParcelDialogue(playerName: string): string[] {
  return OAKS_PARCEL_DIALOGUE.map(line => line.split(PLAYER_NAME_PLACEHOLDER).join(playerName));
}

/** The grant that runs when the last line is acknowledged. Idempotent. */
export function grantOaksParcel(state: {
  hasItem(id: string): boolean;
  addItem(id: string): void;
}): void {
  if (!state.hasItem('oaks_parcel')) state.addItem('oaks_parcel');
}
