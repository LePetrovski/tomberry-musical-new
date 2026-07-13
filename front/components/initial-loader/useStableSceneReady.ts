"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";

const STABLE_IDLE_MS = 450;
const LOADING_START_TIMEOUT_MS = 5_000;

/**
 * Attend que le LoadingManager Three.js soit resté inactif un court instant,
 * pour éviter les faux positifs quand de nouveaux assets démarrent en rafale.
 */
export function useStableSceneReady(enabled: boolean) {
    const { active, loaded, total } = useProgress();
    const hasStartedRef = useRef(false);
    const [isStableReady, setIsStableReady] = useState(false);

    useEffect(() => {
        if (!enabled || isStableReady) {
            return;
        }

        if (active || total > 0) {
            hasStartedRef.current = true;
        }

        const assetsPending = active || (total > 0 && loaded < total);

        if (!hasStartedRef.current) {
            const startTimeout = window.setTimeout(() => {
                hasStartedRef.current = true;
            }, LOADING_START_TIMEOUT_MS);

            return () => window.clearTimeout(startTimeout);
        }

        if (assetsPending) {
            return;
        }

        const stableTimeout = window.setTimeout(() => {
            if (!active && (total === 0 || loaded >= total)) {
                setIsStableReady(true);
            }
        }, STABLE_IDLE_MS);

        return () => window.clearTimeout(stableTimeout);
    }, [active, enabled, isStableReady, loaded, total]);

    return isStableReady;
}
