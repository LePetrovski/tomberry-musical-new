import { isSanityCdnUrl } from "@/lib/sanity/image";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url || !isSanityCdnUrl(url)) {
        return NextResponse.json({ error: "Invalid texture url" }, { status: 400 });
    }

    const upstream = await fetch(url);

    if (!upstream.ok) {
        const message = await upstream.text();
        return new NextResponse(message, {
            status: upstream.status,
            headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
        });
    }

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) {
        headers.set("content-type", contentType);
    }
    headers.set("cache-control", "public, max-age=31536000, immutable");

    return new NextResponse(upstream.body, { status: 200, headers });
}
