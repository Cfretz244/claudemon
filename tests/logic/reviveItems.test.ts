import { describe, it, expect } from 'vitest';
import { reviveHp, isReviveItem, REVIVE_IDS } from '../../src/logic/reviveItems';
import { ITEMS } from '../../src/data/items';

describe('reviveHp', () => {
  it('REVIVE restores half the maximum, rounded down', () => {
    expect(reviveHp('revive', 100)).toBe(50);
    expect(reviveHp('revive', 101)).toBe(50);
    expect(reviveHp('revive', 1)).toBe(0);   // Gen I quirk, preserved deliberately
  });

  it('MAX REVIVE restores the whole bar', () => {
    expect(reviveHp('max_revive', 100)).toBe(100);
    expect(reviveHp('max_revive', 1)).toBe(1);
    expect(reviveHp('max_revive', 999)).toBe(999);
  });

  it('is null for anything that is not a revive item', () => {
    for (const id of ['potion', 'max_potion', 'full_restore', 'rare_candy', 'protein', '']) {
      expect(reviveHp(id, 100), id).toBeNull();
    }
  });

  it('never returns more than the maximum', () => {
    for (const id of REVIVE_IDS) {
      for (const maxHp of [1, 2, 7, 50, 255, 714]) {
        const hp = reviveHp(id, maxHp)!;
        expect(hp, `${id}/${maxHp}`).toBeLessThanOrEqual(maxHp);
        expect(hp, `${id}/${maxHp}`).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('isReviveItem', () => {
  it('is true exactly for the two revive items', () => {
    expect(REVIVE_IDS.map(isReviveItem)).toEqual([true, true]);
    expect(isReviveItem('potion')).toBe(false);
    expect(isReviveItem('max_potion')).toBe(false);
  });

  it('both revive ids are real items in the bag', () => {
    for (const id of REVIVE_IDS) {
      expect(ITEMS[id], id).toBeDefined();
      expect(ITEMS[id].category, id).toBe('medicine');
    }
  });
});
