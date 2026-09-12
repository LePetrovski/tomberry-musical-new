import type { ThreeEvent } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import type { TileButtonHover } from "../types";

type Options = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  tubeScrollTarget: React.MutableRefObject<number>;
  tubeSpinVelocity: React.MutableRefObject<number>;
  tubeNaturalDir: React.MutableRefObject<number>;
  rotationSpeedScaleTargetRef: React.MutableRefObject<number>;
  hoverSlowdownEnabledRef: React.MutableRefObject<boolean>;
  hoverSlowdownScaleRef: React.MutableRefObject<number>;
  scrollWheelMultiplierRef: React.MutableRefObject<number>;
  scrollTouchMultiplierRef: React.MutableRefObject<number>;
};

const HOVER_END_DELAY_MS = 80;

export function useSliderInteractions({
  containerRef,
  tubeScrollTarget,
  tubeSpinVelocity,
  tubeNaturalDir,
  rotationSpeedScaleTargetRef,
  hoverSlowdownEnabledRef,
  hoverSlowdownScaleRef,
  scrollWheelMultiplierRef,
  scrollTouchMultiplierRef,
}: Options) {
  const tooltipElRef = useRef<HTMLDivElement | null>(null);
  const hoverEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveringTile = useRef(false);
  const hoveredButtonRef = useRef<TileButtonHover>(null);

  const applyTooltipTransform = useCallback((x: number, y: number) => {
    const el = tooltipElRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${(x + 12).toFixed(2)}px, ${(y - 18).toFixed(2)}px, 0)`;
  }, []);

  const syncTooltipPosition = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = clientX - rect.left;
      const y = clientY - rect.top;
      applyTooltipTransform(x, y);
    },
    [applyTooltipTransform, containerRef],
  );

  const setSceneCursor = useCallback(
    (cursor: string) => {
      const canvas = containerRef.current?.querySelector("canvas");
      if (canvas instanceof HTMLCanvasElement) {
        canvas.style.cursor = cursor;
      }
    },
    [containerRef],
  );

  const hideTooltip = useCallback(() => {
    isHoveringTile.current = false;
    hoveredButtonRef.current = null;
    const el = tooltipElRef.current;
    if (el) {
      el.style.opacity = "0";
      el.style.visibility = "hidden";
    }
    setSceneCursor("default");
    rotationSpeedScaleTargetRef.current = 1;
  }, [rotationSpeedScaleTargetRef, setSceneCursor]);

  const showTooltip = useCallback(
    (projectName: string, clientX: number, clientY: number) => {
      isHoveringTile.current = true;
      const el = tooltipElRef.current;
      if (el) {
        el.textContent = projectName;
        el.style.opacity = "1";
        el.style.visibility = "visible";
      }

      syncTooltipPosition(clientX, clientY);

      if (hoverSlowdownEnabledRef.current && Math.abs(tubeSpinVelocity.current) < 0.35) {
        rotationSpeedScaleTargetRef.current = hoverSlowdownScaleRef.current;
      }
    },
    [
      hoverSlowdownEnabledRef,
      hoverSlowdownScaleRef,
      rotationSpeedScaleTargetRef,
      syncTooltipPosition,
      tubeSpinVelocity,
    ],
  );

  const setTileButtonHover = useCallback(
    (buttonHover: TileButtonHover) => {
      hoveredButtonRef.current = buttonHover;
      setSceneCursor(buttonHover ? "pointer" : "default");
    },
    [setSceneCursor],
  );

  const onImageHoverEnd = useCallback(() => {
    if (hoverEndTimer.current != null) {
      clearTimeout(hoverEndTimer.current);
    }

    hoverEndTimer.current = setTimeout(() => {
      hideTooltip();
      hoverEndTimer.current = null;
    }, HOVER_END_DELAY_MS);
  }, [hideTooltip]);

  const onImageHoverStart = useCallback(
    (projectName: string, event: ThreeEvent<PointerEvent>) => {
      if (hoverEndTimer.current != null) {
        clearTimeout(hoverEndTimer.current);
        hoverEndTimer.current = null;
      }

      showTooltip(projectName, event.nativeEvent.clientX, event.nativeEvent.clientY);
    },
    [showTooltip],
  );

  const onImageHoverMove = useCallback(
    (event: ThreeEvent<PointerEvent>, buttonHover: TileButtonHover) => {
      if (hoverEndTimer.current != null) {
        clearTimeout(hoverEndTimer.current);
        hoverEndTimer.current = null;
      }

      isHoveringTile.current = true;
      setTileButtonHover(buttonHover);
      syncTooltipPosition(event.nativeEvent.clientX, event.nativeEvent.clientY);
    },
    [setTileButtonHover, syncTooltipPosition],
  );

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const onPointerMove = (event: PointerEvent) => {
      if (isHoveringTile.current) {
        syncTooltipPosition(event.clientX, event.clientY);
      }
    };

    const onPointerLeave = () => {
      hideTooltip();
    };

    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (hoverEndTimer.current != null) clearTimeout(hoverEndTimer.current);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [containerRef, hideTooltip, syncTooltipPosition]);

  const applyScrollDelta = useCallback(
    (deltaY: number, touchMultiplier = 1) => {
      const amount = deltaY * scrollWheelMultiplierRef.current * touchMultiplier;
      tubeScrollTarget.current += amount;
      tubeSpinVelocity.current += amount * 1.56;

      if (deltaY < 0) tubeNaturalDir.current = -1;
      else if (deltaY > 0) tubeNaturalDir.current = 1;

      rotationSpeedScaleTargetRef.current = 1;
      hideTooltip();
    },
    [hideTooltip, rotationSpeedScaleTargetRef, scrollWheelMultiplierRef, tubeNaturalDir, tubeScrollTarget, tubeSpinVelocity],
  );

  const onWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      applyScrollDelta(event.deltaY);
    },
    [applyScrollDelta],
  );

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    let activePointer: number | null = null;
    let lastY: number | null = null;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;

      activePointer = event.pointerId;
      lastY = event.clientY;
      root.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (activePointer !== event.pointerId || lastY == null) return;

      const deltaY = lastY - event.clientY;
      lastY = event.clientY;

      if (deltaY === 0) return;

      event.preventDefault();
      applyScrollDelta(deltaY, scrollTouchMultiplierRef.current);
    };

    const endPointer = (event: PointerEvent) => {
      if (activePointer !== event.pointerId) return;

      activePointer = null;
      lastY = null;
      if (root.hasPointerCapture(event.pointerId)) {
        root.releasePointerCapture(event.pointerId);
      }
    };

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove, { passive: false });
    root.addEventListener("pointerup", endPointer);
    root.addEventListener("pointercancel", endPointer);

    return () => {
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", endPointer);
      root.removeEventListener("pointercancel", endPointer);
    };
  }, [applyScrollDelta, containerRef, scrollTouchMultiplierRef]);

  return {
    tooltipElRef,
    onImageHoverStart,
    onImageHoverMove,
    onImageHoverEnd,
    onWheel,
  };
}
