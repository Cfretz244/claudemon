export const TRAINER_SPRITES_CLASSES2: Array<{
  key: string;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}> = [
  // 1. trainer_psychic - Blue/purple mystical robe, headband with gem
  {
    key: 'trainer_psychic',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';

      // Hair (dark purple, flows down sides)
      ctx.fillStyle = '#4a2080';
      ctx.fillRect(12, 2, 16, 10);
      ctx.fillRect(10, 4, 20, 8);
      // Hair sides flowing down
      ctx.fillRect(10, 10, 4, 8);
      ctx.fillRect(26, 10, 4, 8);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(14, 6, 12, 10);

      // Headband
      ctx.fillStyle = '#6030b0';
      ctx.fillRect(12, 4, 16, 3);
      // Gem on forehead (yellow dot)
      ctx.fillStyle = '#f0e040';
      ctx.fillRect(18, 4, 4, 3);

      // Eyes
      ctx.fillStyle = '#302060';
      ctx.fillRect(16, 9, 3, 2);
      ctx.fillRect(22, 9, 3, 2);

      // Mouth
      ctx.fillStyle = '#c08060';
      ctx.fillRect(18, 13, 4, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 16, 6, 2);

      // Robe - main body (deep blue-purple)
      ctx.fillStyle = '#4028a0';
      ctx.fillRect(8, 18, 24, 24);

      // Robe collar / V-shape
      ctx.fillStyle = '#6040c0';
      ctx.fillRect(16, 18, 8, 4);
      ctx.fillRect(17, 22, 6, 2);

      // Long sleeves (flowing)
      ctx.fillStyle = '#4028a0';
      ctx.fillRect(4, 20, 6, 16);
      ctx.fillRect(30, 20, 6, 16);

      // Sleeve trim
      ctx.fillStyle = '#6040c0';
      ctx.fillRect(4, 34, 6, 2);
      ctx.fillRect(30, 34, 6, 2);

      // Hands peeking out of sleeves
      ctx.fillStyle = skin;
      ctx.fillRect(5, 36, 4, 3);
      ctx.fillRect(31, 36, 4, 3);

      // Robe lower trim
      ctx.fillStyle = '#6040c0';
      ctx.fillRect(8, 40, 24, 2);

      // Robe bottom / skirt
      ctx.fillStyle = '#4028a0';
      ctx.fillRect(10, 42, 20, 8);

      // Feet
      ctx.fillStyle = '#302060';
      ctx.fillRect(12, 50, 6, 4);
      ctx.fillRect(22, 50, 6, 4);

      // Mystical energy dots
      ctx.fillStyle = '#c080f0';
      ctx.fillRect(6, 38, 2, 2);
      ctx.fillRect(32, 38, 2, 2);
    },
  },

  // 2. trainer_fisher - Wide fishing hat, vest, holding rod
  {
    key: 'trainer_fisher',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';

      // Fishing rod (thin line going up-right from right hand)
      ctx.fillStyle = '#705030';
      ctx.fillRect(32, 4, 2, 30);
      ctx.fillRect(34, 2, 2, 4);
      ctx.fillRect(36, 0, 2, 4);
      // Rod tip
      ctx.fillStyle = '#a0a0a0';
      ctx.fillRect(36, 0, 2, 2);
      // Fishing line
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(37, 0, 1, 2);

      // Wide fishing hat (tan)
      ctx.fillStyle = '#c8a860';
      ctx.fillRect(8, 2, 22, 4);
      ctx.fillRect(6, 5, 26, 2);
      // Hat brim
      ctx.fillRect(4, 7, 30, 3);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 9, 12, 10);

      // Eyes
      ctx.fillStyle = '#404040';
      ctx.fillRect(15, 12, 3, 2);
      ctx.fillRect(21, 12, 3, 2);

      // Mouth (friendly)
      ctx.fillStyle = '#c08060';
      ctx.fillRect(17, 16, 4, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 19, 6, 2);

      // Fishing vest (olive/green)
      ctx.fillStyle = '#708050';
      ctx.fillRect(10, 21, 20, 16);

      // Vest pockets
      ctx.fillStyle = '#607040';
      ctx.fillRect(12, 24, 6, 4);
      ctx.fillRect(22, 24, 6, 4);
      ctx.fillRect(12, 30, 6, 4);

      // Undershirt visible at collar
      ctx.fillStyle = '#d0c0a0';
      ctx.fillRect(16, 21, 8, 3);

      // Arms
      ctx.fillStyle = '#708050';
      ctx.fillRect(6, 23, 5, 12);
      ctx.fillRect(29, 23, 5, 12);

      // Hands
      ctx.fillStyle = skin;
      ctx.fillRect(7, 35, 4, 3);
      ctx.fillRect(30, 35, 4, 3);

      // Brown pants
      ctx.fillStyle = '#806040';
      ctx.fillRect(12, 37, 16, 12);
      // Pant leg split
      ctx.fillStyle = '#705030';
      ctx.fillRect(19, 42, 2, 7);

      // Boots
      ctx.fillStyle = '#504030';
      ctx.fillRect(12, 49, 7, 5);
      ctx.fillRect(21, 49, 7, 5);

      // Boot soles
      ctx.fillStyle = '#302820';
      ctx.fillRect(12, 53, 7, 2);
      ctx.fillRect(21, 53, 7, 2);
    },
  },

  // 3. trainer_bird_keeper - Aviator goggles, feathered cap, green jacket
  {
    key: 'trainer_bird_keeper',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';

      // Feathered cap (green)
      ctx.fillStyle = '#408040';
      ctx.fillRect(12, 2, 16, 6);
      ctx.fillRect(10, 4, 20, 4);
      // Cap brim
      ctx.fillStyle = '#306030';
      ctx.fillRect(10, 8, 20, 2);
      // Feather on cap
      ctx.fillStyle = '#e04040';
      ctx.fillRect(26, 1, 3, 2);
      ctx.fillRect(28, 0, 2, 2);
      ctx.fillStyle = '#c03030';
      ctx.fillRect(29, 0, 2, 3);

      // Aviator goggles on forehead
      ctx.fillStyle = '#a08040';
      ctx.fillRect(12, 7, 16, 3);
      ctx.fillStyle = '#80c0e0';
      ctx.fillRect(13, 7, 5, 3);
      ctx.fillRect(21, 7, 5, 3);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 10, 14, 9);

      // Eyes
      ctx.fillStyle = '#404040';
      ctx.fillRect(15, 13, 3, 2);
      ctx.fillRect(22, 13, 3, 2);

      // Mouth
      ctx.fillStyle = '#c08060';
      ctx.fillRect(18, 17, 4, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 19, 6, 2);

      // Green jacket
      ctx.fillStyle = '#408040';
      ctx.fillRect(10, 21, 20, 16);

      // Jacket collar
      ctx.fillStyle = '#306030';
      ctx.fillRect(14, 21, 12, 3);

      // Jacket zipper line
      ctx.fillStyle = '#c0a030';
      ctx.fillRect(19, 24, 2, 13);

      // Arms (jacket sleeves)
      ctx.fillStyle = '#408040';
      ctx.fillRect(6, 22, 5, 12);
      ctx.fillRect(29, 22, 5, 12);

      // Hands
      ctx.fillStyle = skin;
      ctx.fillRect(7, 34, 4, 3);
      ctx.fillRect(30, 34, 4, 3);

      // Brown pants
      ctx.fillStyle = '#806040';
      ctx.fillRect(12, 37, 16, 10);
      ctx.fillStyle = '#705030';
      ctx.fillRect(19, 40, 2, 7);

      // Boots
      ctx.fillStyle = '#504030';
      ctx.fillRect(12, 47, 7, 6);
      ctx.fillRect(21, 47, 7, 6);
      ctx.fillStyle = '#403020';
      ctx.fillRect(12, 52, 7, 2);
      ctx.fillRect(21, 52, 7, 2);
    },
  },

  // 4. trainer_biker - Black leather jacket, red bandana, tough
  {
    key: 'trainer_biker',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';

      // Red bandana
      ctx.fillStyle = '#d02020';
      ctx.fillRect(11, 2, 18, 5);
      ctx.fillRect(10, 4, 20, 3);
      // Bandana knot/tail on side
      ctx.fillRect(28, 3, 4, 2);
      ctx.fillRect(31, 2, 3, 2);

      // Hair peeking under bandana
      ctx.fillStyle = '#303030';
      ctx.fillRect(11, 6, 18, 2);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 8, 14, 10);

      // Tough expression - thick brows
      ctx.fillStyle = '#303030';
      ctx.fillRect(15, 10, 4, 1);
      ctx.fillRect(22, 10, 4, 1);
      // Eyes (narrow)
      ctx.fillRect(16, 11, 3, 2);
      ctx.fillRect(22, 11, 3, 2);

      // Mouth (grim)
      ctx.fillStyle = '#a06040';
      ctx.fillRect(17, 15, 6, 1);

      // Neck (thick)
      ctx.fillStyle = skin;
      ctx.fillRect(16, 18, 8, 2);

      // Black leather jacket
      ctx.fillStyle = '#202020';
      ctx.fillRect(8, 20, 24, 18);

      // Jacket collar
      ctx.fillStyle = '#303030';
      ctx.fillRect(12, 20, 16, 3);

      // Jacket zipper / silver detail
      ctx.fillStyle = '#a0a0a0';
      ctx.fillRect(19, 23, 2, 15);

      // Jacket pocket chains
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(12, 28, 5, 1);
      ctx.fillRect(23, 28, 5, 1);

      // Muscular arms
      ctx.fillStyle = '#202020';
      ctx.fillRect(4, 21, 5, 14);
      ctx.fillRect(31, 21, 5, 14);

      // Exposed forearms (muscular)
      ctx.fillStyle = skin;
      ctx.fillRect(4, 32, 5, 4);
      ctx.fillRect(31, 32, 5, 4);

      // Fists
      ctx.fillStyle = skin;
      ctx.fillRect(5, 36, 4, 3);
      ctx.fillRect(32, 36, 4, 3);

      // Dark jeans
      ctx.fillStyle = '#283048';
      ctx.fillRect(10, 38, 20, 12);
      ctx.fillStyle = '#202840';
      ctx.fillRect(19, 41, 2, 9);

      // Black boots
      ctx.fillStyle = '#181818';
      ctx.fillRect(10, 50, 8, 5);
      ctx.fillRect(22, 50, 8, 5);
      ctx.fillStyle = '#101010';
      ctx.fillRect(10, 54, 8, 1);
      ctx.fillRect(22, 54, 8, 1);
    },
  },

  // 5. trainer_cue_ball - Bald, white muscle shirt, big arms, intimidating
  {
    key: 'trainer_cue_ball',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';

      // Bald head
      ctx.fillStyle = skin;
      ctx.fillRect(12, 2, 16, 16);
      ctx.fillRect(10, 4, 20, 12);

      // Eyebrow ridge (intimidating)
      ctx.fillStyle = '#d0a060';
      ctx.fillRect(13, 6, 14, 2);

      // Eyes (angry/narrow)
      ctx.fillStyle = '#303030';
      ctx.fillRect(15, 9, 3, 2);
      ctx.fillRect(22, 9, 3, 2);

      // Thick brows
      ctx.fillRect(14, 8, 5, 1);
      ctx.fillRect(21, 8, 5, 1);

      // Nose
      ctx.fillStyle = '#d8b070';
      ctx.fillRect(19, 11, 2, 2);

      // Mouth (frown)
      ctx.fillStyle = '#a06040';
      ctx.fillRect(16, 14, 8, 1);
      ctx.fillStyle = '#c08060';
      ctx.fillRect(17, 14, 6, 1);

      // Thick neck
      ctx.fillStyle = skin;
      ctx.fillRect(15, 18, 10, 3);

      // White muscle shirt
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(12, 21, 16, 14);

      // Shirt neckline
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(15, 21, 10, 2);

      // Big muscular arms (exposed)
      ctx.fillStyle = skin;
      ctx.fillRect(4, 21, 8, 14);
      ctx.fillRect(28, 21, 8, 14);

      // Arm muscle definition
      ctx.fillStyle = '#e0b070';
      ctx.fillRect(6, 25, 4, 1);
      ctx.fillRect(30, 25, 4, 1);

      // Fists
      ctx.fillStyle = skin;
      ctx.fillRect(5, 35, 5, 4);
      ctx.fillRect(30, 35, 5, 4);

      // Dark pants
      ctx.fillStyle = '#383838';
      ctx.fillRect(12, 35, 16, 14);
      ctx.fillStyle = '#303030';
      ctx.fillRect(19, 38, 2, 11);

      // Black boots
      ctx.fillStyle = '#202020';
      ctx.fillRect(12, 49, 7, 5);
      ctx.fillRect(21, 49, 7, 5);
      ctx.fillStyle = '#181818';
      ctx.fillRect(12, 53, 7, 2);
      ctx.fillRect(21, 53, 7, 2);
    },
  },

  // 6. trainer_juggler - Colorful red/yellow stripes, thin build, pokeballs near hands
  {
    key: 'trainer_juggler',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';

      // Hair (wild/messy, colorful)
      ctx.fillStyle = '#d04080';
      ctx.fillRect(13, 1, 14, 5);
      ctx.fillRect(11, 3, 18, 4);
      // Spiky bits
      ctx.fillRect(12, 0, 3, 2);
      ctx.fillRect(20, 0, 3, 2);
      ctx.fillRect(26, 1, 3, 2);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(14, 7, 12, 10);

      // Happy eyes
      ctx.fillStyle = '#303030';
      ctx.fillRect(16, 10, 3, 2);
      ctx.fillRect(22, 10, 3, 2);

      // Big grin
      ctx.fillStyle = '#c08060';
      ctx.fillRect(16, 14, 8, 2);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(17, 14, 6, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 17, 6, 2);

      // Colorful striped outfit - alternating red/yellow
      ctx.fillStyle = '#e02020';
      ctx.fillRect(12, 19, 16, 3);
      ctx.fillStyle = '#f0d020';
      ctx.fillRect(12, 22, 16, 3);
      ctx.fillStyle = '#e02020';
      ctx.fillRect(12, 25, 16, 3);
      ctx.fillStyle = '#f0d020';
      ctx.fillRect(12, 28, 16, 3);
      ctx.fillStyle = '#e02020';
      ctx.fillRect(12, 31, 16, 3);
      ctx.fillStyle = '#f0d020';
      ctx.fillRect(12, 34, 16, 3);

      // Thin arms (striped sleeves)
      ctx.fillStyle = '#e02020';
      ctx.fillRect(7, 20, 5, 4);
      ctx.fillRect(28, 20, 5, 4);
      ctx.fillStyle = '#f0d020';
      ctx.fillRect(7, 24, 5, 4);
      ctx.fillRect(28, 24, 5, 4);
      ctx.fillStyle = '#e02020';
      ctx.fillRect(6, 28, 5, 4);
      ctx.fillRect(29, 28, 5, 4);

      // Hands (raised for juggling)
      ctx.fillStyle = skin;
      ctx.fillRect(5, 26, 4, 3);
      ctx.fillRect(31, 26, 4, 3);

      // Pokeball-colored circles near hands (top half red, bottom white)
      // Left pokeball
      ctx.fillStyle = '#e03030';
      ctx.fillRect(2, 20, 4, 2);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(2, 22, 4, 2);
      ctx.fillStyle = '#303030';
      ctx.fillRect(2, 22, 4, 1);
      // Right pokeball
      ctx.fillStyle = '#e03030';
      ctx.fillRect(34, 20, 4, 2);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(34, 22, 4, 2);
      ctx.fillStyle = '#303030';
      ctx.fillRect(34, 22, 4, 1);
      // Top pokeball (being juggled)
      ctx.fillStyle = '#e03030';
      ctx.fillRect(18, 0, 4, 2);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(18, 2, 4, 2);

      // Pants (colorful)
      ctx.fillStyle = '#e02020';
      ctx.fillRect(14, 37, 12, 10);
      ctx.fillStyle = '#f0d020';
      ctx.fillRect(19, 37, 2, 10);

      // Shoes
      ctx.fillStyle = '#f0d020';
      ctx.fillRect(14, 47, 5, 4);
      ctx.fillRect(21, 47, 5, 4);
      ctx.fillStyle = '#e02020';
      ctx.fillRect(14, 50, 5, 2);
      ctx.fillRect(21, 50, 5, 2);
    },
  },

  // 7. trainer_tamer - Safari/pith hat, brown safari outfit, whip
  {
    key: 'trainer_tamer',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';

      // Pith/safari hat (tan)
      ctx.fillStyle = '#d8c088';
      ctx.fillRect(10, 1, 18, 5);
      ctx.fillRect(8, 3, 22, 4);
      // Hat brim (wider)
      ctx.fillStyle = '#c8b070';
      ctx.fillRect(6, 6, 26, 3);
      // Hat band
      ctx.fillStyle = '#806040';
      ctx.fillRect(10, 5, 18, 1);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 9, 14, 10);

      // Eyes (determined)
      ctx.fillStyle = '#404040';
      ctx.fillRect(15, 12, 3, 2);
      ctx.fillRect(22, 12, 3, 2);

      // Mouth
      ctx.fillStyle = '#c08060';
      ctx.fillRect(18, 16, 4, 1);

      // Stubble/jawline
      ctx.fillStyle = '#d8b878';
      ctx.fillRect(13, 17, 14, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 19, 6, 2);

      // Brown safari jacket
      ctx.fillStyle = '#907050';
      ctx.fillRect(10, 21, 20, 16);

      // Jacket collar
      ctx.fillStyle = '#a08060';
      ctx.fillRect(14, 21, 12, 2);

      // Chest pockets
      ctx.fillStyle = '#806040';
      ctx.fillRect(12, 25, 6, 4);
      ctx.fillRect(22, 25, 6, 4);
      // Pocket flaps
      ctx.fillStyle = '#a08060';
      ctx.fillRect(12, 25, 6, 1);
      ctx.fillRect(22, 25, 6, 1);

      // Belt
      ctx.fillStyle = '#604020';
      ctx.fillRect(10, 35, 20, 2);
      // Belt buckle
      ctx.fillStyle = '#c0a030';
      ctx.fillRect(18, 35, 4, 2);

      // Arms
      ctx.fillStyle = '#907050';
      ctx.fillRect(6, 22, 5, 12);
      ctx.fillRect(29, 22, 5, 12);

      // Hands
      ctx.fillStyle = skin;
      ctx.fillRect(7, 34, 4, 3);
      ctx.fillRect(30, 34, 4, 3);

      // Whip (thin line from right hand going right and down)
      ctx.fillStyle = '#503020';
      ctx.fillRect(34, 34, 2, 1);
      ctx.fillRect(35, 35, 2, 1);
      ctx.fillRect(36, 36, 2, 1);
      ctx.fillRect(37, 37, 2, 1);
      ctx.fillRect(37, 38, 1, 2);

      // Brown pants
      ctx.fillStyle = '#806848';
      ctx.fillRect(12, 37, 16, 10);
      ctx.fillStyle = '#705838';
      ctx.fillRect(19, 40, 2, 7);

      // Boots
      ctx.fillStyle = '#604020';
      ctx.fillRect(12, 47, 7, 6);
      ctx.fillRect(21, 47, 7, 6);
      ctx.fillStyle = '#503018';
      ctx.fillRect(12, 52, 7, 2);
      ctx.fillRect(21, 52, 7, 2);
    },
  },

  // 8. trainer_cooltrainer - Sporty headband, athletic red/white outfit, confident
  {
    key: 'trainer_cooltrainer',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';

      // Hair
      ctx.fillStyle = '#805030';
      ctx.fillRect(12, 1, 16, 6);
      ctx.fillRect(10, 3, 20, 5);

      // Red sporty headband
      ctx.fillStyle = '#e02020';
      ctx.fillRect(10, 5, 20, 3);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 8, 14, 10);

      // Confident eyes
      ctx.fillStyle = '#303030';
      ctx.fillRect(15, 11, 3, 2);
      ctx.fillRect(22, 11, 3, 2);

      // Smile (confident)
      ctx.fillStyle = '#c08060';
      ctx.fillRect(17, 15, 6, 1);
      ctx.fillRect(18, 16, 4, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 18, 6, 2);

      // Athletic top - red with white trim
      ctx.fillStyle = '#e02020';
      ctx.fillRect(10, 20, 20, 14);

      // White stripe down center
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(18, 20, 4, 14);

      // White collar
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(14, 20, 12, 2);

      // Athletic arms
      ctx.fillStyle = '#e02020';
      ctx.fillRect(6, 21, 5, 8);
      ctx.fillRect(29, 21, 5, 8);

      // Bare forearms
      ctx.fillStyle = skin;
      ctx.fillRect(6, 29, 5, 5);
      ctx.fillRect(29, 29, 5, 5);

      // Hands on hips (confident stance)
      ctx.fillStyle = skin;
      ctx.fillRect(8, 33, 3, 3);
      ctx.fillRect(29, 33, 3, 3);

      // White athletic shorts/pants
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(12, 34, 16, 8);
      // Red stripe on sides
      ctx.fillStyle = '#e02020';
      ctx.fillRect(12, 34, 2, 8);
      ctx.fillRect(26, 34, 2, 8);

      // Legs
      ctx.fillStyle = skin;
      ctx.fillRect(13, 42, 6, 6);
      ctx.fillRect(21, 42, 6, 6);

      // Sneakers
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(12, 48, 7, 5);
      ctx.fillRect(21, 48, 7, 5);
      // Sneaker accents
      ctx.fillStyle = '#e02020';
      ctx.fillRect(12, 50, 7, 2);
      ctx.fillRect(21, 50, 7, 2);
      // Soles
      ctx.fillStyle = '#808080';
      ctx.fillRect(12, 52, 7, 1);
      ctx.fillRect(21, 52, 7, 1);
    },
  },

  // 9. trainer_black_belt - White martial arts gi, black belt, red headband, bare feet
  {
    key: 'trainer_black_belt',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';

      // Red headband
      ctx.fillStyle = '#d02020';
      ctx.fillRect(10, 3, 20, 3);
      // Headband tails on right side
      ctx.fillRect(28, 2, 4, 2);
      ctx.fillRect(31, 1, 3, 2);
      ctx.fillRect(33, 0, 3, 2);

      // Hair (short, dark)
      ctx.fillStyle = '#303030';
      ctx.fillRect(12, 1, 16, 3);

      // Face (broad)
      ctx.fillStyle = skin;
      ctx.fillRect(12, 6, 16, 12);
      ctx.fillRect(10, 8, 20, 8);

      // Determined eyes
      ctx.fillStyle = '#303030';
      ctx.fillRect(14, 10, 4, 2);
      ctx.fillRect(22, 10, 4, 2);

      // Thick brows
      ctx.fillRect(14, 9, 4, 1);
      ctx.fillRect(22, 9, 4, 1);

      // Nose
      ctx.fillStyle = '#d8b070';
      ctx.fillRect(19, 12, 2, 2);

      // Mouth
      ctx.fillStyle = '#c08060';
      ctx.fillRect(17, 15, 6, 1);

      // Thick neck
      ctx.fillStyle = skin;
      ctx.fillRect(16, 18, 8, 2);

      // White gi top
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(8, 20, 24, 16);

      // Gi collar / V-shape
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(14, 20, 4, 8);
      ctx.fillRect(22, 20, 4, 8);
      ctx.fillRect(16, 20, 8, 4);

      // Black belt
      ctx.fillStyle = '#202020';
      ctx.fillRect(8, 34, 24, 3);
      // Belt knot on left side
      ctx.fillRect(10, 37, 3, 4);
      ctx.fillRect(8, 38, 3, 3);

      // Muscular arms (gi sleeves end at bicep)
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(4, 20, 5, 6);
      ctx.fillRect(31, 20, 5, 6);

      // Exposed muscular forearms
      ctx.fillStyle = skin;
      ctx.fillRect(4, 26, 5, 8);
      ctx.fillRect(31, 26, 5, 8);

      // Fists
      ctx.fillStyle = skin;
      ctx.fillRect(4, 34, 5, 3);
      ctx.fillRect(31, 34, 5, 3);

      // White gi pants
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(10, 37, 20, 12);
      // Pant leg split
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(19, 40, 2, 9);

      // Bare feet
      ctx.fillStyle = skin;
      ctx.fillRect(12, 49, 6, 5);
      ctx.fillRect(22, 49, 6, 5);
      // Toes
      ctx.fillStyle = '#e0b070';
      ctx.fillRect(12, 53, 6, 1);
      ctx.fillRect(22, 53, 6, 1);
    },
  },

  // 10. trainer_scientist - White lab coat, dark hair, glasses, clipboard
  {
    key: 'trainer_scientist',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';

      // Neat dark hair
      ctx.fillStyle = '#303030';
      ctx.fillRect(13, 2, 14, 6);
      ctx.fillRect(11, 4, 18, 4);
      // Hair parted neatly
      ctx.fillStyle = '#404040';
      ctx.fillRect(19, 2, 2, 4);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 8, 14, 10);

      // Glasses frames
      ctx.fillStyle = '#505050';
      ctx.fillRect(14, 11, 5, 3);
      ctx.fillRect(21, 11, 5, 3);
      // Bridge
      ctx.fillRect(19, 12, 2, 1);
      // Glasses lenses
      ctx.fillStyle = '#a0d0f0';
      ctx.fillRect(15, 12, 3, 2);
      ctx.fillRect(22, 12, 3, 2);

      // Mouth
      ctx.fillStyle = '#c08060';
      ctx.fillRect(18, 15, 4, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 18, 6, 2);

      // White lab coat
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(8, 20, 24, 22);

      // Lab coat collar
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(14, 20, 12, 3);

      // Shirt underneath (blue)
      ctx.fillStyle = '#4080c0';
      ctx.fillRect(16, 22, 8, 6);

      // Lab coat buttons
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(19, 28, 2, 2);
      ctx.fillRect(19, 32, 2, 2);
      ctx.fillRect(19, 36, 2, 2);

      // Coat pockets
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(10, 30, 6, 4);
      ctx.fillRect(24, 30, 6, 4);
      // Pen in pocket
      ctx.fillStyle = '#2040a0';
      ctx.fillRect(12, 29, 1, 5);
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(12, 29, 1, 1);

      // Arms (coat sleeves)
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(4, 21, 5, 14);
      ctx.fillRect(31, 21, 5, 14);

      // Left hand
      ctx.fillStyle = skin;
      ctx.fillRect(5, 35, 4, 3);

      // Right hand holding clipboard
      ctx.fillStyle = skin;
      ctx.fillRect(31, 35, 4, 3);
      // Clipboard
      ctx.fillStyle = '#a08060';
      ctx.fillRect(34, 30, 5, 10);
      ctx.fillStyle = '#f0f0e0';
      ctx.fillRect(35, 31, 3, 8);
      // Clipboard clip
      ctx.fillStyle = '#808080';
      ctx.fillRect(35, 30, 3, 2);

      // Gray pants
      ctx.fillStyle = '#808888';
      ctx.fillRect(12, 42, 16, 8);
      ctx.fillStyle = '#707878';
      ctx.fillRect(19, 42, 2, 8);

      // Black shoes
      ctx.fillStyle = '#202020';
      ctx.fillRect(12, 50, 7, 4);
      ctx.fillRect(21, 50, 7, 4);
      ctx.fillStyle = '#181818';
      ctx.fillRect(12, 53, 7, 1);
      ctx.fillRect(21, 53, 7, 1);
    },
  },

  // 11. trainer_burglar - Black mask, black/white striped shirt, dark pants, sneaky
  {
    key: 'trainer_burglar',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';

      // Dark beanie/cap
      ctx.fillStyle = '#202020';
      ctx.fillRect(12, 1, 16, 6);
      ctx.fillRect(10, 3, 20, 4);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 7, 14, 12);

      // Black mask over eyes (horizontal bar)
      ctx.fillStyle = '#101010';
      ctx.fillRect(10, 9, 20, 4);

      // Eyes visible through mask (white/gleaming)
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(15, 10, 3, 2);
      ctx.fillRect(22, 10, 3, 2);
      // Pupils
      ctx.fillStyle = '#202020';
      ctx.fillRect(16, 10, 2, 2);
      ctx.fillRect(23, 10, 2, 2);

      // Sneaky grin
      ctx.fillStyle = '#c08060';
      ctx.fillRect(16, 16, 8, 1);
      ctx.fillRect(17, 15, 6, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 19, 6, 2);

      // Horizontally striped shirt (black and white)
      ctx.fillStyle = '#101010';
      ctx.fillRect(10, 21, 20, 3);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(10, 24, 20, 3);
      ctx.fillStyle = '#101010';
      ctx.fillRect(10, 27, 20, 3);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(10, 30, 20, 3);
      ctx.fillStyle = '#101010';
      ctx.fillRect(10, 33, 20, 3);

      // Arms (same striped pattern)
      ctx.fillStyle = '#101010';
      ctx.fillRect(6, 21, 5, 3);
      ctx.fillRect(29, 21, 5, 3);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(6, 24, 5, 3);
      ctx.fillRect(29, 24, 5, 3);
      ctx.fillStyle = '#101010';
      ctx.fillRect(5, 27, 5, 3);
      ctx.fillRect(30, 27, 5, 3);

      // Hands (sneaky pose, slightly forward)
      ctx.fillStyle = skin;
      ctx.fillRect(4, 30, 4, 3);
      ctx.fillRect(32, 30, 4, 3);

      // Sack/loot bag in left hand
      ctx.fillStyle = '#907050';
      ctx.fillRect(1, 28, 5, 6);
      ctx.fillStyle = '#806040';
      ctx.fillRect(2, 27, 3, 1);

      // Dark pants
      ctx.fillStyle = '#303030';
      ctx.fillRect(12, 36, 16, 12);
      ctx.fillStyle = '#282828';
      ctx.fillRect(19, 38, 2, 10);

      // Dark shoes
      ctx.fillStyle = '#181818';
      ctx.fillRect(12, 48, 7, 5);
      ctx.fillRect(21, 48, 7, 5);
      ctx.fillStyle = '#101010';
      ctx.fillRect(12, 52, 7, 2);
      ctx.fillRect(21, 52, 7, 2);
    },
  },

  // 12. trainer_team_rocket - Black uniform, prominent red "R" on chest, black cap
  {
    key: 'trainer_team_rocket',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';

      // Black cap
      ctx.fillStyle = '#181818';
      ctx.fillRect(11, 1, 18, 5);
      ctx.fillRect(9, 3, 22, 4);
      // Cap brim
      ctx.fillStyle = '#101010';
      ctx.fillRect(9, 6, 22, 2);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(13, 8, 14, 10);

      // Eyes
      ctx.fillStyle = '#303030';
      ctx.fillRect(15, 11, 3, 2);
      ctx.fillRect(22, 11, 3, 2);

      // Mouth (smirk)
      ctx.fillStyle = '#c08060';
      ctx.fillRect(18, 15, 5, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(17, 18, 6, 2);

      // Black uniform top
      ctx.fillStyle = '#181818';
      ctx.fillRect(8, 20, 24, 18);

      // RED "R" on chest - prominent and clearly visible
      ctx.fillStyle = '#e02020';
      // R vertical stroke
      ctx.fillRect(14, 23, 3, 12);
      // R top horizontal
      ctx.fillRect(14, 23, 10, 3);
      // R bump (right side of top half)
      ctx.fillRect(21, 23, 3, 6);
      // R middle horizontal
      ctx.fillRect(14, 28, 10, 3);
      // R diagonal leg
      ctx.fillRect(20, 31, 3, 2);
      ctx.fillRect(22, 33, 3, 2);

      // Arms
      ctx.fillStyle = '#181818';
      ctx.fillRect(4, 21, 5, 14);
      ctx.fillRect(31, 21, 5, 14);

      // Gloves
      ctx.fillStyle = '#404040';
      ctx.fillRect(4, 33, 5, 4);
      ctx.fillRect(31, 33, 5, 4);

      // Black pants
      ctx.fillStyle = '#202020';
      ctx.fillRect(10, 38, 20, 12);
      ctx.fillStyle = '#181818';
      ctx.fillRect(19, 40, 2, 10);

      // Black boots
      ctx.fillStyle = '#101010';
      ctx.fillRect(10, 50, 8, 5);
      ctx.fillRect(22, 50, 8, 5);
      // Boot tops
      ctx.fillStyle = '#282828';
      ctx.fillRect(10, 48, 8, 2);
      ctx.fillRect(22, 48, 8, 2);
    },
  },

  // 13. trainer_boss - Giovanni: Black suit, slicked dark hair, confident
  {
    key: 'trainer_boss',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const skin = '#f8c888';

      // Slicked dark hair
      ctx.fillStyle = '#282828';
      ctx.fillRect(12, 1, 16, 6);
      ctx.fillRect(10, 2, 20, 6);
      // Hair swept back
      ctx.fillStyle = '#383838';
      ctx.fillRect(12, 1, 4, 2);

      // Face (strong jawline)
      ctx.fillStyle = skin;
      ctx.fillRect(12, 7, 16, 12);
      ctx.fillRect(10, 9, 20, 8);

      // Stern eyes
      ctx.fillStyle = '#303030';
      ctx.fillRect(14, 10, 4, 2);
      ctx.fillRect(22, 10, 4, 2);

      // Thick stern brows
      ctx.fillRect(14, 9, 4, 1);
      ctx.fillRect(22, 9, 4, 1);

      // Nose
      ctx.fillStyle = '#d8b070';
      ctx.fillRect(19, 12, 2, 2);

      // Confident mouth / slight smirk
      ctx.fillStyle = '#a06040';
      ctx.fillRect(17, 15, 6, 1);

      // Neck
      ctx.fillStyle = skin;
      ctx.fillRect(16, 19, 8, 2);

      // Black suit jacket
      ctx.fillStyle = '#181818';
      ctx.fillRect(8, 21, 24, 18);

      // Suit lapels
      ctx.fillStyle = '#282828';
      ctx.fillRect(12, 21, 6, 10);
      ctx.fillRect(22, 21, 6, 10);

      // White shirt underneath
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(16, 21, 8, 8);

      // Dark tie
      ctx.fillStyle = '#600020';
      ctx.fillRect(19, 23, 3, 12);
      // Tie knot
      ctx.fillStyle = '#800030';
      ctx.fillRect(18, 22, 4, 2);

      // Suit pocket (left breast)
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(12, 25, 3, 1);

      // Arms (suit sleeves)
      ctx.fillStyle = '#181818';
      ctx.fillRect(4, 22, 5, 14);
      ctx.fillRect(31, 22, 5, 14);

      // Hands
      ctx.fillStyle = skin;
      ctx.fillRect(5, 36, 4, 3);
      ctx.fillRect(32, 36, 4, 3);

      // Black suit pants
      ctx.fillStyle = '#181818';
      ctx.fillRect(10, 39, 20, 10);
      // Pant crease
      ctx.fillStyle = '#202020';
      ctx.fillRect(19, 39, 2, 10);

      // Polished black shoes
      ctx.fillStyle = '#101010';
      ctx.fillRect(10, 49, 8, 5);
      ctx.fillRect(22, 49, 8, 5);
      // Shoe shine
      ctx.fillStyle = '#303030';
      ctx.fillRect(12, 50, 4, 1);
      ctx.fillRect(24, 50, 4, 1);
    },
  },

  // 14. trainer_default - Generic dark gray silhouette of a person shape
  {
    key: 'trainer_default',
    draw: (ctx: CanvasRenderingContext2D, _w: number, _h: number) => {
      const dark = '#383838';
      const mid = '#484848';

      // Head (round silhouette)
      ctx.fillStyle = dark;
      ctx.fillRect(14, 2, 12, 4);
      ctx.fillRect(12, 4, 16, 10);
      ctx.fillRect(14, 14, 12, 2);

      // Slight highlight for depth
      ctx.fillStyle = mid;
      ctx.fillRect(16, 6, 8, 6);

      // Neck
      ctx.fillStyle = dark;
      ctx.fillRect(17, 16, 6, 3);

      // Shoulders and torso
      ctx.fillStyle = dark;
      ctx.fillRect(8, 19, 24, 20);

      // Slight body highlight
      ctx.fillStyle = mid;
      ctx.fillRect(14, 22, 12, 14);

      // Arms
      ctx.fillStyle = dark;
      ctx.fillRect(4, 20, 5, 16);
      ctx.fillRect(31, 20, 5, 16);

      // Hands
      ctx.fillStyle = dark;
      ctx.fillRect(5, 36, 4, 3);
      ctx.fillRect(31, 36, 4, 3);

      // Legs
      ctx.fillStyle = dark;
      ctx.fillRect(10, 39, 8, 12);
      ctx.fillRect(22, 39, 8, 12);

      // Leg highlight
      ctx.fillStyle = mid;
      ctx.fillRect(12, 40, 4, 10);
      ctx.fillRect(24, 40, 4, 10);

      // Gap between legs
      ctx.fillStyle = '#000000';
      ctx.fillRect(18, 42, 4, 9);

      // Feet
      ctx.fillStyle = dark;
      ctx.fillRect(9, 51, 9, 4);
      ctx.fillRect(22, 51, 9, 4);
    },
  },
];
