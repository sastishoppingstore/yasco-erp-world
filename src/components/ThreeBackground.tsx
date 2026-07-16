import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function ParticleField() {
  const count = 1500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const c = new Float32Array(count * 3);
    const palette = [
      [0.2, 0.5, 1], [0.4, 0.8, 1], [0.6, 0.3, 1],
      [0.1, 0.6, 0.9], [0.8, 0.4, 1], [0.3, 0.7, 1],
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
      pointsRef.current.rotation.x += delta * 0.03;
      pointsRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} vertexColors sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

function ConnectingLines() {
  const count = 300;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 6);
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < count * 2; i++) {
      points.push(new THREE.Vector3(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
      ));
    }
    for (let i = 0; i < count; i++) {
      const a = points[i * 2];
      const b = points[i * 2 + 1];
      if (a.distanceTo(b) < 15) {
        pos[i * 6] = a.x; pos[i * 6 + 1] = a.y; pos[i * 6 + 2] = a.z;
        pos[i * 6 + 3] = b.x; pos[i * 6 + 4] = b.y; pos[i * 6 + 5] = b.z;
      } else {
        const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        pos[i * 6] = mid.x; pos[i * 6 + 1] = mid.y; pos[i * 6 + 2] = mid.z;
        pos[i * 6 + 3] = mid.x; pos[i * 6 + 4] = mid.y; pos[i * 6 + 5] = mid.z;
      }
    }
    return pos;
  }, []);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count * 2} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#3b82f6" transparent opacity={0.08} />
    </lineSegments>
  );
}

function FloatingShape({ position, color, type = "sphere" }: { position: [number, number, number]; color: string; type?: string }) {
  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8} position={position}>
      {type === "sphere" ? (
        <mesh>
          <icosahedronGeometry args={[1, 1]} />
          <MeshDistortMaterial color={color} speed={2} distort={0.3} radius={0.5} transparent opacity={0.15} />
        </mesh>
      ) : type === "torus" ? (
        <mesh>
          <torusGeometry args={[0.8, 0.3, 16, 32]} />
          <MeshDistortMaterial color={color} speed={1.5} distort={0.2} transparent opacity={0.12} />
        </mesh>
      ) : (
        <mesh>
          <octahedronGeometry args={[0.7]} />
          <MeshDistortMaterial color={color} speed={2.5} distort={0.4} transparent opacity={0.1} />
        </mesh>
      )}
    </Float>
  );
}

function GlowingRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.1;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 3, 0, 0]} position={[0, 0, -5]}>
      <ringGeometry args={[2.5, 3, 64]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.06} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <ParticleField />
        <ConnectingLines />
        <GlowingRing />
        <FloatingShape position={[-8, -4, -10]} color="#3b82f6" type="sphere" />
        <FloatingShape position={[7, 5, -12]} color="#8b5cf6" type="torus" />
        <FloatingShape position={[-5, 8, -15]} color="#06b6d4" type="octahedron" />
        <FloatingShape position={[9, -3, -8]} color="#6366f1" type="sphere" />
        <FloatingShape position={[-7, -6, -18]} color="#0ea5e9" type="torus" />
      </Canvas>
    </div>
  );
}
