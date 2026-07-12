"use client";

import { useSound } from "@web-kits/audio/react";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { deckUiNavigationSound, showModalSound } from "@/lib/audio/tile-ui-sounds";

type TileSoundContextValue = {
  playHover: () => void;
  playClick: () => void;
};

const TileSoundContext = createContext<TileSoundContextValue | null>(null);

export function TileSoundProvider({ children }: { children: ReactNode }) {
  const playHover = useSound(deckUiNavigationSound);
  const playClick = useSound(showModalSound);

  const value = useMemo(
    () => ({
      playHover: () => {
        playHover();
      },
      playClick: () => {
        playClick();
      },
    }),
    [playClick, playHover],
  );

  return (
    <TileSoundContext.Provider value={value}>{children}</TileSoundContext.Provider>
  );
}

export function useTileSounds() {
  const context = useContext(TileSoundContext);
  if (!context) {
    throw new Error("useTileSounds must be used within TileSoundProvider");
  }
  return context;
}
