import type { GuestAppearance } from "@/lib/sanity/types";

type Props = {
  appearance: GuestAppearance;
};

export function LatestGuestAppearanceCard({ appearance }: Props) {
  return (
    <a
      href={appearance.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group mb-10 flex flex-col gap-4 overflow-hidden rounded-2xl border border-secondary-500/20 bg-secondary-100 p-5 transition-all duration-300 hover:border-secondary-500 hover:bg-secondary-500 hover:text-primary-500! md:flex-row "
    >
      <div className="min-w-0">
        <p className="text-lg! font-semibold uppercase tracking-wide text-secondary-500 group-hover:text-primary-500! transition-all duration-300">
          Dernière apparition
          {appearance.platform ? ` · ${appearance.platform}` : ""}
        </p>
        <h3 className="mt-2 text-2xl! font-semibold text-secondary-900 group-hover:text-primary-500! transition-all duration-300">
          {appearance.episodeTitle}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-secondary-600 group-hover:text-primary-500! transition-all duration-300">
          {appearance.showName}
        </p>
      </div>
    </a>
  );
}
