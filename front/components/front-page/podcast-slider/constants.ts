import { Color } from "three";

export const PLACEHOLDER_TEXTURE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export const TILE_TEXTURE_WIDTH = 500;
export const TILE_TEXTURE_HEIGHT = 320;
export const TILE_BORDER_RADIUS = 14;
export const TILE_BUTTON_BAR_HEIGHT = 100;
export const TILE_BUTTON_BAR_UV = TILE_BUTTON_BAR_HEIGHT / TILE_TEXTURE_HEIGHT;
export const TILE_BUTTON_WIDTH_RATIO = 0.46;
export const TILE_PLANE_WIDTH = 1.1;
export const TILE_PLANE_HEIGHT = TILE_PLANE_WIDTH * (TILE_TEXTURE_HEIGHT / TILE_TEXTURE_WIDTH);

export const EPISODE_BADGE_PADDING_X = 0.055;
export const EPISODE_BADGE_PADDING_Y = 0.055;
export const EPISODE_BADGE_HEIGHT = 0.13;
export const EPISODE_BADGE_Z = -0.1;

export const TUBE_RADIUS = 4;
export const TUBE_Y_SPACING = 2.7;
export const TUBE_REPEAT_COUNT = 3;
export const TUBE_ROWS = 5;
export const TUBE_COLS = 12;

export const GRID_PLANE_Z = -5.2;
export const GRID_PLANE_SIZE = 18;
export const GRID_LINE_COLOR = new Color("#0c5d66"); // --color-secondary-900

export const CAMERA_POSITION: [number, number, number] = [0, 0, 6.5];
export const CAMERA_FOV = 50;

export const CRYSTAL_COLOR = new Color(0x43e0e0);
export const CRYSTAL_EMISSIVE = new Color(0xc1ffff);
export const MAIN_CRYSTAL_ROUGHNESS = 0.40;
export const MAIN_CRYSTAL_METALNESS = 0.45;
export const MINI_CRYSTAL_ROUGHNESS = 0.40;
export const MINI_CRYSTAL_METALNESS = 0.45;
