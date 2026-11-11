import assert from "node:assert/strict";
import { before, test } from "node:test";
import { NextRequest } from "next/server";

let GET: typeof import("./route").GET;
let textureProxyUrlFor: typeof import("@/lib/sanity/image").textureProxyUrlFor;

before(async () => {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "test123";
  process.env.NEXT_PUBLIC_SANITY_DATASET = "production";
  ({ GET } = await import("./route"));
  ({ textureProxyUrlFor } = await import("@/lib/sanity/image"));
});

const assetUrl = "https://cdn.sanity.io/images/test123/production/abc-500x320.jpg?w=500&fm=webp";

function request(url?: string) {
  const params = new URLSearchParams();
  if (url !== undefined) params.set("url", url);
  return new NextRequest(`http://localhost/api/texture?${params}`);
}

test("valid textures stream unchanged with browser and Vercel CDN caching", async (t) => {
  const bytes = new Uint8Array([82, 73, 70, 70]);
  const fetchMock = t.mock.method(globalThis, "fetch", async () => new Response(bytes, {
    headers: { "Content-Type": "image/webp" },
  }));
  const response = await GET(request(assetUrl));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "image/webp");
  assert.equal(response.headers.get("Cache-Control"), "public, max-age=31536000, immutable");
  assert.equal(response.headers.get("Vercel-CDN-Cache-Control"), "max-age=31536000");
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
  assert.equal(fetchMock.mock.calls[0].arguments[0], assetUrl);
});

test("generated WebGL texture URLs still work with the restricted proxy", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("image", { headers: { "Content-Type": "image/webp" } }));
  const path = textureProxyUrlFor({ asset: { _ref: "image-abc-500x320-jpg" } });
  const response = await GET(new NextRequest(`http://localhost${path}`));
  assert.equal(response.status, 200);
});

test("missing, malformed, foreign and non-image URLs never reach upstream or the cache", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected fetch"); });
  const invalidUrls = [
    undefined,
    "not a URL",
    assetUrl.replace("https:", "http:"),
    assetUrl.replace("cdn.sanity.io", "cdn.sanity.io.example.com"),
    assetUrl.replace("test123", "other-project"),
    assetUrl.replace("production", "staging"),
    assetUrl.replace("/images/", "/files/"),
    "https://cdn.sanity.io/images/test123/production/",
    "https://cdn.sanity.io/images/test123/production/abc/extra.jpg",
    assetUrl.replace("https://", "https://user:password@"),
    `${assetUrl}#fragment`,
  ];
  for (const url of invalidUrls) {
    const response = await GET(request(url));
    assert.equal(response.status, 400, url);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal(response.headers.get("Vercel-CDN-Cache-Control"), "no-store");
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("upstream errors are not cached", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("Missing image", { status: 404 }));
  const response = await GET(request(assetUrl));
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "Missing image");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("Vercel-CDN-Cache-Control"), "no-store");
});

test("network failures return an uncached 502", async (t) => {
  t.mock.method(globalThis, "fetch", async () => { throw new Error("Network unavailable"); });
  const response = await GET(request(assetUrl));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("Vercel-CDN-Cache-Control"), "no-store");
});
