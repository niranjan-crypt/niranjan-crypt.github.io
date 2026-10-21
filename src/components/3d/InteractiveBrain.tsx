import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 1. Procedural Cybernetic Brain Geometry Construction
// ---------------------------------------------------------------------------

interface LobeGeometries {
  leftHullGeom: THREE.BufferGeometry;
  leftWireGeom: THREE.BufferGeometry;
  rightHullGeom: THREE.BufferGeometry;
  rightWireGeom: THREE.BufferGeometry;
  cerebellumGeom: THREE.BufferGeometry;
  brainstemGeom: THREE.BufferGeometry;
  nodeData: { pos: [number, number, number]; phase: number; scale: number }[];
}

function generateBrainGeometries(): LobeGeometries {
  // Helper: Deform sphere into organic brain hemisphere with sulci & gyri
  function createHemisphereGeometry(isLeft: boolean): THREE.BufferGeometry {
    const geo = new THREE.SphereGeometry(1.22, 54, 40);
    const pos = geo.attributes.position;
    const sideMult = isLeft ? -1 : 1;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Oval shaping (elongated front-to-back, slightly raised superior apex)
      z *= 1.34;
      y *= 1.06;
      x *= 0.82;

      // Flatten medial cleft wall where hemispheres meet
      if ((isLeft && x > 0) || (!isLeft && x < 0)) {
        x *= 0.22;
      }

      // Organic cortical sulci & gyri displacement formula
      const angle = Math.atan2(z, x);
      const foldPattern =
        Math.sin(y * 8.0 + angle * 4.0) * 0.048 +
        Math.cos(z * 9.0) * 0.038 +
        Math.sin(x * 7.0 + y * 5.0) * 0.032;

      x += x * foldPattern + sideMult * 0.42;
      y += y * foldPattern + 0.16;
      z += z * foldPattern;

      // Lower temporal lobe protrusion
      if (y < 0 && z > -0.42 && z < 0.62) {
        y -= 0.16;
        x += sideMult * 0.14;
      }

      pos.setXYZ(i, x, y, z);
    }

    geo.computeVertexNormals();
    return geo;
  }

  // Cerebellum (Posterior base lobe with horizontal cerebellar folia / striations)
  function createCerebellumGeometry(): THREE.BufferGeometry {
    const geo = new THREE.SphereGeometry(0.56, 36, 26);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i) * 1.35;
      let y = pos.getY(i) * 0.65;
      let z = pos.getZ(i) * 0.95;

      // Fine horizontal cerebellar striations
      y += Math.sin(y * 22.0) * 0.024;
      pos.setXYZ(i, x, y, z);
    }

    geo.computeVertexNormals();
    return geo;
  }

  // Brainstem (Descending inferior spinal conduit)
  function createBrainstemGeometry(): THREE.BufferGeometry {
    const geo = new THREE.CylinderGeometry(0.19, 0.09, 1.4, 20, 14);
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

  // Generate left & right hemispheres
  const leftHull = createHemisphereGeometry(true);
  const leftWire = leftHull.clone();
  const rightHull = createHemisphereGeometry(false);
  const rightWire = rightHull.clone();

  // Cerebellum & Brainstem
  const cerebellum = createCerebellumGeometry();
  const brainstem = createBrainstemGeometry();

  // Scatter synaptic node points across cortex envelope
  const nodeCount = 42;
  const nodes: { pos: [number, number, number]; phase: number; scale: number }[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = (Math.random() - 0.5) * Math.PI;
    const isL = u > Math.PI;
    const posX = Math.cos(v) * Math.cos(u) * 0.94 + (isL ? -0.38 : 0.38);
    const posY = Math.sin(v) * 0.92 + 0.16;
    const posZ = Math.cos(v) * Math.sin(u) * 1.32;

    nodes.push({
      pos: [posX, posY, posZ],
      phase: Math.random() * Math.PI * 2,
      scale: Math.random() * 0.5 + 0.8,
    });
  }

  return {
    leftHullGeom: leftHull,
    leftWireGeom: leftWire,
    rightHullGeom: rightHull,
    rightWireGeom: rightWire,
    cerebellumGeom: cerebellum,
    brainstemGeom: brainstem,
    nodeData: nodes,
  };
}

// ---------------------------------------------------------------------------
// 2. Ambient Neural Particles in 3D Space
// ---------------------------------------------------------------------------
const AmbientNeuralDust: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 180;

  const geom = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8.5;
      positions[i + 1] = (Math.random() - 0.5) * 7.5;
      positions[i + 2] = (Math.random() - 0.5) * 7.0;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.035;
      pointsRef.current.rotation.x += delta * 0.012;
    }
  });

  return (
    <points ref={pointsRef} geometry={geom}>
      <pointsMaterial
        size={0.032}
        color="#38bdf8"
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};

// ---------------------------------------------------------------------------
// 3. Cybernetic Brain 3D Assembly with HUD Reticles & Synaptic Firing
// ---------------------------------------------------------------------------
interface CyberneticBrainProps {
  isInteracting: boolean;
}

const CyberneticBrain: React.FC<CyberneticBrainProps> = ({ isInteracting }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const nodesGroupRef = useRef<THREE.Group>(null);

  // Generate procedural geometries once
  const {
    leftHullGeom,
    leftWireGeom,
    rightHullGeom,
    rightWireGeom,
    cerebellumGeom,
    brainstemGeom,
    nodeData,
  } = useMemo(() => generateBrainGeometries(), []);

  // Shared Materials
  const materials = useMemo(() => {
    // Dark obsidian semi-transparent core hull
    const hull = new THREE.MeshStandardMaterial({
      color: '#031322',
      roughness: 0.25,
      metalness: 0.65,
      transparent: true,
      opacity: 0.88,
      depthWrite: true,
    });

    // Electric neon cyan wireframe cage
    const wire = new THREE.MeshBasicMaterial({
      color: '#22d3ee',
      wireframe: true,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
    });

    // Cerebellum & Stem Wireframe
    const subWire = new THREE.MeshBasicMaterial({
      color: '#0284c7',
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    // Concentric holographic target HUD rings
    const ring = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
    });

    // Glowing white synaptic node material
    const whiteSynapse = new THREE.MeshBasicMaterial({
      color: '#ffffff',
    });

    // Glowing cyan accent synaptic node material
    const cyanSynapse = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
    });

    return { hull, wire, subWire, ring, whiteSynapse, cyanSynapse };
  }, []);

  // Synapse node mesh instances
  const nodeSpheres = useRef<{ mesh: THREE.Mesh; phase: number; baseScale: number }[]>([]);

  // Animation Loop: Idle floating, HUD ring spinning, synaptic pulsing
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // 1. Subtle idle floating and auto-yaw rotation when not user-interacting
    if (groupRef.current && !isInteracting) {
      groupRef.current.rotation.y = -0.42 + Math.sin(t * 0.5) * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.05) * 0.055;
    }

    // 2. Rotate concentric holographic target HUD reticles in opposite directions
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 1.35;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.95;
    }

    // 3. Dynamic pulsing of synaptic nodes across cortex envelope
    nodeSpheres.current.forEach((item) => {
      const pulse = 0.72 + Math.sin(t * 4.8 + item.phase) * 0.42;
      const s = item.baseScale * pulse;
      item.mesh.scale.set(s, s, s);
    });
  });

  return (
    <group ref={groupRef} position={[0, 0.05, 0]} rotation={[0.12, -0.42, 0]}>
      {/* 1. Left Cerebral Hemisphere (Hull + Overlaid Wireframe) */}
      <group>
        <mesh geometry={leftHullGeom} material={materials.hull} />
        <mesh geometry={leftWireGeom} material={materials.wire} />
      </group>

      {/* 2. Right Cerebral Hemisphere (Hull + Overlaid Wireframe) */}
      <group>
        <mesh geometry={rightHullGeom} material={materials.hull} />
        <mesh geometry={rightWireGeom} material={materials.wire} />
      </group>

      {/* 3. Cerebellum (Posterior Inferior Lobes) */}
      <group position={[0, -0.66, -0.92]}>
        <mesh geometry={cerebellumGeom} material={materials.hull} />
        <mesh geometry={cerebellumGeom} material={materials.subWire} />
      </group>

      {/* 4. Brainstem (Descending spinal conduit) */}
      <group position={[0, -1.36, -0.22]}>
        <mesh geometry={brainstemGeom} material={materials.hull} />
        <mesh geometry={brainstemGeom} material={materials.subWire} />
      </group>

      {/* 5. Concentric Holographic HUD Target Rings at Left Temporal Lobe */}
      <group position={[1.22, -0.1, 0.22]} rotation={[0, Math.PI / 2, 0]}>
        {/* Inner Reticle Ring */}
        <mesh ref={ring1Ref}>
          <ringGeometry args={[0.18, 0.22, 32]} />
          <primitive object={materials.ring} attach="material" />
        </mesh>
        {/* Outer Reticle Ring */}
        <mesh ref={ring2Ref}>
          <ringGeometry args={[0.28, 0.31, 32]} />
          <primitive object={materials.ring} attach="material" />
        </mesh>
      </group>

      {/* 6. Dynamic Pulsing Synaptic Nodes */}
      <group ref={nodesGroupRef}>
        {nodeData.map((node, idx) => {
          const isCyan = idx % 3 === 0;
          return (
            <mesh
              key={idx}
              position={node.pos}
              ref={(el) => {
                if (el) {
                  nodeSpheres.current[idx] = {
                    mesh: el,
                    phase: node.phase,
                    baseScale: node.scale,
                  };
                }
              }}
            >
              <sphereGeometry args={[0.042, 12, 12]} />
              <primitive
                object={isCyan ? materials.cyanSynapse : materials.whiteSynapse}
                attach="material"
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 4. Main Exported Component with HUD Overlay & Three.js Canvas
// ---------------------------------------------------------------------------
export const InteractiveBrain: React.FC = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden">
      {/* Radial Obsidian/Neon Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_48%,rgba(14,165,233,0.18)_0%,rgba(3,19,34,0.35)_40%,transparent_75%)]" />

      {/* Top HUD Telemetry Indicator */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#030c16]/80 backdrop-blur-md border border-[#38bdf8]/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
        <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse shadow-[0_0_8px_#38bdf8]" />
        <span className="font-mono text-[11px] font-semibold tracking-wider text-[#38bdf8]">
          L-TEMPORAL · SYNAPSE FIRING ACTIVE
        </span>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#030a12]/70 border border-white/[0.08] font-mono text-[10px] text-zinc-400 backdrop-blur-sm tracking-wide">
        <span>360° Drag · Scroll to Zoom</span>
      </div>

      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0.0, 0.45, 4.4], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full block"
      >
        {/* Cybernetic Ambient Illumination */}
        <ambientLight intensity={0.65} color="#040d18" />

        {/* Crisp Key Specular Light */}
        <directionalLight position={[4.0, 4.5, 3.5]} intensity={2.8} color="#ffffff" />

        {/* Electric Cyan Neon Rim Light */}
        <directionalLight position={[-4.0, 2.5, -2.5]} intensity={3.0} color="#22d3ee" />

        {/* Posterior Fill Light */}
        <directionalLight position={[0.0, -3.0, 3.0]} intensity={1.5} color="#0284c7" />

        {/* Procedural Cybernetic Brain Digital Twin */}
        <CyberneticBrain isInteracting={isInteracting} />

        {/* Ambient Neural Floating Dust */}
        <AmbientNeuralDust />

        {/* Full 360-Degree Orbit Controls with Smooth Damping */}
        <OrbitControls
          ref={controlsRef}
          target={[0, -0.05, 0]}
          enablePan={false}
          enableZoom={true}
          minDistance={2.4}
          maxDistance={6.2}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.82}
          onStart={() => setIsInteracting(true)}
          onEnd={() => setIsInteracting(false)}
        />
      </Canvas>
    </div>
  );
};
