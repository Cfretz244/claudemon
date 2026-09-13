// A trainer that spots the player walks up to them and keeps that tile for
// the rest of the visit (OverworldScene.triggerTrainerEncounter rewrites
// npc.x/y; the live map is reused when the battle ends). So a trainer that can
// see down a one-tile corridor turns into a wall across it the moment it
// spots someone: on Victory Road 2F the tamer at 14,4 saw through the opened
// gate, walked onto the gate tile and sealed the ladder to 3F behind him.
//
// Rule: for every trainer with a sight range of 2 or more, and every tile it
// can stop on (1 .. range-1 along its facing line, gates counted open since
// sight passes through them once opened), the player standing on the next
// tile must still be able to reach every warp they could reach before the
// walk. Reachability is optimistic (gates open, boulders pushable, ledges
// both ways): the point is corridor chokepoints, which no puzzle state fixes.
// Trainers that vanish once defeated (the Cerulean rocket) never stay anywhere.
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, NPCData, TileType } from '../../src/types/map.types';
import { DIR_VECTORS } from '../../src/utils/constants';
import { shouldSkipNPC } from '../../src/logic/npcVisibility';

type Pos = { x: number; y: number };
const k = (p: Pos) => `${p.x},${p.y}`;
const open = (m: MapData, p: Pos) => {
  const t = m.tiles[p.y]?.[p.x];
  if (t === undefined) return false;
  return !m.collision[p.y][p.x] || t === TileType.GATE || t === TileType.BOULDER;
};
const reachable = (m: MapData, from: Pos, blocked: Set<string>): Set<string> => {
  const seen = new Set<string>([k(from)]);
  const q: Pos[] = [from];
  while (q.length) {
    const c = q.shift()!;
    for (const d of Object.values(DIR_VECTORS)) {
      const n = { x: c.x + d.x, y: c.y + d.y };
      if (seen.has(k(n)) || blocked.has(k(n)) || !open(m, n)) continue;
      seen.add(k(n)); q.push(n);
    }
  }
  return seen;
};

/** Tiles along the trainer's facing line up to its range, stopping at the first tile it cannot see past. */
const sightLine = (m: MapData, t: NPCData): Pos[] => {
  const v = DIR_VECTORS[t.direction];
  const out: Pos[] = [];
  for (let i = 1; i <= (t.sightRange ?? 0); i++) {
    const p = { x: t.x + v.x * i, y: t.y + v.y * i };
    if (!open(m, p) || m.npcs.some(n => n !== t && n.x === p.x && n.y === p.y)) break;
    out.push(p);
  }
  return out;
};

describe('a spotting trainer never walls the player in', () => {
  it('every stop tile on every sight line leaves every warp the player could reach still reachable', () => {
    const problems: string[] = [];
    for (const m of Object.values(ALL_MAPS)) {
      const warps = m.warps.map(w => k(w));
      for (const t of m.npcs) {
        if (!t.isTrainer || (t.sightRange ?? 0) < 2) continue;
        const none = () => false;
        if (shouldSkipNPC(t, {}, [], [t.id], none) && !shouldSkipNPC(t, {}, [], [], none)) continue;
        const line = sightLine(m, t);
        const others = new Set(m.npcs.filter(n => n !== t).map(k));
        for (let i = 0; i + 1 < line.length; i++) {
          const stop = line[i], player = line[i + 1];
          const before = reachable(m, player, new Set([...others, k(t)]));
          const after = reachable(m, player, new Set([...others, k(stop)]));
          const lost = warps.filter(w => before.has(w) && !after.has(w));
          if (lost.length) problems.push(`${m.id}: ${t.id} at ${k(t)} facing ${t.direction} (range ${t.sightRange}) spots the player at ${k(player)}, stops at ${k(stop)} and cuts off warp(s) ${lost.join(' ')}`);
        }
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  // The same walk on a puzzle floor: the trainer's stop tile becomes an
  // obstacle the solver tests never saw (they take every NPC at its post).
  // Parked on a switch plate no boulder can press it; parked in a hole's
  // mouth or beside a boulder, a push lane is gone; parked on a spin tile the
  // ride is cut. Nothing in the puzzle state undoes any of that, so on such
  // floors a spotting trainer must not be able to stop on or next to a
  // puzzle tile. Today every dungeon trainer has range 1 (never moves); this
  // keeps the next map honest.
  it('on a puzzle floor no stop tile is a plate, hole or spin tile, or next to a boulder, plate or hole', () => {
    const puzzleTiles = new Set([TileType.SWITCH_PLATE, TileType.BOULDER_HOLE, TileType.BOULDER]);
    const problems: string[] = [];
    for (const m of Object.values(ALL_MAPS)) {
      const spin = m.spinTiles ?? {};
      const isPuzzle = (m.gates?.length ?? 0) > 0 || (m.holes?.length ?? 0) > 0 || Object.keys(spin).length > 0 ||
        m.tiles.some(row => row.some(t => puzzleTiles.has(t)));
      if (!isPuzzle) continue;
      for (const t of m.npcs) {
        if (!t.isTrainer || (t.sightRange ?? 0) < 2) continue;
        const none = () => false;
        if (shouldSkipNPC(t, {}, [], [t.id], none) && !shouldSkipNPC(t, {}, [], [], none)) continue;
        const line = sightLine(m, t);
        for (const stop of line.slice(0, -1)) {
          const tile = m.tiles[stop.y][stop.x];
          const why: string[] = [];
          if (puzzleTiles.has(tile)) why.push(`stops on ${TileType[tile]}`);
          if (spin[k(stop)]) why.push('stops on a spin tile');
          for (const d of Object.values(DIR_VECTORS)) {
            const n = { x: stop.x + d.x, y: stop.y + d.y };
            const nt = m.tiles[n.y]?.[n.x];
            if (nt !== undefined && puzzleTiles.has(nt)) why.push(`stops next to ${TileType[nt]} at ${k(n)}`);
          }
          if (why.length) problems.push(`${m.id}: ${t.id} at ${k(t)} facing ${t.direction} (range ${t.sightRange}) ${why.join(', ')} at ${k(stop)}`);
        }
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });
});
