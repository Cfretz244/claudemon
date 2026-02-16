import { CustomSpriteDrawFn } from '../types';

export const venomoth: CustomSpriteDrawFn = (ctx, isBack) => {
  // Venomoth - purple moth with large blue/purple wings spread

  // Left wing
  ctx.fillStyle = '#8078c0';
  ctx.fillRect(0, 6, 12, 16);
  ctx.fillRect(2, 4, 8, 2);
  ctx.fillRect(2, 22, 8, 2);
  // Wing pattern
  ctx.fillStyle = '#7050a0';
  ctx.fillRect(2, 8, 6, 4);
  ctx.fillRect(3, 16, 6, 4);

  // Right wing
  ctx.fillStyle = '#8078c0';
  ctx.fillRect(20, 6, 12, 16);
  ctx.fillRect(22, 4, 8, 2);
  ctx.fillRect(22, 22, 8, 2);
  // Wing pattern
  ctx.fillStyle = '#7050a0';
  ctx.fillRect(24, 8, 6, 4);
  ctx.fillRect(23, 16, 6, 4);

  // Body - central purple
  ctx.fillStyle = '#7050a0';
  ctx.fillRect(12, 8, 8, 18);
  ctx.fillRect(14, 6, 4, 2);

  // Head
  ctx.fillStyle = '#7050a0';
  ctx.fillRect(11, 6, 10, 8);
  ctx.fillRect(13, 4, 6, 3);

  // Antennae
  ctx.fillStyle = '#7050a0';
  ctx.fillRect(12, 1, 2, 4);
  ctx.fillRect(19, 1, 2, 4);
  ctx.fillRect(11, 0, 2, 2);
  ctx.fillRect(20, 0, 2, 2);

  // Lower body segments
  ctx.fillStyle = '#604890';
  ctx.fillRect(13, 22, 6, 2);
  ctx.fillRect(14, 24, 4, 2);

  // Legs
  ctx.fillStyle = '#604890';
  ctx.fillRect(11, 20, 3, 6);
  ctx.fillRect(19, 20, 3, 6);

  if (!isBack) {
    // Eyes - white compound
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 7, 3, 4);
    ctx.fillRect(18, 7, 3, 4);
    // Pupils
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 8, 2, 2);
    ctx.fillRect(18, 8, 2, 2);
  } else {
    // Back - wing patterns more visible
    ctx.fillStyle = '#6858b0';
    ctx.fillRect(3, 10, 4, 6);
    ctx.fillRect(25, 10, 4, 6);
    ctx.fillStyle = '#9088d0';
    ctx.fillRect(4, 12, 2, 2);
    ctx.fillRect(26, 12, 2, 2);
  }
};
