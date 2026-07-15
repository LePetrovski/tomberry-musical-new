import {
    DoubleSide,
    MeshPhysicalMaterial,
    Texture,
} from "three";
import {
    TILE_CLEARCOAT,
    TILE_CLEARCOAT_ROUGHNESS,
    TILE_ENV_MAP_INTENSITY,
    TILE_IRIDESCENCE,
    TILE_IRIDESCENCE_IOR,
    TILE_IRIDESCENCE_THICKNESS_MAX,
    TILE_IRIDESCENCE_THICKNESS_MIN,
    TILE_METALNESS,
    TILE_ROUGHNESS,
    TILE_SPECULAR_INTENSITY,
} from "../constants";

const tileMaterialCache = new Map<string, MeshPhysicalMaterial>();

function applyTileMaterialProps(material: MeshPhysicalMaterial, map: Texture) {
    material.map = map;
    material.color.setScalar(1);
    material.roughness = TILE_ROUGHNESS;
    material.metalness = TILE_METALNESS;
    material.clearcoat = TILE_CLEARCOAT;
    material.clearcoatRoughness = TILE_CLEARCOAT_ROUGHNESS;
    material.envMapIntensity = TILE_ENV_MAP_INTENSITY;
    material.specularIntensity = TILE_SPECULAR_INTENSITY;
    material.iridescence = TILE_IRIDESCENCE;
    material.iridescenceIOR = TILE_IRIDESCENCE_IOR;
    material.iridescenceThicknessRange = [
        TILE_IRIDESCENCE_THICKNESS_MIN,
        TILE_IRIDESCENCE_THICKNESS_MAX,
    ];
    material.needsUpdate = true;
}

export function getTileImageMaterial(map: Texture) {
    const cached = tileMaterialCache.get(map.uuid);
    if (cached) {
        applyTileMaterialProps(cached, map);
        return cached;
    }

    const material = new MeshPhysicalMaterial({
        map,
        transparent: true,
        alphaTest: 0.02,
        toneMapped: true,
        side: DoubleSide,
        depthWrite: true,
    });
    applyTileMaterialProps(material, map);

    tileMaterialCache.set(map.uuid, material);
    return material;
}

export function disposeTileMaterialCache() {
    for (const material of tileMaterialCache.values()) {
        material.dispose();
    }
    tileMaterialCache.clear();
}
