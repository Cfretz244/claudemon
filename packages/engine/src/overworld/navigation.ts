import { MapData, NPCData, TileType, WarpPoint } from '../types/map.types';
import { Direction, DIR_VECTORS } from '../utils/constants';
export type Step =
  | { kind: 'blocked' }
  | { kind: 'warp'; warp: WarpPoint }
  | { kind: 'move'; x: number; y: number; hop: boolean; warp?: WarpPoint };
export function resolveStep(
  map: MapData,
  x: number,
  y: number,
  dir: Direction,
  npcs: readonly NPCData[],
): Step {
  const v = DIR_VECTORS[dir];
  let nx = x + v.x,
    ny = y + v.y;
  if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) {
    const warp = map.warps.find((w) => w.x === x && w.y === y);
    return warp ? { kind: 'warp', warp } : { kind: 'blocked' };
  }
  const tile = map.tiles[ny][nx];
  let hop = false;
  if (tile === TileType.LEDGE) {
    if (dir !== Direction.DOWN) return { kind: 'blocked' };
    ny++;
    hop = true;
  }
  if (ny >= map.height || map.collision[ny]?.[nx]) {
    const warp = !hop && map.warps.find((w) => w.x === nx && w.y === ny);
    return warp ? { kind: 'warp', warp } : { kind: 'blocked' };
  }
  if (map.tiles[ny][nx] === TileType.LEDGE || npcs.some((n) => n.x === nx && n.y === ny))
    return { kind: 'blocked' };
  return { kind: 'move', x: nx, y: ny, hop, warp: map.warps.find((w) => w.x === nx && w.y === ny) };
}
