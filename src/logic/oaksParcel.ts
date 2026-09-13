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
