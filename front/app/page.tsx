import type { Metadata } from "next";
import { CurtainLink } from "@/components/navigation/CurtainLink";
import { withSanityFallback } from "@/lib/sanity/fallback";
import { sanityFetch } from "@/lib/sanity/fetch";
import { podcastsQuery } from "@/lib/sanity/queries";
import { sanityTags } from "@/lib/sanity/tags";
import type { PodcastPreview } from "@/lib/sanity/types";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";
import { PodcastSlider } from "@/components/front-page/PodcastSlider";
import { AsideInfoDrawer } from "@/components/front-page/AsideInfoDrawer";

export const metadata: Metadata = {
	...createPageMetadata({
		title: siteConfig.name,
		description: siteConfig.description,
		path: "/",
	}),
	title: {
		absolute: `${siteConfig.name} — ${siteConfig.tagline}`,
	},
};

export default async function HomePage() {
	const podcasts = await withSanityFallback(
		sanityFetch<PodcastPreview[]>(podcastsQuery, {}, { tags: [sanityTags.podcasts] }),
		[],
		"HomePage.podcasts",
	);

	return (
		<>
			<section className="h-screen w-full overflow-hidden" aria-label="Épisodes en avant">
				<PodcastSlider podcasts={podcasts} />
			</section>

			<AsideInfoDrawer>
				<div className="px-7 py-10 sm:px-10 sm:py-12">
					<p className="text-sm font-medium uppercase tracking-[0.18em] text-secondary-500 ">
						Podcast
					</p>
					<h1
						id="aside-info-title"
						className="mt-3 text-3xl font-semibold tracking-tight text-secondary-900 sm:text-4xl"
					>
						{siteConfig.name}
					</h1>
					<p className="mt-2 text-lg font-medium text-secondary-700">{siteConfig.tagline}</p>
					<p className="mt-5 text-base leading-7 text-secondary-600 sm:text-lg sm:leading-8">
						{siteConfig.description} Chaque épisode explore les bandes originales, les
						compositeurs et les histoires derrière les musiques qui font vibrer les jeux.
					</p>
					<div className="mt-8 flex flex-wrap gap-4 text-sm font-medium">
						<CurtainLink
							href="/podcasts"
							className="text-secondary-900 underline-offset-4 transition hover:underline"
						>
							Écouter les épisodes
						</CurtainLink>
						<CurtainLink
							href="/blog"
							className="text-secondary-900 underline-offset-4 transition hover:underline"
						>
							Lire le blog
						</CurtainLink>
					</div>
				</div>
			</AsideInfoDrawer>
		</>
	);
}
