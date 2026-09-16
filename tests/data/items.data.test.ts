import { describe, it, expect } from 'vitest';
import { ITEMS } from '../../src/data/items';
import { ALL_MAPS } from '../../src/data/maps';

/** The seven ids the Silph Co balls named before `data/items.ts` defined them. */
const SILPH_BALL_ITEMS = [
  'protein', 'max_revive', 'hp_up', 'x_accuracy', 'calcium', 'carbos', 'pp_up',
];

describe('ITEMS registry', () => {
  it('every entry\'s id equals its key', () => {
    for (const [key, item] of Object.entries(ITEMS)) {
      expect(item.id, key).toBe(key);
    }
  });

  it('every entry has a name, a description and a non-negative price', () => {
    for (const [key, item] of Object.entries(ITEMS)) {
      expect(item.name, key).toBeTruthy();
      expect(item.description, key).toBeTruthy();
      expect(item.price, key).toBeGreaterThanOrEqual(0);
    }
  });

  it('defines the seven items the Silph Co balls name', () => {
    for (const id of SILPH_BALL_ITEMS) {
      expect(ITEMS[id], id).toBeDefined();
    }
    expect(SILPH_BALL_ITEMS.map(id => ITEMS[id].name)).toEqual([
      'PROTEIN', 'MAX REVIVE', 'HP UP', 'X ACCURACY', 'CALCIUM', 'CARBOS', 'PP UP',
    ]);
    // X ACCURACY is a battle item; the other six are medicine.
    expect(ITEMS.x_accuracy.category).toBe('battle');
    for (const id of SILPH_BALL_ITEMS.filter(i => i !== 'x_accuracy')) {
      expect(ITEMS[id].category, id).toBe('medicine');
    }
  });

  it('every item id named by a shipped map NPC exists', () => {
    for (const [mapId, map] of Object.entries(ALL_MAPS)) {
      for (const npc of map.npcs) {
        if (!npc.itemId) continue;
        expect(ITEMS[npc.itemId], `${mapId}/${npc.id} -> ${npc.itemId}`).toBeDefined();
      }
    }
  });
});
