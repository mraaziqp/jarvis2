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
  const { agents, buildings, selectedAgentId, setSelectedAgent, powerMode } = useJarvisStore();

  const isEco = powerMode === 'eco';
  const shadowResolution = isEco ? 512 : 1024; // Tuned for 11th Gen Intel i5 + Intel Iris Xe

  return (
    <Canvas
      shadows={!isEco}
      dpr={[1, 1.25]} // Capped to 1.25x for high FPS and low thermals on 11th Gen laptop
      gl={{
        powerPreference: 'default', // Battery and thermal friendly for laptops
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
        maxPolarAngle={Math.PI / 2.3}
        minDistance={8}
        maxDistance={45}
      />

      {/* Dynamic Lighting Rig with Laptop-Optimized Soft Shadows */}
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[16, 28, 12]}
        intensity={1.3}
        castShadow={!isEco}
        shadow-mapSize={[shadowResolution, shadowResolution]}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0001}
      />
      <pointLight position={[0, 8, 0]} intensity={0.7} color="#00f2fe" distance={30} />

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

        {/* Post-Processing Pass (Active in Balanced & Performance modes) */}
        {!isEco && (
          <EffectComposer multisampling={2}>
            <Bloom
              luminanceThreshold={0.75}
              luminanceSmoothing={0.8}
              intensity={0.9} // Gentle bloom for Iris Xe
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.15} darkness={0.85} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
};
