import { describe, it, expect } from 'vitest';
import OVERWORLD_SRC from '../../src/scenes/OverworldScene.ts?raw';

/**
 * `OverworldScene` imports Phaser, which cannot be loaded in the node test
 * environment, so — the same idiom as `statusBadge.contract.test.ts` and
 * `entrances.contract.test.ts` — this reads the scene as source text. The rule
 * itself is unit-tested in `tests/logic/follower.test.ts`; what no unit test can
 * see is the thing this PR is actually about: the scene has to ASK the rule
 * again every time the party can have changed without leaving the map.
 */

/** The body of a method, from its signature to the closing brace at its indent. */
function methodBody(signature: string): string {
  const start = OVERWORLD_SRC.indexOf(signature);
  expect(start).toBeGreaterThan(-1);
  const end = OVERWORLD_SRC.indexOf('\n  }\n', start);
  expect(end).toBeGreaterThan(-1);
  return OVERWORLD_SRC.slice(start, end);
}

/** `n` lines of source following the first occurrence of `marker`. */
function after(marker: string, lines = 6): string {
  const start = OVERWORLD_SRC.indexOf(marker);
  expect(start).toBeGreaterThan(-1);
  return OVERWORLD_SRC.slice(start).split('\n').slice(0, lines).join('\n');
}

describe('the follower rule lives in logic/follower.ts', () => {
  it('the scene imports followerVisible', () => {
    expect(OVERWORLD_SRC).toContain("import { followerVisible } from '../logic/follower'");
  });

  it('no inline species-only visibility test survives', () => {
    // The bug, verbatim: `party.some(p => p.speciesId === 25)` ignored HP.
    expect(OVERWORLD_SRC).not.toContain('party.some(p => p.speciesId === 25)');
  });

  it('pikachuVisible is only ever assigned inside refreshFollower()', () => {
    const assignments = [...OVERWORLD_SRC.matchAll(/this\.pikachuVisible\s*=/g)];
    expect(assignments).toHaveLength(1);
    expect(methodBody('private refreshFollower(): void {')).toContain('this.pikachuVisible = visible');
  });
});

describe('refreshFollower()', () => {
  const body = methodBody('private refreshFollower(): void {');

  it('reads the live party through the pure rule', () => {
    expect(body).toContain('followerVisible(this.playerState.party)');
  });

  it('does nothing when the answer has not changed', () => {
    expect(body).toContain('if (visible === this.pikachuVisible) return;');
  });

  it('hides the sprite immediately — tween included — whichever way it flipped', () => {
    // visible -> hidden mid-walk: the trailing tween has to die with it, or an
    // invisible sprite keeps walking and reappears a tile along.
    expect(body).toContain('this.tweens.killTweensOf(this.pikachu)');
    expect(body).toContain('this.pikachu.setVisible(false)');
    expect(body.indexOf('this.tweens.killTweensOf')).toBeLessThan(body.indexOf('if (!visible) return;'));
  });

  it('parks a newly visible follower on the player tile, facing the player', () => {
    const park = body.slice(body.indexOf('if (!visible) return;'));
    expect(park).toContain('this.pikachuGridX = this.playerGridX');
    expect(park).toContain('this.pikachuGridY = this.playerGridY');
    expect(park).toContain('this.pikachuDirection = this.playerDirection');
    expect(park).toContain('this.pikachu.setPosition');
  });
});

describe('every party-changing call site refreshes the follower', () => {
  it('create(), after the sprite exists', () => {
    const create = OVERWORLD_SRC.indexOf('this.pikachu = this.add.sprite(');
    const refresh = OVERWORLD_SRC.indexOf('this.refreshFollower()');
    expect(create).toBeGreaterThan(-1);
    expect(refresh).toBeGreaterThan(create);
  });

  it("the POKeMON CENTER heal, right where the party is restored", () => {
    expect(after('restoreParty(this.playerState.party);\n        //')).toContain('this.refreshFollower()');
  });

  it('the heal square (POKeMON TOWER 5F), which is the same restore', () => {
    expect(after('=== TileType.HEAL_TILE && restoreParty', 3)).toContain('this.refreshFollower()');
  });

  it('the bag closing — REVIVE / MAX REVIVE are bag items', () => {
    expect(after('this.bagScreen.show(this.playerState, () => {', 8)).toContain('this.refreshFollower()');
  });

  it('the party screen closing', () => {
    expect(after('this.partyScreen.show(this.playerState.party, () => {', 4)).toContain('this.refreshFollower()');
  });

  it('the PC screen closing — a deposit can take Pikachu out of the party', () => {
    expect(after('this.pcScreen.show(this.playerState, () => {', 4)).toContain('this.refreshFollower()');
  });

  it("Oak's gift, which is how the follower arrives in the first place", () => {
    const give = OVERWORLD_SRC.indexOf("if (stage === 'give_pikachu')");
    expect(give).toBeGreaterThan(-1);
    expect(OVERWORLD_SRC.slice(give, give + 700)).toContain('this.refreshFollower()');
  });
});
