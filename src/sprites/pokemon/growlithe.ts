import { CustomSpriteDrawFn } from '../types';

export const growlithe: CustomSpriteDrawFn = (ctx, isBack) => {
  // Growlithe - orange puppy with black stripes, fluffy cream chest

  // Body - orange
  ctx.fillStyle = '#e08030';
  ctx.fillRect(6, 14, 20, 10);
  ctx.fillRect(4, 16, 24, 6);

  // Head
  ctx.fillStyle = '#e08030';
  ctx.fillRect(2, 6, 16, 12);
  ctx.fillRect(4, 4, 12, 3);

  // Ears - floppy
  ctx.fillStyle = '#e08030';
  ctx.fillRect(2, 2, 5, 5);
  ctx.fillRect(13, 2, 5, 5);
  // Inner ears
  ctx.fillStyle = '#c06820';
  ctx.fillRect(3, 3, 3, 3);
  ctx.fillRect(14, 3, 3, 3);

  // Fluffy cream chest tuft
  ctx.fillStyle = '#f0d898';
  ctx.fillRect(4, 14, 10, 6);
  ctx.fillRect(2, 16, 12, 4);
  ctx.fillRect(6, 12, 6, 3);

  // Head tuft
  ctx.fillStyle = '#f0d898';
  ctx.fillRect(4, 4, 4, 4);

  // Black stripes on body
  ctx.fillStyle = '#302020';
  ctx.fillRect(16, 15, 2, 6);
  ctx.fillRect(20, 14, 2, 6);
  ctx.fillRect(24, 16, 2, 4);

  // Tail - fluffy cream
  ctx.fillStyle = '#f0d898';
  ctx.fillRect(25, 10, 4, 4);
  ctx.fillRect(27, 8, 3, 4);
  ctx.fillRect(26, 14, 3, 3);

  // Front legs
  ctx.fillStyle = '#e08030';
  ctx.fillRect(6, 24, 4, 5);
  ctx.fillRect(13, 24, 4, 5);
  // Paws
  ctx.fillStyle = '#302020';
  ctx.fillRect(6, 28, 4, 2);
  ctx.fillRect(13, 28, 4, 2);

  // Back legs
  ctx.fillStyle = '#e08030';
  ctx.fillRect(21, 22, 5, 7);
  ctx.fillStyle = '#302020';
  ctx.fillRect(21, 28, 5, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(5, 8, 4, 4);
    ctx.fillRect(13, 8, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 8, 2, 2);
    ctx.fillRect(13, 8, 2, 2);
    // Nose
    ctx.fillStyle = '#302020';
    ctx.fillRect(1, 12, 3, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(5, 15, 4, 1);
  } else {
    // Back - stripe pattern visible
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 16, 2, 4);
    ctx.fillRect(14, 15, 2, 5);
    ctx.fillRect(18, 16, 2, 4);
    // Tail fluff
    ctx.fillStyle = '#f0d898';
    ctx.fillRect(25, 9, 5, 6);
  }
};
