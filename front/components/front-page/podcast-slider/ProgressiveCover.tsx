import { useTexture } from "@react-three/drei";
import { useEffect } from "react";
import type { Texture } from "three";
import { disposeTileImageMaterial } from "./utils/tile-image-material";
import { buildPodcastTileTexture } from "./utils/tile-texture";

type Props = {
  url: string;
  register: (url: string, texture: Texture) => () => void;
};

/** One composed texture per URL, shared by all repetitions of that episode. */
export function ProgressiveCover({ url, register }: Props) {
  const cover = useTexture(url);

  useEffect(() => {
    const texture = buildPodcastTileTexture(cover);
    const unregister = register(url, texture);
    return () => {
      unregister();
      disposeTileImageMaterial(texture);
      texture.dispose();
    };
  }, [cover, register, url]);

  return null;
}
