// Data-driven warp gating. A map may declare `entryGates`; a warp into it is
// refused (with the gate's message) while the first applicable gate's
// requirement is unmet. Gates with side effects (cutscenes, battles, auto
// surf) stay in OverworldScene.warpTo.

import type { EntryGate, MapData, WarpRequirement } from '../types/map.types';

export interface GateState {
  storyFlags: Record<string, boolean>;
  badges: string[];
  defeatedTrainers: string[];
  hasItem(itemId: string): boolean;
}

export type GateResult =
  | { ok: true }
  | { ok: false; message: string[] };

export function requirementMet(req: WarpRequirement, state: GateState): boolean {
  if (req.item !== undefined && !state.hasItem(req.item)) return false;
  if (req.flag !== undefined && !state.storyFlags[req.flag]) return false;
  if (req.notFlag !== undefined && state.storyFlags[req.notFlag]) return false;
  if (req.badgeCount !== undefined && state.badges.length < req.badgeCount) return false;
  if (req.trainerNotDefeated !== undefined && state.defeatedTrainers.includes(req.trainerNotDefeated)) return false;
  if (req.anyOf !== undefined && !req.anyOf.some(alt => requirementMet(alt, state))) return false;
  return true;
}

export function gateApplies(gate: EntryGate, fromMapId: string): boolean {
  return gate.from === undefined || gate.from.includes(fromMapId);
}

/** First blocking gate for a warp from `fromMapId` into `map`, if any. */
export function checkEntryGates(
  map: Pick<MapData, 'entryGates'>,
  fromMapId: string,
  state: GateState,
): GateResult {
  for (const gate of map.entryGates ?? []) {
    if (!gateApplies(gate, fromMapId)) continue;
    if (!requirementMet(gate.requires, state)) return { ok: false, message: gate.message };
  }
  return { ok: true };
}
