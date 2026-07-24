import { notFound } from "next/navigation";
import { getPodcastBySlug } from "@/lib/sanity/cached";
import { buildEpisodeDownloadFilename } from "@/lib/podcast/listening-options";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const podcast = await getPodcastBySlug(slug);

  if (!podcast) {
    notFound();
  }

  const filename = buildEpisodeDownloadFilename(podcast);
  const sanityUrl = podcast.audioFile?.asset?.url;

  if (!sanityUrl) {
    return new Response("Aucun fichier audio disponible pour cet épisode.", { status: 404 });
  }

  const upstream = await fetch(sanityUrl);

  if (!upstream.ok || !upstream.body) {
    return new Response("Impossible de récupérer le fichier audio.", { status: 502 });
  }

  const headers = new Headers({
    "Content-Type": podcast.audioFile?.asset?.mimeType ?? "audio/mpeg",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "public, max-age=3600",
  });

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new Response(upstream.body, { status: 200, headers });
}
