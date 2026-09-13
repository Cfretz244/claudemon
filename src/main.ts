import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCALE } from './utils/constants';
import { BootScene } from './scenes/BootScene';
import { IntroScene } from './scenes/IntroScene';
import { TitleScene } from './scenes/TitleScene';
import { OverworldScene } from './scenes/OverworldScene';
import { BattleScene } from './scenes/BattleScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  zoom: SCALE,
  parent: 'game-container',
  backgroundColor: '#000000',
  scene: [BootScene, IntroScene, TitleScene, OverworldScene, BattleScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    keyboard: true,
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
};

const game = new Phaser.Game(config);

// Dev-only test hook: lets end-to-end scripts (Playwright) read live scene
// state instead of inferring it from pixels. Stripped from production builds.
if (import.meta.env.DEV) {
  (window as unknown as { __claudemon: Phaser.Game }).__claudemon = game;
}

// Mobile touch controls (only appears on touch devices)
import { setupMobileControls } from './utils/mobileControls';
setupMobileControls();

// Global music toggle (M key)
import { soundSystem } from './systems/SoundSystem';
window.addEventListener('keydown', (e) => {
  if (e.key === 'm' || e.key === 'M') {
    soundSystem.toggleEnabled();
  }
});
