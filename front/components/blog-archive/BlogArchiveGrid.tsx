import { BlogCard } from "@/components/BlogCard";
import type { PostPreview } from "@/lib/sanity/types";
import { motion, stagger } from "motion/react";

type Props = {
  posts: PostPreview[];
  hasActiveFilters: boolean;
};

export function BlogArchiveGrid({ posts, hasActiveFilters }: Props) {
    if (posts.length === 0) {
        return (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-secondary-600">
            {hasActiveFilters
            ? "Aucun article ne correspond à votre recherche."
            : "Aucun article publié pour le moment."}
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
        <motion.div variants={container} initial="hidden" animate="show" exit="hidden" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
            <motion.div key={post._id} variants={item}>
                <BlogCard post={post} />
            </motion.div>
        ))}
        </motion.div>
    );
}
