// A town is drawn once, in its sketch, and the map is built from it.
//
// `src/data/sketches/pallet_town.json` is the design artefact — the drawing
// Fable's `tools/town-sketch-check.mjs` validates (doors reachable, no NPC in a
// wall, every path connected). `packages/engine/src/data/sketches/palletTown.ts`
// is the same drawing as engine data, and `maps.ts` builds PALLET_TOWN from it.
// This file is the join: the two copies must be identical, and the shipped map
// must actually agree with them — so a coordinate can only be changed in one
// place, and changing it there changes the game.
import { describe, it, expect } from 'vitest';
import palletJson from '../../src/data/sketches/pallet_town.json';
import { PALLET_TOWN_SKETCH } from '../../packages/engine/src/data/sketches/palletTown';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';

/** `"TALL_GRASS"` -> `TileType.TALL_GRASS` (the JSON names tiles, not numbers). */
function tileByName(name: string): TileType {
  const t = (TileType as unknown as Record<string, TileType | undefined>)[name];
  if (t === undefined) throw new Error(`the sketch legend names an unknown tile: ${name}`);
  return t;
}

/** Tiles `stampBuilding` may write inside a footprint. */
const BUILDING_TILES = new Set<TileType>([
  TileType.BUILDING, TileType.WINDOW, TileType.DOOR, TileType.SIGNBOARD,
  TileType.ROOF, TileType.ROOF_RIDGE, TileType.ROOF_EDGE_L, TileType.ROOF_EDGE_R,
  TileType.CHIMNEY,
]);

const sketch = PALLET_TOWN_SKETCH;
const town = ALL_MAPS.pallet_town;
const inBuilding = (x: number, y: number) =>
  sketch.buildings.some(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);

describe('Pallet Town is built from its sketch', () => {
  it('the engine sketch is the shipped sketch, character for character', () => {
    // `src/data/sketches/pallet_town.json` is `docs/towns/pallet_town.json` from
    // the design repo, with one deliberate edit recorded in `palletTown.ts`: the
    // tree ring closes right up to the two-wide Route 1 gap, because a path tile
    // beside an edge warp is ground no player can stand on (the warp fires
    // first) — see `tests/data/signsSolid.test.ts`. From here on the two copies
    // move together or this fails.
    expect(sketch.id).toBe(palletJson.id);
    expect(sketch.rows).toEqual(palletJson.rows);

    const jsonLegend = Object.fromEntries(
      Object.entries(palletJson.legend).map(([ch, name]) => [ch, tileByName(name)]),
    );
    expect(sketch.legend).toEqual(jsonLegend);
    expect(sketch.buildings).toEqual(palletJson.buildings);
    expect(sketch.npcs).toEqual(palletJson.npcs);
    expect(sketch.edgeWarps).toEqual(palletJson.edgeWarps);
    expect(sketch.lookouts).toEqual(palletJson.lookouts);
  });

  it('the map is the size of the sketch, and every row is the same width', () => {
    expect(new Set(sketch.rows.map(r => r.length)).size).toBe(1);
    expect(town.width).toBe(sketch.rows[0].length);
    expect(town.height).toBe(sketch.rows.length);
    expect(town.tiles.length).toBe(town.height);
    expect(town.tiles.every(row => row.length === town.width)).toBe(true);
  });

  it('every tile outside a building footprint is the tile the sketch drew', () => {
    const wrong: string[] = [];
    for (let y = 0; y < town.height; y++) {
      for (let x = 0; x < town.width; x++) {
        if (inBuilding(x, y)) continue;                 // stamped over by the kit
        const want = sketch.legend[sketch.rows[y][x]];
        if (town.tiles[y][x] !== want) {
          wrong.push(`(${x},${y}) is ${TileType[town.tiles[y][x]]}, sketch says ${TileType[want]}`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it('every building footprint is stamped, and its door is the sketch door', () => {
    for (const b of sketch.buildings) {
      const [dx, dy] = b.door;
      expect(town.tiles[dy][dx], `${b.warp} door`).toBe(TileType.DOOR);
      expect(dy, `${b.warp} door is on the bottom row of its footprint`).toBe(b.y + b.h - 1);
      for (let y = b.y; y < b.y + b.h; y++) {
        for (let x = b.x; x < b.x + b.w; x++) {
          expect(BUILDING_TILES.has(town.tiles[y][x]), `${b.warp} (${x},${y})`).toBe(true);
          expect(town.tileKinds?.[`${x},${y}`], `${b.warp} kind at (${x},${y})`).toBe(b.kind);
        }
      }
      // The kit writes the doorstep below the door; it is where the interior
      // puts the player back, so it has to be standable and empty.
      const mat = { x: dx, y: dy + 1 };
      expect(town.tiles[mat.y][mat.x], `${b.warp} doorstep`).toBe(TileType.DOORMAT);
      expect(town.collision[mat.y][mat.x]).toBe(false);
      expect(town.npcs.some(n => n.x === mat.x && n.y === mat.y)).toBe(false);
      expect(town.warps.some(w => w.x === mat.x && w.y === mat.y)).toBe(false);
    }
  });

  it('each door warps into its interior, and the interior comes back to the doorstep', () => {
    for (const b of sketch.buildings) {
      const [dx, dy] = b.door;
      const warp = town.warps.find(w => w.x === dx && w.y === dy);
      expect(warp?.targetMap, `warp on the ${b.warp} door`).toBe(b.warp);

      const interior: MapData | undefined = ALL_MAPS[b.warp];
      expect(interior, `${b.warp} exists`).toBeDefined();
      const backs = interior!.warps.filter(w => w.targetMap === 'pallet_town');
      expect(backs.length, `${b.warp} exits`).toBeGreaterThan(0);
      for (const back of backs) {
        expect({ x: back.targetX, y: back.targetY }, `${b.warp} exit at (${back.x},${back.y})`)
          .toEqual({ x: dx, y: dy + 1 });
      }
    }
  });

  it('every edge warp sits on the border where the sketch puts it, and the route comes back inside', () => {
    for (const [x, y, target] of sketch.edgeWarps) {
      const warp = town.warps.find(w => w.x === x && w.y === y);
      expect(warp?.targetMap, `edge warp at (${x},${y})`).toBe(target);
      expect(x === 0 || y === 0 || x === town.width - 1 || y === town.height - 1).toBe(true);
      expect(town.collision[y][x], `edge warp tile (${x},${y}) is standable`).toBe(false);
    }
    // ...and everything that warps back in lands on a walkable tile that is not
    // itself a warp (you would bounce straight back out) and has nobody on it.
    for (const map of Object.values(ALL_MAPS)) {
      for (const w of map.warps) {
        if (w.targetMap !== 'pallet_town') continue;
        const at = `${map.id} (${w.x},${w.y}) -> (${w.targetX},${w.targetY})`;
        expect(town.collision[w.targetY][w.targetX], `${at} lands on a wall`).toBe(false);
        expect(town.warps.some(o => o.x === w.targetX && o.y === w.targetY), `${at} lands on a warp`).toBe(false);
        expect(town.npcs.some(n => n.x === w.targetX && n.y === w.targetY), `${at} lands on an NPC`).toBe(false);
      }
    }
  });

  it('every NPC stands where the sketch puts them, on their own walkable tile', () => {
    expect(town.npcs.map(n => ({ id: n.id, x: n.x, y: n.y }))).toEqual(sketch.npcs);
    for (const n of town.npcs) {
      expect(town.collision[n.y][n.x], `${n.id} at (${n.x},${n.y})`).toBe(false);
      expect(town.warps.some(w => w.x === n.x && w.y === n.y), `${n.id} stands on a warp`).toBe(false);
      expect(n.dialogue.length, `${n.id} has something to say`).toBeGreaterThan(0);
    }
    expect(new Set(town.npcs.map(n => `${n.x},${n.y}`)).size).toBe(town.npcs.length);
  });

  it('both signs the sketch draws have text, and no sign tile is anywhere else', () => {
    const signTiles: string[] = [];
    town.tiles.forEach((row, y) => row.forEach((t, x) => { if (t === TileType.SIGN) signTiles.push(`${x},${y}`); }));
    const fromSketch: string[] = [];
    sketch.rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (sketch.legend[ch] === TileType.SIGN) fromSketch.push(`${x},${y}`);
    }));
    expect(signTiles.sort()).toEqual(fromSketch.sort());
  });
});
