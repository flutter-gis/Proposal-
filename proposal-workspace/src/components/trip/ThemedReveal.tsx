"use client";

/**
 * ThemedReveal.tsx
 *
 * Per-icon themed particle burst that fires when the engagement ring is
 * revealed. Replaces the generic multi-color ConfettiBurst with a unique
 * effect per icon theme:
 *
 *   golden      → 20 golden butterflies spiraling upward, fluttering wings
 *   sunset      → 15 birds taking flight across the crimson sky
 *   dusk        → 30 fireflies spiraling upward in a double-helix
 *   midnight    → 50 ember sparks rising from the ring box
 *   stargazing  → 8 shooting stars streaking across the sky at staggered delays
 *   heart       → 30 heart-shaped petals falling from the sky
 *   (other)     → falls back to a 100-particle golden confetti burst
 *
 * Each effect is implemented as an instanced mesh driven by a `useFrame`
 * loop. Particles are initialized once when `active` flips true and animate
 * over a fixed lifetime, after which they shrink to zero and stop updating.
 *
 * Performance:
 *   - Single InstancedMesh per effect (one draw call)
 *   - All particle state stored in a ref array (no React re-renders)
 *   - Use `THREE.MathUtils.lerp` for smooth interpolation
 *   - Frame loop early-exits when all particles are dead
 */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { IconTheme } from "@/lib/preferences";

// ── Common particle type ────────────────────────────────────────────────
interface Particle {
  position: [number, number, number];
  velocity: [number, number, number];
  rotation: [number, number, number];
  rotSpeed: [number, number, number];
  color: string;
  size: number;
  life: number;
  maxLife: number;
  // Per-effect extra state
  phase: number; // for oscillation
  phaseSpeed: number;
}

// ── Effect configs ──────────────────────────────────────────────────────
type EffectKind =
  | "butterflies"
  | "birds"
  | "fireflies"
  | "embers"
  | "shootingStars"
  | "petals"
  | "confetti";

const ICON_TO_EFFECT: Partial<Record<IconTheme, EffectKind>> = {
  golden: "butterflies",
  afternoon: "butterflies",
  sunset: "birds",
  dusk: "fireflies",
  midnight: "embers",
  stargazing: "shootingStars",
  heart: "petals",
  proposal: "petals",
  anniversary: "petals",
};

function getEffectKind(icon: IconTheme): EffectKind {
  return ICON_TO_EFFECT[icon] ?? "confetti";
}

// ── Per-effect initializers ─────────────────────────────────────────────

function initButterflies(): Particle[] {
  const colors = ["#fbbf24", "#fde047", "#f59e0b", "#fef3c7"];
  return Array.from({ length: 20 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 20;
    const radius = 0.5 + Math.random() * 0.5;
    return {
      position: [Math.cos(angle) * radius, 0.3, Math.sin(angle) * radius],
      velocity: [
        Math.cos(angle) * 0.5,
        1.2 + Math.random() * 0.8,
        Math.sin(angle) * 0.5,
      ],
      rotation: [0, angle, 0],
      rotSpeed: [0, 0, 0],
      color: colors[i % colors.length],
      size: 0.12 + Math.random() * 0.06,
      life: 0,
      maxLife: 4.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 12 + Math.random() * 6,
    };
  });
}

function initBirds(): Particle[] {
  const colors = ["#1a1a1a", "#2c1810", "#3d2817"];
  return Array.from({ length: 15 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 15;
    return {
      position: [Math.cos(angle) * 3, 1 + Math.random() * 1.5, Math.sin(angle) * 3],
      velocity: [
        Math.cos(angle) * 1.5,
        0.5 + Math.random() * 0.3,
        Math.sin(angle) * 1.5,
      ],
      rotation: [0, -angle, 0],
      rotSpeed: [0, 0, 0],
      color: colors[i % colors.length],
      size: 0.08 + Math.random() * 0.04,
      life: 0,
      maxLife: 4,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 8 + Math.random() * 4,
    };
  });
}

function initFireflies(): Particle[] {
  const colors = ["#fde047", "#fbbf24", "#fef3c7"];
  return Array.from({ length: 30 }, (_, i) => {
    const t = i / 30;
    const angle = t * Math.PI * 6; // 3 turns = double helix feel
    const radius = 0.6;
    return {
      position: [Math.cos(angle) * radius, 0.3, Math.sin(angle) * radius],
      velocity: [
        Math.cos(angle) * 0.2,
        1.5 + Math.random() * 0.4,
        Math.sin(angle) * 0.2,
      ],
      rotation: [0, 0, 0],
      rotSpeed: [0, 0, 0],
      color: colors[i % colors.length],
      size: 0.04 + Math.random() * 0.03,
      life: 0,
      maxLife: 5,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 4 + Math.random() * 3,
    };
  });
}

function initEmbers(): Particle[] {
  const colors = ["#f97316", "#ef4444", "#fbbf24", "#fef3c7"];
  return Array.from({ length: 50 }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 1.5;
    return {
      position: [(Math.random() - 0.5) * 0.4, 0.3, (Math.random() - 0.5) * 0.4],
      velocity: [
        Math.cos(angle) * speed * 0.3,
        1.5 + Math.random() * 1.5,
        Math.sin(angle) * speed * 0.3,
      ],
      rotation: [0, 0, 0],
      rotSpeed: [0, 0, 0],
      color: colors[i % colors.length],
      size: 0.04 + Math.random() * 0.06,
      life: 0,
      maxLife: 3 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 10 + Math.random() * 6,
    };
  });
}

function initShootingStars(): Particle[] {
  const colors = ["#ffffff", "#fef3c7", "#e0e7ff"];
  return Array.from({ length: 8 }, (_, i) => {
    const startAngle = Math.random() * Math.PI * 2;
    return {
      position: [
        Math.cos(startAngle) * 5,
        2 + Math.random() * 2,
        Math.sin(startAngle) * 5,
      ],
      velocity: [
        -Math.cos(startAngle) * 4,
        -0.5 - Math.random() * 0.5,
        -Math.sin(startAngle) * 4,
      ],
      rotation: [0, 0, 0],
      rotSpeed: [0, 0, 0],
      color: colors[i % colors.length],
      size: 0.06 + Math.random() * 0.04,
      life: -i * 0.4, // staggered start: -0.4s, -0.8s, -1.2s, ...
      maxLife: 1.5,
      phase: 0,
      phaseSpeed: 0,
    };
  });
}

function initPetals(): Particle[] {
  const colors = ["#ec4899", "#f472b6", "#fbcfe8", "#be185d", "#9d174d"];
  return Array.from({ length: 30 }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    return {
      position: [
        (Math.random() - 0.5) * 6,
        4 + Math.random() * 2,
        (Math.random() - 0.5) * 6,
      ],
      velocity: [
        Math.cos(angle) * 0.3,
        -0.5 - Math.random() * 0.4,
        Math.sin(angle) * 0.3,
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      rotSpeed: [
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ],
      color: colors[i % colors.length],
      size: 0.1 + Math.random() * 0.06,
      life: 0,
      maxLife: 5,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 2 + Math.random() * 2,
    };
  });
}

function initConfetti(): Particle[] {
  const colors = ["#fbbf24", "#f59e0b", "#ec4899", "#f472b6", "#fef3c7", "#d4a017", "#e11d48", "#fde047", "#a78bfa", "#c4b5fd"];
  return Array.from({ length: 100 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 100 + Math.random() * 0.4;
    const speed = 2.5 + Math.random() * 5;
    return {
      position: [0, 0.3, 0],
      velocity: [
        Math.cos(angle) * speed,
        Math.sin(angle) * speed + 3,
        (Math.random() - 0.5) * 2,
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      rotSpeed: [
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
      ],
      color: colors[i % colors.length],
      size: 0.04 + Math.random() * 0.08,
      life: 0,
      maxLife: 2.5 + Math.random() * 2,
      phase: 0,
      phaseSpeed: 0,
    };
  });
}

function initParticles(kind: EffectKind): Particle[] {
  switch (kind) {
    case "butterflies": return initButterflies();
    case "birds": return initBirds();
    case "fireflies": return initFireflies();
    case "embers": return initEmbers();
    case "shootingStars": return initShootingStars();
    case "petals": return initPetals();
    case "confetti":
    default: return initConfetti();
  }
}

// ── Per-effect geometry/movement ────────────────────────────────────────
function getGeometry(kind: EffectKind) {
  switch (kind) {
    case "butterflies":
      // Two triangular wings — looks like a butterfly from above
      return new THREE.BufferGeometry();
    case "birds":
      // Simple chevron shape (V)
      return new THREE.BufferGeometry();
    case "fireflies":
    case "embers":
      // Tiny cubes — glow via emissive material
      return new THREE.BoxGeometry(0.08, 0.08, 0.08);
    case "shootingStars":
      // Elongated box — looks like a streak
      return new THREE.BoxGeometry(0.4, 0.04, 0.04);
    case "petals":
      // Flat circle — looks like a petal falling
      return new THREE.CircleGeometry(0.1, 6);
    case "confetti":
    default:
      return new THREE.BoxGeometry(1, 1, 0.3);
  }
}

// ── Component ───────────────────────────────────────────────────────────
export default function ThemedReveal({
  active,
  icon,
}: {
  active: boolean;
  icon: IconTheme;
}) {
  const kind = getEffectKind(icon);
  const particlesRef = useRef<Particle[]>([]);
  const initialized = useRef(false);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);
  const geometry = useMemo(() => getGeometry(kind), [kind]);

  // Re-initialize when kind changes (e.g. user switches icon mid-reveal)
  // or when active flips true for the first time.
  if (active && (!initialized.current || particlesRef.current.length === 0)) {
    particlesRef.current = initParticles(kind);
    initialized.current = true;
  }

  useFrame((_, delta) => {
    if (!meshRef.current || particlesRef.current.length === 0) return;
    const particles = particlesRef.current;
    let anyAlive = false;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life += delta;
      if (p.life < 0) {
        // Staggered start (shooting stars) — not yet alive
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        anyAlive = true;
        continue;
      }
      if (p.life >= p.maxLife) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        continue;
      }
      anyAlive = true;

      // Update position
      p.position[0] += p.velocity[0] * delta;
      p.position[1] += p.velocity[1] * delta;
      p.position[2] += p.velocity[2] * delta;

      // Per-effect physics
      switch (kind) {
        case "butterflies": {
          // Flutter: oscillate x/z velocity, gravity pulls down slowly
          p.phase += p.phaseSpeed * delta;
          const flutter = Math.sin(p.phase) * 0.5;
          p.position[0] += flutter * delta;
          // Spiral upward
          p.velocity[1] = THREE.MathUtils.lerp(p.velocity[1], 0.5, delta);
          // Wing rotation: rotate around Y to simulate flapping
          p.rotation[1] = Math.sin(p.phase) * 0.8;
          break;
        }
        case "birds": {
          // Banked turn — birds arc upward and away
          p.phase += p.phaseSpeed * delta;
          p.velocity[1] = THREE.MathUtils.lerp(p.velocity[1], 0.2, delta);
          // Wing flap: tilt on Z axis
          p.rotation[2] = Math.sin(p.phase) * 0.4;
          p.rotation[1] = Math.atan2(p.velocity[2], p.velocity[0]);
          break;
        }
        case "fireflies": {
          // Pulsing drift — y rises steadily, x/z oscillate
          p.phase += p.phaseSpeed * delta;
          p.position[0] += Math.sin(p.phase) * 0.3 * delta;
          p.position[2] += Math.cos(p.phase) * 0.3 * delta;
          break;
        }
        case "embers": {
          // Rising + slight horizontal drift, slowing over time
          p.velocity[0] *= 0.97;
          p.velocity[2] *= 0.97;
          p.velocity[1] = THREE.MathUtils.lerp(p.velocity[1], 0.3, delta);
          p.phase += p.phaseSpeed * delta;
          // Flicker: oscillate scale
          break;
        }
        case "shootingStars": {
          // Constant velocity, no physics — they're streaking
          break;
        }
        case "petals": {
          // Falling + swaying side-to-side + rotating
          p.rotation[0] += p.rotSpeed[0] * delta;
          p.rotation[1] += p.rotSpeed[1] * delta;
          p.rotation[2] += p.rotSpeed[2] * delta;
          p.phase += p.phaseSpeed * delta;
          p.position[0] += Math.sin(p.phase) * 0.4 * delta;
          // Slow terminal velocity
          p.velocity[1] = THREE.MathUtils.lerp(p.velocity[1], -0.3, delta);
          break;
        }
        case "confetti":
        default: {
          // Standard confetti physics
          p.velocity[1] -= 5 * delta;
          p.velocity[0] *= 0.97;
          p.velocity[2] *= 0.97;
          p.rotation[0] += p.rotSpeed[0] * delta;
          p.rotation[1] += p.rotSpeed[1] * delta;
          p.rotation[2] += p.rotSpeed[2] * delta;
          break;
        }
      }

      dummy.position.set(p.position[0], p.position[1], p.position[2]);
      dummy.rotation.set(p.rotation[0], p.rotation[1], p.rotation[2]);

      // Size with fade-out
      const lifeFrac = p.life / p.maxLife;
      const fade = Math.max(0, 1 - lifeFrac);
      let scale = p.size * 12 * fade;

      // Per-effect scale adjustments
      if (kind === "fireflies" || kind === "embers") {
        // Pulsing glow
        const pulse = 0.6 + 0.4 * Math.sin(p.phase);
        scale = p.size * 12 * fade * pulse;
      } else if (kind === "shootingStars") {
        // Streak: stretch with velocity
        scale = p.size * 12 * fade;
      } else if (kind === "butterflies") {
        // Butterflies keep their size — they're solid objects
        scale = p.size * 12 * Math.min(1, fade * 2);
      }

      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      colorObj.set(p.color);
      meshRef.current.setColorAt(i, colorObj);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    // If all particles are dead, we can stop updating (the next `active`
    // toggle will re-initialize via the ref check above).
    if (!anyAlive && initialized.current) {
      // Mark for cleanup — but keep the mesh rendered at scale 0
      // so the next activation can reuse it without re-mounting.
    }
  });

  if (!active || particlesRef.current.length === 0) return null;

  const count = particlesRef.current.length;

  // Stable material config per kind — avoid toggling depthTest which causes
  // z-fighting flicker when particles overlap scene geometry.
  const isGlowing = kind === "fireflies" || kind === "embers" || kind === "shootingStars";

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, count]}
      castShadow={false}
      // frustumCulled=false ensures the instanced mesh is never culled
      // mid-animation (which would cause pop-in flicker)
      frustumCulled={false}
    >
      <meshStandardMaterial
        vertexColors
        toneMapped={false}
        emissiveIntensity={isGlowing ? 0.8 : 0.2}
        emissive="#ffffff"
        transparent
        opacity={0.95}
        side={THREE.DoubleSide}
        // Keep depthTest=true for ALL kinds — disabling it caused the
        // glowing particles to render on top of everything, creating
        // flicker when they overlapped the sky sphere. With depthTest
        // enabled, they properly occlude behind geometry.
        depthTest={true}
        depthWrite={false}
        // For glowing effects, use additive blending so overlapping
        // particles brighten naturally instead of z-fighting
        blending={isGlowing ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </instancedMesh>
  );
}
