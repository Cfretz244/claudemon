import { CustomSpriteDrawFn } from '../types';

export const dodrio: CustomSpriteDrawFn = (ctx, isBack) => {
  // Round body
  ctx.fillStyle = '#a08050';
  ctx.fillRect(8, 22, 16, 8);
  ctx.fillRect(6, 24, 20, 4);

  // Belly
  ctx.fillStyle = '#c8b070';
  ctx.fillRect(10, 24, 12, 4);

  // Legs
  ctx.fillStyle = '#a08050';
  ctx.fillRect(10, 29, 3, 3);
  ctx.fillRect(19, 29, 3, 3);
  // Feet / claws
  ctx.fillStyle = '#d0a050';
  ctx.fillRect(8, 30, 5, 2);
  ctx.fillRect(18, 30, 5, 2);

  // Left neck
  ctx.fillStyle = '#a08050';
  ctx.fillRect(4, 10, 4, 14);

  // Center neck
  ctx.fillStyle = '#a08050';
  ctx.fillRect(14, 8, 4, 16);

  // Right neck
  ctx.fillStyle = '#a08050';
  ctx.fillRect(24, 10, 4, 14);

  // Left head
  ctx.fillStyle = '#a08050';
  ctx.fillRect(1, 4, 10, 7);
  ctx.fillRect(0, 6, 12, 4);

  // Center head
  ctx.fillStyle = '#a08050';
  ctx.fillRect(11, 2, 10, 7);
  ctx.fillRect(10, 4, 12, 4);

  // Right head
  ctx.fillStyle = '#a08050';
  ctx.fillRect(21, 4, 10, 7);
  ctx.fillRect(20, 6, 12, 4);

  // Beaks
  ctx.fillStyle = '#d0a050';
  ctx.fillRect(0, 7, 2, 2);
  ctx.fillRect(9, 5, 2, 2);
  ctx.fillRect(30, 7, 2, 2);

  // Head crests
  ctx.fillStyle = '#302020';
  ctx.fillRect(4, 2, 3, 3);
  ctx.fillRect(14, 0, 3, 3);
  ctx.fillRect(24, 2, 3, 3);

  if (!isBack) {
    // Left eye
    ctx.fillStyle = '#302020';
    ctx.fillRect(4, 6, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 6, 2, 1);
    // Center eye
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 4, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 4, 2, 1);
    // Right eye
    ctx.fillStyle = '#302020';
    ctx.fillRect(25, 6, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(25, 6, 2, 1);
  } else {
    // Back head shading
    ctx.fillStyle = '#887040';
    ctx.fillRect(3, 5, 8, 4);
    ctx.fillRect(12, 3, 8, 4);
    ctx.fillRect(22, 5, 8, 4);
  }
};
