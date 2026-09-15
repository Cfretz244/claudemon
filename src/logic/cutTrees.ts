// The persisted cut-tree story flags, `cut_<mapId>_<x>_<y>`: `cutTreeFlag()`
// writes one (OverworldScene.handleCut, once the tile has become grass) and
// `getCutTiles()` parses them all back for the map the player just entered
// (OverworldScene.restoreCutTrees, which still validates the tile type and
// mutates the map). Both sides now share one prefix, so the round trip cannot
// drift apart.
//
// ⚠️ Known quirk, pinned as-is by `cutTrees.test.ts` and NOT fixed here: the
// read side is a `startsWith` on `cut_<mapId>_`, so when one map id is a prefix
// of another (`ss_anne` / `ss_anne_2f`) the shorter map also matches the longer
// map's flags. `cut_ss_anne_2f_3_4` would `slice` to `2f_3_4` and `parseInt`
// to (2, 3) on `ss_anne`. It is harmless in the shipped game for three
// independent reasons:
//  - none of the 34 real prefix pairs in ALL_MAPS involves a map with CUT_TREE
//    tiles, so no such flag is ever written;
//  - every real suffix that is not digit-leading (`_b1f`, `_west`, `_gate`,
//    `_pewter`, ...) parses to NaN and is dropped anyway — including
//    `safari_zone` / `safari_zone_west`, the only pair where either map has a
//    CUT_TREE at all;
//  - `restoreCutTrees()` only clears a tile that is actually `CUT_TREE`, so a
//    stray coordinate is a no-op unless it happens to land on a real tree.
// Fixing it means changing the flag format (a separator that cannot appear in
// a map id) or matching against the known map ids, which is a save-migration
// job, not a refactor.

/** The `startsWith` prefix both sides of the round trip use. */
export const cutTreePrefix = (mapId: string) => `cut_${mapId}_`;

/** The flag the scene sets when a CUT_TREE at (x, y) on `mapId` is cut down. */
export const cutTreeFlag = (mapId: string, x: number, y: number) =>
  `${cutTreePrefix(mapId)}${x}_${y}`;

export function getCutTiles(
  storyFlags: Record<string, boolean>,
  mapId: string,
): Array<[number, number]> {
  const prefix = cutTreePrefix(mapId);
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
