// `tsc` emits the package's extensionless relative specifiers verbatim, which
// Node's ESM loader will not resolve. Rewrite them in `dist` to real `.js`
// paths so the packed tarball imports cleanly from plain Node.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function walk(dir) {
  for (const f of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) await walk(p);
    else if (/\.(js|ts)$/.test(p)) {
      const t = await readFile(p, 'utf8');
      await writeFile(
        p,
        t.replace(
          /(from\s+['"])(\.[^'"]+)(['"])/g,
          (_, a, b, c) => a + b + (b.endsWith('.js') ? '' : '.js') + c,
        ),
      );
    }
  }
}

await walk(new URL('../dist', import.meta.url).pathname);
