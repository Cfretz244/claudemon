import { CustomSpriteDrawFn } from '../types';

export const aerodactyl: CustomSpriteDrawFn = (ctx, isBack) => {
  // Wide wings spread - left
  ctx.fillStyle = '#9080a0';
  ctx.fillRect(0, 8, 12, 10);
  ctx.fillRect(0, 6, 8, 4);
  ctx.fillRect(0, 16, 10, 4);
  // Wing membrane - left
  ctx.fillStyle = '#786888';
  ctx.fillRect(1, 10, 9, 6);
  ctx.fillRect(0, 14, 8, 4);

  // Wide wings spread - right
  ctx.fillStyle = '#9080a0';
  ctx.fillRect(20, 8, 12, 10);
  ctx.fillRect(24, 6, 8, 4);
  ctx.fillRect(22, 16, 10, 4);
  // Wing membrane - right
  ctx.fillStyle = '#786888';
  ctx.fillRect(22, 10, 9, 6);
  ctx.fillRect(24, 14, 8, 4);

  // Body
  ctx.fillStyle = '#9080a0';
  ctx.fillRect(10, 8, 12, 14);
  ctx.fillRect(12, 6, 8, 4);

  // Head
  ctx.fillStyle = '#9080a0';
  ctx.fillRect(10, 1, 12, 8);
  ctx.fillRect(8, 3, 16, 4);

  // Head crest
  ctx.fillStyle = '#786888';
  ctx.fillRect(18, 0, 4, 3);
  ctx.fillRect(20, 0, 3, 2);

  // Big jaws
  ctx.fillStyle = '#a890b0';
  ctx.fillRect(8, 5, 16, 5);
  // Teeth
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(9, 6, 2, 2);
  ctx.fillRect(13, 6, 2, 2);
  ctx.fillRect(17, 6, 2, 2);
  ctx.fillRect(21, 6, 2, 2);
  // Lower jaw
  ctx.fillStyle = '#786888';
  ctx.fillRect(9, 8, 14, 2);

  // Belly
  ctx.fillStyle = '#b0a0c0';
  ctx.fillRect(12, 14, 8, 6);

  // Legs
  ctx.fillStyle = '#9080a0';
  ctx.fillRect(10, 22, 4, 6);
  ctx.fillRect(18, 22, 4, 6);

  // Clawed feet
  ctx.fillStyle = '#786888';
  ctx.fillRect(8, 27, 6, 3);
  ctx.fillRect(18, 27, 6, 3);

  // Tail
  ctx.fillStyle = '#9080a0';
  ctx.fillRect(20, 18, 4, 3);
  ctx.fillRect(22, 16, 3, 3);

  if (!isBack) {
    // Fierce eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 2, 3, 3);
    ctx.fillRect(18, 2, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 2, 2, 2);
    ctx.fillRect(18, 2, 2, 2);
  } else {
    // Back: wings very prominent
    ctx.fillStyle = '#786888';
    ctx.fillRect(0, 6, 13, 12);
    ctx.fillRect(19, 6, 13, 12);
    ctx.fillStyle = '#9080a0';
    ctx.fillRect(2, 8, 9, 8);
    ctx.fillRect(21, 8, 9, 8);
    // Wing fingers
    ctx.fillStyle = '#786888';
    ctx.fillRect(0, 6, 2, 3);
    ctx.fillRect(4, 6, 2, 3);
    ctx.fillRect(26, 6, 2, 3);
    ctx.fillRect(30, 6, 2, 3);
  }
};
