// e2e orchestrator: start a vite dev server on a free port, run every
// `e2e/smoke/*.mjs` against it, retry a failed runner once, print a summary and
// exit non-zero if anything is still failing.
//
//   npm run e2e                 # the whole smoke suite
//   npm run e2e -- --only route # only runners whose name matches the regex
//
// The runners need the dev server (not `vite preview`): seeding imports
// `/src/systems/SaveSystem.ts` as a module and the `window.__claudemon` hook is
// stripped from production builds.
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { createWriteStream, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const E2E = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(E2E);
const LOG_DIR = join(E2E, 'logs');
const SMOKE_DIR = join(E2E, 'smoke');
const PORT_FROM = 5190;
const SERVER_TIMEOUT_MS = 60_000;

const argv = process.argv.slice(2);
const onlyArg = argv.includes('--only') ? argv[argv.indexOf('--only') + 1] : null;
const only = onlyArg ? new RegExp(onlyArg) : null;

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** First port at or above `from` that we can bind on 127.0.0.1. */
async function freePort(from) {
  for (let p = from; p < from + 200; p++) {
    const ok = await new Promise(resolve => {
      const s = createServer();
      s.once('error', () => resolve(false));
      s.once('listening', () => s.close(() => resolve(true)));
      s.listen(p, '127.0.0.1');
    });
    if (ok) return p;
  }
  throw new Error(`no free port at or above ${from}`);
}

async function waitForServer(url, timeoutMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) { await res.text(); return; }
    } catch { /* not up yet */ }
    await sleep(500);
  }
  throw new Error(`dev server did not answer ${url} within ${timeoutMs / 1000}s`);
}

let vite = null;
/** Kill the whole vite process group (npx spawns a child of its own). */
function killVite() {
  if (!vite || vite.killed) return;
  const pid = vite.pid;
  try { process.kill(-pid, 'SIGTERM'); } catch { try { vite.kill('SIGTERM'); } catch { /* gone */ } }
  const hard = setTimeout(() => {
    try { process.kill(-pid, 'SIGKILL'); } catch { /* gone */ }
  }, 5000);
  hard.unref();
  vite.once('exit', () => clearTimeout(hard));
}

/** Run one runner file; stream its output to the console and to its log. */
function runOnce(file, base, logPath, append) {
  return new Promise(resolve => {
    const log = createWriteStream(logPath, { flags: append ? 'a' : 'w' });
    const child = spawn(process.execPath, [join(SMOKE_DIR, file)], {
      cwd: ROOT,
      env: { ...process.env, BASE: base },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    for (const stream of [child.stdout, child.stderr]) {
      stream.on('data', d => { process.stdout.write(d); log.write(d); });
    }
    child.on('error', e => { process.stdout.write(`${e}\n`); log.write(`${e}\n`); });
    child.on('close', code => log.end(() => resolve(code ?? 1)));
  });
}

async function main() {
  mkdirSync(LOG_DIR, { recursive: true });
  const files = readdirSync(SMOKE_DIR).filter(f => f.endsWith('.mjs')).sort()
    .filter(f => !only || only.test(f));
  if (!files.length) {
    console.error(only ? `no runner matches /${onlyArg}/` : 'no runners in e2e/smoke/');
    process.exit(1);
  }

  const port = await freePort(PORT_FROM);
  const base = `http://127.0.0.1:${port}`;
  const viteLog = join(LOG_DIR, 'vite.log');
  const viteOut = createWriteStream(viteLog);
  await new Promise(r => viteOut.once('open', r));
  console.log(`e2e: vite on ${base} (log: e2e/logs/vite.log)`);
  vite = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: ROOT,
    detached: true,                                   // own process group, so killVite gets vite itself
    stdio: ['ignore', viteOut.fd, viteOut.fd],
  });
  vite.on('error', e => { console.error(`failed to start vite: ${e.message}`); process.exit(1); });

  try {
    await waitForServer(`${base}/index.html`, SERVER_TIMEOUT_MS);
  } catch (e) {
    console.error(String(e.message ?? e));
    killVite();
    process.exit(1);
  }

  const summary = [];
  for (const file of files) {
    const name = file.replace(/\.mjs$/, '');
    const logPath = join(LOG_DIR, `${name}.log`);
    console.log(`\n--- ${name} ---`);
    let attempts = 1;
    let code = await runOnce(file, base, logPath, false);
    if (code !== 0) {
      console.log(`RETRY ${name}`);
      attempts = 2;
      code = await runOnce(file, base, logPath, true);
    }
    summary.push({ name, attempts, ok: code === 0 });
  }

  killVite();

  const width = Math.max(6, ...summary.map(s => s.name.length));
  console.log('\n--- e2e summary ---');
  console.log(`${'runner'.padEnd(width)}  attempts  result`);
  for (const s of summary) {
    console.log(`${s.name.padEnd(width)}  ${String(s.attempts).padStart(8)}  ${s.ok ? 'PASS' : 'FAIL'}`);
  }
  const failed = summary.filter(s => !s.ok);
  console.log(`${summary.length - failed.length}/${summary.length} runners passed`);
  process.exitCode = failed.length ? 1 : 0;
}

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { killVite(); process.exit(130); });
}

await main();
