import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCALE } from './utils/constants';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { OverworldScene } from './scenes/OverworldScene';
import { BattleScene } from './scenes/BattleScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  zoom: SCALE,
  parent: document.body,
  backgroundColor: '#000000',
  scene: [BootScene, TitleScene, OverworldScene, BattleScene],
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

new Phaser.Game(config);
