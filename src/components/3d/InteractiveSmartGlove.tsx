import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

// ---------------------------------------------------------------------------
// 1. Particle Glow Texture Generator for Ambient Cybernetic Dust
// ---------------------------------------------------------------------------
function createParticleGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(0, 240, 255, 0.9)');
    gradient.addColorStop(0.55, 'rgba(14, 165, 233, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

// ---------------------------------------------------------------------------
// 2. Ambient Floating Telemetry Particles (Unified Neon Cyan & Dark)
// ---------------------------------------------------------------------------
const AmbientTelemetryParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 90;

  const [geom, tex] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cyan = new THREE.Color('#00f0ff');
    const deepCyan = new THREE.Color('#38bdf8');

    for (let i = 0; i < count; i++) {
      const radius = 0.55 + Math.random() * 1.5;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * 2.6;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.5;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const c = Math.random() < 0.65 ? cyan : deepCyan;
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
      if (py > 1.4) py = -1.3;
      pos.setY(i, py);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geom}>
      <pointsMaterial
        size={0.030}
        map={tex}
        vertexColors
        transparent
        opacity={0.80}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

// ---------------------------------------------------------------------------
// 3. Cybernetic Forearm Geometry Generator (Preserves Exact 3D Structure)
// ---------------------------------------------------------------------------
function createCyberForearmGeometry() {
  const slices = 20;
  const radialSegments = 28;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const topY = -0.74;
  const bottomY = -1.60;
  const totalH = topY - bottomY;

  const cx = -0.086;
  const cz = 0.272;

  for (let i = 0; i <= slices; i++) {
    const v = i / slices;
    const y = bottomY + v * totalH;

    const t = 1 - v;
    const halfWidth = 0.255 + t * 0.07;
    const halfDepth = 0.095 + t * 0.025;

    for (let j = 0; j <= radialSegments; j++) {
      const u = j / radialSegments;
      const angle = u * Math.PI * 2;
      const px = cx + Math.cos(angle) * halfWidth;
      const pz = cz + Math.sin(angle) * halfDepth;

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
// 4. Elongated Forearm Assembly (Unified Neon Cyan & Dark Palette)
// ---------------------------------------------------------------------------
const CyberForearmAssembly: React.FC = () => {
  const forearmGeom = useMemo(() => createCyberForearmGeometry(), []);

  return (
    <group>
      {/* Translucent Dark Smoked Glass Forearm Casing */}
      <mesh geometry={forearmGeom}>
        <meshPhysicalMaterial
          color="#061626"
          transparent
          opacity={0.34}
          roughness={0.08}
          metalness={0.16}
          transmission={0.85}
          thickness={0.8}
          ior={1.48}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Luminous Electric Cyan Wireframe Contour Lattice */}
      <mesh geometry={forearmGeom}>
        <meshBasicMaterial
          color="#00f0ff"
          wireframe
          transparent
          opacity={0.36}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Dual Internal Structural Columns: Radius & Ulna Dark Titanium Shafts */}
      <mesh position={[-0.18, -1.18, 0.27]}>
        <cylinderGeometry args={[0.042, 0.048, 0.82, 16]} />
        <meshStandardMaterial color="#08101a" roughness={0.3} metalness={0.94} />
      </mesh>
      <mesh position={[0.01, -1.18, 0.27]}>
        <cylinderGeometry args={[0.042, 0.048, 0.82, 16]} />
        <meshStandardMaterial color="#08101a" roughness={0.3} metalness={0.94} />
      </mesh>

      {/* Internal Central Luminous Cyan Telemetry Conduit */}
      <mesh position={[-0.086, -1.18, 0.31]}>
        <cylinderGeometry args={[0.012, 0.012, 0.84, 10]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={1.8}
          roughness={0.2}
        />
      </mesh>

      {/* Cybernetic Microchip Package at Wrist Crease (Unified Neon Cyan & Dark) */}
      <group position={[-0.086, -0.88, 0.36]} rotation={[0.08, 0, 0]}>
        {/* Dark Ceramic Microchip Carrier */}
        <mesh>
          <boxGeometry args={[0.11, 0.11, 0.024]} />
          <meshStandardMaterial color="#08101a" roughness={0.25} metalness={0.92} />
        </mesh>
        {/* Glowing Neon Cyan Silicon Core Die */}
        <mesh position={[0, 0, 0.014]}>
          <boxGeometry args={[0.07, 0.07, 0.008]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={1.6}
            roughness={0.2}
            metalness={0.92}
          />
        </mesh>
      </group>

      {/* Luminous Neon Cyan Wrist Articulation Rings */}
      {[-0.75, -0.85].map((wy, idx) => (
        <mesh key={idx} position={[-0.086, wy, 0.272]} rotation={[Math.PI * 0.5, 0, 0]}>
          <torusGeometry args={[0.22 - idx * 0.01, 0.007, 10, 28]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={1.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// 5. Clean, Minimal Palmar Wiring (Few Wirings / Unified Neon Cyan & Dark)
// ---------------------------------------------------------------------------
const CleanPalmarArchitecture: React.FC = () => {
  const ppgPulseRef = useRef<THREE.MeshStandardMaterial>(null);

  // Minimal, elegant wiring paths (only 3 clean primary channels)
  const cleanCircuitCurves = useMemo(() => {
    return [
      // Wrist to Thumb Base
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.05, -0.70, 0.28),
        new THREE.Vector3(0.10, -0.45, 0.30),
        new THREE.Vector3(0.28, -0.20, 0.26),
      ]),
      // Wrist to Middle Base (Central Line)
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.08, -0.70, 0.28),
        new THREE.Vector3(-0.06, -0.35, 0.29),
        new THREE.Vector3(-0.03, 0.15, 0.26),
      ]),
      // Wrist to Pinky Base
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.12, -0.70, 0.28),
        new THREE.Vector3(-0.24, -0.42, 0.27),
        new THREE.Vector3(-0.32, -0.05, 0.22),
      ]),
    ];
  }, []);

  useFrame((state) => {
    if (ppgPulseRef.current) {
      const pulse = Math.pow(Math.sin(state.clock.elapsedTime * 7.54) * 0.5 + 0.5, 4.0);
      ppgPulseRef.current.emissiveIntensity = 0.8 + pulse * 2.4;
    }
  });

  return (
    <group>
      {/* Internal Dark Titanium Metacarpal Guides */}
      {[
        { x: -0.24, rotZ: 0.12, len: 0.44 },
        { x: -0.07, rotZ: 0.02, len: 0.54 },
        { x: 0.10, rotZ: -0.08, len: 0.48 },
      ].map((meta, i) => (
        <mesh key={i} position={[meta.x, -0.24, 0.22]} rotation={[0, 0, meta.rotZ]}>
          <cylinderGeometry args={[0.016, 0.020, meta.len, 10]} />
          <meshStandardMaterial color="#08101a" roughness={0.35} metalness={0.94} />
        </mesh>
      ))}

      {/* Sleek Minimal Cyan Telemetry Circuit Tracks (Few Wirings) */}
      {cleanCircuitCurves.map((curve, idx) => (
        <mesh key={idx}>
          <tubeGeometry args={[curve, 20, 0.005, 8, false]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={1.6}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Minimal Telemetry Node Spheres */}
      {[
        [-0.06, -0.22, 0.28],   // Center Palm
        [-0.03, 0.10, 0.27],    // Knuckle
        [0.18, -0.28, 0.27],    // Thenar
      ].map((pos, idx) => (
        <group key={idx} position={pos as [number, number, number]}>
          <mesh>
            <sphereGeometry args={[0.014, 10, 10]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#00f0ff"
              emissiveIntensity={2.6}
              roughness={0.1}
            />
          </mesh>
          <mesh rotation={[Math.PI * 0.5, 0, 0]}>
            <ringGeometry args={[0.018, 0.026, 16]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Optical Pulse Biosensor (Unified Neon Cyan & Dark) */}
      <group position={[0.10, -0.42, 0.28]}>
        <mesh>
          <boxGeometry args={[0.06, 0.06, 0.018]} />
          <meshStandardMaterial color="#08101a" roughness={0.3} metalness={0.90} />
        </mesh>
        <mesh position={[0, 0, 0.011]}>
          <circleGeometry args={[0.018, 16]} />
          <meshStandardMaterial
            ref={ppgPulseRef}
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={1.4}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 6. Photorealistic Skinned Hand Rig (Fingers Bent Forward / All One Color Neon)
// ---------------------------------------------------------------------------
interface HandRigProps {
  onActiveChannelChange: (channel: string) => void;
  isInteracting: boolean;
}

const CyberneticHandRig: React.FC<HandRigProps> = ({ onActiveChannelChange, isInteracting }) => {
  const rootRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('./models/hand.glb');

  // Clone scene and set up materials, hierarchy, rest rotations
  const { clonedScene, skinnedMesh, restQuats, fingerChains, jointNodes } = useMemo(() => {
    const cloneScene = clone(scene);

    let mesh: THREE.SkinnedMesh | null = null;
    cloneScene.traverse((obj) => {
      if ((obj as THREE.SkinnedMesh).isSkinnedMesh && !mesh) {
        mesh = obj as THREE.SkinnedMesh;
      }
    });

    if (!mesh) {
      throw new Error('SkinnedMesh l_handMeshNode not found in hand.glb');
    }

    const targetMesh = mesh as THREE.SkinnedMesh;

    // 1. Unified Translucent Dark Smoked Cyan Glass Shell
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#061626'),
      transmission: 0.85,
      opacity: 0.98,
      transparent: true,
      roughness: 0.08,
      metalness: 0.16,
      ior: 1.48,
      thickness: 0.85,
      specularIntensity: 2.0,
      specularColor: new THREE.Color('#ffffff'),
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      attenuationColor: new THREE.Color('#00f0ff'),
      attenuationDistance: 0.55,
      depthWrite: false,
      side: THREE.FrontSide,
    });
    targetMesh.material = glassMaterial;

    // 2. Luminous Neon Cyan Wireframe Lattice Overlay
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: '#00f0ff',
      wireframe: true,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wireMesh = new THREE.SkinnedMesh(targetMesh.geometry, wireMaterial);
    wireMesh.bind(targetMesh.skeleton, targetMesh.bindMatrix);
    targetMesh.parent?.add(wireMesh);

    cloneScene.updateMatrixWorld(true);

    // 3. Anatomical Kinematic Hierarchy Setup
    const fingers = [
      ['thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip'],
      ['index-finger-metacarpal', 'index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal', 'index-finger-tip'],
      ['middle-finger-metacarpal', 'middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal', 'middle-finger-tip'],
      ['ring-finger-metacarpal', 'ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal', 'ring-finger-tip'],
      ['pinky-finger-metacarpal', 'pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal', 'pinky-finger-tip'],
    ];

    const wrist = cloneScene.getObjectByName('wrist') as THREE.Bone;
    for (const chain of fingers) {
      const meta = cloneScene.getObjectByName(chain[0]) as THREE.Bone;
      if (wrist && meta) wrist.attach(meta);
      for (let i = 0; i < chain.length - 1; i++) {
        const pBone = cloneScene.getObjectByName(chain[i]) as THREE.Bone;
        const cBone = cloneScene.getObjectByName(chain[i + 1]) as THREE.Bone;
        if (pBone && cBone) pBone.attach(cBone);
      }
    }

    cloneScene.updateMatrixWorld(true);

    // 4. Attach Glowing Neon Cyan Sensor Nodes & Toroidal Flex Rings
    const nodes: THREE.MeshStandardMaterial[] = [];
    const jointDotGeom = new THREE.SphereGeometry(0.0032, 8, 8);
    const jointRingGeom = new THREE.TorusGeometry(0.0075, 0.0014, 8, 20);

    for (const chain of fingers) {
      for (let i = 1; i < chain.length; i++) {
        const bone = cloneScene.getObjectByName(chain[i]) as THREE.Bone;
        if (bone) {
          const dotMat = new THREE.MeshStandardMaterial({
            color: '#ffffff',
            emissive: '#00f0ff',
            emissiveIntensity: 2.4,
            roughness: 0.1,
          });
          nodes.push(dotMat);
          const dot = new THREE.Mesh(jointDotGeom, dotMat);
          bone.add(dot);

          // Glowing Neon Cyan Toroidal Sensor Ring at joint
          const ring = new THREE.Mesh(jointRingGeom, dotMat);
          ring.rotation.x = Math.PI * 0.5;
          bone.add(ring);
        }
      }
    }

    // 5. Store Rest Quaternions
    const storedQuats = new Map<string, THREE.Quaternion>();
    cloneScene.traverse((obj) => {
      if ((obj as THREE.Bone).isBone) {
        storedQuats.set(obj.name, obj.quaternion.clone());
      }
    });

    return {
      clonedScene: cloneScene,
      skinnedMesh: targetMesh,
      restQuats: storedQuats,
      fingerChains: fingers,
      jointNodes: nodes,
    };
  }, [scene]);

  // Articulation Vectors
  const axisX = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const axisZ = useMemo(() => new THREE.Vector3(0, 0, 1), []);

  const smooth = (t: number) => t * t * (3 - 2 * t);
  const getFingerBell = (cycleTime: number, start: number, dur: number) => {
    if (cycleTime < start || cycleTime > start + dur) return 0;
    const p = (cycleTime - start) / dur;
    return p < 0.5 ? smooth(p * 2) : smooth((1 - p) * 2);
  };

  // Main Kinematic Articulation Frame Loop (Fingers Bent FORWARD into the palm)
  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    const cycleDur = 14.0;
    const t = elapsed % cycleDur;

    let thumbFlex = 0;
    let indexFlex = 0;
    let middleFlex = 0;
    let ringFlex = 0;
    let pinkyFlex = 0;
    let activeChannel = 'STANDBY';

    if (t < 2.2) {
      thumbFlex = getFingerBell(t, 0.1, 2.0);
      activeChannel = 'CH 1 · THUMB FLEXION';
    } else if (t >= 2.2 && t < 4.4) {
      indexFlex = getFingerBell(t, 2.3, 2.0);
      activeChannel = 'CH 2 · INDEX FLEXION';
    } else if (t >= 4.4 && t < 6.6) {
      middleFlex = getFingerBell(t, 4.5, 2.0);
      activeChannel = 'CH 3 · MIDDLE FLEXION';
    } else if (t >= 6.6 && t < 8.8) {
      ringFlex = getFingerBell(t, 6.7, 2.0);
      activeChannel = 'CH 4 · RING FLEXION';
    } else if (t >= 8.8 && t < 11.0) {
      pinkyFlex = getFingerBell(t, 8.9, 2.0);
      activeChannel = 'CH 5 · PINKY FLEXION';
    } else {
      const waveT = t - 11.0;
      thumbFlex = getFingerBell(waveT, 0.0, 1.8) * 0.72;
      indexFlex = getFingerBell(waveT, 0.2, 1.8) * 0.85;
      middleFlex = getFingerBell(waveT, 0.4, 1.8) * 0.90;
      ringFlex = getFingerBell(waveT, 0.6, 1.8) * 0.82;
      pinkyFlex = getFingerBell(waveT, 0.8, 1.8) * 0.70;
      activeChannel = 'BLE 5.0 · FULL SYNC WAVE';
    }

    onActiveChannelChange(activeChannel);

    const flexValues = [thumbFlex, indexFlex, middleFlex, ringFlex, pinkyFlex];

    // Natural forward relaxed curve base + active forward curl
    // Negative angle around X bends the finger FORWARD into the palm
    fingerChains.forEach((chain, fIdx) => {
      const flex = flexValues[fIdx];

      if (fIdx === 0) {
        // Opposable Thumb: bends forward and inward into palm
        const totalFlex = 0.10 + flex * 0.52;
        const meta = clonedScene.getObjectByName(chain[0]);
        const prox = clonedScene.getObjectByName(chain[1]);
        const dist = clonedScene.getObjectByName(chain[2]);

        if (meta) {
          const qX = new THREE.Quaternion().setFromAxisAngle(axisX, -totalFlex * 0.25);
          const qZ = new THREE.Quaternion().setFromAxisAngle(axisZ, -totalFlex * 0.20);
          meta.quaternion.copy(restQuats.get(meta.name)!).multiply(qX).multiply(qZ);
        }
        if (prox) {
          const qX = new THREE.Quaternion().setFromAxisAngle(axisX, -totalFlex * 0.45);
          const qZ = new THREE.Quaternion().setFromAxisAngle(axisZ, -totalFlex * 0.20);
          prox.quaternion.copy(restQuats.get(prox.name)!).multiply(qX).multiply(qZ);
        }
        if (dist) {
          const qX = new THREE.Quaternion().setFromAxisAngle(axisX, -totalFlex * 0.50);
          dist.quaternion.copy(restQuats.get(dist.name)!).multiply(qX);
        }
      } else {
        // Non-thumb digits: Index, Middle, Ring, Pinky
        // Base forward relaxed curve of 0.16 + active forward curl
        const totalFlex = 0.16 + flex * 0.62;
        const prox = clonedScene.getObjectByName(chain[1]);
        const inter = clonedScene.getObjectByName(chain[2]);
        const dist = clonedScene.getObjectByName(chain[3]);

        if (prox) {
          const qX = new THREE.Quaternion().setFromAxisAngle(axisX, -totalFlex * 0.48);
          prox.quaternion.copy(restQuats.get(prox.name)!).multiply(qX);
        }
        if (inter) {
          const qX = new THREE.Quaternion().setFromAxisAngle(axisX, -totalFlex * 0.72);
          inter.quaternion.copy(restQuats.get(inter.name)!).multiply(qX);
        }
        if (dist) {
          const qX = new THREE.Quaternion().setFromAxisAngle(axisX, -totalFlex * 0.44);
          dist.quaternion.copy(restQuats.get(dist.name)!).multiply(qX);
        }
      }
    });

    // Pulse sensor diode glow intensity
    jointNodes.forEach((mat, idx) => {
      const fIdx = Math.floor(idx / 3);
      const flex = flexValues[Math.min(fIdx, 4)];
      mat.emissiveIntensity = 2.2 + flex * 2.8;
    });

    clonedScene.updateMatrixWorld(true);
    skinnedMesh.skeleton.update();

    // Subtle gentle float sway when user is not manually orbiting
    if (rootRef.current && !isInteracting) {
      rootRef.current.rotation.y = Math.sin(elapsed * 0.45) * 0.05;
      rootRef.current.rotation.x = 0.04 + Math.cos(elapsed * 0.35) * 0.025;
      rootRef.current.position.y = -0.22 + Math.sin(elapsed * 0.6) * 0.015;
    }
  });

  return (
    <group ref={rootRef} position={[0.0, -0.22, 0.0]}>
      {/* 
        The GLTF hand model is scaled by 9.5 and rotated [0, -Math.PI / 2, Math.PI].
        - Fingers point UP (+Y)
        - Wrist points DOWN (-Y)
        - Thumb points to the RIGHT (+X)
        - Pinky points to the LEFT (-X)
        - Palm faces FORWARD (+Z)
      */}
      <group scale={[9.5, 9.5, 9.5]} rotation={[0, -Math.PI / 2, Math.PI]}>
        <primitive object={clonedScene} />
      </group>

      {/* Clean Minimal Palmar Architecture (Few Wirings / Unified Neon Cyan) */}
      <CleanPalmarArchitecture />

      {/* Elongated Transparent Cybernetic Forearm Assembly (No Pedestal) */}
      <CyberForearmAssembly />

      {/* Floating Ambient Stardust Telemetry Particles */}
      <AmbientTelemetryParticles />
    </group>
  );
};

// ---------------------------------------------------------------------------
// 7. Exported Interactive 3D Component with Telemetry HUD Overlay
// ---------------------------------------------------------------------------
export const InteractiveSmartGlove: React.FC = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeChannel, setActiveChannel] = useState('STANDBY');
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden">
      {/* Subtle Background Radial Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(0,240,255,0.14)_0%,rgba(6,22,38,0.06)_45%,transparent_75%)]" />

      {/* Real-Time Telemetry HUD Indicator */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.08]">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
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
        camera={{ position: [0.0, 0.05, 3.6], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full block"
      >
        {/* Deep Cybernetic Ambient Illumination */}
        <ambientLight intensity={0.7} color="#040d18" />

        {/* Key Light (Crisp White Specular Glass Edge Highlights) */}
        <directionalLight position={[3.5, 4.0, 3.5]} intensity={3.2} color="#ffffff" />

        {/* Neon Cyan Cybernetic Rim Light */}
        <directionalLight position={[-3.5, 2.5, -2.5]} intensity={2.8} color="#00f0ff" />

        {/* Backlight (Internal Glass Refraction Glow) */}
        <directionalLight position={[0.0, 2.0, -3.5]} intensity={2.0} color="#0284c7" />

        {/* Internal Forearm Point Light */}
        <pointLight position={[-0.08, -0.85, 0.5]} intensity={1.6} color="#00f0ff" distance={4.5} />

        {/* Skinned Cybernetic Hand Rig */}
        <CyberneticHandRig
          onActiveChannelChange={setActiveChannel}
          isInteracting={isInteracting}
        />

        {/* Full 360-Degree Orbit Controls with Smooth Inertia Damping */}
        <OrbitControls
          ref={controlsRef}
          target={[0, 0.05, 0]}
          enablePan={false}
          enableZoom={true}
          minDistance={2.0}
          maxDistance={5.8}
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

// Preload the 3D hand asset for instantaneous rendering
useGLTF.preload('./models/hand.glb');
