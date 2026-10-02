import type { SoundCloudPlayerState } from "@/components/audio/SoundCloudPlayerContext";
import { usePageCurtains } from "@/components/navigation/PageCurtainsProvider";
import { useSceneLoad } from "@/components/initial-loader/SceneLoadProvider";
import { textureProxyUrlFor } from "@/lib/sanity/image";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Object3D, PlaneGeometry, Texture } from "three";
import {
    PLACEHOLDER_TEXTURE,
    TUBE_REPEAT_COUNT,
} from "./constants";
import { PodcastTile } from "./PodcastTile";
import { TileFrameProvider, type TileFrameUpdate } from "./TileFrameScheduler";
import type { ImageTubeProps } from "./types";
import { disposeTileMaterialCache } from "./utils/tile-image-material";
import { buildPodcastTileTexture } from "./utils/tile-texture";

export function ImageTube({
    scrollTargetRef,
    spinVelocityRef,
    naturalDirRef,
    tubeAngleRef,
    rotationSpeedScaleTargetRef,
    rotationSpeedScaleLerpRef,
    baseSpeedRef,
    podcasts,
    rows,
    cols,
    tileScale,
    ySpacing,
    tubeRadius,
    onHoverStart,
    onHoverMove,
    onHoverEnd,
    onPlayPodcast,
}: ImageTubeProps) {
    const { navigate } = usePageCurtains();
    const { reportReady } = useSceneLoad();
    const groupRef = useRef<Object3D>(null);
    const readyFrameRef = useRef<number | null>(null);
    const activeTileUpdates = useRef(new Set<TileFrameUpdate>());
    const tileFrameScheduler = useMemo(() => ({
        request: (update: TileFrameUpdate) => { activeTileUpdates.current.add(update); },
        cancel: (update: TileFrameUpdate) => { activeTileUpdates.current.delete(update); },
    }), []);
    const rowGroupRefs = useRef<Array<Object3D | null>>([]);
    const scrollCurrent = useRef(0);
    const [tileTextures, setTileTextures] = useState<Texture[]>([]);

    useLayoutEffect(() => {
        scrollCurrent.current = scrollTargetRef.current;
    }, [scrollTargetRef]);

    const angle = useRef(0);
    const rotationSpeedScale = useRef(1);

    const imageUrls = useMemo(
        () =>
            (podcasts ?? []).map((podcast) =>
                podcast.coverImage ? textureProxyUrlFor(podcast.coverImage) : PLACEHOLDER_TEXTURE,
            ),
        [podcasts],
    );

    const loadedTextures = useTexture(
        imageUrls.length > 0 ? imageUrls : [PLACEHOLDER_TEXTURE],
    );
    const planeGeometry = useMemo(() => new PlaneGeometry(1, 1), []);

    const playAvailability = useMemo(
        () =>
            podcasts.map((podcast) => Boolean(podcast.embedUrl)),
        [podcasts],
    );

    const podcastHandlers = useMemo(
        () =>
            podcasts.map((podcast, index) => ({
                canPlay: playAvailability[index],
                onPlay: () => {
                    const embedUrl = podcast.embedUrl;
                    if (!embedUrl) return;

                    const player: SoundCloudPlayerState = {
                        title: podcast.title,
                        embedUrl,
                        slug: podcast.slug,
                    };
                    onPlayPodcast(player);
                },
                onOpenDetail: () => {
                    void navigate(`/podcasts/${podcast.slug}`);
                },
            })),
        [navigate, onPlayPodcast, playAvailability, podcasts],
    );

    useEffect(() => {
        if (podcasts.length === 0) {
            // The decoded texture set is synchronized with the asynchronous Three.js loader.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTileTextures([]);
            return;
        }

        const coverTextures = Array.isArray(loadedTextures)
            ? loadedTextures
            : [loadedTextures];

        const built = podcasts.map((_, index) =>
            buildPodcastTileTexture(coverTextures[index]),
        );

        setTileTextures(built);

        return () => {
            built.forEach((texture) => texture.dispose());
            disposeTileMaterialCache();
        };
    }, [loadedTextures, podcasts]);

    useEffect(() => () => {
        if (readyFrameRef.current !== null) cancelAnimationFrame(readyFrameRef.current);
        planeGeometry.dispose();
    }, [planeGeometry]);

    const loopHeight = rows * ySpacing;
    const repeatCount = TUBE_REPEAT_COUNT;
    const totalRows = rows * repeatCount;

    const rowSpeed = useMemo(() => {
        const speeds: number[] = [];
        for (let r = 0; r < rows; r++) {
            const t = rows <= 1 ? 0 : r / (rows - 1);
            const distFromCenter = Math.abs(t - 0.5) * 2;
            speeds.push(0.38 + distFromCenter * 0.28);
        }
        return speeds;
    }, [rows]);

    const rowPositions = useMemo(() => {
        const out: Array<{ rowIndex: number; y: number; baseRow: number; rowOffset: number }> = [];
        for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
            const y = (rowIndex - (totalRows - 1) / 2) * ySpacing;
            const baseRow = rowIndex % rows;
            const rowOffset = baseRow % 2 === 0 ? 0 : 0.5;
            out.push({ rowIndex, y, baseRow, rowOffset });
        }
        return out;
    }, [rows, totalRows, ySpacing]);

    useFrame((_state, dt) => {
        if (readyFrameRef.current === null && tileTextures.length === podcasts.length) {
            // useFrame runs just before drawing; the next browser frame sees a complete scene.
            readyFrameRef.current = requestAnimationFrame(reportReady);
        }

        for (const update of activeTileUpdates.current) {
            if (!update(dt)) activeTileUpdates.current.delete(update);
        }

        scrollCurrent.current += (scrollTargetRef.current - scrollCurrent.current) * 0.12;

        if (scrollCurrent.current > loopHeight / 2) {
            scrollCurrent.current -= loopHeight;
            scrollTargetRef.current -= loopHeight;
        } else if (scrollCurrent.current < -loopHeight / 2) {
            scrollCurrent.current += loopHeight;
            scrollTargetRef.current += loopHeight;
        }

        const damping = 0.92;
        spinVelocityRef.current *= Math.pow(damping, dt * 60);
        spinVelocityRef.current = Math.max(-2.0, Math.min(2.0, spinVelocityRef.current));

        rotationSpeedScale.current +=
            (rotationSpeedScaleTargetRef.current - rotationSpeedScale.current) *
            rotationSpeedScaleLerpRef.current;

        const scaledDt = dt * rotationSpeedScale.current;
        const baseSpeed = naturalDirRef.current * baseSpeedRef.current;
        angle.current += (baseSpeed + spinVelocityRef.current) * scaledDt;
        tubeAngleRef.current = angle.current;

        const group = groupRef.current;
        if (!group) return;
        group.position.y = -scrollCurrent.current;

        for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
            const rowObj = rowGroupRefs.current[rowIndex];
            if (!rowObj) continue;
            const baseRow = rowIndex % rows;
            rowObj.rotation.y = angle.current * rowSpeed[baseRow];
        }
    });

    if (podcasts.length === 0 || tileTextures.length !== podcasts.length) return null;

    return (
        <TileFrameProvider scheduler={tileFrameScheduler}>
        <group ref={groupRef}>
            {rowPositions.map(({ rowIndex, y, baseRow, rowOffset }) => (
                <group
                    key={rowIndex}
                    position={[0, y, 0]}
                    ref={(obj) => {
                        rowGroupRefs.current[rowIndex] = obj;
                    }}
                >
                    {Array.from({ length: cols }).map((_, col) => {
                        const theta = ((col + rowOffset) / cols) * Math.PI * 2;
                        const x = Math.cos(theta) * tubeRadius;
                        const z = Math.sin(theta) * tubeRadius;
                        const ry = -(theta + Math.PI / 2);
                        const podcastIndex = (baseRow * cols + col) % podcasts.length;
                        const podcast = podcasts[podcastIndex];
                        const handlers = podcastHandlers[podcastIndex];

                        return (
                            <group key={col} position={[x, 0, z]} rotation={[0, ry, 0]}>
                                <PodcastTile
                                    planeGeometry={planeGeometry}
                                    tileTexture={tileTextures[podcastIndex]}
                                    tileScale={tileScale}
                                    title={podcast.title}
                                    episodeNumber={podcast.episodeNumber}
                                    canPlay={handlers.canPlay}
                                    onPlay={handlers.onPlay}
                                    onOpenDetail={handlers.onOpenDetail}
                                    onHoverStart={onHoverStart}
                                    onHoverMove={onHoverMove}
                                    onHoverEnd={onHoverEnd}
                                />
                            </group>
                        );
                    })}
                </group>
            ))}
        </group>
        </TileFrameProvider>
    );
}
