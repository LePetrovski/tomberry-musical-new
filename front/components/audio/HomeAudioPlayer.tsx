"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const HOME_TRACKS = ["/audio/ff4.mp3", "/audio/ff6.mp3", "/audio/ff14.mp3"] as const;

export function HomeAudioPlayer() {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackUrl] = useState(
        () => HOME_TRACKS[Math.floor(Math.random() * HOME_TRACKS.length)],
    );

    useEffect(() => {
        const audio = new Audio(trackUrl);
        audio.loop = true;
        audio.preload = "auto";
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

    if (!isHome) return null;

    return (
        <button
            type="button"
            className="audioToggle"
            onClick={togglePlayback}
            aria-pressed={isPlaying}
            aria-label={isPlaying ? "Couper la musique" : "Activer la musique"}
        >
            {isPlaying ? "Couper" : "Musique"}
        </button>
    );
}
