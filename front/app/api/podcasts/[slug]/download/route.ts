import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { getPodcastBySlug } from "@/lib/sanity/cached";
import { getEpisodeDownloadUrl } from "@/lib/podcast/listening-options";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const podcast = await getPodcastBySlug(slug);

  if (!podcast) {
    notFound();
  }

  const downloadUrl = getEpisodeDownloadUrl(podcast);

  if (!downloadUrl) {
    return new Response("Aucun fichier audio disponible pour cet épisode.", { status: 404 });
  }

  return NextResponse.redirect(downloadUrl, 307);
}
