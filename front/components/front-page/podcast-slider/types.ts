import type { ThreeEvent } from "@react-three/fiber";
import type { SoundCloudPlayerState } from "@/components/audio/SoundCloudPlayerContext";
import type { PodcastPreview } from "@/lib/sanity/types";

export type PodcastSliderProps = {
  podcasts: PodcastPreview[];
};

export type TileButtonHover = "play" | "detail" | null;

export type TileHoverHandlers = {
  onHoverStart: (projectName: string, event: ThreeEvent<PointerEvent>) => void;
  onHoverMove: (event: ThreeEvent<PointerEvent>, buttonHover: TileButtonHover) => void;
  onHoverEnd: () => void;
};

export type ImageTubeProps = TileHoverHandlers & {
  scrollTargetRef: React.MutableRefObject<number>;
  spinVelocityRef: React.MutableRefObject<number>;
  naturalDirRef: React.MutableRefObject<number>;
  tubeAngleRef: React.MutableRefObject<number>;
  rotationSpeedScaleTargetRef: React.MutableRefObject<number>;
  rotationSpeedScaleLerpRef: React.MutableRefObject<number>;
  baseSpeedRef: React.MutableRefObject<number>;
  podcasts: PodcastPreview[];
  rows: number;
  cols: number;
  tileScale: number;
  ySpacing: number;
  tubeRadius: number;
  onPlayPodcast: (player: SoundCloudPlayerState) => void;
};
