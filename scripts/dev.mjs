import { spawn, spawnSync } from 'node:child_process';
const build = spawnSync('npm', ['run', 'engine:build'], { stdio: 'inherit' });
if (build.status) process.exit(build.status);
const children = [
  spawn('npm', ['run', 'watch', '--workspace', '@claudemon/engine'], { stdio: 'inherit' }),
  spawn('npx', ['vite', ...process.argv.slice(2)], { stdio: 'inherit' }),
];
function stop(code = 0) {
  for (const child of children) child.kill();
  process.exit(code);
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop());
for (const child of children) child.on('exit', (code) => stop(code ?? 1));
