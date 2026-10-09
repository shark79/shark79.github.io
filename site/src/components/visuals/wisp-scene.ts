import * as THREE from "three";
import { createCloudNoise } from "./cloud-scene";

/** Dense, volumetric foreground banks surrounding the heading, above its ink. */
export function createWisps(canvas: HTMLCanvasElement, reducedMotion: boolean) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const texture = createCloudNoise();
  const uniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uNoise: { value: texture },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, glslVersion: THREE.GLSL3,
    defines: { STEPS: innerWidth < 640 ? 14 : 18 },
    transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false,
    vertexShader: "out vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: /* glsl */ `
      precision highp float;
      precision highp sampler3D;
      uniform float uTime;
      uniform float uAspect;
      uniform sampler3D uNoise;
      in vec2 vUv;
      out vec4 fragColor;
      float puff(vec3 p, vec3 center, vec3 radius) {
        return 1.0 - length((p - center) / radius);
      }
      float joinPuffs(float a, float b) {
        float h = max(0.24 - abs(a - b), 0.0) / 0.24;
        return max(a, b) + h * h * 0.06;
      }
      float density(vec3 p) {
        // The banks drift around a clear centre; their noise changes the
        // overlap across the letters without making the whole name disappear.
        p.x -= sin(uTime * 0.11) * 0.13;
        float bank = puff(p, vec3(-1.65, 0.02, 0.0), vec3(0.9, 0.46, 0.8));
        bank = joinPuffs(bank, puff(p, vec3(-1.08, 0.43, 0.12), vec3(0.7, 0.38, 0.7)));
        bank = joinPuffs(bank, puff(p, vec3(-0.35, 0.70, 0.0), vec3(0.85, 0.36, 0.8)));
        bank = joinPuffs(bank, puff(p, vec3(0.75, 0.65, 0.12), vec3(0.85, 0.4, 0.75)));
        bank = joinPuffs(bank, puff(p, vec3(1.55, -0.05, 0.0), vec3(0.9, 0.5, 0.8)));
        bank = joinPuffs(bank, puff(p, vec3(0.95, -0.43, 0.1), vec3(0.75, 0.4, 0.8)));
        bank = joinPuffs(bank, puff(p, vec3(0.20, -0.70, 0.0), vec3(0.9, 0.37, 0.75)));
        bank = joinPuffs(bank, puff(p, vec3(-0.93, -0.52, 0.12), vec3(0.85, 0.35, 0.75)));
        float shape = texture(uNoise, p * 0.32 + vec3(0.24 + uTime * 0.003, 0.13, 0.42)).r;
        float detail = texture(uNoise, p * 1.2 + vec3(uTime * 0.005, 0.2, 0.7)).r;
        return max(0.0, bank + (shape - 0.5) * 0.65 - (1.0 - detail) * 0.16) * 4.5;
      }
      void main() {
        vec2 xy = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.0;
        float transmission = 1.0;
        vec3 color = vec3(0.0);
        const float stepSize = 2.4 / float(STEPS);
        vec3 sun = normalize(vec3(-0.5, 0.8, -0.6));
        for (int i = 0; i < STEPS; i++) {
          vec3 p = vec3(xy, -1.2 + (float(i) + 0.5) * stepSize);
          float d = density(p);
          if (d > 0.005) {
            float shade = density(p + sun * 0.18) * 0.18 + density(p + sun * 0.4) * 0.22;
            float light = exp(-shade * 1.1);
            vec3 lighting = mix(vec3(0.79, 0.83, 0.87), vec3(1.0, 0.995, 0.98), light);
            float absorb = 1.0 - exp(-d * stepSize * 2.8);
            color += transmission * absorb * lighting;
            transmission *= 1.0 - absorb;
            if (transmission < 0.015) break;
          }
        }
        float alpha = 1.0 - transmission;
        // Fade before the enlarged canvas boundary, avoiding rectangular edges.
        float edge = smoothstep(0.0, 0.13, vUv.x) * (1.0 - smoothstep(0.87, 1.0, vUv.x))
          * smoothstep(0.0, 0.12, vUv.y) * (1.0 - smoothstep(0.88, 1.0, vUv.y));
        // Dense surroundings with strong overlap; a little ink remains visible
        // where these foreground banks cross the actual heading.
        float nameArea = smoothstep(0.06, 0.12, vUv.x) * (1.0 - smoothstep(0.88, 0.94, vUv.x))
          * smoothstep(0.23, 0.29, vUv.y) * (1.0 - smoothstep(0.71, 0.77, vUv.y));
        float capped = min(alpha, mix(0.96, 0.82, nameArea)) * edge;
        fragColor = vec4(color * capped / max(alpha, 0.001), capped);
      }
    `,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  scene.add(quad);
  let visible = true, raf = 0;
  const start = performance.now();
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf && !reducedMotion) raf = requestAnimationFrame(frame);
  });
  io.observe(canvas);
  function frame(now: number) {
    raf = 0;
    if (!visible || document.hidden || reducedMotion) return;
    uniforms.uTime.value = (now - start) / 1000;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  const onVisibility = () => { if (!document.hidden && visible && !raf && !reducedMotion) raf = requestAnimationFrame(frame); };
  document.addEventListener("visibilitychange", onVisibility);
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setPixelRatio(w < 640 ? 0.6 : 0.7);
    renderer.setSize(w, h, false);
    uniforms.uAspect.value = w / h;
    const steps = innerWidth < 640 ? 14 : 18;
    if (mat.defines.STEPS !== steps) { mat.defines.STEPS = steps; mat.needsUpdate = true; }
    // Reduced motion keeps the dense framing, rendered once without drift.
    renderer.render(scene, camera);
  }
  resize();
  if (!reducedMotion) raf = requestAnimationFrame(frame);
  return {
    resize,
    dispose: () => {
      cancelAnimationFrame(raf); io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      quad.geometry.dispose(); mat.dispose(); texture.dispose(); renderer.dispose();
    },
  };
}
