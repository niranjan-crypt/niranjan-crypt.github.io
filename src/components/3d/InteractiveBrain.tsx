import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 3D Cascading Data Rain / Neural Optical Fiber Streams (Signature from Reference Image 2)
const CascadingDataRain: React.FC = () => {
  const count = 38;

  const { linesGeom, streamsData } = useMemo(() => {
    const linesPositions: number[] = [];
    const streams = [];

    for (let i = 0; i < count; i++) {
      // Scatter stream origins under ventral brain surface
      const x = (Math.random() - 0.5) * 2.2;
      const z = (Math.random() - 0.5) * 1.8;
      const startY = -0.4 - Math.random() * 0.4;
      const length = 1.4 + Math.random() * 2.2;
      const endY = startY - length;
      const speed = 0.8 + Math.random() * 1.5;
      const isMagenta = Math.random() > 0.65;

      linesPositions.push(x, startY, z, x, endY, z);

      streams.push({
        x,
        startY,
        endY,
        z,
        length,
        speed,
        isMagenta,
      });
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(linesPositions, 3));

    return { linesGeom: geom, streamsData: streams };
  }, [count]);

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
        // Continuous cycle along the stream line
        const cycle = ((t * s.speed + i * 0.37) % 1.0);
        const currentY = s.startY - cycle * s.length;
        posAttr.setY(i, currentY);
      });
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Static vertical optical fiber conduits */}
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
          size={0.075}
          vertexColors
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

// 3D Brain Anatomical Model
const BrainModel: React.FC<{ isInteracting: boolean }> = ({ isInteracting }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('./models/brain.glb');

  // Parse mesh geometries for wireframe, normal nodes, and parietal tumor hotspot
  const { wireframes, normalNodesGeom, tumorNodesGeom, horizontalFlareGeom } = useMemo(() => {
    const wfList: THREE.WireframeGeometry[] = [];
    const normalNodes: number[] = [];
    const tumorNodes: number[] = [];

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const geom = mesh.geometry.clone();
        geom.computeVertexNormals();

        // 1. Wireframe for each lobe
        wfList.push(new THREE.WireframeGeometry(geom));

        // 2. Vertex nodes
        const pos = geom.attributes.position;
        const count = pos.count;

        for (let i = 0; i < count; i += 6) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);

          // Deep parietal region hotspot (Right hemisphere, top/back region: x > 0.2, y > 0.2, z < 0.2)
          if (x > 0.2 && y > 0.2 && z < 0.3) {
            tumorNodes.push(x, y, z);
          } else {
            normalNodes.push(x, y, z);
          }
        }
      }
    });

    // Fallback if no meshes traversed
    if (wfList.length === 0) {
      const fallback = new THREE.SphereGeometry(1.2, 24, 24);
      wfList.push(new THREE.WireframeGeometry(fallback));
    }

    const nGeom = new THREE.BufferGeometry();
    nGeom.setAttribute('position', new THREE.Float32BufferAttribute(normalNodes, 3));

    const tGeom = new THREE.BufferGeometry();
    tGeom.setAttribute('position', new THREE.Float32BufferAttribute(tumorNodes, 3));

    // Horizontal optic streak flare (matching Reference Image 2)
    const flarePositions = [-2.8, 0.15, 0.0, 2.8, 0.15, 0.0];
    const fGeom = new THREE.BufferGeometry();
    fGeom.setAttribute('position', new THREE.Float32BufferAttribute(flarePositions, 3));

    return {
      wireframes: wfList,
      normalNodesGeom: nGeom,
      tumorNodesGeom: tGeom,
      horizontalFlareGeom: fGeom,
    };
  }, [scene]);

  // Subtle idle rotation & floating
  useFrame((state, delta) => {
    if (groupRef.current && !isInteracting) {
      groupRef.current.rotation.y += delta * 0.14;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.25, 0]} scale={[1.45, 1.45, 1.45]} rotation={[0.1, -0.4, 0]}>
      {/* 1. Semi-transparent anatomical base for depth */}
      <primitive object={scene} />

      {/* 2. Glowing Cyan Cortical Wireframe Lobes */}
      {wireframes.map((wf, idx) => (
        <lineSegments key={idx} geometry={wf}>
          <lineBasicMaterial
            color="#00f0ff"
            transparent
            opacity={0.42}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      ))}

      {/* 3. Glowing Cyan Neural Synapse Nodes */}
      <points geometry={normalNodesGeom}>
        <pointsMaterial
          size={0.048}
          color="#38bdf8"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* 4. Hot Magenta/Pink Tumor Hotspot Cluster (Reference Image 2 & 4) */}
      <points geometry={tumorNodesGeom}>
        <pointsMaterial
          size={0.085}
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
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 6. Signature Vertical Cascading Neural Data Streams */}
      <CascadingDataRain />
    </group>
  );
};

// Fallback Loader
const FallbackBrain: React.FC = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1.1, 24, 24]} />
      <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.3} />
    </mesh>
  );
};

export const InteractiveBrain: React.FC = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none">
      {/* Radial Violet/Blue Glow in Background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(124,58,237,0.22)_0%,rgba(2,132,199,0.08)_45%,transparent_75%)]" />

      {/* Diagnostic Emblem (Top-Left Badge from Reference Image 4) */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-[#f43f5e]/15 border border-[#f43f5e]/40 flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.45)]">
          <svg className="w-6 h-6 text-[#f43f5e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" fill="#ffffff" />
            <circle cx="6" cy="7" r="1.8" fill="#f43f5e" />
            <circle cx="18" cy="7" r="1.8" fill="#f43f5e" />
            <circle cx="6" cy="17" r="1.8" fill="#f43f5e" />
            <circle cx="18" cy="17" r="1.8" fill="#f43f5e" />
            <line x1="12" y1="12" x2="6" y2="7" stroke="#f43f5e" strokeWidth="1.5" />
            <line x1="12" y1="12" x2="18" y2="7" stroke="#f43f5e" strokeWidth="1.5" />
            <line x1="12" y1="12" x2="6" y2="17" stroke="#f43f5e" strokeWidth="1.5" />
            <line x1="12" y1="12" x2="18" y2="17" stroke="#f43f5e" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Interactive 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [2.5, 0.4, 4.3], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.4} color="#0f172a" />
        {/* Cyan Main Rim Light */}
        <directionalLight position={[4, 3, 3]} intensity={2.2} color="#38bdf8" />
        {/* Magenta Accent Light */}
        <pointLight position={[-2, 2, 2]} intensity={2.5} color="#f43f5e" distance={8} />
        {/* Violet Core Fill Light */}
        <pointLight position={[0, -2, 2]} intensity={1.5} color="#7c3aed" distance={8} />

        <React.Suspense fallback={<FallbackBrain />}>
          <BrainModel isInteracting={isInteracting} />
        </React.Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={2.5}
          maxDistance={7.5}
          enableDamping={true}
          dampingFactor={0.06}
          rotateSpeed={0.85}
          onStart={() => setIsInteracting(true)}
          onEnd={() => setIsInteracting(false)}
        />
      </Canvas>

      {/* Subtle Hint Overlay */}
      <div className="absolute bottom-4 right-4 pointer-events-none text-[10px] font-mono text-[#64748b]/70 tracking-wider uppercase px-2.5 py-1 rounded-md bg-black/40 border border-white/5">
        Click &amp; Drag to Rotate · Scroll to Zoom
      </div>
    </div>
  );
};

useGLTF.preload('./models/brain.glb');
