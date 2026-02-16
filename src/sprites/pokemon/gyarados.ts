import { CustomSpriteDrawFn } from '../types';

export const gyarados: CustomSpriteDrawFn = (ctx, isBack) => {
  // Gyarados - blue serpentine dragon, huge gaping mouth, fierce, long body

  // Long serpentine body coiling up
  ctx.fillStyle = '#3868b8';
  // Lower coil
  ctx.fillRect(4, 24, 24, 5);
  ctx.fillRect(2, 22, 6, 4);
  ctx.fillRect(26, 22, 4, 4);
  // Mid body rising
  ctx.fillRect(22, 16, 6, 8);
  ctx.fillRect(24, 14, 4, 4);
  // Upper body
  ctx.fillRect(14, 10, 12, 6);
  ctx.fillRect(12, 8, 10, 4);

  // Cream/white belly on coils
  ctx.fillStyle = '#d0d8e0';
  ctx.fillRect(6, 27, 20, 2);
  ctx.fillRect(24, 18, 4, 4);

  // Head - large and fierce
  ctx.fillStyle = '#3868b8';
  ctx.fillRect(4, 2, 12, 10);
  ctx.fillRect(2, 4, 14, 6);
  ctx.fillRect(6, 0, 8, 4);

  // Crown/crest on head
  ctx.fillStyle = '#2850a0';
  ctx.fillRect(6, 0, 3, 3);
  ctx.fillRect(10, 0, 3, 3);
  ctx.fillRect(8, 0, 2, 2);

  // Huge gaping mouth
  ctx.fillStyle = '#802020';
  ctx.fillRect(2, 8, 10, 5);
  ctx.fillRect(0, 9, 4, 3);
  // Teeth
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(2, 8, 2, 2);
  ctx.fillRect(6, 8, 2, 2);
  ctx.fillRect(10, 8, 2, 2);
  ctx.fillRect(2, 12, 2, 1);
  ctx.fillRect(6, 12, 2, 1);

  // Whisker/barbels
  ctx.fillStyle = '#3868b8';
  ctx.fillRect(0, 6, 3, 2);
  ctx.fillRect(0, 4, 2, 3);

  // Dorsal ridges along body
  ctx.fillStyle = '#2850a0';
  ctx.fillRect(16, 8, 2, 3);
  ctx.fillRect(20, 10, 2, 3);
  ctx.fillRect(24, 12, 2, 3);

  if (!isBack) {
    // Eyes - fierce and angry
    ctx.fillStyle = '#302020';
    ctx.fillRect(6, 4, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 4, 2, 2);
    ctx.fillStyle = '#c03030';
    ctx.fillRect(7, 5, 1, 1);
  } else {
    // Back detail - scales
    ctx.fillStyle = '#2850a0';
    ctx.fillRect(6, 4, 8, 6);
    ctx.fillRect(16, 12, 6, 4);
    ctx.fillStyle = '#3060b0';
    ctx.fillRect(8, 26, 16, 2);
  }
};
