"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useStableSceneReady } from "./useStableSceneReady";

type SceneLoadContextValue = {
    isStableReady: boolean;
};

const SceneLoadContext = createContext<SceneLoadContextValue | null>(null);

export function SceneLoadProvider({ children }: { children: ReactNode }) {
    const isStableReady = useStableSceneReady(true);

    return (
        <SceneLoadContext.Provider value={{ isStableReady }}>{children}</SceneLoadContext.Provider>
    );
}

export function useSceneLoad() {
    const context = useContext(SceneLoadContext);

    if (!context) {
        throw new Error("useSceneLoad must be used within SceneLoadProvider");
    }

    return context;
}
