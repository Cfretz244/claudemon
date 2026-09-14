// The static-legendary registry is the single source of truth for the four
// "talk to it, fight it once" encounters. Four things have to agree for one to
// work: an NPC with that id exists on exactly one map, it is not a trainer (a
// trainer id would be swallowed by the trainer-battle branch before the
// handler runs), the species has an overworld-sized sprite to draw, and
// createPokemon() can actually build it at that level with moves.
import { describe, it, expect } from 'vitest';
import { STATIC_LEGENDARIES, getStaticLegendary, legendaryClearedFlag } from '../../src/data/staticLegendaries';
import { ALL_MAPS } from '../../src/data/maps';
import { POKEMON_DATA } from '../../src/data/pokemon';
import { CUSTOM_POKEMON_SPRITES } from '../../src/sprites';
import { effectiveMovesAt } from '../../src/logic/learnset';
import { NPCData } from '../../src/types/map.types';

const entries = Object.entries(STATIC_LEGENDARIES);

const placements = new Map<string, { mapId: string; npc: NPCData }[]>();
for (const [mapId, map] of Object.entries(ALL_MAPS)) {
  for (const npc of map.npcs) {
    if (!getStaticLegendary(npc.id)) continue;
    const list = placements.get(npc.id) ?? [];
    list.push({ mapId, npc });
    placements.set(npc.id, list);
  }
}

describe('STATIC_LEGENDARIES', () => {
  it('holds the three birds at Lv50 and Mewtwo at Lv70, tall', () => {
    expect(STATIC_LEGENDARIES).toEqual({
      articuno_seafoam: { speciesId: 144, level: 50 },
      zapdos_power_plant: { speciesId: 145, level: 50 },
      moltres_victory_road: { speciesId: 146, level: 50 },
      mewtwo: { speciesId: 150, level: 70, footprint: 'tall' },
    });
  });

  it('Mewtwo is the Lv70 encounter on Cerulean Cave B1F', () => {
    expect(getStaticLegendary('mewtwo')).toEqual({ speciesId: 150, level: 70, footprint: 'tall' });
    expect(POKEMON_DATA[150].name).toBe('MEWTWO');
    const spots = placements.get('mewtwo')!;
    expect(spots.map(s => s.mapId)).toEqual(['cerulean_cave_b1f']);
  });

  it.each(entries)('%s stands on exactly one map and is not a trainer', (id) => {
    const spots = placements.get(id) ?? [];
    expect(spots, `${id} is not placed on any map`).toHaveLength(1);
    expect(spots[0].npc.isTrainer, `${id} is a trainer`).toBeFalsy();
    expect(spots[0].npc.isItemBall, `${id} is an item ball`).toBeFalsy();
    expect(spots[0].npc.shopStock, `${id} has shop stock`).toBeUndefined();
    expect(spots[0].npc.dialogue.length, `${id} has no dialogue`).toBeGreaterThan(0);
  });

  it.each(entries)('%s names a real species with a sprite and moves at its level', (id, { speciesId, level }) => {
    expect(POKEMON_DATA[speciesId], `no species ${speciesId}`).toBeDefined();
    expect(POKEMON_DATA[speciesId].id).toBe(speciesId);
    expect(typeof CUSTOM_POKEMON_SPRITES[speciesId], `no sprite for ${speciesId}`).toBe('function');
    expect(level).toBeGreaterThan(0);
    expect(level).toBeLessThanOrEqual(100);
    expect(effectiveMovesAt(speciesId, level).length, `${id} knows no moves`).toBeGreaterThan(0);
  });

  // `footprint: 'tall'` extends the NPC's collision to (x, y-1) and (x, y+1)
  // (OverworldScene.npcBlocksTile), which is two tiles of map the player can no
  // longer walk on. If either of them carried a ladder or an item ball, or was
  // the only way through, the legendary would wall off part of its floor.
  it('a tall legendary only eats free map, and can still be talked to', () => {
    const tall = entries.filter(([, l]) => l.footprint === 'tall');
    expect(tall.map(([id]) => id)).toEqual(['mewtwo']);
    for (const [id] of tall) {
      const { mapId, npc } = placements.get(id)![0];
      const map = ALL_MAPS[mapId];
      const foot = [{ x: npc.x, y: npc.y - 1 }, { x: npc.x, y: npc.y }, { x: npc.x, y: npc.y + 1 }];
      for (const t of foot) {
        expect(map.warps.some(w => w.x === t.x && w.y === t.y), `${id}: warp under ${t.x},${t.y}`).toBe(false);
        expect(map.npcs.some(n => n.id !== id && n.x === t.x && n.y === t.y), `${id}: NPC under ${t.x},${t.y}`).toBe(false);
      }
      // Something walkable has to be left beside the footprint, or the
      // encounter is unreachable: nowhere to stand and press Z.
      const sides = foot.flatMap(t => [{ x: t.x, y: t.y - 1 }, { x: t.x, y: t.y + 1 }, { x: t.x - 1, y: t.y }, { x: t.x + 1, y: t.y }])
        .filter(p => p.x >= 0 && p.y >= 0 && p.x < map.width && p.y < map.height)
        .filter(p => !foot.some(t => t.x === p.x && t.y === p.y))
        .filter(p => !map.collision[p.y][p.x]);
      expect(sides.length, `${id}: no tile to talk to it from`).toBeGreaterThan(0);
    }
  });

  it('legendaryClearedFlag matches the flags the save editor and visibility use', () => {
    expect(legendaryClearedFlag('mewtwo')).toBe('mewtwo_cleared');
    for (const [id] of entries) expect(legendaryClearedFlag(id)).toBe(`${id}_cleared`);
  });

  it('lookup is safe against Object.prototype keys', () => {
    for (const id of ['constructor', 'toString', 'hasOwnProperty', '__proto__']) {
      expect(getStaticLegendary(id), id).toBeUndefined();
    }
  });
});
