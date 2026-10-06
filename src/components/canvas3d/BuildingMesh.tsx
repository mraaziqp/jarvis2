'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { TownBuilding } from '../../types/ipc';

interface BuildingMeshProps {
  building: TownBuilding;
  isSelected?: boolean;
  onClick?: () => void;
}

export const BuildingMesh: React.FC<BuildingMeshProps> = ({ building, isSelected, onClick }) => {
  const beaconRef = useRef<THREE.Mesh | null>(null);
  const scaffoldRef = useRef<THREE.Mesh | null>(null);

  const isCore = building.category === 'core';
  const posX = building.position3D?.x ?? (building.x - 400) / 25;
  const posZ = building.position3D?.z ?? (building.y - 300) / 25;
  const height = isCore ? 4.5 : 3.0;

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (beaconRef.current) {
      beaconRef.current.rotation.y = time * 0.8;
      beaconRef.current.position.y = height + 0.8 + Math.sin(time * 2) * 0.15;
    }
  });

  const categoryColors: Record<TownBuilding['category'], string> = {
    core: '#00f2fe',
    data_forge: '#38bdf8',
    workshop: '#818cf8',
    sentry: '#10b981',
    archive: '#a855f7',
    comms: '#f59e0b',
  };
  const themeColor = categoryColors[building.category] || '#00f2fe';

  return (
    <group position={[posX, 0, posZ]} onClick={onClick}>
      {/* Base Foundation */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, height, 3.2]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.3}
          metalness={0.7}
          emissive={themeColor}
          emissiveIntensity={isSelected ? 0.4 : 0.08}
        />
      </mesh>

      {/* Procedural Holographic Construction Scaffold (Scales with Progress) */}
      <mesh
        ref={scaffoldRef}
        position={[0, (height * (building.progress / 100)) / 2, 0]}
      >
        <boxGeometry args={[3.4, height * (building.progress / 100), 3.4]} />
        <meshStandardMaterial
          color={themeColor}
          wireframe
          transparent
          opacity={0.35}
          emissive={themeColor}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Floating Status Beacon Crystal */}
      <mesh ref={beaconRef} position={[0, height + 0.8, 0]} castShadow>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color={themeColor}
          emissive={themeColor}
          emissiveIntensity={1.5} // triggers bloom pass on RTX 3060 Ti
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* HTML 3D Billboard Label */}
      <Html position={[0, height + 1.8, 0]} center distanceFactor={18}>
        <div className="pointer-events-none select-none text-center whitespace-nowrap bg-cyber-950/85 backdrop-blur-md border border-cyan-500/30 px-2 py-1 rounded-md shadow-lg">
          <p className="text-[10px] font-bold text-white tracking-wide">{building.name}</p>
          <span className="text-[9px] font-mono font-semibold" style={{ color: themeColor }}>
            {building.progress}% Constructed
          </span>
        </div>
      </Html>
    </group>
  );
};
