import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 1. Particle Glow Texture Generator
// ---------------------------------------------------------------------------
function createParticleGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(56, 189, 248, 0.9)');
    gradient.addColorStop(0.55, 'rgba(14, 165, 233, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

// ---------------------------------------------------------------------------
// 2. Ambient Floating Telemetry Particles (Image 2 Stardust Field)
// ---------------------------------------------------------------------------
const AmbientTelemetryParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 120;

  const [geom, tex] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cyan = new THREE.Color('#38bdf8');
    const silver = new THREE.Color('#e0f2fe');

    for (let i = 0; i < count; i++) {
      const radius = 0.55 + Math.random() * 1.35;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.4) * 2.4;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.45;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const c = Math.random() < 0.75 ? cyan : silver;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return [g, createParticleGlowTexture()];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime * 0.35;
    for (let i = 0; i < count; i++) {
      let py = pos.getY(i) + Math.sin(t + i * 0.16) * 0.0014;
      if (py > 1.6) py = -1.1;
      pos.setY(i, py);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geom}>
      <pointsMaterial
        size={0.032}
        map={tex}
        vertexColors
        transparent
        opacity={0.82}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

// ---------------------------------------------------------------------------
// 3. Tapered Anatomical Phalanx Geometry Generator
// ---------------------------------------------------------------------------
function createTaperedPhalanxGeometry(baseRad: number, tipRad: number, length: number, isTip = false) {
  const slices = isTip ? 16 : 12;
  const radialSegs = 20;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= slices; i++) {
    const v = i / slices;
    let r: number, y: number;
    if (!isTip) {
      y = v * length;
      const taper = baseRad + (tipRad - baseRad) * v;
      const swell = Math.sin(v * Math.PI) * (baseRad * 0.08);
      r = taper + swell;
    } else {
      if (v < 0.65) {
        const t = v / 0.65;
        y = t * length * 0.65;
        r = baseRad + (tipRad - baseRad) * t;
      } else {
        const t = (v - 0.65) / 0.35;
        const domeAngle = t * Math.PI * 0.5;
        y = length * 0.65 + Math.sin(domeAngle) * tipRad * 1.05;
        r = Math.cos(domeAngle) * tipRad;
      }
    }

    for (let j = 0; j <= radialSegs; j++) {
      const u = j / radialSegs;
      const angle = u * Math.PI * 2;
      const px = Math.cos(angle) * r;
      const pz = Math.sin(angle) * (r * 0.92);
      positions.push(px, y, pz);
      uvs.push(u, v);
    }
  }

  for (let i = 0; i < slices; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * (radialSegs + 1) + j;
      const b = (i + 1) * (radialSegs + 1) + j;
      const c = (i + 1) * (radialSegs + 1) + (j + 1);
      const d = i * (radialSegs + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// ---------------------------------------------------------------------------
// 4. Organic Parametric Palm Geometry Generator (Matches Image 2 Silhouette)
// ---------------------------------------------------------------------------
function createOrganicPalmGeometry() {
  const slices = 20;
  const radialSegments = 32;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= slices; i++) {
    const v = i / slices;
    // y extends from -0.45 (wrist transition) to +0.52 (knuckle arch)
    const y = -0.45 + v * 0.97;

    let halfWidth: number, halfDepth: number, cx: number, cz: number;
    if (v < 0.2) {
      const t = v / 0.2;
      halfWidth = 0.22 + t * 0.08;
      halfDepth = 0.11 + t * 0.02;
      cx = 0.02 * t;
      cz = 0;
    } else if (v < 0.6) {
      const t = (v - 0.2) / 0.4;
      halfWidth = 0.30 + t * 0.04;
      halfDepth = 0.13 - t * 0.01;
      cx = 0.02 + Math.sin(t * Math.PI) * 0.04;
      cz = -0.012 * Math.sin(t * Math.PI);
    } else {
      const t = (v - 0.6) / 0.4;
      halfWidth = 0.34 - t * 0.02;
      halfDepth = 0.12 - t * 0.03;
      cx = 0.02 - t * 0.04;
      cz = 0.01 * t;
    }

    for (let j = 0; j <= radialSegments; j++) {
      const u = j / radialSegments;
      const angle = u * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const depthFactor = sinA > 0 ? 0.95 : 1.1;
      const widthFactor = cosA > 0 ? (1.0 + 0.12 * Math.sin(v * Math.PI)) : 1.0;

      const px = cx + cosA * halfWidth * widthFactor;
      const pz = cz + sinA * halfDepth * depthFactor;

      let py = y;
      if (v > 0.7) {
        const topT = (v - 0.7) / 0.3;
        const arch = Math.cos((px - 0.06) * 3.5) * 0.05 * topT;
        py += arch;
      }

      positions.push(px, py, pz);
      uvs.push(u, v);
    }
  }

  for (let i = 0; i < slices; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = (i + 1) * (radialSegments + 1) + j;
      const c = (i + 1) * (radialSegments + 1) + (j + 1);
      const d = i * (radialSegments + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// ---------------------------------------------------------------------------
// 5. Elongated Tapered Forearm Geometry Generator (No Pedestal / No Stand)
// ---------------------------------------------------------------------------
function createElongatedForearmGeometry() {
  const slices = 16;
  const radialSegments = 24;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // y extends from -1.35 (bottom of viewport) up to -0.45 (wrist)
  for (let i = 0; i <= slices; i++) {
    const v = i / slices;
    const y = -1.35 + v * 0.90;

    // Graceful organic taper from wrist down to forearm entry
    const t = v; // 0 = bottom, 1 = wrist
    const halfWidth = 0.17 + t * 0.045;
    const halfDepth = 0.10 + t * 0.015;

    for (let j = 0; j <= radialSegments; j++) {
      const u = j / radialSegments;
      const angle = u * Math.PI * 2;
      const px = Math.cos(angle) * halfWidth;
      const pz = Math.sin(angle) * halfDepth;

      positions.push(px, y, pz);
      uvs.push(u, v);
    }
  }

  for (let i = 0; i < slices; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = (i + 1) * (radialSegments + 1) + j;
      const c = (i + 1) * (radialSegments + 1) + (j + 1);
      const d = i * (radialSegments + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// ---------------------------------------------------------------------------
// 6. Articulated Mechanical Joint Assembly (Hinges, Pivot Discs, Sensor Nodes)
// ---------------------------------------------------------------------------
const ArticulatedJointKnuckle: React.FC<{ radius: number; flexGlow: number }> = ({ radius, flexGlow }) => {
  return (
    <group>
      {/* Precision-Machined Titanium Hinge Pin */}
      <mesh rotation={[0, 0, Math.PI * 0.5]}>
        <cylinderGeometry args={[radius * 0.42, radius * 0.42, radius * 1.35, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.22} metalness={0.96} />
      </mesh>

      {/* Lateral Circular Pivot Mechanism Discs */}
      <mesh position={[radius * 0.65, 0, 0]} rotation={[0, 0, Math.PI * 0.5]}>
        <cylinderGeometry args={[radius * 0.52, radius * 0.52, 0.02, 16]} />
        <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.92} />
      </mesh>
      <mesh position={[-radius * 0.65, 0, 0]} rotation={[0, 0, Math.PI * 0.5]}>
        <cylinderGeometry args={[radius * 0.52, radius * 0.52, 0.02, 16]} />
        <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.92} />
      </mesh>

      {/* Transparent Glass Knuckle Protective Housing */}
      <mesh>
        <sphereGeometry args={[radius * 1.08, 16, 16]} />
        <meshPhysicalMaterial
          color="#c8ebff"
          transparent
          opacity={0.32}
          roughness={0.12}
          metalness={0.15}
          transmission={0.82}
          clearcoat={1.0}
        />
      </mesh>

      {/* Equatorial Luminous Cyan Sensor Ring */}
      <mesh rotation={[Math.PI * 0.5, 0, 0]}>
        <torusGeometry args={[radius * 1.14, 0.012, 10, 24]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#00f0ff"
          emissiveIntensity={1.0 + flexGlow * 2.0}
          roughness={0.2}
        />
      </mesh>

      {/* Active Sensor Node Diode */}
      <mesh position={[0, 0, radius * 1.05]}>
        <sphereGeometry args={[0.016, 10, 10]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#38bdf8"
          emissiveIntensity={2.0 + flexGlow * 2.5}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 7. Articulated Cybernetic Finger Component (Anatomical Hierarchy)
// ---------------------------------------------------------------------------
interface CyberFingerProps {
  basePos: [number, number, number];
  baseRot: [number, number, number];
  pLen: number; // Proximal length
  iLen: number; // Intermediate length
  dLen: number; // Distal length
  pRadB: number; // Proximal base radius
  pRadT: number; // Proximal tip radius
  iRadB: number; // Intermediate base radius
  iRadT: number; // Intermediate tip radius
  dRadB: number; // Distal base radius
  dRadT: number; // Distal tip radius
  flexAmount: number;
  isThumb?: boolean;
}

const ArticulatedCyberFinger: React.FC<CyberFingerProps> = ({
  basePos,
  baseRot,
  pLen,
  iLen,
  dLen,
  pRadB,
  pRadT,
  iRadB,
  iRadT,
  dRadB,
  dRadT,
  flexAmount,
  isThumb = false,
}) => {
  const mcpRef = useRef<THREE.Group>(null);
  const pipRef = useRef<THREE.Group>(null);
  const dipRef = useRef<THREE.Group>(null);

  // Generate unique tapered geometries for each phalanx segment
  const [pGeom, iGeom, dGeom] = useMemo(() => {
    return [
      createTaperedPhalanxGeometry(pRadB, pRadT, pLen),
      createTaperedPhalanxGeometry(iRadB, iRadT, iLen),
      createTaperedPhalanxGeometry(dRadB, dRadT, dLen, true),
    ];
  }, [pRadB, pRadT, pLen, iRadB, iRadT, iLen, dRadB, dRadT, dLen]);

  useFrame(() => {
    if (isThumb) {
      if (mcpRef.current) {
        mcpRef.current.rotation.x = -flexAmount * 0.44;
        mcpRef.current.rotation.z = -flexAmount * 0.36;
      }
      if (pipRef.current) {
        pipRef.current.rotation.x = -flexAmount * 0.62;
      }
      if (dipRef.current) {
        dipRef.current.rotation.x = -flexAmount * 0.50;
      }
    } else {
      if (mcpRef.current) {
        mcpRef.current.rotation.x = -flexAmount * 0.52; // MCP ~48°
      }
      if (pipRef.current) {
        pipRef.current.rotation.x = -flexAmount * 0.78; // PIP ~78°
      }
      if (dipRef.current) {
        dipRef.current.rotation.x = -flexAmount * 0.46; // DIP ~42°
      }
    }
  });

  return (
    <group position={basePos} rotation={baseRot}>
      {/* MCP Joint Knuckle Assembly */}
      <ArticulatedJointKnuckle radius={pRadB} flexGlow={flexAmount} />

      {/* Proximal Segment Hierarchy */}
      <group ref={mcpRef}>
        {/* Glass Outer Phalanx Shell */}
        <mesh geometry={pGeom}>
          <meshPhysicalMaterial
            color="#c8ebff"
            transparent
            opacity={0.34}
            roughness={0.12}
            metalness={0.15}
            transmission={0.82}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>
        {/* Luminous Cyan Wireframe Lattice Overlay */}
        <mesh geometry={pGeom}>
          <meshBasicMaterial
            color="#38bdf8"
            wireframe
            transparent
            opacity={0.52 + flexAmount * 0.35}
          />
        </mesh>
        {/* Internal Titanium Tendon Core */}
        <mesh position={[0, pLen * 0.5, 0]}>
          <cylinderGeometry args={[pRadB * 0.28, pRadT * 0.28, pLen * 0.88, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.92} />
        </mesh>
        {/* Luminous Cyan Fiber-Optic Telemetry Conduit */}
        <mesh position={[0, pLen * 0.5, pRadB * 0.22]}>
          <cylinderGeometry args={[pRadB * 0.10, pRadT * 0.10, pLen * 0.94, 8]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#00f0ff"
            emissiveIntensity={0.8 + flexAmount * 2.2}
            roughness={0.2}
          />
        </mesh>

        {/* PIP Joint */}
        <group position={[0, pLen, 0]}>
          <ArticulatedJointKnuckle radius={iRadB} flexGlow={flexAmount} />

          {/* Intermediate Segment Hierarchy */}
          <group ref={pipRef}>
            <mesh geometry={iGeom}>
              <meshPhysicalMaterial
                color="#c8ebff"
                transparent
                opacity={0.34}
                roughness={0.12}
                metalness={0.15}
                transmission={0.82}
                clearcoat={1.0}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh geometry={iGeom}>
              <meshBasicMaterial
                color="#38bdf8"
                wireframe
                transparent
                opacity={0.52 + flexAmount * 0.35}
              />
            </mesh>
            <mesh position={[0, iLen * 0.5, 0]}>
              <cylinderGeometry args={[iRadB * 0.28, iRadT * 0.28, iLen * 0.88, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.92} />
            </mesh>
            <mesh position={[0, iLen * 0.5, iRadB * 0.22]}>
              <cylinderGeometry args={[iRadB * 0.10, iRadT * 0.10, iLen * 0.94, 8]} />
              <meshStandardMaterial
                color="#0284c7"
                emissive="#00f0ff"
                emissiveIntensity={0.8 + flexAmount * 2.2}
                roughness={0.2}
              />
            </mesh>

            {/* DIP Joint */}
            <group position={[0, iLen, 0]}>
              <ArticulatedJointKnuckle radius={dRadB} flexGlow={flexAmount} />

              {/* Distal Segment with Rounded Fingertip Dome */}
              <group ref={dipRef}>
                <mesh geometry={dGeom}>
                  <meshPhysicalMaterial
                    color="#c8ebff"
                    transparent
                    opacity={0.34}
                    roughness={0.12}
                    metalness={0.15}
                    transmission={0.82}
                    clearcoat={1.0}
                    clearcoatRoughness={0.1}
                  />
                </mesh>
                <mesh geometry={dGeom}>
                  <meshBasicMaterial
                    color="#38bdf8"
                    wireframe
                    transparent
                    opacity={0.52 + flexAmount * 0.35}
                  />
                </mesh>
                {/* Internal Fingertip Micro-Sensor Node */}
                <mesh position={[0, dLen * 0.65, dRadB * 0.18]}>
                  <sphereGeometry args={[dRadB * 0.28, 12, 12]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive="#38bdf8"
                    emissiveIntensity={1.8 + flexAmount * 2.5}
                    roughness={0.1}
                  />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 8. Master Cybernetic Hand Model (Matching Image 2 Reference)
// ---------------------------------------------------------------------------
interface CyberHandModelProps {
  isInteracting: boolean;
  onActiveChannelChange: (channel: string) => void;
}

const CyberneticHandModel: React.FC<CyberHandModelProps> = ({ isInteracting, onActiveChannelChange }) => {
  const rootRef = useRef<THREE.Group>(null);
  const ppgPulseRef = useRef<THREE.MeshStandardMaterial>(null);

  // 5-Channel Flex Telemetry States [Thumb, Index, Middle, Ring, Pinky]
  const [flexValues, setFlexValues] = useState<number[]>([0, 0, 0, 0, 0]);

  // Smooth Hermite Interpolation helper
  const smooth = (t: number) => t * t * (3 - 2 * t);

  const getFingerBell = (cycleTime: number, start: number, dur: number) => {
    if (cycleTime < start || cycleTime > start + dur) return 0;
    const p = (cycleTime - start) / dur;
    return p < 0.5 ? smooth(p * 2) : smooth((1 - p) * 2);
  };

  // Generate Custom Organic Palm & Forearm Geometries
  const [palmGeom, forearmGeom] = useMemo(() => {
    return [createOrganicPalmGeometry(), createElongatedForearmGeometry()];
  }, []);

  // Palm Cybernetic Circuit Paths (Matching Image 2)
  const palmCircuitCurves = useMemo(() => {
    return [
      // Wrist to Thumb
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.04, -0.42, 0.08),
        new THREE.Vector3(0.16, -0.22, 0.09),
        new THREE.Vector3(0.28, -0.06, 0.07),
        new THREE.Vector3(0.33, 0.02, 0.05),
      ]),
      // Wrist to Index
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.02, -0.42, 0.08),
        new THREE.Vector3(0.10, -0.10, 0.09),
        new THREE.Vector3(0.18, 0.22, 0.07),
        new THREE.Vector3(0.24, 0.49, 0.04),
      ]),
      // Wrist to Middle
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, -0.42, 0.08),
        new THREE.Vector3(0.02, -0.05, 0.09),
        new THREE.Vector3(0.05, 0.28, 0.08),
        new THREE.Vector3(0.07, 0.55, 0.05),
      ]),
      // Wrist to Ring
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.02, -0.42, 0.08),
        new THREE.Vector3(-0.05, -0.10, 0.08),
        new THREE.Vector3(-0.08, 0.22, 0.06),
        new THREE.Vector3(-0.10, 0.50, 0.04),
      ]),
      // Wrist to Pinky
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.04, -0.42, 0.08),
        new THREE.Vector3(-0.14, -0.22, 0.07),
        new THREE.Vector3(-0.22, 0.10, 0.05),
        new THREE.Vector3(-0.27, 0.40, 0.02),
      ]),
      // Transverse Palmar Crease Circuit
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.22, 0.16, 0.06),
        new THREE.Vector3(-0.04, 0.12, 0.09),
        new THREE.Vector3(0.14, 0.18, 0.08),
        new THREE.Vector3(0.26, 0.10, 0.07),
      ]),
    ];
  }, []);

  // Main Kinematic Frame Loop (Sequential Finger-by-Finger Articulation)
  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    const cycleDur = 14.0;
    const t = elapsed % cycleDur;

    let thumb = 0;
    let index = 0;
    let middle = 0;
    let ring = 0;
    let pinky = 0;
    let activeChannel = 'STANDBY';

    // Sequential Finger Isolation
    if (t < 2.2) {
      thumb = getFingerBell(t, 0.1, 2.0);
      activeChannel = 'CH 1 · THUMB FLEXION';
    } else if (t >= 2.2 && t < 4.4) {
      index = getFingerBell(t, 2.3, 2.0);
      activeChannel = 'CH 2 · INDEX FLEXION';
    } else if (t >= 4.4 && t < 6.6) {
      middle = getFingerBell(t, 4.5, 2.0);
      activeChannel = 'CH 3 · MIDDLE FLEXION';
    } else if (t >= 6.6 && t < 8.8) {
      ring = getFingerBell(t, 6.7, 2.0);
      activeChannel = 'CH 4 · RING FLEXION';
    } else if (t >= 8.8 && t < 11.0) {
      pinky = getFingerBell(t, 8.9, 2.0);
      activeChannel = 'CH 5 · PINKY FLEXION';
    } else {
      const waveT = t - 11.0;
      thumb = getFingerBell(waveT, 0.0, 1.8) * 0.72;
      index = getFingerBell(waveT, 0.2, 1.8) * 0.85;
      middle = getFingerBell(waveT, 0.4, 1.8) * 0.90;
      ring = getFingerBell(waveT, 0.6, 1.8) * 0.82;
      pinky = getFingerBell(waveT, 0.8, 1.8) * 0.70;
      activeChannel = 'BLE 5.0 · FULL SYNC WAVE';
    }

    setFlexValues([thumb, index, middle, ring, pinky]);
    onActiveChannelChange(activeChannel);

    // Heart Rate Biosensor Pulse (~72 BPM)
    if (ppgPulseRef.current) {
      const pulse = Math.pow(Math.sin(elapsed * 7.54) * 0.5 + 0.5, 4.0);
      ppgPulseRef.current.emissiveIntensity = 0.6 + pulse * 2.2;
    }

    // Subtle gentle 3D floating and orientation sway when user is not manually orbiting
    if (rootRef.current && !isInteracting) {
      rootRef.current.rotation.y = Math.sin(elapsed * 0.55) * 0.06;
      rootRef.current.rotation.x = 0.06 + Math.cos(elapsed * 0.4) * 0.03;
      rootRef.current.position.y = -0.15 + Math.sin(elapsed * 0.65) * 0.015;
    }
  });

  return (
    // Horizontal offset x = -0.12 perfectly balances the outstretched thumb on the right
    <group ref={rootRef} position={[-0.12, -0.15, 0]}>
      {/* =================================================================== */}
      {/* A. ORGANIC THREE-DIMENSIONAL PALM BODY (Matches Image 2) */}
      {/* =================================================================== */}
      <group>
        {/* Transparent Smoked Glass Palm Shell */}
        <mesh geometry={palmGeom}>
          <meshPhysicalMaterial
            color="#c8ebff"
            transparent
            opacity={0.32}
            roughness={0.12}
            metalness={0.16}
            transmission={0.82}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Luminous Cyan Wireframe Mesh following Palm Anatomy */}
        <mesh geometry={palmGeom}>
          <meshBasicMaterial
            color="#38bdf8"
            wireframe
            transparent
            opacity={0.48}
          />
        </mesh>

        {/* Internal Titanium Metacarpal Bone Shafts */}
        {[
          { x: -0.22, rot: -0.10 },
          { x: -0.07, rot: -0.03 },
          { x: 0.07, rot: 0.02 },
          { x: 0.20, rot: 0.08 },
        ].map((meta, i) => (
          <mesh key={i} position={[meta.x, 0.05, 0.0]} rotation={[0, 0, meta.rot]}>
            <cylinderGeometry args={[0.022, 0.026, 0.54, 10]} />
            <meshStandardMaterial color="#0f172a" roughness={0.38} metalness={0.88} />
          </mesh>
        ))}

        {/* Intricate Palm Cybernetic Circuit Tracks */}
        {palmCircuitCurves.map((curve, idx) => (
          <mesh key={idx}>
            <tubeGeometry args={[curve, 24, 0.006, 8, false]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#00f0ff"
              emissiveIntensity={1.3}
              roughness={0.2}
            />
          </mesh>
        ))}

        {/* Embedded Biometric Sensor Nodes across Palm (Matching Image 2) */}
        {[
          [0.02, 0.08, 0.08],     // Center Palm Node
          [0.08, 0.38, 0.08],     // Knuckle Arch Node
          [0.24, -0.04, 0.08],    // Thenar Node
          [-0.16, -0.14, 0.07],   // Hypothenar Node
          [-0.06, 0.22, 0.08],    // Mid-Palm Node
        ].map((pos, idx) => (
          <group key={idx} position={pos as [number, number, number]}>
            <mesh>
              <sphereGeometry args={[0.016, 12, 12]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#38bdf8"
                emissiveIntensity={2.2}
                roughness={0.1}
              />
            </mesh>
            <mesh rotation={[Math.PI * 0.5, 0, 0]}>
              <ringGeometry args={[0.022, 0.032, 16]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}

        {/* Central Pulse Oximeter Biosensor with Heartbeat Pulse */}
        <group position={[0.20, -0.22, 0.08]}>
          <mesh>
            <boxGeometry args={[0.07, 0.07, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <circleGeometry args={[0.022, 16]} />
            <meshStandardMaterial
              ref={ppgPulseRef}
              color="#10b981"
              emissive="#34d399"
              emissiveIntensity={1.2}
              roughness={0.2}
            />
          </mesh>
        </group>
      </group>

      {/* =================================================================== */}
      {/* B. ARTICULATED 5-DIGIT ANATOMY & KINEMATICS */}
      {/* =================================================================== */}
      {/* 1. Pinky Finger (Leftmost) - 3 Segments, Splayed slightly left */}
      <ArticulatedCyberFinger
        basePos={[-0.27, 0.40, 0.02]}
        baseRot={[0.04, -0.04, 0.18]}
        pLen={0.28}
        iLen={0.20}
        dLen={0.17}
        pRadB={0.062}
        pRadT={0.056}
        iRadB={0.055}
        iRadT={0.050}
        dRadB={0.049}
        dRadT={0.042}
        flexAmount={flexValues[4]}
      />

      {/* 2. Ring Finger - 3 Segments */}
      <ArticulatedCyberFinger
        basePos={[-0.10, 0.50, 0.04]}
        baseRot={[0.02, -0.02, 0.06]}
        pLen={0.38}
        iLen={0.28}
        dLen={0.22}
        pRadB={0.072}
        pRadT={0.066}
        iRadB={0.065}
        iRadT={0.060}
        dRadB={0.059}
        dRadT={0.050}
        flexAmount={flexValues[3]}
      />

      {/* 3. Middle Finger (Longest) - 3 Segments */}
      <ArticulatedCyberFinger
        basePos={[0.07, 0.55, 0.05]}
        baseRot={[0, 0, 0]}
        pLen={0.42}
        iLen={0.32}
        dLen={0.24}
        pRadB={0.076}
        pRadT={0.070}
        iRadB={0.069}
        iRadT={0.064}
        dRadB={0.063}
        dRadT={0.054}
        flexAmount={flexValues[2]}
      />

      {/* 4. Index Finger - 3 Segments, Splayed slightly right */}
      <ArticulatedCyberFinger
        basePos={[0.24, 0.49, 0.04]}
        baseRot={[0.02, 0.02, -0.07]}
        pLen={0.37}
        iLen={0.27}
        dLen={0.21}
        pRadB={0.074}
        pRadT={0.068}
        iRadB={0.067}
        iRadT={0.062}
        dRadB={0.061}
        dRadT={0.052}
        flexAmount={flexValues[1]}
      />

      {/* 5. Opposable Thumb (Rightmost) - Distinct Angle & Anatomical Opposition */}
      <ArticulatedCyberFinger
        basePos={[0.33, 0.02, 0.05]}
        baseRot={[0.22, -0.32, -0.68]}
        pLen={0.36}
        iLen={0.28}
        dLen={0.22}
        pRadB={0.088}
        pRadT={0.080}
        iRadB={0.078}
        iRadT={0.072}
        dRadB={0.070}
        dRadT={0.058}
        flexAmount={flexValues[0]}
        isThumb
      />

      {/* =================================================================== */}
      {/* C. ELONGATED TAPERED FOREARM (No Pedestal / Matches Image 2) */}
      {/* =================================================================== */}
      <group>
        {/* Transparent Smoked Glass Forearm Outer Shell */}
        <mesh geometry={forearmGeom}>
          <meshPhysicalMaterial
            color="#c8ebff"
            transparent
            opacity={0.30}
            roughness={0.12}
            metalness={0.16}
            transmission={0.82}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Luminous Cyan Wireframe Lattice on Forearm */}
        <mesh geometry={forearmGeom}>
          <meshBasicMaterial
            color="#38bdf8"
            wireframe
            transparent
            opacity={0.42}
          />
        </mesh>

        {/* Dual Internal Structural Bones (Radius & Ulna Cybernetic Columns) */}
        <mesh position={[-0.08, -0.90, 0]}>
          <cylinderGeometry args={[0.038, 0.042, 0.88, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.92} />
        </mesh>
        <mesh position={[0.08, -0.90, 0]}>
          <cylinderGeometry args={[0.038, 0.042, 0.88, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.92} />
        </mesh>

        {/* Internal Central Data Bus Conduit */}
        <mesh position={[0, -0.90, 0.03]}>
          <cylinderGeometry args={[0.012, 0.012, 0.90, 8]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#00f0ff"
            emissiveIntensity={1.4}
            roughness={0.2}
          />
        </mesh>

        {/* High-Tech Microchip Module Package near Wrist Crease (Matches Image 2) */}
        <group position={[0.02, -0.62, 0.11]}>
          <mesh>
            <boxGeometry args={[0.11, 0.11, 0.024]} />
            <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.014]}>
            <boxGeometry args={[0.07, 0.07, 0.008]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#38bdf8"
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
        </group>

        {/* Wrist Articulation Seam / Cyan Accent Bands */}
        {[-0.46, -0.56, -0.80].map((wy, idx) => (
          <mesh key={idx} position={[0, wy, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
            <torusGeometry args={[0.19 + (wy + 1.35) * 0.03, 0.008, 10, 28]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#00f0ff"
              emissiveIntensity={1.5}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Floating Ambient Stardust Particles */}
      <AmbientTelemetryParticles />
    </group>
  );
};

// ---------------------------------------------------------------------------
// 9. Exported Interactive 3D Component with Telemetry HUD Overlay
// ---------------------------------------------------------------------------
export const InteractiveSmartGlove: React.FC = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeChannel, setActiveChannel] = useState('CALIBRATING SENSORS');
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden">
      {/* Subtle Background Radial Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.12)_0%,rgba(16,185,129,0.05)_45%,transparent_75%)]" />

      {/* Real-Time Telemetry HUD Indicator */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.08]">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
        <span className="font-mono text-[11px] font-medium tracking-wider text-cyan-300">
          {activeChannel}
        </span>
      </div>

      {/* 360 Drag & Rotate Hint */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] font-mono text-[10px] text-zinc-400 opacity-70">
        <span>360° Drag · Scroll to Zoom</span>
      </div>

      {/* Interactive 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0.0, 0.12, 4.6], fov: 36 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full block"
      >
        <ambientLight intensity={0.65} color="#07101e" />
        {/* Key Light (Crisp White Specular Glass Highlights) */}
        <directionalLight position={[3.2, 4.0, 3.5]} intensity={2.8} color="#ffffff" />
        {/* Cyan Cybernetic Rim Light */}
        <directionalLight position={[-3.5, 2.5, -2.5]} intensity={2.4} color="#38bdf8" />
        {/* Subtle Uplight */}
        <pointLight position={[0, -2.5, 2.0]} intensity={1.2} color="#0284c7" distance={8} />

        <CyberneticHandModel
          isInteracting={isInteracting}
          onActiveChannelChange={setActiveChannel}
        />

        {/* Full 360-Degree Orbit Controls with Smooth Inertia Damping */}
        <OrbitControls
          ref={controlsRef}
          target={[0, 0.12, 0]}
          enablePan={false}
          enableZoom={true}
          minDistance={2.2}
          maxDistance={6.8}
          enableDamping={true}
          dampingFactor={0.06}
          rotateSpeed={0.85}
          onStart={() => setIsInteracting(true)}
          onEnd={() => setIsInteracting(false)}
        />
      </Canvas>
    </div>
  );
};
