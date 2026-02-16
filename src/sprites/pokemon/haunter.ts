import { CustomSpriteDrawFn } from '../types';

export const haunter: CustomSpriteDrawFn = (ctx, isBack) => {
  // Main floating body
  ctx.fillStyle = '#6848a0';
  ctx.fillRect(8, 4, 16, 16);
  ctx.fillRect(6, 6, 20, 12);
  ctx.fillRect(10, 2, 12, 18);

  // Spiky edges on body
  ctx.fillStyle = '#6848a0';
  ctx.fillRect(4, 8, 4, 4);
  ctx.fillRect(24, 8, 4, 4);
  ctx.fillRect(6, 18, 4, 4);
  ctx.fillRect(22, 18, 4, 4);
  ctx.fillRect(12, 20, 8, 3);

  // Spike points
  ctx.fillStyle = '#6848a0';
  ctx.fillRect(2, 10, 3, 2);
  ctx.fillRect(27, 10, 3, 2);
  ctx.fillRect(14, 22, 4, 2);

  // Disembodied left hand
  ctx.fillStyle = '#7858b0';
  ctx.fillRect(0, 16, 5, 6);
  ctx.fillRect(0, 14, 3, 3);
  ctx.fillRect(0, 20, 3, 3);
  ctx.fillRect(3, 18, 3, 2);

  // Disembodied right hand
  ctx.fillStyle = '#7858b0';
  ctx.fillRect(27, 16, 5, 6);
  ctx.fillRect(29, 14, 3, 3);
  ctx.fillRect(29, 20, 3, 3);
  ctx.fillRect(26, 18, 3, 2);

  // Darker body center
  ctx.fillStyle = '#583890';
  ctx.fillRect(10, 6, 12, 10);

  if (!isBack) {
    // Eyes - menacing
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 7, 5, 5);
    ctx.fillRect(18, 7, 5, 5);
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 8, 2, 3);
    ctx.fillRect(21, 8, 2, 3);
    // Mouth - wide sinister grin
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 14, 12, 3);
    ctx.fillStyle = '#e03030';
    ctx.fillRect(11, 15, 10, 1);
    // Teeth
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(11, 14, 2, 1);
    ctx.fillRect(15, 14, 2, 1);
    ctx.fillRect(19, 14, 2, 1);
  } else {
    // Back body shading
    ctx.fillStyle = '#583890';
    ctx.fillRect(10, 6, 12, 12);
    ctx.fillStyle = '#482878';
    ctx.fillRect(12, 8, 8, 8);
  }
};
