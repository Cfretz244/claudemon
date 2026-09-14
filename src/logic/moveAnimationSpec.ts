/**
 * Pure, Phaser-free resolver that turns a move id into an animation spec.
 *
 * The battle renderer (`systems/MoveAnimations.ts`) consumes the spec; nothing
 * here touches Phaser, the scene or randomness, so the whole mapping is unit
 * testable and a data edit that silently changes how a move looks shows up in
 * the snapshot diff.
 *
 * Four layers (see docs/battle-animations-design.md in the helper repo):
 *   1. base motion   - from category + effect + power
 *   2. type vocabulary - colour / particle shape / accent / sfx, one per type
 *   3. per-move overrides - iconic moves that get a hand-written function
 *   4. outcome feedback - applied by the renderer after the body
 */

import { PokemonType, MoveCategory, MoveEffect, MoveData } from '../types/pokemon.types';
import { MOVES_DATA } from '../data/moves';

// === Tier 1: base motions ===

export type BaseMotion =
  | 'contact'
  | 'barrage'
  | 'projectile'
  | 'beam'
  | 'status-cloud'
  | 'self-aura'
  | 'special-strike'
  | 'charge'
  | 'bind'
  | 'drain'
  | 'burst';

export type Intensity = 'light' | 'mid' | 'heavy';

// === Tier 2: type vocabulary ===

export type ParticleShape =
  | 'dust'    // Normal:   1 px specks
  | 'mote'    // Fire:     2 px embers drifting up
  | 'droplet' // Water:    droplets on a shallow arc
  | 'bolt'    // Electric: jagged polylines
  | 'leaf'    // Grass:    3 px leaves on a sine sweep
  | 'shard'   // Ice:      3 px diamonds flung outward
  | 'streak'  // Fighting: short radial streaks
  | 'bubble'  // Poison:   bubbles that rise then fall
  | 'grit'    // Ground:   dust kicked up from below
  | 'block'   // Rock:     5-6 px falling blocks
  | 'dash'    // Flying:   1x4 px horizontal streaks
  | 'dart'    // Bug:      small dots on a zig path
  | 'wisp'    // Ghost:    fading afterimages
  | 'ring'    // Psychic:  concentric ring pulse
  | 'trail';  // Dragon:   thick beam + trailing motes

export type Accent =
  | 'plain'
  | 'flicker'
  | 'splash-ring'
  | 'white-flash'
  | 'vine'
  | 'sparkle'
  | 'triple-impact'
  | 'drip'
  | 'shake'
  | 'landing-thud'
  | 'rise'
  | 'double-hit'
  | 'alpha-flicker'
  | 'invert'
  | 'heavy-shake';

export type SfxId =
  | 'hit'
  | 'crackle'
  | 'splash'
  | 'zap'
  | 'sweep'
  | 'ping'
  | 'tripleHit'
  | 'bubblePop'
  | 'rumble'
  | 'thud'
  | 'whoosh'
  | 'chitter'
  | 'wail'
  | 'warble'
  | 'roar';

export interface TypeVocab {
  /** The single source of colour truth for this type. */
  color: number;
  /** Secondary colour, used for alternating/underlit particles. */
  accentColor: number;
  particle: ParticleShape;
  accent: Accent;
  sfx: SfxId;
}

export const TYPE_VOCAB: Record<PokemonType, TypeVocab> = {
  [PokemonType.NORMAL]:   { color: 0xA8A878, accentColor: 0xE8E8D0, particle: 'dust',    accent: 'plain',         sfx: 'hit' },
  [PokemonType.FIRE]:     { color: 0xFF4422, accentColor: 0xFF8800, particle: 'mote',    accent: 'flicker',       sfx: 'crackle' },
  [PokemonType.WATER]:    { color: 0x3399FF, accentColor: 0xAADDFF, particle: 'droplet', accent: 'splash-ring',   sfx: 'splash' },
  [PokemonType.ELECTRIC]: { color: 0xFFCC00, accentColor: 0xFFFFFF, particle: 'bolt',    accent: 'white-flash',   sfx: 'zap' },
  [PokemonType.GRASS]:    { color: 0x44BB44, accentColor: 0x99EE66, particle: 'leaf',    accent: 'vine',          sfx: 'sweep' },
  [PokemonType.ICE]:      { color: 0x66CCFF, accentColor: 0xFFFFFF, particle: 'shard',   accent: 'sparkle',       sfx: 'ping' },
  [PokemonType.FIGHTING]: { color: 0xBB5544, accentColor: 0xFFCC99, particle: 'streak',  accent: 'triple-impact', sfx: 'tripleHit' },
  [PokemonType.POISON]:   { color: 0xAA5599, accentColor: 0xDD88CC, particle: 'bubble',  accent: 'drip',          sfx: 'bubblePop' },
  [PokemonType.GROUND]:   { color: 0xDDBB55, accentColor: 0x997733, particle: 'grit',    accent: 'shake',         sfx: 'rumble' },
  [PokemonType.FLYING]:   { color: 0x8899FF, accentColor: 0xDDE4FF, particle: 'dash',    accent: 'rise',          sfx: 'whoosh' },
  [PokemonType.PSYCHIC]:  { color: 0xFF5599, accentColor: 0xFFAADD, particle: 'ring',    accent: 'invert',        sfx: 'warble' },
  [PokemonType.BUG]:      { color: 0xAABB22, accentColor: 0xDDEE88, particle: 'dart',    accent: 'double-hit',    sfx: 'chitter' },
  [PokemonType.ROCK]:     { color: 0xBBAA66, accentColor: 0x887744, particle: 'block',   accent: 'landing-thud',  sfx: 'thud' },
  [PokemonType.GHOST]:    { color: 0x6666BB, accentColor: 0x332255, particle: 'wisp',    accent: 'alpha-flicker', sfx: 'wail' },
  [PokemonType.DRAGON]:   { color: 0x7766EE, accentColor: 0xBBAAFF, particle: 'trail',   accent: 'heavy-shake',   sfx: 'roar' },
};

// === Tier 3: per-move override keys ===

/**
 * Iconic moves that get a hand-written function instead of the generic
 * renderer. The resolver only names the key; the renderer owns the functions
 * (and until they exist it simply renders the tier-1/2 body).
 */
export const MOVE_OVERRIDES: Record<number, string> = {
  // Signature attacks
  85: 'thunderbolt', 87: 'thunder', 63: 'hyperBeam', 57: 'surf', 89: 'earthquake',
  56: 'hydroPump', 126: 'fireBlast', 59: 'blizzard', 94: 'psychic', 101: 'nightShade',
  // Two-turn
  19: 'fly', 91: 'dig', 76: 'solarBeam',
  // Self-KO
  120: 'selfDestruct', 153: 'explosion',
  // Status set-pieces
  47: 'sing', 79: 'sleepPowder', 92: 'toxic', 73: 'leechSeed', 86: 'thunderWave',
  // Self / evasion
  144: 'transform', 164: 'substitute', 156: 'rest', 104: 'doubleTeam', 107: 'minimize',
  113: 'lightScreen', 14: 'swordsDance', 150: 'splash',
  // Grapple / speed
  35: 'wrap', 20: 'bind', 98: 'quickAttack', 129: 'swift',
  // Stat drops
  45: 'growl', 39: 'tailWhip',
};

// === Motion classification data ===

/** Status moves aimed at the attacker itself (everything else targets the foe). */
const SELF_TARGET_STATUS = new Set<number>([
  14,  // SWORDS DANCE
  54,  // MIST
  74,  // GROWTH
  96,  // MEDITATE
  97,  // AGILITY
  100, // TELEPORT
  102, // MIMIC
  104, // DOUBLE TEAM
  105, // RECOVER
  106, // HARDEN
  107, // MINIMIZE
  110, // WITHDRAW
  111, // DEFENSE CURL
  112, // BARRIER
  113, // LIGHT SCREEN
  114, // HAZE
  115, // REFLECT
  116, // FOCUS ENERGY
  118, // METRONOME
  119, // MIRROR MOVE
  133, // AMNESIA
  135, // SOFTBOILED
  144, // TRANSFORM
  150, // SPLASH
  151, // ACID ARMOR
  156, // REST
  159, // SHARPEN
  160, // CONVERSION
  164, // SUBSTITUTE
]);

/** Damaging moves that read as one or more discrete shots crossing the gap. */
const PROJECTILE_MOVES = new Set<number>([
  16,  // GUST
  51,  // ACID
  52,  // EMBER
  55,  // WATER GUN
  56,  // HYDRO PUMP
  75,  // RAZOR LEAF
  80,  // PETAL DANCE
  88,  // ROCK THROW
  121, // EGG BOMB
  123, // SMOG
  124, // SLUDGE
  126, // FIRE BLAST
  145, // BUBBLE
  161, // TRI ATTACK
]);

/** Damaging moves that read as a sustained line from attacker to defender. */
const BEAM_MOVES = new Set<number>([
  53,  // FLAMETHROWER
  57,  // SURF
  58,  // ICE BEAM
  59,  // BLIZZARD
  60,  // PSYBEAM
  61,  // BUBBLE BEAM
  62,  // AURORA BEAM
  63,  // HYPER BEAM
  84,  // THUNDER SHOCK
  85,  // THUNDERBOLT
  87,  // THUNDER
  93,  // CONFUSION
  94,  // PSYCHIC
]);

const BARRAGE_EFFECTS = new Set<MoveEffect>([MoveEffect.MULTI_HIT, MoveEffect.TWO_HIT]);
const DRAIN_EFFECTS = new Set<MoveEffect>([MoveEffect.DRAIN, MoveEffect.DREAM_EATER]);
const SPECIAL_STRIKE_EFFECTS = new Set<MoveEffect>([
  MoveEffect.OHKO,
  MoveEffect.FIXED_DAMAGE,
  MoveEffect.LEVEL_DAMAGE,
]);

// === Timing ===

/** Hard ceiling; the animation is serial with the battle text, so it matters. */
export const MAX_DURATION_MS = 900;

/**
 * Ceiling for a tier-3 set-piece. Overrides are hand-written one-offs for a
 * handful of iconic moves, so they are allowed a longer beat than the generic
 * body - but not an unbounded one, because the animation is still serial with
 * the battle text.
 */
export const MAX_OVERRIDE_DURATION_MS = 1200;

/**
 * Budget for a tier-3 override that needs more room than its motion/intensity
 * would give it. Keyed by the MOVE_OVERRIDES value, clamped to
 * MAX_OVERRIDE_DURATION_MS. Overrides not listed here keep the generic budget.
 *
 * thunder: the strike is a sequence - sky darkens, three staggered bolts fall,
 * impact, afterglow - and at the generic beam budget (520 ms) each bolt would
 * be on screen for barely three frames.
 *
 * fly / dig / solarBeam: the engine resolves a CHARGE move in ONE turn (see
 * BattleScene.doExecuteMove - nothing defers it), so the override has to fit
 * gather AND release into a single promise. The generic charge budget (680-740
 * ms) leaves no room for "the attacker is off the field" to read as absence
 * rather than as a dropped frame.
 *
 * selfDestruct / explosion: a strobe, a detonation and settling debris; and
 * EXPLOSION needs to stay visibly bigger and longer than SELF-DESTRUCT.
 *
 * hyperBeam: a charge, a beam that widens as it is held, and the recoil - the
 * generic beam budget (520 ms) cannot hold a beam long enough to read as
 * "sustained".
 *
 * thunderbolt: a charge, one held bolt, and then a CAGE of small bolts that
 * has to crackle for long enough to read as a cage rather than as noise - at
 * the generic beam budget the cage gets about four frames.
 *
 * surf: the wave has to rise, cross the entire 160 px field and drain, and the
 * "the whole screen is water" beat in the middle is the point of the move; a
 * sweep fast enough to fit the generic beam budget reads as a swipe.
 *
 * earthquake: the tremor has to build before it breaks, and the defender is
 * thrown up and down four times - a single jolt reads as a flinch.
 *
 * hydroPump: the jet's width ramp only reads if the jet is held, and the
 * defender has to be shoved back and stay shoved while it is.
 *
 * fireBlast: the star travels the width of the field growing as it goes, which
 * needs half the budget on its own, before the burst.
 *
 * blizzard: a field-wide storm needs enough frames for the streaks to sweep
 * across and wrap, plus the freeze and the shatter at the end.
 *
 * psychic: rings collapsing inward, the distortion, and the magenta crush -
 * three beats that have to land in order.
 *
 * nightShade: the field darkens, the shade rises, crosses and settles, the
 * defender flickers, and only then does the dark lift.
 *
 * sing: the notes have to travel the whole attacker -> defender path and then
 * the defender has to visibly nod off, which is two beats, not one.
 *
 * sleepPowder: the cloud drifts across, arrives ABOVE the target and only then
 * rains down - a single puff would be the generic status-cloud again.
 *
 * toxic: lob, splat, drips, and a tint that has to still be there at the end;
 * the splat is worthless if it is not held long enough to read as a stain.
 *
 * leechSeed: three beats in sequence - seeds land, vines grow and coil, motes
 * flow back - so it is the longest of this batch.
 *
 * thunderWave: the rings have to cross the whole field at a speed that reads
 * as a wave rather than a flash, and the static crackle follows them.
 *
 * wrap: three loops of coil have to be laid down one after another and THEN
 * tighten; at the generic bind budget (460 ms) they arrive all at once.
 *
 * bind: the clamp has to close, hold and pulse - the pulse is the move.
 *
 * quickAttack: the ONLY override that is shorter than its generic body. The
 * point of the move is that the hit lands before you see it, so the budget is
 * a hard ceiling, not a request: 300 ms, the fastest thing in the battle.
 *
 * swift: two bursts of stars, each one arcing the width of the field, plus the
 * scatter on impact.
 *
 * growl: two roars, each a fan of arcs that has to expand far enough to reach
 * the defender, with a beat of silence between them.
 *
 * tailWhip: the attacker rocks twice, which is a full left-right-left, and the
 * defender's flinch has to land after the second swipe.
 */
export const OVERRIDE_DURATION: Record<string, number> = {
  thunder: 1000,
  fly: 1000,
  dig: 1000,
  solarBeam: 1100,
  selfDestruct: 1000,
  explosion: 1100,
  hyperBeam: 1000,
  thunderbolt: 1100,
  surf: 1150,
  earthquake: 1100,
  hydroPump: 1000,
  fireBlast: 1100,
  blizzard: 1150,
  psychic: 1000,
  nightShade: 1100,
  sing: 900,
  sleepPowder: 950,
  toxic: 1000,
  leechSeed: 1050,
  thunderWave: 900,
  wrap: 1000,
  bind: 900,
  quickAttack: 300,
  swift: 900,
  growl: 800,
  tailWhip: 800,
};

const MOTION_BASE_MS: Record<BaseMotion, number> = {
  contact: 240,
  barrage: 380,
  projectile: 320,
  beam: 400,
  'status-cloud': 340,
  'self-aura': 320,
  'special-strike': 460,
  charge: 620,
  bind: 460,
  drain: 480,
  burst: 660,
};

const INTENSITY_BONUS_MS: Record<Intensity, number> = { light: 0, mid: 60, heavy: 120 };

// === Spec ===

export interface AnimationSpec {
  moveId: number;
  motion: BaseMotion;
  type: PokemonType;
  color: number;
  accentColor: number;
  intensity: Intensity;
  particle: ParticleShape;
  accent: Accent;
  sfx: SfxId;
  /**
   * Total budget for the whole animation: <= MAX_DURATION_MS for the generic
   * body, <= MAX_OVERRIDE_DURATION_MS for a tier-3 set-piece (OVERRIDE_DURATION).
   */
  duration: number;
  /** Key into the renderer's OVERRIDES table (tier 3), when this move has one. */
  override?: string;
  /** Set on CHARGE moves; the renderer plays gather + release in one promise. */
  twoTurn?: 'charge' | 'release';
}

export function resolveIntensity(power: number): Intensity {
  if (power >= 90) return 'heavy';
  if (power >= 45) return 'mid';
  return 'light';
}

export function resolveMotion(move: MoveData): BaseMotion {
  const effect = move.effect;

  if (effect === MoveEffect.SELF_DESTRUCT) return 'burst';
  if (effect === MoveEffect.CHARGE) return 'charge';
  if (effect !== undefined && BARRAGE_EFFECTS.has(effect)) return 'barrage';
  if (effect === MoveEffect.WRAP) return 'bind';
  if (effect !== undefined && DRAIN_EFFECTS.has(effect)) return 'drain';
  if (effect !== undefined && SPECIAL_STRIKE_EFFECTS.has(effect)) return 'special-strike';

  if (move.category === MoveCategory.STATUS) {
    return SELF_TARGET_STATUS.has(move.id) ? 'self-aura' : 'status-cloud';
  }

  if (PROJECTILE_MOVES.has(move.id)) return 'projectile';
  if (BEAM_MOVES.has(move.id)) return 'beam';
  return 'contact';
}

/** Fallback used when a move id is not in MOVES_DATA at all. */
const UNKNOWN_MOVE: MoveData = {
  id: -1,
  name: '???',
  type: PokemonType.NORMAL,
  category: MoveCategory.PHYSICAL,
  power: 40,
  accuracy: 100,
  pp: 1,
};

/**
 * Pure: same id in, same spec out. Tolerates unknown ids (METRONOME recurses
 * into arbitrary move ids at runtime).
 */
export function resolveAnimation(moveId: number): AnimationSpec {
  const move = MOVES_DATA[moveId] ?? UNKNOWN_MOVE;
  const vocab = TYPE_VOCAB[move.type] ?? TYPE_VOCAB[PokemonType.NORMAL];
  const motion = resolveMotion(move);
  const intensity = resolveIntensity(move.power);
  const duration = Math.min(
    MAX_DURATION_MS,
    MOTION_BASE_MS[motion] + INTENSITY_BONUS_MS[intensity],
  );

  const spec: AnimationSpec = {
    moveId,
    motion,
    type: move.type,
    color: vocab.color,
    accentColor: vocab.accentColor,
    intensity,
    particle: vocab.particle,
    accent: vocab.accent,
    sfx: vocab.sfx,
    duration,
  };

  const override = MOVE_OVERRIDES[moveId];
  if (override) {
    spec.override = override;
    const budget = OVERRIDE_DURATION[override];
    if (budget !== undefined) spec.duration = Math.min(MAX_OVERRIDE_DURATION_MS, budget);
  }
  if (motion === 'charge') spec.twoTurn = 'charge';

  return spec;
}
