import type { ThreeEvent } from "@react-three/fiber";
import { memo, useCallback, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, MeshBasicMaterial } from "three";
import {
    TILE_BUTTON_BAR_HEIGHT,
    TILE_BUTTON_Z,
    TILE_OVERLAY_ROTATION,
    TILE_TEXTURE_HEIGHT,
    TILE_TEXTURE_WIDTH,
} from "./constants";
import { useTileSounds } from "./TileSoundProvider";
import { buildTileButtonTexture } from "./utils/tile-button-texture";
import type { TileButtonHover } from "./types";

const BUTTON_HOVER_LERP_SPEED = 10;

type Props = {
    kind: "play" | "detail";
    enabled: boolean;
    position: [number, number, number];
    size: [number, number];
    onClick: () => void;
    onHover: (hover: TileButtonHover, event: ThreeEvent<PointerEvent>) => void;
};

function TileButtonComponent({
    kind,
    enabled,
    position,
    size,
    onClick,
    onHover,
}: Props) {
    const { playHover, playClick } = useTileSounds();
    const materialRef = useRef<MeshBasicMaterial>(null);
    const hoverMixTarget = useRef(0);
    const hoverMixCurrent = useRef(0);
    const isHoveredRef = useRef(false);

    useFrame((_, delta) => {
        const step = Math.min(1, BUTTON_HOVER_LERP_SPEED * delta);
        const next = hoverMixCurrent.current + (hoverMixTarget.current - hoverMixCurrent.current) * step;

        if (Math.abs(next - hoverMixCurrent.current) <= 0.002) {
            if (hoverMixCurrent.current === hoverMixTarget.current) return;
            hoverMixCurrent.current = hoverMixTarget.current;
        } else {
            hoverMixCurrent.current = next;
        }

        const material = materialRef.current;
        if (!material) return;
        material.map = buildTileButtonTexture(kind, enabled, hoverMixCurrent.current);
        material.needsUpdate = true;
    });

    const handlePointerOver = useCallback(
        (event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            if (!enabled) return;
            hoverMixTarget.current = 1;
            if (!isHoveredRef.current) {
                isHoveredRef.current = true;
                playHover();
            }
            onHover(kind, event);
        },
        [enabled, kind, onHover, playHover],
    );

    const handlePointerOut = useCallback(
        (event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            hoverMixTarget.current = 0;
            isHoveredRef.current = false;
            onHover(null, event);
        },
        [onHover],
    );

    const handleClick = useCallback(
        (event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            if (!enabled) return;
            playClick();
            onClick();
        },
        [enabled, onClick, playClick],
    );

    return (
        <mesh
            position={position}
            rotation={TILE_OVERLAY_ROTATION}
            scale={[size[0], size[1], 1]}
            renderOrder={4}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerMove={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                ref={materialRef}
                map={buildTileButtonTexture(kind, enabled, 0)}
                transparent
                toneMapped={false}
                depthTest
                depthWrite={false}
                side={DoubleSide}
                polygonOffset
                polygonOffsetFactor={-3}
            />
        </mesh>
    );
}

export const TileButton = memo(TileButtonComponent);

export function getTileButtonLayout(planeWidth: number, planeHeight: number) {
    const buttonWidth = ((TILE_TEXTURE_WIDTH - 30) / 2 / TILE_TEXTURE_WIDTH) * planeWidth;
    const buttonHeight = ((TILE_BUTTON_BAR_HEIGHT - 12) / TILE_TEXTURE_HEIGHT) * planeHeight;
    const gapX = (10 / TILE_TEXTURE_WIDTH) * planeWidth;
    const bottomPad = (6 / TILE_TEXTURE_HEIGHT) * planeHeight;
    const buttonY = -planeHeight / 2 + bottomPad + buttonHeight / 2;

    return {
        buttonWidth,
        buttonHeight,
        detail: {
            position: [-planeWidth / 2 + gapX + buttonWidth / 2, buttonY, TILE_BUTTON_Z] as [
                number,
                number,
                number,
            ],
            size: [buttonWidth, buttonHeight] as [number, number],
        },
        play: {
            position: [planeWidth / 2 - gapX - buttonWidth / 2, buttonY, TILE_BUTTON_Z] as [
                number,
                number,
                number,
            ],
            size: [buttonWidth, buttonHeight] as [number, number],
        },
    };
}
