import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { client } from "@/lib/sanity/client";
import { podcastsQuery } from "@/lib/sanity/queries";
import type { PodcastPreview } from "@/lib/sanity/types";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";
import { webSiteSchema } from "@/lib/seo/schemas";
import { PodcastSlider } from "@/components/front-page/PodcastSlider";

export const metadata: Metadata = createPageMetadata({
	title: siteConfig.name,
	description: siteConfig.description,
	path: "/",
});

export default async function HomePage() {
	const podcasts = await client.fetch<PodcastPreview[]>(podcastsQuery).catch(() => []);

	return (
		<>
			<JsonLd data={webSiteSchema()} />
			{/* <section className="border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white">
				<div className="mx-auto max-w-6xl px-6 py-24">
				<p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
					Vitrine
				</p>
				<h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
					Des conversations qui inspirent, un podcast qui raconte votre univers.
				</h1>
				<p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
					Découvrez les derniers épisodes, plongez dans les coulisses et explorez nos articles
					pour aller plus loin.
				</p>
				<div className="mt-10 flex flex-wrap gap-4">
					<Link
					href="/podcasts"
					className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
					>
					Écouter les podcasts
					</Link>
					<Link
					href="/blog"
					className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
					>
					Lire le blog
					</Link>
				</div>
				</div>
			</section> */}

			<section className="h-screen w-full overflow-hidden">
			<PodcastSlider podcasts={podcasts} />
			</section>

			{/* <section className="border-t border-zinc-200 bg-zinc-50">
				<div className="mx-auto max-w-6xl px-6 py-20">
				<div className="mb-10 flex items-end justify-between gap-4">
					<div>
					<h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
						Articles récents
					</h2>
					<p className="mt-2 text-zinc-600">Analyses, coulisses et ressources.</p>
					</div>
					<Link href="/blog" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
					Voir tout →
					</Link>
				</div>
				{posts.length > 0 ? (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{posts.map((post) => (
						<BlogCard key={post._id} post={post} />
					))}
					</div>
				) : (
					<p className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-zinc-600">
					Aucun article publié pour le moment. Ajoutez du contenu dans Sanity Studio.
					</p>
				)}
				</div>
			</section> */}
		</>
	);
}
