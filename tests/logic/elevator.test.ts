import { describe, it, expect } from 'vitest';
import { elevatorAccess, elevatorTarget, DEFAULT_LOCKED_MESSAGE, NO_ELEVATOR_MESSAGE } from '../../src/logic/elevator';
import { GateState } from '../../src/logic/warpGate';

const FLOORS = [
  { label: '1F', targetMap: 'a_1f', targetX: 1, targetY: 1 },
  { label: '5F', targetMap: 'a_5f', targetX: 1, targetY: 1 },
];
const state = (items: string[] = [], flags: Record<string, boolean> = {}): GateState =>
  ({ storyFlags: flags, badges: [], defeatedTrainers: [], hasItem: id => items.includes(id) });

describe('elevatorAccess', () => {
  it('a map without elevator data, or with no floors, only shows the stuck message', () => {
    expect(elevatorAccess({}, state())).toEqual({ ok: false, message: NO_ELEVATOR_MESSAGE });
    expect(elevatorAccess({ elevator: { floors: [] } }, state())).toEqual({ ok: false, message: NO_ELEVATOR_MESSAGE });
  });
  it('an unmet requirement shows the locked message (default if none given)', () => {
    const locked = { floors: FLOORS, requires: { item: 'lift_key' } };
    expect(elevatorAccess({ elevator: locked }, state())).toEqual({ ok: false, message: DEFAULT_LOCKED_MESSAGE });
    const custom = { ...locked, lockedMessage: ['Card key needed.'] };
    expect(elevatorAccess({ elevator: custom }, state())).toEqual({ ok: false, message: ['Card key needed.'] });
    expect(elevatorAccess({ elevator: { floors: FLOORS, requires: { flag: 'power_on' } } }, state([], { power_on: false })).ok).toBe(false);
  });
  it('a met (or absent) requirement returns the floor list', () => {
    expect(elevatorAccess({ elevator: { floors: FLOORS, requires: { item: 'lift_key' } } }, state(['lift_key']))).toEqual({ ok: true, floors: FLOORS });
    expect(elevatorAccess({ elevator: { floors: FLOORS } }, state())).toEqual({ ok: true, floors: FLOORS });
  });
});

describe('elevatorTarget', () => {
  it('returns the chosen floor unless it is the current one or out of range', () => {
    expect(elevatorTarget(FLOORS, 1, 'a_1f')).toBe(FLOORS[1]);
    expect(elevatorTarget(FLOORS, 0, 'a_1f')).toBeNull();
    expect(elevatorTarget(FLOORS, 2, 'a_1f')).toBeNull();
    expect(elevatorTarget([], 0, 'a_1f')).toBeNull();
  });
});
