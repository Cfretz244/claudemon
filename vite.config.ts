/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    allowedHosts: ['claudemon.christopherfretz.com'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      include: ['src/systems/**', 'src/entities/**', 'src/data/**', 'src/logic/**'],
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
      },
    },
  },
});
