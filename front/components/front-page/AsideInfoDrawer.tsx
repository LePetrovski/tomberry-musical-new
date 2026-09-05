"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AsideInfoDrawerProps = {
	children: React.ReactNode;
};

export function AsideInfoDrawer({ children }: AsideInfoDrawerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const toggleRef = useRef<HTMLButtonElement>(null);

	const closeDrawer = useCallback(() => {
		setIsOpen(false);
		toggleRef.current?.focus();
	}, []);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") closeDrawer();
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [closeDrawer, isOpen]);

	return (
		<aside
			className={`aside-info fixed top-1/2 right-0 z-[100] flex max-h-[calc(100svh-2rem)] w-[min(28rem,calc(100vw-3.5rem))] -translate-y-1/2 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
				isOpen ? "translate-x-0" : "translate-x-full"
			}`}
			aria-labelledby="aside-info-title"
		>
			<button
				ref={toggleRef}
				type="button"
				className="absolute top-1/2 right-full flex h-36 w-12 -translate-y-1/2 cursor-pointer flex-col items-center justify-center gap-3 rounded-l-2xl border border-r-0 border-secondary-500/50 bg-primary-500 text-secondary-700 shadow-[-8px_4px_24px_rgba(39,62,63,0.12)] transition-colors hover:bg-secondary-500 hover:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-500"
				aria-expanded={isOpen}
				aria-controls="aside-info-panel"
				aria-label={isOpen ? "Fermer le volet À propos" : "Ouvrir le volet À propos"}
				onClick={() => setIsOpen((open) => !open)}
			>
				<span className="text-lg leading-none" aria-hidden="true">
					{isOpen ? "→" : "←"}
				</span>
				<span className="text-[0.65rem] font-semibold tracking-[0.16em] uppercase [writing-mode:vertical-rl] rotate-180">
					À propos
				</span>
			</button>

			<div
				id="aside-info-panel"
				className="max-h-[calc(100svh-2rem)] w-full overflow-y-auto overscroll-contain border border-r-0 border-secondary-500/35 bg-primary-500 shadow-[-16px_8px_40px_rgba(39,62,63,0.16)] rounded-l-2xl"
				aria-hidden={!isOpen}
				inert={!isOpen}
			>
				{children}
			</div>
		</aside>
	);
}
