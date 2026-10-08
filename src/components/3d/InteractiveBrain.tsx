import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 3D Cascading Data Rain / Neural Optical Fiber Streams (Signature from Reference Image 2)
const CascadingDataRain: React.FC<{ brainWidth: number; brainBottomY: number }> = ({
  brainWidth,
  brainBottomY,
}) => {
  const count = 42;

  const { linesGeom, streamsData } = useMemo(() => {
    const linesPositions: number[] = [];
    const streams = [];

    for (let i = 0; i < count; i++) {
      // Scatter stream origins under ventral brain surface
      const angle = (i / count) * Math.PI * 2;
      const radX = (Math.random() * 0.45 + 0.15) * (brainWidth * 0.9);
      const radZ = (Math.random() * 0.45 + 0.15) * (brainWidth * 0.7);

      const x = Math.cos(angle) * radX + (Math.random() - 0.5) * 0.2;
      const z = Math.sin(angle) * radZ + (Math.random() - 0.5) * 0.2;
      const startY = brainBottomY - Math.random() * 0.15;
      const length = 0.8 + Math.random() * 1.1;
      const endY = startY - length;
      const speed = 0.8 + Math.random() * 1.2;
      const isMagenta = Math.random() > 0.65;
      const isWhite = !isMagenta && Math.random() > 0.6;

      linesPositions.push(x, startY, z, x, endY, z);

      streams.push({
        x,
        startY,
        endY,
        z,
        length,
        speed,
        isMagenta,
        isWhite,
      });
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(linesPositions, 3));

    return { linesGeom: geom, streamsData: streams };
  }, [count, brainWidth, brainBottomY]);

  // Animated falling beacons
  const dropletsRef = useRef<THREE.Points>(null);
  const dropletsData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    streamsData.forEach((s, i) => {
      positions[i * 3] = s.x;
      positions[i * 3 + 1] = s.endY;
      positions[i * 3 + 2] = s.z;

      if (s.isMagenta) {
        colors[i * 3] = 0.96; // r
        colors[i * 3 + 1] = 0.25; // g
        colors[i * 3 + 2] = 0.37; // b
      } else if (s.isWhite) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 0.22; // r
        colors[i * 3 + 1] = 0.74; // g
        colors[i * 3 + 2] = 0.97; // b
      }
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [streamsData, count]);

  useFrame((state) => {
    if (dropletsRef.current) {
      const posAttr = dropletsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const t = state.clock.elapsedTime;

      streamsData.forEach((s, i) => {
        const cycle = ((t * s.speed + i * 0.31) % 1.0);
        const currentY = s.startY - cycle * s.length;
        posAttr.setY(i, currentY);
      });
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Vertical optical fiber conduits */}
      <lineSegments geometry={linesGeom}>
        <lineBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Animated falling light droplets */}
      <points ref={dropletsRef} geometry={dropletsData}>
        <pointsMaterial
          size={0.065}
          vertexColors
          transparent
          opacity={0.96}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

// 3D Brain Anatomical Model Component
const BrainModel: React.FC<{ isInteracting: boolean }> = ({ isInteracting }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('./models/brain.glb');

  // Parse mesh geometries for wireframe, normal nodes, and parietal tumor hotspot
  const {
    normalizedScene,
    wireframes,
    normalNodesGeom,
    tumorNodesGeom,
    horizontalFlareGeom,
    brainWidth,
    brainBottomY,
  } = useMemo(() => {
    // Clone scene to avoid mutating cached model
    const clonedScene = scene.clone(true);

    // Compute bounding box and normalize scale
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    // Normalize so brain height is approximately 1.5 units
    const scaleFactor = 1.55 / maxDim;

    // Center and scale cloned scene
    clonedScene.position.set(-center.x * scaleFactor, -center.y * scaleFactor + 0.35, -center.z * scaleFactor);
    clonedScene.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Traverse meshes for wireframes, materials, and nodes
    const wfList: { geom: THREE.WireframeGeometry; matrix: THREE.Matrix4 }[] = [];
    const normalNodes: number[] = [];
    const tumorNodes: number[] = [];

    clonedScene.updateMatrixWorld(true);

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const geom = mesh.geometry.clone();
        geom.computeVertexNormals();

        // Dark semi-transparent material for solid anatomical core
        mesh.material = new THREE.MeshStandardMaterial({
          color: '#020919',
          roughness: 0.7,
          metalness: 0.3,
          transparent: true,
          opacity: 0.85,
          depthWrite: true,
        });

        // Wireframe for lobe
        const wf = new THREE.WireframeGeometry(geom);
        wfList.push({ geom: wf, matrix: mesh.matrixWorld });

        // Transform vertices to world/normalized space for node points
        const pos = geom.attributes.position;
        const count = pos.count;
        const v = new THREE.Vector3();

        for (let i = 0; i < count; i += 4) {
          v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
          v.applyMatrix4(mesh.matrixWorld);

          // Deep parietal region hotspot (Right hemisphere, superior-posterior region)
          if (v.x > 0.12 && v.y > 0.25 && v.z < 0.25) {
            tumorNodes.push(v.x, v.y, v.z);
          } else {
            normalNodes.push(v.x, v.y, v.z);
          }
        }
      }
    });

    const nGeom = new THREE.BufferGeometry();
    nGeom.setAttribute('position', new THREE.Float32BufferAttribute(normalNodes, 3));

    const tGeom = new THREE.BufferGeometry();
    tGeom.setAttribute('position', new THREE.Float32BufferAttribute(tumorNodes, 3));

    // Horizontal optic streak laser flare (Reference Image 2)
    const flarePositions = [-1.6, 0.38, 0.0, 1.6, 0.38, 0.0];
    const fGeom = new THREE.BufferGeometry();
    fGeom.setAttribute('position', new THREE.Float32BufferAttribute(flarePositions, 3));

    return {
      normalizedScene: clonedScene,
      wireframes: wfList,
      normalNodesGeom: nGeom,
      tumorNodesGeom: tGeom,
      horizontalFlareGeom: fGeom,
      brainWidth: size.x * scaleFactor,
      brainBottomY: -0.4,
    };
  }, [scene]);

  // Subtle idle rotation & floating
  useFrame((state, delta) => {
    if (groupRef.current && !isInteracting) {
      groupRef.current.rotation.y += delta * 0.13;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.85) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0.08, -0.38, 0]}>
      {/* 1. Semi-transparent anatomical base for depth */}
      <primitive object={normalizedScene} />

      {/* 2. Glowing Cyan Cortical Wireframe Lobes */}
      {wireframes.map((wf, idx) => (
        <lineSegments key={idx} geometry={wf.geom}>
          <lineBasicMaterial
            color="#00f0ff"
            transparent
            opacity={0.44}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      ))}

      {/* 3. Glowing Cyan Neural Synapse Nodes */}
      <points geometry={normalNodesGeom}>
        <pointsMaterial
          size={0.038}
          color="#38bdf8"
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* 4. Hot Magenta/Pink Tumor Hotspot Cluster (Reference Image 2 & 4) */}
      <points geometry={tumorNodesGeom}>
        <pointsMaterial
          size={0.075}
          color="#f43f5e"
          transparent
          opacity={0.98}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* 5. Horizontal Optic Laser Streak */}
      <lineSegments geometry={horizontalFlareGeom}>
        <lineBasicMaterial
          color="#67e8f9"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 6. Signature Vertical Cascading Neural Data Streams */}
      <CascadingDataRain brainWidth={brainWidth} brainBottomY={brainBottomY} />
    </group>
  );
};

// Fallback Loader
const FallbackBrain: React.FC = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1.0, 24, 24]} />
      <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.25} />
    </mesh>
  );
};

export const InteractiveBrain: React.FC = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none">
      {/* Radial Violet/Blue Glow in Container Background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(124,58,237,0.22)_0%,rgba(2,132,199,0.08)_45%,transparent_75%)]" />

      {/* Interactive 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [2.2, 0.35, 3.8], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full block"
      >
        <ambientLight intensity={0.4} color="#0f172a" />
        {/* Cyan Main Rim Light */}
        <directionalLight position={[4, 3, 3]} intensity={2.3} color="#38bdf8" />
        {/* Magenta Accent Light */}
        <pointLight position={[-2, 2, 2]} intensity={2.6} color="#f43f5e" distance={8} />
        {/* Violet Core Fill Light */}
        <pointLight position={[0, -2, 2]} intensity={1.6} color="#7c3aed" distance={8} />

        <React.Suspense fallback={<FallbackBrain />}>
          <BrainModel isInteracting={isInteracting} />
        </React.Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={2.4}
          maxDistance={5.5}
          enableDamping={true}
          dampingFactor={0.06}
          rotateSpeed={0.8}
          onStart={() => setIsInteracting(true)}
          onEnd={() => setIsInteracting(false)}
        />
      </Canvas>
    </div>
  );
};

useGLTF.preload('./models/brain.glb');
