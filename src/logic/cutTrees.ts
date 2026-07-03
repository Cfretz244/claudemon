// Parses persisted cut-tree story flags ("cut_<mapId>_<x>_<y>") back into
// tile coordinates. Extracted from OverworldScene.restoreCutTrees; the scene
// still validates the tile type and mutates the map.

export function getCutTiles(
  storyFlags: Record<string, boolean>,
  mapId: string,
): Array<[number, number]> {
  const prefix = `cut_${mapId}_`;
  const tiles: Array<[number, number]> = [];
  for (const key of Object.keys(storyFlags)) {
    if (key.startsWith(prefix) && storyFlags[key]) {
      const parts = key.slice(prefix.length).split('_');
      const x = parseInt(parts[0]);
      const y = parseInt(parts[1]);
      if (!isNaN(x) && !isNaN(y)) {
        tiles.push([x, y]);
      }
    }
  }
  return tiles;
}
