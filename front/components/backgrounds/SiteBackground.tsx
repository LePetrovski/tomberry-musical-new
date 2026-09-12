"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";

const CRTWarp = dynamic(() => import("./CRTWarp"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#05010a]" />,
});

export function SiteBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 bg-[#05010a]"
      aria-hidden="true"
    >
      <CRTWarp
        color="#649FA8"
        backgroundColor="#FAFAFA"
        speed={0.1}
        curvature={0.25}
        scanlineStrength={0.25}
        scanlineFrequency={200}
        waveAmplitude={0.3}
        waveFrequency={2.5}
        bloom={1.5}
        bloomRadius={1}
        noise={0.1}
        vignette={0}
        brightness={1.25}
        pixelation={1}
        rgbShift={0.015}
        mouseReact={!prefersReducedMotion}
        mouseStrength={0.5}
        dpr={1}
        fps={30}
        paused={Boolean(prefersReducedMotion)}
      />
    </div>
  );
}
