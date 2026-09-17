// What an EXTERNAL consumer gets. The app never touches `packages/engine/dist`
// — it is aliased straight at the TypeScript sources — so `dist` has exactly
// one consumer in this repo, and it is this test plus the identical CI step.
// Without it the published surface could rot for weeks unnoticed.
//
// It really packs the tarball and really imports it from a bare Node process
// with no bundler, no alias and no dev dependencies, because every cheaper
// approximation (type-checking, importing the source) is the thing that has
// never been broken.
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../..');

const pkg = JSON.parse(
  (await import('../package.json?raw')).default as unknown as string,
) as {
  name: string;
  files: string[];
  exports: Record<string, { types: string; import: string } | string>;
};

const rootPkg = JSON.parse((await import('../../../package.json?raw')).default as unknown as string) as {
  workspaces: string[];
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
};

describe('the published package', () => {
  it('ships only dist — no sources, no tests, no scripts', () => {
    expect(pkg.files).toEqual(['dist']);
  });

  it('exports the three barrels plus one subpath PATTERN per source directory', () => {
    expect(Object.keys(pkg.exports).sort()).toEqual([
      '.',
      './battle/*',
      './content',
      './data/*',
      './entities/*',
      './logic/*',
      './package.json',
      './random/*',
      './systems/*',
      './types',
      './types/*',
      './utils/*',
    ]);
    // Patterns, not a hand-maintained file list: adding a rule module must not
    // require a second edit here (the failure mode #114 shipped 70 entries of).
    for (const key of ['./battle/*', './data/*', './logic/*', './random/*', './systems/*']) {
      expect(pkg.exports[key]).toEqual({
        types: `./dist/${key.slice(2)}.d.ts`,
        import: `./dist/${key.slice(2)}.js`,
      });
    }
  });

  it('is wired into the app as a workspace, never as a registry version', () => {
    expect(rootPkg.workspaces).toEqual(['packages/*']);
    expect(rootPkg.dependencies['@claudemon/engine']).toBe('*');
  });

  it('adds no install/test/build hook — the app consumes source, not dist', () => {
    for (const hook of ['postinstall', 'prepare', 'pretest', 'prebuild', 'pree2e']) {
      expect(rootPkg.scripts[hook]).toBeUndefined();
    }
    expect(rootPkg.scripts.dev).toBe('vite');
  });

  it('packs, installs and runs in an isolated Node consumer', () => {
    const out = execFileSync('npm', ['run', 'engine:check'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    expect(out).toContain('Headless package import boundary passed.');
    expect(out).toContain('Packed engine imports and runs in an isolated Node consumer.');
  }, 180_000);
});
