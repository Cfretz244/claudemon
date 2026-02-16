import { CustomSpriteDrawFn } from '../types';

export const arcanine: CustomSpriteDrawFn = (ctx, isBack) => {
  // Arcanine - large majestic orange/cream dog, flowing mane, powerful stance

  // Large body
  ctx.fillStyle = '#e08030';
  ctx.fillRect(4, 14, 24, 10);
  ctx.fillRect(2, 16, 28, 8);

  // Head - big and noble
  ctx.fillStyle = '#e08030';
  ctx.fillRect(0, 4, 14, 12);
  ctx.fillRect(2, 2, 10, 3);

  // Ears
  ctx.fillStyle = '#e08030';
  ctx.fillRect(1, 0, 4, 4);
  ctx.fillRect(9, 0, 4, 4);
  ctx.fillStyle = '#c06820';
  ctx.fillRect(2, 1, 2, 2);
  ctx.fillRect(10, 1, 2, 2);

  // Flowing mane - cream
  ctx.fillStyle = '#f0d898';
  ctx.fillRect(0, 6, 16, 10);
  ctx.fillRect(2, 4, 10, 3);
  ctx.fillRect(14, 8, 6, 8);
  ctx.fillRect(0, 16, 10, 4);

  // Black stripes on body
  ctx.fillStyle = '#302020';
  ctx.fillRect(18, 15, 2, 6);
  ctx.fillRect(22, 14, 2, 7);
  ctx.fillRect(26, 16, 2, 5);

  // Tail - large and fluffy cream
  ctx.fillStyle = '#f0d898';
  ctx.fillRect(26, 8, 4, 6);
  ctx.fillRect(28, 5, 3, 5);
  ctx.fillRect(27, 14, 3, 3);
  ctx.fillRect(29, 3, 3, 4);

  // Front legs - powerful
  ctx.fillStyle = '#e08030';
  ctx.fillRect(4, 24, 5, 6);
  ctx.fillRect(12, 24, 5, 6);
  // Paws
  ctx.fillStyle = '#302020';
  ctx.fillRect(4, 29, 5, 2);
  ctx.fillRect(12, 29, 5, 2);

  // Back legs
  ctx.fillStyle = '#e08030';
  ctx.fillRect(22, 22, 6, 8);
  ctx.fillStyle = '#302020';
  ctx.fillRect(22, 29, 6, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(3, 6, 4, 3);
    ctx.fillRect(10, 6, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 6, 2, 2);
    ctx.fillRect(10, 6, 2, 2);
    // Nose
    ctx.fillStyle = '#302020';
    ctx.fillRect(0, 10, 3, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(2, 13, 6, 1);
  } else {
    // Back - stripe pattern and mane
    ctx.fillStyle = '#302020';
    ctx.fillRect(8, 16, 2, 5);
    ctx.fillRect(13, 15, 2, 6);
    ctx.fillRect(18, 16, 2, 5);
    ctx.fillStyle = '#f0d898';
    ctx.fillRect(4, 8, 16, 6);
    ctx.fillRect(26, 6, 5, 8);
  }
};
