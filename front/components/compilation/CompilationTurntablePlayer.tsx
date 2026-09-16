"use client";

import Image from "next/image";
import { ExternalLink, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { type CSSProperties, useId, useMemo } from "react";
import { useReducedMotion } from "motion/react";
import { useAudioPlayer } from "@/components/audio/useAudioPlayer";
import { parseTimecode } from "@/lib/audio/timecode";
import type { CompilationTrack } from "@/lib/sanity/types";
import styles from "./CompilationTurntablePlayer.module.css";

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;
const SKIP_SECONDS = 15;

type Props = {
  audioUrl: string;
  title: string;
  coverImageUrl: string;
  coverImageAlt: string;
  tracks: CompilationTrack[];
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";

  const totalSeconds = Math.floor(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function clampPercentage(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export function CompilationTurntablePlayer({
  audioUrl,
  title,
  coverImageUrl,
  coverImageAlt,
  tracks,
}: Props) {
  const playerId = useId();
  const progressId = `${playerId}-progress`;
  const volumeId = `${playerId}-volume`;
  const prefersReducedMotion = useReducedMotion();
  const player = useAudioPlayer(audioUrl);

  const preparedTracks = useMemo(
    () =>
      tracks
        .map((track) => ({ ...track, startSeconds: parseTimecode(track.timecode) }))
        .filter(
          (track): track is CompilationTrack & { startSeconds: number } =>
            track.startSeconds !== null,
        ),
    [tracks],
  );

  const timedTracks = useMemo(
    () =>
      preparedTracks.map((track, index) => {
        const nextTrack = preparedTracks[index + 1];
        const endSeconds = nextTrack?.startSeconds ?? player.duration;
        const trackDuration = Math.max(endSeconds - track.startSeconds, 0);
        return { ...track, endSeconds, trackDuration };
      }),
    [player.duration, preparedTracks],
  );

  const longestTrack = Math.max(...timedTracks.map((track) => track.trackDuration), 1);
  const activeTrackIndex = timedTracks.findLastIndex(
    (track) => player.currentTime >= track.startSeconds,
  );
  const totalProgress =
    player.duration > 0 ? clampPercentage((player.currentTime / player.duration) * 100) : 0;
  const activeTrack = activeTrackIndex >= 0 ? timedTracks[activeTrackIndex] : null;

  const turntableStyle = {
    "--arm-angle": `${-15 + totalProgress * 0.18}deg`,
  } as CSSProperties;

  return (
    <section
      className={styles.shell}
      aria-label="Lecteur de la compilation"
      data-playing={player.isPlaying ? "true" : "false"}
      style={turntableStyle}
    >
      <div className={styles.turntableColumn}>
        <div className={styles.deckHeader}>
          <span>Platine</span>
          <span className={styles.deckStatus} role="status" aria-live="polite">
            {player.status === "loading"
              ? "Chargement"
              : player.status === "error"
                ? "Indisponible"
                : player.isPlaying
                  ? "En lecture"
                  : "À l’arrêt"}
          </span>
        </div>

        <div className={styles.turntable}>
          <div className={styles.platter}>
            <div
              className={styles.record}
              style={{ animationPlayState: player.isPlaying && !prefersReducedMotion ? "running" : "paused" }}
            >
              <div className={styles.grooves} />
              <div className={styles.label}>
                <Image
                  src={coverImageUrl}
                  alt={coverImageAlt}
                  fill
                  priority
                  className={styles.labelImage}
                  sizes="(max-width: 768px) 34vw, 180px"
                />
              </div>
              <div className={styles.spindle} />
            </div>
          </div>
          <div className={styles.armAssembly}>
            <div className={styles.armPivot} />
            <div className={styles.tonearm}>
              <span className={styles.stylus} />
            </div>
          </div>
          <div className={styles.deckSwitch} />
        </div>

        <div className={styles.nowPlaying}>
          <span className={styles.nowPlayingLabel}>En cours</span>
          <strong>{activeTrack?.title ?? title}</strong>
          <span>{activeTrack?.artist ?? "Compilation complète"}</span>
        </div>
      </div>

      <div className={styles.playerColumn}>
        <div className={styles.transport}>
          <button
            type="button"
            className={styles.skipButton}
            onClick={() => player.seekTo(player.currentTime - SKIP_SECONDS)}
            disabled={player.isUnavailable || player.duration === 0}
            aria-label="Reculer de 15 secondes"
          >
            −15
          </button>
          <button
            type="button"
            className={styles.playButton}
            onClick={player.togglePlayback}
            disabled={player.isUnavailable}
            aria-label={player.isPlaying ? "Mettre en pause" : "Lire la compilation"}
          >
            {player.isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
          <button
            type="button"
            className={styles.skipButton}
            onClick={() => player.seekTo(player.currentTime + SKIP_SECONDS)}
            disabled={player.isUnavailable || player.duration === 0}
            aria-label="Avancer de 15 secondes"
          >
            +15
          </button>

          <div className={styles.masterProgress}>
            <label className="sr-only" htmlFor={progressId}>
              Position dans la compilation
            </label>
            <input
              id={progressId}
              type="range"
              min={0}
              max={player.duration || 0}
              step={0.1}
              value={Math.min(player.currentTime, player.duration || 0)}
              onChange={(event) => player.seekTo(Number(event.currentTarget.value))}
              disabled={player.isUnavailable || player.duration === 0}
              style={{ "--progress": `${totalProgress}%` } as CSSProperties}
              className={styles.progressInput}
            />
            <div className={styles.timeDisplay}>
              <span>{formatTime(player.currentTime)}</span>
              <span>{formatTime(player.duration)}</span>
            </div>
          </div>
        </div>

        {player.status === "error" ? (
          <div className={styles.error} role="alert">
            <p>{player.errorMessage ?? "Impossible de charger ce fichier audio."}</p>
            <button type="button" onClick={player.retry}>
              Réessayer
            </button>
          </div>
        ) : null}

        <div className={styles.playlistHeading}>
          <div>
            <span>Face A</span>
            <h2 id={`${playerId}-playlist-title`}>Playlist</h2>
          </div>
          <span>{timedTracks.length} titres</span>
        </div>

        {timedTracks.length > 0 ? (
          <ol className={styles.trackList} aria-labelledby={`${playerId}-playlist-title`}>
            {timedTracks.map((track, index) => {
              const isActive = index === activeTrackIndex;
              const isPast = index < activeTrackIndex;
              const elapsed = player.currentTime - track.startSeconds;
              const trackProgress = isPast
                ? 100
                : isActive && track.trackDuration > 0
                  ? clampPercentage((elapsed / track.trackDuration) * 100)
                  : 0;
              const durationWidth =
                player.duration > 0 && track.trackDuration > 0
                  ? Math.max((track.trackDuration / longestTrack) * 100, 18)
                  : 100;

              return (
                <li
                  key={track._key}
                  className={styles.track}
                  data-active={isActive || undefined}
                  data-played={isPast || undefined}
                  aria-current={isActive ? "true" : undefined}
                >
                  <button
                    type="button"
                    className={styles.trackButton}
                    onClick={() => player.playFrom(track.startSeconds)}
                    disabled={player.status === "error"}
                    aria-label={`Lire ${track.artist} — ${track.title} à ${track.timecode}`}
                  >
                    <span className={styles.trackIndex}>{String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.trackCopy}>
                      <strong>{track.title}</strong>
                      <span>{track.artist}</span>
                    </span>
                    <span className={styles.trackTime}>
                      {track.trackDuration > 0 ? formatTime(track.trackDuration) : track.timecode}
                    </span>
                    <span className={styles.trackBarArea}>
                      <span className={styles.trackBar} style={{ width: `${durationWidth}%` }}>
                        <span style={{ width: `${trackProgress}%` }} />
                      </span>
                    </span>
                  </button>
                  {track.externalLink ? (
                    <a
                      href={track.externalLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.externalLink}
                      aria-label={`${track.externalLink.label} — ${track.title}`}
                    >
                      <ExternalLink aria-hidden="true" />
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className={styles.emptyPlaylist}>La liste des morceaux n’est pas disponible.</p>
        )}

        <div className={styles.settings}>
          <div className={styles.volumeControl}>
            <button
              type="button"
              onClick={player.toggleMute}
              aria-label={player.isMuted ? "Réactiver le son" : "Couper le son"}
            >
              {player.isMuted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
            </button>
            <label className="sr-only" htmlFor={volumeId}>
              Volume
            </label>
            <input
              id={volumeId}
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={player.volume}
              onChange={(event) => player.changeVolume(Number(event.currentTarget.value))}
              aria-valuetext={`${Math.round(player.volume * 100)} %`}
            />
          </div>
          <label className={styles.speedControl}>
            <span>Vitesse</span>
            <select
              value={player.playbackRate}
              onChange={(event) => player.changePlaybackRate(Number(event.currentTarget.value))}
            >
              {PLAYBACK_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}×
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
