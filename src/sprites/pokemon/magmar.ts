import { CustomSpriteDrawFn } from '../types';

export const magmar: CustomSpriteDrawFn = (ctx, isBack) => {
  // Magmar - red/yellow fire duck-like, flame on head and tail

  // Body
  ctx.fillStyle = '#d06030';
  ctx.fillRect(10, 12, 12, 12);
  ctx.fillRect(8, 14, 16, 8);

  // Yellow belly
  ctx.fillStyle = '#d8a030';
  ctx.fillRect(12, 16, 8, 8);
  ctx.fillRect(11, 18, 10, 4);

  // Head - duck-like beak
  ctx.fillStyle = '#d06030';
  ctx.fillRect(10, 4, 12, 10);
  ctx.fillRect(8, 6, 14, 6);
  // Beak/snout
  ctx.fillStyle = '#d8a030';
  ctx.fillRect(6, 8, 5, 4);
  ctx.fillRect(5, 9, 3, 2);

  // Flame on head
  ctx.fillStyle = '#f08030';
  ctx.fillRect(14, 0, 6, 6);
  ctx.fillRect(16, 0, 4, 2);
  ctx.fillRect(13, 2, 2, 4);
  ctx.fillRect(20, 1, 2, 4);
  ctx.fillStyle = '#f0c040';
  ctx.fillRect(15, 1, 4, 3);

  // Arms
  ctx.fillStyle = '#d06030';
  ctx.fillRect(4, 14, 6, 3);
  ctx.fillRect(22, 14, 6, 3);
  // Clawed hands
  ctx.fillStyle = '#c05028';
  ctx.fillRect(2, 14, 4, 4);
  ctx.fillRect(26, 14, 4, 4);

  // Legs
  ctx.fillStyle = '#d06030';
  ctx.fillRect(10, 24, 4, 5);
  ctx.fillRect(18, 24, 4, 5);
  // Feet
  ctx.fillStyle = '#c05028';
  ctx.fillRect(9, 28, 6, 3);
  ctx.fillRect(17, 28, 6, 3);

  // Flame tail
  ctx.fillStyle = '#f08030';
  ctx.fillRect(22, 18, 4, 3);
  ctx.fillRect(24, 16, 4, 4);
  ctx.fillStyle = '#f0c040';
  ctx.fillRect(26, 17, 2, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 6, 3, 3);
    ctx.fillRect(19, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 6, 2, 2);
    ctx.fillRect(19, 6, 2, 2);
  } else {
    // Back pattern
    ctx.fillStyle = '#c05028';
    ctx.fillRect(12, 14, 8, 6);
  }
};
