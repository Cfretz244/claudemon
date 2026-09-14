// Forced one-off wild encounters that the story fires at the player: the two
// sleeping Snorlax (woken with the POKe FLUTE) and the Marowak ghost on the
// stairs into Pokemon Tower 7F.
//
// Extracted verbatim from OverworldScene (`handleSnorlax` and the Pokemon Tower
// branch of `warpTo`). Behaviour-preserving: the same conditions, in the same
// order, with the same message strings, the same species/level and the same
// flag names. The scene still owns the Phaser parts — the text box and
// `startWildBattle()`'s transition — and it still writes the flag itself, at
// the moment this module's `flagTiming` records.
//
// Both encounters are "used up" by a flag rather than by winning: catching the
// Pokemon, knocking it out and running all consume it, exactly like the static
// legendaries in `src/data/staticLegendaries.ts`. They are NOT in that registry
// because neither is a plain "talk to it, battle it" NPC: Snorlax needs an item
// in the bag and speaks two different scripts depending on whether it is there
// (neither of them `npc.dialogue`), and Marowak has no NPC at all — it fires on
// a warp. Their shared shape is `ForcedEncounter` below.

/** Species/level of the wild Pokemon a forced encounter spawns. */
export interface ForcedEncounterBattle {
  speciesId: number;
  level: number;
}

/**
 * When the scene writes the encounter's flag, relative to the text box:
 *  - `on_trigger`: before the messages are shown (Marowak — the flag is set the
 *    moment the warp is intercepted, so leaving the text box up and quitting
 *    still consumes the encounter on the next save).
 *  - `on_battle_start`: in the text box's onComplete, immediately after
 *    `startWildBattle()` (Snorlax, like the legendaries). That still lands in
 *    the save: `startWildBattle` snapshots `playerState` inside the battle
 *    transition's callback, which runs a frame later, after this write.
 */
export type ForcedEncounterFlagTiming = 'on_trigger' | 'on_battle_start';

export interface ForcedEncounter {
  /** `battle`: show `messages`, then fight. `message`: text only. `none`: nothing happens. */
  outcome: 'battle' | 'message' | 'none';
  /** Exactly what the scene shows; `[]` means it stays silent. */
  messages: string[];
  /** The wild Pokemon to spawn, or null when there is no battle. */
  battle: ForcedEncounterBattle | null;
  /** The story flag the scene sets, or null when nothing is written. */
  flag: string | null;
  /** When that flag is written. Null whenever `flag` is null. */
  flagTiming: ForcedEncounterFlagTiming | null;
}

const NOTHING: ForcedEncounter = {
  outcome: 'none', messages: [], battle: null, flag: null, flagTiming: null,
};

// ── Snorlax ──────────────────────────────────────────────────────────────────

/**
 * The two Snorlax NPC ids, as registered in `OverworldScene.getNpcHandler()`
 * and read one by one by `logic/npcVisibility.ts`. `snorlaxClearedFlag()` must
 * agree with the flags that file checks; `forcedEncounters.test.ts` pins that.
 */
export const SNORLAX_NPC_IDS = ['snorlax_route12', 'snorlax_route16'] as const;
export type SnorlaxNpcId = typeof SNORLAX_NPC_IDS[number];

/** The key item that wakes a Snorlax (Mr. Fuji's reward, `data/items.ts`). */
export const POKE_FLUTE_ITEM = 'poke_flute';

/** A woken Snorlax is a Lv30 wild battle. */
export const SNORLAX_SPECIES_ID = 143;
export const SNORLAX_LEVEL = 30;

/**
 * What the scene says with no flute. Note this is NOT the NPC's `dialogue` from
 * the map data: the handler ignores that and shows these four lines, which are
 * the NPC's three plus the hint.
 */
export const SNORLAX_ASLEEP_MESSAGES: readonly string[] = [
  'A huge POKeMON is\nblocking the path!',
  "It's sleeping soundly...",
  'Zzz... Zzz...',
  'Maybe a melody could\nwake it up?',
];

/** What the scene says with the flute. The first line carries the player's name. */
export function snorlaxWakeMessages(playerName: string): string[] {
  return [
    `${playerName} used the\nPOKe FLUTE!`,
    'SNORLAX woke up!\nIt looks angry!',
  ];
}

/** The flag that removes a cleared Snorlax, keyed by NPC id (`<id>_cleared`). */
export function snorlaxClearedFlag(npcId: string): string {
  return `${npcId}_cleared`;
}

/** The read-only slice of PlayerState the Snorlax branch needs. */
export interface SnorlaxState {
  name: string;
  hasItem(itemId: string): boolean;
}

/**
 * Talking to a sleeping Snorlax. With the POKe FLUTE in the bag it wakes into a
 * Lv30 wild battle and its `<id>_cleared` flag goes up as the battle launches;
 * without it the player is only told to find a melody. Either way the
 * interaction is consumed (`handleSnorlax` always returns true), and the flag is
 * never checked here — a cleared Snorlax is hidden by `shouldSkipNPC()`, so this
 * is never reached for one.
 */
export function snorlaxEncounter(npcId: string, state: SnorlaxState): ForcedEncounter {
  if (!state.hasItem(POKE_FLUTE_ITEM)) {
    return {
      outcome: 'message',
      messages: SNORLAX_ASLEEP_MESSAGES.slice(),
      battle: null,
      flag: null,
      flagTiming: null,
    };
  }
  return {
    outcome: 'battle',
    messages: snorlaxWakeMessages(state.name),
    battle: { speciesId: SNORLAX_SPECIES_ID, level: SNORLAX_LEVEL },
    flag: snorlaxClearedFlag(npcId),
    flagTiming: 'on_battle_start',
  };
}

// ── Marowak's ghost ──────────────────────────────────────────────────────────

/** The only map whose entry fires the ghost. */
export const MAROWAK_MAP_ID = 'pokemon_tower_7f';

/** The ghost is a Lv30 wild Marowak. */
export const MAROWAK_SPECIES_ID = 105;
export const MAROWAK_LEVEL = 30;

/** One-shot flag: set on the first entry, checked on every later one. */
export const MAROWAK_GHOST_FLAG = 'marowak_ghost_defeated';

export const MAROWAK_MESSAGES: readonly string[] = [
  "The SILPH SCOPE\nreveals the GHOST's\ntrue identity!",
  "It's the restless\nspirit of MAROWAK!",
];

/** The read-only slice of PlayerState the ghost branch needs. */
export interface MarowakState {
  storyFlags: Record<string, boolean>;
}

/**
 * Warping into Pokemon Tower 7F. The first entry is ambushed: the flag is set
 * straight away (`on_trigger`), the two reveal lines run, and the Lv30 Marowak
 * battle starts from the text box's onComplete — the warp itself never happens,
 * the player is returned to 7F by the battle's return data. Every later entry,
 * and every other map, passes through untouched.
 *
 * Reached only after `checkEntryGates()` has let the player through, and 7F's
 * gate requires the SILPH SCOPE — so the ghost is always revealed, never fought
 * blind. `forcedEncounters.test.ts` pins that pairing.
 */
export function marowakAmbush(mapId: string, state: MarowakState): ForcedEncounter {
  if (mapId !== MAROWAK_MAP_ID || state.storyFlags[MAROWAK_GHOST_FLAG]) return NOTHING;
  return {
    outcome: 'battle',
    messages: MAROWAK_MESSAGES.slice(),
    battle: { speciesId: MAROWAK_SPECIES_ID, level: MAROWAK_LEVEL },
    flag: MAROWAK_GHOST_FLAG,
    flagTiming: 'on_trigger',
  };
}
