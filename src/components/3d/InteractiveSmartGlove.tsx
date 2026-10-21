import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 1. Particle Glow Texture
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
    gradient.addColorStop(0.55, 'rgba(14, 165, 233, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

// ---------------------------------------------------------------------------
// 2. Ambient Floating Telemetry Particles
// ---------------------------------------------------------------------------
const AmbientTelemetryParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 140;

  const [geom, tex] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cyan = new THREE.Color('#38bdf8');
    const emerald = new THREE.Color('#34d399');
    const silver = new THREE.Color('#e2e8f0');

    for (let i = 0; i < count; i++) {
      const radius = 0.5 + Math.random() * 1.3;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.4) * 2.2;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.4;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const pick = Math.random();
      const c = pick < 0.65 ? cyan : pick < 0.85 ? emerald : silver;
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
    const t = state.clock.elapsedTime * 0.4;
    for (let i = 0; i < count; i++) {
      let py = pos.getY(i) + Math.sin(t + i * 0.18) * 0.0016;
      if (py > 1.3) py = -0.9;
      pos.setY(i, py);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geom}>
      <pointsMaterial
        size={0.034}
        map={tex}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

// ---------------------------------------------------------------------------
// 3. Cybernetic Articulated Phalanx Segment (Capsule + Glass + Wireframe + Core)
// ---------------------------------------------------------------------------
interface PhalanxProps {
  radius: number;
  cylinderLength: number;
  flexGlow: number;
  isTip?: boolean;
}

const PhalanxSegment: React.FC<PhalanxProps> = ({ radius, cylinderLength, flexGlow, isTip = false }) => {
  const totalH = cylinderLength + 2 * radius;
  const centerY = totalH * 0.5;

  return (
    <group position={[0, centerY, 0]}>
      {/* Outer Crystalline Glass Shell */}
      <mesh>
        <capsuleGeometry args={[radius, cylinderLength, 8, 18]} />
        <meshPhysicalMaterial
          color="#c8ebff"
          transparent
          opacity={0.34}
          roughness={0.12}
          metalness={0.15}
          transmission={0.82}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Luminous Cyan Wireframe Lattice Overlay */}
      <mesh>
        <capsuleGeometry args={[radius * 1.004, cylinderLength, 8, 16]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.52 + flexGlow * 0.35}
        />
      </mesh>

      {/* Internal Structural Titanium Tendon Core */}
      <mesh>
        <cylinderGeometry args={[radius * 0.32, radius * 0.32, cylinderLength + radius * 0.9, 12]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.35}
          metalness={0.9}
        />
      </mesh>

      {/* Internal Luminous Fiber-Optic Telemetry Conduit */}
      <mesh position={[0, 0, radius * 0.22]}>
        <cylinderGeometry args={[radius * 0.12, radius * 0.12, cylinderLength + radius * 0.95, 8]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#00f0ff"
          emissiveIntensity={0.8 + flexGlow * 2.2}
          roughness={0.2}
        />
      </mesh>

      {/* Optional Illuminated Sensor Node at Fingertip Dome */}
      {isTip && (
        <mesh position={[0, cylinderLength * 0.5 + radius * 0.85, radius * 0.2]}>
          <sphereGeometry args={[radius * 0.28, 12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#38bdf8"
            emissiveIntensity={1.8 + flexGlow * 2.5}
            roughness={0.1}
          />
        </mesh>
      )}
    </group>
  );
};

// ---------------------------------------------------------------------------
// 4. Knuckle Joint Component (Sphere + Cyan Glowing Torus Ring + Sensor LED)
// ---------------------------------------------------------------------------
const KnuckleJoint: React.FC<{ radius: number; flexGlow: number }> = ({ radius, flexGlow }) => {
  return (
    <group>
      {/* Dark Chrome Knuckle Bearing */}
      <mesh>
        <sphereGeometry args={[radius * 1.06, 16, 16]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.25}
          metalness={0.92}
        />
      </mesh>

      {/* Equatorial Luminous Cyan Sensor Ring */}
      <mesh rotation={[Math.PI * 0.5, 0, 0]}>
        <torusGeometry args={[radius * 1.12, 0.012, 10, 24]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#00f0ff"
          emissiveIntensity={1.0 + flexGlow * 1.8}
          roughness={0.2}
        />
      </mesh>

      {/* Joint Sensor Node LED */}
      <mesh position={[0, 0, radius * 1.08]}>
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
// 5. Articulated Finger Hierarchy (MCP -> PIP -> DIP)
// ---------------------------------------------------------------------------
interface ArticulatedFingerProps {
  basePos: [number, number, number];
  baseRot: [number, number, number];
  pLen: number; // Proximal cylinder length
  iLen: number; // Intermediate cylinder length
  dLen: number; // Distal cylinder length
  pRad: number; // Proximal radius
  iRad: number; // Intermediate radius
  dRad: number; // Distal radius
  flexAmount: number; // 0.0 = extended, 1.0 = curled
  isThumb?: boolean;
}

const ArticulatedCyberFinger: React.FC<ArticulatedFingerProps> = ({
  basePos,
  baseRot,
  pLen,
  iLen,
  dLen,
  pRad,
  iRad,
  dRad,
  flexAmount,
  isThumb = false,
}) => {
  const mcpRef = useRef<THREE.Group>(null);
  const pipRef = useRef<THREE.Group>(null);
  const dipRef = useRef<THREE.Group>(null);

  const pH = pLen + 2 * pRad;
  const iH = iLen + 2 * iRad;

  useFrame(() => {
    if (isThumb) {
      // Thumb opposition & flexion
      if (mcpRef.current) {
        mcpRef.current.rotation.x = -flexAmount * 0.42;
        mcpRef.current.rotation.z = -flexAmount * 0.38;
      }
      if (pipRef.current) {
        pipRef.current.rotation.x = -flexAmount * 0.58;
      }
      if (dipRef.current) {
        dipRef.current.rotation.x = -flexAmount * 0.48;
      }
    } else {
      // Anatomical finger curl across 3 articulated phalanges
      if (mcpRef.current) {
        mcpRef.current.rotation.x = -flexAmount * 0.52; // MCP ~45-50°
      }
      if (pipRef.current) {
        pipRef.current.rotation.x = -flexAmount * 0.78; // PIP ~70-80°
      }
      if (dipRef.current) {
        dipRef.current.rotation.x = -flexAmount * 0.46; // DIP ~40-45°
      }
    }
  });

  return (
    <group position={basePos} rotation={baseRot}>
      {/* MCP Knuckle Joint */}
      <KnuckleJoint radius={pRad} flexGlow={flexAmount} />

      {/* Proximal Segment Hierarchy */}
      <group ref={mcpRef}>
        <PhalanxSegment radius={pRad} cylinderLength={pLen} flexGlow={flexAmount} />

        {/* PIP Joint */}
        <group position={[0, pH, 0]}>
          <KnuckleJoint radius={iRad} flexGlow={flexAmount} />

          {/* Intermediate Segment Hierarchy */}
          <group ref={pipRef}>
            <PhalanxSegment radius={iRad} cylinderLength={iLen} flexGlow={flexAmount} />

            {/* DIP Joint */}
            <group position={[0, iH, 0]}>
              <KnuckleJoint radius={dRad} flexGlow={flexAmount} />

              {/* Distal Segment with Fingertip Dome */}
              <group ref={dipRef}>
                <PhalanxSegment radius={dRad} cylinderLength={dLen} flexGlow={flexAmount} isTip />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 6. Complete Cybernetic Hand Model & Kinematics Engine
// ---------------------------------------------------------------------------
interface HandModelProps {
  isInteracting: boolean;
  onActiveChannelChange: (channel: string) => void;
}

const CyberneticHandModel: React.FC<HandModelProps> = ({ isInteracting, onActiveChannelChange }) => {
  const rootRef = useRef<THREE.Group>(null);
  const ppgPulseRef = useRef<THREE.MeshStandardMaterial>(null);

  // 5-Channel Flex Telemetry States [Thumb, Index, Middle, Ring, Pinky]
  const [flexValues, setFlexValues] = useState<number[]>([0, 0, 0, 0, 0]);

  // Smooth Hermite Interpolation helper
  const smooth = (t: number) => t * t * (3 - 2 * t);

  // Calculate isolated finger bell curve
  const getFingerBell = (cycleTime: number, start: number, dur: number) => {
    if (cycleTime < start || cycleTime > start + dur) return 0;
    const p = (cycleTime - start) / dur;
    return p < 0.5 ? smooth(p * 2) : smooth((1 - p) * 2);
  };

  // Palm Cybernetic Circuit Paths (Matching Reference Image 1)
  const palmCircuitCurves = useMemo(() => {
    return [
      // Wrist to Thumb
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.04, -0.42, 0.08),
        new THREE.Vector3(0.18, -0.22, 0.09),
        new THREE.Vector3(0.32, -0.06, 0.07),
        new THREE.Vector3(0.44, 0.04, 0.06),
      ]),
      // Wrist to Index
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.02, -0.42, 0.08),
        new THREE.Vector3(0.12, -0.10, 0.09),
        new THREE.Vector3(0.20, 0.22, 0.07),
        new THREE.Vector3(0.26, 0.50, 0.04),
      ]),
      // Wrist to Middle
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, -0.42, 0.08),
        new THREE.Vector3(0.02, -0.05, 0.09),
        new THREE.Vector3(0.04, 0.28, 0.08),
        new THREE.Vector3(0.06, 0.56, 0.05),
      ]),
      // Wrist to Ring
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.02, -0.42, 0.08),
        new THREE.Vector3(-0.06, -0.10, 0.08),
        new THREE.Vector3(-0.10, 0.22, 0.06),
        new THREE.Vector3(-0.14, 0.52, 0.04),
      ]),
      // Wrist to Pinky
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.04, -0.42, 0.08),
        new THREE.Vector3(-0.16, -0.22, 0.07),
        new THREE.Vector3(-0.26, 0.10, 0.05),
        new THREE.Vector3(-0.34, 0.42, 0.02),
      ]),
      // Transverse Palmar Crease Circuit (Arc across palm)
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.25, 0.16, 0.06),
        new THREE.Vector3(-0.05, 0.12, 0.09),
        new THREE.Vector3(0.15, 0.18, 0.08),
        new THREE.Vector3(0.30, 0.10, 0.07),
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

    // 1. Finger-by-Finger Sequential Isolation
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
      // 2. Cascade Wave across all 5 channels (Digital Twin BLE Sweep)
      const waveT = t - 11.0;
      thumb = getFingerBell(waveT, 0.0, 1.8) * 0.75;
      index = getFingerBell(waveT, 0.2, 1.8) * 0.85;
      middle = getFingerBell(waveT, 0.4, 1.8) * 0.90;
      ring = getFingerBell(waveT, 0.6, 1.8) * 0.82;
      pinky = getFingerBell(waveT, 0.8, 1.8) * 0.72;
      activeChannel = 'BLE 5.0 · FULL SYNC WAVE';
    }

    setFlexValues([thumb, index, middle, ring, pinky]);
    onActiveChannelChange(activeChannel);

    // Optical PPG Heartbeat Pulse (~72 BPM)
    if (ppgPulseRef.current) {
      const pulse = Math.pow(Math.sin(elapsed * 7.54) * 0.5 + 0.5, 4.0);
      ppgPulseRef.current.emissiveIntensity = 0.6 + pulse * 2.2;
    }

    // Subtle gentle 3D floating and orientation sway when user is not manually orbiting
    if (rootRef.current && !isInteracting) {
      rootRef.current.rotation.y = Math.sin(elapsed * 0.6) * 0.08;
      rootRef.current.rotation.x = 0.08 + Math.cos(elapsed * 0.45) * 0.04;
      rootRef.current.position.y = -0.05 + Math.sin(elapsed * 0.7) * 0.02;
    }
  });

  return (
    <group ref={rootRef} position={[0, -0.05, 0]}>
      {/* =================================================================== */}
      {/* A. PALM & CARPAL ANATOMICAL BODY (Translucent Glass + Cyan Wireframe) */}
      {/* =================================================================== */}
      <group position={[0, 0.05, 0]}>
        {/* Central Palm Contoured Glass Core */}
        <mesh position={[0.0, 0.08, 0.01]}>
          <boxGeometry args={[0.62, 0.68, 0.14]} />
          <meshPhysicalMaterial
            color="#c8ebff"
            transparent
            opacity={0.28}
            roughness={0.15}
            metalness={0.12}
            transmission={0.85}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Central Palm Luminous Wireframe Mesh */}
        <mesh position={[0.0, 0.08, 0.01]}>
          <boxGeometry args={[0.624, 0.684, 0.144]} />
          <meshBasicMaterial
            color="#38bdf8"
            wireframe
            transparent
            opacity={0.48}
          />
        </mesh>

        {/* Thenar Muscle Pad (Thumb Base Contour on Right) */}
        <mesh position={[0.26, -0.10, 0.03]} rotation={[0.1, 0, -0.35]}>
          <capsuleGeometry args={[0.11, 0.32, 8, 16]} />
          <meshPhysicalMaterial
            color="#c8ebff"
            transparent
            opacity={0.32}
            roughness={0.14}
            metalness={0.1}
            transmission={0.8}
          />
        </mesh>
        <mesh position={[0.26, -0.10, 0.03]} rotation={[0.1, 0, -0.35]}>
          <capsuleGeometry args={[0.112, 0.32, 8, 14]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.45} />
        </mesh>

        {/* Hypothenar Muscle Pad (Pinky Side Contour on Left) */}
        <mesh position={[-0.22, -0.12, 0.02]} rotation={[0, 0, 0.12]}>
          <capsuleGeometry args={[0.095, 0.34, 8, 16]} />
          <meshPhysicalMaterial
            color="#c8ebff"
            transparent
            opacity={0.3}
            roughness={0.14}
            metalness={0.1}
            transmission={0.8}
          />
        </mesh>
        <mesh position={[-0.22, -0.12, 0.02]} rotation={[0, 0, 0.12]}>
          <capsuleGeometry args={[0.097, 0.34, 8, 14]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.42} />
        </mesh>

        {/* 4 Internal Metacarpal Bone Shafts (visible inside transparent palm) */}
        {[-0.20, -0.06, 0.08, 0.22].map((x, i) => (
          <mesh key={i} position={[x, 0.06, 0.0]} rotation={[0, 0, (x - 0.01) * 0.15]}>
            <cylinderGeometry args={[0.024, 0.028, 0.52, 10]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.85} />
          </mesh>
        ))}

        {/* Glowing Cybernetic Palm Circuit Tracks (Matching Ref 1) */}
        {palmCircuitCurves.map((curve, idx) => (
          <mesh key={idx}>
            <tubeGeometry args={[curve, 24, 0.007, 8, false]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#00f0ff"
              emissiveIntensity={1.3}
              roughness={0.2}
            />
          </mesh>
        ))}

        {/* Embedded Biometric Sensor Nodes across Palm */}
        {[
          [0.0, 0.08, 0.08],     // Palm center node (Laogong node)
          [0.06, 0.38, 0.08],    // Knuckle arch node
          [0.26, -0.04, 0.08],   // Thenar node
          [-0.18, -0.14, 0.07],  // Hypothenar node
          [-0.08, 0.22, 0.08],   // Mid-palm bridge node
        ].map((pos, idx) => (
          <group key={idx} position={pos as [number, number, number]}>
            <mesh>
              <sphereGeometry args={[0.018, 12, 12]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#38bdf8"
                emissiveIntensity={2.2}
                roughness={0.1}
              />
            </mesh>
            <mesh rotation={[Math.PI * 0.5, 0, 0]}>
              <ringGeometry args={[0.024, 0.034, 16]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}

        {/* Optical Biosensor Node with Pulsing PPG Heart Rate Glow */}
        <group position={[0.22, -0.24, 0.08]}>
          <mesh>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <circleGeometry args={[0.025, 16]} />
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
      {/* B. ARTICULATED 5-FINGER KINEMATICS HIERARCHY */}
      {/* =================================================================== */}
      {/* Pinky (Finger 4 - Leftmost) */}
      <ArticulatedCyberFinger
        basePos={[-0.34, 0.42, 0.02]}
        baseRot={[0.04, -0.05, 0.12]}
        pLen={0.32}
        iLen={0.24}
        dLen={0.18}
        pRad={0.066}
        iRad={0.060}
        dRad={0.054}
        flexAmount={flexValues[4]}
      />

      {/* Ring Finger (Finger 3) */}
      <ArticulatedCyberFinger
        basePos={[-0.14, 0.52, 0.04]}
        baseRot={[0.02, -0.02, 0.04]}
        pLen={0.39}
        iLen={0.30}
        dLen={0.22}
        pRad={0.074}
        iRad={0.068}
        dRad={0.062}
        flexAmount={flexValues[3]}
      />

      {/* Middle Finger (Finger 2 - Longest) */}
      <ArticulatedCyberFinger
        basePos={[0.06, 0.56, 0.05]}
        baseRot={[0, 0, 0]}
        pLen={0.43}
        iLen={0.33}
        dLen={0.25}
        pRad={0.080}
        iRad={0.074}
        dRad={0.068}
        flexAmount={flexValues[2]}
      />

      {/* Index Finger (Finger 1) */}
      <ArticulatedCyberFinger
        basePos={[0.26, 0.50, 0.04]}
        baseRot={[0.02, 0.03, -0.05]}
        pLen={0.38}
        iLen={0.29}
        dLen={0.22}
        pRad={0.076}
        iRad={0.070}
        dRad={0.064}
        flexAmount={flexValues[1]}
      />

      {/* Thumb (Finger 0 - Opposable on Right) */}
      <ArticulatedCyberFinger
        basePos={[0.42, 0.04, 0.06]}
        baseRot={[0.20, -0.32, -0.65]}
        pLen={0.33}
        iLen={0.26}
        dLen={0.22}
        pRad={0.086}
        iRad={0.080}
        dRad={0.074}
        flexAmount={flexValues[0]}
        isThumb
      />

      {/* =================================================================== */}
      {/* C. FOREARM & WRIST BASE SECTION */}
      {/* =================================================================== */}
      <group position={[0.0, -0.72, 0.0]}>
        {/* Forearm Glass Shell */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.26, 0.29, 0.54, 24]} />
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

        {/* Forearm Cyan Wireframe */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.264, 0.294, 0.54, 20]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.42} />
        </mesh>

        {/* Internal Titanium Core Column */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.56, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Wrist Telemetry Collar Ring */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.06, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.92} />
        </mesh>

        {/* Glowing Cyan LED Telemetry Status Ring */}
        <mesh position={[0, 0.28, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
          <torusGeometry args={[0.285, 0.012, 12, 32]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#00f0ff"
            emissiveIntensity={1.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Floating Ambient Cyan Stardust */}
      <AmbientTelemetryParticles />
    </group>
  );
};

// ---------------------------------------------------------------------------
// 7. Exported Interactive 3D Component with Telemetry HUD Overlay
// ---------------------------------------------------------------------------
export const InteractiveSmartGlove: React.FC = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeChannel, setActiveChannel] = useState('CALIBRATING SENSORS');
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden">
      {/* Subtle Background Radial Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.14)_0%,rgba(16,185,129,0.06)_45%,transparent_75%)]" />

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
        camera={{ position: [0.0, 0.15, 3.6], fov: 36 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full block"
      >
        <ambientLight intensity={0.65} color="#0f172a" />
        {/* Key Light (Crisp White Specular Glass Highlights) */}
        <directionalLight position={[3.5, 3.5, 3.5]} intensity={2.8} color="#ffffff" />
        {/* Cyan Cybernetic Rim Light */}
        <directionalLight position={[-3.5, 2.5, -2.5]} intensity={2.4} color="#38bdf8" />
        {/* Emerald Sensor Uplight */}
        <pointLight position={[0, -2.5, 2.0]} intensity={1.5} color="#34d399" distance={8} />

        <CyberneticHandModel
          isInteracting={isInteracting}
          onActiveChannelChange={setActiveChannel}
        />

        {/* Full 360-Degree Orbit Controls with Smooth Inertia Damping */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={1.8}
          maxDistance={5.2}
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
