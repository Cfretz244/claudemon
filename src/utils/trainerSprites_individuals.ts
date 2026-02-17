export const TRAINER_SPRITES_INDIVIDUALS: Array<{
  key: string;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}> = [
  // ============================================================
  // 1. BROCK - Squinting eyes, spiky brown hair, tan vest, boots
  // ============================================================
  {
    key: 'trainer_brock',
    draw: (ctx, w, h) => {
      // Spiky brown hair
      ctx.fillStyle = '#705030';
      ctx.fillRect(12, 2, 16, 4);
      ctx.fillRect(10, 4, 20, 4);
      // Spikes pointing up
      ctx.fillRect(11, 0, 3, 4);
      ctx.fillRect(16, 0, 3, 3);
      ctx.fillRect(21, 0, 3, 4);
      ctx.fillRect(26, 1, 3, 3);
      ctx.fillRect(14, 1, 2, 2);
      ctx.fillRect(24, 0, 2, 3);

      // Face
      ctx.fillStyle = '#e0a868';
      ctx.fillRect(12, 8, 16, 10);
      ctx.fillRect(14, 7, 12, 1);

      // Squinting eyes - just horizontal lines, NO circles
      ctx.fillStyle = '#302020';
      ctx.fillRect(14, 12, 5, 2);
      ctx.fillRect(21, 12, 5, 2);

      // Mouth
      ctx.fillStyle = '#c08060';
      ctx.fillRect(17, 16, 6, 1);

      // Neck
      ctx.fillStyle = '#e0a868';
      ctx.fillRect(16, 18, 8, 2);

      // Black undershirt
      ctx.fillStyle = '#202020';
      ctx.fillRect(10, 20, 20, 14);
      ctx.fillRect(8, 22, 24, 10);

      // Tan/rocky brown vest over the black shirt
      ctx.fillStyle = '#b89060';
      ctx.fillRect(10, 20, 7, 14);
      ctx.fillRect(23, 20, 7, 14);
      // Vest shoulders
      ctx.fillRect(8, 22, 4, 8);
      ctx.fillRect(28, 22, 4, 8);
      // Vest collar
      ctx.fillStyle = '#a08050';
      ctx.fillRect(10, 20, 3, 2);
      ctx.fillRect(27, 20, 3, 2);

      // Hands
      ctx.fillStyle = '#e0a868';
      ctx.fillRect(6, 30, 4, 4);
      ctx.fillRect(30, 30, 4, 4);

      // Belt
      ctx.fillStyle = '#302020';
      ctx.fillRect(10, 34, 20, 2);
      ctx.fillStyle = '#c0a030';
      ctx.fillRect(18, 34, 4, 2);

      // Brown pants
      ctx.fillStyle = '#806040';
      ctx.fillRect(11, 36, 8, 10);
      ctx.fillRect(21, 36, 8, 10);

      // Boots
      ctx.fillStyle = '#403020';
      ctx.fillRect(10, 46, 9, 5);
      ctx.fillRect(21, 46, 9, 5);
      // Boot soles
      ctx.fillStyle = '#302018';
      ctx.fillRect(10, 50, 9, 2);
      ctx.fillRect(21, 50, 9, 2);
    },
  },

  // ============================================================
  // 2. MISTY - Orange side ponytail, blue swimsuit, bare feet
  // ============================================================
  {
    key: 'trainer_misty',
    draw: (ctx, w, h) => {
      // Orange hair - main
      ctx.fillStyle = '#e87820';
      ctx.fillRect(12, 2, 16, 8);
      ctx.fillRect(10, 4, 20, 6);
      // Side ponytail on left
      ctx.fillRect(4, 4, 8, 4);
      ctx.fillRect(2, 6, 6, 6);
      ctx.fillRect(1, 8, 5, 8);
      ctx.fillRect(2, 14, 4, 4);
      // Hair bang fringe
      ctx.fillRect(12, 2, 3, 2);
      ctx.fillRect(18, 2, 4, 2);
      // Hair tie
      ctx.fillStyle = '#f83030';
      ctx.fillRect(5, 5, 3, 3);

      // Face
      ctx.fillStyle = '#f8d0a8';
      ctx.fillRect(13, 8, 14, 10);
      ctx.fillRect(15, 7, 10, 1);

      // Eyes
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(15, 11, 4, 3);
      ctx.fillRect(22, 11, 4, 3);
      ctx.fillStyle = '#2880c8';
      ctx.fillRect(16, 12, 3, 2);
      ctx.fillRect(23, 12, 3, 2);
      ctx.fillStyle = '#183860';
      ctx.fillRect(17, 12, 2, 2);
      ctx.fillRect(24, 12, 2, 2);

      // Nose
      ctx.fillStyle = '#d8a878';
      ctx.fillRect(19, 14, 2, 1);

      // Mouth (smile)
      ctx.fillStyle = '#d06060';
      ctx.fillRect(17, 16, 6, 1);

      // Neck
      ctx.fillStyle = '#f8d0a8';
      ctx.fillRect(17, 18, 6, 2);

      // Blue/white one-piece swimsuit
      ctx.fillStyle = '#2880c8';
      ctx.fillRect(12, 20, 16, 16);
      ctx.fillRect(10, 22, 20, 12);
      // Swimsuit top white accent
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(16, 20, 8, 2);
      // Swimsuit straps
      ctx.fillStyle = '#2880c8';
      ctx.fillRect(14, 18, 3, 3);
      ctx.fillRect(23, 18, 3, 3);

      // Arms (skin)
      ctx.fillStyle = '#f8d0a8';
      ctx.fillRect(7, 22, 5, 10);
      ctx.fillRect(28, 22, 5, 10);
      // Hands
      ctx.fillRect(6, 30, 5, 3);
      ctx.fillRect(29, 30, 5, 3);

      // Legs (skin)
      ctx.fillStyle = '#f8d0a8';
      ctx.fillRect(13, 36, 6, 14);
      ctx.fillRect(21, 36, 6, 14);

      // Bare feet
      ctx.fillStyle = '#f0c898';
      ctx.fillRect(12, 50, 7, 3);
      ctx.fillRect(21, 50, 7, 3);
    },
  },

  // ============================================================
  // 3. LT. SURGE - Tall, muscular, buzzcut, sunglasses, military
  // ============================================================
  {
    key: 'trainer_lt_surge',
    draw: (ctx, w, h) => {
      // Military buzzcut (yellow/blonde, very short)
      ctx.fillStyle = '#e8c830';
      ctx.fillRect(12, 1, 16, 4);
      ctx.fillRect(10, 3, 20, 3);

      // Face (takes up more space - tall build)
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(12, 5, 16, 10);
      ctx.fillRect(10, 7, 20, 6);

      // Dark sunglasses
      ctx.fillStyle = '#181818';
      ctx.fillRect(11, 8, 7, 3);
      ctx.fillRect(22, 8, 7, 3);
      // Bridge
      ctx.fillRect(18, 9, 4, 2);

      // Nose
      ctx.fillStyle = '#d8a878';
      ctx.fillRect(19, 11, 2, 2);

      // Mouth/jaw - stern
      ctx.fillStyle = '#c08060';
      ctx.fillRect(16, 13, 8, 1);

      // Neck - thick
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(15, 15, 10, 2);

      // Green military jacket
      ctx.fillStyle = '#407830';
      ctx.fillRect(8, 17, 24, 14);
      ctx.fillRect(6, 19, 28, 10);
      // Jacket collar
      ctx.fillStyle = '#305820';
      ctx.fillRect(14, 17, 5, 3);
      ctx.fillRect(21, 17, 5, 3);
      // Jacket pockets
      ctx.fillStyle = '#305820';
      ctx.fillRect(10, 24, 6, 3);
      ctx.fillRect(24, 24, 6, 3);
      // Dog tags
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(19, 18, 2, 4);
      ctx.fillRect(18, 22, 3, 2);

      // Arms
      ctx.fillStyle = '#407830';
      ctx.fillRect(4, 19, 4, 10);
      ctx.fillRect(32, 19, 4, 10);
      // Hands
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(3, 29, 5, 3);
      ctx.fillRect(32, 29, 5, 3);

      // Belt
      ctx.fillStyle = '#302020';
      ctx.fillRect(8, 31, 24, 2);
      ctx.fillStyle = '#c0a030';
      ctx.fillRect(18, 31, 4, 2);

      // Camo pants
      ctx.fillStyle = '#506838';
      ctx.fillRect(9, 33, 10, 12);
      ctx.fillRect(21, 33, 10, 12);
      // Camo pattern
      ctx.fillStyle = '#607848';
      ctx.fillRect(11, 35, 4, 3);
      ctx.fillRect(23, 37, 5, 3);
      ctx.fillStyle = '#405028';
      ctx.fillRect(14, 39, 3, 3);
      ctx.fillRect(26, 34, 3, 3);

      // Combat boots
      ctx.fillStyle = '#302020';
      ctx.fillRect(8, 45, 11, 6);
      ctx.fillRect(21, 45, 11, 6);
      // Boot laces
      ctx.fillStyle = '#404040';
      ctx.fillRect(12, 45, 1, 5);
      ctx.fillRect(14, 45, 1, 5);
      ctx.fillRect(25, 45, 1, 5);
      ctx.fillRect(27, 45, 1, 5);
      // Boot soles
      ctx.fillStyle = '#201810';
      ctx.fillRect(8, 50, 11, 2);
      ctx.fillRect(21, 50, 11, 2);
    },
  },

  // ============================================================
  // 4. ERIKA - Black bob hair, green floral kimono, sandals
  // ============================================================
  {
    key: 'trainer_erika',
    draw: (ctx, w, h) => {
      // Black bob/straight hair
      ctx.fillStyle = '#181830';
      ctx.fillRect(10, 2, 20, 6);
      ctx.fillRect(8, 4, 24, 8);
      ctx.fillRect(7, 8, 4, 8);
      ctx.fillRect(29, 8, 4, 8);

      // Headband/flower
      ctx.fillStyle = '#e03030';
      ctx.fillRect(10, 4, 20, 2);
      // Small flower on headband
      ctx.fillStyle = '#f86060';
      ctx.fillRect(26, 3, 3, 3);
      ctx.fillStyle = '#f8e030';
      ctx.fillRect(27, 4, 1, 1);

      // Face
      ctx.fillStyle = '#f8d0a8';
      ctx.fillRect(12, 8, 16, 10);

      // Eyes (gentle, slightly closed)
      ctx.fillStyle = '#302020';
      ctx.fillRect(14, 12, 4, 2);
      ctx.fillRect(22, 12, 4, 2);
      // Eyelashes
      ctx.fillRect(14, 11, 1, 1);
      ctx.fillRect(25, 11, 1, 1);

      // Nose
      ctx.fillStyle = '#d8a878';
      ctx.fillRect(19, 14, 2, 1);

      // Small smile
      ctx.fillStyle = '#d06060';
      ctx.fillRect(17, 16, 6, 1);

      // Neck
      ctx.fillStyle = '#f8d0a8';
      ctx.fillRect(17, 18, 6, 2);

      // Green kimono body
      ctx.fillStyle = '#308830';
      ctx.fillRect(10, 20, 20, 22);
      ctx.fillRect(8, 22, 24, 18);
      // Kimono overlap (V-neck area)
      ctx.fillStyle = '#f8f8e0';
      ctx.fillRect(17, 20, 6, 6);
      ctx.fillRect(18, 20, 4, 8);
      // Kimono obi (belt/sash)
      ctx.fillStyle = '#c02020';
      ctx.fillRect(10, 30, 20, 3);
      ctx.fillStyle = '#e03030';
      ctx.fillRect(17, 29, 6, 5);

      // Floral dots on kimono
      ctx.fillStyle = '#f06080';
      ctx.fillRect(12, 22, 2, 2);
      ctx.fillRect(26, 24, 2, 2);
      ctx.fillRect(14, 35, 2, 2);
      ctx.fillRect(24, 37, 2, 2);
      ctx.fillStyle = '#f8e030';
      ctx.fillRect(11, 36, 2, 2);
      ctx.fillRect(27, 35, 2, 2);
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(13, 24, 1, 1);
      ctx.fillRect(25, 38, 1, 1);

      // Kimono sleeves (wide)
      ctx.fillStyle = '#308830';
      ctx.fillRect(4, 22, 6, 12);
      ctx.fillRect(30, 22, 6, 12);
      // Flower on sleeves
      ctx.fillStyle = '#f06080';
      ctx.fillRect(5, 26, 2, 2);
      ctx.fillRect(32, 28, 2, 2);

      // Hands peeking from sleeves
      ctx.fillStyle = '#f8d0a8';
      ctx.fillRect(5, 33, 4, 3);
      ctx.fillRect(31, 33, 4, 3);

      // Lower kimono (legs area)
      ctx.fillStyle = '#308830';
      ctx.fillRect(12, 42, 16, 6);

      // Sandals
      ctx.fillStyle = '#a07040';
      ctx.fillRect(12, 48, 7, 4);
      ctx.fillRect(21, 48, 7, 4);
      // Sandal straps
      ctx.fillStyle = '#c09060';
      ctx.fillRect(14, 48, 2, 1);
      ctx.fillRect(23, 48, 2, 1);
      // Feet
      ctx.fillStyle = '#f8d0a8';
      ctx.fillRect(13, 49, 5, 2);
      ctx.fillRect(22, 49, 5, 2);
    },
  },

  // ============================================================
  // 5. KOGA - Purple ninja outfit, red headband, tabi boots
  // ============================================================
  {
    key: 'trainer_koga',
    draw: (ctx, w, h) => {
      // Red headband
      ctx.fillStyle = '#c02020';
      ctx.fillRect(10, 4, 22, 3);
      // Headband tails (flowing to the right/back)
      ctx.fillRect(30, 3, 4, 2);
      ctx.fillRect(33, 2, 3, 2);
      ctx.fillRect(35, 1, 2, 2);

      // Dark hair above headband
      ctx.fillStyle = '#181830';
      ctx.fillRect(12, 2, 18, 3);
      ctx.fillRect(10, 3, 2, 2);

      // Face
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(12, 7, 16, 10);
      ctx.fillRect(14, 6, 12, 1);

      // Determined eyes
      ctx.fillStyle = '#302020';
      ctx.fillRect(14, 10, 4, 3);
      ctx.fillRect(22, 10, 4, 3);
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(15, 10, 2, 2);
      ctx.fillRect(23, 10, 2, 2);
      // Eyebrows (angled, intense)
      ctx.fillRect(14, 9, 5, 1);
      ctx.fillRect(21, 9, 5, 1);

      // Nose
      ctx.fillStyle = '#d8a878';
      ctx.fillRect(19, 13, 2, 1);

      // Mouth (thin, stern)
      ctx.fillStyle = '#a06040';
      ctx.fillRect(17, 15, 6, 1);

      // Neck
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(17, 17, 6, 2);

      // Purple ninja outfit - top
      ctx.fillStyle = '#503080';
      ctx.fillRect(10, 19, 20, 14);
      ctx.fillRect(8, 21, 24, 10);
      // Ninja wrap/collar
      ctx.fillStyle = '#402060';
      ctx.fillRect(14, 19, 12, 3);
      ctx.fillRect(16, 19, 8, 4);

      // Arms
      ctx.fillStyle = '#503080';
      ctx.fillRect(4, 21, 6, 10);
      ctx.fillRect(30, 21, 6, 10);
      // Arm wraps
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(5, 27, 4, 1);
      ctx.fillRect(5, 29, 4, 1);
      ctx.fillRect(31, 27, 4, 1);
      ctx.fillRect(31, 29, 4, 1);

      // Hands
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(4, 31, 5, 3);
      ctx.fillRect(31, 31, 5, 3);

      // Belt/sash
      ctx.fillStyle = '#c02020';
      ctx.fillRect(10, 33, 20, 2);

      // Purple pants
      ctx.fillStyle = '#503080';
      ctx.fillRect(11, 35, 8, 12);
      ctx.fillRect(21, 35, 8, 12);

      // Leg wraps
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(12, 42, 6, 1);
      ctx.fillRect(12, 44, 6, 1);
      ctx.fillRect(22, 42, 6, 1);
      ctx.fillRect(22, 44, 6, 1);

      // Ninja tabi boots
      ctx.fillStyle = '#181830';
      ctx.fillRect(10, 47, 9, 5);
      ctx.fillRect(21, 47, 9, 5);
      // Split toe
      ctx.fillRect(10, 51, 4, 2);
      ctx.fillRect(15, 51, 4, 2);
      ctx.fillRect(21, 51, 4, 2);
      ctx.fillRect(26, 51, 4, 2);
    },
  },

  // ============================================================
  // 6. SABRINA - Very long straight black hair, red/purple dress
  // ============================================================
  {
    key: 'trainer_sabrina',
    draw: (ctx, w, h) => {
      // Very long straight black hair (goes down to waist)
      ctx.fillStyle = '#181830';
      ctx.fillRect(10, 2, 20, 8);
      ctx.fillRect(8, 4, 24, 6);
      // Hair sides going way down
      ctx.fillRect(6, 8, 5, 28);
      ctx.fillRect(29, 8, 5, 28);
      // Hair back
      ctx.fillRect(8, 10, 4, 24);
      ctx.fillRect(28, 10, 4, 24);

      // Face
      ctx.fillStyle = '#f8d0a8';
      ctx.fillRect(12, 7, 16, 11);
      ctx.fillRect(14, 6, 12, 1);

      // Intense eyes (larger, piercing)
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(14, 10, 5, 3);
      ctx.fillRect(21, 10, 5, 3);
      ctx.fillStyle = '#8030a0';
      ctx.fillRect(15, 10, 3, 3);
      ctx.fillRect(22, 10, 3, 3);
      ctx.fillStyle = '#302020';
      ctx.fillRect(16, 11, 2, 2);
      ctx.fillRect(23, 11, 2, 2);
      // Sharp eyebrows
      ctx.fillStyle = '#181830';
      ctx.fillRect(14, 9, 5, 1);
      ctx.fillRect(21, 9, 5, 1);

      // Nose
      ctx.fillStyle = '#d8a878';
      ctx.fillRect(19, 14, 2, 1);

      // Lips
      ctx.fillStyle = '#c04060';
      ctx.fillRect(17, 16, 6, 1);

      // Neck
      ctx.fillStyle = '#f8d0a8';
      ctx.fillRect(17, 18, 6, 2);

      // Red/purple dress
      ctx.fillStyle = '#901848';
      ctx.fillRect(12, 20, 16, 20);
      ctx.fillRect(10, 22, 20, 16);
      // Dress neckline
      ctx.fillStyle = '#a02058';
      ctx.fillRect(15, 20, 10, 3);
      // Dress accent stripe
      ctx.fillStyle = '#c03070';
      ctx.fillRect(12, 26, 16, 1);

      // Arms (visible between hair)
      ctx.fillStyle = '#f8d0a8';
      ctx.fillRect(11, 22, 2, 10);
      ctx.fillRect(27, 22, 2, 10);
      // Hands
      ctx.fillRect(10, 32, 3, 3);
      ctx.fillRect(27, 32, 3, 3);

      // Lower dress (skirt)
      ctx.fillStyle = '#901848';
      ctx.fillRect(11, 38, 18, 6);
      ctx.fillRect(12, 42, 16, 4);

      // Legs
      ctx.fillStyle = '#f8d0a8';
      ctx.fillRect(14, 44, 5, 5);
      ctx.fillRect(21, 44, 5, 5);

      // High heels
      ctx.fillStyle = '#302020';
      ctx.fillRect(13, 49, 6, 3);
      ctx.fillRect(21, 49, 6, 3);
      // Heel
      ctx.fillRect(13, 51, 2, 2);
      ctx.fillRect(25, 51, 2, 2);
    },
  },

  // ============================================================
  // 7. BLAINE - Bald, white mustache, sunglasses, lab coat
  // ============================================================
  {
    key: 'trainer_blaine',
    draw: (ctx, w, h) => {
      // Bald head
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(12, 2, 16, 6);
      ctx.fillRect(10, 4, 20, 6);
      // Slight shine on bald head
      ctx.fillStyle = '#f8d8a0';
      ctx.fillRect(16, 2, 6, 2);

      // Face
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(12, 8, 16, 10);

      // Dark sunglasses
      ctx.fillStyle = '#181818';
      ctx.fillRect(12, 10, 6, 3);
      ctx.fillRect(22, 10, 6, 3);
      // Bridge
      ctx.fillRect(18, 11, 4, 2);
      // Rims
      ctx.fillStyle = '#303030';
      ctx.fillRect(11, 10, 1, 3);
      ctx.fillRect(28, 10, 1, 3);

      // Nose
      ctx.fillStyle = '#d8a878';
      ctx.fillRect(19, 13, 2, 2);

      // Bushy white mustache
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(13, 15, 14, 3);
      ctx.fillRect(12, 16, 16, 2);
      ctx.fillRect(11, 16, 2, 1);
      ctx.fillRect(27, 16, 2, 1);

      // Neck
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(17, 18, 6, 2);

      // White lab coat
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(8, 20, 24, 18);
      ctx.fillRect(6, 22, 28, 14);
      // Lab coat lapels
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(14, 20, 4, 6);
      ctx.fillRect(22, 20, 4, 6);
      // Lab coat buttons
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(19, 24, 2, 2);
      ctx.fillRect(19, 28, 2, 2);
      ctx.fillRect(19, 32, 2, 2);

      // Red shirt underneath
      ctx.fillStyle = '#c02020';
      ctx.fillRect(16, 20, 8, 6);
      ctx.fillRect(18, 20, 4, 3);

      // Lab coat pockets
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(9, 28, 6, 4);
      ctx.fillRect(25, 28, 6, 4);
      // Pen in pocket
      ctx.fillStyle = '#2020c0';
      ctx.fillRect(10, 27, 1, 4);

      // Hands
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(5, 34, 4, 3);
      ctx.fillRect(31, 34, 4, 3);

      // Dark pants
      ctx.fillStyle = '#303030';
      ctx.fillRect(12, 38, 7, 10);
      ctx.fillRect(21, 38, 7, 10);

      // Shoes
      ctx.fillStyle = '#201810';
      ctx.fillRect(11, 48, 8, 4);
      ctx.fillRect(21, 48, 8, 4);
      // Soles
      ctx.fillStyle = '#181010';
      ctx.fillRect(11, 51, 8, 2);
      ctx.fillRect(21, 51, 8, 2);
    },
  },

  // ============================================================
  // 8. GIOVANNI - Black suit, slicked hair, boss presence
  // ============================================================
  {
    key: 'trainer_giovanni',
    draw: (ctx, w, h) => {
      // Slicked-back dark hair
      ctx.fillStyle = '#282028';
      ctx.fillRect(10, 2, 20, 6);
      ctx.fillRect(8, 4, 24, 4);
      // Hair peak
      ctx.fillRect(14, 1, 12, 2);

      // Face
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(12, 7, 16, 11);
      ctx.fillRect(14, 6, 12, 1);

      // Eyes (narrow, confident)
      ctx.fillStyle = '#302020';
      ctx.fillRect(14, 10, 4, 3);
      ctx.fillRect(22, 10, 4, 3);
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(15, 10, 2, 2);
      ctx.fillRect(23, 10, 2, 2);
      // Eyebrows (thick, assertive)
      ctx.fillStyle = '#282028';
      ctx.fillRect(14, 9, 5, 1);
      ctx.fillRect(21, 9, 5, 1);

      // Nose
      ctx.fillStyle = '#d8a878';
      ctx.fillRect(19, 13, 2, 2);

      // Confident smirk
      ctx.fillStyle = '#c08060';
      ctx.fillRect(17, 16, 7, 1);
      ctx.fillRect(23, 15, 2, 1);

      // Neck
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(17, 18, 6, 2);

      // Black business suit jacket
      ctx.fillStyle = '#181818';
      ctx.fillRect(8, 20, 24, 16);
      ctx.fillRect(6, 22, 28, 12);
      // Suit lapels
      ctx.fillStyle = '#282828';
      ctx.fillRect(14, 20, 5, 8);
      ctx.fillRect(21, 20, 5, 8);
      // White undershirt/collar
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(17, 20, 6, 4);
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(18, 20, 4, 2);
      // Tie
      ctx.fillStyle = '#801010';
      ctx.fillRect(19, 22, 2, 10);
      ctx.fillRect(18, 22, 4, 2);

      // Suit buttons
      ctx.fillStyle = '#c0a030';
      ctx.fillRect(17, 28, 2, 2);

      // Arms
      ctx.fillStyle = '#181818';
      ctx.fillRect(3, 22, 5, 12);
      ctx.fillRect(32, 22, 5, 12);
      // Hands
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(2, 33, 5, 3);
      ctx.fillRect(33, 33, 5, 3);

      // Belt
      ctx.fillStyle = '#302020';
      ctx.fillRect(8, 36, 24, 2);
      ctx.fillStyle = '#c0a030';
      ctx.fillRect(18, 36, 4, 2);

      // Black suit pants
      ctx.fillStyle = '#181818';
      ctx.fillRect(10, 38, 9, 10);
      ctx.fillRect(21, 38, 9, 10);
      // Crease
      ctx.fillStyle = '#101010';
      ctx.fillRect(14, 38, 1, 10);
      ctx.fillRect(25, 38, 1, 10);

      // Shiny black shoes
      ctx.fillStyle = '#101010';
      ctx.fillRect(9, 48, 10, 4);
      ctx.fillRect(21, 48, 10, 4);
      // Shoe shine
      ctx.fillStyle = '#303030';
      ctx.fillRect(11, 48, 3, 1);
      ctx.fillRect(24, 48, 3, 1);
      // Soles
      ctx.fillStyle = '#080808';
      ctx.fillRect(9, 51, 10, 2);
      ctx.fillRect(21, 51, 10, 2);
    },
  },

  // ============================================================
  // 9. LORELEI - Red/auburn hair, round glasses, blue dress
  // ============================================================
  {
    key: 'trainer_lorelei',
    draw: (ctx, w, h) => {
      // Red/auburn hair
      ctx.fillStyle = '#b03030';
      ctx.fillRect(10, 1, 20, 8);
      ctx.fillRect(8, 3, 24, 6);
      // Hair curls at sides
      ctx.fillRect(6, 6, 4, 10);
      ctx.fillRect(30, 6, 4, 10);
      // Hair flowing behind
      ctx.fillRect(7, 14, 3, 6);
      ctx.fillRect(30, 14, 3, 6);
      // Bangs
      ctx.fillRect(12, 2, 4, 3);
      ctx.fillRect(20, 2, 5, 3);

      // Face (lighter/fairer skin)
      ctx.fillStyle = '#f8d8b8';
      ctx.fillRect(12, 7, 16, 11);
      ctx.fillRect(14, 6, 12, 1);

      // Round glasses
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(13, 10, 6, 4);
      ctx.fillRect(21, 10, 6, 4);
      ctx.fillRect(19, 11, 2, 2);
      // Clear lenses
      ctx.fillStyle = '#d8e8f8';
      ctx.fillRect(14, 11, 4, 2);
      ctx.fillRect(22, 11, 4, 2);
      // Eyes behind glasses
      ctx.fillStyle = '#2060a0';
      ctx.fillRect(15, 11, 2, 2);
      ctx.fillRect(23, 11, 2, 2);

      // Nose
      ctx.fillStyle = '#e0b090';
      ctx.fillRect(19, 14, 2, 1);

      // Lips
      ctx.fillStyle = '#c04060';
      ctx.fillRect(17, 16, 6, 1);

      // Neck
      ctx.fillStyle = '#f8d8b8';
      ctx.fillRect(17, 18, 6, 2);

      // Elegant blue dress
      ctx.fillStyle = '#2050a0';
      ctx.fillRect(10, 20, 20, 20);
      ctx.fillRect(8, 22, 24, 16);
      // Dress neckline (wide collar)
      ctx.fillStyle = '#2868b8';
      ctx.fillRect(14, 20, 12, 3);
      // Necklace
      ctx.fillStyle = '#d0d8f0';
      ctx.fillRect(16, 20, 8, 1);
      ctx.fillStyle = '#4080d0';
      ctx.fillRect(19, 21, 2, 2);

      // Arms
      ctx.fillStyle = '#f8d8b8';
      ctx.fillRect(6, 22, 4, 10);
      ctx.fillRect(30, 22, 4, 10);
      // Hands
      ctx.fillRect(5, 32, 4, 3);
      ctx.fillRect(31, 32, 4, 3);

      // Dress waist
      ctx.fillStyle = '#183878';
      ctx.fillRect(10, 32, 20, 2);

      // Lower dress
      ctx.fillStyle = '#2050a0';
      ctx.fillRect(10, 34, 20, 10);
      ctx.fillRect(12, 42, 16, 4);

      // Legs
      ctx.fillStyle = '#f8d8b8';
      ctx.fillRect(14, 44, 5, 5);
      ctx.fillRect(21, 44, 5, 5);

      // Blue heels
      ctx.fillStyle = '#2050a0';
      ctx.fillRect(13, 49, 6, 3);
      ctx.fillRect(21, 49, 6, 3);
      // Heel
      ctx.fillRect(13, 51, 2, 2);
      ctx.fillRect(25, 51, 2, 2);
    },
  },

  // ============================================================
  // 10. BRUNO - Very muscular, shirtless, dark skin, headband
  // ============================================================
  {
    key: 'trainer_bruno',
    draw: (ctx, w, h) => {
      // Dark hair (short, thick)
      ctx.fillStyle = '#181818';
      ctx.fillRect(10, 2, 20, 5);
      ctx.fillRect(8, 4, 24, 4);

      // White headband
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(8, 5, 24, 3);

      // Face (darker skin)
      ctx.fillStyle = '#c09060';
      ctx.fillRect(12, 7, 16, 11);
      ctx.fillRect(10, 8, 20, 8);

      // Eyes (intense)
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(14, 11, 4, 3);
      ctx.fillRect(22, 11, 4, 3);
      ctx.fillStyle = '#302020';
      ctx.fillRect(15, 12, 3, 2);
      ctx.fillRect(23, 12, 3, 2);
      // Heavy brows
      ctx.fillStyle = '#181818';
      ctx.fillRect(13, 10, 6, 1);
      ctx.fillRect(21, 10, 6, 1);

      // Nose
      ctx.fillStyle = '#a07848';
      ctx.fillRect(19, 14, 2, 2);

      // Mouth
      ctx.fillStyle = '#804830';
      ctx.fillRect(17, 17, 6, 1);

      // Neck (thick)
      ctx.fillStyle = '#c09060';
      ctx.fillRect(15, 18, 10, 3);

      // Shirtless muscular torso
      ctx.fillStyle = '#c09060';
      ctx.fillRect(8, 21, 24, 14);
      ctx.fillRect(6, 23, 28, 10);
      // Pec definition
      ctx.fillStyle = '#b08050';
      ctx.fillRect(12, 22, 7, 1);
      ctx.fillRect(21, 22, 7, 1);
      ctx.fillRect(11, 26, 1, 4);
      ctx.fillRect(28, 26, 1, 4);
      // Abs definition
      ctx.fillStyle = '#b08050';
      ctx.fillRect(19, 28, 2, 1);
      ctx.fillRect(19, 31, 2, 1);
      ctx.fillRect(17, 29, 1, 3);
      ctx.fillRect(22, 29, 1, 3);

      // Muscular arms
      ctx.fillStyle = '#c09060';
      ctx.fillRect(2, 23, 6, 12);
      ctx.fillRect(32, 23, 6, 12);
      // Bicep highlights
      ctx.fillStyle = '#d0a070';
      ctx.fillRect(3, 24, 4, 3);
      ctx.fillRect(33, 24, 4, 3);

      // Fighting wristbands
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(1, 32, 6, 3);
      ctx.fillRect(33, 32, 6, 3);

      // Fists
      ctx.fillStyle = '#c09060';
      ctx.fillRect(1, 35, 6, 3);
      ctx.fillRect(33, 35, 6, 3);

      // Belt
      ctx.fillStyle = '#302020';
      ctx.fillRect(8, 35, 24, 2);
      ctx.fillStyle = '#c0a030';
      ctx.fillRect(18, 35, 4, 2);

      // White martial arts pants
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(10, 37, 9, 12);
      ctx.fillRect(21, 37, 9, 12);
      // Pant crease
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(14, 37, 1, 12);
      ctx.fillRect(25, 37, 1, 12);

      // Bare feet
      ctx.fillStyle = '#c09060';
      ctx.fillRect(10, 49, 9, 4);
      ctx.fillRect(21, 49, 9, 4);
      // Toes
      ctx.fillStyle = '#b08050';
      ctx.fillRect(10, 52, 9, 1);
      ctx.fillRect(21, 52, 9, 1);
    },
  },

  // ============================================================
  // 11. AGATHA - Elderly, white hair bun, purple dress, cane
  // ============================================================
  {
    key: 'trainer_agatha',
    draw: (ctx, w, h) => {
      // White/gray hair bun on top
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(14, 0, 12, 4);
      ctx.fillRect(12, 2, 16, 4);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(15, 0, 10, 3);
      // Hair sides
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(10, 5, 20, 4);
      ctx.fillRect(8, 6, 4, 6);
      ctx.fillRect(28, 6, 4, 6);

      // Face (elderly, lighter)
      ctx.fillStyle = '#f0d0a0';
      ctx.fillRect(12, 8, 16, 10);

      // Eyes (small, wise)
      ctx.fillStyle = '#302020';
      ctx.fillRect(14, 11, 4, 2);
      ctx.fillRect(22, 11, 4, 2);
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(15, 11, 2, 1);
      ctx.fillRect(23, 11, 2, 1);
      // Wrinkle lines under eyes
      ctx.fillStyle = '#d0b088';
      ctx.fillRect(14, 13, 4, 1);
      ctx.fillRect(22, 13, 4, 1);

      // Nose
      ctx.fillStyle = '#d0a878';
      ctx.fillRect(19, 13, 2, 2);

      // Mouth
      ctx.fillStyle = '#a07050';
      ctx.fillRect(17, 16, 6, 1);

      // Neck
      ctx.fillStyle = '#f0d0a0';
      ctx.fillRect(17, 18, 6, 2);

      // Purple shawl/dress top
      ctx.fillStyle = '#604080';
      ctx.fillRect(8, 20, 24, 6);
      ctx.fillRect(6, 22, 28, 4);
      // Shawl wrap
      ctx.fillStyle = '#704890';
      ctx.fillRect(10, 20, 20, 3);
      ctx.fillRect(14, 20, 12, 2);
      // Brooch
      ctx.fillStyle = '#c0a030';
      ctx.fillRect(19, 21, 2, 2);

      // Purple dress body (slightly hunched - shifted forward)
      ctx.fillStyle = '#604080';
      ctx.fillRect(10, 26, 22, 16);
      ctx.fillRect(12, 24, 18, 2);

      // Arms
      ctx.fillStyle = '#604080';
      ctx.fillRect(6, 24, 5, 10);
      ctx.fillRect(30, 24, 5, 10);
      // Hands
      ctx.fillStyle = '#f0d0a0';
      ctx.fillRect(5, 34, 4, 3);
      ctx.fillRect(30, 34, 4, 3);

      // Walking cane (right hand holds it, goes to ground)
      ctx.fillStyle = '#805020';
      ctx.fillRect(33, 30, 2, 24);
      // Cane handle
      ctx.fillStyle = '#a06830';
      ctx.fillRect(33, 29, 4, 3);

      // Lower dress
      ctx.fillStyle = '#604080';
      ctx.fillRect(12, 40, 20, 8);
      ctx.fillRect(14, 46, 16, 4);

      // Shoes (small, sensible)
      ctx.fillStyle = '#302030';
      ctx.fillRect(14, 50, 6, 3);
      ctx.fillRect(22, 50, 6, 3);
    },
  },

  // ============================================================
  // 12. LANCE - Red cape, spiky hair, blue armor, heroic pose
  // ============================================================
  {
    key: 'trainer_lance',
    draw: (ctx, w, h) => {
      // Spiky reddish-brown hair
      ctx.fillStyle = '#a04020';
      ctx.fillRect(12, 2, 16, 6);
      ctx.fillRect(10, 4, 20, 5);
      // Spikes
      ctx.fillRect(10, 0, 3, 4);
      ctx.fillRect(15, 0, 3, 3);
      ctx.fillRect(20, 0, 4, 3);
      ctx.fillRect(25, 1, 3, 3);
      ctx.fillRect(28, 2, 3, 3);

      // Face
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(12, 8, 16, 10);
      ctx.fillRect(14, 7, 12, 1);

      // Eyes (heroic, determined)
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(14, 11, 4, 3);
      ctx.fillRect(22, 11, 4, 3);
      ctx.fillStyle = '#302020';
      ctx.fillRect(15, 12, 3, 2);
      ctx.fillRect(23, 12, 3, 2);
      // Bold eyebrows
      ctx.fillStyle = '#a04020';
      ctx.fillRect(14, 10, 5, 1);
      ctx.fillRect(21, 10, 5, 1);

      // Nose
      ctx.fillStyle = '#d8a878';
      ctx.fillRect(19, 14, 2, 1);

      // Mouth (confident)
      ctx.fillStyle = '#c08060';
      ctx.fillRect(17, 16, 6, 1);

      // Neck
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(17, 18, 6, 2);

      // Dramatic red cape (flowing to left side)
      ctx.fillStyle = '#c01818';
      ctx.fillRect(0, 18, 10, 30);
      ctx.fillRect(2, 18, 12, 4);
      ctx.fillRect(1, 22, 10, 26);
      ctx.fillRect(0, 44, 8, 8);
      // Cape inner lining
      ctx.fillStyle = '#e83030';
      ctx.fillRect(2, 20, 8, 2);
      ctx.fillRect(1, 24, 3, 8);
      // Cape attaches at shoulders
      ctx.fillStyle = '#c01818';
      ctx.fillRect(28, 18, 10, 8);
      ctx.fillRect(30, 26, 8, 10);
      ctx.fillRect(32, 34, 6, 10);
      ctx.fillRect(34, 42, 4, 6);

      // Blue armor top
      ctx.fillStyle = '#2848a0';
      ctx.fillRect(10, 20, 20, 14);
      ctx.fillRect(12, 18, 16, 2);
      // Armor highlights
      ctx.fillStyle = '#3860c0';
      ctx.fillRect(14, 22, 12, 2);
      ctx.fillRect(16, 26, 8, 2);
      // Armor collar
      ctx.fillStyle = '#e8c020';
      ctx.fillRect(12, 18, 16, 2);
      // Gold trim on armor
      ctx.fillStyle = '#e8c020';
      ctx.fillRect(10, 24, 20, 1);

      // Arms in armor
      ctx.fillStyle = '#2848a0';
      ctx.fillRect(7, 22, 5, 10);
      ctx.fillRect(28, 22, 5, 10);
      // Gauntlets
      ctx.fillStyle = '#3060c0';
      ctx.fillRect(6, 30, 5, 4);
      ctx.fillRect(29, 30, 5, 4);
      // Hands
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(6, 34, 4, 3);
      ctx.fillRect(30, 34, 4, 3);

      // Belt
      ctx.fillStyle = '#e8c020';
      ctx.fillRect(10, 34, 20, 2);

      // Blue armored pants/greaves
      ctx.fillStyle = '#2848a0';
      ctx.fillRect(11, 36, 8, 10);
      ctx.fillRect(21, 36, 8, 10);
      // Knee guards
      ctx.fillStyle = '#3060c0';
      ctx.fillRect(12, 40, 6, 3);
      ctx.fillRect(22, 40, 6, 3);

      // Boots
      ctx.fillStyle = '#1c2060';
      ctx.fillRect(10, 46, 9, 6);
      ctx.fillRect(21, 46, 9, 6);
      // Boot tops
      ctx.fillStyle = '#e8c020';
      ctx.fillRect(10, 46, 9, 1);
      ctx.fillRect(21, 46, 9, 1);
      // Soles
      ctx.fillStyle = '#101030';
      ctx.fillRect(10, 51, 9, 2);
      ctx.fillRect(21, 51, 9, 2);
    },
  },

  // ============================================================
  // 13. RIVAL - Spiky brown hair, purple shirt, cocky stance
  // ============================================================
  {
    key: 'trainer_rival',
    draw: (ctx, w, h) => {
      // Spiky brown hair
      ctx.fillStyle = '#705030';
      ctx.fillRect(12, 2, 16, 6);
      ctx.fillRect(10, 4, 20, 5);
      // Spikes (aggressive, messy)
      ctx.fillRect(9, 0, 3, 5);
      ctx.fillRect(14, 0, 3, 3);
      ctx.fillRect(19, 1, 4, 2);
      ctx.fillRect(24, 0, 3, 4);
      ctx.fillRect(28, 2, 3, 3);

      // Face
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(12, 8, 16, 10);
      ctx.fillRect(14, 7, 12, 1);

      // Eyes (cocky/confident)
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(14, 11, 4, 3);
      ctx.fillRect(22, 11, 4, 3);
      ctx.fillStyle = '#302020';
      ctx.fillRect(16, 11, 2, 3);
      ctx.fillRect(24, 11, 2, 3);
      // Eyebrows (one raised - cocky)
      ctx.fillStyle = '#503828';
      ctx.fillRect(14, 9, 5, 2);
      ctx.fillRect(22, 10, 5, 1);

      // Nose
      ctx.fillStyle = '#d8a878';
      ctx.fillRect(19, 13, 2, 2);

      // Smirk
      ctx.fillStyle = '#c08060';
      ctx.fillRect(17, 16, 7, 1);
      ctx.fillRect(22, 15, 3, 1);

      // Neck
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(17, 18, 6, 2);

      // Purple/violet shirt
      ctx.fillStyle = '#6030a0';
      ctx.fillRect(10, 20, 20, 12);
      ctx.fillRect(8, 22, 24, 8);
      // Shirt collar
      ctx.fillStyle = '#7040b0';
      ctx.fillRect(16, 20, 8, 2);
      // Shirt neckline
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(18, 20, 4, 1);

      // Arms
      ctx.fillStyle = '#6030a0';
      ctx.fillRect(4, 22, 6, 8);
      ctx.fillRect(30, 22, 6, 8);
      // Hands (one hand on hip for cocky stance)
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(3, 29, 5, 3);
      ctx.fillRect(30, 28, 5, 3);

      // Belt
      ctx.fillStyle = '#302020';
      ctx.fillRect(10, 32, 20, 2);

      // Dark blue jeans
      ctx.fillStyle = '#203870';
      ctx.fillRect(11, 34, 8, 12);
      ctx.fillRect(21, 34, 8, 12);
      // Jean seams
      ctx.fillStyle = '#182860';
      ctx.fillRect(14, 34, 1, 12);
      ctx.fillRect(25, 34, 1, 12);

      // Sneakers
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(10, 46, 9, 5);
      ctx.fillRect(21, 46, 9, 5);
      // Sneaker accents
      ctx.fillStyle = '#3030c0';
      ctx.fillRect(10, 47, 9, 2);
      ctx.fillRect(21, 47, 9, 2);
      // Soles
      ctx.fillStyle = '#404040';
      ctx.fillRect(10, 50, 9, 2);
      ctx.fillRect(21, 50, 9, 2);
    },
  },

  // ============================================================
  // 14. PLAYER BACK VIEW - Back of Red during battle
  // ============================================================
  {
    key: 'trainer_player_back',
    draw: (ctx, w, h) => {
      // Red cap from behind
      ctx.fillStyle = '#e03030';
      ctx.fillRect(10, 2, 20, 6);
      ctx.fillRect(8, 4, 24, 4);
      ctx.fillRect(12, 1, 16, 2);
      // Cap brim visible slightly from behind (at bottom of cap)
      ctx.fillStyle = '#c02020';
      ctx.fillRect(10, 7, 20, 2);
      // Cap back strap/adjuster
      ctx.fillStyle = '#a01818';
      ctx.fillRect(17, 3, 6, 2);

      // Brown hair peeking from under cap (sides and below)
      ctx.fillStyle = '#503020';
      ctx.fillRect(8, 7, 4, 5);
      ctx.fillRect(28, 7, 4, 5);
      ctx.fillRect(10, 9, 20, 3);
      // Hair at nape of neck
      ctx.fillRect(14, 11, 12, 3);

      // Back of neck
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(16, 12, 8, 4);

      // Blue jacket back
      ctx.fillStyle = '#3030a0';
      ctx.fillRect(8, 16, 24, 18);
      ctx.fillRect(6, 18, 28, 14);
      // Jacket collar (standing up slightly at back of neck)
      ctx.fillStyle = '#202080';
      ctx.fillRect(14, 15, 12, 3);
      ctx.fillRect(12, 16, 16, 2);
      // Jacket seam down center back
      ctx.fillStyle = '#282890';
      ctx.fillRect(19, 18, 2, 16);

      // Black backpack visible on back
      ctx.fillStyle = '#282828';
      ctx.fillRect(12, 18, 16, 12);
      ctx.fillRect(14, 16, 12, 2);
      // Backpack zipper/detail
      ctx.fillStyle = '#404040';
      ctx.fillRect(19, 18, 2, 10);
      // Backpack top flap
      ctx.fillStyle = '#383838';
      ctx.fillRect(13, 17, 14, 3);
      // Backpack straps (going over shoulders)
      ctx.fillStyle = '#303030';
      ctx.fillRect(12, 16, 3, 8);
      ctx.fillRect(25, 16, 3, 8);

      // Jacket lower/sides around backpack
      ctx.fillStyle = '#3030a0';
      ctx.fillRect(6, 20, 8, 12);
      ctx.fillRect(26, 20, 8, 12);

      // Arms (jacket sleeves)
      ctx.fillStyle = '#3030a0';
      ctx.fillRect(3, 20, 5, 12);
      ctx.fillRect(32, 20, 5, 12);
      // Hands
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(2, 31, 5, 3);
      ctx.fillRect(33, 31, 5, 3);

      // Belt
      ctx.fillStyle = '#302020';
      ctx.fillRect(8, 34, 24, 2);
      ctx.fillStyle = '#f8d030';
      ctx.fillRect(18, 34, 4, 2);

      // Blue jeans back
      ctx.fillStyle = '#3060c0';
      ctx.fillRect(10, 36, 9, 12);
      ctx.fillRect(21, 36, 9, 12);
      // Back pockets
      ctx.fillStyle = '#2850b0';
      ctx.fillRect(11, 37, 5, 3);
      ctx.fillRect(24, 37, 5, 3);

      // Red shoes
      ctx.fillStyle = '#c02020';
      ctx.fillRect(9, 48, 10, 4);
      ctx.fillRect(21, 48, 10, 4);
      // Shoe soles
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(9, 51, 10, 2);
      ctx.fillRect(21, 51, 10, 2);
    },
  },

  // ============================================================
  // 15. PLAYER FRONT VIEW - Front-facing Red for trainer card
  // ============================================================
  {
    key: 'trainer_player_front',
    draw: (ctx, w, h) => {
      // Red cap
      ctx.fillStyle = '#e03030';
      ctx.fillRect(10, 1, 20, 4);
      ctx.fillRect(8, 3, 24, 3);
      ctx.fillRect(12, 0, 16, 2);
      // White pokeball logo on cap
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(17, 1, 6, 3);
      ctx.fillStyle = '#e03030';
      ctx.fillRect(19, 2, 2, 1);
      // Cap brim
      ctx.fillStyle = '#c02020';
      ctx.fillRect(7, 6, 26, 2);

      // Brown hair (sides visible under cap)
      ctx.fillStyle = '#503020';
      ctx.fillRect(8, 5, 4, 5);
      ctx.fillRect(28, 5, 4, 5);

      // Face
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(12, 8, 16, 10);
      ctx.fillRect(14, 7, 12, 1);

      // Eyes
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(14, 11, 4, 3);
      ctx.fillRect(22, 11, 4, 3);
      ctx.fillStyle = '#302020';
      ctx.fillRect(15, 12, 3, 2);
      ctx.fillRect(23, 12, 3, 2);

      // Nose
      ctx.fillStyle = '#d8a878';
      ctx.fillRect(19, 14, 2, 1);

      // Mouth (determined)
      ctx.fillStyle = '#c08060';
      ctx.fillRect(17, 16, 6, 1);

      // Neck
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(17, 18, 6, 2);

      // Blue jacket
      ctx.fillStyle = '#3030a0';
      ctx.fillRect(8, 20, 24, 14);
      ctx.fillRect(6, 22, 28, 10);
      // Jacket lapels
      ctx.fillStyle = '#202080';
      ctx.fillRect(14, 20, 4, 6);
      ctx.fillRect(22, 20, 4, 6);
      // White shirt underneath
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(16, 20, 8, 6);
      ctx.fillRect(18, 20, 4, 3);

      // Arms
      ctx.fillStyle = '#3030a0';
      ctx.fillRect(3, 22, 5, 10);
      ctx.fillRect(32, 22, 5, 10);
      // Hands
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(2, 31, 5, 3);
      ctx.fillRect(33, 31, 5, 3);

      // Belt
      ctx.fillStyle = '#302020';
      ctx.fillRect(8, 34, 24, 2);
      ctx.fillStyle = '#f8d030';
      ctx.fillRect(18, 34, 4, 2);

      // Blue jeans
      ctx.fillStyle = '#3060c0';
      ctx.fillRect(10, 36, 9, 12);
      ctx.fillRect(21, 36, 9, 12);

      // Red sneakers
      ctx.fillStyle = '#c02020';
      ctx.fillRect(9, 48, 10, 4);
      ctx.fillRect(21, 48, 10, 4);
      // White accents
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(11, 48, 4, 1);
      ctx.fillRect(24, 48, 4, 1);
      // Soles
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(9, 51, 10, 2);
      ctx.fillRect(21, 51, 10, 2);
    },
  },
];
