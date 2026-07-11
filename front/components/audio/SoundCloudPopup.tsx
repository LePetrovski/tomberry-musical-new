"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSoundCloudPlayer } from "./SoundCloudPlayerContext";

export function SoundCloudPopup() {
    const { activePlayer, close } = useSoundCloudPlayer();

    return (
        <AnimatePresence>
            {activePlayer && (
                <motion.div
                    key={activePlayer.embedUrl}
                    className="fixed top-[5.75rem] left-1/2 z-40 w-[92vw] max-w-[668px] -translate-x-1/2 overflow-hidden pr-10"
                    role="dialog"
                    aria-label={`Lecteur SoundCloud — ${activePlayer.title}`}
                    initial={{ y: "-120%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-60%", opacity: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                        mass: 0.85,
                    }}
                >
                    <header className="flex flex-row items-end justify-end  px-3.5 py-2.5 text-secondary-900 absolute -right-2 -top-2">
                        <button
                            type="button"
                            className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-secondary-900 text-lg leading-none bg-primary-500 transition-colors hover:bg-secondary-500 hover:text-primary-500"
                            aria-label="Fermer le lecteur"
                            onClick={close}
                        >
                            ×
                        </button>
                    </header>

                    <iframe
                        key={activePlayer.embedUrl}
                        title={`SoundCloud — ${activePlayer.title}`}
                        src={activePlayer.embedUrl}
                        allow="autoplay"
                        className="block h-[110px] w-full border-0 bg-primary-500 rounded-2xl"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
