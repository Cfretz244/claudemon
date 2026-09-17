import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../utils/constants';
import { PokemonType } from '../../types/pokemon.types';
import { POKEMON_DATA } from '../../data/pokemon';
import { TYPE_VOCAB } from '../../logic/moveAnimationSpec';
import { resolveCry } from '../../logic/entranceSpec';
import { getShapeForSpecies } from '../../logic/pokemonShape';
import { generatePokemonSprite } from '../../utils/spriteGenerator';
import { TextBox } from '../../components/TextBox';
import { delay, screenFlash, sparkle } from '../MoveAnimations';
import { materialise, paleOf } from './entrances';
import { SPRITE_PX } from './baseScale';
import { battleScale } from '../../logic/pokemonSize';
import { soundSystem } from '../SoundSystem';
import {
  EVO_FLASH_MS, EVO_INTRO_MS, EVO_PULSE_SCALE, EVO_REVEAL_MS, EVO_SPARKLES,
  MAX_EVOLUTION_MS, STROBE_TOTAL_MS, evolutionLines, strobeSchedule,
} from '../../logic/evolutionSequence';

/**
 * The Gen I evolution screen.
 *
 * Structurally this is `catchSequence`'s sibling: `logic/evolutionSequence.ts`
 * decides WHAT the sequence is (timings, the strobe schedule, the three lines)
 * and this file is the only place that knows how to draw one, out of the same
 * primitives the entrances and the catch sequence use — `setTintFill`
 * silhouettes, `materialise`, `screenFlash`, `sparkle`.
 *
 * It differs from those two in one way that shapes the whole file: an evolution
 * is not part of a battle. It is played over whatever scene called it (the
 * battle on its way out, or the overworld with the bag open), so it brings its
 * own field, its own sprite, its own text box and its own keys, and puts the
 * scene back exactly as it found it. The caller supplies nothing but names and
 * species ids, which is what lets `BattleScene` and `OverworldScene` share it.
 *
 * Three contracts, the same three every animation module here holds:
 *
 *  1. RESTORE. Everything this function adds to the scene is destroyed in a
 *     `finally`, including the key listeners it bound. The caller's own text
 *     box, sprites and HUD are never touched.
 *  2. THE CALLER OWNS THE DATA. `playEvolution` is pure presentation: it
 *     returns `'evolved'` or `'cancelled'` and never calls `evolvePokemon`.
 *     Applying the evolution — and the learnset check that follows it — belongs
 *     to the scene, because the two scenes prompt for a forgotten move in two
 *     different ways.
 *  3. CAP. The whole sequence races `MAX_EVOLUTION_MS`; if it overruns we stop
 *     drawing, tear down and let the game carry on.
 */

/**
 * The field the sequence plays on: above the battle HUD (100-102) and above
 * every overworld sprite, but well below `screenFlash` (900), `sparkle` (800)
 * and the text box (1000), so the flash and the sparkles land ON the sequence
 * rather than behind it.
 */
export const EVO_FIELD_DEPTH = 200;
/** The lone sprite, one above the field. */
export const EVO_SPRITE_DEPTH = 201;
/** The plain light field Gen I evolves on: the game's own paper colour. */
export const EVO_FIELD_COLOR = 0xf8f8f8;
/** Where the mon stands: centred, clear of the text box at y >= 106. */
export const EVO_SPRITE_Y = 56;

/** What the scene tells the sequence about the mon that is evolving. */
export interface EvolutionContext {
  /** The species the mon is now. Its FRONT sprite opens the sequence. */
  fromSpecies: number;
  /** The species it is becoming. Its front sprite is the other silhouette. */
  toSpecies: number;
  /** What the mon is called: `nickname || species name`. */
  name: string;
}

/** `'cancelled'` means the player pressed B during the strobe (Gen I). */
export type EvolutionOutcome = 'evolved' | 'cancelled';

/**
 * Make sure `pokemon_<id>` exists, generating it the way `BattleScene` does.
 *
 * The sequence needs the TARGET species' sprite, which in a battle has never
 * been on the field and in the overworld has never been generated at all.
 */
export function ensurePokemonTexture(scene: Phaser.Scene, speciesId: number): string {
  const key = `pokemon_${speciesId}`;
  if (!scene.textures.exists(key)) {
    const species = POKEMON_DATA[speciesId];
    if (species) {
      const shape = getShapeForSpecies(speciesId, species.types);
      generatePokemonSprite(
        scene, key, species.spriteColor, species.spriteColor2, shape, speciesId,
      );
    } else {
      generatePokemonSprite(scene, key, 0x808080, undefined, 'round');
    }
  }
  return key;
}

/** The silhouette wash for a species: its primary type, blended toward white. */
function paleFor(speciesId: number): number {
  const type = POKEMON_DATA[speciesId]?.types[0] ?? PokemonType.NORMAL;
  const vocab = TYPE_VOCAB[type] ?? TYPE_VOCAB[PokemonType.NORMAL];
  return paleOf(vocab.color);
}

/**
 * `animateFrames` with a stop predicate.
 *
 * The strobe has to end the moment B is pressed — and the whole sequence has to
 * end the moment the cap fires — so the frame loop is polled rather than run to
 * completion and guarded afterwards. `MoveAnimations.animateFrames` cannot do
 * that: its timer always runs its full span.
 */
function framesUntil(
  scene: Phaser.Scene,
  ms: number,
  stop: () => boolean,
  onFrame: (t: number) => void,
): Promise<void> {
  return new Promise(resolve => {
    const start = scene.time.now;
    const ev = scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (stop()) { ev.remove(); resolve(); return; }
        const t = Math.min(1, (scene.time.now - start) / Math.max(1, ms));
        onFrame(t);
        if (t >= 1) { ev.remove(); resolve(); }
      },
    });
  });
}

/**
 * Play the evolution screen over `scene` and report what the player decided.
 *
 * The beats (helper repo brief `evolution-screen`, Gen I's own order):
 *
 *   1. The field goes plain and light, the mon's FRONT sprite is centred on it,
 *      and `What? X is evolving!` shows for `EVO_INTRO_MS` and advances ITSELF.
 *      Gen I does not make you press A here; the evolution is already happening.
 *   2. The strobe: the sprite alternates between the old and the new form as
 *      flat `setTintFill` silhouettes, with the gap between swaps shrinking
 *      (`strobeSchedule`) and a soft 1.0 <-> 1.08 breath in scale.
 *   3. B during the strobe cancels: `Huh? X stopped evolving!`, the old form
 *      back in colour, and `'cancelled'` — the caller drops the queue entry, and
 *      `checkEvolution` offers it again at the next level-up.
 *   4. Otherwise a white `screenFlash` and eight `sparkle`s, the NEW form
 *      `materialise`s in colour, its cry plays, and
 *      `Congratulations! Your X evolved into Y!` waits for a key.
 */
export async function playEvolution(
  scene: Phaser.Scene,
  ctx: EvolutionContext,
): Promise<EvolutionOutcome> {
  const toSpecies = POKEMON_DATA[ctx.toSpecies];
  const fromKey = ensurePokemonTexture(scene, ctx.fromSpecies);
  const toKey = ensurePokemonTexture(scene, ctx.toSpecies);
  const fromPale = paleFor(ctx.fromSpecies);
  const toPale = paleFor(ctx.toSpecies);
  const lines = evolutionLines(ctx.name, toSpecies?.name ?? `#${ctx.toSpecies}`);

  // The field: a plain light sheet over whatever the caller was showing.
  const field = scene.add.graphics();
  field.setDepth(EVO_FIELD_DEPTH);
  field.setScrollFactor(0);
  field.fillStyle(EVO_FIELD_COLOR, 1);
  field.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // The two forms' size classes. An evolution is the one moment the player
  // watches a mon CHANGE SIZE, so the overlay honours the classes too: the old
  // form pulses at its own scale, the new one is revealed at its own, and both
  // stand on the same ground line so the growth reads as growth rather than as
  // the sprite drifting up the screen.
  const fromScale = battleScale(ctx.fromSpecies, POKEMON_DATA[ctx.fromSpecies]);
  const toScale = battleScale(ctx.toSpecies, toSpecies);
  const EVO_GROUND_Y = EVO_SPRITE_Y + SPRITE_PX / 2;
  const stand = (scale: number): void => {
    sprite.setScale(scale);
    sprite.setY(EVO_GROUND_Y - (SPRITE_PX * scale) / 2);
  };

  const sprite = scene.add.sprite(Math.round(GAME_WIDTH / 2), EVO_SPRITE_Y, fromKey, 0);
  sprite.setDepth(EVO_SPRITE_DEPTH);
  sprite.setScrollFactor(0);
  stand(fromScale);

  // Its own text box, not the caller's: `OverworldScene` will not advance its
  // text box while a screen is open, and `BattleScene`'s is mid-teardown.
  const textBox = new TextBox(scene);

  let cancelArmed = false;
  let cancelled = false;
  let aborted = false;

  const kb = scene.input.keyboard!;
  const K = Phaser.Input.Keyboard.KeyCodes;
  const onAdvance = (): void => { if (textBox.getIsVisible()) textBox.advance(); };
  const onCancel = (): void => { if (cancelArmed) cancelled = true; };
  const zKey = kb.addKey(K.Z);
  const enterKey = kb.addKey(K.ENTER);
  const xKey = kb.addKey(K.X);
  zKey.on('down', onAdvance);
  enterKey.on('down', onAdvance);
  xKey.on('down', onCancel);

  const showLine = (msg: string): Promise<void> => new Promise<void>(resolve => {
    textBox.show([msg], resolve);
  });

  const body = async (): Promise<EvolutionOutcome> => {
    // 1. The announcement. Auto-advancing, so it cannot swallow the B press.
    textBox.show([lines.evolving]);
    await delay(scene, EVO_INTRO_MS);
    if (aborted) return 'evolved';
    textBox.hide();

    // 2. The strobe.
    soundSystem.evolution();
    cancelArmed = true;
    const swaps = strobeSchedule(STROBE_TOTAL_MS);
    const total = swaps.length > 0 ? swaps[swaps.length - 1] : STROBE_TOTAL_MS;
    let reached = 0;
    await framesUntil(scene, total, () => cancelled || aborted, t => {
      const now = t * total;
      while (reached < swaps.length && swaps[reached] <= now) reached++;
      // Even number of swaps so far = the old form; odd = the new one.
      const isNew = reached % 2 === 1;
      const key = isNew ? toKey : fromKey;
      if (sprite.texture.key !== key) sprite.setTexture(key, 0);
      sprite.setTintFill(isNew ? toPale : fromPale);
      // One breath per gap: the pulse speeds up with the strobe for free.
      const from = reached === 0 ? 0 : swaps[reached - 1];
      const to = reached < swaps.length ? swaps[reached] : total;
      const p = Math.min(1, Math.max(0, (now - from) / Math.max(1, to - from)));
      // The breath is a multiple of whichever form is on screen this frame.
      const base = isNew ? toScale : fromScale;
      stand(base * (1 + (EVO_PULSE_SCALE - 1) * 0.5 * (1 - Math.cos(p * Math.PI * 2))));
    });
    cancelArmed = false;
    stand(cancelled ? fromScale : toScale);

    // 3. Cancelled (Gen I's B): the old form comes back, in colour.
    if (cancelled) {
      sprite.setTexture(fromKey, 0);
      sprite.clearTint();
      stand(fromScale);
      if (aborted) return 'cancelled';
      await showLine(lines.stopped);
      return 'cancelled';
    }
    if (aborted) return 'evolved';

    // 4. The reveal.
    await Promise.all([
      screenFlash(scene, 0xFFFFFF, EVO_FLASH_MS),
      sparkle(scene, sprite.x, sprite.y, 0xFFFFFF, EVO_SPARKLES, EVO_FLASH_MS + 180),
    ]);
    if (aborted) return 'evolved';
    sprite.setTexture(toKey, 0);
    sprite.clearTint();
    // The NEW species' class: `materialise` without a run pops 0 -> this.
    stand(toScale);
    const palette = toSpecies?.types[0] ?? PokemonType.NORMAL;
    await materialise(scene, sprite, palette, EVO_REVEAL_MS);
    if (toSpecies) soundSystem.pokemonCryFor(resolveCry(toSpecies));
    if (aborted) return 'evolved';
    await showLine(lines.congratulations);
    return 'evolved';
  };

  try {
    const outcome = await Promise.race<EvolutionOutcome>([
      body().catch(() => (cancelled ? 'cancelled' : 'evolved') as EvolutionOutcome),
      delay(scene, MAX_EVOLUTION_MS).then(() => {
        aborted = true;
        return (cancelled ? 'cancelled' : 'evolved') as EvolutionOutcome;
      }),
    ]);
    return outcome;
  } finally {
    aborted = true;
    cancelArmed = false;
    zKey.off('down', onAdvance);
    enterKey.off('down', onAdvance);
    xKey.off('down', onCancel);
    scene.tweens.killTweensOf(sprite);
    textBox.destroy();
    sprite.destroy();
    field.destroy();
  }
}
