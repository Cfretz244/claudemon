import { CustomSpriteDrawFn } from '../types';

export const slowpoke: CustomSpriteDrawFn = (ctx, isBack) => {
  // Slowpoke - pink dopey quadruped, vacant round eyes, long tail

  // Long tail extending right
  ctx.fillStyle = '#d08888';
  ctx.fillRect(24, 16, 4, 4);
  ctx.fillRect(27, 14, 4, 4);
  ctx.fillRect(28, 12, 3, 4);
  // Tail tip - lighter
  ctx.fillStyle = '#e0a0a0';
  ctx.fillRect(29, 11, 3, 3);

  // Body - round quadruped
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(6, 12, 20, 10);
  ctx.fillRect(4, 14, 22, 6);

  // Head - large and dopey
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(0, 6, 14, 10);
  ctx.fillRect(2, 4, 10, 4);
  ctx.fillRect(1, 8, 14, 6);

  // Snout/muzzle
  ctx.fillStyle = '#d88898';
  ctx.fillRect(0, 10, 4, 5);
  ctx.fillRect(0, 12, 2, 3);

  if (!isBack) {
    // Vacant round eyes - very dopey
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 6, 4, 4);
    ctx.fillRect(10, 6, 4, 4);
    // Small pupils (vacant look)
    ctx.fillStyle = '#302020';
    ctx.fillRect(5, 7, 2, 2);
    ctx.fillRect(11, 7, 2, 2);
    // Open mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(1, 13, 3, 2);
    ctx.fillStyle = '#c07878';
    ctx.fillRect(1, 13, 2, 1);
  } else {
    // Back - round pink body
    ctx.fillStyle = '#d88898';
    ctx.fillRect(6, 8, 12, 8);
    ctx.fillRect(8, 14, 14, 4);
  }

  // Ears
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(3, 2, 4, 4);
  ctx.fillRect(11, 2, 4, 4);
  // Inner ear
  ctx.fillStyle = '#d88898';
  ctx.fillRect(4, 3, 2, 2);
  ctx.fillRect(12, 3, 2, 2);

  // Front legs - stubby
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(6, 22, 5, 5);
  ctx.fillRect(14, 22, 5, 5);
  // Paws
  ctx.fillStyle = '#d88898';
  ctx.fillRect(6, 26, 5, 3);
  ctx.fillRect(14, 26, 5, 3);

  // Belly
  ctx.fillStyle = '#f0b0b8';
  ctx.fillRect(8, 16, 12, 4);
};
