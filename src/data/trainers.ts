export interface TrainerData {
  id: string;
  name: string;
  class: string;
  team: Array<{ speciesId: number; level: number }>;
  prizeMoney: number;
  dialogue: {
    before: string[];
    after: string[];
  };
}

export const TRAINERS: Record<string, TrainerData> = {
  // Viridian Forest
  forest_trainer1: {
    id: 'forest_trainer1',
    name: 'BUG CATCHER RICK',
    class: 'Bug Catcher',
    team: [
      { speciesId: 13, level: 6 }, // Weedle
      { speciesId: 10, level: 6 }, // Caterpie
    ],
    prizeMoney: 60,
    dialogue: {
      before: ['BUG CATCHER: Hey!\nYou have POKeMON!', "Come on, let's battle!"],
      after: ['Wow, you beat my\nbug POKeMON!'],
    },
  },
  forest_trainer2: {
    id: 'forest_trainer2',
    name: 'BUG CATCHER DOUG',
    class: 'Bug Catcher',
    team: [
      { speciesId: 13, level: 7 }, // Weedle
      { speciesId: 14, level: 7 }, // Kakuna
      { speciesId: 10, level: 7 }, // Caterpie
    ],
    prizeMoney: 70,
    dialogue: {
      before: ['BUG CATCHER: I just\ncaught a CATERPIE!', "Isn't it cute?"],
      after: ['My bugs need more\ntraining...'],
    },
  },

  forest_trainer3: {
    id: 'forest_trainer3',
    name: 'BUG CATCHER SAM',
    class: 'Bug Catcher',
    team: [
      { speciesId: 13, level: 5 }, // Weedle
      { speciesId: 10, level: 5 }, // Caterpie
    ],
    prizeMoney: 50,
    dialogue: {
      before: ['BUG CATCHER: Did you\nget lost in here too?', "Let's battle to pass\nthe time!"],
      after: ['I really am lost\nthough...'],
    },
  },
  forest_trainer4: {
    id: 'forest_trainer4',
    name: 'BUG CATCHER CHARLIE',
    class: 'Bug Catcher',
    team: [
      { speciesId: 11, level: 6 }, // Metapod
      { speciesId: 10, level: 6 }, // Caterpie
      { speciesId: 11, level: 6 }, // Metapod
    ],
    prizeMoney: 60,
    dialogue: {
      before: ['BUG CATCHER: These\nwoods are full of', 'bug POKeMON!'],
      after: ['Your POKeMON are\ntougher than bugs!'],
    },
  },
  forest_trainer5: {
    id: 'forest_trainer5',
    name: 'LASS JANICE',
    class: 'Lass',
    team: [
      { speciesId: 16, level: 6 }, // Pidgey
      { speciesId: 43, level: 6 }, // Oddish
    ],
    prizeMoney: 96,
    dialogue: {
      before: ['LASS: This forest is\nso pretty!', "But I won't let you\npass without a battle!"],
      after: ['You ruined my walk\nthrough the forest!'],
    },
  },
  forest_trainer6: {
    id: 'forest_trainer6',
    name: 'BUG CATCHER GREG',
    class: 'Bug Catcher',
    team: [
      { speciesId: 13, level: 7 }, // Weedle
      { speciesId: 14, level: 7 }, // Kakuna
    ],
    prizeMoney: 70,
    dialogue: {
      before: ['BUG CATCHER: I found\na PIKACHU in here!', "They're super rare!"],
      after: ['I should catch more\nPIKACHU...'],
    },
  },

  // Route 3
  route3_trainer1: {
    id: 'route3_trainer1',
    name: 'YOUNGSTER BEN',
    class: 'Youngster',
    team: [
      { speciesId: 19, level: 9 },  // Rattata
      { speciesId: 21, level: 9 },  // Spearow
    ],
    prizeMoney: 144,
    dialogue: {
      before: ['YOUNGSTER: I just\nlost to BROCK!', 'I need to train\nharder!'],
      after: ['I lost again...'],
    },
  },
  route3_trainer2: {
    id: 'route3_trainer2',
    name: 'BUG CATCHER COLTON',
    class: 'Bug Catcher',
    team: [
      { speciesId: 10, level: 10 }, // Caterpie
      { speciesId: 13, level: 10 }, // Weedle
      { speciesId: 10, level: 10 }, // Caterpie
    ],
    prizeMoney: 100,
    dialogue: {
      before: ['BUG CATCHER: Go, my\nbugs! Get him!'],
      after: ["My bugs aren't\nstrong enough yet..."],
    },
  },
  route3_trainer3: {
    id: 'route3_trainer3',
    name: 'LASS JANICE',
    class: 'Lass',
    team: [
      { speciesId: 16, level: 9 },  // Pidgey
      { speciesId: 29, level: 9 },  // Nidoran F
    ],
    prizeMoney: 144,
    dialogue: {
      before: ['LASS: I just caught\na new POKeMON!', "Let me try it\nout on you!"],
      after: ['Oh no! My precious\nPOKeMON!'],
    },
  },
  route3_trainer4: {
    id: 'route3_trainer4',
    name: 'BUG CATCHER GREG',
    class: 'Bug Catcher',
    team: [
      { speciesId: 13, level: 9 },  // Weedle
      { speciesId: 14, level: 9 },  // Kakuna
      { speciesId: 10, level: 9 },  // Caterpie
    ],
    prizeMoney: 90,
    dialogue: {
      before: ["BUG CATCHER: Heh!\nAre you scared of", 'bugs? You should be!'],
      after: ['I need better bugs.'],
    },
  },
  route3_trainer5: {
    id: 'route3_trainer5',
    name: 'YOUNGSTER CALVIN',
    class: 'Youngster',
    team: [
      { speciesId: 21, level: 14 }, // Spearow
    ],
    prizeMoney: 224,
    dialogue: {
      before: ['YOUNGSTER: My\nSPEAROW is the best!', "There's no way\nyou can beat it!"],
      after: ['My SPEAROW lost?\nNo way!'],
    },
  },
  route3_trainer6: {
    id: 'route3_trainer6',
    name: 'BUG CATCHER JAMES',
    class: 'Bug Catcher',
    team: [
      { speciesId: 10, level: 9 },  // Caterpie
      { speciesId: 10, level: 9 },  // Caterpie
      { speciesId: 11, level: 10 }, // Metapod
    ],
    prizeMoney: 100,
    dialogue: {
      before: ["BUG CATCHER: I'm\nraising CATERPIE", "to be a mighty\nBUTTERFREE!"],
      after: ["I haven't raised\nthem enough..."],
    },
  },
  route3_trainer7: {
    id: 'route3_trainer7',
    name: 'LASS SALLY',
    class: 'Lass',
    team: [
      { speciesId: 19, level: 10 }, // Rattata
      { speciesId: 29, level: 10 }, // Nidoran F
    ],
    prizeMoney: 160,
    dialogue: {
      before: ['LASS: You look like\na new trainer!', "I'll go easy on you!"],
      after: ["You're not bad\nat all!"],
    },
  },
  route3_trainer8: {
    id: 'route3_trainer8',
    name: 'BUG CATCHER ROBBY',
    class: 'Bug Catcher',
    team: [
      { speciesId: 13, level: 10 }, // Weedle
      { speciesId: 10, level: 10 }, // Caterpie
    ],
    prizeMoney: 100,
    dialogue: {
      before: ["BUG CATCHER: Bugs\nare the best", "POKeMON! I'll prove\nit to you!"],
      after: ['Maybe bugs need\nmore work...'],
    },
  },

  // Pewter Gym
  pewter_gym_trainer: {
    id: 'pewter_gym_trainer',
    name: 'CAMPER LIAM',
    class: 'Camper',
    team: [
      { speciesId: 74, level: 9 }, // Geodude
    ],
    prizeMoney: 180,
    dialogue: {
      before: ["Stop right there!\nYou're light years", "away from facing\nBROCK!"],
      after: ["You're pretty good!\nGo ahead!"],
    },
  },

  // Mt. Moon 1F
  mt_moon_bug_catcher: {
    id: 'mt_moon_bug_catcher',
    name: 'BUG CATCHER KENT',
    class: 'Bug Catcher',
    team: [
      { speciesId: 13, level: 11 }, // Weedle
      { speciesId: 14, level: 11 }, // Kakuna
    ],
    prizeMoney: 110,
    dialogue: {
      before: ['BUG CATCHER: Even\ncaves have bugs!'],
      after: ['My bugs hate caves\ntoo...'],
    },
  },
  mt_moon_lass: {
    id: 'mt_moon_lass',
    name: 'LASS IRIS',
    class: 'Lass',
    team: [
      { speciesId: 35, level: 11 }, // Clefairy
      { speciesId: 29, level: 11 }, // Nidoran F
    ],
    prizeMoney: 176,
    dialogue: {
      before: ["LASS: I'm looking for\nCLEFAIRY!"],
      after: ['I caught one already\nthough...'],
    },
  },
  mt_moon_rocket1: {
    id: 'mt_moon_rocket1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 27, level: 11 }, // Sandshrew
      { speciesId: 19, level: 11 }, // Rattata
    ],
    prizeMoney: 352,
    dialogue: {
      before: ['ROCKET: Get out!\nThis cave belongs to\nTEAM ROCKET!'],
      after: ['You win this time!'],
    },
  },
  mt_moon_hiker: {
    id: 'mt_moon_hiker',
    name: 'HIKER MARCOS',
    class: 'Hiker',
    team: [
      { speciesId: 74, level: 10 }, // Geodude
      { speciesId: 74, level: 10 }, // Geodude
      { speciesId: 95, level: 11 }, // Onix
    ],
    prizeMoney: 396,
    dialogue: {
      before: ['HIKER: I love these\nunderground trails!'],
      after: ['These trails beat me\ndown...'],
    },
  },
  // Mt. Moon B1F
  mt_moon_rocket2: {
    id: 'mt_moon_rocket2',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 41, level: 11 }, // Zubat
      { speciesId: 41, level: 11 }, // Zubat
    ],
    prizeMoney: 352,
    dialogue: {
      before: ['ROCKET: We need these\nfossils for the boss!'],
      after: ['The boss will be\nfurious!'],
    },
  },
  mt_moon_super_nerd: {
    id: 'mt_moon_super_nerd',
    name: 'SUPER NERD MIGUEL',
    class: 'Super Nerd',
    team: [
      { speciesId: 81, level: 11 }, // Magnemite
      { speciesId: 100, level: 11 }, // Voltorb
    ],
    prizeMoney: 264,
    dialogue: {
      before: ['SUPER NERD: I study\nfossils in this cave!'],
      after: ['Back to studying...'],
    },
  },
  mt_moon_rocket3: {
    id: 'mt_moon_rocket3',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 19, level: 11 }, // Rattata
      { speciesId: 41, level: 11 }, // Zubat
    ],
    prizeMoney: 352,
    dialogue: {
      before: ['ROCKET: No one gets\npast me!'],
      after: ['How did I lose?!'],
    },
  },
  // Mt. Moon B2F
  mt_moon_rocket4: {
    id: 'mt_moon_rocket4',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 20, level: 12 }, // Raticate
      { speciesId: 41, level: 12 }, // Zubat
    ],
    prizeMoney: 384,
    dialogue: {
      before: ['ROCKET: The fossils\nare ours!'],
      after: ['Fine, take your\nstupid fossils!'],
    },
  },
  mt_moon_rocket5: {
    id: 'mt_moon_rocket5',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 23, level: 12 }, // Ekans
      { speciesId: 27, level: 12 }, // Sandshrew
    ],
    prizeMoney: 384,
    dialogue: {
      before: ['ROCKET: Scram, kid!\nThis is ROCKET turf!'],
      after: ["TEAM ROCKET won't\nforget this!"],
    },
  },
  mt_moon_fossil_nerd: {
    id: 'mt_moon_fossil_nerd',
    name: 'SUPER NERD MIGUEL',
    class: 'Super Nerd',
    team: [
      { speciesId: 88, level: 12 }, // Grimer
      { speciesId: 100, level: 12 }, // Voltorb
      { speciesId: 109, level: 12 }, // Koffing
    ],
    prizeMoney: 288,
    dialogue: {
      before: ['SUPER NERD: Hands off\nmy fossils!', "I found them first!\nThey're mine!"],
      after: ["OK, OK! You can have\none fossil!", "But I get the other!"],
    },
  },

  // Route 4
  route4_trainer1: {
    id: 'route4_trainer1',
    name: 'LASS CRISSY',
    class: 'Lass',
    team: [
      { speciesId: 29, level: 10 }, // Nidoran F
      { speciesId: 32, level: 10 }, // Nidoran M
    ],
    prizeMoney: 160,
    dialogue: {
      before: ['LASS: Are you from\nMT. MOON too?'],
      after: ['You did great!'],
    },
  },

  // Cerulean Gym
  cerulean_gym_trainer: {
    id: 'cerulean_gym_trainer',
    name: 'SWIMMER DIANA',
    class: 'Swimmer',
    team: [
      { speciesId: 118, level: 16 }, // Goldeen
      { speciesId: 90, level: 16 },  // Shellder
    ],
    prizeMoney: 320,
    dialogue: {
      before: ['SWIMMER: The water\nis lovely here!'],
      after: ['I should swim more\nand battle less...'],
    },
  },

  // Nugget Bridge (Route 24)
  nugget1: {
    id: 'nugget1',
    name: 'BUG CATCHER CALE',
    class: 'Bug Catcher',
    team: [
      { speciesId: 10, level: 10 }, // Caterpie
      { speciesId: 11, level: 10 }, // Metapod
    ],
    prizeMoney: 100,
    dialogue: {
      before: ['Welcome to NUGGET\nBRIDGE!'],
      after: ['Good start!'],
    },
  },
  nugget2: {
    id: 'nugget2',
    name: 'LASS ALI',
    class: 'Lass',
    team: [
      { speciesId: 16, level: 12 }, // Pidgey
      { speciesId: 43, level: 12 }, // Oddish
    ],
    prizeMoney: 192,
    dialogue: {
      before: ['LASS: Ready to lose?'],
      after: ['Impossible!'],
    },
  },
  nugget3: {
    id: 'nugget3',
    name: 'YOUNGSTER TIMMY',
    class: 'Youngster',
    team: [
      { speciesId: 27, level: 12 }, // Sandshrew
      { speciesId: 23, level: 12 }, // Ekans
    ],
    prizeMoney: 192,
    dialogue: {
      before: ['Think you can pass\nall 5 trainers?'],
      after: ['Keep going!'],
    },
  },
  nugget4: {
    id: 'nugget4',
    name: 'LASS RELI',
    class: 'Lass',
    team: [
      { speciesId: 29, level: 13 }, // Nidoran F
      { speciesId: 32, level: 13 }, // Nidoran M
    ],
    prizeMoney: 208,
    dialogue: {
      before: ["You won't beat me!"],
      after: ['Rats!'],
    },
  },
  nugget5: {
    id: 'nugget5',
    name: 'JR. TRAINER ETHAN',
    class: 'Jr. Trainer',
    team: [
      { speciesId: 56, level: 14 }, // Mankey
      { speciesId: 52, level: 14 }, // Meowth
    ],
    prizeMoney: 280,
    dialogue: {
      before: ["You're the 5th winner!\nGreat job!"],
      after: ['Congratulations!'],
    },
  },
  nugget_rocket: {
    id: 'nugget_rocket',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 23, level: 15 }, // Ekans
      { speciesId: 41, level: 15 }, // Zubat
    ],
    prizeMoney: 600,
    dialogue: {
      before: ['ROCKET: You beat all\n5 trainers! Great!', 'Want to join TEAM\nROCKET? ...No? Fine!'],
      after: ['TEAM ROCKET will\nremember this!'],
    },
  },

  // Route 25
  route25_trainer1: {
    id: 'route25_trainer1',
    name: 'HIKER FRANKLIN',
    class: 'Hiker',
    team: [
      { speciesId: 74, level: 15 }, // Geodude
      { speciesId: 74, level: 15 }, // Geodude
      { speciesId: 95, level: 15 }, // Onix
    ],
    prizeMoney: 540,
    dialogue: {
      before: ['HIKER: These rocks\nare amazing!'],
      after: ['My rocks crumbled!'],
    },
  },
  route25_trainer2: {
    id: 'route25_trainer2',
    name: 'YOUNGSTER CHAD',
    class: 'Youngster',
    team: [
      { speciesId: 23, level: 14 }, // Ekans
      { speciesId: 27, level: 14 }, // Sandshrew
    ],
    prizeMoney: 224,
    dialogue: {
      before: ['Are you visiting BILL\ntoo?'],
      after: ['BILL is really cool!'],
    },
  },

  route25_trainer3: {
    id: 'route25_trainer3',
    name: 'LASS HALEY',
    class: 'Lass',
    team: [
      { speciesId: 29, level: 15 }, // Nidoran F
      { speciesId: 30, level: 15 }, // Nidorina
    ],
    prizeMoney: 240,
    dialogue: {
      before: ['I wonder what BILL\nis working on...'],
      after: ['Maybe BILL will show\nme his research.'],
    },
  },

  // Route 5
  route5_trainer1: {
    id: 'route5_trainer1',
    name: 'JR. TRAINER KATE',
    class: 'Jr. Trainer',
    team: [
      { speciesId: 43, level: 16 }, // Oddish
      { speciesId: 69, level: 16 }, // Bellsprout
    ],
    prizeMoney: 320,
    dialogue: {
      before: ['JR. TRAINER: I love\ntraining outdoors!'],
      after: ['You train well too!'],
    },
  },
  route5_trainer2: {
    id: 'route5_trainer2',
    name: 'CAMPER DREW',
    class: 'Camper',
    team: [
      { speciesId: 21, level: 18 }, // Spearow
    ],
    prizeMoney: 360,
    dialogue: {
      before: ['CAMPER: The view from\nhere is great!'],
      after: ['I was distracted...'],
    },
  },

  // Route 6
  route6_trainer1: {
    id: 'route6_trainer1',
    name: 'BUG CATCHER ELIJAH',
    class: 'Bug Catcher',
    team: [
      { speciesId: 12, level: 16 }, // Butterfree
      { speciesId: 15, level: 16 }, // Beedrill
    ],
    prizeMoney: 160,
    dialogue: {
      before: ['BUG CATCHER: My bugs\nhave evolved!'],
      after: ['Evolution wasn\'t\nenough...'],
    },
  },
  route6_trainer2: {
    id: 'route6_trainer2',
    name: 'JR. TRAINER RAINA',
    class: 'Jr. Trainer',
    team: [
      { speciesId: 19, level: 16 }, // Rattata
      { speciesId: 25, level: 16 }, // Pikachu
    ],
    prizeMoney: 320,
    dialogue: {
      before: ['Almost to VERMILION!'],
      after: ['Have fun in VERMILION!'],
    },
  },

  // Vermilion Gym
  vermilion_gym_trainer: {
    id: 'vermilion_gym_trainer',
    name: 'SAILOR DWAYNE',
    class: 'Sailor',
    team: [
      { speciesId: 25, level: 21 }, // Pikachu
      { speciesId: 25, level: 21 }, // Pikachu
    ],
    prizeMoney: 672,
    dialogue: {
      before: ['SAILOR: LT. SURGE is\nthe real deal!'],
      after: ['Electrifying loss!'],
    },
  },

  // Route 9
  route9_trainer1: {
    id: 'route9_trainer1',
    name: 'HIKER ALAN',
    class: 'Hiker',
    team: [
      { speciesId: 74, level: 20 }, // Geodude
      { speciesId: 95, level: 20 }, // Onix
    ],
    prizeMoney: 720,
    dialogue: {
      before: ['HIKER: Watch out for\nROCK TUNNEL ahead!'],
      after: ['Take care in there!'],
    },
  },
  route9_trainer2: {
    id: 'route9_trainer2',
    name: 'JR. TRAINER YUKI',
    class: 'Jr. Trainer',
    team: [
      { speciesId: 43, level: 19 }, // Oddish
      { speciesId: 69, level: 19 }, // Bellsprout
      { speciesId: 63, level: 19 }, // Abra
    ],
    prizeMoney: 380,
    dialogue: {
      before: ['The path east is\ntreacherous!'],
      after: ['Be careful!'],
    },
  },

  // Rock Tunnel
  rock_tunnel_trainer1: {
    id: 'rock_tunnel_trainer1',
    name: 'HIKER LENNY',
    class: 'Hiker',
    team: [
      { speciesId: 74, level: 19 }, // Geodude
      { speciesId: 66, level: 19 }, // Machop
      { speciesId: 74, level: 19 }, // Geodude
    ],
    prizeMoney: 684,
    dialogue: {
      before: ["It's dark in here!"],
      after: ['I need a flashlight...'],
    },
  },
  rock_tunnel_trainer2: {
    id: 'rock_tunnel_trainer2',
    name: 'POKEMANIAC STEVE',
    class: 'Pokemaniac',
    team: [
      { speciesId: 104, level: 20 }, // Cubone
      { speciesId: 79, level: 20 },  // Slowpoke
    ],
    prizeMoney: 960,
    dialogue: {
      before: ['POKEMANIAC: I collect\nrare POKeMON!'],
      after: ['Your POKeMON are\nrare too!'],
    },
  },
  rock_tunnel_trainer3: {
    id: 'rock_tunnel_trainer3',
    name: 'HIKER OLIVER',
    class: 'Hiker',
    team: [
      { speciesId: 74, level: 20 }, // Geodude
      { speciesId: 95, level: 21 }, // Onix
    ],
    prizeMoney: 756,
    dialogue: {
      before: ['Almost through\nthe tunnel!'],
      after: ['Good luck finding\nthe exit!'],
    },
  },

  // Pokemon Tower
  tower_trainer1: {
    id: 'tower_trainer1',
    name: 'CHANNELER HOPE',
    class: 'Channeler',
    team: [
      { speciesId: 92, level: 22 }, // Gastly
      { speciesId: 92, level: 22 }, // Gastly
      { speciesId: 93, level: 22 }, // Haunter
    ],
    prizeMoney: 704,
    dialogue: {
      before: ['CHANNELER: Be\ngone... intruder...'],
      after: ['The spirits are\nrestless...'],
    },
  },
  tower_trainer2: {
    id: 'tower_trainer2',
    name: 'CHANNELER PATRICIA',
    class: 'Channeler',
    team: [
      { speciesId: 92, level: 24 }, // Gastly
      { speciesId: 93, level: 24 }, // Haunter
    ],
    prizeMoney: 768,
    dialogue: {
      before: ['Kyaaaa! Get out!'],
      after: ['The ghosts are\ncalm now...'],
    },
  },

  // Route 8
  route8_trainer1: {
    id: 'route8_trainer1',
    name: 'GAMBLER DIRK',
    class: 'Gambler',
    team: [
      { speciesId: 100, level: 22 }, // Voltorb
      { speciesId: 100, level: 22 }, // Voltorb
      { speciesId: 82, level: 24 },  // Magneton
    ],
    prizeMoney: 1584,
    dialogue: {
      before: ['GAMBLER: I bet it\nall on this battle!'],
      after: ["I'm broke now..."],
    },
  },
  route8_trainer2: {
    id: 'route8_trainer2',
    name: 'SUPER NERD GLENN',
    class: 'Super Nerd',
    team: [
      { speciesId: 88, level: 22 }, // Grimer
      { speciesId: 109, level: 22 }, // Koffing
      { speciesId: 88, level: 22 }, // Grimer
    ],
    prizeMoney: 528,
    dialogue: {
      before: ['SUPER NERD: I study\nPOKeMON science!'],
      after: ['Back to studying...'],
    },
  },
  route8_trainer3: {
    id: 'route8_trainer3',
    name: 'LASS MEGAN',
    class: 'Lass',
    team: [
      { speciesId: 16, level: 22 }, // Pidgey
      { speciesId: 39, level: 22 }, // Jigglypuff
      { speciesId: 52, level: 22 }, // Meowth
    ],
    prizeMoney: 352,
    dialogue: {
      before: ['LASS: My POKeMON\nare so cute!'],
      after: ['Cute but weak...'],
    },
  },

  // Route 11
  route11_trainer1: {
    id: 'route11_trainer1',
    name: 'YOUNGSTER DAVE',
    class: 'Youngster',
    team: [
      { speciesId: 21, level: 19 }, // Spearow
      { speciesId: 19, level: 19 }, // Rattata
    ],
    prizeMoney: 304,
    dialogue: {
      before: ['YOUNGSTER: I guard\nthis route!'],
      after: ['Some guard I am...'],
    },
  },
  route11_trainer2: {
    id: 'route11_trainer2',
    name: 'GAMBLER JASPER',
    class: 'Gambler',
    team: [
      { speciesId: 100, level: 18 }, // Voltorb
      { speciesId: 77, level: 18 },  // Ponyta
    ],
    prizeMoney: 1188,
    dialogue: {
      before: ["GAMBLER: Let's gamble\non a battle!"],
      after: ['Bad luck for me!'],
    },
  },

  // Celadon Gym
  celadon_gym_trainer1: {
    id: 'celadon_gym_trainer1',
    name: 'LASS KAY',
    class: 'Lass',
    team: [
      { speciesId: 69, level: 28 }, // Bellsprout
      { speciesId: 70, level: 28 }, // Weepinbell
    ],
    prizeMoney: 448,
    dialogue: {
      before: ['LASS: The flowers\nhere are lovely!'],
      after: ['My flowers wilted...'],
    },
  },
  celadon_gym_trainer2: {
    id: 'celadon_gym_trainer2',
    name: 'BEAUTY BRIDGET',
    class: 'Beauty',
    team: [
      { speciesId: 43, level: 28 }, // Oddish
      { speciesId: 44, level: 30 }, // Gloom
    ],
    prizeMoney: 2100,
    dialogue: {
      before: ['BEAUTY: ERIKA taught\nme well!'],
      after: ['ERIKA is still the\nbest though...'],
    },
  },

  // Saffron Gym
  saffron_gym_trainer1: {
    id: 'saffron_gym_trainer1',
    name: 'PSYCHIC TYRON',
    class: 'Psychic',
    team: [
      { speciesId: 122, level: 34 }, // Mr. Mime
      { speciesId: 64, level: 34 },  // Kadabra
    ],
    prizeMoney: 680,
    dialogue: {
      before: ['PSYCHIC: I knew you\nwould come here...'],
      after: ['My predictions were\nwrong...'],
    },
  },
  saffron_gym_trainer2: {
    id: 'saffron_gym_trainer2',
    name: 'PSYCHIC CARMEN',
    class: 'Psychic',
    team: [
      { speciesId: 96, level: 36 }, // Drowzee
      { speciesId: 97, level: 36 }, // Hypno
    ],
    prizeMoney: 720,
    dialogue: {
      before: ['You look sleepy...\nLet me help!'],
      after: ['I should have read\nyour mind better...'],
    },
  },

  // Route 12
  route12_trainer1: {
    id: 'route12_trainer1',
    name: 'FISHER ANDREW',
    class: 'Fisher',
    team: [
      { speciesId: 129, level: 22 }, // Magikarp
      { speciesId: 60, level: 22 },  // Poliwag
      { speciesId: 118, level: 22 }, // Goldeen
    ],
    prizeMoney: 792,
    dialogue: {
      before: ['FISHER: I caught\nthese while fishing!'],
      after: ['Back to fishing...'],
    },
  },
  route12_trainer2: {
    id: 'route12_trainer2',
    name: 'FISHER BARNY',
    class: 'Fisher',
    team: [
      { speciesId: 54, level: 25 }, // Psyduck
      { speciesId: 116, level: 25 }, // Horsea
    ],
    prizeMoney: 900,
    dialogue: {
      before: ['Want to see my\nwater POKeMON?'],
      after: ['Your POKeMON are\nbetter...'],
    },
  },
  route12_trainer3: {
    id: 'route12_trainer3',
    name: 'YOUNGSTER DAN',
    class: 'Youngster',
    team: [
      { speciesId: 21, level: 24 }, // Spearow
      { speciesId: 20, level: 24 }, // Raticate
    ],
    prizeMoney: 384,
    dialogue: {
      before: ['Waiting for SNORLAX\nto move!'],
      after: ['Still waiting...'],
    },
  },

  // Route 13
  route13_trainer1: {
    id: 'route13_trainer1',
    name: 'BIRD KEEPER PERRY',
    class: 'Bird Keeper',
    team: [
      { speciesId: 21, level: 25 }, // Spearow
      { speciesId: 17, level: 25 }, // Pidgeotto
      { speciesId: 22, level: 25 }, // Fearow
    ],
    prizeMoney: 600,
    dialogue: {
      before: ['BIRD KEEPER: My\nbirds rule the sky!'],
      after: ['Clipped wings...'],
    },
  },
  route13_trainer2: {
    id: 'route13_trainer2',
    name: 'BEAUTY LOLA',
    class: 'Beauty',
    team: [
      { speciesId: 39, level: 27 }, // Jigglypuff
      { speciesId: 35, level: 27 }, // Clefairy
    ],
    prizeMoney: 1890,
    dialogue: {
      before: ['BEAUTY: My POKeMON\nare fabulous!'],
      after: ['Still fabulous!'],
    },
  },

  // Route 14
  route14_trainer1: {
    id: 'route14_trainer1',
    name: 'BIRD KEEPER CARTER',
    class: 'Bird Keeper',
    team: [
      { speciesId: 17, level: 28 }, // Pidgeotto
      { speciesId: 84, level: 28 }, // Doduo
    ],
    prizeMoney: 672,
    dialogue: {
      before: ['BIRD KEEPER: These\nbirds are tough!'],
      after: ['Shot down!'],
    },
  },
  route14_trainer2: {
    id: 'route14_trainer2',
    name: 'BIKER LUCA',
    class: 'Biker',
    team: [
      { speciesId: 109, level: 28 }, // Koffing
      { speciesId: 88, level: 28 },  // Grimer
    ],
    prizeMoney: 560,
    dialogue: {
      before: ['BIKER: Outta my way!'],
      after: ['Fine, you pass!'],
    },
  },

  // Route 15
  route15_trainer1: {
    id: 'route15_trainer1',
    name: 'BEAUTY OLIVIA',
    class: 'Beauty',
    team: [
      { speciesId: 35, level: 29 }, // Clefairy
      { speciesId: 40, level: 29 }, // Wigglytuff
    ],
    prizeMoney: 2030,
    dialogue: {
      before: ['Almost to FUCHSIA!'],
      after: ['Enjoy the Safari\nZone!'],
    },
  },
  route15_trainer2: {
    id: 'route15_trainer2',
    name: 'JR. TRAINER NINA',
    class: 'Jr. Trainer',
    team: [
      { speciesId: 17, level: 28 }, // Pidgeotto
      { speciesId: 44, level: 28 }, // Gloom
      { speciesId: 52, level: 28 }, // Meowth
    ],
    prizeMoney: 560,
    dialogue: {
      before: ["Can you beat my\ntriple team?"],
      after: ['Triple defeat!'],
    },
  },

  // Route 16-18 (Cycling Road)
  route17_biker1: {
    id: 'route17_biker1',
    name: 'BIKER VIRGIL',
    class: 'Biker',
    team: [
      { speciesId: 109, level: 28 }, // Koffing
      { speciesId: 110, level: 28 }, // Weezing
    ],
    prizeMoney: 560,
    dialogue: {
      before: ['BIKER: The CYCLING\nROAD is ours!'],
      after: ['You can pass...'],
    },
  },
  route17_biker2: {
    id: 'route17_biker2',
    name: 'BIKER BILLY',
    class: 'Biker',
    team: [
      { speciesId: 88, level: 29 }, // Grimer
      { speciesId: 109, level: 29 }, // Koffing
    ],
    prizeMoney: 580,
    dialogue: {
      before: ['BIKER: Wanna race?'],
      after: ['You win this time!'],
    },
  },
  route17_biker3: {
    id: 'route17_biker3',
    name: 'CUE BALL KOJI',
    class: 'Cue Ball',
    team: [
      { speciesId: 66, level: 28 }, // Machop
      { speciesId: 56, level: 28 }, // Mankey
      { speciesId: 67, level: 28 }, // Machoke
    ],
    prizeMoney: 672,
    dialogue: {
      before: ['CUE BALL: Nobody\npasses me!'],
      after: ['Okay you can pass...'],
    },
  },
  route17_biker4: {
    id: 'route17_biker4',
    name: 'BIKER RUBEN',
    class: 'Biker',
    team: [
      { speciesId: 110, level: 30 }, // Weezing
    ],
    prizeMoney: 600,
    dialogue: {
      before: ['Last biker standing!'],
      after: ['Not anymore...'],
    },
  },

  // Fuchsia Gym
  fuchsia_gym_trainer1: {
    id: 'fuchsia_gym_trainer1',
    name: 'JUGGLER KAYDEN',
    class: 'Juggler',
    team: [
      { speciesId: 96, level: 34 }, // Drowzee
      { speciesId: 97, level: 34 }, // Hypno
    ],
    prizeMoney: 1360,
    dialogue: {
      before: ['JUGGLER: Watch my\ntrick!'],
      after: ['No tricks left...'],
    },
  },
  fuchsia_gym_trainer2: {
    id: 'fuchsia_gym_trainer2',
    name: 'TAMER EDGAR',
    class: 'Tamer',
    team: [
      { speciesId: 24, level: 34 }, // Arbok
      { speciesId: 27, level: 34 }, // Sandshrew
      { speciesId: 28, level: 34 }, // Sandslash
    ],
    prizeMoney: 1020,
    dialogue: {
      before: ['TAMER: I train wild\nbeasts!'],
      after: ['Tamed by a kid...'],
    },
  },

  // Route 19-20 (Water routes)
  route19_swimmer1: {
    id: 'route19_swimmer1',
    name: 'SWIMMER AXLE',
    class: 'Swimmer',
    team: [
      { speciesId: 72, level: 30 }, // Tentacool
      { speciesId: 73, level: 30 }, // Tentacruel
    ],
    prizeMoney: 600,
    dialogue: {
      before: ['SWIMMER: I love the\nopen sea!'],
      after: ['Washed out...'],
    },
  },
  route19_swimmer2: {
    id: 'route19_swimmer2',
    name: 'SWIMMER ALICE',
    class: 'Swimmer',
    team: [
      { speciesId: 116, level: 30 }, // Horsea
      { speciesId: 117, level: 30 }, // Seadra
      { speciesId: 118, level: 30 }, // Goldeen
    ],
    prizeMoney: 600,
    dialogue: {
      before: ['The sea POKeMON are\nbeautiful!'],
      after: ['I need to train more\nin the ocean...'],
    },
  },

  // Route 20 (Water route)
  route20_swimmer1: {
    id: 'route20_swimmer1',
    name: 'SWIMMER BARRY',
    class: 'Swimmer',
    team: [
      { speciesId: 116, level: 30 }, // Horsea
      { speciesId: 117, level: 30 }, // Seadra
    ],
    prizeMoney: 600,
    dialogue: {
      before: ['SWIMMER: SEAFOAM\nISLANDS is nearby!'],
      after: ['You beat me while\nswimming!'],
    },
  },
  route20_swimmer2: {
    id: 'route20_swimmer2',
    name: 'SWIMMER GLENDA',
    class: 'Swimmer',
    team: [
      { speciesId: 120, level: 30 }, // Staryu
      { speciesId: 121, level: 30 }, // Starmie
    ],
    prizeMoney: 600,
    dialogue: {
      before: ["SWIMMER: CINNABAR\nISLAND isn't far!"],
      after: ['I should have\ntrained more...'],
    },
  },
  route20_swimmer3: {
    id: 'route20_swimmer3',
    name: 'SWIMMER DEAN',
    class: 'Swimmer',
    team: [
      { speciesId: 72, level: 28 },  // Tentacool
      { speciesId: 72, level: 28 },  // Tentacool
      { speciesId: 73, level: 32 },  // Tentacruel
    ],
    prizeMoney: 640,
    dialogue: {
      before: ['SWIMMER: I love\nswimming in the sea!'],
      after: ['The sea is vast...'],
    },
  },

  // Route 21 (Water route)
  route21_swimmer1: {
    id: 'route21_swimmer1',
    name: 'SWIMMER SPENCER',
    class: 'Swimmer',
    team: [
      { speciesId: 86, level: 32 },  // Seel
      { speciesId: 87, level: 32 },  // Dewgong
    ],
    prizeMoney: 640,
    dialogue: {
      before: ['SWIMMER: This route\nconnects PALLET TOWN'],
      after: ['You swim well!'],
    },
  },
  route21_swimmer2: {
    id: 'route21_swimmer2',
    name: 'SWIMMER JACK',
    class: 'Swimmer',
    team: [
      { speciesId: 118, level: 30 }, // Goldeen
      { speciesId: 119, level: 30 }, // Seaking
      { speciesId: 130, level: 32 }, // Gyarados
    ],
    prizeMoney: 640,
    dialogue: {
      before: ["SWIMMER: You're going\nto CINNABAR?"],
      after: ["BLAINE's GYM is\nno joke!"],
    },
  },

  // Seafoam Islands
  seafoam_trainer1: {
    id: 'seafoam_trainer1',
    name: 'HIKER WADE',
    class: 'Hiker',
    team: [
      { speciesId: 75, level: 34 },  // Graveler
      { speciesId: 95, level: 34 },  // Onix
    ],
    prizeMoney: 1224,
    dialogue: {
      before: ['HIKER: This cave is\nfreezing cold!'],
      after: ['Brrrr... I need to\nget out of here!'],
    },
  },
  seafoam_trainer2: {
    id: 'seafoam_trainer2',
    name: 'SWIMMER NORA',
    class: 'Swimmer',
    team: [
      { speciesId: 86, level: 33 },  // Seel
      { speciesId: 87, level: 33 },  // Dewgong
      { speciesId: 131, level: 35 }, // Lapras
    ],
    prizeMoney: 700,
    dialogue: {
      before: ['SWIMMER: The\nunderground rivers'],
      after: ['The ice POKeMON\nhere are amazing...'],
    },
  },

  // Cinnabar Gym
  cinnabar_gym_trainer1: {
    id: 'cinnabar_gym_trainer1',
    name: 'SUPER NERD ERIK',
    class: 'Super Nerd',
    team: [
      { speciesId: 58, level: 38 }, // Growlithe
      { speciesId: 77, level: 38 }, // Ponyta
    ],
    prizeMoney: 912,
    dialogue: {
      before: ['SUPER NERD: Answer\nmy quiz!'],
      after: ['You know your stuff!'],
    },
  },
  cinnabar_gym_trainer2: {
    id: 'cinnabar_gym_trainer2',
    name: 'BURGLAR QUINN',
    class: 'Burglar',
    team: [
      { speciesId: 126, level: 40 }, // Magmar
    ],
    prizeMoney: 3600,
    dialogue: {
      before: ['BURGLAR: My fire is\nhotter than yours!'],
      after: ['Burned out!'],
    },
  },

  // Pokemon Mansion
  mansion_trainer1: {
    id: 'mansion_trainer1',
    name: 'SCIENTIST TAYLOR',
    class: 'Scientist',
    team: [
      { speciesId: 81, level: 34 },  // Magnemite
      { speciesId: 100, level: 34 }, // Voltorb
      { speciesId: 82, level: 34 },  // Magneton
    ],
    prizeMoney: 1632,
    dialogue: {
      before: ['SCIENTIST: This lab\nholds many secrets!'],
      after: ['My research was\nflawed!'],
    },
  },
  mansion_trainer2: {
    id: 'mansion_trainer2',
    name: 'BURGLAR ARNIE',
    class: 'Burglar',
    team: [
      { speciesId: 58, level: 36 }, // Growlithe
      { speciesId: 77, level: 36 }, // Ponyta
    ],
    prizeMoney: 3240,
    dialogue: {
      before: ['BURGLAR: Looking for\nthe SECRET KEY?'],
      after: ['It\'s yours!'],
    },
  },

  // Victory Road
  vr_trainer1: {
    id: 'vr_trainer1',
    name: 'COOLTRAINER NAOMI',
    class: 'Cooltrainer',
    team: [
      { speciesId: 117, level: 42 }, // Seadra
      { speciesId: 103, level: 42 }, // Exeggutor
      { speciesId: 59, level: 42 },  // Arcanine
    ],
    prizeMoney: 1848,
    dialogue: {
      before: ['COOLTRAINER: The\nELITE FOUR awaits!'],
      after: ['You might actually\nbeat them!'],
    },
  },
  vr_trainer2: {
    id: 'vr_trainer2',
    name: 'COOLTRAINER ROLANDO',
    class: 'Cooltrainer',
    team: [
      { speciesId: 65, level: 42 },  // Alakazam
      { speciesId: 76, level: 42 },  // Golem
    ],
    prizeMoney: 1848,
    dialogue: {
      before: ['This is the final\ntest!'],
      after: ['You passed with\nflying colors!'],
    },
  },
  vr_trainer3: {
    id: 'vr_trainer3',
    name: 'BLACK BELT DAISUKE',
    class: 'Black Belt',
    team: [
      { speciesId: 66, level: 40 }, // Machop
      { speciesId: 67, level: 42 }, // Machoke
      { speciesId: 68, level: 44 }, // Machamp
    ],
    prizeMoney: 1056,
    dialogue: {
      before: ['BLACK BELT: My fists\nare invincible!'],
      after: ['My fists failed me!'],
    },
  },
  vr_trainer4: {
    id: 'vr_trainer4',
    name: 'JUGGLER NELSON',
    class: 'Juggler',
    team: [
      { speciesId: 96, level: 42 }, // Drowzee
      { speciesId: 97, level: 42 }, // Hypno
      { speciesId: 64, level: 42 }, // Kadabra
    ],
    prizeMoney: 1680,
    dialogue: {
      before: ['JUGGLER: I juggle\nand battle!'],
      after: ['I dropped the ball!'],
    },
  },

  // Cerulean rival
  rival_cerulean: {
    id: 'rival_cerulean',
    name: 'RIVAL',
    class: 'Rival',
    team: [
      { speciesId: 21, level: 16 },  // Spearow
      { speciesId: 27, level: 15 },  // Sandshrew
      { speciesId: 133, level: 17 }, // Eevee
    ],
    prizeMoney: 595,
    dialogue: {
      before: ["{RIVAL}: Hey {PLAYER}!\nHeading for the\nBRIDGE?", "I'll show you how\nmuch stronger I've\ngotten!"],
      after: ["{RIVAL}: Heh! Not bad!\nBut I'll beat you\nnext time!", "BILL lives at the\nend of ROUTE 25.\nHe's a real POKeMON\nfanatic!"],
    },
  },
  // Cerulean Rocket (burgled house)
  cerulean_rocket: {
    id: 'cerulean_rocket',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 66, level: 17 }, // Machop
    ],
    prizeMoney: 544,
    dialogue: {
      before: ['ROCKET: I burglarized\nthat house! Hehe!', "You want to battle?\nBring it on!"],
      after: ["ROCKET: Ugh, I lost!\nHere, take this TM!\nI don't need it!", "TM28 teaches DIG!\nNow scram!"],
    },
  },

  // Viridian Gym
  viridian_gym_trainer1: {
    id: 'viridian_gym_trainer1',
    name: 'COOLTRAINER YUJI',
    class: 'Cooltrainer',
    team: [
      { speciesId: 27, level: 42 },  // Sandshrew
      { speciesId: 31, level: 42 },  // Nidoqueen
      { speciesId: 34, level: 42 },  // Nidoking
    ],
    prizeMoney: 2940,
    dialogue: {
      before: ["COOLTRAINER: You think\nyou can beat GIOVANNI?"],
      after: ['Maybe you can\nbeat him after all!'],
    },
  },
  viridian_gym_trainer2: {
    id: 'viridian_gym_trainer2',
    name: 'COOLTRAINER WARREN',
    class: 'Cooltrainer',
    team: [
      { speciesId: 51, level: 42 },  // Dugtrio
      { speciesId: 75, level: 42 },  // Graveler
      { speciesId: 105, level: 43 }, // Marowak
    ],
    prizeMoney: 3010,
    dialogue: {
      before: ["COOLTRAINER: This is\nthe last GYM! Give", "it everything\nyou've got!"],
      after: ['Amazing! You really\nare something!'],
    },
  },

  // Rival encounters
  rival_lab: {
    id: 'rival_lab',
    name: 'RIVAL',
    class: 'Rival',
    team: [
      { speciesId: 133, level: 5 }, // Eevee
    ],
    prizeMoney: 175,
    dialogue: {
      before: ["{RIVAL}: Hey!\nGramps gave me a\nPOKeMON too!", "I'll show you how\na real trainer\nbattles!"],
      after: ["{RIVAL}: What?!\nUnbelievable!\nI picked the wrong\nPOKeMON!"],
    },
  },
  rival_route22: {
    id: 'rival_route22',
    name: 'RIVAL GARY',
    class: 'Rival',
    team: [
      { speciesId: 21, level: 9 },  // Spearow
      { speciesId: 133, level: 8 }, // Eevee
    ],
    prizeMoney: 280,
    dialogue: {
      before: ["{RIVAL}: Hey! You're\ngoing to the LEAGUE?", "Not before me!"],
      after: ['What?! I lost?!\nI\'ll beat you next\ntime!'],
    },
  },
  rival_ss_anne: {
    id: 'rival_ss_anne',
    name: 'RIVAL',
    class: 'Rival',
    team: [
      { speciesId: 21, level: 19 },  // Spearow
      { speciesId: 27, level: 16 },  // Sandshrew
      { speciesId: 133, level: 20 }, // Eevee
    ],
    prizeMoney: 700,
    dialogue: {
      before: ["{RIVAL}: Well, well!\nIf it isn't {PLAYER}!", "Boarded the S.S. ANNE\ntoo, huh?", "Let's see how much\nyou've improved!"],
      after: ["{RIVAL}: Hmph! You\njust got lucky!", "I'll be stronger\nnext time!"],
    },
  },
  // S.S. Anne trainers
  ss_anne_lass1: {
    id: 'ss_anne_lass1',
    name: 'LASS EMMA',
    class: 'Lass',
    team: [
      { speciesId: 35, level: 18 },  // Clefairy
      { speciesId: 39, level: 20 },  // Jigglypuff
    ],
    prizeMoney: 400,
    dialogue: {
      before: ['LASS: Isn\'t this ship\njust wonderful?'],
      after: ['I should enjoy the\nscenery instead...'],
    },
  },
  ss_anne_beauty1: {
    id: 'ss_anne_beauty1',
    name: 'BEAUTY LANA',
    class: 'Beauty',
    team: [
      { speciesId: 120, level: 18 }, // Staryu
      { speciesId: 90, level: 18 },  // Shellder
      { speciesId: 118, level: 20 }, // Goldeen
    ],
    prizeMoney: 1400,
    dialogue: {
      before: ['BEAUTY: A cruise is the\nperfect getaway!'],
      after: ['Well, that was\nunexpected!'],
    },
  },
  ss_anne_gambler1: {
    id: 'ss_anne_gambler1',
    name: 'GAMBLER STAN',
    class: 'Gambler',
    team: [
      { speciesId: 21, level: 18 },  // Spearow
      { speciesId: 100, level: 20 }, // Voltorb
      { speciesId: 58, level: 20 },  // Growlithe
    ],
    prizeMoney: 1440,
    dialogue: {
      before: ['GAMBLER: I bet I can\nbeat you!'],
      after: ['I lost the bet!'],
    },
  },
  ss_anne_fisher1: {
    id: 'ss_anne_fisher1',
    name: 'FISHER DALE',
    class: 'Fisher',
    team: [
      { speciesId: 72, level: 17 },  // Tentacool
      { speciesId: 116, level: 19 }, // Horsea
      { speciesId: 54, level: 19 },  // Psyduck
    ],
    prizeMoney: 684,
    dialogue: {
      before: ['FISHER: I catch\nPOKeMON from the\nship\'s railing!'],
      after: ['Maybe I should use\na fishing rod...'],
    },
  },
  ss_anne_youngster1: {
    id: 'ss_anne_youngster1',
    name: 'YOUNGSTER JOEY',
    class: 'Youngster',
    team: [
      { speciesId: 19, level: 19 },  // Rattata
      { speciesId: 56, level: 21 },  // Mankey
    ],
    prizeMoney: 336,
    dialogue: {
      before: ['YOUNGSTER: My first\ncruise! Let\'s battle!'],
      after: ['What a great trip\nthis is!'],
    },
  },
  ss_anne_sailor3: {
    id: 'ss_anne_sailor3',
    name: 'SAILOR DIRK',
    class: 'Sailor',
    team: [
      { speciesId: 66, level: 18 },  // Machop
      { speciesId: 72, level: 20 },  // Tentacool
    ],
    prizeMoney: 640,
    dialogue: {
      before: ['SAILOR: No passengers\nallowed down here!'],
      after: ['Well, you earned\nthe right to stay.'],
    },
  },
  ss_anne_sailor4: {
    id: 'ss_anne_sailor4',
    name: 'SAILOR PHILLIP',
    class: 'Sailor',
    team: [
      { speciesId: 66, level: 17 },  // Machop
      { speciesId: 66, level: 17 },  // Machop
      { speciesId: 67, level: 20 },  // Machoke
    ],
    prizeMoney: 640,
    dialogue: {
      before: ['SAILOR: My MACHOP are\ntougher than they\nlook!'],
      after: ['Okay, they need more\ntraining...'],
    },
  },
  ss_anne_sailor5: {
    id: 'ss_anne_sailor5',
    name: 'SAILOR HUEY',
    class: 'Sailor',
    team: [
      { speciesId: 86, level: 20 },  // Seel
      { speciesId: 79, level: 21 },  // Slowpoke
    ],
    prizeMoney: 672,
    dialogue: {
      before: ['SAILOR: I found these\nPOKeMON at sea!'],
      after: ['They still need\nmore training.'],
    },
  },
  ss_anne_fisher2: {
    id: 'ss_anne_fisher2',
    name: 'FISHER HANK',
    class: 'Fisher',
    team: [
      { speciesId: 129, level: 17 }, // Magikarp
      { speciesId: 60, level: 19 },  // Poliwag
      { speciesId: 98, level: 19 },  // Krabby
    ],
    prizeMoney: 684,
    dialogue: {
      before: ['FISHER: The kitchen\nneeds fresh seafood!'],
      after: ['Guess I\'ll stick\nto cooking...'],
    },
  },
  ss_anne_cooltrainer1: {
    id: 'ss_anne_cooltrainer1',
    name: 'COOLTRAINER SEAN',
    class: 'Cooltrainer',
    team: [
      { speciesId: 27, level: 19 },  // Sandshrew
      { speciesId: 21, level: 21 },  // Spearow
      { speciesId: 25, level: 22 },  // Pikachu
    ],
    prizeMoney: 792,
    dialogue: {
      before: ['COOLTRAINER: The sea\nbreeze is perfect\nfor battling!'],
      after: ['You\'re pretty good!'],
    },
  },
  ss_anne_lass2: {
    id: 'ss_anne_lass2',
    name: 'LASS ROBIN',
    class: 'Lass',
    team: [
      { speciesId: 37, level: 18 },  // Vulpix
      { speciesId: 43, level: 20 },  // Oddish
      { speciesId: 120, level: 20 }, // Staryu
    ],
    prizeMoney: 400,
    dialogue: {
      before: ['LASS: The view from\nthe deck is amazing!'],
      after: ['I\'ll enjoy it\nmore quietly now.'],
    },
  },
  ss_anne_sailor6: {
    id: 'ss_anne_sailor6',
    name: 'SAILOR EDMOND',
    class: 'Sailor',
    team: [
      { speciesId: 66, level: 20 },  // Machop
      { speciesId: 67, level: 22 },  // Machoke
    ],
    prizeMoney: 704,
    dialogue: {
      before: ['SAILOR: I\'m the\nstrongest sailor on\nthis ship!'],
      after: ['Maybe second\nstrongest...'],
    },
  },
  rival_tower: {
    id: 'rival_tower',
    name: 'RIVAL',
    class: 'Rival',
    team: [
      { speciesId: 22, level: 25 },  // Fearow
      { speciesId: 90, level: 23 },  // Shellder
      { speciesId: 28, level: 23 },  // Sandslash
      { speciesId: 136, level: 25 }, // Flareon
    ],
    prizeMoney: 875,
    dialogue: {
      before: ["{RIVAL}: {PLAYER}!\nWhat are you doing\nhere?", "I was just checking\non the ghosts!", "Since you're here,\nlet's battle!"],
      after: ["{RIVAL}: Grr...\nI'm still not strong\nenough!", "I heard ghosts are\ncausing trouble\nupstairs..."],
    },
  },
  rival_silph: {
    id: 'rival_silph',
    name: 'RIVAL',
    class: 'Rival',
    team: [
      { speciesId: 22, level: 37 },  // Fearow
      { speciesId: 28, level: 35 },  // Sandslash
      { speciesId: 91, level: 35 },  // Cloyster
      { speciesId: 65, level: 35 },  // Alakazam
      { speciesId: 136, level: 40 }, // Flareon
    ],
    prizeMoney: 1400,
    dialogue: {
      before: ["{RIVAL}: {PLAYER}!\nWhat a surprise!", "TEAM ROCKET is all\nover SILPH CO.!", "But first, let's\nhave a battle!"],
      after: ["{RIVAL}: You always\nmanage to beat me!", "Go on, take down\nTEAM ROCKET!"],
    },
  },
  rival_route22_2: {
    id: 'rival_route22_2',
    name: 'RIVAL',
    class: 'Rival',
    team: [
      { speciesId: 22, level: 47 },  // Fearow
      { speciesId: 28, level: 45 },  // Sandslash
      { speciesId: 91, level: 45 },  // Cloyster
      { speciesId: 65, level: 45 },  // Alakazam
      { speciesId: 112, level: 45 }, // Rhydon
      { speciesId: 136, level: 47 }, // Flareon
    ],
    prizeMoney: 1645,
    dialogue: {
      before: ["{RIVAL}: {PLAYER}!\nYou're headed to the\nPOKeMON LEAGUE too?", "I've trained my\nPOKeMON to be the\nvery best!", "This time I WILL\nbeat you!"],
      after: ["{RIVAL}: Ugh! I can't\nbelieve I lost again!", "Fine, go beat the\nELITE FOUR!", "But I'll catch up\nsoon!"],
    },
  },

  // Game Corner Rockets
  game_corner_rocket1: {
    id: 'game_corner_rocket1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 19, level: 20 },  // Rattata
      { speciesId: 41, level: 20 },  // Zubat
    ],
    prizeMoney: 800,
    dialogue: {
      before: ['ROCKET: You found\nour secret hideout!', 'No one leaves alive!'],
      after: ['How did you beat me?!'],
    },
  },
  game_corner_rocket2: {
    id: 'game_corner_rocket2',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 23, level: 21 },  // Ekans
      { speciesId: 27, level: 21 },  // Sandshrew
    ],
    prizeMoney: 840,
    dialogue: {
      before: ['ROCKET: Stop right\nthere, kid!'],
      after: ['I need backup!'],
    },
  },
  giovanni_game_corner: {
    id: 'giovanni_game_corner',
    name: 'GIOVANNI',
    class: 'Boss',
    team: [
      { speciesId: 95, level: 25 },  // Onix
      { speciesId: 111, level: 24 }, // Rhyhorn
      { speciesId: 31, level: 29 },  // Nidoqueen
    ],
    prizeMoney: 2871,
    dialogue: {
      before: ['GIOVANNI: So, you\nhave found me!', "I am the leader of\nTEAM ROCKET!", "I shall not allow\nyou to disrupt our\nplans!"],
      after: ["Blast! You are\ntougher than I\nthought!", "Fine, take this\nSILPH SCOPE!", "But TEAM ROCKET\nwill rise again!"],
    },
  },

  // Game Corner poster guard
  game_corner_poster_rocket: {
    id: 'game_corner_poster_rocket',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 20, level: 20 },  // Raticate
      { speciesId: 41, level: 20 },  // Zubat
    ],
    prizeMoney: 800,
    dialogue: {
      before: ['ROCKET: Hey! Don\'t be\nsnooping around here!'],
      after: ['No! The poster...!'],
    },
  },
  // Rocket Hideout B1F
  rocket_hideout_b1f_grunt1: {
    id: 'rocket_hideout_b1f_grunt1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 19, level: 21 },  // Rattata
      { speciesId: 41, level: 22 },  // Zubat
    ],
    prizeMoney: 840,
    dialogue: {
      before: ['ROCKET: How did you\nget down here?!'],
      after: ['This isn\'t over!'],
    },
  },
  rocket_hideout_b1f_grunt2: {
    id: 'rocket_hideout_b1f_grunt2',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 88, level: 21 },  // Grimer
      { speciesId: 66, level: 22 },  // Machop
    ],
    prizeMoney: 840,
    dialogue: {
      before: ['ROCKET: You\'re not\ngetting past me!'],
      after: ['Urgh... go ahead...'],
    },
  },
  // Rocket Hideout B2F
  rocket_hideout_b2f_grunt1: {
    id: 'rocket_hideout_b2f_grunt1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 109, level: 22 }, // Koffing
      { speciesId: 96, level: 23 },  // Drowzee
    ],
    prizeMoney: 880,
    dialogue: {
      before: ['ROCKET: Intruder alert!\nIntruder alert!'],
      after: ['I\'ll sound the\nalarm!'],
    },
  },
  rocket_hideout_b2f_grunt2: {
    id: 'rocket_hideout_b2f_grunt2',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 27, level: 23 },  // Sandshrew
      { speciesId: 23, level: 23 },  // Ekans
      { speciesId: 28, level: 23 },  // Sandslash
    ],
    prizeMoney: 920,
    dialogue: {
      before: ['ROCKET: You made it\nthis far? Impressive.'],
      after: ['The BOSS will deal\nwith you...'],
    },
  },
  // Rocket Hideout B3F
  rocket_hideout_b3f_grunt1: {
    id: 'rocket_hideout_b3f_grunt1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 20, level: 23 },  // Raticate
      { speciesId: 41, level: 23 },  // Zubat
      { speciesId: 42, level: 24 },  // Golbat
    ],
    prizeMoney: 920,
    dialogue: {
      before: ['ROCKET: The BOSS is\njust below!', 'You\'ll never reach\nhim!'],
      after: ['The BOSS won\'t be\nas easy!'],
    },
  },
  // Rocket Hideout B4F
  rocket_hideout_b4f_grunt1: {
    id: 'rocket_hideout_b4f_grunt1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 66, level: 24 },  // Machop
      { speciesId: 109, level: 24 }, // Koffing
      { speciesId: 88, level: 25 },  // Grimer
    ],
    prizeMoney: 960,
    dialogue: {
      before: ['ROCKET: This is the\nBOSS\'s private floor!'],
      after: ['The BOSS will\nclobber you!'],
    },
  },

  // Pokemon Tower Rockets
  tower_rocket1: {
    id: 'tower_rocket1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 41, level: 25 },  // Zubat
      { speciesId: 42, level: 25 },  // Golbat
    ],
    prizeMoney: 1000,
    dialogue: {
      before: ['ROCKET: You again?!\nTEAM ROCKET owns\nthis tower!'],
      after: ['TEAM ROCKET will\nremember this!'],
    },
  },
  tower_rocket2: {
    id: 'tower_rocket2',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 109, level: 26 }, // Koffing
      { speciesId: 24, level: 26 },  // Arbok
    ],
    prizeMoney: 1040,
    dialogue: {
      before: ['ROCKET: You want to\nsave MR. FUJI?', "You'll have to get\nthrough me first!"],
      after: ['I can\'t believe I\nlost to a kid!'],
    },
  },

  // Silph Co Rockets + Giovanni
  silph_1f_grunt1: {
    id: 'silph_1f_grunt1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 19, level: 30 },  // Rattata
      { speciesId: 41, level: 30 },  // Zubat
    ],
    prizeMoney: 1200,
    dialogue: {
      before: ['ROCKET: SILPH CO. is\nunder our control!', 'No one gets in\nor out!'],
      after: ['How are you this\nstrong?!'],
    },
  },
  silph_2f_grunt1: {
    id: 'silph_2f_grunt1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 20, level: 32 },  // Raticate
      { speciesId: 42, level: 32 },  // Golbat
    ],
    prizeMoney: 1280,
    dialogue: {
      before: ['ROCKET: This floor\nis off limits!'],
      after: ['You got lucky, kid!'],
    },
  },
  silph_2f_grunt2: {
    id: 'silph_2f_grunt2',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 109, level: 32 }, // Koffing
      { speciesId: 96, level: 32 },  // Drowzee
    ],
    prizeMoney: 1280,
    dialogue: {
      before: ['ROCKET: You think you\ncan stop us?'],
      after: ['The boss won\'t be\nhappy about this...'],
    },
  },
  silph_3f_grunt1: {
    id: 'silph_3f_grunt1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 24, level: 33 },  // Arbok
      { speciesId: 28, level: 33 },  // Sandslash
    ],
    prizeMoney: 1320,
    dialogue: {
      before: ['ROCKET: The lab\nequipment is ours now!'],
      after: ['This can\'t be\nhappening!'],
    },
  },
  silph_3f_grunt2: {
    id: 'silph_3f_grunt2',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 88, level: 33 },  // Grimer
      { speciesId: 66, level: 33 },  // Machop
    ],
    prizeMoney: 1320,
    dialogue: {
      before: ['ROCKET: Get out of\nhere, kid!'],
      after: ['I need backup!'],
    },
  },
  silph_4f_grunt1: {
    id: 'silph_4f_grunt1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 97, level: 34 },  // Hypno
      { speciesId: 20, level: 34 },  // Raticate
    ],
    prizeMoney: 1360,
    dialogue: {
      before: ['ROCKET: The servers\ncontain valuable\ndata!'],
      after: ['How did you get\nthis far?!'],
    },
  },
  silph_4f_grunt2: {
    id: 'silph_4f_grunt2',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 110, level: 34 }, // Weezing
      { speciesId: 42, level: 34 },  // Golbat
    ],
    prizeMoney: 1360,
    dialogue: {
      before: ['ROCKET: You made it\nthis far? Impressive!'],
      after: ['You\'re tougher than\nI thought...'],
    },
  },
  silph_5f_grunt1: {
    id: 'silph_5f_grunt1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 89, level: 35 },  // Muk
      { speciesId: 67, level: 35 },  // Machoke
    ],
    prizeMoney: 1400,
    dialogue: {
      before: ['ROCKET: The boss is\nupstairs! You will\nnever reach him!'],
      after: ['No way... the boss\nwill crush you!'],
    },
  },
  silph_6f_grunt1: {
    id: 'silph_6f_grunt1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 104, level: 35 }, // Cubone
      { speciesId: 24, level: 35 },  // Arbok
    ],
    prizeMoney: 1400,
    dialogue: {
      before: ['ROCKET: Ha! You fell\nfor the trap!'],
      after: ['Okay maybe the trap\ndidn\'t work...'],
    },
  },
  silph_7f_grunt1: {
    id: 'silph_7f_grunt1',
    name: 'ROCKET GRUNT',
    class: 'Team Rocket',
    team: [
      { speciesId: 110, level: 36 }, // Weezing
      { speciesId: 97, level: 36 },  // Hypno
    ],
    prizeMoney: 1440,
    dialogue: {
      before: ['ROCKET: The boss is\nright here! You will\nnot pass!'],
      after: ['The boss will\navenge me!'],
    },
  },
  giovanni_silph: {
    id: 'giovanni_silph',
    name: 'GIOVANNI',
    class: 'Boss',
    team: [
      { speciesId: 34, level: 37 },  // Nidoking
      { speciesId: 112, level: 37 }, // Rhydon
      { speciesId: 31, level: 41 },  // Nidoqueen
      { speciesId: 111, level: 37 }, // Rhyhorn
    ],
    prizeMoney: 4059,
    dialogue: {
      before: ["GIOVANNI: Ah, the\nchild from the GAME\nCORNER!", "You have interfered\nwith TEAM ROCKET\nfor the last time!", "Prepare to feel my\nwrath!"],
      after: ["GIOVANNI: ...I see.\nYou are truly\nformidable.", "I will disband\nTEAM ROCKET here!", "But remember my\nname... GIOVANNI!"],
    },
  },
  // Fighting Dojo
  dojo_trainer1: {
    id: 'dojo_trainer1',
    name: 'BLACK BELT MIKE',
    class: 'Black Belt',
    team: [
      { speciesId: 57, level: 37 },  // Primeape
      { speciesId: 67, level: 37 },  // Machoke
    ],
    prizeMoney: 888,
    dialogue: {
      before: ['BLACK BELT: Hwa!\nWant to see real\nfighting power?'],
      after: ['You have strong\nfighting spirit!'],
    },
  },
  dojo_trainer2: {
    id: 'dojo_trainer2',
    name: 'BLACK BELT HIDEKI',
    class: 'Black Belt',
    team: [
      { speciesId: 106, level: 38 }, // Hitmonlee
      { speciesId: 107, level: 38 }, // Hitmonchan
    ],
    prizeMoney: 912,
    dialogue: {
      before: ['BLACK BELT: My\nfighting POKeMON will\ncrush you!'],
      after: ['Your POKeMON are\nwell trained!'],
    },
  },

  // Jessie & James - Team Rocket duo (recurring)
  // Trainer IDs match Jessie's NPC ID; James is a companion NPC.
  // Both Jessie and James NPCs disappear when the trainer is defeated.
  jessie_mtmoon: {
    id: 'jessie_mtmoon',
    name: 'JESSIE & JAMES',
    class: 'Team Rocket',
    team: [
      { speciesId: 52, level: 14 },  // Meowth
      { speciesId: 23, level: 14 },  // Ekans
      { speciesId: 109, level: 14 }, // Koffing
    ],
    prizeMoney: 448,
    dialogue: {
      before: [
        'JESSIE & JAMES: Prepare\nfor trouble!',
        'And make it double!',
        'To protect the world\nfrom devastation!',
        'To unite all peoples\nwithin our nation!',
        'JESSIE!',
        'JAMES!',
        'TEAM ROCKET blasts off\nat the speed of light!',
        'Surrender now or\nprepare to fight!',
        'MEOWTH: Meowth,\nthat\'s right!',
      ],
      after: ['Looks like TEAM ROCKET\nis blasting off again!'],
    },
  },
  jessie_gamecorner: {
    id: 'jessie_gamecorner',
    name: 'JESSIE & JAMES',
    class: 'Team Rocket',
    team: [
      { speciesId: 52, level: 25 },  // Meowth
      { speciesId: 24, level: 25 },  // Arbok
      { speciesId: 110, level: 25 }, // Weezing
    ],
    prizeMoney: 1000,
    dialogue: {
      before: [
        'JESSIE & JAMES: You!\nWe remember you from\nMT. MOON!',
        'Prepare for trouble!',
        'And make it double!',
        "This time we won't\ngo easy on you!",
        'MEOWTH: Yeah! We\'ve\nbeen training hard!',
      ],
      after: ["We're blasting off\nagain!"],
    },
  },
  jessie_tower: {
    id: 'jessie_tower',
    name: 'JESSIE & JAMES',
    class: 'Team Rocket',
    team: [
      { speciesId: 52, level: 30 },  // Meowth
      { speciesId: 24, level: 30 },  // Arbok
      { speciesId: 110, level: 30 }, // Weezing
    ],
    prizeMoney: 1200,
    dialogue: {
      before: [
        'JESSIE & JAMES: Stop\nright there, twerp!',
        'Prepare for trouble,\nthis tower is ours!',
        'And make it double,\nwe have ghostly powers!',
        'MEOWTH: Hand over\nyour POKeMON or\nMR. FUJI gets it!',
      ],
      after: ["We're blasting off\nagain! This isn't\nover, twerp!"],
    },
  },
  jessie_silph: {
    id: 'jessie_silph',
    name: 'JESSIE & JAMES',
    class: 'Team Rocket',
    team: [
      { speciesId: 52, level: 36 },  // Meowth
      { speciesId: 24, level: 36 },  // Arbok
      { speciesId: 110, level: 36 }, // Weezing
    ],
    prizeMoney: 1440,
    dialogue: {
      before: [
        'JESSIE & JAMES: Well,\nwell, well...',
        "If it isn't the\ntwerp who keeps\nruining our plans!",
        'Prepare for trouble,\nfor the very last time!',
        'And make it double,\nthis will be sublime!',
        "MEOWTH: The boss\nwon't be happy if we\nlose again!",
        "Then let's not lose!\nGo, ARBOK! Go, WEEZING!",
      ],
      after: ["We're blasting off\nagaaaain!"],
    },
  },
};
