'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const NavMeshGrid: React.FC = () => {
  const gridLinesRef = useRef<THREE.LineSegments | null>(null);

  // Subtle animated grid pulse
  useFrame(({ clock }) => {
    if (gridLinesRef.current) {
      const material = gridLinesRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.25 + Math.sin(clock.getElapsedTime() * 1.5) * 0.08;
    }
  });

  return (
    <group position={[0, -0.01, 0]}>
      {/* Ground Plane (Shadow Receiver) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#060911" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* Cyber Grid Lines */}
      <gridHelper args={[64, 32, '#00f2fe', '#132035']} />

      {/* Primary Cyber Data Highways */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[48, 1.2]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0, 0]}>
        <planeGeometry args={[48, 1.2]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.08} />
      </mesh>
    </group>
  );
};
