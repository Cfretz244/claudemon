/**
 * The battle sprites' BASE SCALE, and where their feet go.
 *
 * `logic/pokemonSize.ts` decides how big a species is; this is the one place
 * that turns that number into a Phaser sprite's scale and position, and the one
 * place every animation asks "what was this sprite's scale before I touched
 * it?". Before size classes the answer was always 1, so a hundred call sites
 * across `entrances.ts`, `entranceOverrides.ts`, `overrides.ts` and
 * `MoveAnimations.ts` simply wrote `setScale(1)` or tweened `scaleX: 1` to get
 * back to rest. Every one of those now has to read `baseScaleOf(sprite)`
 * instead, or a squash animation would quietly shrink a CHARIZARD to RATTATA
 * size and leave it there.
 *
 * ANCHORING. The brief asks for origin (0.5, 1) at a ground line. We keep the
 * sprites' default centre origin and put the CENTRE at `groundY - 16 * scale`
 * instead, which renders identically (the sprite occupies `groundY - 32*scale`
 * to `groundY` either way) and leaves `sprite.y` meaning what every existing
 * effect, entrance and e2e geometry check already assumes it means. Growing a
 * sprite still grows it UPWARD from its feet, which is the point.
 */
import { GAME_WIDTH } from '../../utils/constants';
import { SCALE, SizeClass, sizeClass } from '../../logic/pokemonSize';
import { PokemonSpecies } from '../../types/pokemon.types';

export type BattleSide = 'player' | 'opponent';

/** The un-scaled sprite box; both battle frames are 32x32. */
export const SPRITE_PX = 32;

/** Where the sprites stand: the opponent on the far ledge, the player up front. */
export const HOME_X: Record<BattleSide, number> = { opponent: GAME_WIDTH - 40, player: 36 };

/**
 * The feet line per side — the old centres (28 / 76) plus half a sprite, so an
 * M-class mon lands exactly where it always did.
 */
export const GROUND_Y: Record<BattleSide, number> = { opponent: 44, player: 92 };

/**
 * Measured clamp. An XL front sprite is 48 px tall, so at ground 44 its top
 * edge would be y -4: four rows off the top of a 144 px screen. The brief
 * allows lowering the front ground line by up to 4 px, so XL opponents stand
 * 4 px further down the ledge and their top edge lands exactly on y 0.
 *
 * Nothing else needs a clamp, measured against `BattleHUD`'s boxes:
 *   opponent XL  x 96..144, y  0..48  vs the enemy box  x 2..80,   y 4..30
 *   player   XL  x 12..60,  y 44..92  vs the player box x 78..158, y 64..96
 * — no overlap on either axis pair, and the widest sprite (48 px) still clears
 * both screen edges.
 */
export const XL_OPPONENT_GROUND_Y = 48;
const XL_THRESHOLD = 1.4;

/** The feet line for a sprite of this scale on this side. */
export function groundYFor(side: BattleSide, scale: number): number {
  return side === 'opponent' && scale > XL_THRESHOLD ? XL_OPPONENT_GROUND_Y : GROUND_Y[side];
}

/** The sprite CENTRE y that puts a sprite of this scale's feet on the ground. */
export function homeYFor(side: BattleSide, scale: number): number {
  return groundYFor(side, scale) - (SPRITE_PX * scale) / 2;
}

/** The scale a battle sprite rests at. 1 for anything that never got a class. */
export function baseScaleOf(sprite: { getData(key: string): unknown } | undefined | null): number {
  const v = sprite?.getData('baseScale');
  return typeof v === 'number' && v > 0 ? v : 1;
}

/** The class a species is rendered at, for callers that want the label. */
export function battleSizeClass(speciesId: number, species: PokemonSpecies | undefined): SizeClass {
  return sizeClass(speciesId, species);
}

/**
 * Give a battle sprite its species' size: store `baseScale`, apply it, and put
 * the feet on the ground line. Called whenever the sprite's SPECIES changes —
 * creation, send-out, a switch-in texture swap, the dev intro replay.
 */
export function applyBattleScale(
  sprite: Phaser.GameObjects.Sprite,
  side: BattleSide,
  speciesId: number,
  species: PokemonSpecies | undefined,
): number {
  const scale = SCALE[sizeClass(speciesId, species)];
  sprite.setData('baseScale', scale);
  sprite.setScale(scale);
  sprite.setPosition(HOME_X[side], homeYFor(side, scale));
  return scale;
}
