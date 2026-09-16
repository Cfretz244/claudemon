# e2e smoke suite

Playwright scripts that drive the **real game** in a browser and assert on real
scene state. Unit tests (`tests/`) pin the story *decisions*; these pin the
*wiring* — that the scenes call that logic at the right moment, with the right
state, and that a save round-trips through a boot.

## Running it

```bash
npm ci
npx playwright install chromium   # once; Chromium only
npm run e2e                       # the whole suite
npm run e2e -- --only route       # runners whose filename matches the regex
```

`e2e/run.mjs` picks a free port at or above 5190, starts `vite --strictPort` on
it, waits for `/index.html`, then runs each `e2e/smoke/*.mjs` in filename order
as its own child process with `BASE` set. Output is echoed and captured to
`e2e/logs/<runner>.log`; screenshots land in `e2e/shots/<runner>/`. Both are
gitignored, and CI uploads them as an artifact when the job fails.

**Retry policy:** a runner that exits non-zero is re-run **once** (the log
prints `RETRY <name>`) and only a second failure fails the suite. One retry
absorbs a slow-runner hiccup without hiding a real break — a genuinely broken
assertion fails twice.

In CI the `e2e` job runs in parallel with `test` (not `needs: test`), so PR
feedback stays `max(test, e2e)` and `test` remains the required check.

## The dev hook

`window.__claudemon` (the Phaser `Game`) is exposed in dev builds only. Runners
read live scene state through it:

```js
const s = window.__claudemon.scene.getScene('OverworldScene');
s.playerState.toSave(); s.currentMap.id; s.playerGridX; s.textBox.getIsVisible();
```

That is why the suite uses the **dev server, not `vite preview`**: the hook is
stripped from production builds, and seeding a save imports
`/src/systems/SaveSystem.ts` as a live module from `editor.html` (same-origin
dynamic import), which only the dev server can serve.

## Adding a runner

Copy `e2e/smoke/story.mjs`, keep it small, and use `e2e/lib.mjs`:

```js
import { createRunner } from '../lib.mjs';
const t = await createRunner('my-runner');            // -> e2e/shots/my-runner/
await t.scenario('what it proves', { map: 'pokemart', x: 3, y: 2, bag: {} },
  'left', st => st.bag.oaks_parcel === 1 || `bag=${JSON.stringify(st.bag)}`);
await t.finish();                                      // exits 1 on any FAIL
```

`lib.mjs` gives you `boot(seed)`, `overworld()`, `waitOverworld()`,
`advanceText()`, `tap()`, `shot()`, `record()`, `scenario()` and `finish()`.
Anything specific to one runner (extra scene readers, a walk into a trainer's
sight) stays in that runner — see `e2e/smoke/route22.mjs`.

Rules for a new runner:

- **Deterministic output.** `PASS  <name>` / `FAIL  <name> — <detail>` /
  `KNOWN-BUG  <name>` and nothing else. No timings, no paths, no counters that
  depend on the machine — two runs must diff to nothing.
- **Assert on state, not pixels.** Screenshots are evidence for a human, never
  the check.
- **Wait on state, not the clock** (`waitOverworld`, text-visible polling). A
  fixed sleep is what makes a suite flaky on a slower runner.
- **Seed what you assert.** `boot()` leaves the new-save defaults alone unless
  the seed names a field, so pass `bag: {}` if an item count is the check.
- Keep each runner around a minute. Anything longer belongs outside the smoke
  set.

## What is deliberately NOT here

- **Move-animation runners.** Their pixel-statistics checks (blast size, type
  hue) are tuned to one machine's frame timing and are the known-flaky ones.
- **Dungeon walkthroughs** (Victory Road, Mansion, Silph, Rock Tunnel…). Each
  plays a whole floor plan for 3-4 minutes; the map-completability unit tests
  already cover the data those runs would exercise.

Both live in the helper repo as investigation tools. The smoke set is the part
that has to stay green on every PR.
