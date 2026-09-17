// `packaging.test.ts` has to leave the bundler and drive npm directly. The repo
// deliberately has no `@types/node` (see `tests/vite-env.d.ts`), so the three
// builtins it needs are declared here rather than pulling in a dependency the
// engine package is not allowed to have anyway.
declare module 'node:child_process' {
  export function execFileSync(
    file: string,
    args: string[],
    options: { cwd?: string; encoding: 'utf8'; stdio?: string },
  ): string;
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
}

declare module 'node:path' {
  export function resolve(...paths: string[]): string;
}
