import { CustomSpriteDrawFn } from '../types';

export const rhyhorn: CustomSpriteDrawFn = (ctx, isBack) => {
  // Rhyhorn - gray rocky quadruped, horn on nose, armored plates

  // Main body - rectangular quadruped
  ctx.fillStyle = '#989088';
  ctx.fillRect(4, 12, 22, 10);
  ctx.fillRect(6, 10, 18, 14);

  // Armor plates
  ctx.fillStyle = '#888078';
  ctx.fillRect(8, 10, 6, 4);
  ctx.fillRect(16, 10, 6, 4);
  ctx.fillRect(10, 14, 10, 2);

  // Head - blocky
  ctx.fillStyle = '#989088';
  ctx.fillRect(0, 8, 10, 10);
  ctx.fillRect(2, 6, 8, 12);

  // Horn on nose
  ctx.fillStyle = '#c0b8b0';
  ctx.fillRect(0, 6, 3, 5);
  ctx.fillRect(0, 4, 2, 4);
  ctx.fillRect(0, 3, 1, 2);

  // Ear ridges
  ctx.fillStyle = '#888078';
  ctx.fillRect(4, 5, 3, 3);
  ctx.fillRect(3, 6, 2, 2);

  // Four legs - thick
  ctx.fillStyle = '#888078';
  ctx.fillRect(5, 22, 5, 6);
  ctx.fillRect(10, 22, 4, 5);
  ctx.fillRect(18, 22, 4, 5);
  ctx.fillRect(22, 22, 5, 6);

  // Feet
  ctx.fillStyle = '#787068';
  ctx.fillRect(5, 27, 5, 3);
  ctx.fillRect(22, 27, 5, 3);

  // Tail stub
  ctx.fillStyle = '#989088';
  ctx.fillRect(25, 14, 4, 4);
  ctx.fillRect(28, 12, 3, 4);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(3, 9, 2, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 9, 1, 2);
    // Nostril
    ctx.fillStyle = '#302020';
    ctx.fillRect(1, 13, 1, 1);
  } else {
    // Back armor detail
    ctx.fillStyle = '#787068';
    ctx.fillRect(10, 12, 12, 6);
    ctx.fillRect(8, 14, 16, 2);
  }
};
