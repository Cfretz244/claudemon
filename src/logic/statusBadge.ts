import { StatusCondition } from '../types/pokemon.types';

/** Colours + label of the HP-box status badge for one status condition. */
export interface StatusBadge {
  text: string;
  color: string;
  bg: string;
}

const STATUS_BADGES: Partial<Record<StatusCondition, StatusBadge>> = {
  [StatusCondition.POISON]: { text: 'PSN', color: '#ffffff', bg: '#a040a0' },
  [StatusCondition.BURN]: { text: 'BRN', color: '#ffffff', bg: '#f08030' },
  [StatusCondition.SLEEP]: { text: 'SLP', color: '#ffffff', bg: '#a8a878' },
  [StatusCondition.PARALYSIS]: { text: 'PAR', color: '#000000', bg: '#f8d030' },
  [StatusCondition.FREEZE]: { text: 'FRZ', color: '#000000', bg: '#98d8d8' },
};

/**
 * The badge a HP box should draw for `status`, or `null` for "draw nothing".
 *
 * `NONE` (and anything unknown) maps to `null`: a mon that has just woken up or
 * thawed is `NONE`, so the badge must disappear the moment the HUD is redrawn.
 * Keeping that rule here means it is unit-pinned rather than living inside a
 * Phaser component that the test environment cannot load.
 */
export function statusBadge(status: StatusCondition): StatusBadge | null {
  return STATUS_BADGES[status] ?? null;
}
