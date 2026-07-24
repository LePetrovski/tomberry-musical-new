import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#18181b",
          color: "#fafafa",
          fontSize: 220,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        T
      </div>
    ),
    { ...size },
  );
}
