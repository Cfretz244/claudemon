/**
 * Pure, Phaser-free resolver that turns a species into a battle-entrance spec
 * and a cry spec.
 *
 * The sibling of `logic/moveAnimationSpec.ts`: nothing here touches Phaser, the
 * scene, canvas or randomness, so the whole species -> arrival mapping is unit
 * testable and a data edit that silently changes how a Pokemon arrives shows up
 * in the snapshot diff.
 *
 * Three keys, zero new species data (see the helper repo's
 * docs/sprite-intro-animations-design.md §4):
 *   - motion class = the shipped 7-way body-shape classifier
 *     (`logic/pokemonShape.ts`)
 *   - colour + cry wave  = the primary type
 *   - mass / rarity      = base HP and catch rate
 * plus a small hand-authored override list (§5) for the icons, which only names
 * a key; the renderer owns the functions.
 *
 * NOTHING CONSUMES THIS YET: the renderer arrives in a later PR.
 */

import { PokemonSpecies, PokemonType } from '../types/pokemon.types';
import { PokemonShape, getShapeForSpecies } from './pokemonShape';

// === Motion class ===

/** The seven body shapes, re-exported under the animation's own name. */
export type EntranceShape = PokemonShape;

/** How the Pokemon gets onto the field: out of the scenery, or out of a ball. */
export type EntranceKind = 'wild' | 'sendout';

/** The small beat played after the body has materialised (design §4). */
export type Flourish = 'hop' | 'shake' | 'stance' | 'settle' | 'bob' | 'tilt' | 'twitch';

/** One flourish per shape — the flourish IS the shape's signature. */
export const SHAPE_FLOURISH: Record<EntranceShape, Flourish> = {
  round: 'hop',       // small hop after the bounce landing
  angular: 'shake',   // shake x +/-2 twice, it rose out of the ground
  tall: 'stance',     // scaleX 1.1 -> 1, it planted itself
  wide: 'settle',     // dy +2 then back, weight arriving
  bird: 'bob',        // hover bob 2 px, twice
  snake: 'tilt',      // head tilt, angle +/-6
  bug: 'twitch',      // angle +/-4, three times, fast
};

// === Timing ===

/**
 * Hard ceilings. The entrance is serial with the battle text (it is started
 * before the "Wild X appeared!" line and awaited after it), so an entrance that
 * overruns is dead air the player cannot skip. The renderer aborts and restores
 * at the cap exactly as `renderSpec` does for OVERRIDE_DURATION.
 */
export const MAX_WILD_MS = 800;
/** A send-out also has to pay for the ball throw + open, so it gets more. */
export const MAX_SENDOUT_MS = 900;

/**
 * Wild arrival budget per shape. These are the shape rows of design §4 costed
 * out: the angular rise has to wipe a mask the full height of the sprite and
 * drop blocks after it (the most expensive row), while the tall row is a
 * materialise-in-place with two afterimages and the bug row is four 3 px
 * side-steps — both of which read as *fast* and get less.
 */
const WILD_DURATION: Record<EntranceShape, number> = {
  round: 700,
  angular: 800,
  tall: 650,
  wide: 700,
  bird: 750,
  snake: 750,
  bug: 650,
};

/**
 * A send-out is the same materialise + flourish behind a ball throw (350 ms) and
 * its open (100 ms), so the shape row no longer dominates and every species
 * costs the same: throw + open + materialise 400 + flourish, overlapping.
 */
const SENDOUT_DURATION_MS = 900;

// === Tier-3 override keys (design §5) ===

/**
 * The twelve hand-authored arrivals. As with MOVE_OVERRIDES the resolver only
 * names the key; the renderer owns the functions and simply falls through to
 * the shape row until they exist.
 *
 * Articuno / Zapdos / Moltres share one renderer with three type palettes.
 */
export const ENTRANCE_OVERRIDES: Record<number, string> = {
  25: 'pikachu',          // the mascot: it is Yellow
  6: 'charizard',
  9: 'blastoise',
  3: 'venusaur',
  94: 'gengar',
  95: 'onix',
  143: 'snorlax',
  130: 'gyarados',
  129: 'magikarp',
  149: 'dragonite',
  150: 'mewtwo',
  144: 'legendary_bird', // Articuno
  145: 'legendary_bird', // Zapdos
  146: 'legendary_bird', // Moltres
};

// === Spec ===

export interface EntranceSpec {
  speciesId: number;
  /** Motion class: which of the seven arrival rows the renderer plays. */
  shape: EntranceShape;
  kind: EntranceKind;
  /** Primary type — the renderer reads its colour out of TYPE_VOCAB. */
  palette: PokemonType;
  /** baseStats.hp >= 100: adds a screenShake on landing. */
  mass: boolean;
  /** catchRate <= 45: adds sparkle during materialise. */
  rare: boolean;
  flourish: Flourish;
  /** Key into the renderer's entrance-override table (tier 3), when it has one. */
  overrideId?: string;
  /** Total budget: <= MAX_WILD_MS for wild, <= MAX_SENDOUT_MS for a send-out. */
  duration: number;
}

/** baseStats.hp at or above this lands heavily enough to shake the screen. */
export const MASS_HP_THRESHOLD = 100;
/** catchRate at or below this is "rare" — legendaries, pseudos, final forms. */
export const RARE_CATCH_RATE = 45;

/**
 * Pure: the same species + kind always resolves to the same spec.
 */
export function resolveEntrance(species: PokemonSpecies, kind: EntranceKind): EntranceSpec {
  const shape = getShapeForSpecies(species.id, species.types);
  const duration = kind === 'sendout' ? SENDOUT_DURATION_MS : WILD_DURATION[shape];
  const overrideId = ENTRANCE_OVERRIDES[species.id];

  const spec: EntranceSpec = {
    speciesId: species.id,
    shape,
    kind,
    palette: species.types[0],
    // Mass is a landing beat, not a longer one: the shake overlaps the flourish,
    // so it costs no extra duration.
    mass: species.baseStats.hp >= MASS_HP_THRESHOLD,
    rare: species.catchRate <= RARE_CATCH_RATE,
    flourish: SHAPE_FLOURISH[shape],
    duration,
  };
  if (overrideId) spec.overrideId = overrideId;
  return spec;
}

// === Cries ===

/**
 * The shape of a cry, as plain note data. `SoundSystem` plays it; it does not
 * decide anything.
 */
export type CryContour = 'triad' | 'slide' | 'chirp2' | 'buzz' | 'rumble' | 'bark2' | 'long_low';

export type CryWave = 'sawtooth' | 'square' | 'triangle' | 'sine';

export interface CryNote {
  /** Multiplier on the species base frequency. */
  freqMul: number;
  /** Seconds, matching SoundSystem.playNotes. */
  dur: number;
  /** Seconds from the start of the cry, matching SoundSystem.playNotes. */
  delay: number;
}

export interface CrySpec {
  /** 300 + id * 3 — unchanged; players know their mons by the pitch. */
  baseFreq: number;
  contour: CryContour;
  wave: CryWave;
  /** FIRE: the note wavers. */
  tremolo?: boolean;
  /** GHOST: the pitch wavers. */
  vibrato?: boolean;
}

/**
 * The note tables. `triad` is byte-for-byte today's `pokemonCry` (three notes,
 * 1 / 1.2 / 0.8, 350 ms total) so nothing that already cries changes.
 *
 * Every contour is at least two notes (one note is a beep, not a cry) and no
 * contour runs past 500 ms: the cry fires at the end of materialise, inside an
 * entrance that is itself capped at 800-900 ms.
 */
export const CRY_CONTOURS: Record<CryContour, CryNote[]> = {
  // round (default): today's cry, unchanged.
  triad: [
    { freqMul: 1, dur: 0.1, delay: 0 },
    { freqMul: 1.2, dur: 0.1, delay: 0.1 },
    { freqMul: 0.8, dur: 0.15, delay: 0.2 },
  ],
  // snake: a slow slide down.
  slide: [
    { freqMul: 1.15, dur: 0.12, delay: 0 },
    { freqMul: 1.0, dur: 0.12, delay: 0.12 },
    { freqMul: 0.85, dur: 0.18, delay: 0.24 },
  ],
  // bird: two rising chirps.
  chirp2: [
    { freqMul: 1.0, dur: 0.08, delay: 0 },
    { freqMul: 1.35, dur: 0.1, delay: 0.1 },
  ],
  // bug: a buzz — fast alternation, square wave by default.
  buzz: [
    { freqMul: 1.0, dur: 0.05, delay: 0 },
    { freqMul: 0.96, dur: 0.05, delay: 0.05 },
    { freqMul: 1.0, dur: 0.05, delay: 0.1 },
    { freqMul: 0.96, dur: 0.05, delay: 0.15 },
    { freqMul: 1.0, dur: 0.08, delay: 0.2 },
  ],
  // angular: a low rumble, triangle wave by default.
  rumble: [
    { freqMul: 0.6, dur: 0.18, delay: 0 },
    { freqMul: 0.5, dur: 0.22, delay: 0.16 },
  ],
  // tall: a two-note bark.
  bark2: [
    { freqMul: 1.1, dur: 0.09, delay: 0 },
    { freqMul: 0.75, dur: 0.14, delay: 0.11 },
  ],
  // wide: one long low note (a sustain plus its tail, so it is two notes).
  long_low: [
    { freqMul: 0.75, dur: 0.28, delay: 0 },
    { freqMul: 0.68, dur: 0.16, delay: 0.26 },
  ],
};

const SHAPE_CONTOUR: Record<EntranceShape, CryContour> = {
  round: 'triad',
  snake: 'slide',
  bird: 'chirp2',
  bug: 'buzz',
  angular: 'rumble',
  tall: 'bark2',
  wide: 'long_low',
};

/** Wave when the primary type does not claim one. */
const SHAPE_WAVE: Partial<Record<EntranceShape, CryWave>> = {
  bug: 'square',
  angular: 'triangle',
};

/** Three types are loud enough to own the timbre outright. */
const TYPE_WAVE: Partial<Record<PokemonType, { wave: CryWave; tremolo?: boolean; vibrato?: boolean }>> = {
  [PokemonType.FIRE]: { wave: 'sawtooth', tremolo: true },
  [PokemonType.ELECTRIC]: { wave: 'square' },
  [PokemonType.GHOST]: { wave: 'sine', vibrato: true },
};

/** PIKACHU is the mascot: it chirps, high, whatever its body shape says. */
const PIKACHU_ID = 25;
const PIKACHU_CRY: CrySpec = { baseFreq: 600, contour: 'chirp2', wave: 'square' };

/** 300 + id * 3 — the pitch BattleScene has always used. */
export function cryBaseFreq(speciesId: number): number {
  return 300 + speciesId * 3;
}

/**
 * Pure: the same species always resolves to the same cry.
 */
export function resolveCry(species: PokemonSpecies): CrySpec {
  if (species.id === PIKACHU_ID) return { ...PIKACHU_CRY };

  const shape = getShapeForSpecies(species.id, species.types);
  const contour = SHAPE_CONTOUR[shape];
  const byType = TYPE_WAVE[species.types[0]];

  const spec: CrySpec = {
    baseFreq: cryBaseFreq(species.id),
    contour,
    wave: byType ? byType.wave : (SHAPE_WAVE[shape] ?? 'sawtooth'),
  };
  if (byType?.tremolo) spec.tremolo = true;
  if (byType?.vibrato) spec.vibrato = true;
  return spec;
}

/** Longest point of a contour, in ms — what the renderer budgets for. */
export function contourLengthMs(contour: CryContour): number {
  return Math.round(
    Math.max(...CRY_CONTOURS[contour].map(n => (n.delay + n.dur) * 1000))
  );
}
