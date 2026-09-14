// Pins the two forced one-off wild encounters (messages verbatim, same
// species/level, same flag names and flag timing).
//
// The Marowak pins were written to document the OLD behaviour — the flag went up
// `on_trigger`, the moment the 7F warp was intercepted, so running away still
// consumed the ghost. That is the bug the ghost fix removes: the warp now lands,
// the ambush fires on arrival, and the flag is `on_victory` — written by the
// BattleScene through `clearsForcedEncounter`. The pins below follow.
import { describe, it, expect } from 'vitest';
import {
  snorlaxEncounter, snorlaxWakeMessages, snorlaxClearedFlag,
  marowakAmbush, clearsForcedEncounter,
  SNORLAX_NPC_IDS, SNORLAX_ASLEEP_MESSAGES, SNORLAX_SPECIES_ID, SNORLAX_LEVEL, POKE_FLUTE_ITEM,
  MAROWAK_MAP_ID, MAROWAK_MESSAGES, MAROWAK_SPECIES_ID, MAROWAK_LEVEL, MAROWAK_GHOST_FLAG,
  ForcedEncounter, WildBattleEnd,
} from '../../src/logic/forcedEncounters';
import { shouldSkipNPC } from '../../src/logic/npcVisibility';
import { checkEntryGates } from '../../src/logic/warpGate';
import { ALL_MAPS } from '../../src/data/maps';
import { POKEMON_DATA } from '../../src/data/pokemon';
import { ITEMS } from '../../src/data/items';
import { NPCData } from '../../src/types/map.types';
import { Direction } from '../../src/utils/constants';

const bag = (...items: string[]) => ({
  name: 'RED',
  hasItem: (id: string) => items.includes(id),
});
const flags = (f: Record<string, boolean> = {}) => ({ storyFlags: { ...f } });

const makeNPC = (id: string, overrides: Partial<NPCData> = {}): NPCData =>
  ({ id, x: 0, y: 0, spriteColor: 0xffffff, direction: Direction.DOWN, dialogue: ['Hi'], ...overrides });

const NOTHING: ForcedEncounter = {
  outcome: 'none', messages: [], battle: null, flag: null, flagTiming: null,
};

describe('snorlaxEncounter', () => {
  it('is exhaustive over both Snorlax and both bag states', () => {
    const table: Array<[string, string[], ForcedEncounter]> = [];
    for (const id of SNORLAX_NPC_IDS) {
      for (const items of [[], [POKE_FLUTE_ITEM]]) {
        table.push([id, items, snorlaxEncounter(id, bag(...items))]);
      }
    }
    expect(table).toEqual([
      ['snorlax_route12', [], {
        outcome: 'message',
        messages: [
          'A huge POKeMON is\nblocking the path!',
          "It's sleeping soundly...",
          'Zzz... Zzz...',
          'Maybe a melody could\nwake it up?',
        ],
        battle: null, flag: null, flagTiming: null,
      }],
      ['snorlax_route12', [POKE_FLUTE_ITEM], {
        outcome: 'battle',
        messages: ['RED used the\nPOKe FLUTE!', 'SNORLAX woke up!\nIt looks angry!'],
        battle: { speciesId: 143, level: 30 },
        flag: 'snorlax_route12_cleared',
        flagTiming: 'on_battle_start',
      }],
      ['snorlax_route16', [], {
        outcome: 'message',
        messages: [
          'A huge POKeMON is\nblocking the path!',
          "It's sleeping soundly...",
          'Zzz... Zzz...',
          'Maybe a melody could\nwake it up?',
        ],
        battle: null, flag: null, flagTiming: null,
      }],
      ['snorlax_route16', [POKE_FLUTE_ITEM], {
        outcome: 'battle',
        messages: ['RED used the\nPOKe FLUTE!', 'SNORLAX woke up!\nIt looks angry!'],
        battle: { speciesId: 143, level: 30 },
        flag: 'snorlax_route16_cleared',
        flagTiming: 'on_battle_start',
      }],
    ]);
  });

  it('only the POKe FLUTE wakes it — no other key item does', () => {
    for (const item of ['silph_scope', 'poke_doll', 'bicycle', 'super_rod', 'card_key']) {
      expect(snorlaxEncounter('snorlax_route12', bag(item)).outcome, item).toBe('message');
    }
    expect(snorlaxEncounter('snorlax_route12', bag('bicycle', POKE_FLUTE_ITEM)).outcome).toBe('battle');
  });

  it('puts the player name in the first wake line', () => {
    expect(snorlaxEncounter('snorlax_route12', { name: 'ASH', hasItem: () => true }).messages[0])
      .toBe('ASH used the\nPOKe FLUTE!');
    expect(snorlaxWakeMessages('BLUE')[0]).toBe('BLUE used the\nPOKe FLUTE!');
  });

  it('returns fresh arrays, so a caller cannot corrupt the tables', () => {
    const first = snorlaxEncounter('snorlax_route12', bag()).messages;
    first[0] = 'mutated';
    expect(snorlaxEncounter('snorlax_route12', bag()).messages[0]).toBe(SNORLAX_ASLEEP_MESSAGES[0]);
  });

  it('is total: any id keys its own <id>_cleared flag', () => {
    expect(snorlaxClearedFlag('snorlax_route12')).toBe('snorlax_route12_cleared');
    expect(snorlaxEncounter('snorlax_elsewhere', bag(POKE_FLUTE_ITEM)).flag)
      .toBe('snorlax_elsewhere_cleared');
  });

  it('spawns a real Lv30 SNORLAX', () => {
    expect(POKEMON_DATA[SNORLAX_SPECIES_ID].name).toBe('SNORLAX');
    expect(SNORLAX_SPECIES_ID).toBe(143);
    expect(SNORLAX_LEVEL).toBe(30);
  });

  it('the POKe FLUTE is a real key item (Mr. Fuji hands it over)', () => {
    expect(ITEMS[POKE_FLUTE_ITEM]).toBeDefined();
    expect(ITEMS[POKE_FLUTE_ITEM].name).toBe('POKe FLUTE');
  });
});

describe('snorlax cleared flags vs. npcVisibility', () => {
  it('the flag each Snorlax writes is the one that hides it', () => {
    for (const id of SNORLAX_NPC_IDS) {
      const decision = snorlaxEncounter(id, bag(POKE_FLUTE_ITEM));
      const npc = makeNPC(id);
      expect(shouldSkipNPC(npc, {}, [], [], () => false), `${id} before`).toBe(false);
      expect(shouldSkipNPC(npc, { [decision.flag!]: true }, [], [], () => false), `${id} after`).toBe(true);
    }
  });

  it('one Snorlax clearing does not remove the other', () => {
    expect(shouldSkipNPC(makeNPC('snorlax_route16'), { snorlax_route12_cleared: true }, [], [], () => false))
      .toBe(false);
  });

  it('holding the flute does not hide a Snorlax on its own', () => {
    for (const id of SNORLAX_NPC_IDS) {
      expect(shouldSkipNPC(makeNPC(id), {}, [], [], (i) => i === POKE_FLUTE_ITEM)).toBe(false);
    }
  });
});

describe('snorlax ids vs. map data', () => {
  const snorlaxNpcs = Object.entries(ALL_MAPS)
    .flatMap(([mapId, m]) => m.npcs.filter(n => n.id.startsWith('snorlax_')).map(n => ({ mapId, npc: n })));

  it('the shipped Snorlax are exactly the two ids this module knows', () => {
    expect(snorlaxNpcs.map(s => s.npc.id).sort()).toEqual([...SNORLAX_NPC_IDS].sort());
  });

  it('each stands on the route its id names', () => {
    for (const { mapId, npc } of snorlaxNpcs) {
      expect(npc.id, mapId).toBe(`snorlax_${mapId}`);
    }
  });

  it('the asleep script is the NPC dialogue plus the melody hint', () => {
    for (const { npc } of snorlaxNpcs) {
      expect(SNORLAX_ASLEEP_MESSAGES.slice(0, npc.dialogue.length)).toEqual(npc.dialogue);
    }
    expect(SNORLAX_ASLEEP_MESSAGES[SNORLAX_ASLEEP_MESSAGES.length - 1])
      .toBe('Maybe a melody could\nwake it up?');
  });
});

describe('marowakAmbush', () => {
  it('fires exactly once, on Pokemon Tower 7F', () => {
    const first = marowakAmbush(MAROWAK_MAP_ID, flags());
    expect(first).toEqual({
      outcome: 'battle',
      messages: [
        "The SILPH SCOPE\nreveals the GHOST's\ntrue identity!",
        "It's the restless\nspirit of MAROWAK!",
      ],
      battle: { speciesId: 105, level: 30 },
      flag: 'marowak_ghost_defeated',
      flagTiming: 'on_victory',
    });
    // Once the battle has written the flag, every later arrival is silent.
    const storyFlags: Record<string, boolean> = {};
    storyFlags[first.flag!] = true;
    expect(marowakAmbush(MAROWAK_MAP_ID, { storyFlags })).toEqual(NOTHING);
  });

  it('is the only map in the game that ambushes', () => {
    const ambushed = Object.keys(ALL_MAPS).filter(id => marowakAmbush(id, flags()).outcome !== 'none');
    expect(ambushed).toEqual([MAROWAK_MAP_ID]);
    expect(ALL_MAPS[MAROWAK_MAP_ID]).toBeDefined();
  });

  it('ignores unrelated flags and unknown maps', () => {
    expect(marowakAmbush(MAROWAK_MAP_ID, flags({ tower_rockets_cleared: true, got_silph_scope: true })).outcome)
      .toBe('battle');
    expect(marowakAmbush('pokemon_tower_6f', flags())).toEqual(NOTHING);
    expect(marowakAmbush('', flags())).toEqual(NOTHING);
    expect(marowakAmbush(MAROWAK_MAP_ID, flags({ [MAROWAK_GHOST_FLAG]: false })).outcome).toBe('battle');
  });

  it('spawns a real Lv30 MAROWAK, not the Gastly-line ghost', () => {
    expect(POKEMON_DATA[MAROWAK_SPECIES_ID].name).toBe('MAROWAK');
    expect(MAROWAK_SPECIES_ID).toBe(105);
    expect(MAROWAK_LEVEL).toBe(30);
    expect(MAROWAK_MESSAGES).toHaveLength(2);
  });

  it('nothing hides an NPC on the flag — the ghost is an arrival trigger, not an NPC', () => {
    expect(ALL_MAPS[MAROWAK_MAP_ID].npcs.some(n => n.id.includes('marowak'))).toBe(false);
    expect(shouldSkipNPC(makeNPC('mr_fuji'), { [MAROWAK_GHOST_FLAG]: true, tower_rockets_cleared: true }, [], [], () => false))
      .toBe(false);
  });
});

describe('marowakAmbush vs. the 7F entry gate', () => {
  const state = (bagItems: string[]) => ({
    storyFlags: {} as Record<string, boolean>,
    badges: [] as string[],
    defeatedTrainers: [] as string[],
    hasItem: (id: string) => bagItems.includes(id),
  });

  it('the ambush is only reachable with the SILPH SCOPE, because the gate runs first', () => {
    expect(checkEntryGates(ALL_MAPS[MAROWAK_MAP_ID], 'pokemon_tower_6f', state([]))).toEqual({
      ok: false,
      message: [
        'A GHOST appeared!',
        'Get out...\nGet out...',
        "The GHOST won't let\nyou pass!",
      ],
    });
    expect(checkEntryGates(ALL_MAPS[MAROWAK_MAP_ID], 'pokemon_tower_6f', state(['silph_scope'])).ok).toBe(true);
  });
});

describe('flag timing differs between the two encounters', () => {
  it('Snorlax writes with the battle, Marowak only on victory', () => {
    // Snorlax keeps its at-launch semantics (Gen I: it vanishes even if you run).
    for (const id of SNORLAX_NPC_IDS) {
      expect(snorlaxEncounter(id, bag(POKE_FLUTE_ITEM)).flagTiming).toBe('on_battle_start');
    }
    expect(marowakAmbush(MAROWAK_MAP_ID, flags()).flagTiming).toBe('on_victory');
  });

  it('both are real battles that write a flag', () => {
    for (const d of [snorlaxEncounter('snorlax_route16', bag(POKE_FLUTE_ITEM)), marowakAmbush(MAROWAK_MAP_ID, flags())]) {
      expect(d.outcome).toBe('battle');
      expect(d.flag).toBeTruthy();
      expect(d.battle).not.toBeNull();
    }
  });

  it('only Marowak needs the win: no other encounter is on_victory', () => {
    const timings = [
      ...SNORLAX_NPC_IDS.map(id => snorlaxEncounter(id, bag(POKE_FLUTE_ITEM)).flagTiming),
      marowakAmbush(MAROWAK_MAP_ID, flags()).flagTiming,
    ];
    expect(timings.filter(t => t === 'on_victory')).toHaveLength(1);
  });
});

describe('clearsForcedEncounter (what the BattleScene asks before writing clearedFlag)', () => {
  it('is exhaustive over the four wild endings', () => {
    const ends: WildBattleEnd[] = ['opponent_fainted', 'caught', 'ran', 'player_fainted'];
    expect(ends.map(e => [e, clearsForcedEncounter(e)])).toEqual([
      ['opponent_fainted', true],
      ['caught', true],
      ['ran', false],
      ['player_fainted', false],
    ]);
  });

  it('running from the ghost leaves its flag down, so the next arrival fires again', () => {
    const ghost = marowakAmbush(MAROWAK_MAP_ID, flags());
    const storyFlags: Record<string, boolean> = {};
    // What BattleScene.finishForcedEncounter() does, for each ending in turn.
    const apply = (end: WildBattleEnd) => {
      if (clearsForcedEncounter(end)) storyFlags[ghost.flag!] = true;
    };
    apply('ran');
    expect(storyFlags[MAROWAK_GHOST_FLAG]).toBeUndefined();
    expect(marowakAmbush(MAROWAK_MAP_ID, { storyFlags }).outcome).toBe('battle');
    apply('player_fainted');
    expect(marowakAmbush(MAROWAK_MAP_ID, { storyFlags }).outcome).toBe('battle');
    apply('opponent_fainted');
    expect(storyFlags[MAROWAK_GHOST_FLAG]).toBe(true);
    expect(marowakAmbush(MAROWAK_MAP_ID, { storyFlags })).toEqual(NOTHING);
  });

  it('a catch clears it too — the ghost joins the party instead of resting', () => {
    const storyFlags: Record<string, boolean> = {};
    if (clearsForcedEncounter('caught')) storyFlags[MAROWAK_GHOST_FLAG] = true;
    expect(marowakAmbush(MAROWAK_MAP_ID, { storyFlags })).toEqual(NOTHING);
  });
});
