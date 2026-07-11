import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo/site";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          width: "100%",
          height: "100%",
          padding: 64,
          background: "linear-gradient(135deg, #18181b 0%, #3f3f46 100%)",
          color: "#fafafa",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {siteConfig.name}
        </div>
        <div style={{ marginTop: 16, fontSize: 28, color: "#d4d4d8", maxWidth: 800 }}>
          {siteConfig.description}
        </div>
      </div>
    ),
    { ...size },
  );
}
