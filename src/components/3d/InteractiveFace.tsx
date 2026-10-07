import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 1. Floating Datacube Voxels & Tethers (Directly inspired by Reference Image: media_1791401977881.png)
const DatacubeVoxels: React.FC<{
  voxels: { pos: THREE.Vector3; anchor: THREE.Vector3; size: number; isWhite: boolean }[];
}> = ({ voxels }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Geometry for individual voxel square tile
  const tileGeom = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  // Build tether lines geometry
  const linesGeom = useMemo(() => {
    const positions: number[] = [];
    voxels.forEach((v) => {
      positions.push(v.anchor.x, v.anchor.y, v.anchor.z);
      positions.push(v.pos.x, v.pos.y, v.pos.z);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [voxels]);

  // Initial matrix and color setup
  useMemo(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    voxels.forEach((v, i) => {
      dummy.position.copy(v.pos);
      dummy.scale.set(v.size, v.size, v.size);
      dummy.lookAt(v.pos.x * 1.5, v.pos.y * 1.2, v.pos.z + 1.5);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      if (v.isWhite) {
        color.set('#ffffff');
      } else if (i % 3 === 0) {
        color.set('#67e8f9');
      } else {
        color.set('#00f0ff');
      }
      meshRef.current!.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [voxels]);

  // Subtle floating pulse animation
  useFrame((state) => {
    if (meshRef.current) {
      const dummy = new THREE.Object3D();
      const t = state.clock.elapsedTime;

      voxels.forEach((v, i) => {
        const floatOffset = Math.sin(t * 1.8 + i * 0.4) * 0.015;
        dummy.position.set(v.pos.x, v.pos.y + floatOffset, v.pos.z);
        dummy.scale.set(v.size, v.size, v.size);
        dummy.lookAt(v.pos.x * 1.4, v.pos.y * 1.1, v.pos.z + 1.2);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Thin data tether lines connecting voxels to facial landmark vertices */}
      <lineSegments ref={linesRef} geometry={linesGeom}>
        <lineBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.42}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Floating square datacube voxels */}
      <instancedMesh
        ref={meshRef}
        args={[tileGeom, undefined, voxels.length]}
      >
        <meshBasicMaterial
          color="#38bdf8"
          side={THREE.DoubleSide}
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
};

// 2. Realistic 3D Face Model Component
const FaceModel: React.FC<{ isInteracting: boolean }> = ({ isInteracting }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('./models/face.glb');

  // Extract base geometry, normalize scale, and generate datacube voxels
  const {
    normalizedGeom,
    wireframeGeom,
    pointsGeom,
    voxelsData,
    eyePositions,
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

    // Center and compute normals
    sourceGeom.center();
    sourceGeom.computeVertexNormals();

    // Normalize so height is exactly 2.25 units
    sourceGeom.computeBoundingBox();
    const box = sourceGeom.boundingBox!;
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 2.25 / maxDim;
    sourceGeom.scale(scaleFactor, scaleFactor, scaleFactor);
    sourceGeom.center();

    // 1. Elegant Wireframe
    const wf = new THREE.WireframeGeometry(sourceGeom);

    // 2. Vertex Points (Constellation dots)
    const posAttr = sourceGeom.attributes.position;
    const normAttr = sourceGeom.attributes.normal;
    const vertexCount = posAttr.count;

    const pointsPositions: number[] = [];
    const voxels: { pos: THREE.Vector3; anchor: THREE.Vector3; size: number; isWhite: boolean }[] = [];

    // Select vertices across the face
    for (let i = 0; i < vertexCount; i += 3) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);

      pointsPositions.push(x, y, z);

      // Generate floating datacube voxels for the front facial surface (Reference Image 1: media_1791401977881.png)
      // Focus on anterior facial features (z > 0.15, y between -0.4 and 0.55)
      if (z > 0.18 && y > -0.45 && y < 0.55 && i % 7 === 0 && normAttr) {
        const nx = normAttr.getX(i);
        const ny = normAttr.getY(i);
        const nz = normAttr.getZ(i);

        // Voxel float distance from surface (0.04 to 0.18 units)
        const floatDist = 0.04 + (Math.sin(i * 13.0) * 0.5 + 0.5) * 0.14;
        const vx = x + nx * floatDist;
        const vy = y + ny * floatDist;
        const vz = z + nz * floatDist;

        // Voxel size between 0.035 and 0.075
        const vSize = 0.035 + (Math.cos(i * 17.0) * 0.5 + 0.5) * 0.04;
        const isWhite = (i % 14 === 0);

        voxels.push({
          pos: new THREE.Vector3(vx, vy, vz),
          anchor: new THREE.Vector3(x, y, z),
          size: vSize,
          isWhite,
        });
      }
    }

    const ptGeom = new THREE.BufferGeometry();
    ptGeom.setAttribute('position', new THREE.Float32BufferAttribute(pointsPositions, 3));

    // Eye sockets
    const eyes = [
      new THREE.Vector3(-0.155, 0.170, 0.520),
      new THREE.Vector3(0.144, 0.168, 0.500),
    ];

    return {
      normalizedGeom: sourceGeom,
      wireframeGeom: wf,
      pointsGeom: ptGeom,
      voxelsData: voxels,
      eyePositions: eyes,
    };
  }, [scene]);

  // Smooth idle rotation
  useFrame((state, delta) => {
    if (groupRef.current && !isInteracting) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.position.y = -0.05 + Math.sin(state.clock.elapsedTime * 0.8) * 0.025;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.05, 0]} rotation={[0.04, 0.35, 0]}>
      {/* 1. Solid Dark Holographic Anatomical Core */}
      <mesh geometry={normalizedGeom}>
        <meshStandardMaterial
          color="#020817"
          roughness={0.7}
          metalness={0.3}
          transparent
          opacity={0.86}
          depthWrite={true}
        />
      </mesh>

      {/* 2. Luminous Cyan Topological Wireframe */}
      <lineSegments geometry={wireframeGeom}>
        <lineBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.42}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 3. Glowing Biometric Landmark Constellation Vertices */}
      <points geometry={pointsGeom}>
        <pointsMaterial
          size={0.032}
          color="#38bdf8"
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* 4. Floating Datacube Voxels & Tethers (media_1791401977881.png style) */}
      <DatacubeVoxels voxels={voxelsData} />

      {/* 5. Glowing Cybernetic Eyes (media_1791402068433.jpg style) */}
      {eyePositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* Intense center core */}
          <mesh>
            <sphereGeometry args={[0.032, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Radiant cyan aura halo */}
          <mesh>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshBasicMaterial
              color="#00f0ff"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Fallback Loader
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
      {/* Background Radial Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_52%_45%,rgba(2,132,199,0.22)_0%,rgba(168,85,247,0.08)_40%,transparent_75%)]" />

      {/* Interactive 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [2.0, 0.3, 3.6], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full block"
      >
        <ambientLight intensity={0.4} color="#0f172a" />
        {/* Cyan Main Rim Light */}
        <directionalLight position={[4, 3, 3]} intensity={2.4} color="#38bdf8" />
        {/* Magenta/Violet Side Light (media_1791402068433.jpg lighting) */}
        <directionalLight position={[-4, 2, -2]} intensity={1.6} color="#ec4899" />
        {/* Deep Blue Bottom Uplight */}
        <pointLight position={[0, -2, 2]} intensity={1.2} color="#0284c7" distance={8} />

        <React.Suspense fallback={<FallbackHead />}>
          <FaceModel isInteracting={isInteracting} />
        </React.Suspense>

        {/* Full 360-Degree Orbit Controls with Smooth Damping */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={2.2}
          maxDistance={5.8}
          enableDamping={true}
          dampingFactor={0.06}
          rotateSpeed={0.85}
          onStart={() => setIsInteracting(true)}
          onEnd={() => setIsInteracting(false)}
        />
      </Canvas>

      {/* Subtle Hint Overlay */}
      <div className="absolute bottom-4 right-4 pointer-events-none text-[10px] font-mono text-[#64748b]/80 tracking-wider uppercase px-2.5 py-1 rounded-md bg-black/50 border border-white/5 backdrop-blur-sm">
        360° Rotate · Scroll to Zoom
      </div>
    </div>
  );
};

useGLTF.preload('./models/face.glb');
