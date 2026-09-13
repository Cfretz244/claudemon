import { describe, it, expect } from 'vitest';
import { shouldGiveOaksParcel, PARCEL_MART_ID } from '../../src/logic/oaksParcel';
import { ALL_MAPS } from '../../src/data/maps';

const has = (...ids: string[]) => (id: string) => ids.includes(id);

describe('shouldGiveOaksParcel', () => {
  it('Viridian mart gives the parcel once Pikachu is in hand', () => {
    expect(shouldGiveOaksParcel(PARCEL_MART_ID, { has_pikachu: true }, has())).toBe(true);
  });
  it('not before Pikachu', () => {
    expect(shouldGiveOaksParcel(PARCEL_MART_ID, {}, has())).toBe(false);
  });
  it('not while already carrying it, nor after delivery', () => {
    expect(shouldGiveOaksParcel(PARCEL_MART_ID, { has_pikachu: true }, has('oaks_parcel'))).toBe(false);
    expect(shouldGiveOaksParcel(PARCEL_MART_ID, { has_pikachu: true, delivered_parcel: true }, has())).toBe(false);
  });
  it('no other mart hands it out', () => {
    const otherMarts = Object.keys(ALL_MAPS).filter(id => id !== PARCEL_MART_ID && /mart/.test(id));
    expect(otherMarts.length).toBeGreaterThan(0);
    for (const id of otherMarts) {
      expect(shouldGiveOaksParcel(id, { has_pikachu: true }, has()), id).toBe(false);
    }
  });
  it('PARCEL_MART_ID is the Viridian mart map', () => {
    expect(ALL_MAPS[PARCEL_MART_ID]?.name).toBe('POKeMON MART');
    expect(ALL_MAPS['viridian_city'].warps.some(w => w.targetMap === PARCEL_MART_ID)).toBe(true);
  });
});
