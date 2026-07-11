import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DoubleSide, Mesh, ShaderMaterial, Vector2 } from "three";
import { GRID_LINE_COLOR, GRID_PLANE_Z } from "./constants";
import { gridFragmentShader, gridVertexShader } from "./shaders/grid-shaders";
import { gridPlaneGeometry } from "./utils/shared-geometries";

type Props = {
  targetCenterUv: React.MutableRefObject<Vector2>;
};

export function GridPlane({ targetCenterUv }: Props) {
  const meshRef = useRef<Mesh>(null);
  const elapsedRef = useRef(0);
  const uniforms = useMemo(
    () => ({
      uGridScale: { value: 28.0 },
      uLineWidth: { value: 0.5 },
      uEdgeWidth: { value: 0.14 },
      uEdgeAmp: { value: 1.35 },
      uCenterRadius: { value: 0.22 },
      uCenterAmp: { value: 0.9 },
      uCenter: { value: new Vector2(0.5, 0.5) },
      uTime: { value: 0.0 },
      uScrollSpeed: { value: 0.01 },
      uResolution: { value: new Vector2(1, 1) },
      uLineColor: { value: GRID_LINE_COLOR.clone() },
    }),
    [],
  );

  useFrame((_state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const material = mesh.material as ShaderMaterial;

    elapsedRef.current += delta;
    material.uniforms.uTime.value = elapsedRef.current;
    (material.uniforms.uCenter.value as Vector2).lerp(targetCenterUv.current, 0.08);
  });

  return (
    <mesh ref={meshRef} geometry={gridPlaneGeometry} position={[0, 0, GRID_PLANE_Z]}>
      <shaderMaterial
        attach="material"
        args={[
          {
            uniforms,
            vertexShader: gridVertexShader,
            fragmentShader: gridFragmentShader,
            side: DoubleSide,
          },
        ]}
      />
    </mesh>
  );
}
