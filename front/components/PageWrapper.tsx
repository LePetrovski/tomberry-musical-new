import type { ReactNode } from "react";

export type PageBackground = "cross" | "polka" | "zigzag" | "rosette" | "grid-thin" | "none";

export type PageWidth = "wide" | "default" | "narrow";

type Props = {
  children: ReactNode;
  background?: PageBackground;
  width?: PageWidth;
  className?: string;
  contentClassName?: string;
};

const backgroundClasses: Record<PageBackground, string> = {
  cross: "bg-cross",
  polka: "bg-polka",
  zigzag: "bg-zigzag",
  rosette: "bg-tiled-rosette",
  "grid-thin": "bg-grid-thin",
  none: "bg-primary-500",
};

const widthClasses: Record<PageWidth, string> = {
  wide: "max-w-[1500px] lg:px-10 px-6",
  default: "max-w-6xl px-6",
  narrow: "max-w-3xl px-6",
};

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PageWrapper({
  children,
  background = "none",
  width = "default",
  className,
  contentClassName,
}: Props) {
  return (
    <div className={joinClasses("min-h-full w-full", backgroundClasses[background], className)}>
      <div
        className={joinClasses(
          "mx-auto pt-30 pb-40",
          widthClasses[width],
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
