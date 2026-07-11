export const gridVertexShader = `
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
`;

export const gridFragmentShader = `
  varying vec2 vUv;

  uniform float uGridScale;
  uniform float uLineWidth;
  uniform float uTime;
  uniform float uScrollSpeed;
  uniform vec2 uResolution;
  uniform vec3 uLineColor;

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

    vec3 base = vec3(0.969, 0.961, 0.941);
    vec3 col = mix(base, uLineColor, g);
    gl_FragColor = vec4(col, 1.);
  }
`;
