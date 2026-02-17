export const TRAINER_SPRITES_CLASSES1: Array<{ key: string; draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void }> = [
  // 1. Bug Catcher - Straw hat, green shirt, shorts, holding net
  {
    key: 'trainer_bug_catcher',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';
      const hatMain = '#e8d878';
      const hatBrim = '#c8b858';
      const shirt = '#48a848';
      const shorts = '#d8c078';
      const sandals = '#a07030';
      const hair = '#885830';
      const netPole = '#806040';
      const netColor = '#c0c0c0';

      // Straw hat brim
      ctx.fillStyle = hatBrim;
      ctx.fillRect(8, 4, 22, 4);
      // Straw hat top
      ctx.fillStyle = hatMain;
      ctx.fillRect(12, 0, 14, 6);
      // Hat band
      ctx.fillStyle = '#c04040';
      ctx.fillRect(12, 5, 14, 1);

      // Hair peeking under hat
      ctx.fillStyle = hair;
      ctx.fillRect(11, 8, 3, 4);
      ctx.fillRect(24, 8, 3, 4);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 8, 12, 12);
      // Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(16, 12, 2, 2);
      ctx.fillRect(21, 12, 2, 2);
      // Mouth
      ctx.fillStyle = '#d08060';
      ctx.fillRect(18, 16, 3, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 20, 5, 2);

      // Green shirt
      ctx.fillStyle = shirt;
      ctx.fillRect(11, 22, 17, 12);
      // Shirt collar
      ctx.fillStyle = '#389838';
      ctx.fillRect(16, 22, 7, 2);
      // Sleeves
      ctx.fillStyle = shirt;
      ctx.fillRect(7, 23, 5, 6);
      ctx.fillRect(27, 23, 5, 6);

      // Arms (skin below sleeves)
      ctx.fillStyle = skin;
      ctx.fillRect(7, 29, 4, 5);
      ctx.fillRect(28, 29, 4, 5);

      // Hands
      ctx.fillStyle = skin;
      ctx.fillRect(7, 33, 4, 3);
      ctx.fillRect(28, 33, 4, 3);

      // Net pole (right hand side)
      ctx.fillStyle = netPole;
      ctx.fillRect(31, 10, 2, 30);
      // Net hoop
      ctx.fillStyle = netColor;
      ctx.fillRect(29, 6, 8, 2);
      ctx.fillRect(29, 6, 2, 8);
      ctx.fillRect(35, 6, 2, 8);
      ctx.fillRect(30, 13, 6, 1);
      // Net mesh lines
      ctx.fillRect(31, 8, 1, 5);
      ctx.fillRect(34, 8, 1, 5);

      // Shorts
      ctx.fillStyle = shorts;
      ctx.fillRect(12, 34, 15, 8);
      // Pant leg divide
      ctx.fillStyle = '#c8b068';
      ctx.fillRect(19, 37, 1, 5);

      // Legs
      ctx.fillStyle = skin;
      ctx.fillRect(13, 42, 5, 6);
      ctx.fillRect(21, 42, 5, 6);

      // Sandals
      ctx.fillStyle = sandals;
      ctx.fillRect(12, 48, 7, 3);
      ctx.fillRect(20, 48, 7, 3);
      // Sandal straps
      ctx.fillStyle = '#704820';
      ctx.fillRect(13, 49, 5, 1);
      ctx.fillRect(21, 49, 5, 1);
      // Soles
      ctx.fillStyle = '#604018';
      ctx.fillRect(12, 51, 7, 2);
      ctx.fillRect(20, 51, 7, 2);
    },
  },

  // 2. Youngster - Baseball cap backward, blue t-shirt, tan shorts
  {
    key: 'trainer_youngster',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';
      const capBlue = '#3868b8';
      const shirt = '#4878c8';
      const shorts = '#d8c078';
      const shoes = '#f0f0f0';
      const hair = '#885830';

      // Hair (visible since cap is backward)
      ctx.fillStyle = hair;
      ctx.fillRect(13, 2, 12, 6);

      // Backward baseball cap
      ctx.fillStyle = capBlue;
      ctx.fillRect(12, 3, 16, 6);
      // Cap brim pointing backward
      ctx.fillRect(25, 5, 5, 3);
      // Cap button on top
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(18, 2, 3, 2);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 9, 12, 11);
      // Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(15, 12, 3, 3);
      ctx.fillRect(21, 12, 3, 3);
      // Eye whites
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16, 12, 1, 2);
      ctx.fillRect(22, 12, 1, 2);
      // Mouth - grin
      ctx.fillStyle = '#d08060';
      ctx.fillRect(17, 17, 5, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 20, 5, 2);

      // Blue t-shirt
      ctx.fillStyle = shirt;
      ctx.fillRect(11, 22, 17, 12);
      // Sleeves
      ctx.fillRect(7, 23, 5, 6);
      ctx.fillRect(27, 23, 5, 6);
      // Shirt detail
      ctx.fillStyle = '#3060a8';
      ctx.fillRect(17, 24, 5, 1);

      // Arms
      ctx.fillStyle = skin;
      ctx.fillRect(7, 29, 4, 5);
      ctx.fillRect(28, 29, 4, 5);
      // Hands
      ctx.fillRect(8, 34, 3, 2);
      ctx.fillRect(28, 34, 3, 2);

      // Tan shorts
      ctx.fillStyle = shorts;
      ctx.fillRect(12, 34, 15, 8);
      ctx.fillStyle = '#c8b068';
      ctx.fillRect(19, 37, 1, 5);

      // Legs
      ctx.fillStyle = skin;
      ctx.fillRect(13, 42, 5, 6);
      ctx.fillRect(21, 42, 5, 6);

      // White sneakers
      ctx.fillStyle = shoes;
      ctx.fillRect(12, 48, 7, 3);
      ctx.fillRect(20, 48, 7, 3);
      // Shoe soles
      ctx.fillStyle = '#b0b0b0';
      ctx.fillRect(12, 51, 7, 2);
      ctx.fillRect(20, 51, 7, 2);
      // Shoe detail
      ctx.fillStyle = '#3868b8';
      ctx.fillRect(14, 49, 3, 1);
      ctx.fillRect(22, 49, 3, 1);
    },
  },

  // 3. Camper - Olive safari hat, green scout shirt, brown shorts, hiking boots
  {
    key: 'trainer_camper',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';
      const hatOlive = '#708838';
      const shirt = '#509040';
      const shorts = '#8B6830';
      const boots = '#6B4420';
      const hair = '#483018';

      // Safari/camping hat brim
      ctx.fillStyle = hatOlive;
      ctx.fillRect(7, 5, 24, 4);
      // Hat dome
      ctx.fillStyle = '#809840';
      ctx.fillRect(12, 0, 14, 7);
      // Hat band
      ctx.fillStyle = '#d8a030';
      ctx.fillRect(12, 6, 14, 1);

      // Hair
      ctx.fillStyle = hair;
      ctx.fillRect(12, 8, 3, 3);
      ctx.fillRect(24, 8, 3, 3);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(14, 9, 11, 11);
      // Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(16, 12, 2, 2);
      ctx.fillRect(22, 12, 2, 2);
      // Mouth
      ctx.fillStyle = '#d08060';
      ctx.fillRect(18, 17, 3, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 20, 5, 2);

      // Green scout uniform shirt
      ctx.fillStyle = shirt;
      ctx.fillRect(10, 22, 19, 12);
      // Shirt pockets
      ctx.fillStyle = '#409030';
      ctx.fillRect(12, 25, 5, 4);
      ctx.fillRect(22, 25, 5, 4);
      // Pocket flaps
      ctx.fillStyle = '#388828';
      ctx.fillRect(12, 25, 5, 1);
      ctx.fillRect(22, 25, 5, 1);
      // Shirt buttons
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(19, 24, 1, 1);
      ctx.fillRect(19, 27, 1, 1);
      ctx.fillRect(19, 30, 1, 1);

      // Sleeves
      ctx.fillStyle = shirt;
      ctx.fillRect(6, 23, 5, 6);
      ctx.fillRect(28, 23, 5, 6);

      // Arms
      ctx.fillStyle = skin;
      ctx.fillRect(6, 29, 4, 5);
      ctx.fillRect(29, 29, 4, 5);
      // Hands
      ctx.fillRect(7, 34, 3, 2);
      ctx.fillRect(29, 34, 3, 2);

      // Brown shorts
      ctx.fillStyle = shorts;
      ctx.fillRect(11, 34, 17, 8);
      ctx.fillStyle = '#7B5820';
      ctx.fillRect(19, 37, 1, 5);

      // Legs
      ctx.fillStyle = skin;
      ctx.fillRect(12, 42, 6, 4);
      ctx.fillRect(21, 42, 6, 4);

      // Hiking boots
      ctx.fillStyle = boots;
      ctx.fillRect(11, 46, 8, 5);
      ctx.fillRect(20, 46, 8, 5);
      // Boot laces
      ctx.fillStyle = '#d8c878';
      ctx.fillRect(14, 47, 1, 3);
      ctx.fillRect(23, 47, 1, 3);
      // Boot soles
      ctx.fillStyle = '#483018';
      ctx.fillRect(11, 51, 8, 2);
      ctx.fillRect(20, 51, 8, 2);
    },
  },

  // 4. Super Nerd - Thick glasses, white lab coat, red shirt, skinny, messy hair
  {
    key: 'trainer_super_nerd',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';
      const labCoat = '#f0f0f0';
      const redShirt = '#c83030';
      const pants = '#8B6830';
      const hair = '#483018';
      const glasses = '#404040';

      // Messy hair - spiky on top
      ctx.fillStyle = hair;
      ctx.fillRect(13, 1, 12, 8);
      ctx.fillRect(11, 3, 2, 4);
      ctx.fillRect(25, 3, 2, 4);
      // Spiky bits
      ctx.fillRect(14, 0, 3, 2);
      ctx.fillRect(19, 0, 2, 1);
      ctx.fillRect(22, 0, 3, 2);

      // Face (slightly narrower - nerdy)
      ctx.fillStyle = skin;
      ctx.fillRect(14, 8, 10, 12);

      // Thick round glasses
      ctx.fillStyle = glasses;
      // Left lens frame
      ctx.fillRect(14, 11, 5, 5);
      // Right lens frame
      ctx.fillRect(20, 11, 5, 5);
      // Bridge
      ctx.fillRect(19, 12, 1, 2);
      // Lens glass
      ctx.fillStyle = '#c8d8f8';
      ctx.fillRect(15, 12, 3, 3);
      ctx.fillRect(21, 12, 3, 3);
      // Pupils
      ctx.fillStyle = '#000000';
      ctx.fillRect(16, 13, 2, 2);
      ctx.fillRect(22, 13, 2, 2);

      // Mouth - slight smile
      ctx.fillStyle = '#d08060';
      ctx.fillRect(17, 17, 4, 1);

      // Neck (skinny)
      ctx.fillStyle = skin;
      ctx.fillRect(17, 20, 4, 2);

      // White lab coat (wide, over a skinny frame)
      ctx.fillStyle = labCoat;
      ctx.fillRect(9, 22, 20, 16);
      // Lab coat collar/lapels
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(14, 22, 4, 3);
      ctx.fillRect(20, 22, 4, 3);

      // Red shirt visible under coat
      ctx.fillStyle = redShirt;
      ctx.fillRect(17, 23, 4, 8);

      // Coat sleeves
      ctx.fillStyle = labCoat;
      ctx.fillRect(6, 23, 4, 8);
      ctx.fillRect(28, 23, 4, 8);

      // Arms (very skinny)
      ctx.fillStyle = skin;
      ctx.fillRect(7, 31, 3, 4);
      ctx.fillRect(28, 31, 3, 4);
      // Hands
      ctx.fillRect(7, 35, 3, 2);
      ctx.fillRect(28, 35, 3, 2);

      // Coat bottom edge
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(9, 37, 20, 1);

      // Brown pants (skinny)
      ctx.fillStyle = pants;
      ctx.fillRect(13, 38, 5, 8);
      ctx.fillRect(20, 38, 5, 8);

      // Shoes
      ctx.fillStyle = '#404040';
      ctx.fillRect(12, 46, 7, 3);
      ctx.fillRect(19, 46, 7, 3);
      // Soles
      ctx.fillStyle = '#282828';
      ctx.fillRect(12, 49, 7, 2);
      ctx.fillRect(19, 49, 7, 2);
    },
  },

  // 5. Lass - Pink/white dress with bow, blonde hair with pink bow
  {
    key: 'trainer_lass',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';
      const hair = '#f8e050';
      const bow = '#f868a8';
      const dress = '#f8a8c8';
      const dressWhite = '#f8f0f0';
      const shoes = '#f0f0f0';

      // Blonde hair - top/sides
      ctx.fillStyle = hair;
      ctx.fillRect(12, 1, 14, 8);
      ctx.fillRect(10, 3, 3, 12);
      ctx.fillRect(26, 3, 3, 12);
      // Hair falls down sides
      ctx.fillRect(10, 15, 3, 6);
      ctx.fillRect(26, 15, 3, 6);

      // Pink bow on top of head
      ctx.fillStyle = bow;
      ctx.fillRect(14, 0, 4, 3);
      ctx.fillRect(21, 0, 4, 3);
      ctx.fillRect(18, 1, 3, 2);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 8, 12, 11);
      // Eyes - bigger, cuter
      ctx.fillStyle = '#000000';
      ctx.fillRect(15, 11, 3, 3);
      ctx.fillRect(21, 11, 3, 3);
      // Eye shine
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16, 11, 1, 1);
      ctx.fillRect(22, 11, 1, 1);
      // Blush
      ctx.fillStyle = '#f8a080';
      ctx.fillRect(14, 15, 2, 1);
      ctx.fillRect(23, 15, 2, 1);
      // Mouth
      ctx.fillStyle = '#e86880';
      ctx.fillRect(18, 16, 3, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 19, 5, 2);

      // Dress top (pink)
      ctx.fillStyle = dress;
      ctx.fillRect(12, 21, 15, 8);
      // Dress collar - white
      ctx.fillStyle = dressWhite;
      ctx.fillRect(15, 21, 9, 2);
      // Small bow on collar
      ctx.fillStyle = bow;
      ctx.fillRect(18, 21, 3, 2);

      // Sleeves (puffy)
      ctx.fillStyle = dress;
      ctx.fillRect(8, 22, 5, 5);
      ctx.fillRect(26, 22, 5, 5);

      // Arms
      ctx.fillStyle = skin;
      ctx.fillRect(8, 27, 4, 5);
      ctx.fillRect(27, 27, 4, 5);
      // Hands
      ctx.fillRect(9, 32, 3, 2);
      ctx.fillRect(27, 32, 3, 2);

      // Dress skirt - flared (wider at bottom)
      ctx.fillStyle = dress;
      ctx.fillRect(11, 29, 17, 4);
      ctx.fillRect(10, 33, 19, 4);
      ctx.fillRect(9, 37, 21, 4);
      // White trim at bottom
      ctx.fillStyle = dressWhite;
      ctx.fillRect(9, 40, 21, 2);

      // Legs
      ctx.fillStyle = skin;
      ctx.fillRect(14, 42, 4, 6);
      ctx.fillRect(21, 42, 4, 6);

      // White shoes
      ctx.fillStyle = shoes;
      ctx.fillRect(13, 48, 6, 3);
      ctx.fillRect(20, 48, 6, 3);
      // Shoe straps
      ctx.fillStyle = bow;
      ctx.fillRect(14, 49, 4, 1);
      ctx.fillRect(21, 49, 4, 1);
      // Soles
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(13, 51, 6, 2);
      ctx.fillRect(20, 51, 6, 2);
    },
  },

  // 6. Swimmer - Blue swimsuit, goggles on forehead, muscular, tan skin
  {
    key: 'trainer_swimmer',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#e8b878';
      const trunks = '#2858a8';
      const goggles = '#e84040';
      const goggleLens = '#80d0f0';
      const hair = '#483018';

      // Hair (short, sporty)
      ctx.fillStyle = hair;
      ctx.fillRect(13, 2, 14, 5);
      ctx.fillRect(12, 4, 2, 4);
      ctx.fillRect(27, 4, 2, 4);

      // Goggles on forehead
      ctx.fillStyle = goggles;
      ctx.fillRect(12, 5, 16, 3);
      // Goggle lenses
      ctx.fillStyle = goggleLens;
      ctx.fillRect(14, 6, 4, 2);
      ctx.fillRect(22, 6, 4, 2);
      // Goggle bridge
      ctx.fillStyle = goggles;
      ctx.fillRect(18, 6, 4, 1);

      // Face (slightly tan)
      ctx.fillStyle = skin;
      ctx.fillRect(13, 8, 14, 12);
      // Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(16, 12, 3, 2);
      ctx.fillRect(22, 12, 3, 2);
      // Confident grin
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(17, 17, 6, 2);
      ctx.fillStyle = '#d08060';
      ctx.fillRect(18, 17, 4, 1);

      // Neck (thick, muscular)
      ctx.fillStyle = skin;
      ctx.fillRect(16, 20, 8, 2);

      // Bare chest / upper body (muscular, wide)
      ctx.fillStyle = skin;
      ctx.fillRect(8, 22, 24, 14);
      // Pec definition
      ctx.fillStyle = '#d8a868';
      ctx.fillRect(12, 24, 6, 1);
      ctx.fillRect(22, 24, 6, 1);
      // Abs subtle
      ctx.fillRect(18, 28, 4, 1);
      ctx.fillRect(18, 31, 4, 1);

      // Muscular arms
      ctx.fillStyle = skin;
      ctx.fillRect(4, 23, 5, 10);
      ctx.fillRect(31, 23, 5, 10);
      // Hands/fists
      ctx.fillRect(4, 33, 5, 3);
      ctx.fillRect(31, 33, 5, 3);

      // Blue swim trunks
      ctx.fillStyle = trunks;
      ctx.fillRect(10, 36, 20, 7);
      // Trunks stripe
      ctx.fillStyle = '#4878c8';
      ctx.fillRect(10, 38, 20, 2);
      // Leg divide
      ctx.fillStyle = '#1848a0';
      ctx.fillRect(19, 39, 2, 4);

      // Muscular legs
      ctx.fillStyle = skin;
      ctx.fillRect(11, 43, 7, 8);
      ctx.fillRect(22, 43, 7, 8);
      // Calf definition
      ctx.fillStyle = '#d8a868';
      ctx.fillRect(13, 47, 3, 1);
      ctx.fillRect(24, 47, 3, 1);

      // Bare feet
      ctx.fillStyle = skin;
      ctx.fillRect(10, 51, 8, 3);
      ctx.fillRect(22, 51, 8, 3);
      // Toes
      ctx.fillStyle = '#d8a868';
      ctx.fillRect(11, 53, 1, 1);
      ctx.fillRect(13, 53, 1, 1);
      ctx.fillRect(15, 53, 1, 1);
      ctx.fillRect(23, 53, 1, 1);
      ctx.fillRect(25, 53, 1, 1);
      ctx.fillRect(27, 53, 1, 1);
    },
  },

  // 7. Jr. Trainer - Red cap, blue uniform jacket, gray pants, sneakers
  {
    key: 'trainer_jr_trainer',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';
      const cap = '#d83030';
      const jacket = '#3858a0';
      const pants = '#888888';
      const shoes = '#f0f0f0';
      const hair = '#483018';

      // Red cap (forward-facing like player)
      ctx.fillStyle = cap;
      ctx.fillRect(11, 2, 16, 6);
      // Cap brim
      ctx.fillRect(9, 6, 12, 3);
      // Cap logo
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(17, 3, 4, 3);

      // Hair peeking from sides/back
      ctx.fillStyle = hair;
      ctx.fillRect(25, 5, 3, 5);
      ctx.fillRect(11, 8, 2, 3);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 9, 12, 11);
      // Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(15, 12, 3, 2);
      ctx.fillRect(21, 12, 3, 2);
      // Eye whites
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16, 12, 1, 1);
      ctx.fillRect(22, 12, 1, 1);
      // Mouth
      ctx.fillStyle = '#d08060';
      ctx.fillRect(18, 17, 3, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 20, 5, 2);

      // Blue uniform jacket
      ctx.fillStyle = jacket;
      ctx.fillRect(10, 22, 18, 13);
      // Jacket collar
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(15, 22, 8, 2);
      // Jacket button line
      ctx.fillStyle = '#2848a0';
      ctx.fillRect(19, 24, 1, 8);
      // Buttons
      ctx.fillStyle = '#d8d878';
      ctx.fillRect(19, 25, 1, 1);
      ctx.fillRect(19, 28, 1, 1);
      ctx.fillRect(19, 31, 1, 1);

      // Sleeves
      ctx.fillStyle = jacket;
      ctx.fillRect(6, 23, 5, 7);
      ctx.fillRect(27, 23, 5, 7);
      // Sleeve cuffs
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(6, 29, 5, 1);
      ctx.fillRect(27, 29, 5, 1);

      // Arms
      ctx.fillStyle = skin;
      ctx.fillRect(7, 30, 4, 4);
      ctx.fillRect(28, 30, 4, 4);
      // Hands
      ctx.fillRect(8, 34, 3, 2);
      ctx.fillRect(28, 34, 3, 2);

      // Gray pants
      ctx.fillStyle = pants;
      ctx.fillRect(12, 35, 15, 10);
      // Leg divide
      ctx.fillStyle = '#787878';
      ctx.fillRect(19, 38, 1, 7);

      // White sneakers
      ctx.fillStyle = shoes;
      ctx.fillRect(11, 45, 7, 4);
      ctx.fillRect(21, 45, 7, 4);
      // Shoe stripe
      ctx.fillStyle = cap;
      ctx.fillRect(13, 46, 3, 2);
      ctx.fillRect(23, 46, 3, 2);
      // Soles
      ctx.fillStyle = '#b0b0b0';
      ctx.fillRect(11, 49, 7, 2);
      ctx.fillRect(21, 49, 7, 2);
    },
  },

  // 8. Hiker - LARGE/stocky, brown hat, beard, heavy jacket, backpack
  {
    key: 'trainer_hiker',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';
      const hat = '#8B6830';
      const beard = '#885830';
      const jacket = '#a07030';
      const backpack = '#6B4420';
      const boots = '#604018';
      const pants = '#705828';

      // Brown hiking hat
      ctx.fillStyle = hat;
      ctx.fillRect(6, 3, 26, 4);
      // Hat dome
      ctx.fillStyle = '#9B7840';
      ctx.fillRect(10, 0, 18, 5);
      // Hat band
      ctx.fillStyle = '#483018';
      ctx.fillRect(10, 4, 18, 1);

      // Face (wider - stocky)
      ctx.fillStyle = skin;
      ctx.fillRect(11, 7, 16, 12);
      // Big brown beard
      ctx.fillStyle = beard;
      ctx.fillRect(11, 14, 16, 6);
      ctx.fillRect(10, 16, 2, 3);
      ctx.fillRect(27, 16, 2, 3);
      // Beard on chin
      ctx.fillRect(14, 19, 10, 2);

      // Eyes (above beard, small)
      ctx.fillStyle = '#000000';
      ctx.fillRect(14, 10, 3, 2);
      ctx.fillRect(22, 10, 3, 2);
      // Nose
      ctx.fillStyle = '#e8b878';
      ctx.fillRect(18, 12, 3, 3);

      // Backpack (behind body, visible on sides)
      ctx.fillStyle = backpack;
      ctx.fillRect(2, 21, 6, 18);
      ctx.fillRect(30, 21, 6, 18);
      // Backpack top flap
      ctx.fillRect(2, 20, 6, 2);
      ctx.fillRect(30, 20, 6, 2);
      // Backpack straps
      ctx.fillStyle = '#483018';
      ctx.fillRect(7, 22, 2, 10);
      ctx.fillRect(29, 22, 2, 10);

      // Heavy brown jacket (WIDE body)
      ctx.fillStyle = jacket;
      ctx.fillRect(7, 21, 24, 16);
      // Jacket collar
      ctx.fillStyle = '#b08040';
      ctx.fillRect(14, 21, 10, 2);
      // Jacket center line
      ctx.fillStyle = '#907028';
      ctx.fillRect(19, 23, 1, 12);
      // Jacket pockets
      ctx.fillStyle = '#907028';
      ctx.fillRect(9, 28, 6, 5);
      ctx.fillRect(23, 28, 6, 5);

      // Sleeves (thick)
      ctx.fillStyle = jacket;
      ctx.fillRect(3, 23, 5, 9);
      ctx.fillRect(30, 23, 5, 9);

      // Gloved hands
      ctx.fillStyle = '#604018';
      ctx.fillRect(3, 32, 5, 3);
      ctx.fillRect(30, 32, 5, 3);

      // Pants (wide/stocky)
      ctx.fillStyle = pants;
      ctx.fillRect(8, 37, 22, 8);
      // Leg divide
      ctx.fillStyle = '#604818';
      ctx.fillRect(19, 39, 1, 6);

      // Hiking boots (large)
      ctx.fillStyle = boots;
      ctx.fillRect(7, 45, 10, 5);
      ctx.fillRect(21, 45, 10, 5);
      // Boot laces
      ctx.fillStyle = '#d8c878';
      ctx.fillRect(11, 46, 1, 3);
      ctx.fillRect(25, 46, 1, 3);
      // Boot soles (thick)
      ctx.fillStyle = '#402810';
      ctx.fillRect(7, 50, 10, 3);
      ctx.fillRect(21, 50, 10, 3);
    },
  },

  // 9. Sailor - White sailor cap, blue/white striped uniform, thick arms
  {
    key: 'trainer_sailor',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';
      const capWhite = '#f0f0f0';
      const navy = '#283898';
      const stripeWhite = '#f0f0f0';
      const pants = '#282858';
      const shoes = '#202020';

      // White sailor cap
      ctx.fillStyle = capWhite;
      ctx.fillRect(11, 1, 16, 6);
      // Cap brim
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(10, 5, 18, 3);
      // Cap band
      ctx.fillStyle = navy;
      ctx.fillRect(11, 4, 16, 2);
      // Cap emblem
      ctx.fillStyle = '#d8a030';
      ctx.fillRect(17, 2, 4, 2);

      // Face (broad)
      ctx.fillStyle = skin;
      ctx.fillRect(12, 8, 14, 12);
      // Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(15, 11, 3, 3);
      ctx.fillRect(21, 11, 3, 3);
      // Square jaw
      ctx.fillStyle = skin;
      ctx.fillRect(13, 18, 12, 2);
      // Mouth - confident
      ctx.fillStyle = '#d08060';
      ctx.fillRect(17, 16, 5, 2);

      // Neck (thick)
      ctx.fillStyle = skin;
      ctx.fillRect(16, 20, 7, 2);

      // Sailor shirt - blue/white stripes
      ctx.fillStyle = stripeWhite;
      ctx.fillRect(9, 22, 20, 14);
      // Blue stripes
      ctx.fillStyle = navy;
      ctx.fillRect(9, 22, 20, 2);
      ctx.fillRect(9, 26, 20, 2);
      ctx.fillRect(9, 30, 20, 2);
      ctx.fillRect(9, 34, 20, 2);
      // Sailor collar (V-shape)
      ctx.fillStyle = navy;
      ctx.fillRect(9, 22, 5, 6);
      ctx.fillRect(25, 22, 5, 6);
      // White collar trim
      ctx.fillStyle = stripeWhite;
      ctx.fillRect(10, 22, 3, 4);
      ctx.fillRect(26, 22, 3, 4);

      // Thick arms/sleeves
      ctx.fillStyle = navy;
      ctx.fillRect(4, 23, 6, 5);
      ctx.fillRect(29, 23, 6, 5);
      // Bare forearms
      ctx.fillStyle = skin;
      ctx.fillRect(4, 28, 6, 6);
      ctx.fillRect(29, 28, 6, 6);
      // Fists
      ctx.fillRect(5, 34, 5, 3);
      ctx.fillRect(29, 34, 5, 3);

      // Navy pants
      ctx.fillStyle = pants;
      ctx.fillRect(10, 36, 18, 10);
      // Leg divide
      ctx.fillStyle = '#181848';
      ctx.fillRect(19, 39, 1, 7);

      // Black shoes
      ctx.fillStyle = shoes;
      ctx.fillRect(9, 46, 8, 4);
      ctx.fillRect(22, 46, 8, 4);
      // Shoe soles
      ctx.fillStyle = '#404040';
      ctx.fillRect(9, 50, 8, 2);
      ctx.fillRect(22, 50, 8, 2);
    },
  },

  // 10. Pokemaniac - Purple shirt with Pokeball, messy hair, excited wide pose, jeans
  {
    key: 'trainer_pokemaniac',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';
      const hair = '#885830';
      const shirt = '#9848a8';
      const jeans = '#4868a8';
      const shoes = '#c83030';

      // Messy brown hair
      ctx.fillStyle = hair;
      ctx.fillRect(11, 1, 16, 8);
      // Extra messy bits sticking out
      ctx.fillRect(9, 3, 3, 3);
      ctx.fillRect(26, 2, 3, 4);
      ctx.fillRect(14, 0, 3, 2);
      ctx.fillRect(21, 0, 4, 2);
      ctx.fillRect(27, 4, 3, 2);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 8, 12, 12);
      // Excited wide eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(15, 11, 4, 4);
      ctx.fillRect(21, 11, 4, 4);
      ctx.fillStyle = '#000000';
      ctx.fillRect(16, 12, 3, 3);
      ctx.fillRect(22, 12, 3, 3);
      // Eye sparkle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(17, 12, 1, 1);
      ctx.fillRect(23, 12, 1, 1);
      // Big open grin
      ctx.fillStyle = '#d08060';
      ctx.fillRect(16, 17, 6, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(17, 17, 4, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 20, 5, 2);

      // Purple shirt (excited/wide pose - arms out)
      ctx.fillStyle = shirt;
      ctx.fillRect(10, 22, 18, 13);
      // Pokeball design on shirt
      ctx.fillStyle = '#f04040';
      ctx.fillRect(15, 25, 8, 4);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(15, 29, 8, 3);
      // Pokeball center line
      ctx.fillStyle = '#303030';
      ctx.fillRect(15, 28, 8, 2);
      // Pokeball button
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(18, 28, 3, 2);

      // Arms spread wide (excited pose)
      ctx.fillStyle = shirt;
      ctx.fillRect(4, 22, 7, 5);
      ctx.fillRect(27, 22, 7, 5);
      // Forearms angled outward
      ctx.fillStyle = skin;
      ctx.fillRect(2, 27, 6, 5);
      ctx.fillRect(30, 27, 6, 5);
      // Hands spread
      ctx.fillRect(1, 32, 6, 3);
      ctx.fillRect(31, 32, 6, 3);
      // Fingers
      ctx.fillRect(0, 32, 2, 2);
      ctx.fillRect(36, 32, 2, 2);

      // Blue jeans
      ctx.fillStyle = jeans;
      ctx.fillRect(11, 35, 16, 10);
      // Jean seam
      ctx.fillStyle = '#3858a0';
      ctx.fillRect(19, 37, 1, 8);

      // Red sneakers
      ctx.fillStyle = shoes;
      ctx.fillRect(10, 45, 7, 4);
      ctx.fillRect(21, 45, 7, 4);
      // White toe cap
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(10, 47, 3, 2);
      ctx.fillRect(25, 47, 3, 2);
      // Soles
      ctx.fillStyle = '#808080';
      ctx.fillRect(10, 49, 7, 2);
      ctx.fillRect(21, 49, 7, 2);
    },
  },

  // 11. Channeler - Purple hooded robe, mysterious, face partially hidden
  {
    key: 'trainer_channeler',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';
      const robe = '#6828a0';
      const robeDark = '#481880';
      const robeLight = '#8840c0';

      // Hood top
      ctx.fillStyle = robe;
      ctx.fillRect(10, 0, 18, 8);
      ctx.fillRect(8, 3, 3, 8);
      ctx.fillRect(27, 3, 3, 8);

      // Hood sides draping down
      ctx.fillStyle = robeDark;
      ctx.fillRect(8, 6, 4, 14);
      ctx.fillRect(26, 6, 4, 14);

      // Face (partially shadowed)
      ctx.fillStyle = '#c8a068';
      ctx.fillRect(12, 6, 14, 14);
      // Shadow at top of face from hood
      ctx.fillStyle = '#a08050';
      ctx.fillRect(12, 6, 14, 4);
      // Visible lower face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 10, 12, 8);
      // Eyes - glowing/mysterious
      ctx.fillStyle = '#d040d0';
      ctx.fillRect(15, 10, 3, 3);
      ctx.fillRect(21, 10, 3, 3);
      // Dark pupils
      ctx.fillStyle = '#400060';
      ctx.fillRect(16, 11, 2, 2);
      ctx.fillRect(22, 11, 2, 2);
      // Thin mouth
      ctx.fillStyle = '#c08060';
      ctx.fillRect(17, 16, 5, 1);

      // Robe body (flowing, wide)
      ctx.fillStyle = robe;
      ctx.fillRect(7, 20, 24, 22);
      // Robe folds/details
      ctx.fillStyle = robeDark;
      ctx.fillRect(14, 22, 2, 18);
      ctx.fillRect(23, 22, 2, 18);
      // Center seam
      ctx.fillStyle = robeLight;
      ctx.fillRect(18, 20, 3, 20);
      // Mystical symbol on chest
      ctx.fillStyle = '#d080f0';
      ctx.fillRect(17, 25, 5, 1);
      ctx.fillRect(19, 24, 1, 3);
      ctx.fillRect(17, 27, 5, 1);

      // Robe sleeves (wide, flowing)
      ctx.fillStyle = robe;
      ctx.fillRect(3, 23, 5, 12);
      ctx.fillRect(30, 23, 5, 12);
      // Sleeve inner
      ctx.fillStyle = robeDark;
      ctx.fillRect(3, 33, 5, 2);
      ctx.fillRect(30, 33, 5, 2);

      // Bare hands emerging from sleeves
      ctx.fillStyle = skin;
      ctx.fillRect(4, 35, 4, 3);
      ctx.fillRect(30, 35, 4, 3);

      // Robe bottom (wider, flared)
      ctx.fillStyle = robe;
      ctx.fillRect(6, 42, 26, 6);
      ctx.fillStyle = robeDark;
      ctx.fillRect(6, 46, 26, 2);
      // Robe hem detail
      ctx.fillStyle = robeLight;
      ctx.fillRect(6, 47, 26, 1);

      // Feet barely peeking out
      ctx.fillStyle = '#805028';
      ctx.fillRect(12, 48, 5, 3);
      ctx.fillRect(22, 48, 5, 3);
      // Floor/bottom of robe
      ctx.fillStyle = robeDark;
      ctx.fillRect(6, 51, 26, 2);
    },
  },

  // 12. Gambler - Fedora, brown suit jacket, white shirt, holding coin
  {
    key: 'trainer_gambler',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';
      const fedora = '#808080';
      const suit = '#8B6830';
      const whiteShirt = '#f0f0f0';
      const pants = '#383838';
      const shoes = '#282828';
      const hair = '#484848';

      // Fedora hat brim
      ctx.fillStyle = fedora;
      ctx.fillRect(6, 5, 26, 3);
      // Fedora dome
      ctx.fillStyle = '#909090';
      ctx.fillRect(10, 0, 18, 7);
      // Hat band
      ctx.fillStyle = '#c83030';
      ctx.fillRect(10, 5, 18, 2);
      // Hat crease
      ctx.fillStyle = '#707070';
      ctx.fillRect(14, 1, 10, 1);

      // Hair (gray/dark, slicked)
      ctx.fillStyle = hair;
      ctx.fillRect(12, 7, 2, 5);
      ctx.fillRect(25, 7, 2, 5);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 8, 12, 12);
      // Thin eyes (sly/confident)
      ctx.fillStyle = '#000000';
      ctx.fillRect(15, 12, 3, 2);
      ctx.fillRect(21, 12, 3, 2);
      // Mustache
      ctx.fillStyle = hair;
      ctx.fillRect(15, 16, 3, 1);
      ctx.fillRect(21, 16, 3, 1);
      // Smirk
      ctx.fillStyle = '#d08060';
      ctx.fillRect(17, 17, 5, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 20, 5, 2);

      // Brown suit jacket
      ctx.fillStyle = suit;
      ctx.fillRect(9, 22, 20, 14);
      // White shirt / collar visible
      ctx.fillStyle = whiteShirt;
      ctx.fillRect(16, 22, 7, 6);
      // Tie
      ctx.fillStyle = '#c83030';
      ctx.fillRect(18, 23, 3, 10);
      ctx.fillRect(17, 23, 5, 2);
      // Jacket lapels
      ctx.fillStyle = '#7B5820';
      ctx.fillRect(13, 22, 4, 5);
      ctx.fillRect(22, 22, 4, 5);

      // Jacket sleeves
      ctx.fillStyle = suit;
      ctx.fillRect(5, 23, 5, 8);
      ctx.fillRect(28, 23, 5, 8);
      // Shirt cuffs
      ctx.fillStyle = whiteShirt;
      ctx.fillRect(5, 30, 5, 1);
      ctx.fillRect(28, 30, 5, 1);

      // Arms
      ctx.fillStyle = skin;
      ctx.fillRect(6, 31, 4, 3);
      ctx.fillRect(29, 31, 4, 3);
      // Left hand
      ctx.fillRect(6, 34, 4, 3);
      // Right hand (holding coin up)
      ctx.fillRect(29, 30, 4, 4);

      // Coin in right hand (held up)
      ctx.fillStyle = '#f8d830';
      ctx.fillRect(33, 28, 5, 5);
      // Coin shine
      ctx.fillStyle = '#f8f080';
      ctx.fillRect(34, 29, 2, 2);
      // Coin edge
      ctx.fillStyle = '#c8a820';
      ctx.fillRect(33, 28, 5, 1);
      ctx.fillRect(33, 32, 5, 1);

      // Dark pants
      ctx.fillStyle = pants;
      ctx.fillRect(11, 36, 16, 10);
      // Leg seam
      ctx.fillStyle = '#282828';
      ctx.fillRect(19, 38, 1, 8);

      // Black shoes
      ctx.fillStyle = shoes;
      ctx.fillRect(10, 46, 7, 4);
      ctx.fillRect(21, 46, 7, 4);
      // Shoe shine
      ctx.fillStyle = '#484848';
      ctx.fillRect(12, 47, 3, 1);
      ctx.fillRect(23, 47, 3, 1);
      // Soles
      ctx.fillStyle = '#181818';
      ctx.fillRect(10, 50, 7, 2);
      ctx.fillRect(21, 50, 7, 2);
    },
  },

  // 13. Beauty - Long flowing dark hair, elegant red dress, red lipstick, high heels
  {
    key: 'trainer_beauty',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';
      const hair = '#382818';
      const dress = '#d03040';
      const dressHighlight = '#e04858';
      const heels = '#d03040';

      // Long flowing dark hair - top
      ctx.fillStyle = hair;
      ctx.fillRect(11, 0, 16, 9);
      // Hair sides flowing down long
      ctx.fillRect(9, 2, 3, 24);
      ctx.fillRect(27, 2, 3, 24);
      // Hair flows past shoulders
      ctx.fillRect(8, 20, 3, 10);
      ctx.fillRect(28, 20, 3, 10);

      // Face (elegant, slender)
      ctx.fillStyle = skin;
      ctx.fillRect(13, 7, 12, 13);
      // Chin (pointed/feminine)
      ctx.fillRect(15, 19, 8, 1);
      // Eyes - elegant, slightly angled
      ctx.fillStyle = '#000000';
      ctx.fillRect(15, 11, 3, 2);
      ctx.fillRect(21, 11, 3, 2);
      // Eyelashes
      ctx.fillRect(14, 10, 1, 1);
      ctx.fillRect(24, 10, 1, 1);
      // Eye color
      ctx.fillStyle = '#3868b8';
      ctx.fillRect(16, 11, 1, 1);
      ctx.fillRect(22, 11, 1, 1);
      // Red lipstick (prominent)
      ctx.fillStyle = '#e02030';
      ctx.fillRect(17, 16, 5, 2);
      // Blush
      ctx.fillStyle = '#f8a080';
      ctx.fillRect(14, 14, 2, 1);
      ctx.fillRect(23, 14, 2, 1);

      // Slender neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 20, 5, 2);

      // Red dress top (form-fitting, elegant)
      ctx.fillStyle = dress;
      ctx.fillRect(12, 22, 15, 10);
      // Dress neckline (V-shape)
      ctx.fillStyle = skin;
      ctx.fillRect(16, 22, 7, 3);
      ctx.fillRect(17, 24, 5, 1);
      // Dress highlight/shading
      ctx.fillStyle = dressHighlight;
      ctx.fillRect(13, 23, 2, 8);

      // Thin straps / sleeveless arms
      ctx.fillStyle = skin;
      ctx.fillRect(9, 23, 4, 9);
      ctx.fillRect(26, 23, 4, 9);
      // Hands
      ctx.fillRect(9, 32, 4, 3);
      ctx.fillRect(26, 32, 4, 3);

      // Dress waist (cinched)
      ctx.fillStyle = dress;
      ctx.fillRect(13, 32, 13, 2);
      // Belt/waist detail
      ctx.fillStyle = '#a02030';
      ctx.fillRect(13, 32, 13, 1);

      // Dress skirt (elegant, slightly flared)
      ctx.fillStyle = dress;
      ctx.fillRect(12, 34, 15, 4);
      ctx.fillRect(11, 38, 17, 4);
      ctx.fillRect(10, 42, 19, 3);
      // Dress hem
      ctx.fillStyle = '#a02030';
      ctx.fillRect(10, 44, 19, 1);
      // Dress fold/shading
      ctx.fillStyle = dressHighlight;
      ctx.fillRect(14, 35, 2, 9);
      ctx.fillRect(22, 36, 2, 8);

      // Slender legs
      ctx.fillStyle = skin;
      ctx.fillRect(14, 45, 4, 4);
      ctx.fillRect(21, 45, 4, 4);

      // High heels
      ctx.fillStyle = heels;
      ctx.fillRect(13, 49, 6, 2);
      ctx.fillRect(20, 49, 6, 2);
      // Heel spike
      ctx.fillStyle = '#a02030';
      ctx.fillRect(17, 51, 2, 3);
      ctx.fillRect(24, 51, 2, 3);
      // Toe
      ctx.fillStyle = heels;
      ctx.fillRect(13, 51, 4, 2);
      ctx.fillRect(20, 51, 4, 2);
    },
  },
];
