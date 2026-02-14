import Phaser from 'phaser';
import { COLORS } from '../utils/constants';

export class HealthBar {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private bg: Phaser.GameObjects.Graphics;
  private bar: Phaser.GameObjects.Graphics;
  private currentPercent: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number = 48, height: number = 4) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x383838, 1);
    this.bg.fillRect(x - 1, y - 1, width + 2, height + 2);
    this.bg.setDepth(101);
    this.bg.setScrollFactor(0);

    this.bar = scene.add.graphics();
    this.bar.setDepth(102);
    this.bar.setScrollFactor(0);

    this.setPercent(1);
  }

  setPercent(percent: number): void {
    this.currentPercent = Phaser.Math.Clamp(percent, 0, 1);
    this.redraw();
  }

  animateTo(percent: number, duration: number = 500): Promise<void> {
    return new Promise(resolve => {
      const startPercent = this.currentPercent;
      const diff = percent - startPercent;

      const counter = { value: 0 };
      this.scene.tweens.add({
        targets: counter,
        value: 1,
        duration,
        onUpdate: () => {
          this.setPercent(startPercent + diff * counter.value);
        },
        onComplete: () => {
          this.setPercent(percent);
          resolve();
        },
      });
    });
  }

  private redraw(): void {
    this.bar.clear();

    let color: number;
    if (this.currentPercent > 0.5) {
      color = COLORS.HP_GREEN;
    } else if (this.currentPercent > 0.2) {
      color = COLORS.HP_YELLOW;
    } else {
      color = COLORS.HP_RED;
    }

    const barWidth = Math.floor(this.width * this.currentPercent);
    this.bar.fillStyle(color, 1);
    this.bar.fillRect(this.x, this.y, barWidth, this.height);
  }

  setPosition(x: number, y: number): void {
    const dx = x - this.x;
    const dy = y - this.y;
    this.x = x;
    this.y = y;
    this.bg.clear();
    this.bg.fillStyle(0x383838, 1);
    this.bg.fillRect(x - 1, y - 1, this.width + 2, this.height + 2);
    this.redraw();
  }

  destroy(): void {
    this.bg.destroy();
    this.bar.destroy();
  }
}
