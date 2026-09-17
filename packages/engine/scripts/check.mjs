// The headless boundary, checked as a build step: every import inside the
// package must be relative and must stay inside `src/`. A `phaser`, `node:` or
// any other bare specifier appearing here means the engine stopped being
// portable to a second renderer.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../src', import.meta.url).pathname;

function check(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) check(p);
    else if (f.name.endsWith('.ts')) {
      const text = readFileSync(p, 'utf8');
      for (const m of text.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)) {
        if (!m[1].startsWith('.'))
          throw Error(`External dependency in headless engine: ${p}: ${m[1]}`);
        if (!join(dir, m[1]).startsWith(root)) throw Error(`Import escapes package: ${p}`);
      }
    }
  }
}

check(root);
console.log('Headless package import boundary passed.');
