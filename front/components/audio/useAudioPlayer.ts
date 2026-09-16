"use client";

import { Howl } from "howler";
import { useCallback, useEffect, useRef, useState } from "react";

const INITIAL_VOLUME = 0.8;

export type AudioPlayerStatus =
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export function useAudioPlayer(audioUrl: string) {
  const howlRef = useRef<Howl | null>(null);
  const soundIdRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pendingSeekRef = useRef(0);
  const lastProgressUpdateRef = useRef(0);
  const [status, setStatus] = useState<AudioPlayerStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(INITIAL_VOLUME);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const cancelProgressSync = useCallback(() => {
    if (animationFrameRef.current === null) return;
    window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }, []);

  const syncProgress = useCallback(function updateProgress() {
    const howl = howlRef.current;
    const soundId = soundIdRef.current;

    if (!howl || soundId === null || !howl.playing(soundId)) {
      animationFrameRef.current = null;
      return;
    }

    const position = howl.seek(soundId);
    if (
      typeof position === "number" &&
      Number.isFinite(position) &&
      Math.abs(position - lastProgressUpdateRef.current) >= 0.2
    ) {
      lastProgressUpdateRef.current = position;
      setCurrentTime(position);
    }

    animationFrameRef.current = window.requestAnimationFrame(updateProgress);
  }, []);

  useEffect(() => {
    let disposed = false;
    const howl = new Howl({
      src: [audioUrl],
      format: ["mp3"],
      html5: true,
      preload: "metadata",
      autoplay: false,
      volume: INITIAL_VOLUME,
      rate: 1,
    });

    howlRef.current = howl;

    const handleLoad = () => {
      if (disposed) return;
      const loadedDuration = howl.duration();
      setDuration(Number.isFinite(loadedDuration) ? loadedDuration : 0);
      setErrorMessage(null);
      setStatus("ready");
    };

    const handlePlay = (soundId: number) => {
      if (disposed) return;
      soundIdRef.current = soundId;
      setStatus("playing");
      cancelProgressSync();
      animationFrameRef.current = window.requestAnimationFrame(syncProgress);
    };

    const handlePause = (soundId: number) => {
      if (disposed) return;
      const position = howl.seek(soundId);
      if (typeof position === "number") {
        lastProgressUpdateRef.current = position;
        setCurrentTime(position);
      }
      setStatus("paused");
      cancelProgressSync();
    };

    const handleEnd = () => {
      if (disposed) return;
      const loadedDuration = howl.duration();
      setCurrentTime(loadedDuration);
      lastProgressUpdateRef.current = loadedDuration;
      setStatus("ended");
      soundIdRef.current = null;
      pendingSeekRef.current = 0;
      cancelProgressSync();
    };

    const handleError = (_soundId: number, error: unknown) => {
      if (disposed) return;
      setErrorMessage(
        typeof error === "string" && error.length > 0
          ? `Lecture impossible : ${error}`
          : "Impossible de charger ce fichier audio.",
      );
      setStatus("error");
      cancelProgressSync();
    };

    howl.on("load", handleLoad);
    howl.on("play", handlePlay);
    howl.on("pause", handlePause);
    howl.on("end", handleEnd);
    howl.on("loaderror", handleError);
    howl.on("playerror", handleError);

    return () => {
      disposed = true;
      cancelProgressSync();
      howl.off();
      howl.unload();
      howlRef.current = null;
      soundIdRef.current = null;
    };
  }, [audioUrl, cancelProgressSync, syncProgress]);

  const seekTo = useCallback(
    (value: number) => {
      const clampedValue =
        duration > 0 ? Math.min(Math.max(value, 0), duration) : Math.max(value, 0);
      const howl = howlRef.current;
      const soundId = soundIdRef.current;

      setCurrentTime(clampedValue);
      lastProgressUpdateRef.current = clampedValue;
      pendingSeekRef.current = clampedValue;

      if (howl && soundId !== null) {
        howl.seek(clampedValue, soundId);
        pendingSeekRef.current = 0;
      }
    },
    [duration],
  );

  const togglePlayback = useCallback(() => {
    const howl = howlRef.current;
    if (!howl || status === "loading" || status === "error") return;

    const soundId = soundIdRef.current;
    if (soundId !== null && howl.playing(soundId)) {
      howl.pause(soundId);
      return;
    }

    const nextSoundId = soundId === null ? howl.play() : howl.play(soundId);
    soundIdRef.current = nextSoundId;

    if (pendingSeekRef.current > 0) {
      howl.seek(pendingSeekRef.current, nextSoundId);
      pendingSeekRef.current = 0;
    }
  }, [status]);

  const playFrom = useCallback(
    (value: number) => {
      seekTo(value);

      const howl = howlRef.current;
      if (!howl || status === "loading" || status === "error") return;

      const soundId = soundIdRef.current;
      if (soundId !== null && howl.playing(soundId)) {
        howl.seek(value, soundId);
        return;
      }

      const nextSoundId = soundId === null ? howl.play() : howl.play(soundId);
      soundIdRef.current = nextSoundId;
      howl.seek(value, nextSoundId);
      pendingSeekRef.current = 0;
    },
    [seekTo, status],
  );

  const changeVolume = useCallback(
    (value: number) => {
      const nextVolume = Math.min(Math.max(value, 0), 1);
      setVolume(nextVolume);
      howlRef.current?.volume(nextVolume);

      if (isMuted && nextVolume > 0) {
        setIsMuted(false);
        howlRef.current?.mute(false);
      }
    },
    [isMuted],
  );

  const toggleMute = useCallback(() => {
    setIsMuted((muted) => {
      const nextMuted = !muted;
      howlRef.current?.mute(nextMuted);
      return nextMuted;
    });
  }, []);

  const changePlaybackRate = useCallback((value: number) => {
    setPlaybackRate(value);
    const howl = howlRef.current;
    const soundId = soundIdRef.current;
    if (howl) howl.rate(value, soundId ?? undefined);
  }, []);

  const retry = useCallback(() => {
    const howl = howlRef.current;
    if (!howl) return;
    setErrorMessage(null);
    setStatus("loading");
    howl.load();
  }, []);

  return {
    status,
    errorMessage,
    duration,
    currentTime,
    volume,
    isMuted,
    playbackRate,
    isPlaying: status === "playing",
    isUnavailable: status === "loading" || status === "error",
    seekTo,
    togglePlayback,
    playFrom,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    retry,
  };
}
