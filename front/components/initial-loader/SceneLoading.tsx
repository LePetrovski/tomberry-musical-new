"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef, useEffect, useState } from "react";
import { useInitialLoaderOptional } from "./InitialLoaderProvider";
import { useSceneLoad } from "./SceneLoadProvider";

const SCENE_FADE_DURATION_S = 0.85;

export function SceneLoadReporter() {
    const initialLoader = useInitialLoaderOptional();
    const { isStableReady } = useSceneLoad();

    useEffect(() => {
        if (!initialLoader?.isInitialLoading || !isStableReady) {
            return;
        }

        initialLoader.reportSceneReady();
    }, [initialLoader, isStableReady]);

    return null;
}

type SceneRevealProps = Omit<
    HTMLMotionProps<"div">,
    "ref" | "initial" | "animate" | "transition"
>;

export const SceneReveal = forwardRef<HTMLDivElement, SceneRevealProps>(function SceneReveal(
    { children, className, style, ...props },
    ref,
) {
    const initialLoader = useInitialLoaderOptional();
    const { isStableReady } = useSceneLoad();
    const [hasRevealed, setHasRevealed] = useState(false);

    const isLoaderVisible = initialLoader?.isLoaderVisible ?? false;
    const isSceneReady = initialLoader?.isSceneReady ?? true;
    const isPastInitialLoad = initialLoader ? !initialLoader.isInitialLoading : true;
    const assetsReady = isPastInitialLoad ? isStableReady : isSceneReady;
    const readyToReveal = !isLoaderVisible && assetsReady;
    const showScene = hasRevealed || readyToReveal;

    useEffect(() => {
        if (hasRevealed || !readyToReveal) {
            return;
        }

        const frame = requestAnimationFrame(() => {
            setHasRevealed(true);
        });

        return () => cancelAnimationFrame(frame);
    }, [hasRevealed, readyToReveal]);

    return (
        <motion.div
            ref={ref}
            className={className}
            style={{
                ...style,
                pointerEvents: showScene ? undefined : "none",
            }}
            initial={false}
            animate={{ opacity: showScene ? 1 : 0 }}
            transition={{ duration: SCENE_FADE_DURATION_S, ease: [0.4, 0, 0.2, 1] }}
            {...props}
        >
            {children}
        </motion.div>
    );
});