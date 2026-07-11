import type { ThreeEvent } from "@react-three/fiber";
import { useFrame, useThree } from "@react-three/fiber";
import { memo, useCallback, useLayoutEffect, useRef } from "react";
import type { Mesh, Texture } from "three";
import { TILE_BUTTON_BAR_UV, TILE_PLANE_HEIGHT, TILE_PLANE_WIDTH } from "./constants";
import type { TileButtonHover, TileHoverHandlers } from "./types";
import { getTileImageMaterial } from "./utils/tile-image-material";
import { getTileButtonFromUv, updateTileButtonHover } from "./utils/tile-texture";
import { EpisodeBadge } from "./EpisodeBadge";

const BUTTON_HOVER_LERP_SPEED = 10;

type Props = TileHoverHandlers & {
    tileTexture: Texture;
    title: string;
    episodeNumber?: number;
    canPlay: boolean;
    onPlay: () => void;
    onOpenDetail: () => void;
};

function PodcastTileComponent({
    tileTexture,
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
    const hoverMixTarget = useRef({ play: 0, detail: 0 });
    const hoverMixCurrent = useRef({ play: 0, detail: 0 });
    const size = useThree((state) => state.size);
    const resolution = Math.max(size.width, size.height);

    useLayoutEffect(() => {
        const mesh = meshRef.current;
        if (!mesh) return;
        mesh.material = getTileImageMaterial(tileTexture, resolution);
    }, [resolution, tileTexture]);

    const setButtonHoverTarget = useCallback((hover: TileButtonHover) => {
        hoverMixTarget.current = {
            play: hover === "play" ? 1 : 0,
            detail: hover === "detail" ? 1 : 0,
        };
    }, []);

    useFrame((_, delta) => {
        const target = hoverMixTarget.current;
        const current = hoverMixCurrent.current;
        const step = Math.min(1, BUTTON_HOVER_LERP_SPEED * delta);
        let dirty = false;

        for (const key of ["play", "detail"] as const) {
            const next = current[key] + (target[key] - current[key]) * step;
            if (Math.abs(next - current[key]) > 0.002) {
                current[key] = next;
                dirty = true;
            } else if (current[key] !== target[key]) {
                current[key] = target[key];
                dirty = true;
            }
        }

        if (dirty) {
            updateTileButtonHover(tileTexture, current.play, current.detail);
        }
    });

    const handleClick = useCallback(
        (event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            const uv = event.uv;
            if (!uv) return;

            if (uv.y <= TILE_BUTTON_BAR_UV) {
                if (uv.x >= 0.5) {
                    if (canPlay) onPlay();
                } else {
                    onOpenDetail();
                }
            }
        },
        [canPlay, onOpenDetail, onPlay],
    );

    const handlePointerOver = useCallback(
        (event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            onHoverStart(title, event);
            const buttonHover = event.uv ? getTileButtonFromUv(event.uv, canPlay) : null;
            setButtonHoverTarget(buttonHover);
            onHoverMove(event, buttonHover);
        },
        [canPlay, onHoverMove, onHoverStart, setButtonHoverTarget, title],
    );

    const handlePointerMove = useCallback(
        (event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            const buttonHover = event.uv ? getTileButtonFromUv(event.uv, canPlay) : null;
            setButtonHoverTarget(buttonHover);
            onHoverMove(event, buttonHover);
        },
        [canPlay, onHoverMove, setButtonHoverTarget],
    );

    const handlePointerOut = useCallback(
        (event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            setButtonHoverTarget(null);
            onHoverEnd();
        },
        [onHoverEnd, setButtonHoverTarget],
    );

    return (
        <group>
            <mesh
                ref={meshRef}
                scale={[TILE_PLANE_WIDTH, TILE_PLANE_HEIGHT, 1]}
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerMove={handlePointerMove}
                onPointerOut={handlePointerOut}
            >
                <planeGeometry args={[1, 1]} />
            </mesh>
            {episodeNumber != null && <EpisodeBadge episodeNumber={episodeNumber} />}
        </group>
    );
}

export const PodcastTile = memo(PodcastTileComponent);
