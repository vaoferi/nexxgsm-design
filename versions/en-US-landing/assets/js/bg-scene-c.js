import * as THREE from "./vendor/three.module.min.js?v=20260909c";

// ДЕМО-ВАРІАНТ C фону: та сама сцена «монітор + клавіатура», що у варіанті B (bg-scene.js),
// але з дрібними деталями з оригінального пена (OPRBwOd): bloom-гало, блиски клавіш,
// контактна тінь під монітором. NAS-ONLY демо для вибору варіанта: НЕ синхронізувати
// в CF-репо; перед релізом у прод — ВИДАЛИТИ разом з bg-demo-c.html, якщо варіант C
// відхилено. Канонічний index.html цей файл не підключає.
//
// SAFARI-СУМІСНІСТЬ (головне правило цього файла): жодних EffectComposer / UnrealBloom /
// OutputPass / рендер-таргетів / spotlight.map — ця трійка вже ламала сторінку в WebKit
// (GL_INVALID_OPERATION, див. коментар у background.js). Усі «дорогі» ефекти пена тут
// імітовані дешевими примітивами, які працюють і в WebGL1 Safari:
//   - bloom        → адитивні halo-квади з радіальним затуханням (перед екраном + за монітором);
//   - блиски клавіш → ОДИН merged-mesh на всі 30 клавіш (1 draw call) з per-key фазою;
//   - тінь         → класична fake contact shadow (м'який радіальний градієнт), без shadow maps.

const app = document.getElementById("bg-scene");
const fallback = document.getElementById("bg-fallback");

const testCanvas = document.createElement("canvas");
const gl2 = testCanvas.getContext("webgl2");
const gl = gl2 ?? testCanvas.getContext("webgl");
if (!gl || !app) {
  if (fallback) { fallback.style.display = "grid"; }
  if (!gl) throw new Error("WebGL unavailable");
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
} catch (e) {
  if (fallback) { fallback.style.display = "grid"; }
  throw e;
}
const MAX_DPR = 1.5;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0a0a10, 1);
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a10);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
const world = new THREE.Group();
scene.add(world);

// Спільний шум + палітра: ТОЙ САМИЙ fbm, що в варіанті B і поточному фоні (ідентичність 8fc8).
const NOISE = `
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
vec3 palette(float base, float tHue) {
  return vec3(
    0.18 + 0.86 * (0.5 + 0.5 * cos(6.28318 * (base + 0.02 + tHue))),
    0.14 + 0.9  * (0.5 + 0.5 * cos(6.28318 * (base + 0.37 + tHue))),
    0.2  + 0.9  * (0.5 + 0.5 * cos(6.28318 * (base + 0.72 + tHue)))
  );
}
`;

// ЕКРАН монітора — без змін відносно варіанту B (емісія з тих самих переливів).
const SCREEN_FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
${NOISE}
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float t = uTime;
  vec2 flow = vec2(t * 0.19, t * 0.13);
  vec2 q = vec2(fbm(p * 1.45 + flow), fbm(p * 1.45 + vec2(-flow.y * 1.1, flow.x * 0.9)));
  vec2 w = p + q * 0.62;
  float nA = 0.5 + 0.5 * fbm(w * 3.0 + flow * 0.8);
  float nB = 0.5 + 0.5 * fbm(w * 6.7 + vec2(-flow.x * 0.5, flow.y * 0.35));
  float ridge = 1.0 - abs(2.0 * nB - 1.0);
  float mask = clamp(0.18 + 1.12 * (0.58 * nA + 0.42 * ridge), 0.0, 1.0);
  float edgeFade = 1.0 - clamp(length(p) * 0.7, 0.0, 1.0);
  float intensity = pow(clamp(mask * (0.72 + edgeFade * 0.45), 0.0, 1.0), 1.05);
  float base = nA * 0.82 + ridge * 0.18;
  vec3 col = palette(base, t * 0.065) * intensity * 0.9;
  float highlight = pow(clamp((nA * 1.1 + ridge * 0.75) - 1.1, 0.0, 1.0), 2.2);
  col = mix(col, vec3(1.0, 0.96, 0.92), highlight * 0.18);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

// ПІДЛОГА — варіант B + широке слабке гало (bloom) навколо світлової плями:
// другий smoothstep набагато ширшого радіусу додає м'який підсвіт, немов bloom з пена.
const FLOOR_FRAG = `
precision highp float;
varying vec3 vWorld;
uniform float uTime;
${NOISE}
void main() {
  float t = uTime;
  vec2 sp = vWorld.xz * 0.55;
  vec2 flow = vec2(t * 0.19, t * 0.13);
  float n = 0.5 + 0.5 * fbm(sp * 2.2 + flow);
  vec3 col = palette(n, t * 0.065);
  float d = length((vWorld.xz - vec2(0.0, 0.9)) * vec2(1.0, 0.55));
  float spill = smoothstep(3.2, 0.4, d);
  float bloom = smoothstep(6.5, 0.0, d) * 0.16;
  vec3 outc = mix(vec3(0.05, 0.05, 0.07), col * spill * 0.5, spill) + col * bloom;
  gl_FragColor = vec4(outc, 1.0);
}
`;

// HALO (bloom): радіальний квадрат із затуханням; колір корелює з палітрою екрана,
// інтенсивність пульсує повільно (спокійний ритм, узгоджений із TIME_SCALE).
const HALO_FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uStrength;
${NOISE}
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float falloff = pow(max(0.0, 1.0 - d), 2.4);
  float pulse = 0.9 + 0.1 * sin(uTime * 0.6);
  vec3 tint = mix(vec3(1.0), palette(0.5, uTime * 0.065), 0.55);
  gl_FragColor = vec4(tint, falloff * uStrength * pulse);
}
`;

// GLINTS клавіш: merged-геометрія всіх клавіш, per-key фаза в атрибуті aPhase.
// Блиск дозволений тільки на верхніх гранях (нормаль.y). Адитивне змішування,
// сплеск pow(...,10) дає короткі «спалахи» замість рівномірного мерехтіння.
const GLINT_VERT = `
attribute float aPhase;
varying float vPhase;
varying float vTop;
void main() {
  vPhase = aPhase;
  vTop = step(0.5, normal.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const GLINT_FRAG = `
precision highp float;
varying float vPhase;
varying float vTop;
uniform float uTime;
uniform float uStrength;
void main() {
  if (vTop < 0.5) discard;
  float pulse = 0.5 + 0.5 * sin(uTime * 2.2 + vPhase);
  float glint = pow(pulse, 10.0);
  vec3 col = mix(vec3(0.62, 0.74, 1.0), vec3(1.0, 0.97, 0.9), glint);
  gl_FragColor = vec4(col, glint * uStrength);
}
`;

// CONTACT SHADOW: м'який чорний радіальний градієнт на підлозі. Без shadow maps —
// це найдешевша і найпередбачуваніша тінь, ідентична на всіх GPU і в Safari.
const SHADOW_FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uOpacity;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.12, d) * uOpacity;
  gl_FragColor = vec4(0.0, 0.0, 0.0, a);
}
`;

const WORLD_VERT = `
varying vec3 vWorld;
void main() {
  vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const UV_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const timeMats = [];
function addTimed(mat) { timeMats.push(mat); return mat; }

// Підлога
const floorMat = addTimed(new THREE.ShaderMaterial({
  vertexShader: WORLD_VERT, fragmentShader: FLOOR_FRAG,
  uniforms: { uTime: { value: 0 } }, depthWrite: true,
}));
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
floor.rotation.x = -Math.PI / 2;
world.add(floor);

// Контактні тіні (прозорі, поверх підлоги; depthWrite вимкнено, щоб не конфліктували між собою)
const shadowMatMonitor = new THREE.ShaderMaterial({
  vertexShader: UV_VERT, fragmentShader: SHADOW_FRAG,
  uniforms: { uOpacity: { value: 0.5 } }, transparent: true, depthWrite: false,
});
const shadowMatKeys = new THREE.ShaderMaterial({
  vertexShader: UV_VERT, fragmentShader: SHADOW_FRAG,
  uniforms: { uOpacity: { value: 0.4 } }, transparent: true, depthWrite: false,
});
const shadowMonitor = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.3), shadowMatMonitor);
shadowMonitor.rotation.x = -Math.PI / 2;
shadowMonitor.position.set(0, 0.002, 0.45);
shadowMonitor.renderOrder = 1;
const shadowKeys = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.8), shadowMatKeys);
shadowKeys.rotation.x = -Math.PI / 2;
shadowKeys.position.set(0, 0.002, 1.28);
shadowKeys.renderOrder = 1;
world.add(shadowMonitor, shadowKeys);

// Монітор: рама + стійка + екран (як у варіанті B)
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x14141c, roughness: 0.7, metalness: 0.15 });
const frame = new THREE.Mesh(new THREE.BoxGeometry(2.16, 1.46, 0.07), bodyMat);
frame.position.set(0, 1.0, 0.42);
const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.12), bodyMat);
stand.position.set(0, 0.19, 0.44);
const screenMat = addTimed(new THREE.ShaderMaterial({
  vertexShader: UV_VERT, fragmentShader: SCREEN_FRAG,
  uniforms: { uTime: { value: 0 } },
}));
const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.3), screenMat);
screen.position.set(0, 1.0, 0.462);
world.add(frame, stand, screen);

// BLOOM-ГАЛО: (1) м'який ореол ПЕРЕД екраном; (2) слабке гало ЗА монітором —
// центр гало перекривається рамкою, тож по контуру монітора лишається світлий рим.
const haloFrontMat = addTimed(new THREE.ShaderMaterial({
  vertexShader: UV_VERT, fragmentShader: HALO_FRAG,
  uniforms: { uTime: { value: 0 }, uStrength: { value: 0.16 } },
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
}));
const haloFront = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.9), haloFrontMat);
haloFront.position.set(0, 1.0, 0.475);
haloFront.renderOrder = 3;
const haloBackMat = addTimed(new THREE.ShaderMaterial({
  vertexShader: UV_VERT, fragmentShader: HALO_FRAG,
  uniforms: { uTime: { value: 0 }, uStrength: { value: 0.1 } },
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
}));
const haloBack = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.4), haloBackMat);
haloBack.position.set(0, 1.0, 0.37);
haloBack.renderOrder = 3;
world.add(haloFront, haloBack);

// Клавіатура: геометрія з оригінального пена (база + сітка клавіш)
const keyboard = new THREE.Group();
const keyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.88, metalness: 0.06 });
const base = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.045, 0.42), keyMat);
base.position.y = 0.0225;
keyboard.add(base);
const cols = 10, rows = 3;
const keyW = 0.09, keyH = 0.072, keyD = 0.07, gapX = 0.012, gapZ = 0.01;
const startX = -((cols - 1) * (keyW + gapX)) / 2;
const startZ = -((rows - 1) * (keyD + gapZ)) / 2;
const keyGeo = new THREE.BoxGeometry(keyW, keyH, keyD);
const keyTransforms = [];
for (let rz = 0; rz < rows; rz += 1) {
  for (let cx = 0; cx < cols; cx += 1) {
    const x = startX + cx * (keyW + gapX);
    const y = 0.045 + keyH * 0.5 + 0.002;
    const z = startZ + rz * (keyD + gapZ);
    const key = new THREE.Mesh(keyGeo, keyMat);
    key.position.set(x, y, z);
    keyboard.add(key);
    // Детермінована псевдовипадкова фаза блиску на клавішу (без Math.random — стабільна між запусками)
    keyTransforms.push({ x, y, z, phase: (cx * 7.13 + rz * 3.71) % 6.28318 });
  }
}
keyboard.position.set(0, 0, 1.28);
world.add(keyboard);

// GLINTS: один merged-mesh на всі клавіші (1 draw call замість 30 матеріалів).
// Шаблонну геометрію розгортаємо в non-indexed і вручну конкатенуємо зі зсувом
// (BufferGeometryUtils з addons не вендорений — не тягнемо зайву залежність).
const glintGeo = (() => {
  const tpl = keyGeo.toNonIndexed();
  const pos = tpl.attributes.position.array;
  const nor = tpl.attributes.normal.array;
  const vertCount = pos.length / 3;
  const total = vertCount * keyTransforms.length;
  const P = new Float32Array(total * 3);
  const N = new Float32Array(total * 3);
  const Ph = new Float32Array(total);
  for (let i = 0; i < keyTransforms.length; i += 1) {
    const tr = keyTransforms[i];
    for (let v = 0; v < vertCount; v += 1) {
      const o = (i * vertCount + v) * 3;
      P[o] = pos[v * 3] + tr.x;
      P[o + 1] = pos[v * 3 + 1] + tr.y;
      P[o + 2] = pos[v * 3 + 2] + tr.z;
      N[o] = nor[v * 3]; N[o + 1] = nor[v * 3 + 1]; N[o + 2] = nor[v * 3 + 2];
      Ph[i * vertCount + v] = tr.phase;
    }
  }
  tpl.dispose();
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(P, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(N, 3));
  g.setAttribute("aPhase", new THREE.BufferAttribute(Ph, 1));
  return g;
})();
const glintMat = addTimed(new THREE.ShaderMaterial({
  vertexShader: GLINT_VERT, fragmentShader: GLINT_FRAG,
  uniforms: { uTime: { value: 0 }, uStrength: { value: 0.85 } },
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
}));
const glints = new THREE.Mesh(glintGeo, glintMat);
glints.renderOrder = 2;
keyboard.add(glints); // успадковує позицію клавіатури (0,0,1.28)

// Світло для пластикових частин (екран/підлога/гало світяться своїми шейдерами)
scene.add(new THREE.HemisphereLight(0xffffff, 0x060608, 0.25));
const keyLight = new THREE.PointLight(0xbfd4ff, 6, 9, 2);
keyLight.position.set(0.4, 2.4, 2.6);
scene.add(keyLight);

function layout() {
  const aspect = window.innerWidth / window.innerHeight;
  world.position.x = aspect > 1.15 ? 0.95 : 0;
  camera.position.set(0, 1.25, aspect > 1.15 ? 5.5 : 7.2);
  camera.lookAt(0, 0.8, 0.4);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
}
layout();

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const TIME_SCALE = 0.25; // та сама «спокійна» швидкість, що у варіанті B і затвердженому фоні

function renderFrame(tSec) {
  for (const m of timeMats) m.uniforms.uTime.value = tSec;
  renderer.render(scene, camera);
}
renderFrame(0);

let rafId = null;
function animate() {
  rafId = requestAnimationFrame(animate);
  renderFrame(performance.now() * 0.001 * TIME_SCALE);
}
if (!reducedMotion) {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    else if (!document.hidden && rafId === null) { rafId = requestAnimationFrame(animate); }
  });
  rafId = requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR));
  layout();
  renderFrame(reducedMotion ? 0 : performance.now() * 0.001 * TIME_SCALE);
});

window.addEventListener("beforeunload", () => {
  if (rafId !== null) cancelAnimationFrame(rafId);
  floorMat.dispose(); screenMat.dispose(); keyMat.dispose(); bodyMat.dispose();
  glintMat.dispose(); haloFrontMat.dispose(); haloBackMat.dispose();
  shadowMatMonitor.dispose(); shadowMatKeys.dispose();
  floor.geometry.dispose(); frame.geometry.dispose(); stand.geometry.dispose();
  screen.geometry.dispose(); base.geometry.dispose(); keyGeo.dispose();
  glintGeo.dispose(); haloFront.geometry.dispose(); haloBack.geometry.dispose();
  shadowMonitor.geometry.dispose(); shadowKeys.geometry.dispose();
  renderer.dispose();
});
