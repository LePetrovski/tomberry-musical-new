import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { SANITY_TAG, sanityTags } from "@/lib/sanity/tags";

export const runtime = "nodejs";

type SanityWebhookBody = {
  _type?: string;
  slug?: string | { current?: string };
};

function getSlug(value: SanityWebhookBody["slug"]): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value.current;
}

function revalidateImmediate(tag: string) {
  revalidateTag(tag, { expire: 0 });
}

function handleDocumentType(_type: string | undefined, slug?: string) {
  revalidateImmediate(SANITY_TAG);

  switch (_type) {
    case "podcast":
    case "podcastCategory":
      revalidateImmediate(sanityTags.podcasts);
      revalidatePath("/");
      revalidatePath("/podcasts");
      if (slug) revalidatePath(`/podcasts/${slug}`);
      break;

    case "guestAppearance":
      revalidateImmediate(sanityTags.guestAppearances);
      revalidateImmediate(sanityTags.podcasts);
      revalidatePath("/podcasts");
      break;

    case "post":
    case "postCategory":
      revalidateImmediate(sanityTags.posts);
      revalidatePath("/blog");
      if (slug) revalidatePath(`/blog/${slug}`);
      break;

    case "page":
      revalidateImmediate(sanityTags.pages);
      if (slug) revalidatePath(`/${slug}`);
      break;

    case "siteSettings":
      revalidateImmediate(sanityTags.siteSettings);
      revalidatePath("/", "layout");
      break;

    default:
      revalidateImmediate(sanityTags.podcasts);
      revalidateImmediate(sanityTags.posts);
      revalidateImmediate(sanityTags.pages);
      revalidateImmediate(sanityTags.guestAppearances);
      revalidateImmediate(sanityTags.siteSettings);
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/podcasts");
      revalidatePath("/blog");
      break;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim();

  if (!secret) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature) {
    return NextResponse.json({ message: "Missing webhook signature" }, { status: 401 });
  }

  // Corps brut obligatoire pour la vérif HMAC (ne pas parser avant).
  const rawBody = await request.text();

  const valid = await isValidSignature(rawBody, signature, secret);
  if (!valid) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  let body: SanityWebhookBody = {};
  try {
    body = rawBody.trim() ? (JSON.parse(rawBody) as SanityWebhookBody) : {};
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const slug = getSlug(body.slug);
  handleDocumentType(body._type, slug);
  revalidatePath("/sitemap.xml");

  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    type: body._type ?? null,
    slug: slug ?? null,
  });
}
