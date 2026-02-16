export interface EliteFourMember {
  id: string;
  name: string;
  title: string;
  team: Array<{ speciesId: number; level: number }>;
  prizeMoney: number;
  dialogue: {
    before: string[];
    after: string[];
  };
}

export const ELITE_FOUR: EliteFourMember[] = [
  {
    id: 'lorelei',
    name: 'LORELEI',
    title: 'ELITE FOUR',
    team: [
      { speciesId: 87, level: 54 },  // Dewgong
      { speciesId: 91, level: 53 },  // Cloyster
      { speciesId: 80, level: 54 },  // Slowbro
      { speciesId: 124, level: 56 }, // Jynx
      { speciesId: 131, level: 56 }, // Lapras
    ],
    prizeMoney: 5544,
    dialogue: {
      before: [
        'LORELEI: Welcome to\nthe POKeMON LEAGUE!',
        "I'm LORELEI of the\nELITE FOUR!",
        'No one can best me\nwhen it comes to',
        "icy POKeMON!\nFreeze to the bone!",
      ],
      after: [
        "You're better than\nI thought!",
        'Go on ahead! You\ncan do it!',
      ],
    },
  },
  {
    id: 'bruno',
    name: 'BRUNO',
    title: 'ELITE FOUR',
    team: [
      { speciesId: 95, level: 53 },  // Onix
      { speciesId: 107, level: 55 }, // Hitmonchan
      { speciesId: 106, level: 55 }, // Hitmonlee
      { speciesId: 95, level: 56 },  // Onix
      { speciesId: 68, level: 58 },  // Machamp
    ],
    prizeMoney: 5742,
    dialogue: {
      before: [
        "BRUNO: I'm BRUNO of\nthe ELITE FOUR!",
        'Through rigorous\ntraining, people and',
        'POKeMON can become\nstronger!',
        "Let me demonstrate\nmy power!",
      ],
      after: [
        'My fighting POKeMON\nlost to you?!',
        "You're worthy of\nmoving on!",
      ],
    },
  },
  {
    id: 'agatha',
    name: 'AGATHA',
    title: 'ELITE FOUR',
    team: [
      { speciesId: 94, level: 56 },  // Gengar
      { speciesId: 42, level: 56 },  // Golbat
      { speciesId: 93, level: 55 },  // Haunter
      { speciesId: 24, level: 58 },  // Arbok
      { speciesId: 94, level: 60 },  // Gengar
    ],
    prizeMoney: 5940,
    dialogue: {
      before: [
        "AGATHA: I'm AGATHA\nof the ELITE FOUR!",
        "OAK and I were once\nrivals... but that's",
        'ancient history!',
        'Now prepare to lose\nto my GHOST POKeMON!',
      ],
      after: [
        "You win! I see what\nOAK sees in you!",
        "Go face LANCE!\nYou'll need all your",
        'strength!',
      ],
    },
  },
  {
    id: 'lance',
    name: 'LANCE',
    title: 'ELITE FOUR',
    team: [
      { speciesId: 130, level: 58 }, // Gyarados
      { speciesId: 148, level: 56 }, // Dragonair
      { speciesId: 148, level: 56 }, // Dragonair
      { speciesId: 142, level: 60 }, // Aerodactyl
      { speciesId: 149, level: 62 }, // Dragonite
    ],
    prizeMoney: 6138,
    dialogue: {
      before: [
        "LANCE: I'm LANCE,",
        'the last of the\nELITE FOUR!',
        'I trained with\nDRAGON POKeMON!',
        "You know that\nDRAGON POKeMON are",
        "mythical! They're\nhard to catch and",
        "hard to raise!\nPrepare to battle!",
      ],
      after: [
        "I still can't\nbelieve my dragons",
        'lost to you!',
        "You're the new\nCHAMPION... or",
        'will be, once you\nbeat one more trainer!',
      ],
    },
  },
];

export const CHAMPION = {
  id: 'champion_rival',
  name: 'CHAMPION {RIVAL}',
  title: 'POKeMON CHAMPION',
  team: [
    { speciesId: 18, level: 61 },  // Pidgeot
    { speciesId: 65, level: 59 },  // Alakazam
    { speciesId: 112, level: 61 }, // Rhydon
    { speciesId: 59, level: 63 },  // Arcanine
    { speciesId: 103, level: 61 }, // Exeggutor
    { speciesId: 130, level: 65 }, // Gyarados (sub for Eevolution)
  ],
  prizeMoney: 6435,
  dialogue: {
    before: [
      "{RIVAL}: Hey! I was\nwaiting for you!",
      "My POKeMON and I\nhave grown stronger!",
      "I'm the POKeMON\nLEAGUE CHAMPION!",
      "Do you know what\nthat means?",
      "I'll tell you!\nI'm the most powerful",
      "trainer in the world!",
    ],
    after: [
      "NO! That can't be!\nYou beat my best!",
      "After all that work\nto become CHAMPION...",
      "It's over...\nI lost...",
    ],
  },
};

export const HALL_OF_FAME_TEXT = [
  'Congratulations!',
  'You are now the\nPOKeMON LEAGUE',
  'CHAMPION!',
  'Your journey through\nKANTO has been',
  'truly remarkable!',
  'Your POKeMON have\nbeen entered into',
  'the HALL OF FAME!',
  'Thank you for\nplaying!',
  'THE END',
];
