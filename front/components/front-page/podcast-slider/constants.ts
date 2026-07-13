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
export const EPISODE_BADGE_Z = -0.08;
export const EPISODE_BADGE_FONT = "/font/Lexend_Regular.json";
export const EPISODE_BADGE_TEXT_COLOR = "#72b2b4";
export const EPISODE_BADGE_BG_COLOR = "";
export const EPISODE_BADGE_TEXT_SIZE = 0.08;
export const EPISODE_BADGE_TEXT_DEPTH = 0.02;
export const EPISODE_BADGE_BG_DEPTH = 0.012;
export const EPISODE_BADGE_BG_RADIUS = 0.016;
export const EPISODE_BADGE_BG_PAD_X = 0.035;
export const EPISODE_BADGE_BG_PAD_Y = 0.022;

/** Inclinaison légère au survol (parallaxe curseur, sans contrôle Drei global). */
export const TILE_TILT_POLAR_MAX = Math.PI / 32;
export const TILE_TILT_AZIMUTH_MAX = Math.PI / 32;

/** Rotation commune des overlays (badge, boutons) pour affichage face caméra. */
export const TILE_OVERLAY_ROTATION: [number, number, number] = [0, Math.PI, 0];
/** Légèrement devant la cover pour le raycast et l’effet de relief. */
export const TILE_BUTTON_Z = -0.06;

/** Reflets discrets + léger foil irisé sur les covers. */
export const TILE_ROUGHNESS = 0.4;
export const TILE_METALNESS = 0.08;
export const TILE_CLEARCOAT = 0.38;
export const TILE_CLEARCOAT_ROUGHNESS = 0.4;
export const TILE_ENV_MAP_INTENSITY = 0.22;
export const TILE_SPECULAR_INTENSITY = 0.16;
export const TILE_IRIDESCENCE = 0.5;
export const TILE_IRIDESCENCE_IOR = 1.35;
export const TILE_IRIDESCENCE_THICKNESS_MIN = 180;
export const TILE_IRIDESCENCE_THICKNESS_MAX = 360;
export const SLIDER_ENV_INTENSITY = 0.4;

export const TUBE_RADIUS = 4;
export const TUBE_Y_SPACING = 2.7;
export const TUBE_REPEAT_COUNT = 3;
export const TUBE_ROWS = 5;
export const TUBE_COLS = 12;

export const GRID_PLANE_Z = -5.2;
export const GRID_PLANE_SIZE = 18;
export const GRID_LINE_COLOR = new Color("#DFE6F3"); // --color-secondary-200

export const CAMERA_POSITION: [number, number, number] = [0, 0, 6.5];
export const CAMERA_FOV = 50;

export const SLIDER_MOBILE_MAX_WIDTH = 991;
export const SLIDER_MOBILE_QUERY = `(max-width: ${SLIDER_MOBILE_MAX_WIDTH}px)`;

export type SliderResponsiveConfig = {
  gridScale: number;
  gridScrollSpeed: number;
  baseSpeed: number;
  tileScale: number;
  tubeYSpacing: number;
  tubeRadius: number;
  cameraPosition: [number, number, number];
  cameraFov: number;
  scrollWheelMultiplier: number;
  scrollTouchMultiplier: number;
};

export const SLIDER_RESPONSIVE: {
  desktop: SliderResponsiveConfig;
  mobile: SliderResponsiveConfig;
} = {
  desktop: {
    gridScale: 28,
    gridScrollSpeed: 0.01,
    baseSpeed: 0.16,
    tileScale: 1,
    tubeYSpacing: TUBE_Y_SPACING,
    tubeRadius: TUBE_RADIUS,
    cameraPosition: CAMERA_POSITION,
    cameraFov: CAMERA_FOV,
    scrollWheelMultiplier: 0.0016,
    scrollTouchMultiplier: 3.5,
  },
  mobile: {
    gridScale: 44,
    gridScrollSpeed: 0.005,
    baseSpeed: 0.07,
    tileScale: 0.68,
    tubeYSpacing: 1.4,
    tubeRadius: 2.1,
    cameraPosition: [0, 0, 5.6],
    cameraFov: 54,
    scrollWheelMultiplier: 0.001,
    scrollTouchMultiplier: 2,
  },
};

export const CRYSTAL_COLOR = new Color(0x43e0e0);
export const CRYSTAL_EMISSIVE = new Color(0xc1ffff);
export const MAIN_CRYSTAL_ROUGHNESS = 0.40;
export const MAIN_CRYSTAL_METALNESS = 0.45;
export const MINI_CRYSTAL_ROUGHNESS = 0.40;
export const MINI_CRYSTAL_METALNESS = 0.45;
