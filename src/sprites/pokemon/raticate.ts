import { CustomSpriteDrawFn } from '../types';

export const raticate: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - larger tan rat
  ctx.fillStyle = '#d0a868';
  ctx.fillRect(6, 12, 20, 12);
  ctx.fillRect(4, 14, 24, 8);

  // Head - wider, meaner
  ctx.fillStyle = '#d0a868';
  ctx.fillRect(2, 8, 16, 10);
  ctx.fillRect(4, 6, 12, 4);

  // Cream belly
  ctx.fillStyle = '#f0e0c0';
  ctx.fillRect(8, 16, 14, 6);

  // Ears
  ctx.fillStyle = '#d0a868';
  ctx.fillRect(4, 2, 5, 6);
  ctx.fillRect(13, 2, 5, 6);
  // Inner ear
  ctx.fillStyle = '#c09048';
  ctx.fillRect(5, 3, 3, 4);
  ctx.fillRect(14, 3, 3, 4);

  if (!isBack) {
    // Eyes - angry squint
    ctx.fillStyle = '#302020';
    ctx.fillRect(5, 9, 4, 3);
    ctx.fillRect(13, 9, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 9, 2, 2);
    ctx.fillRect(13, 9, 2, 2);
    // Huge incisors
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(7, 15, 3, 4);
    ctx.fillRect(12, 15, 3, 4);
    // Whiskers
    ctx.fillStyle = '#c09048';
    ctx.fillRect(0, 12, 4, 1);
    ctx.fillRect(0, 14, 3, 1);
    ctx.fillRect(18, 12, 4, 1);
    ctx.fillRect(19, 14, 3, 1);
  } else {
    // Back fur pattern
    ctx.fillStyle = '#c09048';
    ctx.fillRect(8, 13, 16, 8);
    ctx.fillStyle = '#b08038';
    ctx.fillRect(10, 14, 12, 5);
  }

  // Feet - bigger
  ctx.fillStyle = '#c09048';
  ctx.fillRect(6, 24, 6, 4);
  ctx.fillRect(18, 24, 6, 4);

  // Tail - thin curly
  ctx.fillStyle = '#c09048';
  ctx.fillRect(26, 14, 3, 2);
  ctx.fillRect(28, 12, 3, 2);
  ctx.fillRect(26, 10, 3, 2);
};
