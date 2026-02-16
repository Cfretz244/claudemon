import { CustomSpriteDrawFn } from '../types';

export const goldeen: CustomSpriteDrawFn = (ctx, isBack) => {
  // Goldeen - orange/white fish, flowing tail fin, small horn on head

  // Main body - fish shape
  ctx.fillStyle = '#e08848';
  ctx.fillRect(6, 12, 18, 8);
  ctx.fillRect(4, 14, 22, 4);
  ctx.fillRect(8, 10, 14, 12);

  // White belly
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(8, 18, 14, 4);
  ctx.fillRect(6, 16, 18, 2);

  // Head
  ctx.fillStyle = '#e08848';
  ctx.fillRect(2, 12, 6, 8);
  ctx.fillRect(4, 10, 4, 12);

  // Horn on head
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(4, 6, 3, 5);
  ctx.fillRect(5, 4, 2, 4);
  ctx.fillRect(5, 3, 1, 2);

  // Flowing tail fin
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(22, 10, 4, 3);
  ctx.fillRect(24, 8, 4, 4);
  ctx.fillRect(26, 6, 4, 4);
  ctx.fillRect(28, 4, 3, 4);
  // Lower tail fin
  ctx.fillRect(22, 19, 4, 3);
  ctx.fillRect(24, 20, 4, 4);
  ctx.fillRect(26, 22, 4, 4);
  ctx.fillRect(28, 24, 3, 4);
  // Tail connection
  ctx.fillStyle = '#e08848';
  ctx.fillRect(22, 13, 4, 6);
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(24, 12, 3, 8);

  // Dorsal fin
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(12, 8, 4, 3);
  ctx.fillRect(14, 6, 3, 3);

  // Pectoral fin
  ctx.fillStyle = '#e08848';
  ctx.fillRect(10, 20, 4, 3);

  // Orange pattern on white tail
  ctx.fillStyle = '#e08848';
  ctx.fillRect(27, 6, 2, 2);
  ctx.fillRect(27, 24, 2, 2);

  if (!isBack) {
    // Eye
    ctx.fillStyle = '#302020';
    ctx.fillRect(4, 14, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 14, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(2, 18, 2, 1);
  } else {
    // Back pattern
    ctx.fillStyle = '#c87838';
    ctx.fillRect(8, 12, 12, 6);
    ctx.fillRect(10, 10, 8, 2);
  }
};
