import { CustomSpriteDrawFn } from '../types';

export const marowak: CustomSpriteDrawFn = (ctx, isBack) => {
  // Marowak - larger brown, skull helmet, wielding bone weapon

  // Body
  ctx.fillStyle = '#a08040';
  ctx.fillRect(9, 14, 14, 12);
  ctx.fillRect(7, 16, 18, 8);

  // Belly
  ctx.fillStyle = '#c0a060';
  ctx.fillRect(11, 16, 10, 8);

  // Skull helmet - bigger, fiercer
  ctx.fillStyle = '#e8e0d0';
  ctx.fillRect(7, 4, 18, 12);
  ctx.fillRect(5, 6, 22, 8);
  ctx.fillRect(9, 3, 14, 2);

  // Skull horn ridges
  ctx.fillStyle = '#d0c8b8';
  ctx.fillRect(8, 3, 5, 4);
  ctx.fillRect(19, 3, 5, 4);
  ctx.fillRect(7, 5, 3, 2);
  ctx.fillRect(22, 5, 3, 2);

  // Bone weapon (wielded horizontally)
  ctx.fillStyle = '#e8e0d0';
  ctx.fillRect(0, 14, 32, 3);
  // Bone knobs left
  ctx.fillRect(0, 12, 4, 7);
  // Bone knobs right
  ctx.fillRect(28, 12, 4, 7);

  // Arms gripping bone
  ctx.fillStyle = '#a08040';
  ctx.fillRect(6, 15, 4, 4);
  ctx.fillRect(22, 15, 4, 4);

  // Feet
  ctx.fillStyle = '#a08040';
  ctx.fillRect(9, 26, 5, 3);
  ctx.fillRect(18, 26, 5, 3);

  // Tail
  ctx.fillStyle = '#907030';
  ctx.fillRect(24, 20, 3, 4);
  ctx.fillRect(26, 18, 3, 4);

  if (!isBack) {
    // Eye holes in skull
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 8, 5, 4);
    ctx.fillRect(18, 8, 5, 4);
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 9, 2, 2);
    ctx.fillRect(19, 9, 2, 2);
    // Teeth
    ctx.fillStyle = '#d0c8b8';
    ctx.fillRect(11, 13, 10, 2);
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 13, 1, 2);
    ctx.fillRect(16, 13, 1, 2);
    ctx.fillRect(18, 13, 1, 2);
  } else {
    // Back of skull
    ctx.fillStyle = '#d0c8b8';
    ctx.fillRect(10, 6, 12, 8);
  }
};
