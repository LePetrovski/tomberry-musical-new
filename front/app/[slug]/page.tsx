import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageWrapper } from "@/components/PageWrapper";
import { RichText } from "@/components/RichText";
import { getPageBySlug } from "@/lib/sanity/cached";
import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { pageSlugsQuery } from "@/lib/sanity/queries";
import { getOgImageUrl } from "@/lib/seo/images";
import { createPageMetadata } from "@/lib/seo/metadata";
import { webPageSchema } from "@/lib/seo/schemas";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    const slugs = await client.fetch<string[]>(pageSlugsQuery).catch(() => []);
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPageBySlug(slug);

    if (!page) {
        return { title: "Page introuvable" };
    }

    return createPageMetadata({
        title: page.title,
        description: page.description,
        path: `/${slug}`,
        image: getOgImageUrl(page.coverImage),
    });
}

export default async function CmsPage({ params }: Props) {
    const { slug } = await params;
    const page = await getPageBySlug(slug);

    if (!page) {
        notFound();
    }

    const ogImage = getOgImageUrl(page.coverImage);

    return (
        <PageWrapper background="polka" width="narrow">
            <article>
            <JsonLd data={webPageSchema(page, ogImage)} />
            <Breadcrumbs
                className="mb-8"
                items={[{ label: "Accueil", href: "/" }, { label: page.title }]}
            />
            <header className="mb-10">
                <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">{page.title}</h1>
                {page.description && (
                    <p className="mt-4 text-lg leading-8 text-zinc-600">{page.description}</p>
                )}
            </header>

            {page.coverImage && (
                <div className="relative mb-10 aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100">
                    <Image
                        src={urlFor(page.coverImage).width(1200).height(750).url()}
                        alt={page.coverImage.alt ?? page.title}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, 768px"
                    />
                </div>
            )}

            <div className="prose prose-zinc max-w-none">
                <RichText value={page.body} />
            </div>
            </article>
        </PageWrapper>
    );
}
