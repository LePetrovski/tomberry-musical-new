import { CanvasTexture, SRGBColorSpace, Texture } from "three";

type TileButtonKind = "play" | "detail";

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

const BUTTON_LABELS: Record<TileButtonKind, string> = {
    play: "▶",
    detail: "→",
};

const textureCache = new Map<string, Texture>();

function mixRgba(from: Rgba, to: Rgba, t: number): string {
    const mix = from.map((value, index) => value + (to[index] - value) * t) as Rgba;
    return `rgba(${mix[0]}, ${mix[1]}, ${mix[2]}, ${mix[3]})`;
}

function cacheKey(kind: TileButtonKind, enabled: boolean, hoverMix: number) {
    return `${kind}:${enabled}:${Math.round(hoverMix * 8)}`;
}

export function buildTileButtonTexture(
    kind: TileButtonKind,
    enabled: boolean,
    hoverMix: number,
): Texture {
    const key = cacheKey(kind, enabled, hoverMix);
    const cached = textureCache.get(key);
    if (cached) return cached;

    const width = 235;
    const height = 88;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        const fallback = new CanvasTexture(canvas);
        fallback.colorSpace = SRGBColorSpace;
        return fallback;
    }

    const radius = 8;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, radius);

    const accent = kind === "play";
    if (!enabled) {
        const [r, g, b, a] = BUTTON_FILL.disabled;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    } else {
        const palette = accent ? BUTTON_FILL.play : BUTTON_FILL.detail;
        ctx.fillStyle = mixRgba(palette.normal, palette.hover, hoverMix);
    }
    ctx.fill();

    if (enabled && !accent) {
        ctx.strokeStyle = "#f7f5f0";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    ctx.fillStyle = enabled ? (accent ? "#f7f5f0" : "#14295b") : "#9a968c";
    ctx.font = "600 36px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(BUTTON_LABELS[kind], width / 2, height / 2);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    textureCache.set(key, texture);
    return texture;
}
