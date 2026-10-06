import type { SoundCloudPlayerState } from "@/components/audio/SoundCloudPlayerContext";
import { usePageCurtains } from "@/components/navigation/PageCurtainsProvider";
import { useSceneLoad } from "@/components/initial-loader/SceneLoadProvider";
import { textureProxyUrlFor } from "@/lib/sanity/image";
import { Bvh } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Object3D, PlaneGeometry, Texture } from "three";
import {
    TUBE_REPEAT_COUNT,
} from "./constants";
import { PodcastTile } from "./PodcastTile";
import { ProgressiveCover } from "./ProgressiveCover";
import { SceneAsset } from "./SceneAsset";
import { TileFrameProvider, type TileFrameUpdate } from "./TileFrameScheduler";
import type { ImageTubeProps } from "./types";
import { disposeTileImageMaterial } from "./utils/tile-image-material";
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
    const [placeholder, setPlaceholder] = useState<Texture | null>(null);
    const [coverTextures, setCoverTextures] = useState<Map<string, Texture>>(() => new Map());

    const registerCover = useCallback((url: string, texture: Texture) => {
        setCoverTextures((current) => new Map(current).set(url, texture));
        return () => {
            setCoverTextures((current) => {
                if (current.get(url) !== texture) return current;
                const next = new Map(current);
                next.delete(url);
                return next;
            });
        };
    }, []);

    useLayoutEffect(() => {
        scrollCurrent.current = scrollTargetRef.current;
    }, [scrollTargetRef]);

    const angle = useRef(0);
    const rotationSpeedScale = useRef(1);

    const imageUrls = useMemo(
        () =>
            (podcasts ?? []).map((podcast) =>
                podcast.coverImage ? textureProxyUrlFor(podcast.coverImage) : null,
            ),
        [podcasts],
    );

    const uniqueImageUrls = useMemo(
        () => [...new Set(imageUrls.filter((url): url is string => url !== null))],
        [imageUrls],
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
        const texture = buildPodcastTileTexture();
        // Canvas textures are created only after the WebGL scene mounts.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPlaceholder(texture);
        return () => {
            disposeTileImageMaterial(texture);
            texture.dispose();
        };
    }, []);

    useEffect(() => () => {
        if (readyFrameRef.current !== null) cancelAnimationFrame(readyFrameRef.current);
        readyFrameRef.current = null;
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
        if (readyFrameRef.current === null && (podcasts.length === 0 || (placeholder && groupRef.current))) {
            // The next browser frame sees usable tiles, even while covers are pending.
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

    return (
        <TileFrameProvider scheduler={tileFrameScheduler}>
        {uniqueImageUrls.map((url) => (
            <SceneAsset key={url} label={`Cover ${url}`}>
                <ProgressiveCover url={url} register={registerCover} />
            </SceneAsset>
        ))}
        {podcasts.length > 0 && placeholder && (
        <Bvh firstHitOnly>
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
                                    tileTexture={(imageUrls[podcastIndex] && coverTextures.get(imageUrls[podcastIndex])) || placeholder}
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
        </Bvh>
        )}
        </TileFrameProvider>
    );
}
