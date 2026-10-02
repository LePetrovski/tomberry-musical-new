"use client";

import { createContext, useContext, type ReactNode } from "react";

export type TileFrameUpdate = (delta: number) => boolean;

export type TileFrameScheduler = {
  request: (update: TileFrameUpdate) => void;
  cancel: (update: TileFrameUpdate) => void;
};

const TileFrameContext = createContext<TileFrameScheduler | null>(null);

export function TileFrameProvider({
  scheduler,
  children,
}: {
  scheduler: TileFrameScheduler;
  children: ReactNode;
}) {
  return <TileFrameContext.Provider value={scheduler}>{children}</TileFrameContext.Provider>;
}

export function useTileFrameScheduler() {
  const scheduler = useContext(TileFrameContext);
  if (!scheduler) throw new Error("Tile frame scheduler is unavailable");
  return scheduler;
}
