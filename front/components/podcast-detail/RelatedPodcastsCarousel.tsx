"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { MotionConfig } from "motion/react";
import { Carousel, useCarousel } from "motion-plus/react";
import { PodcastCard } from "@/components/PodcastCard";
import { Button } from "@/components/ui/button";
import type { PodcastPreview } from "@/lib/sanity/types";

type Props = { podcasts: PodcastPreview[] };

function SlideControls() {
  const { currentPage, totalPages, nextPage, prevPage, isNextActive, isPrevActive } = useCarousel();

  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <p className="text-sm font-medium text-secondary-600" aria-live="polite">
        {currentPage + 1} / {Math.max(totalPages, 1)}
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="icon" onClick={prevPage} disabled={!isPrevActive} aria-label="Épisode lié précédent">
          <ArrowLeft aria-hidden="true" />
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={nextPage} disabled={!isNextActive} aria-label="Épisode lié suivant">
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export function RelatedPodcastsCarousel({ podcasts }: Props) {
  if (podcasts.length === 0) return null;

  return (
    <MotionConfig reducedMotion="user">
      <section className="mt-16 border-t border-secondary-500/20 pt-10" aria-labelledby="related-podcasts-title">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-500">Dans la même ambiance</p>
          <h2 id="related-podcasts-title" className="mt-2 text-3xl! font-semibold tracking-tight text-secondary-900">Continuer l&apos;écoute</h2>
        </div>
        <Carousel
          items={podcasts.map((podcast) => (
            <div key={podcast._id} className="w-full px-1 py-2">
              <PodcastCard podcast={podcast} variant="list" />
            </div>
          ))}
          loop={false}
          itemSize="fill"
          gap={20}
          fade="6%"
          className="cursor-grab active:cursor-grabbing"
          aria-label="Épisodes liés"
        >
          <SlideControls />
        </Carousel>
      </section>
    </MotionConfig>
  );
}
