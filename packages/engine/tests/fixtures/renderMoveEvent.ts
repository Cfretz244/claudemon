// The scene's renderer, headless.
//
// `src/scenes/BattleScene.ts` draws a `MoveEvent` with `renderMoveEvent` +
// `settleMoveEvent`. This is the same sequence with the Phaser calls replaced
// by the trace vocabulary `legacyMove.ts` records, so `moveParity.test.ts` can
// diff engine-and-renderer against main's old scene code line for line.
//
// It is a copy, so it can drift. `moveContract.test.ts` scrapes
// `BattleScene.ts` and pins that the scene still performs these steps in this
// order; if the scene changes, that test fails rather than the parity test
// passing against a stale mirror.

import { MoveContext, MoveEvent, applyMoveEvent } from '../../src/battle/move';
import { PokemonInstance } from '../../src/types/pokemon.types';
import { MoveOutcome } from '../../src/logic/animationOutcome';

const outcomeTag = (o: MoveOutcome | undefined): string =>
  o ? `${o.kind}/${o.critical ? 1 : 0}/${o.effectiveness ?? '-'}` : '-';

/** Draw `event`, mutating `ctx` exactly where the scene does, and trace it. */
export async function renderMoveEventTrace(ctx: MoveContext, event: MoveEvent): Promise<string[]> {
  const trace: string[] = [];
  const isPlayer = event.actorIsPlayer;
  const show = (lines: string[]) => { for (const l of lines) trace.push(`msg:${l}`); };
  const animateHp = (mine: boolean, mon: PokemonInstance): Promise<void> => {
    trace.push(`bar:${mine ? 'player' : 'opponent'}:${mon.currentHp / mon.stats.hp}`);
    return Promise.resolve();
  };

  if (event.chargeCancelled) trace.push(`unhide:${isPlayer ? 'player' : 'opponent'}`);
  if (event.presentation.refreshHudBefore) trace.push('hud');

  if (!event.animation) {
    show([...event.before, ...event.messages]);
    return trace;
  }

  show(event.before);
  trace.push(`anim:${event.animation.moveId}:${event.animation.phase ?? '-'}:${outcomeTag(event.outcome)}`);

  // --- the post-animation half ---------------------------------------------
  applyMoveEvent(ctx, event);

  const pres = event.presentation;
  if (pres.effectivenessSfx === 'super') trace.push('sfx:super');
  else if (pres.effectivenessSfx === 'weak') trace.push('sfx:weak');
  if (pres.impactSfx) trace.push('sfx:hit');

  const bars: Promise<void>[] = [];
  if (pres.animateAttackerHp) bars.push(animateHp(isPlayer, ctx.attacker.pokemon));
  if (pres.animateDefenderHp) bars.push(animateHp(!isPlayer, ctx.defender.pokemon));
  if (pres.hitFlash) trace.push('flash');
  await Promise.all(bars);

  if (pres.refreshHudAfter) trace.push('hud');
  show(event.messages);
  return trace;
}
