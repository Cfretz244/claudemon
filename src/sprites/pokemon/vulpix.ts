import { CustomSpriteDrawFn } from '../types';

export const vulpix: CustomSpriteDrawFn = (ctx, isBack) => {
  // Vulpix - small red-brown fox, 6 curled tails (cluster), fluffy

  // Six curled tails (cluster behind body)
  ctx.fillStyle = '#e08048';
  ctx.fillRect(20, 6, 4, 4);
  ctx.fillRect(22, 4, 4, 4);
  ctx.fillRect(24, 6, 4, 4);
  ctx.fillRect(20, 10, 4, 3);
  ctx.fillRect(24, 10, 4, 3);
  ctx.fillRect(22, 8, 6, 4);
  // Tail tips - lighter
  ctx.fillStyle = '#e8a868';
  ctx.fillRect(21, 4, 2, 2);
  ctx.fillRect(25, 4, 2, 2);
  ctx.fillRect(27, 8, 2, 2);

  // Body
  ctx.fillStyle = '#c06030';
  ctx.fillRect(8, 16, 16, 8);
  ctx.fillRect(6, 18, 20, 4);

  // Head
  ctx.fillStyle = '#c06030';
  ctx.fillRect(6, 8, 14, 10);
  ctx.fillRect(4, 10, 18, 6);

  // Fluffy forehead tuft
  ctx.fillStyle = '#e08048';
  ctx.fillRect(10, 6, 6, 4);
  ctx.fillRect(12, 5, 4, 2);

  // Pointed ears
  ctx.fillStyle = '#c06030';
  ctx.fillRect(4, 4, 4, 6);
  ctx.fillRect(16, 4, 4, 6);
  // Inner ear
  ctx.fillStyle = '#e08048';
  ctx.fillRect(5, 6, 2, 3);
  ctx.fillRect(17, 6, 2, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(7, 11, 3, 3);
    ctx.fillRect(14, 11, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 11, 2, 2);
    ctx.fillRect(14, 11, 2, 2);
    // Nose
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 14, 3, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 16, 4, 1);
  } else {
    // Back: tails prominent, back of head
    ctx.fillStyle = '#a04820';
    ctx.fillRect(9, 10, 8, 4);
  }

  // Legs
  ctx.fillStyle = '#c06030';
  ctx.fillRect(8, 24, 4, 4);
  ctx.fillRect(18, 24, 4, 4);
  // Paws
  ctx.fillStyle = '#a04820';
  ctx.fillRect(7, 27, 5, 2);
  ctx.fillRect(17, 27, 5, 2);
};
