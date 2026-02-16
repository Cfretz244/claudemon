import { CustomSpriteDrawFn } from '../types';

export const lapras: CustomSpriteDrawFn = (ctx, isBack) => {
  // Lapras - blue plesiosaur, shell on back, long neck, gentle eyes

  // Shell on back
  ctx.fillStyle = '#b09860';
  ctx.fillRect(12, 16, 16, 8);
  ctx.fillRect(10, 18, 20, 6);
  ctx.fillRect(14, 14, 12, 4);

  // Shell bumps/ridges
  ctx.fillStyle = '#c0a870';
  ctx.fillRect(14, 16, 4, 2);
  ctx.fillRect(20, 16, 4, 2);
  ctx.fillRect(26, 18, 2, 2);

  // Body - blue visible below shell
  ctx.fillStyle = '#5888c0';
  ctx.fillRect(10, 22, 20, 6);
  ctx.fillRect(8, 24, 24, 4);
  ctx.fillRect(6, 26, 26, 4);

  // Cream belly
  ctx.fillStyle = '#d8d0b8';
  ctx.fillRect(12, 26, 14, 4);

  // Long neck
  ctx.fillStyle = '#5888c0';
  ctx.fillRect(6, 6, 8, 14);
  ctx.fillRect(4, 8, 10, 10);

  // Head
  ctx.fillRect(2, 2, 12, 8);
  ctx.fillRect(4, 0, 8, 10);

  // Ear/horn on head
  ctx.fillStyle = '#4878b0';
  ctx.fillRect(10, 0, 3, 4);
  ctx.fillRect(12, 1, 2, 2);

  // Front flippers
  ctx.fillStyle = '#5888c0';
  ctx.fillRect(0, 20, 6, 3);
  ctx.fillRect(0, 22, 4, 2);

  // Neck cream underside
  ctx.fillStyle = '#d8d0b8';
  ctx.fillRect(4, 12, 4, 8);

  if (!isBack) {
    // Gentle eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(4, 4, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 4, 2, 2);
    // Mouth - gentle smile
    ctx.fillStyle = '#302020';
    ctx.fillRect(2, 8, 4, 1);
  } else {
    // Shell pattern from back
    ctx.fillStyle = '#a08848';
    ctx.fillRect(14, 16, 14, 6);
    ctx.fillStyle = '#c0a870';
    ctx.fillRect(16, 17, 4, 2);
    ctx.fillRect(22, 17, 4, 2);
    ctx.fillRect(18, 20, 4, 2);
  }
};
