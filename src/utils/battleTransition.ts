import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from './constants';

/**
 * Plays the wild encounter battle transition:
 * rapid screen flashes followed by a pinwheel spiral fade to black.
 */
export function playBattleTransition(scene: Phaser.Scene, onComplete: () => void, onStart?: () => void): void {
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
    if (onStart) onStart();
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

/**
 * Generates tile coordinates in a clockwise spiral from the outside in.
 */
function generateSpiralOrder(cols: number, rows: number): { x: number; y: number }[] {
  const order: { x: number; y: number }[] = [];
  let top = 0, bottom = rows - 1, left = 0, right = cols - 1;

  while (top <= bottom && left <= right) {
    // Top edge: left to right
    for (let x = left; x <= right; x++) order.push({ x, y: top });
    top++;

    // Right edge: top to bottom
    for (let y = top; y <= bottom; y++) order.push({ x: right, y });
    right--;

    // Bottom edge: right to left
    if (top <= bottom) {
      for (let x = right; x >= left; x--) order.push({ x, y: bottom });
      bottom--;
    }

    // Left edge: bottom to top
    if (left <= right) {
      for (let y = bottom; y >= top; y--) order.push({ x: left, y });
      left++;
    }
  }

  return order;
}

/**
 * Plays the trainer battle transition:
 * rapid screen flashes followed by black squares filling in from the outside
 * in a clockwise spiral pattern. onStart fires when the spiral begins (after flashes).
 */
export function playTrainerBattleTransition(
  scene: Phaser.Scene,
  onComplete: () => void,
  onStart?: () => void,
): void {
  const graphics = scene.add.graphics();
  graphics.setDepth(10000);
  graphics.setScrollFactor(0);

  // Phase 1: Rapid screen flashes
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

  // Phase 2: After flashes, spiral fill
  scene.time.delayedCall(FLASH_INTERVAL * totalFlashSteps + 30, () => {
    flashTimer.remove();
    graphics.clear();
    if (onStart) onStart();
    animateSpiral(scene, graphics, onComplete);
  });
}

function animateSpiral(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  onComplete: () => void,
): void {
  const SQUARE_SIZE = 8; // 8px squares for a finer spiral
  const cols = GAME_WIDTH / SQUARE_SIZE;   // 20
  const rows = GAME_HEIGHT / SQUARE_SIZE;  // 18
  const spiral = generateSpiralOrder(cols, rows);
  const totalTiles = spiral.length;        // 360

  const TILES_PER_TICK = 5;
  let filled = 0;

  graphics.fillStyle(0x000000);

  const timer = scene.time.addEvent({
    delay: 16,
    loop: true,
    callback: () => {
      const end = Math.min(filled + TILES_PER_TICK, totalTiles);
      for (let i = filled; i < end; i++) {
        const tile = spiral[i];
        graphics.fillRect(tile.x * SQUARE_SIZE, tile.y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
      }
      filled = end;

      if (filled >= totalTiles) {
        timer.remove();
        scene.time.delayedCall(100, onComplete);
      }
    },
  });
}
