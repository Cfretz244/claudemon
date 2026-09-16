# @claudemon/engine

Claudemon owns this renderer-independent gameplay package. It has no runtime dependencies, browser globals, storage transport, animation timers, or renderer imports. Its compiled ESM and declarations work in Node and browser bundlers.

```ts
import { createSession } from '@claudemon/engine';
import { Direction } from '@claudemon/engine/types';

const game = createSession({ seed: 42, name: 'RED' });
let view = game.getSnapshot();
game.dispatch({ type: 'move', direction: Direction.DOWN, inputId: view.inputId });
view = game.getSnapshot();
if (view.pending) {
  // Render this effect, then acknowledge its exact id.
  game.dispatch({ type: 'ack', id: view.pending.id });
}
if (game.canSave) {
  // Transport/storage belongs to the client.
  const data = game.exportSave();
}
```

## Public surfaces

- `@claudemon/engine`: session, commands, detached views, effects, objective selector, shared move pipeline.
- `/content`: canonical Kanto maps, species, moves, items, trainers and music definitions.
- `/types`: domain types and direction constants.
- `/save`: versioned codec accepting legacy Claudemon saves and Codexemon v1; writes v2.
- `/testing`: fixture factories and navigation for consumer contract tests.
- `/compat/...`: **transitional Phaser imports**, explicitly enumerated. Existing Claudemon import paths re-export these modules. New presentation code should use the session API, not mutate PlayerState through this bridge.

## Migration boundary

The content and rules for the complete game live here. The authoritative command session currently supports the opening eight-map chapter used by Codexemon. It owns movement, the opening story and rewards, battle state and sequencing, item use, shopping, party/PC operations, objectives and stable saves. All continuations are data in an internal job queue; it stores no callbacks/promises.

The Phaser client uses the same content/rules and the newly extracted full move pipeline (including charge, multi-hit, special damage, recoil/drain, status/disable, Metronome and recharge). Its later campaign scenes still orchestrate their own flows through the compatibility API. This release does **not** claim that the entire Phaser campaign uses `GameSession` yet. See `docs/shared-engine.md` in the repository for migration boundaries and review guidance.

A session seed controls gameplay only. Presentation acknowledgements do not advance RNG. Saves preserve its RNG state, position, encounter counters and facing. Saving while a presentation or battle is in progress is rejected. Detached snapshots may be inspected or modified without changing the authoritative session. The session API rejects stale input tokens and duplicate/stale effect acknowledgements.

## Development

From the repository root:

```sh
npm ci                       # builds the workspace package
npm run dev                  # Vite + engine build watcher
npm test                     # existing tests plus session scenarios
npm run build
npm run engine:check         # import boundary + isolated packed-package consumer
npm run e2e
```

`dist` is generated and ignored. `npm pack ./packages/engine` contains only the built runtime, declarations and this README. There are no imports back into Claudemon's app.
