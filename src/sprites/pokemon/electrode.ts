import { CustomSpriteDrawFn } from '../types';

/**
 * Electrode — the audit note was "buck teeth: redo the face". The two white
 * tooth blocks are gone: the face is now big glinting eyes over a wide open
 * manic grin with a tongue, on a round inverted Poke Ball (white top half,
 * red bottom half, dark equator band and button).
 */
export const electrode: CustomSpriteDrawFn = (ctx, isBack) => {
  const RED = '#f04040';        // species spriteColor
  const RED_DARK = '#a82430';
  const WHITE = '#f0f0f0';      // species spriteColor2
  const GREY = '#c4c4cc';
  const BAND = '#282430';

  // Circle as a span per row: [y, x, width]
  const SPANS: [number, number][] = [
    [12, 8], [10, 12], [9, 14], [8, 16], [7, 18], [6, 20], [5, 22], [5, 22],
    [4, 24], [4, 24], [3, 26], [3, 26], [3, 26], [3, 26], [3, 26], [3, 26],
    [3, 26], [3, 26], [4, 24], [4, 24], [5, 22], [5, 22], [6, 20], [7, 18],
    [8, 16], [9, 14], [10, 12], [12, 8],
  ];
  SPANS.forEach(([x, w], i) => {
    const y = 2 + i;
    ctx.fillStyle = y < 14 ? WHITE : y > 16 ? RED : BAND;
    ctx.fillRect(x, y, w, 1);
  });
  // Shading: grey under the white dome, dark red under the belly
  ctx.fillStyle = GREY;
  ctx.fillRect(4, 12, 24, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(9, 5, 5, 2);
  ctx.fillRect(8, 7, 3, 2);
  ctx.fillStyle = RED_DARK;
  ctx.fillRect(6, 25, 20, 1);
  ctx.fillRect(7, 26, 18, 1);
  ctx.fillRect(9, 27, 14, 1);
  ctx.fillRect(10, 28, 12, 1);
  ctx.fillRect(12, 29, 8, 1);

  // Button
  ctx.fillStyle = BAND;
  ctx.fillRect(13, 12, 6, 6);
  ctx.fillStyle = WHITE;
  ctx.fillRect(14, 13, 4, 4);
  ctx.fillStyle = GREY;
  ctx.fillRect(15, 14, 2, 2);

  if (!isBack) {
    // Big eyes up in the white half
    ctx.fillStyle = BAND;
    ctx.fillRect(7, 6, 5, 6);
    ctx.fillRect(20, 6, 5, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 7, 2, 2);
    ctx.fillRect(21, 7, 2, 2);
    // Wide open grin in the red half — no teeth
    ctx.fillStyle = BAND;
    ctx.fillRect(9, 19, 14, 6);
    ctx.fillRect(7, 18, 3, 4);
    ctx.fillRect(22, 18, 3, 4);
    ctx.fillRect(11, 25, 10, 1);
    ctx.fillStyle = '#e04860';
    ctx.fillRect(12, 22, 8, 3);
  } else {
    // Back: no face, just the shaded shell
    ctx.fillStyle = GREY;
    ctx.fillRect(8, 5, 16, 6);
    ctx.fillStyle = RED_DARK;
    ctx.fillRect(8, 19, 16, 5);
  }
};
