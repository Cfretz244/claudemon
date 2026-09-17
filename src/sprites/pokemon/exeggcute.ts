import { CustomSpriteDrawFn } from '../types';

/**
 * Exeggcute — full redo ("lame"): six actually egg-shaped eggs huddled in two
 * rows, each with its own face, and one of the six cracked — a dark split down
 * the shell and a chip broken out of its rim.
 */
export const exeggcute: CustomSpriteDrawFn = (ctx, isBack) => {
  const SHELL = '#f0c8c0';      // species spriteColor
  const SHELL_DARK = '#e0b8a8'; // species spriteColor2
  const SHADE = '#a87868';
  const HOLLOW = '#503038';
  const INK = '#302028';

  /** One egg: 10 wide, 14 tall, narrower at the top. */
  const egg = (x: number, y: number) => {
    ctx.fillStyle = SHELL;
    ctx.fillRect(x + 3, y, 4, 1);
    ctx.fillRect(x + 2, y + 1, 6, 1);
    ctx.fillRect(x + 1, y + 2, 8, 2);
    ctx.fillRect(x, y + 4, 10, 8);
    ctx.fillRect(x + 1, y + 12, 8, 1);
    ctx.fillRect(x + 3, y + 13, 4, 1);
    ctx.fillStyle = SHELL_DARK;
    ctx.fillRect(x + 7, y + 4, 3, 8);
    ctx.fillRect(x + 2, y + 12, 6, 1);
    ctx.fillStyle = '#fff2ea';
    ctx.fillRect(x + 1, y + 4, 2, 3);
  };

  /** eyes: 0 wide, 1 squint, 2 asleep, 3 wobbly. mouth: 0 open, 1 flat, 2 frown. */
  const face = (x: number, y: number, eyes: number, mouth: number) => {
    ctx.fillStyle = INK;
    if (eyes === 2) {
      ctx.fillRect(x + 1, y + 7, 3, 1);
      ctx.fillRect(x + 6, y + 7, 3, 1);
    } else {
      const h = eyes === 1 ? 2 : 3;
      const ey = y + (eyes === 1 ? 6 : 5);
      ctx.fillRect(x + 1, ey, 2, h);
      ctx.fillRect(x + 6, ey, 2, h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 1, ey, 1, 1);
      ctx.fillRect(x + 6, ey, 1, 1);
    }
    ctx.fillStyle = INK;
    if (mouth === 0) { ctx.fillRect(x + 3, y + 9, 4, 2); ctx.fillStyle = '#c05868'; ctx.fillRect(x + 4, y + 10, 2, 1); }
    else if (mouth === 1) ctx.fillRect(x + 3, y + 10, 4, 1);
    else { ctx.fillRect(x + 3, y + 10, 4, 1); ctx.fillRect(x + 2, y + 9, 1, 1); ctx.fillRect(x + 7, y + 9, 1, 1); }
  };

  /** The cracked one: a split down the shell and a chip out of the rim. */
  const crack = (x: number, y: number) => {
    ctx.fillStyle = HOLLOW;
    ctx.fillRect(x + 6, y + 1, 4, 3);
    ctx.fillRect(x + 8, y + 4, 2, 2);
    ctx.fillStyle = SHADE;
    ctx.fillRect(x + 5, y + 4, 1, 3);
    ctx.fillRect(x + 6, y + 6, 1, 2);
    ctx.fillRect(x + 7, y + 7, 2, 1);
    ctx.fillRect(x + 4, y + 7, 1, 3);
  };

  // Back row of three, then the front row overlapping it
  egg(1, 0); egg(11, 1); egg(21, 0);
  egg(0, 15); egg(11, 16); egg(21, 15);
  crack(11, 1);

  if (!isBack) {
    face(1, 0, 0, 0);
    face(11, 1, 3, 2);
    face(21, 0, 1, 1);
    face(0, 15, 2, 1);
    face(11, 16, 0, 2);
    face(21, 15, 1, 0);
  } else {
    // Back: the same huddle, shells only
    ctx.fillStyle = SHELL_DARK;
    for (const [x, y] of [[1, 0], [11, 1], [21, 0], [0, 15], [11, 16], [21, 15]]) {
      ctx.fillRect(x + 2, y + 5, 6, 6);
    }
  }
};
