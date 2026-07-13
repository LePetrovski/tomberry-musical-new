import { PodcastCard } from "@/components/PodcastCard";
import type { PodcastPreview } from "@/lib/sanity/types";
import { motion, stagger } from "motion/react";

type Props = {
    podcasts: PodcastPreview[];
    hasActiveFilters: boolean;
};

export function PodcastArchiveGrid({ podcasts, hasActiveFilters }: Props) {
    if (podcasts.length === 0) {
        return (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-secondary-600">
            {hasActiveFilters
            ? "Aucun épisode ne correspond à votre recherche."
            : "Aucun podcast publié pour le moment."}
        </p>
        );
    }

    const container = {
        hidden: { opacity: 0, y: 10 },
        show: {
        opacity: 1,
        y: 0,
        transition: {
            delayChildren: stagger(0.1)
        }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        exit="hidden"
        className="grid gap-y-8 gap-x-6 md:grid-cols-2">
        {podcasts.map((podcast) => (
            <motion.div key={podcast._id} variants={item}>
            <PodcastCard podcast={podcast} />
            </motion.div>
        ))}
        </motion.div>
    );
}
