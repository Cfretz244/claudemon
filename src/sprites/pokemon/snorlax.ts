import { CustomSpriteDrawFn } from '../types';

export const snorlax: CustomSpriteDrawFn = (ctx, isBack) => {
  // MASSIVE round body - dark teal
  ctx.fillStyle = '#386068';
  ctx.fillRect(2, 6, 28, 22);
  ctx.fillRect(0, 10, 32, 16);
  ctx.fillRect(4, 4, 24, 4);
  ctx.fillRect(1, 8, 30, 18);

  // Head
  ctx.fillStyle = '#386068';
  ctx.fillRect(8, 0, 16, 8);
  ctx.fillRect(6, 2, 20, 6);
  ctx.fillRect(10, 0, 12, 2);

  // Large cream belly
  ctx.fillStyle = '#e8d8b8';
  ctx.fillRect(6, 10, 20, 16);
  ctx.fillRect(4, 12, 24, 12);
  ctx.fillRect(8, 8, 16, 4);

  // Ears
  ctx.fillStyle = '#386068';
  ctx.fillRect(7, 0, 4, 3);
  ctx.fillRect(21, 0, 4, 3);

  // Arms resting on belly
  ctx.fillStyle = '#386068';
  ctx.fillRect(0, 12, 6, 10);
  ctx.fillRect(26, 12, 6, 10);
  // Claws
  ctx.fillStyle = '#e8d8b8';
  ctx.fillRect(0, 20, 4, 3);
  ctx.fillRect(28, 20, 4, 3);

  // Feet at bottom
  ctx.fillStyle = '#386068';
  ctx.fillRect(4, 26, 8, 4);
  ctx.fillRect(20, 26, 8, 4);
  // Foot pads
  ctx.fillStyle = '#e8d8b8';
  ctx.fillRect(5, 28, 6, 2);
  ctx.fillRect(21, 28, 6, 2);

  if (!isBack) {
    // Tiny closed eyes (sleeping) - just lines
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 3, 4, 1);
    ctx.fillRect(18, 3, 4, 1);
    // Slight smile
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 6, 6, 1);
    ctx.fillRect(12, 5, 2, 1);
    ctx.fillRect(18, 5, 2, 1);
  } else {
    // Back: big round body, darker back ridge
    ctx.fillStyle = '#2e5058';
    ctx.fillRect(10, 6, 12, 4);
    ctx.fillRect(8, 8, 16, 2);
  }
};
