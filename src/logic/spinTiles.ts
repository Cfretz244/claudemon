// Sliding computed up front so the scene only animates. Two kinds:
//  - spin tiles (arrow floor): once the player lands on an arrow the slide
//    follows it; each further arrow redirects; a STOP_TILE ends the slide, so
//    does a blocked tile ahead; a warp tile ends it and fires the warp.
//  - currents (`MapData.currents`): the same for a surfing player, except any
//    plain water tile ends the slide.

import { MapData, TileType } from '../types/map.types';
import { Direction, DIR_VECTORS } from '../utils/constants';

export interface SlideStep { x: number; y: number; dir: Direction }
export type SlideEnd = 'stop' | 'blocked' | 'warp' | 'loop';
export interface Slide {
  /** tiles slid onto, in order (empty when the arrow points straight into something) */
  path: SlideStep[];
  end: SlideEnd;
}

export interface SlideRules {
  /** direction of every tile that keeps the slide going ("x,y") */
  arrows: Record<string, Direction>;
  /** tiles the player cannot slide onto (walls, NPCs, land while surfing) */
  isBlocked: (x: number, y: number) => boolean;
  /** non-arrow tiles that end the slide; other non-arrow tiles are slid across */
  isStop: (x: number, y: number) => boolean;
}

/** Arrows pointing at each other would slide forever; stop after this many tiles. */
export const MAX_SLIDE_STEPS = 256;

type SlideMap = Pick<MapData, 'width' | 'height' | 'tiles' | 'warps'>;

/** Slide that starts with the player standing on the arrow tile (ax, ay). */
export function computeSlideWith(map: Pick<MapData, 'width' | 'height' | 'warps'>, ax: number, ay: number, rules: SlideRules): Slide {
  const path: SlideStep[] = [];
  let x = ax, y = ay;
  let dir = rules.arrows[`${x},${y}`];
  if (!dir) return { path, end: 'stop' };
  for (let n = 0; n < MAX_SLIDE_STEPS; n++) {
    const v = DIR_VECTORS[dir];
    const nx = x + v.x, ny = y + v.y;
    if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height || rules.isBlocked(nx, ny)) return { path, end: 'blocked' };
    x = nx; y = ny;
    path.push({ x, y, dir });
    if (map.warps.some(w => w.x === x && w.y === y)) return { path, end: 'warp' };
    const onArrow = rules.arrows[`${x},${y}`];
    if (onArrow) { dir = onArrow; continue; }
    if (rules.isStop(x, y)) return { path, end: 'stop' };
  }
  return { path, end: 'loop' };
}

/** Spin-tile slide: `map.spinTiles` are the arrows, STOP_TILE ends it. */
export function computeSlide(
  map: SlideMap & Pick<MapData, 'spinTiles'>, ax: number, ay: number, isBlocked: (x: number, y: number) => boolean,
): Slide {
  return computeSlideWith(map, ax, ay, {
    arrows: map.spinTiles ?? {},
    isBlocked,
    isStop: (x, y) => map.tiles[y]?.[x] === TileType.STOP_TILE,
  });
}

/** Current slide for a surfing player: `map.currents` are the arrows, still water ends it. */
export function computeCurrentSlide(
  map: SlideMap & Pick<MapData, 'currents'>, ax: number, ay: number, isBlocked: (x: number, y: number) => boolean,
): Slide {
  return computeSlideWith(map, ax, ay, {
    arrows: map.currents ?? {},
    isBlocked,
    isStop: (x, y) => map.tiles[y]?.[x] !== TileType.CURRENT,
  });
}
