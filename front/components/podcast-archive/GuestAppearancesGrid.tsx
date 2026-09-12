"use client";

import { ArrowUpRight, CalendarDays } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { GuestAppearance } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  appearances: GuestAppearance[];
  hasActiveFilters: boolean;
  displayMode: "grid" | "list";
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function GuestAppearancesGrid({ appearances, hasActiveFilters, displayMode }: Props) {
  const shouldReduceMotion = useReducedMotion();

  if (appearances.length === 0) {
    return (
      <p className="crt-card rounded-2xl border-dashed p-6 text-secondary-600">
        {hasActiveFilters
          ? "Aucune apparition ne correspond à votre recherche."
          : "Aucune apparition publiée pour le moment."}
      </p>
    );
  }

  return (
    <LayoutGroup id="guest-appearances">
      <motion.div
        layout
        className={displayMode === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "grid gap-4"}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {appearances.map((appearance, index) => (
            <motion.div
              layout
              key={appearance._id}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2, delay: shouldReduceMotion ? 0 : Math.min(index, 8) * 0.025 }}
            >
              <Card className="crt-card group h-full gap-0 overflow-hidden rounded-2xl py-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(39,62,63,0.14)]">
                <a
                  href={appearance.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-500 ${displayMode === "list" ? "flex-col sm:flex-row" : "flex-col"}`}
                >
                  <div className={`relative shrink-0 overflow-hidden bg-secondary-100 ${displayMode === "list" ? "aspect-16/10 sm:aspect-auto sm:min-h-52 sm:w-72" : "aspect-16/10"}`}>
                    {appearance.coverImage ? (
                      <Image
                        src={urlFor(appearance.coverImage).width(960).height(600).url()}
                        alt={appearance.coverImage.alt ?? appearance.episodeTitle}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        sizes={displayMode === "list" ? "(max-width: 640px) 100vw, 288px" : "(max-width: 768px) 100vw, 33vw"}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-medium text-secondary-500">Podcast</div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col p-4.5 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-0 bg-secondary-900 text-primary-500">{appearance.showName}</Badge>
                      {appearance.platform ? <Badge variant="secondary" className="border-0 bg-secondary-500/10 text-secondary-900">{appearance.platform}</Badge> : null}
                    </div>
                    {appearance.publishedAt ? (
                      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-secondary-600">
                        <CalendarDays aria-hidden="true" className="size-3.5" />
                        {formatDate(appearance.publishedAt)}
                      </span>
                    ) : null}
                    <h3 className="mt-3 text-xl! font-semibold leading-tight text-secondary-900 group-hover:text-secondary-700">{appearance.episodeTitle}</h3>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-secondary-800">
                      Écouter l&apos;apparition
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </span>
                  </div>
                </a>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}
