import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

const app = document.getElementById("bg-three");
const fallback = document.getElementById("bg-fallback");

const testCanvas = document.createElement("canvas");
const gl2 = testCanvas.getContext("webgl2");
const gl = gl2 ?? testCanvas.getContext("webgl");
if (!gl) { fallback.style.display = "grid"; throw new Error("WebGL unavailable"); }

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth * 1.5, window.innerHeight * 1.5);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.65;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 5.5);
camera.lookAt(0, 0.8, 0);

const VERT = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Warm palette for India version
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uProjectionIntensity;
uniform float uReflectionGain;
uniform float uHighlightBoost;
uniform float uLumaVisibilityThreshold;
uniform float uInvertColor;
uniform float uHalftone;
uniform float uToneCut;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * snoise(p); p = p * 2.0 + vec2(17.0, 31.0); a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;
  float t = uTime;

  vec2 flow = vec2(t * 0.19, t * 0.13);
  vec2 q = vec2(fbm(p * 1.05 + flow), fbm(p * 1.05 + vec2(-flow.y * 1.1, flow.x * 0.9)));
  vec2 w = p + q * 0.62;

  float nA = 0.5 + 0.5 * fbm(w * 2.15 + flow * 0.8);
  float nB = 0.5 + 0.5 * fbm(w * 4.8 + vec2(-flow.x * 0.5, flow.y * 0.35));
  float ridge = 1.0 - abs(2.0 * nB - 1.0);
  float mask = clamp(0.18 + 1.12 * (0.58 * nA + 0.42 * ridge), 0.0, 1.0);
  float edgeFade = 1.0 - clamp(length(p) * 0.7, 0.0, 1.0);
  float intensity = pow(clamp(mask * (0.72 + edgeFade * 0.45), 0.0, 1.0), 1.05);

  // Warm palette: oranges, ambers, golds
  float base = nA * 0.82 + ridge * 0.18;
  vec3 col = vec3(
    0.25 + 0.75 * (0.5 + 0.5 * cos(6.28318 * (base + 0.02 + t * 0.07))),
    0.12 + 0.55 * (0.5 + 0.5 * cos(6.28318 * (base + 0.37 + t * 0.06))),
    0.05 + 0.35 * (0.5 + 0.5 * cos(6.28318 * (base + 0.72 + t * 0.065)))
  );
  col *= intensity;

  float highlight = pow(clamp((nA * 1.1 + ridge * 0.75) - 1.1, 0.0, 1.0), 2.2);
  col = mix(col, vec3(0.9, 0.7, 0.3), highlight * vec3(0.22, 0.16, 0.1));
  vec3 tex = clamp(col, 0.0, 1.0);

  if (uInvertColor > 0.5) { tex = vec3(1.0) - tex; }
  if (uToneCut > 0.5) { float toneLevels = 5.0; tex = floor(tex * (toneLevels - 1.0) + 0.5) / (toneLevels - 1.0); }

  float lum = dot(tex, vec3(0.2126, 0.7152, 0.0722));
  float lumaStart = clamp(uLumaVisibilityThreshold, 0.0, 1.0);
  float lumaEnd = min(1.0, lumaStart + 0.1);
  float darkMask = 1.0;
  if (lumaStart > 1e-4) { darkMask = smoothstep(lumaStart, lumaEnd, lum); }

  if (uHalftone > 0.5) {
    vec2 hUv = vUv * vec2(180.0, 120.0);
    vec2 hCell = fract(hUv) - 0.5;
    float dotRadius = mix(0.02, 0.45, clamp(lum, 0.0, 1.0));
    float dotMask = 1.0 - smoothstep(dotRadius, dotRadius + 0.035, length(hCell));
    tex *= dotMask * darkMask;
  }

  float hi = smoothstep(0.5, 1.0, lum);
  tex *= darkMask;
  tex *= mix(1.0, uHighlightBoost, hi);
  tex *= max(0.0, uProjectionIntensity) * max(0.0, uReflectionGain);

  gl_FragColor = vec4(tex, 1.0);
}
`;

const OVERLAY_VERT = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const OVERLAY_FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uStrength;
uniform float uYStart;

void main() {
  float gradient = smoothstep(uYStart, 1.0, vUv.y);
  vec3 darkColor = vec3(0.04, 0.04, 0.05);
  gl_FragColor = vec4(darkColor, gradient * uStrength);
}
`;

function createGradientRenderSource(width = 1024, height = 576) {
  const w = Math.max(2, Math.floor(width));
  const h = Math.max(2, Math.floor(height));
  const sourceScene = new THREE.Scene();
  const sourceCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const sourceMaterial = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 }, uProjectionIntensity: { value: 0.5 },
      uReflectionGain: { value: 1.0 }, uHighlightBoost: { value: 1.65 },
      uLumaVisibilityThreshold: { value: 0.3 }, uInvertColor: { value: 0 },
      uHalftone: { value: 0 }, uToneCut: { value: 0 },
    },
    depthTest: false, depthWrite: false,
  });
  const sourceQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), sourceMaterial);
  sourceScene.add(sourceQuad);
  const target = new THREE.WebGLRenderTarget(w, h, {
    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat, type: THREE.UnsignedByteType,
    colorSpace: THREE.SRGBColorSpace, depthBuffer: false, stencilBuffer: false,
  });
  return {
    texture: target.texture,
    render(renderer, timeSec) {
      const prevTarget = renderer.getRenderTarget();
      const prevXr = renderer.xr.enabled;
      renderer.xr.enabled = false;
      sourceMaterial.uniforms.uTime.value = timeSec;
      renderer.setRenderTarget(target);
      renderer.clear();
      renderer.render(sourceScene, sourceCamera);
      renderer.setRenderTarget(prevTarget);
      renderer.xr.enabled = prevXr;
    },
    dispose() { sourceQuad.geometry.dispose(); sourceMaterial.dispose(); target.dispose(); },
  };
}

function createScreen(texture) {
  const geometry = new THREE.PlaneGeometry(2, 1.3);
  const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 1.0, 0.5);
  return { mesh };
}

function createBloomComposer(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.18, 0.38, 0.68);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  const overlayMaterial = new THREE.ShaderMaterial({
    vertexShader: OVERLAY_VERT,
    fragmentShader: OVERLAY_FRAG,
    uniforms: {
      uStrength: { value: 0.75 },
      uYStart: { value: 0.3 },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const overlayPass = new ShaderPass(overlayMaterial);
  composer.addPass(overlayPass);

  return { composer, bloomPass };
}

const screenGradientSource = createGradientRenderSource(1024, 576);
const projectionGradientSource = createGradientRenderSource(1024, 576);
screenGradientSource.render(renderer, 0);
projectionGradientSource.render(renderer, 0);
const { mesh: screen } = createScreen(screenGradientSource.texture);

const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.88, metalness: 0.06 });
const floorGeo = new THREE.PlaneGeometry(100, 100, 64, 64);
floorGeo.rotateX(-Math.PI / 2);
const floorMesh = new THREE.Mesh(floorGeo, floorMat);
floorMesh.receiveShadow = true;

screen.castShadow = false;
scene.add(screen, floorMesh);

const spot = new THREE.SpotLight(0xffffff, 220);
spot.decay = 6; spot.distance = 35; spot.angle = Math.PI / 3.1; spot.penumbra = 0.58;
spot.map = projectionGradientSource.texture;
spot.castShadow = true;
spot.shadow.mapSize.set(2048, 2048);
spot.shadow.bias = -0.0002;
spot.shadow.normalBias = 0.02;
spot.position.set(0, 1.0, 0.52);
spot.target.position.set(0, 0.02, 1.15);
scene.add(spot);
scene.add(spot.target);

const hemiLight = new THREE.HemisphereLight(0xffddaa, 0x060608, 0.06);
hemiLight.position.set(0, 10, 0);
scene.add(hemiLight);

const { composer } = createBloomComposer(renderer, scene, camera);

const tune = {
  projectionIntensity: 1.64, reflectionGain: 1.0, blurRadiusPx: 64,
  highlightBoost: 1.65, lumaVisibilityThreshold: 0.12, invertColor: false, halftone: true, toneCut: false,
};

function syncProjectionFxFromTune() {
  const blend = Math.max(0, tune.projectionIntensity) * Math.max(0, tune.reflectionGain);
  spot.intensity = 220 * blend;
  floorMat.envMapIntensity = 0.35 * Math.max(0.1, tune.reflectionGain);
  projectionGradientSource.render(renderer, performance.now() * 0.001);
}

let rafId = null;
function animate() {
  rafId = requestAnimationFrame(animate);
  const t = performance.now() * 0.001;
  screenGradientSource.render(renderer, t);
  syncProjectionFxFromTune();
  composer.render();
}
animate();

function onResize() {
  const width = window.innerWidth * 1.5;
  const height = window.innerHeight * 1.5;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(width, height);
}
window.addEventListener("resize", onResize);

window.addEventListener("beforeunload", () => {
  if (rafId !== null) cancelAnimationFrame(rafId);
  screenGradientSource.dispose();
  projectionGradientSource.dispose();
  floorMat.dispose();
  floorMesh.geometry.dispose();
  renderer.dispose();
});
