"use client";

import { Bvh, Environment, Loader, Preload } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useSoundCloudPlayer } from "@/components/audio/SoundCloudPlayerContext";
import { textureProxyUrlFor } from "@/lib/sanity/image";
import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { PerspectiveCamera, Vector2 } from "three";
import { CrystalScene } from "./CrystalScene";
import {
  TUBE_COLS,
  TUBE_REPEAT_COUNT,
  TUBE_ROWS,
  TUBE_Y_SPACING,
  type SliderResponsiveConfig,
} from "./constants";
import { GridPlane } from "./GridPlane";
import { useSliderInteractions } from "./hooks/useSliderInteractions";
import { useSliderResponsive } from "./hooks/useSliderResponsive";
import { ImageTube } from "./ImageTube";
import type { PodcastSliderProps } from "./types";
import { getLatestRowScrollOffset } from "./utils/tube-scroll";

function ResponsiveCamera({ config }: { config: SliderResponsiveConfig }) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;

    camera.position.set(...config.cameraPosition);
    camera.fov = config.cameraFov;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, config]);

  return null;
}

export function PodcastSlider({ podcasts }: PodcastSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetCenterUv = useRef(new Vector2(0.5, 0.5));
  const { play } = useSoundCloudPlayer();
  const { config } = useSliderResponsive();

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

  const baseSpeedRef = useRef(config.baseSpeed);
  const scrollWheelMultiplierRef = useRef(config.scrollWheelMultiplier);
  const scrollTouchMultiplierRef = useRef(config.scrollTouchMultiplier);
  const hoverSlowdownEnabledRef = useRef(true);
  const hoverSlowdownScaleRef = useRef(0.28);
  const rotationSpeedScaleTargetRef = useRef(1);
  const rotationSpeedScaleLerpRef = useRef(0.12);

  useEffect(() => {
    baseSpeedRef.current = config.baseSpeed;
    scrollWheelMultiplierRef.current = config.scrollWheelMultiplier;
    scrollTouchMultiplierRef.current = config.scrollTouchMultiplier;
  }, [config]);

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
    scrollWheelMultiplierRef,
    scrollTouchMultiplierRef,
  });

  return (
    <div className="sceneRoot h-full w-full" ref={containerRef} onWheel={onWheel}>
      <Canvas
        className="sceneCanvas"
        camera={{ position: config.cameraPosition, fov: config.cameraFov }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0, 0);
        }}
      >
        <ResponsiveCamera config={config} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Environment preset="studio" blur={10.5} />

          <Bvh firstHitOnly>
            <GridPlane
              targetCenterUv={targetCenterUv}
              gridScale={config.gridScale}
              gridScrollSpeed={config.gridScrollSpeed}
            />
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
              tileScale={config.tileScale}
              ySpacing={config.tubeYSpacing}
              tubeRadius={config.tubeRadius}
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
