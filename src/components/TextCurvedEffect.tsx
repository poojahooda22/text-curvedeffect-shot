import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createTextTexture, createShadowTexture } from "../utils/createTextTexture";

// ─── Vertex shader: displaces vertices along z-axis based on mouse proximity ───
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uDisplacement;

  float easeInOutCubic(float x) {
    return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
  }

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  void main() {
    vUv = uv;
    vec3 new_position = position;

    vec4 localPosition = vec4(position, 1.0);
    vec4 worldPosition = modelMatrix * localPosition;
    float dist = length(uDisplacement - worldPosition.rgb);
    float min_distance = 2.0;

    if (dist < min_distance) {
      float distance_mapped = map(dist, 0.0, min_distance, 1.0, 0.0);
      float val = easeInOutCubic(distance_mapped) * 1.0;
      new_position.z += val;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(new_position, 1.0);
  }
`;

// ─── Fragment shader: samples the text texture ───
const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uTexture;

  void main() {
    vec4 color = texture2D(uTexture, vUv);
    gl_FragColor = vec4(color);
  }
`;

// ─── Shadow vertex shader: passes distance to fragment ───
const shadowVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying float dist;
  uniform vec3 uDisplacement;

  void main() {
    vUv = uv;
    vec4 localPosition = vec4(position, 1.0);
    vec4 worldPosition = modelMatrix * localPosition;
    dist = length(uDisplacement - worldPosition.rgb);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ─── Shadow fragment shader: fades alpha near cursor ───
const shadowFragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying float dist;
  uniform sampler2D uTexture;

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  void main() {
    vec4 color = texture2D(uTexture, vUv);
    float min_distance = 2.0;

    if (dist < min_distance) {
      float alpha = map(dist, min_distance, 0.0, color.a, 0.0);
      color.a = alpha;
    }

    gl_FragColor = vec4(color);
  }
`;

interface TextCurvedEffectProps {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textColor?: string;
  backgroundColor?: string;
}

export default function TextCurvedEffect({
  text = "CREATIVE\nDEVELOPER",
  fontSize = 240,
  fontFamily = "'Noto Sans', sans-serif",
  fontWeight = "bold",
  textColor = "#000000",
  backgroundColor = "#ffffff",
}: TextCurvedEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Scene ──
    const scene = new THREE.Scene();

    // ── Orthographic camera ──
    let aspect = window.innerWidth / window.innerHeight;
    const cameraDistance = 8;
    const camera = new THREE.OrthographicCamera(
      -cameraDistance * aspect,
      cameraDistance * aspect,
      cameraDistance,
      -cameraDistance,
      0.01,
      1000
    );
    camera.position.set(0, -10, 5);
    camera.lookAt(0, 0, 0);

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Generate text textures on single canvases ──
    const textureOpts = { text, fontSize, fontFamily, fontWeight, color: textColor };
    const textTexture = createTextTexture(textureOpts);
    const shadowTexture = createShadowTexture({ ...textureOpts, color: "#b0b0b0" });

    // ── Invisible sphere (for displacement point) ──
    const sphereGeo = new THREE.SphereGeometry(0.25, 32, 16);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // ── Hit plane (invisible, for raycasting) ──
    const hitGeo = new THREE.PlaneGeometry(500, 500, 10, 10);
    const hitMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const hitPlane = new THREE.Mesh(hitGeo, hitMat);
    hitPlane.name = "hit";
    scene.add(hitPlane);

    // ── Single text plane (100x100 segments for smooth displacement) ──
    const planeGeo = new THREE.PlaneGeometry(15, 15, 100, 100);

    // ── Shadow plane (behind text) ──
    const shadowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: shadowTexture },
        uDisplacement: { value: new THREE.Vector3(0, 0, 0) },
      },
      vertexShader: shadowVertexShader,
      fragmentShader: shadowFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const shadowPlane = new THREE.Mesh(planeGeo, shadowMaterial);
    shadowPlane.rotation.z = Math.PI / 4;
    shadowPlane.position.z = -0.01;
    shadowPlane.renderOrder = 0;
    scene.add(shadowPlane);

    // ── Main text plane ──
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: textTexture },
        uDisplacement: { value: new THREE.Vector3(0, 0, 0) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const plane = new THREE.Mesh(planeGeo, shaderMaterial);
    plane.rotation.z = Math.PI / 4;
    plane.renderOrder = 1;
    scene.add(plane);

    // ── Raycaster ──
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function onPointerMove(event: PointerEvent) {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const intersects = raycaster.intersectObject(hitPlane);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        sphere.position.set(point.x, point.y, point.z);
        shaderMaterial.uniforms.uDisplacement.value = sphere.position;
        shadowMaterial.uniforms.uDisplacement.value = sphere.position;
      }
    }

    // ── Resize handler ──
    function onResize() {
      aspect = window.innerWidth / window.innerHeight;
      camera.left = -cameraDistance * aspect;
      camera.right = cameraDistance * aspect;
      camera.top = cameraDistance;
      camera.bottom = -cameraDistance;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // ── Animation loop ──
    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // ── Event listeners ──
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", onResize);

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      planeGeo.dispose();
      hitGeo.dispose();
      sphereGeo.dispose();
      shaderMaterial.dispose();
      shadowMaterial.dispose();
      hitMat.dispose();
      sphereMat.dispose();
      textTexture.dispose();
      shadowTexture.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [text, fontSize, fontFamily, fontWeight, textColor]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        background: backgroundColor,
        overflow: "hidden",
      }}
    />
  );
}
