"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { MotionConfig } from "motion/react";
import { Carousel, useCarousel } from "motion-plus/react";
import { useSyncExternalStore } from "react";
import { PodcastCard } from "@/components/PodcastCard";
import { Button } from "@/components/ui/button";
import type { PodcastPreview } from "@/lib/sanity/types";

type Props = { podcasts: PodcastPreview[] };

const TWO_CARD_QUERY = "(min-width: 768px)";
const THREE_CARD_QUERY = "(min-width: 1280px)";

function subscribeToResponsiveLayout(callback: () => void) {
  const mediaQueries = [
    window.matchMedia(TWO_CARD_QUERY),
    window.matchMedia(THREE_CARD_QUERY),
  ];
  mediaQueries.forEach((mediaQuery) => mediaQuery.addEventListener("change", callback));
  return () => {
    mediaQueries.forEach((mediaQuery) => mediaQuery.removeEventListener("change", callback));
  };
}

function getItemsPerSlideSnapshot() {
  if (window.matchMedia(THREE_CARD_QUERY).matches) return 3;
  if (window.matchMedia(TWO_CARD_QUERY).matches) return 2;
  return 1;
}

function getItemsPerSlideServerSnapshot() {
  return 1;
}

function SlideControls() {
  const { currentPage, totalPages, nextPage, prevPage, isNextActive, isPrevActive } = useCarousel();

  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <p className="text-sm font-medium text-primary-200" aria-live="polite">
        {currentPage + 1} / {Math.max(totalPages, 1)}
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" className="ff-command-button" size="icon" onClick={prevPage} disabled={!isPrevActive} aria-label="Épisode lié précédent">
          <ArrowLeft aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" className="ff-command-button" size="icon" onClick={nextPage} disabled={!isNextActive} aria-label="Épisode lié suivant">
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export function RelatedPodcastsCarousel({ podcasts }: Props) {
  const responsiveItemsPerSlide = useSyncExternalStore(
    subscribeToResponsiveLayout,
    getItemsPerSlideSnapshot,
    getItemsPerSlideServerSnapshot,
  );

  if (podcasts.length === 0) return null;

  const itemsPerSlide = Math.min(responsiveItemsPerSlide, podcasts.length);
  const slides = Array.from(
    { length: Math.ceil(podcasts.length / itemsPerSlide) },
    (_, slideIndex) => podcasts.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide),
  );

  return (
    <MotionConfig reducedMotion="user">
      <section className="ff-menu-window ff-archive-window mt-16 rounded-2xl p-4 sm:p-6" aria-labelledby="related-podcasts-title">
        <div className="mb-6">
          <p className="ff-archive-kicker text-sm font-semibold uppercase tracking-[0.18em]">Dans la même ambiance</p>
          <h2 id="related-podcasts-title" className="ff-archive-title mt-2 text-3xl! font-semibold tracking-tight">Continuer l&apos;écoute</h2>
        </div>
        <Carousel
          key={itemsPerSlide}
          items={slides.map((slide) => (
            <div
              key={slide.map((podcast) => podcast._id).join("-")}
              className={`grid h-full w-full gap-4 px-1 py-2 ${
                itemsPerSlide === 3
                  ? "grid-cols-3"
                  : itemsPerSlide === 2
                    ? "grid-cols-2"
                    : "grid-cols-1"
              }`}
            >
              {slide.map((podcast) => (
                <PodcastCard key={podcast._id} podcast={podcast} variant="compact" />
              ))}
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
