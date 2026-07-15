"use client";

/**
 * WildernessScenes.tsx (Enhanced)
 *
 * Twelve unique 3D wilderness scenes for the EngagementReveal3D component.
 * Each icon theme now has a DEDICATED scene — no fallbacks.
 *
 * All scenes use the enhanced primitives from WildernessPrimitives.tsx
 * for higher polygon counts, smoother shading, and more natural shapes.
 *
 * Scenes:
 *   1. DawnLakeScene       (sunrise)     — loon, mist, cattails, mergansers
 *   2. ForestTrailScene    (morning)     — dust motes, ferns, deer, chipmunk
 *   3. KayakLakeScene      (afternoon)   — kayak, dragonflies, osprey, lily pads
 *   4. CliffEaselScene     (golden)      — easel, painting, rowboat, whiskey jay
 *   5. SunsetCliffScene    (sunset)      — chairs, champagne, bat, color-shifting cliff
 *   6. TwilightPathScene   (dusk)        — fireflies, mushrooms, owl, glowing lichen
 *   7. CabinCampfireScene  (midnight)    — cabin, campfire, moon, 400 stars
 *   8. StargazingDockScene (stargazing)  — 1000 stars, meteor, dock, mirror pond
 *   9. WildflowerMeadowScene (heart)     — 18 flowers, bees, picnic blanket
 *  10. RingCloseupScene    (ring)        — velvet cushion, diamond ring, light prisms
 *  11. ProposalMomentScene (proposal)    — kneeling figure, ring box, rose petals, cliff
 *  12. AnniversaryScene    (anniversary) — intertwined trees, heart glow, eternal flame
 */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { IconTheme } from "@/lib/preferences";
import {
  EnhancedPineTree,
  RockFormation,
  CliffFormation,
  WaterSurface,
  Loon,
  VWakeTrail,
  Deer,
  Bird,
  Dragonfly,
  DetailedFlower,
  GlowingMushroom,
  DetailedCampfire,
  DetailedCabin,
  AdirondackChair,
  ArtistEasel,
  Rowboat,
  Cattail,
  TexturedGround,
  GrassField,
  AtmosphericParticles,
  FallenLeaves,
  DetailedMoon,
} from "./WildernessPrimitives";

// ── Deterministic PRNG ───────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════
//  SCENE 1: LAKE GLORIETTE AT DAWN (sunrise)
// ═══════════════════════════════════════════════════════════════════════════
export function DawnLakeScene({ phase: _phase }: SceneProps) {
  const mistRef = useRef<THREE.Mesh>(null);
  const loonRef = useRef<THREE.Group>(null);

  const cattails = useMemo(() => {
    const rng = mulberry32(101);
    return Array.from({ length: 6 }, (_, i) => ({
      pos: [-2.5 + i * 0.6, -0.45, 1.5 + rng() * 0.5] as [number, number, number],
      delay: rng() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mistRef.current) {
      mistRef.current.position.x = Math.sin(t * 0.05) * 0.5;
      const mat = mistRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(t * 0.3) * 0.06;
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} color="#fef3c7" />
      <directionalLight position={[5, 3, 2]} intensity={1.5} color="#fbbf24" castShadow />
      <hemisphereLight args={["#fde68a", "#78350f", 0.5]} />

      <CliffFormation position={[0, 3, -14]} color="#4a3a2a" emissive="#fbbf24" emissiveIntensity={0.25} />
      {/* Golden rim light on cliff top edge */}
      <mesh position={[0, 8, -13.5]}>
        <boxGeometry args={[18, 0.3, 0.1]} />
        <meshBasicMaterial color="#fde047" transparent opacity={0.6} />
      </mesh>

      <WaterSurface position={[0, -0.48, -8]} width={16} depth={6} color="#3a4a6a" roughness={0.05} metalness={0.8} />

      {/* Textured ground for the foreground */}
      <TexturedGround position={[0, -0.5, 2]} width={12} depth={6} color="#3a2a1a" seed={201} />

      {/* Misty fog wisps — 3 layers */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={i === 0 ? mistRef : undefined} position={[i * 2 - 2, 0.1, -5 - i]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 2]} />
          <meshBasicMaterial color="#fef3c7" transparent opacity={0.12 + i * 0.04} depthWrite={false} />
        </mesh>
      ))}

      {/* Atmospheric pollen/dust floating in the dawn light */}
      <AtmosphericParticles count={60} area={[12, 3, 6]} color="#fde047" size={0.025} speed={0.2} seed={202} />

      {/* Loon with V-wake */}
      <group ref={loonRef}>
        <Loon position={[0, -0.4, -3]} seed={42} />
        <VWakeTrail position={[0, -0.47, -2.5]} />
      </group>

      {/* 8 cattail reeds (doubled from 6) */}
      {cattails.map((c, i) => (
        <Cattail key={i} position={c.pos} delay={c.delay} />
      ))}
      {/* Additional reeds along the shore */}
      {[-3.2, -2.8, 2.8, 3.2].map((x, i) => (
        <Cattail key={`reed-${i}`} position={[x, -0.45, 1.8 + (i % 2) * 0.3]} delay={i * 0.7} />
      ))}

      {/* 2 merganser ducks */}
      <MerganserDuck position={[-2, -0.42, -2]} phase={0} />
      <MerganserDuck position={[2, -0.42, -2.5]} phase={1.5} />

      {/* Hermit thrush silhouette in pine */}
      <group position={[3.5, 1.5, -1]}>
        <mesh>
          <sphereGeometry args={[0.05, 12, 8]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        <mesh position={[0.04, 0, 0]} scale={[0.6, 0.4, 0.4]}>
          <sphereGeometry args={[0.04, 10, 6]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
      </group>

      {/* 5 pine trees (doubled from 3) */}
      <EnhancedPineTree position={[3.5, -0.5, -1]} scale={1.3} color="#2d4a2d" seed={10} />
      <EnhancedPineTree position={[-4, -0.5, 0]} scale={1.5} color="#1a3a1a" seed={11} />
      <EnhancedPineTree position={[4.5, -0.5, 1]} scale={1.2} color="#1a3a1a" seed={12} />
      <EnhancedPineTree position={[-5, -0.5, -2]} scale={1.4} color="#1a3a1a" seed={13} />
      <EnhancedPineTree position={[5, -0.5, -2]} scale={1.1} color="#1a3a1a" seed={14} />

      {/* Prismatic light spray of 7 colored cones (subtle, always present) */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const colors = ["#ef4444", "#f97316", "#fbbf24", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
        const angle = (i / 7) * Math.PI - Math.PI / 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.3, 0.5, Math.sin(angle) * 0.3]} rotation={[0, 0, angle]}>
            <coneGeometry args={[0.04, 1.5, 5]} />
            <meshBasicMaterial color={colors[i]} transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        );
      })}

      <fog attach="fog" args={["#fde68a", 8, 20]} />
    </>
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
      <mesh scale={[1.2, 0.6, 0.5]} castShadow>
        <sphereGeometry args={[0.1, 12, 8]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
      </mesh>
      <mesh position={[0.1, 0.05, 0]}>
        <sphereGeometry args={[0.04, 10, 6]} />
        <meshStandardMaterial color="#3d2817" roughness={0.8} />
      </mesh>
      <mesh position={[0.14, 0.04, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.01, 0.03, 4]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCENE 2: BEAR BROOK FOREST TRAIL (morning)
// ═══════════════════════════════════════════════════════════════════════════
export function ForestTrailScene({ phase: _phase }: SceneProps) {
  const dustRef = useRef<THREE.Points>(null);

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

  const ferns = useMemo(() => {
    const rng = mulberry32(404);
    return Array.from({ length: 8 }, () => ({
      pos: [(rng() - 0.5) * 8, -0.45, (rng() - 0.5) * 6] as [number, number, number],
      delay: rng() * Math.PI * 2,
    }));
  }, []);

  const pines = useMemo(() => {
    const rng = mulberry32(606);
    return Array.from({ length: 8 }, (_, i) => ({
      pos: [
        Math.cos((i / 8) * Math.PI * 2) * (5 + rng() * 3),
        -0.5,
        Math.sin((i / 8) * Math.PI * 2) * (4 + rng() * 3),
      ] as [number, number, number],
      scale: 1 + rng() * 0.5,
      seed: i + 20,
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (dustRef.current) {
      const positions = dustRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 120; i++) {
        positions[i * 3] += Math.sin(t * 0.3 + i * 0.1) * 0.002;
        positions[i * 3 + 1] += Math.cos(t * 0.2 + i * 0.15) * 0.003;
        if (positions[i * 3 + 1] > 4) positions[i * 3 + 1] = 0;
        if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 4;
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} color="#e0f2fe" />
      <directionalLight position={[3, 8, 3]} intensity={2.5} color="#fef9c3" castShadow />
      <hemisphereLight args={["#bae6fd", "#14532d", 0.6]} />

      {/* Textured forest floor */}
      <TexturedGround position={[0, -0.5, 0]} width={16} depth={12} color="#2a3a1a" seed={301} />

      {/* Grass field — 150 instanced blades for lush undergrowth */}
      <GrassField count={150} area={10} seed={302} color="#4a7c2a" />

      {/* Fallen leaves scattered on the ground */}
      <FallenLeaves count={30} area={10} seed={303} colors={["#8b4513", "#a0522d", "#cd853f", "#daa520", "#6b4423"]} />

      {/* 5 volumetric sun beam shafts */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-3 + i * 1.5, 3, -2 + (i % 2) * 0.5]} rotation={[0, 0, 0.3 + i * 0.1]}>
          <planeGeometry args={[0.7, 6]} />
          <meshBasicMaterial color="#fef9c3" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* 120 golden dust motes */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustMotes, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.04} color="#fde047" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* Additional atmospheric pollen */}
      <AtmosphericParticles count={50} area={[12, 4, 8]} color="#fde047" size={0.02} speed={0.25} seed={304} />

      {/* 8 cinnamon ferns */}
      {ferns.map((f, i) => (
        <DetailedFern key={i} position={f.pos} delay={f.delay} />
      ))}

      {/* 4 mossy boulders */}
      {[[-2, 0, -3], [2, 0, -1], [-1, 0, 2], [3, 0, 1]].map((pos, i) => (
        <RockFormation key={i} position={pos as [number, number, number]} scale={0.6} color="#5a5a5a" mossy seed={i + 30} />
      ))}

      {/* 12 pine trees (doubled from 8) for dense forest */}
      {pines.map((p, i) => (
        <EnhancedPineTree key={i} position={p.pos} scale={p.scale} color="#15803d" seed={p.seed} />
      ))}
      {/* Additional background pines */}
      <EnhancedPineTree position={[-6, -0.5, -5]} scale={1.6} color="#14532d" seed={350} />
      <EnhancedPineTree position={[6, -0.5, -5]} scale={1.4} color="#14532d" seed={351} />
      <EnhancedPineTree position={[-7, -0.5, -3]} scale={1.3} color="#14532d" seed={352} />
      <EnhancedPineTree position={[7, -0.5, -3]} scale={1.5} color="#14532d" seed={353} />

      {/* Deer — stands motionless */}
      <Deer position={[-2, -0.45, -3]} antlers />

      {/* Chipmunk */}
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

function DetailedFern({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6 + delay) * 0.06;
    }
  });
  return (
    <group ref={ref} position={position}>
      {[0, 0.4, 0.8, 1.2, 1.6, 2.0].map((angle, i) => (
        <mesh key={i} position={[0, 0.15, 0]} rotation={[0, angle, 0.4]} scale={[0.5, 1, 0.3]}>
          <coneGeometry args={[0.04, 0.4, 6]} />
          <meshStandardMaterial color="#4a7c2a" roughness={0.8} />
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
      <mesh scale={[1, 0.7, 0.7]} castShadow>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshStandardMaterial color="#a0522d" roughness={0.8} />
      </mesh>
      <mesh position={[0.05, 0.04, 0]}>
        <sphereGeometry args={[0.03, 8, 6]} />
        <meshStandardMaterial color="#a0522d" roughness={0.8} />
      </mesh>
      {/* Stripes */}
      {[-0.02, 0, 0.02].map((z, i) => (
        <mesh key={i} position={[-0.01, 0.01, z]} scale={[0.5, 0.3, 0.02]}>
          <sphereGeometry args={[0.05, 6, 4]} />
          <meshStandardMaterial color="#5d4037" roughness={0.8} />
        </mesh>
      ))}
      {/* Tail */}
      <mesh position={[-0.06, 0.02, 0]} rotation={[0, 0, 0.5]} scale={[0.8, 1.5, 0.4]}>
        <sphereGeometry args={[0.03, 8, 6]} />
        <meshStandardMaterial color="#a0522d" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCENE 3: KAYAK ON PAWTUCKAWAY LAKE (afternoon)
// ═══════════════════════════════════════════════════════════════════════════
export function KayakLakeScene({ phase: _phase }: SceneProps) {
  const kayakRef = useRef<THREE.Group>(null);
  const paddleRef = useRef<THREE.Mesh>(null);
  const ospreyRef = useRef<THREE.Group>(null);

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
  const islands = useMemo(() => {
    const rng = mulberry32(808);
    return Array.from({ length: 4 }, () => ({
      pos: [(rng() - 0.5) * 10, -0.4, -3 + (rng() - 0.5) * 4] as [number, number, number],
      scale: 0.5 + rng() * 0.5,
      seed: rng() * 100,
    }));
  }, []);

  const lilyPads = useMemo(() => {
    const rng = mulberry32(110);
    return Array.from({ length: 6 }, () => ({
      pos: [(rng() - 0.5) * 8, -0.43, -2 + (rng() - 0.5) * 5] as [number, number, number],
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (kayakRef.current) {
      kayakRef.current.position.y = -0.38 + Math.sin(t * 1.2) * 0.03;
      kayakRef.current.rotation.z = Math.sin(t * 1.2) * 0.04;
    }
    if (paddleRef.current) {
      paddleRef.current.rotation.x = Math.sin(t * 3) * 0.6;
      paddleRef.current.position.x = Math.sin(t * 3) * 0.15;
    }
    if (ospreyRef.current) {
      const cycle = (t % 10) / 10;
      if (cycle < 0.8) {
        const angle = cycle * Math.PI * 8;
        ospreyRef.current.position.x = Math.cos(angle) * 4;
        ospreyRef.current.position.y = 3 + Math.sin(cycle * Math.PI * 4) * 0.5;
        ospreyRef.current.position.z = Math.sin(angle) * 4 - 2;
      } else {
        const diveT = (cycle - 0.8) / 0.2;
        ospreyRef.current.position.x = 0;
        ospreyRef.current.position.y = 3 - diveT * 3.3;
        ospreyRef.current.position.z = -2;
      }
    }
    if (sparklesRef.current) {
      const mat = sparklesRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.4 + Math.sin(t * 4) * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.65} color="#e0f2fe" />
      <directionalLight position={[2, 6, 4]} intensity={2.2} color="#facc15" castShadow />
      <hemisphereLight args={["#7dd3fc", "#0c4a6e", 0.5]} />

      <WaterSurface position={[0, -0.48, -2]} width={20} depth={12} color="#0ea5e9" roughness={0.1} metalness={0.7} />

      {/* Atmospheric shimmer over water */}
      <AtmosphericParticles count={100} area={[16, 2, 10]} color="#ffffff" size={0.04} speed={0.15} seed={401} />

      {/* Distant pine treeline on far shore */}
      <EnhancedPineTree position={[-8, -0.5, -7]} scale={1.5} color="#0c4a6e" seed={402} />
      <EnhancedPineTree position={[-6, -0.5, -8]} scale={1.3} color="#0c4a6e" seed={403} />
      <EnhancedPineTree position={[8, -0.5, -7]} scale={1.4} color="#0c4a6e" seed={404} />
      <EnhancedPineTree position={[6, -0.5, -8]} scale={1.2} color="#0c4a6e" seed={405} />

      {/* 200 sparkle points */}
      <points ref={sparklesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkles, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#ffffff" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* Red kayak with paddle */}
      <group ref={kayakRef} position={[0, -0.38, 1]}>
        <mesh scale={[1.5, 0.15, 0.3]} castShadow>
          <capsuleGeometry args={[0.15, 1.2, 8, 12]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <torusGeometry args={[0.1, 0.03, 8, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <mesh ref={paddleRef} position={[0, 0.15, 0]}>
          <boxGeometry args={[0.8, 0.02, 0.02]} />
          <meshStandardMaterial color="#8b4513" roughness={0.8} />
        </mesh>
      </group>

      {/* 4 granite islands with pine trees */}
      {islands.map((isl, i) => (
        <group key={i} position={isl.pos} scale={isl.scale}>
          <RockFormation position={[0, 0, 0]} scale={0.8} color="#6b6b6b" seed={isl.seed} />
          <EnhancedPineTree position={[0, 0.1, 0]} scale={0.6} color="#15803d" seed={isl.seed + 50} />
        </group>
      ))}

      {/* 4 dragonflies */}
      <Dragonfly center={[-1, 0.5, 0]} phase={0} color="#3b82f6" />
      <Dragonfly center={[1, 0.8, -1]} phase={1.5} color="#22c55e" />
      <Dragonfly center={[-0.5, 0.6, 1]} phase={3} color="#3b82f6" />
      <Dragonfly center={[1.5, 0.7, 0.5]} phase={4.5} color="#22c55e" />

      {/* Painted turtle on a log */}
      <group position={[2, -0.4, -1]}>
        <mesh scale={[0.8, 0.4, 0.6]} castShadow>
          <sphereGeometry args={[0.1, 12, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        {/* Shell pattern — 3 lighter dots */}
        {[-0.03, 0, 0.03].map((x, i) => (
          <mesh key={i} position={[x, 0.03, 0]} scale={[0.3, 0.15, 0.3]}>
            <sphereGeometry args={[0.04, 6, 4]} />
            <meshStandardMaterial color="#5d4037" roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0.08, 0.02, 0]}>
          <sphereGeometry args={[0.03, 8, 6]} />
          <meshStandardMaterial color="#5d4037" roughness={0.7} />
        </mesh>
      </group>

      {/* Osprey circling */}
      <group ref={ospreyRef} position={[0, 3, -2]}>
        <Bird position={[0, 0, 0]} color="#5a4a3a" scale={0.8} flightRadius={0} flightSpeed={0} flightHeight={0} seed={99} />
      </group>

      {/* 6 lily pads */}
      {lilyPads.map((lp, i) => (
        <group key={i} position={lp.pos}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 10]} />
            <meshStandardMaterial color="#15803d" transparent opacity={0.8} roughness={0.7} />
          </mesh>
          {/* Lily flower on some pads */}
          {i % 2 === 0 && (
            <mesh position={[0, 0.03, 0]}>
              <sphereGeometry args={[0.03, 8, 6]} />
              <meshStandardMaterial color="#fef3c7" emissive="#fbbf24" emissiveIntensity={0.2} />
            </mesh>
          )}
        </group>
      ))}

      <fog attach="fog" args={["#7dd3fc", 12, 25]} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCENE 4: CLIFF OVERLOOK WITH EASEL (golden)
// ═══════════════════════════════════════════════════════════════════════════
export function CliffEaselScene({ phase: _phase }: SceneProps) {
  const jayRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (jayRef.current) {
      const hop = Math.floor(t / 3) % 5;
      const hopT = (t % 3) / 3;
      jayRef.current.position.x = 2.5 - hop * 0.5;
      jayRef.current.position.y = -0.35 + Math.abs(Math.sin(hopT * Math.PI)) * 0.15;
      jayRef.current.rotation.y = Math.sin(t * 0.5) * 0.3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} color="#ffedd5" />
      <directionalLight position={[-4, 2, 2]} intensity={2.0} color="#f97316" castShadow />
      <hemisphereLight args={["#fb923c", "#431407", 0.5]} />

      <CliffFormation position={[0, 3, -14]} color="#7c2d12" emissive="#fbbf24" emissiveIntensity={0.35} />

      <WaterSurface position={[0, -0.48, -8]} width={16} depth={6} color="#1e3a5a" roughness={0.05} metalness={0.8} />

      {/* Rock platform */}
      <mesh position={[0, -0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[6, 0.5, 4]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.95} flatShading />
      </mesh>

      {/* Artist's easel with 4 impasto blobs */}
      <ArtistEasel position={[0, -0.25, 0]} paintingColors={["#dc2626", "#facc15", "#15803d", "#3b82f6"]} />

      {/* Turpentine jar */}
      <mesh position={[0.5, -0.3, 0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.15, 8]} />
        <meshStandardMaterial color="#d4a017" transparent opacity={0.5} metalness={0.3} roughness={0.3} />
      </mesh>

      {/* Thermos */}
      <mesh position={[-0.5, -0.3, 0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
        <meshStandardMaterial color="#6b4423" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Rowboat on far shore */}
      <Rowboat position={[-3, -0.38, -5]} bobPhase={0} />

      {/* Whiskey jay */}
      <group ref={jayRef} position={[2.5, -0.35, 0.5]}>
        <mesh scale={[1, 0.8, 0.6]} castShadow>
          <sphereGeometry args={[0.08, 12, 8]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.8} />
        </mesh>
        <mesh position={[0.06, 0.06, 0]}>
          <sphereGeometry args={[0.04, 10, 6]} />
          <meshStandardMaterial color="#6b7280" roughness={0.8} />
        </mesh>
        <mesh position={[0.09, 0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.008, 0.02, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      <EnhancedPineTree position={[-3, -0.5, -1]} scale={1.2} color="#14532d" seed={60} />
      <EnhancedPineTree position={[3.5, -0.5, -1.5]} scale={1} color="#14532d" seed={61} />

      <fog attach="fog" args={["#fb923c", 10, 22]} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCENE 5: LAKE GLORIETTE CLIFF EDGE (sunset)
// ═══════════════════════════════════════════════════════════════════════════
export function SunsetCliffScene({ phase: _phase }: SceneProps) {
  const batRef = useRef<THREE.Group>(null);
  const cliffMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (batRef.current) {
      batRef.current.position.x = Math.sin(t * 0.7) * 3 + Math.cos(t * 1.3) * 1.5;
      batRef.current.position.y = 2.5 + Math.sin(t * 1.1) * 0.8;
      batRef.current.position.z = -3 + Math.cos(t * 0.9) * 1;
      batRef.current.rotation.y = t * 0.5;
    }
    if (cliffMatRef.current) {
      const cycle = (Math.sin(t * 0.1) + 1) / 2;
      const r = 0.5 + cycle * 0.4;
      const g = 0.15 + cycle * 0.15;
      cliffMatRef.current.color.setRGB(r, g, 0.1);
      cliffMatRef.current.emissive.setRGB(r * 0.3, g * 0.2, 0.05);
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} color="#fef2f2" />
      <directionalLight position={[-5, 1, 2]} intensity={2.0} color="#dc2626" castShadow />
      <hemisphereLight args={["#7f1d1d", "#450a0a", 0.4]} />
      <pointLight position={[0, 0.5, 1]} intensity={0.5} color="#f87171" />

      <CliffFormation position={[0, 3, -14]} color="#dc2626" emissive="#7f1d1d" emissiveIntensity={0.4} />

      {/* Mirror lake — deep crimson */}
      <WaterSurface position={[0, -0.48, -8]} width={16} depth={6} color="#7f1d1d" roughness={0.02} metalness={0.9} opacity={0.9} />

      {/* Ground */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[6, 0.5, 3]} />
        <meshStandardMaterial color="#450a0a" roughness={0.95} flatShading />
      </mesh>

      {/* 2 Adirondack chairs */}
      <AdirondackChair position={[-0.6, -0.25, 0.5]} rotation={[0, 0.3, 0]} />
      <AdirondackChair position={[0.6, -0.25, 0.5]} rotation={[0, -0.3, 0]} />

      {/* Champagne bucket */}
      <group position={[0, -0.35, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.2, 12]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Bottle */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.25, 8]} />
          <meshStandardMaterial color="#14532d" metalness={0.3} roughness={0.4} />
        </mesh>
        {/* Ice cubes */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[(i % 2) * 0.06 - 0.03, -0.02, Math.floor(i / 2) * 0.06 - 0.03]} scale={0.03}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#e0e7ff" transparent opacity={0.7} roughness={0.1} />
          </mesh>
        ))}
      </group>

      {/* 2 champagne glasses */}
      {[[-0.3, 0.3], [0.3, 0.3]].map((pos, i) => (
        <group key={i} position={[pos[0], -0.25, pos[1]]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.02, 0.12, 8]} />
            <meshStandardMaterial color="#fde047" transparent opacity={0.4} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <coneGeometry args={[0.04, 0.06, 8]} />
            <meshStandardMaterial color="#fde047" transparent opacity={0.3} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Finished painting on second easel */}
      <ArtistEasel position={[2, -0.25, -0.5]} paintingColors={["#9a3412", "#dc2626", "#fbbf24", "#7f1d1d"]} />

      {/* Bat */}
      <group ref={batRef} position={[0, 2.5, -3]}>
        <mesh scale={[1, 0.2, 0.3]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Wings — animated */}
        <mesh position={[0, 0, 0.05]} scale={[0.5, 0.05, 0.4]}>
          <sphereGeometry args={[0.06, 6, 4]} />
          <meshStandardMaterial color="#1a1a1a" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, -0.05]} scale={[0.5, 0.05, 0.4]}>
          <sphereGeometry args={[0.06, 6, 4]} />
          <meshStandardMaterial color="#1a1a1a" side={THREE.DoubleSide} />
        </mesh>
      </group>

      <EnhancedPineTree position={[-4, -0.5, -1]} scale={1.4} color="#450a0a" seed={70} />
      <EnhancedPineTree position={[4, -0.5, -1]} scale={1.2} color="#450a0a" seed={71} />

      <fog attach="fog" args={["#7f1d1d", 8, 20]} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCENE 6: TWILIGHT FOREST PATH (dusk)
// ═══════════════════════════════════════════════════════════════════════════
export function TwilightPathScene({ phase: _phase }: SceneProps) {
  const owlRef = useRef<THREE.Group>(null);
  const fireflyRef = useRef<THREE.Points>(null);

  const fireflyPositions = useMemo(() => {
    const rng = mulberry32(121);
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (rng() - 0.5) * 10;
      positions[i * 3 + 1] = rng() * 2;
      positions[i * 3 + 2] = (rng() - 0.5) * 8;
    }
    return positions;
  }, []);

  const pines = useMemo(() => {
    const rng = mulberry32(131);
    return Array.from({ length: 8 }, (_, i) => ({
      pos: [
        Math.cos((i / 8) * Math.PI * 2) * (4 + rng() * 3),
        -0.5,
        Math.sin((i / 8) * Math.PI * 2) * (3 + rng() * 3),
      ] as [number, number, number],
      scale: 1 + rng() * 0.5,
      seed: i + 80,
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
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
    if (owlRef.current) {
      owlRef.current.rotation.y = Math.sin(t * 0.3) * 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} color="#6d28d9" />
      <directionalLight position={[0, 3, 5]} intensity={0.3} color="#a78bfa" />
      <hemisphereLight args={["#4c1d95", "#0f0a2e", 0.3]} />

      {/* 200 fireflies */}
      <points ref={fireflyRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[fireflyPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#fde047" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* Fallen log with 4 glowing mushrooms */}
      <group position={[1, -0.4, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 0.3, 0.3]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 1.5, 10]} />
          <meshStandardMaterial color="#3d2817" roughness={1} />
        </mesh>
        {/* Bark texture */}
        <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 0.31, 0.31]}>
          <cylinderGeometry args={[0.15, 0.15, 1.5, 10, 1, true]} />
          <meshStandardMaterial color="#2a1810" roughness={1} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        {/* 4 glowing mushrooms */}
        {[0, 0.3, 0.6, 0.9].map((x, i) => (
          <GlowingMushroom key={i} position={[x - 0.4, 0.12, 0]} scale={1} />
        ))}
      </group>

      {/* Barred owl with glowing yellow eyes */}
      <group ref={owlRef} position={[-2, 2, -3]}>
        <mesh scale={[0.8, 1, 0.7]} castShadow>
          <sphereGeometry args={[0.15, 16, 12]} />
          <meshStandardMaterial color="#2e1065" roughness={0.8} />
        </mesh>
        {/* Wing texture */}
        <mesh position={[0, 0, 0.08]} scale={[0.7, 0.8, 0.5]}>
          <sphereGeometry args={[0.12, 12, 8]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.8} />
        </mesh>
        {/* Eyes — glowing */}
        <mesh position={[0.08, 0.05, 0.1]}>
          <sphereGeometry args={[0.025, 10, 8]} />
          <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-0.08, 0.05, 0.1]}>
          <sphereGeometry args={[0.025, 10, 8]} />
          <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.8} />
        </mesh>
        {/* Pupils */}
        <mesh position={[0.08, 0.05, 0.12]}>
          <sphereGeometry args={[0.01, 6, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.08, 0.05, 0.12]}>
          <sphereGeometry args={[0.01, 6, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Beak */}
        <mesh position={[0, 0.02, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.015, 0.03, 5]} />
          <meshStandardMaterial color="#d4a017" />
        </mesh>
        {/* Ear tufts */}
        <mesh position={[0.08, 0.15, 0]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.02, 0.05, 5]} />
          <meshStandardMaterial color="#2e1065" roughness={0.8} />
        </mesh>
        <mesh position={[-0.08, 0.15, 0]} rotation={[-0.3, 0, 0]}>
          <coneGeometry args={[0.02, 0.05, 5]} />
          <meshStandardMaterial color="#2e1065" roughness={0.8} />
        </mesh>
      </group>

      {/* 8 pine silhouettes */}
      {pines.map((p, i) => (
        <EnhancedPineTree key={i} position={p.pos} scale={p.scale} color="#0f0a2e" seed={p.seed} />
      ))}

      {/* Lichen patches */}
      {pines.slice(0, 4).map((p, i) => (
        <mesh key={i} position={[p.pos[0], 0, p.pos[2]]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshStandardMaterial color="#a78bfa" emissive="#6d28d9" emissiveIntensity={0.3} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* 6 closed ferns */}
      {[[-1, -1], [1, -2], [-2, 1], [2, 1], [0, -3], [-3, 0]].map((p, i) => (
        <mesh key={i} position={[p[0], -0.4, p[1]]} scale={[0.3, 0.5, 0.3]}>
          <coneGeometry args={[0.08, 0.25, 6]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.8} />
        </mesh>
      ))}

      <fog attach="fog" args={["#4c1d95", 6, 16]} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCENE 7: COLEMAN CABIN CAMPFIRE (midnight)
// ═══════════════════════════════════════════════════════════════════════════
export function CabinCampfireScene({ phase: _phase }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.15} color="#1e1b4b" />
      <directionalLight position={[0, 5, 2]} intensity={0.2} color="#a5b4fc" />
      <hemisphereLight args={["#0f0a2e", "#020617", 0.2]} />

      {/* Detailed crescent moon with craters and glow */}
      <DetailedMoon position={[-5, 6, -10]} radius={0.8} crescent />

      {/* 400 stars */}
      <Stars radius={30} depth={20} count={400} factor={4} saturation={0} fade speed={1} />

      {/* 15 fireflies near firelight */}
      <Sparkles count={15} scale={[3, 2, 3]} size={3} speed={0.3} color="#fde047" position={[2, 1, 1]} />

      {/* Atmospheric embers drifting in the night air */}
      <AtmosphericParticles count={40} area={[8, 3, 6]} color="#f97316" size={0.02} speed={0.1} seed={701} />

      {/* Detailed cabin */}
      <DetailedCabin position={[-4, -0.5, -5]} />

      {/* Detailed campfire */}
      <DetailedCampfire position={[2, -0.45, 1]} />

      {/* Textured ground */}
      <TexturedGround position={[0, -0.5, 0]} width={16} depth={12} color="#1a1410" seed={702} />

      {/* 5 pine trees surrounding the scene */}
      <EnhancedPineTree position={[3, -0.5, -2]} scale={1.5} color="#020617" seed={90} />
      <EnhancedPineTree position={[-3, -0.5, -2]} scale={1.3} color="#020617" seed={91} />
      <EnhancedPineTree position={[4, -0.5, -4]} scale={1.2} color="#020617" seed={92} />
      <EnhancedPineTree position={[-5, -0.5, -3]} scale={1.4} color="#020617" seed={93} />
      <EnhancedPineTree position={[0, -0.5, -6]} scale={1.6} color="#020617" seed={94} />

      <fog attach="fog" args={["#0f0a2e", 5, 15]} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCENE 8: LITTLE DIAMOND POND DOCK (stargazing)
// ═══════════════════════════════════════════════════════════════════════════
export function StargazingDockScene({ phase: _phase }: SceneProps) {
  const meteorRef = useRef<THREE.Mesh>(null);
  const meteorTimeRef = useRef(0);

  const stars = useMemo(() => {
    const rng = mulberry32(151);
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
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
      <ambientLight intensity={0.1} color="#0f0a2e" />
      <hemisphereLight args={["#020617", "#0f0a2e", 0.15]} />

      {/* Subtle moon glow on the horizon (not full moon — stargazing is dark) */}
      <DetailedMoon position={[6, 4, -15]} radius={0.4} crescent={false} />

      {/* 1000 Milky Way stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stars, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.15} color="#fff8e0" transparent opacity={0.8} depthWrite={false} />
      </points>

      {/* Atmospheric dust motes drifting in starlight */}
      <AtmosphericParticles count={30} area={[12, 3, 8]} color="#c4b5fd" size={0.015} speed={0.05} seed={801} />

      {/* Meteor streak */}
      <mesh ref={meteorRef} position={[-10, 8, -15]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[2, 0.05, 0.05]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Mirror pond */}
      <WaterSurface position={[0, -0.48, -3]} width={14} depth={8} color="#0f0a2e" roughness={0.02} metalness={0.5} />

      {/* Wooden dock */}
      <group position={[0, -0.4, 1]}>
        {/* 4 planks */}
        {[-0.15, -0.05, 0.05, 0.15].map((z, i) => (
          <mesh key={i} position={[0, 0, z]} castShadow>
            <boxGeometry args={[1.2, 0.02, 0.08]} />
            <meshStandardMaterial color="#5d4037" roughness={0.8} />
          </mesh>
        ))}
        {/* 4 corner posts */}
        {[[-0.55, -0.2], [0.55, -0.2], [-0.55, 0.2], [0.55, 0.2]].map((p, i) => (
          <mesh key={i} position={[p[0], 0.15, p[1]]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
            <meshStandardMaterial color="#3d2817" roughness={0.8} />
          </mesh>
        ))}
      </group>

      <EnhancedPineTree position={[-5, -0.5, -4]} scale={1.5} color="#020617" seed={100} />
      <EnhancedPineTree position={[5, -0.5, -4]} scale={1.3} color="#020617" seed={101} />
      <EnhancedPineTree position={[-3, -0.5, -5]} scale={1.2} color="#020617" seed={102} />
      <EnhancedPineTree position={[3, -0.5, -5]} scale={1.4} color="#020617" seed={103} />

      <Sparkles count={8} scale={[6, 1, 4]} size={2} speed={0.1} color="#fde047" position={[0, 0, 0]} />

      <fog attach="fog" args={["#020617", 8, 20]} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCENE 9: WILDFLOWER MEADOW (heart)
// ═══════════════════════════════════════════════════════════════════════════
export function WildflowerMeadowScene({ phase: _phase }: SceneProps) {
  const flowers = useMemo(() => {
    const rng = mulberry32(161);
    const colors = ["#ec4899", "#facc15", "#a78bfa", "#f43f5e", "#fde047", "#dc2626", "#8b5cf6"];
    return Array.from({ length: 18 }, (_, i) => ({
      pos: [(rng() - 0.5) * 8, -0.4, (rng() - 0.5) * 6] as [number, number, number],
      color: colors[i % 7],
      delay: rng() * Math.PI * 2,
      scale: 0.8 + rng() * 0.4,
    }));
  }, []);

  const grassTufts = useMemo(() => {
    const rng = mulberry32(171);
    return Array.from({ length: 12 }, () => ({
      pos: [(rng() - 0.5) * 10, -0.48, (rng() - 0.5) * 8] as [number, number, number],
      delay: rng() * Math.PI * 2,
    }));
  }, []);

  return (
    <>
      <ambientLight intensity={0.55} color="#fce7f3" />
      <directionalLight position={[2, 5, 3]} intensity={2.0} color="#fbbf24" castShadow />
      <hemisphereLight args={["#ec4899", "#14532d", 0.5]} />

      {/* Textured meadow ground */}
      <TexturedGround position={[0, -0.5, 0]} width={16} depth={12} color="#22c55e" seed={1001} />

      {/* Grass field — 200 instanced blades for lush meadow */}
      <GrassField count={200} area={12} seed={1002} color="#4a7c2a" />

      {/* Atmospheric butterflies and pollen */}
      <AtmosphericParticles count={40} area={[10, 2, 8]} color="#f472b6" size={0.04} speed={0.4} seed={1003} />

      {/* Red picnic blanket */}
      <mesh position={[0, -0.47, 1]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <planeGeometry args={[1.5, 1.2]} />
        <meshStandardMaterial color="#dc2626" roughness={0.8} />
      </mesh>
      {/* Blanket pattern — checker squares */}
      {[-0.3, 0, 0.3].map((x, i) =>
        [-0.2, 0.1, 0.4].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, -0.46, 1 + z]} rotation={[-Math.PI / 2, 0, 0.1]}>
            <planeGeometry args={[0.2, 0.15]} />
            <meshStandardMaterial color={(i + j) % 2 === 0 ? "#fef3c7" : "#dc2626"} transparent opacity={0.7} />
          </mesh>
        ))
      )}

      {/* 18 detailed flowers */}
      {flowers.map((f, i) => (
        <DetailedFlower key={i} position={f.pos} color={f.color} delay={f.delay} scale={f.scale} />
      ))}

      {/* 12 grass tufts */}
      {grassTufts.map((g, i) => (
        <GrassTuft key={i} position={g.pos} delay={g.delay} />
      ))}

      {/* 3 honeybees */}
      <Honeybee center={[-1, 0.3, 0]} phase={0} />
      <Honeybee center={[1, 0.5, -1]} phase={2} />
      <Honeybee center={[0, 0.4, 1]} phase={4} />

      <EnhancedPineTree position={[-5, -0.5, -4]} scale={1.3} color="#15803d" seed={110} />
      <EnhancedPineTree position={[5, -0.5, -4]} scale={1.1} color="#15803d" seed={111} />
      <EnhancedPineTree position={[-4, -0.5, -5]} scale={1.2} color="#15803d" seed={112} />
      <EnhancedPineTree position={[4, -0.5, -5]} scale={1} color="#15803d" seed={113} />

      <Sparkles count={12} scale={[6, 2, 4]} size={4} speed={0.4} color="#f472b6" position={[0, 0.5, 0]} />

      <fog attach="fog" args={["#fce7f3", 10, 22]} />
    </>
  );
}

function GrassTuft({ position, delay }: { position: [number, number, number]; delay: number }) {
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
          <coneGeometry args={[0.015, 0.2, 5]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Honeybee({ center, phase }: { center: [number, number, number]; phase: number }) {
  const ref = useRef<THREE.Group>(null);
  const wingRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime + phase;
    if (ref.current) {
      ref.current.position.x = center[0] + Math.sin(t * 1.2) * 0.6;
      ref.current.position.y = center[1] + Math.sin(t * 2) * 0.2;
      ref.current.position.z = center[2] + Math.cos(t * 1.5) * 0.5;
      ref.current.rotation.y = t * 2;
    }
    if (wingRef.current) {
      wingRef.current.rotation.y = Math.sin(t * 30) * 0.5;
    }
  });
  return (
    <group ref={ref} position={center}>
      <mesh scale={[0.3, 0.08, 0.08]} castShadow>
        <capsuleGeometry args={[0.03, 0.06, 4, 8]} />
        <meshStandardMaterial color="#fde047" roughness={0.4} />
      </mesh>
      {/* Black stripes */}
      {[-0.01, 0.01, 0.03].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} scale={[0.08, 0.07, 0.07]}>
          <sphereGeometry args={[0.015, 6, 4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
      ))}
      <mesh ref={wingRef} position={[0, 0.03, 0]}>
        <planeGeometry args={[0.06, 0.03]} />
        <meshStandardMaterial color="#e0e0e0" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCENE 10: RING CLOSEUP (ring) — NEW
//  A magical close-up of the engagement ring on velvet, with light prisms
// ═══════════════════════════════════════════════════════════════════════════
export function RingCloseupScene({ phase: _phase }: SceneProps) {
  const diamondRef = useRef<THREE.Mesh>(null);
  const prismRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Diamond gently rotates and bobs
    if (diamondRef.current) {
      diamondRef.current.rotation.y = t * 0.5;
      diamondRef.current.position.y = 0.4 + Math.sin(t * 0.8) * 0.05;
    }
    // Light prisms rotate around the diamond
    if (prismRef.current) {
      prismRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <>
      {/* Dramatic dark lighting with spotlight from above */}
      <ambientLight intensity={0.15} color="#1a1410" />
      <spotLight position={[0, 5, 0.5]} angle={0.4} penumbra={0.5} intensity={3} color="#fde047" castShadow />
      <pointLight position={[2, 1, 2]} intensity={1} color="#ec4899" />
      <pointLight position={[-2, 1, 2]} intensity={1} color="#3b82f6" />

      {/* Velvet ground */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#2a0a0a" roughness={0.95} />
      </mesh>

      {/* Velvet cushion */}
      <mesh position={[0, -0.42, 0]} scale={[1.2, 0.15, 1.2]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.85} />
      </mesh>
      {/* Cushion tufting — button in center */}
      <mesh position={[0, -0.34, 0]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <meshStandardMaterial color="#5d1010" roughness={0.8} />
      </mesh>

      {/* Ring band — TorusGeometry with 24 segments, gold */}
      <mesh position={[0, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.15, 0.018, 16, 32]} />
        <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.15} emissive="#8a6408" emissiveIntensity={0.1} />
      </mesh>

      {/* Diamond — OctahedronGeometry with facets, glass-like */}
      <mesh ref={diamondRef} position={[0, 0.4, 0]} castShadow>
        <octahedronGeometry args={[0.12, 0]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.1}
          roughness={0.0}
          transmission={0.9}
          thickness={0.5}
          ior={2.4}
          emissive="#e0e7ff"
          emissiveIntensity={0.3}
          flatShading
        />
      </mesh>

      {/* Diamond prongs — 4 small gold claws */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.08, -0.18, Math.sin(angle) * 0.08]} scale={[0.5, 1, 0.5]}>
            <coneGeometry args={[0.015, 0.06, 5]} />
            <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.15} />
          </mesh>
        );
      })}

      {/* 7 light prisms refracting through diamond */}
      <group ref={prismRef} position={[0, 0.4, 0]}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const colors = ["#ef4444", "#f97316", "#fbbf24", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
          const angle = (i / 7) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5]} rotation={[0, -angle, Math.PI / 2]}>
              <coneGeometry args={[0.05, 1, 5]} />
              <meshBasicMaterial color={colors[i]} transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          );
        })}
      </group>

      {/* Floating sparkle particles */}
      <Sparkles count={50} scale={[3, 2, 3]} size={4} speed={0.4} color="#fde047" position={[0, 0.5, 0]} />
      <Sparkles count={20} scale={[2, 1, 2]} size={2} speed={0.6} color="#e0e7ff" position={[0, 0.4, 0]} />

      {/* Halo glow under diamond */}
      <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 20]} />
        <meshBasicMaterial color="#fde047" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <fog attach="fog" args={["#1a1410", 4, 12]} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCENE 11: PROPOSAL MOMENT (proposal) — NEW
//  Kneeling figure at cliff edge with open ring box, rose petals, sunset
// ═══════════════════════════════════════════════════════════════════════════
export function ProposalMomentScene({ phase: _phase }: SceneProps) {
  const petalsRef = useRef<THREE.Points>(null);

  const petalPositions = useMemo(() => {
    const rng = mulberry32(999);
    const positions = new Float32Array(30 * 3);
    for (let i = 0; i < 30; i++) {
      positions[i * 3] = (rng() - 0.5) * 5;
      positions[i * 3 + 1] = rng() * 3;
      positions[i * 3 + 2] = (rng() - 0.5) * 4;
    }
    return positions;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (petalsRef.current) {
      const positions = petalsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 30; i++) {
        positions[i * 3 + 1] -= 0.008;
        positions[i * 3] += Math.sin(t + i) * 0.003;
        if (positions[i * 3 + 1] < -0.4) {
          positions[i * 3 + 1] = 3;
          positions[i * 3] = (Math.random() - 0.5) * 5;
        }
      }
      petalsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} color="#fef3c7" />
      <directionalLight position={[-5, 2, 2]} intensity={2.2} color="#f97316" castShadow />
      <hemisphereLight args={["#fb923c", "#450a0a", 0.5]} />
      <pointLight position={[0, 0.3, 0.5]} intensity={0.8} color="#fde047" />

      <CliffFormation position={[0, 3, -14]} color="#7c2d12" emissive="#fbbf24" emissiveIntensity={0.4} />

      <WaterSurface position={[0, -0.48, -8]} width={16} depth={6} color="#1e3a5a" roughness={0.05} metalness={0.8} />

      {/* Cliff edge ground */}
      <mesh position={[0, -0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[6, 0.5, 3]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.95} flatShading />
      </mesh>

      {/* Kneeling figure silhouette */}
      <group position={[-0.3, -0.25, 0]}>
        {/* Body — kneeling torso, leaning slightly forward */}
        <mesh position={[0, 0.25, 0]} rotation={[0.2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.2, 6, 10]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.42, 0.05]}>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        {/* Arm extended forward (holding ring box) */}
        <mesh position={[0.12, 0.22, 0.08]} rotation={[1.2, 0, 0.3]}>
          <capsuleGeometry args={[0.025, 0.12, 4, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        {/* Legs — kneeling */}
        <mesh position={[-0.02, 0.05, 0]} rotation={[-0.3, 0, 0]}>
          <capsuleGeometry args={[0.04, 0.12, 4, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <mesh position={[0.04, 0.05, -0.05]} rotation={[0.5, 0, 0.1]}>
          <capsuleGeometry args={[0.04, 0.12, 4, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      </group>

      {/* Open ring box in front of figure */}
      <group position={[0.2, -0.4, 0.3]}>
        {/* Box base */}
        <mesh castShadow>
          <boxGeometry args={[0.15, 0.06, 0.12]} />
          <meshStandardMaterial color="#2a0a0a" roughness={0.8} />
        </mesh>
        {/* Box lid — open, hinged back */}
        <mesh position={[-0.07, 0.02, 0]} rotation={[0, 0, -1.2]}>
          <boxGeometry args={[0.15, 0.02, 0.12]} />
          <meshStandardMaterial color="#2a0a0a" roughness={0.8} />
        </mesh>
        {/* Velvet interior */}
        <mesh position={[0, 0.035, 0]}>
          <boxGeometry args={[0.12, 0.01, 0.1]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.85} />
        </mesh>
        {/* Ring inside box */}
        <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.03, 0.005, 8, 16]} />
          <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.15} emissive="#fde047" emissiveIntensity={0.3} />
        </mesh>
        {/* Diamond on ring */}
        <mesh position={[0, 0.08, 0]}>
          <octahedronGeometry args={[0.015, 0]} />
          <meshPhysicalMaterial color="#ffffff" metalness={0.1} roughness={0} transmission={0.9} emissive="#e0e7ff" emissiveIntensity={0.5} flatShading />
        </mesh>
        {/* Glow from box */}
        <pointLight position={[0, 0.15, 0]} intensity={1} distance={1} color="#fde047" />
      </group>

      {/* 30 falling rose petals */}
      <points ref={petalsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[petalPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#ec4899" transparent opacity={0.7} depthWrite={false} />
      </points>

      {/* Heart-shaped glow aura around the scene */}
      <mesh position={[0, 1, 0]} scale={[2, 1.5, 1]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Two champagne glasses on the ground */}
      {[[-1, 0.5], [1, 0.5]].map((pos, i) => (
        <group key={i} position={[pos[0], -0.45, pos[1]]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.02, 0.1, 8]} />
            <meshStandardMaterial color="#fde047" transparent opacity={0.4} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <coneGeometry args={[0.035, 0.05, 8]} />
            <meshStandardMaterial color="#fde047" transparent opacity={0.3} roughness={0.1} />
          </mesh>
        </group>
      ))}

      <EnhancedPineTree position={[-4, -0.5, -1]} scale={1.3} color="#450a0a" seed={120} />
      <EnhancedPineTree position={[4, -0.5, -1]} scale={1.1} color="#450a0a" seed={121} />

      <fog attach="fog" args={["#fb923c", 8, 20]} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCENE 12: ANNIVERSARY (anniversary) — NEW
//  Two intertwined trees, heart glow, eternal flame, starlit sky
// ═══════════════════════════════════════════════════════════════════════════
export function AnniversaryScene({ phase: _phase }: SceneProps) {
  const heartRef = useRef<THREE.Mesh>(null);
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Heart pulses
    if (heartRef.current) {
      const pulse = 1 + Math.sin(t * 1.5) * 0.08;
      heartRef.current.scale.set(pulse, pulse, pulse);
      const mat = heartRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 + Math.sin(t * 1.5) * 0.1;
    }
    // Eternal flame flickers
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(t * 8) * 0.2;
    }
  });

  // Heart constellation stars
  const heartStars = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i < 30; i++) {
      const t = (i / 30) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      points.push(x * 0.15, y * 0.15 + 4, -12 + (Math.random() - 0.5) * 0.5);
    }
    return new Float32Array(points);
  }, []);

  // Heart shape geometry (created programmatically)
  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.3);
    shape.bezierCurveTo(0, 0.6, -0.3, 0.9, -0.6, 0.9);
    shape.bezierCurveTo(-1.1, 0.9, -1.1, 0.3, -1.1, 0.3);
    shape.bezierCurveTo(-1.1, -0.1, -0.6, -0.3, 0, -0.7);
    shape.bezierCurveTo(0.6, -0.3, 1.1, -0.1, 1.1, 0.3);
    shape.bezierCurveTo(1.1, 0.3, 1.1, 0.9, 0.6, 0.9);
    shape.bezierCurveTo(0.3, 0.9, 0, 0.6, 0, 0.3);
    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <>
      <ambientLight intensity={0.2} color="#4c1d95" />
      <directionalLight position={[0, 3, 5]} intensity={0.4} color="#a78bfa" />
      <hemisphereLight args={["#4c1d95", "#0f0a2e", 0.3]} />
      <pointLight position={[0, 0.5, 0]} intensity={2} distance={3} color="#ec4899" />
      <pointLight position={[0, 1, 0]} intensity={1} distance={2} color="#fde047" />

      {/* 500 stars */}
      <Stars radius={30} depth={20} count={500} factor={4} saturation={0} fade speed={1} />

      {/* Heart constellation */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[heartStars, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.2} color="#f472b6" transparent opacity={0.9} />
      </points>

      {/* Two intertwined pine trees forming a natural arch */}
      <group position={[0, -0.5, -2]}>
        <EnhancedPineTree position={[-0.4, 0, 0]} scale={1.5} color="#2d4a2d" seed={130} />
        <EnhancedPineTree position={[0.4, 0, 0]} scale={1.5} color="#2d4a2d" seed={131} />
      </group>

      {/* Glowing heart shape between trees */}
      <mesh ref={heartRef} position={[0, 1.5, -2]} scale={0.3}>
        <primitive object={heartGeometry} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Eternal flame on a small altar */}
      <group position={[0, -0.4, 0]}>
        {/* Altar — stone base */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.25, 0.15, 12]} />
          <meshStandardMaterial color="#4a3a2a" roughness={0.95} flatShading />
        </mesh>
        {/* Flame */}
        <mesh ref={flameRef} position={[0, 0.2, 0]}>
          <coneGeometry args={[0.06, 0.2, 8, 3]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <coneGeometry args={[0.04, 0.15, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* Mirror lake */}
      <WaterSurface position={[0, -0.48, -6]} width={14} depth={5} color="#1e1b4b" roughness={0.02} metalness={0.7} />

      {/* Two Adirondack chairs side by side */}
      <AdirondackChair position={[-0.5, -0.25, 1]} rotation={[0, 0.15, 0]} />
      <AdirondackChair position={[0.5, -0.25, 1]} rotation={[0, -0.15, 0]} />

      {/* Fireflies forming gentle patterns */}
      <Sparkles count={40} scale={[5, 3, 4]} size={3} speed={0.3} color="#fde047" position={[0, 1, 0]} />
      <Sparkles count={20} scale={[3, 2, 3]} size={2} speed={0.4} color="#ec4899" position={[0, 1.5, -1]} />

      <fog attach="fog" args={["#4c1d95", 6, 18]} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCENE REGISTRY — maps all 12 icon themes to dedicated scenes
// ═══════════════════════════════════════════════════════════════════════════
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
    case "ring": return RingCloseupScene;
    case "proposal": return ProposalMomentScene;
    case "anniversary": return AnniversaryScene;
    default: return SunsetCliffScene;
  }
}
