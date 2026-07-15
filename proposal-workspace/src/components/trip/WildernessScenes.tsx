"use client";

/**
 * WildernessScenes.tsx
 *
 * Nine unique 3D wilderness scenes for the EngagementReveal3D component.
 * Each scene corresponds to a time-of-day icon theme and renders its own
 * unique terrain, objects, wildlife, and atmospheric effects.
 *
 * Scenes are switched based on `effectiveIcon` from the preferences context.
 * The main EngagementReveal3D Scene component handles the camera, RingBox,
 * ThemedReveal, and fog — these scene components handle everything else
 * (terrain, lighting, decorative meshes, ambient particles).
 *
 * All scenes use low-poly geometry with flat shading to match the existing
 * aesthetic. Instanced meshes and THREE.Points are used for repeated elements
 * (dust motes, fireflies, stars, flowers) to keep draw calls low.
 */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { IconTheme } from "@/lib/preferences";

// ── Shared helpers ───────────────────────────────────────────────────────

// Deterministic PRNG for stable positions across renders
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SceneProps {
  phase: "intro" | "box" | "opening" | "reveal" | "done";
}

// ── Pine Tree (shared across scenes) ─────────────────────────────────────
function PineTree({
  position,
  scale = 1,
  color = "#1a3a1a",
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 0.6, 5]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[0.35, 0.7, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[0.25, 0.55, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <coneGeometry args={[0.15, 0.4, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

// ── Scene 1: Lake Gloriette at Dawn (Sunrise) ────────────────────────────
export function DawnLakeScene({ phase: _phase }: SceneProps) {
  const loonRef = useRef<THREE.Group>(null);
  const mistRef = useRef<THREE.Mesh>(null);
  const wakeRef = useRef<THREE.Mesh>(null);

  // Cattail positions
  const cattails = useMemo(() => {
    const rng = mulberry32(101);
    return Array.from({ length: 6 }, (_, i) => ({
      pos: [-2.5 + i * 0.5, -0.45, 1.5 + rng() * 0.5] as [number, number, number],
      delay: rng() * Math.PI * 2,
    }));
  }, []);

  // Merganser duck positions
  const ducks = useMemo(() => {
    const rng = mulberry32(202);
    return Array.from({ length: 2 }, () => ({
      pos: [(rng() - 0.5) * 3, -0.42, -2 + rng() * 1.5] as [number, number, number],
      phase: rng() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Loon glides slowly across the lake
    if (loonRef.current) {
      loonRef.current.position.x = Math.sin(t * 0.1) * 2.5;
      loonRef.current.position.z = -3 + Math.cos(t * 0.08) * 1;
    }
    // Wake trail follows loon
    if (wakeRef.current) {
      wakeRef.current.position.x = loonRef.current?.position.x ?? 0;
      wakeRef.current.position.z = (loonRef.current?.position.z ?? -3) + 0.3;
      const mat = wakeRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(t * 2) * 0.05;
    }
    // Mist drifts
    if (mistRef.current) {
      mistRef.current.position.x = Math.sin(t * 0.05) * 0.5;
      const mat = mistRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.sin(t * 0.3) * 0.08;
    }
  });

  return (
    <>
      {/* Lighting — soft dawn light from the east */}
      <ambientLight intensity={0.35} color="#fef3c7" />
      <directionalLight position={[5, 3, 2]} intensity={1.5} color="#fbbf24" />
      <hemisphereLight args={["#fde68a", "#78350f", 0.5]} />

      {/* Table Rock cliff with golden rim light */}
      <mesh position={[0, 3, -14]}>
        <boxGeometry args={[18, 10, 2]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.95} flatShading />
      </mesh>
      {/* Golden rim light on cliff edge */}
      <mesh position={[0, 7, -13.5]}>
        <boxGeometry args={[18, 0.3, 0.1]} />
        <meshBasicMaterial color="#fde047" transparent opacity={0.6} />
      </mesh>

      {/* Mirror-still lake */}
      <mesh position={[0, -0.48, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 6]} />
        <meshStandardMaterial color="#3a4a6a" roughness={0.05} metalness={0.8} transparent opacity={0.85} />
      </mesh>

      {/* Misty fog wisps */}
      <mesh ref={mistRef} position={[0, 0, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 3]} />
        <meshBasicMaterial color="#fef3c7" transparent opacity={0.2} depthWrite={false} />
      </mesh>

      {/* Loon with V-shaped wake */}
      <group ref={loonRef} position={[0, -0.4, -3]}>
        {/* Loon body */}
        <mesh>
          <sphereGeometry args={[0.12, 6, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Head + beak */}
        <mesh position={[0.1, 0.05, 0]}>
          <sphereGeometry args={[0.05, 4, 3]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.16, 0.04, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.02, 0.06, 3]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
      {/* V-shaped wake trail */}
      <mesh ref={wakeRef} position={[0, -0.47, -2.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.6, 4, 1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Cattail reeds swaying at the water's edge */}
      {cattails.map((c, i) => (
        <Cattail key={i} position={c.pos} delay={c.delay} />
      ))}

      {/* Merganser ducks bobbing */}
      {ducks.map((d, i) => (
        <MerganserDuck key={i} position={d.pos} phase={d.phase} />
      ))}

      {/* Hermit thrush silhouette in a pine tree */}
      <group position={[3.5, 1.5, -1]}>
        <mesh>
          <sphereGeometry args={[0.06, 4, 3]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
      </group>
      <PineTree position={[3.5, -0.5, -1]} scale={1.3} color="#2d4a2d" />

      {/* Foreground pines */}
      <PineTree position={[-4, -0.5, 0]} scale={1.5} color="#1a3a1a" />
      <PineTree position={[4.5, -0.5, 1]} scale={1.2} color="#1a3a1a" />

      <fog attach="fog" args={["#fde68a", 8, 20]} />
    </>
  );
}

function Cattail({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.08;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.01, 0.015, 0.6, 3]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      {/* Cattail head */}
      <mesh position={[0, 0.65, 0]}>
        <capsuleGeometry args={[0.025, 0.12, 3, 4]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>
    </group>
  );
}

function MerganserDuck({ position, phase }: { position: [number, number, number]; phase: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + phase) * 0.02;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5 + phase) * 0.05;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh scale={[1, 0.6, 0.5]}>
        <sphereGeometry args={[0.1, 5, 4]} />
        <meshStandardMaterial color="#4a3a2a" />
      </mesh>
      <mesh position={[0.08, 0.06, 0]}>
        <sphereGeometry args={[0.04, 4, 3]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>
    </group>
  );
}

// ── Scene 2: Bear Brook Forest Trail (Morning) ───────────────────────────
export function ForestTrailScene({ phase: _phase }: SceneProps) {
  // 120 golden dust motes
  const dustMotes = useMemo(() => {
    const rng = mulberry32(303);
    const positions = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      positions[i * 3] = (rng() - 0.5) * 10;
      positions[i * 3 + 1] = rng() * 4;
      positions[i * 3 + 2] = (rng() - 0.5) * 8;
    }
    return positions;
  }, []);

  const dustRef = useRef<THREE.Points>(null);

  // Ferns
  const ferns = useMemo(() => {
    const rng = mulberry32(404);
    return Array.from({ length: 8 }, () => ({
      pos: [(rng() - 0.5) * 8, -0.45, (rng() - 0.5) * 6] as [number, number, number],
      delay: rng() * Math.PI * 2,
    }));
  }, []);

  // Mossy boulders
  const boulders = useMemo(() => {
    const rng = mulberry32(505);
    return Array.from({ length: 4 }, () => ({
      pos: [(rng() - 0.5) * 8, -0.3, (rng() - 0.5) * 6] as [number, number, number],
      scale: 0.4 + rng() * 0.3,
    }));
  }, []);

  // Pine tree positions
  const pines = useMemo(() => {
    const rng = mulberry32(606);
    return Array.from({ length: 8 }, (_, i) => ({
      pos: [
        Math.cos((i / 8) * Math.PI * 2) * (5 + rng() * 3),
        -0.5,
        Math.sin((i / 8) * Math.PI * 2) * (4 + rng() * 3),
      ] as [number, number, number],
      scale: 1 + rng() * 0.5,
    }));
  }, []);

  // Deer position (stands motionless)
  const deerRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Dust motes drift in figure-eight patterns
    if (dustRef.current) {
      const positions = dustRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 120; i++) {
        positions[i * 3] += Math.sin(t * 0.3 + i * 0.1) * 0.002;
        positions[i * 3 + 1] += Math.cos(t * 0.2 + i * 0.15) * 0.003;
        // Wrap around
        if (positions[i * 3 + 1] > 4) positions[i * 3 + 1] = 0;
        if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 4;
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Lighting — bright morning with strong directional sun */}
      <ambientLight intensity={0.55} color="#e0f2fe" />
      <directionalLight position={[3, 8, 3]} intensity={2.5} color="#fef9c3" castShadow />
      <hemisphereLight args={["#bae6fd", "#14532d", 0.6]} />

      {/* 5 volumetric sun beam shafts (additive planes) */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[-3 + i * 1.5, 3, -2 + (i % 2) * 0.5]}
          rotation={[0, 0, 0.3 + i * 0.1]}
        >
          <planeGeometry args={[0.6, 6]} />
          <meshBasicMaterial
            color="#fef9c3"
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* 120 golden dust motes */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dustMotes, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#fde047"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 8 cinnamon ferns */}
      {ferns.map((f, i) => (
        <Fern key={i} position={f.pos} delay={f.delay} />
      ))}

      {/* 4 mossy boulders */}
      {boulders.map((b, i) => (
        <group key={i} position={b.pos} scale={b.scale}>
          <mesh>
            <dodecahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial color="#5a5a5a" roughness={0.9} flatShading />
          </mesh>
          {/* Moss patch */}
          <mesh position={[0.1, 0.3, 0.1]} scale={[0.5, 0.15, 0.4]}>
            <sphereGeometry args={[0.3, 6, 4]} />
            <meshStandardMaterial color="#4a7c2a" emissive="#2a5a1a" emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}

      {/* 8 pine tree trunks */}
      {pines.map((p, i) => (
        <PineTree key={i} position={p.pos} scale={p.scale} color="#15803d" />
      ))}

      {/* Deer silhouette — stands motionless */}
      <group ref={deerRef} position={[-2, -0.45, -3]}>
        {/* Body */}
        <mesh scale={[1.2, 0.7, 0.5]}>
          <sphereGeometry args={[0.25, 6, 4]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
        {/* Head */}
        <mesh position={[0.3, 0.15, 0]}>
          <sphereGeometry args={[0.1, 5, 4]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
        {/* Legs */}
        {[[0.15, -0.2], [-0.15, -0.2], [0.15, 0.2], [-0.15, 0.2]].map((l, i) => (
          <mesh key={i} position={[l[0], -0.2, l[1]]}>
            <cylinderGeometry args={[0.03, 0.03, 0.25, 3]} />
            <meshStandardMaterial color="#5d4037" />
          </mesh>
        ))}
      </group>

      {/* Chipmunk darting in figure-eight */}
      <Chipmunk />

      {/* Trail path */}
      <mesh position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 8]} />
        <meshStandardMaterial color="#6b4423" roughness={1} transparent opacity={0.4} />
      </mesh>

      <fog attach="fog" args={["#bae6fd", 10, 22]} />
    </>
  );
}

function Fern({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6 + delay) * 0.06;
    }
  });
  return (
    <group ref={ref} position={position}>
      {[0, 0.5, 1, 1.5, 2, 2.5].map((angle, i) => (
        <mesh
          key={i}
          position={[0, 0.15, 0]}
          rotation={[0, angle, 0.3]}
          scale={[0.5, 1, 0.3]}
        >
          <coneGeometry args={[0.04, 0.4, 3]} />
          <meshStandardMaterial color="#4a7c2a" />
        </mesh>
      ))}
    </group>
  );
}

function Chipmunk() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.8;
    if (ref.current) {
      ref.current.position.x = Math.sin(t) * 1.5;
      ref.current.position.z = Math.sin(t * 2) * 0.8;
      ref.current.position.y = -0.4 + Math.abs(Math.sin(t * 4)) * 0.05;
    }
  });
  return (
    <group ref={ref} position={[0, -0.4, 1]}>
      <mesh scale={[1, 0.7, 0.7]}>
        <sphereGeometry args={[0.06, 5, 4]} />
        <meshStandardMaterial color="#a0522d" />
      </mesh>
      <mesh position={[0.05, 0.04, 0]}>
        <sphereGeometry args={[0.03, 4, 3]} />
        <meshStandardMaterial color="#a0522d" />
      </mesh>
    </group>
  );
}

// ── Scene 3: Kayak on Pawtuckaway Lake (Afternoon) ───────────────────────
export function KayakLakeScene({ phase: _phase }: SceneProps) {
  const kayakRef = useRef<THREE.Group>(null);
  const paddleRef = useRef<THREE.Mesh>(null);
  const ospreyRef = useRef<THREE.Group>(null);

  // 200 sparkle points
  const sparkles = useMemo(() => {
    const rng = mulberry32(707);
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (rng() - 0.5) * 14;
      positions[i * 3 + 1] = -0.45 + rng() * 0.05;
      positions[i * 3 + 2] = (rng() - 0.5) * 8;
    }
    return positions;
  }, []);

  const sparklesRef = useRef<THREE.Points>(null);

  // Granite islands
  const islands = useMemo(() => {
    const rng = mulberry32(808);
    return Array.from({ length: 4 }, () => ({
      pos: [(rng() - 0.5) * 10, -0.4, -3 + (rng() - 0.5) * 4] as [number, number, number],
      scale: 0.5 + rng() * 0.5,
    }));
  }, []);

  // Dragonflies
  const dragonflies = useMemo(() => {
    const rng = mulberry32(909);
    return Array.from({ length: 4 }, (_, i) => ({
      center: [(rng() - 0.5) * 6, 0.5 + rng() * 1, -1 + (rng() - 0.5) * 4] as [number, number, number],
      phase: rng() * Math.PI * 2,
      color: i % 2 === 0 ? "#3b82f6" : "#22c55e",
    }));
  }, []);

  // Lily pads
  const lilyPads = useMemo(() => {
    const rng = mulberry32(110);
    return Array.from({ length: 6 }, () => ({
      pos: [(rng() - 0.5) * 8, -0.43, -2 + (rng() - 0.5) * 5] as [number, number, number],
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Kayak gentle bob
    if (kayakRef.current) {
      kayakRef.current.position.y = -0.38 + Math.sin(t * 1.2) * 0.03;
      kayakRef.current.rotation.z = Math.sin(t * 1.2) * 0.04;
    }
    // Paddle strokes: left-right-left with rotation
    if (paddleRef.current) {
      paddleRef.current.rotation.x = Math.sin(t * 3) * 0.6;
      paddleRef.current.position.x = Math.sin(t * 3) * 0.15;
    }
    // Osprey circles then plunge-dives (8s circle, 2s dive)
    if (ospreyRef.current) {
      const cycle = (t % 10) / 10;
      if (cycle < 0.8) {
        const angle = cycle * Math.PI * 8;
        ospreyRef.current.position.x = Math.cos(angle) * 4;
        ospreyRef.current.position.y = 3 + Math.sin(cycle * Math.PI * 4) * 0.5;
        ospreyRef.current.position.z = Math.sin(angle) * 4 - 2;
      } else {
        // Dive
        const diveT = (cycle - 0.8) / 0.2;
        ospreyRef.current.position.x = 0;
        ospreyRef.current.position.y = 3 - diveT * 3.3;
        ospreyRef.current.position.z = -2;
      }
    }
    // Sparkles twinkle
    if (sparklesRef.current) {
      const mat = sparklesRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.4 + Math.sin(t * 4) * 0.2;
    }
  });

  return (
    <>
      {/* Lighting — bright afternoon sun */}
      <ambientLight intensity={0.65} color="#e0f2fe" />
      <directionalLight position={[2, 6, 4]} intensity={2.2} color="#facc15" castShadow />
      <hemisphereLight args={["#7dd3fc", "#0c4a6e", 0.5]} />

      {/* Water surface */}
      <mesh position={[0, -0.48, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.1} metalness={0.7} transparent opacity={0.85} />
      </mesh>

      {/* 200 sparkle points */}
      <points ref={sparklesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[sparkles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#ffffff"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Red kayak with paddle */}
      <group ref={kayakRef} position={[0, -0.38, 1]}>
        <mesh scale={[1.5, 0.15, 0.3]}>
          <capsuleGeometry args={[0.15, 1.2, 4, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        {/* Cockpit */}
        <mesh position={[0, 0.05, 0]}>
          <torusGeometry args={[0.1, 0.03, 4, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Paddle */}
        <mesh ref={paddleRef} position={[0, 0.15, 0]}>
          <boxGeometry args={[0.8, 0.02, 0.02]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </group>

      {/* 4 granite islands with pine trees */}
      {islands.map((isl, i) => (
        <group key={i} position={isl.pos} scale={isl.scale}>
          <mesh>
            <dodecahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial color="#6b6b6b" roughness={0.9} flatShading />
          </mesh>
          <PineTree position={[0, 0.1, 0]} scale={0.6} color="#15803d" />
        </group>
      ))}

      {/* 4 dragonflies */}
      {dragonflies.map((d, i) => (
        <Dragonfly key={i} center={d.center} phase={d.phase} color={d.color} />
      ))}

      {/* Painted turtle on a log */}
      <group position={[2, -0.4, -1]}>
        <mesh scale={[0.8, 0.4, 0.6]}>
          <sphereGeometry args={[0.1, 5, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Head */}
        <mesh position={[0.08, 0.02, 0]}>
          <sphereGeometry args={[0.03, 4, 3]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
      </group>

      {/* Osprey circling */}
      <group ref={ospreyRef} position={[0, 3, -2]}>
        <mesh scale={[2, 0.3, 0.8]}>
          <sphereGeometry args={[0.08, 4, 3]} />
          <meshStandardMaterial color="#5a4a3a" />
        </mesh>
      </group>

      {/* 6 lily pads */}
      {lilyPads.map((lp, i) => (
        <mesh key={i} position={lp.pos} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.12, 6]} />
          <meshStandardMaterial color="#15803d" transparent opacity={0.8} />
        </mesh>
      ))}

      <fog attach="fog" args={["#7dd3fc", 12, 25]} />
    </>
  );
}

function Dragonfly({
  center,
  phase,
  color,
}: {
  center: [number, number, number];
  phase: number;
  color: string;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime + phase;
    if (ref.current) {
      ref.current.position.x = center[0] + Math.sin(t * 1.5) * 0.8;
      ref.current.position.y = center[1] + Math.sin(t * 2) * 0.3;
      ref.current.position.z = center[2] + Math.cos(t * 1.5) * 0.8;
      // Wing flutter
      ref.current.rotation.y = t * 3;
    }
  });
  return (
    <group ref={ref} position={center}>
      <mesh scale={[0.3, 0.05, 0.05]}>
        <capsuleGeometry args={[0.02, 0.06, 3, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Wings */}
      <mesh position={[0, 0.02, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.08, 0.04]} />
        <meshStandardMaterial color="#e0e0e0" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Scene 4: Cliff Overlook with Easel (Golden Hour) ─────────────────────
export function CliffEaselScene({ phase: _phase }: SceneProps) {
  const jayRef = useRef<THREE.Group>(null);
  const rowboatRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Whiskey jay hops closer every 3 seconds
    if (jayRef.current) {
      const hop = Math.floor(t / 3) % 5;
      const hopT = (t % 3) / 3;
      jayRef.current.position.x = 2.5 - hop * 0.5;
      jayRef.current.position.y = -0.35 + Math.abs(Math.sin(hopT * Math.PI)) * 0.15;
      jayRef.current.rotation.y = Math.sin(t * 0.5) * 0.3;
    }
    // Rowboat gentle bob
    if (rowboatRef.current) {
      rowboatRef.current.position.y = -0.38 + Math.sin(t * 0.8) * 0.03;
      rowboatRef.current.rotation.z = Math.sin(t * 0.8) * 0.05;
    }
  });

  return (
    <>
      {/* Lighting — warm golden hour light */}
      <ambientLight intensity={0.4} color="#ffedd5" />
      <directionalLight position={[-4, 2, 2]} intensity={2.0} color="#f97316" castShadow />
      <hemisphereLight args={["#fb923c", "#431407", 0.5]} />

      {/* Table Rock glowing gold */}
      <mesh position={[0, 3, -14]}>
        <boxGeometry args={[18, 10, 2]} />
        <meshStandardMaterial
          color="#7c2d12"
          emissive="#fbbf24"
          emissiveIntensity={0.3}
          roughness={0.9}
          flatShading
        />
      </mesh>
      {/* Gold rim on cliff edge */}
      <mesh position={[0, 7.5, -13.5]}>
        <boxGeometry args={[18, 0.5, 0.1]} />
        <meshBasicMaterial color="#fde047" transparent opacity={0.7} />
      </mesh>

      {/* Lake */}
      <mesh position={[0, -0.48, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 6]} />
        <meshStandardMaterial color="#1e3a5a" roughness={0.05} metalness={0.8} transparent opacity={0.85} />
      </mesh>

      {/* Ground/rock platform */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[6, 0.5, 4]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.95} flatShading />
      </mesh>

      {/* French easel with tripod legs */}
      <group position={[0, -0.25, 0]}>
        {/* Tripod legs */}
        <mesh position={[-0.3, 0.5, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 3]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 3]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <mesh position={[0, 0.5, -0.2]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 3]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        {/* Crossbar */}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.6, 0.02, 0.02]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        {/* Canvas shelf */}
        <mesh position={[0, 0.8, 0.05]}>
          <boxGeometry args={[0.5, 0.4, 0.02]} />
          <meshStandardMaterial color="#faf3e3" />
        </mesh>
        {/* Half-finished painting with 4 impasto blobs */}
        <mesh position={[0, 0.85, 0.07]}>
          <planeGeometry args={[0.4, 0.3]} />
          <meshStandardMaterial color="#f5deb3" />
        </mesh>
        {[
          { pos: [-0.1, 0.85, 0.08], color: "#dc2626" },
          { pos: [0.05, 0.9, 0.08], color: "#facc15" },
          { pos: [0.1, 0.82, 0.08], color: "#15803d" },
          { pos: [-0.05, 0.88, 0.08], color: "#3b82f6" },
        ].map((blob, i) => (
          <mesh key={i} position={blob.pos as [number, number, number]}>
            <sphereGeometry args={[0.04, 4, 3]} />
            <meshStandardMaterial color={blob.color} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Turpentine jar (amber translucent) */}
      <mesh position={[0.5, -0.3, 0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.15, 6]} />
        <meshStandardMaterial color="#d4a017" transparent opacity={0.5} />
      </mesh>

      {/* Thermos on the rock */}
      <mesh position={[-0.5, -0.3, 0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 6]} />
        <meshStandardMaterial color="#6b4423" metalness={0.3} />
      </mesh>

      {/* Rowboat on far shore */}
      <group ref={rowboatRef} position={[-3, -0.38, -5]}>
        <mesh scale={[1, 0.4, 0.5]}>
          <capsuleGeometry args={[0.2, 0.6, 4, 6]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
      </group>

      {/* Whiskey jay hopping closer */}
      <group ref={jayRef} position={[2.5, -0.35, 0.5]}>
        <mesh scale={[1, 0.8, 0.6]}>
          <sphereGeometry args={[0.08, 5, 4]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
        <mesh position={[0.06, 0.06, 0]}>
          <sphereGeometry args={[0.04, 4, 3]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      </group>

      {/* Pine trees */}
      <PineTree position={[-3, -0.5, -1]} scale={1.2} color="#14532d" />
      <PineTree position={[3.5, -0.5, -1.5]} scale={1} color="#14532d" />

      <fog attach="fog" args={["#fb923c", 10, 22]} />
    </>
  );
}

// ── Scene 5: Lake Gloriette Cliff Edge (Sunset) ──────────────────────────
export function SunsetCliffScene({ phase: _phase }: SceneProps) {
  const batRef = useRef<THREE.Group>(null);
  const cliffMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Bat erratic flight (sin + cos at different frequencies)
    if (batRef.current) {
      batRef.current.position.x = Math.sin(t * 0.7) * 3 + Math.cos(t * 1.3) * 1.5;
      batRef.current.position.y = 2.5 + Math.sin(t * 1.1) * 0.8;
      batRef.current.position.z = -3 + Math.cos(t * 0.9) * 1;
      batRef.current.rotation.y = t * 0.5;
    }
    // Cliff color shifts pink → coral → deep red over time
    if (cliffMatRef.current) {
      const cycle = (Math.sin(t * 0.1) + 1) / 2;
      const r = 0.5 + cycle * 0.4;
      const g = 0.15 + cycle * 0.15;
      const b = 0.1;
      cliffMatRef.current.color.setRGB(r, g, b);
      cliffMatRef.current.emissive.setRGB(r * 0.3, g * 0.2, b * 0.1);
    }
  });

  return (
    <>
      {/* Lighting — deep crimson sunset */}
      <ambientLight intensity={0.3} color="#fef2f2" />
      <directionalLight position={[-5, 1, 2]} intensity={2.0} color="#dc2626" castShadow />
      <hemisphereLight args={["#7f1d1d", "#450a0a", 0.4]} />
      <pointLight position={[0, 0.5, 1]} intensity={0.5} color="#f87171" />

      {/* Table Rock with shifting colors */}
      <mesh position={[0, 3, -14]}>
        <boxGeometry args={[18, 10, 2]} />
        <meshStandardMaterial
          ref={cliffMatRef}
          color="#dc2626"
          emissive="#7f1d1d"
          emissiveIntensity={0.4}
          roughness={0.9}
          flatShading
        />
      </mesh>

      {/* Mirror lake — deep crimson reflectivity */}
      <mesh position={[0, -0.48, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 6]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.02} metalness={0.9} transparent opacity={0.9} />
      </mesh>

      {/* Ground */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[6, 0.5, 3]} />
        <meshStandardMaterial color="#450a0a" roughness={0.95} flatShading />
      </mesh>

      {/* Two Adirondack chairs */}
      <AdirondackChair position={[-0.6, -0.25, 0.5]} rotation={[0, 0.3, 0]} />
      <AdirondackChair position={[0.6, -0.25, 0.5]} rotation={[0, -0.3, 0]} />

      {/* Champagne bucket with bottle and ice */}
      <group position={[0, -0.35, 0]}>
        {/* Bucket */}
        <mesh>
          <cylinderGeometry args={[0.12, 0.1, 0.2, 8]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Bottle */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.25, 6]} />
          <meshStandardMaterial color="#14532d" metalness={0.3} />
        </mesh>
        {/* Ice cubes */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.05, -0.02, 0.05]} scale={0.03}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#e0e7ff" transparent opacity={0.7} />
          </mesh>
        ))}
      </group>

      {/* Two translucent champagne glasses */}
      {[[-0.3, 0.3], [0.3, 0.3]].map((pos, i) => (
        <group key={i} position={[pos[0], -0.25, pos[1]]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.02, 0.12, 6]} />
            <meshStandardMaterial color="#fde047" transparent opacity={0.4} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <coneGeometry args={[0.04, 0.06, 6]} />
            <meshStandardMaterial color="#fde047" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Finished painting on second easel (alizarin + cadmium) */}
      <group position={[2, -0.25, -0.5]}>
        <mesh position={[-0.2, 0.5, 0]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 3]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <mesh position={[0.2, 0.5, 0]} rotation={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 3]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <mesh position={[0, 0.8, 0.05]}>
          <planeGeometry args={[0.3, 0.2]} />
          <meshStandardMaterial color="#9a3412" emissive="#dc2626" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* Bat silhouette with erratic flight */}
      <group ref={batRef} position={[0, 2.5, -3]}>
        <mesh scale={[1, 0.2, 0.3]}>
          <sphereGeometry args={[0.05, 4, 3]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* Pine silhouettes */}
      <PineTree position={[-4, -0.5, -1]} scale={1.4} color="#450a0a" />
      <PineTree position={[4, -0.5, -1]} scale={1.2} color="#450a0a" />

      <fog attach="fog" args={["#7f1d1d", 8, 20]} />
    </>
  );
}

function AdirondackChair({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.3, 0.03, 0.3]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* Backrest — slanted */}
      <mesh position={[0, 0.25, -0.13]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.3, 0.35, 0.02]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* Armrests */}
      <mesh position={[-0.17, 0.18, 0.05]}>
        <boxGeometry args={[0.04, 0.04, 0.25]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[0.17, 0.18, 0.05]}>
        <boxGeometry args={[0.04, 0.04, 0.25]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* Legs */}
      {[[-0.13, -0.05], [0.13, -0.05], [-0.13, 0.13], [0.13, 0.13]].map((l, i) => (
        <mesh key={i} position={[l[0], 0, l[1]]}>
          <cylinderGeometry args={[0.02, 0.02, 0.22, 3]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
      ))}
    </group>
  );
}

// ── Scene 6: Twilight Forest Path (Dusk) ─────────────────────────────────
export function TwilightPathScene({ phase: _phase }: SceneProps) {
  const owlRef = useRef<THREE.Group>(null);

  // 200 fireflies
  const fireflyPositions = useMemo(() => {
    const rng = mulberry32(121);
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (rng() - 0.5) * 10;
      positions[i * 3 + 1] = rng() * 2; // knee height
      positions[i * 3 + 2] = (rng() - 0.5) * 8;
    }
    return positions;
  }, []);

  const fireflyRef = useRef<THREE.Points>(null);

  // Pine silhouettes
  const pines = useMemo(() => {
    const rng = mulberry32(131);
    return Array.from({ length: 8 }, (_, i) => ({
      pos: [
        Math.cos((i / 8) * Math.PI * 2) * (4 + rng() * 3),
        -0.5,
        Math.sin((i / 8) * Math.PI * 2) * (3 + rng() * 3),
      ] as [number, number, number],
      scale: 1 + rng() * 0.5,
    }));
  }, []);

  // Closed ferns
  const ferns = useMemo(() => {
    const rng = mulberry32(141);
    return Array.from({ length: 6 }, () => ({
      pos: [(rng() - 0.5) * 6, -0.45, (rng() - 0.5) * 4] as [number, number, number],
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Fireflies pulse and drift
    if (fireflyRef.current) {
      const mat = fireflyRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.5 + Math.sin(t * 2) * 0.3;
      const positions = fireflyRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 200; i++) {
        positions[i * 3] += Math.sin(t * 0.5 + i * 0.2) * 0.003;
        positions[i * 3 + 1] += Math.cos(t * 0.3 + i * 0.15) * 0.002;
      }
      fireflyRef.current.geometry.attributes.position.needsUpdate = true;
    }
    // Owl head turns
    if (owlRef.current) {
      owlRef.current.rotation.y = Math.sin(t * 0.3) * 0.5;
    }
  });

  return (
    <>
      {/* Lighting — dim twilight */}
      <ambientLight intensity={0.2} color="#6d28d9" />
      <directionalLight position={[0, 3, 5]} intensity={0.3} color="#a78bfa" />
      <hemisphereLight args={["#4c1d95", "#0f0a2e", 0.3]} />

      {/* 200 fireflies at knee height */}
      <points ref={fireflyRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[fireflyPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#fde047"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Fallen log with 4 luminescent mushrooms */}
      <group position={[1, -0.4, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 0.3, 0.3]}>
          <cylinderGeometry args={[0.15, 0.15, 1.5, 6]} />
          <meshStandardMaterial color="#3d2817" roughness={1} />
        </mesh>
        {/* 4 glowing mushrooms */}
        {[0, 0.3, 0.6, 0.9].map((x, i) => (
          <group key={i} position={[x - 0.4, 0.12, 0]}>
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.01, 0.015, 0.06, 4]} />
              <meshStandardMaterial color="#e0e7ff" />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <sphereGeometry args={[0.04, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial
                color="#c4b5fd"
                emissive="#a78bfa"
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Barred owl with glowing yellow eyes */}
      <group ref={owlRef} position={[-2, 2, -3]}>
        <mesh scale={[0.8, 1, 0.7]}>
          <sphereGeometry args={[0.15, 6, 5]} />
          <meshStandardMaterial color="#2e1065" />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.1, 0.05, 0.1]}>
          <sphereGeometry args={[0.03, 6, 4]} />
          <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-0.1, 0.05, 0.1]}>
          <sphereGeometry args={[0.03, 6, 4]} />
          <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* 8 nearly-black pine silhouettes */}
      {pines.map((p, i) => (
        <PineTree key={i} position={p.pos} scale={p.scale} color="#0f0a2e" />
      ))}

      {/* Lichen patches on pine trunks (faint glow) */}
      {pines.slice(0, 4).map((p, i) => (
        <mesh key={i} position={[p.pos[0], 0, p.pos[2]]}>
          <sphereGeometry args={[0.05, 4, 3]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#6d28d9"
            emissiveIntensity={0.3}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}

      {/* 6 closed ferns (curled fronds) */}
      {ferns.map((f, i) => (
        <mesh key={i} position={f.pos} scale={[0.3, 0.5, 0.3]}>
          <coneGeometry args={[0.08, 0.25, 4]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>
      ))}

      <fog attach="fog" args={["#4c1d95", 6, 16]} />
    </>
  );
}

// ── Scene 7: Coleman Cabin Campfire (Midnight) ───────────────────────────
export function CabinCampfireScene({ phase: _phase }: SceneProps) {
  const flameRef1 = useRef<THREE.Mesh>(null);
  const flameRef2 = useRef<THREE.Mesh>(null);
  const flameRef3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // 3 flame layers flicker
    if (flameRef1.current) flameRef1.current.scale.y = 1 + Math.sin(t * 8) * 0.15;
    if (flameRef2.current) flameRef2.current.scale.y = 1 + Math.sin(t * 10 + 1) * 0.15;
    if (flameRef3.current) flameRef3.current.scale.y = 1 + Math.sin(t * 12 + 2) * 0.15;
  });

  return (
    <>
      {/* Lighting — dark night with campfire glow */}
      <ambientLight intensity={0.15} color="#1e1b4b" />
      <directionalLight position={[0, 5, 2]} intensity={0.2} color="#a5b4fc" />
      <hemisphereLight args={["#0f0a2e", "#020617", 0.2]} />
      {/* 2 point lights from the fire */}
      <pointLight position={[2, 0.5, 1]} intensity={4} distance={6} color="#f97316" />
      <pointLight position={[2, 1, 1]} intensity={2} distance={4} color="#fde047" />

      {/* Crescent moon with glow halo */}
      <group position={[-5, 6, -10]}>
        <mesh>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
        {/* Shadow offset for crescent */}
        <mesh position={[0.3, 0, 0]}>
          <sphereGeometry args={[0.75, 16, 16]} />
          <meshBasicMaterial color="#0f0a2e" />
        </mesh>
        {/* Glow halo */}
        <mesh>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial color="#e0e7ff" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* 400 stars */}
      <Stars radius={30} depth={20} count={400} factor={4} saturation={0} fade speed={1} />

      {/* 15 fireflies near the firelight */}
      <Sparkles count={15} scale={[3, 2, 3]} size={3} speed={0.3} color="#fde047" position={[2, 1, 1]} />

      {/* Cabin silhouette with pitched roof and warm window glow */}
      <group position={[-4, -0.5, -5]}>
        {/* Walls */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[2, 1.6, 1.5]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Pitched roof */}
        <mesh position={[0, 1.9, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.6, 0.8, 4]} />
          <meshStandardMaterial color="#0f0a0a" />
        </mesh>
        {/* Warm orange window glow */}
        <mesh position={[0.6, 0.9, 0.76]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
      </group>

      {/* Campfire with 8-stone ring, crossed birch logs, 3 flame layers */}
      <group position={[2, -0.45, 1]}>
        {/* 8-stone ring */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.25, 0, Math.sin(angle) * 0.25]}
            >
              <dodecahedronGeometry args={[0.06, 0]} />
              <meshStandardMaterial color="#4a4a4a" roughness={0.9} flatShading />
            </mesh>
          );
        })}
        {/* Crossed birch logs (white bark) */}
        <mesh rotation={[0, 0, 0.3]} position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
        <mesh rotation={[0, 0, -0.3]} position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
        {/* 3 flame layers: red outer, orange mid, yellow-white inner */}
        <mesh ref={flameRef1} position={[0, 0.15, 0]}>
          <coneGeometry args={[0.12, 0.35, 5]} />
          <meshBasicMaterial color="#dc2626" transparent opacity={0.7} />
        </mesh>
        <mesh ref={flameRef2} position={[0, 0.2, 0]}>
          <coneGeometry args={[0.08, 0.28, 5]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.8} />
        </mesh>
        <mesh ref={flameRef3} position={[0, 0.25, 0]}>
          <coneGeometry args={[0.04, 0.2, 5]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.9} />
        </mesh>
      </group>

      {/* Pine silhouettes */}
      <PineTree position={[3, -0.5, -2]} scale={1.5} color="#020617" />
      <PineTree position={[-3, -0.5, -2]} scale={1.3} color="#020617" />

      <fog attach="fog" args={["#0f0a2e", 5, 15]} />
    </>
  );
}

// ── Scene 8: Little Diamond Pond Dock (Stargazing) ───────────────────────
export function StargazingDockScene({ phase: _phase }: SceneProps) {
  const meteorRef = useRef<THREE.Mesh>(null);
  const meteorTimeRef = useRef(0);

  // 1000 Milky Way stars (densest starfield)
  const stars = useMemo(() => {
    const rng = mulberry32(151);
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      // Bias toward a diagonal band
      const t = rng();
      const bandCenter = 30 + t * 40;
      const bandJitter = (rng() - 0.5) * 25;
      const angle = -25 * (Math.PI / 180);
      const dx = (t - 0.5) * 100;
      const dy = bandJitter;
      positions[i * 3] = 50 + dx * Math.cos(angle) - dy * Math.sin(angle);
      positions[i * 3 + 1] = 30 + dx * Math.sin(angle) + dy * Math.cos(angle);
      positions[i * 3 + 2] = -20 + (rng() - 0.5) * 30;
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    meteorTimeRef.current += delta;
    // Meteor streak every 5 seconds, lasts 1.5 seconds
    if (meteorRef.current) {
      const cycle = meteorTimeRef.current % 5;
      if (cycle < 1.5) {
        meteorRef.current.visible = true;
        const progress = cycle / 1.5;
        meteorRef.current.position.x = -10 + progress * 20;
        meteorRef.current.position.y = 8 - progress * 6;
        const mat = meteorRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.sin(progress * Math.PI) * 0.8;
      } else {
        meteorRef.current.visible = false;
      }
    }
  });

  return (
    <>
      {/* Lighting — very dark, minimal ambient */}
      <ambientLight intensity={0.1} color="#0f0a2e" />
      <hemisphereLight args={["#020617", "#0f0a2e", 0.15]} />

      {/* 1000 Milky Way stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[stars, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.15} color="#fff8e0" transparent opacity={0.8} depthWrite={false} />
      </points>

      {/* Meteor streak */}
      <mesh ref={meteorRef} position={[-10, 8, -15]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[2, 0.05, 0.05]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Mirror pond — extreme stillness */}
      <mesh position={[0, -0.48, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#0f0a2e" roughness={0.02} metalness={0.5} />
      </mesh>

      {/* Wooden dock with 4 planks and 4 corner posts */}
      <group position={[0, -0.4, 1]}>
        {/* 4 planks */}
        {[-0.15, -0.05, 0.05, 0.15].map((z, i) => (
          <mesh key={i} position={[0, 0, z]}>
            <boxGeometry args={[1.2, 0.02, 0.08]} />
            <meshStandardMaterial color="#5d4037" roughness={0.8} />
          </mesh>
        ))}
        {/* 4 corner posts */}
        {[[-0.55, -0.2], [0.55, -0.2], [-0.55, 0.2], [0.55, 0.2]].map((p, i) => (
          <mesh key={i} position={[p[0], 0.15, p[1]]}>
            <cylinderGeometry args={[0.03, 0.03, 0.35, 4]} />
            <meshStandardMaterial color="#3d2817" />
          </mesh>
        ))}
      </group>

      {/* 4 distant pine silhouettes */}
      <PineTree position={[-5, -0.5, -4]} scale={1.5} color="#020617" />
      <PineTree position={[5, -0.5, -4]} scale={1.3} color="#020617" />
      <PineTree position={[-3, -0.5, -5]} scale={1.2} color="#020617" />
      <PineTree position={[3, -0.5, -5]} scale={1.4} color="#020617" />

      {/* 8 sparse fireflies — profound silence */}
      <Sparkles count={8} scale={[6, 1, 4]} size={2} speed={0.1} color="#fde047" position={[0, 0, 0]} />

      <fog attach="fog" args={["#020617", 8, 20]} />
    </>
  );
}

// ── Scene 9: Wildflower Meadow (Heart) ───────────────────────────────────
export function WildflowerMeadowScene({ phase: _phase }: SceneProps) {
  // 18 flowers with 5 petals in 7 colors
  const flowers = useMemo(() => {
    const rng = mulberry32(161);
    const colors = ["#ec4899", "#facc15", "#a78bfa", "#f43f5e", "#fde047", "#dc2626", "#8b5cf6"];
    return Array.from({ length: 18 }, (_, i) => ({
      pos: [(rng() - 0.5) * 8, -0.4, (rng() - 0.5) * 6] as [number, number, number],
      color: colors[i % 7],
      delay: rng() * Math.PI * 2,
    }));
  }, []);

  // 12 grass tufts
  const grassTufts = useMemo(() => {
    const rng = mulberry32(171);
    return Array.from({ length: 12 }, () => ({
      pos: [(rng() - 0.5) * 10, -0.48, (rng() - 0.5) * 8] as [number, number, number],
      delay: rng() * Math.PI * 2,
    }));
  }, []);

  // 3 honeybees
  const bees = useMemo(() => {
    const rng = mulberry32(181);
    return Array.from({ length: 3 }, (_, i) => ({
      center: [(rng() - 0.5) * 4, 0.3 + rng() * 0.5, (rng() - 0.5) * 4] as [number, number, number],
      phase: rng() * Math.PI * 2,
    }));
  }, []);

  return (
    <>
      {/* Lighting — soft warm daylight */}
      <ambientLight intensity={0.55} color="#fce7f3" />
      <directionalLight position={[2, 5, 3]} intensity={2.0} color="#fbbf24" castShadow />
      <hemisphereLight args={["#ec4899", "#14532d", 0.5]} />

      {/* Meadow ground */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#22c55e" roughness={0.9} />
      </mesh>

      {/* Red picnic blanket */}
      <mesh position={[0, -0.47, 1]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <planeGeometry args={[1.5, 1.2]} />
        <meshStandardMaterial color="#dc2626" roughness={0.8} />
      </mesh>

      {/* 18 flowers with 5 petals each */}
      {flowers.map((f, i) => (
        <Flower key={i} position={f.pos} color={f.color} delay={f.delay} />
      ))}

      {/* 12 grass tufts (3 blades each) */}
      {grassTufts.map((g, i) => (
        <GrassTuft key={i} position={g.pos} delay={g.delay} />
      ))}

      {/* 3 honeybees */}
      {bees.map((b, i) => (
        <Honeybee key={i} center={b.center} phase={b.phase} />
      ))}

      {/* 4 distant pine trees */}
      <PineTree position={[-5, -0.5, -4]} scale={1.3} color="#15803d" />
      <PineTree position={[5, -0.5, -4]} scale={1.1} color="#15803d" />
      <PineTree position={[-4, -0.5, -5]} scale={1.2} color="#15803d" />
      <PineTree position={[4, -0.5, -5]} scale={1} color="#15803d" />

      {/* 12 butterfly sparkles in pink */}
      <Sparkles count={12} scale={[6, 2, 4]} size={4} speed={0.4} color="#f472b6" position={[0, 0.5, 0]} />

      <fog attach="fog" args={["#fce7f3", 10, 22]} />
    </>
  );
}

function Flower({
  position,
  color,
  delay,
}: {
  position: [number, number, number];
  color: string;
  delay: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + delay) * 0.05;
    }
  });
  return (
    <group ref={ref} position={position}>
      {/* Stem */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.008, 0.01, 0.3, 3]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>
      {/* Leaf */}
      <mesh position={[0.05, 0.1, 0]} rotation={[0, 0, -0.5]} scale={[0.3, 0.5, 0.1]}>
        <sphereGeometry args={[0.04, 4, 3]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>
      {/* 5 petals */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.06, 0.32, Math.sin(angle) * 0.06]}
            scale={[0.5, 0.3, 0.5]}
          >
            <sphereGeometry args={[0.05, 4, 3]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
      {/* Yellow center with emissive glow */}
      <mesh position={[0, 0.33, 0]}>
        <sphereGeometry args={[0.03, 6, 4]} />
        <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function GrassTuft({
  position,
  delay,
}: {
  position: [number, number, number];
  delay: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7 + delay) * 0.04;
    }
  });
  return (
    <group ref={ref} position={position}>
      {[0, 0.4, 0.8].map((angle, i) => (
        <mesh key={i} rotation={[0, angle, 0]} scale={[0.3, 1, 0.3]}>
          <coneGeometry args={[0.015, 0.2, 3]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
      ))}
    </group>
  );
}

function Honeybee({
  center,
  phase,
}: {
  center: [number, number, number];
  phase: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime + phase;
    if (ref.current) {
      ref.current.position.x = center[0] + Math.sin(t * 1.2) * 0.6;
      ref.current.position.y = center[1] + Math.sin(t * 2) * 0.2;
      ref.current.position.z = center[2] + Math.cos(t * 1.5) * 0.5;
      ref.current.rotation.y = t * 2;
    }
  });
  return (
    <group ref={ref} position={center}>
      {/* Body — yellow with black stripes (simplified) */}
      <mesh scale={[0.3, 0.08, 0.08]}>
        <capsuleGeometry args={[0.03, 0.06, 3, 4]} />
        <meshStandardMaterial color="#fde047" />
      </mesh>
      {/* Wings (translucent) */}
      <mesh position={[0, 0.03, 0]}>
        <planeGeometry args={[0.06, 0.03]} />
        <meshStandardMaterial color="#e0e0e0" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Scene Registry ───────────────────────────────────────────────────────

/**
 * Maps each icon theme to its corresponding wilderness scene component.
 * Icons without a dedicated scene (ring, proposal, anniversary) fall back
 * to the closest thematic match.
 */
export function getSceneForIcon(icon: IconTheme): React.FC<SceneProps> {
  switch (icon) {
    case "sunrise": return DawnLakeScene;
    case "morning": return ForestTrailScene;
    case "afternoon": return KayakLakeScene;
    case "golden": return CliffEaselScene;
    case "sunset": return SunsetCliffScene;
    case "dusk": return TwilightPathScene;
    case "midnight": return CabinCampfireScene;
    case "stargazing": return StargazingDockScene;
    case "heart": return WildflowerMeadowScene;
    case "ring": return CliffEaselScene; // Golden hour cliff as backdrop for ring
    case "proposal": return SunsetCliffScene; // Proposal at sunset
    case "anniversary": return TwilightPathScene; // Anniversary at dusk
    default: return SunsetCliffScene;
  }
}
