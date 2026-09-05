"use client";

import { Howl } from "howler";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;
const INITIAL_VOLUME = 0.8;
const SKIP_SECONDS = 15;

type PlayerStatus = "loading" | "ready" | "playing" | "paused" | "ended" | "error";

type Props = {
	audioUrl: string;
	title: string;
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

export function PodcastMp3Player({ audioUrl, title }: Props) {
	const controlId = useId();
	const progressId = `${controlId}-progress`;
	const volumeId = `${controlId}-volume`;
	const howlRef = useRef<Howl | null>(null);
	const soundIdRef = useRef<number | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const pendingSeekRef = useRef(0);
	const lastProgressUpdateRef = useRef(0);
	const [status, setStatus] = useState<PlayerStatus>("loading");
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
			setCurrentTime(howl.duration());
			lastProgressUpdateRef.current = howl.duration();
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
			const clampedValue = Math.min(Math.max(value, 0), duration || 0);
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

	const togglePlayback = () => {
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
	};

	const changeVolume = (value: number) => {
		const nextVolume = Math.min(Math.max(value, 0), 1);
		setVolume(nextVolume);
		howlRef.current?.volume(nextVolume);

		if (isMuted && nextVolume > 0) {
			setIsMuted(false);
			howlRef.current?.mute(false);
		}
	};

	const toggleMute = () => {
		const nextMuted = !isMuted;
		setIsMuted(nextMuted);
		howlRef.current?.mute(nextMuted);
	};

	const changePlaybackRate = (value: number) => {
		setPlaybackRate(value);
		howlRef.current?.rate(value, soundIdRef.current ?? undefined);
	};

	const retry = () => {
		const howl = howlRef.current;
		if (!howl) return;
		setErrorMessage(null);
		setStatus("loading");
		howl.load();
	};

	const isPlaying = status === "playing";
	const isUnavailable = status === "loading" || status === "error";

	return (
		<div className="rounded-2xl border border-secondary-500/20 bg-primary-500 p-4 shadow-sm sm:p-5">
			<div className="mb-5 flex min-w-0 items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="text-xs font-semibold tracking-[0.14em] text-secondary-500 uppercase">
						Lecture MP3
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
				<div className="rounded-xl border border-secondary-500/25 bg-secondary-500/5 p-4" role="alert">
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
							className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-secondary-500/30 text-xs font-semibold text-secondary-800 transition-colors hover:border-secondary-500 hover:bg-secondary-500 hover:text-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
							onClick={() => seekTo(currentTime - SKIP_SECONDS)}
							disabled={isUnavailable || duration === 0}
							aria-label="Reculer de 15 secondes"
						>
							−15
						</button>

						<button
							type="button"
							className="inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-secondary-500 text-primary-500 shadow-sm transition-transform hover:scale-105 hover:bg-secondary-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
							onClick={togglePlayback}
							disabled={isUnavailable}
							aria-label={isPlaying ? "Mettre en pause" : "Lire l’épisode"}
						>
							<PlayPauseIcon isPlaying={isPlaying} />
						</button>

						<button
							type="button"
							className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-secondary-500/30 text-xs font-semibold text-secondary-800 transition-colors hover:border-secondary-500 hover:bg-secondary-500 hover:text-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
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
						className="block h-2 w-full cursor-pointer accent-secondary-500 disabled:cursor-not-allowed disabled:opacity-40"
					/>
					<div className="mt-1 flex justify-between text-xs tabular-nums text-secondary-600">
						<span>{formatTime(currentTime)}</span>
						<span>{formatTime(duration)}</span>
					</div>

					<div className="mt-5 flex flex-col gap-4 border-t border-secondary-500/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
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
								className="cursor-pointer rounded-lg border border-secondary-500/25 bg-primary-500 px-2 py-1.5 text-xs font-semibold text-secondary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
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
		</div>
	);
}
