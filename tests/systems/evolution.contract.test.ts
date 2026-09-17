import { describe, it, expect } from 'vitest';
import EVOLUTION_SRC from '../../src/systems/animations/evolution.ts?raw';
import BATTLE_SCENE_SRC from '../../src/scenes/BattleScene.ts?raw';
import BAG_SCREEN_SRC from '../../src/components/BagScreen.ts?raw';
import OVERWORLD_SRC from '../../src/scenes/OverworldScene.ts?raw';
import {
  MAX_EVOLUTION_MS, STROBE_TOTAL_MS, EVO_INTRO_MS,
} from '../../src/logic/evolutionSequence';

/**
 * The evolution renderer and both scenes import Phaser, which will not load in
 * the node test environment, so - exactly as `entrances.contract.test.ts` does
 * - these read the sources as text. What they pin is what a screenshot cannot
 * see and what is easiest to undo by accident:
 *
 *   * nothing evolves mid-battle any more: the EXP loop only QUEUES,
 *   * every path back to the overworld drains that queue, and the whiteout
 *     deliberately does not,
 *   * B cancels, and a cancelled evolution changes nothing,
 *   * the renderer restores what it borrowed and races a hard cap.
 */

/** The body of a named method, from its signature to the matching brace. */
function methodBody(src: string, signature: string): string {
  const start = src.indexOf(signature);
  if (start < 0) return '';
  let depth = 0;
  let i = src.indexOf('{', start);
  const open = i;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  return '';
}

describe('BattleScene: the EXP loop queues, it does not evolve', () => {
  const expLoop = methodBody(BATTLE_SCENE_SRC, 'private async handleOpponentFaint()');

  it('has an EXP loop to look at', () => {
    expect(expLoop.length).toBeGreaterThan(200);
  });

  it('calls checkEvolution and queues the answer', () => {
    expect(expLoop).toContain('checkEvolution(');
    expect(expLoop).toContain('queueEvolution(');
    expect(expLoop).toContain('this.pendingEvolutions');
  });

  it('never applies an evolution inline', () => {
    expect(expLoop).not.toContain('evolvePokemon(');
  });

  it('no longer shows the two inline evolution lines anywhere in the scene', () => {
    expect(BATTLE_SCENE_SRC).not.toContain('is evolving!');
    expect(BATTLE_SCENE_SRC).not.toMatch(/evolved into/);
  });

  it('resets the queue in init(), like every other per-battle field', () => {
    expect(methodBody(BATTLE_SCENE_SRC, 'init(data')).toContain('this.pendingEvolutions = []');
  });
});

describe('BattleScene: every way back to the overworld drains the queue', () => {
  const endBattle = methodBody(BATTLE_SCENE_SRC, 'private endBattle()');
  const process = methodBody(BATTLE_SCENE_SRC, 'private async processPendingEvolutions()');
  const faint = methodBody(BATTLE_SCENE_SRC, 'private async handlePlayerFaint');

  it('endBattle processes the queue and only then hands off', () => {
    expect(endBattle).toContain('processPendingEvolutions()');
    expect(endBattle).toContain('this.leaveBattle()');
    expect(endBattle).not.toContain("scene.start('OverworldScene'");
  });

  it('the hand-off is the ONLY place the queue is not already drained', () => {
    // Win, catch and run all call endBattle; the fade + scene.start live in
    // leaveBattle, which endBattle reaches only after the sequence.
    const leave = methodBody(BATTLE_SCENE_SRC, 'private leaveBattle()');
    expect(leave).toContain("scene.start('OverworldScene'");
  });

  it('the whiteout returns to the overworld WITHOUT evolving (Gen I)', () => {
    expect(faint).toContain("scene.start('OverworldScene'");
    expect(faint).not.toContain('processPendingEvolutions');
    expect(faint).not.toContain('evolvePokemon');
  });

  it('processing applies the evolution and then the new species learnset', () => {
    expect(process).toContain('playEvolution(');
    expect(process).toContain('evolvePokemon(');
    expect(process).toContain('learnsetAtLevel(');
    expect(process).toContain('promptMoveForget(');
  });

  it("a cancelled evolution applies nothing", () => {
    expect(process).toMatch(/if \(outcome === 'cancelled'\) continue;/);
    // ...and the evolve call comes after that guard, not before it.
    expect(process.indexOf("'cancelled'")).toBeLessThan(process.indexOf('evolvePokemon('));
  });

  it('empties the queue before playing it, so nothing can be played twice', () => {
    expect(process).toMatch(/this\.pendingEvolutions = \[\];/);
  });
});

describe('the renderer: presentation only', () => {
  it('never applies the evolution itself', () => {
    // The name appears in the file's doc comment, explaining why it is absent
    // from the code: the call, `evolvePokemon(`, is what must not be there.
    expect(EVOLUTION_SRC).not.toContain('evolvePokemon(');
  });

  it('reports the outcome the scenes branch on', () => {
    expect(EVOLUTION_SRC).toContain("export type EvolutionOutcome = 'evolved' | 'cancelled'");
    expect(EVOLUTION_SRC).toMatch(/export async function playEvolution\(/);
  });

  it('binds B (the X key) to cancel, and A to advance its own text', () => {
    expect(EVOLUTION_SRC).toMatch(/addKey\(K\.X\)/);
    expect(EVOLUTION_SRC).toMatch(/xKey\.on\('down', onCancel\)/);
    expect(EVOLUTION_SRC).toMatch(/addKey\(K\.Z\)/);
    expect(EVOLUTION_SRC).toMatch(/addKey\(K\.ENTER\)/);
  });

  it('only accepts the cancel while the strobe is running', () => {
    expect(EVOLUTION_SRC).toContain('if (cancelArmed) cancelled = true');
    expect(EVOLUTION_SRC).toContain('cancelArmed = true');
    expect(EVOLUTION_SRC).toContain('cancelArmed = false');
  });

  it('restores everything it borrowed in a finally', () => {
    const fin = EVOLUTION_SRC.slice(EVOLUTION_SRC.lastIndexOf('} finally {'));
    for (const call of [
      "zKey.off('down'", "enterKey.off('down'", "xKey.off('down'",
      'textBox.destroy()', 'sprite.destroy()', 'field.destroy()', 'killTweensOf',
    ]) {
      expect(fin).toContain(call);
    }
  });

  it('races a hard cap, like every other animation here', () => {
    expect(EVOLUTION_SRC).toContain('MAX_EVOLUTION_MS');
    expect(EVOLUTION_SRC).toContain('Promise.race');
    expect(EVOLUTION_SRC).toContain('aborted = true');
  });

  it('draws above the HUD but below the flash, the sparkles and the text box', () => {
    expect(EVOLUTION_SRC).toContain('export const EVO_FIELD_DEPTH = 200');
    expect(EVOLUTION_SRC).toContain('export const EVO_SPRITE_DEPTH = 201');
  });

  it('uses the shared primitives rather than new ones', () => {
    expect(EVOLUTION_SRC).toContain('screenFlash');
    expect(EVOLUTION_SRC).toContain('sparkle');
    expect(EVOLUTION_SRC).toContain('materialise');
    expect(EVOLUTION_SRC).toContain('setTintFill');
    expect(EVOLUTION_SRC).toContain('soundSystem.evolution()');
    expect(EVOLUTION_SRC).toContain('pokemonCryFor(resolveCry(');
  });

  it('shows the announcement without gating it on a key press', () => {
    expect(EVOLUTION_SRC).toMatch(/textBox\.show\(\[lines\.evolving\]\);/);
    expect(EVOLUTION_SRC).toContain('EVO_INTRO_MS');
    expect(EVO_INTRO_MS).toBeLessThan(STROBE_TOTAL_MS);
    expect(STROBE_TOTAL_MS).toBeLessThan(MAX_EVOLUTION_MS);
  });
});

describe('Rare Candy runs the same sequence from the overworld', () => {
  const rareCandy = BAG_SCREEN_SRC.split("item.id === 'rare_candy'")[1]?.split('// Status cures')[0] ?? '';

  it('checks for an evolution after the level-up', () => {
    expect(rareCandy).toContain('checkEvolution(pokemon)');
    expect(rareCandy).toContain('this.pendingEvolution =');
  });

  it('plays it only once the level-up message is done, moves first', () => {
    const after = methodBody(BAG_SCREEN_SRC, 'private afterMessageDismissed()');
    expect(after.indexOf('processNextPendingMove')).toBeLessThan(after.indexOf('runPendingEvolution'));
  });

  it('gets out of the way while the sequence plays, and comes back', () => {
    const run = methodBody(BAG_SCREEN_SRC, 'private async runPendingEvolution()');
    expect(run).toContain('this.visible = false');
    expect(run).toContain('this.container.setVisible(false)');
    expect(run).toContain('this.container.setVisible(true)');
    expect(run).toContain('await this.onEvolve(');
  });

  it('feeds the new moves through the bag\'s own forget queue', () => {
    const run = methodBody(BAG_SCREEN_SRC, 'private async runPendingEvolution()');
    expect(run).toContain('this.pendingMoves.push(');
    expect(run).toContain('processNextPendingMove()');
  });

  it('the overworld supplies the handler and owns the data change', () => {
    expect(OVERWORLD_SRC).toContain('this.runEvolution(pokemon, toSpecies)');
    const run = methodBody(OVERWORLD_SRC, 'private async runEvolution(');
    expect(run).toContain('playEvolution(');
    expect(run).toContain('evolvePokemon(');
    expect(run).toContain('learnsetAtLevel(');
    expect(run).toMatch(/if \(outcome === 'cancelled'\) return \[\];/);
  });

  it('hides the cave darkness for the sequence and puts it back', () => {
    const run = methodBody(OVERWORLD_SRC, 'private async runEvolution(');
    expect(run).toContain('darkOverlay');
    expect(run).toContain('} finally {');
  });
});
