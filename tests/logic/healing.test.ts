import { describe, it, expect } from 'vitest';
import { restoreParty, healVisitFlag } from '../../src/logic/healing';
import { visitedFlag } from '../../src/logic/elevator';
import { ALL_MAPS } from '../../src/data/maps';
import { FLY_DESTINATIONS, getAvailableFlyDestinations } from '../../src/data/flyDestinations';
import { TileType } from '../../src/types/map.types';
import { createPokemon } from '../../src/entities/Pokemon';
import { StatusCondition } from '../../src/types/pokemon.types';

describe('restoreParty', () => {
  it('restores HP, status and PP and reports that something changed', () => {
    const a = createPokemon(25, 20);
    const b = createPokemon(1, 15);
    a.currentHp = 1;
    a.status = StatusCondition.POISON;
    b.moves[0].currentPp = 0;
    expect(restoreParty([a, b])).toBe(true);
    expect(a.currentHp).toBe(a.stats.hp);
    expect(a.status).toBe(StatusCondition.NONE);
    expect(b.moves[0].currentPp).toBe(b.moves[0].maxPp);
    expect(b.currentHp).toBe(b.stats.hp);
  });

  it('a party already at full reports no change (no jingle)', () => {
    const a = createPokemon(25, 20);
    expect(restoreParty([a])).toBe(false);
    expect(restoreParty([])).toBe(false);
  });

  it('a fainted Pokemon is revived to full', () => {
    const a = createPokemon(25, 20);
    a.currentHp = 0;
    expect(restoreParty([a])).toBe(true);
    expect(a.currentHp).toBe(a.stats.hp);
  });
});

// ── healVisitFlag: the `visited_<town>` a Pokemon Center heal writes ─────────
// Pins the flag the nurse's heal animation sets (step 4) against the two
// things that give it meaning: the map data (warps[0] of a centre is its front
// door) and the Fly registry (a town is a Fly stop once it is `visited_`).

/** Every map the scene will run a nurse heal on: `id.startsWith('nurse')`. */
const NURSE_MAPS = Object.values(ALL_MAPS).filter(m => m.npcs.some(n => n.id.startsWith('nurse')));

describe('healVisitFlag', () => {
  it('names the town the centre\'s front door opens onto', () => {
    expect(healVisitFlag(ALL_MAPS['pokemon_center_cerulean'])).toBe('visited_cerulean_city');
    expect(healVisitFlag(ALL_MAPS['pokemon_center'])).toBe('visited_viridian_city');
  });

  it('is the shared `visited_` template, not a second copy of it', () => {
    for (const map of NURSE_MAPS) {
      expect(healVisitFlag(map)).toBe(visitedFlag(map.warps[0].targetMap));
    }
  });

  it('a map with no warps writes nothing', () => {
    expect(healVisitFlag({ warps: [] })).toBeNull();
  });

  it('there are twelve healing maps, eleven of them Pokemon Centers', () => {
    expect(NURSE_MAPS.map(m => m.id).sort()).toEqual([
      'indigo_league_lobby',
      'pokemon_center', 'pokemon_center_celadon', 'pokemon_center_cerulean',
      'pokemon_center_cinnabar', 'pokemon_center_fuchsia', 'pokemon_center_lavender',
      'pokemon_center_pewter', 'pokemon_center_route10', 'pokemon_center_route3',
      'pokemon_center_saffron', 'pokemon_center_vermilion',
    ]);
  });

  it('every healing map writes a flag naming a real map', () => {
    for (const map of NURSE_MAPS) {
      const flag = healVisitFlag(map);
      expect(flag, map.id).not.toBeNull();
      expect(ALL_MAPS[flag!.slice('visited_'.length)], flag!).toBeDefined();
    }
  });

  it('warps[0] of every healing map is its own door and lands outdoors', () => {
    for (const map of NURSE_MAPS) {
      const door = map.warps[0];
      // The tile the warp sits on inside the centre is the doormat.
      expect(map.tiles[door.y][door.x], `${map.id} door tile`).toBe(TileType.DOORMAT);
      const outside = ALL_MAPS[door.targetMap];
      // Walkable landing, in bounds, and the target has no indoor floor at
      // all — it is a town/route, not another room.
      expect(outside.collision[door.targetY][door.targetX], `${map.id} landing`).toBe(false);
      expect(outside.tiles.some(row => row.includes(TileType.INDOOR_FLOOR)), `${door.targetMap} indoors`).toBe(false);
      // And the town has a door back in, so the pair is a real doorway.
      expect(outside.warps.some(w => w.targetMap === map.id), `${door.targetMap} -> ${map.id}`).toBe(true);
    }
  });
});

describe('healVisitFlag unlocks Fly', () => {
  const flagOf = (mapId: string) => healVisitFlag(ALL_MAPS[mapId])!;

  it('healing at a centre makes exactly that town flyable', () => {
    const before = getAvailableFlyDestinations({}).map(d => d.mapId);
    expect(before).toEqual(['pallet_town']);
    const flags: Record<string, boolean> = { [flagOf('pokemon_center_cerulean')]: true };
    expect(getAvailableFlyDestinations(flags).map(d => d.mapId)).toEqual(['pallet_town', 'cerulean_city']);
  });

  it('every Fly destination except PALLET TOWN is unlocked by some centre', () => {
    const unlocked = new Set(NURSE_MAPS.map(m => healVisitFlag(m)!));
    const unreachable = FLY_DESTINATIONS
      .filter(d => !unlocked.has(visitedFlag(d.mapId)))
      .map(d => d.mapId);
    // PALLET TOWN has no Pokemon Center; it is always available instead.
    expect(unreachable).toEqual(['pallet_town']);
    expect(getAvailableFlyDestinations({}).map(d => d.mapId)).toEqual(['pallet_town']);
  });

  it('healing at every centre in turn lights up the whole Fly map', () => {
    const flags: Record<string, boolean> = {};
    for (const map of NURSE_MAPS) flags[healVisitFlag(map)!] = true;
    expect(getAvailableFlyDestinations(flags).map(d => d.mapId)).toEqual(FLY_DESTINATIONS.map(d => d.mapId));
  });

  it('three healing maps write a flag no Fly destination reads (dead but harmless)', () => {
    // Route 3's and Route 10's centres sit on routes, and the Indigo Plateau
    // lobby is a league building, so `visited_route3`, `visited_route10` and
    // `visited_indigo_plateau` are written and never read: none of the three
    // is a Fly stop, and nothing else reads a `visited_` flag except the Silph
    // Co elevator (which writes its own). Pinned as today's behaviour, not
    // endorsed — see the PR.
    const flyFlags = new Set(FLY_DESTINATIONS.map(d => visitedFlag(d.mapId)));
    const dead = NURSE_MAPS.map(m => healVisitFlag(m)!).filter(f => !flyFlags.has(f));
    expect(dead.sort()).toEqual(['visited_indigo_plateau', 'visited_route10', 'visited_route3']);
  });
});
