import { describe, it, expect } from 'vitest';
import {
  oakStage,
  applyOakStage,
  applyPikachuGrant,
  applyParcelDelivery,
  shouldTriggerLabRivalBattle,
  labRivalTriggerOutcome,
  OAK_DIALOGUE,
  OakStage,
  LAB_MAP_ID,
  LAB_RIVAL_NPC_ID,
  LAB_RIVAL_TRAINER_ID,
  RIVAL_BATTLE_LAB_FLAG,
  HAS_PIKACHU_FLAG,
  DELIVERED_PARCEL_FLAG,
  HAS_POKEDEX_FLAG,
  OAKS_PARCEL_ITEM,
  POKEDEX_ITEM,
  POKE_BALL_ITEM,
  POKE_BALL_REWARD,
  PIKACHU_SPECIES_ID,
  PIKACHU_LEVEL,
} from '../../src/logic/oakLab';
import { shouldGiveOaksParcel, PARCEL_MART_ID } from '../../src/logic/oaksParcel';
import { shouldSkipNPC } from '../../src/logic/npcVisibility';
import { syncDerivedStoryFlags } from '../../src/logic/storyFlagSync';
import { PlayerState } from '../../src/entities/Player';
import { ALL_MAPS } from '../../src/data/maps';
import { ITEMS } from '../../src/data/items';
import { POKEMON_DATA } from '../../src/data/pokemon';
import { PRESETS } from '../../src/data/saveEditorPresets';
import { NPCData } from '../../src/types/map.types';

/** A PlayerState seeded with flags and bag contents, as the scene would have it. */
function player(flags: Record<string, boolean> = {}, bag: Record<string, number> = {}): PlayerState {
  const s = new PlayerState();
  Object.assign(s.storyFlags, flags);
  for (const [id, n] of Object.entries(bag)) s.addItem(id, n);
  return s;
}

const BOOLS = [false, true];
/** The three inputs oakStage() reads, as a printable label. */
function label(pikachu: boolean, parcel: boolean, delivered: boolean): string {
  return `pikachu=${pikachu} parcelInBag=${parcel} delivered=${delivered}`;
}

describe('oakStage', () => {
  // Every combination of the three inputs, including the ones the real game
  // cannot reach (a delivered parcel still in the bag, a parcel before Pikachu).
  // Those are reachable through the save editor, so they are pinned to whatever
  // handleOak() does today rather than left undefined.
  const table: Array<[boolean, boolean, boolean, OakStage]> = [
    [false, false, false, 'give_pikachu'],
    [false, false, true, 'give_pikachu'],   // impossible: delivered without Pikachu
    [false, true, false, 'give_pikachu'],   // impossible: parcel before Pikachu
    [false, true, true, 'give_pikachu'],    // impossible
    [true, false, false, 'awaiting_parcel'],
    [true, false, true, 'post_delivery'],
    [true, true, false, 'deliver_parcel'],
    [true, true, true, 'post_delivery'],    // impossible: parcel back in the bag
  ];

  it.each(table)('%s/%s/%s -> %s', (pikachu, parcel, delivered, stage) => {
    const flags: Record<string, boolean> = {};
    if (pikachu) flags[HAS_PIKACHU_FLAG] = true;
    if (delivered) flags[DELIVERED_PARCEL_FLAG] = true;
    const state = player(flags, parcel ? { [OAKS_PARCEL_ITEM]: 1 } : {});
    expect(oakStage(state), label(pikachu, parcel, delivered)).toBe(stage);
  });

  it('covers all 8 flag combinations', () => {
    expect(table).toHaveLength(BOOLS.length ** 3);
  });

  it('the Pikachu grant outranks every other branch', () => {
    // handleOak() checks has_pikachu first, so a save with the parcel and the
    // Pokedex but no Pikachu flag still gets the starter speech.
    const state = player(
      { [DELIVERED_PARCEL_FLAG]: true, [HAS_POKEDEX_FLAG]: true },
      { [OAKS_PARCEL_ITEM]: 1 },
    );
    expect(oakStage(state)).toBe('give_pikachu');
  });

  it('has_pokedex is not read by the stage choice (delivered_parcel is)', () => {
    expect(oakStage(player({ [HAS_PIKACHU_FLAG]: true, [HAS_POKEDEX_FLAG]: true })))
      .toBe('awaiting_parcel');
  });
});

describe('OAK_DIALOGUE', () => {
  it('pins the exact lines of every stage', () => {
    expect(OAK_DIALOGUE.give_pikachu).toEqual([
      "OAK: Ah, {PLAYER}!\nI've been waiting\nfor you!",
      'I have a POKeMON\nhere for you!',
      'This PIKACHU is quite\nenergetic!',
      'Go on! Take it with\nyou on your journey!',
      '{PLAYER} received\nPIKACHU!',
    ]);
    expect(OAK_DIALOGUE.deliver_parcel).toEqual([
      "OAK: Oh! That's the\nparcel I was waiting\nfor!",
      'Thank you, {PLAYER}!',
      'OAK: I have something\nfor you in return!',
      "{PLAYER} handed over\nthe OAK'S PARCEL!",
      'OAK: This is a\nPOKeDEX!',
      "It automatically\nrecords data on\nPOKeMON you've seen\nor caught!",
      '{PLAYER} received\nthe POKeDEX!',
      'Here, take these\ntoo!',
      '{PLAYER} received\n5 POKe BALLs!',
    ]);
    expect(OAK_DIALOGUE.post_delivery).toEqual([
      'OAK: Good luck filling\nup that POKeDEX!',
      'The world is full of\namazing POKeMON!',
    ]);
    expect(OAK_DIALOGUE.awaiting_parcel).toEqual([
      'OAK: Go explore the\nworld with PIKACHU!',
      'The VIRIDIAN CITY\nMart might have\nsomething for me...',
    ]);
  });

  it('every stage has dialogue, and only {PLAYER} is substituted', () => {
    const stages: OakStage[] = ['give_pikachu', 'deliver_parcel', 'post_delivery', 'awaiting_parcel'];
    for (const stage of stages) {
      expect(OAK_DIALOGUE[stage].length, stage).toBeGreaterThan(0);
      for (const line of OAK_DIALOGUE[stage]) {
        expect(line.match(/\{[A-Z]+\}/g) ?? [], line).toEqual(
          (line.match(/\{PLAYER\}/g) ?? []),
        );
      }
    }
  });

  it('the Poke Ball count in the speech matches the count granted', () => {
    expect(OAK_DIALOGUE.deliver_parcel.join('\n')).toContain(`${POKE_BALL_REWARD} POKe BALLs`);
  });
});

describe('applyPikachuGrant', () => {
  it('adds a Lv5 Pikachu and sets has_pikachu', () => {
    const state = player();
    applyPikachuGrant(state);
    expect(state.party).toHaveLength(1);
    expect(state.party[0].speciesId).toBe(PIKACHU_SPECIES_ID);
    expect(state.party[0].level).toBe(PIKACHU_LEVEL);
    expect(state.storyFlags[HAS_PIKACHU_FLAG]).toBe(true);
  });

  it('grants nothing from the bag', () => {
    const state = player();
    applyPikachuGrant(state);
    expect(state.bag).toEqual({});
  });

  it('the species id really is PIKACHU', () => {
    expect(POKEMON_DATA[PIKACHU_SPECIES_ID].name).toBe('PIKACHU');
  });
});

describe('applyParcelDelivery', () => {
  it('takes the parcel and grants the Pokedex plus 5 Poke Balls', () => {
    const state = player({ [HAS_PIKACHU_FLAG]: true }, { [OAKS_PARCEL_ITEM]: 1 });
    applyParcelDelivery(state);
    expect(state.hasItem(OAKS_PARCEL_ITEM)).toBe(false);
    expect(state.bag[POKEDEX_ITEM]).toBe(1);
    expect(state.bag[POKE_BALL_ITEM]).toBe(POKE_BALL_REWARD);
  });

  it('sets delivered_parcel and has_pokedex together, never one alone', () => {
    const state = player({ [HAS_PIKACHU_FLAG]: true }, { [OAKS_PARCEL_ITEM]: 1 });
    expect(state.storyFlags[DELIVERED_PARCEL_FLAG]).toBeUndefined();
    expect(state.storyFlags[HAS_POKEDEX_FLAG]).toBeUndefined();
    applyParcelDelivery(state);
    expect(state.storyFlags[DELIVERED_PARCEL_FLAG]).toBe(true);
    expect(state.storyFlags[HAS_POKEDEX_FLAG]).toBe(true);
  });

  it('adds to an existing Poke Ball stack rather than replacing it', () => {
    const state = player({ [HAS_PIKACHU_FLAG]: true }, { [OAKS_PARCEL_ITEM]: 1, [POKE_BALL_ITEM]: 3 });
    applyParcelDelivery(state);
    expect(state.bag[POKE_BALL_ITEM]).toBe(3 + POKE_BALL_REWARD);
  });

  it('leaves the party untouched', () => {
    const state = player({ [HAS_PIKACHU_FLAG]: true }, { [OAKS_PARCEL_ITEM]: 1 });
    applyPikachuGrant(state);
    applyParcelDelivery(state);
    expect(state.party).toHaveLength(1);
  });

  it('every item it moves is a real item', () => {
    for (const id of [OAKS_PARCEL_ITEM, POKEDEX_ITEM, POKE_BALL_ITEM]) {
      expect(ITEMS[id], id).toBeDefined();
    }
  });
});

describe('the chain end to end', () => {
  it('walks give_pikachu -> awaiting_parcel -> deliver_parcel -> post_delivery', () => {
    const state = player();

    expect(oakStage(state)).toBe('give_pikachu');
    applyOakStage('give_pikachu', state);

    expect(oakStage(state)).toBe('awaiting_parcel');
    // The Viridian mart is the only place the parcel comes from.
    expect(shouldGiveOaksParcel(PARCEL_MART_ID, state.storyFlags, id => state.hasItem(id))).toBe(true);
    state.addItem(OAKS_PARCEL_ITEM);

    expect(oakStage(state)).toBe('deliver_parcel');
    applyOakStage('deliver_parcel', state);

    expect(oakStage(state)).toBe('post_delivery');
    expect(state.bag[POKEDEX_ITEM]).toBe(1);
    expect(state.bag[POKE_BALL_ITEM]).toBe(POKE_BALL_REWARD);
    // ...and the mart will not hand out a second parcel.
    expect(shouldGiveOaksParcel(PARCEL_MART_ID, state.storyFlags, id => state.hasItem(id))).toBe(false);
  });

  it('talking to Oak again after delivery grants nothing (idempotent)', () => {
    const state = player();
    applyOakStage(oakStage(state), state);   // Pikachu
    state.addItem(OAKS_PARCEL_ITEM);
    applyOakStage(oakStage(state), state);   // delivery
    const before = { bag: { ...state.bag }, flags: { ...state.storyFlags }, party: state.party.length };

    for (let i = 0; i < 3; i++) applyOakStage(oakStage(state), state);

    expect(state.bag).toEqual(before.bag);
    expect(state.storyFlags).toEqual(before.flags);
    expect(state.party).toHaveLength(before.party);
  });

  it('a second Pikachu speech is impossible once the flag is up', () => {
    const state = player();
    applyOakStage('give_pikachu', state);
    applyOakStage(oakStage(state), state);
    expect(state.party).toHaveLength(1);
  });

  it('the awaiting_parcel and post_delivery stages have no effects at all', () => {
    for (const stage of ['awaiting_parcel', 'post_delivery'] as OakStage[]) {
      const state = player({ [HAS_PIKACHU_FLAG]: true }, { [POKE_BALL_ITEM]: 2 });
      applyOakStage(stage, state);
      expect(state.bag, stage).toEqual({ [POKE_BALL_ITEM]: 2 });
      expect(state.storyFlags, stage).toEqual({ [HAS_PIKACHU_FLAG]: true });
      expect(state.party, stage).toHaveLength(0);
    }
  });

  it('the delivered flag is what unlocks the Route 22 rival (cross-link)', () => {
    const rival22 = ALL_MAPS['route22'].npcs.find(n => n.id === 'rival_route22') as NPCData;
    expect(rival22).toBeDefined();
    const skip = (flags: Record<string, boolean>) =>
      shouldSkipNPC(rival22, flags, [], [], () => false);
    expect(skip({})).toBe(true);
    expect(skip({ [DELIVERED_PARCEL_FLAG]: true })).toBe(false);
    // has_pokedex on its own is not enough: the gate reads delivered_parcel.
    expect(skip({ [HAS_POKEDEX_FLAG]: true })).toBe(true);
  });
});

describe('shouldTriggerLabRivalBattle', () => {
  // 4 flag combinations x in/out of the lab. The trigger runs on the exit warp
  // tile, so a true verdict means the player does not leave.
  const cases: Array<[boolean, boolean, boolean]> = [];
  for (const pikachu of BOOLS) {
    for (const fought of BOOLS) {
      cases.push([pikachu, fought, pikachu && !fought]);
    }
  }

  it.each(cases)('in the lab, pikachu=%s rival_battle_lab=%s -> %s', (pikachu, fought, expected) => {
    const flags: Record<string, boolean> = {};
    if (pikachu) flags[HAS_PIKACHU_FLAG] = true;
    if (fought) flags[RIVAL_BATTLE_LAB_FLAG] = true;
    expect(shouldTriggerLabRivalBattle(LAB_MAP_ID, { storyFlags: flags })).toBe(expected);
  });

  it.each(cases)('off-map, pikachu=%s rival_battle_lab=%s -> false', (pikachu, fought) => {
    const flags: Record<string, boolean> = {};
    if (pikachu) flags[HAS_PIKACHU_FLAG] = true;
    if (fought) flags[RIVAL_BATTLE_LAB_FLAG] = true;
    for (const map of ['pallet_town', 'players_house_1f', 'route1', 'viridian_city']) {
      expect(shouldTriggerLabRivalBattle(map, { storyFlags: flags }), map).toBe(false);
    }
  });

  it('fires exactly once: the flag closes it for good', () => {
    const state = player({ [HAS_PIKACHU_FLAG]: true });
    expect(shouldTriggerLabRivalBattle(LAB_MAP_ID, state)).toBe(true);
    state.storyFlags[RIVAL_BATTLE_LAB_FLAG] = true;
    expect(shouldTriggerLabRivalBattle(LAB_MAP_ID, state)).toBe(false);
  });

  it('the delivered parcel does not reopen it', () => {
    const flags = { [HAS_PIKACHU_FLAG]: true, [RIVAL_BATTLE_LAB_FLAG]: true, [DELIVERED_PARCEL_FLAG]: true };
    expect(shouldTriggerLabRivalBattle(LAB_MAP_ID, { storyFlags: flags })).toBe(false);
  });
});

describe('labRivalTriggerOutcome', () => {
  it('battles when the rival is on the map and has not been beaten', () => {
    expect(labRivalTriggerOutcome({ rivalNpcPresent: true, defeatedTrainers: [] })).toBe('battle');
  });

  it('just sets the flag when the rival sprite is missing', () => {
    expect(labRivalTriggerOutcome({ rivalNpcPresent: false, defeatedTrainers: [] })).toBe('flag_only');
  });

  it('just sets the flag when rival_lab is already beaten (re-entry after the battle)', () => {
    expect(labRivalTriggerOutcome({ rivalNpcPresent: true, defeatedTrainers: [LAB_RIVAL_TRAINER_ID] }))
      .toBe('flag_only');
    expect(labRivalTriggerOutcome({ rivalNpcPresent: false, defeatedTrainers: [LAB_RIVAL_TRAINER_ID] }))
      .toBe('flag_only');
  });

  it('other defeated trainers do not suppress it', () => {
    expect(labRivalTriggerOutcome({ rivalNpcPresent: true, defeatedTrainers: ['rival_route22', 'brock'] }))
      .toBe('battle');
  });
});

describe('lab rival wiring', () => {
  it('the lab map and the rival NPC exist under the ids the scene looks up', () => {
    const lab = ALL_MAPS[LAB_MAP_ID];
    expect(lab).toBeDefined();
    expect(lab.npcs.some(n => n.id === LAB_RIVAL_NPC_ID)).toBe(true);
    expect(lab.npcs.some(n => n.id === 'oak')).toBe(true);
    expect(lab.warps.length).toBeGreaterThan(0);
  });

  it('rival_battle_lab is the same flag syncDerivedStoryFlags derives from rival_lab', () => {
    const state = new PlayerState();
    state.defeatedTrainers.push(LAB_RIVAL_TRAINER_ID);
    syncDerivedStoryFlags(state);
    expect(state.storyFlags[RIVAL_BATTLE_LAB_FLAG]).toBe(true);
    // ...so a save made mid-battle re-opens the lab door instead of looping.
    expect(shouldTriggerLabRivalBattle(LAB_MAP_ID, state)).toBe(false);
  });

  it('every Pallet flag string is offered by the save editor', () => {
    const applied = new Set<string>();
    for (const preset of PRESETS) {
      const save: any = {
        playerName: 'TEST', rivalName: 'RIVAL', storyFlags: {}, bag: {}, party: [],
        badges: [], defeatedTrainers: [], money: 0, currentMap: 'pallet_town',
        playerX: 0, playerY: 0,
      };
      try { preset.apply(save); } catch { continue; }
      for (const k of Object.keys(save.storyFlags ?? {})) applied.add(k);
    }
    for (const flag of [HAS_PIKACHU_FLAG, DELIVERED_PARCEL_FLAG, HAS_POKEDEX_FLAG, RIVAL_BATTLE_LAB_FLAG]) {
      expect(applied, flag).toContain(flag);
    }
  });
});
