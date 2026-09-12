"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { SocialLinks } from "@/components/SocialLinks";
import type { SocialLink } from "@/lib/sanity/types";
import { usePathname } from "next/navigation";

type FooterProps = {
	socialLinks?: SocialLink[];
};

export function Footer({ socialLinks = [] }: FooterProps) {
	const [open, setOpen] = useState(false);
	const year = new Date().getFullYear();

	const toggleFooter = useCallback(() => {
		setOpen((isOpen) => !isOpen);
	}, []);

	const closeFooter = useCallback(() => {
		setOpen(false);
	}, []);

	const pathname = usePathname();
	const isHome = pathname === "/";

	return (
		<>
			<footer
				className={
					isHome
						? "ff-menu-window fixed bottom-4 left-1/2 z-50 hidden w-[min(94vw,760px)] -translate-x-1/2 md:block"
						: "ff-menu-window relative bottom-4 left-1/2 z-50 -mt-21.5 hidden w-[min(94vw,760px)] -translate-x-1/2 md:block"
				}
			>
				<div className="mx-auto flex min-h-14 flex-wrap items-center justify-center gap-3 px-6 py-2.5 text-sm text-secondary-100">
					<SocialLinks links={socialLinks} variant="menu" />
					{socialLinks.length ? (
						<span className="h-5 w-px bg-secondary-200/35" aria-hidden="true" />
					) : null}

					<p className="text-center [text-shadow:0_1px_2px_rgb(11_22_23_/_0.75)]">
						© {year} Le Tomberry Musical. Tous droits réservés.
					</p>
				</div>
			</footer>

			<button
				type="button"
				className="ff-menu-window fixed bottom-4 left-4 z-50 inline-flex h-12 w-12 cursor-pointer items-center justify-center text-xs text-primary-200 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200 md:hidden"
				aria-expanded={open}
				aria-controls="footer-panel"
				aria-label={open ? "Fermer les informations" : "Afficher les informations"}
				onClick={toggleFooter}
			>
				<span aria-hidden="true">◆</span>
			</button>

			<AnimatePresence>
				{open && (
					<motion.footer
						id="footer-panel"
						className="ff-menu-window fixed bottom-18 left-4 z-50 w-[min(24rem,calc(100vw-2rem))] p-4 text-primary-200 md:hidden"
						initial={{ opacity: 0, y: 8, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 6, scale: 0.98 }}
						transition={{
							type: "spring",
							stiffness: 420,
							damping: 32,
							mass: 0.8,
						}}
					>
						<SocialLinks links={socialLinks} className="flex items-center gap-3" variant="menu" />

						<p className="mt-4 text-sm leading-6 text-secondary-100 [text-shadow:0_1px_2px_rgb(11_22_23_/_0.75)]">
							© {year} Le Tomberry Musical. Tous droits réservés.
						</p>

						<button
							type="button"
							className="ff-menu-choice mt-2 cursor-pointer rounded-lg text-sm font-semibold"
							onClick={closeFooter}
						>
							Fermer
						</button>
					</motion.footer>
				)}
			</AnimatePresence>
		</>
	);
}
