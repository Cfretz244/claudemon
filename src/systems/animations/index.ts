// Barrel file - the tier-3 per-move overrides (registered with
// registerSpecOverride). Every other move is drawn by the generic spec
// renderer in systems/MoveAnimations.ts; there is no per-move registry any more.
import './overrides';
// The tier-3 hand-authored ENTRANCE animations (registerEntranceOverride).
// Same idea one level up: the seven shape rows in animations/entrances.ts draw
// all 151 arrivals, and these twelve replace their own.
import './entranceOverrides';
