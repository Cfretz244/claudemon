import { CustomSpriteDrawFn } from '../types';

export const poliwrath: CustomSpriteDrawFn = (ctx, isBack) => {
  // Poliwrath - muscular blue frog, spiral belly, angry expression, wide stance

  // Muscular body - wider
  ctx.fillStyle = '#3060a0';
  ctx.fillRect(4, 8, 24, 16);
  ctx.fillRect(2, 10, 28, 12);
  ctx.fillRect(6, 6, 20, 4);

  // White belly
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(9, 11, 14, 12);
  ctx.fillRect(11, 9, 10, 2);
  ctx.fillRect(11, 23, 10, 2);

  // Spiral on belly
  ctx.fillStyle = '#302020';
  ctx.fillRect(14, 15, 4, 2);
  ctx.fillRect(12, 13, 2, 6);
  ctx.fillRect(12, 19, 8, 2);
  ctx.fillRect(18, 13, 2, 8);
  ctx.fillRect(14, 11, 6, 2);
  ctx.fillRect(10, 13, 2, 4);
  ctx.fillRect(20, 15, 2, 4);

  // Muscular arms
  ctx.fillStyle = '#3060a0';
  ctx.fillRect(0, 10, 4, 8);
  ctx.fillRect(28, 10, 4, 8);

  // White glove fists
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 16, 4, 6);
  ctx.fillRect(28, 16, 4, 6);

  // Wide stance legs
  ctx.fillStyle = '#3060a0';
  ctx.fillRect(4, 24, 8, 6);
  ctx.fillRect(20, 24, 8, 6);
  // Feet
  ctx.fillStyle = '#204888';
  ctx.fillRect(3, 28, 9, 3);
  ctx.fillRect(20, 28, 9, 3);

  if (!isBack) {
    // Angry eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(8, 6, 5, 4);
    ctx.fillRect(19, 6, 5, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 6, 3, 2);
    ctx.fillRect(20, 6, 3, 2);
    // Angry brows
    ctx.fillStyle = '#302020';
    ctx.fillRect(7, 5, 6, 2);
    ctx.fillRect(19, 5, 6, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 8, 6, 1);
  } else {
    // Back - muscular back pattern
    ctx.fillStyle = '#204888';
    ctx.fillRect(10, 10, 12, 10);
    ctx.fillRect(8, 12, 16, 6);
  }
};
