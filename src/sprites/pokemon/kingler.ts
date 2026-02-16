import { CustomSpriteDrawFn } from '../types';

export const kingler: CustomSpriteDrawFn = (ctx, isBack) => {
  // Kingler - red crab with one MASSIVE oversized pincer

  // Body - small round center
  ctx.fillStyle = '#d06030';
  ctx.fillRect(12, 16, 10, 8);
  ctx.fillRect(10, 18, 14, 6);

  // Crown/head ridges
  ctx.fillStyle = '#c05028';
  ctx.fillRect(13, 14, 8, 3);
  ctx.fillRect(15, 12, 4, 3);

  // MASSIVE left pincer
  ctx.fillStyle = '#d06030';
  ctx.fillRect(0, 6, 12, 10);
  ctx.fillRect(1, 4, 10, 14);
  // Pincer opening
  ctx.fillStyle = '#e88060';
  ctx.fillRect(2, 8, 8, 2);
  // Pincer top jaw
  ctx.fillStyle = '#d06030';
  ctx.fillRect(0, 4, 11, 4);
  // Pincer bottom jaw
  ctx.fillRect(0, 12, 11, 4);
  // Gap for mouth of pincer
  ctx.fillStyle = '#e88060';
  ctx.fillRect(0, 9, 5, 3);
  // Left arm connecting
  ctx.fillStyle = '#c05028';
  ctx.fillRect(9, 16, 4, 3);

  // Small right pincer
  ctx.fillStyle = '#d06030';
  ctx.fillRect(24, 12, 6, 6);
  ctx.fillRect(26, 10, 4, 8);
  // Right pincer gap
  ctx.fillStyle = '#e88060';
  ctx.fillRect(26, 14, 3, 2);
  // Right arm
  ctx.fillStyle = '#c05028';
  ctx.fillRect(22, 17, 4, 2);

  // Legs
  ctx.fillStyle = '#c05028';
  ctx.fillRect(11, 24, 3, 4);
  ctx.fillRect(14, 26, 2, 3);
  ctx.fillRect(19, 24, 3, 4);
  ctx.fillRect(17, 26, 2, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 14, 2, 2);
    ctx.fillRect(19, 14, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 14, 1, 1);
    ctx.fillRect(19, 14, 1, 1);
  } else {
    // Back texture
    ctx.fillStyle = '#b84820';
    ctx.fillRect(13, 17, 6, 4);
  }
};
