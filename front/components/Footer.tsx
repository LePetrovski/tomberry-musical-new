"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

export function Footer() {
	const [open, setOpen] = useState(false);
	const year = new Date().getFullYear();

	const toggleFooter = useCallback(() => {
		setOpen((isOpen) => !isOpen);
	}, []);

	const closeFooter = useCallback(() => {
		setOpen(false);
	}, []);

	return (
		<>
			<footer className="fixed bottom-4 left-1/2 z-50 hidden w-fit -translate-x-1/2 rounded-3xl border-t border-zinc-200 bg-primary-500 md:block">
				<div className="mx-auto flex max-w-6xl flex-col gap-2 px-8 py-5 text-sm text-secondary-500 sm:flex-row sm:items-center sm:justify-between">
					<p>© {year} Le Tomberry Musical. Tous droits réservés.</p>
				</div>
			</footer>

			<button
				type="button"
				className="fixed bottom-4 left-4 z-50 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-secondary-500/25 bg-primary-500 text-sm font-semibold text-secondary-500 shadow-sm transition-colors hover:border-secondary-500 hover:bg-secondary-500 hover:text-primary-500 md:hidden"
				aria-expanded={open}
				aria-controls="footer-panel"
				aria-label={open ? "Fermer les informations" : "Afficher les informations"}
				onClick={toggleFooter}
			>
				©
			</button>

			<AnimatePresence>
				{open && (
					<motion.footer
						id="footer-panel"
						className="fixed bottom-16 left-4 z-50 max-w-[calc(100vw-2rem)] rounded-3xl border border-zinc-200 bg-primary-500 p-4 shadow-sm md:hidden"
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
						<p className="text-sm text-secondary-500">
							© {year} Le Tomberry Musical. Tous droits réservés.
						</p>
						<button
							type="button"
							className="mt-3 text-xs font-medium text-secondary-500 transition-colors hover:text-secondary-900"
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
