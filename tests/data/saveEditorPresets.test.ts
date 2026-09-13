// The save editor's presets and flag chips, checked against the real map,
// item and gate data. A preset is a starting point a tester trusts, so it
// must spawn somewhere walkable and its flags and bag must agree with what
// the game actually gates on (items, not "got_X" flags).
import { describe, it, expect } from 'vitest';
import { PRESETS, STORY_FLAG_GROUPS } from '../../src/data/saveEditorPresets';
import { SaveSystem, SaveData } from '../../src/systems/SaveSystem';
import { ALL_MAPS } from '../../src/data/maps';
import { ITEMS } from '../../src/data/items';

const KNOWN_FLAGS = new Set(STORY_FLAG_GROUPS.flatMap(g => g.flags.map(f => f.id)));
/** A flag that says "got X" only means it if X is in the bag. */
const FLAG_IMPLIES_ITEM: Record<string, string[]> = {
  got_hm01: ['hm01_cut'], got_hm02: ['hm02_fly'], got_hm03: ['hm03_surf'], got_hm04: ['hm04_strength'], got_hm05: ['hm05_flash'],
  got_silph_scope: ['silph_scope', 'lift_key'],   // the Lift Key is what got you to Giovanni
  got_poke_flute: ['poke_flute'],
  // got_master_ball is not listed: the ball is consumable, a preset may have used it
  silph_co_complete: ['card_key'],
  got_tm28: ['tm28_dig'],
  got_bicycle: ['bicycle'],
  got_old_rod: ['old_rod'], got_good_rod: ['good_rod'], got_super_rod: ['super_rod'],
};
const GYM_FLAG: Record<string, string> = {
  BOULDER: 'brock_cleared', CASCADE: 'misty_cleared', THUNDER: 'lt_surge_cleared', RAINBOW: 'erika_cleared',
  SOUL: 'koga_cleared', MARSH: 'sabrina_cleared', VOLCANO: 'blaine_cleared', EARTH: 'giovanni_cleared',
};

const applied = PRESETS.map(p => { const s: SaveData = SaveSystem.createNewSave('TEST', 'RIVAL'); p.apply(s); return [p.name, s] as const; });

describe('save editor presets', () => {
  it.each(applied)('%s spawns on a walkable tile that is not a warp or an NPC', (_name, s) => {
    const map = ALL_MAPS[s.currentMap];
    expect(map, s.currentMap).toBeDefined();
    expect(map.collision[s.playerY]?.[s.playerX], `${s.currentMap} ${s.playerX},${s.playerY} solid`).toBe(false);
    expect(map.warps.some(w => w.x === s.playerX && w.y === s.playerY), 'on a warp').toBe(false);
    expect(map.npcs.some(n => n.x === s.playerX && n.y === s.playerY), 'on an NPC').toBe(false);
    const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => map.collision[s.playerY + dy]?.[s.playerX + dx] === false);
    expect(open.length, 'can step somewhere').toBeGreaterThan(0);
  });

  it.each(applied)('%s: every flag has a chip in the editor, and every bag item exists', (_name, s) => {
    for (const f of Object.keys(s.storyFlags).filter(f => s.storyFlags[f])) expect(KNOWN_FLAGS.has(f), `flag ${f} has no chip`).toBe(true);
    for (const id of Object.keys(s.bag)) expect(ITEMS[id], `item ${id}`).toBeDefined();
  });

  it.each(applied)('%s: "got X" flags come with the item, badges with the gym flag', (_name, s) => {
    for (const [flag, items] of Object.entries(FLAG_IMPLIES_ITEM)) {
      if (!s.storyFlags[flag]) continue;
      for (const item of items) expect(s.bag[item] ?? 0, `${flag} without ${item}`).toBeGreaterThan(0);
    }
    for (const badge of s.badges) expect(s.storyFlags[GYM_FLAG[badge]], `${badge} badge without ${GYM_FLAG[badge]}`).toBe(true);
    for (const [badge, flag] of Object.entries(GYM_FLAG)) if (s.storyFlags[flag]) expect(s.badges, `${flag} without the ${badge} badge`).toContain(badge);
  });

  it('the presets past Sabrina can enter Cinnabar Gym (it is locked on the SECRET KEY); Maxed Out is champion (Cerulean Cave)', () => {
    for (const [name, s] of applied) {
      if (s.badges.includes('MARSH')) expect(s.bag.secret_key ?? 0, `${name}: no secret_key`).toBeGreaterThan(0);
    }
    const maxed = applied.find(([n]) => n === 'Maxed Out')![1];
    expect(maxed.storyFlags.champion).toBe(true);
    const cave = ALL_MAPS.cerulean_city.warps.find(w => w.targetMap.startsWith('cerulean_cave'));
    expect(cave).toBeDefined();
  });

  it('the chips name flags the game reads, and none twice', () => {
    const ids = STORY_FLAG_GROUPS.flatMap(g => g.flags.map(f => f.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const must of ['champion', 'got_silph_scope', 'got_poke_flute', 'marowak_ghost_defeated', 'articuno_seafoam_cleared', 'zapdos_power_plant_cleared', 'moltres_victory_road_cleared', 'surge_gate_open', 'game_corner_poster_found']) {
      expect(KNOWN_FLAGS.has(must), must).toBe(true);
    }
  });
});
