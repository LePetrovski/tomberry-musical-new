import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Color, DoubleSide, Texture, Vector2 } from "three";
import {
    TILE_BORDER_RADIUS,
    TILE_PLANE_HEIGHT,
    TILE_PLANE_WIDTH,
    TILE_TEXTURE_HEIGHT,
    TILE_TEXTURE_WIDTH,
} from "../constants";

export const TileImageMaterial = shaderMaterial(
    {
        color: new Color("white"),
        map: null as Texture | null,
        scale: new Vector2(TILE_PLANE_WIDTH, TILE_PLANE_HEIGHT),
        imageBounds: new Vector2(TILE_TEXTURE_WIDTH, TILE_TEXTURE_HEIGHT),
        resolution: 1024,
        radius: TILE_BORDER_RADIUS / TILE_TEXTURE_WIDTH,
        opacity: 1,
        zoom: 1,
        grayscale: 0,
    },
    /* glsl */ `
        varying vec2 vUv;
        varying vec2 vPos;

        void main() {
            vUv = uv;
            vPos = position.xy;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    /* glsl */ `
        varying vec2 vUv;
        varying vec2 vPos;

        uniform vec2 scale;
        uniform vec2 imageBounds;
        uniform float resolution;
        uniform vec3 color;
        uniform sampler2D map;
        uniform float radius;
        uniform float zoom;
        uniform float grayscale;
        uniform float opacity;

        const vec3 luma = vec3(0.299, 0.587, 0.114);

        vec4 toGrayscale(vec4 inputColor, float intensity) {
            return vec4(mix(inputColor.rgb, vec3(dot(inputColor.rgb, luma)), intensity), inputColor.a);
        }

        vec2 aspect(vec2 size) {
            return size / min(size.x, size.y);
        }

        float udRoundBox(vec2 p, vec2 b, float r) {
            return length(max(abs(p) - b + r, 0.0)) - r;
        }

        void main() {
            vec2 s = aspect(scale);
            vec2 i = aspect(imageBounds);
            float rs = s.x / s.y;
            float ri = i.x / i.y;
            vec2 newSize = rs < ri
                ? vec2(i.x * s.y / i.y, s.y)
                : vec2(s.x, i.y * s.x / i.x);
            vec2 offset = (rs < ri
                ? vec2((newSize.x - s.x) / 2.0, 0.0)
                : vec2(0.0, (newSize.y - s.y) / 2.0)) / newSize;
            vec2 uv = vUv * s / newSize + offset;
            vec2 sampleUv = (uv - vec2(0.5, 0.5)) / zoom + vec2(0.5, 0.5);

            if (!gl_FrontFacing) {
                sampleUv.x = 1.0 - sampleUv.x;
            }

            vec2 res = vec2(scale * resolution);
            vec2 halfRes = 0.5 * res;
            float edge = udRoundBox(vUv.xy * res - halfRes, halfRes, resolution * radius);
            float alpha = mix(1.0, 0.0, smoothstep(0.0, 1.0, edge));

            vec4 sampled = texture2D(map, sampleUv) * vec4(color, opacity * alpha);
            gl_FragColor = toGrayscale(sampled, grayscale);
        }
    `,
);

extend({ TileImageMaterial });

const tileMaterialCache = new Map<string, InstanceType<typeof TileImageMaterial>>();

export function getTileImageMaterial(map: Texture, resolution: number) {
    const cached = tileMaterialCache.get(map.uuid);
    if (cached) {
        cached.map = map;
        cached.resolution = resolution;
        return cached;
    }

    const material = new TileImageMaterial();
    material.map = map;
    material.resolution = resolution;
    material.toneMapped = false;
    material.transparent = true;
    material.side = DoubleSide;
    material.depthWrite = true;

    tileMaterialCache.set(map.uuid, material);
    return material;
}

export function disposeTileMaterialCache() {
    for (const material of tileMaterialCache.values()) {
        material.dispose();
    }
    tileMaterialCache.clear();
}
