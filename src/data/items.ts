export interface ItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'ball' | 'medicine' | 'battle' | 'key' | 'hm' | 'tm' | 'misc';
  effect?: string;
  healAmount?: number;
  moveId?: number;
}

export const ITEMS: Record<string, ItemData> = {
  poke_ball: {
    id: 'poke_ball',
    name: 'POKe BALL',
    description: 'A ball for catching POKeMON.',
    price: 200,
    category: 'ball',
  },
  great_ball: {
    id: 'great_ball',
    name: 'GREAT BALL',
    description: 'A better ball with a higher catch rate.',
    price: 600,
    category: 'ball',
  },
  ultra_ball: {
    id: 'ultra_ball',
    name: 'ULTRA BALL',
    description: 'A high-performance ball.',
    price: 1200,
    category: 'ball',
  },
  master_ball: {
    id: 'master_ball',
    name: 'MASTER BALL',
    description: 'The best ball. Never fails.',
    price: 0,
    category: 'ball',
  },
  potion: {
    id: 'potion',
    name: 'POTION',
    description: 'Restores 20 HP.',
    price: 300,
    category: 'medicine',
    healAmount: 20,
  },
  super_potion: {
    id: 'super_potion',
    name: 'SUPER POTION',
    description: 'Restores 50 HP.',
    price: 700,
    category: 'medicine',
    healAmount: 50,
  },
  hyper_potion: {
    id: 'hyper_potion',
    name: 'HYPER POTION',
    description: 'Restores 200 HP.',
    price: 1200,
    category: 'medicine',
    healAmount: 200,
  },
  max_potion: {
    id: 'max_potion',
    name: 'MAX POTION',
    description: 'Fully restores HP.',
    price: 2500,
    category: 'medicine',
    healAmount: 999,
  },
  full_restore: {
    id: 'full_restore',
    name: 'FULL RESTORE',
    description: 'Fully restores HP and status.',
    price: 3000,
    category: 'medicine',
    healAmount: 999,
  },
  revive: {
    id: 'revive',
    name: 'REVIVE',
    description: 'Revives a fainted POKeMON to half HP.',
    price: 1500,
    category: 'medicine',
  },
  antidote: {
    id: 'antidote',
    name: 'ANTIDOTE',
    description: 'Cures poison.',
    price: 100,
    category: 'medicine',
    effect: 'cure_poison',
  },
  burn_heal: {
    id: 'burn_heal',
    name: 'BURN HEAL',
    description: 'Cures a burn.',
    price: 250,
    category: 'medicine',
    effect: 'cure_burn',
  },
  ice_heal: {
    id: 'ice_heal',
    name: 'ICE HEAL',
    description: 'Cures freezing.',
    price: 250,
    category: 'medicine',
    effect: 'cure_freeze',
  },
  awakening: {
    id: 'awakening',
    name: 'AWAKENING',
    description: 'Cures sleep.',
    price: 250,
    category: 'medicine',
    effect: 'cure_sleep',
  },
  paralyze_heal: {
    id: 'paralyze_heal',
    name: 'PARLYZ HEAL',
    description: 'Cures paralysis.',
    price: 200,
    category: 'medicine',
    effect: 'cure_paralysis',
  },
  full_heal: {
    id: 'full_heal',
    name: 'FULL HEAL',
    description: 'Cures all status problems.',
    price: 600,
    category: 'medicine',
    effect: 'cure_all',
  },
  fresh_water: {
    id: 'fresh_water',
    name: 'FRESH WATER',
    description: 'Restores 50 HP.',
    price: 200,
    category: 'medicine',
    healAmount: 50,
  },
  soda_pop: {
    id: 'soda_pop',
    name: 'SODA POP',
    description: 'Restores 60 HP.',
    price: 300,
    category: 'medicine',
    healAmount: 60,
  },
  lemonade: {
    id: 'lemonade',
    name: 'LEMONADE',
    description: 'Restores 80 HP.',
    price: 350,
    category: 'medicine',
    healAmount: 80,
  },
  escape_rope: {
    id: 'escape_rope',
    name: 'ESCAPE ROPE',
    description: 'Escape from a dungeon.',
    price: 550,
    category: 'battle',
  },
  repel: {
    id: 'repel',
    name: 'REPEL',
    description: 'Repels weak wild POKeMON for a while.',
    price: 350,
    category: 'battle',
  },
  rare_candy: {
    id: 'rare_candy',
    name: 'RARE CANDY',
    description: 'Raises level by 1.',
    price: 0,
    category: 'medicine',
  },
  nugget: {
    id: 'nugget',
    name: 'NUGGET',
    description: 'A nugget of pure gold.\nSell high.',
    price: 5000,
    category: 'misc',
  },
  // Key items
  oaks_parcel: {
    id: 'oaks_parcel',
    name: "OAK's PARCEL",
    description: "A parcel for PROF.\nOAK from VIRIDIAN\nCity's MART.",
    price: 0,
    category: 'key',
  },
  pokedex: {
    id: 'pokedex',
    name: 'POKeDEX',
    description: 'A high-tech encyclopedia\nthat records POKeMON data.',
    price: 0,
    category: 'key',
  },
  ss_ticket: {
    id: 'ss_ticket',
    name: 'S.S. TICKET',
    description: 'A ticket for the S.S.\nANNE cruise ship.',
    price: 0,
    category: 'key',
  },
  silph_scope: {
    id: 'silph_scope',
    name: 'SILPH SCOPE',
    description: 'Makes ghosts visible\nin POKeMON TOWER.',
    price: 0,
    category: 'key',
  },
  coin_case: {
    id: 'coin_case',
    name: 'COIN CASE',
    description: 'Holds up to 9999\nGAME CORNER coins.',
    price: 0,
    category: 'key',
  },
  poke_flute: {
    id: 'poke_flute',
    name: 'POKe FLUTE',
    description: 'Wakes sleeping POKeMON\nwith a sweet melody.',
    price: 0,
    category: 'key',
  },
  bike_voucher: {
    id: 'bike_voucher',
    name: 'BIKE VOUCHER',
    description: 'A voucher for a free\nbicycle.',
    price: 0,
    category: 'key',
  },
  bicycle: {
    id: 'bicycle',
    name: 'BICYCLE',
    description: 'A folding bicycle\nfor fast travel.',
    price: 0,
    category: 'key',
  },
  tea: {
    id: 'tea',
    name: 'TEA',
    description: 'Aromatic tea that\nSAFFRON guards love.',
    price: 0,
    category: 'key',
  },
  gold_teeth: {
    id: 'gold_teeth',
    name: 'GOLD TEETH',
    description: "The SAFARI ZONE\nWARDEN's lost teeth.",
    price: 0,
    category: 'key',
  },
  helix_fossil: {
    id: 'helix_fossil',
    name: 'HELIX FOSSIL',
    description: 'A fossil of an ancient\nPOKeMON that lived\nin the sea.',
    price: 0,
    category: 'key',
  },
  dome_fossil: {
    id: 'dome_fossil',
    name: 'DOME FOSSIL',
    description: 'A fossil of an ancient\nPOKeMON that lived\non land.',
    price: 0,
    category: 'key',
  },
  lift_key: {
    id: 'lift_key',
    name: 'LIFT KEY',
    description: 'Opens the elevator\nin the ROCKET HIDEOUT.',
    price: 0,
    category: 'key',
  },
  old_rod: {
    id: 'old_rod',
    name: 'OLD ROD',
    description: 'Use by water to fish\nfor POKeMON.',
    price: 0,
    category: 'key',
  },
  good_rod: {
    id: 'good_rod',
    name: 'GOOD ROD',
    description: 'A good rod for\nfishing POKeMON.',
    price: 0,
    category: 'key',
  },
  super_rod: {
    id: 'super_rod',
    name: 'SUPER ROD',
    description: 'The best rod for\nfishing rare POKeMON.',
    price: 0,
    category: 'key',
  },
  // HM items
  hm01_cut: {
    id: 'hm01_cut',
    name: 'HM01 CUT',
    description: 'Teaches CUT to a\nPOKeMON. Chops small\ntrees.',
    price: 0,
    category: 'hm',
    moveId: 15,
  },
  hm02_fly: {
    id: 'hm02_fly',
    name: 'HM02 FLY',
    description: 'Teaches FLY to a\nPOKeMON. Fly to visited\ntowns.',
    price: 0,
    category: 'hm',
    moveId: 19,
  },
  hm03_surf: {
    id: 'hm03_surf',
    name: 'HM03 SURF',
    description: 'Teaches SURF to a\nPOKeMON. Crosses water.',
    price: 0,
    category: 'hm',
    moveId: 57,
  },
  hm04_strength: {
    id: 'hm04_strength',
    name: 'HM04 STRENGTH',
    description: 'Teaches STRENGTH.\nPushes heavy boulders.',
    price: 0,
    category: 'hm',
    moveId: 70,
  },
  hm05_flash: {
    id: 'hm05_flash',
    name: 'HM05 FLASH',
    description: 'Teaches FLASH.\nLights up dark caves.',
    price: 0,
    category: 'hm',
    moveId: 148,
  },
  // TM items
  tm06_toxic: {
    id: 'tm06_toxic',
    name: 'TM06 TOXIC',
    description: 'Teaches TOXIC to a\nPOKeMON. Badly poisons\nthe target.',
    price: 0,
    category: 'tm',
    moveId: 92,
  },
  tm11_bubblebeam: {
    id: 'tm11_bubblebeam',
    name: 'TM11 BUBBLEBEAM',
    description: 'Teaches BUBBLE BEAM\nto a POKeMON.',
    price: 0,
    category: 'tm',
    moveId: 61,
  },
  tm21_mega_drain: {
    id: 'tm21_mega_drain',
    name: 'TM21 MEGA DRAIN',
    description: 'Teaches MEGA DRAIN\nto a POKeMON. Drains\nHP from the target.',
    price: 0,
    category: 'tm',
    moveId: 72,
  },
  tm24_thunderbolt: {
    id: 'tm24_thunderbolt',
    name: 'TM24 THUNDERBOLT',
    description: 'Teaches THUNDERBOLT\nto a POKeMON.',
    price: 0,
    category: 'tm',
    moveId: 85,
  },
  tm27_fissure: {
    id: 'tm27_fissure',
    name: 'TM27 FISSURE',
    description: 'Teaches FISSURE to a\nPOKeMON. A one-hit KO\nattack.',
    price: 0,
    category: 'tm',
    moveId: 90,
  },
  tm28_dig: {
    id: 'tm28_dig',
    name: 'TM28 DIG',
    description: 'Teaches DIG to a\nPOKeMON. Digs underground\nto attack.',
    price: 2000,
    category: 'tm',
    moveId: 91,
  },
  tm34_bide: {
    id: 'tm34_bide',
    name: 'TM34 BIDE',
    description: 'Teaches BIDE to a\nPOKeMON. Stores energy\nthen unleashes it.',
    price: 0,
    category: 'tm',
    moveId: 117,
  },
  tm38_fire_blast: {
    id: 'tm38_fire_blast',
    name: 'TM38 FIRE BLAST',
    description: 'Teaches FIRE BLAST\nto a POKeMON.',
    price: 0,
    category: 'tm',
    moveId: 126,
  },
  tm46_psywave: {
    id: 'tm46_psywave',
    name: 'TM46 PSYWAVE',
    description: 'Teaches PSYWAVE to a\nPOKeMON. Deals variable\ndamage.',
    price: 0,
    category: 'tm',
    moveId: 149,
  },
  tm01_mega_punch: {
    id: 'tm01_mega_punch',
    name: 'TM01 MEGA PUNCH',
    description: 'Teaches MEGA PUNCH\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 5,
  },
  tm02_razor_wind: {
    id: 'tm02_razor_wind',
    name: 'TM02 RAZOR WIND',
    description: 'Teaches RAZOR WIND\nto a POKeMON.',
    price: 2000,
    category: 'tm',
    moveId: 13,
  },
  tm03_swords_dance: {
    id: 'tm03_swords_dance',
    name: 'TM03 SWORDS DANCE',
    description: 'Teaches SWORDS DANCE\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 14,
  },
  tm04_whirlwind: {
    id: 'tm04_whirlwind',
    name: 'TM04 WHIRLWIND',
    description: 'Teaches WHIRLWIND\nto a POKeMON.',
    price: 1000,
    category: 'tm',
    moveId: 18,
  },
  tm05_mega_kick: {
    id: 'tm05_mega_kick',
    name: 'TM05 MEGA KICK',
    description: 'Teaches MEGA KICK\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 25,
  },
  tm07_horn_drill: {
    id: 'tm07_horn_drill',
    name: 'TM07 HORN DRILL',
    description: 'Teaches HORN DRILL\nto a POKeMON. A one-hit\nKO attack.',
    price: 2000,
    category: 'tm',
    moveId: 32,
  },
  tm08_body_slam: {
    id: 'tm08_body_slam',
    name: 'TM08 BODY SLAM',
    description: 'Teaches BODY SLAM\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 34,
  },
  tm09_take_down: {
    id: 'tm09_take_down',
    name: 'TM09 TAKE DOWN',
    description: 'Teaches TAKE DOWN\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 36,
  },
  tm10_double_edge: {
    id: 'tm10_double_edge',
    name: 'TM10 DOUBLE-EDGE',
    description: 'Teaches DOUBLE-EDGE\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 38,
  },
  tm12_water_gun: {
    id: 'tm12_water_gun',
    name: 'TM12 WATER GUN',
    description: 'Teaches WATER GUN\nto a POKeMON.',
    price: 1000,
    category: 'tm',
    moveId: 55,
  },
  tm13_ice_beam: {
    id: 'tm13_ice_beam',
    name: 'TM13 ICE BEAM',
    description: 'Teaches ICE BEAM\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 58,
  },
  tm14_blizzard: {
    id: 'tm14_blizzard',
    name: 'TM14 BLIZZARD',
    description: 'Teaches BLIZZARD\nto a POKeMON.',
    price: 5500,
    category: 'tm',
    moveId: 59,
  },
  tm15_hyper_beam: {
    id: 'tm15_hyper_beam',
    name: 'TM15 HYPER BEAM',
    description: 'Teaches HYPER BEAM\nto a POKeMON.',
    price: 7500,
    category: 'tm',
    moveId: 63,
  },
  tm16_pay_day: {
    id: 'tm16_pay_day',
    name: 'TM16 PAY DAY',
    description: 'Teaches PAY DAY\nto a POKeMON.',
    price: 1000,
    category: 'tm',
    moveId: 6,
  },
  tm17_submission: {
    id: 'tm17_submission',
    name: 'TM17 SUBMISSION',
    description: 'Teaches SUBMISSION\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 66,
  },
  tm18_counter: {
    id: 'tm18_counter',
    name: 'TM18 COUNTER',
    description: 'Teaches COUNTER\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 68,
  },
  tm19_seismic_toss: {
    id: 'tm19_seismic_toss',
    name: 'TM19 SEISMIC TOSS',
    description: 'Teaches SEISMIC TOSS\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 69,
  },
  tm20_rage: {
    id: 'tm20_rage',
    name: 'TM20 RAGE',
    description: 'Teaches RAGE to a\nPOKeMON.',
    price: 1000,
    category: 'tm',
    moveId: 99,
  },
  tm22_solar_beam: {
    id: 'tm22_solar_beam',
    name: 'TM22 SOLAR BEAM',
    description: 'Teaches SOLAR BEAM\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 76,
  },
  tm23_dragon_rage: {
    id: 'tm23_dragon_rage',
    name: 'TM23 DRAGON RAGE',
    description: 'Teaches DRAGON RAGE\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 82,
  },
  tm25_thunder: {
    id: 'tm25_thunder',
    name: 'TM25 THUNDER',
    description: 'Teaches THUNDER\nto a POKeMON.',
    price: 5500,
    category: 'tm',
    moveId: 87,
  },
  tm26_earthquake: {
    id: 'tm26_earthquake',
    name: 'TM26 EARTHQUAKE',
    description: 'Teaches EARTHQUAKE\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 89,
  },
  tm29_psychic: {
    id: 'tm29_psychic',
    name: 'TM29 PSYCHIC',
    description: 'Teaches PSYCHIC\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 94,
  },
  tm30_teleport: {
    id: 'tm30_teleport',
    name: 'TM30 TELEPORT',
    description: 'Teaches TELEPORT\nto a POKeMON.',
    price: 1000,
    category: 'tm',
    moveId: 100,
  },
  tm31_mimic: {
    id: 'tm31_mimic',
    name: 'TM31 MIMIC',
    description: 'Teaches MIMIC to a\nPOKeMON.',
    price: 1000,
    category: 'tm',
    moveId: 102,
  },
  tm32_double_team: {
    id: 'tm32_double_team',
    name: 'TM32 DOUBLE TEAM',
    description: 'Teaches DOUBLE TEAM\nto a POKeMON.',
    price: 1000,
    category: 'tm',
    moveId: 104,
  },
  tm33_reflect: {
    id: 'tm33_reflect',
    name: 'TM33 REFLECT',
    description: 'Teaches REFLECT\nto a POKeMON.',
    price: 1000,
    category: 'tm',
    moveId: 115,
  },
  tm35_metronome: {
    id: 'tm35_metronome',
    name: 'TM35 METRONOME',
    description: 'Teaches METRONOME\nto a POKeMON.',
    price: 1000,
    category: 'tm',
    moveId: 118,
  },
  tm36_self_destruct: {
    id: 'tm36_self_destruct',
    name: 'TM36 SELF-DESTRUCT',
    description: 'Teaches SELF-DESTRUCT\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 120,
  },
  tm37_egg_bomb: {
    id: 'tm37_egg_bomb',
    name: 'TM37 EGG BOMB',
    description: 'Teaches EGG BOMB\nto a POKeMON.',
    price: 2000,
    category: 'tm',
    moveId: 121,
  },
  tm39_swift: {
    id: 'tm39_swift',
    name: 'TM39 SWIFT',
    description: 'Teaches SWIFT to a\nPOKeMON. Never misses.',
    price: 1000,
    category: 'tm',
    moveId: 129,
  },
  tm40_skull_bash: {
    id: 'tm40_skull_bash',
    name: 'TM40 SKULL BASH',
    description: 'Teaches SKULL BASH\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 130,
  },
  tm41_softboiled: {
    id: 'tm41_softboiled',
    name: 'TM41 SOFTBOILED',
    description: 'Teaches SOFTBOILED\nto a POKeMON.',
    price: 0,
    category: 'tm',
    moveId: 135,
  },
  tm42_dream_eater: {
    id: 'tm42_dream_eater',
    name: 'TM42 DREAM EATER',
    description: 'Teaches DREAM EATER\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 138,
  },
  tm43_sky_attack: {
    id: 'tm43_sky_attack',
    name: 'TM43 SKY ATTACK',
    description: 'Teaches SKY ATTACK\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 143,
  },
  tm44_rest: {
    id: 'tm44_rest',
    name: 'TM44 REST',
    description: 'Teaches REST to a\nPOKeMON. Heals fully\nbut sleeps.',
    price: 3000,
    category: 'tm',
    moveId: 156,
  },
  tm45_thunder_wave: {
    id: 'tm45_thunder_wave',
    name: 'TM45 THUNDER WAVE',
    description: 'Teaches THUNDER WAVE\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 86,
  },
  tm47_explosion: {
    id: 'tm47_explosion',
    name: 'TM47 EXPLOSION',
    description: 'Teaches EXPLOSION\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 153,
  },
  tm48_rock_slide: {
    id: 'tm48_rock_slide',
    name: 'TM48 ROCK SLIDE',
    description: 'Teaches ROCK SLIDE\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 157,
  },
  tm49_tri_attack: {
    id: 'tm49_tri_attack',
    name: 'TM49 TRI ATTACK',
    description: 'Teaches TRI ATTACK\nto a POKeMON.',
    price: 2000,
    category: 'tm',
    moveId: 161,
  },
  tm50_substitute: {
    id: 'tm50_substitute',
    name: 'TM50 SUBSTITUTE',
    description: 'Teaches SUBSTITUTE\nto a POKeMON.',
    price: 3000,
    category: 'tm',
    moveId: 164,
  },
};

// Gen 1 HM compatibility: maps HM move IDs to sets of species IDs that can learn them
export const HM_COMPATIBILITY: Record<number, Set<number>> = {
  // HM01 Cut
  15: new Set([
    1, 2, 3, 4, 5, 6, 15, 27, 28, 29, 30, 31, 32, 33, 34,
    43, 44, 45, 46, 47, 52, 53, 69, 70, 71, 72, 73, 83,
    98, 99, 108, 114, 115, 123, 127, 141, 149, 151,
  ]),
  // HM02 Fly
  19: new Set([
    6, 16, 17, 18, 21, 22, 41, 42, 83, 84, 85,
    142, 144, 145, 146, 149, 151,
  ]),
  // HM03 Surf
  57: new Set([
    7, 8, 9, 25, 31, 34, 54, 55, 60, 61, 62, 72, 73, 79, 80,
    86, 87, 90, 91, 98, 99, 108, 112, 115, 116, 117, 118, 119,
    120, 121, 128, 130, 131, 134, 138, 139, 140, 141, 143,
    147, 148, 149, 151,
  ]),
  // HM04 Strength
  70: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 27, 28, 31, 34, 35, 36,
    39, 40, 54, 55, 56, 57, 60, 61, 62, 66, 67, 68,
    74, 75, 76, 79, 80, 86, 87, 94, 95, 98, 99,
    104, 105, 106, 107, 108, 111, 112, 113, 115, 127, 128,
    130, 131, 143, 149, 150, 151,
  ]),
  // HM05 Flash
  148: new Set([
    1, 2, 3, 25, 26, 35, 36, 39, 40, 43, 44, 45, 54, 55,
    60, 61, 62, 63, 64, 65, 69, 70, 71, 79, 80,
    81, 82, 96, 97, 100, 101, 113, 120, 121, 122,
    124, 125, 135, 137, 150, 151,
  ]),
};

// Gen 1 TM compatibility: maps TM move IDs to sets of species IDs that can learn them
export const TM_COMPATIBILITY: Record<number, Set<number>> = {
  // TM06 Toxic — nearly every Pokemon can learn this
  92: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
    127, 128, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
    145, 146, 147, 148, 149, 150, 151,
  ]),
  // TM11 Bubblebeam — Water-types and select others
  61: new Set([
    7, 8, 9, 25, 31, 34, 54, 55, 60, 61, 62, 72, 73, 79, 80,
    86, 87, 90, 91, 98, 99, 116, 117, 118, 119, 120, 121, 124,
    130, 131, 134, 138, 139, 140, 141, 147, 148, 149, 151,
  ]),
  // TM21 Mega Drain — Grass/Bug/Poison types
  72: new Set([
    1, 2, 3, 12, 15, 43, 44, 45, 46, 47, 48, 49, 69, 70, 71,
    72, 73, 102, 103, 114, 140, 141, 151,
  ]),
  // TM24 Thunderbolt — Electric types and various others
  85: new Set([
    25, 26, 31, 34, 35, 36, 39, 40, 52, 53, 56, 57, 74, 75, 76,
    81, 82, 95, 100, 101, 108, 112, 113, 115, 120, 121, 122, 124,
    125, 128, 130, 131, 135, 137, 143, 145, 147, 148, 149, 150, 151,
  ]),
  // TM27 Fissure — Ground/Rock types and bulky Pokemon
  90: new Set([
    31, 34, 50, 51, 66, 67, 68, 74, 75, 76, 95,
    104, 105, 111, 112, 128, 143, 150, 151,
  ]),
  // TM28 Dig — Various Pokemon
  91: new Set([
    4, 5, 6, 27, 28, 29, 30, 31, 32, 33, 34, 46, 47, 50, 51,
    52, 53, 74, 75, 76, 95, 104, 105, 111, 112, 151,
  ]),
  // TM34 Bide — nearly every Pokemon can learn this
  117: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
    127, 128, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
    145, 146, 147, 148, 149, 150, 151,
  ]),
  // TM38 Fire Blast — Fire types and various others
  126: new Set([
    4, 5, 6, 31, 34, 35, 36, 39, 40, 52, 53, 56, 57, 58, 59,
    77, 78, 108, 112, 113, 115, 122, 126, 128, 130, 131,
    136, 143, 147, 148, 149, 150, 151,
  ]),
  // TM46 Psywave — Psychic types and select others
  149: new Set([
    12, 35, 36, 39, 40, 63, 64, 65, 79, 80, 96, 97,
    102, 103, 121, 122, 124, 150, 151,
  ]),
  // TM01 Mega Punch — Humanoid/punching Pokemon
  5: new Set([
    4, 5, 6, 7, 8, 9, 25, 26, 31, 34, 35, 36, 39, 40, 56, 57, 61, 62,
    63, 64, 65, 66, 67, 68, 74, 75, 76, 80, 94, 96, 97, 104, 105,
    106, 107, 108, 112, 113, 115, 122, 124, 125, 126, 143, 149, 150, 151,
  ]),
  // TM02 Razor Wind — Flying types and select others
  13: new Set([
    4, 5, 6, 12, 15, 16, 17, 18, 21, 22, 27, 28, 83, 84, 85,
    123, 127, 142, 143, 144, 145, 146, 149, 150, 151,
  ]),
  // TM03 Swords Dance — Blade/claw Pokemon
  14: new Set([
    4, 5, 6, 15, 27, 28, 47, 50, 51, 52, 53, 56, 57, 83, 98, 99,
    104, 105, 106, 107, 112, 123, 127, 141, 142, 149, 150, 151,
  ]),
  // TM04 Whirlwind — Flying types
  18: new Set([
    16, 17, 18, 21, 22, 41, 42, 83, 84, 85, 123,
    142, 144, 145, 146, 149, 151,
  ]),
  // TM05 Mega Kick — Similar to Mega Punch
  25: new Set([
    4, 5, 6, 7, 8, 9, 25, 26, 31, 34, 35, 36, 39, 40, 56, 57, 61, 62,
    66, 67, 68, 74, 75, 76, 80, 94, 96, 97, 104, 105,
    106, 107, 108, 112, 113, 115, 122, 124, 125, 126, 143, 149, 150, 151,
  ]),
  // TM07 Horn Drill — Horned/drilling Pokemon
  32: new Set([
    31, 32, 33, 34, 78, 86, 87, 95, 111, 112, 118, 119, 128, 143, 150, 151,
  ]),
  // TM08 Body Slam — Nearly universal
  34: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
    127, 128, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
    145, 146, 147, 148, 149, 150, 151,
  ]),
  // TM09 Take Down — Nearly universal
  36: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
    127, 128, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
    145, 146, 147, 148, 149, 150, 151,
  ]),
  // TM10 Double-Edge — Nearly universal
  38: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
    127, 128, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
    145, 146, 147, 148, 149, 150, 151,
  ]),
  // TM12 Water Gun — Water types and select others
  55: new Set([
    7, 8, 9, 54, 55, 60, 61, 62, 72, 73, 79, 80, 86, 87, 90, 91,
    98, 99, 116, 117, 118, 119, 120, 121, 130, 131, 134,
    138, 139, 140, 141, 147, 148, 149, 151,
  ]),
  // TM13 Ice Beam — Water/Ice types and versatile special attackers
  58: new Set([
    7, 8, 9, 25, 26, 31, 34, 35, 36, 39, 40, 54, 55, 60, 61, 62,
    72, 73, 79, 80, 86, 87, 90, 91, 98, 99, 108, 112, 113, 115,
    116, 117, 118, 119, 120, 121, 124, 128, 130, 131, 134,
    138, 139, 140, 141, 143, 144, 147, 148, 149, 150, 151,
  ]),
  // TM14 Blizzard — Same as Ice Beam
  59: new Set([
    7, 8, 9, 25, 26, 31, 34, 35, 36, 39, 40, 54, 55, 60, 61, 62,
    72, 73, 79, 80, 86, 87, 90, 91, 98, 99, 108, 112, 113, 115,
    116, 117, 118, 119, 120, 121, 124, 128, 130, 131, 134,
    138, 139, 140, 141, 143, 144, 147, 148, 149, 150, 151,
  ]),
  // TM15 Hyper Beam — Most fully-evolved Pokemon
  63: new Set([
    3, 6, 9, 12, 15, 18, 20, 22, 24, 26, 28, 31, 34, 36, 38, 40,
    42, 45, 47, 49, 51, 53, 55, 57, 59, 62, 65, 68, 71, 73, 76, 78,
    80, 82, 85, 87, 89, 91, 94, 95, 97, 99, 101, 103, 105, 108, 110,
    112, 113, 115, 117, 119, 121, 122, 123, 124, 125, 126, 127, 128,
    130, 131, 134, 135, 136, 137, 139, 141, 142, 143, 144, 145, 146,
    147, 148, 149, 150, 151,
  ]),
  // TM16 Pay Day — Very few Pokemon
  6: new Set([
    25, 26, 52, 53, 54, 55, 151,
  ]),
  // TM17 Submission — Fighting-compatible Pokemon
  66: new Set([
    4, 5, 6, 7, 8, 9, 26, 31, 34, 56, 57, 61, 62, 66, 67, 68,
    74, 75, 76, 80, 94, 104, 105, 106, 107, 108, 112, 113, 115,
    125, 126, 127, 128, 143, 149, 150, 151,
  ]),
  // TM18 Counter — Broad physical Pokemon
  68: new Set([
    4, 5, 6, 7, 8, 9, 12, 25, 26, 31, 34, 35, 36, 39, 40, 52, 53,
    56, 57, 61, 62, 63, 64, 65, 66, 67, 68, 74, 75, 76, 79, 80, 94,
    96, 97, 104, 105, 106, 107, 108, 112, 113, 115, 122, 124, 125,
    126, 128, 143, 149, 150, 151,
  ]),
  // TM19 Seismic Toss — Broad physical Pokemon
  69: new Set([
    4, 5, 6, 7, 8, 9, 25, 26, 27, 28, 31, 34, 35, 36, 39, 40, 52, 53,
    56, 57, 61, 62, 63, 64, 65, 66, 67, 68, 74, 75, 76, 79, 80, 94,
    96, 97, 104, 105, 106, 107, 108, 112, 113, 115, 122, 124, 125,
    126, 128, 143, 149, 150, 151,
  ]),
  // TM20 Rage — Nearly universal
  99: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
    127, 128, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
    145, 146, 147, 148, 149, 150, 151,
  ]),
  // TM22 Solar Beam — Grass types and special attackers
  76: new Set([
    1, 2, 3, 6, 12, 15, 31, 34, 35, 36, 39, 40, 43, 44, 45, 46, 47,
    48, 49, 69, 70, 71, 77, 78, 102, 103, 108, 113, 114, 115, 128,
    131, 143, 147, 148, 149, 150, 151,
  ]),
  // TM23 Dragon Rage — Dragon types and select others
  82: new Set([
    4, 5, 6, 7, 8, 9, 31, 34, 58, 59, 77, 78, 116, 117, 130, 131,
    142, 143, 147, 148, 149, 150, 151,
  ]),
  // TM25 Thunder — Electric types and versatile special attackers
  87: new Set([
    25, 26, 31, 34, 35, 36, 39, 40, 52, 53, 56, 57, 74, 75, 76,
    81, 82, 95, 100, 101, 108, 112, 113, 115, 120, 121, 122, 124,
    125, 128, 130, 131, 135, 137, 143, 145, 147, 148, 149, 150, 151,
  ]),
  // TM26 Earthquake — Ground/Rock types and heavy Pokemon
  89: new Set([
    4, 5, 6, 7, 8, 9, 27, 28, 31, 34, 50, 51, 56, 57, 66, 67, 68,
    74, 75, 76, 77, 78, 95, 104, 105, 106, 107, 108, 111, 112, 115,
    127, 128, 130, 131, 143, 149, 150, 151,
  ]),
  // TM29 Psychic — Psychic types and versatile special attackers
  94: new Set([
    1, 2, 3, 6, 12, 25, 26, 31, 34, 35, 36, 39, 40, 48, 49, 52, 53,
    54, 55, 63, 64, 65, 79, 80, 94, 96, 97, 100, 101, 102, 103, 108,
    113, 115, 120, 121, 122, 124, 125, 126, 128, 131, 143,
    147, 148, 149, 150, 151,
  ]),
  // TM30 Teleport — Psychic types
  100: new Set([
    63, 64, 65, 96, 97, 100, 101, 121, 122, 124, 150, 151,
  ]),
  // TM31 Mimic — Nearly universal
  102: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
    127, 128, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
    145, 146, 147, 148, 149, 150, 151,
  ]),
  // TM32 Double Team — Nearly universal
  104: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
    127, 128, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
    145, 146, 147, 148, 149, 150, 151,
  ]),
  // TM33 Reflect — Nearly universal
  115: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
    127, 128, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
    145, 146, 147, 148, 149, 150, 151,
  ]),
  // TM35 Metronome — Select Pokemon
  118: new Set([
    35, 36, 39, 40, 63, 64, 65, 79, 80, 94, 96, 97,
    102, 103, 113, 120, 121, 122, 124, 143, 150, 151,
  ]),
  // TM36 Self-Destruct — Rock/Poison/Electrode types
  120: new Set([
    74, 75, 76, 81, 82, 88, 89, 100, 101, 102, 103, 109, 110, 143, 150, 151,
  ]),
  // TM37 Egg Bomb — Egg-related and select Pokemon
  121: new Set([
    102, 103, 113, 115, 128, 143, 151,
  ]),
  // TM39 Swift — Nearly universal
  129: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
    127, 128, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
    145, 146, 147, 148, 149, 150, 151,
  ]),
  // TM40 Skull Bash — Nearly universal
  130: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
    127, 128, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
    145, 146, 147, 148, 149, 150, 151,
  ]),
  // TM41 Softboiled — Chansey and Mew only
  135: new Set([
    113, 151,
  ]),
  // TM42 Dream Eater — Psychic/Ghost types
  138: new Set([
    12, 35, 36, 39, 40, 48, 49, 63, 64, 65, 79, 80,
    92, 93, 94, 96, 97, 102, 103, 121, 122, 124, 150, 151,
  ]),
  // TM43 Sky Attack — Flying types
  143: new Set([
    16, 17, 18, 21, 22, 83, 84, 85, 123, 142, 144, 145, 146, 149, 151,
  ]),
  // TM44 Rest — Nearly universal
  156: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
    127, 128, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
    145, 146, 147, 148, 149, 150, 151,
  ]),
  // TM45 Thunder Wave — Electric and Psychic types
  86: new Set([
    25, 26, 35, 36, 39, 40, 63, 64, 65, 79, 80, 81, 82,
    96, 97, 100, 101, 113, 120, 121, 122, 124, 125, 137,
    143, 145, 147, 148, 149, 150, 151,
  ]),
  // TM47 Explosion — Rock/Poison/Electrode types
  153: new Set([
    74, 75, 76, 81, 82, 88, 89, 100, 101, 102, 103, 109, 110, 143, 150, 151,
  ]),
  // TM48 Rock Slide — Rock/Ground and fighting types
  157: new Set([
    4, 5, 6, 27, 28, 31, 34, 50, 51, 56, 57, 66, 67, 68, 74, 75, 76,
    77, 78, 95, 104, 105, 106, 107, 108, 111, 112, 115, 127, 128,
    142, 143, 149, 150, 151,
  ]),
  // TM49 Tri Attack — Normal and versatile Pokemon
  161: new Set([
    12, 35, 36, 39, 40, 81, 82, 84, 85, 100, 101, 113,
    120, 121, 122, 124, 128, 131, 137, 143, 149, 150, 151,
  ]),
  // TM50 Substitute — Nearly universal
  164: new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
    127, 128, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
    145, 146, 147, 148, 149, 150, 151,
  ]),
};
