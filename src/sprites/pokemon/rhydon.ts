import { CustomSpriteDrawFn } from '../types';

export const rhydon: CustomSpriteDrawFn = (ctx, isBack) => {
  // Rhydon - gray bipedal, drill-like horn, armored, thick tail

  // Body - large torso
  ctx.fillStyle = '#888078';
  ctx.fillRect(8, 10, 16, 14);
  ctx.fillRect(6, 12, 20, 10);

  // Belly armor
  ctx.fillStyle = '#a09888';
  ctx.fillRect(10, 14, 10, 8);

  // Head
  ctx.fillStyle = '#888078';
  ctx.fillRect(9, 4, 14, 8);
  ctx.fillRect(7, 6, 18, 6);

  // Drill horn
  ctx.fillStyle = '#c0b8b0';
  ctx.fillRect(14, 0, 4, 5);
  ctx.fillRect(15, 0, 2, 2);
  // Drill grooves
  ctx.fillStyle = '#a09890';
  ctx.fillRect(14, 2, 4, 1);
  ctx.fillRect(15, 0, 2, 1);

  // Ear/ridge
  ctx.fillStyle = '#787068';
  ctx.fillRect(7, 4, 3, 3);
  ctx.fillRect(22, 4, 3, 3);

  // Arms
  ctx.fillStyle = '#888078';
  ctx.fillRect(3, 12, 5, 4);
  ctx.fillRect(24, 12, 5, 4);
  // Claws
  ctx.fillStyle = '#c0b8b0';
  ctx.fillRect(1, 14, 3, 2);
  ctx.fillRect(28, 14, 3, 2);

  // Legs thick
  ctx.fillStyle = '#888078';
  ctx.fillRect(8, 24, 6, 5);
  ctx.fillRect(18, 24, 6, 5);

  // Feet
  ctx.fillStyle = '#787068';
  ctx.fillRect(7, 28, 7, 3);
  ctx.fillRect(17, 28, 7, 3);

  // Thick tail
  ctx.fillStyle = '#888078';
  ctx.fillRect(24, 18, 4, 4);
  ctx.fillRect(27, 16, 3, 5);
  ctx.fillRect(29, 14, 3, 4);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 7, 3, 3);
    ctx.fillRect(18, 7, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 7, 2, 2);
    ctx.fillRect(18, 7, 2, 2);
    // Mouth line
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 11, 8, 1);
  } else {
    // Back armor plates
    ctx.fillStyle = '#787068';
    ctx.fillRect(10, 10, 12, 8);
    ctx.fillRect(12, 8, 8, 2);
  }
};
