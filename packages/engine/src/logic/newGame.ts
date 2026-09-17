// Starting a new game: the PlayerState the overworld begins with.
//
// Extracted verbatim from OverworldScene.init()'s `data.newGame` branch. The
// scene still owns everything around it (the title/Oak intro that supplies the
// names, `syncDerivedStoryFlags()`, the map instance); this module only builds
// the state object, so "what a fresh save contains" is unit-pinned.
//
// `intro_complete` is WRITE-ONLY today: nothing in `src/` branches on it. Its
// only other writers are the save editor's presets (`data/saveEditorPresets.ts`)
// and the battle simulator's seed (`data/battleSimConfig.ts`), which set it so
// their saves look like a started game. `tests/logic/newGame.test.ts` sweeps
// `src/` to keep that true — if a reader ever appears, the sweep fails and
// whoever added it has to decide what the flag means before relying on it.

import { PlayerState } from '../entities/Player';

/** The flag a new game starts with. */
export const INTRO_COMPLETE_FLAG = 'intro_complete';

/**
 * A fresh PlayerState for `newGame`: the `PlayerState` defaults, the player's
 * and rival's chosen names (each applied only when non-empty, so an empty name
 * keeps the RED/BLUE default), and `intro_complete`. Nothing else — no party,
 * no bag, no badges, no other flag.
 */
export function newGameState(name?: string, rivalName?: string): PlayerState {
  const state = new PlayerState();
  if (name) state.name = name;
  if (rivalName) state.rivalName = rivalName;
  state.storyFlags[INTRO_COMPLETE_FLAG] = true;
  return state;
}
