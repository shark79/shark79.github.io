import * as THREE from "three";

/**
 * Full-screen procedural cloudscape: three parallax layers of domain-warped
 * fbm, lit from a high sun so tops glow and bases fall to soft grey, with pale
 * blue sky in the gaps and a low mist. Rendered at reduced resolution —
 * clouds are soft by nature, so the upscale costs nothing visually.
 */

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
varying vec2 vUv;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    float n = noise(p);
    // Low octaves shape the mass; high octaves are billowed into puffs.
    v += a * (i < 2 ? n : 1.0 - abs(n * 2.0 - 1.0));
    p = r * p * 2.03 + 11.7; a *= 0.5;
  }
  return v;
}

// One layer: returns (coverage, light) for a cloud deck.
vec2 layer(vec2 p, float scale, float speed, float cover, float seed) {
  vec2 q = p * scale + vec2(uTime * speed, uTime * speed * 0.18) + seed;
  vec2 w = vec2(fbm(q + vec2(1.7, 9.2)), fbm(q + vec2(8.3, 2.8)));
  q += 0.28 * w;
  float d = fbm(q);
  // Sample toward the sun (up-left): denser there means we're in its shadow.
  float d2 = fbm(q + vec2(-0.06, 0.09));
  float c = smoothstep(cover, cover + 0.2, d);
  float light = clamp(0.72 + (d - d2) * 9.0 - (d - cover) * 0.7, 0.0, 1.0);
  return vec2(c, light);
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  // Portrait screens only see the centre column, where the sky breaks open;
  // slide them onto the cloud bank that frames that break on desktop.
  p.x += (1.0 - min(aspect, 1.0)) * 0.7;

  // Sky: pale blue, brighter and milkier toward the horizon.
  vec3 col = mix(vec3(0.80, 0.86, 0.91), vec3(0.47, 0.62, 0.78), smoothstep(0.25, 1.0, uv.y));

  vec3 shadowC = vec3(0.74, 0.765, 0.80);
  vec3 litC = vec3(0.985, 0.985, 0.98);

  // Back to front; nearer decks are bigger, faster, and shift more with the pointer.
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 pp = p + uPointer * (0.015 + fi * 0.02);
    vec2 l = layer(pp, 1.9 - fi * 0.45, 0.010 + fi * 0.006, 0.495 - fi * 0.03, fi * 17.0);
    vec3 cc = mix(shadowC, litC, l.y);
    // Thinner edges read lighter and more translucent.
    col = mix(col, cc, l.x * (0.78 + fi * 0.1));
  }

  // Low mist rolling up from the bottom.
  float mist = smoothstep(0.55, 0.0, uv.y) * (0.75 + 0.25 * fbm(p * 2.0 + vec2(uTime * 0.02, 0.0)));
  col = mix(col, vec3(0.94, 0.945, 0.95), mist * 0.7);

  // Dither to stop banding in the long soft gradients.
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

export type CloudScene = { resize: () => void; dispose: () => void };

export function createClouds(canvas: HTMLCanvasElement, reducedMotion: boolean): CloudScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "low-power" });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uPointer: { value: new THREE.Vector2() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: FRAG,
    depthTest: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  scene.add(quad);

  const pointer = new THREE.Vector2();
  const onPointer = (e: PointerEvent) => {
    pointer.set(e.clientX / innerWidth - 0.5, 0.5 - e.clientY / innerHeight);
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(canvas);

  let raf = 0;
  const start = performance.now();
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    // Begin mid-drift so the first frame already looks settled.
    uniforms.uTime.value = 40 + (reducedMotion ? 0 : (now - start) / 1000);
    uniforms.uPointer.value.lerp(pointer, 0.04);
    renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // ponytail: fixed half-res; raise on desktop if the softness ever reads blurry.
    renderer.setPixelRatio(0.5 * Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
  }

  resize();
  raf = requestAnimationFrame(frame);

  return {
    resize,
    dispose: () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      quad.geometry.dispose();
      mat.dispose();
      renderer.dispose();
    },
  };
}
