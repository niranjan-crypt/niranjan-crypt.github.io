import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 3D Ambient Dust Particles in Holographic Space
const AtmosphericDust: React.FC = () => {
  const count = 45;
  const geom = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 5.0;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  return (
    <points geometry={geom}>
      <pointsMaterial
        size={0.035}
        color="#38bdf8"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};

// Realistic 3D Face Model Mesh Component
const FaceModel: React.FC<{ isInteracting: boolean }> = ({ isInteracting }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('./models/face.glb');

  // Extract base geometry and construct wireframe, points, and LiDAR pins
  const {
    normalizedGeom,
    wireframeGeom,
    pointsGeom,
    pinLinesGeom,
    pinPointsGeom,
  } = useMemo(() => {
    let sourceGeom: THREE.BufferGeometry | null = null;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !sourceGeom) {
        sourceGeom = (child as THREE.Mesh).geometry.clone();
      }
    });

    if (!sourceGeom) {
      sourceGeom = new THREE.SphereGeometry(1.0, 32, 32);
    }

    // 1. Center around (0,0,0)
    sourceGeom.center();
    sourceGeom.computeVertexNormals();

    // 2. Measure bounding box and normalize scale so height is exactly 2.2 units
    sourceGeom.computeBoundingBox();
    const box = sourceGeom.boundingBox!;
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 2.25 / maxDim;
    sourceGeom.scale(scaleFactor, scaleFactor, scaleFactor);

    // Re-center after scaling
    sourceGeom.center();

    // 3. Wireframe Geometry
    const wf = new THREE.WireframeGeometry(sourceGeom);

    // 4. Vertex Points (Subsampled for clean constellation appearance)
    const posAttr = sourceGeom.attributes.position;
    const normAttr = sourceGeom.attributes.normal;
    const vertexCount = posAttr.count;

    const pointsPositions: number[] = [];
    const pinLinesPositions: number[] = [];
    const pinPointsPositions: number[] = [];

    // Select vertices for glowing constellation nodes and normal LiDAR pins
    for (let i = 0; i < vertexCount; i += 3) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);

      pointsPositions.push(x, y, z);

      // Add outward LiDAR pins on selective outer vertices (matching Reference Image 1)
      if (i % 18 === 0 && normAttr) {
        const nx = normAttr.getX(i);
        const ny = normAttr.getY(i);
        const nz = normAttr.getZ(i);

        // Pin length proportional to normalized scale (0.08 to 0.22)
        const pinLen = 0.08 + (Math.sin(i * 11.0) * 0.5 + 0.5) * 0.14;
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
      normalizedGeom: sourceGeom,
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
      groupRef.current.position.y = -0.05 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.05, 0]} rotation={[0.06, 0.42, 0]}>
      {/* 1. Solid Dark Holographic Core (Provides anatomical depth & occludes rear wireframes) */}
      <mesh geometry={normalizedGeom}>
        <meshStandardMaterial
          color="#020817"
          roughness={0.75}
          metalness={0.25}
          transparent
          opacity={0.84}
          depthWrite={true}
        />
      </mesh>

      {/* 2. Luminous Cyan Wireframe Lattice */}
      <lineSegments geometry={wireframeGeom}>
        <lineBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.48}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 3. Glowing Biometric Landmark Constellation Nodes */}
      <points geometry={pointsGeom}>
        <pointsMaterial
          size={0.038}
          color="#38bdf8"
          transparent
          opacity={0.92}
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
          size={0.055}
          color="#67e8f9"
          transparent
          opacity={0.98}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

// Procedural Fallback Wireframe Head in case GLB is loading
const FallbackHead: React.FC = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1.05, 24, 24]} />
      <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.25} />
    </mesh>
  );
};

export const InteractiveFace: React.FC = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none">
      {/* Radial Cyan Space Glow in Container Background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_52%_45%,rgba(2,132,199,0.24)_0%,rgba(3,105,161,0.09)_45%,transparent_75%)]" />

      {/* Interactive 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [2.1, 0.35, 3.6], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full block"
      >
        <ambientLight intensity={0.4} color="#0f172a" />
        {/* Cyan Main Rim Light */}
        <directionalLight position={[4, 3, 3]} intensity={2.4} color="#38bdf8" />
        {/* Deep Blue Fill Light */}
        <directionalLight position={[-4, -2, -2]} intensity={1.1} color="#0284c7" />
        {/* Subtle Violet Accent Light */}
        <pointLight position={[0, 3, 2]} intensity={1.4} color="#a855f7" distance={8} />

        <AtmosphericDust />

        <React.Suspense fallback={<FallbackHead />}>
          <FaceModel isInteracting={isInteracting} />
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

      {/* Subtle Interaction Guide Pill */}
      <div className="absolute bottom-4 right-4 pointer-events-none text-[10px] font-mono text-[#64748b]/75 tracking-wider uppercase px-2.5 py-1 rounded-md bg-black/50 border border-white/5 backdrop-blur-sm">
        Click &amp; Drag to Rotate · Scroll to Zoom
      </div>
    </div>
  );
};

useGLTF.preload('./models/face.glb');
