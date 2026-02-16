import { CustomSpriteDrawFn } from '../types';

export const nidoqueen: CustomSpriteDrawFn = (ctx, isBack) => {
  // Large body - blue bipedal
  ctx.fillStyle = '#4878a8';
  ctx.fillRect(6, 10, 20, 16);
  ctx.fillRect(4, 12, 24, 12);

  // Head
  ctx.fillStyle = '#4878a8';
  ctx.fillRect(6, 2, 16, 10);
  ctx.fillRect(8, 0, 12, 4);

  // Armored chest plates
  ctx.fillStyle = '#5890b8';
  ctx.fillRect(8, 14, 16, 8);
  ctx.fillRect(10, 12, 12, 2);
  // Plate segments
  ctx.fillStyle = '#4878a8';
  ctx.fillRect(15, 14, 2, 8);
  ctx.fillRect(8, 18, 16, 1);

  // Horn on forehead
  ctx.fillStyle = '#e0d0c0';
  ctx.fillRect(14, 0, 4, 3);
  ctx.fillRect(15, -1, 2, 2);

  // Ears
  ctx.fillStyle = '#4878a8';
  ctx.fillRect(4, 0, 4, 5);
  ctx.fillRect(22, 0, 4, 5);
  // Inner ear
  ctx.fillStyle = '#5890b8';
  ctx.fillRect(5, 1, 2, 3);
  ctx.fillRect(23, 1, 2, 3);

  if (!isBack) {
    // Eyes - fierce
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 4, 4, 3);
    ctx.fillRect(17, 4, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 4, 2, 2);
    ctx.fillRect(17, 4, 2, 2);
    // Jaw/mouth
    ctx.fillStyle = '#385888';
    ctx.fillRect(10, 8, 10, 2);
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 9, 6, 1);
  } else {
    // Back spines
    ctx.fillStyle = '#385888';
    ctx.fillRect(8, 8, 5, 4);
    ctx.fillRect(14, 6, 5, 4);
    ctx.fillRect(20, 8, 5, 4);
    ctx.fillRect(11, 12, 5, 4);
    ctx.fillRect(17, 12, 5, 4);
    // Darker back
    ctx.fillStyle = '#385888';
    ctx.fillRect(8, 14, 16, 10);
    ctx.fillStyle = '#4878a8';
    ctx.fillRect(10, 15, 12, 8);
  }

  // Strong arms
  ctx.fillStyle = '#4878a8';
  ctx.fillRect(1, 14, 5, 6);
  ctx.fillRect(26, 14, 5, 6);
  // Claws
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 18, 3, 2);
  ctx.fillRect(29, 18, 3, 2);

  // Strong legs
  ctx.fillStyle = '#385888';
  ctx.fillRect(6, 26, 7, 4);
  ctx.fillRect(19, 26, 7, 4);

  // Thick tail
  ctx.fillStyle = '#4878a8';
  ctx.fillRect(26, 22, 4, 4);
  ctx.fillRect(28, 20, 3, 3);
  ctx.fillRect(30, 18, 2, 3);
};
