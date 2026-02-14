import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

/**
 * Plays the iconic Pokemon RBY battle transition:
 * rapid screen flashes followed by a pinwheel spiral fade to black.
 */
export function playBattleTransition(scene: Phaser.Scene, onComplete: () => void): void {
  const cx = GAME_WIDTH / 2;
  const cy = GAME_HEIGHT / 2;
  const maxRadius = Math.sqrt(cx * cx + cy * cy) + 4;

  const graphics = scene.add.graphics();
  graphics.setDepth(10000);
  graphics.setScrollFactor(0);

  // Phase 1: Rapid screen flashes (black/clear alternation)
  const FLASH_INTERVAL = 50;
  const FLASH_PAIRS = 3;
  const totalFlashSteps = FLASH_PAIRS * 2;
  let flashStep = 0;

  const flashTimer = scene.time.addEvent({
    delay: FLASH_INTERVAL,
    repeat: totalFlashSteps - 1,
    callback: () => {
      flashStep++;
      graphics.clear();
      if (flashStep % 2 === 1) {
        graphics.fillStyle(0x000000);
        graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      }
    },
  });

  // Phase 2: After flashes complete, start pinwheel
  scene.time.delayedCall(FLASH_INTERVAL * totalFlashSteps + 30, () => {
    flashTimer.remove();
    graphics.clear();
    animatePinwheel(scene, graphics, cx, cy, maxRadius, onComplete);
  });
}

function animatePinwheel(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  maxRadius: number,
  onComplete: () => void,
): void {
  const NUM_ARMS = 4;
  const DURATION = 1200;
  const startTime = scene.time.now;

  // Each arm sweeps exactly one quarter turn (90°) to fill its quadrant
  const quarterAngle = (Math.PI * 2) / NUM_ARMS;

  const timer = scene.time.addEvent({
    delay: 16,
    loop: true,
    callback: () => {
      const elapsed = scene.time.now - startTime;
      const t = Math.min(elapsed / DURATION, 1);

      graphics.clear();
      graphics.fillStyle(0x000000);

      // Each arm grows from 0° to 90° width, full radius the whole time
      const sweepAngle = quarterAngle * t;

      for (let i = 0; i < NUM_ARMS; i++) {
        const startAngle = i * quarterAngle;
        graphics.slice(cx, cy, maxRadius, startAngle, startAngle + sweepAngle, false);
        graphics.fillPath();
      }

      if (t >= 1) {
        graphics.clear();
        graphics.fillStyle(0x000000);
        graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        timer.remove();
        scene.time.delayedCall(100, onComplete);
      }
    },
  });
}
