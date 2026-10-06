'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SubagentEntity } from '../../types/ipc';

interface SubagentMeshProps {
  agent: SubagentEntity;
  isSelected?: boolean;
  onClick?: () => void;
}

export const SubagentMesh: React.FC<SubagentMeshProps> = ({ agent, isSelected, onClick }) => {
  const groupRef = useRef<THREE.Group | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);

  // Target 3D coordinates mapped from 2D coordinates
  const targetVec = new THREE.Vector3(
    agent.position3D?.x ?? (agent.targetX - 400) / 25,
    0.8,
    agent.position3D?.z ?? (agent.targetY - 300) / 25
  );

  // 3D Pathfinding & Interpolation Loop
  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;

    const time = clock.getElapsedTime();

    // Smooth physical pathfinding towards target coordinate across NavMesh
    groupRef.current.position.lerp(targetVec, Math.min(1, delta * 3.2));

    // Floating bobbing motion
    const bob = Math.sin(time * 3 + agent.name.length) * 0.08;
    if (coreRef.current) {
      coreRef.current.position.y = 0.8 + bob;
    }

    // Orbiting Electron Halo
    if (ringRef.current) {
      ringRef.current.rotation.x = time * 2;
      ringRef.current.rotation.y = time * 2.5;
    }
  });

  const isCompleted = agent.state === 'completed';
  const isBuilding = agent.state === 'building' || agent.state === 'working';

  return (
    <group ref={groupRef} onClick={onClick}>
      {/* Agent Energy Core Sphere */}
      <mesh ref={coreRef} castShadow>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshStandardMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={isCompleted ? 2.5 : isSelected ? 1.8 : 0.9} // RTX 3060 Ti Bloom trigger
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>

      {/* Orbiting Quantum Halo Ring */}
      <mesh ref={ringRef} position={[0, 0.8, 0]}>
        <torusGeometry args={[0.65, 0.03, 16, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Dynamic Laser Beam to Construction Target Site */}
      {isBuilding && (
        <line>
          <bufferGeometry
            attach="geometry"
            onUpdate={(self) => {
              const points = [
                new THREE.Vector3(0, 0.8, 0),
                new THREE.Vector3(
                  (agent.targetX - agent.x) / 25,
                  0.2,
                  (agent.targetY - agent.y) / 25
                ),
              ];
              self.setFromPoints(points);
            }}
          />
          <lineBasicMaterial color={agent.color} linewidth={2} transparent opacity={0.7} />
        </line>
      )}

      {/* Selection / Aura Ring on NavMesh Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.55, 0.65, 32]} />
        <meshBasicMaterial
          color={isSelected ? '#00f2fe' : agent.color}
          transparent
          opacity={isSelected ? 0.9 : 0.3}
        />
      </mesh>

      {/* 3D Billboard HUD Tag */}
      <Html position={[0, 1.8, 0]} center distanceFactor={15}>
        <div className="pointer-events-none select-none bg-cyber-950/90 backdrop-blur-md border border-slate-700/80 px-2 py-0.5 rounded shadow-xl flex items-center space-x-1.5 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color }} />
          <span className="text-[10px] font-bold text-white">{agent.name}</span>
          <span className="text-[9px] text-cyan-400 font-mono font-semibold">{agent.progress}%</span>
        </div>
      </Html>
    </group>
  );
};
