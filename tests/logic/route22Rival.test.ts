import { describe, it, expect } from 'vitest';
import { shouldSkipNPC } from '../../src/logic/npcVisibility';
import { ALL_MAPS } from '../../src/data/maps';
import { TRAINERS } from '../../src/data/trainers';

/**
 * Gen I Route 22 has two rival fights on the same spot:
 *  - first (optional): appears once the Pokedex is in hand (Oak's Parcel
 *    delivered), removed once the player holds the Boulder Badge;
 *  - rematch (mandatory): appears with all eight badges, on the way to
 *    Victory Road.
 * Both vanish after their battle. Exactly one of the two NPC entries is ever
 * visible, so sharing a tile is safe.
 */

const noItems = (_id: string) => false;
const route22 = ALL_MAPS.route22;
const first = route22.npcs.find(n => n.id === 'rival_route22')!;
const rematch = route22.npcs.find(n => n.id === 'rival_route22_2')!;

const ALL_BADGES = ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH', 'VOLCANO', 'EARTH'];

function visible(npc: typeof first, flags: Record<string, boolean>, badges: string[], defeated: string[] = []) {
  return !shouldSkipNPC(npc, flags, badges, defeated, noItems);
}

describe('Route 22 rival placement', () => {
  it('both rival entries exist, are sight-range trainers, and share the same tile', () => {
    expect(first).toBeDefined();
    expect(rematch).toBeDefined();
    for (const npc of [first, rematch]) {
      expect(npc.isTrainer).toBe(true);
      expect(npc.sightRange).toBeGreaterThan(0);
      expect(npc.id in TRAINERS).toBe(true);
    }
    expect([rematch.x, rematch.y]).toEqual([first.x, first.y]);
    expect(rematch.direction).toBe(first.direction);
  });

  it('the rematch team is the late-game one', () => {
    const levels = TRAINERS.rival_route22_2.team.map(p => p.level);
    expect(levels.length).toBe(6);
    expect(Math.min(...levels)).toBeGreaterThanOrEqual(45);
    expect(Math.max(...TRAINERS.rival_route22.team.map(p => p.level))).toBeLessThan(10);
  });
});

describe('Route 22 first rival fight', () => {
  it('is hidden before Oak\'s Parcel is delivered', () => {
    expect(visible(first, {}, [])).toBe(false);
    expect(visible(first, { has_pikachu: true }, [])).toBe(false);
  });

  it('appears once the parcel is delivered and no badge is held', () => {
    expect(visible(first, { delivered_parcel: true }, [])).toBe(true);
  });

  it('is removed once the player holds the Boulder Badge', () => {
    expect(visible(first, { delivered_parcel: true }, ['BOULDER'])).toBe(false);
    expect(visible(first, { delivered_parcel: true }, ALL_BADGES)).toBe(false);
  });

  it('is removed after the battle', () => {
    expect(visible(first, { delivered_parcel: true }, [], ['rival_route22'])).toBe(false);
  });
});

describe('Route 22 rival rematch', () => {
  it('is hidden until all eight badges are held', () => {
    expect(visible(rematch, {}, [])).toBe(false);
    expect(visible(rematch, { delivered_parcel: true }, ['BOULDER'])).toBe(false);
    expect(visible(rematch, { delivered_parcel: true }, ALL_BADGES.slice(0, 7))).toBe(false);
  });

  it('appears with eight badges', () => {
    expect(visible(rematch, { delivered_parcel: true }, ALL_BADGES)).toBe(true);
  });

  it('appears with eight badges even if the first fight was skipped', () => {
    expect(visible(rematch, { delivered_parcel: true }, ALL_BADGES, [])).toBe(true);
    expect(visible(first, { delivered_parcel: true }, ALL_BADGES, [])).toBe(false);
  });

  it('is removed after the battle', () => {
    expect(visible(rematch, { delivered_parcel: true }, ALL_BADGES, ['rival_route22_2'])).toBe(false);
  });
});

describe('Route 22 rival entries never overlap', () => {
  const flagSets: Record<string, boolean>[] = [{}, { delivered_parcel: true }];
  const badgeSets = [[], ['BOULDER'], ALL_BADGES.slice(0, 7), ALL_BADGES];
  const defeatedSets = [[], ['rival_route22'], ['rival_route22_2'], ['rival_route22', 'rival_route22_2']];

  it('at most one of the two is visible in every story state', () => {
    for (const flags of flagSets) for (const badges of badgeSets) for (const defeated of defeatedSets) {
      const shown = [first, rematch].filter(n => visible(n, flags, badges, defeated)).map(n => n.id);
      expect(shown.length, `state flags=${JSON.stringify(flags)} badges=${badges.length} defeated=${defeated}`)
        .toBeLessThanOrEqual(1);
    }
  });
});
