import { CustomSpriteDrawFn } from '../types';

export const exeggcute: CustomSpriteDrawFn = (ctx, isBack) => {
  // Exeggcute - cluster of 6 pink eggs with faces

  const drawEgg = (x: number, y: number, hasCrack: boolean) => {
    ctx.fillStyle = '#e8a8a8';
    ctx.fillRect(x, y, 6, 8);
    ctx.fillRect(x + 1, y - 1, 4, 10);
    // Shell highlight
    ctx.fillStyle = '#f0c0c0';
    ctx.fillRect(x + 1, y, 2, 2);
    if (hasCrack) {
      ctx.fillStyle = '#c08888';
      ctx.fillRect(x + 1, y + 2, 4, 1);
      ctx.fillRect(x + 3, y + 1, 1, 2);
    }
  };

  // Egg positions (6 eggs in cluster)
  // Back row
  drawEgg(4, 4, false);
  drawEgg(13, 3, true);
  drawEgg(22, 5, false);
  // Front row
  drawEgg(1, 15, true);
  drawEgg(10, 16, false);
  drawEgg(19, 14, true);

  if (!isBack) {
    // Faces on front row eggs
    const facePositions = [
      [4, 5], [13, 4], [22, 6],
      [1, 16], [10, 17], [19, 15],
    ];
    for (const [fx, fy] of facePositions) {
      // Eyes
      ctx.fillStyle = '#302020';
      ctx.fillRect(fx + 1, fy + 2, 1, 2);
      ctx.fillRect(fx + 4, fy + 2, 1, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx + 1, fy + 2, 1, 1);
      ctx.fillRect(fx + 4, fy + 2, 1, 1);
    }
  } else {
    // Back view - just eggs without faces
    ctx.fillStyle = '#d09898';
    ctx.fillRect(5, 6, 4, 4);
    ctx.fillRect(14, 5, 4, 4);
    ctx.fillRect(23, 7, 4, 4);
    ctx.fillRect(2, 17, 4, 4);
    ctx.fillRect(11, 18, 4, 4);
    ctx.fillRect(20, 16, 4, 4);
  }
};
