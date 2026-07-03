// Declarative table for "condition → dialogue → reward" NPCs, extracted from
// the OverworldScene.interactWithNPC if/else ladder. Dialogue may contain
// {PLAYER}/{RIVAL} placeholders — the scene formats them before display.
//
// resolve() returns what to show and apply, or null to fall through to the
// NPC's default map dialogue. `grantsPokemon` is handled by the scene
// executor (createPokemon + addToParty before onComplete, cry after), since
// data modules must not construct Pokemon or play sounds themselves.

import { PlayerState } from '../entities/Player';
import { getHappiness } from '../entities/Pokemon';

export interface GiftNpcResult {
  dialogue: string[];
  onComplete?: (state: PlayerState) => void;
  grantsPokemon?: { speciesId: number; level: number; cryPitch: number };
}

export interface GiftNpcEntry {
  id: string;
  resolve(state: PlayerState): GiftNpcResult | null;
}

export const GIFT_NPCS: Record<string, GiftNpcEntry> = {
  // Museum ticket clerk: charges $50 for 2F access
  museum_ticket_clerk: {
    id: 'museum_ticket_clerk',
    resolve(state) {
      if (state.storyFlags['museum_2f_ticket']) {
        return { dialogue: ['Please enjoy the\nspace exhibit\nupstairs!'] };
      }
      if (state.money >= 50) {
        return {
          dialogue: [
            "That'll be $50\nfor admission to\nthe 2nd floor.",
            '{PLAYER} paid $50.',
            'Thank you! Please\nenjoy the exhibit!',
          ],
          onComplete: (s) => {
            s.money -= 50;
            s.storyFlags['museum_2f_ticket'] = true;
          },
        };
      }
      return {
        dialogue: ["I'm sorry, you\ndon't have enough\nmoney.", "It's $50 for a\nticket to the\n2nd floor."],
      };
    },
  },

  // Bill gives SS Ticket
  bill: {
    id: 'bill',
    resolve(state) {
      if (!state.storyFlags['bill_helped']) {
        return {
          dialogue: [
            "BILL: Hi! I'm a true\nPOKeMON FANATIC!",
            'I got mixed up in one\nof my experiments...',
            'Thanks for listening!\nHere, take this!',
            '{PLAYER} received\nS.S. TICKET!',
          ],
          onComplete: (s) => {
            s.addItem('ss_ticket');
            s.storyFlags['bill_helped'] = true;
          },
        };
      }
      return {
        dialogue: [
          'BILL: The S.S. ANNE\nis docked at VERMILION!',
          'Use the ticket I gave\nyou to board!',
        ],
      };
    },
  },

  // SS Anne Captain gives HM01 Cut
  ss_anne_captain: {
    id: 'ss_anne_captain',
    resolve(state) {
      if (!state.storyFlags['got_hm01']) {
        return {
          dialogue: [
            'CAPTAIN: Ugh... I feel\nseasick...',
            'Thank you for\nchecking on me!',
            'Here, take this HM\nas my thanks!',
            '{PLAYER} received\nHM01 CUT!',
          ],
          onComplete: (s) => {
            s.addItem('hm01_cut');
            s.storyFlags['got_hm01'] = true;
            s.storyFlags['ss_anne_departed'] = true;
          },
        };
      }
      return { dialogue: ['CAPTAIN: The ship will\nbe departing soon!'] };
    },
  },

  // Mr. Fuji gives Poke Flute
  mr_fuji: {
    id: 'mr_fuji',
    resolve(state) {
      if (!state.storyFlags['got_poke_flute']) {
        return {
          dialogue: [
            'MR. FUJI: Thank you\nfor saving me!',
            'Those TEAM ROCKET\nruffians held me\nhostage!',
            'Please, take this\nPOKe FLUTE as thanks!',
            '{PLAYER} received\nPOKe FLUTE!',
          ],
          onComplete: (s) => {
            s.addItem('poke_flute');
            s.storyFlags['got_poke_flute'] = true;
          },
        };
      }
      return {
        dialogue: [
          'MR. FUJI: Rest their\nsouls in peace...',
          'Use the POKe FLUTE\nto wake sleeping\nPOKeMON!',
        ],
      };
    },
  },

  // Celadon Tea Lady gives Tea
  celadon_tea_lady: {
    id: 'celadon_tea_lady',
    resolve(state) {
      if (!state.hasItem('tea') && !state.storyFlags['saffron_open']) {
        return {
          dialogue: [
            'I work at CELADON\nMANSION.',
            "Here, have some TEA!\nIt's very refreshing!",
            '{PLAYER} received\nTEA!',
          ],
          onComplete: (s) => {
            s.addItem('tea');
          },
        };
      }
      return {
        dialogue: [
          'Give the TEA to the\nguard at SAFFRON CITY!',
          'He loves a good cup\nof TEA!',
        ],
      };
    },
  },

  // Pokemon Fan Club Chairman gives Bike Voucher
  fan_club_chairman: {
    id: 'fan_club_chairman',
    resolve(state) {
      if (!state.storyFlags['got_bike_voucher']) {
        return {
          dialogue: [
            'CHAIRMAN: Welcome to\nthe POKeMON FAN CLUB!',
            "I'm the chairman!\nLet me tell you about\nmy darling RAPIDASH!",
            "It gallops at\n150 mph! Isn't that\namazing?!",
            '...Oh, you listened\nto my story!',
            'Here, take this\nBIKE VOUCHER as\nmy thanks!',
            '{PLAYER} received\nBIKE VOUCHER!',
          ],
          onComplete: (s) => {
            s.addItem('bike_voucher');
            s.storyFlags['got_bike_voucher'] = true;
          },
        };
      }
      return {
        dialogue: [
          'CHAIRMAN: Did you get\na BICYCLE yet?',
          'Take the voucher to\nthe BIKE SHOP in\nCERULEAN CITY!',
        ],
      };
    },
  },

  // Bike Shop Owner redeems Bike Voucher for Bicycle
  bike_shop_owner: {
    id: 'bike_shop_owner',
    resolve(state) {
      if (state.hasItem('bicycle')) {
        return { dialogue: ["How's that BICYCLE\nworking out for you?"] };
      }
      if (state.hasItem('bike_voucher')) {
        return {
          dialogue: [
            'Oh! You have a\nBIKE VOUCHER!',
            'Here you go!\nEnjoy your new\nBICYCLE!',
            '{PLAYER} received\nBICYCLE!',
          ],
          onComplete: (s) => {
            s.useItem('bike_voucher');
            s.addItem('bicycle');
            s.storyFlags['got_bicycle'] = true;
          },
        };
      }
      // Fall through to default dialogue from NPC data
      return null;
    },
  },

  // Oak's Aide on Route 2 gives HM05 Flash
  oaks_aide_route2: {
    id: 'oaks_aide_route2',
    resolve(state) {
      if (state.storyFlags['got_hm05']) {
        return { dialogue: ['Use FLASH to light\nup dark caves!'] };
      }
      return {
        dialogue: [
          "OAK's AIDE: Prof. OAK\nordered me to give\nthis to you!",
          "It's an HM that\nteaches FLASH!",
          '{PLAYER} received\nHM05 FLASH!',
        ],
        onComplete: (s) => {
          s.addItem('hm05_flash');
          s.storyFlags['got_hm05'] = true;
        },
      };
    },
  },

  // Route 16 girl gives HM02 Fly
  route16_fly_girl: {
    id: 'route16_fly_girl',
    resolve(state) {
      if (state.storyFlags['got_hm02']) {
        return { dialogue: ['Fly is so convenient\nfor travel!'] };
      }
      return {
        dialogue: [
          'I love watching my\nPOKeMON fly!',
          'Here, you should have\nthis HM!',
          '{PLAYER} received\nHM02 FLY!',
        ],
        onComplete: (s) => {
          s.addItem('hm02_fly');
          s.storyFlags['got_hm02'] = true;
        },
      };
    },
  },

  // Safari Zone secret house gives HM03 Surf
  safari_secret_house: {
    id: 'safari_secret_house',
    resolve(state) {
      if (state.storyFlags['got_hm03']) {
        return { dialogue: ['You can SURF across\nwater with that!'] };
      }
      return {
        dialogue: [
          'Congratulations on\nmaking it this far!',
          'You reached the\nSECRET HOUSE!',
          'Here, take this HM\nas your prize!',
          '{PLAYER} received\nHM03 SURF!',
        ],
        onComplete: (s) => {
          s.addItem('hm03_surf');
          s.storyFlags['got_hm03'] = true;
        },
      };
    },
  },

  // Safari Warden gives HM04 Strength (requires Gold Teeth)
  safari_warden: {
    id: 'safari_warden',
    resolve(state) {
      if (state.storyFlags['got_hm04']) {
        return { dialogue: ['Those HMs are\nreally something!'] };
      }
      if (state.hasItem('gold_teeth')) {
        return {
          dialogue: [
            'WARDEN: Oh! Those are\nmy teeth!',
            'Thank you so much!\nLet me give you this!',
            '{PLAYER} received\nHM04 STRENGTH!',
          ],
          onComplete: (s) => {
            s.useItem('gold_teeth');
            s.addItem('hm04_strength');
            s.storyFlags['got_hm04'] = true;
          },
        };
      }
      return {
        dialogue: [
          'I lost my teeth\nsomewhere in the\nSAFARI ZONE...',
          "I can't talk well\nwithout them...",
        ],
      };
    },
  },

  // Silph President thanks you and gives Master Ball
  silph_president: {
    id: 'silph_president',
    resolve(state) {
      if (state.storyFlags['silph_co_complete'] && !state.storyFlags['got_master_ball']) {
        return {
          dialogue: [
            'PRESIDENT: You saved\nSILPH CO.!',
            'Please take this as\na token of our\ngratitude!',
            '{PLAYER} received\nMASTER BALL!',
          ],
          onComplete: (s) => {
            s.addItem('master_ball');
            s.storyFlags['got_master_ball'] = true;
          },
        };
      }
      if (state.storyFlags['got_master_ball']) {
        return { dialogue: ['PRESIDENT: Thank you\nfor saving our\ncompany!'] };
      }
      // During Rocket takeover
      return {
        dialogue: [
          'PRESIDENT: Please,\ndefeat GIOVANNI!',
          "He's taken over\nour company!",
        ],
      };
    },
  },

  // Bulbasaur gift - girl in Cerulean house (requires happy Pikachu)
  cerulean_bulbasaur_girl: {
    id: 'cerulean_bulbasaur_girl',
    resolve(state) {
      if (state.storyFlags['got_bulbasaur']) {
        return { dialogue: ['Take good care of\nthat BULBASAUR!'] };
      }
      const pikachu = state.party.find(p => p.speciesId === 25);
      const happiness = pikachu ? getHappiness(pikachu) : 0;
      if (happiness >= 150) {
        return {
          dialogue: [
            'Oh wow! Your PIKACHU\nis so happy!',
            'You must be a great\ntrainer!',
            'I have a BULBASAUR\nthat needs a good\nhome...',
            'Would you take care\nof it for me?',
            '{PLAYER} received\nBULBASAUR!',
          ],
          grantsPokemon: { speciesId: 1, level: 10, cryPitch: 600 },
          onComplete: (s) => {
            s.storyFlags['got_bulbasaur'] = true;
          },
        };
      }
      return {
        dialogue: [
          'I love POKeMON!',
          "I have a BULBASAUR\nI'd like to give away...",
          'But only to a trainer\nwhose PIKACHU is\nreally happy!',
          'Come back when your\nPIKACHU likes you\nmore!',
        ],
      };
    },
  },

  // Charmander gift - trainer on Route 24
  route24_charmander_guy: {
    id: 'route24_charmander_guy',
    resolve(state) {
      if (state.storyFlags['got_charmander']) {
        return { dialogue: ["How's that CHARMANDER\ndoing?", 'Take good care of it!'] };
      }
      return {
        dialogue: [
          'I found this\nCHARMANDER abandoned\non the road...',
          "I'm not a strong\nenough trainer to\nraise it.",
          'You look like you\ncould handle it!\nPlease, take it!',
          '{PLAYER} received\nCHARMANDER!',
        ],
        grantsPokemon: { speciesId: 4, level: 10, cryPitch: 700 },
        onComplete: (s) => {
          s.storyFlags['got_charmander'] = true;
        },
      };
    },
  },

  // Squirtle gift - Officer Jenny in Vermilion (requires Thunder Badge)
  vermilion_officer_jenny: {
    id: 'vermilion_officer_jenny',
    resolve(state) {
      if (state.storyFlags['got_squirtle']) {
        return { dialogue: ['That SQUIRTLE is a\ngood POKeMON!', 'Keep it out of\ntrouble!'] };
      }
      if (state.badges.includes('THUNDER')) {
        return {
          dialogue: [
            'OFFICER JENNY: Hey!\nYou beat LT. SURGE!',
            "I've been looking for\na trainer to take\nthis SQUIRTLE.",
            "It's been causing\ntrouble around town!",
            'I think a strong\ntrainer like you could\nkeep it in line!',
            '{PLAYER} received\nSQUIRTLE!',
          ],
          grantsPokemon: { speciesId: 7, level: 10, cryPitch: 500 },
          onComplete: (s) => {
            s.storyFlags['got_squirtle'] = true;
          },
        };
      }
      return {
        dialogue: [
          "OFFICER JENNY: I'm\nkeeping the peace in\nVERMILION CITY!",
          "There's a mischievous\nSQUIRTLE causing\ntrouble around here...",
          'If only there were a\nstrong trainer to\ntake it...',
        ],
      };
    },
  },

  // Fishing Guru — Old Rod (Vermilion City)
  fishing_guru_vermilion: {
    id: 'fishing_guru_vermilion',
    resolve(state) {
      if (state.storyFlags['got_old_rod']) {
        return { dialogue: ["How's the fishing\ngoing? Keep at it!"] };
      }
      return {
        dialogue: [
          'FISHING GURU: Hello\nthere! I love fishing!',
          'Do you like to fish?\nOf course you do!',
          'I can see it in your\neyes! Here, take this!',
          '{PLAYER} received\nOLD ROD!',
        ],
        onComplete: (s) => {
          s.addItem('old_rod');
          s.storyFlags['got_old_rod'] = true;
        },
      };
    },
  },

  // Fishing Guru — Good Rod (Route 12)
  fishing_guru_route12: {
    id: 'fishing_guru_route12',
    resolve(state) {
      if (state.storyFlags['got_good_rod']) {
        return { dialogue: ['Use the GOOD ROD by\nwater to fish!'] };
      }
      return {
        dialogue: [
          "FISHING GURU: I'm the\nbest fisher on this\nroute!",
          'You look like a real\ngo-getter!',
          "Here, take my spare\nrod! It's a good one!",
          '{PLAYER} received\nGOOD ROD!',
        ],
        onComplete: (s) => {
          s.addItem('good_rod');
          s.storyFlags['got_good_rod'] = true;
        },
      };
    },
  },

  // Fishing Guru — Super Rod (Fuchsia City)
  fishing_guru_fuchsia: {
    id: 'fishing_guru_fuchsia',
    resolve(state) {
      if (state.storyFlags['got_super_rod']) {
        return { dialogue: ['The SUPER ROD can\ncatch any POKeMON!'] };
      }
      return {
        dialogue: [
          "FISHING GURU: I'm the\nFISHING GURU!",
          'You want to fish for\nrare POKeMON, yes?',
          'Then take my best\nrod! Use it well!',
          '{PLAYER} received\nSUPER ROD!',
        ],
        onComplete: (s) => {
          s.addItem('super_rod');
          s.storyFlags['got_super_rod'] = true;
        },
      };
    },
  },
};
