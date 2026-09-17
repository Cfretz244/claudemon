// The one rule that makes `@claudemon/engine` worth extracting: nothing in it
// may reach for a renderer, a DOM or a browser store. A second client (the 3D
// one) has none of those, so a single `document.` slipping into a rule module
// would break it at import time, in CI it would not even be a type error.
//
// The check is deliberately source-as-text rather than a runtime probe: a
// branch that only touches `window` when a flag is set would never run here,
// but it would still ship.
import { describe, it, expect } from 'vitest';

/** Every .ts file in the package, as raw source text, keyed by path. */
const ENGINE_FILES = (import.meta as unknown as {
  glob(pattern: string, opts: object): Record<string, string>;
}).glob('../src/**/*.ts', { query: '?raw', import: 'default', eager: true });

const files = Object.entries(ENGINE_FILES).map(([path, text]) => ({
  path: path.replace('../', 'packages/engine/'),
  text,
}));

/**
 * Strips comments and string/template literals so a word inside prose ("no
 * Phaser dependencies") or inside a message string is not mistaken for code.
 */
function code(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/`(?:\\.|\$\{[^}]*\}|[^`\\])*`/g, '``')
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""');
}

/** Every module specifier the file imports from or re-exports from. */
function specifiers(text: string): string[] {
  return [...text.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

describe('the headless boundary', () => {
  it('sweeps a package that actually has files in it', () => {
    expect(files.length).toBeGreaterThan(60);
    expect(files.map((f) => f.path)).toContain('packages/engine/src/systems/BattleEngine.ts');
  });

  it('imports nothing outside the package — no phaser, no node builtins, no deps', () => {
    const external = files.flatMap((f) =>
      specifiers(f.text)
        .filter((s) => !s.startsWith('.'))
        .map((s) => `${f.path}: ${s}`),
    );
    expect(external).toEqual([]);
  });

  it('declares no dependencies at all', async () => {
    const pkg = JSON.parse(
      (await import('../package.json?raw')).default as unknown as string,
    ) as { dependencies?: object; peerDependencies?: object };
    expect(pkg.dependencies).toBeUndefined();
    expect(pkg.peerDependencies).toBeUndefined();
  });

  it('touches no browser global — window, document, localStorage and friends', () => {
    const banned = [
      'window',
      'document',
      'localStorage',
      'sessionStorage',
      'navigator',
      'fetch',
      'alert',
      'requestAnimationFrame',
      'HTMLElement',
      'Phaser',
    ];
    const pattern = new RegExp(`\\b(${banned.join('|')})\\b`, 'g');
    const hits = files.flatMap((f) =>
      [...code(f.text).matchAll(pattern)].map((m) => `${f.path}: ${m[1]}`),
    );
    expect(hits).toEqual([]);
  });

  it('touches no Node global either — the same source runs in a browser', () => {
    const pattern = /\b(process|__dirname|require)\b/g;
    const hits = files.flatMap((f) =>
      [...code(f.text).matchAll(pattern)].map((m) => `${f.path}: ${m[1]}`),
    );
    expect(hits).toEqual([]);
  });

  it('keeps presentation data in the app, not in the engine', () => {
    const paths = files.map((f) => f.path);
    for (const presentation of [
      'musicTracks',
      'moveAnimationSpec',
      'entranceSpec',
      'catchSequenceSpec',
      'statusBadge',
      'SoundSystem',
      'MoveAnimations',
    ]) {
      expect(paths.filter((p) => p.includes(presentation))).toEqual([]);
    }
  });

  it('keeps the localStorage half of SaveSystem in the app', () => {
    const save = files.find((f) => f.path.endsWith('systems/SaveSystem.ts'));
    expect(save).toBeDefined();
    expect(save!.text).toContain('export interface SaveData');
    expect(save!.text).not.toContain('class SaveSystem');
  });
});
