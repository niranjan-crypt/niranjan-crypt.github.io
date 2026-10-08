import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 1. Soft Circular Glowing Particle Texture Generator
function createGlowPointTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.45)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 2. Ambient Floating Stardust (Inspires media_1791402907550.png ambient particulate field)
const AmbientStardust: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 380;

  const [geo, glowTex] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const cyan = new THREE.Color('#38bdf8');
    const magenta = new THREE.Color('#ec4899');
    const violet = new THREE.Color('#c084fc');
    const white = new THREE.Color('#ffffff');

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 0.65 + Math.random() * 1.15;
      const x = Math.cos(theta) * radius;
      const y = (Math.random() - 0.45) * 2.4;
      const z = Math.sin(theta) * radius + (Math.random() - 0.3) * 0.4;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const r = Math.random();
      let c = cyan;
      if (r < 0.38) c = cyan;
      else if (r < 0.72) c = magenta;
      else if (r < 0.88) c = violet;
      else c = white;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return [g, createGlowPointTexture()];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime * 0.35;
    for (let i = 0; i < particleCount; i++) {
      const py = pos.getY(i) + Math.sin(t + i * 0.15) * 0.0012;
      pos.setY(i, py);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial
        size={0.038}
        map={glowTex}
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

// 3. Clear 3D Biometric Constellation Face Model (media_1791402907550.png style)
const FaceModel: React.FC<{ isInteracting: boolean }> = ({ isInteracting }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('./models/face.glb');

  const {
    normalizedGeom,
    wireframeGeom,
    pointsGeom,
    landmarkGeom,
    glowTexture,
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

    sourceGeom.center();
    sourceGeom.computeVertexNormals();

    // Scale so normalized height is 2.25 units
    sourceGeom.computeBoundingBox();
    const box = sourceGeom.boundingBox!;
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 2.25 / maxDim;
    sourceGeom.scale(scaleFactor, scaleFactor, scaleFactor);
    sourceGeom.center();
    sourceGeom.computeVertexNormals();

    const posAttr = sourceGeom.attributes.position;
    const vertexCount = posAttr.count;

    // Palette colors matching media_1791402907550.png
    const cyanColor = new THREE.Color('#00f0ff');
    const brightCyan = new THREE.Color('#38bdf8');
    const magentaColor = new THREE.Color('#ec4899');
    const violetColor = new THREE.Color('#a855f7');
    const whiteColor = new THREE.Color('#ffffff');
    const tempColor = new THREE.Color();

    function getFeatureColor(x: number, y: number, z: number): THREE.Color {
      const distMid = Math.abs(x);
      // Eyebrows arch (cyan)
      if (y > 0.38 && y < 0.52 && z > 0.40 && distMid < 0.36) {
        return cyanColor;
      }
      // Eyes / Eyelids (bright cyan)
      if (y > 0.22 && y < 0.38 && z > 0.36 && distMid > 0.08 && distMid < 0.34) {
        return brightCyan;
      }
      // Nose bridge and tip (electric cyan)
      if (y > 0.08 && y < 0.34 && z > 0.50 && distMid < 0.16) {
        return cyanColor;
      }
      // Lips (vermillion borders & oral fissure)
      if (y > -0.15 && y < 0.06 && z > 0.44 && distMid < 0.22) {
        return (Math.abs(y - (-0.05)) < 0.035) ? brightCyan : magentaColor;
      }
      // Chin & lower jawline (glowing magenta)
      if (y > -0.35 && y < -0.15 && z > 0.30 && distMid < 0.25) {
        return magentaColor;
      }
      // Forehead, temple, cheekbones, skull, neck (violet to magenta transition)
      const t = THREE.MathUtils.clamp((z + 0.5) / 1.1, 0, 1);
      tempColor.copy(violetColor).lerp(magentaColor, t);
      return tempColor;
    }

    // 1. Constellation Points with Vertex Colors
    const pointPositions: number[] = [];
    const pointColors: number[] = [];
    const landmarkPositions: number[] = [];
    const landmarkColors: number[] = [];

    for (let i = 0; i < vertexCount; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);

      pointPositions.push(x, y, z);
      const col = getFeatureColor(x, y, z);
      pointColors.push(col.r, col.g, col.b);

      // Landmark sparkling star points on salient facial features
      const isLandmark = (
        (y > 0.40 && y < 0.50 && z > 0.42 && Math.abs(x) < 0.32 && i % 4 === 0) || // brows
        (y > 0.24 && y < 0.36 && z > 0.40 && Math.abs(x) > 0.10 && Math.abs(x) < 0.30 && i % 4 === 0) || // eyes
        (y > 0.12 && y < 0.32 && z > 0.56 && Math.abs(x) < 0.08) || // nose bridge & tip
        (y > -0.12 && y < 0.04 && z > 0.48 && Math.abs(x) < 0.18 && i % 3 === 0) || // lips
        (y > -0.32 && y < -0.18 && z > 0.32 && Math.abs(x) < 0.12 && i % 5 === 0) // chin
      );

      if (isLandmark) {
        landmarkPositions.push(x, y, z);
        const isTip = (z > 0.62 || (y > 0.44 && y < 0.48 && Math.abs(x) < 0.25));
        const lCol = isTip ? whiteColor : col;
        landmarkColors.push(lCol.r, lCol.g, lCol.b);
      }
    }

    const ptGeom = new THREE.BufferGeometry();
    ptGeom.setAttribute('position', new THREE.Float32BufferAttribute(pointPositions, 3));
    ptGeom.setAttribute('color', new THREE.Float32BufferAttribute(pointColors, 3));

    const lmGeom = new THREE.BufferGeometry();
    lmGeom.setAttribute('position', new THREE.Float32BufferAttribute(landmarkPositions, 3));
    lmGeom.setAttribute('color', new THREE.Float32BufferAttribute(landmarkColors, 3));

    // 2. Multi-Tone Luminous Wireframe with Vertex Colors
    const wf = new THREE.WireframeGeometry(sourceGeom);
    const wfPos = wf.attributes.position;
    const wfColors = new Float32Array(wfPos.count * 3);
    for (let i = 0; i < wfPos.count; i++) {
      const x = wfPos.getX(i);
      const y = wfPos.getY(i);
      const z = wfPos.getZ(i);
      const col = getFeatureColor(x, y, z);
      wfColors[i * 3] = col.r;
      wfColors[i * 3 + 1] = col.g;
      wfColors[i * 3 + 2] = col.b;
    }
    wf.setAttribute('color', new THREE.BufferAttribute(wfColors, 3));

    const tex = createGlowPointTexture();

    return {
      normalizedGeom: sourceGeom,
      wireframeGeom: wf,
      pointsGeom: ptGeom,
      landmarkGeom: lmGeom,
      glowTexture: tex,
    };
  }, [scene]);

  // Smooth idle rotation
  useFrame((state, delta) => {
    if (groupRef.current && !isInteracting) {
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.position.y = -0.05 + Math.sin(state.clock.elapsedTime * 0.8) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.05, 0]} rotation={[0.02, -0.65, 0]}>
      {/* 1. Solid Dark Anatomical Core (Prevents rear wireframe clutter, gives solid 3D depth) */}
      <mesh geometry={normalizedGeom}>
        <meshStandardMaterial
          color="#030712"
          roughness={0.45}
          metalness={0.25}
          transparent
          opacity={0.92}
          depthWrite={true}
        />
      </mesh>

      {/* 2. Delicate Multi-Tone Luminous Wireframe */}
      <lineSegments geometry={wireframeGeom}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.38}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* 3. Primary Glowing Constellation Point Cloud */}
      <points geometry={pointsGeom}>
        <pointsMaterial
          size={0.026}
          map={glowTexture}
          vertexColors
          transparent
          opacity={0.94}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* 4. Sparkling Landmark Accent Nodes (Bright white & cyan star nodes) */}
      <points geometry={landmarkGeom}>
        <pointsMaterial
          size={0.048}
          map={glowTexture}
          vertexColors
          transparent
          opacity={1.0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* 5. Ambient Floating Stardust Field */}
      <AmbientStardust />
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
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_52%_45%,rgba(2,132,199,0.22)_0%,rgba(168,85,247,0.12)_45%,transparent_75%)]" />

      {/* Interactive 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0.15, 3.4], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full block"
      >
        <ambientLight intensity={0.45} color="#0f172a" />
        {/* Cyan Main Rim Light */}
        <directionalLight position={[3.5, 2.5, 3.5]} intensity={2.8} color="#38bdf8" />
        {/* Magenta/Violet Side Light (media_1791402907550.png lighting) */}
        <directionalLight position={[-3.5, 1.8, -2]} intensity={2.0} color="#ec4899" />
        {/* Soft Uplight */}
        <pointLight position={[0, -2.5, 2]} intensity={1.0} color="#0284c7" distance={8} />

        <React.Suspense fallback={<FallbackHead />}>
          <FaceModel isInteracting={isInteracting} />
        </React.Suspense>

        {/* Full 360-Degree Orbit Controls with Smooth Damping */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={2.0}
          maxDistance={5.5}
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

useGLTF.preload('./models/face.glb');
