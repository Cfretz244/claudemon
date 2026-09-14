// Forced one-off wild encounters that the story fires at the player: the two
// sleeping Snorlax (woken with the POKe FLUTE) and the Marowak ghost that
// guards Pokemon Tower 7F.
//
// Extracted from OverworldScene (`handleSnorlax` and the Pokemon Tower branch
// of `warpTo`): the same conditions, in the same order, with the same message
// strings, species/level and flag names. The scene still owns the Phaser parts
// — the text box and `startWildBattle()`'s transition — and it still writes the
// flag itself, at the moment this module's `flagTiming` records.
//
// Snorlax is "used up" by a flag rather than by winning: catching it, knocking
// it out and running all consume it, exactly like the static legendaries in
// `src/data/staticLegendaries.ts`. Marowak is not — Gen I leaves the ghost on
// the stairs until the player actually beats or catches it, so its flag is
// written `on_victory` (see `clearsForcedEncounter` below, which is what the
// BattleScene asks). Neither is in the legendary registry, because neither is a
// plain "talk to it, battle it" NPC: Snorlax needs an item in the bag and
// speaks two different scripts depending on whether it is there (neither of
// them `npc.dialogue`), and Marowak has no NPC at all — it fires on arrival.
// Their shared shape is `ForcedEncounter` below.

/** Species/level of the wild Pokemon a forced encounter spawns. */
export interface ForcedEncounterBattle {
  speciesId: number;
  level: number;
}

/**
 * When the scene writes the encounter's flag:
 *  - `on_trigger`: before the messages are shown. Nothing uses this any more —
 *    it is what Marowak did before the ghost was fixed to survive a run, and is
 *    kept so the union still describes the option.
 *  - `on_battle_start`: in the text box's onComplete, immediately after
 *    `startWildBattle()` (Snorlax, like the legendaries). That still lands in
 *    the save: `startWildBattle` snapshots `playerState` inside the battle
 *    transition's callback, which runs a frame later, after this write.
 *  - `on_victory`: not by the overworld at all. The scene hands the flag to the
 *    BattleScene as `clearedFlag` and the battle writes it only when the player
 *    wins or catches (`clearsForcedEncounter`); running or blacking out leaves
 *    the encounter standing (Marowak).
 */
export type ForcedEncounterFlagTiming = 'on_trigger' | 'on_battle_start' | 'on_victory';

/** How a wild battle ended, from a forced encounter's point of view. */
export type WildBattleEnd = 'opponent_fainted' | 'caught' | 'ran' | 'player_fainted';

/**
 * Does this ending consume an `on_victory` encounter? Gen I: only beating the
 * Pokemon or catching it. Running away or blacking out leaves it where it was,
 * so the player meets it again on the next visit. BattleScene calls this for
 * every wild ending, with the `clearedFlag` the overworld attached (if any).
 */
export function clearsForcedEncounter(end: WildBattleEnd): boolean {
  return end === 'opponent_fainted' || end === 'caught';
}

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

/** One-shot flag: set when the ghost is beaten or caught, checked on every entry. */
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
 * Arriving on Pokemon Tower 7F. The warp itself always happens: the scene asks
 * this on arrival (`create()`), and while the ghost is still standing it shows
 * the two reveal lines from the 7F landing tile and starts the Lv30 Marowak
 * battle from the text box's onComplete. The flag is NOT written here — it
 * travels to the BattleScene as `clearedFlag` and is written only on a win or a
 * catch (`on_victory`), so running away leaves the ghost on the stairs, as in
 * Gen I. Coming back from that battle is not a fresh arrival (the scene skips
 * this when the map state is kept), so the ambush does not loop; going back
 * down and up the stairs re-fires it, which is the point.
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
    flagTiming: 'on_victory',
  };
}
