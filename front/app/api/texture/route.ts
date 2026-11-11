import { isSanityImageUrl } from "@/lib/sanity/image";
import { NextRequest, NextResponse } from "next/server";

const errorHeaders = {
  "Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || !isSanityImageUrl(url)) {
    return NextResponse.json({ error: "Invalid texture url" }, { status: 400, headers: errorHeaders });
  }

  let upstream: Response;
  try {
    // Cache the response at the CDN, without a second copy in Next's Data Cache.
    upstream = await fetch(url, { cache: "no-store", redirect: "error" });
  } catch {
    return NextResponse.json({ error: "Unable to fetch texture" }, { status: 502, headers: errorHeaders });
  }

  if (!upstream.ok) {
    const message = await upstream.text();
    return new NextResponse(message, {
      status: upstream.status,
      headers: {
        ...errorHeaders,
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  }

  const headers = new Headers({
    "Cache-Control": "public, max-age=31536000, immutable",
    "Vercel-CDN-Cache-Control": "max-age=31536000",
  });
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  return new NextResponse(upstream.body, { status: 200, headers });
}
