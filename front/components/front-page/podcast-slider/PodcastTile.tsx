import type { ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useCallback } from "react";
import { memo } from "react";
import type { Mesh, Texture } from "three";
import { TILE_BUTTON_BAR_UV, TILE_PLANE_HEIGHT, TILE_PLANE_WIDTH } from "./constants";
import type { TileButtonHover, TileHoverHandlers } from "./types";
import { getTileImageMaterial } from "./utils/tile-image-material";
import { EpisodeBadge } from "./EpisodeBadge";
import { TileButton, getTileButtonLayout } from "./TileButton";
import { useThree } from "@react-three/fiber";

type Props = TileHoverHandlers & {
    tileTexture: Texture;
    tileScale: number;
    title: string;
    episodeNumber?: number;
    canPlay: boolean;
    onPlay: () => void;
    onOpenDetail: () => void;
};

function PodcastTileComponent({
    tileTexture,
    tileScale,
    title,
    episodeNumber,
    canPlay,
    onPlay,
    onOpenDetail,
    onHoverStart,
    onHoverMove,
    onHoverEnd,
}: Props) {
    const meshRef = useRef<Mesh>(null);
    const size = useThree((state) => state.size);
    const resolution = Math.max(size.width, size.height);
    const safeTileScale = Number.isFinite(tileScale) && tileScale > 0 ? tileScale : 1;
    const planeWidth = TILE_PLANE_WIDTH * safeTileScale;
    const planeHeight = TILE_PLANE_HEIGHT * safeTileScale;
    const buttonLayout = useMemo(
        () => getTileButtonLayout(planeWidth, planeHeight),
        [planeHeight, planeWidth],
    );

    useLayoutEffect(() => {
        const mesh = meshRef.current;
        if (!mesh) return;
        const material = getTileImageMaterial(tileTexture, resolution);
        material.scale.set(planeWidth, planeHeight);
        mesh.material = material;
    }, [planeHeight, planeWidth, resolution, tileTexture]);

    const handleCoverPointerOver = useCallback(
        (event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            if (event.uv && event.uv.y <= TILE_BUTTON_BAR_UV) return;
            onHoverStart(title, event);
            onHoverMove(event, null);
        },
        [onHoverMove, onHoverStart, title],
    );

    const handleCoverPointerMove = useCallback(
        (event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            if (event.uv && event.uv.y <= TILE_BUTTON_BAR_UV) return;
            onHoverMove(event, null);
        },
        [onHoverMove],
    );

    const handleCoverPointerOut = useCallback(
        (event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            onHoverEnd();
        },
        [onHoverEnd],
    );

    const handleButtonHover = useCallback(
        (hover: TileButtonHover, event: ThreeEvent<PointerEvent>) => {
            onHoverStart(title, event);
            onHoverMove(event, hover);
        },
        [onHoverMove, onHoverStart, title],
    );

    const handleButtonHoverEnd = useCallback(() => {
        onHoverEnd();
    }, [onHoverEnd]);

    return (
        <group>
            <mesh
                ref={meshRef}
                scale={[planeWidth, planeHeight, 1]}
                onPointerOver={handleCoverPointerOver}
                onPointerMove={handleCoverPointerMove}
                onPointerOut={handleCoverPointerOut}
            >
                <planeGeometry args={[1, 1]} />
            </mesh>
            <TileButton
                kind="detail"
                enabled
                position={buttonLayout.detail.position}
                size={buttonLayout.detail.size}
                onClick={onOpenDetail}
                onHover={(hover, event) => {
                    if (hover) handleButtonHover(hover, event);
                    else handleButtonHoverEnd();
                }}
            />
            <TileButton
                kind="play"
                enabled={canPlay}
                position={buttonLayout.play.position}
                size={buttonLayout.play.size}
                onClick={onPlay}
                onHover={(hover, event) => {
                    if (hover) handleButtonHover(hover, event);
                    else handleButtonHoverEnd();
                }}
            />
            {episodeNumber != null && (
                <EpisodeBadge episodeNumber={episodeNumber} tileScale={safeTileScale} />
            )}
        </group>
    );
}

export const PodcastTile = memo(PodcastTileComponent);
