// Fly destination registry + availability filter, extracted from
// OverworldScene.showFlyMap (the scene keeps the selection UI).

export interface FlyDestination {
  name: string;
  mapId: string;
  x: number;
  y: number;
}

export const FLY_DESTINATIONS: FlyDestination[] = [
  { name: 'PALLET TOWN', mapId: 'pallet_town', x: 9, y: 8 },
  { name: 'VIRIDIAN CITY', mapId: 'viridian_city', x: 9, y: 14 },
  { name: 'PEWTER CITY', mapId: 'pewter_city', x: 16, y: 9 },
  { name: 'CERULEAN CITY', mapId: 'cerulean_city', x: 14, y: 11 },
  { name: 'VERMILION CITY', mapId: 'vermilion_city', x: 11, y: 9 },
  { name: 'LAVENDER TOWN', mapId: 'lavender_town', x: 11, y: 9 },
  { name: 'CELADON CITY', mapId: 'celadon_city', x: 14, y: 11 },
  { name: 'SAFFRON CITY', mapId: 'saffron_city', x: 14, y: 11 },
  { name: 'FUCHSIA CITY', mapId: 'fuchsia_city', x: 14, y: 11 },
  { name: 'CINNABAR ISLAND', mapId: 'cinnabar_island', x: 10, y: 9 },
];

/** Towns the player can fly to: visited ones, plus Pallet Town always. */
export function getAvailableFlyDestinations(
  storyFlags: Record<string, boolean>,
): FlyDestination[] {
  return FLY_DESTINATIONS.filter(
    d => storyFlags[`visited_${d.mapId}`] || d.mapId === 'pallet_town',
  );
}
