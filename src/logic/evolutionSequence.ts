// Pure, Phaser-free plan for the Gen I evolution sequence.
//
// The sibling of `logic/entranceSpec.ts` and `logic/catchSequenceSpec.ts`:
// nothing here touches Phaser, the scene, canvas or randomness, so "how many
// times does the sprite swap during the strobe", "what does the queue look like
// after two level-ups" and "which move does the new species learn on arrival"
// are unit tests rather than a stopwatch held against a browser.
//
// The behaviour it describes is Gen I's, which differs from what the battle
// scene used to do inline:
//
//   * A level-up evolution is QUEUED during the EXP loop and played AFTER the
//     battle, on the way back to the overworld. Nothing evolves mid-battle.
//   * The player can cancel with B during the strobe. A cancelled evolution is
//     simply dropped: `checkEvolution` re-evaluates at the next level-up, so it
//     is offered again then.
//   * Evolving teaches the moves the NEW species learns at the level the mon is
//     already at — the reason a Lv16 ABRA comes out of the sequence knowing
//     CONFUSION, which ABRA itself never learns.

import { POKEMON_DATA } from '../data/pokemon';

// --- Timing -----------------------------------------------------------------

/** `What? X is evolving!` holds this long and advances itself: not key-gated. */
export const EVO_INTRO_MS = 600;
/** The first silhouette swap is this far from the one before it. */
export const STROBE_START_MS = 500;
/** ...and each following gap is this much of the last one: the strobe speeds up. */
export const STROBE_FACTOR = 0.8;
/** The gap never falls below this, or the swap stops reading as a swap. */
export const STROBE_FLOOR_MS = 60;
/** How long the strobe runs in total before the flash. */
export const STROBE_TOTAL_MS = 4000;
/** The white `screenFlash` that ends the strobe. */
export const EVO_FLASH_MS = 120;
/** How many `sparkle`s go up with the flash. */
export const EVO_SPARKLES = 8;
/** `materialise` for the new form, in colour. */
export const EVO_REVEAL_MS = 300;
/** The soft scale pulse the strobing silhouette breathes with (1.0 <-> this). */
export const EVO_PULSE_SCALE = 1.08;
/**
 * The hard ceiling the renderer races, the same bargain `MAX_WILD_MS` and
 * `maxCatchMs` strike: if a phase overruns we abort, restore, and let the game
 * carry on. 600 + 4000 + 120 + 300 leaves ~3 s for the two key-gated lines.
 */
export const MAX_EVOLUTION_MS = 8000;

/**
 * The times, in ms from the start of the strobe, at which the sprite swaps
 * between the old and the new silhouette.
 *
 * The gap starts at `STROBE_START_MS`, is multiplied by `STROBE_FACTOR` after
 * every swap and never drops below `STROBE_FLOOR_MS`, so the strobe accelerates
 * into a flicker and then holds it — which is what makes the flash at the end
 * land as a release rather than as one more swap.
 *
 * Every returned time is <= `totalMs`, strictly increasing, and the count is
 * finite for any total because the gap has a floor.
 */
export function strobeSchedule(totalMs: number = STROBE_TOTAL_MS): number[] {
  const times: number[] = [];
  const cap = Math.max(0, totalMs);
  let gap = STROBE_START_MS;
  let at = 0;
  for (;;) {
    at += Math.round(gap);
    if (at > cap) break;
    times.push(at);
    gap = Math.max(STROBE_FLOOR_MS, gap * STROBE_FACTOR);
  }
  return times;
}

// --- The queue --------------------------------------------------------------

/** One evolution waiting to be played, by party slot. */
export interface PendingEvolution {
  partyIndex: number;
  toSpecies: number;
}

/**
 * Add an evolution to the queue.
 *
 * At most one entry per party slot survives: a mon that gains several levels in
 * one EXP award is checked after each of them, and only the last answer is the
 * one the sequence should play. The order of the other slots is preserved, so
 * the queue is processed in the order the party earned it.
 */
export function queueEvolution(
  queue: readonly PendingEvolution[],
  partyIndex: number,
  toSpecies: number,
): PendingEvolution[] {
  const next = queue.filter(entry => entry.partyIndex !== partyIndex);
  next.push({ partyIndex, toSpecies });
  return next;
}

// --- Learnset ---------------------------------------------------------------

/**
 * The moves `speciesId` learns at exactly `level`.
 *
 * This is deliberately the same rule `ExperienceSystem.addExperience` applies on
 * a level-up (`learnset.filter(e => e.level === level)`), not the cumulative
 * `logic/learnset.effectiveMovesAt`: evolving is an arrival at a level, so the
 * new species teaches what it teaches AT that level and nothing else. A Lv16
 * ABRA becoming KADABRA learns CONFUSION (KADABRA's level-16 entry); a Lv16
 * CHARMANDER becoming CHARMELEON learns nothing, because CHARMELEON has no
 * level-16 entry.
 */
export function learnsetAtLevel(speciesId: number, level: number): number[] {
  const species = POKEMON_DATA[speciesId];
  if (!species) return [];
  return species.learnset.filter(entry => entry.level === level).map(entry => entry.moveId);
}

// --- Text -------------------------------------------------------------------

/** The three lines the sequence can show, already wrapped for the text box. */
export interface EvolutionLines {
  /** Shown as the field clears. Auto-advances after `EVO_INTRO_MS`. */
  evolving: string;
  /** Shown when B cancelled the strobe. Key-gated. */
  stopped: string;
  /** Shown once the new form is on screen. Key-gated. */
  congratulations: string;
}

/**
 * `name` is what the mon is CALLED — its nickname when it has one, the species
 * name otherwise — because a nickname survives evolution (`evolvePokemon` only
 * touches `speciesId` and the stats). `toName` is the new species' name, which
 * is what the player is being told.
 */
export function evolutionLines(name: string, toName: string): EvolutionLines {
  return {
    evolving: `What? ${name}\nis evolving!`,
    stopped: `Huh? ${name}\nstopped evolving!`,
    congratulations: `Congratulations! Your\n${name} evolved\ninto ${toName}!`,
  };
}
