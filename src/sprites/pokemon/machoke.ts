import { CustomSpriteDrawFn } from '../types';

export const machoke: CustomSpriteDrawFn = (ctx, isBack) => {
  // Machoke - muscular gray-blue, belt around waist, bigger than Machop

  // Body - large and muscular
  ctx.fillStyle = '#7080a0';
  ctx.fillRect(7, 10, 18, 14);
  ctx.fillRect(5, 12, 22, 10);

  // Belt
  ctx.fillStyle = '#302020';
  ctx.fillRect(6, 20, 20, 3);
  // Belt buckle
  ctx.fillStyle = '#c0a020';
  ctx.fillRect(14, 20, 4, 3);

  // Head
  ctx.fillStyle = '#7080a0';
  ctx.fillRect(9, 2, 14, 10);
  ctx.fillRect(7, 4, 18, 6);

  // Three ridges
  ctx.fillStyle = '#506878';
  ctx.fillRect(11, 0, 3, 4);
  ctx.fillRect(15, 0, 3, 3);
  ctx.fillRect(19, 0, 3, 4);

  if (!isBack) {
    // Eyes - fierce
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 5, 4, 3);
    ctx.fillRect(18, 5, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 5, 2, 2);
    ctx.fillRect(18, 5, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 9, 8, 1);
    // Vein marks on forehead
    ctx.fillStyle = '#506878';
    ctx.fillRect(14, 3, 4, 1);
  } else {
    // Back musculature
    ctx.fillStyle = '#506878';
    ctx.fillRect(10, 6, 12, 8);
    ctx.fillRect(12, 12, 8, 6);
  }

  // Big muscular arms
  ctx.fillStyle = '#7080a0';
  ctx.fillRect(2, 11, 6, 9);
  ctx.fillRect(24, 11, 6, 9);
  // Bicep definition
  ctx.fillStyle = '#8090b0';
  ctx.fillRect(3, 12, 4, 4);
  ctx.fillRect(25, 12, 4, 4);

  // Legs
  ctx.fillStyle = '#7080a0';
  ctx.fillRect(8, 24, 6, 5);
  ctx.fillRect(18, 24, 6, 5);
  // Feet
  ctx.fillStyle = '#506878';
  ctx.fillRect(7, 28, 7, 3);
  ctx.fillRect(17, 28, 7, 3);
};
