// Pins the data-driven warp gates to the exact behaviour that lived in
// OverworldScene.warpTo before they were migrated (messages verbatim).
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { checkEntryGates } from '../../src/logic/warpGate';

const st = (o: {
  flags?: Record<string, boolean>; badges?: string[]; defeated?: string[]; bag?: string[];
} = {}) => ({
  storyFlags: o.flags ?? {},
  badges: o.badges ?? [],
  defeatedTrainers: o.defeated ?? [],
  hasItem: (id: string) => (o.bag ?? []).includes(id),
});
const enter = (mapId: string, from: string, s = st()) => checkEntryGates(ALL_MAPS[mapId], from, s);
const blocked = (message: string[]) => ({ ok: false, message });
const OPEN = { ok: true };

describe('map entry gates (migrated from warpTo)', () => {
  it('only the expected maps carry gates', () => {
    const gated = Object.values(ALL_MAPS).filter(m => m.entryGates?.length).map(m => m.id).sort();
    expect(gated).toEqual([
      'cerulean_cave_1f', 'cinnabar_gym', 'elite_four_lorelei', 'pewter_museum_2f', 'pokemon_tower_7f', 'rocket_hideout_b1f',
      'route16', 'route17', 'route2', 'route4', 'saffron_city',
      'silph_co_10f', 'silph_co_11f', 'silph_co_1f', 'silph_co_2f', 'silph_co_3f', 'silph_co_4f', 'silph_co_5f', 'silph_co_6f', 'silph_co_7f', 'silph_co_8f', 'silph_co_9f',
      'ss_anne', 'viridian_gym',
    ]);
  });

  it('Route 2 from Viridian needs the Pokedex', () => {
    expect(enter('route2', 'viridian_city')).toEqual(blocked([
      'An old man is lying\nin the road...',
      "He won't let you\npass!",
      "Go deliver OAK's\nPARCEL first!",
    ]));
    expect(enter('route2', 'viridian_city', st({ flags: { has_pokedex: true } }))).toEqual(OPEN);
    expect(enter('route2', 'viridian_forest')).toEqual(OPEN);
    expect(enter('route2', 'diglett_cave_exit')).toEqual(OPEN);
  });

  it('Mt. Moon exit to Route 4 needs a fossil', () => {
    expect(enter('route4', 'mt_moon')).toEqual(blocked([
      "Boulders block the\npath ahead...",
      "You'll have to find\nanother way through.",
    ]));
    expect(enter('route4', 'mt_moon', st({ flags: { got_fossil: true } }))).toEqual(OPEN);
    expect(enter('route4', 'cerulean_city')).toEqual(OPEN);
  });

  it('Saffron City needs Tea (or the saffron_open flag) from every side', () => {
    const msg = ["The guard is thirsty...", "He won't let you\nthrough!"];
    for (const from of ['route5', 'route6', 'route7', 'route8', 'silph_co_1f']) {
      expect(enter('saffron_city', from), from).toEqual(blocked(msg));
    }
    expect(enter('saffron_city', 'route5', st({ bag: ['tea'] }))).toEqual(OPEN);
    expect(enter('saffron_city', 'route5', st({ flags: { saffron_open: true } }))).toEqual(OPEN);
  });

  it('S.S. Anne: ticket to board, and closed from the dock once departed', () => {
    expect(enter('ss_anne', 'vermilion_city')).toEqual(blocked(["You need an S.S.\nTICKET to board!"]));
    // Ticket check comes first even after departure
    expect(enter('ss_anne', 'vermilion_city', st({ flags: { ss_anne_departed: true } })))
      .toEqual(blocked(["You need an S.S.\nTICKET to board!"]));
    expect(enter('ss_anne', 'vermilion_city', st({ bag: ['ss_ticket'], flags: { ss_anne_departed: true } })))
      .toEqual(blocked(["The S.S. ANNE has\nalready departed..."]));
    expect(enter('ss_anne', 'vermilion_city', st({ bag: ['ss_ticket'] }))).toEqual(OPEN);
    // Moving between decks is never blocked by departure
    for (const from of ['ss_anne_2f', 'ss_anne_b1f']) {
      expect(enter('ss_anne', from, st({ bag: ['ss_ticket'], flags: { ss_anne_departed: true } })), from).toEqual(OPEN);
    }
  });

  it('the only way onto the S.S. Anne from outside the ship is Vermilion City', () => {
    // warpTo used to test `currentMap.id.startsWith('ss_anne')`; the gate's `from`
    // list encodes the same thing, which this invariant keeps true.
    const sources = Object.values(ALL_MAPS)
      .filter(m => m.warps.some(w => w.targetMap === 'ss_anne'))
      .map(m => m.id)
      .filter(id => !id.startsWith('ss_anne'));
    expect(sources).toEqual(['vermilion_city']);
  });

  it('Viridian Gym is locked until Giovanni falls at Silph Co.', () => {
    expect(enter('viridian_gym', 'viridian_city')).toEqual(blocked(["The door is locked...", "The GYM LEADER is\naway."]));
    expect(enter('viridian_gym', 'viridian_city', st({ flags: { giovanni_silph: true } }))).toEqual(OPEN);
  });

  it('Pewter Museum 2F needs a ticket', () => {
    expect(enter('pewter_museum_2f', 'pewter_museum')).toEqual(blocked([
      "You need a ticket\nto go upstairs!",
      "Please see the clerk\nat the front desk.",
    ]));
    expect(enter('pewter_museum_2f', 'pewter_museum', st({ flags: { museum_2f_ticket: true } }))).toEqual(OPEN);
  });

  it('Pokemon Tower 7F: the ghost blocks the 6F stairs without the Silph Scope', () => {
    expect(enter('pokemon_tower_7f', 'pokemon_tower_6f')).toEqual(blocked([
      "A GHOST appeared!",
      "Get out...\nGet out...",
      "The GHOST won't let\nyou pass!",
    ]));
    expect(enter('pokemon_tower_7f', 'pokemon_tower_6f', st({ bag: ['silph_scope'] }))).toEqual(OPEN);
    expect(enter('pokemon_tower_7f', 'lavender_town')).toEqual(blocked([
      "A GHOST appeared!",
      "Get out...\nGet out...",
      "The GHOST won't let\nyou pass!",
    ]));
  });

  it('Rocket Hideout from the Game Corner: silent until the poster, sealed after Giovanni', () => {
    expect(enter('rocket_hideout_b1f', 'game_corner')).toEqual(blocked([]));
    expect(enter('rocket_hideout_b1f', 'game_corner', st({ flags: { game_corner_poster_found: true } }))).toEqual(OPEN);
    expect(enter('rocket_hideout_b1f', 'game_corner', st({ flags: { game_corner_poster_found: true }, defeated: ['giovanni_game_corner'] })))
      .toEqual(blocked(["The hideout has been\nabandoned..."]));
    // Poster check wins even after Giovanni
    expect(enter('rocket_hideout_b1f', 'game_corner', st({ defeated: ['giovanni_game_corner'] }))).toEqual(blocked([]));
    // Coming back up from B2F is never gated
    expect(enter('rocket_hideout_b1f', 'rocket_hideout_b2f', st({ defeated: ['giovanni_game_corner'] }))).toEqual(OPEN);
  });

  it('every Silph Co. floor closes once the building is cleared', () => {
    const msg = ["SILPH CO. has resumed\nnormal operations.", "Thank you for saving\nus!"];
    for (let f = 1; f <= 7; f++) {
      const id = `silph_co_${f}f`;
      expect(enter(id, 'saffron_city'), id).toEqual(OPEN);
      expect(enter(id, 'saffron_city', st({ flags: { silph_co_complete: true } })), id).toEqual(blocked(msg));
      expect(enter(id, 'silph_co_1f', st({ flags: { silph_co_complete: true } })), id).toEqual(blocked(msg));
    }
    const silphFloors = Object.keys(ALL_MAPS).filter(id => id.startsWith('silph_co_'));
    expect(silphFloors.every(id => ALL_MAPS[id].entryGates?.length)).toBe(true);
  });

  it('Cycling Road needs a Bicycle', () => {
    const msg = ["You can't go onto\nCYCLING ROAD without\na BICYCLE!"];
    expect(enter('route16', 'celadon_city')).toEqual(blocked(msg));
    expect(enter('route17', 'route18')).toEqual(blocked(msg));
    expect(enter('route16', 'celadon_city', st({ bag: ['bicycle'] }))).toEqual(OPEN);
    expect(enter('route17', 'route18', st({ bag: ['bicycle'] }))).toEqual(OPEN);
  });

  it('Champion Hall needs all 8 badges', () => {
    const seven = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH', 'VOLCANO'];
    expect(enter('elite_four_lorelei', 'indigo_plateau', st({ badges: seven })))
      .toEqual(blocked(['You need all 8 BADGES\nto enter the', 'POKeMON LEAGUE!']));
    expect(enter('elite_four_lorelei', 'indigo_plateau', st({ badges: [...seven, 'EARTH'] }))).toEqual(OPEN);
  });
});
