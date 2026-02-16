import Phaser from 'phaser';
import { generateTileset, generatePlayerSprite, generatePikachuFollowerSprite, generatePokeballSprite } from '../utils/spriteGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Show loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 60, height / 2 - 5, 120, 10);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 58, height / 2 - 3, 116 * value, 6);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });
  }

  create(): void {
    // Generate all programmatic assets
    generateTileset(this);
    generatePlayerSprite(this);
    generatePikachuFollowerSprite(this);
    generatePokeballSprite(this);

    // Create player animations
    this.anims.create({
      key: 'player_walk_down',
      frames: [{ key: 'player', frame: 0 }, { key: 'player', frame: 4 }],
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'player_walk_up',
      frames: [{ key: 'player', frame: 1 }, { key: 'player', frame: 5 }],
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'player_walk_left',
      frames: [{ key: 'player', frame: 2 }, { key: 'player', frame: 6 }],
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'player_walk_right',
      frames: [{ key: 'player', frame: 3 }, { key: 'player', frame: 7 }],
      frameRate: 6,
      repeat: -1,
    });

    // Idle frames
    this.anims.create({
      key: 'player_idle_down',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'player_idle_up',
      frames: [{ key: 'player', frame: 1 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'player_idle_left',
      frames: [{ key: 'player', frame: 2 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'player_idle_right',
      frames: [{ key: 'player', frame: 3 }],
      frameRate: 1,
    });

    // Pikachu follower animations
    this.anims.create({
      key: 'pikachu_walk_down',
      frames: [{ key: 'pikachu_follower', frame: 0 }, { key: 'pikachu_follower', frame: 4 }],
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'pikachu_walk_up',
      frames: [{ key: 'pikachu_follower', frame: 1 }, { key: 'pikachu_follower', frame: 5 }],
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'pikachu_walk_left',
      frames: [{ key: 'pikachu_follower', frame: 2 }, { key: 'pikachu_follower', frame: 6 }],
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'pikachu_walk_right',
      frames: [{ key: 'pikachu_follower', frame: 3 }, { key: 'pikachu_follower', frame: 7 }],
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'pikachu_idle_down',
      frames: [{ key: 'pikachu_follower', frame: 0 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'pikachu_idle_up',
      frames: [{ key: 'pikachu_follower', frame: 1 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'pikachu_idle_left',
      frames: [{ key: 'pikachu_follower', frame: 2 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'pikachu_idle_right',
      frames: [{ key: 'pikachu_follower', frame: 3 }],
      frameRate: 1,
    });

    this.scene.start('TitleScene');
  }
}
