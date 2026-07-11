import { MeshRefractionMaterial, useEnvironment, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Group, Mesh, Object3D, Texture } from "three";
import {
  CRYSTAL_COLOR,
  CRYSTAL_EMISSIVE,
  MAIN_CRYSTAL_METALNESS,
  MAIN_CRYSTAL_ROUGHNESS,
  MINI_CRYSTAL_METALNESS,
  MINI_CRYSTAL_ROUGHNESS,
} from "./constants";

function configureCrystalMesh(
  root: Object3D,
  meshName: string,
  envMap: Texture,
  roughness: number,
  metalness: number,
) {
  root.traverse((child) => {
    if (!(child instanceof Mesh) || child.name !== meshName) return;

    child.castShadow = true;
    child.receiveShadow = true;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (!("color" in material)) continue;

      material.color = CRYSTAL_COLOR.clone();
      material.emissive = CRYSTAL_EMISSIVE.clone();
      material.emissiveIntensity = 0.2;
      material.toneMapped = false;
      material.envMap = envMap;
      material.roughness = roughness;
      material.metalness = metalness;
      material.needsUpdate = true;
    }
  });
}

type Props = {
  tubeAngleRef: React.MutableRefObject<number>;
};

export function CrystalScene({ tubeAngleRef }: Props) {
  const { scene: mainScene } = useGLTF("/models/firstCrystal.glb");
  const { scene: miniScene } = useGLTF("/models/secondCrystal.glb");
  const envMap = useEnvironment({ preset: "studio" });

  const mainCrystal = useMemo(() => mainScene.clone(true), [mainScene]);
  const miniCrystal = useMemo(() => miniScene.clone(true), [miniScene]);

  const crystalsRef = useRef<Group>(null);
  const mainCrystalRef = useRef<Object3D>(null);
  const secondCrystalRef = useRef<Object3D>(null);
  const baseRotation = useMemo(() => ({ x: Math.PI / 8, y: Math.PI / 2 }), []);

  useEffect(() => {
    configureCrystalMesh(
      mainCrystal,
      "MainCrystal",
      envMap,
      MAIN_CRYSTAL_ROUGHNESS,
      MAIN_CRYSTAL_METALNESS,
    );
    configureCrystalMesh(
      miniCrystal,
      "MiniCrystal",
      envMap,
      MINI_CRYSTAL_ROUGHNESS,
      MINI_CRYSTAL_METALNESS,
    );
  }, [mainCrystal, miniCrystal, envMap]);

  useFrame((_, delta) => {
    const group = crystalsRef.current;
    if (group) {
      group.rotation.x = baseRotation.x;
      group.rotation.y = baseRotation.y - tubeAngleRef.current;
    }

    if (mainCrystalRef.current) {
      mainCrystalRef.current.rotation.y += 0.3 * delta;
    }

    if (secondCrystalRef.current) {
      secondCrystalRef.current.rotation.y += -0.2 * delta;
    }
  });

  return (
    <group ref={crystalsRef} position={[0, 1, 0]} scale={0.8}>
      <primitive ref={mainCrystalRef} object={mainCrystal} scale={0.7}>
        <MeshRefractionMaterial envMap={envMap} toneMapped={false} />
      </primitive>

      <primitive
        ref={secondCrystalRef}
        object={miniCrystal}
        scale={0.14}
        position={[1, 0.3, -0.8]}
        rotation={[Math.PI, 0, 0]}
      >
        <MeshRefractionMaterial envMap={envMap} toneMapped={false} />
      </primitive>
    </group>
  );
}

useGLTF.preload("/models/firstCrystal.glb");
useGLTF.preload("/models/secondCrystal.glb");
