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
      exclude: ['src/**/*.test.ts'],
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
