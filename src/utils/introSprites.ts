import Phaser from 'phaser';

// Procedural intro sprites for the Pokemon Yellow-style attract sequence.
// Every texture is drawn onto a canvas and registered with the scene.
//
// Palette (matches the rest of the game's Pikachu art):
//   yellow       #f8d030    shadow yellow #d8a018
//   outline      #202020    belly light  #f8e878
//   red cheeks   #e03030    gold accent  #c0a020
//   claude tan   #cc785c    claude ink   #1f1c18

type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

interface IntroSprite {
  key: string;
  width: number;
  height: number;
  draw: DrawFn;
}

// ── Helper: draw a solid outlined pixel shape ──────────────
function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ── Claude logo ─────────────────────────────────────────────
// 6-arm burst mark centered above a chunky CLAUDE wordmark.
// Canvas: 120×72, burst at top center, text centered below.
function drawClaudeLogo(ctx: CanvasRenderingContext2D): void {
  const TAN = '#cc785c';
  const TAN_HI = '#e09070';
  const TAN_DARK = '#8a4328';
  const INK = '#1f1c18';

  const CANVAS_W = 120;

  // ── Burst mark ────────────────────────────────────
  // Centered at (60, 22). Arms ~16px long, thick.
  const cx = 60;
  const cy = 22;

  // Vertical arm (shortest — gives the mark a distinct shape)
  rect(ctx, cx - 2, cy - 14, 5, 28, TAN);
  rect(ctx, cx - 1, cy - 16, 3, 32, TAN);

  // Horizontal arm (medium)
  rect(ctx, cx - 16, cy - 2, 32, 5, TAN);
  rect(ctx, cx - 18, cy - 1, 36, 3, TAN);

  // Two diagonal arms (NE/SW and NW/SE), stair-stepped
  for (let i = -14; i <= 14; i++) {
    const slope = Math.round(i * 0.55);
    // NE↘SW
    rect(ctx, cx + i - 1, cy + slope - 1, 3, 3, TAN);
    // NW↘SE
    rect(ctx, cx + i - 1, cy - slope - 1, 3, 3, TAN);
  }

  // Darker inner ring to give depth
  rect(ctx, cx - 4, cy - 4, 9, 9, TAN_DARK);
  rect(ctx, cx - 3, cy - 3, 7, 7, TAN);
  // Bright center pip
  rect(ctx, cx - 1, cy - 1, 3, 3, TAN_HI);

  // ── "CLAUDE" wordmark (7×9 pixel glyphs) ──────────
  const letters: Record<string, number[][]> = {
    C: [
      [0,1,1,1,1,1,0],
      [1,1,1,0,0,1,1],
      [1,1,0,0,0,0,0],
      [1,1,0,0,0,0,0],
      [1,1,0,0,0,0,0],
      [1,1,0,0,0,0,0],
      [1,1,0,0,0,0,0],
      [1,1,1,0,0,1,1],
      [0,1,1,1,1,1,0],
    ],
    L: [
      [1,1,1,0,0,0,0],
      [0,1,1,0,0,0,0],
      [0,1,1,0,0,0,0],
      [0,1,1,0,0,0,0],
      [0,1,1,0,0,0,0],
      [0,1,1,0,0,0,0],
      [0,1,1,0,0,0,0],
      [0,1,1,0,0,0,0],
      [1,1,1,1,1,1,1],
    ],
    A: [
      [0,0,1,1,1,0,0],
      [0,1,1,1,1,1,0],
      [1,1,1,0,1,1,1],
      [1,1,0,0,0,1,1],
      [1,1,0,0,0,1,1],
      [1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1],
      [1,1,0,0,0,1,1],
      [1,1,0,0,0,1,1],
    ],
    U: [
      [1,1,1,0,0,1,1],
      [1,1,1,0,0,1,1],
      [1,1,0,0,0,1,1],
      [1,1,0,0,0,1,1],
      [1,1,0,0,0,1,1],
      [1,1,0,0,0,1,1],
      [1,1,0,0,0,1,1],
      [1,1,1,0,1,1,1],
      [0,1,1,1,1,1,0],
    ],
    D: [
      [1,1,1,1,1,0,0],
      [1,1,1,1,1,1,0],
      [1,1,0,0,1,1,1],
      [1,1,0,0,0,1,1],
      [1,1,0,0,0,1,1],
      [1,1,0,0,0,1,1],
      [1,1,0,0,1,1,1],
      [1,1,1,1,1,1,0],
      [1,1,1,1,1,0,0],
    ],
    E: [
      [1,1,1,1,1,1,1],
      [1,1,0,0,0,0,0],
      [1,1,0,0,0,0,0],
      [1,1,0,0,0,0,0],
      [1,1,1,1,1,1,0],
      [1,1,0,0,0,0,0],
      [1,1,0,0,0,0,0],
      [1,1,0,0,0,0,0],
      [1,1,1,1,1,1,1],
    ],
  };

  const word = 'CLAUDE';
  const glyphW = 7;
  const glyphH = 9;
  const spacing = 2;
  const totalW = word.length * glyphW + (word.length - 1) * spacing;
  const startX = Math.round((CANVAS_W - totalW) / 2);
  const startY = 50;

  for (let i = 0; i < word.length; i++) {
    const glyph = letters[word[i]];
    if (!glyph) continue;
    const charX = startX + i * (glyphW + spacing);
    // Subtle tan shadow behind the ink (1px down/right)
    for (let r = 0; r < glyphH; r++) {
      for (let c = 0; c < glyphW; c++) {
        if (glyph[r][c]) rect(ctx, charX + c + 1, startY + r + 1, 1, 1, TAN);
      }
    }
    // Ink body
    for (let r = 0; r < glyphH; r++) {
      for (let c = 0; c < glyphW; c++) {
        if (glyph[r][c]) rect(ctx, charX + c, startY + r, 1, 1, INK);
      }
    }
  }
}

// ── Stars ───────────────────────────────────────────────────
function drawBigStar(ctx: CanvasRenderingContext2D): void {
  // 12×12 cross-shaped sparkle star (white with yellow core)
  const W = '#ffffff';
  const Y = '#f8e878';
  // Long arms
  rect(ctx, 5, 0, 2, 12, W);
  rect(ctx, 0, 5, 12, 2, W);
  // Diagonal glints
  rect(ctx, 2, 2, 1, 1, W);
  rect(ctx, 9, 2, 1, 1, W);
  rect(ctx, 2, 9, 1, 1, W);
  rect(ctx, 9, 9, 1, 1, W);
  // Yellow core
  rect(ctx, 4, 4, 4, 4, Y);
  rect(ctx, 5, 3, 2, 6, Y);
  rect(ctx, 3, 5, 6, 2, Y);
}

function drawTinyStar(ctx: CanvasRenderingContext2D): void {
  // 4×4 plus-shaped star, drawn in white; tinted at render time.
  rect(ctx, 1, 0, 2, 4, '#ffffff');
  rect(ctx, 0, 1, 4, 2, '#ffffff');
}

// ── Pikachu silhouettes ────────────────────────────────────
function drawPikaSilhouetteFar(frame: 0 | 1): DrawFn {
  // 16×16 tiny black silhouette, 2-frame run cycle
  return (ctx) => {
    const K = '#202020';
    // Body
    rect(ctx, 5, 7, 6, 5, K);
    rect(ctx, 4, 8, 8, 3, K);
    // Head
    rect(ctx, 5, 5, 6, 3, K);
    // Ears (tall)
    rect(ctx, 5, 2, 2, 4, K);
    rect(ctx, 9, 2, 2, 4, K);
    // Tail (lightning bolt shape)
    rect(ctx, 11, 7, 2, 2, K);
    rect(ctx, 12, 5, 2, 2, K);
    rect(ctx, 13, 3, 2, 2, K);
    // Legs alternate with frame
    if (frame === 0) {
      rect(ctx, 5, 12, 2, 3, K);
      rect(ctx, 9, 12, 2, 2, K);
    } else {
      rect(ctx, 5, 12, 2, 2, K);
      rect(ctx, 9, 12, 2, 3, K);
    }
  };
}

function drawPikaSilhouetteMid(frame: 0 | 1): DrawFn {
  // 24×32 red silhouette with lightning bolt above head, 2 frames
  return (ctx) => {
    const R = '#d02020';
    // Lightning bolt above
    rect(ctx, 11, 0, 3, 2, R);
    rect(ctx, 12, 1, 4, 2, R);
    rect(ctx, 10, 3, 4, 2, R);
    rect(ctx, 12, 4, 3, 2, R);
    // Head
    rect(ctx, 6, 10, 12, 6, R);
    rect(ctx, 5, 12, 14, 4, R);
    // Ears
    rect(ctx, 5, 6, 3, 6, R);
    rect(ctx, 16, 6, 3, 6, R);
    // Body
    rect(ctx, 6, 16, 12, 7, R);
    rect(ctx, 4, 18, 16, 4, R);
    // Arms
    rect(ctx, 2, 18, 3, 3, R);
    rect(ctx, 19, 18, 3, 3, R);
    // Tail
    rect(ctx, 19, 13, 3, 3, R);
    rect(ctx, 21, 10, 3, 3, R);
    // Alternating legs
    if (frame === 0) {
      rect(ctx, 6, 23, 3, 5, R);
      rect(ctx, 14, 23, 4, 4, R);
      rect(ctx, 5, 27, 5, 2, R);
    } else {
      rect(ctx, 6, 23, 4, 4, R);
      rect(ctx, 14, 23, 3, 5, R);
      rect(ctx, 14, 27, 5, 2, R);
    }
  };
}

// ── Pikachu flying karate kick ─────────────────────────────
// 48×48 canvas. Pose faces RIGHT with kicking leg extended forward-right,
// tail trailing behind-left. Scene flips X to mirror for left-moving motion.
function drawPikaJump(ctx: CanvasRenderingContext2D): void {
  const Y = '#f8d030';
  const YD = '#c89020';
  const K = '#202020';
  const R = '#e03030';
  const W = '#ffffff';
  const BELLY = '#f8e878';

  // Tail trailing behind (far left side, lightning-bolt shape)
  rect(ctx, 0, 18, 5, 4, Y);
  rect(ctx, 3, 14, 5, 5, YD);
  rect(ctx, 0, 10, 5, 4, YD);
  rect(ctx, 5, 16, 4, 4, Y);

  // Body (compact, angled forward)
  rect(ctx, 12, 16, 18, 16, Y);
  rect(ctx, 10, 18, 22, 12, Y);
  rect(ctx, 14, 20, 14, 10, BELLY);

  // Ears (laid back due to speed)
  rect(ctx, 10, 6, 4, 10, Y);
  rect(ctx, 10, 6, 4, 4, K);
  rect(ctx, 16, 4, 4, 12, Y);
  rect(ctx, 16, 4, 4, 4, K);

  // Head (upper-left of body)
  rect(ctx, 13, 10, 14, 2, K);
  rect(ctx, 11, 12, 18, 2, K);
  rect(ctx, 12, 14, 16, 6, Y);

  // Eye (one visible, determined yell expression)
  rect(ctx, 17, 14, 3, 3, K);
  rect(ctx, 18, 14, 1, 1, W);
  // Eyebrow (angry/determined)
  rect(ctx, 16, 13, 4, 1, K);

  // Cheek (glowing red)
  rect(ctx, 11, 16, 3, 3, R);

  // Mouth wide open (yelling "PIKAAA!")
  rect(ctx, 22, 16, 5, 3, K);
  rect(ctx, 23, 17, 3, 1, R);

  // Back arm (pulled back for balance)
  rect(ctx, 8, 22, 5, 4, Y);
  rect(ctx, 6, 23, 3, 3, Y);

  // Front arm (punched forward across body)
  rect(ctx, 26, 20, 7, 4, Y);
  rect(ctx, 32, 21, 4, 3, Y);
  rect(ctx, 35, 22, 2, 2, K); // fist outline

  // Back leg tucked under body
  rect(ctx, 14, 30, 6, 6, Y);
  rect(ctx, 12, 34, 8, 4, YD);

  // KICK LEG extended forward-right (the karate kick!)
  rect(ctx, 28, 30, 10, 5, Y);
  rect(ctx, 34, 28, 8, 6, Y);
  rect(ctx, 38, 27, 8, 5, Y);
  rect(ctx, 42, 26, 6, 5, Y);
  // Foot/sole
  rect(ctx, 42, 30, 6, 3, YD);
  rect(ctx, 44, 31, 4, 2, K);
}

// ── Big yellow Pikachu running toward us (medium closeness) ─
function drawPikaRunNear(frame: 0 | 1): DrawFn {
  return (ctx) => {
    const Y = '#f8d030';
    const YD = '#d89820';
    const K = '#202020';
    const R = '#e03030';
    const W = '#ffffff';
    const BELLY = '#f8e878';

    // Ears
    rect(ctx, 14, 4, 5, 14, Y);
    rect(ctx, 45, 4, 5, 14, Y);
    rect(ctx, 14, 2, 5, 5, K);
    rect(ctx, 45, 2, 5, 5, K);

    // Head outline + fill
    rect(ctx, 18, 10, 28, 2, K);
    rect(ctx, 15, 12, 34, 2, K);
    rect(ctx, 16, 14, 32, 12, Y);
    rect(ctx, 14, 16, 36, 8, Y);

    // Eyes
    rect(ctx, 21, 18, 5, 4, K);
    rect(ctx, 38, 18, 5, 4, K);
    rect(ctx, 22, 19, 2, 2, W);
    rect(ctx, 39, 19, 2, 2, W);
    // Mouth (tiny grin)
    rect(ctx, 30, 24, 4, 1, K);
    rect(ctx, 31, 25, 2, 1, K);
    // Cheeks
    rect(ctx, 14, 21, 5, 4, R);
    rect(ctx, 45, 21, 5, 4, R);

    // Body
    rect(ctx, 16, 28, 32, 18, Y);
    rect(ctx, 14, 32, 36, 12, Y);
    rect(ctx, 20, 32, 24, 14, BELLY);

    // Arms
    rect(ctx, 8, 32, 8, 5, Y);
    rect(ctx, 48, 32, 8, 5, Y);

    // Tail (lightning bolt, right side)
    rect(ctx, 48, 20, 4, 4, YD);
    rect(ctx, 52, 16, 4, 6, YD);
    rect(ctx, 56, 12, 4, 6, YD);

    // Alternating legs
    if (frame === 0) {
      rect(ctx, 18, 46, 8, 10, Y);
      rect(ctx, 38, 46, 8, 10, Y);
      rect(ctx, 16, 54, 12, 4, K);
      rect(ctx, 36, 56, 12, 4, K);
    } else {
      rect(ctx, 18, 46, 8, 10, Y);
      rect(ctx, 38, 46, 8, 10, Y);
      rect(ctx, 16, 56, 12, 4, K);
      rect(ctx, 36, 54, 12, 4, K);
    }
  };
}

// ── Pikachu on a surfboard ─────────────────────────────────
function drawPikaSurf(ctx: CanvasRenderingContext2D): void {
  const Y = '#f8d030';
  const K = '#202020';
  const R = '#e03030';
  const W = '#ffffff';
  const BELLY = '#f8e878';
  const BOARD = '#70b0f8';
  const BOARD_D = '#2860a0';

  // Surfboard (curved)
  rect(ctx, 8, 30, 40, 4, BOARD);
  rect(ctx, 6, 31, 44, 3, BOARD);
  rect(ctx, 10, 34, 36, 3, BOARD_D);
  rect(ctx, 14, 28, 28, 2, BOARD);

  // Pikachu body sitting on board
  // Ears
  rect(ctx, 17, 1, 4, 10, Y);
  rect(ctx, 33, 1, 4, 10, Y);
  rect(ctx, 17, 1, 4, 3, K);
  rect(ctx, 33, 1, 4, 3, K);

  // Head
  rect(ctx, 19, 8, 18, 10, Y);
  rect(ctx, 17, 10, 22, 6, Y);

  // Eyes: mostly black with a single-pixel catchlight
  rect(ctx, 21, 11, 4, 4, K);
  rect(ctx, 31, 11, 4, 4, K);
  rect(ctx, 22, 12, 1, 1, W);
  rect(ctx, 32, 12, 1, 1, W);

  // Cheeks
  rect(ctx, 17, 14, 3, 3, R);
  rect(ctx, 36, 14, 3, 3, R);

  // Mouth (happy open smile)
  rect(ctx, 26, 16, 4, 2, K);
  rect(ctx, 27, 17, 2, 1, R);

  // Body sitting
  rect(ctx, 19, 18, 18, 10, Y);
  rect(ctx, 22, 20, 12, 8, BELLY);
  rect(ctx, 17, 22, 22, 6, Y);

  // Arms out like "whee!"
  rect(ctx, 8, 20, 9, 4, Y);
  rect(ctx, 6, 18, 5, 3, Y);
  rect(ctx, 39, 20, 9, 4, Y);
  rect(ctx, 45, 18, 5, 3, Y);

  // Tail up behind
  rect(ctx, 38, 14, 4, 3, Y);
  rect(ctx, 41, 10, 4, 4, Y);
  rect(ctx, 38, 8, 4, 3, Y);

  // Feet on board
  rect(ctx, 20, 27, 5, 3, K);
  rect(ctx, 32, 27, 5, 3, K);
}

// ── Enormous Pikachu running right on top of us ────────────
function drawPikaRunClosest(frame: 0 | 1): DrawFn {
  return (ctx) => {
    const Y = '#f8d030';
    const YD = '#d89820';
    const K = '#202020';
    const R = '#e03030';
    const W = '#ffffff';
    const BELLY = '#f8e878';

    // Ears (huge)
    rect(ctx, 18, 2, 10, 22, Y);
    rect(ctx, 68, 2, 10, 22, Y);
    rect(ctx, 18, 2, 10, 8, K);
    rect(ctx, 68, 2, 10, 8, K);

    // Head outline
    rect(ctx, 20, 14, 56, 4, K);
    rect(ctx, 14, 18, 68, 4, K);

    // Head fill
    rect(ctx, 18, 18, 60, 24, Y);
    rect(ctx, 14, 22, 68, 16, Y);

    // Eyes (big, friendly)
    rect(ctx, 28, 26, 8, 6, K);
    rect(ctx, 60, 26, 8, 6, K);
    rect(ctx, 30, 27, 3, 3, W);
    rect(ctx, 62, 27, 3, 3, W);

    // Cheeks (big)
    rect(ctx, 10, 30, 10, 6, R);
    rect(ctx, 76, 30, 10, 6, R);
    rect(ctx, 13, 28, 4, 2, R);
    rect(ctx, 79, 28, 4, 2, R);

    // Mouth (goofy open grin with tongue)
    rect(ctx, 40, 36, 16, 4, K);
    rect(ctx, 42, 39, 12, 2, R);
    rect(ctx, 44, 40, 8, 1, '#f85050');

    // Body (compressed — he's very close)
    rect(ctx, 18, 42, 60, 20, Y);
    rect(ctx, 14, 46, 68, 14, Y);
    rect(ctx, 26, 44, 44, 16, BELLY);

    // Arms (pumped like running)
    if (frame === 0) {
      rect(ctx, 2, 44, 14, 8, Y);
      rect(ctx, 2, 44, 14, 3, K);
      rect(ctx, 80, 48, 14, 8, Y);
      rect(ctx, 80, 55, 14, 2, K);
    } else {
      rect(ctx, 2, 48, 14, 8, Y);
      rect(ctx, 2, 55, 14, 2, K);
      rect(ctx, 80, 44, 14, 8, Y);
      rect(ctx, 80, 44, 14, 3, K);
    }

    // Tail (right side)
    rect(ctx, 80, 22, 6, 6, YD);
    rect(ctx, 86, 14, 6, 8, YD);
    rect(ctx, 80, 8, 6, 6, YD);

    // Legs — alternating running pose
    if (frame === 0) {
      rect(ctx, 22, 62, 14, 14, Y);
      rect(ctx, 58, 62, 14, 14, Y);
      rect(ctx, 20, 74, 18, 5, K);
      rect(ctx, 56, 76, 18, 4, K);
    } else {
      rect(ctx, 22, 62, 14, 14, Y);
      rect(ctx, 58, 62, 14, 14, Y);
      rect(ctx, 20, 76, 18, 4, K);
      rect(ctx, 56, 74, 18, 5, K);
    }
  };
}

// ── Pikachu floating with balloons (shared with TitleScene) ─
// Draws onto an arbitrary canvas centered at (cx, cy). Used as a standalone
// sprite and as the shared drawing routine called from TitleScene.
export function drawPikachuOnBalloons(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
): void {
  const Y = '#f8d030';
  const YD = '#b07820';
  const K = '#282828';
  const R = '#e04040';
  const W = '#ffffff';
  const BELLY = '#f8e878';

  // Balloon strings (converge at belly)
  ctx.fillStyle = '#484848';
  for (let i = 0; i < 36; i++) { ctx.fillRect(cx - 6 + Math.round(5 * i / 35), cy - 14 + i, 1, 1); }
  for (let i = 0; i < 38; i++) { ctx.fillRect(cx + 3 - Math.round(3 * i / 37), cy - 16 + i, 1, 1); }
  for (let i = 0; i < 34; i++) { ctx.fillRect(cx + 11 - Math.round(9 * i / 33), cy - 12 + i, 1, 1); }
  for (let i = 0; i < 34; i++) { ctx.fillRect(cx - 2 + Math.round(i / 33), cy - 12 + i, 1, 1); }

  // Ears
  ctx.fillStyle = Y;
  ctx.fillRect(cx - 12, cy - 6, 5, 12);
  ctx.fillRect(cx + 7, cy - 6, 5, 12);
  ctx.fillStyle = K;
  ctx.fillRect(cx - 12, cy - 6, 5, 3);
  ctx.fillRect(cx + 7, cy - 6, 5, 3);

  // Head
  ctx.fillStyle = Y;
  ctx.fillRect(cx - 9, cy + 4, 18, 10);
  ctx.fillRect(cx - 11, cy + 7, 22, 8);

  // Eyes
  ctx.fillStyle = K;
  ctx.fillRect(cx - 6, cy + 8, 3, 3);
  ctx.fillRect(cx + 3, cy + 8, 3, 3);
  ctx.fillStyle = W;
  ctx.fillRect(cx - 5, cy + 8, 1, 1);
  ctx.fillRect(cx + 4, cy + 8, 1, 1);

  // Cheeks
  ctx.fillStyle = R;
  ctx.fillRect(cx - 11, cy + 11, 4, 3);
  ctx.fillRect(cx + 7, cy + 11, 4, 3);

  // Mouth
  ctx.fillStyle = K;
  ctx.fillRect(cx - 2, cy + 13, 1, 1);
  ctx.fillRect(cx - 1, cy + 14, 2, 1);
  ctx.fillRect(cx + 1, cy + 13, 1, 1);

  // Body
  ctx.fillStyle = Y;
  ctx.fillRect(cx - 12, cy + 15, 24, 12);
  ctx.fillRect(cx - 14, cy + 18, 28, 6);
  ctx.fillStyle = BELLY;
  ctx.fillRect(cx - 8, cy + 18, 16, 8);
  ctx.fillStyle = YD;
  ctx.fillRect(cx - 4, cy + 15, 3, 3);
  ctx.fillRect(cx + 1, cy + 15, 3, 3);

  // Arms
  ctx.fillStyle = Y;
  ctx.fillRect(cx - 24, cy + 18, 12, 5);
  ctx.fillRect(cx + 12, cy + 18, 12, 5);

  // Legs / feet
  ctx.fillRect(cx - 8, cy + 27, 5, 5);
  ctx.fillRect(cx + 3, cy + 27, 5, 5);
  ctx.fillRect(cx - 9, cy + 31, 7, 3);
  ctx.fillRect(cx + 2, cy + 31, 7, 3);

  // Tail (lightning bolt, right side)
  ctx.fillRect(cx + 12, cy + 15, 4, 4);
  ctx.fillRect(cx + 15, cy + 11, 4, 5);
  ctx.fillRect(cx + 18, cy + 7, 5, 5);
  ctx.fillStyle = '#e8c020';
  ctx.fillRect(cx + 16, cy + 5, 3, 3);

  // String band tied around belly
  ctx.fillStyle = '#585858';
  ctx.fillRect(cx - 11, cy + 21, 22, 1);
  ctx.fillRect(cx - 1, cy + 20, 2, 3);

  // Balloons above (red, green, blue, orange)
  const drawBalloon = (bx: number, by: number, color: string, highlight: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(bx - 4, by - 5, 8, 11);
    ctx.fillRect(bx - 5, by - 3, 10, 7);
    ctx.fillRect(bx - 3, by - 6, 6, 2);
    ctx.fillStyle = highlight;
    ctx.fillRect(bx - 2, by - 4, 3, 3);
    ctx.fillStyle = color;
    ctx.fillRect(bx, by + 6, 2, 2);
  };
  drawBalloon(cx - 6, cy - 22, '#e83030', '#f86868');
  drawBalloon(cx + 3, cy - 24, '#30b830', '#60d860');
  drawBalloon(cx + 11, cy - 20, '#3890e0', '#68b8f8');
  drawBalloon(cx - 2, cy - 20, '#f09030', '#f8b860');
}

function drawPikaBalloons(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  drawPikachuOnBalloons(ctx, w / 2, h / 2 + 8);
}

// ── Pikachu charging cheeks ────────────────────────────────
function drawPikaCharge(ctx: CanvasRenderingContext2D): void {
  const Y = '#f8d030';
  const K = '#202020';
  const R = '#e03030';
  const W = '#ffffff';
  const SPARK = '#fffc40';

  // Big determined face filling the frame
  // Ears
  rect(ctx, 12, 2, 8, 16, Y);
  rect(ctx, 52, 2, 8, 16, Y);
  rect(ctx, 12, 2, 8, 6, K);
  rect(ctx, 52, 2, 8, 6, K);

  // Head outline + fill
  rect(ctx, 16, 10, 40, 4, K);
  rect(ctx, 10, 14, 52, 4, K);
  rect(ctx, 12, 18, 48, 30, Y);
  rect(ctx, 8, 22, 56, 22, Y);

  // Angry eyebrows
  rect(ctx, 18, 20, 10, 2, K);
  rect(ctx, 44, 20, 10, 2, K);

  // Eyes (angry, narrowed)
  rect(ctx, 20, 24, 8, 5, K);
  rect(ctx, 44, 24, 8, 5, K);
  rect(ctx, 22, 25, 2, 2, W);
  rect(ctx, 46, 25, 2, 2, W);

  // Cheeks — sparking!
  rect(ctx, 6, 30, 10, 8, R);
  rect(ctx, 56, 30, 10, 8, R);

  // Spark effects around cheeks
  rect(ctx, 2, 28, 2, 2, SPARK);
  rect(ctx, 0, 32, 2, 2, SPARK);
  rect(ctx, 3, 36, 2, 2, SPARK);
  rect(ctx, 68, 28, 2, 2, SPARK);
  rect(ctx, 70, 32, 2, 2, SPARK);
  rect(ctx, 67, 36, 2, 2, SPARK);
  // White flash lines
  rect(ctx, 5, 30, 1, 1, W);
  rect(ctx, 66, 30, 1, 1, W);

  // Mouth (determined grimace)
  rect(ctx, 30, 38, 12, 2, K);
  rect(ctx, 28, 40, 4, 1, K);
  rect(ctx, 40, 40, 4, 1, K);
}

// ── Red angry Pikachu silhouette (the "zap!" shock frame) ──
function drawPikaZap(ctx: CanvasRenderingContext2D): void {
  const R = '#e02020';
  const RD = '#801010';
  const W = '#ffffff';
  const EYE = '#fff840';

  // White outline halo behind (1px offset)
  const outline = (x: number, y: number, w: number, h: number) => rect(ctx, x, y, w, h, W);

  // Outline layer
  outline(11, 1, 14, 20);
  outline(47, 1, 14, 20);
  outline(9, 15, 54, 6);
  outline(5, 19, 62, 38);
  outline(3, 23, 66, 26);

  // Red silhouette body
  // Ears (tall, pointed, dramatic)
  rect(ctx, 12, 2, 12, 18, R);
  rect(ctx, 48, 2, 12, 18, R);
  rect(ctx, 15, 0, 6, 4, R);
  rect(ctx, 51, 0, 6, 4, R);

  // Head
  rect(ctx, 10, 16, 52, 6, R);
  rect(ctx, 6, 20, 60, 28, R);
  rect(ctx, 4, 24, 64, 20, R);

  // Eyes (glowing yellow — the iconic "angry Pikachu" look)
  rect(ctx, 20, 30, 8, 8, EYE);
  rect(ctx, 44, 30, 8, 8, EYE);
  rect(ctx, 22, 32, 4, 4, RD);
  rect(ctx, 46, 32, 4, 4, RD);

  // Forehead V-mark (the "intense" marking)
  rect(ctx, 30, 22, 2, 2, W);
  rect(ctx, 32, 24, 4, 3, W);
  rect(ctx, 36, 22, 2, 2, W);

  // Arms out to sides (casting electricity)
  rect(ctx, 0, 40, 10, 6, R);
  rect(ctx, 62, 40, 10, 6, R);

  // Body
  rect(ctx, 14, 48, 44, 16, R);
  rect(ctx, 10, 52, 52, 12, R);

  // Legs stumpy
  rect(ctx, 20, 62, 10, 8, R);
  rect(ctx, 42, 62, 10, 8, R);
}

// ── Front-facing happy Pikachu for the polished title screen ─
function drawTitlePikaFront(ctx: CanvasRenderingContext2D): void {
  const Y = '#f8d030';
  const YD = '#d89820';
  const K = '#202020';
  const R = '#e03030';
  const W = '#ffffff';
  const BELLY = '#f8e878';
  const GOLD = '#c0a020';

  // Ears
  rect(ctx, 8, 2, 5, 18, Y);
  rect(ctx, 35, 2, 5, 18, Y);
  rect(ctx, 8, 2, 5, 5, K);
  rect(ctx, 35, 2, 5, 5, K);

  // Head
  rect(ctx, 11, 12, 26, 2, K);
  rect(ctx, 9, 14, 30, 2, K);
  rect(ctx, 10, 16, 28, 12, Y);
  rect(ctx, 8, 18, 32, 8, Y);

  // Eyes (big round, happy)
  rect(ctx, 14, 18, 4, 5, K);
  rect(ctx, 30, 18, 4, 5, K);
  rect(ctx, 15, 19, 2, 2, W);
  rect(ctx, 31, 19, 2, 2, W);

  // Cheeks (glowing red)
  rect(ctx, 8, 22, 5, 4, R);
  rect(ctx, 35, 22, 5, 4, R);

  // Mouth (big happy smile)
  rect(ctx, 20, 24, 8, 2, K);
  rect(ctx, 21, 25, 2, 1, K);
  rect(ctx, 25, 25, 2, 1, K);
  rect(ctx, 22, 25, 4, 1, R);

  // Body (with arms out)
  rect(ctx, 12, 28, 24, 14, Y);
  rect(ctx, 10, 32, 28, 8, Y);
  rect(ctx, 16, 30, 16, 10, BELLY);

  // Arms raised a bit in a cute "hi!" pose
  rect(ctx, 4, 30, 8, 5, Y);
  rect(ctx, 36, 30, 8, 5, Y);
  rect(ctx, 2, 28, 4, 4, Y);
  rect(ctx, 42, 28, 4, 4, Y);

  // Legs / feet
  rect(ctx, 14, 42, 5, 4, Y);
  rect(ctx, 29, 42, 5, 4, Y);
  rect(ctx, 13, 44, 8, 2, GOLD);
  rect(ctx, 27, 44, 8, 2, GOLD);

  // Tail peeking to the right
  rect(ctx, 36, 34, 4, 3, Y);
  rect(ctx, 38, 30, 4, 5, Y);
  rect(ctx, 40, 26, 4, 5, Y);
}

// ── Sprite registry ────────────────────────────────────────
const INTRO_SPRITES: IntroSprite[] = [
  { key: 'intro_claude_logo', width: 120, height: 72, draw: drawClaudeLogo },
  { key: 'intro_star_big', width: 12, height: 12, draw: drawBigStar },
  { key: 'intro_star_tiny', width: 4, height: 4, draw: drawTinyStar },

  { key: 'intro_pika_far_0', width: 16, height: 16, draw: drawPikaSilhouetteFar(0) },
  { key: 'intro_pika_far_1', width: 16, height: 16, draw: drawPikaSilhouetteFar(1) },

  { key: 'intro_pika_mid_0', width: 24, height: 32, draw: drawPikaSilhouetteMid(0) },
  { key: 'intro_pika_mid_1', width: 24, height: 32, draw: drawPikaSilhouetteMid(1) },

  { key: 'intro_pika_jump', width: 48, height: 48, draw: drawPikaJump },

  { key: 'intro_pika_run_near_0', width: 64, height: 64, draw: drawPikaRunNear(0) },
  { key: 'intro_pika_run_near_1', width: 64, height: 64, draw: drawPikaRunNear(1) },

  { key: 'intro_pika_surf', width: 56, height: 40, draw: drawPikaSurf },

  { key: 'intro_pika_closest_0', width: 96, height: 80, draw: drawPikaRunClosest(0) },
  { key: 'intro_pika_closest_1', width: 96, height: 80, draw: drawPikaRunClosest(1) },

  { key: 'intro_pika_balloons', width: 64, height: 80, draw: drawPikaBalloons },

  { key: 'intro_pika_charge', width: 72, height: 56, draw: drawPikaCharge },

  { key: 'intro_pika_zap', width: 72, height: 72, draw: drawPikaZap },

  { key: 'title_pika_front', width: 48, height: 48, draw: drawTitlePikaFront },
];

export function generateIntroSprites(scene: Phaser.Scene): void {
  for (const sprite of INTRO_SPRITES) {
    if (scene.textures.exists(sprite.key)) continue;
    const canvas = document.createElement('canvas');
    canvas.width = sprite.width;
    canvas.height = sprite.height;
    const ctx = canvas.getContext('2d')!;
    sprite.draw(ctx, sprite.width, sprite.height);
    scene.textures.addCanvas(sprite.key, canvas);
  }
}
