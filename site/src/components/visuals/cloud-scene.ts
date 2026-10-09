import * as THREE from "three";

/** A periodic, CPU-baked volume: broad value noise with billowed fine octaves. */
function cloudNoise() {
  const size = 64;
  const data = new Uint8Array(size ** 3);
  const hash = (x: number, y: number, z: number, period: number) => {
    let n = Math.imul(x % period, 73856093) ^ Math.imul(y % period, 19349663) ^ Math.imul(z % period, 83492791);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const smooth = (v: number) => v * v * (3 - 2 * v);
  const mix = (a: number, b: number, t: number) => a + (b - a) * t;
  function noise(x: number, y: number, z: number, period: number) {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const fx = smooth(x - ix), fy = smooth(y - iy), fz = smooth(z - iz);
    const plane = (dz: number) => mix(
      mix(hash(ix, iy, iz + dz, period), hash(ix + 1, iy, iz + dz, period), fx),
      mix(hash(ix, iy + 1, iz + dz, period), hash(ix + 1, iy + 1, iz + dz, period), fx), fy,
    );
    return mix(plane(0), plane(1), fz);
  }
  for (let z = 0; z < size; z++) for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let value = 0, weight = 0.55, total = 0;
    for (let octave = 0; octave < 4; octave++) {
      const period = 4 * 2 ** octave;
      const n = noise(x / size * period, y / size * period, z / size * period, period);
      value += weight * (octave < 2 ? n : 1 - Math.abs(2 * n - 1));
      total += weight;
      weight *= 0.5;
    }
    data[x + size * (y + size * z)] = Math.round(value / total * 255);
  }
  const texture = new THREE.Data3DTexture(data, size, size, size);
  texture.format = THREE.RedFormat;
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.wrapS = texture.wrapT = texture.wrapR = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

const VERT = /* glsl */ `
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision highp float;
precision highp sampler3D;
uniform sampler3D uNoise;
uniform float uTime;
uniform float uFly;
uniform vec2 uRes;
uniform vec2 uPointer;
in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float puff(vec3 p, vec3 center, vec3 radius) {
  return 1.0 - length((p - center) / radius);
}
float joinPuffs(float a, float b) {
  float h = max(0.22 - abs(a - b), 0.0) / 0.22;
  return max(a, b) + h * h * 0.055;
}
float density(vec3 p) {
  float height = smoothstep(-0.6, 0.2, p.y) * (1.0 - smoothstep(1.25, 2.6, p.y));
  vec3 drift = vec3(uTime * 0.0025, 0.0, uTime * 0.0007);
  float shape = texture(uNoise, p * vec3(0.105, 0.14, 0.105) + drift + vec3(0.2, 0.1, 0.3)).r;
  float detail = texture(uNoise, p * 0.43 + drift * 2.0).r;
  // A few overlapping lobes keep cumulus silhouettes instead of a uniform
  // noisy fog. The 3D texture distorts their surfaces and erodes thin edges.
  vec3 q = p - vec3(sin(uTime * 0.018) * 0.7, 0.0, 0.0);
  float bank = puff(q, vec3(-3.5, 0.45, 5.8), vec3(3.4, 1.35, 2.6));
  bank = joinPuffs(bank, puff(q, vec3(-2.5, 1.35, 5.4), vec3(1.7, 1.1, 1.8)));
  bank = joinPuffs(bank, puff(q, vec3(-4.4, 1.2, 5.9), vec3(1.8, 1.1, 1.9)));
  bank = joinPuffs(bank, puff(q, vec3(3.4, 0.5, 5.1), vec3(3.2, 1.4, 2.6)));
  bank = joinPuffs(bank, puff(q, vec3(2.4, 1.4, 5.2), vec3(1.7, 1.0, 1.8)));
  bank = joinPuffs(bank, puff(q, vec3(4.5, 1.25, 5.6), vec3(1.6, 1.1, 1.9)));
  bank = joinPuffs(bank, puff(q, vec3(0.3, -0.45, 4.8), vec3(3.8, 1.05, 2.6)));
  bank = joinPuffs(bank, puff(q, vec3(-0.3, 0.9, 11.0), vec3(3.8, 1.4, 3.0)));
  bank = joinPuffs(bank, puff(q, vec3(0.7, 1.75, 10.5), vec3(1.8, 0.85, 2.0)));
  float mass = bank + (shape - 0.5) * 1.1 - mix(0.12, -0.4, uFly);
  return max(0.0, mass * 5.0 - (1.0 - detail) * 0.4) * height;
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec3 origin = vec3(0.0, 0.9, uFly * 9.0);
  vec3 ray = normalize(vec3(p * 1.25 + uPointer * 0.025, 1.0));
  ray.y += 0.1;
  ray = normalize(ray);
  vec3 sky = mix(vec3(0.88, 0.92, 0.95), vec3(0.58, 0.73, 0.86), smoothstep(-0.15, 0.7, ray.y));
  // Intersect the slab, guarding horizontal rays and marching only inside it.
  float ry = abs(ray.y) < 0.001 ? 0.001 : ray.y;
  float a = (-0.6 - origin.y) / ry;
  float b = (2.6 - origin.y) / ry;
  float begin = max((1.0 - uFly) * 2.2, min(a, b));
  float end = min(20.0, max(a, b));
  float stepSize = max(0.0, end - begin) / float(STEPS);
  float t = begin + (0.375 + hash(gl_FragCoord.xy) * 0.25) * stepSize;
  float transmission = 1.0;
  vec3 lightSum = vec3(0.0);
  vec3 sun = normalize(vec3(-0.6, 0.8, -0.35));
  for (int i = 0; i < STEPS; i++) {
    vec3 point = origin + ray * t;
    float d = density(point);
    if (d > 0.005) {
      float opticalDepth = 0.0;
      for (int s = 1; s <= 4; s++) {
        opticalDepth += density(point + sun * float(s) * 0.32) * 0.32;
      }
      float sunlight = exp(-opticalDepth * 1.6);
      float powder = 1.0 - exp(-d * 2.0);
      vec3 lighting = mix(vec3(0.73, 0.77, 0.81), vec3(1.0, 0.99, 0.97), sunlight);
      lighting += powder * sunlight * 0.12;
      // Distant clouds disappear gently into the pale atmosphere.
      lighting = mix(lighting, sky, 1.0 - exp(-t * 0.035));
      float absorb = 1.0 - exp(-d * stepSize * 2.2);
      lightSum += transmission * absorb * lighting;
      transmission *= 1.0 - absorb;
      if (transmission < 0.012) break;
    }
    t += stepSize;
  }
  vec3 color = lightSum + transmission * sky;
  // Fly into dense white mist; the last frame matches the page exactly.
  color = mix(color, vec3(1.0), smoothstep(0.25, 1.0, uFly));
  color += (hash(gl_FragCoord.xy + 17.0) - 0.5) / 255.0 * (1.0 - uFly);
  fragColor = vec4(color, 1.0);
}
`;

export type CloudScene = { setFly: (v: number) => void; resize: () => void; dispose: () => void };

export function createClouds(canvas: HTMLCanvasElement, reducedMotion: boolean): CloudScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "low-power" });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const texture = cloudNoise();
  const uniforms = {
    uNoise: { value: texture }, uTime: { value: 40 }, uFly: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) }, uPointer: { value: new THREE.Vector2() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, glslVersion: THREE.GLSL3, defines: { STEPS: innerWidth < 640 ? 36 : 48 },
    vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  scene.add(quad);
  const pointer = new THREE.Vector2();
  const onPointer = (e: PointerEvent) => pointer.set(e.clientX / innerWidth - 0.5, 0.5 - e.clientY / innerHeight);
  if (!reducedMotion) window.addEventListener("pointermove", onPointer, { passive: true });
  let raf = 0, dirty = true, fly = 0;
  const start = performance.now();
  function frame(now: number) {
    raf = 0;
    if (!document.hidden && (dirty || (!reducedMotion && fly < 0.999))) {
      uniforms.uTime.value = 40 + (reducedMotion ? 0 : (now - start) / 1000);
      uniforms.uPointer.value.lerp(pointer, 0.04);
      renderer.render(scene, camera);
      dirty = false;
    }
    if (!reducedMotion && fly < 0.999 && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function invalidate() { dirty = true; if (!raf) raf = requestAnimationFrame(frame); }
  const onVisibility = () => { if (!document.hidden) invalidate(); };
  document.addEventListener("visibilitychange", onVisibility);
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    // Scale CSS pixels directly: retina phones should not quadruple this march.
    renderer.setPixelRatio(w < 640 ? 0.42 : 0.5);
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
    const steps = w < 640 ? 36 : 48;
    if (mat.defines.STEPS !== steps) { mat.defines.STEPS = steps; mat.needsUpdate = true; }
    invalidate();
  }
  resize();
  return {
    setFly: (v) => {
      const next = THREE.MathUtils.clamp(v, 0, 1);
      if (next === fly) return;
      fly = next;
      // Reduced motion keeps the camera still and uses a CSS crossfade.
      uniforms.uFly.value = reducedMotion ? 0 : fly;
      canvas.style.opacity = reducedMotion ? String(1 - fly) : "1";
      invalidate();
    },
    resize,
    dispose: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      quad.geometry.dispose(); mat.dispose(); texture.dispose(); renderer.dispose();
    },
  };
}
