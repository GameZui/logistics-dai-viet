import React from 'react';
import { Canvas } from '@react-three/fiber';
import { IsometricCamera } from './IsometricCamera';
import { GroundAndRoads } from './GroundAndRoads';
import { WarehouseFacility } from './WarehouseFacility';
import { FleetLayer } from './FleetLayer';
import { useGameStore } from '../../store/useGameStore';
import { VietnamIndustry } from './VietnamIndustry';

interface GameCanvasProps {
  children?: React.ReactNode;
  economical?: boolean;
}

export const GameCanvas = ({ children, economical = false }: GameCanvasProps) => {
  const selectEntity = useGameStore((state) => state.selectEntity);

  return (
    <div
      className="w-full h-full absolute inset-0 bg-[#eef2e6]"
      onClick={() => selectEntity(null, null)}
    >
      <Canvas shadows={!economical} orthographic dpr={economical ? 0.85 : [1, 1.1]} gl={{ antialias: false, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#eef2e6']} />
        <fog attach="fog" args={['#eef2e6', 40, 160]} />

        {/* Ambient & Directional Lighting with Soft Shadows */}
        <hemisphereLight args={['#fff4de', '#8a9c82', 0.8]} />
        <directionalLight
          position={[35, 45, 25]}
          intensity={1.35}
          castShadow={!economical}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={120}
          shadow-camera-near={10}
          shadow-camera-left={-35}
          shadow-camera-right={35}
          shadow-camera-top={35}
          shadow-camera-bottom={-35}
          shadow-bias={-0.0005}
        />
        {/* Soft Secondary Fill Light */}
        <directionalLight position={[-25, 20, -20]} intensity={0.4} color="#c9dfd1" />

        <IsometricCamera />
        <GroundAndRoads />
        <WarehouseFacility />
        <FleetLayer />
        <VietnamIndustry />
        {children}
      </Canvas>
    </div>
  );
};
