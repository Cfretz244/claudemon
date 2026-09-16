import { GAME_WIDTH, GAME_HEIGHT } from '../../utils/constants';
import { splitPhases } from '../../logic/entranceSpec';
import {
  EntranceKit, EntranceOverrideFn, particleFor, registerEntranceOverride,
} from './entrances';
import {
  afterimage, directionalParticles, groundHeave, impactBurst, ring, screenShake,
  sparkle, typeBeam, warpArcs,
} from '../MoveAnimations';

/**
 * Tier-3 entrances: the twelve hand-authored arrivals of the intro design's
 * section 5, the sibling of `animations/overrides.ts` for moves.
 *
 * The seven shape rows in `entrances.ts` give all 151 species an arrival for
 * the cost of seven renderers. These twelve are the ones worth writing by
 * hand - the mascot, the three starters' finals, the icons and the
 * legendaries - and each one REPLACES its shape row's arrival *and* its
 * flourish. Everything else about the entrance is unchanged: the same
 * snapshot/restore, the same 800 ms wild / 900 ms send-out caps with the same
 * reserves, the same cry at the same moment, and for `kind: 'sendout'` the
 * same Pokeball, which is the vehicle for every species - an override owns
 * what happens once the ball has opened, at the 0.6x amplitude a send-out
 * always uses so a switch-in cannot upstage the fight.
 *
 * A renderer gets an `EntranceKit` and nothing else. It never names a Phaser
 * scene API of its own: everything it draws is either a `MoveAnimations`
 * primitive (which destroys its own graphics) or a kit method whose objects go
 * on the run's junk list, so the cap can abort any of these mid-beat and the
 * field still comes back clean. A contract test reads this file as text and
 * fails if a direct scene call ever appears in it.
 *
 * Two house rules, so the twelve stay comparable:
 *  - PHASES COME FROM `splitPhases`. The window is `kit.ms`, which is smaller
 *    for a send-out (the ball has already spent a third of the budget) and
 *    varies by shape row for a wild arrival, so every beat is a WEIGHT rather
 *    than a number of milliseconds. The design's ms figures are the wild-case
 *    intent, not a contract; the cap is the contract.
 *  - TRAVEL SCALES WITH `kit.amp`. A wild SNORLAX falls the height of the
 *    screen; one coming out of a ball falls 0.6 of it, because it is arriving
 *    from the ball and not from the sky.
 */

/** A beat with nothing drawn in it: the clock runs, the field stays empty. */
const NOTHING = (): void => { /* deliberately empty */ };

/** GENGAR is not a pale silhouette. It is a hole in the field (design 5). */
const GENGAR_TINT = 0x202040;

/**
 * The alpha GENGAR's silhouette reaches before it starts becoming solid.
 *
 * The design says it "fades up from alpha 0.3". It fades up *to* 0.3 first:
 * putting a full-size silhouette on screen at 0.3 on frame one is a mon that
 * is already there rather than one that arrives, in the strip and in the
 * runner alike.
 */
const GENGAR_GHOST_ALPHA = 0.3;

/** MEWTWO's "the screen dims 20 %". */
const MEWTWO_DIM = 0.2;

// ---------------------------------------------------------------------------
// The twelve
// ---------------------------------------------------------------------------

/**
 * PIKACHU: drops in, lands on a yellow burst with two sparks, double hop.
 *
 * The mascot, so it is the loudest cheap entrance in the set: the landing beat
 * is an `impactBurst` under the feet rather than the round row's `ring`, and
 * the row's single hop is two. The cry is E1's business - PIKACHU already
 * resolves to the two-chirp bird contour at pitch 600 whatever its body shape.
 */
const entrancePikachu: EntranceOverrideFn = async kit => {
  const [lead, drop, land, hopA, hopB] = splitPhases(kit.ms, [8, 46, 14, 16, 16]);
  const fromY = kit.homeY - Math.round(30 * kit.amp);

  kit.sprite.setPosition(kit.homeX, fromY);
  kit.sprite.setScale(0, 0);
  await kit.frames(lead, NOTHING);
  if (kit.aborted) return;

  await Promise.all([
    kit.materialise(drop),
    kit.tween({ targets: kit.sprite, y: kit.homeY, duration: drop, ease: 'Bounce.easeOut' }),
  ]);
  if (kit.aborted) return;
  kit.sprite.setPosition(kit.homeX, kit.homeY);
  kit.cry();

  void impactBurst(kit.scene, kit.homeX, kit.homeY + 12, kit.color, kit.accent, 12, land + hopA);
  void sparkle(kit.scene, kit.homeX, kit.homeY, kit.accent, 2, land + hopA);
  await kit.frames(land, t => {
    // One squash on the landing frame, easing out: integer-safe, scale only.
    kit.sprite.setScale(1 + 0.14 * (1 - t), 1 - 0.18 * (1 - t));
  });
  kit.sprite.setScale(1, 1);
  if (kit.aborted) return;

  await kit.flourish('hop', hopA);
  if (kit.aborted) return;
  await kit.flourish('hop', hopB);
};

/**
 * CHARIZARD: a fire pillar comes down and it forms inside it, wings beating,
 * and the landing shakes the screen.
 *
 * The beam runs the whole reveal; the mon only starts forming at the point the
 * pillar has finished extending, so it reads as arriving THROUGH the fire
 * rather than next to it.
 */
const entranceCharizard: EntranceOverrideFn = async kit => {
  const [lead, beam, reveal, flutter, settle] = splitPhases(kit.ms, [10, 26, 30, 22, 12]);
  const topY = Math.max(2, kit.homeY - Math.round(46 * kit.amp));

  kit.sprite.setPosition(kit.homeX, kit.homeY);
  kit.sprite.setScale(0, 0);
  // The pillar reaches the home box within a frame or two of starting, so the
  // empty beat goes FIRST: without it the entrance's first sampled frame has
  // fire in the box before the mon has done anything.
  await kit.frames(lead, NOTHING);
  if (kit.aborted) return;

  const pillar = typeBeam(
    kit.scene, kit.homeX, topY, kit.homeX, kit.homeY,
    kit.color, kit.accent, 10, beam + reveal,
  );
  await kit.frames(beam, NOTHING);
  if (kit.aborted) { await pillar; return; }
  await Promise.all([pillar, kit.materialise(reveal)]);
  if (kit.aborted) return;
  kit.cry();

  void screenShake(kit.scene, 2, Math.min(140, flutter));
  await kit.frames(flutter, t => {
    // Wing beats are scaleY: the sprite's second frame is the BACK view, so a
    // frame flip would turn CHARIZARD around (the deviation E2 documented).
    kit.sprite.setScale(1, 1 - Math.abs(Math.sin(t * Math.PI * 3)) * 0.22 * kit.amp);
  });
  kit.sprite.setScale(1, 1);
  if (kit.aborted) return;
  await kit.flourish('stance', settle);
};

/**
 * BLASTOISE: rises behind a water-coloured wipe with two rings washing out of
 * the waterline.
 *
 * The wipe is the angular row's bottom-up reveal (the DIG mask), but the thing
 * that comes with it is water rather than rock: no falling blocks, no ground
 * heave, two `ring`s at the foot instead.
 */
const entranceBlastoise: EntranceOverrideFn = async kit => {
  const [lead, rise, fade, settle] = splitPhases(kit.ms, [6, 52, 22, 20]);
  const half = Math.round(kit.sprite.displayHeight / 2) + 1;
  const top = kit.homeY - half;
  const foot = kit.homeY + half;

  const wipe = kit.wipe();
  wipe.to(0, foot, GAME_WIDTH, 0);
  kit.sprite.setPosition(kit.homeX, kit.homeY);
  kit.sprite.setScale(1, 1);
  kit.silhouette();
  await kit.frames(lead, NOTHING);
  if (kit.aborted) return;

  await Promise.all([
    kit.frames(rise, t => {
      const h = Math.round((foot - top) * t);
      wipe.to(0, foot - h, GAME_WIDTH, h);
    }),
    ring(kit.scene, kit.homeX, kit.homeY + 12, kit.color, 22, rise, 2),
  ]);
  if (kit.aborted) return;
  wipe.to(0, 0, GAME_WIDTH, GAME_HEIGHT);
  kit.cry();
  await kit.crossFade(fade);
  if (kit.aborted) return;
  await kit.flourish('settle', settle);
};

/**
 * VENUSAUR: the wide row's slow fade-in with the ground heaving under it, and
 * leaves coming down once it is there.
 *
 * The heave runs for the whole fade (it is what the weight arriving looks
 * like) and the leaves fall AFTER the cross-fade, over the settle, so they
 * land on a VENUSAUR in its real colours rather than on a silhouette.
 */
const entranceVenusaur: EntranceOverrideFn = async kit => {
  const [lead, fade, cross, leaves] = splitPhases(kit.ms, [6, 48, 22, 24]);

  kit.sprite.setPosition(kit.homeX, kit.homeY);
  kit.sprite.setScale(1, 1);
  kit.silhouette();
  kit.sprite.setAlpha(0);
  await kit.frames(lead, NOTHING);
  if (kit.aborted) return;

  await Promise.all([
    kit.tween({ targets: kit.sprite, alpha: 1, duration: fade, ease: 'Linear' }),
    groundHeave(kit.scene, kit.color, kit.accent, 1, fade),
  ]);
  if (kit.aborted) return;
  kit.cry();
  await kit.crossFade(cross);
  if (kit.aborted) return;

  void directionalParticles(kit.scene, kit.homeX, kit.homeY - 14, kit.color, 6, {
    dirY: 1, spread: 14, duration: leaves, gravity: 0.6,
    shape: 'leaf', accentColor: kit.accent,
  });
  await kit.flourish('settle', leaves);
};

/**
 * GENGAR: a hole in the field fades up out of nothing, warping the air, and
 * becomes solid. It never lands - it was always there, you just could not see
 * it - so the flourish is a half-amplitude drift rather than a hop.
 */
const entranceGengar: EntranceOverrideFn = async kit => {
  const [lead, ghost, solid, cross, drift] = splitPhases(kit.ms, [10, 28, 30, 20, 12]);

  kit.sprite.setPosition(kit.homeX, kit.homeY);
  kit.sprite.setScale(1, 1);
  kit.silhouette(GENGAR_TINT);
  kit.sprite.setAlpha(0);
  // `warpArcs` draws on its very first frame, and the runner caught it: the
  // arcs were in the home box before GENGAR had started fading up at all. Same
  // empty lead beat the beam-led reveals take.
  await kit.frames(lead, NOTHING);
  if (kit.aborted) return;

  const arcs = warpArcs(kit.scene, kit.homeX, kit.homeY, kit.color, kit.accent, ghost + solid);
  await kit.tween({
    targets: kit.sprite, alpha: GENGAR_GHOST_ALPHA, duration: ghost, ease: 'Linear',
  });
  if (kit.aborted) { await arcs; return; }
  await kit.tween({ targets: kit.sprite, alpha: 1, duration: solid, ease: 'Linear' });
  await arcs;
  if (kit.aborted) return;
  kit.cry();

  await kit.crossFade(cross, GENGAR_TINT);
  if (kit.aborted) return;
  await kit.flourish('bob', drift, kit.amp * 0.5);
};

/**
 * ONIX: comes up out of the ground in three segments, and the screen jolts
 * with each one.
 *
 * Same wipe as BLASTOISE, driven in three snaps instead of one sweep: each
 * step jumps a third of the body over the first 45 % of its beat and then
 * holds, which is what makes it read as segments rather than a slow rise.
 */
const entranceOnix: EntranceOverrideFn = async kit => {
  const [lead, s1, s2, s3, cross, tail] = splitPhases(kit.ms, [6, 22, 22, 22, 18, 10]);
  const half = Math.round(kit.sprite.displayHeight / 2) + 1;
  const top = kit.homeY - half;
  const foot = kit.homeY + half;

  const wipe = kit.wipe();
  wipe.to(0, foot, GAME_WIDTH, 0);
  kit.sprite.setPosition(kit.homeX, kit.homeY);
  kit.sprite.setScale(1, 1);
  kit.silhouette();
  await kit.frames(lead, NOTHING);

  const steps = [s1, s2, s3];
  for (let i = 0; i < steps.length; i++) {
    if (kit.aborted) return;
    const from = i / steps.length;
    const to = (i + 1) / steps.length;
    void screenShake(kit.scene, 2, Math.min(120, steps[i]));
    await kit.frames(steps[i], t => {
      const f = from + (to - from) * Math.min(1, t / 0.45);
      const h = Math.round((foot - top) * f);
      wipe.to(0, foot - h, GAME_WIDTH, h);
    });
  }
  if (kit.aborted) return;
  wipe.to(0, 0, GAME_WIDTH, GAME_HEIGHT);
  kit.cry();
  await kit.crossFade(cross);
  if (kit.aborted) return;
  await kit.flourish('tilt', tail);
};

/**
 * SNORLAX: falls out of the sky, lands once, hard.
 *
 * This is the mass beat in its own right: `screenShake(3, 200)` where the row
 * gives every heavy species `(2, 120)`, and two rings instead of one. There is
 * no flourish after it - the bounce IS the flourish, and a SNORLAX that hops
 * after landing weighs nothing.
 */
const entranceSnorlax: EntranceOverrideFn = async kit => {
  const [lead, fall, bounce, cross] = splitPhases(kit.ms, [6, 52, 20, 22]);
  const fromY = kit.homeY - Math.round(70 * kit.amp);

  kit.sprite.setPosition(kit.homeX, fromY);
  kit.sprite.setScale(1, 1);
  kit.silhouette();
  await kit.frames(lead, NOTHING);
  if (kit.aborted) return;

  await kit.tween({
    targets: kit.sprite, y: kit.homeY, duration: fall, ease: 'Bounce.easeOut',
  });
  if (kit.aborted) return;
  kit.sprite.setPosition(kit.homeX, kit.homeY);
  kit.cry();

  void screenShake(kit.scene, 3, Math.min(200, bounce + cross));
  void ring(kit.scene, kit.homeX, kit.homeY + 14, kit.color, 26, bounce + cross, 2);
  await kit.frames(bounce, t => {
    // One big squash that eases back out: 1 -> 0.78 -> 1 on scaleY.
    const squash = Math.sin(t * Math.PI) * (1 - t * 0.35);
    kit.sprite.setScale(1 + squash * 0.16, 1 - squash * 0.22);
  });
  kit.sprite.setScale(1, 1);
  if (kit.aborted) return;
  await kit.crossFade(cross);
};

/**
 * GYARADOS: erupts out of the water. The splash goes up first and it comes up
 * through it with the snake row's wobble, fading in as it rises.
 */
const entranceGyarados: EntranceOverrideFn = async kit => {
  const [lead, rise, cross, tail] = splitPhases(kit.ms, [8, 50, 22, 20]);
  const fromY = kit.homeY + Math.round(22 * kit.amp);

  kit.sprite.setPosition(kit.homeX, fromY);
  kit.sprite.setScale(1, 1);
  kit.silhouette();
  kit.sprite.setAlpha(0);
  await kit.frames(lead, NOTHING);
  if (kit.aborted) return;

  void directionalParticles(kit.scene, kit.homeX, kit.homeY + 14, kit.color, 8, {
    dirY: -1, spread: 20, duration: rise, gravity: -0.5,
    shape: particleFor(kit.spec.palette), accentColor: kit.accent,
  });
  await kit.frames(rise, t => {
    const y = Math.round(fromY + (kit.homeY - fromY) * t);
    const x = kit.homeX + Math.round(Math.sin(t * Math.PI * 4) * 3 * kit.amp * (1 - t));
    kit.sprite.setPosition(x, y);
    // Up out of the splash rather than on top of it: solid by a third of the way.
    kit.sprite.setAlpha(Math.min(1, t / 0.3));
  });
  if (kit.aborted) return;
  kit.sprite.setPosition(kit.homeX, kit.homeY);
  kit.cry();

  await kit.crossFade(cross);
  if (kit.aborted) return;
  await kit.flourish('tilt', tail);
};

/**
 * MAGIKARP: pops in and flops. Three full flips through +/-20 degrees, lifting
 * a few pixels off the ground each time, then the round row's hop.
 *
 * The design also wants the buzz cry for it. That is E1's resolver, which the
 * E4 brief freezes (`resolveCry` gives MAGIKARP its shape contour), so the
 * joke here is visual only.
 */
const entranceMagikarp: EntranceOverrideFn = async kit => {
  const [pop, flop, cross, hop] = splitPhases(kit.ms, [30, 40, 12, 18]);

  kit.sprite.setPosition(kit.homeX, kit.homeY);
  kit.sprite.setScale(0, 0);
  kit.silhouette();
  await kit.tween({
    targets: kit.sprite, scaleX: 1, scaleY: 1, duration: pop, ease: 'Back.easeOut',
  });
  if (kit.aborted) return;

  await kit.frames(flop, t => {
    kit.sprite.setAngle(Math.sin(t * Math.PI * 6) * 20 * kit.amp);
    kit.sprite.setY(kit.homeY - Math.round(Math.abs(Math.sin(t * Math.PI * 6)) * 3 * kit.amp));
  });
  kit.sprite.setAngle(0);
  kit.sprite.setPosition(kit.homeX, kit.homeY);
  if (kit.aborted) return;
  kit.cry();

  await kit.crossFade(cross);
  if (kit.aborted) return;
  await kit.flourish('hop', hop);
};

/**
 * DRAGONITE: the bird swoop, slowed right down, with a three-ghost afterimage
 * trail behind it.
 *
 * A PIDGEY darts in; a DRAGONITE cruises. The arc is eased in AND out
 * (smoothstep) instead of linear, the flutter is two slow beats instead of
 * three fast ones, and `afterimage` follows the sprite the whole way.
 */
const entranceDragonite: EntranceOverrideFn = async kit => {
  const [swoop, cross, tail] = splitPhases(kit.ms, [62, 20, 18]);
  const fromX = kit.homeX < GAME_WIDTH / 2 ? GAME_WIDTH + 24 : -24;
  const fromY = Math.max(2, kit.homeY - Math.round(30 * kit.amp));

  kit.sprite.setScale(1, 1);
  kit.silhouette();
  kit.sprite.setPosition(fromX, fromY);

  await Promise.all([
    afterimage(kit.scene, kit.sprite, kit.color, 3, swoop),
    kit.frames(swoop, t => {
      const e = t * t * (3 - 2 * t);
      kit.sprite.setPosition(
        Math.round(fromX + (kit.homeX - fromX) * e),
        Math.round(fromY + (kit.homeY - fromY) * e + Math.sin(e * Math.PI) * 12),
      );
      kit.sprite.setScale(1, 1 - Math.abs(Math.sin(e * Math.PI * 2)) * 0.18);
    }),
  ]);
  if (kit.aborted) return;
  kit.sprite.setPosition(kit.homeX, kit.homeY);
  kit.sprite.setScale(1, 1);
  kit.cry();

  await kit.crossFade(cross);
  if (kit.aborted) return;
  await kit.flourish('bob', tail);
};

/**
 * MEWTWO: the field darkens and it assembles out of the dark, slowly, warping
 * the air around it.
 *
 * The scale-up is `Sine.easeOut`, not the `Back.easeOut` every other reveal
 * uses: the overshoot is a pop, and MEWTWO does not pop. The dim is a black
 * sheet at depth 899 - under the white ball flash at 900 and under the text
 * box at 1000, so it never darkens a line of text.
 *
 * MEWTWO is over the row's mass threshold (base HP 106) and deliberately does
 * NOT shake the screen: it never touches the ground.
 */
const entranceMewtwo: EntranceOverrideFn = async kit => {
  const [lead, form, cross, tail] = splitPhases(kit.ms, [8, 56, 20, 16]);

  kit.sprite.setPosition(kit.homeX, kit.homeY);
  kit.sprite.setScale(0, 0);
  kit.silhouette();
  await kit.frames(lead, NOTHING);
  if (kit.aborted) return;

  void kit.dim(MEWTWO_DIM, form + cross);
  await Promise.all([
    kit.tween({
      targets: kit.sprite, scaleX: 1, scaleY: 1, duration: form, ease: 'Sine.easeOut',
    }),
    warpArcs(kit.scene, kit.homeX, kit.homeY, kit.color, kit.accent, form),
    sparkle(kit.scene, kit.homeX, kit.homeY, kit.accent, 4, form),
  ]);
  if (kit.aborted) return;
  kit.cry();

  await kit.crossFade(cross);
  if (kit.aborted) return;
  await kit.flourish('bob', tail, kit.amp * 0.6);
};

/**
 * ARTICUNO / ZAPDOS / MOLTRES: one renderer, three palettes.
 *
 * A beam of the bird's own primary type comes down and it materialises inside
 * it in a shower of sparks, then hovers. Nothing here is species-specific -
 * the colour, the sparks and the beam all come from `kit.color`/`kit.accent`,
 * which the resolver filled in from `types[0]`, so ICE, ELECTRIC and FIRE give
 * three different entrances out of one function.
 */
const entranceLegendaryBird: EntranceOverrideFn = async kit => {
  const [lead, beam, reveal, hover] = splitPhases(kit.ms, [10, 26, 30, 34]);
  const topY = Math.max(2, kit.homeY - Math.round(46 * kit.amp));

  kit.sprite.setPosition(kit.homeX, kit.homeY);
  kit.sprite.setScale(0, 0);
  await kit.frames(lead, NOTHING);
  if (kit.aborted) return;

  const pillar = typeBeam(
    kit.scene, kit.homeX, topY, kit.homeX, kit.homeY,
    kit.color, kit.accent, 9, beam + reveal,
  );
  await kit.frames(beam, NOTHING);
  if (kit.aborted) { await pillar; return; }
  await Promise.all([pillar, kit.materialise(reveal)]);
  if (kit.aborted) return;
  kit.cry();

  void sparkle(kit.scene, kit.homeX, kit.homeY, kit.accent, 6, hover);
  await kit.flourish('bob', hover);
};

// ---------------------------------------------------------------------------
// The registry (design 5: keyed by `ENTRANCE_OVERRIDES`, which names the ids)
// ---------------------------------------------------------------------------

registerEntranceOverride('pikachu', entrancePikachu);
registerEntranceOverride('charizard', entranceCharizard);
registerEntranceOverride('blastoise', entranceBlastoise);
registerEntranceOverride('venusaur', entranceVenusaur);
registerEntranceOverride('gengar', entranceGengar);
registerEntranceOverride('onix', entranceOnix);
registerEntranceOverride('snorlax', entranceSnorlax);
registerEntranceOverride('gyarados', entranceGyarados);
registerEntranceOverride('magikarp', entranceMagikarp);
registerEntranceOverride('dragonite', entranceDragonite);
registerEntranceOverride('mewtwo', entranceMewtwo);
registerEntranceOverride('legendary_bird', entranceLegendaryBird);

/** Exported for the contract test only: the kit type every renderer takes. */
export type { EntranceKit };
