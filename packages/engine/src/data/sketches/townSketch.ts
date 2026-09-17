import { BuildingKind, TileType } from '../../types/map.types';

/**
 * A town drawn as an ASCII sketch plus the objects that sit on it.
 *
 * The sketch IS the map: `maps.ts` builds the town from `rows` + `legend` and
 * stamps `buildings` over it, so a door, an NPC spot or an edge warp has
 * exactly one place it can be changed. The same drawing lives in the repo as
 * `src/data/sketches/<id>.json` (the design artefact Fable's
 * `tools/town-sketch-check.mjs` validates); `tests/data/townSketch.test.ts`
 * asserts the two are identical and that the built map agrees with both.
 */
export interface TownSketch {
  id: string;
  /** One TileType per sketch character. Building glyphs are stamped over. */
  legend: Record<string, TileType>;
  /** One string per row, every row the same width. */
  rows: string[];
  /** Stamped with `stampBuilding` after the rows are drawn. */
  buildings: Array<{
    kind: BuildingKind;
    /** Top-left corner of the footprint, roof included. */
    x: number;
    y: number;
    w: number;
    h: number;
    /** The DOOR tile, absolute. The warp into `warp` goes here. */
    door: [number, number];
    /** Interior map id this building's door leads to. */
    warp: string;
    /** Free-text design note; ignored by the builder. */
    note?: string;
  }>;
  /** Where each NPC stands (dialogue, colours and behaviour stay in `maps.ts`). */
  npcs: Array<{ id: string; x: number; y: number }>;
  /** `[x, y, targetMapId]` on the map border. */
  edgeWarps: Array<[number, number, string]>;
  /** Path tiles that are allowed to dead-end: benches, piers, viewpoints. */
  lookouts: Array<[number, number]>;
}
