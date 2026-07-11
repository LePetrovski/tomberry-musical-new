"use client";

import { Bvh, Environment, Loader, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useSoundCloudPlayer } from "@/components/audio/SoundCloudPlayerContext";
import { textureProxyUrlFor } from "@/lib/sanity/image";
import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Vector2 } from "three";
import { CrystalScene } from "./CrystalScene";
import {
  CAMERA_FOV,
  CAMERA_POSITION,
  TUBE_COLS,
  TUBE_REPEAT_COUNT,
  TUBE_ROWS,
  TUBE_Y_SPACING,
} from "./constants";
import { GridPlane } from "./GridPlane";
import { useSliderInteractions } from "./hooks/useSliderInteractions";
import { ImageTube } from "./ImageTube";
import type { PodcastSliderProps } from "./types";
import { getLatestRowScrollOffset } from "./utils/tube-scroll";

export function PodcastSlider({ podcasts }: PodcastSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetCenterUv = useRef(new Vector2(0.5, 0.5));
  const { play } = useSoundCloudPlayer();

  const coverUrls = useMemo(
    () =>
      podcasts.map((podcast) =>
        podcast.coverImage ? textureProxyUrlFor(podcast.coverImage) : null,
      ).filter((url): url is string => Boolean(url)),
    [podcasts],
  );

  useEffect(() => {
    if (coverUrls.length > 0) {
      useTexture.preload(coverUrls);
    }
  }, [coverUrls]);

  const initialTubeScroll = useMemo(
    () => getLatestRowScrollOffset(TUBE_ROWS, TUBE_Y_SPACING, TUBE_REPEAT_COUNT),
    [],
  );

  const tubeScrollTarget = useRef(initialTubeScroll);
  const tubeSpinVelocity = useRef(0);
  const tubeNaturalDir = useRef(1);
  const tubeAngle = useRef(0);

  const baseSpeedRef = useRef(0.16);
  const hoverSlowdownEnabledRef = useRef(true);
  const hoverSlowdownScaleRef = useRef(0.28);
  const rotationSpeedScaleTargetRef = useRef(1);
  const rotationSpeedScaleLerpRef = useRef(0.12);

  const {
    tooltipElRef,
    onImageHoverStart,
    onImageHoverMove,
    onImageHoverEnd,
    onWheel,
  } = useSliderInteractions({
    containerRef,
    targetCenterUv,
    tubeScrollTarget,
    tubeSpinVelocity,
    tubeNaturalDir,
    rotationSpeedScaleTargetRef,
    hoverSlowdownEnabledRef,
    hoverSlowdownScaleRef,
  });

  return (
    <div className="sceneRoot h-full w-full" ref={containerRef} onWheel={onWheel}>
      <Canvas
        className="sceneCanvas"
        camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0, 0);
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Environment preset="studio" blur={10.5} />

          <Bvh firstHitOnly>
            <GridPlane targetCenterUv={targetCenterUv} />
            <ImageTube
              scrollTargetRef={tubeScrollTarget}
              spinVelocityRef={tubeSpinVelocity}
              naturalDirRef={tubeNaturalDir}
              tubeAngleRef={tubeAngle}
              rotationSpeedScaleTargetRef={rotationSpeedScaleTargetRef}
              rotationSpeedScaleLerpRef={rotationSpeedScaleLerpRef}
              baseSpeedRef={baseSpeedRef}
              podcasts={podcasts}
              rows={TUBE_ROWS}
              cols={TUBE_COLS}
              onHoverStart={onImageHoverStart}
              onHoverMove={onImageHoverMove}
              onHoverEnd={onImageHoverEnd}
              onPlayPodcast={play}
            />
            <CrystalScene tubeAngleRef={tubeAngle} />
          </Bvh>
          <Preload all />
        </Suspense>
      </Canvas>

      <div className="whiteEdgeGradient" aria-hidden="true" />
      <div
        className="projectTooltip"
        ref={tooltipElRef}
        role="status"
        aria-live="polite"
        style={{ opacity: 0, visibility: "hidden" }}
      />

      <Loader />
    </div>
  );
}
