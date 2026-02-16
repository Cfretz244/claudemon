import { CustomSpriteDrawFn } from '../types';

export const geodude: CustomSpriteDrawFn = (ctx, isBack) => {
  // Geodude - gray floating rock with face and two rocky arms, no legs

  // Rocky arms
  ctx.fillStyle = '#888888';
  ctx.fillRect(2, 14, 6, 5);
  ctx.fillRect(24, 14, 6, 5);
  // Arm segments
  ctx.fillStyle = '#787878';
  ctx.fillRect(0, 16, 4, 4);
  ctx.fillRect(28, 16, 4, 4);
  // Fists
  ctx.fillStyle = '#989898';
  ctx.fillRect(0, 19, 4, 3);
  ctx.fillRect(28, 19, 4, 3);

  // Main rock body
  ctx.fillStyle = '#989898';
  ctx.fillRect(8, 6, 16, 16);
  ctx.fillRect(6, 8, 20, 12);
  ctx.fillRect(10, 4, 12, 4);

  // Rock texture / cracks
  ctx.fillStyle = '#808080';
  ctx.fillRect(10, 8, 3, 2);
  ctx.fillRect(20, 6, 2, 3);
  ctx.fillRect(8, 16, 3, 2);
  ctx.fillRect(22, 14, 2, 3);
  ctx.fillRect(14, 18, 4, 2);

  // Lighter highlight
  ctx.fillStyle = '#a8a8a8';
  ctx.fillRect(12, 5, 8, 3);
  ctx.fillRect(10, 7, 4, 2);

  if (!isBack) {
    // Eyes - angry brow
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 9, 4, 4);
    ctx.fillRect(18, 9, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 10, 2, 2);
    ctx.fillRect(18, 10, 2, 2);
    // Angry eyebrow ridge
    ctx.fillStyle = '#787878';
    ctx.fillRect(9, 8, 6, 2);
    ctx.fillRect(17, 8, 6, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 15, 8, 2);
  } else {
    // Back - rough rocky texture
    ctx.fillStyle = '#808080';
    ctx.fillRect(10, 7, 12, 10);
    ctx.fillStyle = '#787878';
    ctx.fillRect(12, 9, 3, 3);
    ctx.fillRect(18, 11, 3, 3);
    ctx.fillRect(14, 14, 4, 2);
  }
};
