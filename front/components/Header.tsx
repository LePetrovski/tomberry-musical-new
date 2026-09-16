"use client";

import { CurtainLink } from "@/components/navigation/CurtainLink";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { useSoundCloudPlayerOptional } from "@/components/audio/SoundCloudPlayerContext";
import { usePathname, useSearchParams } from "next/navigation";

const menuLinks = [
	{ href: "/podcasts", label: "podcasts", id: "podcasts" },
	{ href: "/podcasts?vue=compilations", label: "compilations", id: "compilations" },
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
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const compilationView =
		pathname.startsWith("/compilations") || searchParams.get("vue") === "compilations";

	const isActive = (id: (typeof menuLinks)[number]["id"]) =>
		id === "compilations"
			? compilationView
			: pathname.startsWith("/podcasts") && !compilationView;

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
		<header className="fixed top-3 left-1/2 z-50 w-[94vw] -translate-x-1/2 md:w-[80vw] lg:max-w-[800px]">
			<div className="ff-menu-window px-4 sm:px-6">
				<nav className="grid min-h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-5">
					<div className="flex min-w-0 items-center justify-start">
						<button
							type="button"
							className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-secondary-200/45 bg-secondary-0/18 text-primary-200 transition-colors hover:bg-secondary-100/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200 lg:hidden"
							aria-expanded={menuOpen}
							aria-controls="mobile-nav"
							aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
							onClick={toggleMenu}
						>
							<BurgerIcon open={menuOpen} />
						</button>
						<CurtainLink
							href={menuLinks[0].href}
							aria-current={isActive(menuLinks[0].id) ? "page" : undefined}
							className="ff-menu-choice text-podcast-slider-menu-item hidden font-semibold lg:inline-flex"
						>
							{menuLinks[0].label}
						</CurtainLink>
					</div>

					<CurtainLink
						href="/"
						className="text-podcast-slider-title whitespace-nowrap text-center font-black tracking-tight text-primary-200 uppercase [text-shadow:0_2px_3px_rgb(11_22_23_/_0.75)]"
						onClick={closeMenu}
					>
						Le Tomberry Musical
					</CurtainLink>

					<div className="flex min-w-0 items-center justify-end">
						<CurtainLink
							href={menuLinks[1].href}
							aria-current={isActive(menuLinks[1].id) ? "page" : undefined}
							className="ff-menu-choice text-podcast-slider-menu-item hidden font-semibold lg:inline-flex"
						>
							{menuLinks[1].label}
						</CurtainLink>
					</div>
				</nav>

				<AnimatePresence>
					{menuOpen && (
						<motion.nav
							id="mobile-nav"
							className="ff-menu-window absolute top-full left-1/2 mt-2 flex w-[min(22rem,94vw)] -translate-x-1/2 flex-col items-stretch p-2"
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
							{menuLinks.map((link) => {
								const active = isActive(link.id);

								return (
									<CurtainLink
										key={link.id}
										href={link.href}
										aria-current={active ? "page" : undefined}
										className="ff-menu-choice min-h-12 rounded-lg text-base font-semibold"
										onClick={closeMenu}
									>
										{link.label}
									</CurtainLink>
								);
							})}
						</motion.nav>
					)}
				</AnimatePresence>
			</div>
		</header>
	);
}
