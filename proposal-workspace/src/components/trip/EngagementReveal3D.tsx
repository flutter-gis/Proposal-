"use client";

/**
 * EngagementReveal3D.tsx — Refined
 *
 * Full 3D engagement reveal with detailed procedural textures.
 *
 * Textures (all procedural — no external files):
 * - Velvet box: bumpy normal map via noise, deep red interior
 * - Gold ring: high metalness, low roughness, environment reflection
 * - Diamond: faceted octahedron with refraction-like sparkle
 * - Trees: bark texture via color variation, layered cone foliage
 * - Ground: gradient grass-to-dirt with noise variation
 * - Sky: custom sunset gradient shader sphere
 *
 * The full site loads behind the overlay (it's already mounted in the DOM).
 * When the user clicks "Enter", the overlay fades and the site is ready.
 */

import { Suspense, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Stars, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/lib/preferences-context";
import { getIconForHour, type IconTheme } from "@/lib/preferences";
import ThemedReveal from "./ThemedReveal";

type Phase = "intro" | "box" | "opening" | "reveal" | "done";

// ── Procedural Velvet Texture ────────────────────────────────────────────
function useVelvetTexture(color: string) {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    // Base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    // Velvet texture — fine noise bumps
    const imgData = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30;
      imgData.data[i] = Math.max(0, Math.min(255, imgData.data[i] + noise));
      imgData.data[i + 1] = Math.max(0, Math.min(255, imgData.data[i + 1] + noise));
      imgData.data[i + 2] = Math.max(0, Math.min(255, imgData.data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);
    // Add velvet sheen lines
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.03})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * size, 0);
      ctx.lineTo(Math.random() * size, size);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }, [color]);
}

// ── Procedural Gold Texture ──────────────────────────────────────────────
function useGoldTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    // Gold gradient base
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#fde047");
    grad.addColorStop(0.3, "#eab308");
    grad.addColorStop(0.6, "#d4a017");
    grad.addColorStop(1, "#a16207");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    // Micro-scratches for realism
    for (let i = 0; i < 60; i++) {
      ctx.strokeStyle = `rgba(255,240,180,${0.05 + Math.random() * 0.1})`;
      ctx.lineWidth = 0.5 + Math.random();
      ctx.beginPath();
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30);
      ctx.stroke();
    }
    // Dark oxidation spots
    for (let i = 0; i < 15; i++) {
      ctx.fillStyle = `rgba(100,70,10,${0.1 + Math.random() * 0.15})`;
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
}

// ── Procedural Diamond Texture ───────────────────────────────────────────
function useDiamondTexture() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    // Clear to transparent
    ctx.clearRect(0, 0, size, size);
    // Rainbow refraction sparks
    const colors = ["#e0e7ff", "#c4b5fd", "#fef3c7", "#fde047", "#a5b4fc", "#f0abfc"];
    for (let i = 0; i < 30; i++) {
      const c = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.3 + Math.random() * 0.4;
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, 0.5 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return new THREE.CanvasTexture(canvas);
  }, []);
}

// ── Procedural Bark Texture ──────────────────────────────────────────────
function useBarkTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    // Dark bark base
    ctx.fillStyle = "#1a1208";
    ctx.fillRect(0, 0, size, size);
    // Vertical bark grooves
    for (let x = 0; x < size; x += 4) {
      const shade = 20 + Math.random() * 30;
      ctx.fillStyle = `rgb(${shade + 15},${shade + 8},${shade})`;
      ctx.fillRect(x, 0, 2 + Math.random() * 2, size);
    }
    // Horizontal cracks
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = `rgba(0,0,0,${0.2 + Math.random() * 0.3})`;
      ctx.lineWidth = 0.5 + Math.random();
      ctx.beginPath();
      const y = Math.random() * size;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.3, y + (Math.random() - 0.5) * 10, size * 0.7, y + (Math.random() - 0.5) * 10, size, y);
      ctx.stroke();
    }
    // Moss patches
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = `rgba(30,60,20,${0.15 + Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, 3 + Math.random() * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
}

// ── Procedural Ground Texture ────────────────────────────────────────────
function useGroundTexture() {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    // Dark forest floor gradient
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "#1a2d18");
    grad.addColorStop(0.5, "#0f1f10");
    grad.addColorStop(1, "#050a08");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    // Grass tufts
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const shade = 15 + Math.random() * 25;
      ctx.fillStyle = `rgb(${shade},${shade + 20},${shade - 5})`;
      ctx.fillRect(x, y, 1 + Math.random() * 2, 2 + Math.random() * 4);
    }
    // Dead leaves
    for (let i = 0; i < 50; i++) {
      const colors = ["#4a3018", "#5c3a20", "#3a2510", "#6b4423"];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.globalAlpha = 0.4 + Math.random() * 0.3;
      ctx.beginPath();
      ctx.ellipse(Math.random() * size, Math.random() * size, 2 + Math.random() * 3, 1 + Math.random(), Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Small rocks
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(60,55,50,${0.3 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, 1 + Math.random() * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }, []);
}

// ── 3D Ring Box with Textures ────────────────────────────────────────────
function RingBox({ opened, onClick }: { opened: boolean; onClick: () => void }) {
  const lidRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const exteriorTex = useVelvetTexture("#3a1a0a");
  const interiorTex = useVelvetTexture("#7a2418");
  const goldTex = useGoldTexture();
  const diamondTex = useDiamondTexture();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.05); // clamp delta to avoid jumps
    const lerpSpeed = (speed: number) => 1 - Math.pow(1 - speed, d * 60);

    if (lidRef.current) {
      // Smooth ease-out for lid — opens with a satisfying arc
      const target = opened ? -1.45 : 0;
      lidRef.current.rotation.x = THREE.MathUtils.lerp(
        lidRef.current.rotation.x, target, lerpSpeed(0.15)
      );
    }
    if (ringRef.current) {
      if (opened) {
        // Ring rises with a gentle arc + floats + rotates
        const targetY = 1.3 + Math.sin(t * 1.0) * 0.06;
        ringRef.current.position.y = THREE.MathUtils.lerp(
          ringRef.current.position.y, targetY, lerpSpeed(0.06)
        );
        ringRef.current.rotation.y += d * 0.5;
        // Slight tilt for sparkle effect
        ringRef.current.rotation.z = Math.sin(t * 0.7) * 0.08;
      } else {
        // Ring sits in box when closed
        ringRef.current.position.y = THREE.MathUtils.lerp(
          ringRef.current.position.y, 0, lerpSpeed(0.1)
        );
        ringRef.current.rotation.z = 0;
      }
    }
  });

  return (
    <group onClick={onClick} position={[0, 0, 0]}>
      {/* Box base — exterior velvet */}
      <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.5, 1.3]} />
        <meshStandardMaterial map={exteriorTex} color="#3a1a0a" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Box interior — red velvet */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.6, 0.06, 1.1]} />
        <meshStandardMaterial map={interiorTex} color="#7a2418" roughness={0.95} metalness={0} />
      </mesh>

      {/* Ring slot cushion */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.1, 24]} />
        <meshStandardMaterial map={interiorTex} color="#9a2c1f" roughness={0.92} />
      </mesh>

      {/* Gold trim around base top edge */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[1.82, 0.03, 1.32]} />
        <meshStandardMaterial map={goldTex} color="#d4a017" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Hinged lid */}
      <group ref={lidRef} position={[0, 0, -0.65]}>
        {/* Lid body */}
        <mesh position={[0, 0, 0.65]} castShadow>
          <boxGeometry args={[1.8, 0.35, 1.3]} />
          <meshStandardMaterial map={exteriorTex} color="#4a200a" roughness={0.82} metalness={0.08} />
        </mesh>
        {/* Gold trim on lid bottom */}
        <mesh position={[0, -0.17, 0.65]}>
          <boxGeometry args={[1.82, 0.03, 1.32]} />
          <meshStandardMaterial map={goldTex} color="#d4a017" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Gold emblem on top of lid */}
        <mesh position={[0, 0.18, 0.65]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
          <meshStandardMaterial map={goldTex} color="#eab308" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* The ring */}
      <group ref={ringRef} position={[0, 0, 0]}>
        {/* Gold band */}
        <mesh castShadow>
          <torusGeometry args={[0.2, 0.04, 24, 64]} />
          <meshStandardMaterial
            map={goldTex}
            color="#eab308"
            metalness={0.95}
            roughness={0.08}
            envMapIntensity={2}
          />
        </mesh>
        {/* Prongs (4 small cylinders) */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.06, 0.12, Math.sin(angle) * 0.06]}>
            <cylinderGeometry args={[0.012, 0.015, 0.08, 6]} />
            <meshStandardMaterial map={goldTex} color="#d4a017" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}
        {/* Diamond — faceted */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <octahedronGeometry args={[0.1, 0]} />
          <meshPhysicalMaterial
            map={diamondTex}
            color="#e0e7ff"
            metalness={0.0}
            roughness={0.0}
            transmission={0.8}
            thickness={0.5}
            ior={2.4}
            emissive="#a78bfa"
            emissiveIntensity={0.2}
            clearcoat={1}
            clearcoatRoughness={0}
          />
        </mesh>
        {/* Diamond sparkle */}
        <Sparkles count={20} scale={0.5} size={4} speed={0.5} color="#fef3c7" position={[0, 0.2, 0]} />
      </group>

      {/* Warm glow from box */}
      <pointLight position={[0, 0.3, 0]} intensity={3} distance={5} color="#fbbf24" />
    </group>
  );
}

// ── 3D Pine Tree with Bark Texture ───────────────────────────────────────
function PineTree({ position, scale = 1, dark = false, sharedGeo }: {
  position: [number, number, number]; scale?: number; dark?: boolean;
  sharedGeo?: THREE.CylinderGeometry[];
}) {
  const barkTex = useBarkTexture();
  const trunkColor = dark ? "#0a0805" : "#1a1208";
  const leafColor1 = dark ? "#050a08" : "#0a1810";
  const leafColor2 = dark ? "#080f0a" : "#0f2015";
  const leafColor3 = dark ? "#030503" : "#081008";

  return (
    <group position={position} scale={scale}>
      {/* Trunk with bark texture */}
      <mesh position={[0, 0.3, 0]} castShadow geometry={sharedGeo?.[0]}>
        <meshStandardMaterial map={barkTex} color={trunkColor} roughness={0.95} />
      </mesh>
      {/* Foliage — 3 stacked cones with color variation */}
      <mesh position={[0, 0.75, 0]} castShadow geometry={sharedGeo?.[1]}>
        <meshStandardMaterial color={leafColor1} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow geometry={sharedGeo?.[2]}>
        <meshStandardMaterial color={leafColor2} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow geometry={sharedGeo?.[3]}>
        <meshStandardMaterial color={leafColor3} roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

// ── 3D Ground with Texture ───────────────────────────────────────────────
function Ground() {
  const groundTex = useGroundTexture();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial map={groundTex} color="#0a1810" roughness={1} />
    </mesh>
  );
}

// ── 3D Confetti Burst ────────────────────────────────────────────────────
function ConfettiBurst({ active }: { active: boolean }) {
  const particlesRef = useRef<Array<{
    position: [number, number, number];
    velocity: [number, number, number];
    color: string;
    size: number;
    life: number;
    maxLife: number;
    rotation: [number, number, number];
    rotSpeed: [number, number, number];
  }>>([]);

  const initialized = useRef(false);

  if (active && !initialized.current) {
    initialized.current = true;
    const colors = ["#fbbf24", "#f59e0b", "#ec4899", "#f472b6", "#fef3c7", "#d4a017", "#e11d48", "#fde047", "#a78bfa", "#c4b5fd"];
    particlesRef.current = Array.from({ length: 100 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 100 + Math.random() * 0.4;
      const speed = 2.5 + Math.random() * 5;
      return {
        position: [0, 0.3, 0] as [number, number, number],
        velocity: [Math.cos(angle) * speed, Math.sin(angle) * speed + 3, (Math.random() - 0.5) * 2] as [number, number, number],
        color: colors[i % colors.length],
        size: 0.04 + Math.random() * 0.08,
        life: 0,
        maxLife: 2.5 + Math.random() * 2,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
        rotSpeed: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4] as [number, number, number],
      };
    });
  }

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    if (!meshRef.current || particlesRef.current.length === 0) return;
    const particles = particlesRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life += delta;

      if (p.life < p.maxLife) {
        p.position[0] += p.velocity[0] * delta;
        p.position[1] += p.velocity[1] * delta;
        p.position[2] += p.velocity[2] * delta;
        p.velocity[1] -= 5 * delta;
        p.velocity[0] *= 0.97;
        p.velocity[2] *= 0.97;

        p.rotation[0] += p.rotSpeed[0] * delta;
        p.rotation[1] += p.rotSpeed[1] * delta;
        p.rotation[2] += p.rotSpeed[2] * delta;

        dummy.position.set(p.position[0], p.position[1], p.position[2]);
        dummy.rotation.set(p.rotation[0], p.rotation[1], p.rotation[2]);
        const fade = Math.max(0, 1 - p.life / p.maxLife);
        dummy.scale.setScalar(p.size * 12 * fade);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        colorObj.set(p.color);
        meshRef.current.setColorAt(i, colorObj);
      } else {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  if (!active || particlesRef.current.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 100]} castShadow>
      <boxGeometry args={[1, 1, 0.3]} />
      <meshStandardMaterial vertexColors toneMapped={false} emissiveIntensity={0.3} />
    </instancedMesh>
  );
}

// ── Sunset Sky Sphere ────────────────────────────────────────────────────
// ── Sky palettes per time-of-day theme ───────────────────────────────────
const SKY_PALETTES: Record<string, { stops: [number, string][]; clouds: string; starCount: number; fog: string }> = {
  sunrise: {
    stops: [[0, "#2d1b4e"], [0.2, "#7c3aed"], [0.35, "#dc2626"], [0.5, "#f97316"], [0.65, "#fbbf24"], [0.8, "#fef3c7"], [1, "#1a2d24"]],
    clouds: "rgba(255,200,150,", starCount: 200, fog: "#7c3aed",
  },
  morning: {
    stops: [[0, "#0c4a6e"], [0.2, "#0284c7"], [0.4, "#38bdf8"], [0.6, "#bae6fd"], [0.8, "#e0f2fe"], [1, "#0f1f15"]],
    clouds: "rgba(255,255,255,", starCount: 50, fog: "#0284c7",
  },
  afternoon: {
    stops: [[0, "#06b6d4"], [0.3, "#22d3ee"], [0.5, "#67e8f9"], [0.7, "#a7f3d0"], [0.9, "#0f1f15"], [1, "#0a1810"]],
    clouds: "rgba(255,255,255,", starCount: 0, fog: "#16a34a",
  },
  golden: {
    stops: [[0, "#7c2d12"], [0.2, "#dc2626"], [0.4, "#f97316"], [0.55, "#fbbf24"], [0.7, "#fde047"], [0.85, "#fef3c7"], [1, "#1a2d24"]],
    clouds: "rgba(255,200,100,", starCount: 100, fog: "#f97316",
  },
  sunset: {
    stops: [[0, "#1a1340"], [0.12, "#3b1d6e"], [0.25, "#6d1f5e"], [0.35, "#9c1f3f"], [0.45, "#c62a18"], [0.55, "#e8590c"], [0.65, "#f59e0b"], [0.75, "#fde047"], [0.85, "#fef3c7"], [1, "#1a2d24"]],
    clouds: "rgba(255,200,150,", starCount: 300, fog: "#831843",
  },
  dusk: {
    stops: [[0, "#0f0a2e"], [0.2, "#312e81"], [0.35, "#6d28d9"], [0.5, "#8b5cf6"], [0.65, "#c4b5fd"], [0.8, "#1e1b4b"], [1, "#050a08"]],
    clouds: "rgba(200,180,255,", starCount: 600, fog: "#4c1d95",
  },
  midnight: {
    stops: [[0, "#020617"], [0.3, "#0f0a2e"], [0.5, "#1e1b4b"], [0.7, "#312e81"], [0.85, "#1e1b4b"], [1, "#020617"]],
    clouds: "rgba(100,100,200,", starCount: 1500, fog: "#1e1b4b",
  },
  stargazing: {
    stops: [[0, "#020617"], [0.2, "#0f0a2e"], [0.4, "#1e1b4b"], [0.6, "#312e81"], [0.8, "#1e1b4b"], [1, "#020617"]],
    clouds: "rgba(100,100,200,", starCount: 2000, fog: "#0f0a2e",
  },
};

function DynamicSky({ icon }: { icon: IconTheme }) {
  const palette = SKY_PALETTES[icon] || SKY_PALETTES.sunset;

  const tex = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    palette.stops.forEach(([pos, color]) => grad.addColorStop(pos, color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    // Cloud wisps
    for (let i = 0; i < 12; i++) {
      const y = size * (0.25 + ((i * 37) % 100) / 300);
      ctx.fillStyle = `${palette.clouds}${0.04 + ((i * 17) % 100) / 1000})`;
      ctx.beginPath();
      ctx.ellipse(((i * 83) % 100) / 100 * size, y, 25 + ((i * 41) % 60), 3 + ((i * 13) % 5), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }, [palette]);

  return (
    <>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[30, 24, 24]} />
        <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} />
      </mesh>
      <Stars radius={25} depth={20} count={palette.starCount} factor={4} saturation={0.5} fade speed={1} />
    </>
  );
}

// ── Main 3D Scene ────────────────────────────────────────────────────────
function Scene({ phase, onBoxClick }: { phase: Phase; onBoxClick: () => void }) {
  const { camera } = useThree();
  const { effectiveIcon } = usePreferences();
  const camTargetRef = useRef({ x: 0, y: 1.2, z: 4.5 });
  const camLookRef = useRef({ x: 0, y: 0.2, z: 0 });

  // Cinematic camera dolly when box opens
  useEffect(() => {
    if (phase === "opening" || phase === "reveal") {
      // Dolly in closer and tilt down slightly
      camTargetRef.current = { x: 0, y: 0.8, z: 3.0 };
      camLookRef.current = { x: 0, y: 0.5, z: 0 };
    } else if (phase === "box") {
      camTargetRef.current = { x: 0, y: 1.2, z: 4.5 };
      camLookRef.current = { x: 0, y: 0.2, z: 0 };
    }
  }, [phase]);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const lerpSpeed = 1 - Math.pow(1 - 0.05, d * 60);
    // Use camera.position.set() to avoid mutating hook-returned values
    const newX = THREE.MathUtils.lerp(camera.position.x, camTargetRef.current.x, lerpSpeed);
    const newY = THREE.MathUtils.lerp(camera.position.y, camTargetRef.current.y, lerpSpeed);
    const newZ = THREE.MathUtils.lerp(camera.position.z, camTargetRef.current.z, lerpSpeed);
    camera.position.set(newX, newY, newZ);
    camera.lookAt(
      THREE.MathUtils.lerp(0, camLookRef.current.x, lerpSpeed),
      THREE.MathUtils.lerp(0.2, camLookRef.current.y, lerpSpeed),
      0
    );
  });

  // Pre-compute tree positions (stable across renders)
  const trees = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: number; dark: boolean }[] = [];
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + 0.2;
      const r = 8 + ((i * 37) % 100) / 25;
      arr.push({ pos: [Math.cos(angle) * r, -0.5, Math.sin(angle) * r - 2], scale: 0.9 + ((i * 53) % 50) / 100, dark: true });
    }
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + 0.5;
      const r = 5 + ((i * 29) % 100) / 50;
      arr.push({ pos: [Math.cos(angle) * r, -0.5, Math.sin(angle) * r - 1], scale: 1.1 + ((i * 43) % 50) / 100, dark: false });
    }
    arr.push({ pos: [-3.2, -0.5, 1], scale: 1.6, dark: false });
    arr.push({ pos: [3.2, -0.5, 0.5], scale: 1.4, dark: false });
    arr.push({ pos: [-2.8, -0.5, 2], scale: 1.3, dark: false });
    arr.push({ pos: [3, -0.5, 2], scale: 1.5, dark: false });
    return arr;
  }, []);

  // Shared geometry for performance
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.08, 0.14, 0.6, 6), []);
  const coneGeo1 = useMemo(() => new THREE.ConeGeometry(0.45, 0.65, 6), []);
  const coneGeo2 = useMemo(() => new THREE.ConeGeometry(0.35, 0.55, 6), []);
  const coneGeo3 = useMemo(() => new THREE.ConeGeometry(0.24, 0.45, 6), []);

  const skyPalette = SKY_PALETTES[effectiveIcon] || SKY_PALETTES.sunset;

  return (
    <>
      <DynamicSky icon={effectiveIcon} />
      <ambientLight intensity={0.25} color="#f59e0b" />
      <directionalLight position={[3, 4, 5]} intensity={1.8} color="#fbbf24" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={20} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
      <directionalLight position={[-4, 2, -2]} intensity={0.5} color="#ec4899" />
      <hemisphereLight args={["#fbbf24", "#0a1810", 0.6]} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#fde047" />

      {/* Granite cliff in the background */}
      <mesh position={[0, 2, -12]} receiveShadow>
        <boxGeometry args={[16, 8, 2]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} flatShading />
      </mesh>
      {/* Lake in front of cliff */}
      <mesh position={[0, -0.48, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 5]} />
        <meshStandardMaterial color="#1a3a5a" roughness={0.1} metalness={0.6} transparent opacity={0.8} />
      </mesh>

      <Ground />

      {trees.map((t, i) => (
        <PineTree key={i} position={t.pos} scale={t.scale} dark={t.dark} sharedGeo={[trunkGeo, coneGeo1, coneGeo2, coneGeo3]} />
      ))}

      {/* Campfire for dusk/night themes */}
      {(effectiveIcon === "dusk" || effectiveIcon === "midnight" || effectiveIcon === "stargazing") && (
        <group position={[3, -0.3, 1.5]}>
          {/* Fire base */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 0.1, 8]} />
            <meshStandardMaterial color="#2a1810" roughness={1} />
          </mesh>
          {/* Flame */}
          <mesh position={[0, 0.3, 0]}>
            <coneGeometry args={[0.15, 0.5, 6]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <coneGeometry args={[0.08, 0.3, 6]} />
            <meshBasicMaterial color="#fde047" transparent opacity={0.9} />
          </mesh>
          <pointLight position={[0, 0.5, 0]} intensity={2} distance={5} color="#f97316" />
        </group>
      )}

      {/* Ring box */}
      <RingBox opened={phase === "opening" || phase === "reveal" || phase === "done"} onClick={onBoxClick} />

      {phase !== "intro" && (
        <Sparkles count={30} scale={4} size={5} speed={0.3} color="#fbbf24" position={[0, 0.8, 0]} />
      )}

      {/* Themed reveal: replaces the generic confetti burst with a unique
          particle effect per icon theme (golden butterflies, sunset birds,
          dusk fireflies double-helix, midnight ember sparks, stargazing
          shooting stars, heart petals, etc.). Falls back to confetti for
          icons without a specific effect. */}
      <ThemedReveal active={phase === "reveal" || phase === "done"} icon={effectiveIcon} />

      <ContactShadows position={[0, -0.49, 0]} opacity={0.5} scale={10} blur={2} far={4} color="#000000" />

      <fog attach="fog" args={[skyPalette.fog, 7, 18]} />
    </>
  );
}

// ── Main Component ───────────────────────────────────────────────────────
export default function EngagementReveal3D() {
  const [phase, setPhase] = useState<Phase>("intro");
  // Start visible=true so there's NO flicker — the overlay covers the site
  // from the very first paint. If reduced-motion is preferred, we hide it
  // in the effect below.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }

    // Always show the reveal — plays every time the app opens
    const t = setTimeout(() => setPhase("box"), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleBoxClick = useCallback(() => {
    if (phase !== "box") return;
    setPhase("opening");
    // Start music when box opens
    import("@/lib/sound-engine").then(({ getSoundEngine }) => {
      import("@/lib/compositions").then(({ getComposition }) => {
        const comp = getComposition("golden-hour");
        if (comp) getSoundEngine().play(comp).catch(() => {});
      });
    });
    setTimeout(() => setPhase("reveal"), 1800);
    setTimeout(() => {
      setPhase("done");
      setTimeout(() => setVisible(false), 800);
    }, 5500);
  }, [phase]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[300] transition-opacity duration-700",
        phase === "done" ? "opacity-0" : "opacity-100"
      )}
      // Solid dark background from first paint — no transparency, no flicker
      style={{ backgroundColor: "#0f0a1e" }}
    >
      {/* 3D Canvas — full screen */}
      <Canvas
        shadows
        camera={{ position: [0, 1.2, 4.5], fov: 50 }}
        className="absolute inset-0"
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene phase={phase} onBoxClick={handleBoxClick} />
        </Suspense>
      </Canvas>

      {/* ── UI Overlay ─────────────────────────────────────────────────── */}

      {/* Box phase */}
      {phase === "box" && (
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-[18vh] pointer-events-none">
          <div className="text-center px-8 anim-fade-in-up">
            <p className="font-serif text-lg sm:text-xl text-amber-100 italic" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              There&apos;s some exciting news…
            </p>
            <p className="mt-2 text-xs text-amber-200/70 uppercase tracking-widest" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              Tap the box to open
            </p>
          </div>
        </div>
      )}

      {/* Reveal phase */}
      {(phase === "reveal" || phase === "done") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center px-8" style={{ animation: "css-pop-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
            <p className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3" style={{ textShadow: "0 0 30px rgba(251,191,36,0.7), 0 0 60px rgba(236,72,153,0.4), 0 2px 8px rgba(0,0,0,0.5)" }}>
              J <span className="text-amber-300">&amp;</span> Dee
            </p>
            <p className="font-serif text-xl sm:text-2xl md:text-3xl text-amber-200 italic" style={{ textShadow: "0 0 20px rgba(251,191,36,0.5), 0 2px 8px rgba(0,0,0,0.5)" }}>
              are getting engaged!
            </p>
            <div className="mt-6 text-3xl anim-heartbeat">💍</div>
            <p className="mt-4 text-xs text-amber-100/70 uppercase tracking-widest" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              #JAndDeeSayIDo · 8.7.26
            </p>
          </div>
        </div>
      )}

      {/* Enter link */}
      {phase === "reveal" && (
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center pointer-events-auto cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setPhase("done");
            setTimeout(() => setVisible(false), 800);
          }}
        >
          <p className="text-xs text-amber-100/60 uppercase tracking-widest anim-fade-in-up" style={{ animationDelay: "2.5s", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
            Enter the adventure →
          </p>
        </div>
      )}
    </div>
  );
}
