"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import Link from "next/link";
import { forwardRef, useEffect, useState } from "react";
import { useInitialLoaderOptional } from "./InitialLoaderProvider";
import { useSceneLoad } from "./SceneLoadProvider";

const SCENE_FADE_DURATION_S = 0.85;

export function SceneLoadReporter() {
    const initialLoader = useInitialLoaderOptional();
    const { isReady } = useSceneLoad();

    useEffect(() => {
        if (!initialLoader || !isReady) {
            return;
        }

        initialLoader.reportSceneReady();
    }, [initialLoader, isReady]);

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
    const { isReady } = useSceneLoad();
    const [hasRevealed, setHasRevealed] = useState(false);

    const isLoaderVisible = initialLoader?.isLoaderVisible ?? false;
    const isSceneReady = initialLoader?.isSceneReady ?? true;
    const isPastInitialLoad = initialLoader ? !initialLoader.isInitialLoading : true;
    const assetsReady = isPastInitialLoad ? isReady : isSceneReady;
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

export function SceneFailureFallback({ isEmpty }: { isEmpty: boolean }) {
    const initialLoader = useInitialLoaderOptional();
    const { hasTimedOut } = useSceneLoad();

    const showEmpty = isEmpty && !initialLoader?.isLoaderVisible;
    if (!showEmpty && !hasTimedOut && !initialLoader?.hasSceneTimedOut) return null;

    return (
        <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-secondary-900"
            role="alert"
        >
            <p className="max-w-md text-lg">
                {showEmpty ? "Aucun épisode n’est disponible pour le moment." : "La scène met trop de temps à s’afficher."}
            </p>
            <Link className="font-semibold underline underline-offset-4" href="/podcasts">
                Parcourir les épisodes
            </Link>
        </div>
    );
}
