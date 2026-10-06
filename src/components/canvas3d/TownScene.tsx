'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { NavMeshGrid } from './NavMeshGrid';
import { BuildingMesh } from './BuildingMesh';
import { SubagentMesh } from './SubagentMesh';
import { useJarvisStore } from '../../store/useJarvisStore';

export const TownScene: React.FC = () => {
  const { agents, buildings, selectedAgentId, setSelectedAgent } = useJarvisStore();

  return (
    <Canvas
      shadows
      gl={{
        powerPreference: 'high-performance', // Targets NVIDIA RTX 3060 Ti
        antialias: true,
        alpha: true,
        stencil: false,
        depth: true,
      }}
      className="w-full h-full block bg-cyber-950"
    >
      {/* Isometric 2.5D Camera Angle */}
      <PerspectiveCamera
        makeDefault
        position={[18, 22, 18]}
        fov={40}
        near={0.5}
        far={120}
      />

      <OrbitControls
        enableRotate={true}
        enablePan={true}
        enableZoom={true}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.3} // Restrict from going beneath ground
        minDistance={8}
        maxDistance={45}
      />

      {/* Dynamic Lighting Rig with Soft Shadows */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[16, 28, 12]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]} // RTX 3060 Ti Crisp Shadows
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0001}
      />
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#00f2fe" distance={30} />

      <Suspense fallback={null}>
        {/* Walkable NavMesh & Cyber Grid Ground */}
        <NavMeshGrid />

        {/* 3D Buildings */}
        {buildings.map((bld) => (
          <BuildingMesh
            key={bld.id}
            building={bld}
            onClick={() => {}}
          />
        ))}

        {/* 3D Autonomous Subagents */}
        {agents.map((agent) => (
          <SubagentMesh
            key={agent.id}
            agent={agent}
            isSelected={agent.id === selectedAgentId}
            onClick={() => setSelectedAgent(agent.id)}
          />
        ))}

        {/* Hardware-Accelerated Post-Processing (Bloom & Cinematic Vignette) */}
        <EffectComposer multisampling={4}>
          <Bloom
            luminanceThreshold={0.7}
            luminanceSmoothing={0.8}
            intensity={1.2}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.15} darkness={0.9} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};
