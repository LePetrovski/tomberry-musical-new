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
};

function EpisodeBadgeComponent({ episodeNumber }: Props) {
    const texture = useMemo(
        () => buildEpisodeBadgeTexture(episodeNumber),
        [episodeNumber],
    );

    const { badgeWorldWidth, x, y } = useMemo(() => {
        const pixelWidth = texture.userData.pixelWidth as number | undefined;
        const pixelHeight = texture.userData.pixelHeight as number | undefined;
        const aspect = pixelWidth && pixelHeight ? pixelWidth / pixelHeight : 1.4;
        const width = EPISODE_BADGE_HEIGHT * aspect;

        return {
            badgeWorldWidth: width,
            x: TILE_PLANE_WIDTH * -0.2 - EPISODE_BADGE_PADDING_X - width * 0.5,
            y: TILE_PLANE_HEIGHT * 0.5 - EPISODE_BADGE_PADDING_Y - EPISODE_BADGE_HEIGHT * 0.5,
        };
    }, [texture]);

    return (
        <mesh
            position={[x, y, EPISODE_BADGE_Z]}
            rotation={[0, Math.PI, 0]}
            scale={[badgeWorldWidth, EPISODE_BADGE_HEIGHT, 1]}
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
