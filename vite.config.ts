/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    allowedHosts: ['claudemon.christopherfretz.com'],
  },
  resolve: {
    // The app, the tests and the e2e dev server all consume the engine's
    // TypeScript SOURCE through these aliases — never `packages/engine/dist`.
    // That keeps HMR, coverage and `vitest --watch` working exactly as they did
    // when these files lived under `src/`. `dist` is built only by
    // `npm run engine:check`, which is the external consumer's path.
    alias: [
      {
        find: /^@claudemon\/engine$/,
        replacement: resolve(__dirname, 'packages/engine/src/index.ts'),
      },
      {
        find: /^@claudemon\/engine\/(.*)$/,
        replacement: resolve(__dirname, 'packages/engine/src/$1'),
      },
      { find: /^@\//, replacement: '/src/' },
    ],
  },
  test: {
    include: ['tests/**/*.test.ts', 'packages/engine/tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      include: [
        'packages/engine/src/**',
        'src/systems/**',
        'src/entities/**',
        'src/data/**',
        'src/logic/**',
      ],
      // Phaser-bound modules that can't run in the node test env are excluded
      // from the denominator so the report reflects testable code
      exclude: [
        'src/**/*.test.ts',
        'src/systems/animations/**',
        'src/systems/MoveAnimations.ts',
        'src/systems/SoundSystem.ts',
      ],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sprites: resolve(__dirname, 'sprites.html'),
        sounds: resolve(__dirname, 'sounds.html'),
        pokedex: resolve(__dirname, 'pokedex.html'),
        editor: resolve(__dirname, 'editor.html'),
        maps: resolve(__dirname, 'maps.html'),
        battle: resolve(__dirname, 'battle.html'),
      },
    },
  },
});
