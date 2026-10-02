"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const SCENE_TIMEOUT_MS = 12_000;

type SceneLoadContextValue = {
    isReady: boolean;
    hasTimedOut: boolean;
    reportReady: () => void;
};

const SceneLoadContext = createContext<SceneLoadContextValue | null>(null);

export function SceneLoadProvider({ children }: { children: ReactNode }) {
    const [isReady, setIsReady] = useState(false);
    const [hasTimedOut, setHasTimedOut] = useState(false);

    useEffect(() => {
        if (isReady) return;
        const timeout = window.setTimeout(() => setHasTimedOut(true), SCENE_TIMEOUT_MS);
        return () => window.clearTimeout(timeout);
    }, [isReady]);

    const reportReady = useCallback(() => {
        setIsReady(true);
        setHasTimedOut(false);
    }, []);

    const value = useMemo(
        () => ({ isReady, hasTimedOut, reportReady }),
        [hasTimedOut, isReady, reportReady],
    );

    return (
        <SceneLoadContext.Provider value={value}>{children}</SceneLoadContext.Provider>
    );
}

export function useSceneLoad() {
    const context = useContext(SceneLoadContext);

    if (!context) {
        throw new Error("useSceneLoad must be used within SceneLoadProvider");
    }

    return context;
}
