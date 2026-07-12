"use client";

import { useEffect, useState } from "react";
import {
  SLIDER_MOBILE_QUERY,
  SLIDER_RESPONSIVE,
  type SliderResponsiveConfig,
} from "../constants";

export function useSliderResponsive() {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" && window.matchMedia(SLIDER_MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(SLIDER_MOBILE_QUERY);
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const config: SliderResponsiveConfig = isMobile
    ? SLIDER_RESPONSIVE.mobile
    : SLIDER_RESPONSIVE.desktop;

  return { isMobile, config };
}
