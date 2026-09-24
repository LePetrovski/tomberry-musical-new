"use client";

import { Howl } from "howler";
import { useCallback, useEffect, useRef, useState } from "react";

const INITIAL_VOLUME = 0.8;
const SEEK_SETTLE_MS = 50;

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
  const transitionTimeoutRef = useRef<number | null>(null);
  const transitionTokenRef = useRef(0);
  const pendingSeekRef = useRef(0);
  const lastProgressUpdateRef = useRef(0);
  const targetVolumeRef = useRef(INITIAL_VOLUME);
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

  const clearTrackTransition = useCallback((restoreVolume = true) => {
    transitionTokenRef.current += 1;

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    if (restoreVolume) {
      howlRef.current?.volume(targetVolumeRef.current);
    }
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

      if (pendingSeekRef.current > 0) {
        const pendingSeek = pendingSeekRef.current;
        pendingSeekRef.current = 0;
        howl.seek(pendingSeek, soundId);
        lastProgressUpdateRef.current = pendingSeek;
        setCurrentTime(pendingSeek);
      }

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
      clearTrackTransition();
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
      clearTrackTransition();
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
      clearTrackTransition(false);
      cancelProgressSync();
      howl.off();
      howl.unload();
      howlRef.current = null;
      soundIdRef.current = null;
    };
  }, [audioUrl, cancelProgressSync, clearTrackTransition, syncProgress]);

  const applySeek = useCallback(
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

  const seekTo = useCallback(
    (value: number) => {
      clearTrackTransition();
      applySeek(value);
    },
    [applySeek, clearTrackTransition],
  );

  const togglePlayback = useCallback(() => {
    clearTrackTransition();
    const howl = howlRef.current;
    if (!howl || status === "loading" || status === "error") return;

    const soundId = soundIdRef.current;
    if (soundId !== null && howl.playing(soundId)) {
      howl.pause(soundId);
      return;
    }

    const nextSoundId = soundId === null ? howl.play() : howl.play(soundId);
    soundIdRef.current = nextSoundId;
  }, [clearTrackTransition, status]);

  const playFromImmediately = useCallback(
    (value: number) => {
      const howl = howlRef.current;
      if (!howl || status === "loading" || status === "error") return;

      const clampedValue =
        duration > 0 ? Math.min(Math.max(value, 0), duration) : Math.max(value, 0);
      const soundId = soundIdRef.current;

      setCurrentTime(clampedValue);
      lastProgressUpdateRef.current = clampedValue;

      if (soundId !== null) {
        howl.seek(clampedValue, soundId);
        pendingSeekRef.current = 0;

        if (!howl.playing(soundId)) {
          soundIdRef.current = howl.play(soundId);
        }
        return;
      }

      pendingSeekRef.current = clampedValue;
      soundIdRef.current = howl.play();
    },
    [duration, status],
  );

  const playFrom = useCallback(
    (value: number) => {
      clearTrackTransition();
      playFromImmediately(value);
    },
    [clearTrackTransition, playFromImmediately],
  );

  const transitionTo = useCallback(
    (value: number, durationMs = 450) => {
      const howl = howlRef.current;
      if (!howl || status === "loading" || status === "error") return;

      const safeDuration = Number.isFinite(durationMs) ? Math.max(durationMs, 0) : 0;
      if (safeDuration === 0) {
        playFrom(value);
        return;
      }

      const fadeDuration = Math.max(Math.round(safeDuration / 2), 1);
      const clampedValue =
        duration > 0 ? Math.min(Math.max(value, 0), duration) : Math.max(value, 0);

      clearTrackTransition(false);
      const transitionToken = transitionTokenRef.current;
      const soundId = soundIdRef.current;
      const isCurrentlyPlaying = soundId !== null && howl.playing(soundId);

      if (!isCurrentlyPlaying) {
        clearTrackTransition();
        playFromImmediately(clampedValue);
        return;
      }

      const currentVolume = howl.volume();
      const fadeFrom = typeof currentVolume === "number" ? currentVolume : targetVolumeRef.current;
      if (fadeFrom > 0) {
        howl.fade(fadeFrom, 0, fadeDuration);
      } else {
        howl.volume(0);
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        if (transitionToken !== transitionTokenRef.current) return;

        howl.volume(0);
        playFromImmediately(clampedValue);

        transitionTimeoutRef.current = window.setTimeout(() => {
          if (transitionToken !== transitionTokenRef.current) return;
          transitionTimeoutRef.current = null;

          const targetVolume = targetVolumeRef.current;
          if (targetVolume > 0) {
            howl.fade(0, targetVolume, fadeDuration);
          } else {
            howl.volume(0);
          }
        }, SEEK_SETTLE_MS);
      }, fadeDuration);
    },
    [clearTrackTransition, duration, playFrom, playFromImmediately, status],
  );

  const changeVolume = useCallback(
    (value: number) => {
      const nextVolume = Math.min(Math.max(value, 0), 1);
      targetVolumeRef.current = nextVolume;
      setVolume(nextVolume);

      if (isMuted && nextVolume > 0) {
        setIsMuted(false);
        howlRef.current?.mute(false);
      }

      howlRef.current?.volume(nextVolume);
    },
    [isMuted],
  );

  const toggleMute = useCallback(() => {
    setIsMuted((muted) => {
      const nextMuted = !muted;
      const howl = howlRef.current;
      howl?.mute(nextMuted);
      if (!nextMuted) howl?.volume(targetVolumeRef.current);
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
    clearTrackTransition();
    const howl = howlRef.current;
    if (!howl) return;
    setErrorMessage(null);
    setStatus("loading");
    howl.load();
  }, [clearTrackTransition]);

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
    transitionTo,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    retry,
  };
}
