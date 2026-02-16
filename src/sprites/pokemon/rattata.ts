import { CustomSpriteDrawFn } from '../types';

export const rattata: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - small round purple rat
  ctx.fillStyle = '#a040a0';
  ctx.fillRect(8, 14, 16, 10);
  ctx.fillRect(6, 16, 20, 6);

  // Head
  ctx.fillStyle = '#a040a0';
  ctx.fillRect(4, 10, 14, 8);
  ctx.fillRect(6, 8, 10, 4);

  // Cream belly
  ctx.fillStyle = '#f0d0b0';
  ctx.fillRect(10, 18, 10, 4);

  // Ears - large round
  ctx.fillStyle = '#a040a0';
  ctx.fillRect(5, 5, 4, 6);
  ctx.fillRect(13, 5, 4, 6);
  // Inner ear
  ctx.fillStyle = '#c878c8';
  ctx.fillRect(6, 6, 2, 4);
  ctx.fillRect(14, 6, 2, 4);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(6, 11, 3, 3);
    ctx.fillRect(13, 11, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 11, 2, 2);
    ctx.fillRect(13, 11, 2, 2);
    // Big front teeth
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(9, 16, 2, 3);
    ctx.fillRect(11, 16, 2, 3);
    // Nose
    ctx.fillStyle = '#302020';
    ctx.fillRect(4, 14, 2, 1);
  } else {
    // Back markings
    ctx.fillStyle = '#884088';
    ctx.fillRect(10, 15, 12, 6);
  }

  // Feet
  ctx.fillStyle = '#884088';
  ctx.fillRect(8, 24, 4, 3);
  ctx.fillRect(18, 24, 4, 3);

  // Curly tail
  ctx.fillStyle = '#a040a0';
  ctx.fillRect(24, 12, 3, 3);
  ctx.fillRect(26, 10, 3, 3);
  ctx.fillRect(24, 8, 3, 3);
  ctx.fillRect(26, 14, 2, 3);
};
