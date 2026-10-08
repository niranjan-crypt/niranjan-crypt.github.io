import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 1. BLE 5.0 Wireless Telemetry Pulses (Delicate data particles from ESP32 antenna)
const BLETelemetryParticles: React.FC<{ origin: [number, number, number] }> = ({ origin }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 28;

  const [geom, glowTex] = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(56, 189, 248, 1)');
      grad.addColorStop(0.4, 'rgba(16, 185, 129, 0.6)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const tex = new THREE.CanvasTexture(canvas);

    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = origin[0];
      positions[i * 3 + 1] = origin[1];
      positions[i * 3 + 2] = origin[2];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return [g, tex];
  }, [origin]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime * 1.5;

    for (let i = 0; i < particleCount; i++) {
      const offset = (t + i * (1.0 / particleCount)) % 1.0;
      const angle = (i * 2.39996) + t * 0.2; // golden angle spiral
      const radius = offset * 0.45;
      const x = origin[0] + Math.cos(angle) * radius;
      const y = origin[1] + (Math.random() - 0.5) * 0.05 + offset * 0.2;
      const z = origin[2] + Math.sin(angle) * radius + offset * 0.25;

      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geom}>
      <pointsMaterial
        size={0.032}
        map={glowTex}
        color="#38bdf8"
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

// 2. Anatomical Articulated Finger Component (14 Joint Angles Hierarchy)
interface FingerProps {
  basePos: [number, number, number];
  baseRot: [number, number, number];
  lengths: [number, number, number]; // proximal, intermediate, distal
  widths: [number, number, number];
  flexAngle: number; // current flex from digital twin loop
  sensorColor: string;
  isThumb?: boolean;
}

const ArticulatedFinger: React.FC<FingerProps> = ({
  basePos,
  baseRot,
  lengths,
  widths,
  flexAngle,
  sensorColor,
  isThumb = false,
}) => {
  const mcpRef = useRef<THREE.Group>(null);
  const pipRef = useRef<THREE.Group>(null);
  const dipRef = useRef<THREE.Group>(null);
  const sensorMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // Materials for the cybernetic smart glove
  const materials = useMemo(() => {
    // Ivory / White Technical Armor Plating (Reference Image: media_1791424495805.png)
    const ivoryPlate = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.28,
      metalness: 0.12,
      envMapIntensity: 1.0,
    });

    // Brushed Chrome / Titanium Knuckle Joints
    const chromeKnuckle = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.25,
      metalness: 0.88,
    });

    // Dark Carbon-Fiber Under-Chassis
    const darkCarbon = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.55,
      metalness: 0.45,
    });

    // Resistive Flex Sensor Polyimide Strip with Strain Feedback Glow
    const flexSensor = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      emissive: new THREE.Color(sensorColor),
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.6,
    });

    return { ivoryPlate, chromeKnuckle, darkCarbon, flexSensor };
  }, [sensorColor]);

  // Update hierarchical joint rotations dynamically for realistic digital twin kinematics
  useFrame(() => {
    // Kinematic distribution across MCP, PIP, DIP joints
    const mcpAngle = flexAngle * (isThumb ? 0.45 : 0.48);
    const pipAngle = flexAngle * (isThumb ? 0.55 : 0.65);
    const dipAngle = flexAngle * (isThumb ? 0.40 : 0.50);

    if (mcpRef.current) {
      if (isThumb) {
        mcpRef.current.rotation.x = mcpAngle * 0.7;
        mcpRef.current.rotation.z = -mcpAngle * 0.5;
      } else {
        mcpRef.current.rotation.x = -mcpAngle;
      }
    }
    if (pipRef.current) {
      pipRef.current.rotation.x = isThumb ? mcpAngle * 0.6 : -pipAngle;
    }
    if (dipRef.current) {
      dipRef.current.rotation.x = isThumb ? mcpAngle * 0.4 : -dipAngle;
    }

    if (sensorMatRef.current) {
      sensorMatRef.current.emissiveIntensity = 0.3 + flexAngle * 0.85;
    }
  });

  const [pLen, iLen, dLen] = lengths;
  const [pW, iW, dW] = widths;

  return (
    <group position={basePos} rotation={baseRot}>
      {/* --- KNUCKLE (MCP Joint) --- */}
      <mesh material={materials.chromeKnuckle}>
        <cylinderGeometry args={[pW * 0.55, pW * 0.55, pW * 1.05, 16]} />
      </mesh>

      {/* --- PROXIMAL PHALANX (Segment 1) --- */}
      <group ref={mcpRef}>
        {/* Dorsal Ivory Armor Shell */}
        <mesh position={[0, pLen * 0.5, 0.02]} material={materials.ivoryPlate}>
          <boxGeometry args={[pW, pLen * 0.92, pW * 0.75]} />
        </mesh>
        {/* Ventral Soft Glove Underlayer */}
        <mesh position={[0, pLen * 0.5, -0.01]} material={materials.darkCarbon}>
          <boxGeometry args={[pW * 0.88, pLen * 0.88, pW * 0.65]} />
        </mesh>
        {/* Resistive Flex Sensor Strip (Segment 1) */}
        <mesh position={[0, pLen * 0.5, pW * 0.42]} material={materials.flexSensor} ref={sensorMatRef}>
          <boxGeometry args={[pW * 0.38, pLen * 0.94, 0.015]} />
        </mesh>

        {/* --- INTERMEDIATE JOINT (PIP Joint) --- */}
        <group position={[0, pLen, 0]}>
          <mesh material={materials.chromeKnuckle}>
            <cylinderGeometry args={[iW * 0.52, iW * 0.52, iW * 1.02, 16]} />
          </mesh>

          {/* --- INTERMEDIATE PHALANX (Segment 2) --- */}
          <group ref={pipRef}>
            <mesh position={[0, iLen * 0.5, 0.015]} material={materials.ivoryPlate}>
              <boxGeometry args={[iW, iLen * 0.92, iW * 0.72]} />
            </mesh>
            <mesh position={[0, iLen * 0.5, -0.01]} material={materials.darkCarbon}>
              <boxGeometry args={[iW * 0.86, iLen * 0.86, iW * 0.62]} />
            </mesh>
            {/* Flex Sensor Strip (Segment 2) */}
            <mesh position={[0, iLen * 0.5, iW * 0.38]} material={materials.flexSensor}>
              <boxGeometry args={[iW * 0.36, iLen * 0.94, 0.015]} />
            </mesh>

            {/* --- DISTAL JOINT (DIP Joint) --- */}
            <group position={[0, iLen, 0]}>
              <mesh material={materials.chromeKnuckle}>
                <cylinderGeometry args={[dW * 0.48, dW * 0.48, dW * 0.96, 16]} />
              </mesh>

              {/* --- DISTAL PHALANX & FINGERTIP (Segment 3) --- */}
              <group ref={dipRef}>
                {/* Ergonomic Ivory Fingertip Cap */}
                <mesh position={[0, dLen * 0.45, 0.01]} material={materials.ivoryPlate}>
                  <boxGeometry args={[dW, dLen * 0.85, dW * 0.68]} />
                </mesh>
                <mesh position={[0, dLen * 0.88, 0.01]} material={materials.ivoryPlate}>
                  <sphereGeometry args={[dW * 0.48, 16, 16]} />
                </mesh>
                {/* Flex Sensor Tip Termination Node */}
                <mesh position={[0, dLen * 0.75, dW * 0.35]} material={materials.flexSensor}>
                  <sphereGeometry args={[0.018, 12, 12]} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

// 3. Complete Cyber-Physical Smart Glove 3D Model
const SmartGloveMesh: React.FC<{ isInteracting: boolean }> = ({ isInteracting }) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const [flexAngles, setFlexAngles] = useState<number[]>([0, 0, 0, 0, 0]);
  const max30102Ref = useRef<THREE.MeshStandardMaterial>(null);

  // Materials for palm, wrist, wiring, and electronics modules
  const commonMaterials = useMemo(() => {
    // Ivory Armor Shells
    const ivoryPlate = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.28,
      metalness: 0.12,
    });
    // Dark Flexible Glove Fabric / Under-Chassis
    const gloveFabric = new THREE.MeshStandardMaterial({
      color: '#090d16',
      roughness: 0.72,
      metalness: 0.2,
    });
    // Brushed Titanium Hardware
    const titanium = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.3,
      metalness: 0.85,
    });
    // Gold Conductor Traces
    const goldPcb = new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      roughness: 0.25,
      metalness: 0.9,
    });
    // Matte Black Electronics Module Package
    const chipPackage = new THREE.MeshStandardMaterial({
      color: '#05070c',
      roughness: 0.4,
      metalness: 0.5,
    });
    // Silver ESP32 RF Shield Can
    const rfShield = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.2,
      metalness: 0.92,
    });
    // Thin Sensor Routing Wire (Flexible Nitinol / Silicone wire)
    const wireMaterial = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.4,
      metalness: 0.7,
    });

    return { ivoryPlate, gloveFabric, titanium, goldPcb, chipPackage, rfShield, wireMaterial };
  }, []);

  // Sensor Wires routing from the 5 fingers to the ESP32 module on the wrist
  const wireTubes = useMemo(() => {
    const curves = [
      // Thumb wire
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.45, -0.05, 0.12),
        new THREE.Vector3(-0.35, -0.22, 0.18),
        new THREE.Vector3(-0.20, -0.42, 0.22),
        new THREE.Vector3(-0.06, -0.58, 0.24),
      ]),
      // Index finger wire
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.24, 0.52, 0.12),
        new THREE.Vector3(-0.20, 0.20, 0.18),
        new THREE.Vector3(-0.14, -0.20, 0.22),
        new THREE.Vector3(-0.04, -0.58, 0.24),
      ]),
      // Middle finger wire
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.04, 0.58, 0.14),
        new THREE.Vector3(-0.04, 0.25, 0.19),
        new THREE.Vector3(-0.03, -0.18, 0.23),
        new THREE.Vector3(-0.01, -0.58, 0.24),
      ]),
      // Ring finger wire
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.16, 0.53, 0.12),
        new THREE.Vector3(0.12, 0.20, 0.18),
        new THREE.Vector3(0.08, -0.20, 0.22),
        new THREE.Vector3(0.02, -0.58, 0.24),
      ]),
      // Little finger wire
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.34, 0.42, 0.10),
        new THREE.Vector3(0.26, 0.12, 0.16),
        new THREE.Vector3(0.18, -0.22, 0.21),
        new THREE.Vector3(0.05, -0.58, 0.24),
      ]),
    ];

    return curves.map((c) => new THREE.TubeGeometry(c, 24, 0.009, 8, false));
  }, []);

  // Digital Twin Simulation Loop (Graceful Kinematic Demo Mode)
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Simulate realistic 14-joint angle biometric flexion
    // Fingers sequentially flexing in a subtle grasping/typing gesture
    const thumbFlex = (Math.sin(t * 1.4) * 0.5 + 0.5) * 0.65;
    const indexFlex = (Math.sin(t * 1.5 - 0.4) * 0.5 + 0.5) * 0.95;
    const middleFlex = (Math.sin(t * 1.5 - 0.7) * 0.5 + 0.5) * 1.05;
    const ringFlex = (Math.sin(t * 1.5 - 1.0) * 0.5 + 0.5) * 0.90;
    const pinkyFlex = (Math.sin(t * 1.5 - 1.3) * 0.5 + 0.5) * 0.75;

    setFlexAngles([thumbFlex, indexFlex, middleFlex, ringFlex, pinkyFlex]);

    // MAX30102 Optical PPG Heartbeat Pulse (~72 BPM / 1.2 Hz)
    if (max30102Ref.current) {
      const pulse = Math.pow(Math.sin(t * 7.5) * 0.5 + 0.5, 4.0);
      max30102Ref.current.emissiveIntensity = 0.4 + pulse * 1.6;
    }

    // Idle subtle glove floating motion & orientation sway
    if (rootGroupRef.current && !isInteracting) {
      rootGroupRef.current.rotation.y = 0.35 + Math.sin(t * 0.6) * 0.12;
      rootGroupRef.current.position.y = -0.08 + Math.sin(t * 0.9) * 0.025;
    }
  });

  return (
    <group ref={rootGroupRef} position={[0, -0.08, 0]} rotation={[0.15, 0.35, -0.05]} scale={1.35}>
      {/* =================================================================== */}
      {/* 1. ANATOMICAL HAND PALM & DORSAL EXOSKELETON */}
      {/* =================================================================== */}
      {/* Main Hand Dorsal/Palmar Mass */}
      <mesh position={[0.02, 0.08, 0.02]} material={commonMaterials.gloveFabric}>
        <boxGeometry args={[0.74, 0.88, 0.26]} />
      </mesh>

      {/* Ergonomic Ivory Dorsal Armor Plating (Segmented Metacarpal Shields) */}
      <mesh position={[0.02, 0.18, 0.14]} material={commonMaterials.ivoryPlate}>
        <boxGeometry args={[0.70, 0.52, 0.06]} />
      </mesh>
      <mesh position={[0.02, -0.16, 0.13]} material={commonMaterials.ivoryPlate}>
        <boxGeometry args={[0.66, 0.32, 0.06]} />
      </mesh>

      {/* Thenar Eminence (Thumb Base Muscle Bulk) */}
      <mesh position={[-0.28, -0.04, 0.06]} rotation={[0, 0, 0.35]} material={commonMaterials.gloveFabric}>
        <boxGeometry args={[0.34, 0.48, 0.28]} />
      </mesh>
      <mesh position={[-0.30, -0.02, 0.14]} rotation={[0, 0, 0.35]} material={commonMaterials.ivoryPlate}>
        <boxGeometry args={[0.26, 0.38, 0.05]} />
      </mesh>

      {/* =================================================================== */}
      {/* 2. FOREARM & CARPAL WRIST CUFF */}
      {/* =================================================================== */}
      <group position={[0.02, -0.68, 0.04]}>
        {/* Main Wrist Band / Telemetry Cuff */}
        <mesh material={commonMaterials.gloveFabric}>
          <cylinderGeometry args={[0.32, 0.35, 0.52, 24]} />
        </mesh>
        {/* High-Grade White/Ivory Outer Cuff Shield */}
        <mesh position={[0, 0, 0.08]} material={commonMaterials.ivoryPlate}>
          <boxGeometry args={[0.62, 0.42, 0.14]} />
        </mesh>
        {/* Titanium Buckle / Ground Trim Ring */}
        <mesh position={[0, -0.12, 0]} material={commonMaterials.titanium}>
          <cylinderGeometry args={[0.33, 0.36, 0.06, 24]} />
        </mesh>
      </group>

      {/* =================================================================== */}
      {/* 3. 5 ARTICULATED FINGERS (14 Joint Angles Total) */}
      {/* =================================================================== */}
      {/* 1. THUMB (2 Joint Angles + CMC) */}
      <ArticulatedFinger
        basePos={[-0.45, -0.02, 0.08]}
        baseRot={[0.2, 0.4, 0.72]}
        lengths={[0.38, 0.32, 0.28]}
        widths={[0.16, 0.15, 0.14]}
        flexAngle={flexAngles[0]}
        sensorColor="#38bdf8"
        isThumb={true}
      />

      {/* 2. INDEX FINGER (3 Joint Angles: MCP, PIP, DIP) */}
      <ArticulatedFinger
        basePos={[-0.24, 0.52, 0.06]}
        baseRot={[0.02, 0.04, 0.06]}
        lengths={[0.45, 0.36, 0.28]}
        widths={[0.15, 0.14, 0.13]}
        flexAngle={flexAngles[1]}
        sensorColor="#34d399"
      />

      {/* 3. MIDDLE FINGER (3 Joint Angles: MCP, PIP, DIP) */}
      <ArticulatedFinger
        basePos={[-0.04, 0.58, 0.07]}
        baseRot={[0.0, 0.0, 0.0]}
        lengths={[0.50, 0.40, 0.30]}
        widths={[0.155, 0.145, 0.135]}
        flexAngle={flexAngles[2]}
        sensorColor="#10b981"
      />

      {/* 4. RING FINGER (3 Joint Angles: MCP, PIP, DIP) */}
      <ArticulatedFinger
        basePos={[0.16, 0.53, 0.05]}
        baseRot={[0.02, -0.03, -0.06]}
        lengths={[0.44, 0.35, 0.27]}
        widths={[0.145, 0.135, 0.125]}
        flexAngle={flexAngles[3]}
        sensorColor="#38bdf8"
      />

      {/* 5. LITTLE FINGER / PINKY (3 Joint Angles: MCP, PIP, DIP) */}
      <ArticulatedFinger
        basePos={[0.34, 0.42, 0.03]}
        baseRot={[0.05, -0.08, -0.14]}
        lengths={[0.36, 0.28, 0.22]}
        widths={[0.135, 0.125, 0.115]}
        flexAngle={flexAngles[4]}
        sensorColor="#06b6d4"
      />

      {/* =================================================================== */}
      {/* 4. SENSOR ROUTING WIRING (5 Clean Channels to ESP32) */}
      {/* =================================================================== */}
      {wireTubes.map((geom, idx) => (
        <mesh key={idx} geometry={geom} material={commonMaterials.wireMaterial} />
      ))}

      {/* =================================================================== */}
      {/* 5. KINOSYNC HARDWARE MODULES (ESP32, MPU6050, MAX30102) */}
      {/* =================================================================== */}
      {/* A. ESP32 MICROCONTROLLER UNIT (Wrist/Dorsal Mounted) */}
      <group position={[0.02, -0.64, 0.21]}>
        {/* Dark PCB Board */}
        <mesh material={commonMaterials.chipPackage}>
          <boxGeometry args={[0.38, 0.26, 0.04]} />
        </mesh>
        {/* Metallic ESP32 RF Shield Can */}
        <mesh position={[-0.04, 0.02, 0.025]} material={commonMaterials.rfShield}>
          <boxGeometry args={[0.22, 0.18, 0.02]} />
        </mesh>
        {/* Gold PCB Header Pin Matrix */}
        <mesh position={[0.14, 0, 0.025]} material={commonMaterials.goldPcb}>
          <boxGeometry args={[0.04, 0.20, 0.015]} />
        </mesh>
        {/* ESP32 BLE Ceramic Antenna Trace */}
        <mesh position={[-0.14, 0, 0.025]} material={commonMaterials.goldPcb}>
          <boxGeometry args={[0.03, 0.14, 0.01]} />
        </mesh>
        {/* Telemetry Status LED */}
        <mesh position={[0.08, -0.07, 0.03]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* B. MPU6050 6-DoF IMU MOTION TRACKER (Metacarpal Center) */}
      <group position={[0.18, -0.22, 0.18]}>
        {/* QFN-24 Chip Package */}
        <mesh material={commonMaterials.chipPackage}>
          <boxGeometry args={[0.13, 0.13, 0.03]} />
        </mesh>
        {/* Pin 1 dot */}
        <mesh position={[-0.04, 0.04, 0.018]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
        {/* 3D Coordinate Axis Triad (Roll, Pitch, Yaw) */}
        <group position={[0, 0, 0.02]}>
          {/* X-Axis (Red) */}
          <mesh position={[0.04, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.004, 0.004, 0.08, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          {/* Y-Axis (Green) */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.08, 8]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          {/* Z-Axis (Cyan) */}
          <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.08, 8]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
        </group>
      </group>

      {/* C. MAX30102 OPTICAL PULSE OXIMETER BIOSENSOR (Thenar Palmar/Lateral) */}
      <group position={[-0.22, -0.26, 0.17]}>
        {/* Optical Sensor Package */}
        <mesh material={commonMaterials.chipPackage}>
          <boxGeometry args={[0.12, 0.15, 0.03]} />
        </mesh>
        {/* Dual Optical Aperture Window with Pulsing Heart Rate Glow */}
        <mesh position={[0, 0, 0.018]}>
          <boxGeometry args={[0.06, 0.09, 0.01]} />
          <meshStandardMaterial
            ref={max30102Ref}
            color="#dc2626"
            emissive="#ef4444"
            emissiveIntensity={1.2}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* =================================================================== */}
      {/* 6. SUBTLE BLE 5.0 WIRELESS TELEMETRY DATA PARTICLES */}
      {/* =================================================================== */}
      <BLETelemetryParticles origin={[-0.12, -0.64, 0.24]} />
    </group>
  );
};

export const InteractiveSmartGlove: React.FC = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none">
      {/* Subtle Background Radial Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(16,185,129,0.18)_0%,rgba(2,132,199,0.08)_45%,transparent_75%)]" />

      {/* Interactive 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0.35, 0.25, 3.4], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full block"
      >
        <ambientLight intensity={0.5} color="#0f172a" />
        {/* Key Light (White/Ivory Specular Highlights) */}
        <directionalLight position={[3.5, 3.0, 3.5]} intensity={2.6} color="#ffffff" />
        {/* Cyan Rim Light (Engineering Visualization Language) */}
        <directionalLight position={[-3.5, 2.0, -2.5]} intensity={2.0} color="#38bdf8" />
        {/* Subtle Emerald Uplight (Bio-sensing Accent) */}
        <pointLight position={[0, -2.5, 2.0]} intensity={1.2} color="#10b981" distance={8} />

        <SmartGloveMesh isInteracting={isInteracting} />

        {/* Full 360-Degree Orbit Controls with Smooth Damping */}
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
