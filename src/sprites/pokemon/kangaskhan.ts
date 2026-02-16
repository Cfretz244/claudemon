import { CustomSpriteDrawFn } from '../types';

export const kangaskhan: CustomSpriteDrawFn = (ctx, isBack) => {
  // Kangaskhan - brown bipedal, baby in belly pouch, armored head plate

  // Body - large torso
  ctx.fillStyle = '#a08860';
  ctx.fillRect(8, 10, 16, 14);
  ctx.fillRect(6, 12, 20, 10);

  // Head
  ctx.fillStyle = '#a08860';
  ctx.fillRect(9, 2, 14, 10);
  ctx.fillRect(7, 4, 18, 8);

  // Head armor plate
  ctx.fillStyle = '#887048';
  ctx.fillRect(9, 2, 14, 4);
  ctx.fillRect(11, 1, 10, 2);

  // Belly pouch
  ctx.fillStyle = '#c8b080';
  ctx.fillRect(10, 16, 12, 8);
  ctx.fillRect(8, 18, 16, 4);

  // Baby peeking from pouch
  ctx.fillStyle = '#b09868';
  ctx.fillRect(12, 16, 8, 6);
  ctx.fillRect(13, 15, 6, 2);

  // Arms
  ctx.fillStyle = '#a08860';
  ctx.fillRect(3, 12, 5, 4);
  ctx.fillRect(24, 12, 5, 4);
  // Claws
  ctx.fillStyle = '#c8b080';
  ctx.fillRect(1, 14, 3, 2);
  ctx.fillRect(28, 14, 3, 2);

  // Legs
  ctx.fillStyle = '#a08860';
  ctx.fillRect(8, 24, 6, 5);
  ctx.fillRect(18, 24, 6, 5);

  // Feet
  ctx.fillStyle = '#887048';
  ctx.fillRect(7, 28, 7, 3);
  ctx.fillRect(17, 28, 7, 3);

  // Tail
  ctx.fillStyle = '#a08860';
  ctx.fillRect(24, 18, 4, 3);
  ctx.fillRect(27, 16, 3, 5);
  ctx.fillRect(29, 20, 3, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 6, 3, 3);
    ctx.fillRect(18, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 6, 2, 2);
    ctx.fillRect(18, 6, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 10, 6, 1);
    // Baby eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 17, 1, 1);
    ctx.fillRect(17, 17, 1, 1);
  } else {
    // Back shading
    ctx.fillStyle = '#887048';
    ctx.fillRect(10, 6, 12, 8);
    ctx.fillRect(12, 4, 8, 2);
  }
};
