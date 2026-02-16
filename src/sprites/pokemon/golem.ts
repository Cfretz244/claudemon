import { CustomSpriteDrawFn } from '../types';

export const golem: CustomSpriteDrawFn = (ctx, isBack) => {
  // Golem - round boulder body, lizard-like head poking out from top

  // Boulder body - large round
  ctx.fillStyle = '#808070';
  ctx.fillRect(4, 10, 24, 18);
  ctx.fillRect(2, 12, 28, 14);
  ctx.fillRect(6, 8, 20, 4);

  // Boulder texture
  ctx.fillStyle = '#706860';
  ctx.fillRect(6, 12, 5, 4);
  ctx.fillRect(22, 14, 4, 4);
  ctx.fillRect(12, 22, 6, 3);
  ctx.fillRect(18, 10, 4, 3);

  // Lighter boulder highlights
  ctx.fillStyle = '#909080';
  ctx.fillRect(10, 10, 8, 4);
  ctx.fillRect(8, 16, 4, 3);

  // Lizard head poking out from top
  ctx.fillStyle = '#706850';
  ctx.fillRect(10, 2, 12, 9);
  ctx.fillRect(8, 4, 16, 5);

  // Head ridges
  ctx.fillStyle = '#605840';
  ctx.fillRect(11, 1, 4, 3);
  ctx.fillRect(17, 1, 4, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 4, 3, 3);
    ctx.fillRect(19, 4, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 4, 2, 2);
    ctx.fillRect(19, 4, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 8, 6, 2);
    // Nostrils
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 6, 2, 1);
    ctx.fillRect(18, 6, 2, 1);
  } else {
    // Back - shell/boulder pattern
    ctx.fillStyle = '#706860';
    ctx.fillRect(8, 12, 16, 12);
    ctx.fillStyle = '#605840';
    ctx.fillRect(11, 3, 10, 5);
    // Shell crack pattern
    ctx.fillStyle = '#606050';
    ctx.fillRect(15, 14, 2, 8);
    ctx.fillRect(10, 18, 12, 2);
  }

  // Arms poking from boulder
  ctx.fillStyle = '#706850';
  ctx.fillRect(0, 16, 4, 5);
  ctx.fillRect(28, 16, 4, 5);
  // Claws
  ctx.fillStyle = '#605840';
  ctx.fillRect(0, 20, 3, 3);
  ctx.fillRect(29, 20, 3, 3);

  // Stubby legs
  ctx.fillStyle = '#706850';
  ctx.fillRect(6, 26, 6, 4);
  ctx.fillRect(20, 26, 6, 4);
};
