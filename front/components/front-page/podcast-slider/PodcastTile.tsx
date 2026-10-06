import type { ThreeEvent } from "@react-three/fiber";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { Group, Mesh, PlaneGeometry, Texture } from "three";
import {
    TILE_BUTTON_BAR_UV,
    TILE_COVER_ROTATION,
    TILE_PLANE_HEIGHT,
    TILE_PLANE_WIDTH,
    TILE_TILT_AZIMUTH_MAX,
    TILE_TILT_POLAR_MAX,
} from "./constants";
import type { TileButtonHover, TileHoverHandlers } from "./types";
import { getTileImageMaterial } from "./utils/tile-image-material";
import { EpisodeBadge } from "./EpisodeBadge";
import { SceneAsset } from "./SceneAsset";
import { TileButton, getTileButtonLayout } from "./TileButton";
import { useTileFrameScheduler } from "./TileFrameScheduler";

type Props = TileHoverHandlers & {
    planeGeometry: PlaneGeometry;
    tileTexture: Texture;
    tileScale: number;
    title: string;
    episodeNumber?: number;
    canPlay: boolean;
    onPlay: () => void;
    onOpenDetail: () => void;
};

function PodcastTileComponent({
    planeGeometry,
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
    const tileFrameScheduler = useTileFrameScheduler();
    const meshRef = useRef<Mesh>(null);
    const tiltGroupRef = useRef<Group>(null);
    const tiltTargetX = useRef(0);
    const tiltTargetY = useRef(0);
    const isTileHoveredRef = useRef(false);
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
        mesh.material = getTileImageMaterial(tileTexture);
    }, [tileTexture]);

    const updateTilt = useCallback((delta: number) => {
        const group = tiltGroupRef.current;
        if (!group) return false;

        const step = 1 - Math.pow(0.001, delta);
        const targetX = isTileHoveredRef.current ? tiltTargetX.current : 0;
        const targetY = isTileHoveredRef.current ? tiltTargetY.current : 0;
        group.rotation.x += (targetX - group.rotation.x) * step;
        group.rotation.y += (targetY - group.rotation.y) * step;

        const moving = Math.abs(group.rotation.x - targetX) > 0.0001 ||
            Math.abs(group.rotation.y - targetY) > 0.0001;
        if (!moving && !isTileHoveredRef.current) {
            group.rotation.set(0, 0, 0);
            tiltTargetX.current = 0;
            tiltTargetY.current = 0;
        }
        return moving;
    }, []);

    useEffect(() => () => tileFrameScheduler.cancel(updateTilt), [tileFrameScheduler, updateTilt]);

    const updateTiltFromPointer = useCallback((event: ThreeEvent<PointerEvent>) => {
        if (!event.uv) return;
        const u = event.uv.x;
        const v = event.uv.y;
        tiltTargetX.current = -(v - 0.5) * 2 * TILE_TILT_POLAR_MAX;
        tiltTargetY.current = (u - 0.5) * 2 * TILE_TILT_AZIMUTH_MAX;
        isTileHoveredRef.current = true;
        tileFrameScheduler.request(updateTilt);
    }, [tileFrameScheduler, updateTilt]);

    const resetTilt = useCallback(() => {
        isTileHoveredRef.current = false;
        tileFrameScheduler.request(updateTilt);
    }, [tileFrameScheduler, updateTilt]);

    const handleCoverPointerOver = useCallback(
        (event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            if (event.uv && event.uv.y <= TILE_BUTTON_BAR_UV) return;
            updateTiltFromPointer(event);
            onHoverStart(title, event);
            onHoverMove(event, null);
        },
        [onHoverMove, onHoverStart, title, updateTiltFromPointer],
    );

    const handleCoverPointerMove = useCallback(
        (event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            if (event.uv && event.uv.y <= TILE_BUTTON_BAR_UV) return;
            updateTiltFromPointer(event);
            onHoverMove(event, null);
        },
        [onHoverMove, updateTiltFromPointer],
    );

    const handleCoverPointerOut = useCallback(
        (event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            resetTilt();
            onHoverEnd();
        },
        [onHoverEnd, resetTilt],
    );

    const handleButtonHover = useCallback(
        (hover: TileButtonHover, event: ThreeEvent<PointerEvent>) => {
            if (hover) updateTiltFromPointer(event);
            onHoverStart(title, event);
            onHoverMove(event, hover);
        },
        [onHoverMove, onHoverStart, title, updateTiltFromPointer],
    );

    const handleButtonHoverEnd = useCallback(() => {
        resetTilt();
        onHoverEnd();
    }, [onHoverEnd, resetTilt]);

    return (
        <group ref={tiltGroupRef}>
            <mesh
                ref={meshRef}
                geometry={planeGeometry}
                rotation={TILE_COVER_ROTATION}
                scale={[planeWidth, planeHeight, 1]}
                onPointerOver={handleCoverPointerOver}
                onPointerMove={handleCoverPointerMove}
                onPointerOut={handleCoverPointerOut}
            >
            </mesh>
            <TileButton
                planeGeometry={planeGeometry}
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
                planeGeometry={planeGeometry}
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
                <SceneAsset label="Episode badge">
                    <EpisodeBadge episodeNumber={episodeNumber} tileScale={safeTileScale} />
                </SceneAsset>
            )}
        </group>
    );
}

export const PodcastTile = memo(PodcastTileComponent);
