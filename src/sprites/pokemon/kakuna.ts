import { CustomSpriteDrawFn } from '../types';

export const kakuna: CustomSpriteDrawFn = (ctx, isBack) => {
  // Kakuna - yellow angular cocoon shape

  // Main cocoon body - more angular than Metapod
  ctx.fillStyle = '#d8b020';
  ctx.fillRect(10, 4, 12, 24);
  ctx.fillRect(8, 6, 16, 20);
  ctx.fillRect(6, 8, 20, 16);

  // Top point
  ctx.fillStyle = '#d8b020';
  ctx.fillRect(12, 2, 8, 3);
  ctx.fillRect(14, 1, 4, 2);

  // Bottom point
  ctx.fillRect(12, 27, 8, 3);
  ctx.fillRect(14, 29, 4, 2);

  // Darker yellow shell texture/ridges
  ctx.fillStyle = '#b09018';
  ctx.fillRect(7, 10, 18, 1);
  ctx.fillRect(6, 15, 20, 1);
  ctx.fillRect(7, 20, 18, 1);
  // Side edges
  ctx.fillRect(6, 8, 1, 8);
  ctx.fillRect(25, 8, 1, 8);
  ctx.fillRect(7, 20, 1, 4);
  ctx.fillRect(24, 20, 1, 4);

  // Angular highlight
  ctx.fillStyle = '#e8c830';
  ctx.fillRect(11, 5, 6, 4);
  ctx.fillRect(10, 11, 5, 3);
  ctx.fillRect(10, 16, 5, 3);

  if (!isBack) {
    // Angry triangular eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 11, 4, 3);
    ctx.fillRect(18, 11, 4, 3);
    // Angular brow (makes them look angry)
    ctx.fillStyle = '#b09018';
    ctx.fillRect(10, 11, 4, 1);
    ctx.fillRect(18, 11, 4, 1);
    ctx.fillRect(11, 12, 3, 1);
    ctx.fillRect(18, 12, 3, 1);
    // Remaining visible eye part
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 13, 3, 1);
    ctx.fillRect(19, 13, 3, 1);
    // Tiny white highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 13, 1, 1);
    ctx.fillRect(19, 13, 1, 1);
  } else {
    // Back: plain shell with ridge details
    ctx.fillStyle = '#b09018';
    ctx.fillRect(12, 6, 8, 1);
    ctx.fillRect(11, 11, 10, 1);
    ctx.fillRect(12, 22, 8, 1);
    // Center back ridge
    ctx.fillRect(15, 5, 2, 20);
  }

  // Side arm nubs
  ctx.fillStyle = '#b09018';
  ctx.fillRect(5, 13, 2, 3);
  ctx.fillRect(25, 13, 2, 3);
};
