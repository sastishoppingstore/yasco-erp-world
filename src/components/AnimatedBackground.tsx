import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Box, Torus } from "@react-three/drei";
import * as THREE from "three";

// Construction-themed 3D elements
function Crane({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });
  
  return (
    <group ref={ref} position={position} scale={0.5}>
      {/* Crane base */}
      <Box args={[0.8, 0.3, 0.8]} position={[0, -2, 0]}>
        <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
      </Box>
      {/* Crane tower */}
      <Box args={[0.2, 4, 0.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
      </Box>
      {/* Crane arm */}
      <Box args={[3, 0.1, 0.1]} position={[1.5, 2, 0]}>
        <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
      </Box>
    </group>
  );
}

function Building({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1;
    }
  });
  
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <Box ref={ref} args={[1.5, 2.5, 1]} position={position}>
        <MeshDistortMaterial color={color} speed={1.5} distort={0.1} transparent opacity={0.7} />
      </Box>
    </Float>
  );
}

function Gear({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });
  
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[0.5, 0.15, 8, 24]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

function FloatingCube({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <Box args={[0.6, 0.6, 0.6]} position={position}>
        <MeshDistortMaterial color={color} speed={2} distort={0.2} transparent opacity={0.6} />
      </Box>
    </Float>
  );
}

function ParticleField() {
  const count = 800;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const c = new Float32Array(count * 3);
    const palette = [
      [0.96, 0.62, 0.04], // Amber
      [0.98, 0.75, 0.15], // Yellow
      [0.22, 0.55, 1],    // Blue
      [0.55, 0.36, 0.96], // Purple
      [0.06, 0.71, 0.83], // Cyan
      [0.95, 0.27, 0.27], // Red
    ];
    for (let i = 0; i < count; i++) {
      const col = palette[Math.floor(Math.random() * palette.length)];
      c[i * 3] = col[0];
      c[i * 3 + 1] = col[1];
      c[i * 3 + 2] = col[2];
    }
    return c;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x += delta * 0.02;
      pointsRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors sizeAttenuation transparent opacity={0.9} />
    </points>
  );
}

function GlowingSphere({ position, color, size = 1 }: { position: [number, number, number]; color: string; size?: number }) {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
      <Sphere args={[size, 32, 32]} position={position}>
        <MeshDistortMaterial color={color} speed={2} distort={0.3} transparent opacity={0.3} />
      </Sphere>
    </Float>
  );
}

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#f59e0b" />
        
        <ParticleField />
        
        {/* Construction elements */}
        <Crane position={[-8, 2, -5]} />
        <Crane position={[10, 1, -8]} />
        
        {/* Buildings */}
        <Building position={[-6, -2, -3]} color="#3b82f6" />
        <Building position={[6, -1, -4]} color="#8b5cf6" />
        <Building position={[0, -3, -6]} color="#06b6d4" />
        
        {/* Gears */}
        <Gear position={[-4, 4, -2]} color="#f59e0b" />
        <Gear position={[5, -3, -3]} color="#fbbf24" scale={0.7} />
        <Gear position={[3, 5, -4]} color="#f97316" scale={0.5} />
        
        {/* Floating cubes */}
        <FloatingCube position={[-3, 2, -5]} color="#ec4899" />
        <FloatingCube position={[4, 3, -6]} color="#14b8a6" />
        <FloatingCube position={[0, -4, -4]} color="#f43f5e" />
        
        {/* Glowing spheres */}
        <GlowingSphere position={[-5, 0, -8]} color="#f59e0b" size={1.2} />
        <GlowingSphere position={[7, 2, -10]} color="#3b82f6" size={0.8} />
        <GlowingSphere position={[0, 5, -12]} color="#8b5cf6" size={1.5} />
      </Canvas>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/80 pointer-events-none" />
    </div>
  );
}
