import { CustomSpriteDrawFn } from '../types';

export const zubat: CustomSpriteDrawFn = (ctx, isBack) => {
  // Zubat - blue bat, NO eyes, open mouth with fangs, purple wing membranes

  // Wing membranes - spread wide
  ctx.fillStyle = '#8068a0';
  ctx.fillRect(0, 10, 8, 10);
  ctx.fillRect(24, 10, 8, 10);
  ctx.fillRect(2, 8, 6, 3);
  ctx.fillRect(24, 8, 6, 3);
  ctx.fillRect(1, 12, 5, 6);
  ctx.fillRect(26, 12, 5, 6);

  // Wing bones
  ctx.fillStyle = '#6878b0';
  ctx.fillRect(6, 8, 4, 2);
  ctx.fillRect(22, 8, 4, 2);
  ctx.fillRect(4, 10, 3, 8);
  ctx.fillRect(25, 10, 3, 8);

  // Body
  ctx.fillStyle = '#6878b0';
  ctx.fillRect(10, 8, 12, 14);
  ctx.fillRect(8, 10, 16, 10);

  // Head
  ctx.fillStyle = '#6878b0';
  ctx.fillRect(10, 6, 12, 8);
  ctx.fillRect(8, 8, 16, 4);

  // Ears - pointed
  ctx.fillStyle = '#6878b0';
  ctx.fillRect(10, 2, 4, 5);
  ctx.fillRect(18, 2, 4, 5);
  // Inner ear
  ctx.fillStyle = '#8068a0';
  ctx.fillRect(11, 3, 2, 3);
  ctx.fillRect(19, 3, 2, 3);

  if (!isBack) {
    // NO eyes - important for Zubat!
    // Open mouth with fangs
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 13, 8, 4);
    // Inside mouth
    ctx.fillStyle = '#e05050';
    ctx.fillRect(13, 14, 6, 2);
    // Fangs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(13, 13, 2, 2);
    ctx.fillRect(17, 13, 2, 2);
  } else {
    // Back view: wings and back of body
    ctx.fillStyle = '#5868a0';
    ctx.fillRect(12, 8, 8, 6);
  }

  // Small feet
  ctx.fillStyle = '#5868a0';
  ctx.fillRect(11, 22, 3, 3);
  ctx.fillRect(18, 22, 3, 3);
};
