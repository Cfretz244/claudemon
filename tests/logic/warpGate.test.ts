import { describe, it, expect } from 'vitest';
import { checkEntryGates, requirementMet } from '../../src/logic/warpGate';
import type { EntryGate } from '../../src/types/map.types';

const state = (o: {
  flags?: Record<string, boolean>; badges?: string[]; defeated?: string[]; bag?: string[];
} = {}) => ({
  storyFlags: o.flags ?? {},
  badges: o.badges ?? [],
  defeatedTrainers: o.defeated ?? [],
  hasItem: (id: string) => (o.bag ?? []).includes(id),
});

describe('requirementMet', () => {
  it('empty requirement always holds', () => {
    expect(requirementMet({}, state())).toBe(true);
  });
  it('item', () => {
    expect(requirementMet({ item: 'bicycle' }, state())).toBe(false);
    expect(requirementMet({ item: 'bicycle' }, state({ bag: ['bicycle'] }))).toBe(true);
  });
  it('flag / notFlag', () => {
    expect(requirementMet({ flag: 'x' }, state())).toBe(false);
    expect(requirementMet({ flag: 'x' }, state({ flags: { x: true } }))).toBe(true);
    expect(requirementMet({ notFlag: 'x' }, state())).toBe(true);
    expect(requirementMet({ notFlag: 'x' }, state({ flags: { x: true } }))).toBe(false);
    expect(requirementMet({ notFlag: 'x' }, state({ flags: { x: false } }))).toBe(true);
  });
  it('badgeCount', () => {
    expect(requirementMet({ badgeCount: 8 }, state({ badges: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }))).toBe(false);
    expect(requirementMet({ badgeCount: 8 }, state({ badges: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] }))).toBe(true);
  });
  it('trainerNotDefeated', () => {
    expect(requirementMet({ trainerNotDefeated: 'g' }, state())).toBe(true);
    expect(requirementMet({ trainerNotDefeated: 'g' }, state({ defeated: ['g'] }))).toBe(false);
  });
  it('anyOf holds when one alternative holds', () => {
    const req = { anyOf: [{ item: 'tea' }, { flag: 'saffron_open' }] };
    expect(requirementMet(req, state())).toBe(false);
    expect(requirementMet(req, state({ bag: ['tea'] }))).toBe(true);
    expect(requirementMet(req, state({ flags: { saffron_open: true } }))).toBe(true);
    expect(requirementMet({ anyOf: [] }, state())).toBe(false);
  });
  it('all top-level fields must hold together', () => {
    const req = { item: 'a', flag: 'f' };
    expect(requirementMet(req, state({ bag: ['a'] }))).toBe(false);
    expect(requirementMet(req, state({ flags: { f: true } }))).toBe(false);
    expect(requirementMet(req, state({ bag: ['a'], flags: { f: true } }))).toBe(true);
  });
});

describe('checkEntryGates', () => {
  const ticket: EntryGate = { requires: { item: 'ticket' }, message: ['Need a ticket.'] };
  const departed: EntryGate = { from: ['dock'], requires: { notFlag: 'departed' }, message: ['Departed.'] };
  const map = { entryGates: [ticket, departed] };

  it('map without gates is always open', () => {
    expect(checkEntryGates({}, 'anywhere', state())).toEqual({ ok: true });
    expect(checkEntryGates({ entryGates: [] }, 'anywhere', state())).toEqual({ ok: true });
  });
  it('first failing gate in declaration order wins', () => {
    expect(checkEntryGates(map, 'dock', state({ flags: { departed: true } })))
      .toEqual({ ok: false, message: ['Need a ticket.'] });
    expect(checkEntryGates(map, 'dock', state({ bag: ['ticket'], flags: { departed: true } })))
      .toEqual({ ok: false, message: ['Departed.'] });
    expect(checkEntryGates(map, 'dock', state({ bag: ['ticket'] }))).toEqual({ ok: true });
  });
  it('`from` restricts a gate to specific source maps', () => {
    expect(checkEntryGates(map, 'ship_deck', state({ bag: ['ticket'], flags: { departed: true } })))
      .toEqual({ ok: true });
  });
  it('silent gate returns an empty message', () => {
    const silent = { entryGates: [{ requires: { flag: 'found' }, message: [] as string[] }] };
    expect(checkEntryGates(silent, 'x', state())).toEqual({ ok: false, message: [] });
  });
});
