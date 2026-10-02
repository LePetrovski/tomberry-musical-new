"use client";

import { usePathname } from "next/navigation";
import { Music2 } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const HOME_TRACKS = ["/audio/ff4.mp3", "/audio/ff6.mp3", "/audio/ff14.mp3"] as const;
const HomeAudioEnabledContext = createContext(false);

export function useHomeAudioEnabled() {
    return useContext(HomeAudioEnabledContext);
}

export function HomeAudioProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackUrl] = useState(
        () => HOME_TRACKS[Math.floor(Math.random() * HOME_TRACKS.length)],
    );

    useEffect(() => {
        const audio = new Audio();
        audio.loop = true;
        audio.preload = "none";
        audio.src = trackUrl;
        audio.volume = 0.45;
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.removeAttribute("src");
            audio.load();
            audioRef.current = null;
        };
    }, [trackUrl]);

    const stopPlayback = useCallback((resetPosition = false) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        if (resetPosition) {
            audio.currentTime = 0;
        }
        setIsPlaying(false);
    }, []);

    const startPlayback = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio) return false;

        try {
            await audio.play();
            setIsPlaying(true);
            return true;
        } catch {
            setIsPlaying(false);
            return false;
        }
    }, []);

    useEffect(() => {
        if (!isHome) {
            stopPlayback(true);
        }
    }, [isHome, stopPlayback]);

    const togglePlayback = async () => {
        if (!isHome) return;

        if (isPlaying) {
            stopPlayback();
            return;
        }

        await startPlayback();
    };

    return (
        <HomeAudioEnabledContext.Provider value={isHome && isPlaying}>
            {isHome && (
                <button
                    type="button"
                    className="audioToggle"
                    onClick={togglePlayback}
                    aria-pressed={isPlaying}
                    aria-label={isPlaying ? "Couper la musique" : "Activer la musique"}
                >
                    <Music2 aria-hidden="true" size={20} strokeWidth={2.25} />
                </button>
            )}
            {children}
        </HomeAudioEnabledContext.Provider>
    );
}
