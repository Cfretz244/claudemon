# Shared gameplay extraction and Codexemon migration

This change establishes `@claudemon/engine` as the single source for campaign data and rules, and migrates the existing Codexemon chapter to a headless command session. It is the first working migration slice of the shared-engine design, not a completed conversion of every Phaser scene.

## What moved

The original data, Pokémon/player entities, domain types, pure logic and rule systems live under `packages/engine/src`. Thin re-exports keep existing Phaser source and tests compatible. Browser audio, localStorage, Phaser components and animation implementations remain app concerns. SaveData moved into the engine; the existing Phaser SaveSystem retains its legacy storage format for compatibility with its editor.

The shared `battle/move.ts` pipeline replaces ~380 lines in BattleScene and the smaller, divergent Codexemon move implementation. It resolves pre-action status, charge/release, PP, Metronome, accuracy, critical and damage rolls, multi-hit, special damage, secondary effects, recoil/drain, disable and recharge. It returns semantic animation/text information; rendering does not reroll outcomes. RNG is injectable throughout the move pipeline and Pokémon creation.

The new opening `GameSession` owns the 3D client's logical location, live map instance, player state, battle participants and teams, flow queue, shopping/storage context and encounter counters. Commands include input revisions; a pending effect must be acknowledged by its exact session/sequence id. Move learning is an explicit choice. View data is detached. No rendering promise or callback is retained in the session. Safe save export is unavailable during queued presentation or battle.

Both the Phaser Oak/parcel handlers and the session use the engine's story decisions, dialogue and rewards. The shared trainer reward helper preserves the shipped final-opponent-level × 50 rule: the lab rival pays 250, correcting Codexemon's previous use of an unused 175 field. Existing save balances are unchanged.

## Behavior and presentation changes to review

- Move outcomes now resolve atomically before their animation. RNG draw order inside the damage path is retained; HP bars still animate after the attack. The previous source-level test asserting damage mutation *after* animation was replaced with a test that the renderer uses the engine result without rerolling.
- The extracted pipeline handles exhausted PP with Struggle (the 3D preview already did); the original menu still controls legal selections.
- Codexemon now supports the shared charge/multi-hit/special move pipeline, living-participant EXP, level evolution, canonical mart stock, and the canonical rival payout. Unmodeled species have a neutral geometric placeholder rather than appearing as Pikachu.
- Codexemon's save key stays `codexemon_save`. Its transport uses the shared v2 codec, which also accepts its v1 envelope and raw Claudemon SaveData. There is no import/export UI in this PR.
- The opening content profile limits reachable maps independently of game story gates. It is not an assertion that loading all 155 maps makes the session support every dungeon.

## Current boundaries / next extraction slices

The Phaser full campaign still uses mutable PlayerState and scene-managed round/reward/overworld transitions. Its menus have not all been converted into command dispatch. `compat` is intentionally visible migration debt, not the final public gameplay architecture. A follow-up should extract those sequences in tested slices: full trainer encounter settlement and item/menu operations, then trainer sight/forced motion/warps, then dungeon and endgame stories. Remove each shim only when all callers have moved.

The opening session is tested for its actual chapter, not advertised as a complete full-campaign API. Mid-battle saves, a portable import/export screen, stable cross-session Pokémon ids, full 3D art coverage, and automatic cross-repository update PRs remain follow-ups. Automatic update PRs are not configured.

The session deliberately retains a turn-based logical grid; interpolation, camera and effects are entirely frontend concerns. Browser audio remains in each frontend for this extraction; a browser-audio package can remove that last platform duplication independently.

## Updating the 3D consumer

Codexemon vendors Claudemon as a Git submodule at `vendor/claudemon` and depends on `file:vendor/claudemon/packages/engine`, importing the compiled package rather than source paths. Its `npm run dev` supervises the engine build watcher and Vite. `engine.lock.json` records a tested Claudemon commit; `npm run engine:verify` rejects a mismatched revision or dirty engine source. `npm run engine:pin` records committed changes, and `npm run engine:update -- <ref>` selects an existing clean revision and runs both builds/test suites before pinning it.

The public Codexemon CI workflow checks out the submodule at the recorded revision, runs the engine and consumer checks, and runs headless Chromium. Local browser tests are verified against both apps before this PR is handed off.

## Review route

1. Review `battle/move.ts` against the removed `BattleScene.executeMove`/`doExecuteMove` implementation, paying attention to charge cancellation, RNG consumption, status and special damage.
2. Review `session/session.ts`, especially input/effect identities, deferred grants, faint/reward sequencing and safe save checkpoints.
3. Review the codec's legacy migration and validation.
4. Confirm content/rule moves are mechanical apart from explicit RNG injection and shared parcel helpers.
5. Run `npm ci`, `npm test`, `npm run build`, `npm run engine:check`, and `npm run e2e`. The existing source-audit tests now include the package source tree.

## Shared opening presentation

`story/opening.ts` owns the twelve Oak introduction pages, name presets, focus cues, and the Oak interception/escort choreography. Both Phaser’s TitleScene and Codexemon use these pages. Both overworld renderers execute `createOakEscortScript` steps (music, spawn, concurrent walks, dialogue, facing, removal) using their own animation primitives. Paths come from the actual Pallet collision grid and lab doorway, including approaches from the eastern grass patch.

The session emits a `cutscene` effect and remains locked in Pallet until the renderer acknowledges completion; only then does it enter the canonical lab destination. No save or player movement can interrupt the sequence. Presentation does not grant a starter or change story rewards. The shared opening tests cover all Pallet grass and exit trigger tiles, collision-free cardinal motion, synchronized following, dialogue parity, naming, and effect acknowledgement.
