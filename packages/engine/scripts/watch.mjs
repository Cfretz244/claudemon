import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cwd = fileURLToPath(new URL('..', import.meta.url));
let running = false,
  dirty = false,
  timer,
  child;
function build() {
  if (running) {
    dirty = true;
    return;
  }
  running = true;
  child = spawn('npm', ['run', 'build'], { cwd, stdio: 'inherit' });
  child.on('exit', () => {
    running = false;
    if (dirty) {
      dirty = false;
      build();
    }
  });
}
const watcher = watch(new URL('../src', import.meta.url), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(build, 150);
});
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    watcher.close();
    child?.kill(signal);
    process.exit();
  });
console.log('Watching Claudemon engine source.');
