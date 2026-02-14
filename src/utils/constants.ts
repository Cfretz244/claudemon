export const TILE_SIZE = 16;
export const GAME_WIDTH = 160;
export const GAME_HEIGHT = 144;
export const SCALE = 4;
export const PLAYER_SPEED = 2; // pixels per frame during movement
export const MOVE_DURATION = 200; // ms per tile movement
export const TEXT_SPEED = 30; // ms per character in typewriter
export const ENCOUNTER_RATE = 0.1; // 10% per step in grass
export const MAX_PARTY_SIZE = 6;
export const MAX_MOVES = 4;
export const MAX_LEVEL = 100;
export const MAX_IV = 15;
export const MAX_EV = 65535;

export const COLORS = {
  WHITE: 0xffffff,
  BLACK: 0x000000,
  LIGHT_GRAY: 0xc0c0c0,
  DARK_GRAY: 0x808080,
  BG_GREEN: 0x88c070,
  BG_DARK_GREEN: 0x507850,
  TEXT_DARK: 0x383838,
  HP_GREEN: 0x00c000,
  HP_YELLOW: 0xc0c000,
  HP_RED: 0xc00000,
  MENU_BG: 0xf8f8f8,
  MENU_BORDER: 0x383838,
};

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export const DIR_VECTORS: Record<Direction, { x: number; y: number }> = {
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
};
