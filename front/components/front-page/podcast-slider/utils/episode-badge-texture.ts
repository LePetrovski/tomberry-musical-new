import { CanvasTexture, SRGBColorSpace, Texture } from "three";

type EpisodeBadgeTextureData = {
    pixelWidth: number;
    pixelHeight: number;
};

const BADGE_HEIGHT_PX = 65;
const BADGE_PAD_X = 10;
const BADGE_PADDING = 12;
const BADGE_RADIUS = 12;

const badgeTextureCache = new Map<number, Texture>();

export function buildEpisodeBadgeTexture(episodeNumber: number): Texture {
    const cached = badgeTextureCache.get(episodeNumber);
    if (cached) return cached;

    const label = String(episodeNumber);
    const measureCanvas = document.createElement("canvas");
    const measureCtx = measureCanvas.getContext("2d");
    if (!measureCtx) {
        const fallback = new CanvasTexture(measureCanvas);
        fallback.colorSpace = SRGBColorSpace;
        return fallback;
    }

    measureCtx.font = "700 54px lexend, sans-serif";
    const textWidth = measureCtx.measureText(label).width;
    const badgeWidth = Math.ceil(textWidth + BADGE_PAD_X * 2);
    const badgeHeight = BADGE_HEIGHT_PX;

    const canvas = document.createElement("canvas");
    canvas.width = badgeWidth;
    canvas.height = badgeHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        const fallback = new CanvasTexture(canvas);
        fallback.colorSpace = SRGBColorSpace;
        return fallback;
    }

    ctx.beginPath();
    ctx.roundRect(0, 0, badgeWidth, badgeHeight, BADGE_RADIUS);
    ctx.fillStyle = "rgba(247, 245, 240, 1)";
    ctx.fill();

    ctx.fillStyle = "#1CA9B9";
    ctx.font = "700 54px lexend, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, badgeWidth / 2, badgeHeight / 2);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    (texture.userData as EpisodeBadgeTextureData).pixelWidth = badgeWidth;
    (texture.userData as EpisodeBadgeTextureData).pixelHeight = badgeHeight;

    badgeTextureCache.set(episodeNumber, texture);
    return texture;
}
