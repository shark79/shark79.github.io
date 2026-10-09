import * as THREE from "three";
import { createCloudNoise } from "./cloud-scene";

/** A full-hero cloud field that clears the heading as the sky scrolls away. */
export function createWisps(canvas: HTMLCanvasElement, reducedMotion: boolean) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const texture = createCloudNoise();
  const uniforms = {
    uTime: { value: 0 },
    uClear: { value: 0 },
    uAspect: { value: 1 },
    uNameRect: { value: new THREE.Vector4(0.2, 0.35, 0.8, 0.7) },
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
      uniform float uClear;
      uniform float uAspect;
      uniform vec4 uNameRect;
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
        // Broad banks occupy the viewport independently of the name. Their
        // irregular edges and overlapping depths leave natural sky breaks.
        vec3 q = p;
        q.x -= sin(uTime * 0.055) * 0.12;
        float bank = puff(q, vec3(-0.85, 0.85, 0.0), vec3(0.95, 0.80, 0.85));
        bank = joinPuffs(bank, puff(q, vec3(0.30, 1.05, 0.2), vec3(1.05, 0.8, 0.85)));
        bank = joinPuffs(bank, puff(q, vec3(0.90, 0.30, 0.0), vec3(1.0, 0.85, 0.9)));
        bank = joinPuffs(bank, puff(q, vec3(-0.85, -0.10, 0.25), vec3(0.8, 0.8, 0.9)));
        bank = joinPuffs(bank, puff(q, vec3(-0.30, -0.85, 0.0), vec3(1.3, 0.7, 0.9)));
        bank = joinPuffs(bank, puff(q, vec3(0.55, -0.55, 0.2), vec3(0.9, 0.7, 0.8)));
        float shape = texture(uNoise, p * vec3(uAspect, 1.0, 1.0) * 0.36 + vec3(0.24 + uTime * 0.002, 0.13, 0.42)).r;
        float detail = texture(uNoise, p * vec3(uAspect, 1.0, 1.0) * 1.2 + vec3(uTime * 0.004, 0.2, 0.7)).r;
        return max(0.0, bank + (shape - 0.5) * 0.85 - (1.0 - detail) * 0.23) * 4.0;
      }
      void main() {
        vec2 xy = (vUv - 0.5) * 2.0;
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
        // Thin the field across the heading's actual bounds, with broad,
        // noise-disturbed edges. This is a clearing in a full sky, not a halo.
        float ripple = (texture(uNoise, vec3(vUv * 2.0, uTime * 0.003)).r - 0.5) * 0.035;
        vec2 uv = vUv + vec2(ripple, ripple * 0.5);
        float clear = smoothstep(uNameRect.x - 0.09, uNameRect.x + 0.015, uv.x)
          * (1.0 - smoothstep(uNameRect.z - 0.015, uNameRect.z + 0.09, uv.x))
          * smoothstep(uNameRect.y - 0.09, uNameRect.y + 0.015, uv.y)
          * (1.0 - smoothstep(uNameRect.w - 0.015, uNameRect.w + 0.09, uv.y));
        float nameVeil = mix(0.16, 0.0, smoothstep(0.0, 0.28, uClear));
        float capped = min(alpha, mix(0.97, nameVeil, clear));
        // The name clears first, then the surrounding banks dissolve. Feather
        // the lower field so it never ends in a horizontal section-sized edge.
        capped *= (1.0 - smoothstep(0.0, 0.85, uClear)) * smoothstep(0.0, 0.18, vUv.y);
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
    if (visible) invalidate();
  });
  io.observe(canvas);
  function invalidate() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now: number) {
    raf = 0;
    if (!visible || document.hidden) return;
    if (!reducedMotion) uniforms.uTime.value = (now - start) / 1000;
    renderer.render(scene, camera);
    if (!reducedMotion && uniforms.uClear.value < 0.85) raf = requestAnimationFrame(frame);
  }
  const onVisibility = () => { if (!document.hidden && visible) invalidate(); };
  document.addEventListener("visibilitychange", onVisibility);
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setPixelRatio(w < 640 ? 0.42 : 0.45);
    renderer.setSize(w, h, false);
    uniforms.uAspect.value = w / h;
    const heading = canvas.parentElement?.querySelector("h1");
    if (heading) {
      const bounds = canvas.getBoundingClientRect();
      const name = heading.getBoundingClientRect();
      uniforms.uNameRect.value.set(
        (name.left - bounds.left) / w, 1 - (name.bottom - bounds.top) / h,
        (name.right - bounds.left) / w, 1 - (name.top - bounds.top) / h,
      );
    }
    const steps = innerWidth < 640 ? 14 : 18;
    if (mat.defines.STEPS !== steps) { mat.defines.STEPS = steps; mat.needsUpdate = true; }
    // Reduced motion keeps the dense framing, rendered once without drift.
    renderer.render(scene, camera);
  }
  const headingObserver = new ResizeObserver(resize);
  const heading = canvas.parentElement?.querySelector("h1");
  if (heading) headingObserver.observe(heading);
  resize();
  if (!reducedMotion) raf = requestAnimationFrame(frame);
  return {
    setClear: (p: number) => {
      const next = THREE.MathUtils.clamp(p, 0, 1);
      if (uniforms.uClear.value === next) return;
      uniforms.uClear.value = next;
      invalidate();
    },
    resize,
    dispose: () => {
      cancelAnimationFrame(raf); io.disconnect(); headingObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      quad.geometry.dispose(); mat.dispose(); texture.dispose(); renderer.dispose();
    },
  };
}
