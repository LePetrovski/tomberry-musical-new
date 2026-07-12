import {
    CanvasTexture,
    SRGBColorSpace,
    Texture,
} from "three";
import type { TileButtonHover } from "../types";
import {
    TILE_BORDER_RADIUS,
    TILE_BUTTON_BAR_HEIGHT,
    TILE_BUTTON_BAR_UV,
    TILE_TEXTURE_HEIGHT,
    TILE_TEXTURE_WIDTH,
} from "../constants";

type TileTextureUserData = {
    tileBase: HTMLCanvasElement;
    canPlay: boolean;
};

type Rgba = [number, number, number, number];

const BUTTON_FILL = {
    play: {
        normal: [12, 93, 102, 0.62] as Rgba,
        hover: [12, 93, 102, 0.88] as Rgba,
    },
    detail: {
        normal: [247, 245, 240, 0.62] as Rgba,
        hover: [247, 245, 240, 0.88] as Rgba,
    },
    disabled: [236, 234, 228, 0.65] as Rgba,
} as const;

function mixRgba(from: Rgba, to: Rgba, t: number): string {
    const mix = from.map((value, index) => value + (to[index] - value) * t) as Rgba;
    return `rgba(${mix[0]}, ${mix[1]}, ${mix[2]}, ${mix[3]})`;
}

function clipRoundedRect(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    radius: number,
) {
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, radius);
    ctx.clip();
}

export function drawImageCover(
    ctx: CanvasRenderingContext2D,
    image: CanvasImageSource,
    imageWidth: number,
    imageHeight: number,
    x: number,
    y: number,
    width: number,
    height: number,
) {
    if (imageWidth <= 0 || imageHeight <= 0) return;

    const scale = Math.max(width / imageWidth, height / imageHeight);
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;
    const offsetX = x + (width - drawWidth) / 2;
    const offsetY = y + (height - drawHeight) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
}

function drawBottomOverlay(
    ctx: CanvasRenderingContext2D,
    height: number,
) {
    const gradient = ctx.createLinearGradient(0, TILE_TEXTURE_HEIGHT - height, 0, TILE_TEXTURE_HEIGHT);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(0.45, "rgba(0, 0, 0, 0.35)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.55)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, TILE_TEXTURE_HEIGHT - height, TILE_TEXTURE_WIDTH, height);
}

function drawTileButton(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    enabled: boolean,
    accent: boolean,
    hoverMix: number,
) {
    const radius = 8;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);

    if (!enabled) {
        const [r, g, b, a] = BUTTON_FILL.disabled;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    } else {
        const palette = accent ? BUTTON_FILL.play : BUTTON_FILL.detail;
        ctx.fillStyle = mixRgba(palette.normal, palette.hover, hoverMix);
    }
    ctx.fill();

    ctx.strokeStyle = enabled ? "#f7f5f0" : "#c8c5bc";
    ctx.lineWidth = enabled && !accent ? 1.5 : 0;
    if (ctx.lineWidth > 0) ctx.stroke();

    ctx.fillStyle = enabled ? (accent ? "#f7f5f0" : "#14295b") : "#9a968c";
    ctx.font = "600 36px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + width / 2, y + height / 2);
}

function drawTileButtons(
    ctx: CanvasRenderingContext2D,
    canPlay: boolean,
    playMix: number,
    detailMix: number,
) {
    drawBottomOverlay(ctx, TILE_BUTTON_BAR_HEIGHT + 24);

    const buttonY = TILE_TEXTURE_HEIGHT - TILE_BUTTON_BAR_HEIGHT + 6;
    const buttonHeight = TILE_BUTTON_BAR_HEIGHT - 12;
    const buttonGap = 10;
    const buttonWidth = (TILE_TEXTURE_WIDTH - buttonGap * 3) / 2;

    drawTileButton(
        ctx,
        buttonGap,
        buttonY,
        buttonWidth,
        buttonHeight,
        "▶",
        canPlay,
        true,
        playMix,
    );
    drawTileButton(
        ctx,
        buttonGap * 2 + buttonWidth,
        buttonY,
        buttonWidth,
        buttonHeight,
        "→",
        true,
        false,
        detailMix,
    );
}

export function getTileButtonFromUv(
    uv: { x: number; y: number },
    canPlay: boolean,
): TileButtonHover {
    if (uv.y > TILE_BUTTON_BAR_UV) return null;
    if (uv.x >= 0.5) return canPlay ? "play" : null;
    return "detail";
}

export function updateTileButtonHover(
    texture: Texture,
    playMix: number,
    detailMix: number,
) {
    const userData = texture.userData as TileTextureUserData;
    const base = userData.tileBase;
    const canPlay = userData.canPlay;
    const canvas = texture.image as HTMLCanvasElement | undefined;
    const ctx = canvas?.getContext("2d");
    if (!base || !ctx) return;

    ctx.drawImage(base, 0, 0);
    drawTileButtons(ctx, canPlay, playMix, detailMix);
    texture.needsUpdate = true;
}

export function buildPodcastTileTexture(
    coverTexture: Texture,
    canPlay: boolean,
): Texture {
    const canvas = document.createElement("canvas");
    canvas.width = TILE_TEXTURE_WIDTH;
    canvas.height = TILE_TEXTURE_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        const fallback = new CanvasTexture(canvas);
        fallback.colorSpace = SRGBColorSpace;
        return fallback;
    }

    ctx.fillStyle = "#f7f5f0";
    ctx.fillRect(0, 0, TILE_TEXTURE_WIDTH, TILE_TEXTURE_HEIGHT);

    ctx.save();
    clipRoundedRect(ctx, TILE_TEXTURE_WIDTH, TILE_TEXTURE_HEIGHT, TILE_BORDER_RADIUS);

    const image = coverTexture.image as HTMLImageElement | undefined;
    const imageWidth = image?.naturalWidth || image?.width || 0;
    const imageHeight = image?.naturalHeight || image?.height || 0;

    if (image && imageWidth > 0 && imageHeight > 0) {
        drawImageCover(
            ctx,
            image,
            imageWidth,
            imageHeight,
            0,
            0,
            TILE_TEXTURE_WIDTH,
            TILE_TEXTURE_HEIGHT,
        );
    } else {
        ctx.fillStyle = "#e8e6e1";
        ctx.fillRect(0, 0, TILE_TEXTURE_WIDTH, TILE_TEXTURE_HEIGHT);
    }

    ctx.restore();

    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.roundRect(0, 0, TILE_TEXTURE_WIDTH, TILE_TEXTURE_HEIGHT, TILE_BORDER_RADIUS);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = TILE_TEXTURE_WIDTH;
    baseCanvas.height = TILE_TEXTURE_HEIGHT;
    baseCanvas.getContext("2d")?.drawImage(canvas, 0, 0);

    drawTileButtons(ctx, canPlay, 0, 0);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    (texture.userData as TileTextureUserData).tileBase = baseCanvas;
    (texture.userData as TileTextureUserData).canPlay = canPlay;
    return texture;
}
