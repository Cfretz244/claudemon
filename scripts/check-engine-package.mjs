import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const dir = mkdtempSync(join(tmpdir(), 'claudemon-consumer-'));
const env = { ...process.env, npm_config_cache: join(dir, 'cache') };
try {
  const packed = JSON.parse(
    execFileSync('npm', ['pack', './packages/engine', '--pack-destination', dir, '--json'], {
      encoding: 'utf8',
      env,
    }),
  );
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  execFileSync(
    'npm',
    ['install', '--ignore-scripts', '--offline', '--no-audit', join(dir, packed[0].filename)],
    { cwd: dir, stdio: 'pipe', env },
  );
  writeFileSync(
    join(dir, 'test.mjs'),
    `import assert from 'node:assert/strict';\nimport {createSession} from '@claudemon/engine';\nimport {decodeSave,encodeSave} from '@claudemon/engine/save';\nconst s=createSession({seed:1});assert.equal(s.getSnapshot().player.money,3000);assert.deepEqual(decodeSave(encodeSave(s.exportSave())),s.exportSave());\n`,
  );
  execFileSync(process.execPath, [join(dir, 'test.mjs')], { cwd: dir, stdio: 'inherit' });
  console.log('Packed engine runs in an isolated Node consumer.');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
