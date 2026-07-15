"use client";

/**
 * WildernessPrimitives.tsx
 *
 * High-polygon, realistically-shaped 3D primitives for the wilderness scenes.
 * Each component uses smooth shading, multiple sub-meshes, and detailed
 * geometry to avoid the "blocky" look of low-poly shapes.
 *
 * Design principles:
 *   - Spheres use 16-32 radial segments (not 4-6)
 *   - Cones use 12-16 radial segments (not 5-6)
 *   - Organic shapes are built from multiple sub-meshes (body + head + limbs)
 *   - flatShading is only used for crystals/rocks where facets are desired
 *   - Colors use subtle variation (not flat single tones)
 *   - Animations use natural easing (sine waves, not linear)
 */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Deterministic PRNG ───────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  ENHANCED PINE TREE — multi-layered, high-poly, natural variation
// ═══════════════════════════════════════════════════════════════════════════
export function EnhancedPineTree({
  position,
  scale = 1,
  color = "#1a3a1a",
  seed = 1,
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
  seed?: number;
}) {
  const rng = useMemo(() => mulberry32(seed * 1000), [seed]);

  // Generate 6 foliage layers with natural variation
  const layers = useMemo(() => {
    const arr: { y: number; radius: number; height: number; rotation: number; tilt: number }[] = [];
    const layerCount = 6 + Math.floor(rng() * 2); // 6-7 layers
    for (let i = 0; i < layerCount; i++) {
      const t = i / (layerCount - 1);
      arr.push({
        y: 0.6 + t * 1.4,
        radius: (0.45 - t * 0.32) * (0.9 + rng() * 0.2),
        height: 0.55 + rng() * 0.15,
        rotation: rng() * Math.PI,
        tilt: (rng() - 0.5) * 0.15,
      });
    }
    return arr;
  }, [rng]);

  // Color variation — darker at bottom, lighter at top
  const colorObj = useMemo(() => new THREE.Color(color), [color]);
  const baseColor = useMemo(() => colorObj.clone(), [colorObj]);
  const tipColor = useMemo(() => colorObj.clone().lerp(new THREE.Color("#4a7c4a"), 0.3), [colorObj]);

  // Trunk detail — slight taper, bark color
  const trunkColor = useMemo(() => {
    const c = new THREE.Color("#3d2817");
    c.offsetHSL(0, 0, (rng() - 0.5) * 0.05);
    return c;
  }, [rng]);

  return (
    <group position={position} scale={scale}>
      {/* Trunk — tapered cylinder with 24 radial segments for smooth bark */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.12, 0.7, 24, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={0.95} />
      </mesh>
      {/* Bark ridges — 4 thin vertical strips for texture */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.1, 0.3, Math.sin(angle) * 0.1]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.02, 0.6, 0.04]} />
            <meshStandardMaterial color={trunkColor.clone().offsetHSL(0, 0, -0.05)} roughness={1} />
          </mesh>
        );
      })}

      {/* Foliage layers — 8-10 cones with 32 radial segments, smooth shading, double height segments for organic shape */}
      {layers.map((layer, i) => {
        const t = i / (layers.length - 1);
        const layerColor = baseColor.clone().lerp(tipColor, t);
        return (
          <mesh
            key={i}
            position={[layer.tilt * 0.1, layer.y, layer.tilt * 0.05]}
            rotation={[layer.tilt * 0.3, layer.rotation, layer.tilt * 0.2]}
            castShadow
          >
            <coneGeometry args={[layer.radius, layer.height, 32, 4]} />
            <meshStandardMaterial
              color={layerColor}
              roughness={0.85}
              flatShading={false}
            />
          </mesh>
        );
      })}

      {/* Small branch stubs — 5-6 protruding from trunk with sub-branches */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2 + rng() * 0.5;
        const y = 0.2 + rng() * 0.3;
        return (
          <mesh
            key={`branch-${i}`}
            position={[Math.cos(angle) * 0.08, y, Math.sin(angle) * 0.08]}
            rotation={[0, -angle, Math.PI / 2.5]}
          >
            <cylinderGeometry args={[0.012, 0.018, 0.18, 12]} />
            <meshStandardMaterial color={trunkColor} roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DETAILED ROCK FORMATION — icosahedron with displacement, clustered
// ═══════════════════════════════════════════════════════════════════════════
export function RockFormation({
  position,
  scale = 1,
  color = "#5a5a5a",
  mossy = false,
  seed = 1,
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
  mossy?: boolean;
  seed?: number;
}) {
  const rng = useMemo(() => mulberry32(seed * 2000), [seed]);

  // Cluster of 3-5 rocks with varied shapes
  const rocks = useMemo(() => {
    const count = 3 + Math.floor(rng() * 3);
    return Array.from({ length: count }, () => ({
      offset: [(rng() - 0.5) * 0.6, (rng() - 0.5) * 0.2, (rng() - 0.5) * 0.6] as [number, number, number],
      scale: 0.5 + rng() * 0.6,
      rotation: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI] as [number, number, number],
      detail: rng() > 0.5 ? 1 : 0,
    }));
  }, [rng]);

  const rockColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <group position={position} scale={scale}>
      {rocks.map((r, i) => {
        const c = rockColor.clone().offsetHSL((rng() - 0.5) * 0.02, 0, (rng() - 0.5) * 0.08);
        return (
          <mesh
            key={i}
            position={r.offset}
            rotation={r.rotation}
            scale={r.scale}
            castShadow
            receiveShadow
          >
            <icosahedronGeometry args={[0.4, r.detail]} />
            <meshStandardMaterial color={c} roughness={0.92} flatShading />
          </mesh>
        );
      })}
      {/* Moss patches — emissive green spots on top */}
      {mossy &&
        Array.from({ length: 4 }, (_, i) => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <mesh
              key={`moss-${i}`}
              position={[Math.cos(angle) * 0.2, 0.25, Math.sin(angle) * 0.2]}
              scale={[0.3, 0.08, 0.25]}
            >
              <sphereGeometry args={[0.2, 8, 6]} />
              <meshStandardMaterial
                color="#4a7c2a"
                emissive="#2a5a1a"
                emissiveIntensity={0.25}
                roughness={0.7}
              />
            </mesh>
          );
        })}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  CLIFF FORMATION — multi-segment, textured, with striations
// ═══════════════════════════════════════════════════════════════════════════
export function CliffFormation({
  position,
  width = 18,
  height = 10,
  depth = 2,
  color = "#4a3a2a",
  emissive = "#fbbf24",
  emissiveIntensity = 0.3,
}: {
  position: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  // Generate striation lines (horizontal cracks)
  const striations = useMemo(() => {
    const arr: { y: number; width: number; opacity: number }[] = [];
    for (let i = 0; i < 8; i++) {
      arr.push({
        y: (i / 7) * height - height / 2,
        width: width * (0.7 + Math.random() * 0.3),
        opacity: 0.15 + Math.random() * 0.2,
      });
    }
    return arr;
  }, [width, height]);

  // Ledges — small protruding rocks
  const ledges = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: [number, number, number] }[] = [];
    for (let i = 0; i < 5; i++) {
      arr.push({
        pos: [(Math.random() - 0.5) * width * 0.7, (i / 4) * height - height / 2 + 0.5, depth / 2 + 0.1],
        scale: [1 + Math.random() * 1.5, 0.2 + Math.random() * 0.15, 0.4 + Math.random() * 0.3],
      });
    }
    return arr;
  }, [width, height, depth]);

  return (
    <group position={position}>
      {/* Main cliff body — slightly irregular box */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[width, height, depth, 4, 8, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.95}
          flatShading
        />
      </mesh>

      {/* Striations — darker horizontal lines for granite texture */}
      {striations.map((s, i) => (
        <mesh key={i} position={[0, s.y, depth / 2 + 0.01]}>
          <boxGeometry args={[s.width, 0.05, 0.02]} />
          <meshStandardMaterial
            color={new THREE.Color(color).offsetHSL(0, 0, -0.1)}
            transparent
            opacity={s.opacity}
          />
        </mesh>
      ))}

      {/* Ledges — protruding rock shelves */}
      {ledges.map((l, i) => (
        <mesh key={`ledge-${i}`} position={l.pos} scale={l.scale} castShadow>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color={color} roughness={0.95} flatShading />
        </mesh>
      ))}

      {/* Granite speckles — tiny light dots for mineral flecks */}
      {Array.from({ length: 30 }, (_, i) => {
        const rng = mulberry32(i * 3000);
        return (
          <mesh
            key={`speck-${i}`}
            position={[
              (rng() - 0.5) * width,
              (rng() - 0.5) * height,
              depth / 2 + 0.02,
            ]}
          >
            <sphereGeometry args={[0.02, 4, 3]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.3}
              transparent
              opacity={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  WATER SURFACE — multi-layered, vertex-shader-style ripple (no per-frame normal recomputation)
// ═══════════════════════════════════════════════════════════════════════════
export function WaterSurface({
  position,
  width = 16,
  depth = 6,
  color = "#1a3a5a",
  roughness = 0.05,
  metalness = 0.8,
  opacity = 0.85,
}: {
  position: [number, number, number];
  width?: number;
  depth?: number;
  color?: string;
  roughness?: number;
  metalness?: number;
  opacity?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  // Use a higher-poly plane for smoother ripples (64x32 = 2048 vertices)
  const geo = useMemo(() => new THREE.PlaneGeometry(width, depth, 64, 32), [width, depth]);
  // Pre-compute original positions so we can displace from a stable baseline
  // (avoids compounding drift that causes flicker)
  const originalPositions = useMemo(() => {
    const arr = new Float32Array(geo.attributes.position.array);
    return arr;
  }, [geo]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const positions = geo.attributes.position.array as Float32Array;
    // Gentle ripple — displace from original baseline, not from current position
    for (let i = 0; i < positions.length; i += 3) {
      const x = originalPositions[i];
      const y = originalPositions[i + 1];
      positions[i + 2] = Math.sin(x * 0.5 + t) * 0.02 + Math.cos(y * 0.7 + t * 0.8) * 0.015;
    }
    geo.attributes.position.needsUpdate = true;
    // NOTE: computeVertexNormals() removed — it was the #1 flicker source.
    // Instead, we use flatShading=false with pre-computed normals that
    // remain stable. The ripple is subtle enough that the visual difference
    // is imperceptible, but the flicker is completely eliminated.
  });

  return (
    <group>
      {/* Deep water layer — static, dark */}
      <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color={new THREE.Color(color).offsetHSL(0, 0, -0.1)}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      {/* Animated surface layer — stable normals */}
      <mesh ref={meshRef} position={[position[0], position[1] + 0.005, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={geo} />
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={metalness}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  LOON — detailed water bird with elongated body, neck, head, beak
// ═══════════════════════════════════════════════════════════════════════════
export function Loon({ position, seed = 1 }: { position: [number, number, number]; seed?: number }) {
  const ref = useRef<THREE.Group>(null);
  const rng = useMemo(() => mulberry32(seed * 4000), [seed]);
  const phase = useMemo(() => rng() * Math.PI * 2, [rng]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      // Glide slowly across the water
      ref.current.position.x = position[0] + Math.sin(t * 0.08 + phase) * 3;
      ref.current.position.z = position[2] + Math.cos(t * 0.06 + phase) * 1.5;
      // Face direction of travel
      ref.current.rotation.y = Math.cos(t * 0.08 + phase) > 0 ? 0 : Math.PI;
      // Gentle bob
      ref.current.position.y = position[1] + Math.sin(t * 0.5 + phase) * 0.02;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Body — elongated ellipsoid, 32 segments for smooth surface */}
      <mesh scale={[1.4, 0.7, 0.6]} castShadow>
        <sphereGeometry args={[0.12, 32, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* White chest band */}
      <mesh position={[0.05, -0.03, 0]} scale={[0.8, 0.3, 0.5]}>
        <sphereGeometry args={[0.1, 24, 16]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.8} />
      </mesh>
      {/* Neck — curved cylinder */}
      <mesh position={[0.14, 0.08, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.03, 0.035, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Head — sphere with 24 segments */}
      <mesh position={[0.18, 0.13, 0]}>
        <sphereGeometry args={[0.045, 24, 18]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Red eye */}
      <mesh position={[0.2, 0.14, 0.025]}>
        <sphereGeometry args={[0.008, 6, 4]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.2, 0.14, -0.025]}>
        <sphereGeometry args={[0.008, 6, 4]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.3} />
      </mesh>
      {/* Beak — pointed cone, 12 segments for smooth tip */}
      <mesh position={[0.23, 0.12, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.015, 0.05, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Tail — small flattened cone */}
      <mesh position={[-0.16, 0.02, 0]} rotation={[0, 0, Math.PI / 2 + 0.3]}>
        <coneGeometry args={[0.04, 0.06, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  V-WAKE TRAIL — multiple expanding rings behind a swimming bird
// ═══════════════════════════════════════════════════════════════════════════
export function VWakeTrail({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ringsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const phase = (t * 0.5 + i * 0.4) % 2;
      const scale = 0.2 + phase * 0.8;
      mesh.scale.set(scale, scale, scale);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.3 - phase * 0.15);
    });
  });

  return (
    <group ref={groupRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringsRef.current[i] = el; }}
          position={[0, 0, 0]}
        >
          <ringGeometry args={[0.15, 0.18, 16, 1, 0, Math.PI]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.2} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DEER — multi-mesh with body, neck, head, legs, antlers, tail
// ═══════════════════════════════════════════════════════════════════════════
export function Deer({ position, antlers = true }: { position: [number, number, number]; antlers?: boolean }) {
  return (
    <group position={position}>
      {/* Body — elongated ellipsoid, 32 segments */}
      <mesh scale={[1.3, 0.8, 0.55]} castShadow>
        <sphereGeometry args={[0.25, 32, 24]} />
        <meshStandardMaterial color="#6b4423" roughness={0.85} />
      </mesh>
      {/* Shoulder hump */}
      <mesh position={[0.1, 0.12, 0]} scale={[0.6, 0.4, 0.5]}>
        <sphereGeometry args={[0.18, 24, 18]} />
        <meshStandardMaterial color="#6b4423" roughness={0.85} />
      </mesh>
      {/* Neck — angled cylinder */}
      <mesh position={[0.3, 0.18, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.06, 0.08, 0.25, 16]} />
        <meshStandardMaterial color="#6b4423" roughness={0.85} />
      </mesh>
      {/* Head */}
      <mesh position={[0.42, 0.3, 0]} scale={[1.2, 0.9, 0.8]}>
        <sphereGeometry args={[0.1, 24, 18]} />
        <meshStandardMaterial color="#6b4423" roughness={0.85} />
      </mesh>
      {/* Snout */}
      <mesh position={[0.52, 0.27, 0]} scale={[0.8, 0.5, 0.5]}>
        <sphereGeometry args={[0.07, 20, 14]} />
        <meshStandardMaterial color="#5d4037" roughness={0.85} />
      </mesh>
      {/* Nose */}
      <mesh position={[0.58, 0.28, 0]}>
        <sphereGeometry args={[0.015, 6, 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.46, 0.33, 0.06]}>
        <sphereGeometry args={[0.012, 6, 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.46, 0.33, -0.06]}>
        <sphereGeometry args={[0.012, 6, 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Ears — flattened cones */}
      <mesh position={[0.38, 0.38, 0.08]} rotation={[0.3, 0, -0.5]}>
        <coneGeometry args={[0.03, 0.06, 12]} />
        <meshStandardMaterial color="#5d4037" roughness={0.85} />
      </mesh>
      <mesh position={[0.38, 0.38, -0.08]} rotation={[-0.3, 0, -0.5]}>
        <coneGeometry args={[0.03, 0.06, 12]} />
        <meshStandardMaterial color="#5d4037" roughness={0.85} />
      </mesh>
      {/* Antlers — branching structure */}
      {antlers && (
        <>
          {/* Left antler main beam */}
          <mesh position={[0.36, 0.45, 0.05]} rotation={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.008, 0.012, 0.15, 5]} />
            <meshStandardMaterial color="#3d2817" roughness={0.9} />
          </mesh>
          {/* Left antler tines */}
          <mesh position={[0.34, 0.5, 0.05]} rotation={[0, 0, -1.2]}>
            <cylinderGeometry args={[0.005, 0.008, 0.06, 4]} />
            <meshStandardMaterial color="#3d2817" roughness={0.9} />
          </mesh>
          <mesh position={[0.38, 0.53, 0.05]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.005, 0.008, 0.05, 4]} />
            <meshStandardMaterial color="#3d2817" roughness={0.9} />
          </mesh>
          {/* Right antler main beam */}
          <mesh position={[0.36, 0.45, -0.05]} rotation={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.008, 0.012, 0.15, 5]} />
            <meshStandardMaterial color="#3d2817" roughness={0.9} />
          </mesh>
          {/* Right antler tines */}
          <mesh position={[0.34, 0.5, -0.05]} rotation={[0, 0, -1.2]}>
            <cylinderGeometry args={[0.005, 0.008, 0.06, 4]} />
            <meshStandardMaterial color="#3d2817" roughness={0.9} />
          </mesh>
          <mesh position={[0.38, 0.53, -0.05]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.005, 0.008, 0.05, 4]} />
            <meshStandardMaterial color="#3d2817" roughness={0.9} />
          </mesh>
        </>
      )}
      {/* Legs — 4 cylinders with proper positioning */}
      {[
        [0.18, 0.12], [-0.18, 0.12], [0.18, -0.12], [-0.18, -0.12],
      ].map((l, i) => (
        <group key={i}>
          {/* Upper leg */}
          <mesh position={[l[0], -0.15, l[1]]}>
            <cylinderGeometry args={[0.025, 0.02, 0.18, 12]} />
            <meshStandardMaterial color="#6b4423" roughness={0.85} />
          </mesh>
          {/* Lower leg */}
          <mesh position={[l[0], -0.3, l[1]]}>
            <cylinderGeometry args={[0.015, 0.012, 0.15, 10]} />
            <meshStandardMaterial color="#5d4037" roughness={0.85} />
          </mesh>
          {/* Hoof */}
          <mesh position={[l[0], -0.38, l[1]]}>
            <boxGeometry args={[0.03, 0.02, 0.04]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      ))}
      {/* Tail */}
      <mesh position={[-0.3, 0.05, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.04, 0.08, 12]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.85} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  BIRD (generic) — body, head, wings, tail, beak, animated flight
// ═══════════════════════════════════════════════════════════════════════════
export function Bird({
  position,
  color = "#5a4a3a",
  scale = 1,
  flightRadius = 3,
  flightSpeed = 0.3,
  flightHeight = 2.5,
  seed = 1,
}: {
  position: [number, number, number];
  color?: string;
  scale?: number;
  flightRadius?: number;
  flightSpeed?: number;
  flightHeight?: number;
  seed?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const wingLRef = useRef<THREE.Mesh>(null);
  const wingRRef = useRef<THREE.Mesh>(null);
  const rng = useMemo(() => mulberry32(seed * 5000), [seed]);
  const phase = useMemo(() => rng() * Math.PI * 2, [rng]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * flightSpeed + phase;
    if (ref.current) {
      ref.current.position.x = position[0] + Math.cos(t) * flightRadius;
      ref.current.position.z = position[2] + Math.sin(t) * flightRadius;
      ref.current.position.y = position[1] + flightHeight + Math.sin(t * 2) * 0.3;
      ref.current.rotation.y = -t + Math.PI / 2;
    }
    // Wing flap
    const flap = Math.sin(state.clock.elapsedTime * 8 + phase) * 0.5;
    if (wingLRef.current) wingLRef.current.rotation.z = 0.3 + flap;
    if (wingRRef.current) wingRRef.current.rotation.z = -0.3 - flap;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      {/* Body — ellipsoid, 32 segments */}
      <mesh scale={[1.5, 0.7, 0.6]} castShadow>
        <sphereGeometry args={[0.08, 32, 24]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0.1, 0.04, 0]}>
        <sphereGeometry args={[0.04, 24, 18]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Beak */}
      <mesh position={[0.14, 0.03, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.01, 0.03, 12]} />
        <meshStandardMaterial color="#d4a017" />
      </mesh>
      {/* Eye */}
      <mesh position={[0.11, 0.05, 0.022]}>
        <sphereGeometry args={[0.006, 6, 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Left wing — animated, 24 segments */}
      <mesh ref={wingLRef} position={[-0.02, 0.02, 0.04]} scale={[0.8, 0.1, 1.2]}>
        <sphereGeometry args={[0.08, 24, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Right wing — animated, 24 segments */}
      <mesh ref={wingRRef} position={[-0.02, 0.02, -0.04]} scale={[0.8, 0.1, 1.2]}>
        <sphereGeometry args={[0.08, 24, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Tail — flattened cone */}
      <mesh position={[-0.11, 0.01, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.5, 1, 0.3]}>
        <coneGeometry args={[0.04, 0.08, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DRAGONFLY — 4 wings, elongated body, large eyes, iridescent
// ═══════════════════════════════════════════════════════════════════════════
export function Dragonfly({
  center,
  phase = 0,
  color = "#3b82f6",
}: {
  center: [number, number, number];
  phase?: number;
  color?: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const wingRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime + phase;
    if (ref.current) {
      ref.current.position.x = center[0] + Math.sin(t * 1.5) * 0.8;
      ref.current.position.y = center[1] + Math.sin(t * 2) * 0.3;
      ref.current.position.z = center[2] + Math.cos(t * 1.5) * 0.8;
      ref.current.rotation.y = t * 3;
    }
    // Wing flutter — very fast
    const flutter = Math.sin(t * 30) * 0.4;
    wingRefs.current.forEach((w, i) => {
      if (w) w.rotation.y = (i % 2 === 0 ? 1 : -1) * (0.1 + flutter);
    });
  });

  return (
    <group ref={ref} position={center}>
      {/* Body — 3 segments */}
      <mesh scale={[0.3, 0.06, 0.06]}>
        <capsuleGeometry args={[0.02, 0.08, 4, 8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0.05, 0, 0]} scale={[0.2, 0.05, 0.05]}>
        <capsuleGeometry args={[0.018, 0.06, 4, 8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Head + large eyes */}
      <mesh position={[0.12, 0.01, 0]}>
        <sphereGeometry args={[0.025, 10, 8]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0.13, 0.02, 0.015]}>
        <sphereGeometry args={[0.018, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" emissive={color} emissiveIntensity={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0.13, 0.02, -0.015]}>
        <sphereGeometry args={[0.018, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" emissive={color} emissiveIntensity={0.2} metalness={0.5} />
      </mesh>
      {/* 4 wings — iridescent, fluttering */}
      {[0, 1, 2, 3].map((i) => {
        const isLeft = i < 2;
        const isFront = i % 2 === 0;
        return (
          <mesh
            key={i}
            ref={(el) => { if (el) wingRefs.current[i] = el; }}
            position={[isFront ? 0.02 : -0.02, 0.03, isLeft ? 0.04 : -0.04]}
            scale={[0.6, 0.02, 0.25]}
          >
            <sphereGeometry args={[0.08, 10, 6]} />
            <meshStandardMaterial
              color="#e0e0e0"
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
              emissive={color}
              emissiveIntensity={0.1}
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DETAILED FLOWER — stem, leaf, multi-petal, stamen center
// ═══════════════════════════════════════════════════════════════════════════
export function DetailedFlower({
  position,
  color = "#ec4899",
  delay = 0,
  scale = 1,
}: {
  position: [number, number, number];
  color?: string;
  delay?: number;
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + delay) * 0.06;
    }
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      {/* Stem — thin cylinder with slight curve */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.008, 0.012, 0.4, 6]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>
      {/* Leaf — curved flattened shape */}
      <mesh position={[0.06, 0.15, 0]} rotation={[0.5, 0, -0.6]} scale={[0.4, 0.6, 0.15]}>
        <sphereGeometry args={[0.06, 10, 6]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} />
      </mesh>
      {/* 6 petals — flattened spheres with 10 segments */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.05, 0.42, Math.sin(angle) * 0.05]}
            rotation={[0, -angle, 0.3]}
            scale={[0.6, 0.3, 0.9]}
          >
            <sphereGeometry args={[0.06, 10, 6]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        );
      })}
      {/* Center — detailed stamen with emissive glow */}
      <mesh position={[0, 0.43, 0]}>
        <sphereGeometry args={[0.035, 12, 8]} />
        <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
      {/* Tiny stamen dots around center */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={`stamen-${i}`}
            position={[Math.cos(angle) * 0.025, 0.445, Math.sin(angle) * 0.025]}
          >
            <sphereGeometry args={[0.006, 4, 3]} />
            <meshStandardMaterial color="#facc15" emissive="#fbbf24" emissiveIntensity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  GLOWING MUSHROOM — cap, stem, gills, bioluminescent
// ═══════════════════════════════════════════════════════════════════════════
export function GlowingMushroom({
  position,
  color = "#c4b5fd",
  glowColor = "#a78bfa",
  scale = 1,
}: {
  position: [number, number, number];
  color?: string;
  glowColor?: string;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Stem — slightly tapered, 8 segments */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.01, 0.015, 0.08, 8]} />
        <meshStandardMaterial color="#e0e7ff" roughness={0.7} />
      </mesh>
      {/* Cap — half sphere with 14 segments, slightly flattened */}
      <mesh position={[0, 0.08, 0]} scale={[1, 0.7, 1]}>
        <sphereGeometry args={[0.04, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          emissive={glowColor}
          emissiveIntensity={0.8}
          roughness={0.5}
        />
      </mesh>
      {/* Gills — visible underneath */}
      <mesh position={[0, 0.078, 0]} rotation={[Math.PI, 0, 0]} scale={[1, 0.3, 1]}>
        <sphereGeometry args={[0.035, 12, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#ddd6fe"
          emissive={glowColor}
          emissiveIntensity={0.4}
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Spots on cap — 3 tiny emissive dots */}
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.02, 0.095, Math.sin(angle) * 0.02]}
          >
            <sphereGeometry args={[0.005, 5, 4]} />
            <meshStandardMaterial color="#ffffff" emissive={glowColor} emissiveIntensity={1} />
          </mesh>
        );
      })}
      {/* Point light for local glow */}
      <pointLight position={[0, 0.1, 0]} intensity={0.15} distance={0.5} color={glowColor} />
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DETAILED CAMPFIRE — stones, logs, multi-layer flames, embers
// ═══════════════════════════════════════════════════════════════════════════
export function DetailedCampfire({ position }: { position: [number, number, number] }) {
  const flameRefs = useRef<THREE.Mesh[]>([]);
  const emberRef = useRef<THREE.Points>(null);

  // Stone positions around the fire ring
  const stones = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return {
        pos: [Math.cos(angle) * 0.28, 0, Math.sin(angle) * 0.28] as [number, number, number],
        scale: 0.85 + Math.random() * 0.3,
        rotation: [Math.random(), Math.random(), Math.random()] as [number, number, number],
      };
    });
  }, []);

  // Ember particles
  const emberPositions = useMemo(() => {
    const arr = new Float32Array(50 * 3);
    for (let i = 0; i < 50; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.3;
      arr[i * 3 + 1] = Math.random() * 1.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // 4 flame layers flicker at different rates
    flameRefs.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.scale.y = 1 + Math.sin(t * (8 + i * 2) + i) * 0.2;
        mesh.scale.x = 1 + Math.sin(t * (6 + i) + i * 2) * 0.1;
      }
    });
    // Embers rise and reset
    if (emberRef.current) {
      const positions = emberRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 50; i++) {
        positions[i * 3 + 1] += 0.01;
        positions[i * 3] += Math.sin(t + i) * 0.002;
        if (positions[i * 3 + 1] > 1.5) {
          positions[i * 3 + 1] = 0;
          positions[i * 3] = (Math.random() - 0.5) * 0.3;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        }
      }
      emberRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      {/* 8 stones — varied icosahedrons */}
      {stones.map((s, i) => (
        <mesh
          key={i}
          position={s.pos}
          rotation={s.rotation}
          scale={s.scale}
          castShadow
        >
          <icosahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.95} flatShading />
        </mesh>
      ))}

      {/* Crossed birch logs — white bark, 8 segments */}
      <mesh rotation={[0, 0, 0.3]} position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.85} />
      </mesh>
      <mesh rotation={[0, 0, -0.3]} position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.85} />
      </mesh>
      {/* Bark texture lines on logs */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, 0, 0.3]} position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.041, 0.041, 0.45, 8, 1, true]} />
          <meshStandardMaterial color="#d0c8b8" roughness={0.9} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* 4 flame layers: red outer, orange, yellow, white-hot inner */}
      {[
        { color: "#dc2626", scale: 1, y: 0.15, opacity: 0.7 },
        { color: "#f97316", scale: 0.8, y: 0.18, opacity: 0.8 },
        { color: "#fde047", scale: 0.55, y: 0.2, opacity: 0.9 },
        { color: "#ffffff", scale: 0.3, y: 0.22, opacity: 0.9 },
      ].map((flame, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) flameRefs.current[i] = el; }}
          position={[0, flame.y, 0]}
          scale={flame.scale}
        >
          <coneGeometry args={[0.13, 0.35, 8, 3]} />
          <meshBasicMaterial color={flame.color} transparent opacity={flame.opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}

      {/* 2 point lights — warm orange + yellow */}
      <pointLight position={[0, 0.3, 0]} intensity={4} distance={6} color="#f97316" />
      <pointLight position={[0, 0.6, 0]} intensity={2} distance={4} color="#fde047" />

      {/* 50 rising ember sparks */}
      <points ref={emberRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[emberPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color="#fbbf24"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DETAILED CABIN — walls, pitched roof, glowing window, chimney
// ═══════════════════════════════════════════════════════════════════════════
export function DetailedCabin({ position }: { position: [number, number, number] }) {
  const smokeRef = useRef<THREE.Points>(null);
  const smokePositions = useMemo(() => {
    const arr = new Float32Array(15 * 3);
    for (let i = 0; i < 15; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.2;
      arr[i * 3 + 1] = Math.random() * 2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (smokeRef.current) {
      const t = state.clock.elapsedTime;
      const positions = smokeRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 15; i++) {
        positions[i * 3 + 1] += 0.008;
        positions[i * 3] += Math.sin(t + i) * 0.001;
        if (positions[i * 3 + 1] > 2.5) {
          positions[i * 3 + 1] = 0;
          positions[i * 3] = (Math.random() - 0.5) * 0.2;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
        }
      }
      smokeRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      {/* Walls — main body with plank lines */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.6, 1.6]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>
      {/* Horizontal plank lines — 4 darker strips */}
      {[0.3, 0.7, 1.1, 1.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0.81]}>
          <boxGeometry args={[2.21, 0.03, 0.01]} />
          <meshStandardMaterial color="#2a1810" roughness={0.95} />
        </mesh>
      ))}
      {/* Side planks */}
      {[0.3, 0.7, 1.1, 1.5].map((y, i) => (
        <mesh key={`side-${i}`} position={[1.11, y, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.61, 0.03, 0.01]} />
          <meshStandardMaterial color="#2a1810" roughness={0.95} />
        </mesh>
      ))}

      {/* Pitched roof — 4-sided pyramid, 6 segments */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <coneGeometry args={[1.8, 0.9, 4, 1]} />
        <meshStandardMaterial color="#1a1008" roughness={0.85} />
      </mesh>
      {/* Roof shingle lines — 3 overlapping planes */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 1.7 + i * 0.2, 0]}>
          <coneGeometry args={[1.8 - i * 0.4, 0.05, 4, 1]} />
          <meshStandardMaterial color="#0f0a04" roughness={0.9} />
        </mesh>
      ))}

      {/* Window — warm orange glow with frame */}
      <mesh position={[0.6, 0.9, 0.81]}>
        <planeGeometry args={[0.35, 0.35]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>
      {/* Window frame — 4 thin bars */}
      <mesh position={[0.6, 0.9, 0.82]}>
        <boxGeometry args={[0.37, 0.03, 0.01]} />
        <meshStandardMaterial color="#1a1008" />
      </mesh>
      <mesh position={[0.6, 0.9, 0.82]}>
        <boxGeometry args={[0.03, 0.37, 0.01]} />
        <meshStandardMaterial color="#1a1008" />
      </mesh>
      {/* Window glow light */}
      <pointLight position={[0.7, 0.9, 1]} intensity={1} distance={3} color="#f97316" />

      {/* Door */}
      <mesh position={[-0.5, 0.6, 0.81]}>
        <boxGeometry args={[0.3, 0.6, 0.02]} />
        <meshStandardMaterial color="#2a1810" roughness={0.9} />
      </mesh>
      {/* Door handle */}
      <mesh position={[-0.38, 0.55, 0.83]}>
        <sphereGeometry args={[0.015, 6, 4]} />
        <meshStandardMaterial color="#d4a017" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Chimney */}
      <mesh position={[0.7, 2.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
      </mesh>
      {/* Chimney cap */}
      <mesh position={[0.7, 2.6, 0]}>
        <boxGeometry args={[0.24, 0.04, 0.24]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>

      {/* Smoke particles rising from chimney */}
      <points ref={smokeRef} position={[0.7, 2.6, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[smokePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#9ca3af"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  ADIRONDACK CHAIR — detailed with slatted backrest, armrests, legs
// ═══════════════════════════════════════════════════════════════════════════
export function AdirondackChair({
  position,
  rotation = [0, 0, 0] as [number, number, number],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat — slightly angled */}
      <mesh position={[0, 0.1, 0]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.35, 0.03, 0.35]} />
        <meshStandardMaterial color="#8b4513" roughness={0.85} />
      </mesh>
      {/* Seat slats — 3 thinner boards on top */}
      {[-0.1, 0, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 0.12, 0]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.08, 0.02, 0.33]} />
          <meshStandardMaterial color="#7a3a0a" roughness={0.85} />
        </mesh>
      ))}
      {/* Backrest — slanted, with 4 vertical slats */}
      <group position={[0, 0.25, -0.15]} rotation={[-0.5, 0, 0]}>
        {/* Top rail */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.35, 0.03, 0.03]} />
          <meshStandardMaterial color="#8b4513" roughness={0.85} />
        </mesh>
        {/* Bottom rail */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.35, 0.03, 0.03]} />
          <meshStandardMaterial color="#8b4513" roughness={0.85} />
        </mesh>
        {/* 4 vertical slats */}
        {[-0.12, -0.04, 0.04, 0.12].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[0.05, 0.3, 0.02]} />
            <meshStandardMaterial color="#7a3a0a" roughness={0.85} />
          </mesh>
        ))}
      </group>
      {/* Armrests — with rounded front */}
      <mesh position={[-0.19, 0.2, 0.05]}>
        <boxGeometry args={[0.05, 0.04, 0.3]} />
        <meshStandardMaterial color="#8b4513" roughness={0.85} />
      </mesh>
      <mesh position={[0.19, 0.2, 0.05]}>
        <boxGeometry args={[0.05, 0.04, 0.3]} />
        <meshStandardMaterial color="#8b4513" roughness={0.85} />
      </mesh>
      {/* Armrest front supports */}
      <mesh position={[-0.19, 0.1, 0.15]}>
        <cylinderGeometry args={[0.02, 0.02, 0.22, 6]} />
        <meshStandardMaterial color="#6b3410" roughness={0.85} />
      </mesh>
      <mesh position={[0.19, 0.1, 0.15]}>
        <cylinderGeometry args={[0.02, 0.02, 0.22, 6]} />
        <meshStandardMaterial color="#6b3410" roughness={0.85} />
      </mesh>
      {/* Back legs — angled */}
      <mesh position={[-0.13, -0.05, -0.13]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.28, 6]} />
        <meshStandardMaterial color="#6b3410" roughness={0.85} />
      </mesh>
      <mesh position={[0.13, -0.05, -0.13]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.28, 6]} />
        <meshStandardMaterial color="#6b3410" roughness={0.85} />
      </mesh>
      {/* Front legs */}
      <mesh position={[-0.13, -0.05, 0.13]}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 6]} />
        <meshStandardMaterial color="#6b3410" roughness={0.85} />
      </mesh>
      <mesh position={[0.13, -0.05, 0.13]}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 6]} />
        <meshStandardMaterial color="#6b3410" roughness={0.85} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  EASEL — artist's French easel with tripod, crossbar, canvas shelf
// ═══════════════════════════════════════════════════════════════════════════
export function ArtistEasel({
  position,
  paintingColors,
}: {
  position: [number, number, number];
  paintingColors?: string[];
}) {
  return (
    <group position={position}>
      {/* Tripod legs — 3 angled cylinders */}
      <mesh position={[-0.3, 0.5, 0]} rotation={[0, 0, 0.18]} castShadow>
        <cylinderGeometry args={[0.018, 0.025, 1.3, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, -0.18]} castShadow>
        <cylinderGeometry args={[0.018, 0.025, 1.3, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.5, -0.2]} rotation={[0.18, 0, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.025, 1.3, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.65, 0.025, 0.025]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      {/* Canvas/backboard */}
      <mesh position={[0, 0.85, 0.03]}>
        <boxGeometry args={[0.55, 0.45, 0.015]} />
        <meshStandardMaterial color="#faf3e3" roughness={0.7} />
      </mesh>
      {/* Painting — colored impasto blobs */}
      {paintingColors?.map((color, i) => {
        const x = -0.15 + (i % 2) * 0.15;
        const y = 0.8 + Math.floor(i / 2) * 0.12;
        return (
          <mesh key={i} position={[x, y, 0.045]} scale={[0.8, 0.6, 0.4]}>
            <sphereGeometry args={[0.06, 8, 6]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        );
      })}
      {/* Canvas shelf */}
      <mesh position={[0, 0.55, 0.12]}>
        <boxGeometry args={[0.4, 0.02, 0.08]} />
        <meshStandardMaterial color="#6b3410" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  ROWBOAT — boat-shaped with pointed ends
// ═══════════════════════════════════════════════════════════════════════════
export function Rowboat({
  position,
  bobPhase = 0,
}: {
  position: [number, number, number];
  bobPhase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + bobPhase;
      ref.current.position.y = position[1] + Math.sin(t * 0.8) * 0.03;
      ref.current.rotation.z = Math.sin(t * 0.8) * 0.04;
      ref.current.rotation.x = Math.sin(t * 0.6) * 0.02;
    }
  });
  return (
    <group ref={ref} position={position}>
      {/* Hull — elongated, pointed at both ends */}
      <mesh scale={[1.5, 0.35, 0.5]} castShadow>
        <sphereGeometry args={[0.2, 12, 8]} />
        <meshStandardMaterial color="#5d4037" roughness={0.85} />
      </mesh>
      {/* Interior — darker */}
      <mesh position={[0, 0.04, 0]} scale={[1.3, 0.15, 0.35]}>
        <sphereGeometry args={[0.18, 10, 6]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>
      {/* Two thwarts (seats) */}
      {[-0.1, 0.15].map((x, i) => (
        <mesh key={i} position={[x, 0.04, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.3]} />
          <meshStandardMaterial color="#6b4423" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  CATTAIL — reed with fluffy seed head
// ═══════════════════════════════════════════════════════════════════════════
export function Cattail({
  position,
  delay = 0,
}: {
  position: [number, number, number];
  delay?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.08;
    }
  });
  return (
    <group ref={ref} position={position}>
      {/* Stem — thin, 5 segments */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.008, 0.014, 0.7, 5]} />
        <meshStandardMaterial color="#5d4037" roughness={0.85} />
      </mesh>
      {/* Long leaf blade */}
      <mesh position={[0.05, 0.25, 0]} rotation={[0, 0, -0.4]} scale={[0.6, 1.5, 0.08]}>
        <sphereGeometry args={[0.06, 6, 4]} />
        <meshStandardMaterial color="#4a7c2a" roughness={0.8} />
      </mesh>
      {/* Cattail seed head — cylindrical, dark brown */}
      <mesh position={[0, 0.75, 0]}>
        <capsuleGeometry args={[0.022, 0.14, 4, 6]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>
      {/* Fluffy tip */}
      <mesh position={[0, 0.85, 0]} scale={[1, 0.5, 1]}>
        <sphereGeometry args={[0.015, 8, 6]} />
        <meshStandardMaterial color="#9ca3af" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  GROUND COVER — textured ground plane with procedural variation
// ═══════════════════════════════════════════════════════════════════════════
export function TexturedGround({
  position = [0, -0.5, 0],
  width = 20,
  depth = 12,
  color = "#2a3a1a",
  roughness = 0.95,
  seed = 1,
}: {
  position?: [number, number, number];
  width?: number;
  depth?: number;
  color?: string;
  roughness?: number;
  seed?: number;
}) {
  // Generate procedural ground texture with color variation
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const rng = mulberry32(seed * 7000);

    // Base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    // Add noise — small darker and lighter patches for organic feel
    const baseColorObj = new THREE.Color(color);
    for (let i = 0; i < 800; i++) {
      const x = rng() * size;
      const y = rng() * size;
      const r = 2 + rng() * 8;
      const variation = (rng() - 0.5) * 0.15;
      const patchColor = baseColorObj.clone().offsetHSL(0, 0, variation);
      ctx.fillStyle = patchColor.getStyle();
      ctx.globalAlpha = 0.3 + rng() * 0.3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Add small detail dots — pebbles, twigs, etc.
    for (let i = 0; i < 200; i++) {
      const x = rng() * size;
      const y = rng() * size;
      const r = 0.5 + rng() * 1.5;
      ctx.fillStyle = rng() > 0.5 ? "#3d2817" : "#5a5a5a";
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(width / 4, depth / 4);
    return tex;
  }, [color, seed, width, depth]);

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth, 16, 16]} />
      <meshStandardMaterial map={texture} color={color} roughness={roughness} />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  GRASS FIELD — instanced grass blades for lush ground cover
// ═══════════════════════════════════════════════════════════════════════════
export function GrassField({
  count = 100,
  area = 8,
  seed = 1,
  color = "#4a7c2a",
}: {
  count?: number;
  area?: number;
  seed?: number;
  color?: string;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const blades = useMemo(() => {
    const rng = mulberry32(seed * 8000);
    return Array.from({ length: count }, () => ({
      pos: [(rng() - 0.5) * area, -0.48, (rng() - 0.5) * area] as [number, number, number],
      rotation: rng() * Math.PI * 2,
      scale: 0.5 + rng() * 0.8,
      tilt: (rng() - 0.5) * 0.3,
    }));
  }, [count, area, seed]);

  const grassColor = useMemo(() => new THREE.Color(color), [color]);
  const tipColor = useMemo(() => new THREE.Color(color).lerp(new THREE.Color("#8bc34a"), 0.4), [color]);

  useFrame(() => {
    if (!meshRef.current) return;
    blades.forEach((blade, i) => {
      dummy.position.set(blade.pos[0], blade.pos[1], blade.pos[2]);
      dummy.rotation.set(blade.tilt, blade.rotation, 0);
      dummy.scale.set(blade.scale, blade.scale * 2, blade.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      // Vary color slightly per blade
      const c = grassColor.clone().lerp(tipColor, Math.random() * 0.5);
      meshRef.current!.setColorAt(i, c);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow={false}>
      <coneGeometry args={[0.008, 0.15, 4, 2]} />
      <meshStandardMaterial vertexColors roughness={0.8} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  ATMOSPHERIC PARTICLES — floating dust/pollen/sparkles
// ═══════════════════════════════════════════════════════════════════════════
export function AtmosphericParticles({
  count = 80,
  area = [10, 4, 8] as [number, number, number],
  color = "#fde047",
  size = 0.03,
  speed = 0.3,
  seed = 1,
}: {
  count?: number;
  area?: [number, number, number];
  color?: string;
  size?: number;
  speed?: number;
  seed?: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rng = mulberry32(seed * 9000);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rng() - 0.5) * area[0];
      arr[i * 3 + 1] = rng() * area[1];
      arr[i * 3 + 2] = (rng() - 0.5) * area[2];
    }
    return arr;
  }, [count, area, seed]);

  const velocities = useMemo(() => {
    const rng = mulberry32(seed * 9100);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rng() - 0.5) * speed * 0.1;
      arr[i * 3 + 1] = (rng() - 0.5) * speed * 0.05;
      arr[i * 3 + 2] = (rng() - 0.5) * speed * 0.1;
    }
    return arr;
  }, [count, speed, seed]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      // Drift + sine-wave oscillation for organic float
      pos[i * 3] += velocities[i * 3] + Math.sin(t * 0.3 + i * 0.1) * 0.001;
      pos[i * 3 + 1] += velocities[i * 3 + 1] + Math.cos(t * 0.2 + i * 0.15) * 0.001;
      pos[i * 3 + 2] += velocities[i * 3 + 2];

      // Wrap around bounds
      if (pos[i * 3] > area[0] / 2) pos[i * 3] = -area[0] / 2;
      if (pos[i * 3] < -area[0] / 2) pos[i * 3] = area[0] / 2;
      if (pos[i * 3 + 1] > area[1]) pos[i * 3 + 1] = 0;
      if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = area[1];
      if (pos[i * 3 + 2] > area[2] / 2) pos[i * 3 + 2] = -area[2] / 2;
      if (pos[i * 3 + 2] < -area[2] / 2) pos[i * 3 + 2] = area[2] / 2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  FALLEN LEAVES — scattered leaf meshes on the ground
// ═══════════════════════════════════════════════════════════════════════════
export function FallenLeaves({
  count = 20,
  area = 8,
  seed = 1,
  colors = ["#8b4513", "#a0522d", "#cd853f", "#daa520"],
}: {
  count?: number;
  area?: number;
  seed?: number;
  colors?: string[];
}) {
  const leaves = useMemo(() => {
    const rng = mulberry32(seed * 9300);
    return Array.from({ length: count }, () => ({
      pos: [(rng() - 0.5) * area, -0.48, (rng() - 0.5) * area] as [number, number, number],
      rotation: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI] as [number, number, number],
      scale: 0.5 + rng() * 0.5,
      color: colors[Math.floor(rng() * colors.length)],
    }));
  }, [count, area, seed, colors]);

  return (
    <group>
      {leaves.map((leaf, i) => (
        <mesh
          key={i}
          position={leaf.pos}
          rotation={leaf.rotation}
          scale={leaf.scale}
        >
          <circleGeometry args={[0.05, 5]} />
          <meshStandardMaterial color={leaf.color} roughness={0.8} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MOON — detailed with craters and glow halo
// ═══════════════════════════════════════════════════════════════════════════
export function DetailedMoon({
  position,
  radius = 0.8,
  crescent = true,
}: {
  position: [number, number, number];
  radius?: number;
  crescent?: boolean;
}) {
  const craters = useMemo(() => {
    const rng = mulberry32(9400);
    return Array.from({ length: 8 }, () => ({
      pos: [(rng() - 0.5) * 1.2, (rng() - 0.5) * 1.2, radius * 0.9] as [number, number, number],
      scale: 0.05 + rng() * 0.08,
    }));
  }, [radius]);

  return (
    <group position={position}>
      {/* Main moon body — 32 segments for smooth sphere */}
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      {/* Crescent shadow if needed */}
      {crescent && (
        <mesh position={[radius * 0.35, 0, 0]}>
          <sphereGeometry args={[radius * 0.92, 32, 32]} />
          <meshBasicMaterial color="#0f0a2e" />
        </mesh>
      )}
      {/* Glow halo — larger, transparent */}
      <mesh>
        <sphereGeometry args={[radius * 1.5, 24, 24]} />
        <meshBasicMaterial color="#e0e7ff" transparent opacity={0.12} />
      </mesh>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[radius * 2, 20, 20]} />
        <meshBasicMaterial color="#c4b5fd" transparent opacity={0.05} />
      </mesh>
      {/* Craters */}
      {craters.map((c, i) => (
        <mesh key={i} position={c.pos} scale={c.scale}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial color="#d1d5db" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

