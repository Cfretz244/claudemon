import { CustomSpriteDrawFn } from '../types';

export const electabuzz: CustomSpriteDrawFn = (ctx, isBack) => {
  // Electabuzz - yellow with black V-stripes, electric antennae

  // Body
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(10, 10, 12, 14);
  ctx.fillRect(8, 12, 16, 10);

  // Head
  ctx.fillRect(10, 3, 12, 10);
  ctx.fillRect(9, 5, 14, 6);

  // Electric antennae
  ctx.fillStyle = '#302020';
  ctx.fillRect(12, 0, 2, 5);
  ctx.fillRect(20, 0, 2, 5);
  // Antenna tips
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(11, 0, 2, 2);
  ctx.fillRect(19, 0, 2, 2);

  // Black V-stripes on chest
  ctx.fillStyle = '#302020';
  ctx.fillRect(12, 13, 2, 2);
  ctx.fillRect(18, 13, 2, 2);
  ctx.fillRect(13, 15, 2, 2);
  ctx.fillRect(17, 15, 2, 2);
  ctx.fillRect(14, 17, 4, 2);

  // Arms - thick
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(4, 12, 6, 4);
  ctx.fillRect(22, 12, 6, 4);
  // Fists
  ctx.fillRect(2, 12, 4, 5);
  ctx.fillRect(26, 12, 4, 5);

  // Legs
  ctx.fillRect(10, 24, 4, 5);
  ctx.fillRect(18, 24, 4, 5);
  // Feet
  ctx.fillStyle = '#c0a028';
  ctx.fillRect(9, 28, 6, 3);
  ctx.fillRect(17, 28, 6, 3);

  // Tail
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(22, 20, 3, 4);
  ctx.fillRect(24, 18, 3, 4);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 6, 3, 3);
    ctx.fillRect(19, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 6, 2, 2);
    ctx.fillRect(19, 6, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 10, 4, 1);
  } else {
    // Back stripes
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 13, 2, 4);
    ctx.fillRect(17, 13, 2, 4);
    ctx.fillStyle = '#c0a028';
    ctx.fillRect(12, 12, 8, 8);
  }
};
