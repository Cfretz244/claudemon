// Sign text registry keyed by `<mapId>:<x>,<y>`, extracted from
// OverworldScene.readSign (which keeps the Game Corner poster special case).

export const SIGNS: Record<string, string[]> = {
  'pallet_town:7,9': ['PALLET TOWN', 'Shades of your journey\nawait!'],
  'pallet_town:11,16': ["PROF. OAK's LAB"],
  'viridian_city:7,13': ['VIRIDIAN CITY', 'The Eternally Green\nParadise!'],
  'viridian_city:12,13': ['TRAINER TIPS', "If your POKeMON's HP\nreaches 0, it faints!"],
  'route1:7,10': ['ROUTE 1', 'PALLET TOWN -\nVIRIDIAN CITY'],
  'pewter_city:3,9': ['PEWTER CITY GYM\nLEADER: BROCK', 'The Rock-Solid\nPOKeMON Trainer!'],
  'route3:41,6': ['ROUTE 3', 'MT. MOON ahead'],
  'celadon_city:12,12': ['CELADON CITY GYM\nLEADER: ERIKA', 'The Nature-Loving\nPrincess!'],
  'celadon_city:9,10': ['CELADON CITY', 'The City of Rainbow\nDreams!'],
  'route5:12,18': ['UNDERGROUND PATH', 'Route 5 - Route 6'],
  'route6:12,3': ['UNDERGROUND PATH', 'Route 5 - Route 6'],
  'route7:12,3': ['UNDERGROUND PATH', 'Route 7 - Route 8'],
  'route8:13,3': ['UNDERGROUND PATH', 'Route 7 - Route 8'],
  // Pewter Museum 1F — Fossil Wing
  'pewter_museum_1f:2,3': ['KABUTOPS FOSSIL', 'A vicious POKeMON\nthat lived in\nprimordial seas.'],
  'pewter_museum_1f:6,3': ['AERODACTYL FOSSIL', 'A ferocious POKeMON\nfrom the age of\ndinosaurs.'],
  'pewter_museum_1f:10,3': ['OMANYTE SHELL', 'A spiral shell of an\nancient POKeMON that\nlived in the sea.'],
  'pewter_museum_1f:14,3': ['FOSSIL DIG TOOLS', 'Tools used to\ncarefully excavate\nfossils from rock.'],
  // Pewter Museum 2F — Space Wing
  'pewter_museum_2f:2,3': ['MOON STONE', 'A mysterious stone\nfound at MT. MOON.\nIt radiates light.'],
  'pewter_museum_2f:6,3': ['METEORITE SAMPLE', 'A meteorite that\ncontains amino acids\nfrom outer space.'],
  'pewter_museum_2f:10,3': ['STAR CHART', 'A chart showing the\nconstellations as\nseen from KANTO.'],
  'pewter_museum_2f:14,3': ['ROCKET FUEL SAMPLE', 'Fuel used to launch\nthe first POKeMON\ninto space!'],
  'pewter_museum_2f:7,5': ['SPACE SHUTTLE', 'A model of the space\nshuttle that carried\nthe first POKeMON.'],
  'pewter_museum_2f:10,5': ['SPACE SHUTTLE', 'CLEFAIRY was the\nfirst POKeMON to\nride a shuttle!'],
  'pewter_museum_2f:2,8': ['SPACE PIKACHU PHOTO', "A photo of PIKACHU\nin a tiny space\nsuit. How cute!"],
  'pewter_museum_2f:14,8': ['LUNAR SOIL SAMPLE', 'Soil brought back\nfrom the moon.\nIt sparkles faintly.'],
};
