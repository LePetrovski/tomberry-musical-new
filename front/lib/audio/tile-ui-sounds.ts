import type { SoundDefinition } from "@web-kits/audio";

/** Sons du patch core — https://audio.raphaelsalaja.com/library/core */
export const deckUiNavigationSound: SoundDefinition = {
  source: { type: "sample", url: "/audio/deck-ui-navigation.wav" },
  gain: 0.1,
};

export const showModalSound: SoundDefinition = {
  source: { type: "sample", url: "/audio/deck-ui-show-modal.wav" },
  gain: 0.1,
};
