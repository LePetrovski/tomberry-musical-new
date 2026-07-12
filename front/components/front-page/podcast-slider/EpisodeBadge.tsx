import { memo, useMemo } from "react";
import { DoubleSide } from "three";
import {
    EPISODE_BADGE_HEIGHT,
    EPISODE_BADGE_PADDING_X,
    EPISODE_BADGE_PADDING_Y,
    EPISODE_BADGE_Z,
    TILE_PLANE_HEIGHT,
    TILE_PLANE_WIDTH,
} from "./constants";
import { buildEpisodeBadgeTexture } from "./utils/episode-badge-texture";

type Props = {
    episodeNumber: number;
    tileScale: number;
};

function EpisodeBadgeComponent({ episodeNumber, tileScale }: Props) {
    const safeTileScale = Number.isFinite(tileScale) && tileScale > 0 ? tileScale : 1;
    const texture = useMemo(
        () => buildEpisodeBadgeTexture(episodeNumber),
        [episodeNumber],
    );

    const { badgeWorldWidth, x, y } = useMemo(() => {
        const pixelWidth = texture.userData.pixelWidth as number | undefined;
        const pixelHeight = texture.userData.pixelHeight as number | undefined;
        const aspect = pixelWidth && pixelHeight ? pixelWidth / pixelHeight : 1.4;
        const badgeHeight = EPISODE_BADGE_HEIGHT * safeTileScale;
        const width = badgeHeight * aspect;
        const planeWidth = TILE_PLANE_WIDTH * safeTileScale;
        const planeHeight = TILE_PLANE_HEIGHT * safeTileScale;

        return {
            badgeWorldWidth: width,
            x: planeWidth * -0.2 - EPISODE_BADGE_PADDING_X * safeTileScale - width * 0.5,
            y: planeHeight * 0.5 - EPISODE_BADGE_PADDING_Y * safeTileScale - badgeHeight * 0.5,
        };
    }, [texture, safeTileScale]);

    return (
        <mesh
            position={[x, y, EPISODE_BADGE_Z]}
            rotation={[0, Math.PI, 0]}
            scale={[badgeWorldWidth, EPISODE_BADGE_HEIGHT * safeTileScale, 1]}
            renderOrder={2}
            raycast={() => null}
        >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                map={texture}
                transparent
                toneMapped={false}
                depthTest
                depthWrite={false}
                side={DoubleSide}
                polygonOffset
                polygonOffsetFactor={-2}
            />
        </mesh>
    );
}

export const EpisodeBadge = memo(EpisodeBadgeComponent);
