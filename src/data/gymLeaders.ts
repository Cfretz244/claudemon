export interface GymLeaderData {
  id: string;
  name: string;
  badge: string;
  type: string;
  team: Array<{ speciesId: number; level: number }>;
  prizeMoney: number;
  tmReward?: string;
  dialogue: {
    before: string[];
    after: string[];
  };
}

export const GYM_LEADERS: Record<string, GymLeaderData> = {
  brock: {
    id: 'brock',
    name: 'BROCK',
    badge: 'BOULDER',
    type: 'ROCK',
    team: [
      { speciesId: 74, level: 10 },  // Geodude
      { speciesId: 95, level: 12 },  // Onix
    ],
    prizeMoney: 1386,
    dialogue: {
      before: [
        "BROCK: I'm BROCK!",
        "I'm PEWTER's GYM\nLEADER!",
        "My rock-hard willpower\nis evident in my",
        "POKeMON! Let's battle!",
      ],
      after: [
        'BROCK: I took you for\ngranted.',
        "As proof of your\nvictory, here's the",
        'BOULDER BADGE!',
      ],
    },
  },
  misty: {
    id: 'misty',
    name: 'MISTY',
    badge: 'CASCADE',
    type: 'WATER',
    team: [
      { speciesId: 120, level: 18 }, // Staryu
      { speciesId: 121, level: 21 }, // Starmie
    ],
    prizeMoney: 2079,
    dialogue: {
      before: [
        "MISTY: I'm MISTY,",
        "leader of CERULEAN\nGYM!",
        "My policy is an\nall-out offensive!",
      ],
      after: [
        "You've earned the\nCASCADE BADGE!",
      ],
    },
  },
  lt_surge: {
    id: 'lt_surge',
    name: 'LT. SURGE',
    badge: 'THUNDER',
    type: 'ELECTRIC',
    team: [
      { speciesId: 100, level: 21 }, // Voltorb
      { speciesId: 25, level: 18 },  // Pikachu
      { speciesId: 26, level: 24 },  // Raichu
    ],
    prizeMoney: 2376,
    dialogue: {
      before: [
        "LT. SURGE: Hey kid!",
        "What do you think\nyou're doing here?",
        "Electric POKeMON\nsaved me during the",
        "war! I'll show you\ntheir power!",
      ],
      after: [
        "Now that's a shocker!",
        "Take the THUNDER\nBADGE!",
      ],
    },
  },
  erika: {
    id: 'erika',
    name: 'ERIKA',
    badge: 'RAINBOW',
    type: 'GRASS',
    team: [
      { speciesId: 114, level: 30 }, // Tangela
      { speciesId: 44, level: 32 },  // Gloom (sub for Weepinbell)
      { speciesId: 3, level: 32 },   // Venusaur (sub for Vileplume)
    ],
    prizeMoney: 3168,
    dialogue: {
      before: [
        'ERIKA: Hello...',
        "I'm ERIKA, the GYM\nLEADER here.",
        "I teach the art of\nflower arranging...",
        "Oh wait, POKeMON\nbattles? Fine...",
      ],
      after: [
        "Oh... You're\nremarkably strong.",
        "Take the RAINBOW\nBADGE.",
      ],
    },
  },
  koga: {
    id: 'koga',
    name: 'KOGA',
    badge: 'SOUL',
    type: 'POISON',
    team: [
      { speciesId: 109, level: 37 }, // Koffing
      { speciesId: 89, level: 39 },  // Muk
      { speciesId: 109, level: 37 }, // Koffing
      { speciesId: 110, level: 43 }, // Weezing
    ],
    prizeMoney: 4257,
    dialogue: {
      before: [
        "KOGA: Fwahahaha!",
        'A mere child dares\nchallenge me?',
        "Very well, I shall\nshow you true terror!",
      ],
      after: [
        "Humph! You have\nproven your worth!",
        "Take the SOUL BADGE!",
      ],
    },
  },
  sabrina: {
    id: 'sabrina',
    name: 'SABRINA',
    badge: 'MARSH',
    type: 'PSYCHIC',
    team: [
      { speciesId: 64, level: 38 },  // Kadabra
      { speciesId: 122, level: 37 }, // Mr. Mime
      { speciesId: 49, level: 38 },  // Venomoth (sub)
      { speciesId: 65, level: 43 },  // Alakazam
    ],
    prizeMoney: 4257,
    dialogue: {
      before: [
        'SABRINA: I knew you\nwould come.',
        "I can read your mind.\nYou're afraid.",
        "Let me show you\nmy powers!",
      ],
      after: [
        "I'm shocked! You've\noverpowered me!",
        "Take the MARSH BADGE.",
      ],
    },
  },
  blaine: {
    id: 'blaine',
    name: 'BLAINE',
    badge: 'VOLCANO',
    type: 'FIRE',
    team: [
      { speciesId: 58, level: 42 },  // Growlithe
      { speciesId: 77, level: 40 },  // Ponyta
      { speciesId: 78, level: 42 },  // Rapidash
      { speciesId: 59, level: 47 },  // Arcanine
    ],
    prizeMoney: 4653,
    dialogue: {
      before: [
        "BLAINE: Hah! I'm\nBLAINE, the hot-",
        "headed quiz master!",
        "Show me your fire\npower!",
      ],
      after: [
        "You've beaten me!\nTake the VOLCANO",
        "BADGE!",
      ],
    },
  },
  giovanni: {
    id: 'giovanni',
    name: 'GIOVANNI',
    badge: 'EARTH',
    type: 'GROUND',
    team: [
      { speciesId: 111, level: 45 }, // Rhyhorn
      { speciesId: 51, level: 42 },  // Dugtrio
      { speciesId: 31, level: 44 },  // Nidoqueen
      { speciesId: 34, level: 45 },  // Nidoking
      { speciesId: 112, level: 50 }, // Rhydon
    ],
    prizeMoney: 4950,
    dialogue: {
      before: [
        "GIOVANNI: So! You've\ncome this far!",
        "Let me show you the\npower of TEAM ROCKET's",
        "boss!",
      ],
      after: [
        "Ha! That was a\nsplendid battle!",
        "Take the EARTH BADGE!",
        "This is proof of\nyour mastery!",
      ],
    },
  },
};
