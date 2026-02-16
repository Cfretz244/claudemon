import { CustomSpriteDrawFn } from '../types';

export const dragonite: CustomSpriteDrawFn = (ctx, isBack) => {
  // Large round chubby body - orange
  ctx.fillStyle = '#e0a050';
  ctx.fillRect(6, 10, 20, 14);
  ctx.fillRect(4, 12, 24, 10);
  ctx.fillRect(8, 8, 16, 4);

  // Cream belly
  ctx.fillStyle = '#f0e0c0';
  ctx.fillRect(10, 12, 12, 10);
  ctx.fillRect(8, 14, 16, 6);

  // Head - round and friendly
  ctx.fillStyle = '#e0a050';
  ctx.fillRect(9, 1, 14, 10);
  ctx.fillRect(7, 3, 18, 6);

  // Antennae
  ctx.fillStyle = '#e0a050';
  ctx.fillRect(10, 0, 2, 3);
  ctx.fillRect(20, 0, 2, 3);
  // Antenna tips
  ctx.fillStyle = '#c08838';
  ctx.fillRect(10, 0, 2, 1);
  ctx.fillRect(20, 0, 2, 1);

  // Snout
  ctx.fillStyle = '#f0e0c0';
  ctx.fillRect(11, 5, 10, 4);
  ctx.fillRect(13, 4, 6, 2);

  // Small green wings
  ctx.fillStyle = '#68a850';
  ctx.fillRect(0, 8, 8, 10);
  ctx.fillRect(24, 8, 8, 10);
  ctx.fillRect(0, 6, 5, 4);
  ctx.fillRect(27, 6, 5, 4);
  // Wing membrane detail
  ctx.fillStyle = '#78b860';
  ctx.fillRect(1, 9, 6, 8);
  ctx.fillRect(25, 9, 6, 8);
  // Wing stripes
  ctx.fillStyle = '#68a850';
  ctx.fillRect(2, 11, 4, 1);
  ctx.fillRect(2, 14, 4, 1);
  ctx.fillRect(26, 11, 4, 1);
  ctx.fillRect(26, 14, 4, 1);

  // Arms
  ctx.fillStyle = '#e0a050';
  ctx.fillRect(3, 16, 5, 5);
  ctx.fillRect(24, 16, 5, 5);
  // Claws
  ctx.fillStyle = '#f0e0c0';
  ctx.fillRect(3, 19, 4, 3);
  ctx.fillRect(25, 19, 4, 3);

  // Thick legs
  ctx.fillStyle = '#e0a050';
  ctx.fillRect(8, 24, 6, 6);
  ctx.fillRect(18, 24, 6, 6);
  // Feet
  ctx.fillStyle = '#f0e0c0';
  ctx.fillRect(7, 28, 8, 3);
  ctx.fillRect(17, 28, 8, 3);

  // Tail
  ctx.fillStyle = '#e0a050';
  ctx.fillRect(24, 20, 4, 4);
  ctx.fillRect(26, 18, 3, 4);
  ctx.fillRect(28, 16, 3, 3);

  if (!isBack) {
    // Friendly eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 3, 4, 4);
    ctx.fillRect(18, 3, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 3, 2, 2);
    ctx.fillRect(18, 3, 2, 2);
    // Happy mouth
    ctx.fillStyle = '#c08838';
    ctx.fillRect(13, 7, 6, 2);
    ctx.fillStyle = '#e0a050';
    ctx.fillRect(14, 7, 4, 1);
    // Nostrils
    ctx.fillStyle = '#c08838';
    ctx.fillRect(13, 5, 2, 1);
    ctx.fillRect(17, 5, 2, 1);
  } else {
    // Back: green wings prominent, tail visible
    ctx.fillStyle = '#68a850';
    ctx.fillRect(0, 5, 10, 14);
    ctx.fillRect(22, 5, 10, 14);
    ctx.fillStyle = '#78b860';
    ctx.fillRect(1, 7, 8, 10);
    ctx.fillRect(23, 7, 8, 10);
    // Wing stripes from back
    ctx.fillStyle = '#68a850';
    ctx.fillRect(2, 9, 6, 1);
    ctx.fillRect(2, 12, 6, 1);
    ctx.fillRect(2, 15, 6, 1);
    ctx.fillRect(24, 9, 6, 1);
    ctx.fillRect(24, 12, 6, 1);
    ctx.fillRect(24, 15, 6, 1);
    // Tail from back
    ctx.fillStyle = '#e0a050';
    ctx.fillRect(13, 24, 6, 4);
    ctx.fillRect(15, 27, 4, 3);
  }
};
