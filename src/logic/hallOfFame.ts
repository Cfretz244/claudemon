// Beating the Champion: the one decision the Hall of Fame sequence makes.
//
// Extracted verbatim from BattleScene.showHallOfFame(). The scene still owns
// the whole Phaser half — the fade in/out, the credits text box, the victory
// jingle, `scene.start` — and it still applies the pieces at exactly the
// moments it did before:
//
//   soundSystem.victory() -> flags        (immediately, before the credits)
//   credits read through  -> fade out
//   fade-out complete     -> healParty, then start OverworldScene at returnTo
//
// So `champion` is up while the credits are still on screen (a save taken
// mid-credits is already a champion save), and the party is healed only once
// the screen is black. Both are pinned in `tests/logic/hallOfFame.test.ts`.
//
// The result is a constant: the Champion can only be beaten from the Elite
// Four chain, there is no branch on player state, and setting `champion` a
// second time is a no-op. `hallOfFameResult()` therefore takes no arguments.

/**
 * The flag a finished game sets. Read by Cerulean Cave's entry gate
 * (`maps_cave.ts`) — the only reader in the shipped game — and offered by the
 * save editor. Exported so the write side and the gate cannot drift apart.
 */
export const CHAMPION_FLAG = 'champion';

/** Where the Hall of Fame puts the player back: the bedroom in Pallet Town. */
export interface HallOfFameReturn {
  mapId: string;
  x: number;
  y: number;
}

export interface HallOfFameResult {
  /** Story flags the scene sets, in order, right after the victory jingle. */
  flags: string[];
  /** Whether the party is fully restored before the return warp. */
  healParty: boolean;
  /** The map and tile the credits hand back to. */
  returnTo: HallOfFameReturn;
}

/** What beating the Champion does. Unconditional, and idempotent on replay. */
export function hallOfFameResult(): HallOfFameResult {
  return {
    flags: [CHAMPION_FLAG],
    healParty: true,
    returnTo: { mapId: 'player_house', x: 3, y: 5 },
  };
}
