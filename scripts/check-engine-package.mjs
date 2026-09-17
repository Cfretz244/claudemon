// Proves the path an EXTERNAL consumer takes: pack the engine exactly as npm
// would publish it, install the tarball into a throwaway project, and import it
// from plain Node with no bundler, no alias and no dev dependencies. The app
// itself consumes the package's TypeScript sources through an alias, so this
// script is the only place `dist` is exercised inside this repo.
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = new URL('..', import.meta.url).pathname;
const dir = mkdtempSync(join(repoRoot, '.engine-check-'));
const env = { ...process.env, npm_config_cache: join(dir, 'cache') };

try {
  const packed = JSON.parse(
    execFileSync('npm', ['pack', './packages/engine', '--pack-destination', dir, '--json'], {
      cwd: repoRoot,
      encoding: 'utf8',
      env,
    }),
  );
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  execFileSync(
    'npm',
    ['install', '--ignore-scripts', '--offline', '--no-audit', '--no-fund', join(dir, packed[0].filename)],
    { cwd: dir, stdio: 'pipe', env },
  );
  writeFileSync(
    join(dir, 'consumer.mjs'),
    [
      "import assert from 'node:assert/strict';",
      "import { ENGINE_VERSION, createPokemon, ALL_MAPS, TYPE_CHART } from '@claudemon/engine';",
      "import { POKEMON_DATA, MOVES_DATA } from '@claudemon/engine/content';",
      "import { ALL_MAPS as MAPS_SUBPATH } from '@claudemon/engine/data/maps';",
      "import { MAX_PARTY_SIZE } from '@claudemon/engine/utils/constants';",
      "assert.equal(typeof ENGINE_VERSION, 'string');",
      "assert.equal(Object.keys(POKEMON_DATA).length, 151);",
      "assert.ok(Object.keys(MOVES_DATA).length > 100);",
      "assert.equal(ALL_MAPS, MAPS_SUBPATH);",
      "assert.equal(MAX_PARTY_SIZE, 6);",
      "const mon = createPokemon(25, 5);",
      "assert.equal(mon.speciesId, 25);",
      "assert.ok(mon.stats.hp > 0);",
      "assert.ok(Object.keys(TYPE_CHART).length > 0);",
      '',
    ].join('\n'),
  );
  execFileSync(process.execPath, [join(dir, 'consumer.mjs')], { cwd: dir, stdio: 'inherit' });
  console.log('Packed engine imports and runs in an isolated Node consumer.');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
