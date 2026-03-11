import { SaveSystem, SaveData } from './systems/SaveSystem';
import { POKEMON_DATA } from './data/pokemon';
import { MOVES_DATA } from './data/moves';
import { ITEMS } from './data/items';
import { GYM_LEADERS } from './data/gymLeaders';
import { ALL_MAPS } from './data/maps';
import { CUSTOM_POKEMON_SPRITES } from './sprites/index';
import { createPokemon, healPokemon } from './entities/Pokemon';
import { PokemonInstance, StatusCondition } from './types/pokemon.types';

// ── Sorted moves list for dropdowns ─────────────────────────────────────────────

const SORTED_MOVES = Object.values(MOVES_DATA).sort((a, b) => a.name.localeCompare(b.name));

// ── State ──────────────────────────────────────────────────────────────────────

let currentSave: SaveData | null = null;
let pickerSlotIndex = -1; // which party slot the picker is filling

// ── Badge data ─────────────────────────────────────────────────────────────────

const BADGE_INFO = [
  { key: 'BOULDER', leader: 'Brock', symbol: '◆', trainerId: 'brock' },
  { key: 'CASCADE', leader: 'Misty', symbol: '◇', trainerId: 'misty' },
  { key: 'THUNDER', leader: 'Lt. Surge', symbol: '⚡', trainerId: 'lt_surge' },
  { key: 'RAINBOW', leader: 'Erika', symbol: '✿', trainerId: 'erika' },
  { key: 'SOUL', leader: 'Koga', symbol: '◉', trainerId: 'koga' },
  { key: 'MARSH', leader: 'Sabrina', symbol: '✦', trainerId: 'sabrina' },
  { key: 'VOLCANO', leader: 'Blaine', symbol: '▲', trainerId: 'blaine' },
  { key: 'EARTH', leader: 'Giovanni', symbol: '■', trainerId: 'giovanni' },
];

// ── Story flag groups ──────────────────────────────────────────────────────────

const STORY_FLAG_GROUPS = [
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
    ],
  },
  {
    title: 'Gift Pokemon',
    flags: [
      { id: 'got_bulbasaur', label: 'Got Bulbasaur (Cerulean)' },
      { id: 'got_charmander', label: 'Got Charmander (Route 25)' },
      { id: 'got_squirtle', label: 'Got Squirtle (Vermilion)' },
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
];

// ── Map groupings for selector ─────────────────────────────────────────────────

const MAP_GROUPS: { label: string; maps: string[] }[] = [
  {
    label: 'Pallet Town Area',
    maps: ['pallet_town', 'player_house', 'rival_house', 'oaks_lab'],
  },
  {
    label: 'Route 1 / Viridian',
    maps: ['route1', 'viridian_city', 'pokemon_center', 'pokemart', 'viridian_gym', 'viridian_house'],
  },
  {
    label: 'Route 2 / Viridian Forest / Pewter',
    maps: ['route2', 'oaks_aide_house', 'viridian_forest', 'pewter_city', 'pewter_gym', 'pokemon_center_pewter', 'pokemart_pewter', 'pewter_house', 'pewter_museum_1f', 'pewter_museum_2f'],
  },
  {
    label: 'Route 3 / Mt. Moon',
    maps: ['route3', 'pokemon_center_route3', 'mt_moon', 'mt_moon_b1f', 'mt_moon_b2f'],
  },
  {
    label: 'Route 4 / Cerulean',
    maps: ['route4', 'cerulean_city', 'cerulean_gym', 'pokemon_center_cerulean', 'pokemart_cerulean', 'burgled_house', 'bike_shop'],
  },
  {
    label: 'Route 24-25 / Bill',
    maps: ['route24', 'route25', 'bills_house'],
  },
  {
    label: 'Routes 5-6 / Vermilion',
    maps: ['route5', 'route6', 'saffron_gate_north', 'saffron_gate_south', 'underground_ns', 'vermilion_city', 'vermilion_gym', 'pokemon_center_vermilion', 'pokemart_vermilion', 'ss_anne', 'ss_anne_2f', 'ss_anne_b1f', 'ss_anne_deck'],
  },
  {
    label: 'Routes 9-10 / Rock Tunnel',
    maps: ['route9', 'route10', 'rock_tunnel', 'rock_tunnel_b1f', 'pokemon_center_route10'],
  },
  {
    label: 'Lavender Town',
    maps: ['lavender_town', 'pokemon_tower', 'pokemon_center_lavender', 'pokemart_lavender', 'lavender_house'],
  },
  {
    label: 'Routes 7-8-11 / Celadon / Saffron',
    maps: ['route7', 'route7_gate', 'route8', 'saffron_gate_east', 'underground_ew', 'route11', 'celadon_city', 'celadon_gym', 'pokemon_center_celadon', 'pokemart_celadon', 'celadon_mansion', 'game_corner', 'rocket_hideout_b1f', 'rocket_hideout_b2f', 'rocket_hideout_b3f', 'rocket_hideout_b4f', 'digletts_cave', 'saffron_city', 'saffron_gym', 'pokemon_center_saffron', 'pokemart_saffron', 'silph_co_1f', 'silph_co_2f', 'silph_co_3f', 'silph_co_4f', 'silph_co_5f', 'silph_co_6f', 'silph_co_7f', 'fighting_dojo'],
  },
  {
    label: 'Routes 12-18 / Fuchsia / Safari',
    maps: ['route12', 'route13', 'route14', 'route15', 'route16', 'route17', 'route18', 'fuchsia_city', 'fuchsia_gym', 'pokemon_center_fuchsia', 'pokemart_fuchsia', 'safari_zone', 'warden_house'],
  },
  {
    label: 'Routes 19-21 / Cinnabar',
    maps: ['route19', 'route20', 'route21', 'seafoam_islands', 'cinnabar_island', 'cinnabar_gym', 'pokemon_mansion', 'pokemon_center_cinnabar', 'pokemart_cinnabar'],
  },
  {
    label: 'Routes 22-23 / Victory Road / Indigo',
    maps: ['route22', 'route23', 'victory_road', 'indigo_plateau', 'pokemon_center_indigo'],
  },
  {
    label: 'Post-Game',
    maps: ['cerulean_cave'],
  },
];

// ── Presets ─────────────────────────────────────────────────────────────────────

interface Preset {
  name: string;
  description: string;
  apply: (save: SaveData) => void;
}

const PRESETS: Preset[] = [
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
      fresh.playerX = 5;
      fresh.playerY = 5;
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
      save.bag = { poke_ball: 15, great_ball: 5, super_potion: 5, hm01_cut: 1, ss_ticket: 1, bicycle: 1 };
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
      save.bag = { great_ball: 15, super_potion: 10, revive: 3, hm01_cut: 1, hm05_flash: 1, escape_rope: 5, bicycle: 1 };
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
        tower_rockets_cleared: true, got_poke_flute: true,
      };
      save.party = [
        createPokemon(25, 36, save.playerName),
        createPokemon(6, 34, save.playerName),  // Charizard
        createPokemon(31, 32, save.playerName),  // Nidoqueen
        createPokemon(59, 33, save.playerName),  // Arcanine
      ];
      save.badges = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW'];
      save.money = 18000;
      save.bag = { great_ball: 20, ultra_ball: 5, super_potion: 10, hyper_potion: 5, revive: 3, hm01_cut: 1, hm02_fly: 1, hm05_flash: 1, escape_rope: 5, bicycle: 1 };
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
        tower_rockets_cleared: true, got_poke_flute: true,
        saffron_open: true, silph_co_complete: true, giovanni_silph: true, got_master_ball: true,
      };
      save.party = [
        createPokemon(25, 40, save.playerName),
        createPokemon(6, 38, save.playerName),   // Charizard
        createPokemon(131, 36, save.playerName),  // Lapras
        createPokemon(31, 37, save.playerName),   // Nidoqueen
        createPokemon(59, 37, save.playerName),   // Arcanine
      ];
      save.badges = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL'];
      save.money = 25000;
      save.bag = { great_ball: 15, ultra_ball: 10, hyper_potion: 10, revive: 5, master_ball: 1, hm01_cut: 1, hm02_fly: 1, hm03_surf: 1, hm04_strength: 1, hm05_flash: 1, escape_rope: 5, bicycle: 1 };
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
        tower_rockets_cleared: true, got_poke_flute: true,
        saffron_open: true, silph_co_complete: true, giovanni_silph: true, got_master_ball: true,
        snorlax_route12_cleared: true, snorlax_route16_cleared: true,
      };
      save.party = [
        createPokemon(25, 45, save.playerName),
        createPokemon(6, 43, save.playerName),   // Charizard
        createPokemon(131, 41, save.playerName),  // Lapras
        createPokemon(65, 42, save.playerName),   // Alakazam
        createPokemon(31, 41, save.playerName),   // Nidoqueen
        createPokemon(59, 42, save.playerName),   // Arcanine
      ];
      save.badges = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH'];
      save.money = 35000;
      save.bag = { ultra_ball: 20, hyper_potion: 10, max_potion: 5, full_restore: 3, revive: 5, hm01_cut: 1, hm02_fly: 1, hm03_surf: 1, hm04_strength: 1, hm05_flash: 1, escape_rope: 5, bicycle: 1 };
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
        tower_rockets_cleared: true, got_poke_flute: true,
        saffron_open: true, silph_co_complete: true, giovanni_silph: true, got_master_ball: true,
        snorlax_route12_cleared: true, snorlax_route16_cleared: true,
      };
      save.party = [
        createPokemon(25, 50, save.playerName),
        createPokemon(6, 48, save.playerName),   // Charizard
        createPokemon(131, 46, save.playerName),  // Lapras
        createPokemon(65, 47, save.playerName),   // Alakazam
        createPokemon(31, 46, save.playerName),   // Nidoqueen
        createPokemon(59, 47, save.playerName),   // Arcanine
      ];
      save.badges = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH', 'VOLCANO'];
      save.money = 40000;
      save.bag = { ultra_ball: 25, max_potion: 15, full_restore: 5, revive: 10, hm01_cut: 1, hm02_fly: 1, hm03_surf: 1, hm04_strength: 1, hm05_flash: 1, bicycle: 1 };
    },
  },
  {
    name: 'Pre-E4',
    description: '8 badges, Victory Road',
    apply: (save) => {
      save.currentMap = 'indigo_plateau';
      save.playerX = 5;
      save.playerY = 8;
      save.storyFlags = {
        intro_complete: true, has_pikachu: true, has_pokedex: true, rival_battle_lab: true,
        delivered_parcel: true, brock_cleared: true, misty_cleared: true, lt_surge_cleared: true,
        erika_cleared: true, koga_cleared: true, sabrina_cleared: true, blaine_cleared: true,
        giovanni_cleared: true, bill_helped: true, got_hm01: true, got_hm02: true, got_hm03: true,
        got_hm04: true, got_hm05: true, ss_anne_departed: true, got_fossil: true,
        got_silph_scope: true, tower_rockets_cleared: true, got_poke_flute: true,
        saffron_open: true, silph_co_complete: true, giovanni_silph: true, got_master_ball: true,
        snorlax_route12_cleared: true, snorlax_route16_cleared: true,
      };
      save.party = [
        createPokemon(25, 55, save.playerName),
        createPokemon(6, 54, save.playerName),
        createPokemon(131, 52, save.playerName),
        createPokemon(65, 53, save.playerName),
        createPokemon(76, 51, save.playerName),
        createPokemon(149, 55, save.playerName),
      ];
      save.badges = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH', 'VOLCANO', 'EARTH'];
      save.money = 50000;
      save.bag = { ultra_ball: 30, master_ball: 1, max_potion: 20, full_restore: 10, revive: 10, hm01_cut: 1, hm02_fly: 1, hm03_surf: 1, hm04_strength: 1, hm05_flash: 1, bicycle: 1 };
    },
  },
  {
    name: 'Maxed Out',
    description: 'Level 100 legends, all items',
    apply: (save) => {
      save.currentMap = 'pallet_town';
      save.playerX = 5;
      save.playerY = 5;
      // Set all known flags
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
      save.badges = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH', 'VOLCANO', 'EARTH'];
      save.money = 999999;
      save.bag = {};
      for (const [id, item] of Object.entries(ITEMS)) {
        save.bag[id] = item.category === 'key' || item.category === 'hm' ? 1 : 99;
      }
    },
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function $(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function showToast(msg: string, error = false) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.className = 'toast show' + (error ? ' error' : '');
  setTimeout(() => { toast.className = 'toast'; }, 2400);
}

function getTypeColor(type: string): string {
  const map: Record<string, string> = {
    NORMAL: 'var(--type-normal)',
    FIRE: 'var(--type-fire)',
    WATER: 'var(--type-water)',
    ELECTRIC: 'var(--type-electric)',
    GRASS: 'var(--type-grass)',
    ICE: 'var(--type-ice)',
    FIGHTING: 'var(--type-fighting)',
    POISON: 'var(--type-poison)',
    GROUND: 'var(--type-ground)',
    FLYING: 'var(--type-flying)',
    PSYCHIC: 'var(--type-psychic)',
    BUG: 'var(--type-bug)',
    ROCK: 'var(--type-rock)',
    GHOST: 'var(--type-ghost)',
    DRAGON: 'var(--type-dragon)',
  };
  return map[type] || 'var(--text-dim)';
}

function drawPokemonSprite(speciesId: number, size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const drawFn = CUSTOM_POKEMON_SPRITES[speciesId];
  if (drawFn) {
    const off = document.createElement('canvas');
    off.width = 32;
    off.height = 32;
    const offCtx = off.getContext('2d')!;
    drawFn(offCtx, false);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, size, size);
  } else {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#666';
    ctx.font = `${Math.floor(size / 4)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('?', size / 2, size / 2 + size / 8);
  }

  return canvas;
}

function getMapName(mapId: string): string {
  const map = ALL_MAPS[mapId];
  return map ? map.name : mapId;
}

function ensureSave(): SaveData {
  if (!currentSave) {
    currentSave = SaveSystem.createNewSave();
  }
  return currentSave;
}

// ── Load / Save ────────────────────────────────────────────────────────────────

function loadSave() {
  const saved = SaveSystem.load();
  if (saved) {
    currentSave = saved;
    $('status-dot').classList.add('loaded');
    $('status-label').textContent = 'Save loaded';
    $('status-map').textContent = getMapName(saved.currentMap);
  } else {
    currentSave = SaveSystem.createNewSave();
    $('status-dot').classList.remove('loaded');
    $('status-label').textContent = 'No save found — editing new save';
    $('status-map').textContent = '';
  }
  populateAll();
}

function saveToDisk() {
  readFormIntoSave();
  SaveSystem.save(currentSave!);
  $('status-dot').classList.add('loaded');
  $('status-label').textContent = 'Save written';
  $('status-map').textContent = getMapName(currentSave!.currentMap);
  showToast('Save written to localStorage');
}

function deleteSave() {
  if (!confirm('Delete save data? This cannot be undone.')) return;
  SaveSystem.deleteSave();
  currentSave = SaveSystem.createNewSave();
  $('status-dot').classList.remove('loaded');
  $('status-label').textContent = 'Save deleted — editing new save';
  $('status-map').textContent = '';
  populateAll();
  showToast('Save deleted', true);
}

// ── Read form state back into save ─────────────────────────────────────────────

function readFormIntoSave() {
  const save = ensureSave();

  save.playerName = (($('player-name') as HTMLInputElement).value || 'RED').toUpperCase();
  save.rivalName = (($('rival-name') as HTMLInputElement).value || 'BLUE').toUpperCase();
  save.money = parseInt(($('money') as HTMLInputElement).value) || 0;
  save.playTime = parseInt(($('play-time') as HTMLInputElement).value) || 0;

  save.currentMap = ($('current-map') as HTMLSelectElement).value;
  save.playerX = parseInt(($('player-x') as HTMLInputElement).value) || 0;
  save.playerY = parseInt(($('player-y') as HTMLInputElement).value) || 0;
  save.lastHealMap = ($('heal-map') as HTMLSelectElement).value;
  save.lastHealX = parseInt(($('heal-x') as HTMLInputElement).value) || 0;
  save.lastHealY = parseInt(($('heal-y') as HTMLInputElement).value) || 0;

  // Badges
  save.badges = [];
  for (const badge of BADGE_INFO) {
    const btn = document.querySelector(`[data-badge="${badge.key}"]`);
    if (btn?.classList.contains('active')) {
      save.badges.push(badge.key);
    }
  }

  // Story flags
  save.storyFlags = {};
  document.querySelectorAll<HTMLElement>('.flag-chip').forEach((chip) => {
    if (chip.classList.contains('active')) {
      save.storyFlags[chip.dataset.flag!] = true;
    }
  });
  // Also keep custom flags
  document.querySelectorAll<HTMLElement>('.custom-flag-tag').forEach((tag) => {
    save.storyFlags[tag.dataset.flag!] = true;
  });

  // Items
  save.bag = {};
  document.querySelectorAll<HTMLElement>('.item-row').forEach((row) => {
    const id = row.dataset.itemId!;
    const val = parseInt((row.querySelector('input') as HTMLInputElement).value) || 0;
    if (val > 0) {
      save.bag[id] = val;
    }
  });

  // Party is managed directly on currentSave.party

  // Update pokedex from party + PC
  const seen = new Set(save.pokedexSeen || []);
  const caught = new Set(save.pokedexCaught || []);
  for (const p of save.party) {
    seen.add(p.speciesId);
    caught.add(p.speciesId);
  }
  for (const p of save.pc) {
    seen.add(p.speciesId);
    caught.add(p.speciesId);
  }
  save.pokedexSeen = [...seen].sort((a, b) => a - b);
  save.pokedexCaught = [...caught].sort((a, b) => a - b);
}

// ── Populate UI ────────────────────────────────────────────────────────────────

function populateAll() {
  const save = ensureSave();

  ($('player-name') as HTMLInputElement).value = save.playerName;
  ($('rival-name') as HTMLInputElement).value = save.rivalName;
  ($('money') as HTMLInputElement).value = String(save.money);
  ($('play-time') as HTMLInputElement).value = String(save.playTime || 0);

  ($('player-x') as HTMLInputElement).value = String(save.playerX);
  ($('player-y') as HTMLInputElement).value = String(save.playerY);
  ($('heal-x') as HTMLInputElement).value = String(save.lastHealX);
  ($('heal-y') as HTMLInputElement).value = String(save.lastHealY);

  populateMapSelectors(save);
  populateBadges(save);
  populateParty(save);
  populateFlags(save);
  populateItems(save);
}

// ── Map selectors ──────────────────────────────────────────────────────────────

function populateMapSelectors(save: SaveData) {
  const buildOptions = (selectId: string, selectedMap: string) => {
    const sel = $(selectId) as HTMLSelectElement;
    sel.innerHTML = '';
    for (const group of MAP_GROUPS) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = group.label;
      for (const mapId of group.maps) {
        if (!ALL_MAPS[mapId]) continue;
        const opt = document.createElement('option');
        opt.value = mapId;
        opt.textContent = `${getMapName(mapId)} (${mapId})`;
        if (mapId === selectedMap) opt.selected = true;
        optgroup.appendChild(opt);
      }
      sel.appendChild(optgroup);
    }
    // Add any maps not in groups (catch-all)
    const knownMaps = new Set(MAP_GROUPS.flatMap(g => g.maps));
    const unknownMaps = Object.keys(ALL_MAPS).filter(id => !knownMaps.has(id));
    if (unknownMaps.length > 0) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = 'Other';
      for (const mapId of unknownMaps) {
        const opt = document.createElement('option');
        opt.value = mapId;
        opt.textContent = `${getMapName(mapId)} (${mapId})`;
        if (mapId === selectedMap) opt.selected = true;
        optgroup.appendChild(opt);
      }
      sel.appendChild(optgroup);
    }
  };

  buildOptions('current-map', save.currentMap);
  buildOptions('heal-map', save.lastHealMap);
}

// ── Badges ─────────────────────────────────────────────────────────────────────

function populateBadges(save: SaveData) {
  const grid = $('badges-grid');
  grid.innerHTML = '';
  for (const badge of BADGE_INFO) {
    const btn = document.createElement('div');
    btn.className = 'badge-btn' + (save.badges.includes(badge.key) ? ' active' : '');
    btn.dataset.badge = badge.key;
    btn.innerHTML = `
      <div class="badge-icon">${badge.symbol}</div>
      <div class="badge-name">${badge.key}</div>
      <div class="badge-leader">${badge.leader}</div>
    `;
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      // Also toggle the defeated trainer flag
      const flagChip = document.querySelector(`[data-flag="${badge.trainerId}_cleared"]`);
      if (flagChip) {
        if (btn.classList.contains('active')) {
          flagChip.classList.add('active');
        } else {
          flagChip.classList.remove('active');
        }
      }
    });
    grid.appendChild(btn);
  }
}

// ── Party ──────────────────────────────────────────────────────────────────────

function populateParty(save: SaveData) {
  const grid = $('party-grid');
  grid.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    const poke = save.party[i];
    const slot = document.createElement('div');

    if (poke) {
      const species = POKEMON_DATA[poke.speciesId];
      slot.className = 'party-slot';

      const spriteEl = document.createElement('div');
      spriteEl.className = 'party-sprite';
      spriteEl.appendChild(drawPokemonSprite(poke.speciesId, 48));

      const info = document.createElement('div');
      info.className = 'party-info';

      const typeTags = (species?.types || []).map(t =>
        `<span class="type-tag" style="background:${getTypeColor(t)}">${t}</span>`
      ).join('');

      const statusOptions = [
        StatusCondition.NONE, StatusCondition.POISON, StatusCondition.BURN,
        StatusCondition.PARALYSIS, StatusCondition.SLEEP, StatusCondition.FREEZE,
      ].map(s => `<option value="${s}"${poke.status === s ? ' selected' : ''}>${s === 'NONE' ? 'OK' : s}</option>`).join('');

      info.innerHTML = `
        <div class="poke-name">${species?.name || `#${poke.speciesId}`}</div>
        <div class="poke-level">Lv.${poke.level} &middot; HP ${poke.currentHp}/${poke.stats.hp}</div>
        <div class="poke-types">${typeTags}</div>
        <div class="poke-status">Status: <select class="status-select" data-party-index="${i}">${statusOptions}</select></div>
      `;

      // Editable move slots
      const movesContainer = document.createElement('div');
      movesContainer.className = 'party-moves';
      const pokeIndex = i;
      for (let m = 0; m < 4; m++) {
        const moveSlot = poke.moves[m];
        const row = document.createElement('div');
        row.className = 'move-slot-row';

        const sel = document.createElement('select');
        sel.className = 'move-select';

        // Empty / no-move option
        const emptyOpt = document.createElement('option');
        emptyOpt.value = '0';
        emptyOpt.textContent = m === 0 ? '(select move)' : '—';
        sel.appendChild(emptyOpt);

        for (const md of SORTED_MOVES) {
          const opt = document.createElement('option');
          opt.value = String(md.id);
          opt.textContent = md.name;
          if (moveSlot && moveSlot.moveId === md.id) opt.selected = true;
          sel.appendChild(opt);
        }

        const moveIndex = m;
        sel.addEventListener('change', () => {
          const newId = parseInt(sel.value);
          const p = save.party[pokeIndex];
          if (!p) return;
          if (newId === 0) {
            // Remove this move slot
            p.moves.splice(moveIndex, 1);
            populateParty(save);
          } else {
            const moveData = MOVES_DATA[newId];
            const pp = moveData?.pp ?? 20;
            if (moveIndex < p.moves.length) {
              p.moves[moveIndex] = { moveId: newId, currentPp: pp, maxPp: pp };
            } else {
              p.moves.push({ moveId: newId, currentPp: pp, maxPp: pp });
            }
          }
        });

        row.appendChild(sel);
        movesContainer.appendChild(row);
      }

      const removeBtn = document.createElement('button');
      removeBtn.className = 'slot-remove';
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        save.party.splice(i, 1);
        populateParty(save);
      });

      slot.appendChild(spriteEl);
      slot.appendChild(info);
      slot.appendChild(movesContainer);
      slot.appendChild(removeBtn);

      // Status condition selector
      const statusSel = info.querySelector('.status-select') as HTMLSelectElement;
      if (statusSel) {
        const idx = i;
        statusSel.addEventListener('change', () => {
          const p = save.party[idx];
          if (p) p.status = statusSel.value as StatusCondition;
        });
      }

      // Click sprite/name area to replace Pokemon
      spriteEl.style.cursor = 'pointer';
      spriteEl.addEventListener('click', () => {
        pickerSlotIndex = i;
        openPokemonPicker();
      });
      info.style.cursor = 'pointer';
      info.addEventListener('click', () => {
        pickerSlotIndex = i;
        openPokemonPicker();
      });
    } else {
      slot.className = 'party-slot empty';
      slot.innerHTML = '<div class="empty-label">+ ADD<br>POKeMON</div>';
      slot.addEventListener('click', () => {
        pickerSlotIndex = i;
        openPokemonPicker();
      });
    }

    grid.appendChild(slot);
  }
}

// ── Pokemon Picker ─────────────────────────────────────────────────────────────

function openPokemonPicker() {
  const modal = $('poke-modal');
  modal.classList.add('open');
  ($('poke-search') as HTMLInputElement).value = '';
  ($('poke-search') as HTMLInputElement).focus();
  renderPokemonList('');
}

function closePokemonPicker() {
  $('poke-modal').classList.remove('open');
}

function renderPokemonList(filter: string) {
  const list = $('poke-list');
  list.innerHTML = '';
  const term = filter.toLowerCase();

  for (let id = 1; id <= 151; id++) {
    const species = POKEMON_DATA[id];
    if (!species) continue;
    if (term && !species.name.toLowerCase().includes(term) && !String(id).includes(term)) continue;

    const option = document.createElement('div');
    option.className = 'poke-option';

    const sprite = drawPokemonSprite(id, 40);
    option.appendChild(sprite);

    const idLabel = document.createElement('div');
    idLabel.className = 'poke-opt-id';
    idLabel.textContent = `#${String(id).padStart(3, '0')}`;
    option.appendChild(idLabel);

    const nameLabel = document.createElement('div');
    nameLabel.className = 'poke-opt-name';
    nameLabel.textContent = species.name;
    option.appendChild(nameLabel);

    option.addEventListener('click', () => {
      const level = parseInt(($('poke-level') as HTMLInputElement).value) || 50;
      const save = ensureSave();
      const pokemon = createPokemon(id, Math.max(1, Math.min(100, level)), save.playerName);

      if (pickerSlotIndex < save.party.length) {
        save.party[pickerSlotIndex] = pokemon;
      } else {
        save.party.push(pokemon);
      }

      closePokemonPicker();
      populateParty(save);
    });

    list.appendChild(option);
  }
}

// ── Story Flags ────────────────────────────────────────────────────────────────

function populateFlags(save: SaveData) {
  const section = $('flags-section');
  section.innerHTML = '';

  // Known flag groups
  for (const group of STORY_FLAG_GROUPS) {
    const groupEl = document.createElement('div');
    groupEl.className = 'flag-group';

    const title = document.createElement('div');
    title.className = 'flag-group-title';
    title.textContent = group.title;
    groupEl.appendChild(title);

    const list = document.createElement('div');
    list.className = 'flag-list';

    for (const flag of group.flags) {
      const chip = document.createElement('div');
      chip.className = 'flag-chip' + (save.storyFlags[flag.id] ? ' active' : '');
      chip.dataset.flag = flag.id;
      chip.textContent = flag.label;
      chip.addEventListener('click', () => chip.classList.toggle('active'));
      list.appendChild(chip);
    }

    groupEl.appendChild(list);
    section.appendChild(groupEl);
  }

  // Custom/extra flags from save that aren't in known groups
  const knownFlags = new Set(STORY_FLAG_GROUPS.flatMap(g => g.flags.map(f => f.id)));
  const customFlags = Object.keys(save.storyFlags).filter(f => save.storyFlags[f] && !knownFlags.has(f));

  const customGroup = document.createElement('div');
  customGroup.className = 'flag-group';

  const customTitle = document.createElement('div');
  customTitle.className = 'flag-group-title';
  customTitle.textContent = 'Custom / Runtime Flags';
  customGroup.appendChild(customTitle);

  const customDisplay = document.createElement('div');
  customDisplay.className = 'active-custom-flags';
  customDisplay.id = 'custom-flags-display';
  for (const f of customFlags) {
    addCustomFlagTag(customDisplay, f);
  }
  customGroup.appendChild(customDisplay);

  const customInput = document.createElement('div');
  customInput.className = 'custom-flags';
  customInput.innerHTML = `
    <input type="text" id="custom-flag-input" placeholder="Add custom flag..." />
    <button class="btn btn-sm" id="custom-flag-add">ADD</button>
  `;
  customGroup.appendChild(customInput);
  section.appendChild(customGroup);

  // Bind custom flag add
  setTimeout(() => {
    $('custom-flag-add').addEventListener('click', addCustomFlag);
    ($('custom-flag-input') as HTMLInputElement).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addCustomFlag();
    });
  }, 0);
}

function addCustomFlag() {
  const input = $('custom-flag-input') as HTMLInputElement;
  const val = input.value.trim();
  if (!val) return;
  input.value = '';

  const display = $('custom-flags-display');
  // Don't add duplicates
  if (display.querySelector(`[data-flag="${val}"]`)) return;
  addCustomFlagTag(display, val);
}

function addCustomFlagTag(container: HTMLElement, flag: string) {
  const tag = document.createElement('div');
  tag.className = 'custom-flag-tag';
  tag.dataset.flag = flag;
  tag.innerHTML = `<span>${flag}</span><button>&times;</button>`;
  tag.querySelector('button')!.addEventListener('click', () => tag.remove());
  container.appendChild(tag);
}

// ── Items ──────────────────────────────────────────────────────────────────────

function populateItems(save: SaveData) {
  const grid = $('items-grid');
  grid.innerHTML = '';

  const categories: Record<string, Array<{ id: string; name: string }>> = {};
  for (const [id, item] of Object.entries(ITEMS)) {
    const cat = item.category;
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ id, name: item.name });
  }

  const order = ['ball', 'medicine', 'battle', 'key', 'hm', 'tm', 'misc'];
  for (const cat of order) {
    const items = categories[cat];
    if (!items) continue;
    for (const item of items) {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.dataset.itemId = item.id;

      const name = document.createElement('div');
      name.className = 'item-name';
      name.textContent = item.name;

      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.max = '999';
      input.value = String(save.bag[item.id] || 0);

      row.appendChild(name);
      row.appendChild(input);
      grid.appendChild(row);
    }
  }
}

// ── Presets ─────────────────────────────────────────────────────────────────────

function populatePresets() {
  const bar = $('presets-bar');
  bar.innerHTML = '';
  for (const preset of PRESETS) {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = preset.name;
    btn.title = preset.description;
    btn.addEventListener('click', () => {
      const save = ensureSave();
      preset.apply(save);
      populateAll();
      showToast(`Preset applied: ${preset.name}`);
    });
    bar.appendChild(btn);
  }
}

// ── Init ───────────────────────────────────────────────────────────────────────

function init() {
  // Action buttons
  $('btn-save').addEventListener('click', saveToDisk);
  $('btn-load').addEventListener('click', loadSave);
  $('btn-delete').addEventListener('click', deleteSave);

  // Badge quick buttons
  $('badges-all').addEventListener('click', () => {
    document.querySelectorAll('.badge-btn').forEach(b => b.classList.add('active'));
    // Also set gym leader cleared flags
    for (const badge of BADGE_INFO) {
      const flagChip = document.querySelector(`[data-flag="${badge.trainerId}_cleared"]`);
      if (flagChip) flagChip.classList.add('active');
    }
  });
  $('badges-none').addEventListener('click', () => {
    document.querySelectorAll('.badge-btn').forEach(b => b.classList.remove('active'));
  });

  // Party buttons
  $('party-heal').addEventListener('click', () => {
    const save = ensureSave();
    for (const poke of save.party) {
      healPokemon(poke);
    }
    populateParty(save);
    showToast('Party healed');
  });
  $('party-clear').addEventListener('click', () => {
    const save = ensureSave();
    save.party = [];
    populateParty(save);
  });

  // Item buttons
  $('items-starter').addEventListener('click', () => {
    const save = ensureSave();
    save.bag = { poke_ball: 20, great_ball: 10, potion: 10, super_potion: 5, revive: 3, escape_rope: 5 };
    populateItems(save);
    showToast('Starter kit applied');
  });
  $('items-full').addEventListener('click', () => {
    const save = ensureSave();
    save.bag = {};
    for (const [id, item] of Object.entries(ITEMS)) {
      save.bag[id] = item.category === 'key' || item.category === 'hm' ? 1 : 99;
    }
    populateItems(save);
    showToast('All items maxed');
  });
  $('items-clear').addEventListener('click', () => {
    const save = ensureSave();
    save.bag = {};
    populateItems(save);
  });

  // Flags clear
  $('flags-clear').addEventListener('click', () => {
    document.querySelectorAll('.flag-chip').forEach(c => c.classList.remove('active'));
    const display = $('custom-flags-display');
    if (display) display.innerHTML = '';
  });

  // Pokemon picker
  $('modal-close').addEventListener('click', closePokemonPicker);
  $('poke-modal').addEventListener('click', (e) => {
    if (e.target === $('poke-modal')) closePokemonPicker();
  });
  ($('poke-search') as HTMLInputElement).addEventListener('input', (e) => {
    renderPokemonList((e.target as HTMLInputElement).value);
  });

  // Populate presets
  populatePresets();

  // Load save
  loadSave();
}

init();
