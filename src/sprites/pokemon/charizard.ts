import { CustomSpriteDrawFn } from '../types';

export const charizard: CustomSpriteDrawFn = (ctx, isBack) => {
  // Wings
  ctx.fillStyle = '#48a878';
  ctx.fillRect(0, 6, 8, 12);
  ctx.fillRect(24, 6, 8, 12);
  ctx.fillStyle = '#38986c';
  ctx.fillRect(1, 8, 6, 8);
  ctx.fillRect(25, 8, 6, 8);

  // Body - large orange dragon
  ctx.fillStyle = '#f08030';
  ctx.fillRect(8, 8, 16, 16);
  ctx.fillRect(6, 10, 20, 12);

  // Head
  ctx.fillStyle = '#f08030';
  ctx.fillRect(10, 2, 12, 10);
  ctx.fillRect(8, 4, 16, 6);

  // Cream belly
  ctx.fillStyle = '#f8d868';
  ctx.fillRect(10, 14, 12, 8);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 4, 3, 3);
    ctx.fillRect(18, 4, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 4, 2, 2);
    ctx.fillRect(18, 4, 2, 2);
    // Mouth
    ctx.fillStyle = '#c06020';
    ctx.fillRect(13, 9, 6, 1);
  } else {
    // Back view - wings prominent
    ctx.fillStyle = '#48a878';
    ctx.fillRect(0, 4, 10, 14);
    ctx.fillRect(22, 4, 10, 14);
    ctx.fillStyle = '#c06020';
    ctx.fillRect(14, 6, 4, 12);
  }

  // Arms
  ctx.fillStyle = '#f08030';
  ctx.fillRect(5, 14, 4, 4);
  ctx.fillRect(23, 14, 4, 4);

  // Legs
  ctx.fillStyle = '#c06020';
  ctx.fillRect(9, 24, 6, 4);
  ctx.fillRect(17, 24, 6, 4);

  // Flame tail
  ctx.fillStyle = '#f08030';
  ctx.fillRect(22, 20, 4, 3);
  ctx.fillRect(24, 17, 3, 4);
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(25, 14, 4, 4);
  ctx.fillStyle = '#f87830';
  ctx.fillRect(26, 15, 2, 2);
};
