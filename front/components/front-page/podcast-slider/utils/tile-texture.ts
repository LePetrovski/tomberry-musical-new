import {
    CanvasTexture,
    SRGBColorSpace,
    Texture,
} from "three";
import {
    TILE_BORDER_RADIUS,
    TILE_BUTTON_BAR_HEIGHT,
    TILE_TEXTURE_HEIGHT,
    TILE_TEXTURE_WIDTH,
} from "../constants";

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

export function buildPodcastTileTexture(
    coverTexture: Texture,
    _canPlay: boolean,
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

    drawBottomOverlay(ctx, TILE_BUTTON_BAR_HEIGHT + 24);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}
