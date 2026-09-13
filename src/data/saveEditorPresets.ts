// Save-editor data: the story-flag chips and the presets. DOM-free so tests
// can apply every preset and check it against the real map and item data
// (tests/data/saveEditorPresets.test.ts). The editor UI lives in
// src/saveEditor.ts.
//
// A preset's flags and bag must agree: the game gates on ITEMS (Silph Scope
// at the Tower ghost, Poke Flute for Snorlax, Secret Key at Cinnabar Gym,
// Lift Key / Card Key in the Rocket bases), and a "got_X" flag without the
// item is a soft lock, because the load-time sync (logic/storyFlagSync.ts)
// treats the flag as "already granted".
import { SaveSystem, SaveData } from '../systems/SaveSystem';
import { ITEMS } from './items';
import { createPokemon } from '../entities/Pokemon';

// ── Story flag groups ──────────────────────────────────────────────────────────

export const STORY_FLAG_GROUPS: { title: string; flags: { id: string; label: string }[] }[] = [
  {
    title: 'Early Game',
    flags: [
      { id: 'intro_complete', label: 'Intro complete' },
      { id: 'has_pikachu', label: 'Has Pikachu' },
      { id: 'has_pokedex', label: 'Has Pokedex' },
      { id: 'rival_battle_lab', label: 'Rival battle (Lab)' },
      { id: 'delivered_parcel', label: 'Delivered parcel' },
    ],
  },
  {
    title: 'HMs',
    flags: [
      { id: 'got_hm01', label: 'HM01 Cut' },
      { id: 'got_hm02', label: 'HM02 Fly' },
      { id: 'got_hm03', label: 'HM03 Surf' },
      { id: 'got_hm04', label: 'HM04 Strength' },
      { id: 'got_hm05', label: 'HM05 Flash' },
    ],
  },
  {
    title: 'Key Events',
    flags: [
      { id: 'bill_helped', label: 'Helped Bill' },
      { id: 'got_fossil', label: 'Got fossil' },
      { id: 'ss_anne_departed', label: 'SS Anne departed' },
      { id: 'got_silph_scope', label: 'Got Silph Scope' },
      { id: 'tower_rockets_cleared', label: 'Tower Rockets cleared' },
      { id: 'got_poke_flute', label: 'Got Poke Flute' },
      { id: 'saffron_open', label: 'Saffron open' },
      { id: 'silph_co_complete', label: 'Silph Co. complete' },
      { id: 'giovanni_silph', label: 'Giovanni defeated (Silph)' },
      { id: 'got_master_ball', label: 'Got Master Ball' },
      { id: 'got_tm28', label: 'Got TM28 (Dig)' },
      { id: 'museum_2f_ticket', label: 'Museum 2F ticket' },
      { id: 'surge_gate_open', label: 'Vermilion Gym gate open' },
      { id: 'got_bike_voucher', label: 'Got Bike Voucher' },
      { id: 'got_bicycle', label: 'Got Bicycle' },
      { id: 'game_corner_poster_found', label: 'Game Corner poster found' },
      { id: 'marowak_ghost_defeated', label: 'Marowak ghost defeated' },
    ],
  },
  {
    title: 'Gift Pokemon',
    flags: [
      { id: 'got_bulbasaur', label: 'Got Bulbasaur (Cerulean)' },
      { id: 'got_charmander', label: 'Got Charmander (Route 25)' },
      { id: 'got_squirtle', label: 'Got Squirtle (Vermilion)' },
      { id: 'got_lapras', label: 'Got Lapras (Silph Co.)' },
    ],
  },
  {
    title: 'Fishing Rods',
    flags: [
      { id: 'got_old_rod', label: 'Old Rod' },
      { id: 'got_good_rod', label: 'Good Rod' },
      { id: 'got_super_rod', label: 'Super Rod' },
    ],
  },
  {
    title: 'Snorlax',
    flags: [
      { id: 'snorlax_route12_cleared', label: 'Route 12 Snorlax' },
      { id: 'snorlax_route16_cleared', label: 'Route 16 Snorlax' },
    ],
  },
  {
    title: 'Gym Leaders Defeated',
    flags: [
      { id: 'brock_cleared', label: 'Brock' },
      { id: 'misty_cleared', label: 'Misty' },
      { id: 'lt_surge_cleared', label: 'Lt. Surge' },
      { id: 'erika_cleared', label: 'Erika' },
      { id: 'koga_cleared', label: 'Koga' },
      { id: 'sabrina_cleared', label: 'Sabrina' },
      { id: 'blaine_cleared', label: 'Blaine' },
      { id: 'giovanni_cleared', label: 'Giovanni' },
    ],
  },
  {
    title: 'Legendaries / Post-game',
    flags: [
      { id: 'articuno_seafoam_cleared', label: 'Articuno (Seafoam)' },
      { id: 'zapdos_power_plant_cleared', label: 'Zapdos (Power Plant)' },
      { id: 'moltres_victory_road_cleared', label: 'Moltres (Victory Road)' },
      { id: 'champion', label: 'Champion (Hall of Fame; opens Cerulean Cave)' },
    ],
  },
];


// ── Presets ─────────────────────────────────────────────────────────────────────

export interface Preset {
  name: string;
  description: string;
  apply: (save: SaveData) => void;
}

export const PRESETS: Preset[] = [
  {
    name: 'Fresh Start',
    description: 'New game with Pikachu',
    apply: (save) => {
      const fresh = SaveSystem.createNewSave(save.playerName, save.rivalName);
      fresh.storyFlags['intro_complete'] = true;
      fresh.storyFlags['has_pikachu'] = true;
      fresh.storyFlags['has_pokedex'] = true;
      fresh.storyFlags['rival_battle_lab'] = true;
      fresh.storyFlags['delivered_parcel'] = true;
      fresh.party = [createPokemon(25, 5, save.playerName)]; // Pikachu
      fresh.currentMap = 'pallet_town';
      fresh.playerX = 4;
      fresh.playerY = 7; // in front of the player's house door
      Object.assign(save, fresh);
    },
  },
  {
    name: 'Pre-Brock',
    description: 'Ready for Pewter Gym',
    apply: (save) => {
      save.currentMap = 'pewter_city';
      save.playerX = 10;
      save.playerY = 10;
      save.storyFlags = { intro_complete: true, has_pikachu: true, has_pokedex: true, rival_battle_lab: true, delivered_parcel: true };
      const pika = createPokemon(25, 12, save.playerName);
      // Ensure Thunder Shock (84) stays — it gets pushed out by later moves
      if (!pika.moves.some(m => m.moveId === 84 || m.moveId === 85 || m.moveId === 87)) {
        const twIdx = pika.moves.findIndex(m => m.moveId === 39); // replace Tail Whip
        if (twIdx >= 0) pika.moves[twIdx] = { moveId: 84, currentPp: 30, maxPp: 30 };
      }
      save.party = [pika];
      save.badges = [];
      save.money = 3000;
      save.bag = { poke_ball: 10, potion: 5 };
    },
  },
  {
    name: 'Pre-Misty',
    description: 'Ready for Cerulean Gym',
    apply: (save) => {
      save.currentMap = 'cerulean_city';
      save.playerX = 10;
      save.playerY = 10;
      save.storyFlags = { intro_complete: true, has_pikachu: true, has_pokedex: true, rival_battle_lab: true, delivered_parcel: true, brock_cleared: true, bill_helped: true };
      const pika = createPokemon(25, 20, save.playerName);
      // Ensure an offensive electric move — Thunder Shock (84) gets pushed out by L20
      if (!pika.moves.some(m => m.moveId === 84 || m.moveId === 85 || m.moveId === 87)) {
        const dtIdx = pika.moves.findIndex(m => m.moveId === 104); // replace Double Team
        if (dtIdx >= 0) pika.moves[dtIdx] = { moveId: 84, currentPp: 30, maxPp: 30 };
      }
      save.party = [pika, createPokemon(1, 18, save.playerName)];
      save.badges = ['BOULDER'];
      save.money = 5000;
      save.bag = { poke_ball: 15, potion: 5, super_potion: 3 };
    },
  },
  {
    name: 'Pre-Surge',
    description: 'Ready for Vermilion Gym',
    apply: (save) => {
      save.currentMap = 'vermilion_city';
      save.playerX = 10;
      save.playerY = 10;
      save.storyFlags = { intro_complete: true, has_pikachu: true, has_pokedex: true, rival_battle_lab: true, delivered_parcel: true, brock_cleared: true, misty_cleared: true, bill_helped: true, got_hm01: true, ss_anne_departed: true };
      const pika = createPokemon(25, 25, save.playerName);
      // Replace Quick Attack (98) with Thunderbolt (85)
      const qaIdx = pika.moves.findIndex(m => m.moveId === 98);
      if (qaIdx >= 0) pika.moves[qaIdx] = { moveId: 85, currentPp: 15, maxPp: 15 };
      save.party = [pika, createPokemon(1, 22, save.playerName), createPokemon(7, 22, save.playerName)];
      save.badges = ['BOULDER', 'CASCADE'];
      save.money = 8000;
      save.storyFlags['got_old_rod'] = true;
      save.bag = { poke_ball: 15, great_ball: 5, super_potion: 5, hm01_cut: 1, ss_ticket: 1, bicycle: 1, old_rod: 1 };
    },
  },
  {
    name: 'Pre-Erika',
    description: 'Ready for Celadon Gym',
    apply: (save) => {
      save.currentMap = 'celadon_city';
      save.playerX = 10;
      save.playerY = 10;
      save.storyFlags = {
        intro_complete: true, has_pikachu: true, has_pokedex: true, rival_battle_lab: true,
        delivered_parcel: true, brock_cleared: true, misty_cleared: true, lt_surge_cleared: true,
        bill_helped: true, got_hm01: true, got_hm05: true, ss_anne_departed: true, got_fossil: true,
        got_bike_voucher: true, got_bicycle: true,
      };
      save.party = [
        createPokemon(25, 30, save.playerName),
        createPokemon(5, 28, save.playerName),  // Charmeleon
        createPokemon(8, 28, save.playerName),  // Wartortle
        createPokemon(33, 27, save.playerName), // Nidorino
      ];
      save.badges = ['BOULDER', 'CASCADE', 'THUNDER'];
      save.money = 10000;
      save.storyFlags['got_old_rod'] = true;
      save.bag = { great_ball: 15, super_potion: 10, revive: 3, hm01_cut: 1, hm05_flash: 1, escape_rope: 5, bicycle: 1, old_rod: 1 };
    },
  },
  {
    name: 'Pre-Koga',
    description: 'Ready for Fuchsia Gym',
    apply: (save) => {
      save.currentMap = 'fuchsia_city';
      save.playerX = 10;
      save.playerY = 10;
      save.storyFlags = {
        intro_complete: true, has_pikachu: true, has_pokedex: true, rival_battle_lab: true,
        delivered_parcel: true, brock_cleared: true, misty_cleared: true, lt_surge_cleared: true,
        erika_cleared: true, bill_helped: true, got_hm01: true, got_hm02: true, got_hm05: true,
        ss_anne_departed: true, got_fossil: true, got_silph_scope: true,
        tower_rockets_cleared: true, marowak_ghost_defeated: true, got_poke_flute: true,
        got_bike_voucher: true, got_bicycle: true, game_corner_poster_found: true,
        got_old_rod: true, got_good_rod: true,
      };
      save.defeatedTrainers = ['giovanni_game_corner'];
      save.party = [
        createPokemon(25, 36, save.playerName),
        createPokemon(6, 34, save.playerName),  // Charizard
        createPokemon(31, 32, save.playerName),  // Nidoqueen
        createPokemon(59, 33, save.playerName),  // Arcanine
      ];
      save.badges = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW'];
      save.money = 18000;
      save.bag = { great_ball: 20, ultra_ball: 5, super_potion: 10, hyper_potion: 5, revive: 3, hm01_cut: 1, hm02_fly: 1, hm05_flash: 1, escape_rope: 5, bicycle: 1, old_rod: 1, good_rod: 1, lift_key: 1, silph_scope: 1, poke_flute: 1 };
    },
  },
  {
    name: 'Pre-Sabrina',
    description: 'Ready for Saffron Gym',
    apply: (save) => {
      save.currentMap = 'saffron_city';
      save.playerX = 10;
      save.playerY = 10;
      save.storyFlags = {
        intro_complete: true, has_pikachu: true, has_pokedex: true, rival_battle_lab: true,
        delivered_parcel: true, brock_cleared: true, misty_cleared: true, lt_surge_cleared: true,
        erika_cleared: true, koga_cleared: true, bill_helped: true,
        got_hm01: true, got_hm02: true, got_hm03: true, got_hm04: true, got_hm05: true,
        ss_anne_departed: true, got_fossil: true, got_silph_scope: true,
        tower_rockets_cleared: true, marowak_ghost_defeated: true, got_poke_flute: true,
        got_bike_voucher: true, got_bicycle: true, game_corner_poster_found: true,
        saffron_open: true, silph_co_complete: true, giovanni_silph: true, got_master_ball: true, got_lapras: true,
        got_old_rod: true, got_good_rod: true, got_super_rod: true,
      };
      save.party = [
        createPokemon(25, 40, save.playerName),
        createPokemon(6, 38, save.playerName),   // Charizard
        createPokemon(131, 36, save.playerName),  // Lapras
        createPokemon(31, 37, save.playerName),   // Nidoqueen
        createPokemon(59, 37, save.playerName),   // Arcanine
      ];
      save.defeatedTrainers = ['giovanni_game_corner', 'giovanni_silph'];
      save.badges = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL'];
      save.money = 25000;
      save.bag = { great_ball: 15, ultra_ball: 10, hyper_potion: 10, revive: 5, master_ball: 1, lift_key: 1, silph_scope: 1, poke_flute: 1, card_key: 1, hm01_cut: 1, hm02_fly: 1, hm03_surf: 1, hm04_strength: 1, hm05_flash: 1, escape_rope: 5, bicycle: 1, old_rod: 1, good_rod: 1, super_rod: 1 };
    },
  },
  {
    name: 'Pre-Blaine',
    description: 'Ready for Cinnabar Gym',
    apply: (save) => {
      save.currentMap = 'cinnabar_island';
      save.playerX = 10;
      save.playerY = 10;
      save.storyFlags = {
        intro_complete: true, has_pikachu: true, has_pokedex: true, rival_battle_lab: true,
        delivered_parcel: true, brock_cleared: true, misty_cleared: true, lt_surge_cleared: true,
        erika_cleared: true, koga_cleared: true, sabrina_cleared: true, bill_helped: true,
        got_hm01: true, got_hm02: true, got_hm03: true, got_hm04: true, got_hm05: true,
        ss_anne_departed: true, got_fossil: true, got_silph_scope: true,
        tower_rockets_cleared: true, marowak_ghost_defeated: true, got_poke_flute: true,
        got_bike_voucher: true, got_bicycle: true, game_corner_poster_found: true,
        saffron_open: true, silph_co_complete: true, giovanni_silph: true, got_master_ball: true, got_lapras: true,
        snorlax_route12_cleared: true, snorlax_route16_cleared: true,
        got_old_rod: true, got_good_rod: true, got_super_rod: true,
      };
      save.party = [
        createPokemon(25, 45, save.playerName),
        createPokemon(6, 43, save.playerName),   // Charizard
        createPokemon(131, 41, save.playerName),  // Lapras
        createPokemon(65, 42, save.playerName),   // Alakazam
        createPokemon(31, 41, save.playerName),   // Nidoqueen
        createPokemon(59, 42, save.playerName),   // Arcanine
      ];
      save.defeatedTrainers = ['giovanni_game_corner', 'giovanni_silph'];
      save.badges = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH'];
      save.money = 35000;
      save.bag = { ultra_ball: 20, hyper_potion: 10, max_potion: 5, full_restore: 3, revive: 5, lift_key: 1, silph_scope: 1, poke_flute: 1, card_key: 1, secret_key: 1, hm01_cut: 1, hm02_fly: 1, hm03_surf: 1, hm04_strength: 1, hm05_flash: 1, escape_rope: 5, bicycle: 1, old_rod: 1, good_rod: 1, super_rod: 1 };
    },
  },
  {
    name: 'Pre-Giovanni',
    description: 'Ready for Viridian Gym',
    apply: (save) => {
      save.currentMap = 'viridian_city';
      save.playerX = 10;
      save.playerY = 10;
      save.storyFlags = {
        intro_complete: true, has_pikachu: true, has_pokedex: true, rival_battle_lab: true,
        delivered_parcel: true, brock_cleared: true, misty_cleared: true, lt_surge_cleared: true,
        erika_cleared: true, koga_cleared: true, sabrina_cleared: true, blaine_cleared: true,
        bill_helped: true,
        got_hm01: true, got_hm02: true, got_hm03: true, got_hm04: true, got_hm05: true,
        ss_anne_departed: true, got_fossil: true, got_silph_scope: true,
        tower_rockets_cleared: true, marowak_ghost_defeated: true, got_poke_flute: true,
        got_bike_voucher: true, got_bicycle: true, game_corner_poster_found: true,
        saffron_open: true, silph_co_complete: true, giovanni_silph: true, got_master_ball: true, got_lapras: true,
        snorlax_route12_cleared: true, snorlax_route16_cleared: true,
        got_old_rod: true, got_good_rod: true, got_super_rod: true,
      };
      save.party = [
        createPokemon(25, 50, save.playerName),
        createPokemon(6, 48, save.playerName),   // Charizard
        createPokemon(131, 46, save.playerName),  // Lapras
        createPokemon(65, 47, save.playerName),   // Alakazam
        createPokemon(31, 46, save.playerName),   // Nidoqueen
        createPokemon(59, 47, save.playerName),   // Arcanine
      ];
      save.defeatedTrainers = ['giovanni_game_corner', 'giovanni_silph'];
      save.badges = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH', 'VOLCANO'];
      save.money = 40000;
      save.bag = { ultra_ball: 25, max_potion: 15, full_restore: 5, revive: 10, lift_key: 1, silph_scope: 1, poke_flute: 1, card_key: 1, secret_key: 1, hm01_cut: 1, hm02_fly: 1, hm03_surf: 1, hm04_strength: 1, hm05_flash: 1, bicycle: 1, old_rod: 1, good_rod: 1, super_rod: 1 };
    },
  },
  {
    name: 'Pre-E4',
    description: '8 badges, Victory Road',
    apply: (save) => {
      save.currentMap = 'indigo_plateau';
      save.playerX = 4;
      save.playerY = 9; // in front of the League door
      save.storyFlags = {
        intro_complete: true, has_pikachu: true, has_pokedex: true, rival_battle_lab: true,
        delivered_parcel: true, brock_cleared: true, misty_cleared: true, lt_surge_cleared: true,
        erika_cleared: true, koga_cleared: true, sabrina_cleared: true, blaine_cleared: true,
        giovanni_cleared: true, bill_helped: true, got_hm01: true, got_hm02: true, got_hm03: true,
        got_hm04: true, got_hm05: true, ss_anne_departed: true, got_fossil: true,
        got_silph_scope: true, tower_rockets_cleared: true, marowak_ghost_defeated: true, got_poke_flute: true,
        got_bike_voucher: true, got_bicycle: true, game_corner_poster_found: true,
        saffron_open: true, silph_co_complete: true, giovanni_silph: true, got_master_ball: true, got_lapras: true,
        snorlax_route12_cleared: true, snorlax_route16_cleared: true,
        got_old_rod: true, got_good_rod: true, got_super_rod: true,
      };
      save.party = [
        createPokemon(25, 55, save.playerName),
        createPokemon(6, 54, save.playerName),
        createPokemon(131, 52, save.playerName),
        createPokemon(65, 53, save.playerName),
        createPokemon(76, 51, save.playerName),
        createPokemon(149, 55, save.playerName),
      ];
      save.defeatedTrainers = ['giovanni_game_corner', 'giovanni_silph'];
      save.badges = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH', 'VOLCANO', 'EARTH'];
      save.money = 50000;
      save.bag = { ultra_ball: 30, master_ball: 1, max_potion: 20, full_restore: 10, revive: 10, lift_key: 1, silph_scope: 1, poke_flute: 1, card_key: 1, secret_key: 1, hm01_cut: 1, hm02_fly: 1, hm03_surf: 1, hm04_strength: 1, hm05_flash: 1, bicycle: 1, old_rod: 1, good_rod: 1, super_rod: 1 };
    },
  },
  {
    name: 'Maxed Out',
    description: 'Level 100 legends, all items',
    apply: (save) => {
      save.currentMap = 'pallet_town';
      save.playerX = 4;
      save.playerY = 7; // in front of the player's house door
      // Set all known flags (including champion, which opens Cerulean Cave)
      save.storyFlags = {};
      for (const group of STORY_FLAG_GROUPS) {
        for (const flag of group.flags) {
          save.storyFlags[flag.id] = true;
        }
      }
      save.party = [
        createPokemon(150, 100, save.playerName),
        createPokemon(151, 100, save.playerName),
        createPokemon(149, 100, save.playerName),
        createPokemon(6, 100, save.playerName),
        createPokemon(9, 100, save.playerName),
        createPokemon(3, 100, save.playerName),
      ];
      save.defeatedTrainers = ['giovanni_game_corner', 'giovanni_silph'];
      save.badges = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH', 'VOLCANO', 'EARTH'];
      save.money = 999999;
      save.bag = {};
      for (const [id, item] of Object.entries(ITEMS)) {
        save.bag[id] = item.category === 'key' || item.category === 'hm' ? 1 : 99;
      }
    },
  },
];

