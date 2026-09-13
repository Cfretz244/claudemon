// Spin-tile (arrow floor) sliding, computed up front so the scene only
// animates. Called once the player has landed on an arrow tile: the slide
// follows that arrow; each further arrow redirects; a STOP_TILE ends the
// slide, so does a blocked tile ahead; a warp tile ends it and fires the warp.

import { MapData, TileType } from '../types/map.types';
import { Direction, DIR_VECTORS } from '../utils/constants';

export interface SlideStep { x: number; y: number; dir: Direction }
export type SlideEnd = 'stop' | 'blocked' | 'warp' | 'loop';
export interface Slide {
  /** tiles slid onto, in order (empty when the arrow points straight into something) */
  path: SlideStep[];
  end: SlideEnd;
}

/** Arrows pointing at each other would slide forever; stop after this many tiles. */
export const MAX_SLIDE_STEPS = 256;

/** Slide that starts with the player standing on the arrow tile (ax, ay). */
export function computeSlide(
  map: Pick<MapData, 'width' | 'height' | 'tiles' | 'warps' | 'spinTiles'>,
  ax: number, ay: number,
  isBlocked: (x: number, y: number) => boolean,
): Slide {
  const spin = map.spinTiles ?? {};
  const path: SlideStep[] = [];
  let x = ax, y = ay;
  let dir = spin[`${x},${y}`];
  if (!dir) return { path, end: 'stop' };
  for (let n = 0; n < MAX_SLIDE_STEPS; n++) {
    const v = DIR_VECTORS[dir];
    const nx = x + v.x, ny = y + v.y;
    if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height || isBlocked(nx, ny)) return { path, end: 'blocked' };
    x = nx; y = ny;
    path.push({ x, y, dir });
    if (map.warps.some(w => w.x === x && w.y === y)) return { path, end: 'warp' };
    const onArrow = spin[`${x},${y}`];
    if (onArrow) { dir = onArrow; continue; }
    if (map.tiles[y]?.[x] === TileType.STOP_TILE) return { path, end: 'stop' };
  }
  return { path, end: 'loop' };
}
