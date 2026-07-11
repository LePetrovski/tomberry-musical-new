export function extractIframeSrc(embedHtml: string): string | null {
    const match = embedHtml.match(/src=["']([^"']+)["']/i);
    return match?.[1] ?? null;
}

function withAutoplay(embedUrl: string): string {
    try {
        const url = new URL(embedUrl);
        url.searchParams.set("auto_play", "true");
        return url.toString();
    } catch {
        return embedUrl.includes("auto_play=")
            ? embedUrl
            : `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}auto_play=true`;
    }
}

export function getSoundCloudEmbedUrl(
    soundcloud?: string,
    embedSoundcloud?: string,
): string | null {
    if (embedSoundcloud) {
        const src = extractIframeSrc(embedSoundcloud);
        if (src) return withAutoplay(src);
    }

    if (soundcloud) {
        const params = new URLSearchParams({
            url: soundcloud,
            color: "0c5d66",
            auto_play: "true",
            hide_related: "true",
            show_comments: "false",
            show_user: "true",
            show_reposts: "false",
            show_teaser: "false",
        });
        return `https://w.soundcloud.com/player/?${params.toString()}`;
    }

    return null;
}
