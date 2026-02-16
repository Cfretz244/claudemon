import { CustomSpriteDrawFn } from '../types';

export const beedrill: CustomSpriteDrawFn = (ctx, isBack) => {
  // Beedrill - yellow/black striped wasp with lance arms

  // Wings (behind body)
  ctx.fillStyle = '#d0e0f0';
  ctx.fillRect(4, 4, 8, 6);
  ctx.fillRect(20, 4, 8, 6);
  ctx.fillRect(3, 5, 9, 4);
  ctx.fillRect(20, 5, 9, 4);

  // Abdomen (lower body) - striped
  ctx.fillStyle = '#d8b020';
  ctx.fillRect(11, 18, 10, 10);
  ctx.fillRect(9, 20, 14, 6);
  // Black stripes
  ctx.fillStyle = '#302020';
  ctx.fillRect(10, 21, 12, 2);
  ctx.fillRect(10, 25, 12, 2);

  // Stinger
  ctx.fillStyle = '#d8b020';
  ctx.fillRect(14, 28, 4, 2);
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(15, 30, 2, 2);

  // Thorax (middle body)
  ctx.fillStyle = '#d8b020';
  ctx.fillRect(12, 12, 8, 7);
  ctx.fillRect(10, 14, 12, 4);

  // Head
  ctx.fillStyle = '#d8b020';
  ctx.fillRect(11, 4, 10, 9);
  ctx.fillRect(9, 5, 14, 7);

  // Antennae
  ctx.fillStyle = '#302020';
  ctx.fillRect(11, 1, 2, 4);
  ctx.fillRect(19, 1, 2, 4);
  ctx.fillRect(10, 0, 2, 2);
  ctx.fillRect(20, 0, 2, 2);

  // Lance arms - left
  ctx.fillStyle = '#d8b020';
  ctx.fillRect(5, 12, 6, 3);
  ctx.fillRect(2, 13, 4, 2);
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(0, 13, 3, 2);

  // Lance arms - right
  ctx.fillStyle = '#d8b020';
  ctx.fillRect(21, 12, 6, 3);
  ctx.fillRect(26, 13, 4, 2);
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(29, 13, 3, 2);

  if (!isBack) {
    // Red eyes
    ctx.fillStyle = '#e03030';
    ctx.fillRect(10, 6, 4, 3);
    ctx.fillRect(18, 6, 4, 3);
    // Eye inner
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 7, 2, 2);
    ctx.fillRect(19, 7, 2, 2);
    // Highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 7, 1, 1);
    ctx.fillRect(19, 7, 1, 1);
    // Mandibles
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 11, 2, 2);
    ctx.fillRect(17, 11, 2, 2);
  } else {
    // Back: prominent wings, striped body
    ctx.fillStyle = '#d0e0f0';
    ctx.fillRect(2, 3, 10, 8);
    ctx.fillRect(20, 3, 10, 8);
    ctx.fillRect(1, 5, 11, 5);
    ctx.fillRect(20, 5, 11, 5);
    // Wing vein detail
    ctx.fillStyle = '#a0b8d0';
    ctx.fillRect(5, 6, 1, 4);
    ctx.fillRect(26, 6, 1, 4);
  }

  // Legs
  ctx.fillStyle = '#302020';
  ctx.fillRect(11, 18, 2, 3);
  ctx.fillRect(19, 18, 2, 3);
};
