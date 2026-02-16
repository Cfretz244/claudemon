import { CustomSpriteDrawFn } from '../types';

export const sandslash: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - brown bipedal
  ctx.fillStyle = '#b08840';
  ctx.fillRect(8, 12, 16, 12);
  ctx.fillRect(6, 14, 20, 8);

  // Head
  ctx.fillStyle = '#b08840';
  ctx.fillRect(6, 6, 14, 8);
  ctx.fillRect(8, 4, 10, 4);

  // Cream belly
  ctx.fillStyle = '#f0e0b0';
  ctx.fillRect(10, 16, 12, 6);

  // Quills/spikes on back - cream/white
  ctx.fillStyle = '#e8d8b0';
  ctx.fillRect(18, 4, 6, 4);
  ctx.fillRect(22, 6, 6, 4);
  ctx.fillRect(24, 10, 6, 4);
  ctx.fillRect(22, 14, 6, 4);
  ctx.fillRect(20, 18, 6, 4);
  // Spike tips
  ctx.fillStyle = '#d0c090';
  ctx.fillRect(23, 4, 2, 3);
  ctx.fillRect(27, 7, 2, 3);
  ctx.fillRect(29, 11, 2, 3);
  ctx.fillRect(27, 15, 2, 3);
  ctx.fillRect(25, 19, 2, 3);

  if (!isBack) {
    // Eyes - fierce
    ctx.fillStyle = '#302020';
    ctx.fillRect(8, 7, 3, 3);
    ctx.fillRect(15, 7, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 7, 2, 2);
    ctx.fillRect(15, 7, 2, 2);
    // Snout
    ctx.fillStyle = '#c09838';
    ctx.fillRect(6, 10, 8, 3);
    ctx.fillStyle = '#302020';
    ctx.fillRect(5, 11, 2, 1);
  } else {
    // All quills visible from back
    ctx.fillStyle = '#e8d8b0';
    ctx.fillRect(6, 6, 22, 16);
    // Quill pattern
    ctx.fillStyle = '#d0c090';
    ctx.fillRect(8, 6, 4, 4);
    ctx.fillRect(16, 6, 4, 4);
    ctx.fillRect(24, 6, 4, 4);
    ctx.fillRect(6, 12, 4, 4);
    ctx.fillRect(14, 12, 4, 4);
    ctx.fillRect(22, 12, 4, 4);
    ctx.fillRect(10, 18, 4, 4);
    ctx.fillRect(18, 18, 4, 4);
  }

  // Arms with sharp claws
  ctx.fillStyle = '#b08840';
  ctx.fillRect(3, 14, 5, 4);
  // Claws
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(1, 16, 3, 2);
  ctx.fillRect(1, 14, 2, 2);
  ctx.fillRect(1, 18, 2, 2);

  // Feet
  ctx.fillStyle = '#906830';
  ctx.fillRect(8, 24, 6, 4);
  ctx.fillRect(18, 24, 6, 4);
};
