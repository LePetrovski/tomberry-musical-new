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

  const response = await fetch(sanityUrl);

  if (!response.ok) {
    return new Response("Impossible de récupérer le fichier audio.", { status: 502 });
  }

  const buffer = await response.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": podcast.audioFile?.asset?.mimeType ?? "audio/mpeg",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
