import { describe, it, expect } from 'vitest';
import { statusBadge } from '../../src/logic/statusBadge';
import { StatusCondition } from '../../src/types/pokemon.types';

describe('statusBadge', () => {
  it('draws nothing for a Pokemon with no status', () => {
    // The whole point of the wake/thaw fix: `resolvePreAction` sets `status`
    // back to NONE, so the next HUD redraw must hide the badge.
    expect(statusBadge(StatusCondition.NONE)).toBeNull();
  });

  it('maps every real status to a three-letter badge', () => {
    expect(statusBadge(StatusCondition.SLEEP)?.text).toBe('SLP');
    expect(statusBadge(StatusCondition.FREEZE)?.text).toBe('FRZ');
    expect(statusBadge(StatusCondition.POISON)?.text).toBe('PSN');
    expect(statusBadge(StatusCondition.BURN)?.text).toBe('BRN');
    expect(statusBadge(StatusCondition.PARALYSIS)?.text).toBe('PAR');
  });

  it('gives every badge a text and background colour', () => {
    for (const status of Object.values(StatusCondition)) {
      const badge = statusBadge(status);
      if (status === StatusCondition.NONE) continue;
      expect(badge).not.toBeNull();
      expect(badge!.color).toMatch(/^#[0-9a-f]{6}$/);
      expect(badge!.bg).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('is total: an unknown status falls back to no badge', () => {
    expect(statusBadge('WHATEVER' as StatusCondition)).toBeNull();
  });
});
