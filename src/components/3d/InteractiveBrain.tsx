import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 1. High-Resolution Circular Glow Sprite Generator
// ---------------------------------------------------------------------------
function createGlowPointTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.18, 'rgba(255, 255, 255, 0.95)');
    gradient.addColorStop(0.42, 'rgba(34, 211, 238, 0.65)');
    gradient.addColorStop(0.70, 'rgba(14, 165, 233, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// ---------------------------------------------------------------------------
// 2. Anatomical Cortical Gyri & Sulci Brain Geometry Construction
// ---------------------------------------------------------------------------
interface BrainGeometries {
  leftHullGeom: THREE.BufferGeometry;
  leftWireGeom: THREE.BufferGeometry;
  rightHullGeom: THREE.BufferGeometry;
  rightWireGeom: THREE.BufferGeometry;
  cerebellumGeom: THREE.BufferGeometry;
  brainstemGeom: THREE.BufferGeometry;
  synapticNodes: { pos: [number, number, number]; phase: number; scale: number; isKey: boolean }[];
  axonCurves: THREE.CatmullRomCurve3[];
}

function generateHyperRealisticBrainGeometries(): BrainGeometries {
  // Cortical Hemisphere with organic sulci & gyri folds
  function createCerebralHemisphere(isLeft: boolean): THREE.BufferGeometry {
    const geo = new THREE.SphereGeometry(1.28, 64, 52);
    const pos = geo.attributes.position;
    const side = isLeft ? -1 : 1;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Elongate front-to-back (Z), elevate dorsal apex (Y), compress medial-lateral (X)
      z *= 1.34;
      y *= 1.08;
      x *= 0.84;

      // Flatten medial longitudinal fissure wall where hemispheres face each other
      if ((isLeft && x > 0) || (!isLeft && x < 0)) {
        x *= 0.16;
      }

      // Multi-harmonic gyrification displacement formula (sulci & gyri)
      const angle = Math.atan2(z, x);
      const foldPattern =
        Math.sin(y * 9.2 + angle * 5.0) * 0.050 +
        Math.cos(z * 11.4 + x * 7.2) * 0.042 +
        Math.sin(x * 8.4 + y * 6.2) * 0.035 +
        Math.cos(angle * 7.5 + z * 5.0) * 0.024;

      x += x * foldPattern + side * 0.44;
      y += y * foldPattern + 0.18;
      z += z * foldPattern;

      // Temporal lobe protrusion (anterior-inferior lateral bulge)
      if (y < 0.12 && z > -0.38 && z < 0.65) {
        y -= 0.18;
        x += side * 0.18;
        z += 0.06;
      }

      // Occipital lobe posterior curvature
      if (z > 0.85) {
        y -= (z - 0.85) * 0.22;
        x *= 0.90;
      }

      // Frontal pole rounding
      if (z < -0.85) {
        y -= (-0.85 - z) * 0.12;
      }

      pos.setXYZ(i, x, y, z);
    }

    geo.computeVertexNormals();
    return geo;
  }

  // Cerebellum (Posterior base with fine horizontal folia / striations)
  function createCerebellum(): THREE.BufferGeometry {
    const geo = new THREE.SphereGeometry(0.58, 44, 32);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i) * 1.42;
      let y = pos.getY(i) * 0.68;
      let z = pos.getZ(i) * 0.94;

      // Fine horizontal cerebellar folia striations
      y += Math.sin(y * 26.0) * 0.022;
      pos.setXYZ(i, x, y, z);
    }

    geo.computeVertexNormals();
    return geo;
  }

  // Brainstem (Descending spinal conduit)
  function createBrainstem(): THREE.BufferGeometry {
    const geo = new THREE.CylinderGeometry(0.20, 0.10, 1.45, 24, 16);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      let z = pos.getZ(i);
      // Gentle natural cervical curvature
      z -= y * 0.18;
      pos.setZ(i, z);
    }

    geo.computeVertexNormals();
    return geo;
  }

  const leftHull = createCerebralHemisphere(true);
  const leftWire = leftHull.clone();
  const rightHull = createCerebralHemisphere(false);
  const rightWire = rightHull.clone();
  const cerebellum = createCerebellum();
  const brainstem = createBrainstem();

  // Synaptic Nodes distributed along key cortical folds
  const nodes: { pos: [number, number, number]; phase: number; scale: number; isKey: boolean }[] = [];
  const totalNodes = 84;

  for (let i = 0; i < totalNodes; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = (Math.random() - 0.48) * Math.PI * 0.92;
    const isL = u > Math.PI;
    const rX = Math.cos(v) * Math.cos(u) * 0.96 + (isL ? -0.42 : 0.42);
    const rY = Math.sin(v) * 0.94 + 0.18;
    const rZ = Math.cos(v) * Math.sin(u) * 1.34;

    const isTemporalFocal = isL && rY < 0.15 && rY > -0.35 && rZ > 0.1 && rZ < 0.6;
    nodes.push({
      pos: [rX, rY, rZ],
      phase: Math.random() * Math.PI * 2,
      scale: isTemporalFocal ? 1.6 : Math.random() * 0.5 + 0.8,
      isKey: isTemporalFocal || i % 6 === 0,
    });
  }

  // Specific key focal nodes at Left Temporal Lobe (matching the screenshot active synapse)
  nodes.push(
    { pos: [1.25, -0.12, 0.26], phase: 0.0, scale: 2.2, isKey: true },
    { pos: [1.18, 0.15, 0.38], phase: 1.2, scale: 1.7, isKey: true },
    { pos: [1.32, -0.28, 0.14], phase: 2.4, scale: 1.8, isKey: true },
    { pos: [0.95, -0.05, 0.52], phase: 3.1, scale: 1.5, isKey: true }
  );

  // Neural Axon Pathways (Spline tracts connecting key functional lobes)
  const axonCurves: THREE.CatmullRomCurve3[] = [
    // Temporal to Parietal circuit
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.25, -0.12, 0.26),
      new THREE.Vector3(1.15, 0.35, 0.45),
      new THREE.Vector3(0.75, 0.95, 0.30),
      new THREE.Vector3(0.35, 1.15, -0.10),
    ]),
    // Temporal to Frontal Pole circuit
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.25, -0.12, 0.26),
      new THREE.Vector3(1.05, -0.05, -0.40),
      new THREE.Vector3(0.65, 0.25, -0.95),
      new THREE.Vector3(0.20, 0.45, -1.25),
    ]),
    // Temporal to Occipital & Cerebellum pathway
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.25, -0.12, 0.26),
      new THREE.Vector3(1.10, -0.32, 0.65),
      new THREE.Vector3(0.70, -0.55, 1.05),
      new THREE.Vector3(0.15, -0.72, 0.95),
    ]),
    // Deep Brainstem descending projection
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.25, -0.12, 0.26),
      new THREE.Vector3(0.85, -0.45, 0.20),
      new THREE.Vector3(0.40, -0.85, 0.05),
      new THREE.Vector3(0.00, -1.35, -0.15),
    ]),
    // Superior sagittal arc across dorsal apex
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.40, 0.50, -1.20),
      new THREE.Vector3(0.65, 1.05, -0.50),
      new THREE.Vector3(0.60, 1.18, 0.40),
      new THREE.Vector3(0.35, 0.75, 1.10),
    ]),
    // Contralateral interhemispheric corpus callosum bridge
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.85, 0.40, 0.10),
      new THREE.Vector3(0.18, 0.55, 0.05),
      new THREE.Vector3(-0.18, 0.55, 0.05),
      new THREE.Vector3(-0.85, 0.40, 0.10),
    ]),
    // Right temporal circuit
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.20, -0.10, 0.25),
      new THREE.Vector3(-1.05, 0.40, 0.40),
      new THREE.Vector3(-0.65, 0.90, 0.25),
      new THREE.Vector3(-0.30, 1.10, -0.15),
    ]),
  ];

  return {
    leftHullGeom: leftHull,
    leftWireGeom: leftWire,
    rightHullGeom: rightHull,
    rightWireGeom: rightWire,
    cerebellumGeom: cerebellum,
    brainstemGeom: brainstem,
    synapticNodes: nodes,
    axonCurves,
  };
}

// ---------------------------------------------------------------------------
// 3. Ambient Neural Particulate Dust Cloud
// ---------------------------------------------------------------------------
const AmbientNeuralDust: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 160;

  const [geom, tex] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cyan = new THREE.Color('#38bdf8');
    const deepCyan = new THREE.Color('#00f0ff');
    const white = new THREE.Color('#ffffff');

    for (let i = 0; i < count; i++) {
      const radius = 1.2 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i * 3] = Math.cos(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(phi) * radius * 0.9;
      positions[i * 3 + 2] = Math.cos(phi) * Math.sin(theta) * radius * 1.2;

      const r = Math.random();
      const c = r < 0.65 ? cyan : r < 0.88 ? deepCyan : white;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return [g, createGlowPointTexture()];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime * 0.08;
    pointsRef.current.rotation.y = t;
    pointsRef.current.rotation.x = Math.sin(t * 0.5) * 0.12;
  });

  return (
    <points ref={pointsRef} geometry={geom}>
      <pointsMaterial
        size={0.038}
        map={tex}
        vertexColors
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

// ---------------------------------------------------------------------------
// 4. Descending Brainstem Laser Fiber Streaks (Spinal Conduit Light Beams)
// ---------------------------------------------------------------------------
const BrainstemLaserBeams: React.FC = () => {
  const linesRef = useRef<THREE.LineSegments>(null);
  const beamCount = 14;

  const geom = useMemo(() => {
    const positions = new Float32Array(beamCount * 2 * 3);
    const colors = new Float32Array(beamCount * 2 * 3);
    const cyan = new THREE.Color('#00f0ff');
    const darkCyan = new THREE.Color('#0369a1');

    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2;
      const radius = 0.08 + Math.random() * 0.12;
      const startX = Math.cos(angle) * radius;
      const startZ = Math.sin(angle) * radius - 0.22;
      const startY = -1.15;
      const len = 0.85 + Math.random() * 0.95;
      const endY = startY - len;

      const idx = i * 6;
      // Start vertex (near brainstem base)
      positions[idx] = startX;
      positions[idx + 1] = startY;
      positions[idx + 2] = startZ;
      colors[idx] = cyan.r;
      colors[idx + 1] = cyan.g;
      colors[idx + 2] = cyan.b;

      // End vertex (tapering downwards)
      positions[idx + 3] = startX * 0.6;
      positions[idx + 4] = endY;
      positions[idx + 5] = startZ * 0.6 - (startY - endY) * 0.15;
      colors[idx + 3] = darkCyan.r;
      colors[idx + 4] = darkCyan.g;
      colors[idx + 5] = darkCyan.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [beamCount]);

  useFrame((state) => {
    if (linesRef.current) {
      const mat = linesRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 4.2) * 0.25;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={geom}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        linewidth={1.5}
      />
    </lineSegments>
  );
};

// ---------------------------------------------------------------------------
// 5. Holographic Target Reticle on Left Temporal Lobe (Matches Screenshot)
// ---------------------------------------------------------------------------
interface ReticleProps {
  position: [number, number, number];
}

const TemporalLobeReticle: React.FC<ReticleProps> = ({ position }) => {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = -t * 1.15;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = t * 1.65;
    }
    if (beaconRef.current) {
      const p = 1.0 + Math.sin(t * 7.5) * 0.45;
      beaconRef.current.scale.set(p, p, p);
    }
  });

  return (
    <group position={position} rotation={[0, Math.PI * 0.45, 0]}>
      {/* Central High-Intensity Synaptic Beacon */}
      <mesh ref={beaconRef}>
        <sphereGeometry args={[0.048, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Inner Concentric Target Reticle Ring */}
      <mesh ref={innerRingRef}>
        <ringGeometry args={[0.16, 0.20, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          side={THREE.DoubleSide}
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Segmented Concentric Target Ring */}
      <mesh ref={outerRingRef}>
        <ringGeometry args={[0.27, 0.31, 32]} />
        <meshBasicMaterial
          color="#22d3ee"
          side={THREE.DoubleSide}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Crosshair Tick Reticle Axes */}
      <group>
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[0.76, 0.008]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.55} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[0.008, 0.76]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.55} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 6. Holographic HUD Telemetry Floating Markers in 3D Space
// ---------------------------------------------------------------------------
const FloatingHUDTelemetry: React.FC = () => {
  return (
    <group>
      {/* Tech coordinate ticks and crosshairs in 3D space */}
      {[
        { pos: [-1.8, 1.2, 0.5], label: '+42.812° N' },
        { pos: [1.7, 1.3, -0.4], label: 'VOX: 142.6' },
        { pos: [-1.6, -1.0, 0.8], label: 'GLCM: 0.892' },
        { pos: [1.6, -0.9, 0.6], label: 'SYS.VEC' },
      ].map((item, idx) => (
        <group key={idx} position={item.pos as [number, number, number]}>
          {/* Subtle crosshair plus sign */}
          <mesh>
            <planeGeometry args={[0.08, 0.006]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh>
            <planeGeometry args={[0.006, 0.08]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// 7. Full Cybernetic AI Neon Brain Model
// ---------------------------------------------------------------------------
interface CyberneticBrainModelProps {
  isInteracting: boolean;
}

const CyberneticBrainModel: React.FC<CyberneticBrainModelProps> = ({ isInteracting }) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const actionPulseSpheresRef = useRef<{ mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; speed: number; offset: number }[]>([]);
  const synapticNodeMeshesRef = useRef<{ mesh: THREE.Mesh; phase: number; baseScale: number }[]>([]);

  // Generate procedural brain structures once
  const brainGeom = useMemo(() => generateHyperRealisticBrainGeometries(), []);

  // Multi-layered cybernetic materials
  const materials = useMemo(() => {
    // 1. Deep Obsidian / Dark Teal Volumetric Translucent Hull
    const hullMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#031220'),
      roughness: 0.15,
      metalness: 0.45,
      transmission: 0.80,
      ior: 1.45,
      thickness: 1.2,
      specularColor: new THREE.Color('#38bdf8'),
      specularIntensity: 2.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      attenuationColor: new THREE.Color('#00f0ff'),
      attenuationDistance: 0.65,
      transparent: true,
      opacity: 0.90,
      depthWrite: true,
    });

    // 2. Glowing Electric Neon Cyan Cortical Wireframe Overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00f0ff'),
      wireframe: true,
      transparent: true,
      opacity: 0.58,
      blending: THREE.AdditiveBlending,
    });

    // 3. Cerebellum Sub-Wire Material
    const cerebellumWireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#0284c7'),
      wireframe: true,
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending,
    });

    // 4. Glowing Neural Axon Tubes
    const axonMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#22d3ee'),
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending,
    });

    // 5. White Hot Action Potential Pulse Material
    const actionPulseMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffffff'),
    });

    // 6. Glowing Synaptic Node Materials
    const cyanNodeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#38bdf8'),
    });
    const whiteNodeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffffff'),
    });

    return {
      hullMat,
      wireMat,
      cerebellumWireMat,
      axonMat,
      actionPulseMat,
      cyanNodeMat,
      whiteNodeMat,
    };
  }, []);

  // Axon Tube Geometries
  const axonTubeGeometries = useMemo(() => {
    return brainGeom.axonCurves.map((curve) => new THREE.TubeGeometry(curve, 32, 0.012, 6, false));
  }, [brainGeom.axonCurves]);

  // Main Animation Loop
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // 1. Idle auto-yaw drift and organic breathing when user is not dragging
    if (rootGroupRef.current && !isInteracting) {
      rootGroupRef.current.rotation.y = -0.42 + Math.sin(t * 0.42) * 0.22;
      rootGroupRef.current.position.y = Math.sin(t * 1.1) * 0.045;
    }

    // 2. Action potential pulses traveling dynamically along axon pathways
    actionPulseSpheresRef.current.forEach((pulse) => {
      const progress = (t * pulse.speed + pulse.offset) % 1.0;
      const pt = pulse.curve.getPointAt(progress);
      pulse.mesh.position.copy(pt);
      const s = 0.8 + Math.sin(progress * Math.PI) * 0.5;
      pulse.mesh.scale.set(s, s, s);
    });

    // 3. Dynamic pulsing of cortical synaptic nodes
    synapticNodeMeshesRef.current.forEach((item) => {
      const pulse = 0.75 + Math.sin(t * 4.6 + item.phase) * 0.45;
      const s = item.baseScale * pulse;
      item.mesh.scale.set(s, s, s);
    });
  });

  return (
    <group ref={rootGroupRef} position={[0, 0.06, 0]} rotation={[0.10, -0.42, 0]}>
      {/* 1. Left Cerebral Hemisphere (Obsidian Glass Core + Neon Wireframe) */}
      <group>
        <mesh geometry={brainGeom.leftHullGeom} material={materials.hullMat} />
        <mesh geometry={brainGeom.leftWireGeom} material={materials.wireMat} />
      </group>

      {/* 2. Right Cerebral Hemisphere (Obsidian Glass Core + Neon Wireframe) */}
      <group>
        <mesh geometry={brainGeom.rightHullGeom} material={materials.hullMat} />
        <mesh geometry={brainGeom.rightWireGeom} material={materials.wireMat} />
      </group>

      {/* 3. Cerebellum (Posterior Inferior Lobes with Folia Striations) */}
      <group position={[0, -0.68, 0.94]}>
        <mesh geometry={brainGeom.cerebellumGeom} material={materials.hullMat} />
        <mesh geometry={brainGeom.cerebellumGeom} material={materials.cerebellumWireMat} />
      </group>

      {/* 4. Brainstem (Descending Cervical Spinal Conduit) */}
      <group position={[0, -1.38, -0.20]}>
        <mesh geometry={brainGeom.brainstemGeom} material={materials.hullMat} />
        <mesh geometry={brainGeom.brainstemGeom} material={materials.cerebellumWireMat} />
      </group>

      {/* 5. Descending Spinal Laser Fiber Streaks */}
      <BrainstemLaserBeams />

      {/* 6. Neural Axon Spline Pathways */}
      {axonTubeGeometries.map((tubeGeo, idx) => (
        <mesh key={idx} geometry={tubeGeo} material={materials.axonMat} />
      ))}

      {/* 7. Action Potential Traveling Pulses */}
      {brainGeom.axonCurves.map((curve, idx) => (
        <mesh
          key={`pulse-${idx}`}
          ref={(el) => {
            if (el) {
              actionPulseSpheresRef.current[idx] = {
                mesh: el,
                curve,
                speed: 0.35 + (idx % 3) * 0.12,
                offset: (idx * 0.18) % 1.0,
              };
            }
          }}
        >
          <sphereGeometry args={[0.034, 12, 12]} />
          <primitive object={materials.actionPulseMat} attach="material" />
        </mesh>
      ))}

      {/* 8. Active Temporal Lobe Holographic Target Reticle */}
      <TemporalLobeReticle position={[1.25, -0.12, 0.26]} />

      {/* 9. Cortical Synaptic Firing Nodes Cloud */}
      <group>
        {brainGeom.synapticNodes.map((node, idx) => {
          const isWhite = node.isKey || idx % 4 === 0;
          return (
            <mesh
              key={`node-${idx}`}
              position={node.pos}
              ref={(el) => {
                if (el) {
                  synapticNodeMeshesRef.current[idx] = {
                    mesh: el,
                    phase: node.phase,
                    baseScale: node.scale,
                  };
                }
              }}
            >
              <sphereGeometry args={[node.isKey ? 0.044 : 0.032, 10, 10]} />
              <primitive
                object={isWhite ? materials.whiteNodeMat : materials.cyanNodeMat}
                attach="material"
              />
            </mesh>
          );
        })}
      </group>

      {/* 10. Floating HUD Telemetry Markers */}
      <FloatingHUDTelemetry />
    </group>
  );
};

// ---------------------------------------------------------------------------
// 8. Main Exported Component with HUD Overlay & Three.js Canvas
// ---------------------------------------------------------------------------
export const InteractiveBrain: React.FC = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-[inherit]">
      {/* Cinematic Radial Obsidian/Neon Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_46%,rgba(14,165,233,0.22)_0%,rgba(3,19,34,0.45)_45%,transparent_78%)]" />

      {/* Top HUD Telemetry Indicator (Exact Match to Design System) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#030c16]/85 backdrop-blur-md border border-[#38bdf8]/30 shadow-[0_0_18px_rgba(56,189,248,0.20)]">
        <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse shadow-[0_0_8px_#38bdf8]" />
        <span className="font-mono text-[11px] font-semibold tracking-wider text-[#38bdf8]">
          L-TEMPORAL · SYNAPSE FIRING ACTIVE
        </span>
      </div>

      {/* Bottom 360° Interaction Hint */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#030a12]/80 border border-white/[0.08] font-mono text-[10px] text-zinc-400 backdrop-blur-md tracking-wider shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mr-0.5" />
        <span>360° Drag · Scroll to Zoom</span>
      </div>

      {/* Interactive 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0.0, 0.25, 4.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full block"
      >
        {/* Ambient Illumination */}
        <ambientLight intensity={0.55} color="#03101c" />

        {/* Primary Specular Key Light */}
        <directionalLight position={[4.5, 4.5, 3.8]} intensity={3.0} color="#ffffff" />

        {/* Electric Cyan Neon Rim Light */}
        <directionalLight position={[-4.5, 2.5, -2.8]} intensity={3.2} color="#00f0ff" />

        {/* Deep Sapphire Posterior Fill Light */}
        <directionalLight position={[0.0, -3.2, 3.2]} intensity={1.8} color="#0284c7" />

        {/* Subtle Violet Uplight */}
        <pointLight position={[0, -2.5, 1.5]} intensity={1.2} color="#818cf8" distance={7} />

        {/* Cybernetic Brain Model Assembly */}
        <CyberneticBrainModel isInteracting={isInteracting} />

        {/* Ambient Neural Floating Dust */}
        <AmbientNeuralDust />

        {/* Full 360-Degree Orbit Controls with Smooth Inertial Damping */}
        <OrbitControls
          ref={controlsRef}
          target={[0, 0.02, 0]}
          enablePan={false}
          enableZoom={true}
          minDistance={2.4}
          maxDistance={5.6}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.85}
          onStart={() => setIsInteracting(true)}
          onEnd={() => setIsInteracting(false)}
        />
      </Canvas>
    </div>
  );
};

export default InteractiveBrain;
