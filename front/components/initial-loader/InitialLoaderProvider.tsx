"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

const MIN_DURATION_MS = 900;
const SCENE_TIMEOUT_MS = 12_000;
const EXIT_DURATION_S = 0.55;

type InitialLoaderContextValue = {
    isInitialLoading: boolean;
    isLoaderVisible: boolean;
    isSceneReady: boolean;
    reportSceneReady: () => void;
};

const InitialLoaderContext = createContext<InitialLoaderContextValue | null>(null);

function waitForWindowLoad() {
    if (document.readyState === "complete") {
        return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
        window.addEventListener("load", () => resolve(), { once: true });
    });
}

function waitForMinimumDuration() {
    return new Promise<void>((resolve) => {
        window.setTimeout(resolve, MIN_DURATION_MS);
    });
}

export function InitialLoaderProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const requiresScene = pathname === "/";

    const [showLoader, setShowLoader] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const [isSceneReady, setIsSceneReady] = useState(!requiresScene);
    const sceneReadyRef = useRef(!requiresScene);
    const sceneReadyResolversRef = useRef<(() => void)[]>([]);

    const reportSceneReady = useCallback(() => {
        if (sceneReadyRef.current) {
            return;
        }

        sceneReadyRef.current = true;
        setIsSceneReady(true);
        sceneReadyResolversRef.current.forEach((resolve) => resolve());
        sceneReadyResolversRef.current = [];
    }, []);

    const waitForScene = useCallback(() => {
        if (sceneReadyRef.current) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            sceneReadyResolversRef.current.push(resolve);
        });
    }, []);

    useEffect(() => {
        sceneReadyRef.current = !requiresScene;
        setIsSceneReady(!requiresScene);
        sceneReadyResolversRef.current = [];
    }, [requiresScene]);

    useEffect(() => {
        if (!showLoader) {
            return;
        }

        let cancelled = false;

        const run = async () => {
            const sceneGate = requiresScene
                ? Promise.race([
                      waitForScene(),
                      new Promise<void>((resolve) => {
                          window.setTimeout(resolve, SCENE_TIMEOUT_MS);
                      }),
                  ])
                : Promise.resolve();

            await Promise.all([
                document.fonts.ready,
                waitForWindowLoad(),
                waitForMinimumDuration(),
                sceneGate,
            ]);

            if (!cancelled) {
                setShowLoader(false);
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [requiresScene, showLoader, waitForScene]);

    useEffect(() => {
        if (isComplete) {
            return;
        }

        const previousOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.documentElement.style.overflow = previousOverflow;
        };
    }, [isComplete]);

    const value = useMemo(
        () => ({
            isInitialLoading: !isComplete,
            isLoaderVisible: showLoader,
            isSceneReady,
            reportSceneReady,
        }),
        [isComplete, isSceneReady, reportSceneReady, showLoader],
    );

    return (
        <InitialLoaderContext.Provider value={value}>
            {children}
            <AnimatePresence onExitComplete={() => setIsComplete(true)}>
                {showLoader ? (
                    <motion.div
                        key="initial-loader"
                        className="initial-loader fixed inset-0 z-10000 flex items-center justify-center"
                        role="status"
                        aria-live="polite"
                        aria-busy="true"
                        aria-label="Chargement du site"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: EXIT_DURATION_S, ease: [0.4, 0, 0.2, 1] }}
                    />
                ) : null}
            </AnimatePresence>
        </InitialLoaderContext.Provider>
    );
}

export function useInitialLoader() {
    const context = useContext(InitialLoaderContext);

    if (!context) {
        throw new Error("useInitialLoader must be used within InitialLoaderProvider");
    }

    return context;
}

export function useInitialLoaderOptional() {
    return useContext(InitialLoaderContext);
}
