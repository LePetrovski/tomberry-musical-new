'use client';

import type { PodcastPreview } from "@/lib/sanity/types";
import { Environment, Loader, MeshRefractionMaterial, useEnvironment, useGLTF } from "@react-three/drei";
import { Canvas, type ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  Mesh,
  Object3D,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
} from "three";

import { textureProxyUrlFor } from "@/lib/sanity/image";

const PLACEHOLDER_TEXTURE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

type Props = {
    podcasts: PodcastPreview[];
}

const TILE_TEXTURE_WIDTH = 360;
const TILE_TEXTURE_HEIGHT = 500;
const TILE_EPISODE_BAND_HEIGHT = 52;

function buildPodcastTileTexture(
    coverTexture: Texture,
    episodeNumber: number | undefined,
): Texture {
    const canvas = document.createElement("canvas");
    canvas.width = TILE_TEXTURE_WIDTH;
    canvas.height = TILE_TEXTURE_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) return coverTexture;

    const bandHeight = episodeNumber != null ? TILE_EPISODE_BAND_HEIGHT : 0;
    const coverHeight = TILE_TEXTURE_HEIGHT - bandHeight;

    if (episodeNumber != null) {
        ctx.fillStyle = "#f7f5f0";
        ctx.fillRect(0, 0, TILE_TEXTURE_WIDTH, bandHeight);
        ctx.fillStyle = "#3f3f46";
        ctx.font = "600 18px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`ÉPISODE ${episodeNumber}`, TILE_TEXTURE_WIDTH / 2, bandHeight / 2);
    }

    const image = coverTexture.image as HTMLImageElement | undefined;
    if (image && image.width > 0 && image.height > 0) {
        const scale = Math.max(TILE_TEXTURE_WIDTH / image.width, coverHeight / image.height);
        const sourceWidth = TILE_TEXTURE_WIDTH / scale;
        const sourceHeight = coverHeight / scale;
        const sourceX = (image.width - sourceWidth) / 2;
        const sourceY = (image.height - sourceHeight) / 2;

        ctx.drawImage(
            image,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            bandHeight,
            TILE_TEXTURE_WIDTH,
            coverHeight,
        );
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

const doubleSidedTileVertexShader = `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const doubleSidedTileFragmentShader = `
    uniform sampler2D map;
    varying vec2 vUv;

    void main() {
        vec2 uv = vUv;
        if (!gl_FrontFacing) {
            uv.x = 1.0 - uv.x;
        }
        gl_FragColor = texture2D(map, uv);
    }
`;

function DoubleSidedTileMaterial({ map }: { map: Texture }) {
    const material = useMemo(
        () =>
            new ShaderMaterial({
                uniforms: { map: { value: map } },
                vertexShader: doubleSidedTileVertexShader,
                fragmentShader: doubleSidedTileFragmentShader,
                side: DoubleSide,
                toneMapped: false,
            }),
        [map],
    );

    useEffect(() => () => material.dispose(), [material]);

    return <primitive object={material} attach="material" />;
}

function PodcastTile({
    coverTexture,
    podcast,
    onHoverStart,
    onHoverMove,
    onHoverEnd,
}: {
    coverTexture: Texture;
    podcast: PodcastPreview;
    onHoverStart: (projectName: string, event: ThreeEvent<PointerEvent>) => void;
    onHoverMove: (event: ThreeEvent<PointerEvent>) => void;
    onHoverEnd: () => void;
}) {
    const router = useRouter();
    const [tileTexture, setTileTexture] = useState<Texture>(() => coverTexture);

    useEffect(() => {
        const image = coverTexture.image as HTMLImageElement | undefined;

        const rebuild = () => {
            setTileTexture((current) => {
                const next = buildPodcastTileTexture(coverTexture, podcast.episodeNumber);
                if (current !== coverTexture) current.dispose();
                return next;
            });
        };

        if (!image) {
            rebuild();
            return;
        }

        if (image.complete && image.naturalWidth > 0) {
            rebuild();
            return;
        }

        image.addEventListener("load", rebuild);
        return () => image.removeEventListener("load", rebuild);
    }, [coverTexture, podcast.episodeNumber]);

    useEffect(() => {
        return () => {
            if (tileTexture !== coverTexture) tileTexture.dispose();
        };
    }, [tileTexture, coverTexture]);

    return (
        <mesh
            onClick={(event) => {
                event.stopPropagation();
                router.push(`/podcasts/${podcast.slug}`);
            }}
            onPointerOver={(event) => {
                event.stopPropagation();
                onHoverStart(podcast.title, event);
            }}
            onPointerMove={(event) => {
                event.stopPropagation();
                onHoverMove(event);
            }}
            onPointerOut={(event) => {
                event.stopPropagation();
                onHoverEnd();
            }}
        >
            <planeGeometry args={[0.72, 1]} />
            <DoubleSidedTileMaterial map={tileTexture} />
        </mesh>
    );
}

function GridPlane({
        targetCenterUv,
    }: {
        targetCenterUv: React.MutableRefObject<Vector2>;
    }) {
        const meshRef = useRef<Mesh>(null);
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
        }),
        [],
        );
    
        useFrame((state) => {
        const mesh = meshRef.current;
        if (!mesh) return;
        const material = mesh.material as ShaderMaterial;
    
        material.uniforms.uTime.value = state.clock.getElapsedTime();
        (material.uniforms.uCenter.value as Vector2).lerp(targetCenterUv.current, 0.08);
        });
    
        return (
        <mesh ref={meshRef} position={[0, 0, -5.2]}>
            <planeGeometry args={[18, 18, 512, 512]} />
            <shaderMaterial
            attach="material"
            args={[
                {
                uniforms,
                vertexShader: `
                    varying vec2 vUv;
                    
                    uniform float uEdgeWidth;
                    uniform float uEdgeAmp;
                    uniform float uCenterRadius;
                    uniform float uCenterAmp;
                    uniform vec2 uCenter;
    
                    void main() {
                        vUv = uv;
    
                        vec3 p = position;
    
                        float dEdge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
                        float edgeMask = 1.0 - smoothstep(0.0, uEdgeWidth, dEdge);
    
                        float dCenter = distance(vUv, uCenter);
                        float centerMask = 1.0 - smoothstep(0.0, uCenterRadius, dCenter);
    
                        float zOffset = edgeMask * uEdgeAmp + centerMask * uCenterAmp;
                        p.z += zOffset;
    
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
                    }
                    `,
                fragmentShader: `
                    varying vec2 vUv;
                    
                    uniform float uGridScale;
                    uniform float uLineWidth;
                    uniform float uTime;
                    uniform float uScrollSpeed;
                    uniform vec2 uResolution;
    
                    float gridLine(float coord, float width) {
                        float fw = fwidth(coord);
                        float p = abs(fract(coord - 0.5) - 0.5);
                        return 1.0 - smoothstep(width * fw, (width + 1.0) * fw, p);
                    }
    
                    void main() {
                        vec2 uv = (vUv + vec2(uTime * uScrollSpeed, 0.0)) * uGridScale;
                        float gx = gridLine(uv.x, uLineWidth);
                        float gy = gridLine(uv.y, uLineWidth);
                        float g = max(gx, gy);
    
                        // Blanc cassé (#F7F5F0) + lignes gris clair
                        vec3 base = vec3(0.969, 0.961, 0.941);
                        vec3 line = vec3(0.82, 0.80, 0.76);
                        vec3 col = mix(base, line, g);
                        gl_FragColor = vec4(col, 1.);
                    }
                    `,
                side: DoubleSide,
                },
            ]}
            />
        </mesh>
    );
}

const CRYSTAL_COLOR = new Color(0x43e0e0);
const CRYSTAL_EMISSIVE = new Color(0xc1ffff);
const MAIN_CRYSTAL_ROUGHNESS = 0.40;
const MAIN_CRYSTAL_METALNESS = 0.45;

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

function CrystalScene({ tubeAngleRef }: { tubeAngleRef: React.MutableRefObject<number> }) {
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
        configureCrystalMesh(miniCrystal, "MiniCrystal", envMap, 0.16, 0);
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
        <group ref={crystalsRef} position={[0, 1, 0]}>
            <primitive ref={mainCrystalRef} object={mainCrystal} scale={0.7}>
                <MeshRefractionMaterial envMap={envMap} toneMapped={false} />
            </primitive>

            <primitive
                ref={secondCrystalRef}
                object={miniCrystal}
                scale={0.14}
                position={[1, 0.8, -0.8]}
                rotation={[Math.PI, 0, 0]}
            >
                <MeshRefractionMaterial envMap={envMap} toneMapped={false} />
            </primitive>

        </group>
    );
}

function ImageTube({
    scrollTargetRef,
    spinVelocityRef,
    naturalDirRef,
    tubeAngleRef,
    rotationSpeedScaleTargetRef,
    rotationSpeedScaleLerpRef,
    baseSpeedRef,
    podcasts,
    rows,
    cols,
    onHoverStart,
    onHoverMove,
    onHoverEnd,
    }: {
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
        onHoverStart: (projectName: string, event: ThreeEvent<PointerEvent>) => void;
        onHoverMove: (event: ThreeEvent<PointerEvent>) => void;
        onHoverEnd: () => void;
    }) {
    const groupRef = useRef<Object3D>(null);
    const rowGroupRefs = useRef<Array<Object3D | null>>([]);
    const scrollCurrent = useRef(0);
    const angle = useRef(0);
    const rotationSpeedScale = useRef(1);

    const imageUrls = useMemo(
        () =>
            (podcasts ?? []).map((podcast) =>
                podcast.coverImage
                    ? textureProxyUrlFor(podcast.coverImage)
                    : PLACEHOLDER_TEXTURE,
            ),
        [podcasts],
    );

    const loadedTextures = useLoader(
        TextureLoader,
        imageUrls.length > 0 ? imageUrls : [PLACEHOLDER_TEXTURE],
    );
    const textures = Array.isArray(loadedTextures) ? loadedTextures : [loadedTextures];

    const radius = 4;
    const ySpacing = 2.7;
    const loopHeight = rows * ySpacing;
    const repeatCount = 3;
    const totalRows = rows * repeatCount;

    const rowSpeed = useMemo(() => {
        const speeds: number[] = [];
        for (let r = 0; r < rows; r++) {
            const t = rows <= 1 ? 0 : r / (rows - 1);
            const distFromCenter = Math.abs(t - 0.5) * 2;
            speeds.push(0.38 + distFromCenter * 0.28);
        }
        return speeds;
    }, [rows]);

    const rowPositions = useMemo(() => {
        const out: Array<{ rowIndex: number; y: number; baseRow: number; rowOffset: number }> = [];
        for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
            const y = (rowIndex - (totalRows - 1) / 2) * ySpacing;
            const baseRow = rowIndex % rows;
            const rowOffset = baseRow % 2 === 0 ? 0 : 0.5;
            out.push({ rowIndex, y, baseRow, rowOffset });
        }
        return out;
    }, [rows, totalRows, ySpacing]);

    useFrame((_state, dt) => {
        scrollCurrent.current += (scrollTargetRef.current - scrollCurrent.current) * 0.12;

        if (scrollCurrent.current > loopHeight / 2) {
            scrollCurrent.current -= loopHeight;
            scrollTargetRef.current -= loopHeight;
        } else if (scrollCurrent.current < -loopHeight / 2) {
            scrollCurrent.current += loopHeight;
            scrollTargetRef.current += loopHeight;
        }

        const damping = 0.92;
        spinVelocityRef.current *= Math.pow(damping, dt * 60);
        spinVelocityRef.current = Math.max(-2.0, Math.min(2.0, spinVelocityRef.current));

        rotationSpeedScale.current +=
            (rotationSpeedScaleTargetRef.current - rotationSpeedScale.current) *
            rotationSpeedScaleLerpRef.current;

        const scaledDt = dt * rotationSpeedScale.current;

        const baseSpeed = naturalDirRef.current * baseSpeedRef.current;
        angle.current += (baseSpeed + spinVelocityRef.current) * scaledDt;

        tubeAngleRef.current = angle.current;

        const group = groupRef.current;
        if (!group) return;
        group.position.y = -scrollCurrent.current;

        for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
            const rowObj = rowGroupRefs.current[rowIndex];
            if (!rowObj) continue;
            const baseRow = rowIndex % rows;
            rowObj.rotation.y = angle.current * rowSpeed[baseRow];
        }
    });

    return (
        <group ref={groupRef}>
            {podcasts.length === 0
                ? null
                : rowPositions.map(({ rowIndex, y, baseRow, rowOffset }) => (
            <group
                key={rowIndex}
                position={[0, y, 0]}
                ref={(obj) => {
                rowGroupRefs.current[rowIndex] = obj;
                }}
            >
                {Array.from({ length: cols }).map((_, col) => {
                const theta = ((col + rowOffset) / cols) * Math.PI * 2;
                const x = Math.cos(theta) * radius;
                const z = Math.sin(theta) * radius;
                const ry = -(theta + Math.PI / 2);
                const podcastIndex = (baseRow * cols + col) % podcasts.length;
                const podcast = podcasts[podcastIndex];
                const texIndex = podcastIndex;

                return (
                    <group
                    key={col}
                    position={[x, 0, z]}
                    rotation={[0, ry, 0]}
                    >
                    <PodcastTile
                        coverTexture={textures[texIndex]}
                        podcast={podcast}
                        onHoverStart={onHoverStart}
                        onHoverMove={onHoverMove}
                        onHoverEnd={onHoverEnd}
                    />
                    </group>
                );
                })}
            </group>
            ))}
        </group>
    );
}

export function PodcastSlider({ podcasts }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const targetCenterUv = useRef(new Vector2(0.5, 0.5));
    const tubeScrollTarget = useRef(0);
    const tubeSpinVelocity = useRef(0);
    const tubeNaturalDir = useRef(1);
    const tubeAngle = useRef(0);
  
    const tubeRows = 5;
    const tubeCols = 12;
  
    const baseSpeedRef = useRef(0.16);
    const hoverSlowdownEnabledRef = useRef(true);
    const hoverSlowdownScaleRef = useRef(0.28);
    const rotationSpeedScaleTargetRef = useRef(1);
    const rotationSpeedScaleLerpRef = useRef(0.12);
  
    const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  
      const tooltipElRef = useRef<HTMLDivElement | null>(null);
      const tooltipTarget = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
      const tooltipCurrent = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
      const tooltipRaf = useRef<number | null>(null);
  
      const cursorElRef = useRef<HTMLDivElement | null>(null);
      const cursorTarget = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
      const cursorCurrent = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
      const cursorActive = useRef(false);
      const cursorRaf = useRef<number | null>(null);
  
    const setTooltipFromClientPoint = useCallback((clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      tooltipTarget.current = { x: clientX - rect.left, y: clientY - rect.top };
    }, []);
  
      useEffect(() => {
        const tick = () => {
          const el = tooltipElRef.current;
          if (el) {
            const lerp = 0.18;
            tooltipCurrent.current.x += (tooltipTarget.current.x - tooltipCurrent.current.x) * lerp;
            tooltipCurrent.current.y += (tooltipTarget.current.y - tooltipCurrent.current.y) * lerp;
  
            const x = tooltipCurrent.current.x + 12;
            const y = tooltipCurrent.current.y - 18;
            el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
          }
  
          tooltipRaf.current = requestAnimationFrame(tick);
        };
  
        tooltipRaf.current = requestAnimationFrame(tick);
        return () => {
          if (tooltipRaf.current != null) cancelAnimationFrame(tooltipRaf.current);
        };
      }, []);
  
      useEffect(() => {
        const tick = () => {
          const el = cursorElRef.current;
          if (el) {
            const lerp = 0.14;
            cursorCurrent.current.x += (cursorTarget.current.x - cursorCurrent.current.x) * lerp;
            cursorCurrent.current.y += (cursorTarget.current.y - cursorCurrent.current.y) * lerp;
  
            const x = cursorCurrent.current.x + 8;
            const y = cursorCurrent.current.y + 8;
            el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%)`;
            el.style.opacity = cursorActive.current ? "1" : "0";
          }
  
          cursorRaf.current = requestAnimationFrame(tick);
        };
  
        cursorRaf.current = requestAnimationFrame(tick);
        return () => {
          if (cursorRaf.current != null) cancelAnimationFrame(cursorRaf.current);
        };
      }, []);
  
      const onImageHoverStart = useCallback(
        (projectName: string, event: ThreeEvent<PointerEvent>) => {
          setHoveredProject(projectName);
          setTooltipFromClientPoint(event.nativeEvent.clientX, event.nativeEvent.clientY);
  
          if (hoverSlowdownEnabledRef.current) {
            rotationSpeedScaleTargetRef.current = hoverSlowdownScaleRef.current;
          }
  
          tooltipCurrent.current = { ...tooltipTarget.current };
        },
        [setTooltipFromClientPoint],
      );
  
      const onImageHoverMove = useCallback(
        (event: ThreeEvent<PointerEvent>) => {
          setTooltipFromClientPoint(event.nativeEvent.clientX, event.nativeEvent.clientY);
        },
        [setTooltipFromClientPoint],
      );
  
      const onImageHoverEnd = useCallback(() => {
        setHoveredProject(null);
        rotationSpeedScaleTargetRef.current = 1;
      }, []);
  
      useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        const updateFromPointer = (clientX: number, clientY: number) => {
            const rect = root.getBoundingClientRect();
            const inside =
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom;

            if (!inside) {
                cursorActive.current = false;
                return;
            }

            cursorTarget.current = { x: clientX - rect.left, y: clientY - rect.top };
            cursorActive.current = true;

            if (rect.width <= 0 || rect.height <= 0) return;

            const nx = (clientX - rect.left) / rect.width;
            const ny = (clientY - rect.top) / rect.height;
            const uvX = Math.min(1, Math.max(0, nx));
            const uvY = 1 - Math.min(1, Math.max(0, ny));
            const strength = 0.4;
            const cx = 0.5 + (uvX - 0.5) * strength;
            const cy = 0.5 + (uvY - 0.5) * strength;
            targetCenterUv.current.set(Math.min(1, Math.max(0, cx)), Math.min(1, Math.max(0, cy)));
        };

        const onPointerMove = (event: PointerEvent) => {
            updateFromPointer(event.clientX, event.clientY);
        };

        const onPointerLeave = () => {
            cursorActive.current = false;
            targetCenterUv.current.set(0.5, 0.5);
            onImageHoverEnd();
        };

        window.addEventListener("pointermove", onPointerMove);
        root.addEventListener("pointerleave", onPointerLeave);

        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            root.removeEventListener("pointerleave", onPointerLeave);
        };
      }, [onImageHoverEnd]);
  
      const onWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
        tubeScrollTarget.current += event.deltaY * 0.0016;
        tubeSpinVelocity.current += event.deltaY * 0.0025;
  
        if (event.deltaY < 0) tubeNaturalDir.current = -1;
        else if (event.deltaY > 0) tubeNaturalDir.current = 1;
      }, []);
  
      return (
        <div
          className="sceneRoot h-full w-full"
          ref={containerRef}
          onWheel={onWheel}
        >
          <Canvas
            className="sceneCanvas"
            camera={{ position: [0, 0, 6.5], fov: 50 }}
            onCreated={({ camera }) => {
              camera.lookAt(0, 0, 0);
            }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
  
              <Environment preset="studio" blur={10.5} />
  
              <GridPlane targetCenterUv={targetCenterUv} />
  
              <ImageTube
                scrollTargetRef={tubeScrollTarget}
                spinVelocityRef={tubeSpinVelocity}
                naturalDirRef={tubeNaturalDir}
                tubeAngleRef={tubeAngle}
                rotationSpeedScaleTargetRef={rotationSpeedScaleTargetRef}
                rotationSpeedScaleLerpRef={rotationSpeedScaleLerpRef}
                baseSpeedRef={baseSpeedRef}
                podcasts={podcasts}
                rows={tubeRows}
                cols={tubeCols}
                onHoverStart={onImageHoverStart}
                onHoverMove={onImageHoverMove}
                onHoverEnd={onImageHoverEnd}
              />
  
              <CrystalScene tubeAngleRef={tubeAngle} />
            </Suspense>
          </Canvas>
  
          <div className="whiteEdgeGradient" aria-hidden="true" />
          {hoveredProject && (
            <div
              className="projectTooltip"
              ref={tooltipElRef}
              role="status"
              aria-live="polite"
            >
              {hoveredProject}
            </div>
          )}
  
          <div className="customCursor" ref={cursorElRef} aria-hidden="true" />
          <Loader />
        </div>
    );
}

useGLTF.preload("/models/firstCrystal.glb");
useGLTF.preload("/models/secondCrystal.glb");