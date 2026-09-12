import type { Metadata } from "next";
import { CurtainLink } from "@/components/navigation/CurtainLink";
import { withSanityFallback } from "@/lib/sanity/fallback";
import { sanityFetch } from "@/lib/sanity/fetch";
import { homepageQuery, podcastsQuery } from "@/lib/sanity/queries";
import { sanityTags } from "@/lib/sanity/tags";
import type { Homepage, PodcastPreview } from "@/lib/sanity/types";
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
	const [podcasts, homepage] = await Promise.all([
		withSanityFallback(
			sanityFetch<PodcastPreview[]>(podcastsQuery, {}, { tags: [sanityTags.podcasts] }),
			[],
			"HomePage.podcasts",
		),
		withSanityFallback(
			sanityFetch<Homepage | null>(homepageQuery, {}, { tags: [sanityTags.homepage] }),
			null,
			"HomePage.homepage",
		),
	]);

	const aside = {
		label: homepage?.asideLabel ?? "À propos",
		eyebrow: homepage?.asideEyebrow ?? "Podcast",
		title: homepage?.asideTitle ?? siteConfig.name,
		tagline: homepage?.asideTagline ?? siteConfig.tagline,
		description:
			homepage?.asideDescription ??
			`${siteConfig.description} Chaque épisode explore les bandes originales, les compositeurs et les histoires derrière les musiques qui font vibrer les jeux.`,
		primaryLink: homepage?.asidePrimaryLink ?? {
			label: "Écouter les épisodes",
			href: "/podcasts",
		},
		secondaryLink: homepage?.asideSecondaryLink ?? {
			label: "Lire le blog",
			href: "/blog",
		},
	};

	return (
		<>
			<section className="h-screen w-full overflow-hidden" aria-label="Épisodes en avant">
				<PodcastSlider podcasts={podcasts} />
			</section>

			<AsideInfoDrawer label={aside.label}>
				<div className="px-7 py-10 sm:px-10 sm:py-12">
					<p className="text-sm font-medium uppercase tracking-[0.18em] text-secondary-500 ">
						{aside.eyebrow}
					</p>
					<h1
						id="aside-info-title"
						className="mt-3 text-3xl font-semibold tracking-tight text-secondary-900 sm:text-4xl"
					>
						{aside.title}
					</h1>
					<p className="mt-2 text-lg font-medium text-secondary-700">{aside.tagline}</p>
					<p className="mt-5 text-base leading-7 text-secondary-600 sm:text-lg sm:leading-8">
						{aside.description}
					</p>
					<div className="mt-8 flex flex-wrap gap-4 text-sm font-medium">
						<CurtainLink
							href={aside.primaryLink.href}
							className="text-secondary-900 underline-offset-4 transition hover:underline"
						>
							{aside.primaryLink.label}
						</CurtainLink>
						<CurtainLink
							href={aside.secondaryLink.href}
							className="text-secondary-900 underline-offset-4 transition hover:underline"
						>
							{aside.secondaryLink.label}
						</CurtainLink>
					</div>
				</div>
			</AsideInfoDrawer>
		</>
	);
}
