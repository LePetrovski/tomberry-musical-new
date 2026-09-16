"use client";

import { ExternalLink, Music2 } from "lucide-react";
import { useId } from "react";
import { useAudioPlayer } from "@/components/audio/useAudioPlayer";
import type { CompilationTrack } from "@/lib/sanity/types";
import { parseTimecode } from "@/lib/audio/timecode";

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;
const SKIP_SECONDS = 15;

type Props = {
	audioUrl: string;
	title: string;
	tracks?: CompilationTrack[];
	contentLabel?: string;
};

function formatTime(value: number) {
	if (!Number.isFinite(value) || value < 0) return "0:00";

	const totalSeconds = Math.floor(value);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}

	return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function PlayPauseIcon({ isPlaying }: { isPlaying: boolean }) {
	return isPlaying ? (
		<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
			<path d="M7 5.75A1.25 1.25 0 0 1 8.25 4.5h1A1.25 1.25 0 0 1 10.5 5.75v12.5a1.25 1.25 0 0 1-1.25 1.25h-1A1.25 1.25 0 0 1 7 18.25V5.75Zm6.5 0a1.25 1.25 0 0 1 1.25-1.25h1A1.25 1.25 0 0 1 17 5.75v12.5a1.25 1.25 0 0 1-1.25 1.25h-1a1.25 1.25 0 0 1-1.25-1.25V5.75Z" />
		</svg>
	) : (
		<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
			<path d="M7.75 5.4a1.5 1.5 0 0 1 2.28-1.28l9.08 5.6a1.5 1.5 0 0 1 0 2.56l-9.08 5.6a1.5 1.5 0 0 1-2.28-1.28V5.4Z" />
		</svg>
	);
}

export function PodcastMp3Player({
	audioUrl,
	title,
	tracks = [],
	contentLabel = "Lecture MP3",
}: Props) {
	const controlId = useId();
	const progressId = `${controlId}-progress`;
	const volumeId = `${controlId}-volume`;
	const {
		status,
		errorMessage,
		duration,
		currentTime,
		volume,
		isMuted,
		playbackRate,
		isPlaying,
		isUnavailable,
		seekTo,
		togglePlayback,
		playFrom,
		changeVolume,
		toggleMute,
		changePlaybackRate,
		retry,
	} = useAudioPlayer(audioUrl);
	const preparedTracks = tracks
		.map((track) => ({ ...track, startSeconds: parseTimecode(track.timecode) }))
		.filter(
			(track): track is CompilationTrack & { startSeconds: number } =>
				track.startSeconds !== null,
		);
	const activeTrackIndex = preparedTracks.findLastIndex(
		(track) => currentTime >= track.startSeconds,
	);

	return (
		<div className="ff-player-console rounded-xl p-4 sm:p-5">
			<div className="mb-5 flex min-w-0 items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="text-xs font-semibold tracking-[0.14em] text-secondary-500 uppercase">
						{contentLabel}
					</p>
					<p className="mt-1 truncate text-sm font-medium text-secondary-900" title={title}>
						{title}
					</p>
				</div>
				<span className="shrink-0 text-xs text-secondary-600" role="status" aria-live="polite">
					{status === "loading" ? "Chargement…" : isPlaying ? "En lecture" : "MP3"}
				</span>
			</div>

			{status === "error" ? (
				<div className="ff-player-error rounded-lg p-4" role="alert">
					<p className="text-sm leading-6 text-secondary-800">
						{errorMessage ?? "Impossible de charger ce fichier audio."}
					</p>
					<button
						type="button"
						className="mt-3 cursor-pointer text-sm font-semibold text-secondary-900 underline underline-offset-4"
						onClick={retry}
					>
						Réessayer
					</button>
				</div>
			) : (
				<>
					<div className="mb-5 flex items-center justify-center gap-4">
						<button
							type="button"
							className="ff-player-button inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
							onClick={() => seekTo(currentTime - SKIP_SECONDS)}
							disabled={isUnavailable || duration === 0}
							aria-label="Reculer de 15 secondes"
						>
							−15
						</button>

						<button
							type="button"
							className="ff-player-button-primary inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-40"
							onClick={togglePlayback}
							disabled={isUnavailable}
							aria-label={isPlaying ? "Mettre en pause" : "Lire l’épisode"}
						>
							<PlayPauseIcon isPlaying={isPlaying} />
						</button>

						<button
							type="button"
							className="ff-player-button inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
							onClick={() => seekTo(currentTime + SKIP_SECONDS)}
							disabled={isUnavailable || duration === 0}
							aria-label="Avancer de 15 secondes"
						>
							+15
						</button>
					</div>

					<label className="sr-only" htmlFor={progressId}>
						Position dans l’épisode
					</label>
					<input
						id={progressId}
						type="range"
						min={0}
						max={duration || 0}
						step={0.1}
						value={Math.min(currentTime, duration || 0)}
						onChange={(event) => seekTo(Number(event.currentTarget.value))}
						disabled={isUnavailable || duration === 0}
						style={{
							background: `linear-gradient(to right, var(--color-secondary-500) ${
								duration > 0 ? (currentTime / duration) * 100 : 0
							}%, var(--color-secondary-100) 0%)`,
						}}
						className="audio-progress ff-player-progress block h-3 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-40"
					/>
					<div className="mt-1 flex justify-between text-xs tabular-nums text-secondary-600">
						<span>{formatTime(currentTime)}</span>
						<span>{formatTime(duration)}</span>
					</div>

					<div className="mt-5 flex flex-col gap-4 border-t border-secondary-500/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex min-w-0 flex-1 items-center gap-3">
							<button
								type="button"
								className="min-w-12 cursor-pointer text-left text-xs font-semibold text-secondary-800"
								onClick={toggleMute}
								aria-label={isMuted ? "Réactiver le son" : "Couper le son"}
							>
								{isMuted ? "Muet" : "Son"}
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
								value={volume}
								onChange={(event) => changeVolume(Number(event.currentTarget.value))}
								className="h-2 min-w-0 flex-1 cursor-pointer accent-secondary-500"
							/>
						</div>

						<label className="flex shrink-0 items-center gap-2 text-xs font-medium text-secondary-700">
							Vitesse
							<select
								value={playbackRate}
								onChange={(event) => changePlaybackRate(Number(event.currentTarget.value))}
								className="ff-player-select cursor-pointer rounded-md px-2 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
							>
								{PLAYBACK_RATES.map((rate) => (
									<option key={rate} value={rate}>
										{rate}×
									</option>
								))}
							</select>
						</label>
					</div>
				</>
			)}

			{preparedTracks.length > 0 ? (
				<section className="mt-7 border-t border-secondary-500/20 pt-6" aria-labelledby={`${controlId}-playlist-title`}>
					<div className="mb-4 flex items-center gap-2">
						<Music2 aria-hidden="true" className="size-4 text-secondary-500" />
						<h3 id={`${controlId}-playlist-title`} className="text-lg! font-semibold text-secondary-900">
							Playlist
						</h3>
					</div>
					<ol className="space-y-2">
						{preparedTracks.map((track, index) => {
							const isActive = index === activeTrackIndex;
							return (
								<li
									key={track._key}
									className={`ff-playlist-row grid gap-3 rounded-lg p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center ${
										isActive
											? "is-active"
											: ""
									}`}
									aria-current={isActive ? "true" : undefined}
								>
									<button
										type="button"
										onClick={() => playFrom(track.startSeconds)}
										disabled={status === "error"}
										className="ff-player-timecode w-fit cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500 disabled:cursor-not-allowed disabled:opacity-40"
										aria-label={`Lire ${track.artist} — ${track.title} à ${track.timecode}`}
									>
										{track.timecode}
									</button>
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold text-secondary-900">{track.title}</p>
										<p className="truncate text-xs text-secondary-600">{track.artist}</p>
									</div>
									{track.externalLink ? (
										<a
											href={track.externalLink.url}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-secondary-700 underline-offset-4 hover:text-secondary-900 hover:underline"
										>
											{track.externalLink.label}
											<ExternalLink aria-hidden="true" className="size-3.5" />
										</a>
									) : null}
								</li>
							);
						})}
					</ol>
				</section>
			) : null}
		</div>
	);
}
