"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { useSoundCloudPlayerOptional } from "@/components/audio/SoundCloudPlayerContext";

const menuLinks = [
	{ href: "/podcasts", label: "podcasts" },
	{ href: "/blog", label: "blog" },
] as const;

function BurgerIcon({ open }: { open: boolean }) {
	return (
		<span className="relative block h-4 w-5" aria-hidden="true">
			<span
				className={`absolute left-0 block h-0.5 w-full rounded-full bg-current transition-transform duration-200 ${
					open ? "top-1.5 rotate-45" : "top-0"
				}`}
			/>
			<span
				className={`absolute left-0 top-1.5 block h-0.5 w-full rounded-full bg-current transition-opacity duration-200 ${
					open ? "opacity-0" : "opacity-100"
				}`}
			/>
			<span
				className={`absolute left-0 block h-0.5 w-full rounded-full bg-current transition-transform duration-200 ${
					open ? "top-1.5 -rotate-45" : "top-3"
				}`}
			/>
		</span>
	);
}

export function Header() {
	const [menuOpen, setMenuOpen] = useState(false);
	const player = useSoundCloudPlayerOptional();

	const toggleMenu = useCallback(() => {
		setMenuOpen((open) => {
			if (!open) player?.close();
			return !open;
		});
	}, [player]);

	const closeMenu = useCallback(() => {
		setMenuOpen(false);
	}, []);

	return (
		<header className="fixed top-3 left-1/2 z-50 lg:w-fit w-full -translate-x-1/2 border border-secondary-500/50 rounded-3xl">
			<div className="relative lg:px-0 px-6">
				<nav className="flex items-center justify-between gap-6 rounded-3xl bg-primary-500 px-6 py-5 text-secondary-500 xl:gap-12 lg:gap-4">
					<div className="flex w-8 items-center justify-center lg:w-auto lg:justify-start">
						<button
							type="button"
							className="inline-flex cursor-pointer items-center justify-center lg:hidden"
							aria-expanded={menuOpen}
							aria-controls="mobile-nav"
							aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
							onClick={toggleMenu}
						>
							<BurgerIcon open={menuOpen} />
						</button>
						<Link href="/podcasts" className="text-podcast-slider-menu-item hidden lg:inline">
							podcasts
						</Link>
					</div>

					<Link
						href="/"
						className="text-podcast-slider-title font-black tracking-tight uppercase"
						onClick={closeMenu}
					>
						Le Tomberry Musical
					</Link>

					<div className="lg:flex hidden w-8 items-center justify-center lg:w-auto lg:justify-end">
						<Link href="/blog" className="text-podcast-slider-menu-item hidden lg:inline">
							blog
						</Link>
					</div>
				</nav>

				<AnimatePresence>
					{menuOpen && (
						<motion.nav
							id="mobile-nav"
							className="absolute top-full left-1/2 mt-2 flex flex-row -translate-x-1/2 flex-col items-stretch gap-2 rounded-3xl p-3 shadow-sm"
							initial={{ opacity: 0, y: -8, scale: 0.96 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -6, scale: 0.98 }}
							transition={{
								type: "spring",
								stiffness: 420,
								damping: 32,
								mass: 0.8,
							}}
						>
							{menuLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="text-podcast-slider-menu-item rounded-full border border-secondary-500/25 bg-primary-500 px-6 py-2.5 text-center transition-colors hover:border-secondary-500 hover:bg-secondary-500 hover:text-primary-500"
									onClick={closeMenu}
								>
									{link.label}
								</Link>
							))}
						</motion.nav>
					)}
				</AnimatePresence>
			</div>
		</header>
	);
}
