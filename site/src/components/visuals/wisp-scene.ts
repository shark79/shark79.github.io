import * as THREE from "three";

/** A small transparent foreground canvas, confined to the real heading. */
export function createWisps(canvas: HTMLCanvasElement, reducedMotion: boolean) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = { uTime: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false,
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uTime;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }
      void main() {
        // Each row has one narrow bank; it traverses every letter, then wraps offscreen.
        float row = step(0.5, vUv.y);
        float center = fract(uTime * 0.027 + row * 0.53 + 0.18) * 1.6 - 0.3;
        float n = noise(vUv * vec2(14.0, 9.0) - vec2(uTime * 0.13, 0.0));
        float x = (vUv.x - center) / 0.11;
        float y = (fract(vUv.y * 2.0) - 0.46 + (n - 0.5) * 0.2) / 0.28;
        float alpha = min(0.6, exp(-x*x*1.6 - y*y) * smoothstep(0.18, 0.72, n) * 0.65);
        vec3 white = vec3(0.97, 0.98, 0.99);
        gl_FragColor = vec4(white * alpha, alpha);
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
    renderer.setPixelRatio(0.75);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    if (!reducedMotion) renderer.render(scene, camera);
  }
  // Reduced motion leaves the name completely clear.
  resize();
  if (!reducedMotion) raf = requestAnimationFrame(frame);
  return {
    resize,
    dispose: () => {
      cancelAnimationFrame(raf); io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      quad.geometry.dispose(); mat.dispose(); renderer.dispose();
    },
  };
}
