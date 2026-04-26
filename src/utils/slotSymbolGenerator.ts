// Generates 16x16 pixel-art textures for the Game Corner slot machine reels.
// Each symbol uses the existing GB-style palette to match the game's aesthetic.

const SYM_SIZE = 16;

type DrawFn = (ctx: CanvasRenderingContext2D) => void;

function makeCanvas(draw: DrawFn): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SYM_SIZE;
  canvas.height = SYM_SIZE;
  const ctx = canvas.getContext('2d')!;
  draw(ctx);
  return canvas;
}

function px(ctx: CanvasRenderingContext2D, color: string, points: ReadonlyArray<readonly [number, number]>): void {
  ctx.fillStyle = color;
  for (const [x, y] of points) ctx.fillRect(x, y, 1, 1);
}

function rect(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ── SEVEN: bold red "7" with darker shadow ───────────────────────────────────
const drawSeven: DrawFn = (ctx) => {
  const RED = '#c84830';
  const DARK = '#383838';
  // top bar of the 7 (drop shadow row first)
  rect(ctx, DARK, 3, 3, 11, 2);
  rect(ctx, RED, 3, 2, 10, 2);
  // diagonal stem
  px(ctx, DARK, [[11, 5], [10, 6], [10, 7], [9, 7], [9, 8], [8, 9], [8, 10], [7, 11], [7, 12], [6, 13]]);
  px(ctx, RED, [[10, 4], [10, 5], [9, 5], [9, 6], [8, 7], [8, 8], [7, 9], [7, 10], [6, 11], [6, 12]]);
  // crossbar (decorative)
  rect(ctx, RED, 6, 7, 4, 1);
  rect(ctx, DARK, 6, 8, 4, 1);
};

// ── PIKACHU: round yellow head with black ear tips and red cheek ─────────────
const drawPikachu: DrawFn = (ctx) => {
  const Y = '#f8d030';
  const D = '#383838';
  const R = '#c84830';
  const SH = '#a87808';

  // Ears
  rect(ctx, Y, 3, 1, 2, 5);
  rect(ctx, Y, 11, 1, 2, 5);
  px(ctx, D, [[3, 1], [4, 0], [11, 0], [12, 1]]);
  rect(ctx, D, 3, 1, 2, 2); // black ear tips
  rect(ctx, D, 11, 1, 2, 2);

  // Head (round)
  rect(ctx, Y, 4, 5, 8, 8);
  rect(ctx, Y, 3, 6, 10, 6);
  rect(ctx, Y, 5, 4, 6, 1);
  rect(ctx, Y, 5, 13, 6, 1);

  // Outline
  px(ctx, D, [
    [4, 4], [10, 4],
    [3, 5], [11, 5],
    [2, 6], [12, 6],
    [2, 7], [12, 7],
    [2, 8], [12, 8],
    [2, 9], [12, 9],
    [2, 10], [12, 10],
    [3, 11], [11, 11],
    [4, 12], [10, 12],
    [5, 13], [6, 13], [7, 13], [8, 13], [9, 13],
    [5, 14], [9, 14],
  ]);

  // Eyes
  px(ctx, D, [[5, 8], [10, 8]]);
  // Nose / mouth
  px(ctx, D, [[7, 9], [8, 9], [7, 10], [8, 10]]);

  // Red cheeks
  rect(ctx, R, 3, 9, 2, 2);
  rect(ctx, R, 11, 9, 2, 2);

  // Subtle shading under chin
  px(ctx, SH, [[6, 12], [9, 12]]);
};

// ── JIGGLY: pink round body with tuft and dot eyes ───────────────────────────
const drawJiggly: DrawFn = (ctx) => {
  const P = '#f8a8c0';
  const D = '#383838';
  const SH = '#c87890';

  rect(ctx, P, 4, 3, 8, 10);
  rect(ctx, P, 3, 4, 10, 8);
  rect(ctx, P, 5, 2, 6, 1);
  rect(ctx, P, 5, 13, 6, 1);

  // Outline
  px(ctx, D, [
    [5, 1], [6, 1], [9, 1], [10, 1],
    [4, 2], [11, 2],
    [3, 3], [12, 3],
    [2, 4], [13, 4],
    [2, 5], [13, 5],
    [2, 6], [13, 6],
    [2, 7], [13, 7],
    [2, 8], [13, 8],
    [2, 9], [13, 9],
    [2, 10], [13, 10],
    [3, 11], [12, 11],
    [4, 12], [11, 12],
    [5, 13], [10, 13],
    [6, 14], [7, 14], [8, 14], [9, 14],
  ]);

  // Tuft (curl of hair)
  px(ctx, P, [[7, 1], [8, 1]]);
  px(ctx, D, [[7, 0], [8, 0]]);

  // Eyes (large with white)
  rect(ctx, D, 5, 6, 2, 3);
  rect(ctx, D, 9, 6, 2, 3);
  px(ctx, '#f8f8f8', [[6, 7], [10, 7]]);

  // Mouth
  px(ctx, D, [[7, 11], [8, 11]]);

  // Cheek shading
  px(ctx, SH, [[3, 8], [12, 8]]);
};

// ── ODDISH: blue dome with green leaves ──────────────────────────────────────
const drawOddish: DrawFn = (ctx) => {
  const B = '#6088c0';
  const G = '#88c070';
  const G2 = '#609050';
  const D = '#383838';

  // Body (round blue)
  rect(ctx, B, 4, 7, 8, 6);
  rect(ctx, B, 3, 8, 10, 4);
  rect(ctx, B, 5, 6, 6, 1);
  rect(ctx, B, 5, 13, 6, 1);

  // Outline
  px(ctx, D, [
    [4, 5], [11, 5],
    [3, 6], [12, 6],
    [2, 7], [13, 7],
    [2, 8], [13, 8],
    [2, 9], [13, 9],
    [2, 10], [13, 10],
    [2, 11], [13, 11],
    [3, 12], [12, 12],
    [4, 13], [11, 13],
    [5, 14], [6, 14], [7, 14], [8, 14], [9, 14], [10, 14],
  ]);

  // Eyes
  px(ctx, D, [[5, 9], [10, 9]]);
  // Mouth
  px(ctx, D, [[7, 11], [8, 11]]);

  // Leaves on top (5-leaf crown)
  px(ctx, G, [
    [7, 0], [8, 0],
    [6, 1], [7, 1], [8, 1], [9, 1],
    [3, 2], [4, 2], [7, 2], [8, 2], [11, 2], [12, 2],
    [2, 3], [3, 3], [4, 3], [11, 3], [12, 3], [13, 3],
    [3, 4], [12, 4],
  ]);
  px(ctx, G2, [
    [7, 3], [8, 3],
    [6, 4], [7, 4], [8, 4], [9, 4],
    [4, 4], [11, 4],
  ]);
};

// ── PSYDUCK: yellow duck with beak and stripe ────────────────────────────────
const drawPsyduck: DrawFn = (ctx) => {
  const Y = '#f8d030';
  const O = '#f0a060';
  const D = '#383838';

  // Head
  rect(ctx, Y, 4, 4, 8, 8);
  rect(ctx, Y, 3, 5, 10, 6);
  rect(ctx, Y, 5, 3, 6, 1);
  rect(ctx, Y, 5, 12, 6, 1);

  // Outline
  px(ctx, D, [
    [4, 2], [11, 2],
    [4, 3], [11, 3],
    [3, 4], [12, 4],
    [2, 5], [13, 5],
    [2, 6], [13, 6],
    [2, 7], [13, 7],
    [2, 8], [13, 8],
    [2, 9], [13, 9],
    [3, 10], [12, 10],
    [4, 11], [11, 11],
    [5, 12], [10, 12],
    [6, 13], [7, 13], [8, 13], [9, 13],
  ]);

  // 3-strand "headache" hairs
  px(ctx, D, [[5, 1], [7, 0], [9, 1], [5, 2], [7, 1], [9, 2]]);

  // Eyes (small dots, close together = silly)
  px(ctx, D, [[6, 6], [9, 6]]);

  // Beak
  rect(ctx, O, 6, 8, 4, 2);
  px(ctx, D, [[6, 8], [9, 8], [6, 9], [9, 9], [7, 10], [8, 10]]);
};

// ── CHERRY: classic twin cherries with stems and a leaf ──────────────────────
const drawCherry: DrawFn = (ctx) => {
  const R = '#c84830';
  const R2 = '#883020';
  const G = '#88c070';
  const D = '#383838';
  const HL = '#f8a890';

  // Left cherry
  rect(ctx, R, 3, 9, 4, 4);
  rect(ctx, R, 2, 10, 6, 2);
  px(ctx, D, [
    [3, 8], [4, 8], [5, 8], [6, 8],
    [2, 9], [7, 9],
    [1, 10], [8, 10],
    [1, 11], [8, 11],
    [2, 12], [7, 12],
    [3, 13], [4, 13], [5, 13], [6, 13],
  ]);
  px(ctx, HL, [[3, 10]]);
  px(ctx, R2, [[6, 12]]);

  // Right cherry
  rect(ctx, R, 9, 10, 4, 4);
  rect(ctx, R, 8, 11, 6, 2);
  px(ctx, D, [
    [9, 9], [10, 9], [11, 9], [12, 9],
    [8, 10], [13, 10],
    [7, 11], [14, 11],
    [7, 12], [14, 12],
    [8, 13], [13, 13],
    [9, 14], [10, 14], [11, 14], [12, 14],
  ]);
  px(ctx, HL, [[9, 11]]);
  px(ctx, R2, [[12, 13]]);

  // Stems converging at top
  px(ctx, D, [
    [5, 7], [6, 6], [7, 5], [8, 4],
    [10, 8], [9, 7], [8, 6], [8, 5],
  ]);

  // Leaf (top-right)
  px(ctx, G, [
    [9, 3], [10, 3], [11, 3],
    [10, 2], [11, 2], [12, 2],
    [11, 1],
  ]);
  px(ctx, D, [[8, 3], [9, 4], [10, 4], [12, 3], [13, 2]]);
};

// ── BAR: filled black "BAR" plate with white text ────────────────────────────
const drawBar: DrawFn = (ctx) => {
  const D = '#383838';
  const W = '#f8f8f8';

  // Plate
  rect(ctx, D, 1, 4, 14, 8);
  // Inner highlight
  rect(ctx, '#585858', 2, 5, 12, 1);

  // "B"
  px(ctx, W, [
    [3, 6], [4, 6], [5, 6],
    [3, 7], [5, 7],
    [3, 8], [4, 8], [5, 8],
    [3, 9], [5, 9],
    [3, 10], [4, 10], [5, 10],
  ]);
  // "A"
  px(ctx, W, [
    [7, 6], [8, 6],
    [7, 7], [9, 7],
    [7, 8], [8, 8], [9, 8],
    [7, 9], [9, 9],
    [7, 10], [9, 10],
  ]);
  // "R"
  px(ctx, W, [
    [11, 6], [12, 6],
    [11, 7], [13, 7],
    [11, 8], [12, 8],
    [11, 9], [12, 9],
    [11, 10], [13, 10],
  ]);

  // Plate border
  px(ctx, '#181818', [
    [0, 4], [15, 4], [0, 11], [15, 11],
    [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10],
    [15, 5], [15, 6], [15, 7], [15, 8], [15, 9], [15, 10],
  ]);
};

// ── REPLAY: curved arrow icon ────────────────────────────────────────────────
const drawReplay: DrawFn = (ctx) => {
  const D = '#383838';
  const Y = '#f8d030';

  // Curved arrow body (clockwise loop with arrowhead pointing right)
  px(ctx, D, [
    // top arc
    [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3],
    [4, 4], [11, 4],
    [3, 5], [12, 5],
    [3, 6], [12, 6],
    // right side narrows down
    [3, 7],
    // bottom arc opening (left side opens for the tail)
    [4, 8], [5, 8], [6, 8], [7, 8], [8, 8],
  ]);
  // inner highlight (yellow dot on the arrow head)
  px(ctx, Y, [[10, 4], [11, 5]]);

  // Arrow head pointing down on the right
  px(ctx, D, [
    [10, 6], [11, 7], [12, 7], [13, 7],
    [11, 8], [12, 8], [13, 8],
    [12, 9],
  ]);

  // Tail of the arrow (label "R" implied)
  px(ctx, D, [
    [5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11],
    [5, 12], [10, 12],
    [5, 13], [6, 13], [7, 13], [10, 13],
    [5, 14], [8, 14], [10, 14],
  ]);
};

const SYMBOLS: Array<{ key: string; draw: DrawFn }> = [
  { key: 'slot_seven', draw: drawSeven },
  { key: 'slot_pikachu', draw: drawPikachu },
  { key: 'slot_jiggly', draw: drawJiggly },
  { key: 'slot_oddish', draw: drawOddish },
  { key: 'slot_psyduck', draw: drawPsyduck },
  { key: 'slot_cherry', draw: drawCherry },
  { key: 'slot_bar', draw: drawBar },
  { key: 'slot_replay', draw: drawReplay },
];

export function generateSlotSymbolSprites(scene: Phaser.Scene): void {
  for (const { key, draw } of SYMBOLS) {
    if (scene.textures.exists(key)) continue;
    const canvas = makeCanvas(draw);
    scene.textures.addCanvas(key, canvas);
  }
}

export const SLOT_SYMBOL_TEXTURE: Record<string, string> = {
  SEVEN: 'slot_seven',
  PIKACHU: 'slot_pikachu',
  JIGGLY: 'slot_jiggly',
  ODDISH: 'slot_oddish',
  PSYDUCK: 'slot_psyduck',
  CHERRY: 'slot_cherry',
  BAR: 'slot_bar',
  REPLAY: 'slot_replay',
};
