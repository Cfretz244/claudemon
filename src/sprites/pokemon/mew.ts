import { CustomSpriteDrawFn } from '../types';

export const mew: CustomSpriteDrawFn = (ctx, isBack) => {
  // Small floating cat-like body - pink
  ctx.fillStyle = '#f0a0c0';

  // Head - round and cute
  ctx.fillRect(9, 4, 12, 10);
  ctx.fillRect(7, 6, 16, 8);
  ctx.fillRect(11, 3, 8, 2);

  // Ears - triangular
  ctx.fillRect(8, 2, 4, 5);
  ctx.fillRect(19, 2, 4, 5);
  ctx.fillRect(9, 1, 2, 2);
  ctx.fillRect(20, 1, 2, 2);
  // Inner ears
  ctx.fillStyle = '#e88098';
  ctx.fillRect(9, 3, 2, 3);
  ctx.fillRect(20, 3, 2, 3);

  // Body - small, floating/curled
  ctx.fillStyle = '#f0a0c0';
  ctx.fillRect(11, 14, 10, 8);
  ctx.fillRect(9, 16, 14, 5);

  // Belly
  ctx.fillStyle = '#f8c8d8';
  ctx.fillRect(13, 15, 6, 6);

  // Small arms
  ctx.fillStyle = '#f0a0c0';
  ctx.fillRect(7, 14, 4, 4);
  ctx.fillRect(21, 14, 4, 4);
  // Paw tips
  ctx.fillStyle = '#f8c8d8';
  ctx.fillRect(7, 16, 3, 2);
  ctx.fillRect(22, 16, 3, 2);

  // Small feet - curled up (floating pose)
  ctx.fillStyle = '#f0a0c0';
  ctx.fillRect(10, 22, 5, 4);
  ctx.fillRect(17, 22, 5, 4);
  // Foot pads
  ctx.fillStyle = '#f8c8d8';
  ctx.fillRect(11, 24, 3, 2);
  ctx.fillRect(18, 24, 3, 2);

  // Long thin tail - curving up and around
  ctx.fillStyle = '#f0a0c0';
  ctx.fillRect(22, 18, 3, 2);
  ctx.fillRect(24, 16, 2, 3);
  ctx.fillRect(25, 14, 2, 3);
  ctx.fillRect(26, 11, 2, 4);
  ctx.fillRect(27, 8, 2, 4);
  ctx.fillRect(26, 6, 2, 3);
  // Tail tip - slightly thicker
  ctx.fillStyle = '#e88098';
  ctx.fillRect(25, 5, 3, 3);
  ctx.fillRect(26, 4, 2, 2);

  if (!isBack) {
    // Big blue eyes - cute and innocent
    ctx.fillStyle = '#5888c8';
    ctx.fillRect(10, 7, 4, 4);
    ctx.fillRect(17, 7, 4, 4);
    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 7, 2, 2);
    ctx.fillRect(17, 7, 2, 2);
    // Pupils
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 9, 2, 2);
    ctx.fillRect(19, 9, 2, 2);
    // Tiny nose
    ctx.fillStyle = '#e88098';
    ctx.fillRect(14, 10, 3, 2);
    // Small smiling mouth
    ctx.fillStyle = '#d07888';
    ctx.fillRect(14, 12, 4, 1);
    ctx.fillRect(13, 11, 2, 1);
    ctx.fillRect(17, 11, 2, 1);
  } else {
    // Back: round head with ears, tail curling
    ctx.fillStyle = '#e88098';
    // Inner ears visible from back
    ctx.fillRect(9, 3, 2, 3);
    ctx.fillRect(20, 3, 2, 3);
    // Back of head slightly darker
    ctx.fillStyle = '#e898b0';
    ctx.fillRect(11, 5, 8, 6);
    // Tail curving prominently
    ctx.fillStyle = '#f0a0c0';
    ctx.fillRect(14, 22, 3, 3);
    ctx.fillRect(16, 24, 2, 3);
    ctx.fillRect(17, 26, 2, 3);
    ctx.fillRect(16, 28, 3, 2);
  }
};
