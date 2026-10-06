"use client";

import { Environment } from "@react-three/drei";
import {
  SceneFailureFallback,
  SceneLoadReporter,
  SceneReveal,
} from "@/components/initial-loader/SceneLoading";
import { SceneLoadProvider } from "@/components/initial-loader/SceneLoadProvider";
import { Canvas, useThree } from "@react-three/fiber";
import { useSoundCloudPlayer } from "@/components/audio/SoundCloudPlayerContext";
import { useEffect, useMemo, useRef } from "react";
import { PerspectiveCamera } from "three";
import { CrystalScene } from "./CrystalScene";
import {
  SLIDER_ENV_INTENSITY,
  SLIDER_ENVIRONMENT_URL,
  TUBE_COLS,
  TUBE_REPEAT_COUNT,
  TUBE_ROWS,
  TUBE_Y_SPACING,
  type SliderResponsiveConfig,
} from "./constants";
import { useSliderInteractions } from "./hooks/useSliderInteractions";
import { useSliderResponsive } from "./hooks/useSliderResponsive";
import { ImageTube } from "./ImageTube";
import { SceneAsset } from "./SceneAsset";
import { TileSoundProvider } from "./TileSoundProvider";
import type { PodcastSliderProps } from "./types";
import { getLatestRowScrollOffset } from "./utils/tube-scroll";

function ResponsiveCamera({ config }: { config: SliderResponsiveConfig }) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;

    camera.position.set(...config.cameraPosition);
    // React Three Fiber owns the camera, which is intentionally mutable.
    // eslint-disable-next-line react-hooks/immutability
    camera.fov = config.cameraFov;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, config]);

  return null;
}

export function PodcastSlider({ podcasts }: PodcastSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSoundCloudPlayer();
  const { config } = useSliderResponsive();

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
    tubeScrollTargetRef: tubeScrollTarget,
    tubeSpinVelocityRef: tubeSpinVelocity,
    tubeNaturalDirRef: tubeNaturalDir,
    rotationSpeedScaleTargetRef,
    hoverSlowdownEnabledRef,
    hoverSlowdownScaleRef,
    scrollWheelMultiplierRef,
    scrollTouchMultiplierRef,
  });

  return (
    <TileSoundProvider>
    <SceneLoadProvider>
    <SceneReveal className="sceneRoot h-full w-full" ref={containerRef} onWheel={onWheel}>
      <SceneLoadReporter />
      <Canvas
        className="sceneCanvas"
        camera={{ position: config.cameraPosition, fov: config.cameraFov }}
        gl={{ alpha: true }}
        onCreated={({ camera, gl, scene }) => {
          camera.lookAt(0, 0, 0);
          gl.setClearColor(0x000000, 0);
          scene.environmentIntensity = SLIDER_ENV_INTENSITY;
        }}
      >
        <ResponsiveCamera config={config} />
        <ambientLight intensity={0.42} />
        <directionalLight position={[5, 6, 5]} intensity={0.55} />
        <SceneAsset label="Environment">
          <Environment files={SLIDER_ENVIRONMENT_URL} blur={2.4} />
        </SceneAsset>

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
        <SceneAsset label="Crystals">
          <CrystalScene tubeAngleRef={tubeAngle} />
        </SceneAsset>
      </Canvas>

      <div
        className="projectTooltip"
        ref={tooltipElRef}
        role="status"
        aria-live="polite"
        style={{ opacity: 0, visibility: "hidden" }}
      />

    </SceneReveal>
    <SceneFailureFallback isEmpty={podcasts.length === 0} />
    </SceneLoadProvider>
    </TileSoundProvider>
  );
}
