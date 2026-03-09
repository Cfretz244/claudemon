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
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sprites: resolve(__dirname, 'sprites.html'),
        sounds: resolve(__dirname, 'sounds.html'),
        pokedex: resolve(__dirname, 'pokedex.html'),
      },
    },
  },
});
