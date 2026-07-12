"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type SoundCloudPlayerState = {
    title: string;
    embedUrl: string;
    slug?: string;
};

type SoundCloudPlayerContextValue = {
    activePlayer: SoundCloudPlayerState | null;
    play: (player: SoundCloudPlayerState) => void;
    close: () => void;
};

const SoundCloudPlayerContext = createContext<SoundCloudPlayerContextValue | null>(null);

export function SoundCloudPlayerProvider({ children }: { children: React.ReactNode }) {
    const [activePlayer, setActivePlayer] = useState<SoundCloudPlayerState | null>(null);

    const play = useCallback((player: SoundCloudPlayerState) => {
        setActivePlayer(player);
    }, []);

    const close = useCallback(() => {
        setActivePlayer(null);
    }, []);

    const value = useMemo(
        () => ({ activePlayer, play, close }),
        [activePlayer, close, play],
    );

    return (
        <SoundCloudPlayerContext.Provider value={value}>
            {children}
        </SoundCloudPlayerContext.Provider>
    );
}

export function useSoundCloudPlayer() {
    const context = useContext(SoundCloudPlayerContext);
    if (!context) {
        throw new Error("useSoundCloudPlayer must be used within SoundCloudPlayerProvider");
    }
    return context;
}

export function useSoundCloudPlayerOptional() {
    return useContext(SoundCloudPlayerContext);
}
