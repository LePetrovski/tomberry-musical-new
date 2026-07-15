import { Center, RoundedBox, Text3D } from "@react-three/drei";
import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Mesh } from "three";
import {
    EPISODE_BADGE_BG_COLOR,
    EPISODE_BADGE_BG_DEPTH,
    EPISODE_BADGE_BG_PAD_X,
    EPISODE_BADGE_BG_PAD_Y,
    EPISODE_BADGE_BG_RADIUS,
    EPISODE_BADGE_FONT,
    EPISODE_BADGE_HEIGHT,
    EPISODE_BADGE_PADDING_X,
    EPISODE_BADGE_PADDING_Y,
    EPISODE_BADGE_TEXT_COLOR,
    EPISODE_BADGE_TEXT_DEPTH,
    EPISODE_BADGE_TEXT_SIZE,
    EPISODE_BADGE_Z,
    TILE_OVERLAY_ROTATION,
    TILE_PLANE_HEIGHT,
    TILE_PLANE_WIDTH,
} from "./constants";

type Props = {
    episodeNumber: number;
    tileScale: number;
};

function estimateBadgeWidth(digits: number, tileScale: number) {
    return (0.09 + digits * 0.034) * tileScale;
}

function EpisodeBadgeComponent({ episodeNumber, tileScale }: Props) {
    const textRef = useRef<Mesh>(null);
    const safeTileScale = Number.isFinite(tileScale) && tileScale > 0 ? tileScale : 1;
    const label = String(episodeNumber);
    const textSize = EPISODE_BADGE_TEXT_SIZE * safeTileScale;
    const textDepth = EPISODE_BADGE_TEXT_DEPTH * safeTileScale;
    const badgeH = EPISODE_BADGE_HEIGHT * safeTileScale;

    const [bgSize, setBgSize] = useState<[number, number]>(() => [
        estimateBadgeWidth(label.length, safeTileScale),
        badgeH,
    ]);

    const syncBadgeSize = useCallback(() => {
        const mesh = textRef.current;
        if (!mesh) return;

        mesh.geometry.computeBoundingBox();
        const box = mesh.geometry.boundingBox;
        if (!box) return;

        const padX = EPISODE_BADGE_BG_PAD_X * safeTileScale;
        const padY = EPISODE_BADGE_BG_PAD_Y * safeTileScale;
        const width = box.max.x - box.min.x + padX * 2;
        const height = Math.max(box.max.y - box.min.y + padY * 2, badgeH);

        setBgSize((prev) => {
            if (Math.abs(prev[0] - width) < 0.0001 && Math.abs(prev[1] - height) < 0.0001) {
                return prev;
            }
            return [width, height];
        });
    }, [badgeH, safeTileScale]);

    useLayoutEffect(() => {
        const frame = requestAnimationFrame(syncBadgeSize);
        return () => cancelAnimationFrame(frame);
    }, [label, syncBadgeSize, textDepth, textSize]);

    const { x, y } = useMemo(() => {
        const planeWidth = TILE_PLANE_WIDTH * safeTileScale;
        const planeHeight = TILE_PLANE_HEIGHT * safeTileScale;
        const [badgeW] = bgSize;

        return {
            x: planeWidth * -0.2 - EPISODE_BADGE_PADDING_X * safeTileScale - badgeW * 0.5,
            y: planeHeight * 0.5 - EPISODE_BADGE_PADDING_Y * safeTileScale - badgeH * 0.5,
        };
    }, [badgeH, bgSize, safeTileScale]);

    const bgDepth = EPISODE_BADGE_BG_DEPTH * safeTileScale;
    const bgRadius = EPISODE_BADGE_BG_RADIUS * safeTileScale;

    return (
        <group position={[x, y, EPISODE_BADGE_Z]} rotation={TILE_OVERLAY_ROTATION}>

            <Center position={[0, 0, bgDepth * 0.55]}>
                <Text3D
                    ref={textRef}
                    font={EPISODE_BADGE_FONT}
                    size={textSize}
                    height={textDepth}
                    curveSegments={8}
                    bevelEnabled={false}
                    letterSpacing={-0.012}
                    castShadow={true}
                >
                    {label}
                    <meshPhysicalMaterial color={EPISODE_BADGE_TEXT_COLOR} toneMapped={false}
                    roughness={0.5}
                    metalness={0.0}
                    clearcoat={0.0}
                    clearcoatRoughness={0.5}
                    envMapIntensity={0.1}
                    specularIntensity={0.1}
                    specularColor={EPISODE_BADGE_TEXT_COLOR}
                />
                </Text3D>
            </Center>
        </group>
    );
}

export const EpisodeBadge = memo(EpisodeBadgeComponent);
