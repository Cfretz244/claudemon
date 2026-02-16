import { CustomSpriteDrawFn } from '../types';

export const golbat: CustomSpriteDrawFn = (ctx, isBack) => {
  // Golbat - larger blue bat, huge open mouth, big wings

  // Big wings spread wide
  ctx.fillStyle = '#7868a0';
  ctx.fillRect(0, 8, 9, 14);
  ctx.fillRect(23, 8, 9, 14);
  ctx.fillRect(1, 6, 7, 3);
  ctx.fillRect(24, 6, 7, 3);
  ctx.fillRect(0, 14, 6, 6);
  ctx.fillRect(26, 14, 6, 6);

  // Wing bones
  ctx.fillStyle = '#5868a0';
  ctx.fillRect(6, 6, 5, 2);
  ctx.fillRect(21, 6, 5, 2);
  ctx.fillRect(3, 8, 4, 12);
  ctx.fillRect(25, 8, 4, 12);

  // Body
  ctx.fillStyle = '#5868a0';
  ctx.fillRect(9, 6, 14, 10);
  ctx.fillRect(7, 8, 18, 6);

  // Huge open mouth - dominates face
  if (!isBack) {
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 12, 14, 10);
    ctx.fillRect(11, 11, 10, 2);
    // Inside mouth
    ctx.fillStyle = '#e05050';
    ctx.fillRect(10, 14, 12, 6);
    // Tongue
    ctx.fillStyle = '#e05050';
    ctx.fillRect(13, 18, 6, 3);
    // Fangs - top
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 12, 2, 3);
    ctx.fillRect(14, 12, 2, 2);
    ctx.fillRect(18, 12, 2, 2);
    ctx.fillRect(20, 12, 2, 3);
    // Fangs - bottom
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 19, 2, 2);
    ctx.fillRect(19, 19, 2, 2);
    // Small eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 8, 3, 3);
    ctx.fillRect(19, 8, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 8, 2, 2);
    ctx.fillRect(19, 8, 2, 2);
  } else {
    // Back view: big wings, body
    ctx.fillStyle = '#4858a0';
    ctx.fillRect(11, 8, 10, 6);
    ctx.fillRect(13, 14, 6, 4);
  }

  // Small feet
  ctx.fillStyle = '#5868a0';
  ctx.fillRect(11, 22, 3, 3);
  ctx.fillRect(18, 22, 3, 3);

  // Ears
  ctx.fillStyle = '#5868a0';
  ctx.fillRect(9, 2, 4, 5);
  ctx.fillRect(19, 2, 4, 5);
  // Inner ear
  ctx.fillStyle = '#7868a0';
  ctx.fillRect(10, 3, 2, 3);
  ctx.fillRect(20, 3, 2, 3);
};
