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

/** Shared mart hand-off: both presentation adapters use the same text and grant. */
export const OAKS_PARCEL_DIALOGUE = [
  "Hey! You came from\nPALLET TOWN?",
  "I have a package\nfor PROF. OAK!",
  "{PLAYER} received\nOAK's PARCEL!",
] as const;
export function grantOaksParcel(state: {hasItem(id:string):boolean; addItem(id:string):void}):void {
  if (!state.hasItem('oaks_parcel')) state.addItem('oaks_parcel');
}
