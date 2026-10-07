import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Realistic 3D Face Model Mesh Component
const FaceModel: React.FC<{ isInteracting: boolean }> = ({ isInteracting }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('./models/face.glb');

  // Extract base geometry and construct wireframe, points, and LiDAR pins
  const { wireframeGeom, pointsGeom, pinLinesGeom, pinPointsGeom } = useMemo(() => {
    let sourceGeom: THREE.BufferGeometry | null = null;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !sourceGeom) {
        sourceGeom = (child as THREE.Mesh).geometry.clone();
      }
    });

    if (!sourceGeom) {
      sourceGeom = new THREE.SphereGeometry(1.5, 32, 32);
    }

    // Center and scale geometry
    sourceGeom.center();
    sourceGeom.computeVertexNormals();

    // 1. Wireframe Geometry
    const wf = new THREE.WireframeGeometry(sourceGeom);

    // 2. Vertex Points (Subsampled for clean constellation appearance)
    const posAttr = sourceGeom.attributes.position;
    const normAttr = sourceGeom.attributes.normal;
    const vertexCount = posAttr.count;

    const pointsPositions: number[] = [];
    const pinLinesPositions: number[] = [];
    const pinPointsPositions: number[] = [];

    // Select vertices for glowing constellation nodes and normal LiDAR pins
    for (let i = 0; i < vertexCount; i += 4) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);

      pointsPositions.push(x, y, z);

      // Add outward LiDAR pins on selective outer vertices (matching Reference Image 1)
      if (i % 24 === 0 && normAttr) {
        const nx = normAttr.getX(i);
        const ny = normAttr.getY(i);
        const nz = normAttr.getZ(i);

        // Pin length 0.2 to 0.45
        const pinLen = 0.25 + (Math.sin(i * 13.0) * 0.5 + 0.5) * 0.25;
        const tipX = x + nx * pinLen;
        const tipY = y + ny * pinLen;
        const tipZ = z + nz * pinLen;

        pinLinesPositions.push(x, y, z, tipX, tipY, tipZ);
        pinPointsPositions.push(tipX, tipY, tipZ);
      }
    }

    const ptGeom = new THREE.BufferGeometry();
    ptGeom.setAttribute('position', new THREE.Float32BufferAttribute(pointsPositions, 3));

    const pLineGeom = new THREE.BufferGeometry();
    pLineGeom.setAttribute('position', new THREE.Float32BufferAttribute(pinLinesPositions, 3));

    const pPtGeom = new THREE.BufferGeometry();
    pPtGeom.setAttribute('position', new THREE.Float32BufferAttribute(pinPointsPositions, 3));

    return {
      wireframeGeom: wf,
      pointsGeom: ptGeom,
      pinLinesGeom: pLineGeom,
      pinPointsGeom: pPtGeom,
    };
  }, [scene]);

  // Subtle idle breathing & rotation
  useFrame((state, delta) => {
    if (groupRef.current && !isInteracting) {
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} scale={[1.8, 1.8, 1.8]} rotation={[0.08, 0.45, 0]}>
      {/* 1. Solid Dark Holographic Core (Provides anatomical depth & occludes rear wireframes) */}
      <mesh>
        <primitive object={scene.children[0] ? ((scene.children[0] as THREE.Mesh).geometry || wireframeGeom) : wireframeGeom} />
        <meshStandardMaterial
          color="#020817"
          roughness={0.7}
          metalness={0.3}
          transparent
          opacity={0.82}
          depthWrite={true}
        />
      </mesh>

      {/* 2. Luminous Cyan Wireframe Lattice */}
      <lineSegments geometry={wireframeGeom}>
        <lineBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 3. Glowing Biometric Landmark Constellation Nodes */}
      <points geometry={pointsGeom}>
        <pointsMaterial
          size={0.045}
          color="#38bdf8"
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* 4. Outward LiDAR Distance Telemetry Rays */}
      <lineSegments geometry={pinLinesGeom}>
        <lineBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 5. Glowing Tips on Outward LiDAR Telemetry Rays */}
      <points geometry={pinPointsGeom}>
        <pointsMaterial
          size={0.065}
          color="#67e8f9"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

// Fallback Loader
const FallbackHead: React.FC = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1.2, 24, 24]} />
      <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.3} />
    </mesh>
  );
};

export const InteractiveFace: React.FC = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none">
      {/* Radial Cyan Glow in Background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(2,132,199,0.22)_0%,rgba(3,105,161,0.08)_45%,transparent_75%)]" />

      {/* Interactive 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [2.2, 0.4, 4.0], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.4} color="#0f172a" />
        {/* Cyan Rim Light */}
        <directionalLight position={[4, 3, 3]} intensity={2.2} color="#38bdf8" />
        {/* Blue Side Light */}
        <directionalLight position={[-4, -2, -2]} intensity={1.0} color="#0284c7" />
        {/* Subtle Violet Fill Light */}
        <pointLight position={[0, 3, 2]} intensity={1.2} color="#a855f7" distance={8} />

        <React.Suspense fallback={<FallbackHead />}>
          <FaceModel isInteracting={isInteracting} />
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

useGLTF.preload('./models/face.glb');
