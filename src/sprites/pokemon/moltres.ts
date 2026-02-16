import { CustomSpriteDrawFn } from '../types';

export const moltres: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body
  ctx.fillStyle = '#e07030';
  ctx.fillRect(10, 10, 12, 12);
  ctx.fillRect(8, 12, 16, 8);

  // Head
  ctx.fillStyle = '#e07030';
  ctx.fillRect(11, 3, 10, 8);
  ctx.fillRect(9, 5, 14, 6);

  // Flame crest on head
  ctx.fillStyle = '#f8a030';
  ctx.fillRect(13, 0, 3, 5);
  ctx.fillRect(16, 0, 2, 4);
  ctx.fillRect(19, 0, 3, 3);
  ctx.fillRect(11, 1, 3, 3);
  // Crest tips
  ctx.fillStyle = '#f8d050';
  ctx.fillRect(14, 0, 2, 2);
  ctx.fillRect(20, 0, 2, 2);

  // Beak
  ctx.fillStyle = '#c05820';
  ctx.fillRect(7, 6, 4, 2);
  ctx.fillRect(5, 7, 3, 1);

  // Chest/belly highlight
  ctx.fillStyle = '#f8a030';
  ctx.fillRect(12, 14, 8, 6);
  ctx.fillRect(13, 12, 6, 3);

  // Left flame wing
  ctx.fillStyle = '#f8a030';
  ctx.fillRect(0, 6, 10, 10);
  ctx.fillRect(0, 4, 6, 4);
  ctx.fillRect(0, 14, 8, 4);
  // Wing flame detail
  ctx.fillStyle = '#f8d050';
  ctx.fillRect(1, 5, 4, 3);
  ctx.fillRect(0, 10, 3, 3);
  ctx.fillRect(1, 14, 4, 3);
  // Flame tips
  ctx.fillStyle = '#e07030';
  ctx.fillRect(2, 8, 6, 6);

  // Right flame wing
  ctx.fillStyle = '#f8a030';
  ctx.fillRect(22, 6, 10, 10);
  ctx.fillRect(26, 4, 6, 4);
  ctx.fillRect(24, 14, 8, 4);
  // Wing flame detail
  ctx.fillStyle = '#f8d050';
  ctx.fillRect(27, 5, 4, 3);
  ctx.fillRect(29, 10, 3, 3);
  ctx.fillRect(27, 14, 4, 3);
  // Flame tips
  ctx.fillStyle = '#e07030';
  ctx.fillRect(24, 8, 6, 6);

  // Flowing flame tail
  ctx.fillStyle = '#f8a030';
  ctx.fillRect(13, 22, 6, 4);
  ctx.fillRect(11, 24, 4, 4);
  ctx.fillRect(17, 24, 4, 4);
  ctx.fillStyle = '#f8d050';
  ctx.fillRect(9, 26, 4, 4);
  ctx.fillRect(19, 26, 4, 4);
  ctx.fillRect(14, 25, 4, 4);
  // Tail fire tips
  ctx.fillStyle = '#f8a030';
  ctx.fillRect(8, 28, 3, 4);
  ctx.fillRect(21, 28, 3, 4);
  ctx.fillRect(13, 28, 6, 4);

  // Legs
  ctx.fillStyle = '#c05820';
  ctx.fillRect(11, 20, 3, 4);
  ctx.fillRect(18, 20, 3, 4);
  // Talons
  ctx.fillRect(10, 23, 5, 2);
  ctx.fillRect(17, 23, 5, 2);

  if (!isBack) {
    // Majestic fierce eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 4, 3, 3);
    ctx.fillRect(18, 4, 3, 3);
    ctx.fillStyle = '#f8d050';
    ctx.fillRect(11, 4, 2, 2);
    ctx.fillRect(18, 4, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 4, 1, 1);
    ctx.fillRect(18, 4, 1, 1);
  } else {
    // Back: fiery wings spread, flames flowing
    ctx.fillStyle = '#f8a030';
    ctx.fillRect(0, 4, 13, 14);
    ctx.fillRect(19, 4, 13, 14);
    ctx.fillStyle = '#f8d050';
    ctx.fillRect(2, 6, 8, 10);
    ctx.fillRect(22, 6, 8, 10);
    // Flame wisps
    ctx.fillStyle = '#f8d050';
    ctx.fillRect(0, 4, 3, 2);
    ctx.fillRect(0, 10, 2, 3);
    ctx.fillRect(29, 4, 3, 2);
    ctx.fillRect(30, 10, 2, 3);
  }
};
